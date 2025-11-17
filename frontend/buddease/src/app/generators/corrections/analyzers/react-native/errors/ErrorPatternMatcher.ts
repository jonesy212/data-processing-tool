// ErrorPatternMatcher.ts
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import { BaseAnalyzer } from '@/app/generators/corrections/analyzers/BaseAnalyzer'
import fs from 'fs'

interface ErrorPattern {
  pattern: RegExp;
  category: Correction['category'];
  severity: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
}

interface ErrorStatistics {
  totalErrors: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  mostCommonError: string;
}


export class ErrorPatternMatcher extends BaseAnalyzer {
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private buildLogs: string[] = [];
  private errorFiles: string[] = [];

  constructor() {
    super();
    this.initializeErrorPatterns();
  }


  async analyze(): Promise<Correction[]> {
    console.log('🔍 Analyzing error patterns across build logs and files...');
    const corrections: Correction[] = [];

    try {
      // Load build logs and error files
      await this.loadBuildData();
      
      // Analyze build logs for error patterns
      const buildLogCorrections = this.analyzeBuildLogs();
      corrections.push(...buildLogCorrections);

      // Analyze TypeScript error files
      const tsErrorCorrections = this.analyzeTypeScriptErrors();
      corrections.push(...tsErrorCorrections);

      // Analyze ESLint output
      const eslintCorrections = this.analyzeEslintOutput();
      corrections.push(...eslintCorrections);

      // Analyze package.json for dependency issues
      const dependencyCorrections = this.analyzeDependencies();
      corrections.push(...dependencyCorrections);

      console.log(`✅ Found ${corrections.length} error pattern corrections`);
      
    } catch (error) {
      console.error('❌ Error pattern analysis failed:', error);
      // Return empty array instead of throwing to avoid breaking the analysis pipeline
    }

    return corrections;
  }

  private initializeErrorPatterns(): void {
    // TypeScript Compilation Errors
    this.errorPatterns.set('typescript-type-error', {
      pattern: /error TS(\d+):/g,
      category: 'compilation',
      severity: 'high',
      message: 'TypeScript type error',
      suggestion: 'Check type definitions, interfaces, and ensure proper TypeScript configuration. Run "npm run type-check" for details.'
    });

    this.errorPatterns.set('typescript-syntax-error', {
      pattern: /error TS\d+\s*:\s*'.*' expected|expected.*,|Unexpected token/g,
      category: 'compilation',
      severity: 'high',
      message: 'TypeScript syntax error',
      suggestion: 'Fix syntax issues: missing semicolons, brackets, parentheses, or incorrect syntax structure.'
    });

    this.errorPatterns.set('typescript-cannot-find-module', {
      pattern: /error TS2307: Cannot find module/g,
      category: 'import',
      severity: 'high',
      message: 'TypeScript cannot find module',
      suggestion: 'Check import paths, ensure module is installed, or add type definitions with @types/package-name'
    });

    this.errorPatterns.set('typescript-property-does-not-exist', {
      pattern: /error TS2339: Property.*does not exist on type/g,
      category: 'types',
      severity: 'high',
      message: 'TypeScript property does not exist',
      suggestion: 'Check type definitions, use type assertions if needed, or extend interfaces properly'
    });

    // React & Next.js Specific Errors
    this.errorPatterns.set('react-hook-deps', {
      pattern: /React Hook .* has (a missing dependency|missing dependencies):/g,
      category: 'react',
      severity: 'medium',
      message: 'React Hook dependency warning',
      suggestion: 'Add missing dependencies to useEffect/useCallback/useMemo dependency array or disable with eslint-disable-line if intentional'
    });

    this.errorPatterns.set('react-key-warning', {
      pattern: /Each child in a list should have a unique "key" prop/g,
      category: 'react',
      severity: 'medium',
      message: 'Missing React key prop',
      suggestion: 'Add unique key prop to list items: {items.map(item => <div key={item.id}>...</div>)}'
    });

    this.errorPatterns.set('next-hydration', {
      pattern: /Hydration failed because|Text content does not match server-rendered HTML/g,
      category: 'nextjs',
      severity: 'high',
      message: 'Next.js hydration error',
      suggestion: 'Fix server-client rendering mismatches. Use useEffect for client-only code or suppress with suppressHydrationWarning'
    });

    this.errorPatterns.set('next-api-route', {
      pattern: /API resolved without sending a response|API route did not return a response/g,
      category: 'nextjs',
      severity: 'medium',
      message: 'Next.js API route issue',
      suggestion: 'Ensure API routes return proper responses: return res.json(), res.end(), or throw an error'
    });

    this.errorPatterns.set('next-dynamic-import', {
      pattern: /was not prerendered|Dynamic server usage/g,
      category: 'nextjs',
      severity: 'medium',
      message: 'Next.js dynamic import or SSR issue',
      suggestion: 'Use dynamic imports with ssr: false or move client-side code to useEffect'
    });

    // Import/Module Resolution Errors
    this.errorPatterns.set('module-not-found', {
      pattern: /Module not found: Can't resolve|Cannot find module/g,
      category: 'import',
      severity: 'high',
      message: 'Module resolution error',
      suggestion: 'Check import paths (relative vs absolute), ensure package is installed, or check tsconfig.json paths'
    });

    this.errorPatterns.set('export-not-found', {
      pattern: /Attempted import error:.*is not exported|has no exported member/g,
      category: 'import',
      severity: 'high',
      message: 'Export not found',
      suggestion: 'Verify export names in source file. Check if using named vs default exports: import { Component } vs import Component'
    });

    this.errorPatterns.set('import-extension', {
      pattern: /Missing file extension|Need an appropriate loader/g,
      category: 'import',
      severity: 'medium',
      message: 'Import file extension issue',
      suggestion: 'Add file extensions to imports or configure webpack/TypeScript to handle file extensions properly'
    });

    // Webpack & Bundler Errors
    this.errorPatterns.set('webpack-chunk', {
      pattern: /ChunkLoadError|Loading chunk.*failed/g,
      category: 'bundler',
      severity: 'medium',
      message: 'Webpack chunk loading error',
      suggestion: 'Check dynamic imports, ensure proper code splitting, and verify publicPath configuration'
    });

    this.errorPatterns.set('webpack-module-build', {
      pattern: /Module build failed|Module parse failed/g,
      category: 'bundler',
      severity: 'high',
      message: 'Webpack module build failure',
      suggestion: 'Check loader configuration, file formats, and ensure proper webpack loaders are installed'
    });

    this.errorPatterns.set('webpack-asset', {
      pattern: /Cannot find module.*\.(png|jpg|svg|gif)|Asset optimization error/g,
      category: 'bundler',
      severity: 'medium',
      message: 'Webpack asset processing error',
      suggestion: 'Install file-loader/url-loader for assets or use Next.js static file handling'
    });

    // Dependency & Package Errors
    this.errorPatterns.set('peer-dependency', {
      pattern: /requires a peer of|missing peer dependency/g,
      category: 'dependencies',
      severity: 'medium',
      message: 'Peer dependency warning',
      suggestion: 'Install required peer dependencies: npm install peer-package or update package versions for compatibility'
    });

    this.errorPatterns.set('dependency-conflict', {
      pattern: /conflicting peer dependency|incompatible with/g,
      category: 'dependencies',
      severity: 'high',
      message: 'Dependency version conflict',
      suggestion: 'Resolve version conflicts using npm/yarn resolutions, or update packages to compatible versions'
    });

    this.errorPatterns.set('package-not-found', {
      pattern: /npm ERR! 404|Package.*not found/g,
      category: 'dependencies',
      severity: 'high',
      message: 'Package not found in registry',
      suggestion: 'Check package name spelling, verify registry access, or use correct package scope'
    });

    // ESLint & Code Quality Warnings
    this.errorPatterns.set('eslint-warning', {
      pattern: /warning\s+.*eslint|ESLint:/g,
      category: 'linting',
      severity: 'low',
      message: 'ESLint warning',
      suggestion: 'Address code quality issues. Run "npm run lint" to see details and "npm run lint:fix" to auto-fix'
    });

    this.errorPatterns.set('eslint-error', {
      pattern: /error\s+.*eslint/g,
      category: 'linting',
      severity: 'medium',
      message: 'ESLint error',
      suggestion: 'Fix critical code quality issues. Some rules may require manual intervention'
    });

    this.errorPatterns.set('prettier-format', {
      pattern: /prettier|Code style issues found/g,
      category: 'formatting',
      severity: 'low',
      message: 'Code formatting issue',
      suggestion: 'Run "npm run format" or "npx prettier --write" to automatically format code'
    });

    // Performance & Bundle Size Warnings
    this.errorPatterns.set('bundle-size', {
      pattern: /large.*bundle size|bundle size.*large|First Load JS.*is too heavy/g,
      category: 'performance',
      severity: 'medium',
      message: 'Large bundle size detected',
      suggestion: 'Implement code splitting, lazy loading, tree shaking, or analyze bundle with webpack-bundle-analyzer'
    });

    this.errorPatterns.set('memory-usage', {
      pattern: /JavaScript heap out of memory|FATAL ERROR/g,
      category: 'performance',
      severity: 'high',
      message: 'Memory usage issue',
      suggestion: 'Increase Node.js memory limit: --max-old-space-size=4096, or optimize memory usage in code'
    });

    // Build & Compilation Configuration
    this.errorPatterns.set('config-error', {
      pattern: /Configuration error|Invalid configuration/g,
      category: 'configuration',
      severity: 'high',
      message: 'Build configuration error',
      suggestion: 'Check configuration files (next.config.js, webpack.config.js, tsconfig.json) for syntax errors'
    });

    this.errorPatterns.set('environment-variable', {
      pattern: /Environment variable.*is missing|process\.env\./g,
      category: 'configuration',
      severity: 'medium',
      message: 'Missing environment variable',
      suggestion: 'Add required environment variables to .env.local file or deployment environment'
    });

    // CSS & Styling Issues
    this.errorPatterns.set('css-module', {
      pattern: /Cannot find module.*\.module\.css|CSS import error/g,
      category: 'styling',
      severity: 'medium',
      message: 'CSS module import error',
      suggestion: 'Check CSS module configuration in next.config.js or ensure proper CSS loader setup'
    });

    this.errorPatterns.set('tailwind-config', {
      pattern: /tailwindcss|@apply.*cannot be used/g,
      category: 'styling',
      severity: 'low',
      message: 'Tailwind CSS configuration issue',
      suggestion: 'Check tailwind.config.js for proper content paths and plugin configuration'
    });

    // Testing & Jest Errors
    this.errorPatterns.set('jest-test', {
      pattern: /Jest failed|Test suite failed to run/g,
      category: 'testing',
      severity: 'medium',
      message: 'Jest test failure',
      suggestion: 'Check test configurations, ensure proper mocking, and verify test environment setup'
    });

    this.errorPatterns.set('snapshot-test', {
      pattern: /Snapshot test failed|Snapshots are obsolete/g,
      category: 'testing',
      severity: 'low',
      message: 'Jest snapshot test issue',
      suggestion: 'Update snapshots with "npm test -- -u" or review UI changes that affect snapshots'
    });

    // Authentication & Security
    this.errorPatterns.set('auth-error', {
      pattern: /Authentication error|JWT.*invalid|NextAuth.*error/g,
      category: 'authentication',
      severity: 'high',
      message: 'Authentication error',
      suggestion: 'Check authentication configuration, environment variables, and token validation'
    });

    this.errorPatterns.set('cors-error', {
      pattern: /CORS error|Access-Control-Allow-Origin/g,
      category: 'security',
      severity: 'medium',
      message: 'CORS policy violation',
      suggestion: 'Configure CORS headers in API routes or check origin whitelist in authentication setup'
    });

    // Database & API Errors
    this.errorPatterns.set('database-connection', {
      pattern: /Database connection|Connection refused|ECONNREFUSED/g,
      category: 'database',
      severity: 'high',
      message: 'Database connection error',
      suggestion: 'Check database server status, connection strings, and network connectivity'
    });

    this.errorPatterns.set('api-timeout', {
      pattern: /timeout|ETIMEDOUT|socket hang up/g,
      category: 'api',
      severity: 'medium',
      message: 'API request timeout',
      suggestion: 'Increase timeout settings, optimize API responses, or implement retry logic'
    });

    // Mobile & React Native Specific
    this.errorPatterns.set('react-native-module', {
      pattern: /NativeModule\.|react-native.*not found/g,
      category: 'mobile',
      severity: 'high',
      message: 'React Native module error',
      suggestion: 'Check native module linking, ensure proper iOS/Android setup, or use web-compatible alternatives'
    });

    this.errorPatterns.set('metro-bundler', {
      pattern: /Metro.*error|bundling failed/g,
      category: 'mobile',
      severity: 'high',
      message: 'Metro bundler error',
      suggestion: 'Clear Metro cache: npx react-native start --reset-cache, check import cycles'
    });

    // Web3 & Blockchain Specific
    this.errorPatterns.set('web3-provider', {
      pattern: /web3\.eth|ethers\.providers|Missing provider/g,
      category: 'web3',
      severity: 'medium',
      message: 'Web3 provider error',
      suggestion: 'Check Web3 provider configuration, ensure proper network connection, or use fallback providers'
    });

    this.errorPatterns.set('contract-interaction', {
      pattern: /contract call failed|transaction failed/g,
      category: 'web3',
      severity: 'high',
      message: 'Smart contract interaction error',
      suggestion: 'Verify contract addresses, ABI compatibility, and gas settings for transactions'
    });

    // File System & I/O Errors
    this.errorPatterns.set('file-not-found', {
      pattern: /ENOENT|no such file or directory/g,
      category: 'filesystem',
      severity: 'medium',
      message: 'File not found error',
      suggestion: 'Check file paths, ensure files exist, and verify case sensitivity in imports'
    });

    this.errorPatterns.set('permission-denied', {
      pattern: /EACCES|permission denied/g,
      category: 'filesystem',
      severity: 'high',
      message: 'File system permission error',
      suggestion: 'Check file permissions, run with appropriate user privileges, or fix ownership issues'
    });

    // Generic Fallback Patterns
    this.errorPatterns.set('generic-error', {
      pattern: /Error:|ERROR\s|Exception:/g,
      category: 'general',
      severity: 'medium',
      message: 'Generic error detected',
      suggestion: 'Review error context in logs, check recent code changes, and verify environment setup'
    });

    this.errorPatterns.set('warning-message', {
      pattern: /Warning:|WARN\s/g,
      category: 'general',
      severity: 'low',
      message: 'Generic warning',
      suggestion: 'Review warnings as they may indicate potential issues or deprecated usage'
    });

    // Network & HTTP Errors
    this.errorPatterns.set('network-error', {
      pattern: /Network Error|net::ERR_/g,
      category: 'network',
      severity: 'medium',
      message: 'Network connection error',
      suggestion: 'Check internet connection, API endpoint availability, and CORS configuration'
    });

    this.errorPatterns.set('http-status', {
      pattern: /404 Not Found|500 Internal Server Error|403 Forbidden/g,
      category: 'network',
      severity: 'medium',
      message: 'HTTP status error',
      suggestion: 'Check API endpoints, server status, and request/response handling'
    });
  }

  private async loadBuildData(): Promise<void> {
    // Look for common build log locations
    const possibleLogPaths = [
      '.next/build.log',
      'build.log',
      'logs/build.log',
      'npm-debug.log',
      'yarn-error.log'
    ];

    for (const logPath of possibleLogPaths) {
      if (fs.existsSync(logPath)) {
        try {
          const content = await fs.promises.readFile(logPath, 'utf8');
          this.buildLogs.push(content);
        } catch (error) {
          console.warn(`Could not read build log: ${logPath}`);
        }
      }
    }

    // Look for TypeScript error files
    const tsConfigPath = 'tsconfig.json';
    if (fs.existsSync(tsConfigPath)) {
      const tsBuildInfo = 'tsconfig.tsbuildinfo';
      if (fs.existsSync(tsBuildInfo)) {
        this.errorFiles.push(tsBuildInfo);
      }
    }
  }

  private analyzeBuildLogs(): Correction[] {
    const corrections: Correction[] = [];
    
    if (this.buildLogs.length === 0) {
      return corrections;
    }

    const combinedLogs = this.buildLogs.join('\n');
    
    this.errorPatterns.forEach((patternConfig, patternId) => {
      const matches = combinedLogs.match(patternConfig.pattern);
      if (matches && matches.length > 0) {
        const uniqueMatches = [...new Set(matches)].slice(0, 5); // Show first 5 unique matches
        
        corrections.push(this.create(
          patternId,
          'error',
          patternConfig.severity,
          `${patternConfig.message} (${matches.length} occurrences)`,
          'build-logs',
          uniqueMatches.join('\n'),
          patternConfig.suggestion,
          patternConfig.category
        ));
      }
    });

    return corrections;
  }



  private analyzeTypeScriptErrors(): Correction[] {
    const corrections: Correction[] = [];
    
    // Run TypeScript compiler to get current errors
    try {
      const { execSync } = require('child_process');
      const result = execSync('npx tsc --noEmit --pretty false 2>&1', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'] // Capture stderr
      });
      
      if (result && result.length > 0) {
        const tsErrors = this.extractTypeScriptErrors(result);
        corrections.push(...tsErrors);
      }
    } catch (error: any) {
      // execSync throws when tsc finds errors, which is expected
      if (error.stdout || error.stderr) {
        const output = error.stdout || error.stderr;
        const tsErrors = this.extractTypeScriptErrors(output);
        corrections.push(...tsErrors);
      }
    }

    return corrections;
  }



  private extractTypeScriptErrors(compilerOutput: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = compilerOutput.split('\n');
    
    let currentError: { message: string; file?: string; line?: number } | null = null;

    for (const line of lines) {
      // Match TypeScript error format: file.ts(line,column): error TS1234: message
      const errorMatch = line.match(/(.+\.tsx?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s*(.+)/);
      
      if (errorMatch) {
        // If we have a previous error, add it to corrections
        if (currentError) {
          corrections.push(this.create(
            `typescript-error-${Date.now()}`,
            'error',
            'high',
            currentError.message,
            currentError.file || 'unknown',
            line,
            'Fix TypeScript compilation error',
            'compilation',
            currentError.line
          ));
        }

        const [, file, lineNum, , errorCode, message] = errorMatch;
        currentError = {
          message: `TypeScript Error ${errorCode}: ${message}`,
          file,
          line: parseInt(lineNum)
        };
      } else if (currentError && line.trim()) {
        // Continue building the error message for multi-line errors
        currentError.message += `\n${line.trim()}`;
      }
    }

    // Don't forget the last error
    if (currentError) {
      corrections.push(this.create(
        `typescript-error-${Date.now()}`,
        'error',
        'high',
        currentError.message,
        currentError.file || 'unknown',
        currentError.message,
        'Fix TypeScript compilation error',
        'compilation',
        currentError.line
      ));
    }

    return corrections;
  }


  private analyzeEslintOutput(): Correction[] {
    const corrections: Correction[] = [];
    
    try {
      const { execSync } = require('child_process');
      const result = execSync('npx eslint . --format json 2>&1', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      if (result && !result.includes('Command failed')) {
        try {
          const eslintResults = JSON.parse(result);
          
          eslintResults.forEach((file: any) => {
            file.messages.forEach((message: any) => {
              corrections.push(this.create(
                `eslint-${message.ruleId || 'unknown'}`,
                message.severity === 2 ? 'error' : 'warning',
                message.severity === 2 ? 'high' : 'medium',
                `ESLint: ${message.message} (${message.ruleId})`,
                file.filePath,
                `Line ${message.line}: ${message.message}`,
                `Fix ESLint rule violation: ${message.ruleId}`,
                'linting',
                message.line
              ));
            });
          });
        } catch (parseError) {
          // If JSON parsing fails, try to extract errors from text output
          const eslintErrors = this.extractEslintErrors(result);
          corrections.push(...eslintErrors);
        }
      }
    } catch (error) {
      // ESLint might not be configured or might have errors
      console.warn('ESLint analysis skipped or failed');
    }

    return corrections;
  }


  private extractEslintErrors(output: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = output.split('\n');
    
    lines.forEach(line => {
      // Match ESLint error format: /path/to/file.ts: line 1, col 5, Error - Message (rule-name)
      const eslintMatch = line.match(/(.+):\s+line\s+(\d+),\s+col\s+(\d+),\s+(Error|Warning)\s+-\s+(.+)\s+\((.+)\)/);
      
      if (eslintMatch) {
        const [, filePath, lineNum, , level, message, ruleId] = eslintMatch;
        
        corrections.push(this.create(
          `eslint-${ruleId}`,
          level.toLowerCase() as 'error' | 'warning',
          level === 'Error' ? 'high' : 'medium',
          `ESLint: ${message} (${ruleId})`,
          filePath,
          message,
          `Fix ESLint rule violation: ${ruleId}`,
          'linting',
          parseInt(lineNum)
        ));
      }
    });

    return corrections;
  }



  private analyzeDependencies(): Correction[] {
    const corrections: Correction[] = [];
    const packageJsonPath = 'package.json';
    
    if (!fs.existsSync(packageJsonPath)) {
      return corrections;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Check for missing peer dependencies
      if (packageJson.peerDependencies) {
        Object.keys(packageJson.peerDependencies).forEach(dep => {
          if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
            corrections.push(this.create(
              `missing-peer-dependency-${dep}`,
              'warning',
              'medium',
              `Missing peer dependency: ${dep}`,
              packageJsonPath,
              `Peer dependency "${dep}" is required but not installed`,
              `Install ${dep} as a dependency: npm install ${dep}`,
              'dependencies'
            ));
          }
        });
      }

      // Check for version conflicts in resolutions
      if (packageJson.resolutions) {
        Object.entries(packageJson.resolutions).forEach(([pkg, version]) => {
          corrections.push(this.create(
            `resolution-conflict-${pkg}`,
            'info',
            'low',
            `Dependency resolution override: ${pkg}`,
            packageJsonPath,
            `Version ${version} enforced for ${pkg}`,
            'Monitor for potential compatibility issues',
            'dependencies'
          ));
        });
      }

    } catch (error) {
      console.warn('Could not analyze package.json for dependency issues');
    }

    return corrections;
  }



  // Helper method to get error statistics
  getErrorStatistics(): ErrorStatistics {
    const corrections = this.analyzeBuildLogs();
    
    const byCategory = corrections.reduce((acc, correction) => {
      acc[correction.category] = (acc[correction.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = corrections.reduce((acc, correction) => {
      acc[correction.severity] = (acc[correction.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: corrections.length,
      byCategory,
      bySeverity,
      mostCommonError: corrections[0]?.message || 'No errors found'
    };
  }
  
  parseReactNativeBuildErrors(logContent: string, logFile: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = logContent.split('\n');

    // React-Native-specific map
    lines.forEach((line, index) => {
      for (const [errText, meta] of Object.entries(this.reactNativeErrors)) {
        if (line.toLowerCase().includes(errText.toLowerCase())) {
          corrections.push(this.createCorrection(
            `rn-error-${errText.replace(/\s+/g, '-').toLowerCase()}-${logFile}-${index}`,
            'error',
            meta.severity,
            `React Native: ${errText}`,
            logFile,
            line.trim(),
            meta.fix,
            meta.category
          ));
        }
      }
    });

    const errorPatterns = [
      {
        pattern: /Unable to resolve module (["'`])([^"'`]+)\1/,
        id: 'module-resolution-error',
        type: 'error' as const,
        severity: 'high' as const,
        title: 'Module resolution error',
        suggestion: 'Install missing dependency or fix import path',
        category: 'compilation' as const
      },
      {
        pattern: /Invariant Violation: (.*)/,
        id: 'invariant-violation',
        type: 'error' as const,
        severity: 'critical' as const,
        title: 'Invariant Violation',
        suggestion: 'Check component props and state management',
        category: 'runtime' as const
      },
      {
        pattern: /Error: (.*) is not a function/,
        id: 'not-a-function',
        type: 'error' as const,
        severity: 'high' as const,
        title: 'Function call on non-function',
        suggestion: 'Check function exports and imports',
        category: 'runtime' as const
      },
      {
        pattern: /TypeError: (.*) is not an object/,
        id: 'not-an-object',
        type: 'error' as const,
        severity: 'high' as const,
        title: 'Property access on non-object',
        suggestion: 'Check object initialization and null checks',
        category: 'runtime' as const
      },
      {
        pattern: /TransformError: (.*)/,
        id: 'transform-error',
        type: 'error' as const,
        severity: 'high' as const,
        title: 'Babel transform error',
        suggestion: 'Check Babel configuration and file syntax',
        category: 'compilation' as const
      },
      {
        pattern: /Native module (.*) cannot be null/,
        id: 'native-module-null',
        type: 'error' as const,
        severity: 'critical' as const,
        title: 'Native module not found',
        suggestion: 'Check React Native linking and native dependencies',
        category: 'runtime' as const
      },
      {
        pattern: /No bundle URL present/,
        id: 'no-bundle-url',
        type: 'error' as const,
        severity: 'critical' as const,
        title: 'Metro bundle not available',
        suggestion: 'Check Metro bundler and React Native server',
        category: 'runtime' as const
      },
      {
        pattern: /AppRegistry is not a registered callable module/,
        id: 'app-registry-error',
        type: 'error' as const,
        severity: 'critical' as const,
        title: 'App registration error',
        suggestion: 'Check app entry point and registration',
        category: 'runtime' as const
      },
      {
        pattern: /Maximum update depth exceeded/,
        id: 'update-depth-exceeded',
        type: 'error' as const,
        severity: 'high' as const,
        title: 'Infinite re-render loop',
        suggestion: 'Check useEffect dependencies and state updates',
        category: 'runtime' as const
      },
      {
        pattern: /VirtualizedList: missing keys/,
        id: 'virtualized-list-keys',
        type: 'warning' as const,
        severity: 'medium' as const,
        title: 'Missing keys in VirtualizedList',
        suggestion: 'Add unique key prop to list items',
        category: 'performance' as const
      }
    ];

    errorPatterns.forEach(({ pattern, id, type, severity, title, suggestion, category }) => {
      let m;
      while ((m = pattern.exec(logContent)) !== null) {
        corrections.push(this.createCorrection(
          `${id}-${logFile}`,
          type,
          severity,
          title,
          logFile,
          this.extractErrorContext(logContent, m[0]),
          suggestion,
          category
        ));
      }
    });

    const versionConflictPattern = /found: (.*)\n.*required: (.*)/g;
    const versionConflicts = logContent.match(versionConflictPattern);
    if (versionConflicts) {
      corrections.push(this.createCorrection(
        `version-conflict-${logFile}`,
        'error',
        'high',
        'Dependency version conflict detected',
        logFile,
        versionConflicts[0],
        'Resolve dependency version conflicts in package.json',
        'compilation'
      ));
    }

    if (logContent.includes('JavaScript heap out of memory')) {
      corrections.push(this.createCorrection(
        `memory-exhaustion-${logFile}`,
        'error',
        'high',
        'JavaScript heap memory exhausted',
        logFile,
        'Memory allocation failure',
        'Increase Node.js memory limit or optimize bundle size',
        'performance'
      ));
    }

    return corrections;
  }

  private extractErrorContext(logContent: string, errorLine: string, contextLines: number = 2): string {
    const lines = logContent.split('\n');
    let context = '';

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(errorLine)) {
        const start = Math.max(0, i - contextLines);
        const end = Math.min(lines.length, i + contextLines + 1);
        context = lines.slice(start, end).join('\n');
        break;
      }
    }

    return context.substring(0, 500);
  }

  // Copied from original ReactNativeAnalyzer
  private reactNativeErrors = {
    'Native module cannot be null': {
      severity: 'critical' as const,
      category: 'runtime' as const,
      fix: 'Check React Native linking and native module installation'
    },
    'Invariant Violation: requireNativeComponent': {
      severity: 'critical' as const,
      category: 'compilation' as const,
      fix: 'Verify React Native component registration and linking'
    },
    'No bundle URL present': {
      severity: 'critical' as const,
      category: 'runtime' as const,
      fix: 'Check Metro bundler and React Native server'
    },
    'Module AppRegistry is not a registered callable module': {
      severity: 'critical' as const,
      category: 'runtime' as const,
      fix: 'Check React Native app registration and Metro bundler'
    },
    'Unable to resolve module': {
      severity: 'critical' as const,
      category: 'compilation' as const,
      fix: 'Install missing dependency or fix import path'
    },
    'TransformError': {
      severity: 'high' as const,
      category: 'compilation' as const,
      fix: 'Check Babel configuration and Metro bundler settings'
    },
    'Unable to resolve module from': {
      severity: 'high' as const,
      category: 'compilation' as const,
      fix: 'Verify import paths and module installations'
    }
  };
}