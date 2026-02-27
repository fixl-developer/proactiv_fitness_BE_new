# 📚 Phase 1 Complete API Documentation
# Proactiv Fitness Platform - Ready for Apidog Import

**Last Updated:** February 24, 2026  
**Base URL:** `http://localhost:5000/api/v1`  
**Total APIs:** 91 endpoints across 6 modules

---

## 🔐 Authentication

**Method:** JWT Bearer Token  
**Header:** `Authorization: Bearer <token>`

### Rate Limits:
- Auth endpoints: 5 requests/15 minutes
- Other endpoints: 100 requests/15 minutes

---

## 📊 API Summary

| Module | Endpoints | Status | Description |
|--------|-----------|--------|-------------|
| IAM | 18 | ✅ Ready | Authentication & User Management |
| BCMS | 35 | ✅ Ready | Organization & Location Management |
| Feature Flags | 10 | 🔧 Integration | Feature Control & A/B Testing |
| Media Storage | 25 | 🔧 Integration | File & Document Management |
| System | 3 | ✅ Ready | Health Checks & API Info |

---

## 🔑 Module 1: IAM (Identity & Access Management)
**18 Endpoints - Production Ready**

### Authentication Endpoints (10)

#### 1. Register User
- **POST** `/auth/register`
- **Public:** Yes
- **Description:** Register new user account
- **Request Body:**
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
- **Response:** 201 Created with user data and tokens

#### 2. Login
- **POST** `/auth/login`
- **Public:** Yes
- **Request Body:**
```json
{
  "email": "parent@example.com",
  "password": "SecurePass123!"
}
```
- **Response:** 200 OK with user data and tokens

#### 3. Logout
- **POST** `/auth/logout`
- **Auth:** Required
- **Response:** 200 OK

#### 4. Refresh Token
- **POST** `/auth/refresh-token`
- **Public:** Yes
- **Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 5. Forgot Password
- **POST** `/auth/forgot-password`
- **Public:** Yes
- **Request Body:**
```json
{
  "email": "parent@example.com"
}
```

#### 6. Reset Password
- **POST** `/auth/reset-password`
- **Public:** Yes
- **Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

#### 7. Change Password
- **POST** `/auth/change-password`
- **Auth:** Required
- **Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

#### 8. Verify Email
- **POST** `/auth/verify-email`
- **Public:** Yes
- **Request Body:**
```json
{
  "token": "verification_token"
}
```

#### 9. Resend Verification
- **POST** `/auth/resend-verification`
- **Auth:** Required

#### 10. Get Current User
- **GET** `/auth/me`
- **Auth:** Required
- **Response:** Current user profile data

### User Management Endpoints (8)

#### 11. Get User Profile
- **GET** `/users/profile`
- **Auth:** Required
- **Description:** Get own profile

#### 12. Update User Profile
- **PUT** `/users/profile`
- **Auth:** Required
- **Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+81901234567",
  "language": "EN",
  "address": {
    "street": "123 Main St",
    "city": "Tokyo",
    "country": "Japan"
  }
}
```

#### 13. Create User (Admin)
- **POST** `/users`
- **Auth:** Admin Required
- **Roles:** SUPER_ADMIN, HQ_ADMIN

#### 14. Get All Users
- **GET** `/users`
- **Auth:** Admin Required
- **Query Params:** `role`, `status`, `search`, `page`, `limit`

#### 15. Get User by ID
- **GET** `/users/:id`
- **Auth:** Required (Owner/Admin)

#### 16. Update User
- **PUT** `/users/:id`
- **Auth:** Required (Owner/Admin)

#### 17. Delete User
- **DELETE** `/users/:id`
- **Auth:** Super/HQ Admin Required

#### 18. Update User Status
- **PATCH** `/users/:id/status`
- **Auth:** Admin Required
- **Request Body:**
```json
{
  "status": "SUSPENDED"
}
```

---

## 🏢 Module 2: BCMS (Branch & Center Management)
**35 Endpoints - Production Ready**

### Countries API (5 endpoints)

#### 1. Create Country
- **POST** `/countries`
- **Auth:** SUPER_ADMIN, HQ_ADMIN
- **Request Body:**
```json
{
  "name": "Japan",
  "code": "JP",
  "currency": "JPY",
  "timezone": "Asia/Tokyo",
  "languages": ["JAPANESE", "ENGLISH"]
}
```

#### 2. Get All Countries
- **GET** `/countries`
- **Auth:** Required
- **Query Params:** `isActive`, `search`

#### 3. Get Country by ID
- **GET** `/countries/:id`
- **Auth:** Required

#### 4. Update Country
- **PUT** `/countries/:id`
- **Auth:** SUPER_ADMIN, HQ_ADMIN

#### 5. Delete Country
- **DELETE** `/countries/:id`
- **Auth:** SUPER_ADMIN, HQ_ADMIN

### Regions API (5 endpoints)

#### 6. Create Region
- **POST** `/regions`
- **Auth:** SUPER_ADMIN, HQ_ADMIN, REGIONAL_ADMIN
- **Request Body:**
```json
{
  "name": "Kanto",
  "code": "KT",
  "countryId": "507f1f77bcf86cd799439011",
  "description": "Kanto region including Tokyo"