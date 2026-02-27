# 📚 Proactiv Fitness Backend - Documentation Index

Welcome to the Proactiv Fitness Platform backend! This index will help you navigate all documentation.

## 🎯 Start Here

### New to the Project?
1. **[GETTING_STARTED.md](./GETTING_STARTED.md)** ⭐ START HERE
   - Your comprehensive starting guide
   - Links to all other documentation
   - Clear path forward

### Quick Setup?
2. **[QUICK_START.md](./QUICK_START.md)** ⚡ 5-MINUTE SETUP
   - Get running in 5 minutes
   - Minimal steps
   - Quick verification

## 📖 Core Documentation

### Setup & Installation
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
  - Prerequisites
  - Step-by-step installation
  - MongoDB setup
  - Environment configuration
  - Troubleshooting

### Project Overview
- **[README.md](./README.md)** - Project overview
  - Architecture overview
  - Module structure
  - Technology stack
  - Features list
  - API documentation link

### Development
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - How to build modules
  - Module structure pattern
  - Step-by-step module creation
  - Code examples
  - Best practices
  - Testing patterns
  - Common patterns

### Progress Tracking
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current status
  - Completed features
  - Current phase
  - Upcoming phases
  - Progress metrics
  - Next steps

### Complete Summary
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Everything in one place
  - What's completed
  - File structure
  - Development roadmap
  - Dependencies
  - Key concepts
  - Success criteria

## 🗂️ Documentation by Purpose

### I want to...

#### ...get started quickly
→ [QUICK_START.md](./QUICK_START.md)

#### ...understand the full setup
→ [SETUP.md](./SETUP.md)

#### ...learn how to build modules
→ [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

#### ...see what's been done
→ [PROJECT_STATUS.md](./PROJECT_STATUS.md)

#### ...understand the architecture
→ [README.md](./README.md)

#### ...get a complete overview
→ [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

#### ...know where to start
→ [GETTING_STARTED.md](./GETTING_STARTED.md)

## 📁 Code Documentation

### Shared Resources
Located in `src/shared/`

#### Base Classes
- `src/shared/base/base.service.ts` - Base service with CRUD
- `src/shared/base/base.controller.ts` - Base controller
- `src/shared/base/base.model.ts` - Base model schema

#### Utilities
- `src/shared/utils/logger.util.ts` - Logging utility
- `src/shared/utils/response.util.ts` - API response helper
- `src/shared/utils/pagination.util.ts` - Pagination helper
- `src/shared/utils/validation.util.ts` - Validation functions
- `src/shared/utils/async-handler.util.ts` - Error wrapper

#### Constants & Enums
- `src/shared/constants/index.ts` - Application constants
- `src/shared/enums/index.ts` - TypeScript enums

#### Interfaces
- `src/shared/interfaces/common.interface.ts` - Common interfaces

### Configuration
Located in `src/config/`

- `src/config/env.config.ts` - Environment configuration
- `src/config/database.config.ts` - Database connection

### Middleware
Located in `src/middleware/`

- `src/middleware/error.middleware.ts` - Error handling
- `src/middleware/validation.middleware.ts` - Input validation
- `src/middleware/rate-limit.middleware.ts` - Rate limiting

### Core Files
- `src/app.ts` - Express application setup
- `src/server.ts` - Server entry point

## 🎓 Learning Path

### Day 1: Setup
1. Read [QUICK_START.md](./QUICK_START.md)
2. Install and run the server
3. Verify everything works
4. Explore the codebase

### Day 2: Understanding
1. Read [README.md](./README.md)
2. Read [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
3. Study base classes
4. Review utilities

### Day 3: Development
1. Check [PROJECT_STATUS.md](./PROJECT_STATUS.md)
2. Start building IAM module
3. Follow development patterns
4. Write tests

### Week 1: IAM Module
- User registration
- Login/logout
- JWT authentication
- Password reset
- User profile

### Week 2: BCMS Module
- Country management
- Location management
- Term management
- Holiday calendars

### Week 3+: Continue with roadmap
Follow [PROJECT_STATUS.md](./PROJECT_STATUS.md)

## 🔍 Quick Reference

### Common Commands
```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Run production build

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode

# Code Quality
npm run lint             # Check linting
npm run lint:fix         # Fix linting
npm run format           # Format code
```

### Environment Variables
See `.env.example` for all available variables

Key variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - JWT secret key

### API Endpoints
- `GET /health` - Health check
- `GET /api/v1` - API info
- Module endpoints will be added as you build

## 📊 Project Structure

```
backend/
├── src/                    # Source code
│   ├── modules/           # Feature modules
│   ├── shared/            # Shared utilities
│   ├── config/            # Configuration
│   ├── middleware/        # Middleware
│   ├── app.ts            # Express app
│   └── server.ts         # Server entry
├── tests/                 # Tests
├── logs/                  # Logs
├── uploads/               # Uploads
└── dist/                  # Compiled code
```

## 🎯 Development Phases

### ✅ Phase 0: Setup (Complete)
- Project structure
- Infrastructure
- Base classes
- Documentation

### 🚧 Phase 1: Foundation (Current)
- IAM Module
- BCMS Module
- Database Architecture

### ⏳ Phase 2: Programs & Scheduling
- Program Catalog
- Scheduling Engine
- Rules Engine

### ⏳ Phase 3: Customer & Booking
- CRM
- Booking Engine
- Payments

### ⏳ Phase 4+: Advanced Features
- 20+ more modules

## 🆘 Troubleshooting

### Common Issues
See [SETUP.md](./SETUP.md#troubleshooting) for:
- MongoDB connection issues
- Port conflicts
- Module not found errors
- TypeScript errors

### Getting Help
1. Check documentation
2. Review error logs (`./logs/`)
3. Search codebase for examples
4. Ask team members

## 📞 Additional Resources

### External Documentation
- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [MongoDB](https://docs.mongodb.com/)
- [Jest](https://jestjs.io/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [VS Code](https://code.visualstudio.com/) - Recommended IDE

## ✅ Checklist

### Before You Start
- [ ] Read GETTING_STARTED.md
- [ ] Install Node.js (>= 18.0.0)
- [ ] Install MongoDB (>= 6.0)
- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Setup .env file
- [ ] Start MongoDB
- [ ] Run dev server (`npm run dev`)
- [ ] Verify health endpoint works

### Ready to Code
- [ ] Read DEVELOPMENT_GUIDE.md
- [ ] Understand base classes
- [ ] Review module structure
- [ ] Check PROJECT_STATUS.md
- [ ] Start with IAM module

## 🎉 You're Ready!

Everything you need is documented. Start with [GETTING_STARTED.md](./GETTING_STARTED.md) and follow the path.

**Happy coding!** 🚀

---

**Last Updated:** February 24, 2026
**Version:** 1.0.0
**Status:** Foundation Complete, Ready for Phase 1
