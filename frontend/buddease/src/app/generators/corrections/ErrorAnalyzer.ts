// ErrorAnalyzer.ts

import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import { ReactNativeAnalyzer } from './analyzers/ReactNativeAnalyzer';
import { ReactWebAnalyzer } from './analyzers/ReactWebAnalyzer';
import { TypeScriptAnalyzer } from './analyzers/TypeScriptAnalyzer';
import { BuildAnalyzer } from './analyzers/BuildAnalyzer';
import { DependencyAnalyzer } from './analyzers/DependencyAnalyzer';
import { PatternAnalyzer } from './analyzers/PatternAnalyzer';
import { PlatformDetector } from './analyzers/PlatformDetector';
import { BaseAnalyzer } from './analyzers/BaseAnalyzer';
import path from 'path';
import fs from 'fs';

export class ErrorAnalyzer {
  private analyzers: BaseAnalyzer[];
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
    this.platformInfo = PlatformDetector.getPlatformInfo();
    this.analyzers = this.initializeAnalyzers();
    
    console.log('🎯 Detected platforms:', this.platformInfo.allPlatforms.join(', '));
    if (this.platformInfo.isMultiPlatform) {
      console.log('🔧 Multi-platform project detected');
    }
  }

  private initializeAnalyzers(): BaseAnalyzer[] {
    const baseAnalyzers = [
      new TypeScriptAnalyzer(),
      new BuildAnalyzer(),
      new DependencyAnalyzer(),
      new PatternAnalyzer()
    ];

    // Add platform-specific analyzers based on detected platforms
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
    const analysisPromises = this.analyzers.map(analyzer => 
      analyzer.analyze().catch(error => {
        console.warn(`Analyzer ${analyzer.constructor.name} failed:`, error);
        return [];
      })
    );

    const results = await Promise.all(analysisPromises);
    
    // Flatten results from all analyzers
    results.forEach(corrections => {
      allCorrections.push(...corrections);
    });

    // ADDED: Analyze build logs for common cross-platform errors
    const commonErrorCorrections = await this.analyzeCommonBuildErrors();
    allCorrections.push(...commonErrorCorrections);

    // Add multi-platform specific corrections
    if (this.platformInfo.isMultiPlatform) {
      const multiPlatformCorrections = this.analyzeMultiPlatformIssues();
      allCorrections.push(...multiPlatformCorrections);
    }

    return this.deduplicateCorrections(allCorrections);
  }

  // NEW: Analyze build logs for common cross-platform errors
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

  // NEW: Parse common errors from build logs
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

  // NEW: Check for common errors in recent terminal output (simulated)
  private checkForCommonErrorsInRecentOutput(): Correction[] {
    const corrections: Correction[] = [];
    
    // This could be extended to read from actual terminal history
    // For now, we'll simulate checking common error patterns
    
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

  // NEW: Provide common errors to other analyzers if needed
  getCommonErrors() {
    return this.commonErrors;
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

  private createCorrection(
    id: string,
    type: 'error' | 'warning' | 'suggestion',
    severity: 'critical' | 'high' | 'medium' | 'low',
    message: string,
    file: string,
    code: string,
    fix: string,
    category: 'compilation' | 'runtime' | 'security' | 'performance' | 'structure'
  ): Correction {
    return {
      id,
      type,
      severity,
      message,
      file,
      code,
      fix,
      category
    };
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
}