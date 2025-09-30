// Runtime shim for Railway: different builders place the backend build in
// either /app/backend/dist (monorepo/workspace) or /app/dist (single-package).
// Try the workspace path first (more common for this repo). This loader is
// resilient in CommonJS and ESM Node runtimes: it will try direct require,
// then Node's createRequire (works from ESM), and finally dynamic import().

const candidates = ['/app/backend/dist/index.js', '/app/dist/index.js'];

(async () => {
  let loaded = false;
  let lastError = null;

  for (const p of candidates) {
    try {
      console.log(`Runtime shim: attempting to load ${p}`);

      // 1) If we're running in a Classic CommonJS context, prefer a direct require.
      if (typeof require === 'function' && typeof module !== 'undefined' && module && module.exports) {
        module.exports = require(p);
        console.log(`Runtime shim: loaded ${p} via require`);
        loaded = true;
        break;
      }

      // 2) Try using Node's createRequire which is available in ESM contexts.
      //    Use dynamic import('module') to avoid top-level 'require' usage and
      //    to keep this file safe for bundlers that parse static requires.
      try {
        const modNS = await import('module');
        const createRequire = modNS && modNS.createRequire;
        if (typeof createRequire === 'function') {
          // createRequire expects a filename; package.json in cwd is a safe anchor
          const crequire = createRequire(`${process.cwd()}/package.json`);
          module.exports = crequire(p);
          console.log(`Runtime shim: loaded ${p} via createRequire`);
          loaded = true;
          break;
        }
      } catch (e1) {
        // ignore and try dynamic import below
        lastError = e1;
      }

      // 3) Fallback: dynamic import() (works in ESM). Prefer default export if present.
      try {
        const imported = await import(p);
        module.exports = imported && imported.default ? imported.default : imported;
        console.log(`Runtime shim: loaded ${p} via dynamic import`);
        loaded = true;
        break;
      } catch (e2) {
        lastError = e2;
      }
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
