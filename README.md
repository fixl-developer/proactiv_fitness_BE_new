# Proactiv Fitness Platform - Backend

Enterprise-level youth fitness management platform backend built with Node.js, TypeScript, Express, and MongoDB.

## 🏗️ Architecture Overview

This backend follows a **modular monolithic architecture** with clear separation of concerns:

- **Modules**: Feature-based modules (IAM, BCMS, Scheduling, Booking, etc.)
- **Shared**: Common utilities, interfaces, and base classes
- **Config**: Configuration management
- **Middleware**: Express middleware (auth, validation, error handling)
- **Database**: MongoDB models and migrations

## 📁 Project Structure

```
backend/
├── src/
│   ├── modules/           # Feature modules (Phase-based)
│   │   ├── iam/          # Identity & Access Management
│   │   ├── bcms/         # Branch & Center Management
│   │   ├── programs/     # Program Catalog
│   │   ├── scheduling/   # Scheduling & Rostering
│   │   ├── booking/      # Booking Engine
│   │   ├── crm/          # CRM & Contact Management
│   │   ├── payments/     # Payments & Billing
│   │   ├── staff/        # Coach & Staff Management
│   │   ├── attendance/   # Attendance & Check-in
│   │   ├── notifications/# Notification Service
│   │   ├── reporting/    # Reporting & Analytics
│   │   └── ...           # More modules
│   ├── shared/           # Shared utilities
│   │   ├── interfaces/   # TypeScript interfaces
│   │   ├── enums/        # Enumerations
│   │   ├── constants/    # Constants
│   │   ├── utils/        # Utility functions
│   │   └── base/         # Base classes
│   ├── config/           # Configuration
│   ├── middleware/       # Express middleware
│   ├── database/         # Database connection & migrations
│   ├── types/            # TypeScript type definitions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── tests/               # Test files
├── uploads/             # File uploads (gitignored)
├── logs/                # Application logs (gitignored)
└── dist/                # Compiled JavaScript (gitignored)
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration

5. Start MongoDB locally or use MongoDB Atlas

### Running the Application

**Development mode:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

### Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
```

### Linting & Formatting

```bash
npm run lint          # Check linting
npm run lint:fix      # Fix linting issues
npm run format        # Format code
```

## 📦 Module Development Phases

### Phase 1: Foundation (Current)
- ✅ IAM (Identity & Access Management)
- ✅ BCMS (Branch & Center Management System)
- ✅ Database Architecture

### Phase 2: Program & Scheduling
- Programs Catalog
- Scheduling & Rostering
- Rules Engine

### Phase 3: Customer & Booking
- CRM & Contacts
- Booking Engine
- Payments & Billing

### Phase 4: Operations & Staff
- Coach Management
- Attendance System
- Notifications

### Phase 5+: Advanced Features
- Reporting & Analytics
- Safety Protocols
- Digital Athlete Passport
- Franchise Management
- And more...

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Request rate limiting
- Input validation & sanitization
- Helmet.js security headers
- MongoDB injection prevention
- CORS configuration

## 📊 API Documentation

API documentation will be available at `/api/v1/docs` (Swagger/OpenAPI)

## 🤝 Contributing

This is a proprietary project. Internal team members should follow the development guidelines.

## 📝 License

PROPRIETARY - All rights reserved
