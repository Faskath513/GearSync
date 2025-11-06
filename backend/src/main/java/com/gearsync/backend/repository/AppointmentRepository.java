package com.gearsync.backend.repository;

import com.gearsync.backend.model.Appointment;
import com.gearsync.backend.model.AppointmentStatus;
import com.gearsync.backend.model.Services;
import com.gearsync.backend.model.User;
import com.gearsync.backend.service.AppointmentService;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByCustomer(User customer);
    List<Appointment> findByAssignedEmployee(User employee);
    boolean existsByCustomerAndScheduledDateTime(User customer, LocalDateTime scheduledDateTime);

    List<Appointment> findAllByCustomerId(Long customerId);

    @Query("SELECT a FROM Appointment a JOIN FETCH a.appointmentServices WHERE a.id = :appointmentId")
    Optional<Appointment> findByIdWithServices(@Param("appointmentId") Long appointmentId);

    // Find all appointments by customer and status
    List<Appointment> findByCustomerIdAndStatus(Long customerId, AppointmentStatus status);

    // Find all appointments by assigned employee
    List<Appointment> findByAssignedEmployeeId(Long employeeId);

    // Find all appointments by status
    List<Appointment> findByStatus(AppointmentStatus status);

    // Find appointments by vehicle
    List<Appointment> findByVehicleId(Long vehicleId);

    // Find appointments scheduled between two dates
    List<Appointment> findByScheduledDateTimeBetween(LocalDateTime start, LocalDateTime end);

    // Find upcoming appointments for a customer
    @Query("SELECT a FROM Appointment a WHERE a.customer.id = :customerId " +
            "AND a.scheduledDateTime > :currentDateTime " +
            "ORDER BY a.scheduledDateTime ASC")
    List<Appointment> findUpcomingAppointmentsByCustomer(
            @Param("customerId") Long customerId,
            @Param("currentDateTime") LocalDateTime currentDateTime
    );

    // Find past appointments for a customer
    @Query("SELECT a FROM Appointment a WHERE a.customer.id = :customerId " +
            "AND a.scheduledDateTime < :currentDateTime " +
            "ORDER BY a.scheduledDateTime DESC")
    List<Appointment> findPastAppointmentsByCustomer(
            @Param("customerId") Long customerId,
            @Param("currentDateTime") LocalDateTime currentDateTime
    );

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Appointment a " +
            "WHERE a.customer.id = :customerId " +
            "AND a.scheduledDateTime = :scheduledDateTime " +
            "AND a.status NOT IN ('CANCELLED', 'COMPLETED')")
    boolean existsByCustomerAndScheduledDateTime(
            @Param("customerId") Long customerId,
            @Param("scheduledDateTime") LocalDateTime scheduledDateTime
    );

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.customer.id = :customerId " +
            "AND a.status IN ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS')")
    long countActiveAppointmentsByCustomer(@Param("customerId") Long customerId);

    long countByStatus(AppointmentStatus status);

    List<Appointment> findByStatusOrderByScheduledDateTimeAsc(AppointmentStatus status);

    List<Appointment> findByScheduledDateTimeBetweenOrderByScheduledDateTimeAsc(LocalDateTime start, LocalDateTime end);

    @Query("""
           select coalesce(sum(a.finalCost), 0)
           from Appointment a
           where a.status = :status
           """)
    BigDecimal sumFinalCostByStatus(AppointmentStatus status);
}
