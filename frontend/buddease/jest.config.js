// jest.config.js
// jest.config.js
module.exports = {
  preset: 'react-native',
  
  // Setup files
  setupFiles: [
    '<rootDir>/src/test/setup.js'
  ],
  
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/src/test/setupAfterEnv.js'
  ],
  
  // Module mapping - match your tsconfig.json paths
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/components/(.*)$': '<rootDir>/src/app/components/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/app/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/app/typings/$1',
    '^@/typings/(.*)$': '<rootDir>/src/app/typings/$1',
    '^@/store/(.*)$': '<rootDir>/src/app/state/stores/$1',
    '^@/state/(.*)$': '<rootDir>/src/app/state/$1',
    '^@/generators/(.*)$': '<rootDir>/src/app/generators/$1',
    
    // React Native mocks
    '^react-native$': '<rootDir>/src/test/mocks/react-native.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/src/test/mocks/async-storage.js',
    '^react-native-reanimated$': '<rootDir>/src/test/mocks/react-native-reanimated.js',
    '^react-native-vector-icons$': '<rootDir>/src/test/mocks/react-native-vector-icons.js'
  },
  
  // File extensions
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node'
  ],
  
  // Transform patterns
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-native-.*|expo-.*)/)'
  ],
  
  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Coverage
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/index.{js,jsx,ts,tsx}'
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'html',
    'lcov',
    'json'
  ],
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Global variables
  globals: {
    __DEV__: true
  },
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Clear mocks
  clearMocks: true,
  
  // Cache
  cacheDirectory: '<rootDir>/node_modules/.cache/jest'
};