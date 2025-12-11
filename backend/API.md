# MotorTrace API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "user|admin" // optional, defaults to "user"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "role": "user|admin",
      "created_at": "timestamp"
    },
    "token": "jwt_token"
  }
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "role": "user|admin"
    },
    "token": "jwt_token"
  }
}
```

### Get Current User
**GET** `/auth/me` 🔒

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "user|admin",
    "created_at": "timestamp"
  }
}
```

---

## Motor Endpoints

### Get All Motors
**GET** `/motors?page=1&limit=10&search=&status=&year=&model=` 🔒

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Results per page
- `search` (string): Search in chassis, engine, model, manufacturer
- `status` (string): Filter by status (in_stock, sold, in_service, scrapped)
- `year` (number): Filter by year
- `model` (string): Filter by model

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "motors": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### Get Motor by ID
**GET** `/motors/:id` 🔒

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "chassis_number": "string",
    "engine_number": "string",
    "color": "string",
    "model": "string",
    "year": 2024,
    "manufacturer": "string",
    "status": "in_stock",
    "notes": "string",
    "customFields": [...],
    "qrCode": {
      "id": "uuid",
      "qr_image_path": "/uploads/qr-codes/xxx.png",
      "generated_at": "timestamp",
      "scan_count": 0
    }
  }
}
```

### Create Motor
**POST** `/motors` 🔒👑 (Admin only)

**Request Body:**
```json
{
  "chassis_number": "string (required)",
  "engine_number": "string (required)",
  "color": "string (required)",
  "model": "string (required)",
  "year": 2024,
  "manufacturer": "string",
  "status": "in_stock|sold|in_service|scrapped",
  "notes": "string",
  "customFields": [
    {
      "name": "string",
      "value": "string",
      "type": "text|number|date|boolean"
    }
  ]
}
```

**Response:** `201 Created`

### Update Motor
**PUT** `/motors/:id` 🔒👑 (Admin only)

**Request Body:** (All fields optional)
```json
{
  "chassis_number": "string",
  "engine_number": "string",
  "color": "string",
  "model": "string",
  "year": 2024,
  "manufacturer": "string",
  "status": "in_stock",
  "notes": "string"
}
```

**Response:** `200 OK`

### Delete Motor
**DELETE** `/motors/:id` 🔒👑 (Admin only)

**Response:** `200 OK`

### Scan QR Code
**GET** `/motors/scan/:motorId` 🔒

Retrieves motor information via QR code scan. Updates scan count and last scanned time.

**Response:** `200 OK`

### Download QR Code
**GET** `/motors/:id/qr/download` 🔒

Downloads the QR code image for the motor.

**Response:** PNG file download

---

## Service History Endpoints

### Get Motor Services
**GET** `/services/motor/:motorId` 🔒

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "motor_id": "uuid",
      "service_date": "2024-01-01",
      "service_type": "string",
      "description": "string",
      "technician": "string",
      "cost": 1500.00,
      "parts_replaced": "string",
      "next_service_date": "2024-06-01",
      "notes": "string",
      "attachments": [...]
    }
  ]
}
```

### Create Service Record
**POST** `/services/motor/:motorId` 🔒👑 (Admin only)

**Request Body:**
```json
{
  "service_date": "2024-01-01 (required)",
  "service_type": "string (required)",
  "description": "string",
  "technician": "string",
  "cost": 1500.00,
  "parts_replaced": "string",
  "next_service_date": "2024-06-01",
  "notes": "string"
}
```

**Response:** `201 Created`

### Update Service Record
**PUT** `/services/:id` 🔒👑 (Admin only)

**Request Body:** (All fields optional)
```json
{
  "service_date": "2024-01-01",
  "service_type": "string",
  "description": "string",
  "technician": "string",
  "cost": 1500.00,
  "parts_replaced": "string",
  "next_service_date": "2024-06-01",
  "notes": "string"
}
```

**Response:** `200 OK`

### Delete Service Record
**DELETE** `/services/:id` 🔒👑 (Admin only)

**Response:** `200 OK`

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**
```json
{
  "success": false,
  "message": "Error description"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Authentication token required"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Admin access required"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Legend
- 🔒 = Authentication required
- 👑 = Admin role required
