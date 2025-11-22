import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import { ConfigFileAnalyzer } from '@/app/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer'
import fs from 'fs';
import path from 'path'

export class MetroConfigAnalyzer extends ConfigFileAnalyzer {
  protected getConfigPaths(): string[] {
    return ['./metro.config.js'];
  }

    protected async analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    const METRO_OWNED = new Set(['metro.config.js', 'metro.config.ts']);
      if (METRO_OWNED.has(path.basename(configFile))) return corrections;

    try {
      const content = await fs.promises.readFile(configPath, 'utf8');
      
      // Check for common Metro config issues
      corrections.push(...this.analyzeMetroConfig(content, configFile));
      
    } catch (error) {
      console.warn(`Could not analyze Metro config ${configFile}:`, error);
      // Don't add error correction for read failures to avoid duplicates
    }
    
    return corrections;
  }
  private analyzeMetroConfig(content: string, configFile: string): Correction[] {
    const corrections: Correction[] = [];

    try {
      // 1. Check for basic configuration completeness
      if (!content.includes('resolver') && !content.includes('transformer')) {
        corrections.push(this.createCorrection(
          'metro-basic-config',
          'suggestion',
          'low',
          'Metro configuration is very basic',
          configFile,
          'Missing resolver and transformer configurations',
          'Consider adding resolver and transformer configurations for better performance and customization',
          'performance'
        ));
      }

      // 2. Check for asset and source extensions configuration
      if (!content.includes('assetExts') || !content.includes('sourceExts')) {
        corrections.push(this.createCorrection(
          'metro-asset-extensions',
          'warning',
          'medium',
          'Metro asset extensions not explicitly configured',
          configFile,
          'Missing assetExts or sourceExts configuration',
          'Configure assetExts and sourceExts arrays for proper file type handling',
          'compilation'
        ));
      }

      // 3. Check for TypeScript support
      const hasTypeScript = content.includes("'ts'") || content.includes('"ts"') || 
                          content.includes("'tsx'") || content.includes('"tsx"');
      if (!hasTypeScript) {
        corrections.push(this.createCorrection(
          'metro-typescript-support',
          'warning',
          'high',
          'TypeScript support may not be configured in Metro',
          configFile,
          'Missing TypeScript extensions in sourceExts',
          'Add "ts" and "tsx" to sourceExts array for TypeScript file support',
          'compilation'
        ));
      }

      // 4. Check for deprecated properties
      if (content.includes('blacklistRE')) {
        corrections.push(this.createCorrection(
          'metro-deprecated-blacklist',
          'warning',
          'medium',
          'Deprecated blacklistRE found in Metro config',
          configFile,
          'Using deprecated blacklistRE property',
          'Replace blacklistRE with blockList for better compatibility with newer Metro versions',
          'performance'
        ));
      }

      // 5. Check for duplicate sourceExts definitions
      const sourceExtsCount = (content.match(/sourceExts/g) || []).length;
      if (sourceExtsCount > 1) {
        corrections.push(this.createCorrection(
          'metro-duplicate-sourceexts',
          'warning',
          'medium',
          'Multiple sourceExts definitions found',
          configFile,
          `${sourceExtsCount} sourceExts definitions detected`,
          'Consolidate sourceExts into a single definition to avoid conflicts and unexpected behavior',
          'compilation'
        ));
      }

      // 6. Check for SVG transformer configuration
      const hasSvgExtension = content.includes("'svg'") || content.includes('"svg"');
      const hasSvgTransformer = content.includes('react-native-svg-transformer');
      
      if (hasSvgExtension && !hasSvgTransformer) {
        corrections.push(this.createCorrection(
          'metro-missing-svg-transformer',
          'warning',
          'high',
          'SVG files detected but SVG transformer not configured',
          configFile,
          'SVG extension found without proper transformer',
          'Install and configure react-native-svg-transformer: npm install --save-dev react-native-svg-transformer',
          'compilation'
        ));
      }

      // 7. Check for performance optimizations
      if (!content.includes('maxWorkers')) {
        corrections.push(this.createCorrection(
          'metro-missing-maxworkers',
          'suggestion',
          'low',
          'maxWorkers not configured for optimal performance',
          configFile,
          'Missing maxWorkers configuration',
          'Add maxWorkers: Math.max(2, os.cpus().length - 1) to utilize available CPU cores efficiently',
          'performance'
        ));
      }

      // 8. Check for cache configuration
      if (!content.includes('cacheVersion')) {
        corrections.push(this.createCorrection(
          'metro-missing-cache-version',
          'suggestion',
          'low',
          'Cache version not specified',
          configFile,
          'Missing cacheVersion configuration',
          'Add cacheVersion to improve cache invalidation when dependencies change',
          'performance'
        ));
      }

      // 9. Check for watchFolders (monorepo support)
      if (!content.includes('watchFolders') && this.isMonorepoProject()) {
        corrections.push(this.createCorrection(
          'metro-missing-watchfolders',
          'suggestion',
          'medium',
          'watchFolders not configured for monorepo project',
          configFile,
          'Missing watchFolders configuration',
          'Add watchFolders array to include other packages in your monorepo',
          'performance'
        ));
      }

      // 10. Check for module resolution settings
      if (!content.includes('resolverMainFields')) {
        corrections.push(this.createCorrection(
          'metro-missing-resolver-main-fields',
          'suggestion',
          'low',
          'resolverMainFields not configured',
          configFile,
          'Missing resolverMainFields configuration',
          'Add resolverMainFields: [\"react-native\", \"browser\", \"main\"] for better module resolution',
          'compilation'
        ));
      }

      // 11. Check for proper SVG asset handling
      const hasSvgInAssetExts = content.match(/assetExts.*svg/) || content.match(/svg.*assetExts/);
      if (hasSvgInAssetExts && hasSvgTransformer) {
        corrections.push(this.createCorrection(
          'metro-svg-conflict',
          'warning',
          'medium',
          'SVG found in both assetExts and using transformer',
          configFile,
          'SVG configured as both asset and source file',
          'Remove SVG from assetExts when using react-native-svg-transformer to avoid conflicts',
          'compilation'
        ));
      }

      // 12. Check for resetCache configuration
      if (content.includes('resetCache: true') && !content.includes('process.env')) {
        corrections.push(this.createCorrection(
          'metro-hardcoded-reset-cache',
          'warning',
          'medium',
          'resetCache hardcoded to true',
          configFile,
          'resetCache: true may cause performance issues',
          'Use resetCache: process.env.RESET_CACHE === \"true\" for conditional cache resetting',
          'performance'
        ));
      }

    } catch (error) {
      // Error handling for file read issues
      corrections.push(this.createCorrection(
        'metro-config-read-error',
        'error',
        'high',
        `Failed to analyze Metro configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        configFile,
        'Configuration analysis failed',
        'Check Metro config file syntax and accessibility',
        'compilation'
      ));
    }

    return corrections;
  }

  // Helper method to check if project is a monorepo
  private isMonorepoProject(): boolean {
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        return !!packageJson.workspaces || 
              fs.existsSync(path.resolve(process.cwd(), 'pnpm-workspace.yaml')) ||
              fs.existsSync(path.resolve(process.cwd(), 'lerna.json'));
      }
    } catch {
      // Ignore errors
    }
    return false;
  }

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Get config file paths that actually exist
    const existingConfigs = this.getConfigPaths().filter(configFile => {
      const fullPath = path.resolve(process.cwd(), configFile);
      return fs.existsSync(fullPath);
    });

    // Analyze each existing config file
    for (const configFile of existingConfigs) {
      const configPath = path.resolve(process.cwd(), configFile);
      const fileCorrections = await this.analyzeConfigFile(configPath, configFile);
      corrections.push(...fileCorrections);
    }

    // Add Metro-specific analysis
    const metroSpecificCorrections = await this.analyzeMetroSpecificIssues();
    corrections.push(...metroSpecificCorrections);

    return this.deduplicateCorrections(corrections);
  }

  private async analyzeMetroSpecificIssues(): Promise<Correction[]> {
    const corrections: Correction[] = [];

    // Check for Metro cache issues
    const metroCachePath = path.resolve(process.cwd(), 'node_modules/.cache/metro');
    if (fs.existsSync(metroCachePath)) {
      try {
        const cacheStats = await fs.promises.stat(metroCachePath);
        const cacheSizeMB = cacheStats.size / (1024 * 1024);
        
        if (cacheSizeMB > 500) { // 500MB threshold
          corrections.push(this.createCorrection(
            'metro-large-cache',
            'info',
            'low',
            `Metro cache is large (${cacheSizeMB.toFixed(2)}MB)`,
            'metro.config.js',
            `Cache size: ${cacheSizeMB.toFixed(2)}MB`,
            'Consider running "npx react-native start --reset-cache" to clear cache',
            'performance'
          ));
        }
      } catch (error) {
        // Ignore cache stat errors
      }
    }

    return corrections;
  }

  private deduplicateCorrections(corrections: Correction[]): Correction[] {
    const seen = new Set();
    return corrections.filter(correction => {
      const key = `${correction.file}:${correction.message}:${correction.line}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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

}