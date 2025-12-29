// FileStructureValidator.ts
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import { BaseAnalyzer } from '@/core/generators/corrections/analyzers/BaseAnalyzer';
import { CorrectionCategory, CorrectionSeverity, CorrectionType } from '@/core/typings/correctionTypes';
import fs from 'fs';
import path from 'path';

export class FileStructureValidator extends BaseAnalyzer {
  private projectRoot: string;

  constructor(projectRoot: string = '.') {
    super();
    this.projectRoot = path.resolve(projectRoot);
  }

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    corrections.push(...await this.validateMultiPlatformFiles());
    corrections.push(...await this.validateScriptFiles());
    
    return corrections;
  }

  private async validateMultiPlatformFiles(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    const essentialFiles = [
      // Core project files
      'README.md',
      'package.json',
      'tsconfig.json',
      'pnpm-lock.yaml',
      
      // Next.js specific
      'next.config.cjs',
      'next-env.d.ts',
      'src/app/layout.tsx',
      'src/app/page.tsx',
      'src/app/Provider.tsx',
      'src/app/RootLayout.tsx',
      
      // React Native specific
      'platform/android/AndroidComponent.js',
      'platform/android/AndroidLoader.jsx', 
      'platform/ios/IOSLoader.jsx',
      'platform/ios/IosComponent.js',
      'platform/web/WebComponent.jsx',
      'platform/web/WebLoader.jsx',
      
      // Configuration
      '.gitignore',
      '.babelrc',
      '.eslintrc.json',
    //   'snowpack.config.js',
      'rollup.config.js',
      
      // Type definitions
      'react-speech-recognition.d.ts',
      'excel4node.d.ts'
    ];

    essentialFiles.forEach(file => {
      const fullPath = path.join(this.projectRoot, file);
      if (!fs.existsSync(fullPath)) {
        corrections.push(this.createCorrection(
          `missing-file-${file.replace(/\//g, '-').replace(/\./g, '-')}`,
          'warning' as CorrectionType,
          'medium' as CorrectionSeverity,
          `Missing file: ${file}`,
          file,
          `// Expected file: ${file}`,
          `Create ${file} with appropriate content`,
          'structure' as CorrectionCategory
        ));
      }
    });

    return corrections;
  }

  private async validateScriptFiles(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    const scriptFiles = [
      'src/app/scripts/generateTree.ts',
      'src/app/scripts/generateRoadmaps.ts',
      'src/app/scripts/analyzeDuplicates.ts',
      'src/app/scripts/analyzeDependencies.ts',
      'src/app/scripts/analyze-errors.ts',
      'src/app/scripts/cleanup-compiled.js',
      'src/app/scripts/generateSnapshots.ts',
      'src/app/scripts/cleanSnapshots.ts',
      'src/app/scripts/resetDevelopmentData.ts',
      
      // Generator scripts
      'src/app/generators/corrections/CorrectionGenerator.ts',
      
      // Utility scripts
      'src/utils/BuildErrorHandler.ts'
    ];

    scriptFiles.forEach(scriptFile => {
      const fullPath = path.join(this.projectRoot, scriptFile);
      if (!fs.existsSync(fullPath)) {
        corrections.push(this.createCorrection(
          `missing-script-${scriptFile.replace(/\//g, '-').replace(/\./g, '-')}`,
          'warning' as CorrectionType,
          'medium' as CorrectionSeverity,
          `Missing script file: ${scriptFile}`,
          scriptFile,
          `// Missing script file: ${scriptFile}`,
          `Create ${scriptFile} for analysis/generation functionality`,
          'scripts' as CorrectionCategory
        ));
      }
    });

    return corrections;
  }
}