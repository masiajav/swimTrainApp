# SwimTrainApp 🏊‍♀️

A free and open-source swimming training tracker for mobile and web platforms.

## 🚀 Features

- Track swimming sessions and workouts
- Share training sessions with your team
- Cross-platform (iOS, Android, Web)
- Real-time updates
- Progress analytics
- Team collaboration

## 🛠️ Technology Stack

### Frontend (Mobile & Web)
- **React Native with Expo** - Cross-platform mobile and web app
- **TypeScript** - Type safety and better development experience
- **Expo Router** - File-based routing
- **NativeWind** - Tailwind CSS for React Native

### Backend
- **Node.js with Express** - RESTful API server
- **TypeScript** - Type-safe backend development
- **Prisma** - Database ORM
- **PostgreSQL** - Database

### Authentication & Storage
- **Supabase** - Open-source Firebase alternative
  - Authentication
  - Real-time database
  - File storage

### Hosting (Free Tiers)
- **Frontend**: Vercel/Netlify
- **Backend**: Railway/Render
- **Database**: Supabase

## 📁 Project Structure

```
swimTrainApp/
├── mobile/          # React Native Expo app
├── backend/         # Node.js Express API
├── shared/          # Shared types and utilities
└── docs/           # Documentation
```

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI

### Setup

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd swimTrainApp
npm install
```

2. **Setup Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

3. **Setup Mobile App:**
```bash
cd mobile
npm install
npx expo start
```

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines.

## 📄 License

MIT License - completely free and open-source!
