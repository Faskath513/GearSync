import os
import logging
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from dotenv import load_dotenv
from database_service import get_db_service

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app instance
app = FastAPI(
    title="GearSync Chatbot API",
    description="AI-powered chatbot service using Google AI Studio 2.5 Flash",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Google AI
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")
if not GOOGLE_AI_API_KEY:
    logger.error("GOOGLE_AI_API_KEY environment variable is not set")
    raise ValueError("GOOGLE_AI_API_KEY environment variable is required")

genai.configure(api_key=GOOGLE_AI_API_KEY)

# Initialize the model
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Initialize database service
try:
    db_service = get_db_service()
    logger.info("Database service initialized successfully")
except Exception as e:
    logger.warning(f"Database service initialization failed: {e}. Chatbot will work without database access.")
    db_service = None

# Pydantic models
class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the message sender (user or assistant)")
    content: str = Field(..., description="Content of the message")

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000, description="User message")
    conversation_history: Optional[List[ChatMessage]] = Field(default=[], description="Previous conversation history")
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0, description="Response creativity (0.0-2.0)")
    max_tokens: Optional[int] = Field(default=1000, ge=1, le=4000, description="Maximum response length")

class ChatResponse(BaseModel):
    reply: str = Field(..., description="AI assistant's response")
    conversation_id: Optional[str] = Field(default=None, description="Unique conversation identifier")
    tokens_used: Optional[int] = Field(default=None, description="Number of tokens used")

class HealthResponse(BaseModel):
    status: str = Field(..., description="Service status")
    model: str = Field(..., description="AI model being used")
    version: str = Field(..., description="API version")

# Helper functions for database queries
def get_contextual_info(message: str) -> Dict:
    """Extract contextual information from user message for database queries"""
    context = {
        'services': None,
        'available_slots': None,
        'service_info': None,
        'date': None
    }
    
    if not db_service:
        return context
    
    message_lower = message.lower()
    
    # Check if user is asking about services
    service_keywords = ['service', 'services', 'what do you offer', 'available services', 'types of service']
    if any(keyword in message_lower for keyword in service_keywords):
        context['services'] = db_service.get_all_services()
    
    # Check if user is asking about appointment availability
    availability_keywords = ['available', 'availability', 'slot', 'slots', 'when can', 'schedule', 'book']
    if any(keyword in message_lower for keyword in availability_keywords):
        # Try to extract date from message
        today = datetime.now()
        # Default to tomorrow if no date mentioned
        target_date = today + timedelta(days=1)
        
        # Try to parse date mentions
        if 'today' in message_lower:
            target_date = today
        elif 'tomorrow' in message_lower:
            target_date = today + timedelta(days=1)
        elif 'monday' in message_lower or 'tuesday' in message_lower or 'wednesday' in message_lower:
            days_ahead = 0
            if 'monday' in message_lower:
                days_ahead = (0 - today.weekday()) % 7
            elif 'tuesday' in message_lower:
                days_ahead = (1 - today.weekday()) % 7
            elif 'wednesday' in message_lower:
                days_ahead = (2 - today.weekday()) % 7
            target_date = today + timedelta(days=days_ahead)
        
        context['date'] = target_date
        context['available_slots'] = db_service.get_available_slots(target_date)
    
    # Check for specific service name
    services = db_service.get_all_services()
    for service in services:
        if service['service_name'].lower() in message_lower:
            context['service_info'] = service
            break
    
    return context

def format_services_info(services: List[Dict]) -> str:
    """Format services information for the AI"""
    if not services:
        return "No services are currently available."
    
    info = "Available Services:\n"
    for service in services:
        duration_hours = service['estimated_duration_minutes'] / 60
        info += f"- {service['service_name']}: ${service['base_price']} (Duration: {duration_hours:.1f} hours, Category: {service['category']})\n"
        if service.get('description'):
            info += f"  Description: {service['description'][:100]}...\n"
    
    return info

def format_available_slots(slots: List[Dict], date: datetime) -> str:
    """Format available slots information for the AI"""
    if not slots:
        return f"No available slots for {date.strftime('%B %d, %Y')}. Please try another date."
    
    info = f"Available appointment slots for {date.strftime('%B %d, %Y')}:\n"
    for i, slot in enumerate(slots[:10], 1):  # Limit to first 10 slots
        slot_time = datetime.fromisoformat(slot['start_time'])
        info += f"{i}. {slot['formatted_time']}\n"
    
    if len(slots) > 10:
        info += f"\n... and {len(slots) - 10} more slots available."
    
    info += "\nBusiness Hours: 8:00 AM - 6:00 PM (Monday - Saturday)"
    return info

# System prompt for GearSync context
SYSTEM_PROMPT = """
You are GearSync AI Assistant, a helpful chatbot for an automotive service management platform. 
You help customers and employees with:

1. **Appointment Scheduling**: Help users book, reschedule, or cancel service appointments
   - You can check available appointment slots from the database
   - Business hours: 8:00 AM - 6:00 PM, Monday to Saturday
   - Appointments are scheduled in 30-minute slots

2. **Service Information**: Provide details about available services, pricing, and time estimates
   - You have access to real-time service information from the database
   - Include pricing, duration, and descriptions when available

3. **Vehicle Support**: Answer questions about vehicle maintenance, repairs, and service history
4. **General Support**: Help with account management, billing questions, and platform navigation

Guidelines:
- Be professional, friendly, and helpful
- When checking availability, use the provided database information
- If you don't know something specific about GearSync, say so and offer to connect them with a human representative
- Keep responses concise but informative
- Use automotive terminology appropriately
- Always prioritize customer satisfaction and safety
- When providing appointment availability, be specific about dates and times

Remember: You're representing GearSync, a trusted automotive service provider.
"""

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        model="gemini-2.0-flash-exp",
        version="1.0.0"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check endpoint"""
    try:
        # Test the model with a simple request
        test_response = model.generate_content("Hello")
        return HealthResponse(
            status="healthy",
            model="gemini-2.0-flash-exp",
            version="1.0.0"
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unhealthy: {str(e)}"
        )

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint for AI conversations
    """
    try:
        # Validate input
        if not request.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty"
            )

        # Get contextual information from database if available
        contextual_info = ""
        if db_service:
            try:
                context = get_contextual_info(request.message)
                
                # Add services information if requested
                if context['services']:
                    contextual_info += format_services_info(context['services']) + "\n\n"
                
                # Add available slots if requested
                if context['available_slots'] and context['date']:
                    contextual_info += format_available_slots(context['available_slots'], context['date']) + "\n\n"
                
                # Add specific service info if found
                if context['service_info']:
                    service = context['service_info']
                    duration_hours = service['estimated_duration_minutes'] / 60
                    contextual_info += f"Service Details:\n"
                    contextual_info += f"- Name: {service['service_name']}\n"
                    contextual_info += f"- Price: ${service['base_price']}\n"
                    contextual_info += f"- Duration: {duration_hours:.1f} hours\n"
                    if service.get('description'):
                        contextual_info += f"- Description: {service['description']}\n"
                    contextual_info += "\n"
            except Exception as e:
                logger.error(f"Error getting contextual info: {e}")
        
        # Prepare conversation history
        conversation_parts = [SYSTEM_PROMPT]
        
        # Add contextual information if available
        if contextual_info:
            conversation_parts.append(f"Current Database Information:\n{contextual_info}")
        
        # Add conversation history if provided
        if request.conversation_history:
            for msg in request.conversation_history[-10:]:  # Limit to last 10 messages
                if msg.role == "user":
                    conversation_parts.append(f"User: {msg.content}")
                elif msg.role == "assistant":
                    conversation_parts.append(f"Assistant: {msg.content}")
        
        # Add current message
        conversation_parts.append(f"User: {request.message}")
        
        # Combine all parts
        full_conversation = "\n\n".join(conversation_parts)
        
        # Generate response
        generation_config = genai.types.GenerationConfig(
            temperature=request.temperature,
            max_output_tokens=request.max_tokens,
        )
        
        response = model.generate_content(
            full_conversation,
            generation_config=generation_config
        )
        
        if not response.text:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate response"
            )
        
        # Log the interaction
        logger.info(f"Chat request processed successfully. User message length: {len(request.message)}")
        
        return ChatResponse(
            reply=response.text.strip(),
            conversation_id=None,  # Could implement conversation tracking here
            tokens_used=len(response.text.split())  # Approximate token count
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/chat/simple")
async def simple_chat(message: str):
    """
    Simplified chat endpoint for basic interactions
    """
    try:
        if not message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty"
            )
        
        # Get contextual information from database if available
        contextual_info = ""
        if db_service:
            try:
                context = get_contextual_info(message)
                
                # Add services information if requested
                if context['services']:
                    contextual_info += format_services_info(context['services']) + "\n\n"
                
                # Add available slots if requested
                if context['available_slots'] and context['date']:
                    contextual_info += format_available_slots(context['available_slots'], context['date']) + "\n\n"
                
                # Add specific service info if found
                if context['service_info']:
                    service = context['service_info']
                    duration_hours = service['estimated_duration_minutes'] / 60
                    contextual_info += f"Service Details:\n"
                    contextual_info += f"- Name: {service['service_name']}\n"
                    contextual_info += f"- Price: ${service['base_price']}\n"
                    contextual_info += f"- Duration: {duration_hours:.1f} hours\n"
                    if service.get('description'):
                        contextual_info += f"- Description: {service['description']}\n"
                    contextual_info += "\n"
            except Exception as e:
                logger.error(f"Error getting contextual info: {e}")
        
        prompt = SYSTEM_PROMPT
        if contextual_info:
            prompt += f"\n\nCurrent Database Information:\n{contextual_info}"
        prompt += f"\n\nUser: {message}"
        
        response = model.generate_content(prompt)
        
        if not response.text:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate response"
            )
        
        return {"reply": response.text.strip()}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in simple chat: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/models")
async def list_models():
    """List available AI models"""
    try:
        models = genai.list_models()
        model_list = []
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                model_list.append({
                    "name": model.name,
                    "display_name": model.display_name,
                    "description": model.description
                })
        return {"models": model_list}
    except Exception as e:
        logger.error(f"Error listing models: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list models: {str(e)}"
        )

@app.get("/services")
async def get_services():
    """Get all available services from database"""
    if not db_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service not available"
        )
    try:
        services = db_service.get_all_services()
        return {"services": services}
    except Exception as e:
        logger.error(f"Error fetching services: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch services: {str(e)}"
        )

@app.get("/availability")
async def get_availability(date: Optional[str] = None):
    """Get available appointment slots for a specific date"""
    if not db_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service not available"
        )
    try:
        if date:
            target_date = datetime.fromisoformat(date)
        else:
            target_date = datetime.now() + timedelta(days=1)
        
        slots = db_service.get_available_slots(target_date)
        return {
            "date": target_date.isoformat(),
            "available_slots": slots,
            "total_slots": len(slots)
        }
    except Exception as e:
        logger.error(f"Error fetching availability: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch availability: {str(e)}"
        )

@app.get("/availability/check")
async def check_slot_availability(datetime_str: str, service_duration_minutes: int = 60):
    """Check if a specific time slot is available"""
    if not db_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service not available"
        )
    try:
        is_available = db_service.check_slot_availability(datetime_str, service_duration_minutes)
        return {
            "datetime": datetime_str,
            "available": is_available,
            "service_duration_minutes": service_duration_minutes
        }
    except Exception as e:
        logger.error(f"Error checking slot availability: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check availability: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "False").lower() == "true"
    
    logger.info(f"Starting GearSync Chatbot API on {host}:{port}")
    logger.info(f"Debug mode: {debug}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if not debug else "debug"
    )