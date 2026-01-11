// ConfigurationGenerationScript.ts
// scripts/ConfigurationGenerationScript.ts
import { ProjectConfig } from '@/core/config/ProjectConfig';
import fs from 'fs';
import path from 'path';

export class ConfigurationGenerationScript {
  async execute(projectConfig: ProjectConfig): Promise<void> {
    console.log('⚙️ Generating project configuration...');
    
    try {
      // TypeScript configuration (aligned with your tsconfig)
      await this.generateTypeScriptConfig(projectConfig);
      
      // ESLint configuration
      await this.generateEslintConfig(projectConfig);
      
      // Prettier configuration
      await this.generatePrettierConfig(projectConfig);
      
      // Next.js configuration
      await this.generateNextJsConfig(projectConfig);
      
      // Environment variables
      await this.generateEnvFiles(projectConfig);
      
      // Git configuration
      await this.generateGitConfig(projectConfig);
      
      // Babel configuration (for React Native compatibility)
      await this.generateBabelConfig(projectConfig);
      
      // Package.json scripts (aligned with your existing scripts)
      await this.updatePackageJsonScripts(projectConfig);
      
      console.log('✅ Project configuration generated successfully!');
    } catch (error) {
      console.error('❌ Configuration generation failed:', error);
      throw error;
    }
  }

  private async generateTypeScriptConfig(projectConfig: ProjectConfig): Promise<void> {
    const tsconfig = {
      compilerOptions: {
        target: "ES2017",
        lib: [
          "DOM",
          "DOM.Iterable", 
          "ESNext",
          "ES2017",
          "ES2015"
        ],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        strictFunctionTypes: true,
        strictBindCallApply: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        experimentalDecorators: true,
        allowSyntheticDefaultImports: true,
        forceConsistentCasingInFileNames: true,
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "react-jsx",
        incremental: true,
        plugins: [
          {
            name: "next"
          }
        ],
        types: [
          "node",
          "react", 
          "react-dom",
          "next"
        ],
        paths: {
          "@/*": ["./src/*"],
          "@/api/*": ["./src/core/api/*"],
          "@/components/*": ["./src/core/components/*"],
          "@/config/*": ["./src/core/config/*"],
          "@/context/*": ["./src/core/context/*"],
          "@/hooks/*": ["./src/core/hooks/*"],
          "@/models/*": ["./src/core/models/*"],
          "@/pages/*": ["./src/core/pages/*"],
          "@/libraries/*": ["./src/core/libraries/*"],
          "@/documents/*": ["./src/core/documents/*"],
          "@/calendar/*": ["./src/core/browser/calendar/*"],
          "@/browser/*": ["./src/core/browser/*"],
          "@/actions/*": ["./src/core/actions/*"],
          "@/generators/*": ["./src/core/generators/*"],
          "@/features/*": ["./src/core/features/*"],
          "@/data/*": ["./src/core/data/*"],
          "@/platform/*": ["./platform/*"],
          "@/types/*": ["./src/core/types/*"],
          "@/utils/*": ["./src/utils/*"],
          "@/stores/*": ["./src/core/stores/*"],
          "@/state/*": ["./src/core/state/*"],
          "@/shared/*": ["./src/core/shared/*"],
          "@/ui/*": ["./src/core/components/ui/*"],
          "@/forms/*": ["./src/core/components/forms/*"],
          "@/cards/*": ["./src/core/components/cards/*"],
          "@/navigation/*": ["./src/core/components/navigation/*"],
          "@/charts/*": ["./src/core/components/charts/*"],
          "@/tables/*": ["./src/core/components/tables/*"],
          "@/modals/*": ["./src/core/components/modals/*"],
          "@/auth/*": ["./src/core/components/auth/*"],
          "@/chat/*": ["./src/core/components/communications/chat/*"],
          "@/crypto/*": ["./src/core/components/crypto/*"],
          "@/projects/*": ["./src/core/components/projects/*"],
          "@/tasks/*": ["./src/core/components/tasks/*"],
          "@/teams/*": ["./src/core/components/teams/*"],
          "@/users/*": ["./src/core/components/users/*"],
          "@/video/*": ["./src/core/components/video/*"],
          "@/web3/*": ["./src/core/components/web3/*"],
          "@/phases/*": ["./src/core/components/phases/*"],
          "@/layout/*": ["./src/core/components/layout/*"],
          "@/theming/*": ["./src/core/components/styling/*"],
          "@/support/*": ["./src/core/features/support/*"],
          "@/animations/*": ["./src/core/libraries/animations/*"],
          "@/typings/*": ["./src/core/types/*"],
          "@/versions/*": ["./src/core/config/versions/*"],
          "@/configs/*": ["./src/core/config/*"],
          "@/snapshot/*": ["./src/core/api/snapshots/*"],
          "@/management/*": ["./src/core/components/management/*"],
          "@/onboarding/*": ["./src/core/components/onboarding/*"],
          "@/dashboards/*": ["./src/core/components/dashboards/*"],
          "@/searches/*": ["./src/core/components/search/*"],
          "@/tracker/*": ["./src/core/components/tracker/*"],
          "@/menu/*": ["./src/core/libraries/menu/*"]
        },
        typeRoots: [
          "node_modules/@types",
          "./src",
          "./src/core/config/declarations", 
          "./src/core/types"
        ]
      },
      include: [
        "next-env.d.ts",
        "**/*.ts",
        "**/*.tsx", 
        "**/*.d.ts",
        ".next/types/**/*.ts",
        "src/**/*",
        "platform/**/*",
        ".next/dev/types/**/*.ts"
      ],
      exclude: [
        "node_modules",
        "babel.config.js",
        "metro.config.js", 
        "jest.config.js",
        "**/*.test.*",
        "**/*.spec.*",
        "platform/android/**/*",
        "platform/ios/**/*"
      ]
    };

    fs.writeFileSync(
      path.join(projectConfig.projectPath, 'tsconfig.json'),
      JSON.stringify(tsconfig, null, 2)
    );
    console.log('📄 Created TypeScript configuration');
  }

  private async generateEslintConfig(projectConfig: ProjectConfig): Promise<void> {
    const eslintConfig = `const { resolve } = require('path');

module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: resolve(__dirname, 'tsconfig.json'),
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'platform/android/',
    'platform/ios/'
  ]
};`;

    fs.writeFileSync(
      path.join(projectConfig.projectPath, '.eslintrc.js'),
      eslintConfig
    );
    console.log('📄 Created ESLint configuration');
  }

  private async generatePrettierConfig(projectConfig: ProjectConfig): Promise<void> {
    const prettierConfig = {
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
      endOfLine: 'auto'
    };

    fs.writeFileSync(
      path.join(projectConfig.projectPath, '.prettierrc'),
      JSON.stringify(prettierConfig, null, 2)
    );
    console.log('📄 Created Prettier configuration');
  }

  private async generateNextJsConfig(projectConfig: ProjectConfig): Promise<void> {
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
    unoptimized: true, // For static exports if needed
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    'rc-util',
    'rc-pagination',
    'rc-picker'
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // React Native Web alias
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
    };
    
    return config;
  },
}

module.exports = nextConfig`;

    fs.writeFileSync(
      path.join(projectConfig.projectPath, 'next.config.js'),
      nextConfig
    );
    console.log('📄 Created Next.js configuration');
  }

  private async generateBabelConfig(projectConfig: ProjectConfig): Promise<void> {
    const babelConfig = `module.exports = {
  presets: [
    'next/babel',
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    '@babel/preset-react'
  ],
  plugins: [
    ['module-resolver', {
      root: ['./src'],
      alias: {
        '@': './src',
        '@/components': './src/core/components',
        '@/utils': './src/utils',
        // Add other aliases as needed
      }
    }],
    'react-native-web'
  ],
  env: {
    production: {
      plugins: ['transform-remove-console']
    }
  }
};`;

    fs.writeFileSync(
      path.join(projectConfig.projectPath, 'babel.config.js'),
      babelConfig
    );
    console.log('📄 Created Babel configuration');
  }

  private async generateEnvFiles(projectConfig: ProjectConfig): Promise<void> {
    const envExample = `# Database
DATABASE_URL="your_database_connection_string"
POSTGRES_URL="postgresql://username:password@localhost:5432/database_name"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_here"
JWT_SECRET="your_jwt_secret_here"

# API Keys
OPENAI_API_KEY="your_openai_api_key"
WEB3_PROVIDER_URL="your_web3_provider_url"

# Application
NODE_ENV="development"
APP_URL="http://localhost:3000"
API_BASE_URL="http://localhost:3000/api"

# Feature Flags
ENABLE_WEB3="true"
ENABLE_AI_FEATURES="true"
ENABLE_REACT_NATIVE="false"

# External Services
IPFS_GATEWAY="https://ipfs.io/ipfs/"
BLOCKCHAIN_NETWORK="mainnet"`;

    const envLocal = `# Local Development Environment
DATABASE_URL="postgresql://postgres:password@localhost:5432/${projectConfig.projectName}_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="local_dev_secret_${Math.random().toString(36).substring(2)}"
JWT_SECRET="local_jwt_secret_${Math.random().toString(36).substring(2)}"
NODE_ENV="development"
APP_URL="http://localhost:3000"
API_BASE_URL="http://localhost:3000/api"
ENABLE_WEB3="true"
ENABLE_AI_FEATURES="true"`;

    fs.writeFileSync(path.join(projectConfig.projectPath, '.env.example'), envExample);
    fs.writeFileSync(path.join(projectConfig.projectPath, '.env.local'), envLocal);
    console.log('🔐 Created environment files');
  }

  private async updatePackageJsonScripts(projectConfig: ProjectConfig): Promise<void> {
    const packageJsonPath = path.join(projectConfig.projectPath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Add your comprehensive script set
      packageJson.scripts = {
        ...packageJson.scripts,
        "dev": "next dev",
        "build": "next build", 
        "start": "next start",
        "lint": "next lint",
        "type-check": "tsc --noEmit",
        "lint:types": "tsc --noEmit --skipLibCheck",
        "analyze:duplicates": "tsx src/core/scripts/analyzeDuplicates.ts",
        "analyze:dependencies": "tsx src/core/scripts/analyzeDependencies.ts",
        "analyze:all": "pnpm analyze:duplicates && pnpm analyze:dependencies",
        "generate:corrections": "tsx src/core/generators/corrections/CorrectionGenerator.ts",
        "generate:corrections:critical": "tsx src/core/generators/corrections/CorrectionGenerator.ts --critical",
        "dev:with-corrections": "pnpm generate:corrections && pnpm dev",
        "pre-commit": "pnpm lint && pnpm type-check",
        "pre-push": "pnpm analyze:all && pnpm type-check"
      };

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('📦 Updated package.json scripts');
    }
  }

  private async generateGitConfig(projectConfig: ProjectConfig): Promise<void> {
    const gitignore = `# Dependencies
/node_modules
/.pnp
.pnp.js
.pnp.loader.mjs

# Production
/build
/.next
/out
/dist

# Environment
.env*.local
.env
.env.production

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
/coverage
/.nyc_output

# Dependency directories
.node_modules/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test
.env.production
.env.local
.env.development.local
.env.test.local
.env.production.local

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Mobile platforms
platform/android/
platform/ios/
*.apk
*.aab
*.ipa

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Analysis reports
/reports
/analysis

# Snapshots
/snapshots
*.snapshot

# Error tracking
/error-tracking`;

    fs.writeFileSync(path.join(projectConfig.projectPath, '.gitignore'), gitignore);
    console.log('📄 Created Git configuration');
  }
}