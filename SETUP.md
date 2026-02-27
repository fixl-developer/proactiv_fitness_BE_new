# 🚀 Proactiv Fitness Backend - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **MongoDB** >= 6.0 ([Download](https://www.mongodb.com/try/download/community))
- **npm** >= 9.0.0 (comes with Node.js)
- **Git** (for version control)

## Step-by-Step Setup

### 1. Install Dependencies

Navigate to the backend directory and install all required packages:

```bash
cd backend
npm install
```

This will install all dependencies listed in `package.json`.

### 2. Setup MongoDB

#### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (using Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. Verify MongoDB is running:
   ```bash
   mongosh
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Use this connection string in your `.env` file

### 3. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and update the following required variables:

   ```env
   # Application
   NODE_ENV=development
   PORT=5000
   
   # Database (Update this with your MongoDB connection string)
   MONGODB_URI=mongodb://localhost:27017/proactiv_fitness
   
   # JWT (IMPORTANT: Change these in production!)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-refresh-token-secret
   ```

3. Optional: Configure additional services (Email, SMS, Payments) as needed

### 4. Verify Setup

Run the TypeScript compiler to check for any errors:

```bash
npm run build
```

If successful, you should see a `dist/` folder created with compiled JavaScript files.

### 5. Start the Development Server

```bash
npm run dev
```

You should see output similar to:

```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Proactiv Fitness Platform API                   ║
║                                                       ║
║   Environment: development                            ║
║   Port: 5000                                          ║
║   API Version: v1                                     ║
║                                                       ║
║   Server is running at:                              ║
║   http://localhost:5000                              ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

### 6. Test the API

Open your browser or use a tool like Postman/Insomnia:

**Health Check:**
```
GET http://localhost:5000/health
```

**API Info:**
```
GET http://localhost:5000/api/v1
```

## 📁 Project Structure Overview

```
backend/
├── src/
│   ├── modules/          # Feature modules (IAM, BCMS, etc.)
│   ├── shared/           # Shared utilities and interfaces
│   │   ├── base/        # Base classes (Service, Controller, Model)
│   │   ├── constants/   # Application constants
│   │   ├── enums/       # TypeScript enums
│   │   ├── interfaces/  # TypeScript interfaces
│   │   └── utils/       # Utility functions
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── tests/              # Test files
├── logs/               # Application logs
├── uploads/            # File uploads
└── dist/               # Compiled JavaScript
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Building
npm run build            # Compile TypeScript to JavaScript

# Production
npm start                # Run compiled production build

# Testing
npm test                 # Run tests
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Check for linting errors
npm run lint:fix         # Fix linting errors automatically
npm run format           # Format code with Prettier
```

## 🔧 Development Workflow

### Adding a New Module

1. Create module directory: `src/modules/your-module/`
2. Create the following files:
   - `your-module.model.ts` - MongoDB schema
   - `your-module.service.ts` - Business logic
   - `your-module.controller.ts` - Request handlers
   - `your-module.routes.ts` - API routes
   - `your-module.validation.ts` - Input validation
   - `your-module.interface.ts` - TypeScript interfaces

3. Register routes in `src/app.ts`

### Database Migrations

```bash
npm run migrate          # Run migrations
npm run seed             # Seed database with test data
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
- Ensure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- Verify MongoDB port (default: 27017)

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
- Change `PORT` in `.env` to a different port
- Or kill the process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:5000 | xargs kill -9
  ```

### TypeScript Errors

**Error:** `Cannot find module '@/...'`

**Solution:**
- Ensure `tsconfig.json` paths are correctly configured
- Run `npm install` again
- Restart your IDE/editor

### Module Not Found

**Error:** `Error: Cannot find module 'express'`

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

Now that your backend is set up, you can:

1. **Phase 1 - Foundation Modules:**
   - Implement IAM (Identity & Access Management)
   - Build BCMS (Branch & Center Management)
   - Set up database schemas

2. **Test Your Setup:**
   - Create a simple test endpoint
   - Test database connectivity
   - Verify authentication flow

3. **Read Documentation:**
   - Review `README.md` for architecture overview
   - Check module-specific documentation
   - Understand the development phases

## 🆘 Getting Help

If you encounter issues:

1. Check the logs in `logs/` directory
2. Review error messages carefully
3. Ensure all environment variables are set
4. Verify MongoDB is running and accessible

## 🎉 Success!

Your Proactiv Fitness backend is now ready for development! 

Start building Phase 1 modules (IAM & BCMS) next.
