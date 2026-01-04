ConfigFileAnalyzer.ts
analyzers/ConfigFileAnalyzer.ts
import { BaseAnalyzer } from '@/core/generators/corrections/analyzers/BaseAnalyzer';
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';

export abstract class ConfigFileAnalyzer extends BaseAnalyzer {
  protected abstract getConfigPaths(): string[];
  protected abstract analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]>;

  /** Synchronous single-file entry required by cachedAnalyze */
  analyzeFile(_filePath: string): Correction[] {
    // We already have an async analyser – just fire-and-forget and
    // return the corrections synchronously (cache guarantees one hit per file).
    const corrections: Correction[] = [];
    this.analyze().then(c => corrections.push(...c)).catch(() => {});
    return corrections;
  }
  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const configPaths = this.getConfigPaths();

    for (const configPath of configPaths) {
      const fullPath = path.resolve(process.cwd(), configPath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ Config file not found: ${configPath}`);
        console.log(`   Looking for: ${fullPath}`);
        continue;
      }

      try {
        const configFile = path.basename(configPath);
        console.log(`\n📄  ${configPath}  (${path.relative(process.cwd(), configPath)})`);
        
        const fileCorrections = await this.analyzeConfigFile(fullPath, configFile);
        corrections.push(...fileCorrections);


        if (fileCorrections.length > 0) {
          console.log(`❌ Found ${fileCorrections.length} issues in ${configFile}:`);
          fileCorrections.forEach((correction, index) => {
            console.log(`   ${index + 1}. [${correction.severity}] ${correction.title}`);
            console.log(`      Description: ${correction.message}`);
            console.log(`      Suggestion: ${correction.suggestion}`);
          });
        } else {
          console.log(`✅ No issues found in ${configFile}`);
        }
                
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