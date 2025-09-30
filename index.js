// Runtime shim for Railway: different builders place the backend build in
// either /app/backend/dist (monorepo/workspace) or /app/dist (single-package).
// Try the workspace path first (more common for this repo). This loader is
// robust in both CommonJS and ESM runtimes: it will try `require()` first and
// fall back to dynamic `import()` when `require` is unavailable.

const candidates = ['/app/backend/dist/index.js', '/app/dist/index.js'];

(async () => {
  let loaded = false;
  let lastError = null;

  for (const p of candidates) {
    try {
      console.log(`Runtime shim: attempting to load ${p}`);
      // Prefer CommonJS require when available.
      if (typeof require === 'function') {
        // Use Function to avoid static analysis bundlers that may rewrite require
        // calls in the mobile bundle.
        module.exports = Function('p', 'return require(p)')(p);
        console.log(`Runtime shim: loaded ${p} via require`);
        loaded = true;
        break;
      }

      // Fallback for ESM environments: use dynamic import().
      const mod = await import(p);
      // Prefer default export when present, otherwise export the module itself
      module.exports = mod && mod.default ? mod.default : mod;
      console.log(`Runtime shim: loaded ${p} via dynamic import`);
      loaded = true;
      break;
    } catch (e) {
      lastError = e;
    }
  }

  if (!loaded) {
    const candidatesList = candidates.join(', ');
    console.error(`Runtime shim: no backend entry found at expected locations: ${candidatesList}`);
    if (lastError && lastError.stack) console.error(lastError.stack);
    // Re-throw to ensure the container fails fast and logs the reason
    throw new Error('Runtime shim: backend entry not found');
  }
})();
