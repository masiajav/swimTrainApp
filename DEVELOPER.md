# SwimTrainApp - Developer Documentation 🏊‍♀️

A comprehensive guide for developers working on the SwimTrainApp project.

## 📊 **Current Project Status: v1.0 (dev-tested)**

Notes for developers:

- Android: Verified — the app runs on Android emulators and physical devices via Expo.
- Google OAuth (mobile): Known issue — redirect/callback behavior is currently unreliable in some dev environments. A server-side redirect helper and a `POST /api/auth/dev-login` endpoint have been added to assist local testing.
- iOS: Not tested in this branch; please verify on macOS/Xcode if you need iOS validation.

---

## 🚀 **Quick Start Commands Reference**

### **Essential Commands - Start Here!**

```bash
# 📱 Start Mobile/Web App (Frontend)
cd mobile
npx expo start --web    # Web browser (http://localhost:8081)
npx expo start          # Mobile development (QR code)

# ⚙️ Start Backend API  
cd backend
npm run dev             # API server (http://localhost:3000)

# 🚀 Start Everything (from root)
npm run dev             # Both frontend and backend
```

### **Directory Structure - Where to Run What**
```
swimTrainApp/
├── mobile/          # 📱 Run: npx expo start
├── backend/         # ⚙️ Run: npm run dev  
├── shared/          # 📦 Types only
└── (root)           # 🚀 Run: npm run dev (both)
```

---

## 🏗️ Project Architecture

### Overview
SwimTrainApp is a full-stack application built with a modern, scalable architecture designed for cross-platform mobile and web deployment.

### Technology Stack

#### Frontend (Mobile & Web)
- **React Native 0.73** - Cross-platform framework
- **Expo SDK 50** - Development platform and build tools
- **TypeScript 5.x** - Type safety and enhanced developer experience
- **Expo Router** - File-based routing system
- **NativeWind** - Tailwind CSS for React Native styling
- **AsyncStorage** - Local data persistence
- **React Context** - State management (Auth, Theme)

#### Backend (API)
- **Node.js 20+** - Runtime environment
- **Express.js 4.x** - Web framework
- **TypeScript 5.x** - Type-safe backend development
- **Prisma 5.x** - Database ORM and schema management
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

#### Database & Hosting
- **Supabase** - PostgreSQL database hosting and authentication
- **Prisma** - Schema migrations and query building

---

## 🗂️ Detailed Project Structure

```
swimTrainApp/
├── 📱 mobile/                    # React Native Expo App
│   ├── app/                     # File-based routing (Expo Router)
│   │   ├── (tabs)/             # Main app navigation tabs
│   │   │   ├── index.tsx       # Dashboard/Home screen
│   │   │   ├── sessions.tsx    # Sessions list screen
│   │   │   ├── team.tsx        # Team management screen
│   │   │   └── profile.tsx     # User profile screen
│   │   ├── auth/               # Authentication screens
│   │   │   ├── login.tsx       # Login screen
│   │   │   └── register.tsx    # Registration screen
│   │   ├── session/            # Session management
│   │   │   ├── create.tsx      # Create new session
│   │   │   ├── [id].tsx        # View session details
│   │   │   └── edit/           # Edit session screens
│   │   ├── team/               # Team features
│   │   │   └── member/         # Team member screens
│   │   │       └── [memberId].tsx  # Member profile view
│   │   ├── settings.tsx        # App settings
│   │   └── _layout.tsx         # Root layout
│   ├── components/             # Reusable UI components
│   ├── contexts/               # React contexts (Theme, Auth)
│   ├── services/               # API service layer
│   └── app.json               # Expo configuration
│
├── ⚙️ backend/                  # Node.js Express API
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   │   ├── auth.ts         # Authentication routes
│   │   │   ├── users.ts        # User management
│   │   │   ├── sessions.ts     # Session CRUD operations
│   │   │   ├── teams.ts        # Team management
│   │   │   └── workouts.ts     # Workout templates
│   │   ├── middleware/         # Express middleware
│   │   │   └── auth.ts         # JWT authentication
│   │   └── index.ts           # Server entry point
│   ├── prisma/                 # Database schema and migrations
│   │   └── schema.prisma       # Prisma schema definition
│   └── package.json
│
├── 📦 shared/                   # Shared TypeScript types
│   ├── types.ts               # Common interfaces and types
│   └── package.json
│
└── 📚 Documentation
    ├── README.md              # Project overview and quick start
    ├── SETUP.md              # Detailed setup and deployment
    ├── DEVELOPER.md          # This file - development guidelines
    └── ROADMAP.md            # Feature roadmap and timeline
```

## 🛠️ Development Workflow

### Starting Development

1. **Backend API (Terminal 1):**
```bash
cd backend
npm run dev        # Starts on http://localhost:3000
```

2. **Frontend App (Terminal 2):**
```bash
cd mobile
npx expo start     # Choose platform (web/iOS/Android)
```

3. **Database Management:**
```bash
cd backend
npx prisma studio  # Database GUI at http://localhost:5555
```

### Key Development Commands

```bash
# 🔄 Database Operations
cd backend
npx prisma generate      # Generate Prisma client after schema changes
npx prisma db push       # Apply schema changes to database
npx prisma studio        # View/edit database in browser
npx prisma db reset      # Reset database (development only)

# 🔍 Type Checking
cd mobile && npx tsc --noEmit    # Check frontend types
cd backend && npx tsc --noEmit   # Check backend types

# 📱 Mobile Development
cd mobile
npx expo start --web       # Web development
npx expo start --ios       # iOS simulator (macOS only)
npx expo start --android   # Android emulator
npx expo start --clear     # Clear cache if issues occur
```
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## 🚀 Development Workflow

### 🎯 **Important: Where to Run Commands**

**📱 For Mobile/Web App (Frontend):**
```bash
# ALWAYS run from mobile/ directory
cd mobile

# Then run:
npx expo start --web    # Web browser
npx expo start          # Mobile (QR code)
npx expo start --ios    # iOS simulator (macOS only)
npx expo start --android # Android emulator
npx expo start --clear  # Clear cache
```

**⚙️ For Backend API:**
```bash
# ALWAYS run from backend/ directory
cd backend

# Then run:
npm run dev             # Start API server (port 3000)
npm run db:studio       # Database GUI
npm run type-check      # TypeScript checking
```

**🚀 For Both Services at Once:**
```bash
# Run from ROOT directory only
npm run dev             # Starts both backend and mobile
```

### Starting Development Servers

**Option 1: All services at once (from root):**
```bash
npm run dev
```

**Option 2: Individual services:**
```bash
# Backend only (from root)
npm run dev:backend

# Mobile app only (from root)
npm run dev:mobile

# OR manually:
cd backend && npm run dev      # Backend
cd mobile && npx expo start   # Mobile
```

### Mobile Development

**Platform-specific commands (run from mobile/ directory):**
```bash
cd mobile

# Web browser
npx expo start --web

# iOS simulator (macOS only)
npx expo start --ios

# Android emulator
npx expo start --android

# Clear cache if needed
npx expo start --clear
```

### Backend Development

**Available commands:**
```bash
cd backend

# Development with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Run production build
npm start

# Database management
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema changes
npm run db:migrate    # Run migrations
npm run db:studio     # Open database GUI
```

## 📁 Detailed File Structure

### Mobile App (`/mobile`)
```
mobile/
├── app/                    # Expo Router file-based routing
│   ├── (tabs)/            # Tab navigation group
│   │   ├── _layout.tsx    # Tab layout configuration
│   │   ├── index.tsx      # Dashboard screen
│   │   ├── sessions.tsx   # Sessions list screen
│   │   ├── team.tsx       # Team management screen
│   │   └── profile.tsx    # User profile screen
│   ├── auth/              # Authentication screens
│   │   ├── login.tsx      # Login screen
│   │   └── register.tsx   # Registration screen
│   └── _layout.tsx        # Root layout
├── assets/                # Images, fonts, icons
├── src/                   # Source code (future organization)
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API calls and external services
│   ├── stores/            # Zustand state stores
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

### Backend API (`/backend`)
```
backend/
├── src/
│   ├── routes/            # API route handlers
│   │   ├── auth.ts        # Authentication endpoints
│   │   ├── users.ts       # User management
│   │   ├── sessions.ts    # Swimming sessions
│   │   ├── workouts.ts    # Workout management
│   │   └── teams.ts       # Team management
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── index.ts           # Application entry point
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── dist/                  # Compiled JavaScript (gitignored)
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

### Shared Types (`/shared`)
```
shared/
├── types.ts               # Shared TypeScript interfaces
├── constants.ts           # Application constants
├── validators.ts          # Zod validation schemas
└── utils.ts               # Shared utility functions
```

## 🗄️ Database Architecture

### Entity Relationship Diagram
```
User (1) ──────── (0..1) Team
 │                         │
 │                         │
 │ (1)                     │ (1)
 │                         │
 └── Session (many) ───────┘
      │
      │ (1)
      │
      Workout (many)
```

### Core Entities

**User**
- Authentication and profile information
- Team association
- Personal swimming statistics

**Team**
- Group management
- Shared sessions and progress

**Session**
- Individual training sessions
- Date, duration, distance tracking
- Associated workouts

**Workout**
- Detailed exercise information
- Swimming-specific data (stroke, intensity)
- Performance metrics

### Database Schema Details

```typescript
// Key enums for swimming-specific data
enum WorkoutType {
  WARMUP, MAIN_SET, COOLDOWN, TECHNIQUE, 
  SPRINT, ENDURANCE, KICK, PULL
}

enum Stroke {
  FREESTYLE, BACKSTROKE, BREASTSTROKE, 
  BUTTERFLY, INDIVIDUAL_MEDLEY, MIXED
}

enum Intensity {
  EASY, MODERATE, HARD, RACE_PACE, RECOVERY
}
```

## 🔌 API Documentation

## 📱 Mobile dev workflow & OAuth debugging (Android)

This project uses Expo (dev-client) for development. Below are the practical steps and troubleshooting tips we use to test Google OAuth on Android emulators/devices.

Important: the app talks to the backend for user data and for exchanging provider tokens (Google). For reliable testing you need:
- Metro (dev server) running when using the dev-client
- Backend API reachable from the emulator/device (see loopback addresses)

Quick checklist
- Start backend: `backend` -> `npm run dev` (port 3000)
- Start Metro (dev-client): `mobile` -> `npx expo start --dev-client --clear`
- Install dev-client APK once (debug/dev-client) or rebuild when native code changes
- Use `adb logcat` and Metro logs to debug callback handling

Device ↔ host network notes
- Android emulator host loopback: use `10.0.2.2` from the emulator to reach your machine's localhost:3000.
- Ensure backend listens on 0.0.0.0 or localhost; for emulator testing we use `http://10.0.2.2:3000`.
- If using a physical device use your machine's LAN IP (e.g. `http://192.168.1.34:3000`) or ngrok to expose the server.

OAuth redirect helper
- We added a tiny redirect helper at `GET /` in the backend that forwards fragments to the app scheme:
  - Example: http://localhost:3000/#access_token=... will redirect to `swimtrainapp://auth/callback#access_token=...`
- This helper must be reachable from the device. If not reachable, the app won't receive the provider token.

Common failure modes and fixes
- Error: "No access token found in callback URL" — Reason: dev-client or Expo wraps/decorates the original URL.
  - Fix: ensure `mobile/app/auth/callback.tsx` can parse nested `url` query parameter (we added support for this).
  - Reproduce: run Metro and `adb logcat`, perform Google sign-in, inspect logs for `[AuthCallback] raw url =` and parsed params.

- Browser lands on `http://localhost:3000/#access_token=...` but emulator can't reach `localhost`:
  - Fix: access backend via `http://10.0.2.2:3000` from emulator or use `ngrok http 3000` and set the public URL in Supabase site settings (for dev only).

- Backend returns `Supabase auth error` or `Invalid token`:
  - Fix: verify the token type (access_token vs id_token). Log `authData` and `authError` in `backend/src/routes/auth.ts` to see what Supabase returns.
  - Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars are correct in backend `.env`.

Logging & debugging commands
- Start backend (dev):
```powershell
Set-Location 'E:\SoftwareDevelopment\repos\swimTrainApp\backend'
npm run dev
```
- Start Metro dev-client (mobile):
```powershell
Set-Location 'E:\SoftwareDevelopment\repos\swimTrainApp\mobile'
npx expo start --dev-client --clear
```
- Tail device logs and filter for our tags:
```powershell
adb logcat | Select-String -Pattern "AuthCallback|ApiService|googleAuth|Supabase" -SimpleMatch
```
- Quick curl test from emulator to ensure backend reachable:
```powershell
curl.exe http://10.0.2.2:3000/ -UseBasicParsing
```

Dev-login bypass (dev-only)
- For quick UI testing without completing OAuth, use the `POST /api/auth/dev-login` endpoint (development only). It returns a JWT you can paste into the app or use to call `apiService.setAuthToken(...)`.
```powershell
# from host (emulator reaches host as 10.0.2.2)
Invoke-RestMethod -Method POST -Uri 'http://10.0.2.2:3000/api/auth/dev-login' -ContentType 'application/json' -Body '{}'
```

When you must rebuild the APK
- You do NOT need to rebuild for pure JS/TS changes when using the dev-client; hot reload or a full JS reload served by Metro is sufficient.
- You MUST rebuild the APK if you change native code (anything under `android/`), add native modules, or change `app.json` `android.package` or native gradle config.

Google / SHA-1 notes
- For native Google Sign-In you need the Android package name + SHA‑1 fingerprint registered in Google Cloud Console. For debug builds use debug keystore SHA‑1; for release builds use release keystore SHA‑1 or the SHA‑1 that EAS uses when managed.

Recommended debug flow (fastest)
1. Start backend and Metro (see commands above).
2. Install the dev-client APK once (or use `npx expo run:android` to build+install) but you don't need to rebuild after JS edits.
3. Reproduce sign-in and watch logs; if the browser lands on a `localhost` URL, use `10.0.2.2` or ngrok as described.
4. If the app never receives the token, check the browser address bar on the emulator or capture it with `adb logcat` and post the raw URL here.

If you'd like, I can add a small checklist of exact console strings to look for and an automated script you can run to gather logs and a screenshot of the browser URL.


### Authentication Endpoints
```typescript
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/logout      # User logout
```

### User Management
```typescript
GET    /api/users/profile  # Get user profile
PUT    /api/users/profile  # Update user profile
```

### Session Management
```typescript
GET    /api/sessions       # Get user sessions
POST   /api/sessions       # Create new session
GET    /api/sessions/:id   # Get specific session
PUT    /api/sessions/:id   # Update session
DELETE /api/sessions/:id   # Delete session
```

### Workout Management
```typescript
GET    /api/workouts            # Get workouts
POST   /api/workouts            # Create workout
GET    /api/workouts/:id        # Get specific workout
PUT    /api/workouts/:id        # Update workout
DELETE /api/workouts/:id        # Delete workout
```

### Team Management
```typescript
GET    /api/teams          # Get teams
POST   /api/teams          # Create team
GET    /api/teams/:id      # Get team details
PUT    /api/teams/:id      # Update team
DELETE /api/teams/:id      # Delete team
```

## 🎨 UI/UX Design System

### Color Palette
```typescript
// Primary swimming theme colors
const colors = {
  primary: {
    blue: '#0ea5e9',    // Main brand color
    teal: '#14b8a6',    // Secondary actions
    navy: '#1e40af',    // Text and headers
  },
  neutral: {
    gray50: '#f9fafb',  // Background
    gray100: '#f3f4f6', // Cards
    gray600: '#4b5563', // Secondary text
    gray900: '#111827', // Primary text
  }
}
```

### Typography
```typescript
// Tailwind CSS classes used throughout
const typography = {
  headings: {
    h1: 'text-2xl font-bold text-swimming-navy',
    h2: 'text-xl font-bold text-swimming-navy',
    h3: 'text-lg font-bold text-swimming-navy',
  },
  body: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    small: 'text-sm text-gray-600',
  }
}
```

### Component Patterns
```typescript
// Consistent button styles
const buttons = {
  primary: 'bg-swimming-blue py-4 px-6 rounded-lg',
  secondary: 'bg-swimming-teal py-4 px-6 rounded-lg',
  danger: 'bg-red-500 py-4 px-6 rounded-lg',
}

// Card layouts
const cards = {
  default: 'bg-white rounded-xl p-4 shadow-sm',
  highlighted: 'bg-swimming-blue rounded-xl p-6 mb-6',
}
```

## 🔧 Development Scripts

### Root Package Scripts
```json
{
  "dev": "concurrently \"npm run dev:backend\" \"npm run dev:mobile\"",
  "dev:backend": "cd backend && npm run dev",
  "dev:mobile": "cd mobile && npx expo start",
  "install:all": "npm install && cd backend && npm install && cd ../mobile && npm install",
  "build:mobile": "cd mobile && npx expo export",
  "type-check": "cd backend && npm run type-check && cd ../mobile && npx tsc --noEmit"
}
```

### Backend Scripts
```json
{
  "dev": "nodemon src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "type-check": "tsc --noEmit",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate dev",
  "db:studio": "prisma studio"
}
```

### Mobile Scripts
```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "build": "expo export",
  "build:android": "eas build --platform android",
  "build:ios": "eas build --platform ios"
}
```

## 🧪 Testing Strategy

### Testing Framework Setup (Future Implementation)
```typescript
// Recommended testing stack
const testingStack = {
  unit: 'Jest + React Native Testing Library',
  integration: 'Supertest (API testing)',
  e2e: 'Detox (React Native E2E)',
  typeChecking: 'TypeScript compiler',
}
```

### Test Structure
```
__tests__/
├── backend/
│   ├── unit/              # Unit tests
│   ├── integration/       # API integration tests
│   └── fixtures/          # Test data
└── mobile/
    ├── components/        # Component tests
    ├── screens/           # Screen tests
    └── e2e/              # End-to-end tests
```

## 🚀 Deployment Guide

### Free Hosting Options

**Backend Deployment:**
```bash
# Railway (Recommended)
npm install -g @railway/cli
railway login
railway link
railway up

# Alternative: Render
# Connect GitHub repo to Render dashboard
```

**Frontend Deployment:**
```bash
# Vercel for web
npm install -g vercel
cd mobile
vercel --prod

# Mobile app stores via EAS
npm install -g @expo/eas-cli
cd mobile
eas build:configure
eas build --platform android  # or ios
```

**Database Options:**
- **Supabase** (1GB free) - Recommended
- **PlanetScale** (5GB free)
- **Railway PostgreSQL** (512MB free)

### Environment Variables for Production

**Backend (.env):**
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=your-production-secret
```

**Mobile (app.json):**
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-backend.railway.app",
      "supabaseUrl": "https://your-project.supabase.co",
      "supabaseAnonKey": "eyJ..."
    }
  }
}
```

## 🐛 Troubleshooting

### Common Development Issues

**1. "Cannot resolve entry file" Error:**
```bash
# Make sure you're in the correct directory
cd mobile              # For mobile commands
cd backend             # For backend commands

# Check your current directory
pwd                    # (Linux/Mac) or Get-Location (Windows)
```

**2. "Port already in use" Error:**
```bash
# Choose different port when prompted
? Use port 8082 instead? » Y

# Or kill existing processes
npx expo start --port 8082
```

**3. "Metro bundler cache issues":**
```bash
cd mobile
npx expo start --clear
rm -rf node_modules
npm install
```

**4. "Command not found" Errors:**
```bash
# Make sure you're in the right directory
cd mobile              # For expo commands
cd backend             # For npm run commands

# Install dependencies if missing
npm install
```

**5. TypeScript compilation errors:**
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
rm -rf dist/
npm run build
```

**6. Database connection issues:**
```bash
# Check connection (from backend directory)
cd backend
npm run db:studio

# Reset database
npm run db:push --force-reset
```

**7. Expo CLI issues:**
```bash
# Update Expo CLI
npm install -g @expo/cli@latest

# Fix dependencies
cd mobile
npx expo install --fix
```

**8. PowerShell execution policy (Windows):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Debug Modes

**Backend Debugging:**
```bash
# Enable debug logs
DEBUG=express:* npm run dev

# TypeScript watch mode
npx tsc --watch
```

**Mobile Debugging:**
```bash
# React Native debugger
npx react-devtools

# Expo debugging
npx expo start --dev-client
```

## 📚 Additional Resources

### Documentation Links
- [React Native Docs](https://reactnative.dev/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [NativeWind Documentation](https://www.nativewind.dev/)

### Learning Resources
- [React Native Tutorial](https://reactnative.dev/docs/tutorial)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)

## 🤝 Contributing Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use descriptive variable and function names
- Add JSDoc comments for complex functions

### Git Workflow
```bash
# Feature development
git checkout -b feature/swimming-analytics
git commit -m "feat: add swimming pace calculator"
git push origin feature/swimming-analytics
# Create pull request

# Bug fixes
git checkout -b fix/session-validation
git commit -m "fix: validate session duration input"
```

### Commit Message Convention
```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 🎯 Performance Optimization

### Mobile App Performance
- Use React.memo for expensive components
- Implement FlatList for large data sets
- Optimize images with Expo Image
- Use lazy loading for screens

### Backend Performance
- Implement database indexing
- Use connection pooling
- Add Redis caching layer (future)
- Optimize Prisma queries

### Bundle Size Optimization
```bash
# Analyze bundle size
cd mobile
npx expo export --dump-sourcemap
npx react-native-bundle-visualizer

# Tree shaking and dead code elimination
npm run build:analyze
```

## 🔐 Security Considerations

### Authentication Security
- JWT tokens with expiration
- Secure HTTP-only cookies (future)
- Password hashing with bcrypt
- Rate limiting for auth endpoints

### Data Protection
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS protection with helmet
- CORS configuration

### Environment Security
```bash
# Never commit .env files
echo ".env" >> .gitignore

# Use environment-specific secrets
# Rotate JWT secrets regularly
# Use HTTPS in production
```

---

## 🏊‍♀️ Swimming-Specific Features

### Workout Builder Architecture
```typescript
interface WorkoutBuilder {
  sets: number;
  reps: number;
  distance: number;
  stroke: Stroke;
  intensity: Intensity;
  restTime: number;
  description: string;
}
```

### Analytics Implementation
```typescript
interface SwimmingAnalytics {
  paceCalculation: (distance: number, time: number) => number;
  progressTracking: (sessions: Session[]) => ProgressData;
  personalBests: (workouts: Workout[]) => PersonalBest[];
  trainingLoad: (sessions: Session[]) => TrainingLoad;
}
```

This developer documentation provides a comprehensive guide for anyone working on the SwimTrainApp project. It covers everything from initial setup to advanced development patterns and deployment strategies.

Happy coding! 🏊‍♀️💻
