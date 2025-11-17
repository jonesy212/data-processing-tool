// metro.config.js
const { getDefaultConfig } = require('@react-native/metro-config');
const os = require('os');

const config = getDefaultConfig(__dirname);

// Add your customizations
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true, // Critical for large apps
    },
  }),
};

config.resolver = {
  ...config.resolver,
  // SVG support - remove SVG from assets, add to source extensions
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
  
  // For large apps - better module resolution
  extraNodeModules: {
    // Add any custom module resolutions if needed
  },
};

// Performance optimizations for large apps
config.maxWorkers = os.cpus().length; // Use all CPU cores
config.resetCache = false;

module.exports = config;