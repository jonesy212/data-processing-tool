// MetroLogAnalyzer.ts
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';
import { ConfigFileAnalyzer } from '@/app/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer'


export class MetroLogAnalyzer extends ConfigFileAnalyzer {
  
  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Get config file corrections from parent
    const configCorrections = await super.analyze();
    corrections.push(...configCorrections);
    
    // Add Metro-specific log and cache analysis
    const logCorrections = this.analyzeMetroLogsForErrors();
    corrections.push(...logCorrections);

    return corrections;
  }

  public analyzeMetroLogsForErrors(): Correction[] {
    return this.analyzeMetroLogsForPrivateErrors();
  }

  private analyzeCommonMetroErrors(): Correction[] {
    const corrections: Correction[] = [];

    // Check for common Metro configuration issues
    const metroConfigPath = 'metro.config.js';
    if (!fs.existsSync(metroConfigPath)) {
      corrections.push(this.createCorrection(
        'metro-config-missing',
        'warning',
        'medium',
        'Metro configuration file not found',
        metroConfigPath,
        '',
        'Create metro.config.js for custom Metro bundler configuration',
        'configuration'
      ));
    }

    return corrections;
  }
  
  private analyzeMetroLogsForPrivateErrors(): Correction[] {
    const corrections: Correction[] = [];

    const metroCacheDirs = [
      'node_modules/.cache/metro',
      'node_modules/metro-cache',
      '.metro'
    ];

    metroCacheDirs.forEach(cacheDir => {
      const cachePath = path.resolve(process.cwd(), cacheDir);
      if (fs.existsSync(cachePath)) {
        const cacheSize = this.getDirectorySize(cachePath);
        if (cacheSize > 100 * 1024 * 1024) {
          corrections.push(this.createCorrection(
            `large-metro-cache-${cacheDir}`,
            'suggestion',
            'low',
            `Large Metro cache detected: ${cacheDir}`,
            cacheDir,
            `Cache size: ${(cacheSize / 1024 / 1024).toFixed(2)}MB`,
            'Consider clearing Metro cache: npx react-native start --reset-cache',
            'performance'
          ));
        }
      }
    });

    const metroConfigPath = path.resolve(process.cwd(), 'metro.config.js');
    if (fs.existsSync(metroConfigPath)) {
      try {
        const configContent = fs.readFileSync(metroConfigPath, 'utf8');

        if (!configContent.includes('watchFolders')) {
          corrections.push(this.createCorrection(
            'metro-watch-folders',
            'suggestion',
            'low',
            'Metro watchFolders not configured',
            'metro.config.js',
            'Missing watchFolders configuration',
            'Configure watchFolders for monorepo or multi-project setups',
            'compilation'
          ));
        }

        if (configContent.includes('transformer') && !configContent.includes('babelTransformerPath')) {
          corrections.push(this.createCorrection(
            'metro-babel-transformer',
            'info',
            'low',
            'Custom Metro transformer detected',
            'metro.config.js',
            'Custom transformer configuration',
            'Ensure custom transformer is properly configured',
            'compilation'
          ));
        }
      } catch {
        corrections.push(this.createCorrection(
          'metro-config-read-error',
          'error',
          'high',
          'Failed to read Metro configuration',
          'metro.config.js',
          'File read error',
          'Check Metro config file syntax and permissions',
          'compilation'
        ));
      }
    }
    // Analyze common Metro errors
    corrections.push(...this.analyzeCommonMetroErrors());
    
    return corrections;
  }

  protected getConfigPaths(): string[] {
    return ['./metro.config.js'];
  }

  protected async analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]> {
    const corrections: Correction[] = [];

    try {
      // Read the file content first
      const configContent = await this.readConfigFile(configPath);
      
      if (configContent === null) {
        corrections.push(this.createCorrection(
          'metro-config-missing',
          'warning',
          'medium',
          'Metro configuration file not found',
          configPath,
          '',
          'Create metro.config.js for custom Metro bundler configuration',
          'configuration'
        ));
        return corrections;
      }

      // Now you can use configContent for analysis
      if (!configContent.includes('watchFolders')) {
        corrections.push(this.createCorrection(
          'metro-watch-folders',
          'suggestion',
          'low',
          'Metro watchFolders not configured',
          configPath,
          'Missing watchFolders configuration',
          'Configure watchFolders for monorepo or multi-project setups',
          'compilation'
        ));
      }

      if (configContent.includes('transformer') && !configContent.includes('babelTransformerPath')) {
        corrections.push(this.createCorrection(
          'metro-babel-transformer',
          'info',
          'low',
          'Custom Metro transformer detected',
          configPath,
          'Custom transformer configuration',
          'Ensure custom transformer is properly configured',
          'compilation'
        ));
      }

      // Additional Metro config checks
      if (!configContent.includes('resolver')) {
        corrections.push(this.createCorrection(
          'metro-missing-resolver',
          'suggestion',
          'low',
          'Metro resolver configuration missing',
          configPath,
          'No resolver configuration found',
          'Add resolver configuration for custom module resolution',
          'compilation'
        ));
      }

      if (!configContent.includes('maxWorkers')) {
        corrections.push(this.createCorrection(
          'metro-missing-max-workers',
          'suggestion',
          'low',
          'Metro max workers not configured',
          configPath,
          'No maxWorkers configuration found',
          'Set maxWorkers for optimal build performance',
          'performance'
        ));
      }

    } catch (error) {
      corrections.push(this.createCorrection(
        'metro-config-read-error',
        'error',
        'high',
        'Failed to read Metro configuration',
        configPath,
        `Read error: ${error}`,
        'Check Metro config file syntax and permissions',
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

  private getDirectorySize(dir: string): number {
    try {
      const files = fs.readdirSync(dir, { recursive: true } as any);
      let totalSize = 0;

      files.forEach(file => {
        const filePath = path.join(dir, String(file));
        try {
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            totalSize += stat.size;
          }
        } catch {
          // Skip inaccessible files
        }
      });

      return totalSize;
    } catch {
      return 0;
    }
  }
}