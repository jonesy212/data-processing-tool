import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import { ConfigFileAnalyzer } from '@/app/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer'
import fs from 'fs';

export class MetroConfigAnalyzer extends ConfigFileAnalyzer {
  protected getConfigPaths(): string[] {
    return ['./metro.config.js', './metro.config.ts'];
  }

  protected async analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]> {
    const content = await fs.promises.readFile(configPath, 'utf8');
    return this.doAnalyze(content, configFile); 
  }

   /* public helper – can be called from outside */
  public doAnalyze(content: string, configFile: string): Correction[] {
    const corrections: Correction[] = [];

    if (!content.includes('resolver')) {
      corrections.push(this.createCorrection(
        'metro-missing-resolver',
        'warning',
        'medium',
        'Metro config missing resolver',
        configFile,
        'No resolver field',
        'Add resolver configuration',
        'configuration'
      ));
    }
    // …more checks…
    return corrections;
  }

  analyzeMetroConfig(configPath: string, configFile: string): Correction[] {
    const corrections: Correction[] = [];

    try {
      const content = fs.readFileSync(configPath, 'utf8');

      if (!content.includes('resolver') && !content.includes('transformer')) {
        corrections.push(this.createCorrection(
          'metro-basic-config',
          'suggestion',
          'low',
          'Metro configuration is very basic',
          configFile,
          content.substring(0, 200) + '...',
          'Consider adding resolver and transformer configurations for better performance',
          'performance'
        ));
      }

      if (!content.includes('assetExts') || !content.includes('sourceExts')) {
        corrections.push(this.createCorrection(
          'metro-asset-extensions',
          'warning',
          'medium',
          'Metro asset extensions not explicitly configured',
          configFile,
          'Missing assetExts or sourceExts',
          'Configure assetExts and sourceExts for proper file handling',
          'compilation'
        ));
      }

      if (!content.includes('ts') && !content.includes('tsx')) {
        corrections.push(this.createCorrection(
          'metro-typescript-support',
          'warning',
          'high',
          'TypeScript support may not be configured in Metro',
          configFile,
          'Missing TypeScript extensions',
          'Add ts and tsx to sourceExts array in Metro configuration',
          'compilation'
        ));
      }
    } catch {
      // Error handled in calling method
    }

    return corrections;
  }
}