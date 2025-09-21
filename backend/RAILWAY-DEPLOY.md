# Deploying the backend to Railway

This document contains quick steps to deploy the SwimTrainApp backend to Railway and which environment variables to set.

Prerequisites
- Install Railway CLI: `npm i -g @railway/cli`
- Have a Railway account and be logged-in via `railway login`

Quick deploy (recommended flow)

1. In the repository root run:

```powershell
Set-Location 'E:\SoftwareDevelopment\repos\swimTrainApp\backend'
railway init   # Link or create a new project
railway up     # Deploy current folder
```

2. Set environment variables in Railway dashboard or via CLI:

- DATABASE_URL - your Supabase Postgres connection string (postgresql://...)
- SUPABASE_URL - https://<your-supabase-project>.supabase.co
- SUPABASE_ANON_KEY - public anon key (used by mobile only)
- SUPABASE_SERVICE_ROLE_KEY - service role key (used by backend)
- JWT_SECRET - random secret for JWT signing
- NODE_ENV - production
- PORT - 3000 (or let Railway assign)

Using the CLI to set env vars:

```powershell
railway variables set DATABASE_URL "postgresql://..."
railway variables set SUPABASE_SERVICE_ROLE_KEY "eyJ..."
railway variables set JWT_SECRET "supersecret"
```

3. After deploy, Railway will provide a public HTTPS domain like `https://<project>.railway.app`.
Set your mobile `expo.extra.API_BASE_URL` to `https://<project>.railway.app/api` for production builds.

Notes and tips
- Make sure `DATABASE_URL` points to the same Supabase Postgres instance you used in development so users and data remain consistent.
- For small projects the default Railway plan is fine; keep an eye on connection limits.
- If you prefer GitHub integration, connect the repo in Railway dashboard and configure automatic deploys on push.
