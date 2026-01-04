AppJsonAnalyzer.ts
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import { ConfigFileAnalyzer } from '@/core/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer';
import fs from 'fs';
import path from 'path';

export class AppJsonAnalyzer extends ConfigFileAnalyzer {

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // This automatically calls analyzeConfigFile for each config path
    const configCorrections = await super.analyze();
    corrections.push(...configCorrections);
    
    // Add any non-config-file analysis here if needed
    // const additionalCorrections = this.performAdditionalAnalysis();
    // corrections.push(...additionalCorrections);

    return corrections;
  }

  protected getConfigPaths(): string[] {
    return ['./app.json', './App.json'];
  }


  protected async analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    try {
      // Read the file content first
      const configContent = await this.readConfigFile(configPath);
      if (!configContent) return corrections;

      const config = JSON.parse(configContent);
      
      // Analyze app.json content
      if (!config.name) {
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
      
      if (!config.expo && !config['react-native']) {
        corrections.push(this.createCorrection(
          'app-json-missing-config',
          'warning',
          'medium',
          'Missing Expo or React Native configuration',
          configPath,
          'No "expo" or "react-native" field found',
          'Add proper configuration for your React Native project',
          'structure'
        ));
      }

      // Additional app.json validations
      if (config.expo) {
        const expoCorrections = this.analyzeExpoConfig(config.expo, configPath);
        corrections.push(...expoCorrections);
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


  private analyzeExpoConfig(expoConfig: any, configPath: string): Correction[] {
    const corrections: Correction[] = [];

    if (!expoConfig.slug) {
      corrections.push(this.createCorrection(
        'expo-missing-slug',
        'warning',
        'medium',
        'Expo configuration missing slug',
        configPath,
        'No "slug" field in Expo config',
        'Add a "slug" field for Expo deployment',
        'deployment'
      ));
    }

    if (!expoConfig.version) {
      corrections.push(this.createCorrection(
        'expo-missing-version',
        'warning',
        'medium',
        'Expo configuration missing version',
        configPath,
        'No "version" field in Expo config',
        'Add a "version" field for app versioning',
        'deployment'
      ));
    }

    return corrections;
  }

  // Helper method to read config files
  private async readConfigFile(configPath: string): Promise<string | null> {
    try {
      const fullPath = path.resolve(process.cwd(), configPath);
      if (!fs.existsSync(fullPath)) return null;
      return await fs.promises.readFile(fullPath, 'utf8');
    } catch {
      return null;
    }
  }

  analyzeAppJson(configPath: string, configFile: string): Correction[] {
    const corrections: Correction[] = [];

    try {
      const content = fs.readFileSync(configPath, 'utf8');
      const appJson = JSON.parse(content);

      if (!appJson.name) {
        corrections.push(this.createCorrection(
          'app-json-missing-name',
          'error',
          'high',
          'app.json missing name field',
          configFile,
          JSON.stringify(appJson, null, 2),
          'Add name field to app.json',
          'runtime'
        ));
      }

      if (!appJson.displayName) {
        corrections.push(this.createCorrection(
          'app-json-missing-display-name',
          'warning',
          'medium',
          'app.json missing displayName field',
          configFile,
          JSON.stringify(appJson, null, 2),
          'Add displayName field to app.json for better app identification',
          'structure'
        ));
      }
    } catch {
      // Error handled in calling method
    }

    return corrections;
  }
}