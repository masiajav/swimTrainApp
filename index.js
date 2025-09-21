// Runtime shim for Railway: some deploy setups try to run /app/index.js
// This file forwards to the backend build output at ./backend/dist/index.js
// It is intentionally small and logs helpful info if the target is missing.

try {
  console.log('Runtime shim: attempting to load backend/dist/index.js');
  module.exports = require('./backend/dist/index.js');
} catch (e) {
  console.error('Runtime shim error: failed to load ./backend/dist/index.js');
  console.error(e && e.stack ? e.stack : e);
  // Re-throw so the process fails loudly if the backend entry is missing
  throw e;
}
