// Runtime shim for Railway: different builders place the backend build in
// either /app/backend/dist (monorepo/workspace) or /app/dist (single-package).
// Try the workspace path first (more common for this repo), and only emit
// a single error if neither candidate can be loaded. This avoids noisy
// MODULE_NOT_FOUND messages in normal successful deployments.

const candidates = ['/app/backend/dist/index.js', '/app/dist/index.js'];
let loaded = false;
let lastError = null;
for (const p of candidates) {
  try {
    console.log(`Runtime shim: attempting to load ${p}`);
    module.exports = require(p);
    console.log(`Runtime shim: loaded ${p}`);
    loaded = true;
    break;
  } catch (e) {
    // Keep the last error for debugging, but avoid spamming logs with
    // expected MODULE_NOT_FOUND messages when the other candidate will succeed.
    lastError = e;
  }
}

if (!loaded) {
  const candidatesList = candidates.join(', ');
  console.error(`Runtime shim: no backend entry found at expected locations: ${candidatesList}`);
  if (lastError && lastError.stack) console.error(lastError.stack);
  throw new Error('Runtime shim: backend entry not found');
}
