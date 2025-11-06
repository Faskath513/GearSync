# Postman API Testing Guide - GearSync Chatbot

## Base URL
```
http://localhost:8005
```

---

## 1. Health Check

### GET Request
```
GET http://localhost:8005/health
```

**Headers:** (None required)

**Expected Response:**
```json
{
  "status": "healthy",
  "model": "gemini-2.0-flash-exp",
  "version": "1.0.0"
}
```

---

## 2. Chat with Database Integration (Main Endpoint)

### POST Request
```
POST http://localhost:8005/chat
```

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "message": "What services do you offer?",
  "conversation_history": [],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Example 2 - Check Availability:**
```json
{
  "message": "When can I schedule an appointment?",
  "conversation_history": [],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Example 3 - Specific Service:**
```json
{
  "message": "Tell me about oil change service",
  "conversation_history": [],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Example 4 - With Conversation History:**
```json
{
  "message": "What's the price for that?",
  "conversation_history": [
    {
      "role": "user",
      "content": "What services do you offer?"
    },
    {
      "role": "assistant",
      "content": "We offer oil change, brake inspection, and tire rotation..."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Expected Response:**
```json
{
  "reply": "We offer the following services:\n- Oil Change: $49.99 (Duration: 0.5 hours)...",
  "conversation_id": null,
  "tokens_used": 150
}
```

---

## 3. Simple Chat Endpoint

### POST Request
```
POST http://localhost:8005/chat/simple?message=What%20services%20do%20you%20offer
```

**Headers:** (None required)

**URL Parameters:**
- `message`: Your question (URL encoded)

**Example URLs:**

**Check Availability:**
```
POST http://localhost:8005/chat/simple?message=When%20can%20I%20schedule%20an%20appointment
```

**Ask About Services:**
```
POST http://localhost:8005/chat/simple?message=What%20services%20do%20you%20offer
```

**Ask About Specific Service:**
```
POST http://localhost:8005/chat/simple?message=Tell%20me%20about%20oil%20change%20service
```

**Expected Response:**
```json
{
  "reply": "We offer the following services..."
}
```

---

## 4. Get All Services (Database Endpoint)

### GET Request
```
GET http://localhost:8005/services
```

**Headers:** (None required)

**Expected Response:**
```json
{
  "services": [
    {
      "id": 1,
      "service_name": "Oil Change",
      "description": "Full synthetic oil change with filter replacement",
      "base_price": 49.99,
      "estimated_duration_minutes": 30,
      "category": "MAINTENANCE",
      "is_active": true
    },
    {
      "id": 2,
      "service_name": "Brake Inspection",
      "description": "Complete brake system inspection",
      "base_price": 79.99,
      "estimated_duration_minutes": 60,
      "category": "SAFETY",
      "is_active": true
    }
  ]
}
```

---

## 5. Get Available Appointment Slots

### GET Request
```
GET http://localhost:8005/availability
```

**Headers:** (None required)

**Query Parameters (Optional):**
- `date`: ISO format date string (e.g., `2024-01-15T00:00:00`)

**Example URLs:**

**Get Tomorrow's Availability (Default):**
```
GET http://localhost:8005/availability
```

**Get Specific Date:**
```
GET http://localhost:8005/availability?date=2024-01-20T00:00:00
```

**Expected Response:**
```json
{
  "date": "2024-01-16T00:00:00",
  "available_slots": [
    {
      "start_time": "2024-01-16T08:00:00",
      "end_time": "2024-01-16T08:30:00",
      "formatted_time": "08:00 AM"
    },
    {
      "start_time": "2024-01-16T08:30:00",
      "end_time": "2024-01-16T09:00:00",
      "formatted_time": "08:30 AM"
    },
    {
      "start_time": "2024-01-16T09:00:00",
      "end_time": "2024-01-16T09:30:00",
      "formatted_time": "09:00 AM"
    }
  ],
  "total_slots": 20
}
```

---

## 6. Check Specific Slot Availability

### GET Request
```
GET http://localhost:8005/availability/check?datetime_str=2024-01-16T10:00:00&service_duration_minutes=60
```

**Headers:** (None required)

**Query Parameters:**
- `datetime_str`: ISO format datetime string (required)
- `service_duration_minutes`: Duration in minutes (optional, default: 60)

**Example URLs:**

**Check Slot Availability:**
```
GET http://localhost:8005/availability/check?datetime_str=2024-01-16T10:00:00&service_duration_minutes=60
```

**Check Slot for 30-minute Service:**
```
GET http://localhost:8005/availability/check?datetime_str=2024-01-16T14:30:00&service_duration_minutes=30
```

**Expected Response:**
```json
{
  "datetime": "2024-01-16T10:00:00",
  "available": true,
  "service_duration_minutes": 60
}
```

---

## 7. List AI Models

### GET Request
```
GET http://localhost:8005/models
```

**Headers:** (None required)

**Expected Response:**
```json
{
  "models": [
    {
      "name": "gemini-2.0-flash-exp",
      "display_name": "Gemini 2.0 Flash",
      "description": "Fast and efficient model..."
    }
  ]
}
```

---

## 8. Root Endpoint

### GET Request
```
GET http://localhost:8005/
```

**Headers:** (None required)

**Expected Response:**
```json
{
  "status": "healthy",
  "model": "gemini-2.0-flash-exp",
  "version": "1.0.0"
}
```

---

## Postman Collection Setup

### Import Collection
1. Open Postman
2. Click "Import"
3. Use the following JSON for a Postman Collection:

```json
{
  "info": {
    "name": "GearSync Chatbot API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8005/health",
          "host": ["localhost"],
          "port": "8005",
          "path": ["health"]
        }
      }
    },
    {
      "name": "Chat - Ask About Services",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"What services do you offer?\",\n  \"conversation_history\": [],\n  \"temperature\": 0.7,\n  \"max_tokens\": 1000\n}"
        },
        "url": {
          "raw": "http://localhost:8005/chat",
          "host": ["localhost"],
          "port": "8005",
          "path": ["chat"]
        }
      }
    },
    {
      "name": "Chat - Check Availability",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"When can I schedule an appointment?\",\n  \"conversation_history\": [],\n  \"temperature\": 0.7,\n  \"max_tokens\": 1000\n}"
        },
        "url": {
          "raw": "http://localhost:8005/chat",
          "host": ["localhost"],
          "port": "8005",
          "path": ["chat"]
        }
      }
    },
    {
      "name": "Get All Services",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8005/services",
          "host": ["localhost"],
          "port": "8005",
          "path": ["services"]
        }
      }
    },
    {
      "name": "Get Availability",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8005/availability",
          "host": ["localhost"],
          "port": "8005",
          "path": ["availability"]
        }
      }
    },
    {
      "name": "Check Slot Availability",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8005/availability/check?datetime_str=2024-01-16T10:00:00&service_duration_minutes=60",
          "host": ["localhost"],
          "port": "8005",
          "path": ["availability", "check"],
          "query": [
            {
              "key": "datetime_str",
              "value": "2024-01-16T10:00:00"
            },
            {
              "key": "service_duration_minutes",
              "value": "60"
            }
          ]
        }
      }
    }
  ]
}
```

---

## Quick Test Scenarios

### Scenario 1: Check Available Services
1. **GET** `http://localhost:8005/services`
2. **POST** `http://localhost:8005/chat` with body:
```json
{
  "message": "What services do you offer?"
}
```

### Scenario 2: Check Appointment Availability
1. **GET** `http://localhost:8005/availability`
2. **POST** `http://localhost:8005/chat` with body:
```json
{
  "message": "When can I schedule an appointment?"
}
```

### Scenario 3: Check Specific Slot
1. **GET** `http://localhost:8005/availability/check?datetime_str=2024-01-16T10:00:00&service_duration_minutes=60`
2. **POST** `http://localhost:8005/chat` with body:
```json
{
  "message": "Is 10 AM tomorrow available?"
}
```

---

## Troubleshooting

### Error: Connection Refused
- Ensure chatbot service is running on port 8005
- Check: `curl http://localhost:8005/health`

### Error: Database Service Not Available
- Check PostgreSQL is running
- Verify `.env` file has correct database credentials
- Test database connection manually

### Error: 422 Unprocessable Entity
- Check JSON format is valid
- Ensure all required fields are present
- Verify Content-Type header is set to `application/json`

