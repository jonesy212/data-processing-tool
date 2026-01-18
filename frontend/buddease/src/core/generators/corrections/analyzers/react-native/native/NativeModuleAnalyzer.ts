// NativeModuleAnalyzer.ts
import { BaseAnalyzer } from '@/core/generators/corrections/analyzers/BaseAnalyzer';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';

export class NativeModuleAnalyzer extends BaseAnalyzer {
  async analyze(): Promise<Correction[]> {
    // Return the result from analyzeNativeModules
    return this.analyzeNativeModules();
  }

  analyzeNativeModules(): Correction[] {
    const corrections: Correction[] = [];

    const nativeDirs = ['ios', 'android'];

    nativeDirs.forEach(dir => {
      const dirPath = path.resolve(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        const nativeIssues = this.analyzeNativeDirectory(dirPath, dir);
        corrections.push(...nativeIssues);
      } else {
        corrections.push(this.createCorrection(
          `missing-native-dir-${dir}`,
          'warning',
          'medium',
          `Native directory not found: ${dir}`,
          dir,
          'Directory not found',
          `Create ${dir} directory for native platform code`,
          'structure'
        ));
      }
    });

    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        const nativeModules = Object.keys(deps).filter(dep =>
          dep.includes('react-native') &&
          !dep.includes('react-native-web') &&
          !this.isPureJSLibrary(dep)
        );

        nativeModules.forEach(module => {
          corrections.push(this.createCorrection(
            `native-module-${module}`,
            'info',
            'low',
            `Native module detected: ${module}`,
            'package.json',
            `Dependency: ${module}`,
            'Ensure native module is properly linked if required',
            'runtime'
          ));
        });
      } catch {
        // Error handled elsewhere - just continue
      }
    }
    // Make sure to return the corrections array
    return corrections;
  }

  private analyzeNativeDirectory(dirPath: string, platform: string): Correction[] {
    const corrections: Correction[] = [];

    try {
      const items = fs.readdirSync(dirPath);

      const essentialFiles = {
        ios: ['AppDelegate.m', 'AppDelegate.h', 'main.m'],
        android: ['build.gradle', 'app/build.gradle', 'AndroidManifest.xml']
      };

      const platformFiles = essentialFiles[platform as keyof typeof essentialFiles] || [];
      platformFiles.forEach(file => {
        const filePath = path.join(dirPath, file);
        if (!fs.existsSync(filePath)) {
          corrections.push(this.createCorrection(
            `missing-native-file-${platform}-${file}`,
            'warning',
            'medium',
            `Missing native file: ${file}`,
            `${platform}/${file}`,
            'File not found',
            `Ensure ${file} exists in ${platform} directory`,
            'runtime'
          ));
        }
      });

      if (platform === 'android') {
        const settingsGradlePath = path.join(dirPath, 'settings.gradle');
        if (fs.existsSync(settingsGradlePath)) {
          const content = fs.readFileSync(settingsGradlePath, 'utf8');
          if (!content.includes('apply from:')) {
            corrections.push(this.createCorrection(
              'android-settings-gradle',
              'suggestion',
              'low',
              'Android settings.gradle may need React Native configuration',
              'android/settings.gradle',
              content.substring(0, 200) + '...',
              'Add React Native project configuration to settings.gradle',
              'compilation'
            ));
          }
        }
      }

      // Additional iOS-specific checks
      if (platform === 'ios') {
        const podfilePath = path.join(dirPath, 'Podfile');
        if (fs.existsSync(podfilePath)) {
          const podfileContent = fs.readFileSync(podfilePath, 'utf8');
          if (!podfileContent.includes('use_react_native')) {
            corrections.push(this.createCorrection(
              'ios-podfile-react-native',
              'warning',
              'medium',
              'React Native configuration missing in Podfile',
              'ios/Podfile',
              'Missing use_react_native directive',
              'Add React Native configuration to Podfile',
              'compilation'
            ));
          }
        }
      }

    } catch (error) {
      corrections.push(this.createCorrection(
        `native-dir-analysis-error-${platform}`,
        'error',
        'medium',
        `Failed to analyze ${platform} directory`,
        dirPath,
        `Error: ${error}`,
        'Check directory permissions and structure',
        'compilation'
      ));
    }

    return corrections;
  }

  private isPureJSLibrary(moduleName: string): boolean {
    const pureJSLibraries = [
      'react-native-gesture-handler',
      'react-native-reanimated',
      'react-native-screens',
      'react-native-safe-area-context',
      'react-native-vector-icons'
    ];

    return pureJSLibraries.includes(moduleName);
  }
}