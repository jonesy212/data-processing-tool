ConfigurationValidator.ts
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import { BaseAnalyzer } from '@/core/generators/corrections/analyzers/BaseAnalyzer';
import { CorrectionCategory, CorrectionSeverity, CorrectionType } from '@/core/typings/correctionTypes';
import fs from 'fs';
import path from 'path';

export class ConfigurationValidator extends BaseAnalyzer {
  private projectRoot: string;

  constructor(projectRoot: string = '.') {
    super();
    this.projectRoot = path.resolve(projectRoot);
  }

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    const configFiles = ['.gitignore', '.eslintrc.js', '.prettierrc'];
    
    configFiles.forEach(configFile => {
      const fullPath = path.join(this.projectRoot, configFile);
      if (!fs.existsSync(fullPath)) {
        corrections.push(this.createCorrection(
          `missing-config-${configFile.replace(/\./g, '-')}`,
          'warning' as CorrectionType,
          'medium' as CorrectionSeverity,
          `Missing configuration file: ${configFile}`,
          configFile,
          `// Missing configuration: ${configFile}`,
          `Create ${configFile} with appropriate settings`,
          'configuration' as CorrectionCategory
        ));
      }
    });

    return corrections;
  }
}