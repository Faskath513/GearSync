# GearSync Chatbot Service

A powerful AI-powered chatbot service built with FastAPI and Google AI Studio 2.5 Flash (Gemini) for the GearSync automotive service management platform.

## Features

- 🤖 **Google AI Studio 2.5 Flash Integration**: Powered by Gemini's latest model
- 💬 **Conversational AI**: Context-aware responses with conversation history
- 🚗 **Automotive-Focused**: Specialized for automotive service management
- 🔧 **RESTful API**: Clean, well-documented API endpoints
- 🌐 **CORS Support**: Ready for frontend integration
- 📊 **Health Monitoring**: Built-in health check endpoints
- 🔒 **Input Validation**: Comprehensive request validation
- 📝 **Structured Logging**: Detailed logging for monitoring and debugging

## API Endpoints

### Core Chat Endpoints

- `POST /chat` - Main chat endpoint with full conversation support
- `POST /chat/simple` - Simplified chat for basic interactions
- `GET /health` - Health check endpoint
- `GET /models` - List available AI models
- `GET /` - Root endpoint with service info

### Request/Response Models

#### Chat Request
```json
{
  "message": "I need to schedule an oil change",
  "conversation_history": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant", 
      "content": "Hi! How can I help you today?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

#### Chat Response
```json
{
  "reply": "I'd be happy to help you schedule an oil change! What type of vehicle do you have?",
  "conversation_id": null,
  "tokens_used": 25
}
```

## Setup Instructions

### 1. Prerequisites

- Python 3.8 or higher
- Google AI Studio API key
- pip (Python package manager)

### 2. Get Google AI Studio API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key for configuration

### 3. Installation

```bash
# Navigate to the chatbot service directory
cd chatbot-service

# Install dependencies
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env` file in the chatbot-service directory:

```bash
# Google AI Studio API Configuration
GOOGLE_AI_API_KEY=your_actual_api_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

**Important**: Replace `your_actual_api_key_here` with your actual Google AI Studio API key.

### 5. Running the Service

#### Development Mode
```bash
python main.py
```

#### Production Mode
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The service will be available at `http://localhost:8000`

### 6. API Documentation

Once running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Usage Examples

### Basic Chat Request

```bash
curl -X POST "http://localhost:8000/chat/simple" \
     -H "Content-Type: application/json" \
     -d '{"message": "I need help with my car"}'
```

### Advanced Chat with History

```bash
curl -X POST "http://localhost:8000/chat" \
     -H "Content-Type: application/json" \
     -d '{
       "message": "What services do you offer?",
       "conversation_history": [
         {
           "role": "user",
           "content": "Hello"
         },
         {
           "role": "assistant",
           "content": "Hi! Welcome to GearSync. How can I help you today?"
         }
       ],
       "temperature": 0.7,
       "max_tokens": 500
     }'
```

### Health Check

```bash
curl -X GET "http://localhost:8000/health"
```

## Integration with Frontend

### JavaScript/TypeScript Example

```typescript
const chatWithBot = async (message: string, history: any[] = []) => {
  try {
    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_history: history,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
};
```

### React Hook Example

```typescript
import { useState } from 'react';

export const useChatbot = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversation_history: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: data.reply }
      ]);
      
      return data.reply;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
};
```

## Configuration Options

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GOOGLE_AI_API_KEY` | Google AI Studio API key | - | Yes |
| `HOST` | Server host | `0.0.0.0` | No |
| `PORT` | Server port | `8000` | No |
| `DEBUG` | Debug mode | `False` | No |

### Model Configuration

The service uses Google's Gemini 2.0 Flash model with the following default settings:
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 1000 (response length)
- **Model**: `gemini-2.0-flash-exp`

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input or missing required fields
- **500 Internal Server Error**: AI service errors or unexpected issues
- **503 Service Unavailable**: Health check failures

## Security Considerations

1. **API Key Security**: Never commit your API key to version control
2. **CORS Configuration**: Configure allowed origins for production
3. **Rate Limiting**: Consider implementing rate limiting for production use
4. **Input Validation**: All inputs are validated and sanitized

## Monitoring and Logging

The service includes structured logging for:
- Request/response tracking
- Error monitoring
- Performance metrics
- Health check status

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your Google AI Studio API key is correctly set in the `.env` file
2. **Port Already in Use**: Change the PORT in `.env` or stop the conflicting service
3. **Import Errors**: Ensure all dependencies are installed with `pip install -r requirements.txt`

### Debug Mode

Enable debug mode by setting `DEBUG=True` in your `.env` file for detailed logging and auto-reload.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the GearSync platform. Please refer to the main project license.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation at `/docs`
3. Check the logs for error details
4. Contact the development team
