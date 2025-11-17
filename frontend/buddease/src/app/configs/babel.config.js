// babel.config.js - Optimized for large React Native apps
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-transform-runtime',
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.js',
          '.android.js', 
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.json'
        ],
        alias: {
          // Your path aliases for better imports
          '@/app': './src/app',
          '@/components': './src/components',
          '@/utils': './src/utils',
          '@/types': './src/types',
          '@/assets': './src/assets',
          '@/hooks': './src/hooks',
          '@/store': './src/store',
          '@/navigation': './src/navigation',
        },
      },
    ],
  ],
  env: {
    production: {
      plugins: [
        'transform-remove-console' // Remove console logs in production
      ]
    }
  }
};