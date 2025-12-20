// RNDependencyAnalyzer.ts
// react-native/dependencies/RNDependencyAnalyzer.ts
import { BaseAnalyzer } from '@/app/generators/corrections/analyzers/BaseAnalyzer';
import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';

export class RNDependencyAnalyzer extends BaseAnalyzer {
  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // 1. Check React Native specific dependencies
    corrections.push(...await this.analyzeRNDependencies());
    
    // 2. Check native module dependencies
    corrections.push(...await this.analyzeNativeDependencies());
    
    // 3. Check linking and configuration
    corrections.push(...await this.analyzeLinkingConfig());
    
    return corrections;
  }

  private async analyzeRNDependencies(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return corrections;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Check for React Native core dependencies
      if (!dependencies['react-native']) {
        corrections.push(this.createCorrection(
          'missing-react-native-core',
          'error',
          'critical',
          'React Native core dependency missing',
          'package.json',
          JSON.stringify(dependencies, null, 2),
          'Install React Native: npm install react-native',
          'dependencies'
        ));
      }

      // Check for common RN community dependencies
      const commonRNDeps = ['@react-navigation/native', 'react-native-gesture-handler', 'react-native-reanimated'];
      const missingRNDeps = commonRNDeps.filter(dep => !dependencies[dep]);
      
      if (missingRNDeps.length > 0) {
        corrections.push(this.createCorrection(
          'missing-common-rn-deps',
          'suggestion',
          'medium',
          `Missing common React Native dependencies: ${missingRNDeps.join(', ')}`,
          'package.json',
          JSON.stringify(dependencies, null, 2),
          `Install missing dependencies: npm install ${missingRNDeps.join(' ')}`,
          'dependencies'
        ));
      }

      // Check for deprecated RN packages
      const deprecatedPackages = {
        'react-native-deprecated-custom-components': 'Use @react-navigation instead',
        'react-native-vector-icons': 'Consider @expo/vector-icons for Expo'
      };

      Object.entries(deprecatedPackages).forEach(([pkg, suggestion]) => {
        if (dependencies[pkg]) {
          corrections.push(this.createCorrection(
            `deprecated-rn-package-${pkg}`,
            'warning',
            'medium',
            `Using deprecated React Native package: ${pkg}`,
            'package.json',
            `Found: ${pkg}`,
            suggestion,
            'dependencies'
          ));
        }
      });

    } catch (error) {
      corrections.push(this.createCorrection(
        'package-json-parse-error',
        'error',
        'high',
        'Failed to parse package.json',
        'package.json',
        'File read/parse error',
        'Check package.json syntax and permissions',
        'dependencies'
      ));
    }

    return corrections;
  }

  private async analyzeNativeDependencies(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Check for native modules that need linking
    const nativeModules = await this.detectNativeModules();
    
    nativeModules.forEach(module => {
      if (!this.isProperlyLinked(module)) {
        corrections.push(this.createCorrection(
          `native-module-not-linked-${module.name}`,
          'warning',
          'high',
          `Native module "${module.name}" may not be properly linked`,
          module.configFile || 'native-modules',
          `Module: ${module.name}, Type: ${module.type}`,
          `Run: npx react-native link ${module.name} or update native configuration manually`,
          'native-modules'
        ));
      }
    });

    return corrections;
  }

  private async analyzeLinkingConfig(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Check autolinking configuration
    const reactNativeConfigPath = path.resolve(process.cwd(), 'react-native.config.js');
    if (fs.existsSync(reactNativeConfigPath)) {
      try {
        const configContent = fs.readFileSync(reactNativeConfigPath, 'utf8');
        
        if (!configContent.includes('dependency')) {
          corrections.push(this.createCorrection(
            'rn-config-missing-dependency-section',
            'suggestion',
            'low',
            'React Native config missing dependency configuration',
            'react-native.config.js',
            configContent.substring(0, 200),
            'Add dependency configuration for custom native modules',
            'configuration'
          ));
        }
      } catch (error) {
        // Ignore config read errors
      }
    }

    // Check for iOS Podfile dependencies
    const podfilePath = path.resolve(process.cwd(), 'ios/Podfile');
    if (fs.existsSync(podfilePath)) {
      const podfileContent = fs.readFileSync(podfilePath, 'utf8');
      
      // Check for common missing pods
      if (podfileContent.includes('RCT') && !podfileContent.includes('React')) {
        corrections.push(this.createCorrection(
          'podfile-missing-react-dependency',
          'error',
          'high',
          'Podfile may be missing React dependency',
          'ios/Podfile',
          podfileContent.substring(0, 200),
          'Add: pod "React", :path => "../node_modules/react-native"',
          'ios'
        ));
      }
    }

    return corrections;
  }

  private async detectNativeModules(): Promise<Array<{name: string, type: string, configFile?: string}>> {
    const modules: Array<{name: string, type: string, configFile?: string}> = [];
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return modules;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Common native module patterns
      const nativeModulePatterns = [
        { pattern: /react-native-/, type: 'community' },
        { pattern: /@react-native-community/, type: 'community' },
        { pattern: /@react-navigation/, type: 'navigation' },
        { pattern: /react-native-gesture-handler/, type: 'gestures' },
        { pattern: /react-native-reanimated/, type: 'animations' },
        { pattern: /react-native-vector-icons/, type: 'ui' }
      ];

      Object.keys(dependencies).forEach(dep => {
        nativeModulePatterns.forEach(({ pattern, type }) => {
          if (pattern.test(dep)) {
            modules.push({
              name: dep,
              type,
              configFile: this.getModuleConfigFile(dep)
            });
          }
        });
      });

    } catch (error) {
      // Silently fail
    }

    return modules;
  }

  private isProperlyLinked(module: {name: string, type: string}): boolean {
    // Check various linking indicators
    const checks = [
      this.checkAutolinkingConfig(module.name),
      this.checkNativeFiles(module.name),
      this.checkImportUsage(module.name)
    ];
    
    return checks.some(check => check);
  }

  private checkAutolinkingConfig(moduleName: string): boolean {
    const configPath = path.resolve(process.cwd(), 'react-native.config.js');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf8');
      return content.includes(moduleName);
    }
    return false;
  }

  private checkNativeFiles(moduleName: string): boolean {
    // Check iOS Podfile
    const podfilePath = path.resolve(process.cwd(), 'ios/Podfile');
    if (fs.existsSync(podfilePath)) {
      const podfileContent = fs.readFileSync(podfilePath, 'utf8');
      if (podfileContent.includes(moduleName)) {
        return true;
      }
    }

    // Check Android build.gradle
    const buildGradlePath = path.resolve(process.cwd(), 'android/app/build.gradle');
    if (fs.existsSync(buildGradlePath)) {
      const gradleContent = fs.readFileSync(buildGradlePath, 'utf8');
      if (gradleContent.includes(moduleName)) {
        return true;
      }
    }

    return false;
  }

  private checkImportUsage(moduleName: string): boolean {
    // Simple check - look for import statements in source files
    const sourceFiles = this.getSourceFiles();
    let foundImport = false;

    for (const file of sourceFiles.slice(0, 10)) { // Check first 10 files
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes(`from '${moduleName}'`) || content.includes(`require('${moduleName}')`)) {
          foundImport = true;
          break;
        }
      } catch {
        // Skip unreadable files
      }
    }

    return foundImport;
  }

  private getModuleConfigFile(moduleName: string): string | undefined {
    const possibleConfigs = [
      'react-native.config.js',
      'package.json',
      'ios/Podfile',
      'android/app/build.gradle'
    ];

    for (const config of possibleConfigs) {
      const configPath = path.resolve(process.cwd(), config);
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf8');
        if (content.includes(moduleName)) {
          return config;
        }
      }
    }

    return undefined;
  }

  private getSourceFiles(): string[] {
    // Simple implementation - get JS/TS files
    const files: string[] = [];
    
    const scanDir = (dir: string) => {
      try {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && !['node_modules', 'ios', 'android'].includes(item)) {
            scanDir(fullPath);
          } else if (stat.isFile() && /\.(js|jsx|ts|tsx)$/.test(item)) {
            files.push(fullPath);
          }
        });
      } catch {
        // Skip inaccessible directories
      }
    };

    scanDir(process.cwd());
    return files;
  }
}