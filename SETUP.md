# SwimTrainApp - Environment Setup Guide

**📊 Setup Status: CURRENT & TESTED** ✅  
*This guide is up-to-date for the production-ready MVP v1.0*

This guide covers detailed environment setup and configuration. For quick start instructions, see [README.md](./README.md).

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** 20+ (LTS recommended)
- **npm** or **yarn** (comes with Node.js)
- **Git** for version control
- **PostgreSQL** (if using local database) or **Supabase** account
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)
- **Expo Go** app (for physical device testing)

---

## 🔧 Environment Configuration

### Backend Environment Variables

Create `backend/.env` file with the following variables:

```bash
# Database Configuration (Supabase recommended)
DATABASE_URL="postgresql://username:password@host:5432/swimtrainapp"

# JWT Configuration  
JWT_SECRET="your-super-secret-jwt-key-here-minimum-32-chars"

# Server Configuration
PORT=3000
NODE_ENV="development"

# Supabase Configuration (REQUIRED)
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

**Important**: 
- Get your `DATABASE_URL` from Supabase project settings → Database → Connection string
- Get Supabase keys from Project Settings → API
- Generate a secure JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Frontend Environment Variables

Create `mobile/.env` file:

```bash
# API Configuration
EXPO_PUBLIC_API_URL="http://localhost:3000/api"

# For production deployment, update to your Railway backend URL:
# EXPO_PUBLIC_API_URL="https://your-app.railway.app/api"

# Development Configuration
EXPO_PUBLIC_ENV="development"
```

---

## 🗄️ Database Setup Options

### Option 1: Supabase (Recommended - Free Tier Available)

**Why Supabase?**
- Free PostgreSQL database with 500MB storage
- Built-in authentication
- Real-time subscriptions
- Automatic backups
- Easy Railway integration

**Setup Steps:**

1. **Create Supabase Project:**
   - Visit [supabase.com](https://supabase.com) and sign up
   - Click "New Project"
   - Choose organization and set project name
   - Set a strong database password
   - Select region closest to your users
   - Wait for project provisioning (~2 minutes)

2. **Get Connection Details:**
   - Go to Project Settings → Database
   - Copy the **Connection string** (URI format)
   - Go to Project Settings → API
   - Copy **Project URL**, **anon public** key, and **service_role** key

3. **Configure Backend:**
   ```bash
   cd backend
   # Create .env file with your Supabase credentials
   # Use the connection string as DATABASE_URL
   ```

4. **Initialize Database:**
   ```bash
   cd backend
   npx prisma generate      # Generate Prisma client
   npx prisma db push       # Push schema to Supabase
   npx prisma studio        # Verify database (optional)
   ```

### Option 2: Local PostgreSQL

**For Development Only** - not recommended for production.

1. **Install PostgreSQL:**
   - **Windows**: Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **macOS**: `brew install postgresql@15`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL Service:**
   ```bash
   # macOS
   brew services start postgresql@15
   
   # Windows - runs automatically after install
   
   # Linux
   sudo systemctl start postgresql
   ```

3. **Create Database:**
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database and user
   CREATE DATABASE swimtrainapp;
   CREATE USER swimtrainuser WITH PASSWORD 'yourpassword';
   GRANT ALL PRIVILEGES ON DATABASE swimtrainapp TO swimtrainuser;
   \q
   ```

4. **Configure and Migrate:**
   ```bash
   cd backend
   # Update DATABASE_URL in .env:
   # DATABASE_URL="postgresql://swimtrainuser:yourpassword@localhost:5432/swimtrainapp"
   
   npx prisma generate
   npx prisma db push
   ```

---

## � Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/swimTrainApp.git
cd swimTrainApp
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Dependencies will auto-install in workspaces (backend, mobile, shared)
# Or install manually:
cd backend && npm install
cd ../mobile && npm install
cd ../shared && npm install
```

### 3. Set Up Environment Variables

```bash
# Backend
cd backend
cp .env.example .env  # If example exists, or create manually
# Edit .env with your database and Supabase credentials

# Mobile
cd mobile
cp .env.example .env  # If example exists, or create manually
# Edit .env with your API URL
```

### 4. Initialize Database

```bash
cd backend
npx prisma generate      # Generate Prisma client
npx prisma db push       # Apply schema to database
# npx prisma db seed     # Optional: Add sample data (if seed script exists)
```

### 5. Start Development Servers

```bash
# Option 1: Start everything from root
npm run dev

# Option 2: Start services individually
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Mobile/Web
cd mobile
npx expo start --web
```

---

# Reset database (development only)
npx prisma db reset
```

### Code Quality
```bash
# Type checking
cd mobile && npx tsc --noEmit
cd backend && npx tsc --noEmit

# Linting (if configured)
npm run lint

# Formatting (if configured)
npm run format
```

## 🚀 Production Deployment

### Frontend Deployment Options

**Vercel (Recommended):**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from mobile directory
cd mobile
npx expo export:web
vercel --prod
```

**Netlify:**
```bash
cd mobile
npx expo export:web
# Upload dist folder to Netlify or use CLI
```

### Backend Deployment Options

**Railway (Recommended):**
1. Connect GitHub repository to Railway
2. Set environment variables
3. Deploy automatically on push

**Render:**
1. Connect GitHub repository
2. Configure build command: `cd backend && npm install && npm run build`
3. Start command: `cd backend && npm start`

### Mobile App Distribution

**Web App (PWA):**
- Automatically available when frontend is deployed
- Users can install as Progressive Web App

**Native Apps (via EAS Build):**
```bash
cd mobile

# Install EAS CLI
npm install -g @expo/eas-cli
eas login

# Configure EAS
eas build:configure

# Build Android APK
eas build --platform android

# Build iOS (requires Apple Developer account)
eas build --platform ios --profile production
```

## 🔐 Production Environment Variables

### Backend (.env for production)
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-super-secure-production-secret"
JWT_EXPIRES_IN="7d"
SUPABASE_URL="your-supabase-project-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### Mobile (for production builds)
Update `mobile/app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-production-backend-url.com/api"
    }
  }
}
```

## � Troubleshooting

### Common Issues

**"Cannot connect to backend":**
- Check if backend is running on correct port
- Verify API_URL in mobile app
- Check network connectivity

**"Database connection failed":**
- Verify DATABASE_URL format
- Check if database server is running
- Ensure correct credentials

**"Expo app won't start":**
- Clear Expo cache: `npx expo start --clear`
- Check Node.js version (18+)
- Update Expo CLI: `npm install -g @expo/cli`

**"TypeScript errors":**
- Run `npx tsc --noEmit` to check for errors
- Generate Prisma client: `npx prisma generate`
- Clear TypeScript cache in VS Code

### Development Tips

1. **Hot Reload:** Both frontend and backend support hot reload during development
2. **API Testing:** Use tools like Postman or Insomnia to test API endpoints
3. **Database Viewing:** Use `npx prisma studio` to view/edit database records
4. **Network Testing:** Test mobile app on same WiFi network as development machine

## 📋 Prerequisites Checklist

Before starting development:
- [ ] Node.js 18+ installed
- [ ] Git installed and configured
- [ ] Code editor (VS Code recommended)
- [ ] Database choice made (Supabase or local PostgreSQL)
- [ ] Expo Go app installed on mobile device (for testing)

For iOS development:
- [ ] macOS computer
- [ ] Xcode installed
- [ ] iOS Simulator configured

For Android development:
- [ ] Android Studio installed
- [ ] Android emulator configured
- [ ] Android SDK tools available

## 🐛 Troubleshooting

### Common Issues

**Metro bundler cache issues:**
```bash
cd mobile
npx expo start --clear
```

**Database connection issues:**
- Check DATABASE_URL format
- Ensure database is running
- Check firewall/network settings

**TypeScript errors:**
```bash
# Clear TypeScript cache
rm -rf node_modules
npm install
```

**Expo issues:**
```bash
# Reset Expo cache
npx expo install --fix
```

## 📊 Monitoring

### Free Monitoring Tools
- Sentry (error tracking)
- LogRocket (user sessions)
- Google Analytics (mobile)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## 📄 License

MIT License - See LICENSE file for details.

---

**Need help?** Create an issue in the GitHub repository!
