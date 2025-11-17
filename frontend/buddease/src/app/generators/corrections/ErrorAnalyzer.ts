// ErrorAnalyzer.ts

import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import { ReactNativeAnalyzer } from './analyzers/ReactNativeAnalyzer';
import { BabelConfigAnalyzer } from './analyzers/react-native/config/BabelConfigAnalyzer';
import { ReactWebAnalyzer } from './analyzers/ReactWebAnalyzer';
import { TypeScriptAnalyzer } from './analyzers/TypeScriptAnalyzer';
import { BuildAnalyzer } from './analyzers/BuildAnalyzer';
import { DependencyAnalyzer } from '@/app/generators/corrections/analyzers/react-native/dependencies/DependencyAnalyzer';
import { PatternAnalyzer } from './analyzers/PatternAnalyzer';
import { PlatformDetector } from './analyzers/PlatformDetector';
import { BaseAnalyzer } from './analyzers/BaseAnalyzer';
import { ConfigFileAnalyzer } from '@/app/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer';

// Config Analyzers
import { TsConfigAnalyzer } from './analyzers/react-native/config/TsConfigAnalyzer';
import { AppConfigAnalyzer } from './analyzers/react-native/config/AppConfigAnalyzer';
import { AppJsonAnalyzer } from './analyzers/react-native/config/AppJsonAnalyzer';
import { MetroConfigAnalyzer } from './analyzers/react-native/config/MetroConfigAnalyzer';
import { RNConfigAnalyzer } from './analyzers/react-native/config/RNConfigAnalyzer';
import { PackageJsonAnalyzer } from './analyzers/react-native/errors/PackageJsonAnalyzer';
import { MetroLogAnalyzer } from './analyzers/react-native/errors/MetroLogAnalyzer';

// Native Analyzers
import { AndroidManifestAnalyzer } from './analyzers/react-native/native/AndroidManifestAnalyzer';
import { IosPlistAnalyzer } from './analyzers/react-native/native/IosPlistAnalyzer';

import path from 'path';
import fs from 'fs';

export class ErrorAnalyzer extends ConfigFileAnalyzer {
  private analyzers: BaseAnalyzer[];
  private configAnalyzers: ConfigFileAnalyzer[]; 
  private platformInfo: ReturnType<typeof PlatformDetector.getPlatformInfo>;

  // Common errors that apply to ALL platforms
  private commonErrors = {
    'cannot find name': {
      severity: 'critical' as const,
      category: 'compilation' as const,
      fix: 'Add import statement or check type definitions'
    },
    'cannot find module': {
      severity: 'critical' as const,
      category: 'compilation' as const,
      fix: 'Install missing dependency or fix import path'
    },
    'Excessive stack depth comparing types': {
      severity: 'high' as const,
      category: 'compilation' as const,
      fix: 'Check for circular type references or simplify complex types'
    },
    'Property.*does not exist': {
      severity: 'high' as const,
      category: 'structure' as const,
      fix: 'Add missing property to interface or fix prop usage'
    },
    'is not assignable': {
      severity: 'high' as const,
      category: 'compilation' as const,
      fix: 'Fix type mismatches in props or function parameters'
    },
    'unused variable': {
      severity: 'low' as const,
      category: 'structure' as const,
      fix: 'Remove unused variable or use it in your code'
    },
    'missing return type': {
      severity: 'medium' as const,
      category: 'structure' as const,
      fix: 'Add explicit return type to function for better TypeScript support'
    }
  };

  constructor() {
    super()
    this.platformInfo = PlatformDetector.getPlatformInfo();
    this.analyzers = this.initializeAnalyzers();
    this.configAnalyzers = this.initializeConfigAnalyzers(); 

    console.log('🎯 Detected platforms:', this.platformInfo.allPlatforms.join(', '));
    if (this.platformInfo.isMultiPlatform) {
      console.log('🔧 Multi-platform project detected');
    }
  }

  protected getConfigPaths(): string[] {
    const configPaths: string[] = [];
    const commonConfigFiles = [
      'metro.config.js', 'metro.config.ts', 'rn-cli.config.js',
      'webpack.config.js', 'webpack.config.ts', 'vite.config.js', 'vite.config.ts',
      'next.config.js', 'next.config.ts', 'babel.config.js', 'babel.config.ts',
      '.babelrc', '.babelrc.js', 'tsconfig.json', 'jsconfig.json', 'package.json'
    ];

    for (const configFile of commonConfigFiles) {
      const configPath = path.resolve(process.cwd(), configFile);
      if (fs.existsSync(configPath)) {
        configPaths.push(configPath);
      }
    }
    return configPaths; 
  }

  private initializeConfigAnalyzers(): ConfigFileAnalyzer[] {
    const analyzers: ConfigFileAnalyzer[] = [
      // Core config files (all platforms)
      new TsConfigAnalyzer(),
      new BabelConfigAnalyzer(),
      new BuildAnalyzer(),
      new PackageJsonAnalyzer(),
      new MetroLogAnalyzer(),
    ];

    // React Native specific
    if (this.platformInfo.hasMobile) {
      analyzers.push(
        new MetroConfigAnalyzer(),
        new RNConfigAnalyzer(),
        new AppJsonAnalyzer(),
        new AppConfigAnalyzer(),
        new AndroidManifestAnalyzer(),
        new IosPlistAnalyzer()
      );
    }

    // Web specific - add when you create web config analyzers
    if (this.platformInfo.hasWeb) {
      // new WebpackConfigAnalyzer(), new ViteConfigAnalyzer(), etc.
    }

    return analyzers;
  }

  private initializeAnalyzers(): BaseAnalyzer[] {
    const baseAnalyzers: BaseAnalyzer[] = [
      new TypeScriptAnalyzer(),
      new BuildAnalyzer(),
      new DependencyAnalyzer(),
      new PatternAnalyzer()
    ];

    if (this.platformInfo.hasWeb) {
      baseAnalyzers.push(new ReactWebAnalyzer());
    }

    if (this.platformInfo.hasMobile) {
      baseAnalyzers.push(new ReactNativeAnalyzer());
    }

    return baseAnalyzers;
  }

  async analyzeCompilationErrors(): Promise<Correction[]> {
    console.log(`🔍 Analyzing errors for ${this.platformInfo.allPlatforms.length} platform(s)...`);
    
    const allCorrections: Correction[] = [];
    
    // Run all analyzers in parallel
    const [generalResults, configResults] = await Promise.all([
      Promise.all(this.analyzers.map(analyzer => 
        analyzer.analyze().catch(error => {
          console.warn(`Analyzer ${analyzer.constructor.name} failed:`, error);
          return [];
        })
      )),
      Promise.all(this.configAnalyzers.map(analyzer =>
        analyzer.analyze().catch(error => {
          console.warn(`Config analyzer ${analyzer.constructor.name} failed:`, error);
          return [];
        })
      ))
    ]);
    
    // Combine results
    generalResults.forEach(corrections => allCorrections.push(...corrections));
    configResults.forEach(corrections => allCorrections.push(...corrections));

    // Additional analysis
    const commonErrorCorrections = await this.analyzeCommonBuildErrors();
    allCorrections.push(...commonErrorCorrections);

    if (this.platformInfo.isMultiPlatform) {
      const multiPlatformCorrections = this.analyzeMultiPlatformIssues();
      allCorrections.push(...multiPlatformCorrections);
    }

    return this.deduplicateCorrections(allCorrections);
  }

  async analyzeConfiguration(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Run config analyzers
    const configAnalysisPromises = this.configAnalyzers.map(analyzer =>
      analyzer.analyze().catch(error => {
        console.warn(`Config analyzer ${analyzer.constructor.name} failed:`, error);
        return [];
      })
    );

    const configResults = await Promise.all(configAnalysisPromises);
    configResults.forEach(configCorrections => {
      corrections.push(...configCorrections);
    });

    return corrections;
  }

  // Analyze build logs for common cross-platform errors
  private async analyzeCommonBuildErrors(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    try {
      // Check common build log files
      const logFiles = [
        'build.log',
        'npm-debug.log', 
        'yarn-error.log',
        'pnpm-debug.log',
        'next.build.log',
        'vite.build.log',
        'metro.log'
      ];

      for (const logFile of logFiles) {
        const logPath = path.resolve(process.cwd(), logFile);
        if (fs.existsSync(logPath)) {
          try {
            const logContent = await fs.promises.readFile(logPath, 'utf8');
            const logErrors = this.parseCommonErrorsFromLog(logContent, logFile);
            corrections.push(...logErrors);
          } catch (error) {
            console.warn(`Could not read log file ${logFile}:`, error);
          }
        }
      }

      // Also check recent terminal output/console for these errors
      const terminalErrors = this.checkForCommonErrorsInRecentOutput();
      corrections.push(...terminalErrors);

    } catch (error) {
      console.warn('Could not analyze common build errors:', error);
    }

    return corrections;
  }

  // Parse common errors from build logs
  private parseCommonErrorsFromLog(logContent: string, logFile: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = logContent.split('\n');
    
    lines.forEach((line, index) => {
      for (const [errorPattern, errorInfo] of Object.entries(this.commonErrors)) {
        // Use regex for more flexible matching (case insensitive, partial matches)
        const pattern = new RegExp(errorPattern, 'i');
        if (pattern.test(line)) {
          corrections.push(this.createCorrection(
            `common-error-${logFile}-${index}`,
            'error',
            errorInfo.severity,
            `Common error detected: ${errorPattern}`,
            logFile,
            line.trim(),
            errorInfo.fix,
            errorInfo.category
          ));
          break; // Only match one pattern per line
        }
      }
    });

    return corrections;
  }

  // Check for common errors in recent terminal output (simulated)
  private checkForCommonErrorsInRecentOutput(): Correction[] {
    const corrections: Correction[] = [];
    
    // Check package.json for common dependency issues that match our patterns
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        // Check for missing TypeScript (could cause "cannot find name" errors)
        if (!allDeps.typescript && !allDeps['@types/node']) {
          corrections.push(this.createCorrection(
            'common-missing-typescript',
            'warning',
            'medium',
            'TypeScript not installed - may cause "cannot find name" errors',
            'package.json',
            'TypeScript dependency missing',
            'Install TypeScript: npm install --save-dev typescript @types/node',
            'compilation'
          ));
        }
      } catch (error) {
        // Silent fail - package.json parse error would be caught elsewhere
      }
    }

    return corrections;
  }

  private analyzeMultiPlatformIssues(): Correction[] {
    const corrections: Correction[] = [];

    // Check for potential multi-platform conflicts
    corrections.push(this.createCorrection(
      'multi-platform-setup',
      'info',
      'low',
      'Multi-platform project detected (web + mobile)',
      'package.json',
      `Platforms: ${this.platformInfo.allPlatforms.join(', ')}`,
      'Ensure platform-specific code is properly separated and tested',
      'structure'
    ));

    // Check for React Native Web compatibility
    if (this.platformInfo.hasWeb && this.platformInfo.hasMobile) {
      if (!this.hasDependency('react-native-web')) {
        corrections.push(this.createCorrection(
          'missing-react-native-web',
          'warning',
          'medium',
          'React Native Web not installed for multi-platform project',
          'package.json',
          'react-native detected but react-native-web missing',
          'Install react-native-web for web platform support: npm install react-native-web',
          'structure'
        ));
      }
    }

    return corrections;
  }

  private hasDependency(depName: string): boolean {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) return false;

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      return !!deps[depName];
    } catch {
      return false;
    }
  }

  private deduplicateCorrections(corrections: Correction[]): Correction[] {
    const seen = new Set();
    return corrections.filter(correction => {
      const key = `${correction.file}:${correction.line}:${correction.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Get platform info for reporting
  getPlatformInfo() {
    return this.platformInfo;
  }

  // Provide common errors to other analyzers if needed
  getCommonErrors() {
    return this.commonErrors;
  }
}