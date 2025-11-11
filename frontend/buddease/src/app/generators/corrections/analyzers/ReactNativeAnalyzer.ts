// analyzers/ReactNativeAnalyzer.ts
import { BaseAnalyzer } from './BaseAnalyzer';
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ReactNativeAnalyzer extends BaseAnalyzer {
  private reactNativeErrors = {
    // React Native-specific errors
    'Native module cannot be null': {
      severity: 'critical' as const,
      category: 'runtime' as const,
      fix: 'Check React Native linking and native module installation'
    },
    'Invariant Violation: requireNativeComponent': {
      severity: 'critical' as const,
      category: 'compilation' as const,
      fix: 'Verify React Native component registration and linking'
    },
    'No bundle URL present': {
      severity: 'critical' as const,
      category: 'runtime' as const,
      fix: 'Check Metro bundler and React Native server'
    },
    'Module AppRegistry is not a registered callable module': {
      severity: 'critical' as const,
      category: 'runtime' as const,
      fix: 'Check React Native app registration and Metro bundler'
    },
    'Unable to resolve module': {
      severity: 'critical' as const,
      category: 'compilation' as const,
      fix: 'Install missing dependency or fix import path'
    }
  };

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Only run React Native analysis if React Native is detected
    if (!this.hasReactNative()) {
      return corrections;
    }

    console.log('🔍 Analyzing React Native configuration...');

    // React Native config analysis
    const configErrors = this.analyzeReactNativeConfig();
    corrections.push(...configErrors);

    // Native module analysis
    const nativeErrors = this.analyzeNativeModules();
    corrections.push(...nativeErrors);

    // Dependency analysis
    const dependencyErrors = this.analyzeReactNativeDependencies();
    corrections.push(...dependencyErrors);

    // Metro bundler analysis
    const metroErrors = await this.analyzeMetroBundler();
    corrections.push(...metroErrors);

    // React Native error pattern analysis
    const patternErrors = await this.analyzeReactNativeErrorPatterns();
    corrections.push(...patternErrors);

    return corrections;
  }

  private async analyzeReactNativeErrorPatterns(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    try {
      // Scan source files for React Native-specific error patterns
      const srcDir = path.resolve(process.cwd(), 'src');
      if (fs.existsSync(srcDir)) {
        const sourceErrors = await this.scanReactNativeSourceFiles(srcDir);
        corrections.push(...sourceErrors);
      }

      // Check Metro logs for React Native errors
      const metroErrors = this.analyzeMetroLogsForErrors();
      corrections.push(...metroErrors);

    } catch (error) {
      console.warn('Could not analyze React Native error patterns:', error);
    }

    return corrections;
  }

  private async scanReactNativeSourceFiles(dir: string): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    try {
      const files = await fs.promises.readdir(dir, { recursive: true });
      
      for (const file of files) {
        if (this.isReactNativeSourceFile(file)) {
          const filePath = path.join(dir, file);
          try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            const fileErrors = this.analyzeReactNativeSourceFile(content, filePath);
            corrections.push(...fileErrors);
          } catch (error) {
            console.warn(`Could not read file ${filePath}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn(`Could not scan directory ${dir}:`, error);
    }

    return corrections;
  }

  private isReactNativeSourceFile(filename: string): boolean {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    return extensions.some(ext => filename.endsWith(ext));
  }

  private analyzeReactNativeSourceFile(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = content.split('\n');
    
    const reactNativePatterns = [
      {
        pattern: /requireNativeComponent/,
        handler: (match: RegExpMatchArray, lineNum: number, line: string) => ({
          type: 'warning' as const,
          severity: 'medium' as const,
          message: 'Using requireNativeComponent directly',
          code: line.trim(),
          fix: 'Consider using wrapped components or community libraries',
          category: 'structure' as const
        })
      },
      {
        pattern: /Platform\.OS/,
        handler: (match: RegExpMatchArray, lineNum: number, line: string) => ({
          type: 'suggestion' as const,
          severity: 'low' as const,
          message: 'Platform-specific code detected',
          code: line.trim(),
          fix: 'Ensure platform-specific code is properly tested on both iOS and Android',
          category: 'runtime' as const
        })
      },
      {
        pattern: /Dimensions\.get/,
        handler: (match: RegExpMatchArray, lineNum: number, line: string) => ({
          type: 'warning' as const,
          severity: 'medium' as const,
          message: 'Using Dimensions.get for responsive layout',
          code: line.trim(),
          fix: 'Consider using Flexbox or react-native-responsive-dimensions for better responsiveness',
          category: 'structure' as const
        })
      },
      {
        pattern: /console\.log/,
        handler: (match: RegExpMatchArray, lineNum: number, line: string) => ({
          type: 'suggestion' as const,
          severity: 'low' as const,
          message: 'console.log found in React Native code',
          code: line.trim(),
          fix: 'Use a proper logging library or remove console.log in production',
          category: 'performance' as const
        })
      }
    ];

    lines.forEach((line, index) => {
      for (const { pattern, handler } of reactNativePatterns) {
        const match = line.match(pattern);
        if (match) {
          const errorData = handler(match, index + 1, line);
          corrections.push(this.createCorrection(
            `react-native-pattern-${filePath}-${index + 1}`,
            errorData.type,
            errorData.severity,
            errorData.message,
            filePath,
            errorData.code,
            errorData.fix,
            errorData.category,
            index + 1
          ));
        }
      }
    });

    return corrections;
  }

  private analyzeMetroLogsForErrors(): Correction[] {
    const corrections: Correction[] = [];
    const logFiles = ['metro.log', 'react-native.log'];

    for (const logFile of logFiles) {
      const logPath = path.resolve(process.cwd(), logFile);
      if (fs.existsSync(logPath)) {
        try {
          const logContent = fs.readFileSync(logPath, 'utf8');
          const rnErrors = this.parseReactNativeBuildErrors(logContent, logFile);
          corrections.push(...rnErrors);
        } catch (error) {
          console.warn(`Could not read log file ${logFile}:`, error);
        }
      }
    }

    return corrections;
  }

  private parseReactNativeBuildErrors(logContent: string, logFile: string): Correction[] {
    const corrections: Correction[] = [];
    const lines = logContent.split('\n');
    
    lines.forEach((line, index) => {
      for (const [errorPattern, errorInfo] of Object.entries(this.reactNativeErrors)) {
        if (line.toLowerCase().includes(errorPattern.toLowerCase())) {
          corrections.push(this.createCorrection(
            `react-native-build-error-${logFile}-${index}`,
            'error',
            errorInfo.severity,
            `React Native error detected: ${errorPattern}`,
            logFile,
            line.trim(),
            errorInfo.fix,
            errorInfo.category
          ));
          break;
        }
      }
    });

    return corrections;
  }

  // ... rest of existing methods (hasReactNative, analyzeReactNativeConfig, etc.)
}