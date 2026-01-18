// AppConfigAnalyzer.ts
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import { ConfigFileAnalyzer } from '@/core/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer';
import fs from 'fs';
import path from 'path';

export class AppConfigAnalyzer extends ConfigFileAnalyzer {

    private configPaths: string[] = [
    './app.json',
    './app.config.js',
    './app.config.ts',
    './package.json'
  ];

  protected getConfigPaths(): string[] {
    return [
      './app.json',
      './app.config.js', 
      './app.config.ts',
      './package.json'
    ];
  }

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];

    for (const configPath of this.configPaths) {
      if (fs.existsSync(configPath)) {
        corrections.push(...this.analyzeAppConfig(configPath, path.basename(configPath)));
      }
    }

    return corrections;
  }

  // Fixed: Made async and using async file reading
  protected async analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const fileName = path.basename(configPath);

    try {
      const configContent = await fs.promises.readFile(configPath, 'utf8');

      if (fileName === 'app.json') {
        corrections.push(...this.analyzeAppJson(configPath, configContent));
      } else if (fileName === 'package.json') {
        corrections.push(...this.analyzePackageJson(configPath, configContent));
      } else if (fileName.includes('app.config.')) {
        corrections.push(...this.analyzeAppConfigJs(configPath, configContent));
      }
    } catch (error) {
      corrections.push(this.createCorrection(
        `app-config-parse-error-${fileName}`,
        'error',
        'high',
        `Failed to parse app configuration: ${fileName}`,
        configPath,
        `Parse error: ${error}`,
        'Fix configuration file syntax errors',
        'compilation'
      ));
    }

    return corrections;
  }

  analyzeAppConfig(configPath: string, configFile: string): Correction[] {
    const corrections: Correction[] = [];

    try {
      const content = fs.readFileSync(configPath, 'utf8');

      if (content.includes('expo') && !content.includes('name') && !content.includes('slug')) {
        corrections.push(this.createCorrection(
          'expo-config-minimal',
          'warning',
          'medium',
          'Expo configuration is minimal',
          configFile,
          content.substring(0, 200) + '...',
          'Add name, slug, and other required Expo configuration fields',
          'runtime'
        ));
      }
    } catch {
      // Error handled in calling method
    }

    return corrections;
  }

  private analyzeAppJson(configPath: string, configContent: string): Correction[] {
    const corrections: Correction[] = [];
    
    try {
      const appConfig = JSON.parse(configContent);

      // React Native specific checks - use bracket notation for hyphenated property names
      if (appConfig['react-native']) {
        corrections.push(...this.analyzeReactNativeConfig(configPath, appConfig['react-native']));
      }
      // Check for required fields
      if (!appConfig.name) {
        corrections.push(this.createCorrection(
          'app-json-missing-name',
          'error',
          'high',
          'Missing app name in app.json',
          configPath,
          'No "name" field found',
          'Add a "name" field to your app.json',
          'structure'
        ));
      }

      if (!appConfig.displayName) {
        corrections.push(this.createCorrection(
          'app-json-missing-display-name',
          'warning',
          'medium',
          'Missing display name in app.json',
          configPath,
          'No "displayName" field found',
          'Add a "displayName" field for better app identification',
          'structure'
        ));
      }

      // Expo specific checks
      if (appConfig.expo) {
        corrections.push(...this.analyzeExpoConfig(configPath, appConfig.expo));
      }

      // React Native specific checks
      if (appConfig['react-native']) {
        corrections.push(...this.analyzeReactNativeConfig(configPath, appConfig['react-native']));
      }

    } catch (error) {
      corrections.push(this.createCorrection(
        'app-json-parse-error',
        'error',
        'high',
        'Failed to parse app.json',
        configPath,
        `Parse error: ${error}`,
        'Fix JSON syntax errors in app.json',
        'compilation'
      ));
    }

    return corrections;
  }

  private analyzePackageJson(configPath: string, configContent: string): Correction[] {
    const corrections: Correction[] = [];
    
    try {
      const packageJson = JSON.parse(configContent);
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Check for React Native presence
      if (deps['react-native']) {
        // Verify main entry point
        if (!packageJson.main) {
          corrections.push(this.createCorrection(
            'package-json-missing-main',
            'warning',
            'medium',
            'Missing main entry point in package.json',
            configPath,
            'No "main" field specified',
            'Add "main": "index.js" or your app entry point',
            'runtime'
          ));
        }

        // Check for React Native scripts
        const scripts = packageJson.scripts || {};
        if (!scripts.start && !scripts.ios && !scripts.android) {
          corrections.push(this.createCorrection(
            'package-json-missing-rn-scripts',
            'suggestion',
            'low',
            'Missing React Native scripts in package.json',
            configPath,
            'No start/ios/android scripts found',
            'Add common React Native scripts: "start": "react-native start"',
            'development'
          ));
        }
      }

    } catch (error) {
      // Error handling already in parent method
    }

    return corrections;
  }

  private analyzeAppConfigJs(configPath: string, configContent: string): Correction[] {
    const corrections: Correction[] = [];

    // Check for common patterns in JS config files
    if (configContent.includes('module.exports') || configContent.includes('export default')) {
      // Check for Expo config
      if (configContent.includes('expo') && !configContent.includes('name')) {
        corrections.push(this.createCorrection(
          'app-config-js-missing-name',
          'warning',
          'medium',
          'Missing app name in JavaScript config',
          configPath,
          'No app name configuration found',
          'Ensure your config exports an object with a "name" property',
          'structure'
        ));
      }

      // Check for TypeScript usage
      if (configPath.endsWith('.ts') && !configContent.includes('defineConfig')) {
        corrections.push(this.createCorrection(
          'app-config-ts-type-safety',
          'suggestion',
          'low',
          'Consider using defineConfig for TypeScript',
          configPath,
          'Using plain object export',
          'Use expo.defineConfig for better TypeScript support',
          'quality'
        ));
      }
    } else {
      corrections.push(this.createCorrection(
        'app-config-js-export',
        'error',
        'high',
        'Invalid export in app config file',
        configPath,
        'No module.exports or export default found',
        'Ensure your config file properly exports the configuration object',
        'compilation'
      ));
    }

    return corrections;
  }

  private analyzeExpoConfig(configPath: string, expoConfig: any): Correction[] {
    const corrections: Correction[] = [];

    if (!expoConfig.slug) {
      corrections.push(this.createCorrection(
        'expo-config-missing-slug',
        'warning',
        'medium',
        'Missing slug in Expo config',
        configPath,
        'No "slug" field in Expo configuration',
        'Add a "slug" field for Expo deployment',
        'deployment'
      ));
    }

    if (!expoConfig.platforms || !Array.isArray(expoConfig.platforms)) {
      corrections.push(this.createCorrection(
        'expo-config-missing-platforms',
        'suggestion',
        'low',
        'Missing platforms in Expo config',
        configPath,
        'No "platforms" array specified',
        'Add "platforms": ["ios", "android"] to specify target platforms',
        'structure'
      ));
    }

    // Check SDK version
    if (!expoConfig.sdkVersion) {
      corrections.push(this.createCorrection(
        'expo-config-missing-sdk',
        'warning',
        'medium',
        'Missing SDK version in Expo config',
        configPath,
        'No "sdkVersion" specified',
        'Specify the Expo SDK version for compatibility',
        'compatibility'
      ));
    }

    return corrections;
  }

  private analyzeReactNativeConfig(configPath: string, rnConfig: any): Correction[] {
    const corrections: Correction[] = [];

    // React Native specific configuration checks
    if (rnConfig.dependencies && typeof rnConfig.dependencies === 'object') {
      // Check for autolinking configuration
      if (rnConfig.dependencies.autolinking === undefined) {
        corrections.push(this.createCorrection(
          'rn-config-autolinking',
          'suggestion',
          'low',
          'Autolinking not explicitly configured',
          configPath,
          'Autolinking configuration missing',
          'Consider explicitly setting autolinking for native modules',
          'compilation'
        ));
      }
    }

    return corrections;
  }

  private performAdditionalAppAnalysis(): Correction[] {
    const corrections: Correction[] = [];
    
    // Check for common app structure issues
    const entryPoints = ['./index.js', './src/index.js', './App.js', './src/App.js'];
    const hasEntryPoint = entryPoints.some(point => fs.existsSync(path.resolve(process.cwd(), point)));
    
    if (!hasEntryPoint) {
      corrections.push(this.createCorrection(
        'app-missing-entry-point',
        'warning',
        'medium',
        'No common entry point found',
        './',
        'Missing index.js, App.js, or similar entry files',
        'Create an entry point file for your React Native app',
        'runtime'
      ));
    }

    return corrections;
  }
}