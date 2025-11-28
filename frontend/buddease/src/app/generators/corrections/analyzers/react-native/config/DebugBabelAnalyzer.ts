// DebugBabelAnalyzer.ts
import { ConfigFileAnalyzer } from '@/app/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer'
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import fs from 'fs';


// Create a temporary debug analyzer
export class DebugBabelAnalyzer extends ConfigFileAnalyzer {
  protected getConfigPaths(): string[] {
    return [
      'babel.config.js',
      'babel.config.ts',
      '.babelrc',
      '.babelrc.json',
      'frontend/buddease/babel.config.js',
      'frontend/buddease/src/app/configs/babel.config.js',
      'frontend/buddease/src/app/configs/babel.config.ts'
    ];
  }

  protected async analyzeConfigFile(fullPath: string, configFile: string): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    console.log(`🔍 Analyzing ${configFile} at ${fullPath}`);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      console.log(`   File exists, size: ${content.length} bytes`);
      
      // Check for common issues
      if (content.includes('module.exports')) {
        console.log('   ✅ Uses CommonJS exports');
      } else if (content.includes('export default')) {
        console.log('   ✅ Uses ES6 exports');
      } else {
        console.log('   ⚠️ Unknown export format');
        corrections.push(this.createCorrection(
          `babel-export-format-${configFile}`,
          'warning',
          'medium',
          `Unclear export format in ${configFile}`,
          fullPath,
          'File export format not recognized',
          'Use either module.exports or export default',
          'compilation'
        ));
      }
      
      // Check for React Native presets
      if (!content.includes('metro-react-native-babel-preset')) {
        console.log('   ⚠️ Missing React Native metro preset');
        corrections.push(this.createCorrection(
          `babel-preset-missing-${configFile}`,
          'warning',
          'high',
          `Missing React Native Babel preset in ${configFile}`,
          fullPath,
          'metro-react-native-babel-preset not found',
          'Add preset: module:metro-react-native-babel-preset',
          'compilation'
        ));
      }
      
      // Check for module resolver
      if (!content.includes('module-resolver')) {
        console.log('   ⚠️ Missing module-resolver plugin');
      }
      
    } catch (error) {
      console.error(`   ❌ Error reading file:`, error);
    }
    
    return corrections;
  }
}

