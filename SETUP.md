# SwimTrainApp Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd swimTrainApp
```

2. **Install dependencies for all projects:**
```bash
npm run install:all
```

3. **Set up environment variables:**

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development servers:**
```bash
# Start both backend and mobile app
npm run dev

# Or start individually:
# Backend only
npm run dev:backend

# Mobile app only  
npm run dev:mobile
```

## 📱 Mobile App Setup

### Running on Different Platforms

**Web Browser:**
```bash
cd mobile
npx expo start --web
```

**iOS Simulator (macOS only):**
```bash
cd mobile
npx expo start --ios
```

**Android Emulator:**
```bash
cd mobile
npx expo start --android
```

**Physical Device:**
1. Install Expo Go app from App Store/Google Play
2. Scan QR code from Expo development server

## 🗄️ Database Setup

### Option 1: Supabase (Recommended - Free)

1. **Create Supabase account:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project

2. **Get credentials:**
   - Copy Project URL and anon key
   - Add to backend/.env file

3. **Setup database:**
```bash
cd backend
npm run db:push
```

### Option 2: Local PostgreSQL

1. **Install PostgreSQL**
2. **Create database:**
```sql
CREATE DATABASE swimtrainapp;
```
3. **Update DATABASE_URL in .env**
4. **Run migrations:**
```bash
cd backend
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

### Mobile App
```bash
cd mobile
npm run build        # Web build
# For mobile builds, set up EAS Build (Expo Application Services)
```

### Backend
```bash
cd backend
npm run build        # TypeScript compilation
npm start           # Run production build
```

## 🚀 Deployment

### Free Hosting Options

**Frontend (Mobile Web):**
- Vercel
- Netlify
- GitHub Pages

**Backend:**
- Railway (recommended)
- Render
- Heroku (limited free tier)

**Database:**
- Supabase (1GB free)
- PlanetScale (5GB free)

### Deployment Commands

**Railway (Backend):**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

**Vercel (Frontend):**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd mobile
vercel --prod
```

## 🔐 Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=your_postgresql_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
JWT_SECRET=your_secure_secret
```

### Mobile (app.json/expo.json)
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-backend-url.com"
    }
  }
}
```

## 📱 Mobile App Distribution

### Expo Application Services (EAS)

1. **Install EAS CLI:**
```bash
npm install -g @expo/eas-cli
```

2. **Configure EAS:**
```bash
cd mobile
eas build:configure
```

3. **Build for stores:**
```bash
# Android APK
eas build --platform android

# iOS (requires Apple Developer account)
eas build --platform ios
```

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
