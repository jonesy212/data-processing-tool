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
      const tsConfig = JSON.parse(content);
      const compilerOptions = tsConfig.compilerOptions || {};
      const isReactNative = this.isReactNativeProject();

      // Check for missing compiler options
      if (!compilerOptions.target) {
        corrections.push(this.createCorrection(
          'tsconfig-missing-target',
          'warning',
          'medium',
          'TypeScript target not specified',
          configPath,
          'Missing "target" in compilerOptions',
          'Add "target": "esnext" or specific ECMAScript version',
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
          'Missing "lib" in compilerOptions',
          'Add "lib": ["esnext"] or specific libraries needed',
          'compilation'
        ));
      }

      // React Native specific checks
      if (isReactNative) {
        if (!compilerOptions.jsx) {
          corrections.push(this.createCorrection(
            'tsconfig-missing-jsx-rn',
            'error',
            'high',
            'JSX configuration missing for React Native',
            configPath,
            'Missing "jsx" in compilerOptions',
            'Add "jsx": "react-native" for React Native projects',
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
            `moduleResolution: ${compilerOptions.moduleResolution || 'not set'}`,
            'Set "moduleResolution": "node" for React Native',
            'compilation'
          ));
        }
      }

      // Check for strict mode
      if (!compilerOptions.strict) {
        corrections.push(this.createCorrection(
          'tsconfig-non-strict',
          'suggestion',
          'low',
          'TypeScript strict mode disabled',
          configPath,
          'strict: false',
          'Enable "strict": true for better type safety',
          'quality'
        ));
      }

      // Check for module system
      if (!compilerOptions.module) {
        corrections.push(this.createCorrection(
          'tsconfig-missing-module',
          'warning',
          'medium',
          'Module system not specified',
          configPath,
          'Missing "module" in compilerOptions',
          'Set "module": "esnext" or "commonjs" based on your environment',
          'compilation'
        ));
      }

      // Check for path mappings
      if (!compilerOptions.paths && configPath.includes('tsconfig.json')) {
        corrections.push(this.createCorrection(
          'tsconfig-no-path-mappings',
          'suggestion',
          'low',
          'No path mappings configured',
          configPath,
          'Missing "paths" in compilerOptions',
          'Configure path mappings for cleaner imports: "paths": { "@/*": ["./src/*"] }',
          'structure'
        ));
      }

      // Check for output directory
      if (!compilerOptions.outDir && !compilerOptions.noEmit) {
        corrections.push(this.createCorrection(
          'tsconfig-no-outdir',
          'suggestion',
          'low',
          'Output directory not specified',
          configPath,
          'Missing "outDir" in compilerOptions',
          'Set "outDir": "./dist" or your preferred output directory',
          'structure'
        ));
      }

      // Check for declaration files
      if (!compilerOptions.declaration && this.isLibraryProject()) {
        corrections.push(this.createCorrection(
          'tsconfig-no-declarations',
          'warning',
          'medium',
          'TypeScript declarations not enabled for library',
          configPath,
          'declaration: false',
          'Enable "declaration": true to generate .d.ts files',
          'compilation'
        ));
      }

      // Check for source maps
      if (!compilerOptions.sourceMap) {
        corrections.push(this.createCorrection(
          'tsconfig-no-sourcemaps',
          'suggestion',
          'low',
          'Source maps disabled',
          configPath,
          'sourceMap: false',
          'Enable "sourceMap": true for better debugging',
          'development'
        ));
      }

      // Check for include/exclude patterns
      if (!tsConfig.include && configPath.includes('tsconfig.json')) {
        corrections.push(this.createCorrection(
          'tsconfig-no-include',
          'warning',
          'medium',
          'No include patterns specified',
          configPath,
          'Missing "include" array',
          'Add "include": ["src/**/*"] to specify which files to compile',
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
          'Missing "exclude" array',
          'Add "exclude": ["node_modules", "dist"] to avoid unnecessary compilation',
          'performance'
        ));
      }

      // Check for extended configs
      if (tsConfig.extends && !this.isValidExtendsPath(tsConfig.extends)) {
        corrections.push(this.createCorrection(
          'tsconfig-invalid-extends',
          'error',
          'high',
          'Invalid extends path in tsconfig',
          configPath,
          `extends: "${tsConfig.extends}"`,
          'Fix the extends path or use a valid configuration preset',
          'compilation'
        ));
      }

      // Check for React Native specific issues
      if (isReactNative) {
        if (compilerOptions.target === 'es5') {
          corrections.push(this.createCorrection(
            'tsconfig-es5-target-rn',
            'warning',
            'medium',
            'ES5 target may cause issues in React Native',
            configPath,
            'target: "es5"',
            'Use "target": "esnext" for React Native projects',
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
            'module: "commonjs"',
            'Use "module": "esnext" for better Metro bundler performance',
            'performance'
          ));
        }
      }

    } catch (error) {
      corrections.push(this.createCorrection(
        'tsconfig-parse-error',
        'error',
        'high',
        'Failed to parse TypeScript config',
        configPath,
        `Parse error: ${error}`,
        'Fix JSON syntax errors in tsconfig.json',
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