// RNConfigAnalyzer.ts
import fs from 'fs';
import path from 'path';
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import { ConfigFileAnalyzer } from '@/app/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer'

export class RNConfigAnalyzer extends ConfigFileAnalyzer {

  protected getConfigPaths(): string[] {
    return [
      './app.config.js', 
      './app.config.ts', 
      './metro.config.js',
      './rn-cli.config.js'
    ];
  }

  protected async analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    const configContent = await this.readConfigFile(configPath);
    if (!configContent) return corrections;

    try {
      // Read the file content first!
      const configContent = await this.readConfigFile(configPath);
      
      if (configContent === null) {
        corrections.push(this.createCorrection(
          'rn-config-missing',
          'error',
          'high',
          `React Native config file not found: ${configFile}`,
          configPath,
          'File not accessible',
          `Ensure ${configFile} exists and is readable`,
          'compilation'
        ));
        return corrections;
      }

      // Analyze React Native configs based on file type
      if (configPath.endsWith('.js') || configPath.endsWith('.ts')) {
        // Analyze JavaScript/TypeScript config files
        if (configContent.includes('module.exports') && !configContent.includes('@react-native/metro-config')) {
          corrections.push(this.createCorrection(
            'metro-config-modern',
            'suggestion',
            'low',
            'Consider using modern Metro config',
            configPath,
            'Using module.exports without modern preset',
            'Import and use @react-native/metro-config for better defaults',
            'performance'
          ));
        }
      }

      // Analyze based on config file type
      if (configFile.includes('metro.config')) {
        const metroCorrections = this.analyzeMetroConfig(configContent, configFile);
        corrections.push(...metroCorrections);
      } else if (configFile.includes('app.config')) {
        const appConfigCorrections = this.analyzeAppConfig(configContent, configFile);
        corrections.push(...appConfigCorrections);
      }

      // Check for common React Native config issues
      if (configContent.includes('react-native') && !configContent.includes('@react-native')) {
        corrections.push(this.createCorrection(
          'rn-config-legacy',
          'warning',
          'medium',
          'Using legacy React Native configuration patterns',
          configFile,
          'Detected react-native without @react-native namespace',
          'Update to use @react-native community packages and modern config patterns',
          'structure'
        ));
      }

      // Check for missing transformer configuration
      if (configFile.includes('metro') && !configContent.includes('transformer') && !configContent.includes('babelTransformerPath')) {
        corrections.push(this.createCorrection(
          'metro-missing-transformer',
          'warning',
          'medium',
          'Metro config missing transformer configuration',
          configFile,
          'No transformer configuration found',
          'Add transformer configuration for proper file processing',
          'compilation'
        ));
      }

      // Check for resolver configuration
      if (configFile.includes('metro') && !configContent.includes('resolver')) {
        corrections.push(this.createCorrection(
          'metro-missing-resolver',
          'suggestion',
          'low',
          'Metro config missing resolver configuration',
          configFile,
          'No resolver configuration found',
          'Add resolver configuration for better module resolution',
          'performance'
        ));
      }

      // Check for asset extensions
      if (configFile.includes('metro') && !configContent.includes('assetExts')) {
        corrections.push(this.createCorrection(
          'metro-missing-asset-exts',
          'suggestion',
          'low',
          'Metro config missing asset extensions configuration',
          configFile,
          'No assetExts configuration found',
          'Add assetExts to handle various file types like images, fonts, etc.',
          'structure'
        ));
      }

    } catch (error) {
      corrections.push(this.createCorrection(
        `rn-config-read-error-${configFile}`,
        'error',
        'high',
        `Failed to read React Native config file: ${configFile}`,
        configPath,
        `Read error: ${error}`,
        `Check file permissions and ensure ${configFile} is accessible`,
        'compilation'
      ));
    }

    return corrections;
  }

  private async readConfigFile(configPath: string): Promise<string | null> {
    try {
      const fullPath = path.resolve(process.cwd(), configPath);
      
      if (!fs.existsSync(fullPath)) {
        return null;
      }

      const content = await fs.promises.readFile(fullPath, 'utf8');
      return content;
      
    } catch (error) {
      console.warn(`Could not read config file ${configPath}:`, error);
      return null;
    }
  }

  // REMOVED: Duplicate analyzeConfigFile method and analyzeRNConfigPrivate method
  // They are no longer needed since everything is handled in the main analyzeConfigFile

  private analyzeMetroConfig(content: string, configFile: string): Correction[] {
    const corrections: Correction[] = [];

    // Check for modern Metro config preset
    if (!content.includes('@react-native/metro-config')) {
      corrections.push(this.createCorrection(
        'metro-missing-modern-preset',
        'suggestion',
        'medium',
        'Metro config not using modern React Native preset',
        configFile,
        'Using custom Metro configuration',
        'Import and extend from @react-native/metro-config for better defaults',
        'performance'
      ));
    }

    // Check for cache configuration
    if (!content.includes('cacheVersion') && !content.includes('resetCache')) {
      corrections.push(this.createCorrection(
        'metro-missing-cache-config',
        'suggestion',
        'low',
        'Metro config missing cache versioning',
        configFile,
        'No cache configuration found',
        'Add cacheVersion to improve cache invalidation',
        'performance'
      ));
    }

    // Check for max workers configuration
    if (!content.includes('maxWorkers')) {
      corrections.push(this.createCorrection(
        'metro-missing-max-workers',
        'suggestion',
        'low',
        'Metro config missing max workers configuration',
        configFile,
        'No maxWorkers configuration found',
        'Set maxWorkers based on your system capabilities for better build performance',
        'performance'
      ));
    }

    return corrections;
  }

  private analyzeAppConfig(content: string, configFile: string): Correction[] {
    const corrections: Correction[] = [];

    // Check for Expo configuration if using Expo
    if (content.includes('expo') && !content.includes('name') && !content.includes('slug')) {
      corrections.push(this.createCorrection(
        'app-config-missing-basic-fields',
        'warning',
        'medium',
        'App config missing basic Expo configuration',
        configFile,
        'Missing name and slug fields',
        'Add name and slug fields for proper Expo app configuration',
        'structure'
      ));
    }

    // Check for platform-specific configurations
    if (!content.includes('android') && !content.includes('ios')) {
      corrections.push(this.createCorrection(
        'app-config-missing-platforms',
        'suggestion',
        'low',
        'App config missing platform-specific configurations',
        configFile,
        'No android or ios configurations found',
        'Add platform-specific configurations for better customization',
        'structure'
      ));
    }

    // Check for version configuration
    if (!content.includes('version') && !content.includes('runtimeVersion')) {
      corrections.push(this.createCorrection(
        'app-config-missing-version',
        'warning',
        'medium',
        'App config missing version information',
        configFile,
        'No version field found',
        'Add version field for proper app versioning',
        'structure'
      ));
    }

    return corrections;
  }

  // Optional: Keep this public method if you need it for external calls
  public async analyzeRNConfig(configFile: string, configPath?: string): Promise<Correction[]> {
    const fullPath = configPath || path.resolve(process.cwd(), configFile);
    return this.analyzeConfigFile(fullPath, configFile);
  }
}