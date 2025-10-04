# SwimTrainApp 🏊‍♀️

A comprehensive swimming training tracker for teams and individual swimmers.

## 🚀 Current Status: **MVP v1.0 - Production Ready**

SwimTrainApp is a fully functional swimming training application with all core features implemented and tested.

**Platform Support:**
- ✅ **Android**: Fully functional and tested on emulators and physical devices
- ⚠️ **iOS**: Not yet tested (pending verification)
- ✅ **Web**: Functional as PWA (Progressive Web App)
- ✅ **Backend**: Deployed on Railway with PostgreSQL (Supabase)

**Authentication:**
- ✅ Email/Password authentication (fully implemented)
- ⚠️ Google OAuth (deferred for MVP - disabled in mobile UI due to redirect behavior inconsistencies)

Please see [SETUP.md](SETUP.md) for detailed setup instructions and [DEVELOPER.md](DEVELOPER.md) for development guidelines.

### ✅ **Completed Features (100% Functional)**

#### Core Functionality
- ✅ **User Authentication**: Email/password registration and login with JWT tokens
- ✅ **Dashboard**: Real-time session overview with comprehensive statistics
- ✅ **Session Management**: Full CRUD operations for training sessions
- ✅ **Session Details**: View session with all metadata (type, stroke, intensity, distance, duration)
- ✅ **Session Editing**: Edit and update existing training sessions
- ✅ **User Profile**: Complete profile management with avatar upload and statistics
- ✅ **Settings**: App preferences including dark/light theme toggle

#### 🏊‍♀️ **Swimming-Specific Features**
- ✅ **Workout Types**: WARMUP, MAIN_SET, COOLDOWN, TECHNIQUE, SPRINT, ENDURANCE, KICK, PULL
- ✅ **Stroke Tracking**: FREESTYLE, BACKSTROKE, BREASTSTROKE, BUTTERFLY, INDIVIDUAL_MEDLEY, MIXED
- ✅ **Intensity Levels**: EASY, MODERATE, HARD, RACE_PACE, RECOVERY
- ✅ **Distance & Duration**: Track meters/yards and time for each session
- ✅ **Session Statistics**: Total distance, time, and session count

#### 👥 **Team Features**
- ✅ **Team Creation**: Create and manage swimming teams with unique invite codes
- ✅ **Team Joining**: Join teams using invite codes
- ✅ **Team Member Roles**: MEMBER, COACH, CAPTAIN, ADMIN with role-based permissions
- ✅ **Team Statistics**: View team performance metrics
- ✅ **Team Member Profiles**: View other members' profiles and session history
- ✅ **Team Sessions**: View shared team training sessions

## 🛠️ Technology Stack

### Frontend (Mobile & Web)
- **React Native** 0.79.5 - Cross-platform mobile and web app
- **Expo SDK** 53.0 - Development platform and tools
- **TypeScript** 5.8 - Type safety and better development experience
- **Expo Router** 5.1 - File-based routing system
- **NativeWind** 4.0 - Tailwind CSS for React Native styling
- **AsyncStorage** - Local data persistence
- **Zustand** - State management

### Backend
- **Node.js** with **Express** 4.18 - RESTful API server
- **TypeScript** 5.2 - Type-safe backend development
- **Prisma ORM** 5.6 - Database management and migrations
- **PostgreSQL** - Primary database (hosted on Supabase)
- **JWT Authentication** - Secure token-based auth
- **bcrypt** - Password hashing
- **Supabase Auth** - Authentication service

### Database & Storage
- **Supabase** - PostgreSQL database hosting and authentication
- **Prisma** - Database schema management and queries
- **Railway** - Backend deployment platform

## 📁 Project Overview

```
swimTrainApp/
├── mobile/      # 📱 React Native app (iOS/Android/Web)
├── backend/     # ⚙️ Node.js Express API  
├── shared/      # 📦 Shared TypeScript types
└── docs/        # 📖 Documentation
```

*For detailed project structure, see [DEVELOPER.md](./DEVELOPER.md)*

## 🏃‍♂️ Quick Start

```bash
# 1. Clone and install dependencies
git clone <your-repo>
cd swimTrainApp
npm install

# 2. Set up environment variables (see SETUP.md)
cd backend
cp .env.example .env  # Edit with your credentials

# 3. Start backend API
npm run dev

# 4. In a new terminal, start mobile/web app  
cd mobile
npx expo start --web
```

**🌐 Access Points:**
- **Web**: http://localhost:8081
- **API**: http://localhost:3000  
- **Mobile**: Scan QR code with Expo Go app

*For detailed setup instructions and environment configuration, see [SETUP.md](./SETUP.md)*

## 📱 Supported Platforms

- **Android** - Native Android app via Expo (✅ Tested)
- **iOS** - Native iOS app via Expo (⚠️ Not tested)
- **Web** - Progressive Web App (✅ Functional)
- **Desktop** - Web app can be installed as PWA

## 🚀 Deployment

### Backend (Railway)
```bash
# Deploy backend to Railway
cd backend
npm run build
npm run start
```

Environment variables required:
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service key
- `JWT_SECRET` - Secret for JWT token signing

See [backend/RAILWAY-DEPLOY.md](backend/RAILWAY-DEPLOY.md) for detailed deployment instructions.

### Mobile (EAS Build)
```bash
# Build for Android/iOS
cd mobile
eas build --platform android  # or ios
```

See [SETUP.md](SETUP.md) for EAS Build configuration.

## 🔐 Authentication

The app includes a complete authentication system:
- User registration with email validation
- Secure login with JWT tokens (7-day expiration)
- Password hashing with bcrypt
- Protected routes and API endpoints
- Supabase Auth integration for OAuth (Google deferred for MVP)

## 📊 Database Schema

The app uses Prisma ORM with PostgreSQL. Key models:
- **User**: User accounts with profile data and team membership
- **Team**: Swimming teams with invite codes and member management
- **Session**: Training sessions with workout details
- **Workout**: Individual workout components within sessions

See [backend/prisma/schema.prisma](backend/prisma/schema.prisma) for full schema.

## 🧪 Local Android Signing (Optional)

If you want to build and sign an Android App Bundle locally:

```powershell
# Copy the example gradle properties template
copy mobile\android\gradle.properties.example mobile\android\gradle.properties

# Edit mobile\android\gradle.properties and set your keystore path and passwords
```

⚠️ **Important**: Do NOT commit `android/gradle.properties` — it contains sensitive signing credentials.

## 📖 Documentation

- [DEVELOPER.md](DEVELOPER.md) - Comprehensive development guide with architecture details
- [SETUP.md](SETUP.md) - Environment setup and configuration
- [ROADMAP.md](ROADMAP.md) - Feature roadmap and future plans
- [TEAM_IMPLEMENTATION.md](TEAM_IMPLEMENTATION.md) - Team feature implementation details
- [backend/RAILWAY-DEPLOY.md](backend/RAILWAY-DEPLOY.md) - Railway deployment guide

## 🤝 Contributing

This project is actively maintained. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with React Native and Expo
- Database hosting by Supabase
- Backend deployment on Railway
- Icons by Expo Ionicons

---

Made with ❤️ for swimmers around the world 🏊‍♀️🏊‍♂️
