// ConfigFileAnalyzer.ts
// analyzers/ConfigFileAnalyzer.ts
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';
import { BaseAnalyzer } from '@/app/generators/corrections/analyzers/BaseAnalyzer'

export abstract class ConfigFileAnalyzer extends BaseAnalyzer {
  protected abstract getConfigPaths(): string[];
  protected abstract analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]>;

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const configPaths = this.getConfigPaths();

    for (const configPath of configPaths) {
      const fullPath = path.resolve(process.cwd(), configPath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ Config file not found: ${configPath}`);
        continue;
      }

      try {
        const configFile = path.basename(configPath);
        console.log(`\n📄  ${configPath}  (${path.relative(process.cwd(), configPath)})`);
        
        const fileCorrections = await this.analyzeConfigFile(fullPath, configFile);
        corrections.push(...fileCorrections);
        
        console.log(`✅ Analyzed ${configFile}: ${fileCorrections.length} issues found`);
        
      } catch (error) {
        console.error(`❌ Failed to analyze ${configPath}:`, error);
        
        // Add an error correction
        corrections.push(this.createCorrection(
          `config-analyze-error-${path.basename(configPath)}`,
          'error',
          'high',
          `Failed to analyze configuration file: ${path.basename(configPath)}`,
          configPath,
          `Analysis error: ${error}`,
          'Check file permissions and syntax',
          'compilation'
        ));
      }
    }

    console.log(`📊 Config analysis complete: ${corrections.length} total issues`);
    return corrections;
  }
}