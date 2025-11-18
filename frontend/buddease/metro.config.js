// metro.config.js
const { getDefaultConfig } = require('@react-native/metro-config');
const os = require('os');
const path = require('path');

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Clear any existing transformer to avoid conflicts
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    compress: {
      drop_console: process.env.NODE_ENV === 'production', // Only drop console in production
      keep_fnames: true, // Keep function names for better debugging
    },
    mangle: {
      keep_fnames: true, // Keep function names
    },
  },
};

// Fix the resolver - remove duplicate sourceExts definition
config.resolver = {
  ...config.resolver,
  // SVG support
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  // Define source extensions once without duplicates
  sourceExts: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'svg',
    'cjs',
    'mjs'
  ],
  
  // Enhanced module resolution
  extraNodeModules: new Proxy({}, {
    get: (target, name) => {
      // Auto-resolve modules to local node_modules
      return path.join(__dirname, `node_modules/${name}`);
    },
  }),
  
  // Better module resolution order
  resolverMainFields: ['react-native', 'browser', 'main'],
  
  // Use blocklist instead of deprecated blacklistRE
  blockList: [
    /.*\.(test|spec)\.(js|ts|tsx)$/,
    /\/__tests__\//,
    /\/node_modules\/.*\/__tests__\//,
  ],
  
  // Enable symlinks for monorepo support
  enableSymlinks: true,
  
  // Use real path for better module resolution
  useWatchman: true,
};

// Performance optimizations
config.maxWorkers = Math.max(2, os.cpus().length - 1);
config.resetCache = process.env.RESET_CACHE === 'true'; // Only reset when explicitly requested

// Cache configuration
config.cacheVersion = `v1-${process.env.NODE_ENV || 'development'}`;

// Watch folders for better monorepo support
config.watchFolders = [
  __dirname,
  // Uncomment if you have a monorepo structure
  // path.resolve(__dirname, '../shared'),
  // path.resolve(__dirname, '../node_modules'),
].filter(Boolean);

// Server configuration
config.server = {
  ...config.server,
  port: process.env.METRO_PORT || 8081,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Add custom headers or logging
      if (req.url.includes('.bundle')) {
        console.log(`📦 Bundle requested: ${req.url}`);
      }
      return middleware(req, res, next);
    };
  },
};

// Reporter for better build insights
config.reporter = {
  update: (event) => {
    switch (event.type) {
      case 'initialize_started':
        console.log('🚇 Metro initializing...');
        break;
      case 'initialize_done':
        console.log('✅ Metro ready');
        break;
      case 'build_started':
        console.log('🔨 Metro build starting...');
        break;
      case 'build_done':
        console.log('✅ Metro build completed');
        break;
      case 'build_failed':
        console.log('❌ Metro build failed');
        break;
    }
  },
};

// Add transformer for specific file types
config.transformer = {
  ...config.transformer,
  // Enable hermes if using React Native 0.70+
  unstable_allowRequireContext: true,
};

// Add serializer options for better bundle output
config.serializer = {
  ...config.serializer,
  // Custom serializer options if needed
};

module.exports = config;