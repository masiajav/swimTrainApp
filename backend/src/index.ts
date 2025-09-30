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
  const supabaseOrigin = process.env.SUPABASE_URL || '';
  const csp = `default-src 'self'; connect-src 'self' ${supabaseOrigin}; style-src 'self' 'unsafe-inline';`;

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Completing sign in…</title>
      <style>body{font-family:system-ui,Segoe UI,Roboto,-apple-system,Arial;margin:24px;color:#0f172a} .card{max-width:640px;margin:0 auto;background:#fff;border-radius:12px;padding:20px;box-shadow:0 6px 18px rgba(2,6,23,0.08)}</style>
    </head>
    <body>
      <div class="card">
        <h1>Completing sign in…</h1>
        <p id="desc">If you are not redirected, use the controls below.</p>
        <p><a id="open" href="#">Open app</a></p>
      </div>
      <script src="/helper.js"></script>
    </body>
  </html>`;

  // Route-specific CSP: allow connecting to Supabase auth endpoint and allow inline styles used here
  try { res.setHeader('Content-Security-Policy', csp); } catch (e) { /* ignore */ }
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Serve the helper JavaScript which will inspect the fragment and render a
// password-reset form when a Supabase recovery token is present.
app.get('/helper.js', (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnon = process.env.SUPABASE_ANON_KEY || '';
  const js = `(() => {
    const SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
    const SUPABASE_ANON_KEY = ${JSON.stringify(supabaseAnon)};

    function parseFragment() {
      var fragment = window.location.hash || '';
      if (!fragment && window.location.search) {
        var _qs = window.location.search;
        fragment = '#' + (_qs && _qs.charAt(0) === '?' ? _qs.slice(1) : _qs);
      }
      var params = new URLSearchParams(fragment.replace(/^#/, ''));
      return params;
    }

    function showMessage(msg, isError) {
      var desc = document.getElementById('desc');
      if (desc) {
        desc.textContent = msg;
        desc.style.color = isError ? 'crimson' : '';
      } else {
        alert(msg);
      }
    }

    function renderResetForm(token) {
      document.body.innerHTML = '';
      var container = document.createElement('div');
      container.style = 'font-family: system-ui, Roboto, -apple-system, Arial; padding: 24px; max-width:640px;margin:40px auto;';
      var card = document.createElement('div');
      card.style = 'background:white;border-radius:12px;padding:20px;box-shadow:0 8px 24px rgba(2,6,23,0.08)';
      var h = document.createElement('h1'); h.textContent = 'Reset your password'; card.appendChild(h);
      var p = document.createElement('p'); p.textContent = 'Enter a new password for your account.'; card.appendChild(p);

  var wrapper1 = document.createElement('div'); wrapper1.style = 'position:relative;box-sizing:border-box;width:100%;';
  var input = document.createElement('input');
  input.type = 'password';
  input.placeholder = 'New password';
  input.style = 'box-sizing:border-box;display:block;width:100%;padding:12px;padding-right:44px;margin:8px 0;border-radius:8px;border:1px solid #e6eef8;background-color:#f8fafc;color:#0f172a;';
  wrapper1.appendChild(input);
  var toggle1 = document.createElement('button');
  toggle1.type = 'button';
  toggle1.setAttribute('aria-label', 'Show password');
  toggle1.style = 'position:absolute;right:8px;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:16px;background:transparent;border:none;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#2563eb;';
  var eyeOpen = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z" stroke="#2563eb" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="#2563eb" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var eyeClosed = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94C16.03 19.22 14.06 20 12 20c-5 0-9.27-3.11-11-7 .91-2.04 2.43-3.78 4.33-5.06" stroke="#2563eb" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 1l22 22" stroke="#2563eb" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  toggle1.innerHTML = eyeOpen;
  toggle1.addEventListener('click', function(){ if (input.type === 'password') { input.type = 'text'; toggle1.innerHTML = eyeClosed; toggle1.setAttribute('aria-label','Hide password'); } else { input.type = 'password'; toggle1.innerHTML = eyeOpen; toggle1.setAttribute('aria-label','Show password'); } });
  wrapper1.appendChild(toggle1);
  card.appendChild(wrapper1);

  var wrapper2 = document.createElement('div'); wrapper2.style = 'position:relative;box-sizing:border-box;width:100%;';
  var input2 = document.createElement('input');
  input2.type = 'password';
  input2.placeholder = 'Confirm new password';
  input2.style = 'box-sizing:border-box;display:block;width:100%;padding:12px;padding-right:44px;margin:8px 0;border-radius:8px;border:1px solid #e6eef8;background-color:#fff;color:#0f172a;';
  wrapper2.appendChild(input2);
  var toggle2 = document.createElement('button');
  toggle2.type = 'button';
  toggle2.setAttribute('aria-label', 'Show confirm password');
  toggle2.style = 'position:absolute;right:8px;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:16px;background:transparent;border:none;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#2563eb;';
  toggle2.innerHTML = eyeOpen;
  toggle2.addEventListener('click', function(){ if (input2.type === 'password') { input2.type = 'text'; toggle2.innerHTML = eyeClosed; toggle2.setAttribute('aria-label','Hide confirm password'); } else { input2.type = 'password'; toggle2.innerHTML = eyeOpen; toggle2.setAttribute('aria-label','Show confirm password'); } });
  wrapper2.appendChild(toggle2);
  card.appendChild(wrapper2);

      var btn = document.createElement('button');
      btn.textContent = 'Set new password';
      btn.style = 'background:#2563eb;color:white;padding:10px 16px;border-radius:8px;border:none;margin-top:8px;font-weight:600;';
      card.appendChild(btn);

      var info = document.createElement('p'); info.style = 'margin-top:12px;color:#64748b;font-size:14px;'; card.appendChild(info);

      btn.addEventListener('click', async function(){
        var a = input.value || '';
        var b = input2.value || '';
        if (!a || a.length < 6) { info.textContent = 'Password must be at least 6 characters'; info.style.color = 'crimson'; return; }
        if (a !== b) { info.textContent = 'Passwords do not match'; info.style.color = 'crimson'; return; }
        info.textContent = 'Updating password...'; info.style.color = '';
        try {
          const resp = await fetch((SUPABASE_URL || '') + '/auth/v1/user', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token,
              'apikey': SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ password: a })
          });
          const data = await resp.json();
          if (!resp.ok) {
            console.error('Update user failed', data);
            info.textContent = data.error || 'Failed to update password'; info.style.color = 'crimson';
            return;
          }
          info.textContent = 'Password updated successfully. You can now return to the app and sign in.'; info.style.color = 'green';
          // Offer to open the app using the custom scheme
          var open = document.createElement('a'); open.textContent = 'Open app'; open.href = 'swimtrainapp://auth/callback'; open.style = 'display:inline-block;margin-top:12px;color:#2563eb;font-weight:700;'; card.appendChild(open);
        } catch (e) {
          console.error('Update error', e);
          info.textContent = 'Unexpected error updating password'; info.style.color = 'crimson';
        }
      });

      container.appendChild(card);
      document.body.appendChild(container);
    }

    try {
      const params = parseFragment();
      const type = params.get('type');
      const accessToken = params.get('access_token') || params.get('access-token') || params.get('accessToken');
      if (type === 'recovery' && accessToken) {
        renderResetForm(accessToken);
      } else {
        // Default behaviour: forward fragment to mobile app scheme
        var fragment = window.location.hash || '';
        if (!fragment && window.location.search) {
          var _qs2 = window.location.search;
          fragment = '#' + (_qs2 && _qs2.charAt(0) === '?' ? _qs2.slice(1) : _qs2);
        }
        var target = 'swimtrainapp://auth/callback' + fragment;
        // Try to open the app only on mobile user agents (avoid console errors on desktop)
        try {
          var ua = (navigator && navigator.userAgent) ? navigator.userAgent.toLowerCase() : '';
          var isMobile = /iphone|ipad|ipod|android/.test(ua);
          if (isMobile) {
            window.location.replace(target);
          }
        } catch (e) { /* ignore */ }
        var a = document.getElementById('open'); if (a) a.href = target;
      }
    } catch (e) {
      console.error('Helper script error', e);
    }
  })();`;

  res.setHeader('Content-Type', 'application/javascript');
  res.send(js);
});

// Serve a user-facing update page at /auth/update which the email can link to.
// The link in the email should be like: {{ .ConfirmationURL }}/auth/update
app.get('/auth/update', (req, res) => {
  const supabaseOrigin = process.env.SUPABASE_URL || '';
  const csp = `default-src 'self'; connect-src 'self' ${supabaseOrigin}; style-src 'self' 'unsafe-inline';`;

  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Reset Password</title>
      <style>body{font-family:system-ui,Segoe UI,Roboto,-apple-system,Arial;margin:24px;color:#0f172a} .container{max-width:640px;margin:40px auto;padding:20px;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(2,6,23,0.06)}</style>
    </head>
    <body>
      <div class="container">
        <h2>Reset Password</h2>
        <p>Follow this link to reset the password for your user:</p>
        <p><a id="updateLink" href="#">Reset Password</a></p>
        <div id="formRoot"></div>
      </div>
      <script src="/update-password.js"></script>
    </body>
  </html>`;

  // Route-specific CSP: allow connecting to Supabase auth endpoint and allow inline styles used here
  try { res.setHeader('Content-Security-Policy', csp); } catch (e) { /* ignore */ }
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Serve the update-password.js script which will read the token from the
// query string or fragment and render a password update form.
app.get('/update-password.js', (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnon = process.env.SUPABASE_ANON_KEY || '';
  const js = `(() => {
    const SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
    const SUPABASE_ANON_KEY = ${JSON.stringify(supabaseAnon)};

    function getToken() {
      // Try query params first (e.g., /auth/update?access_token=...)
      const qp = new URLSearchParams(window.location.search);
      if (qp.get('access_token')) return qp.get('access_token');
      // Then try fragment
      const frag = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
      if (frag) {
        const p = new URLSearchParams(frag);
        if (p.get('access_token')) return p.get('access_token');
      }
      return null;
    }

    function render(token) {
      const root = document.getElementById('formRoot');
      if (!root) return;
      root.innerHTML = '';
      const p = document.createElement('p'); p.textContent = 'Enter a new password below.'; root.appendChild(p);
  const wrapperA = document.createElement('div'); wrapperA.style = 'position:relative;box-sizing:border-box;width:100%;';
  const input = document.createElement('input'); input.type = 'password'; input.placeholder = 'New password'; input.style = 'box-sizing:border-box;display:block;width:100%;padding:10px;padding-right:44px;margin:8px 0;border-radius:8px;border:1px solid #e6eef8;background-color:#f8fafc;color:#0f172a;'; wrapperA.appendChild(input);
  const toggleA = document.createElement('button'); toggleA.type = 'button'; toggleA.setAttribute('aria-label','Show password'); toggleA.style = 'position:absolute;right:8px;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:16px;background:transparent;border:none;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#2563eb;'; const eyeOpenA = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z" stroke="#2563eb" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="#2563eb" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'; const eyeClosedA = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.94 17.94C16.03 19.22 14.06 20 12 20c-5 0-9.27-3.11-11-7 .91-2.04 2.43-3.78 4.33-5.06" stroke="#2563eb" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 1l22 22" stroke="#2563eb" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'; toggleA.innerHTML = eyeOpenA; toggleA.addEventListener('click', () => { if (input.type === 'password') { input.type = 'text'; toggleA.innerHTML = eyeClosedA; toggleA.setAttribute('aria-label','Hide password'); } else { input.type = 'password'; toggleA.innerHTML = eyeOpenA; toggleA.setAttribute('aria-label','Show password'); } }); wrapperA.appendChild(toggleA);
  root.appendChild(wrapperA);

  const wrapperB = document.createElement('div'); wrapperB.style = 'position:relative;box-sizing:border-box;width:100%;';
  const input2 = document.createElement('input'); input2.type = 'password'; input2.placeholder = 'Confirm password'; input2.style = 'box-sizing:border-box;display:block;width:100%;padding:10px;padding-right:44px;margin:8px 0;border-radius:8px;border:1px solid #e6eef8;background-color:#fff;color:#0f172a;'; wrapperB.appendChild(input2);
  const toggleB = document.createElement('button'); toggleB.type = 'button'; toggleB.setAttribute('aria-label','Show confirm password'); toggleB.style = 'position:absolute;right:8px;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:16px;background:transparent;border:none;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#2563eb;'; toggleB.innerHTML = eyeOpenA; toggleB.addEventListener('click', () => { if (input2.type === 'password') { input2.type = 'text'; toggleB.innerHTML = eyeClosedA; toggleB.setAttribute('aria-label','Hide confirm password'); } else { input2.type = 'password'; toggleB.innerHTML = eyeOpenA; toggleB.setAttribute('aria-label','Show confirm password'); } }); wrapperB.appendChild(toggleB);
  root.appendChild(wrapperB);
      const btn = document.createElement('button'); btn.textContent = 'Update password'; btn.style = 'background:#2563eb;color:white;padding:10px 16px;border-radius:8px;border:none;margin-top:8px;font-weight:600;'; root.appendChild(btn);
      const msg = document.createElement('div'); msg.style = 'margin-top:12px;color:#64748b'; root.appendChild(msg);

      btn.addEventListener('click', async () => {
        const a = input.value || '';
        const b = input2.value || '';
        if (a.length < 6) { msg.textContent = 'Password must be at least 6 characters'; msg.style.color = 'crimson'; return; }
        if (a !== b) { msg.textContent = 'Passwords do not match'; msg.style.color = 'crimson'; return; }
        msg.textContent = 'Updating password...'; msg.style.color = '';
        try {
          const resp = await fetch((SUPABASE_URL || '') + '/auth/v1/user', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token,
              'apikey': SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ password: a })
          });
          const data = await resp.json();
          if (!resp.ok) {
            msg.textContent = data.error || 'Failed to update password'; msg.style.color = 'crimson'; console.error('Update failed', data); return;
          }
          msg.textContent = 'Password updated successfully. You can now sign in.'; msg.style.color = 'green';
        } catch (e) {
          console.error('Update error', e);
          msg.textContent = 'Unexpected error'; msg.style.color = 'crimson';
        }
      });
    }

    try {
      const token = getToken();
      const link = document.getElementById('updateLink');
      if (link) {
        // If the token is present in the fragment (e.g., #access_token=...), preserve the fragment when opening
        link.href = window.location.href;
      }
      if (token) {
        render(token);
      } else {
        const root = document.getElementById('formRoot'); if (root) root.innerHTML = '<p>No recovery token found. Please use the link from your email.</p>';
      }
    } catch (e) { console.error(e); }
  })();`;

  res.setHeader('Content-Type', 'application/javascript');
  res.send(js);
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

// Handle server 'error' events (for example EADDRINUSE when the port is already taken)
server.on('error', (err: any) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Another process may be running.`);
    console.error('If you started the server previously, stop it or change PORT. Exiting.');
    process.exit(1);
  }
  console.error('Server error', err);
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
