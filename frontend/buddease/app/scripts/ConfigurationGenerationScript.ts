// ConfigurationGenerationScript.ts
// scripts/ConfigurationGenerationScript.ts
import fs from 'fs';
import path from 'path';
import { ProjectConfig } from '@/app/config/ProjectConfig';

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
          "@/api/*": ["./src/app/api/*"],
          "@/components/*": ["./src/app/components/*"],
          "@/config/*": ["./src/app/config/*"],
          "@/context/*": ["./src/app/context/*"],
          "@/hooks/*": ["./src/app/hooks/*"],
          "@/models/*": ["./src/app/models/*"],
          "@/pages/*": ["./src/app/pages/*"],
          "@/libraries/*": ["./src/app/libraries/*"],
          "@/documents/*": ["./src/app/documents/*"],
          "@/calendar/*": ["./src/app/browser/calendar/*"],
          "@/browser/*": ["./src/app/browser/*"],
          "@/actions/*": ["./src/app/actions/*"],
          "@/generators/*": ["./src/app/generators/*"],
          "@/features/*": ["./src/app/features/*"],
          "@/data/*": ["./src/app/data/*"],
          "@/platform/*": ["./platform/*"],
          "@/types/*": ["./src/app/types/*"],
          "@/utils/*": ["./src/utils/*"],
          "@/stores/*": ["./src/app/stores/*"],
          "@/state/*": ["./src/app/state/*"],
          "@/shared/*": ["./src/app/shared/*"],
          "@/ui/*": ["./src/app/components/ui/*"],
          "@/forms/*": ["./src/app/components/forms/*"],
          "@/cards/*": ["./src/app/components/cards/*"],
          "@/navigation/*": ["./src/app/components/navigation/*"],
          "@/charts/*": ["./src/app/components/charts/*"],
          "@/tables/*": ["./src/app/components/tables/*"],
          "@/modals/*": ["./src/app/components/modals/*"],
          "@/auth/*": ["./src/app/components/auth/*"],
          "@/chat/*": ["./src/app/components/communications/chat/*"],
          "@/crypto/*": ["./src/app/components/crypto/*"],
          "@/projects/*": ["./src/app/components/projects/*"],
          "@/tasks/*": ["./src/app/components/tasks/*"],
          "@/teams/*": ["./src/app/components/teams/*"],
          "@/users/*": ["./src/app/components/users/*"],
          "@/video/*": ["./src/app/components/video/*"],
          "@/web3/*": ["./src/app/components/web3/*"],
          "@/phases/*": ["./src/app/components/phases/*"],
          "@/layout/*": ["./src/app/components/layout/*"],
          "@/theming/*": ["./src/app/components/styling/*"],
          "@/support/*": ["./src/app/features/support/*"],
          "@/animations/*": ["./src/app/libraries/animations/*"],
          "@/typings/*": ["./src/app/types/*"],
          "@/versions/*": ["./src/app/config/versions/*"],
          "@/configs/*": ["./src/app/config/*"],
          "@/snapshot/*": ["./src/app/api/snapshots/*"],
          "@/management/*": ["./src/app/components/management/*"],
          "@/onboarding/*": ["./src/app/components/onboarding/*"],
          "@/dashboards/*": ["./src/app/components/dashboards/*"],
          "@/searches/*": ["./src/app/components/search/*"],
          "@/tracker/*": ["./src/app/components/tracker/*"],
          "@/menu/*": ["./src/app/libraries/menu/*"]
        },
        typeRoots: [
          "node_modules/@types",
          "./src",
          "./src/app/config/declarations", 
          "./src/app/types"
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
        '@/components': './src/app/components',
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
        "analyze:duplicates": "tsx src/app/scripts/analyzeDuplicates.ts",
        "analyze:dependencies": "tsx src/app/scripts/analyzeDependencies.ts",
        "analyze:all": "pnpm analyze:duplicates && pnpm analyze:dependencies",
        "generate:corrections": "tsx src/app/generators/corrections/CorrectionGenerator.ts",
        "generate:corrections:critical": "tsx src/app/generators/corrections/CorrectionGenerator.ts --critical",
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