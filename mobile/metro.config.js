const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

// Start from Expo's default config for this project
const config = getDefaultConfig(projectRoot);

// Ensure Metro watches the workspace root so it can resolve packages from the repo root
config.watchFolders = config.watchFolders || [];
config.watchFolders.push(workspaceRoot);

// Prefer node_modules in mobile first, then fall back to workspace node_modules
config.resolver = config.resolver || {};
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Support loading SVGs via react-native-svg-transformer
config.transformer = config.transformer || {};
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'svg'];

// Prevent Metro from accidentally bundling the repo root runtime shim (index.js)
// which contains dynamic requires that Metro cannot statically analyze.
try {
  const exclusionList = require('metro-config/src/defaults/exclusionList');
  const rootIndex = path.resolve(workspaceRoot, 'index.js').replace(/\\/g, '/');
  config.resolver.blockList = config.resolver.blockList || exclusionList([new RegExp(`^${rootIndex}$`)]);
} catch (e) {
  // If exclusionList isn't available, ignore — Metro will likely still work.
  // This is a non-fatal best-effort exclusion.
}

module.exports = config;
