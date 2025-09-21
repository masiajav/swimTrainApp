import dotenv from 'dotenv';

// Load environment variables VERY early so any imported modules that read process.env
// (for example route modules that create a Supabase client at module import time)
// have the variables available.
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';

// Import routes (after dotenv.config())
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import sessionRoutes from './routes/sessions';
import workoutRoutes from './routes/workouts';
import teamRoutes from './routes/teams';

// Validate required environment variables early to provide clear errors in CI/deploy
const requiredEnv = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

const missing = requiredEnv.filter((n) => !process.env[n]);
if (missing.length > 0) {
  console.error('Missing required environment variables:', missing.join(', '));
  // Exit so the container will fail fast and Railway shows the reason
  process.exit(1);
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'SwimTrainApp API is running!' });
});

// Root redirect helper
// When third-party providers redirect to the configured site URL (for example
// http://localhost:3000) they may include the OAuth result in the fragment
// (location.hash) which is not sent to the server. Serve a tiny HTML page that
// forwards the fragment or query string to the app custom scheme so the mobile
// app can complete authentication.
app.get('/', (req, res) => {
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Completing sign in…</title>
    </head>
    <body>
      <p>Completing sign in… If you are not redirected, <a id="open">open app</a>.</p>
      <script>
        (function(){
          try {
            // If the provider placed data in the fragment (#...), forward it.
            var fragment = window.location.hash || '';
            // If there is no fragment but query string contains data, convert it to a fragment
            if (!fragment && window.location.search) {
              fragment = '#' + window.location.search.replace(/^\?/, '');
            }
            var target = 'swimtrainapp://auth/callback' + fragment;
            // Try to open the app by setting location.href
            window.location.replace(target);
            // Also set the anchor for manual fallback
            var a = document.getElementById('open');
            if (a) a.href = target;
          } catch (e) {
            console.error('Redirect helper error', e);
          }
        })();
      </script>
    </body>
  </html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/teams', teamRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🏊‍♀️ SwimTrainApp API running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
  await prisma.$disconnect();
});

export default app;
