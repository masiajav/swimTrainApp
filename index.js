// Runtime shim for Railway: some deploy setups try to run /app/index.js
// This file forwards to the backend build output. Different builders
// may place the backend build at either /app/dist or /app/backend/dist
// depending on whether the repo is a workspace. Try both locations and
// print clear diagnostics if neither exists.

const candidates = ['/app/dist/index.js', '/app/backend/dist/index.js'];
let loaded = false;
for (const p of candidates) {
  try {
    console.log(`Runtime shim: attempting to load ${p}`);
    module.exports = require(p);
    loaded = true;
    break;
  } catch (e) {
    console.error(`Runtime shim: failed to load ${p}: ${e && e.code ? e.code : e}`);
  }
}

if (!loaded) {
  const err = new Error('Runtime shim: no backend entry found at expected locations: ' + candidates.join(', '));
  console.error(err.message);
  // rethrow to fail the process so the deploy shows the error
  throw err;
}
