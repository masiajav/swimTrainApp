# SwimTrainApp - Environment Setup Guide

**📊 Setup Status: CURRENT & TESTED** ✅  
*This guide is up-to-date for the production-ready v1.0 release*

This guide covers detailed environment setup and configuration. For quick start instructions, see [README.md](./README.md).

## 🔧 Environment Configuration

### Backend Environment Variables

Create `backend/.env` file with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/swimtrainapp"

# JWT Configuration  
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="development"

# Supabase Configuration (if using Supabase)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

### Frontend Environment Variables

Create `mobile/.env` file:

```bash
# API Configuration
EXPO_PUBLIC_API_URL="http://localhost:3000/api"

# Development Configuration
EXPO_PUBLIC_ENV="development"
```

## 🗄️ Database Setup Options

### Option 1: Supabase (Recommended - Free Tier)

1. **Create Supabase Project:**
   - Visit [supabase.com](https://supabase.com)
   - Create new project
   - Note the Project URL and anon key

2. **Configure Backend:**
   ```bash
   cd backend
   # Add Supabase credentials to .env
   # DATABASE_URL should use the connection string from Supabase
   ```

3. **Initialize Database:**
   ```bash
   npm run db:push
   npm run db:seed  # Optional: seed with sample data
   ```

### Option 2: Local PostgreSQL

1. **Install PostgreSQL:**
   - Windows: Download from postgresql.org
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database:**
   ```sql
   createdb swimtrainapp
   # Or via SQL: CREATE DATABASE swimtrainapp;
   ```

3. **Configure and Migrate:**
   ```bash
   cd backend
   # Update DATABASE_URL in .env to point to local DB
   npm run db:migrate
   ```

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start with hot reload
npm run type-check   # Type checking
npm run db:studio    # Database GUI
```

### Mobile Development
```bash
cd mobile
npx expo start       # Start Expo dev server
npx tsc --noEmit    # Type checking
```

## 📦 Building for Production

## 📱 Platform-Specific Development

### Web Development
```bash
cd mobile
npx expo start --web
# Access at http://localhost:8081
```

### iOS Development (macOS only)
```bash
cd mobile
npx expo start --ios
# Requires Xcode and iOS Simulator
```

### Android Development
```bash
cd mobile
npx expo start --android
# Requires Android Studio and emulator
```

### Physical Device Testing
1. Install **Expo Go** from App Store/Google Play
2. Run `npx expo start` in mobile directory
3. Scan QR code with Expo Go app

## 🔧 Development Workflow

### Database Management
```bash
cd backend

# Generate Prisma client after schema changes
npx prisma generate

# Apply schema changes to database
npx prisma db push

# View database in browser
npx prisma studio

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
