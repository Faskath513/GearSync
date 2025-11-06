import os
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import pool
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging
from contextlib import contextmanager

logger = logging.getLogger(__name__)

class DatabaseService:
    """Service for querying PostgreSQL database for appointments and services"""
    
    def __init__(self):
        # Parse DATASOURCE_URL: jdbc:postgresql://localhost:5432/gear_sync?sslmode=disable
        datasource_url = os.getenv("DATASOURCE_URL", "")
        db_username = os.getenv("DATASOURCE_USERNAME", "postgres")
        db_password = os.getenv("DATASOURCE_PASSWORD", "")
        
        # Parse the URL
        if datasource_url.startswith("jdbc:postgresql://"):
            # Remove jdbc: prefix
            url_part = datasource_url.replace("jdbc:postgresql://", "")
            # Split by ? to remove query params
            if "?" in url_part:
                url_part = url_part.split("?")[0]
            # Extract host, port, database
            parts = url_part.split("/")
            if len(parts) == 2:
                db_host_port = parts[0]
                self.db_name = parts[1]
                if ":" in db_host_port:
                    self.db_host, self.db_port = db_host_port.split(":")
                    self.db_port = int(self.db_port)
                else:
                    self.db_host = db_host_port
                    self.db_port = 5432
            else:
                raise ValueError("Invalid DATASOURCE_URL format")
        else:
            # Fallback to environment variables
            self.db_host = os.getenv("DB_HOST", "localhost")
            self.db_port = int(os.getenv("DB_PORT", "5432"))
            self.db_name = os.getenv("DB_NAME", "gear_sync")
        
        self.db_username = db_username
        self.db_password = db_password
        
        # Create connection pool
        try:
            self.connection_pool = psycopg2.pool.SimpleConnectionPool(
                1, 10,
                host=self.db_host,
                port=self.db_port,
                database=self.db_name,
                user=self.db_username,
                password=self.db_password
            )
            logger.info(f"Database connection pool created for {self.db_host}:{self.db_port}/{self.db_name}")
        except Exception as e:
            logger.error(f"Error creating database connection pool: {e}")
            self.connection_pool = None
    
    @contextmanager
    def get_connection(self):
        """Get a database connection from the pool"""
        if not self.connection_pool:
            raise Exception("Database connection pool not initialized")
        
        conn = self.connection_pool.getconn()
        try:
            yield conn
        finally:
            self.connection_pool.putconn(conn)
    
    def get_all_services(self) -> List[Dict]:
        """Get all active services"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT id, service_name, description, base_price, 
                               estimated_duration_minutes, category, is_active
                        FROM services
                        WHERE is_active = TRUE
                        ORDER BY service_name
                    """)
                    return cur.fetchall()
        except Exception as e:
            logger.error(f"Error fetching services: {e}")
            return []
    
    def get_service_by_name(self, service_name: str) -> Optional[Dict]:
        """Get a service by name (case-insensitive)"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT id, service_name, description, base_price, 
                               estimated_duration_minutes, category, is_active
                        FROM services
                        WHERE LOWER(service_name) LIKE LOWER(%s) AND is_active = TRUE
                        LIMIT 1
                    """, (f"%{service_name}%",))
                    result = cur.fetchone()
                    return dict(result) if result else None
        except Exception as e:
            logger.error(f"Error fetching service by name: {e}")
            return None
    
    def get_appointments_by_date_range(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Get appointments within a date range"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT a.id, a.scheduled_datetime, a.status, a.customer_id, 
                               a.vehicle_id, a.assigned_employee_id, a.progress_percentage,
                               v.make, v.model, v.year,
                               u.email as customer_email, u.first_name, u.last_name
                        FROM appointments a
                        LEFT JOIN vehicles v ON a.vehicle_id = v.id
                        LEFT JOIN users u ON a.customer_id = u.id
                        WHERE a.scheduled_datetime BETWEEN %s AND %s
                        AND a.status NOT IN ('CANCELLED', 'COMPLETED', 'NO_SHOW')
                        ORDER BY a.scheduled_datetime
                    """, (start_date, end_date))
                    return cur.fetchall()
        except Exception as e:
            logger.error(f"Error fetching appointments: {e}")
            return []
    
    def get_available_slots(self, date: datetime, service_duration_minutes: int = 60) -> List[Dict]:
        """
        Get available appointment slots for a specific date
        Business hours: 8 AM - 6 PM, Monday to Saturday
        Slot duration: 30 minutes
        """
        try:
            # Define business hours
            start_time = date.replace(hour=8, minute=0, second=0, microsecond=0)
            end_time = date.replace(hour=18, minute=0, second=0, microsecond=0)
            
            # Get existing appointments for the date
            existing_appointments = self.get_appointments_by_date_range(start_time, end_time)
            
            # Create all possible slots (every 30 minutes)
            slots = []
            current_time = start_time
            slot_duration = timedelta(minutes=30)
            
            while current_time + timedelta(minutes=service_duration_minutes) <= end_time:
                # Check if this slot conflicts with existing appointments
                slot_end = current_time + timedelta(minutes=service_duration_minutes)
                is_available = True
                
                for apt in existing_appointments:
                    apt_start = apt['scheduled_datetime']
                    apt_end = apt_start + timedelta(minutes=service_duration_minutes)  # Assume same duration
                    
                    # Check for overlap
                    if not (slot_end <= apt_start or current_time >= apt_end):
                        is_available = False
                        break
                
                if is_available:
                    slots.append({
                        'start_time': current_time.isoformat(),
                        'end_time': slot_end.isoformat(),
                        'formatted_time': current_time.strftime("%I:%M %p")
                    })
                
                current_time += slot_duration
            
            return slots
        except Exception as e:
            logger.error(f"Error getting available slots: {e}")
            return []
    
    def get_appointments_by_customer_email(self, email: str) -> List[Dict]:
        """Get appointments for a customer by email"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT a.id, a.scheduled_datetime, a.status, a.progress_percentage,
                               v.make, v.model, v.year, v.license_plate,
                               u.email as customer_email, u.first_name, u.last_name
                        FROM appointments a
                        LEFT JOIN vehicles v ON a.vehicle_id = v.id
                        LEFT JOIN users u ON a.customer_id = u.id
                        WHERE u.email = %s
                        ORDER BY a.scheduled_datetime DESC
                    """, (email,))
                    return cur.fetchall()
        except Exception as e:
            logger.error(f"Error fetching customer appointments: {e}")
            return []
    
    def get_appointment_services(self, appointment_id: int) -> List[Dict]:
        """Get services for a specific appointment"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT s.id, s.service_name, s.description, s.base_price, 
                               s.estimated_duration_minutes, s.category
                        FROM services s
                        INNER JOIN appointment_services aps ON s.id = aps.service_id
                        WHERE aps.appointment_id = %s
                    """, (appointment_id,))
                    return cur.fetchall()
        except Exception as e:
            logger.error(f"Error fetching appointment services: {e}")
            return []
    
    def check_slot_availability(self, datetime_str: str, service_duration_minutes: int = 60) -> bool:
        """Check if a specific time slot is available"""
        try:
            requested_time = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
            if requested_time.tzinfo:
                requested_time = requested_time.replace(tzinfo=None)
            
            slot_end = requested_time + timedelta(minutes=service_duration_minutes)
            
            # Get appointments for the same day
            start_date = requested_time.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = requested_time.replace(hour=23, minute=59, second=59, microsecond=0)
            
            existing_appointments = self.get_appointments_by_date_range(start_date, end_date)
            
            for apt in existing_appointments:
                apt_start = apt['scheduled_datetime']
                apt_end = apt_start + timedelta(minutes=service_duration_minutes)
                
                # Check for overlap
                if not (slot_end <= apt_start or requested_time >= apt_end):
                    return False
            
            return True
        except Exception as e:
            logger.error(f"Error checking slot availability: {e}")
            return False

# Singleton instance
_db_service = None

def get_db_service() -> DatabaseService:
    """Get or create database service instance"""
    global _db_service
    if _db_service is None:
        _db_service = DatabaseService()
    return _db_service

