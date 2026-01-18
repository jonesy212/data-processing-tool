// BabelConfigAnalyzer.ts

import { ConfigFileAnalyzer } from '@/core/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path'; // ← ADD THIS IMPORT

export class BabelConfigAnalyzer extends ConfigFileAnalyzer {
  protected getConfigPaths(): string[] {
    return ['.babelrc.json', 'babel.config.js', 'babel.config.ts'];
  }

async analyze(): Promise<Correction[]> {
    const duplicateCorrections = this.checkForDuplicateBabelConfigs();
    const standardCorrections = await super.analyze();
    return [...duplicateCorrections, ...standardCorrections];
  }

  protected async analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    try {
      // Just check if file exists and is readable - skip problematic parsing
      await fs.promises.access(configPath, fs.constants.R_OK);
      const content = await fs.promises.readFile(configPath, 'utf8');
      
      // Basic content validation without risky parsing
      if (configPath.endsWith('.json') && !this.isValidJSON(content)) {
        corrections.push(this.createCorrection(
          'babel-json-invalid',
          'error', 
          'high',
          `Invalid JSON in Babel config: ${configFile}`,
          configFile,
          'JSON syntax error',
          'Fix JSON syntax errors in the config file',
          'compilation'
        ));
        return corrections;
      }
      
      // Check for React Native preset with simple string matching
      if (configFile.includes('babel.config') && !content.includes('metro-react-native-babel-preset')) {
        corrections.push(this.createCorrection(
          'babel-missing-rn-preset',
          'warning',
          'medium', 
          'Babel config may be missing React Native preset',
          configFile,
          'metro-react-native-babel-preset not found in config',
          'Add "module:metro-react-native-babel-preset" to presets array',
          'configuration'
        ));
      }
      
    } catch (error) {
      corrections.push(this.createCorrection(
        'babel-read-error',
        'error',
        'high',
        `Failed to read Babel config: ${configFile}`,
        configFile,
        `File access error: ${error}`,
        'Check file permissions and ensure config file exists',
        'compilation'
      ));
    }
    
    return corrections;
  }


  private async safeParseConfig(configPath: string, content: string): Promise<any> {
    try {
      if (configPath.endsWith('.js')) {
        // For JS files, use a safer approach than require()
        if (content.includes('module.exports') || content.includes('export default')) {
          // Simple check - don't actually execute the config
          return { presets: [], plugins: [] }; // Return dummy object for now
        }
        return null;
      } else if (configPath.endsWith('.json') || configPath.includes('.babelrc')) {
        return JSON.parse(content);
      }
      return null;
    } catch {
      return null;
    }
  }

  protected checkForDuplicateBabelConfigs(): Correction[] {
    const corrections: Correction[] = [];
    const possibleBabelConfigs = [
      'babel.config.js',
      'babel.config.ts', 
      '.babelrc',
      '.babelrc.json',
      'frontend/buddease/babel.config.js',
      'frontend/buddease/src/app/configs/babel.config.js',
      'frontend/buddease/src/app/configs/babel.config.ts'
    ];

    const existingConfigs = possibleBabelConfigs.filter(config => 
      fs.existsSync(path.resolve(process.cwd(), config))
    );

    console.log('🔍 Babel Config Audit:');
    console.log(`   Found ${existingConfigs.length} config file(s):`);
    existingConfigs.forEach(config => {
      console.log(`   📄 ${config}`);
    });

    if (existingConfigs.length > 1) {
      console.log('⚠️ Multiple Babel config files detected - this may cause conflicts');
      
      corrections.push(this.createCorrection(
        'babel-duplicate-configs',
        'warning',
        'high',
        'Multiple Babel configuration files detected',
        'babel.config.*',
        `Found ${existingConfigs.length} config files: ${existingConfigs.join(', ')}`,
        'Consolidate to a single babel.config.js at project root to avoid conflicts',
        'configuration'
      ));
    } else if (existingConfigs.length === 0) {
      console.log('❌ No Babel config files found');
      
      corrections.push(this.createCorrection(
        'babel-missing-config',
        'error',
        'high',
        'No Babel configuration file found',
        'project-root',
        'Babel config required for React Native projects',
        'Create babel.config.js at project root with React Native preset',
        'configuration'
      ));
    } else {
      console.log('✅ Single Babel config file - good!');
    }

    return corrections;
  }

    private isValidJSON(content: string): boolean {
    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }
}