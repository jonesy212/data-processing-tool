// analyzers/BuildAnalyzer.ts
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ConfigFileAnalyzer } from '@/app/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer';

const execAsync = promisify(exec);

export class BuildAnalyzer extends ConfigFileAnalyzer {
  protected getConfigPaths(): string[] {
    return [
      'package.json',
      'tsconfig.json',
      'webpack.config.js',
      'vite.config.js',
      'next.config.mjs',
      'rollup.config.mjs',
      '.babelrc',
      'babel.config.js',
      'jest.config.js',
      'vitest.config.js',
      'metro.config.js'
    ];
  }

  protected async analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    try {
      const configContent = await this.readConfigFile(configPath);
      
      if (configContent === null) {
        // File doesn't exist or can't be read - return early
        return corrections; // Or add an error correction if you prefer
      }

      // Use a switch statement for cleaner logic
      const analysisMap: Record<string, (content: string, file: string) => Correction[]> = {
        'package.json': this.analyzePackageJson.bind(this),
        'tsconfig.json': this.analyzeTsConfig.bind(this),
        // Add other file types...
      };

      // Also handle pattern-based matches
      const analyzeByPattern = (content: string, file: string): Correction[] => {
        if (file.includes('webpack')) return this.analyzeWebpackConfig(content, file);
        if (file.includes('vite')) return this.analyzeViteConfig(content, file);
        if (file.includes('next')) return this.analyzeNextConfig(content, file);
        if (file.includes('metro')) return this.analyzeMetroConfig(content, file);
        if (file.includes('babel')) return this.analyzeBabelConfig(content, file);
        return [];
      };

      // Try exact match first, then pattern match
      const analyzer = analysisMap[configFile] || analyzeByPattern;
      const fileCorrections = analyzer(configContent, configFile);
      corrections.push(...fileCorrections);

    } catch (error) {
      corrections.push(this.createCorrection(
        `build-config-parse-error-${configFile}`,
        'error',
        'high',
        `Failed to parse build configuration: ${configFile}`,
        configFile,
        `Parse error: ${error}`,
        `Fix syntax errors in ${configFile}`,
        'compilation'
      ));
    }

    return corrections;
  }

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    console.log('🔨 Analyzing build system...');

    // Use parent class to analyze config files
    const configCorrections = await super.analyze();
    corrections.push(...configCorrections);

    // Analyze build logs
    const logErrors = await this.analyzeBuildLogs();
    corrections.push(...logErrors);

    // Analyze build scripts
    const scriptErrors = this.analyzeBuildScripts();
    corrections.push(...scriptErrors);

    // Analyze dependencies for build issues
    const dependencyErrors = this.analyzeBuildDependencies();
    corrections.push(...dependencyErrors);

    // Test build commands
    const commandErrors = await this.testBuildCommands();
    corrections.push(...commandErrors);

    // Analyze React Native specific build configurations
    const rnBuildErrors = this.analyzeReactNativeBuildConfigs();
    corrections.push(...rnBuildErrors);

    return corrections;
  }


  private async readConfigFile(configPath: string): Promise<string | null> {
    try {
      const fullPath = path.resolve(process.cwd(), configPath);
      
      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        return null;
      }

      // Read file content
      const content = await fs.promises.readFile(fullPath, 'utf8');
      return content;
      
    } catch (error) {
      console.warn(`Could not read config file ${configPath}:`, error);
      return null;
    }
  }


  private hasPnpmWorkspace(): boolean {
    const workspacePath = path.resolve(process.cwd(), 'pnpm-workspace.yaml');
    return fs.existsSync(workspacePath);
  }

  private analyzePackageJson(content: string, configFile: string): Correction[] {
    const corrections: Correction[] = [];
    
    try {
      const packageJson = JSON.parse(content);
      const scripts = packageJson.scripts || {};
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Check for missing build scripts
      if (!scripts.build && !scripts.dev) {
        corrections.push(this.createCorrection(
          'missing-build-scripts',
          'warning',
          'medium',
          'No build or dev scripts found in package.json',
          configFile,
          JSON.stringify(scripts, null, 2),
          'Add build and dev scripts to package.json',
          'compilation'
        ));
      }

      // Check for complex build scripts that might fail
      Object.entries(scripts).forEach(([scriptName, script]) => {
        if (typeof script === 'string') {
          if (script.split('&&').length > 3) {
            corrections.push(this.createCorrection(
              `complex-build-script-${scriptName}`,
              'warning',
              'medium',
              `Complex build script "${scriptName}" may be prone to failures`,
              configFile,
              script,
              'Break complex scripts into smaller, manageable steps',
              'compilation'
            ));
          }

          // Check for risky commands
          if (script.includes('rm -rf') && !script.includes('node_modules')) {
            corrections.push(this.createCorrection(
              `risky-command-${scriptName}`,
              'warning',
              'high',
              `Risky command found in script "${scriptName}"`,
              configFile,
              script,
              'Avoid destructive commands in build scripts',
              'security'
            ));
          }
        }
      });

      // Check for build tool dependencies
      const buildTools = ['webpack', 'vite', 'rollup', 'esbuild', 'tsc'];
      const hasBuildTool = buildTools.some(tool => dependencies[tool]);
      
      if (!hasBuildTool && !dependencies['react-scripts']) {
        corrections.push(this.createCorrection(
          'missing-build-tool',
          'warning',
          'medium',
          'No build tool detected in dependencies',
          configFile,
          JSON.stringify(dependencies, null, 2),
          'Install a build tool like webpack, vite, or use react-scripts',
          'compilation'
        ));
      }

      // React Native specific checks
      if (dependencies['react-native']) {
        if (!scripts.ios && !scripts.android) {
          corrections.push(this.createCorrection(
            'missing-rn-build-scripts',
            'suggestion',
            'low',
            'Missing React Native platform build scripts',
            configFile,
            JSON.stringify(scripts, null, 2),
            'Add scripts for iOS and Android builds',
            'compilation'
          ));
        }
      }

    } catch (error) {
      corrections.push(this.createCorrection(
        'package-json-parse-error',
        'error',
        'high',
        'Failed to parse package.json',
        configFile,
        'Parse error',
        'Fix JSON syntax errors in package.json',
        'compilation'
      ));
    }

    return corrections;
  }

  private analyzeTsConfig(content: string, configFile: string): Correction[] {
    const corrections: Correction[] = [];
    
    try {
          
      // Check if content is empty
      if (content.trim().length === 0) {
        corrections.push(this.createCorrection(
          'tsconfig-empty',
          'error',
          'high',
          'TypeScript configuration file is empty',
          configFile,
          'File contains no content',
          'Add valid TypeScript configuration to tsconfig.json',
          'compilation'
        ));
        return corrections;
      }

      const tsconfig = JSON.parse(content);
      const compilerOptions = tsconfig.compilerOptions || {};

      // Check for problematic TypeScript settings
      if (compilerOptions.noEmit === true) {
        corrections.push(this.createCorrection(
          'tsconfig-no-emit',
          'warning',
          'medium',
          'TypeScript configured with noEmit - no files will be generated',
          configFile,
          JSON.stringify(compilerOptions, null, 2),
          'Set noEmit to false for production builds',
          'compilation'
        ));
      }

      if (compilerOptions.noImplicitAny === false) {
        corrections.push(this.createCorrection(
          'tsconfig-no-implicit-any-disabled',
          'warning',
          'medium',
          'noImplicitAny is disabled - this can hide type errors',
          configFile,
          JSON.stringify(compilerOptions, null, 2),
          'Enable noImplicitAny for better type safety',
          'compilation'
        ));
      }

      if (!compilerOptions.strict) {
        corrections.push(this.createCorrection(
          'tsconfig-strict-disabled',
          'warning',
          'medium',
          'Strict mode is disabled in TypeScript configuration',
          configFile,
          JSON.stringify(compilerOptions, null, 2),
          'Enable strict mode for better type checking',
          'compilation'
        ));
      }

      // Check for missing output directory
      if (!compilerOptions.outDir && !tsconfig.include?.includes('dist')) {
        corrections.push(this.createCorrection(
          'tsconfig-missing-outdir',
          'suggestion',
          'low',
          'No output directory specified in TypeScript configuration',
          configFile,
          JSON.stringify(compilerOptions, null, 2),
          'Add outDir configuration for better build organization',
          'structure'
        ));
      }

    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';

      corrections.push(this.createCorrection(
        'tsconfig-parse-error',
        'error',
        'high',
        `Failed to parse tsconfig.json: ${errorMessage}`,
        configFile,
        `Parse error: ${errorMessage}`,
        'Fix JSON syntax errors in tsconfig.json',
        'compilation'
      ));
    }

    return corrections;
  }

  private analyzeWebpackConfig(content: string, configFile: string): Correction[] {
    const corrections: Correction[] = [];
    
    // Check for common webpack issues
    if (!content.includes('mode') && !content.includes('process.env.NODE_ENV')) {
      corrections.push(this.createCorrection(
        'webpack-missing-mode',
        'warning',
        'medium',
        'Webpack configuration missing mode setting',
        configFile,
        content.substring(0, 200) + '...',
        'Set mode to "development" or "production" for better optimizations',
        'performance'
      ));
    }

    if (content.includes('eval') && !content.includes('devtool')) {
      corrections.push(this.createCorrection(
        'webpack-potential-eval',
        'warning',
        'medium',
        'Webpack configuration may use eval devtool in production',
        configFile,
        this.extractLineContaining(content, 'eval'),
        'Avoid eval devtool in production builds for security',
        'security'
      ));
    }

    return corrections;
  }

  private analyzeViteConfig(content: string, configFile: string): Correction[] {
    const corrections: Correction[] = [];
    
    // Check for Vite-specific issues
    if (!content.includes('defineConfig')) {
      corrections.push(this.createCorrection(
        'vite-missing-defineconfig',
        'suggestion',
        'low',
        'Vite configuration not using defineConfig',
        configFile,
        content.substring(0, 200) + '...',
        'Use defineConfig for better TypeScript support',
        'compilation'
      ));
    }

    return corrections;
  }

  private analyzeNextConfig(content: string, configFile: string): Correction[] {
    const corrections: Correction[] = [];
    
    // Check for Next.js specific issues
    if (content.includes('target:') && !content.includes('target: \'server\'')) {
      corrections.push(this.createCorrection(
        'nextjs-target-warning',
        'warning',
        'medium',
        'Next.js target setting may affect build output',
        configFile,
        this.extractLineContaining(content, 'target:'),
        'Ensure target setting matches your deployment environment',
        'runtime'
      ));
    }

    return corrections;
  }

  private analyzeMetroConfig(content: string, configFile: string): Correction[] {
    const corrections: Correction[] = [];
    
    // Check for Metro bundler specific issues
    if (!content.includes('resolver') && !content.includes('transformer')) {
      corrections.push(this.createCorrection(
        'metro-basic-config',
        'info',
        'low',
        'Metro configuration using basic settings',
        configFile,
        content.substring(0, 200) + '...',
        'Consider customizing resolver and transformer for better performance',
        'performance'
      ));
    }

    return corrections;
  }

  private analyzeBabelConfig(content: string, configFile: string): Correction[] {
    const corrections: Correction[] = [];
    
    // Check for Babel configuration issues
    if (content.includes('presets') && !content.includes('@babel/preset-env')) {
      corrections.push(this.createCorrection(
        'babel-missing-preset-env',
        'suggestion',
        'low',
        'Babel configuration missing @babel/preset-env',
        configFile,
        content.substring(0, 200) + '...',
        'Add @babel/preset-env for better JavaScript compatibility',
        'compilation'
      ));
    }

    return corrections;
  }

  private async analyzeBuildLogs(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Check for build log files
    const logFiles = [
      'build.log',
      'npm-debug.log',
      'yarn-error.log',
      'pnpm-debug.log',
      'next.build.log',
      'vite.build.log'
    ];

    for (const logFile of logFiles) {
      const logPath = path.resolve(process.cwd(), logFile);
      if (fs.existsSync(logPath)) {
        try {
          const logContent = await fs.promises.readFile(logPath, 'utf8');
          const logErrors = this.parseBuildLog(logContent, logFile);
          corrections.push(...logErrors);
        } catch (error) {
          console.warn(`Could not read build log ${logFile}:`, error);
        }
      }
    }

    return corrections;
  }

  private parseBuildLog(logContent: string, logFile: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = logContent.split('\n');
    
    const buildErrorPatterns = [
      {
        pattern: /ERROR in (.*?):(\d+):(\d+)[\s\S]*?TS(\d+): (.*)/,
        handler: (match: RegExpMatchArray) => this.createCorrection(
          `typescript-error-${match[4]}`,
          'error',
          'high',
          `TypeScript Error: ${match[5]}`,
          match[1],
          `Line ${match[2]}: ${match[0]}`,
          'Fix TypeScript compilation errors',
          'compilation',
          parseInt(match[2])
        )
      },
      {
        pattern: /Module not found: (?:Error: )?Can't resolve '(.*?)' in '(.*?)'/,
        handler: (match: RegExpMatchArray) => this.createCorrection(
          'module-not-found',
          'error',
          'critical',
          `Cannot resolve module: ${match[1]}`,
          match[2],
          `import '${match[1]}'`,
          `Install missing dependency: pnpm install ${match[1]}`,
          'compilation'
        )
      },
      {
        pattern: /(SyntaxError|ReferenceError|TypeError): (.*?)\n\s*at (.*?) \((.*?):(\d+):(\d+)\)/,
        handler: (match: RegExpMatchArray) => this.createCorrection(
          `javascript-error-${match[1]}`,
          'error',
          'high',
          `${match[1]}: ${match[2]}`,
          match[4],
          `Error at ${match[4]}:${match[5]}`,
          'Fix JavaScript syntax or runtime error',
          'compilation',
          parseInt(match[5])
        )
      },
      {
        pattern: /Build failed/,
        handler: (match: RegExpMatchArray) => this.createCorrection(
          'build-failed',
          'error',
          'critical',
          'Build process failed',
          logFile,
          'Build failed message detected',
          'Check build configuration and fix compilation errors',
          'compilation'
        )
      }
    ];

    lines.forEach((line, index) => {
      for (const { pattern, handler } of buildErrorPatterns) {
        const match = line.match(pattern);
        if (match) {
          const correction = handler(match);
          correction.id = `${logFile}-${index}-${correction.id}`;
          corrections.push(correction);
          break;
        }
      }
    });

    return corrections;
  }

  private analyzeBuildScripts(): Correction[] {
    const corrections: Correction[] = [];
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return corrections;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const scripts = packageJson.scripts || {};

      // Check for pre/post build hooks
      if (scripts.build && !scripts['prebuild'] && !scripts['postbuild']) {
        corrections.push(this.createCorrection(
          'missing-build-hooks',
          'suggestion',
          'low',
          'No prebuild or postbuild hooks found',
          'package.json',
          JSON.stringify(scripts, null, 2),
          'Consider adding prebuild/postbuild hooks for build automation',
          'structure'
        ));
      }

      // Check for long-running build scripts
      Object.entries(scripts).forEach(([name, script]) => {
        if (typeof script === 'string' && script.includes('--watch') && !scripts['build:watch']) {
          corrections.push(this.createCorrection(
            `watch-script-naming-${name}`,
            'suggestion',
            'low',
            `Watch script "${name}" should follow naming convention`,
            'package.json',
            script,
            'Rename to "build:watch" for consistency',
            'structure'
          ));
        }
      });

    } catch (error) {
      // Error handling already covered in analyzePackageJson
    }

    return corrections;
  }

  private analyzeBuildDependencies(): Correction[] {
    const corrections: Correction[] = [];
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return corrections;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Check for missing TypeScript if .ts files exist
      const hasTsFiles = this.hasTypeScriptFiles();
      if (hasTsFiles && !deps.typescript && !deps['@types/node']) {
        corrections.push(this.createCorrection(
          'missing-typescript-deps',
          'error',
          'high',
          'TypeScript files found but TypeScript not installed',
          'package.json',
          'TypeScript dependency missing',
          'Install TypeScript: npm install --save-dev typescript @types/node',
          'compilation'
        ));
      }

      // Check for build tool version compatibility
      if (deps.typescript && deps['@types/node']) {
        const tsVersion = deps.typescript;
        const nodeTypesVersion = deps['@types/node'];
        
        // Basic version compatibility check
        if (tsVersion.startsWith('4.') && nodeTypesVersion.startsWith('16.')) {
          corrections.push(this.createCorrection(
            'typescript-version-mismatch',
            'warning',
            'medium',
            'Potential TypeScript and Node.js type version mismatch',
            'package.json',
            `TypeScript: ${tsVersion}, @types/node: ${nodeTypesVersion}`,
            'Ensure TypeScript and Node.js type versions are compatible',
            'compilation'
          ));
        }
      }

    } catch (error) {
      // Error handling already covered elsewhere
    }

    return corrections;
  }

  private async testBuildCommands(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    try {
      // Test if build command works
      const { stderr } = await execAsync('npm run build --dry-run', {
        cwd: process.cwd(),
        timeout: 30000
      }).catch(error => ({ stderr: error.stderr || error.message }));

      if (stderr && stderr.includes('missing script: build')) {
        corrections.push(this.createCorrection(
          'missing-build-script',
          'error',
          'high',
          'No build script found in package.json',
          'package.json',
          'npm run build failed',
          'Add a build script to package.json',
          'compilation'
        ));
      }

    } catch (error) {
      // This is expected if build script doesn't exist
    }

    return corrections;
  }

  private analyzeReactNativeBuildConfigs(): Correction[] {
    const corrections: Correction[] = [];
    
    // Check for React Native specific build configurations
    const rnConfigs = [
      'android/app/build.gradle',
      'android/build.gradle',
      'ios/Podfile',
      'metro.config.js'
    ];

    rnConfigs.forEach(configPath => {
      const fullPath = path.resolve(process.cwd(), configPath);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const rnErrors = this.analyzeReactNativeConfig(content, configPath);
          corrections.push(...rnErrors);
        } catch (error) {
          // Skip files that can't be read
        }
      }
    });

    return corrections;
  }

  private analyzeReactNativeConfig(content: string, configPath: string): Correction[] {
    const corrections: Correction[] = [];
    
    if (configPath.includes('build.gradle')) {
      // Android build configuration checks
      if (!content.includes('minSdkVersion')) {
        corrections.push(this.createCorrection(
          'android-missing-minsdk',
          'warning',
          'medium',
          'Android minSdkVersion not specified',
          configPath,
          'Missing minSdkVersion configuration',
          'Specify minSdkVersion for Android compatibility',
          'compilation'
        ));
      }
    } else if (configPath.includes('Podfile')) {
      // iOS build configuration checks
      if (!content.includes('platform :ios')) {
        corrections.push(this.createCorrection(
          'ios-missing-platform',
          'warning',
          'medium',
          'iOS platform version not specified in Podfile',
          configPath,
          'Missing platform configuration',
          'Specify iOS platform version in Podfile',
          'compilation'
        ));
      }
    }

    return corrections;
  }

  private hasTypeScriptFiles(): boolean {
    try {
      const srcPath = path.resolve(process.cwd(), 'src');
      if (fs.existsSync(srcPath)) {
        const files = fs.readdirSync(srcPath, { recursive: true }) as string[];
        return files.some(file => file.endsWith('.ts') || file.endsWith('.tsx'));
      }
    } catch {
      // Ignore errors
    }
    return false;
  }
  
  // Add this helper method to both analyzers
  private extractJsonErrorContext(content: string, error: Error): string {
    if (error.message.includes('position')) {
      // Extract position from error message like "JSON.parse: expected property name or '}' at line 1 column 2 of the JSON data"
      const positionMatch = error.message.match(/position\s+(\d+)/) || error.message.match(/at position\s+(\d+)/);
      if (positionMatch) {
        const position = parseInt(positionMatch[1]);
        const start = Math.max(0, position - 20);
        const end = Math.min(content.length, position + 20);
        return `Error around: ...${content.substring(start, end)}...`;
      }
    }
    
    // Fallback: show first 100 chars
    return `Content start: ${content.substring(0, 100)}...`;
  }

  protected extractLineContaining(content: string, searchText: string): string {
    const lines = content.split('\n');
    const line = lines.find(l => l.includes(searchText));
    return line || 'Not found';
  }

}