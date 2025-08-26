# SwimTrainApp - Developer Documentation 🏊‍♀️

A comprehensive guide for developers working on the SwimTrainApp project.

## 🏗️ Project Architecture

### Overview
SwimTrainApp is a full-stack application built with a modern, scalable architecture designed for cross-platform mobile and web deployment.

```
swimTrainApp/
├── mobile/              # React Native Expo app (Frontend)
├── backend/             # Node.js Express API (Backend)
├── shared/              # Shared TypeScript types
└── docs/               # Project documentation
```

### Technology Stack

#### Frontend (Mobile & Web)
- **React Native 0.73** - Cross-platform framework
- **Expo SDK 50** - Development platform and tooling
- **TypeScript 5.3** - Type safety and developer experience
- **Expo Router 3.4** - File-based routing system
- **NativeWind 2.0** - Tailwind CSS for React Native
- **Zustand 4.4** - State management (lightweight Redux alternative)
- **Supabase JS 2.38** - Authentication and real-time features

#### Backend (API)
- **Node.js 20+** - JavaScript runtime
- **Express 4.18** - Web application framework
- **TypeScript 5.2** - Type-safe backend development
- **Prisma 5.6** - Database ORM and query builder
- **PostgreSQL** - Primary database
- **Supabase** - Authentication and real-time backend
- **Zod 3.22** - Runtime type validation
- **JWT** - Token-based authentication

#### Development Tools
- **Concurrently** - Run multiple commands simultaneously
- **Nodemon** - Backend hot reload
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🛠️ Development Environment Setup

### Prerequisites
```bash
# Required software
Node.js 18+             # JavaScript runtime
npm 9+ or yarn 1.22+    # Package manager
Git 2.40+              # Version control
```

### Optional but Recommended
```bash
# Mobile development
Android Studio         # Android emulator
Xcode (macOS only)     # iOS simulator
Expo Go app            # Physical device testing

# Database tools
PostgreSQL 15+         # Local database (optional with Supabase)
Docker                 # Containerization (optional)
```

### Initial Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd swimTrainApp

# Install all dependencies
npm run install:all

# Or install individually
cd backend && npm install
cd ../mobile && npm install
cd ../shared && npm install
```

2. **Environment Configuration**
```bash
# Backend environment
cd backend
cp .env.example .env

# Configure your .env file:
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/swimtrainapp"
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_very_secure_jwt_secret_key_here
```

3. **Database Setup**
```bash
cd backend

# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## 🚀 Development Workflow

### Starting Development Servers

**All services at once:**
```bash
npm run dev
```

**Individual services:**
```bash
# Backend only (port 3000)
npm run dev:backend

# Mobile app only
npm run dev:mobile
```

### Mobile Development

**Platform-specific commands:**
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

**1. Metro bundler cache issues:**
```bash
cd mobile
npx expo start --clear
rm -rf node_modules
npm install
```

**2. TypeScript compilation errors:**
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
rm -rf dist/
npm run build
```

**3. Database connection issues:**
```bash
# Check connection
npm run db:studio

# Reset database
npm run db:push --force-reset
```

**4. Expo CLI issues:**
```bash
# Update Expo CLI
npm install -g @expo/cli@latest

# Fix dependencies
npx expo install --fix
```

**5. PowerShell execution policy (Windows):**
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
