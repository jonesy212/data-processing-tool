// ReactNativeAnalyzer.ts
corrections/analyzers/react-native/ReactNativeAnalyzer.ts
import { BaseAnalyzer } from '@/core/generators/corrections/analyzers/BaseAnalyzer';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';

import { AppConfigAnalyzer } from '@/core/generators/corrections/analyzers/react-native/config/AppConfigAnalyzer';
import { AppJsonAnalyzer } from '@/core/generators/corrections/analyzers/react-native/config/AppJsonAnalyzer';
import { MetroConfigAnalyzer } from '@/core/generators/corrections/analyzers/react-native/config/MetroConfigAnalyzer';
import { RNConfigAnalyzer } from '@/core/generators/corrections/analyzers/react-native/config/RNConfigAnalyzer';

import { AndroidManifestAnalyzer } from '@/core/generators/corrections/analyzers/react-native/native/AndroidManifestAnalyzer';
import { IosPlistAnalyzer } from '@/core/generators/corrections/analyzers/react-native/native/IosPlistAnalyzer';
import { NativeModuleAnalyzer } from '@/core/generators/corrections/analyzers/react-native/native/NativeModuleAnalyzer';

import { DependencyAnalyzer } from '@/core/generators/corrections/analyzers/react-native/dependencies/DependencyAnalyzer';
import { AntiPatternChecker } from '@/core/generators/corrections/analyzers/react-native/performance/AntiPatternChecker';
import { PerformancePatternScanner } from '@/core/generators/corrections/analyzers/react-native/performance/PerformancePatternScanner';

import { ErrorPatternMatcher } from '@/core/generators/corrections/analyzers/react-native/errors/ErrorPatternMatcher';
import { MetroLogAnalyzer } from '@/core/generators/corrections/analyzers/react-native/errors/MetroLogAnalyzer';
import { SourceFileErrorScanner } from '@/core/generators/corrections/analyzers/react-native/errors/SourceFileErrorScanner';

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ReactNativeAnalyzer extends BaseAnalyzer {
  private metroConfigAnalyzer = new MetroConfigAnalyzer();
  private appJsonAnalyzer = new AppJsonAnalyzer();
  private appConfigAnalyzer = new AppConfigAnalyzer();
  private rnConfigAnalyzer = new RNConfigAnalyzer();

  private nativeModuleAnalyzer = new NativeModuleAnalyzer();
  private iosPlistAnalyzer = new IosPlistAnalyzer();
  private androidManifestAnalyzer = new AndroidManifestAnalyzer();

  private dependencyAnalyzer = new DependencyAnalyzer();
  private performancePatternScanner = new PerformancePatternScanner();
  private antiPatternChecker = new AntiPatternChecker();

  private errorPatternMatcher = new ErrorPatternMatcher();
  private metroLogAnalyzer = new MetroLogAnalyzer();
  private sourceFileErrorScanner = new SourceFileErrorScanner();

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];

    if (!this.hasReactNative()) return corrections;

    console.log('🔍 Analyzing React Native configuration...');

    corrections.push(...(await this.analyzeReactNativeConfig()));
    corrections.push(...this.nativeModuleAnalyzer.analyzeNativeModules());
    corrections.push(...this.dependencyAnalyzer.analyzeReactNativeDependencies());
    corrections.push(...(await this.analyzeMetroBundler()));
    corrections.push(...(await this.analyzeReactNativeErrorPatterns()));
    corrections.push(...this.analyzePlatformConfigs());
    corrections.push(...this.performancePatternScanner.analyzePerformanceIssues());

    return corrections;
  }

  private hasReactNative(): boolean {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) return false;

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      return !!(
        deps['react-native'] ||
        deps['expo'] ||
        deps['@react-native-community/cli'] ||
        this.hasReactNativeConfigFiles()
      );
    } catch {
      return false;
    }
  }

  private hasReactNativeConfigFiles(): boolean {
    const configFiles = [
      'metro.config.js',
      'react-native.config.js',
      'rn-cli.config.js',
      'app.json',
      'app.config.js',
      'app.config.ts'
    ];

    return configFiles.some(file =>
      fs.existsSync(path.resolve(process.cwd(), file))
    );
  }


  // Make sure all methods that use createCorrection are properly defined
  private async analyzeReactNativeConfig(): Promise<Correction[]> {
    const corrections: Correction[] = [];

    const configFiles = [
      { 
        file: 'metro.config.js',
        analyzer: (configPath: string, configFile: string) =>
          this.metroConfigAnalyzer.doAnalyze(
            fs.readFileSync(configPath, 'utf8'),
            configFile
          )
      },
      { 
        file: 'react-native.config.js', 
        analyzer: (configPath: string, configFile: string) => 
          this.rnConfigAnalyzer.analyzeRNConfig(configPath, configFile)
      },
      { 
        file: 'app.json', 
        analyzer: (configPath: string, configFile: string) => 
          this.appJsonAnalyzer.analyzeAppJson(configPath, configFile)
      },
      { 
        file: 'app.config.js', 
        analyzer: (configPath: string, configFile: string) => 
          this.appConfigAnalyzer.analyzeAppConfig(configPath, configFile)
      },
      { 
        file: 'app.config.ts', 
        analyzer: (configPath: string, configFile: string) => 
          this.appConfigAnalyzer.analyzeAppConfig(configPath, configFile)
      }
    ];

    for (const { file, analyzer } of configFiles) {
      const configPath = path.resolve(process.cwd(), file);
      const configFile = path.basename(file);
      
      if (fs.existsSync(configPath)) {
        try {
          const configErrors = analyzer(configPath, configFile);
          
          // Handle both sync and async returns
          if (configErrors instanceof Promise) {
            const asyncErrors = await configErrors;
            corrections.push(...asyncErrors);
          } else {
            corrections.push(...configErrors);
          }
        } catch (error) {
          corrections.push(this.createCorrection(
            `config-parse-error-${file}`,
            'error',
            'high',
            `Failed to parse React Native configuration: ${file}`,
            file,
            'Parse error',
            `Fix syntax errors in ${file}`,
            'compilation'
          ));
        }
      }
    }

    if (!fs.existsSync(path.resolve(process.cwd(), 'metro.config.js'))) {
      corrections.push(this.createCorrection(
        'missing-metro-config',
        'warning',
        'medium',
        'Metro bundler configuration file not found',
        'metro.config.js',
        'File not found',
        'Create a metro.config.js file for React Native bundler configuration',
        'compilation'
      ));
    }

    return corrections;
  }


  private async analyzeMetroBundler(): Promise<Correction[]> {
    const corrections: Correction[] = [];

    try {
      const { stderr } = await execAsync('npx react-native --version', {
        cwd: process.cwd(),
        timeout: 10000
      }).catch(error => ({ stderr: error.stderr || error.message }));

      if (stderr && stderr.includes('command not found')) {
        corrections.push(this.createCorrection(
          'metro-cli-missing',
          'warning',
          'medium',
          'React Native CLI may not be properly installed',
          'package.json',
          'CLI command failed',
          'Install React Native CLI: npm install -g @react-native-community/cli',
          'compilation'
        ));
      }

      corrections.push(...this.metroLogAnalyzer.analyzeMetroLogsForErrors());
    } catch {
      // Metro might not be available, which is okay
    }

    return corrections;
  }

  private analyzePlatformConfigs(): Correction[] {
    const corrections: Correction[] = [];

    const iosPlistPath = path.resolve(process.cwd(), 'ios', 'App', 'Info.plist');
    if (fs.existsSync(iosPlistPath)) {
      corrections.push(...this.iosPlistAnalyzer.analyzeIosPlist(iosPlistPath));
    }

    const androidManifestPath = path.resolve(process.cwd(), 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
    if (fs.existsSync(androidManifestPath)) {
      corrections.push(...this.androidManifestAnalyzer.analyzeAndroidManifest(androidManifestPath));
    }

    return corrections;
  }

  private async analyzeReactNativeErrorPatterns(): Promise<Correction[]> {
    const corrections: Correction[] = [];

    const logFiles = [
      'metro.log',
      'build.log',
      'npm-debug.log',
      'yarn-error.log',
      'ios/build.log',
      'android/build.log'
    ];

    for (const logFile of logFiles) {
      const logPath = path.resolve(process.cwd(), logFile);
      if (fs.existsSync(logPath)) {
        const logContent = fs.readFileSync(logPath, 'utf8');
        corrections.push(...this.errorPatternMatcher.parseReactNativeBuildErrors(logContent, logFile));
      }
    }

    corrections.push(...this.metroLogAnalyzer.analyzeMetroLogsForErrors());

    const srcDir = path.resolve(process.cwd(), 'src');
    if (fs.existsSync(srcDir)) {
      corrections.push(...this.sourceFileErrorScanner.scanReactNativeSourceFiles(srcDir));
    }

    const appDir = path.resolve(process.cwd(), 'app');
    if (fs.existsSync(appDir)) {
      corrections.push(...this.sourceFileErrorScanner.scanReactNativeSourceFiles(appDir));
    }

    return corrections;
  }
}