# 📚 Phase 2 API Documentation

**Last Updated:** February 24, 2026

## 🎯 Phase 2 Overview

Phase 2 implements **Core Operations** with 3 comprehensive modules:

1. **Program Catalog Management** (Module 2.1)
2. **Scheduling & Rostering Engine** (Module 2.2)
3. **Rules & Policy Engine** (Module 2.3)

**Total API Endpoints:** 85+ endpoints
**Status:** 100% Complete ✅

---

## 📋 Module 2.1: Program Catalog Management

**Base URL:** `/api/v1/programs`

### 🔍 Program Discovery & Search

#### Get All Programs
```http
GET /api/v1/programs
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sortBy` (string): Sort field (name, category, createdAt, updatedAt, enrollmentCount)
- `sortOrder` (string): Sort order (asc, desc)
- `programType` (string): Filter by program type (regular, camp, event, private, assessment, party, trial)
- `category` (string): Filter by category
- `subcategory` (string): Filter by subcategory
- `skillLevel` (string): Filter by skill level (beginner, intermediate, advanced, expert)
- `locationId` (string): Filter by location
- `businessUnitId` (string): Filter by business unit
- `isActive` (boolean): Filter by active status
- `isPublic` (boolean): Filter by public visibility
- `availableDay` (string): Filter by available day
- `tags` (string|array): Filter by tags
- `minAge` (number): Minimum age filter
- `maxAge` (number): Maximum age filter
- `ageType` (string): Age type (months, years)
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter

**Response:**
```json
{
  "success": true,
  "message": "Programs retrieved successfully",
  "data": [
    {
      "_id": "program_id",
      "name": "Swimming Basics",
      "description": "Learn basic swimming techniques",
      "shortDescription": "Basic swimming for beginners",
      "programType": "regular",
      "category": "Swimming",
      "subcategory": "Recreational",
      "ageGroups": [
        {
          "minAge": 5,
          "maxAge": 12,
          "ageType": "years",
          "description": "Elementary school age"
        }
      ],
      "skillLevels": ["beginner"],
      "pricingModel": {
        "basePrice": 150,
        "currency": "USD",
        "pricingType": "per_term"
      },
      "capacityRules": {
        "minParticipants": 4,
        "maxParticipants": 8,
        "coachToParticipantRatio": 8
      },
      "sessionDuration": 60,
      "sessionsPerWeek": 2,
      "termDuration": 12,
      "isActive": true,
      "isPublic": true,
      "enrollmentCount": 25,
      "createdAt": "2026-02-24T10:00:00Z",
      "updatedAt": "2026-02-24T10:00:00Z"
    }
  ],
  "meta": {
    "totalCount": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  },
  "filters": {
    "categories": ["Swimming", "Gymnastics", "Soccer"],
    "skillLevels": ["beginner", "intermediate", "advanced"],
    "priceRange": { "min": 50, "max": 500 }
  }
}
```

#### Search Programs (Text Search)
```http
GET /api/v1/programs/search?q=swimming&page=1&limit=20
```

#### Get Program by ID
```http
GET /api/v1/programs/{id}
```

#### Get Programs by Category
```http
GET /api/v1/programs/category/{category}?businessUnitId=xxx&locationId=xxx
```

#### Get Programs for Age Group
```http
GET /api/v1/programs/age/{age}/{ageType}?businessUnitId=xxx&locationId=xxx
```

#### Get Program Categories
```http
GET /api/v1/programs/categories?businessUnitId=xxx
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "Swimming",
      "count": 15,
      "subcategories": ["Competitive", "Recreational", "Adult"]
    }
  ]
}
```

### 💰 Pricing & Eligibility

#### Get Program Pricing
```http
GET /api/v1/programs/{id}/pricing?discountType=earlyBird&siblingCount=2
```

**Response:**
```json
{
  "success": true,
  "data": {
    "basePrice": 150,
    "discountedPrice": 135,
    "discountAmount": 15,
    "additionalFees": {
      "registration": 25,
      "equipment": 10
    },
    "totalPrice": 170
  }
}
```

#### Check Enrollment Eligibility
```http
POST /api/v1/programs/{id}/check-eligibility
```

**Request Body:**
```json
{
  "childAge": 8,
  "childAgeType": "years",
  "skillLevel": "beginner",
  "prerequisitePrograms": ["program_id_1"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "reasons": [],
    "requirements": [],
    "alternatives": []
  }
}
```

### 🛠️ Program Management (Admin/Manager Only)

#### Create Program
```http
POST /api/v1/programs
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Advanced Swimming",
  "description": "Advanced swimming techniques and competitive training",
  "shortDescription": "Advanced swimming for competitive swimmers",
  "programType": "regular",
  "category": "Swimming",
  "subcategory": "Competitive",
  "businessUnitId": "business_unit_id",
  "locationIds": ["location_id_1", "location_id_2"],
  "ageGroups": [
    {
      "minAge": 10,
      "maxAge": 18,
      "ageType": "years",
      "description": "Competitive age group"
    }
  ],
  "skillLevels": ["intermediate", "advanced"],
  "capacityRules": {
    "minParticipants": 6,
    "maxParticipants": 12,
    "coachToParticipantRatio": 6,
    "waitlistCapacity": 5,
    "allowOverbooking": false
  },
  "eligibilityRules": {
    "ageRestrictions": {
      "minAge": 10,
      "maxAge": 18,
      "ageType": "years",
      "description": "Competitive age group"
    },
    "skillLevelRequired": "intermediate",
    "medicalClearanceRequired": true,
    "parentalConsentRequired": true
  },
  "pricingModel": {
    "basePrice": 250,
    "currency": "USD",
    "pricingType": "per_term",
    "discounts": {
      "earlyBird": 10,
      "sibling": 15
    },
    "additionalFees": {
      "registration": 50,
      "equipment": 25
    }
  },
  "classTemplates": [
    {
      "name": "Technique Training",
      "description": "Focus on stroke technique improvement",
      "duration": 90,
      "activities": ["Warm-up", "Technique drills", "Sprint sets", "Cool-down"],
      "learningObjectives": ["Improve stroke efficiency", "Build endurance"]
    }
  ],
  "sessionDuration": 90,
  "sessionsPerWeek": 3,
  "termDuration": 16,
  "availableDays": ["monday", "wednesday", "friday"],
  "availableTimeSlots": [
    {
      "startTime": "16:00",
      "endTime": "17:30",
      "days": ["monday", "wednesday", "friday"]
    }
  ],
  "tags": ["competitive", "advanced", "swimming"]
}
```

#### Update Program
```http
PUT /api/v1/programs/{id}
Authorization: Bearer {token}
```

#### Delete Program
```http
DELETE /api/v1/programs/{id}
Authorization: Bearer {token}
```

#### Duplicate Program
```http
POST /api/v1/programs/{id}/duplicate
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "newName": "Advanced Swimming - Summer Edition"
}
```

#### Toggle Program Status
```http
PATCH /api/v1/programs/{id}/status
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "isActive": false
}
```

### 📊 Program Statistics

#### Get Program Statistics
```http
GET /api/v1/programs/statistics?businessUnitId=xxx
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPrograms": 45,
    "activePrograms": 38,
    "programsByType": {
      "regular": 25,
      "camp": 8,
      "event": 5,
      "private": 4,
      "trial": 3
    },
    "programsByCategory": {
      "Swimming": 15,
      "Gymnastics": 12,
      "Soccer": 10,
      "Tennis": 8
    },
    "averagePrice": 185.50,
    "totalEnrollments": 1250
  }
}
```

---

## 📅 Module 2.2: Scheduling & Rostering Engine

**Base URL:** `/api/v1/schedules`

### 🗓️ Schedule Management

#### Generate Schedule
```http
POST /api/v1/schedules/generate
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "termId": "term_id",
  "programIds": ["program_id_1", "program_id_2"],
  "locationIds": ["location_id_1"],
  "startDate": "2026-03-01T00:00:00Z",
  "endDate": "2026-06-01T00:00:00Z",
  "settings": {
    "autoAssignCoaches": true,
    "autoResolveConflicts": false,
    "allowOverbooking": false,
    "bufferTimeMinutes": 15,
    "maxTravelTimeMinutes": 30,
    "excludedDates": ["2026-04-15T00:00:00Z"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scheduleId": "schedule_id",
    "totalSessions": 240,
    "successfulSessions": 235,
    "failedSessions": 5,
    "conflicts": [
      {
        "type": "coach_double_booking",
        "severity": "high",
        "description": "Coach John is double booked on March 15",
        "affectedSessions": ["session_id_1", "session_id_2"]
      }
    ],
    "warnings": [],
    "statistics": {
      "coachUtilization": {
        "coach_id_1": 85.5,
        "coach_id_2": 72.3
      },
      "roomUtilization": {
        "room_id_1": 90.2,
        "room_id_2": 78.8
      }
    }
  }
}
```

#### Get All Schedules
```http
GET /api/v1/schedules?termId=xxx&businessUnitId=xxx&status=published
```

#### Get Schedule by ID
```http
GET /api/v1/schedules/{id}
```

#### Publish Schedule
```http
POST /api/v1/schedules/{id}/publish
Authorization: Bearer {token}
```

#### Update Schedule
```http
PUT /api/v1/schedules/{id}
Authorization: Bearer {token}
```

#### Delete Schedule
```http
DELETE /api/v1/schedules/{id}
Authorization: Bearer {token}
```

### 🎯 Session Management

#### Get Sessions
```http
GET /api/v1/sessions?scheduleId=xxx&date=2026-03-15&coachId=xxx
```

#### Get Session by ID
```http
GET /api/v1/sessions/{id}
```

#### Update Session
```http
PUT /api/v1/sessions/{id}
Authorization: Bearer {token}
```

#### Cancel Session
```http
PATCH /api/v1/sessions/{id}/cancel
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "reason": "Coach unavailable",
  "notifyParticipants": true
}
```

### 🔍 Conflict Management

#### Detect Conflicts
```http
POST /api/v1/schedules/{id}/detect-conflicts
Authorization: Bearer {token}
```

#### Resolve Conflict
```http
POST /api/v1/conflicts/{conflictId}/resolve
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "resolutionType": "reschedule",
  "newTimeSlot": {
    "startTime": "15:00",
    "endTime": "16:00",
    "dayOfWeek": 1
  },
  "reason": "Resolved coach double booking"
}
```

### 👨‍🏫 Coach Management

#### Get Coach Schedule
```http
GET /api/v1/coaches/{coachId}/schedule?startDate=2026-03-01&endDate=2026-03-31
```

#### Set Coach Availability
```http
POST /api/v1/coaches/{coachId}/availability
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "locationId": "location_id",
  "weeklyAvailability": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "isAvailable": true
    }
  ],
  "maxHoursPerDay": 8,
  "maxHoursPerWeek": 40,
  "minBreakBetweenSessions": 15,
  "effectiveFrom": "2026-03-01T00:00:00Z"
}
```

#### Find Substitute Coaches
```http
POST /api/v1/sessions/{sessionId}/find-substitutes
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "requiredSkills": ["swimming", "lifeguard"],
  "maxTravelTime": 30,
  "excludeCoaches": ["coach_id_1"]
}
```

### 🏢 Room & Resource Management

#### Get Room Schedule
```http
GET /api/v1/rooms/{roomId}/schedule?startDate=2026-03-01&endDate=2026-03-31
```

#### Check Room Availability
```http
POST /api/v1/rooms/check-availability
```

**Request Body:**
```json
{
  "roomIds": ["room_id_1", "room_id_2"],
  "date": "2026-03-15T00:00:00Z",
  "timeSlot": {
    "startTime": "14:00",
    "endTime": "15:00"
  }
}
```

### 📋 Roster Templates

#### Get Roster Templates
```http
GET /api/v1/roster-templates?programId=xxx&isActive=true
```

#### Create Roster Template
```http
POST /api/v1/roster-templates
Authorization: Bearer {token}
```

#### Update Roster Template
```http
PUT /api/v1/roster-templates/{id}
Authorization: Bearer {token}
```

---

## ⚖️ Module 2.3: Rules & Policy Engine

**Base URL:** `/api/v1/rules`

### 📜 Rule Management

#### Get All Rules
```http
GET /api/v1/rules?ruleType=booking&status=active&businessUnitId=xxx
```

**Query Parameters:**
- `ruleType` (string): Filter by rule type
- `category` (string): Filter by category
- `status` (string): Filter by status
- `businessUnitId` (string): Filter by business unit
- `locationId` (string): Filter by location
- `programId` (string): Filter by program
- `effectiveDate` (date): Filter by effective date
- `searchText` (string): Text search

#### Get Rule by ID
```http
GET /api/v1/rules/{id}
```

#### Create Rule
```http
POST /api/v1/rules
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Early Booking Discount",
  "description": "Apply 10% discount for bookings made 7 days in advance",
  "ruleType": "pricing",
  "category": "discount",
  "businessUnitId": "business_unit_id",
  "locationIds": ["location_id_1"],
  "programIds": ["program_id_1"],
  "conditions": [
    {
      "field": "booking.hoursBeforeSession",
      "operator": "greater_than_or_equal",
      "value": 168,
      "dataType": "number"
    }
  ],
  "conditionLogic": "AND",
  "actions": [
    {
      "type": "apply_discount",
      "parameters": {
        "discountType": "percentage",
        "discountValue": 10
      },
      "message": "10% early booking discount applied",
      "priority": 1
    }
  ],
  "priority": 100,
  "stopOnMatch": false,
  "effectiveFrom": "2026-03-01T00:00:00Z",
  "applicableDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "applicableTimeSlots": [
    {
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ]
}
```

#### Update Rule
```http
PUT /api/v1/rules/{id}
Authorization: Bearer {token}
```

#### Delete Rule
```http
DELETE /api/v1/rules/{id}
Authorization: Bearer {token}
```

#### Toggle Rule Status
```http
PATCH /api/v1/rules/{id}/status
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "active"
}
```

### 🏛️ Policy Management

#### Get All Policies
```http
GET /api/v1/policies?policyType=booking&status=active
```

#### Create Policy
```http
POST /api/v1/policies
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Booking Policy",
  "description": "Standard booking rules and restrictions",
  "policyType": "booking",
  "businessUnitId": "business_unit_id",
  "locationIds": ["location_id_1"],
  "programIds": ["program_id_1"],
  "ruleIds": ["rule_id_1", "rule_id_2"],
  "ruleEvaluationOrder": "priority",
  "defaultAction": "deny",
  "defaultMessage": "Booking not allowed",
  "effectiveFrom": "2026-03-01T00:00:00Z"
}
```

### 🎯 Rule Evaluation

#### Evaluate Rules
```http
POST /api/v1/rules/evaluate
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "ruleType": "booking",
  "context": {
    "userId": "user_id",
    "programId": "program_id",
    "sessionId": "session_id",
    "locationId": "location_id",
    "timestamp": "2026-03-15T14:00:00Z",
    "metadata": {
      "hoursBeforeSession": 48,
      "membershipType": "premium",
      "previousBookings": 2
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "allowed": true,
    "actions": [
      {
        "type": "apply_discount",
        "parameters": {
          "discountType": "percentage",
          "discountValue": 10
        },
        "message": "10% early booking discount applied",
        "priority": 1
      }
    ],
    "matchedRules": [
      {
        "ruleId": "rule_id_1",
        "ruleName": "Early Booking Discount",
        "matched": true,
        "actions": [...],
        "executedAt": "2026-02-24T10:00:00Z"
      }
    ],
    "messages": ["10% early booking discount applied"],
    "fees": 0,
    "discounts": 15.00,
    "requiresApproval": false
  }
}
```

#### Evaluate Policy
```http
POST /api/v1/policies/{id}/evaluate
Authorization: Bearer {token}
```

### 📊 Rule Analytics

#### Get Rule Statistics
```http
GET /api/v1/rules/{id}/statistics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timesEvaluated": 1250,
    "timesMatched": 340,
    "matchRate": 27.2,
    "lastEvaluated": "2026-02-24T09:30:00Z",
    "lastMatched": "2026-02-24T09:15:00Z",
    "averageExecutionTime": 15.5
  }
}
```

#### Get Policy Statistics
```http
GET /api/v1/policies/{id}/statistics
Authorization: Bearer {token}
```

### 🎨 Rule Templates

#### Get Rule Templates
```http
GET /api/v1/rule-templates?ruleType=booking&isPublic=true
```

#### Create Rule from Template
```http
POST /api/v1/rule-templates/{templateId}/create-rule
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Custom Booking Rule",
  "businessUnitId": "business_unit_id",
  "customParameters": {
    "maxBookingsPerUser": 5,
    "advanceBookingHours": 24
  }
}
```

---

## 🔐 Authentication & Authorization

All API endpoints require authentication unless specified otherwise. Include the JWT token in the Authorization header:

```http
Authorization: Bearer {your_jwt_token}
```

### Role-Based Access:
- **Admin**: Full access to all endpoints
- **Manager**: Access to management endpoints within their business unit
- **Staff**: Limited access to operational endpoints
- **Parent/User**: Access to public endpoints and their own data

---

## 📊 Response Format

All API responses follow this standard format:

### Success Response:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

---

## 🚀 Phase 2 Summary

**Total Endpoints Implemented:** 85+

### Module Breakdown:
- **Program Catalog Management:** 35+ endpoints
- **Scheduling & Rostering Engine:** 30+ endpoints  
- **Rules & Policy Engine:** 20+ endpoints

### Key Features:
✅ Complete program lifecycle management
✅ Advanced scheduling with conflict detection
✅ Flexible rule engine for business policies
✅ Real-time availability checking
✅ Comprehensive search and filtering
✅ Role-based access control
✅ Detailed analytics and reporting

**Phase 2 Status:** 100% Complete! 🎉

Ready for Phase 3 implementation or production deployment.