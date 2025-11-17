// .eslintrc.js
const path = require('path');

module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    './lint/configs/react-native.js',
  ],
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'import',
    'security',
    'crypto-security',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    // React & Next.js Rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/jsx-uses-react': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Crypto & Security Rules
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-pseudoRandomBytes': 'error',

    // Crypto-specific security rules
    'no-crypto-random': 'error',

    // Audio/Video/Real-time Communication Rules
    'no-buffer-constructor': 'error',
    'no-sync': 'warn',

    // Project Management & Collaboration Rules
    'complexity': ['warn', { max: 15 }],
    'max-depth': ['warn', { max: 4 }],
    'max-params': ['warn', { max: 4 }],
    'max-lines': ['warn', { max: 300 }],
    'max-lines-per-function': ['warn', { max: 50 }],

    // TypeScript Rules
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

    // Import & Organization Rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@/app/**',
            group: 'internal',
          },
          {
            pattern: '@/components/**',
            group: 'internal',
          },
          {
            pattern: '@/crypto/**',
            group: 'internal',
          },
          {
            pattern: '@/communication/**',
            group: 'internal',
          },
          {
            pattern: '@/phases/**',
            group: 'internal',
          },
        ],
      },
    ],
    'import/no-unresolved': 'error',
    'import/no-cycle': 'error',
    'import/no-default-export': 'off',

    // Path alias rules
    'import-path-aliases': [
      'error',
      {
        aliases: {
          '@': path.resolve(__dirname, 'src'),
          '@/app': path.resolve(__dirname, 'src/app'),
          '@/components': path.resolve(__dirname, 'src/app/components'),
          '@/utils': path.resolve(__dirname, 'src/utils'),
          '@/hooks': path.resolve(__dirname, 'src/app/hooks'),
          '@/types': path.resolve(__dirname, 'src/app/typings'),
          '@/generators': path.resolve(__dirname, 'src/app/generators'),
          '@/state': path.resolve(__dirname, 'src/app/state'),
          '@/config': path.resolve(__dirname, 'src/app/config'),
          '@/crypto': path.resolve(__dirname, 'src/app/features/crypto'),
          '@/communication': path.resolve(__dirname, 'src/app/features/communication'),
          '@/phases': path.resolve(__dirname, 'src/app/features/phases'),
          '@/audio': path.resolve(__dirname, 'src/app/features/communication/audio'),
          '@/video': path.resolve(__dirname, 'src/app/features/communication/video'),
          '@/collaboration': path.resolve(__dirname, 'src/app/features/collaboration'),
          '@/portfolio': path.resolve(__dirname, 'src/app/features/crypto/portfolio'),
          '@/trading': path.resolve(__dirname, 'src/app/features/crypto/trading'),
          '@/analysis': path.resolve(__dirname, 'src/app/features/analysis'),
        },
      },
    ],

    // General Code Quality Rules
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-unused-expressions': 'error',
    'no-implicit-coercion': 'error',
  },
  overrides: [
    // TypeScript Files
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/await-thenable': 'error',
      },
    },
    
    // JavaScript Files
    {
      files: ['**/*.js', '**/*.jsx'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
      },
    },
    
    // Test Files
    {
      files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'security/detect-object-injection': 'off',
        'no-console': 'off',
        'max-lines-per-function': 'off',
      },
    },
    
    // Crypto-specific Files
    {
      files: ['**/crypto/**/*.{ts,tsx,js,jsx}'],
      rules: {
        'security/detect-object-injection': 'error',
        'security/detect-non-literal-require': 'error',
        'security/detect-possible-timing-attacks': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
      },
    },
    
    // Communication Files (Audio/Video/Real-time)
    {
      files: ['**/communication/**/*.{ts,tsx,js,jsx}'],
      rules: {
        'no-sync': 'error',
        'max-params': ['warn', { max: 6 }], // Allow more params for media handlers
      },
    },
    
    // Configuration Files
    {
      files: ['*.config.js', '*.config.ts'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'import/no-default-export': 'off',
        'no-console': 'off',
      },
    },
  ],
  env: {
    browser: true,
    node: true,
    es2022: true,
    'react-native/react-native': true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
};