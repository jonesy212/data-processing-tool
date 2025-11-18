// TsConfigAnalyzer.ts
import { ConfigFileAnalyzer } from '@/app/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer'
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';

export class TsConfigAnalyzer extends ConfigFileAnalyzer {
  protected getConfigPaths(): string[] {
    return ['./tsconfig.json', './tsconfig.build.json'];
  }

  protected async analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]> {
    const corrections: Correction[] = [];

    try {
      const content = await fs.promises.readFile(configPath, 'utf8');
      
      // Check if file is empty first
      if (content.trim().length === 0) {
        corrections.push(this.createCorrection(
          'tsconfig-empty',
          'error',
          'high',
          'TypeScript configuration file is empty',
          configPath,
          'File contains no content - only whitespace or empty object',
          'Add valid TypeScript configuration to enable proper compilation',
          'compilation'
        ));
        return corrections;
      }
      
      const tsConfig = JSON.parse(content);
      const compilerOptions = tsConfig.compilerOptions || {};
      const isReactNative = this.isReactNativeProject();

      // Check for missing compiler options with proper descriptions
      if (!compilerOptions.target) {
        corrections.push(this.createCorrection(
          'tsconfig-missing-target',
          'warning',
          'medium',
          'TypeScript target not specified',
          configPath,
          'Missing "target" in compilerOptions - ECMAScript version is undefined',
          'Add "target": "esnext" or specific ECMAScript version like "es2020"',
          'compilation'
        ));
      }

      if (!compilerOptions.lib && !compilerOptions.skipLibCheck) {
        corrections.push(this.createCorrection(
          'tsconfig-missing-lib',
          'suggestion',
          'low',
          'TypeScript lib files not specified',
          configPath,
          'Missing "lib" in compilerOptions - default libraries will be used',
          'Add "lib": ["esnext", "dom"] or specific libraries needed for your environment',
          'compilation'
        ));
      }

      // React Native specific checks with proper descriptions
      if (isReactNative) {
        if (!compilerOptions.jsx) {
          corrections.push(this.createCorrection(
            'tsconfig-missing-jsx-rn',
            'error',
            'high',
            'JSX configuration missing for React Native',
            configPath,
            'Missing "jsx" in compilerOptions - JSX files will not be processed correctly',
            'Add "jsx": "react-native" for proper React Native JSX transformation',
            'compilation'
          ));
        }

        if (compilerOptions.moduleResolution !== 'node') {
          corrections.push(this.createCorrection(
            'tsconfig-module-resolution-rn',
            'warning',
            'medium',
            'Recommended module resolution for React Native',
            configPath,
            `Current moduleResolution: "${compilerOptions.moduleResolution || 'not set'}" - React Native requires "node" resolution`,
            'Set "moduleResolution": "node" for proper React Native module resolution',
            'compilation'
          ));
        }
      }

      // Check for strict mode with proper description
      if (!compilerOptions.strict) {
        corrections.push(this.createCorrection(
          'tsconfig-non-strict',
          'suggestion',
          'low',
          'TypeScript strict mode disabled',
          configPath,
          'strict: false - type checking is less comprehensive',
          'Enable "strict": true for better type safety and error detection',
          'quality'
        ));
      }

      // Check for module system with proper description
      if (!compilerOptions.module) {
        corrections.push(this.createCorrection(
          'tsconfig-missing-module',
          'warning',
          'medium',
          'Module system not specified',
          configPath,
          'Missing "module" in compilerOptions - module format is undefined',
          'Set "module": "esnext" for modern bundlers or "commonjs" for Node.js',
          'compilation'
        ));
      }

      // Check for path mappings with proper description
      if (!compilerOptions.paths && configPath.includes('tsconfig.json')) {
        corrections.push(this.createCorrection(
          'tsconfig-no-path-mappings',
          'suggestion',
          'low',
          'No path mappings configured',
          configPath,
          'Missing "paths" in compilerOptions - absolute imports not available',
          'Configure path mappings for cleaner imports: "paths": { "@/*": ["./src/*"], "@/components/*": ["./src/components/*"] }',
          'structure'
        ));
      }

      // Check for output directory with proper description
      if (!compilerOptions.outDir && !compilerOptions.noEmit) {
        corrections.push(this.createCorrection(
          'tsconfig-no-outdir',
          'suggestion',
          'low',
          'Output directory not specified',
          configPath,
          'Missing "outDir" in compilerOptions - compiled files location undefined',
          'Set "outDir": "./dist" or specify your preferred output directory for compiled files',
          'structure'
        ));
      }

      // Check for declaration files with proper description
      if (!compilerOptions.declaration && this.isLibraryProject()) {
        corrections.push(this.createCorrection(
          'tsconfig-no-declarations',
          'warning',
          'medium',
          'TypeScript declarations not enabled for library',
          configPath,
          'declaration: false - no .d.ts files will be generated',
          'Enable "declaration": true to generate type definition files for your library',
          'compilation'
        ));
      }

      // Check for source maps with proper description
      if (!compilerOptions.sourceMap) {
        corrections.push(this.createCorrection(
          'tsconfig-no-sourcemaps',
          'suggestion',
          'low',
          'Source maps disabled',
          configPath,
          'sourceMap: false - debugging will show compiled code instead of source',
          'Enable "sourceMap": true for better debugging experience in browsers and IDEs',
          'development'
        ));
      }

      // Check for include/exclude patterns with proper descriptions
      if (!tsConfig.include && configPath.includes('tsconfig.json')) {
        corrections.push(this.createCorrection(
          'tsconfig-no-include',
          'warning',
          'medium',
          'No include patterns specified',
          configPath,
          'Missing "include" array - TypeScript may not know which files to compile',
          'Add "include": ["src/**/*", "**/*.ts", "**/*.tsx"] to specify compilation scope',
          'compilation'
        ));
      }

      if (tsConfig.exclude && tsConfig.exclude.includes('node_modules')) {
        // This is actually good practice, no correction needed
      } else if (!tsConfig.exclude) {
        corrections.push(this.createCorrection(
          'tsconfig-no-exclude',
          'suggestion',
          'low',
          'No exclude patterns specified',
          configPath,
          'Missing "exclude" array - unnecessary files may be compiled',
          'Add "exclude": ["node_modules", "dist", "build", "**/*.test.*", "**/*.spec.*"] to optimize compilation',
          'performance'
        ));
      }

      // Check for extended configs with proper description
      if (tsConfig.extends && !this.isValidExtendsPath(tsConfig.extends)) {
        corrections.push(this.createCorrection(
          'tsconfig-invalid-extends',
          'error',
          'high',
          'Invalid extends path in tsconfig',
          configPath,
          `extends: "${tsConfig.extends}" - referenced configuration file not found`,
          'Fix the extends path or ensure the referenced configuration file exists',
          'compilation'
        ));
      }

      // Check for React Native specific issues with proper descriptions
      if (isReactNative) {
        if (compilerOptions.target === 'es5') {
          corrections.push(this.createCorrection(
            'tsconfig-es5-target-rn',
            'warning',
            'medium',
            'ES5 target may cause issues in React Native',
            configPath,
            'target: "es5" - React Native works better with modern ECMAScript targets',
            'Use "target": "esnext" or "es2017" for better React Native performance',
            'performance'
          ));
        }

        if (compilerOptions.module === 'commonjs') {
          corrections.push(this.createCorrection(
            'tsconfig-commonjs-module-rn',
            'warning',
            'medium',
            'CommonJS modules may not optimize well in React Native',
            configPath,
            'module: "commonjs" - Metro bundler prefers ES modules',
            'Use "module": "esnext" for better Metro bundler performance and tree shaking',
            'performance'
          ));
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';

      corrections.push(this.createCorrection(
        'tsconfig-parse-error',
        'error',
        'high',
        `Failed to parse TypeScript config: ${errorMessage}`,
        configPath,
        `JSON parse error in ${configPath}: ${errorMessage}`,
        'Fix JSON syntax errors - check for missing commas, unclosed quotes, or trailing commas',
        'compilation'
      ));
    }

    return corrections;
  }

  private isReactNativeProject(): boolean {
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        return !!deps['react-native'];
      }
    } catch {
      // Ignore errors
    }
    return false;
  }

  private isLibraryProject(): boolean {
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return packageJson.private !== true && packageJson.main;
      }
    } catch {
      // Ignore errors
    }
    return false;
  }

  private isValidExtendsPath(extendsPath: string): boolean {
    // Check if it's a package name or relative path that exists
    if (extendsPath.startsWith('.') || extendsPath.startsWith('/')) {
      return fs.existsSync(path.resolve(process.cwd(), extendsPath));
    }
    
    // It's probably an npm package
    try {
      require.resolve(extendsPath);
      return true;
    } catch {
      return false;
    }
  }

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Get config file corrections from parent
    const configCorrections = await super.analyze();
    corrections.push(...configCorrections);
    
    // Additional TypeScript-specific analysis
    const tsSpecificCorrections = this.analyzeTypeScriptFiles();
    corrections.push(...tsSpecificCorrections);

    return corrections;
  }

  private analyzeTypeScriptFiles(): Correction[] {
    const corrections: Correction[] = [];
    
    // Check for TypeScript version compatibility
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        const tsVersion = deps.typescript;
        if (tsVersion) {
          const majorVersion = this.extractMajorVersion(tsVersion);
          if (majorVersion < 4) {
            corrections.push(this.createCorrection(
              'typescript-old-version',
              'warning',
              'medium',
              'TypeScript version is quite old',
              'package.json',
              `TypeScript: ${tsVersion}`,
              'Consider upgrading to TypeScript 4.x or later for better features',
              'quality'
            ));
          }
        }
      }
    } catch {
      // Ignore errors
    }

    return corrections;
  }

  private extractMajorVersion(version: string): number {
    const match = version.match(/[0-9]+/);
    return match ? parseInt(match[0]) : 0;
  }
}