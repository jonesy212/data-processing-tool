// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [
      './src/test/setup.ts', // Main setup file
      './src/test/mocks/index.ts' // Global mocks
    ],
    
    // Include test files
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      '**/__tests__/**/*.{js,jsx,ts,tsx}'
    ],
    
    // Exclude files from test runs
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/platform/**',
      '**/*.config.js',
      '**/coverage/**'
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/*.config.js',
        '**/*.d.ts',
        '**/types/**',
        '**/typings/**',
        '**/test/**',
        '**/__tests__/**',
        '**/*.{test,spec}.{js,jsx,ts,tsx}',
        'src/test/**',
        '**/index.{js,jsx,ts,tsx}' // Barrel files
      ],
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    },
    
    // Mock configuration for React Native
    server: {
      deps: {
        inline: [
          'react-native',
          'react-native-reanimated',
          '@react-native',
          'mobx',
          'mobx-react-lite'
        ]
      }
    },
    
    // Test timeout
    testTimeout: 10000,
    
    // Watch mode configuration
    watch: false,
    
    // UI mode for better test reporting
    ui: false
  },
  
  resolve: {
    alias: {
      // Match your tsconfig.json and babel.config.js paths
      '@': resolve(__dirname, 'src'),
      '@/api': resolve(__dirname, 'src/core/api'),
      '@/analyzers': resolve(__dirname, 'src/core/generators/corrections/analyzers'),
      '@/components': resolve(__dirname, 'src/core/components'),
      '@/config': resolve(__dirname, 'src/core/config'),
      '@/context': resolve(__dirname, 'src/core/context'),
      '@/hooks': resolve(__dirname, 'src/core/hooks'),
      '@/models': resolve(__dirname, 'src/core/models'),
      '@/pages': resolve(__dirname, 'src/core/pages'),
      '@/libraries': resolve(__dirname, 'src/core/libraries'),
      '@/documents': resolve(__dirname, 'src/core/documents'),
      '@/calendar': resolve(__dirname, 'src/core/browser/calendar'),
      '@/browser': resolve(__dirname, 'src/core/browser'),
      '@/actions': resolve(__dirname, 'src/core/actions'),
      '@/generators': resolve(__dirname, 'src/core/generators'),
      '@/features': resolve(__dirname, 'src/core/features'),
      '@/data': resolve(__dirname, 'src/core/data'),
      '@/platform': resolve(__dirname, 'platform'),
      '@/types': resolve(__dirname, 'src/core/typings'),
      '@/typings': resolve(__dirname, 'src/core/typings'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/stores': resolve(__dirname, 'src/core/stores'),
      '@/state': resolve(__dirname, 'src/core/state'),
      '@/shared': resolve(__dirname, 'src/core/shared'),
      
      // React Native specific mocks
      'react-native': resolve(__dirname, 'src/test/mocks/react-native.js'),
      '@react-native-async-storage/async-storage': resolve(__dirname, 'src/test/mocks/async-storage.js'),
      'react-native-vector-icons': resolve(__dirname, 'src/test/mocks/react-native-vector-icons.js'),
      'react-native-reanimated': resolve(__dirname, 'src/test/mocks/react-native-reanimated.js'),
      
      // Redux/MobX test utilities
      '@/test-utils': resolve(__dirname, 'src/test/utils')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.mjs']
  },
  
  // Optimize for your large codebase
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-native',
      'mobx',
      'mobx-react-lite',
      'redux',
      'react-redux',
      '@reduxjs/toolkit'
    ]
  }
});