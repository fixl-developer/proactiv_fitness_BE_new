# 🎯 Getting Started with Proactiv Fitness Backend

Welcome! This guide will help you understand the project and start development.

## 📚 Documentation Index

1. **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes
2. **[SETUP.md](./SETUP.md)** - Detailed setup instructions
3. **[README.md](./README.md)** - Project overview and architecture
4. **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current progress and roadmap
5. **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Module development patterns
6. **This file** - Your starting point

## 🚀 Quick Navigation

### For First-Time Setup
1. Read [QUICK_START.md](./QUICK_START.md) to get the server running
2. Verify everything works
3. Come back here

### For Development
1. Check [PROJECT_STATUS.md](./PROJECT_STATUS.md) to see what's next
2. Follow [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) for coding patterns
3. Start building modules

## 📖 What You Have Now

### ✅ Complete Infrastructure

Your backend has a **production-ready foundation**:

- **Express.js** server with TypeScript
- **MongoDB** integration with Mongoose
- **Authentication** ready (JWT setup)
- **Security** middleware (Helmet, CORS, Rate limiting)
- **Validation** system (express-validator)
- **Error handling** (Global error handler)
- **Logging** system (Winston)
- **Base classes** (Service, Controller, Model)
- **Utilities** (Pagination, Response, Validation)
- **Testing** setup (Jest)
- **Code quality** tools (ESLint, Prettier)

### 📁 Project Structure

```
backend/
├── src/
│   ├── modules/              # Feature modules (empty, ready for development)
│   │   ├── iam/             # Identity & Access Management
│   │   ├── bcms/            # Branch & Center Management
│   │   ├── programs/        # Program Catalog
│   │   ├── scheduling/      # Scheduling & Rostering
│   │   ├── booking/         # Booking Engine
│   │   ├── crm/             # CRM
│   │   ├── payments/        # Payments & Billing
│   │   ├── staff/           # Staff Management
│   │   ├── attendance/      # Attendance System
│   │   ├── notifications/   # Notifications
│   │   ├── reporting/       # Reporting & Analytics
│   │   └── integrations/    # Integration Gateway
│   │
│   ├── shared/              # Shared code (COMPLETE)
│   │   ├── base/           # Base classes
│   │   ├── constants/      # Constants
│   │   ├── enums/          # Enumerations
│   │   ├── interfaces/     # TypeScript interfaces
│   │   └── utils/          # Utility functions
│   │
│   ├── config/              # Configuration (COMPLETE)
│   ├── middleware/          # Middleware (COMPLETE)
│   ├── app.ts              # Express app (COMPLETE)
│   └── server.ts           # Server entry (COMPLETE)
│
├── .env                     # Environment variables (CONFIGURED)
├── package.json             # Dependencies (READY)
└── tsconfig.json            # TypeScript config (READY)
```

## 🎯 Your Development Path

### Phase 1: Foundation (Current - Weeks 1-4)

#### Module 1: IAM (Identity & Access Management) - START HERE
**What to build:**
- User registration
- Login/logout
- JWT authentication
- Password reset
- Role-based access control
- User profile management

**Files to create:**
```
src/modules/iam/
├── user.model.ts
├── user.service.ts
├── user.controller.ts
├── user.routes.ts
├── user.validation.ts
├── user.interface.ts
├── auth.service.ts
├── auth.controller.ts
└── auth.routes.ts
```

**Estimated time:** 1 week

#### Module 2: BCMS (Branch & Center Management)
**What to build:**
- Country management
- Region management
- Business unit management
- Location/center management
- Room/resource management
- Holiday calendars
- Term management

**Estimated time:** 1 week

#### Module 3: Database Architecture
**What to build:**
- Complete schema design
- Indexes optimization
- Migration scripts
- Seed data

**Estimated time:** 1 week

### Phase 2: Programs & Scheduling (Weeks 5-8)
- Program Catalog Management
- Scheduling & Rostering Engine
- Rules & Policy Engine

### Phase 3: Customer & Booking (Weeks 9-12)
- CRM & Contact Management
- Booking Engine
- Payments & Billing

### And so on... (See PROJECT_STATUS.md for full roadmap)

## 🛠️ Development Workflow

### Daily Workflow

1. **Pull latest changes** (if working in a team)
   ```bash
   git pull origin main
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Create a new feature branch**
   ```bash
   git checkout -b feature/iam-user-registration
   ```

4. **Write code** following [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

5. **Test your code**
   ```bash
   npm test
   ```

6. **Lint and format**
   ```bash
   npm run lint:fix
   npm run format
   ```

7. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: implement user registration"
   ```

8. **Push and create PR**
   ```bash
   git push origin feature/iam-user-registration
   ```

### Module Development Checklist

For each new module:

- [ ] Create module directory
- [ ] Define interfaces
- [ ] Create model with schema
- [ ] Implement service with business logic
- [ ] Create validation rules
- [ ] Build controller
- [ ] Setup routes
- [ ] Register routes in app.ts
- [ ] Write unit tests
- [ ] Test with Postman/Insomnia
- [ ] Document API endpoints
- [ ] Update PROJECT_STATUS.md

## 🧪 Testing Your Work

### Manual Testing

1. **Use Postman or Insomnia**
   - Create a collection for each module
   - Test all endpoints
   - Save example requests

2. **Check logs**
   ```bash
   # Logs are in ./logs/ directory
   tail -f logs/combined-2026-02-24.log
   ```

3. **Monitor MongoDB**
   ```bash
   mongosh
   use proactiv_fitness
   db.users.find()
   ```

### Automated Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📝 Code Standards

### Naming Conventions

- **Files:** kebab-case (`user.service.ts`)
- **Classes:** PascalCase (`UserService`)
- **Functions:** camelCase (`createUser`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Interfaces:** PascalCase with I prefix (`IUser`)

### Git Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/config changes

Examples:
```
feat: add user registration endpoint
fix: resolve JWT token expiration issue
docs: update API documentation
```

## 🆘 Common Issues & Solutions

### Issue: MongoDB connection failed
**Solution:** Ensure MongoDB is running
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Issue: Port 5000 already in use
**Solution:** Change port in `.env`
```env
PORT=5001
```

### Issue: Module not found errors
**Solution:** Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors
**Solution:** Check tsconfig.json paths and restart IDE

## 📞 Getting Help

1. **Check documentation** - Most answers are here
2. **Review error logs** - Check `./logs/` directory
3. **Search codebase** - Look for similar implementations
4. **Ask team** - Don't hesitate to ask questions

## 🎉 Ready to Start!

You now have everything you need to start building the Proactiv Fitness platform!

### Next Steps:

1. ✅ **Verify setup** - Run `npm run dev` and check http://localhost:5000/health
2. 📖 **Read** [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
3. 🚀 **Start building** - Begin with IAM module (User registration)
4. 📊 **Track progress** - Update [PROJECT_STATUS.md](./PROJECT_STATUS.md)

### Your First Task:

**Build the IAM Module - User Registration**

Follow the pattern in [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) to create:
1. User model
2. User service
3. User controller
4. User routes
5. Validation rules

Good luck! 🚀

---

**Questions?** Check the documentation or ask your team lead.

**Found a bug?** Create an issue with detailed steps to reproduce.

**Have an idea?** Discuss with the team before implementing.
