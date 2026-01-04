module.exports = function (api) {
  api.cache(true);
  
  const platform = process.env.PLATFORM || 'native'; // Default to native
  const isWeb = platform === 'web';
  const isReactNative = platform === 'native' || platform === 'mobile'; 
  const isDesktop = platform === 'desktop'; // If you have Electron/desktop targets
  const isMobile = platform === 'mobile' || platform === 'native'; // Mobile includes native

  const presets = [];
  const plugins = [];

  // Common presets for all platforms
  presets.push('@babel/preset-typescript');
  presets.push(['@babel/preset-env', {
    targets: {
      node: 'current',
    },
    useBuiltIns: 'usage',
    corejs: 3,
  }]);

  // Platform-specific presets
  if (isWeb) {
    presets.push('next/babel');
  } else if (isReactNative || isMobile) {
    presets.push('module:metro-react-native-babel-preset');
  }
  // Add else if (isDesktop) for Electron if needed

  // Common plugins
  plugins.push(['@babel/plugin-proposal-decorators', { 'legacy': true }]);
  
  // Platform-specific plugins
  if (isWeb) {
    plugins.push(['react-native-web', { 'commonjs': true }]);
  } else if (isReactNative || isMobile) {
    plugins.push('react-native-reanimated/plugin');
  }

  // Module resolver for both platforms
  plugins.push([
    'module-resolver',
    {
      root: isWeb ? ['./'] : ['./src'], // Web needs root, RN needs src
      extensions: [
        '.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json', '.mjs'
      ],
      alias: {
        // Core paths - match your tsconfig.json exactly
        "@/*": "./src/*",
        "@/api/*": "./src/core/api/*",
        "@/analyzers/*": "./src/core/generators/corrections/analyzers/*",
        "@/components/*": "./src/core/components/*",
        "@/config/*": "./src/core/config/*", 
        "@/context/*": "./src/core/context/*",
        "@/hooks/*": "./src/core/hooks/*",
        "@/models/*": "./src/core/models/*",
        "@/pages/*": "./src/core/pages/*",
        "@/libraries/*": "./src/core/libraries/*",
        "@/documents/*": "./src/core/documents/*",
        "@/calendar/*": "./src/core/browser/calendar/*",
        "@/browser/*": "./src/core/browser/*",
        "@/actions/*": "./src/core/actions/*",
        "@/generators/*": "./src/core/generators/*",
        "@/features/*": "./src/core/features/*",
        "@/data/*": "./src/core/data/*",
        "@/platform/*": "./platform/*",
        "@/types/*": "./src/core/types/*", // ← FIXED: Match tsconfig
        "@/utils/*": "./src/utils/*",
        "@/stores/*": "./src/core/stores/*",
        "@/state/*": "./src/core/state/*",
        "@/shared/*": "./src/core/shared/*",
        
        // Component categories
        "@/ui/*": "./src/core/components/ui/*",
        "@/forms/*": "./src/core/components/forms/*",
        "@/cards/*": "./src/core/components/cards/*",
        "@/navigation/*": "./src/core/components/navigation/*",
        "@/charts/*": "./src/core/components/charts/*",
        "@/tables/*": "./src/core/components/tables/*",
        "@/modals/*": "./src/core/components/modals/*",
        
        // Domain-specific paths
        "@/auth/*": "./src/core/components/auth/*",
        "@/chat/*": "./src/core/components/communications/chat/*",
        "@/crypto/*": "./src/core/components/crypto/*",
        "@/projects/*": "./src/core/components/projects/*",
        "@/quality/*": "./src/core/quality/*",
        "@/scripts/*": "./src/core/scripts/*",
        "@/tasks/*": "./src/core/components/tasks/*",
        "@/teams/*": "./src/core/components/teams/*",
        "@/users/*": "./src/core/components/users/*",
        "@/video/*": "./src/core/components/video/*",
        "@/web3/*": "./src/core/components/web3/*",
        "@/phases/*": "./src/core/components/phases/*",
        
        // Layout and theming
        "@/layout/*": "./src/core/components/layout/*",
        "@/theming/*": "./src/core/components/styling/*",
        
        // Legacy/compatibility paths
        "@/core/shared/shared_error_handling": "./src/core/config/declarations/global.d.ts",
        "@/drawingLibrary": "./src/core/config/declarations/global.d.ts",
        "@/backendStructure/*": "./src/core/config/appStructure/*",
        "@/frontendStructure/*": "./src/core/config/appStructure/*",
        "@/core/documents/*": "./src/core/documents/*",
        "@/support/*": "./src/core/features/support/*",
        "@/animations/*": "./src/core/libraries/animations/*",
        "@/typings/*": "./src/core/types/*", // ← FIXED: Match tsconfig
        "@/versions/*": "./src/core/config/versions/*",
        "@/configs/*": "./src/core/config/*",
        "@/snapshot/*": "./src/core/api/snapshots/*",
        "@/management/*": "./src/core/components/management/*",
        "@/onboarding/*": "./src/core/components/onboarding/*",
        "@/dashboards/*": "./src/core/components/dashboards/*",
        "@/searches/*": "./src/core/components/search/*",
        "@/tracker/*": "./src/core/components/tracker/*",
        "@/menu/*": "./src/core/libraries/menu/*"
      },
    },
  ]);

  return {
    presets,
    plugins,
    env: {
      production: {
        plugins: [
          'transform-remove-console' // Remove console logs in production
        ]
      }
    }
  };
};