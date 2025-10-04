# Deploying SwimTrainApp Backend to Railway

This guide covers deploying the SwimTrainApp Express backend to Railway with proper configuration.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- **Railway Account**: Sign up at [railway.app](https://railway.app)
- **Railway CLI** (optional but recommended): `npm install -g @railway/cli`
- **Supabase Project**: With PostgreSQL database set up
- **Environment Variables**: All required credentials ready

---

## 🚀 Deployment Options

### Option 1: Railway CLI Deployment (Recommended)

**Step 1: Install and Login**
```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Login to Railway
railway login
```

**Step 2: Initialize Project**
```bash
# Navigate to backend directory
cd backend

# Initialize Railway project (creates new or links existing)
railway init

# Follow prompts to select or create project
```

**Step 3: Set Environment Variables**

Set all required environment variables via CLI:

```bash
# Database Configuration
railway variables set DATABASE_URL "postgresql://user:pass@host:5432/dbname"

# Supabase Configuration
railway variables set SUPABASE_URL "https://your-project.supabase.co"
railway variables set SUPABASE_ANON_KEY "your-anon-key"
railway variables set SUPABASE_SERVICE_ROLE_KEY "your-service-role-key"

# JWT Configuration
railway variables set JWT_SECRET "your-super-secret-jwt-key-min-32-chars"

# Server Configuration
railway variables set NODE_ENV "production"
railway variables set PORT "3000"
```

**Step 4: Deploy**
```bash
# Deploy from backend directory
railway up

# Railway will build and deploy your backend
# You'll receive a public URL like: https://your-app.railway.app
```

### Option 2: Railway Dashboard Deployment

**Step 1: Create New Project**
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo" or "Empty Project"

**Step 2: Connect Repository** (if using GitHub)
1. Select your GitHub repository
2. Choose the `backend` directory as root path
3. Railway will auto-detect Node.js project

**Step 3: Set Environment Variables**
1. Go to Project → Variables
2. Click "New Variable" and add:
   - `DATABASE_URL` - Supabase connection string
   - `SUPABASE_URL` - Supabase project URL
   - `SUPABASE_ANON_KEY` - Public anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key
   - `JWT_SECRET` - Random secret (32+ chars)
   - `NODE_ENV` - `production`
   - `PORT` - `3000`

**Step 4: Configure Build Settings**
1. Go to Settings → Build
2. Set build command: `npm run build` (or `npm install && npm run build`)
3. Set start command: `npm run start`
4. Set root directory: `/backend` (if deploying from monorepo)

**Step 5: Deploy**
- Click "Deploy" or push to connected branch
- Railway will build and deploy automatically

### Option 3: Deploy from Monorepo Root

If deploying the entire monorepo with the runtime shim:

```bash
# From repository root
railway init

# Set environment variables as above

# Deploy (uses root-level build scripts)
railway up
```

**Required Scripts** (already in root `package.json`):
```json
{
  "scripts": {
    "build:backend": "cd backend && npm run build",
    "start:backend": "cd backend && npm run start"
  }
}
```

Railway will use the runtime shim (`index.js` in root) to load the backend.

---

## 🔑 Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string from Supabase | `postgresql://user:pass@host:5432/db` |
| `SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase public anon key | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (backend only) | `eyJhbG...` |
| `JWT_SECRET` | Secret for JWT token signing (min 32 chars) | Generate with `openssl rand -hex 32` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (Railway auto-assigns if omitted) | `3000` |

**Getting Supabase Credentials:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy **Project URL**, **anon public**, and **service_role** keys
4. Navigate to **Settings** → **Database**
5. Copy the **Connection string** (URI format) for `DATABASE_URL`

**Generating JWT Secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

---

## 🔗 Configure Mobile App

After deployment, update your mobile app to use the Railway backend:

**Update `mobile/.env`:**
```bash
# Replace with your Railway URL
EXPO_PUBLIC_API_URL="https://your-app.railway.app/api"
```

**For Production Builds:**
```bash
# Rebuild app with production API URL
cd mobile
eas build --platform android  # or ios
```

---

## ✅ Verify Deployment

**Test Health Endpoint:**
```bash
curl https://your-app.railway.app/health

# Expected response:
# {"status":"OK","message":"SwimTrainApp API is running!"}
```

**Test API Endpoint:**
```bash
# Register a test user
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
```

---

## 🛠️ Troubleshooting

### Build Fails

**Check build logs:**
```bash
railway logs --build
```

**Common Issues:**
- Missing `build` script in `package.json`
- TypeScript compilation errors
- Missing dependencies

**Solution:**
```bash
# Test build locally first
cd backend
npm run build

# Check for TypeScript errors
npm run type-check
```

### Runtime Errors

**Check runtime logs:**
```bash
railway logs
```

**Common Issues:**
- Missing environment variables
- Database connection failures
- Port binding issues

**Solution:**
- Verify all environment variables are set
- Test DATABASE_URL connection string locally
- Ensure PORT is not hardcoded (use `process.env.PORT || 3000`)

### Database Connection Issues

**Error**: `P1001: Can't reach database server`

**Solution:**
- Verify DATABASE_URL is correct
- Check Supabase database is running
- Ensure Supabase allows connections from Railway IPs
- Test connection locally with same DATABASE_URL

### Authentication Errors

**Error**: `Invalid Supabase credentials`

**Solution:**
- Verify SUPABASE_SERVICE_ROLE_KEY is correct (not anon key)
- Check SUPABASE_URL matches your project
- Regenerate keys in Supabase dashboard if needed

---

## 🔄 Continuous Deployment

### GitHub Integration (Recommended)

**Setup:**
1. Connect GitHub repository in Railway dashboard
2. Select branch (e.g., `main` or `production`)
3. Railway will auto-deploy on every push

**Branch-based Environments:**
- `main` branch → Production environment
- `develop` branch → Staging environment

### Manual Deployment

**Redeploy Current Version:**
```bash
railway up
```

**Deploy Specific Commit:**
```bash
railway up --detach
```

---

## 📊 Monitoring & Logs

**View Live Logs:**
```bash
railway logs --follow
```

**View Recent Logs:**
```bash
railway logs
```

**Monitor in Dashboard:**
- Go to Project → Deployments
- View metrics: CPU, Memory, Network
- Check deployment history and rollback if needed

---

## 💰 Cost Optimization

**Railway Free Tier:**
- $5 free credit per month
- Suitable for MVP and low-traffic apps
- Monitor usage in dashboard

**Tips to Reduce Costs:**
- Use Supabase free tier (500MB database)
- Optimize database queries
- Implement caching where appropriate
- Monitor connection pooling
- Set up automatic sleep for dev environments

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Use Railway variables
2. **Rotate JWT_SECRET** periodically
3. **Use strong DATABASE_URL passwords**
4. **Enable CORS** only for your mobile app domain
5. **Keep dependencies updated**: `npm audit fix`
6. **Use HTTPS** only (Railway provides this automatically)
7. **Monitor logs** for suspicious activity

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

**Need Help?**
- Check Railway [Community Forum](https://help.railway.app/)
- Review [DEVELOPER.md](../DEVELOPER.md) for project architecture
- See [SETUP.md](../SETUP.md) for local development setup

