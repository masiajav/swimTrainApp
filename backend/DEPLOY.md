# Backend Deployment Guide

This guide covers general backend deployment strategies for SwimTrainApp. For Railway-specific instructions, see [RAILWAY-DEPLOY.md](./RAILWAY-DEPLOY.md).

---

## 🚀 Deployment Options

### Railway (Recommended)
See [RAILWAY-DEPLOY.md](./RAILWAY-DEPLOY.md) for complete Railway deployment guide.

**Quick Start:**
```bash
cd backend
railway init
railway variables set DATABASE_URL "postgresql://..."
railway variables set SUPABASE_SERVICE_ROLE_KEY "eyJ..."
railway variables set JWT_SECRET "yoursecret"
railway up
```

### Docker Deployment

**Build Docker Image:**
```bash
cd backend
docker build -t swimtrainapp-backend .
```

**Run Container:**
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e SUPABASE_URL="https://..." \
  -e SUPABASE_SERVICE_ROLE_KEY="..." \
  -e JWT_SECRET="..." \
  -e NODE_ENV="production" \
  --name swimtrainapp-backend \
  swimtrainapp-backend
```

### Manual Deployment (VPS/Cloud)

**Prerequisites:**
- Node.js 20+ installed
- PostgreSQL access (Supabase recommended)

**Build and Start:**
```bash
cd backend

# Install dependencies
npm install --production

# Generate Prisma client
npx prisma generate

# Build TypeScript
npm run build

# Start production server
npm run start
```

**Using PM2 (Process Manager):**
```bash
npm install -g pm2

# Start with PM2
pm2 start dist/index.js --name swimtrainapp-backend

# Configure auto-restart on boot
pm2 startup
pm2 save
```

---

## 🔑 Required Environment Variables

All deployment methods require these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `JWT_SECRET` | ✅ | Secret for JWT signing (32+ chars) |
| `NODE_ENV` | ✅ | Set to `production` |
| `PORT` | ⚠️ | Server port (default: 3000) |

**The application will validate these variables at startup and exit if any are missing.**

---

## 🏗️ Build Process

### TypeScript Compilation

The backend uses TypeScript and must be compiled before deployment:

```bash
npm run build
```

This compiles TypeScript files from `src/` to JavaScript in `dist/`:
```
backend/
├── src/
│   ├── index.ts
│   ├── routes/
│   └── middleware/
└── dist/            # Compiled output
    ├── index.js
    ├── routes/
    └── middleware/
```

### Prisma Client Generation

Prisma client must be generated after schema changes:

```bash
npx prisma generate
```

This is automatically run during `npm install` via the `postinstall` script.

---

## 🗄️ Database Migrations

### Production Migrations

**Apply pending migrations:**
```bash
npx prisma migrate deploy
```

**Check migration status:**
```bash
npx prisma migrate status
```

### Schema Changes

When updating `schema.prisma`:

1. **Development:**
   ```bash
   npx prisma db push  # Quick prototyping
   ```

2. **Production:**
   ```bash
   npx prisma migrate dev --name describe_change
   npx prisma migrate deploy  # On production
   ```

---

## 🐛 Troubleshooting

### "Cannot find module '/app/index.js'"

**Cause:** Build artifacts not created or wrong entry path

**Solution:**
1. Verify `npm run build` completed successfully
2. Check `dist/` directory exists with `index.js`
3. Ensure Dockerfile copies `dist/` correctly
4. Verify `package.json` `start` script: `"start": "node dist/index.js"`

```bash
# Test build locally
npm run build
ls dist/  # Should show index.js and subdirectories
node dist/index.js  # Should start server
```

### Build Failures

**TypeScript Errors:**
```bash
# Check for TypeScript errors
npm run type-check
# or
npx tsc --noEmit
```

**Missing Dependencies:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Runtime Crashes

**Missing Environment Variables:**
- App exits with error listing missing variables
- Set all required environment variables
- Check spelling and formatting

**Database Connection Fails:**
```bash
# Test database connection locally
npx prisma db pull  # Should connect successfully

# Verify DATABASE_URL format:
# postgresql://user:password@host:5432/database
```

**Prisma Client Not Generated:**
```bash
# Regenerate Prisma client
npx prisma generate

# Rebuild and restart
npm run build
npm run start
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different PORT
export PORT=3001  # Unix
$env:PORT=3001  # PowerShell
```

---

## ✅ Health Checks

### Test Deployment

**Health Endpoint:**
```bash
curl https://your-domain.com/health
# Expected: {"status":"OK","message":"SwimTrainApp API is running!"}
```

**API Test:**
```bash
# Test registration
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"password123"}'
```

### Monitoring

**Check Logs:**
```bash
# Railway
railway logs --follow

# PM2
pm2 logs swimtrainapp-backend

# Docker
docker logs -f swimtrainapp-backend
```

**Monitor Performance:**
- CPU and memory usage
- Database connection pool
- API response times
- Error rates

---

## 🔄 Continuous Deployment

### GitHub Actions Example

`.github/workflows/deploy.yml`:
```yaml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        working-directory: backend
        run: npm ci
      
      - name: Build
        working-directory: backend
        run: npm run build
      
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🔐 Security Best Practices

1. **Environment Variables:** Never commit `.env` files
2. **Secrets:** Use secure secret management (Railway variables, Docker secrets)
3. **HTTPS:** Always use HTTPS in production
4. **CORS:** Configure CORS to allow only your frontend domain
5. **Dependencies:** Keep dependencies updated: `npm audit fix`
6. **JWT Secret:** Use strong, random secrets (32+ characters)
7. **Database:** Use connection pooling and parameterized queries
8. **Logging:** Don't log sensitive data (passwords, tokens)

---

## 📚 Additional Resources

- [RAILWAY-DEPLOY.md](./RAILWAY-DEPLOY.md) - Railway-specific deployment guide
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Deployment](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**Need Help?**
- Check [SETUP.md](../SETUP.md) for local development
- Review [DEVELOPER.md](../DEVELOPER.md) for architecture details
- See Railway logs for deployment errors

