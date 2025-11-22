// PackageJsonAnalyzer.ts
import { ConfigFileAnalyzer } from '@/app/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer'
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';

export class PackageJsonAnalyzer extends ConfigFileAnalyzer {
    private packageData: any = null;

  protected getConfigPaths(): string[] {
    return ['./package.json'];
  }

   async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const configPaths = this.getConfigPaths();

    for (const configPath of configPaths) {
      if (fs.existsSync(configPath)) {
        const configFile = path.basename(configPath);
        const fileCorrections = await this.analyzeConfigFile(configPath, configFile);
        corrections.push(...fileCorrections);
      }
    }

    return corrections;
  }

  protected async analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    try {
      // Read the file content and store it
      const configContent = await this.readConfigFile(configPath);
      if (!configContent) return corrections;

      this.packageData = JSON.parse(configContent);
      const deps = { ...this.packageData.dependencies, ...this.packageData.devDependencies };
      const scripts = this.packageData.scripts || {};
      
      // React Native specific package.json analysis
      if (deps['react-native']) {
        if (!deps['react']) {
          corrections.push(this.createCorrection(
            'package-json-missing-react',
            'error',
            'high',
            'React dependency missing in React Native project',
            configPath,
            'react-native found but react missing',
            'Install React: pnpm install react',
            'compilation'
          ));
        }
        
        // Check for common React Native dependencies
        const commonRnDeps = ['react-native-gesture-handler', 'react-native-reanimated'];
        commonRnDeps.forEach(dep => {
          if (!deps[dep]) {
            corrections.push(this.createCorrection(
              `package-json-missing-${dep}`,
              'suggestion',
              'low',
              `Common React Native dependency missing: ${dep}`,
              configPath,
              `Dependency not found: ${dep}`,
              `Consider installing ${dep} for better React Native experience`,
              'structure'
            ));
          }
        });

        // Check for missing peer dependencies
        if (!deps['react-native-web']) {
          corrections.push(this.createCorrection(
            'package-json-missing-rn-web',
            'suggestion', 
            'low',
            'react-native-web not installed for web support',
            configPath,
            'Missing react-native-web',
            'Install react-native-web for web platform support',
            'compatibility'
          ));
        }
      }

      // Enhanced scripts analysis
      if (!scripts.start && !scripts.dev) {
        corrections.push(this.createCorrection(
          'package-json-missing-start',
          'warning',
          'medium',
          'No start or dev script found',
          configPath,
          'Missing development script',
          'Add a start or dev script to package.json',
          'development'
        ));
      }

      // Check for build scripts
      if (!scripts.build && deps.typescript) {
        corrections.push(this.createCorrection(
          'package-json-missing-build',
          'warning',
          'medium',
          'No build script found for TypeScript project',
          configPath,
          'Missing build script',
          'Add a build script to compile TypeScript',
          'compilation'
        ));
      }

      // Check for lint scripts
      if (!scripts.lint && (deps.eslint || deps['@typescript-eslint/eslint-plugin'])) {
        corrections.push(this.createCorrection(
          'package-json-missing-lint',
          'suggestion',
          'low',
          'No lint script found but ESLint is installed',
          configPath,
          'Missing lint script',
          'Add a lint script to run ESLint',
          'linting'
        ));
      }

      // Check for test scripts
      if (!scripts.test && (deps.jest || deps.vitest || deps.mocha)) {
        corrections.push(this.createCorrection(
          'package-json-missing-test',
          'suggestion',
          'low',
          'No test script found but testing framework is installed',
          configPath,
          'Missing test script',
          'Add a test script to run tests',
          'testing'
        ));
      }

      // Check for complex scripts
      Object.entries(scripts).forEach(([name, script]) => {
        if (typeof script === 'string' && script.split('&&').length > 3) {
          corrections.push(this.createCorrection(
            `package-json-complex-script-${name}`,
            'suggestion',
            'low',
            `Complex script that may be hard to maintain: ${name}`,
            configPath,
            script,
            'Break complex scripts into smaller, focused scripts',
            'maintainability'
          ));
        }
      });
      
    } catch (error) {
      corrections.push(this.createCorrection(
        'package-json-parse-error',
        'error',
        'high',
        'Failed to parse package.json',
        configPath,
        `Parse error: ${error}`,
        'Fix JSON syntax errors in package.json',
        'compilation'
      ));
    }
    
    return corrections;
  }

 // Add the required getter methods
  getName(): string {
    return this.packageData?.name || 'unknown';
  }

  getVersion(): string {
    return this.packageData?.version || '0.0.0';
  }

  getDependencies(): Record<string, string> {
    return this.packageData?.dependencies || {};
  }

  getDevDependencies(): Record<string, string> {
    return this.packageData?.devDependencies || {};
  }

  getScripts(): Record<string, string> {
    return this.packageData?.scripts || {};
  }

  getDescription(): string {
    return this.packageData?.description || '';
  }

  getKeywords(): string[] {
    return this.packageData?.keywords || [];
  }

  // Optional: Get the raw package data
  getRawData(): any {
    return this.packageData;
  }

  private async readConfigFile(configPath: string): Promise<string | null> {
    try {
      const fullPath = path.resolve(process.cwd(), configPath);
      if (!fs.existsSync(fullPath)) return null;
      return await fs.promises.readFile(fullPath, 'utf8');
    } catch {
      return null;
    }
  }
}