# BCMS Module API Documentation

## Overview
The Branch & Center Management System (BCMS) module manages the organizational hierarchy and physical infrastructure of the fitness platform, including countries, regions, business units, locations/centers, rooms, holiday calendars, and terms.

## Base URL
```
/api/v1
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Countries API

### 1.1 Create Country
**POST** `/countries`

**Authorization:** SUPER_ADMIN, HQ_ADMIN

**Request Body:**
```json
{
  "name": "Japan",
  "code": "JP",
  "currency": "JPY",
  "timezone": "Asia/Tokyo",
  "languages": ["JAPANESE", "ENGLISH"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Country created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Japan",
    "code": "JP",
    "currency": "JPY",
    "timezone": "Asia/Tokyo",
    "languages": ["JAPANESE", "ENGLISH"],
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 1.2 Get All Countries
**GET** `/countries?isActive=true&search=japan`

**Authorization:** All authenticated users

**Query Parameters:**
- `isActive` (boolean, optional): Filter by active status
- `search` (string, optional): Search by name or code

**Response:** `200 OK`

### 1.3 Get Country by ID
**GET** `/countries/:id`

**Response:** `200 OK`

### 1.4 Update Country
**PUT** `/countries/:id`

**Authorization:** SUPER_ADMIN, HQ_ADMIN

**Request Body:**
```json
{
  "name": "Japan Updated",
  "isActive": false
}
```

**Response:** `200 OK`

### 1.5 Delete Country
**DELETE** `/countries/:id`

**Authorization:** SUPER_ADMIN, HQ_ADMIN

**Response:** `200 OK`

---

## 2. Regions API

### 2.1 Create Region
**POST** `/regions`

**Authorization:** SUPER_ADMIN, HQ_ADMIN, REGIONAL_ADMIN

**Request Body:**
```json
{
  "name": "Kanto",
  "code": "KT",
  "countryId": "507f1f77bcf86cd799439011",
  "description": "Kanto region including Tokyo"
}
```

**Response:** `201 Created`

### 2.2 Get All Regions
**GET** `/regions?countryId=507f1f77bcf86cd799439011&isActive=true`

**Query Parameters:**
- `countryId` (string, optional): Filter by country
- `isActive` (boolean, optional): Filter by active status
- `search` (string, optional): Search by name or code

**Response:** `200 OK`

### 2.3 Get Region by ID
**GET** `/regions/:id`

**Response:** `200 OK`

### 2.4 Update Region
**PUT** `/regions/:id`

**Authorization:** SUPER_ADMIN, HQ_ADMIN, REGIONAL_ADMIN

**Response:** `200 OK`

### 2.5 Delete Region
**DELETE** `/regions/:id`

**Authorization:** SUPER_ADMIN, HQ_ADMIN

**Response:** `200 OK`

---

## 3. Business Units API

### 3.1 Create Business Unit
**POST** `/business-units`

**Authorization:** SUPER_ADMIN, HQ_ADMIN, REGIONAL_ADMIN

**Request Body:**
```json
{
  "name": "Proactiv Fitness Tokyo",
  "code": "PF-TKY",
  "type": "FRANCHISE",
  "countryId": "507f1f77bcf86cd799439011",
  "regionId": "507f1f77bcf86cd799439012",
  "description": "Tokyo franchise operations",
  "settings": {
    "defaultCapacity": 20,
    "defaultDuration": 60,
    "allowOnlineBooking": true,
    "requireApproval": false,
    "cancellationHours": 24
  }
}
```

**Response:** `201 Created`

### 3.2 Get All Business Units
**GET** `/business-units?countryId=xxx&type=FRANCHISE`

**Query Parameters:**
- `countryId` (string, optional): Filter by country
- `regionId` (string, optional): Filter by region
- `type` (BusinessUnitType, optional): Filter by type
- `isActive` (boolean, optional): Filter by active status
- `search` (string, optional): Search by name or code

**Response:** `200 OK`

### 3.3 Get Business Unit by ID
**GET** `/business-units/:id`

**Response:** `200 OK`

### 3.4 Update Business Unit
**PUT** `/business-units/:id`

**Authorization:** SUPER_ADMIN, HQ_ADMIN, REGIONAL_ADMIN

**Response:** `200 OK`

### 3.5 Delete Business Unit
**DELETE** `/business-units/:id`

**Authorization:** SUPER_ADMIN, HQ_ADMIN

**Response:** `200 OK`

---

## 4. Locations API

### 4.1 Create Location
**POST** `/locations`

**Authorization:** SUPER_ADMIN, HQ_ADMIN, REGIONAL_ADMIN

**Request Body:**
```json
{
  "name": "Shibuya Center",
  "code": "SBY-01",
  "businessUnitId": "507f1f77bcf86cd799439013",
  "countryId": "507f1f77bcf86cd799439011",
  "regionId": "507f1f77bcf86cd799439012",
  "address": {
    "street": "1-2-3 Shibuya",
    "city": "Tokyo",
    "state": "Tokyo",
    "postalCode": "150-0002",
    "country": "Japan"
  },
  "contactInfo": {
    "email": "shibuya@proactiv.jp",
    "phone": "+81-3-1234-5678",
    "website": "https://proactiv.jp/shibuya"
  },
  "capacity": 50,
  "operatingHours": {
    "monday": { "isOpen": true, "openTime": "09:00", "closeTime": "21:00" },
    "tuesday": { "isOpen": true, "openTime": "09:00", "closeTime": "21:00" },
    "wednesday": { "isOpen": true, "openTime": "09:00", "closeTime": "21:00" },
    "thursday": { "isOpen": true, "openTime": "09:00", "closeTime": "21:00" },
    "friday": { "isOpen": true, "openTime": "09:00", "closeTime": "21:00" },
    "saturday": { "isOpen": true, "openTime": "10:00", "closeTime": "18:00" },
    "sunday": { "isOpen": false, "openTime": "", "closeTime": "" }
  },
  "facilities": ["GYM", "POOL", "SAUNA"],
  "amenities": ["PARKING", "WIFI", "LOCKERS"],
  "settings": {
    "allowOnlineBooking": true,
    "requireApproval": false,
    "autoConfirm": true,
    "maxAdvanceBookingDays": 30,
    "minAdvanceBookingHours": 2
  }
}
```

**Response:** `201 Created`

### 4.2 Get All Locations
**GET** `/locations?businessUnitId=xxx&status=ACTIVE`

**Query Parameters:**
- `businessUnitId` (string, optional): Filter by business unit
- `countryId` (string, optional): Filter by country
- `regionId` (string, optional): Filter by region
- `status` (LocationStatus, optional): Filter by status
- `search` (string, optional): Search by name or code

**Response:** `200 OK`

### 4.3 Get Location by ID
**GET** `/locations/:id`

**Response:** `200 OK`

### 4.4 Update Location
**PUT** `/locations/:id`

**Authorization:** SUPER_ADMIN, HQ_ADMIN, REGIONAL_ADMIN, LOCATION_MANAGER

**Response:** `200 OK`

### 4.5 Delete Location
**DELETE** `/locations/:id`

**Authorization:** SUPER_ADMIN, HQ_ADMIN

**Response:** `200 OK`

---

## 5. Rooms API

### 5.1 Create Room
**POST** `/rooms`

**Authorization:** SUPER_ADMIN, HQ_ADMIN, REGIONAL_ADMIN, LOCATION_MANAGER

**Request Body:**
```json
{
  "name": "Training Room A",
  "code": "TRA-A",
  "locationId": "507f1f77bcf86cd799439014",
  "type": "TRAINING_ROOM",
  "capacity": 20,
  "area": 100,
  "floor": 2,
  "description": "Main training room with mirrors",
  "equipment": ["MATS", "WEIGHTS", "MIRRORS", "SOUND_SYSTEM"]
}
```

**Response:** `201 Created`

### 5.2 Get All Rooms
**GET** `/rooms?locationId=xxx&type=TRAINING_ROOM&minCapacity=15`

**Query Parameters:**
- `locationId` (string, optional): Filter by location
- `type` (string, optional): Filter by room type
- `isActive` (boolean, optional): Filter by active status
- `minCapacity` (number, optional): Filter by minimum capacity
- `search` (string, optional): Search by name or code

**Response:** `200 OK`

### 5.3 Get Room by ID
**GET** `/rooms/:id`

**Response:** `200 OK`

### 5.4 Update Room
**PUT** `/rooms/:id`

**Authorization:** SUPER_ADMIN, HQ_ADMIN, REGIONAL_ADMIN, LOCATION_MANAGER

**Response:** `200 OK`

### 5.5 Delete Room
**DELETE** `/rooms/:id`

**Authorization:** SUPER_ADMIN, HQ_ADMIN, REGIONAL_ADMIN, LOCATION_MANAGER

**Response:** `200 OK`

---

## 6. Holiday Calendars API

### 6.1 Create Holiday Calendar
**POST** `/holiday-calendars`

**Authorization:** SUPER_ADMIN, HQ_ADMIN, REGIONAL_ADMIN

**Request Body:**
```json
{
  "name": "Japan 2024 Holidays",
  "year": 2024,
  "countryId": "507f1f77bcf86cd799439011",
  "holidays": [
    {
      "name": "New Year's Day",
      "date": "2024-01-01",
      "isRecurring": true,
      "affectsScheduling": true
    },
    {
      "name": "Golden Week",
      "date": "2024-05-03",
      "isRecurring": true,
      "affectsScheduling": true
    }
  ]
}
```

**Response:** `201 Created`

### 6.2 Get All Holiday Calendars
**GET** `/holiday-calendars?countryId=xxx&year=2024`

**Query Parameters:**
- `countryId` (string, optional): Filter by country
- `regionId` (string, optional): Filter by region
- `year` (number, optional): Filter by year
- `isActive` (boolean, optional): Filter by active status

**Response:** `200 OK`

### 6.3 Get Holiday Calendar by ID
**GET** `/holiday-calendars/:id`

**Response:** `200 OK`

### 6.4 Update Holiday Calendar
**PUT** `/holiday-calendars/:id`

**Authorization:** SUPER_ADMIN, HQ_ADMIN, REGIONAL_ADMIN

**Response:** `200 OK`

### 6.5 Delete Holiday Calendar
**DELETE** `/holiday-calendars/:id`

**Authorization:** SUPER_ADMIN, HQ_ADMIN

**Response:** `200 OK`

---

## 7. Terms API

### 7.1 Create Term
**POST** `/terms`

**Authorization:** SUPER_ADMIN, HQ_ADMIN, REGIONAL_ADMIN, LOCATION_MANAGER

**Request Body:**
```json
{
  "name": "Spring Term 2024",
  "code": "SPR-2024",
  "businessUnitId": "507f1f77bcf86cd799439013",
  "locationId": "507f1f77bcf86cd799439014",
  "startDate": "2024-04-01",
  "endDate": "2024-06-30",
  "registrationStartDate": "2024-03-01",
  "registrationEndDate": "2024-03-25",
  "holidayCalendarId": "507f1f77bcf86cd799439015",
  "excludedDates": ["2024-05-15"],
  "pricingMultiplier": 1.0
}
```

**Response:** `201 Created`

### 7.2 Get All Terms
**GET** `/terms?businessUnitId=xxx&current=true&year=2024`

**Query Parameters:**
- `businessUnitId` (string, optional): Filter by business unit
- `locationId` (string, optional): Filter by location
- `isActive` (boolean, optional): Filter by active status
- `allowEnrollment` (boolean, optional): Filter by enrollment status
- `year` (number, optional): Filter by year
- `current` (boolean, optional): Get current/upcoming terms only

**Response:** `200 OK`

### 7.3 Get Term by ID
**GET** `/terms/:id`

**Response:** `200 OK`

### 7.4 Update Term
**PUT** `/terms/:id`

**Authorization:** SUPER_ADMIN, HQ_ADMIN, REGIONAL_ADMIN, LOCATION_MANAGER

**Response:** `200 OK`

### 7.5 Delete Term
**DELETE** `/terms/:id`

**Authorization:** SUPER_ADMIN, HQ_ADMIN

**Response:** `200 OK`

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "code",
      "message": "Country code must be 2 characters"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Country not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Country with this code already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Data Models

### BusinessUnitType Enum
- `HEADQUARTERS`
- `REGIONAL_OFFICE`
- `FRANCHISE`
- `CORPORATE_OWNED`
- `PARTNER`

### LocationStatus Enum
- `ACTIVE`
- `INACTIVE`
- `UNDER_CONSTRUCTION`
- `TEMPORARILY_CLOSED`
- `PERMANENTLY_CLOSED`

### Currency Enum
- `USD`, `EUR`, `GBP`, `JPY`, `CNY`, `KRW`, `SGD`, `AUD`, `CAD`, `INR`

### Language Enum
- `ENGLISH`, `JAPANESE`, `CHINESE`, `KOREAN`, `SPANISH`, `FRENCH`, `GERMAN`

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All IDs are MongoDB ObjectIds
3. Soft delete is used for all entities (isDeleted flag)
4. Hierarchical relationships: Country → Region → Business Unit → Location → Room
5. Terms can be associated with holiday calendars for automatic scheduling adjustments
6. Operating hours use 24-hour format (HH:mm)
7. Capacity values represent maximum number of people/participants
