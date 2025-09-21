# Deploying the backend to Railway

This document explains how Railway builds and deploys the `backend/` service in this repo, and how to avoid common runtime issues.

How Railway builds
- Railway uses the repository contents and your `backend/Dockerfile` to build the Docker image.
- When you push to the branch Railway watches (e.g. `main`), Railway will trigger a build.

What to check if the container crashes with `Cannot find module '/app/index.js'`
- This error means the container started `node /app/index.js` but that path doesn't exist.
- Causes:
  - The Dockerfile built artifacts into `dist/` but the runtime tried to use a different entry path.
  - The build step (`npm run build`) failed, so the `dist/` directory wasn't created.

Fix checklist
1. Ensure `backend/Dockerfile` runs the build step and copies `dist/` into the runtime image (this repo's Dockerfile does that in a multi-stage build).
2. Ensure the production `CMD` references the correct absolute path: `/app/dist/index.js`.
3. Check Railway build logs for the `npm run build` and `prisma generate` steps. If `npm run build` failed, fix the TypeScript error then re-deploy.
4. Make sure `package.json` `start` points to `dist/index.js` and that `main` is set accordingly.

Environment variables
- The app validates the presence of these variables at startup and will `process.exit(1)` if missing:
  - DATABASE_URL
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - JWT_SECRET
- Add these in Railway Dashboard → Service → Settings → Variables before or after deploy.

Database migrations
- If you change Prisma schema, run migrations before/after deploy:
  - Use Railway's one-off command shell (or CLI) to run: `npx prisma migrate deploy`

Redeploying
- Push code to the watched branch (e.g., `main`) to automatically trigger a build on Railway.
- Or use the Railway Dashboard -> Deploys -> Redeploy to re-run the last build.

Troubleshooting
- If deploy fails, open Deploys -> view build logs. If runtime crashes, open Logs to see startup errors.
- For missing `dist/` artifacts, check the build stage logs and address compile errors locally (`npm run build`).

If you want, I can add a GitHub Action to run `npm run build` and `npm test` on PRs before merging to `main` to catch errors earlier.
