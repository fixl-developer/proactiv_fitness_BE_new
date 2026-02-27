# 📚 IAM Module - API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

---

## Authentication Endpoints

### 1. Register New User

**Endpoint:** `POST /auth/register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+81901234567",
  "role": "PARENT",
  "dateOfBirth": "1985-05-15",
  "gender": "MALE",
  "language": "EN"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "parent@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "phone": "+81901234567",
      "role": "PARENT",
      "status": "ACTIVE",
      "language": "EN",
      "isEmailVerified": false,
      "isPhoneVerified": false,
      "createdAt": "2026-02-24T10:00:00.000Z",
      "updatedAt": "2026-02-24T10:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 604800
    }
  },
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

---

### 2. Login

**Endpoint:** `POST /auth/login`

**Description:** Login with email and password

**Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "parent@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "role": "PARENT",
      "status": "ACTIVE",
      "lastLogin": "2026-02-24T10:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 604800
    }
  },
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

---

### 3. Logout

**Endpoint:** `POST /auth/logout`

**Description:** Logout current user

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null,
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

---

### 4. Refresh Token

**Endpoint:** `POST /auth/refresh-token`

**Description:** Get new access token using refresh token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  },
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

---

### 5. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Description:** Request password reset token

**Request Body:**
```json
{
  "email": "parent@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset email sent",
  "data": {
    "message": "Password reset link sent to email",
    "token": "a1b2c3d4e5f6..." 
  },
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

---

### 6. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Description:** Reset password using token

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null,
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

---

### 7. Change Password

**Endpoint:** `POST /auth/change-password`

**Description:** Change password for authenticated user

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "OldSecurePass123!",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null,
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

---

### 8. Verify Email

**Endpoint:** `POST /auth/verify-email`

**Description:** Verify email address using token

**Request Body:**
```json
{
  "token": "verification_token_here"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": null,
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

---

### 9. Resend Verification Email

**Endpoint:** `POST /auth/resend-verification`

**Description:** Resend email verification token

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Verification email sent",
  "data": {
    "message": "Verification email sent",
    "token": "new_verification_token"
  },
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

---

### 10. Get Current User

**Endpoint:** `GET /auth/me`

**Description:** Get authenticated user's information

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "parent@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "phone": "+81901234567",
    "role": "PARENT",
    "status": "ACTIVE",
    "profileImage": null,
    "language": "EN",
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "lastLogin": "2026-02-24T10:00:00.000Z",
    "createdAt": "2026-02-24T09:00:00.000Z",
    "updatedAt": "2026-02-24T10:00:00.000Z"
  },
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

---

## User Management Endpoints

### 11. Create User (Admin)

**Endpoint:** `POST /users`

**Description:** Create a new user (Admin only)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "email": "coach@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+81901234568",
  "role": "COACH"
}
```

**Response:** `201 Created`

---

### 12. Get All Users

**Endpoint:** `GET /users`

**Description:** Get list of users with filters

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Query Parameters:**
- `role` (optional): Filter by role (PARENT, COACH, etc.)
- `status` (optional): Filter by status (ACTIVE, INACTIVE, etc.)
- `search` (optional): Search by name or email
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example:**
```
GET /users?role=PARENT&status=ACTIVE&search=john&page=1&limit=20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "parent@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "role": "PARENT",
      "status": "ACTIVE"
    }
  ],
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

---

### 13. Get User by ID

**Endpoint:** `GET /users/:id`

**Description:** Get user details by ID

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

---

### 14. Update User

**Endpoint:** `PUT /users/:id`

**Description:** Update user information

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+81901234569",
  "language": "JA"
}
```

**Response:** `200 OK`

---

### 15. Delete User

**Endpoint:** `DELETE /users/:id`

**Description:** Soft delete user (Admin only)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Response:** `200 OK`

---

### 16. Update User Status

**Endpoint:** `PATCH /users/:id/status`

**Description:** Update user status (Admin only)

**Headers:**
```
Authorization: Bearer <admin_access_token>
```

**Request Body:**
```json
{
  "status": "SUSPENDED"
}
```

**Response:** `200 OK`

---

### 17. Get User Profile

**Endpoint:** `GET /users/profile`

**Description:** Get own profile

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

---

### 18. Update User Profile

**Endpoint:** `PUT /users/profile`

**Description:** Update own profile

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+81901234567",
  "dateOfBirth": "1985-05-15",
  "gender": "MALE",
  "language": "EN",
  "address": {
    "street": "123 Main St",
    "city": "Tokyo",
    "state": "Tokyo",
    "country": "Japan",
    "postalCode": "100-0001"
  }
}
```

**Response:** `200 OK`

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "error": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ],
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password",
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found",
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User with this email already exists",
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many authentication attempts, please try again later",
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

---

## User Roles

- `SUPER_ADMIN` - Full system access
- `HQ_ADMIN` - Headquarters administrator
- `REGIONAL_ADMIN` - Regional administrator
- `FRANCHISE_OWNER` - Franchise owner
- `LOCATION_MANAGER` - Location manager
- `COACH` - Coach/Instructor
- `PARENT` - Parent/Guardian
- `PARTNER_ADMIN` - Partner administrator
- `SUPPORT_STAFF` - Support staff

## User Status

- `ACTIVE` - Active user
- `INACTIVE` - Inactive user
- `SUSPENDED` - Suspended user
- `PENDING` - Pending activation

---

## Rate Limiting

- Authentication endpoints: 5 requests per 15 minutes
- Other endpoints: 100 requests per 15 minutes

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All endpoints return JSON
3. Password must be at least 8 characters with uppercase, lowercase, number, and special character
4. Tokens expire after 7 days (configurable)
5. Refresh tokens expire after 30 days (configurable)
6. Account locks after 5 failed login attempts for 30 minutes
