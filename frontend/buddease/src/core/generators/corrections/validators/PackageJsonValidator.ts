// PackageJsonValidator.ts
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import { BaseAnalyzer } from '@/core/generators/corrections/analyzers/BaseAnalyzer';
import { CorrectionCategory, CorrectionSeverity, CorrectionType } from '@/core/typings/correctionTypes';
import fs from 'fs';
import path from 'path';

export class PackageJsonValidator extends BaseAnalyzer {
  private projectRoot: string;

  constructor(projectRoot: string = '.') {
    super();
    this.projectRoot = path.resolve(projectRoot);
  }

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      corrections.push(this.createCorrection(
        'missing-package-json',
        'error' as CorrectionType,
        'high' as CorrectionSeverity,
        'Missing package.json file',
        './package.json',
        '// package.json file missing',
        'Initialize project with npm init or create package.json manually',
        'structure' as CorrectionCategory
      ));
      return corrections;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      corrections.push(...this.validateDependencies(packageJson));
      corrections.push(...this.validateScripts(packageJson));
      corrections.push(...this.validateModuleType(packageJson));

    } catch (error) {
      corrections.push(this.createCorrection(
        'package-json-invalid',
        'error' as CorrectionType,
        'high' as CorrectionSeverity,
        'Invalid package.json format',
        './package.json',
        '// Invalid package.json format',
        'Fix JSON syntax errors in package.json',
        'structure' as CorrectionCategory
      ));
    }

    return corrections;
  }

  private validateDependencies(packageJson: any): Correction[] {
    const corrections: Correction[] = [];
    
    const multiPlatformDeps = {
      web: ['next', 'react', 'react-dom'],
      mobile: ['react-native', 'react-native-web'],
      shared: ['axios', 'lodash', 'typescript']
    };

    Object.entries(multiPlatformDeps).forEach(([platform, deps]) => {
      deps.forEach(dep => {
        if (!this.hasDependency(packageJson, dep)) {
          corrections.push(this.createCorrection(
            `package-json-missing-${platform}-${dep.replace(/\//g, '-')}`,
            'warning' as CorrectionType,
            'medium' as CorrectionSeverity,
            `Missing ${platform} dependency: ${dep}`,
            './package.json',
            `// Missing ${platform} dependency: ${dep}`,
            `pnpm install ${dep}`,
            'dependencies' as CorrectionCategory
          ));
        }
      });
    });

    return corrections;
  }

  private validateScripts(packageJson: any): Correction[] {
    const corrections: Correction[] = [];
    
    const requiredScripts = [
      'dev:web', 'dev:mobile', 'build:web', 'build:mobile',
      'analyze:all', 'generate:corrections', 'generate:tree'
    ];

    requiredScripts.forEach(script => {
      if (!packageJson.scripts?.[script]) {
        corrections.push(this.createCorrection(
          `package-json-missing-script-${script}`,
          'warning' as CorrectionType,
          'medium' as CorrectionSeverity,
          `Missing script: ${script}`,
          './package.json',
          `// Missing script: ${script}`,
          `Add "${script}": "your-command-here" to package.json scripts`,
          'scripts' as CorrectionCategory
        ));
      }
    });

    return corrections;
  }

  private validateModuleType(packageJson: any): Correction[] {
    const corrections: Correction[] = [];
    
    if (packageJson.type !== 'module') {
      corrections.push(this.createCorrection(
        'package-json-module-type',
        'warning' as CorrectionType,
        'low' as CorrectionSeverity,
        'Should use ES modules',
        './package.json',
        '// Should use ES modules',
        'Set "type": "module" in package.json',
        'configuration' as CorrectionCategory
      ));
    }

    return corrections;
  }

  private hasDependency(packageJson: any, dependency: string): boolean {
    return !!(
      (packageJson.dependencies && packageJson.dependencies[dependency]) ||
      (packageJson.peerDependencies && packageJson.peerDependencies[dependency])
    );
  }

  private hasDevDependency(packageJson: any, dependency: string): boolean {
    return !!(packageJson.devDependencies && packageJson.devDependencies[dependency]);
  }
}