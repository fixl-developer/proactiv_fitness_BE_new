# ⚡ Quick Start Guide

Get the Proactiv Fitness backend running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (should be >= 18.0.0)
node --version

# Check npm version (should be >= 9.0.0)
npm --version

# Check if MongoDB is installed
mongosh --version
```

## 🚀 Quick Setup (5 Steps)

### Step 1: Install Dependencies (2 minutes)

```bash
cd backend
npm install
```

### Step 2: Start MongoDB (1 minute)

**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Or use MongoDB Atlas (Cloud):**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string
- Update `.env` file

### Step 3: Environment Setup (30 seconds)

The `.env` file is already created with default values. You're good to go!

**Optional:** Update these if needed:
- `PORT` - Change if 5000 is in use
- `MONGODB_URI` - If using MongoDB Atlas
- `JWT_SECRET` - Change in production

### Step 4: Build Project (30 seconds)

```bash
npm run build
```

### Step 5: Start Server (30 seconds)

```bash
npm run dev
```

## ✅ Verify Installation

### 1. Check Server Status

Open browser: http://localhost:5000/health

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-02-24T...",
  "uptime": 1.234
}
```

### 2. Check API

Open browser: http://localhost:5000/api/v1

Expected response:
```json
{
  "message": "Proactiv Fitness Platform API",
  "version": "v1",
  "status": "Running"
}
```

### 3. Check MongoDB Connection

Look for this in terminal:
```
✅ MongoDB connected successfully
```

## 🎉 Success!

Your backend is now running! You should see:

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

## 🛠️ Common Commands

```bash
# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## 🐛 Quick Troubleshooting

### MongoDB not connecting?
```bash
# Check if MongoDB is running
mongosh

# If not, start it:
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Port 5000 already in use?
Change `PORT=5001` in `.env` file

### Module not found errors?
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 What's Next?

1. **Read the full setup guide:** [SETUP.md](./SETUP.md)
2. **Check project status:** [PROJECT_STATUS.md](./PROJECT_STATUS.md)
3. **Start building Phase 1:** IAM Module (Identity & Access Management)

## 🎯 Ready to Code!

The foundation is complete. Time to build the modules!

**Next Step:** Implement the IAM (Identity & Access Management) module

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for the development roadmap.
