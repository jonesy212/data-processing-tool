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
        "@/api/*": "./src/app/api/*",
        "@/analyzers/*": "./src/app/generators/corrections/analyzers/*",
        "@/components/*": "./src/app/components/*",
        "@/config/*": "./src/app/config/*", 
        "@/context/*": "./src/app/context/*",
        "@/hooks/*": "./src/app/hooks/*",
        "@/models/*": "./src/app/models/*",
        "@/pages/*": "./src/app/pages/*",
        "@/libraries/*": "./src/app/libraries/*",
        "@/documents/*": "./src/app/documents/*",
        "@/calendar/*": "./src/app/browser/calendar/*",
        "@/browser/*": "./src/app/browser/*",
        "@/actions/*": "./src/app/actions/*",
        "@/generators/*": "./src/app/generators/*",
        "@/features/*": "./src/app/features/*",
        "@/data/*": "./src/app/data/*",
        "@/platform/*": "./platform/*",
        "@/types/*": "./src/app/types/*", // ← FIXED: Match tsconfig
        "@/utils/*": "./src/utils/*",
        "@/stores/*": "./src/app/stores/*",
        "@/state/*": "./src/app/state/*",
        "@/shared/*": "./src/app/shared/*",
        
        // Component categories
        "@/ui/*": "./src/app/components/ui/*",
        "@/forms/*": "./src/app/components/forms/*",
        "@/cards/*": "./src/app/components/cards/*",
        "@/navigation/*": "./src/app/components/navigation/*",
        "@/charts/*": "./src/app/components/charts/*",
        "@/tables/*": "./src/app/components/tables/*",
        "@/modals/*": "./src/app/components/modals/*",
        
        // Domain-specific paths
        "@/auth/*": "./src/app/components/auth/*",
        "@/chat/*": "./src/app/components/communications/chat/*",
        "@/crypto/*": "./src/app/components/crypto/*",
        "@/projects/*": "./src/app/components/projects/*",
        "@/quality/*": "./src/app/quality/*",
        "@/scripts/*": "./src/app/scripts/*",
        "@/tasks/*": "./src/app/components/tasks/*",
        "@/teams/*": "./src/app/components/teams/*",
        "@/users/*": "./src/app/components/users/*",
        "@/video/*": "./src/app/components/video/*",
        "@/web3/*": "./src/app/components/web3/*",
        "@/phases/*": "./src/app/components/phases/*",
        
        // Layout and theming
        "@/layout/*": "./src/app/components/layout/*",
        "@/theming/*": "./src/app/components/styling/*",
        
        // Legacy/compatibility paths
        "@/core/shared/shared_error_handling": "./src/app/config/declarations/global.d.ts",
        "@/drawingLibrary": "./src/app/config/declarations/global.d.ts",
        "@/backendStructure/*": "./src/app/config/appStructure/*",
        "@/frontendStructure/*": "./src/app/config/appStructure/*",
        "@/core/documents/*": "./src/app/documents/*",
        "@/support/*": "./src/app/features/support/*",
        "@/animations/*": "./src/app/libraries/animations/*",
        "@/typings/*": "./src/app/types/*", // ← FIXED: Match tsconfig
        "@/versions/*": "./src/app/config/versions/*",
        "@/configs/*": "./src/app/config/*",
        "@/snapshot/*": "./src/app/api/snapshots/*",
        "@/management/*": "./src/app/components/management/*",
        "@/onboarding/*": "./src/app/components/onboarding/*",
        "@/dashboards/*": "./src/app/components/dashboards/*",
        "@/searches/*": "./src/app/components/search/*",
        "@/tracker/*": "./src/app/components/tracker/*",
        "@/menu/*": "./src/app/libraries/menu/*"
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