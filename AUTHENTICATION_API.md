# Authentication API Documentation

## Overview
This document describes the complete authentication system for the Lunch Scan Backend, including admin signup, login, forgot password, and JWT token-based authorization.

## Base URL
```
http://localhost:3000
```

## Authentication Endpoints

### 1. Admin Signup
**POST** `/auth/signup`

Creates a new admin account. No authentication required.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Admin signed up successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "uId": "uuid-here",
    "email": "admin@example.com",
    "name": "John Doe",
    "isActive": true
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Admin with this email already exists"
}
```

### 2. Admin Login
**POST** `/auth/login`

Authenticates an admin and returns a JWT token.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "securepassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "uId": "uuid-here",
    "email": "admin@example.com",
    "name": "John Doe",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 3. Forgot Password
**POST** `/auth/forgot-password`

Sends a new random password to the admin's email address.

**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "New password has been sent to your email address"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Failed to send email. Please try again later."
}
```

### 4. Verify Token
**POST** `/auth/verify-token`

Verifies if a JWT token is valid.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "adminId": "uuid-here",
    "email": "admin@example.com",
    "name": "John Doe",
    "role": "admin",
    "iat": 1705312200,
    "exp": 1705398600
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 5. Get Profile
**GET** `/auth/profile`

Retrieves the current admin's profile information. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "admin": {
    "uId": "uuid-here",
    "email": "admin@example.com",
    "name": "John Doe",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "createdOn": "2024-01-01T00:00:00.000Z"
  }
}
```

## Protected Routes

### 1. Dashboard
**GET** `/protected/dashboard`

Returns dashboard data. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "adminId": "uuid-here",
    "adminName": "John Doe",
    "adminEmail": "admin@example.com",
    "role": "admin",
    "dashboard": {
      "totalUsers": 150,
      "activeSessions": 25,
      "recentActivity": [
        {
          "action": "User login",
          "time": "2024-01-15T10:30:00.000Z"
        }
      ]
    }
  }
}
```

### 2. Admin Info
**GET** `/protected/admin-info`

Returns admin information. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Admin information retrieved successfully",
  "data": {
    "adminId": "uuid-here",
    "name": "John Doe",
    "email": "admin@example.com",
    "role": "admin",
    "permissions": ["read", "write", "delete"],
    "lastLogin": "2024-01-15T10:30:00.000Z"
  }
}
```

## JWT Token Structure

The JWT token contains the following payload:
```json
{
  "adminId": "uuid-here",
  "email": "admin@example.com",
  "name": "John Doe",
  "role": "admin",
  "iat": 1705312200,
  "exp": 1705398600
}
```

- **adminId**: Unique identifier for the admin
- **email**: Admin's email address
- **name**: Admin's full name
- **role**: Role (always "admin")
- **iat**: Token issued at timestamp
- **exp**: Token expiration timestamp (24 hours from issue)

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/lunch-scan

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email Configuration (for forgot password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@lunchscan.com
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with 12 salt rounds
2. **JWT Tokens**: Secure token-based authentication with 24-hour expiration
3. **Email Validation**: Email format validation and case-insensitive storage
4. **Account Status**: Support for active/inactive account status
5. **Last Login Tracking**: Automatic tracking of login timestamps
6. **Secure Password Reset**: Random password generation and email delivery
7. **Token Verification**: Proper JWT token verification with error handling

## Error Handling

All endpoints return consistent error responses:
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid credentials or missing token)
- **404**: Not Found (resource not found)
- **500**: Internal Server Error (server-side errors)

## Usage Examples

### Using with cURL

**Signup:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","name":"John Doe","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

**Access Protected Route:**
```bash
curl -X GET http://localhost:3000/protected/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Using with JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.token;

// Access protected route
const dashboardResponse = await fetch('/protected/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const dashboardData = await dashboardResponse.json();
```

## Database Schema

The admin collection in MongoDB has the following structure:

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  name: String (required),
  password: String (hashed, required),
  resetPasswordToken: String (optional),
  resetPasswordExpires: Date (optional),
  lastLogin: Date (optional),
  isActive: Boolean (default: true),
  // BaseEntity properties
  id: String (unique, required),
  uId: String (required),
  dType: String (required),
  createdOn: String (required),
  updatedOn: String (required),
  expireAt: String (optional),
  version: Number (default: 1),
  active: Boolean (default: true),
  archived: Boolean (default: false),
  customFields: Array (default: [])
}
```

## Notes

1. **Email Configuration**: For forgot password functionality, configure your SMTP settings in the environment variables
2. **JWT Secret**: Change the JWT_SECRET in production for security
3. **Password Policy**: Passwords must be at least 6 characters long
4. **Token Expiration**: JWT tokens expire after 24 hours
5. **Case Sensitivity**: Email addresses are stored in lowercase for consistency
6. **Logging**: All authentication events are logged for security monitoring 