import os
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from dotenv import load_dotenv

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

# System prompt for GearSync context
SYSTEM_PROMPT = """
You are GearSync AI Assistant, a helpful chatbot for an automotive service management platform. 
You help customers and employees with:

1. **Appointment Scheduling**: Help users book, reschedule, or cancel service appointments
2. **Service Information**: Provide details about available services, pricing, and time estimates
3. **Vehicle Support**: Answer questions about vehicle maintenance, repairs, and service history
4. **General Support**: Help with account management, billing questions, and platform navigation

Guidelines:
- Be professional, friendly, and helpful
- Provide accurate information based on automotive knowledge
- If you don't know something specific about GearSync, say so and offer to connect them with a human representative
- Keep responses concise but informative
- Use automotive terminology appropriately
- Always prioritize customer satisfaction and safety

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

        # Prepare conversation history
        conversation_parts = [SYSTEM_PROMPT]
        
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
        
        response = model.generate_content(f"{SYSTEM_PROMPT}\n\nUser: {message}")
        
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