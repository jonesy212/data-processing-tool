AndroidManifestAnalyzer.ts
import { ConfigFileAnalyzer } from '@/core/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer';
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';

export class AndroidManifestAnalyzer extends ConfigFileAnalyzer {
  protected getConfigPaths(): string[] {
    return [
      './android/app/src/main/AndroidManifest.xml',
      './android/AndroidManifest.xml'
    ];
  }

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Use parent class analysis for AndroidManifest.xml files
    const manifestCorrections = await super.analyze();
    corrections.push(...manifestCorrections);
    
    // Add additional Android-specific analysis
    const additionalCorrections = this.analyzeAndroidSpecificFiles();
    corrections.push(...additionalCorrections);

    return corrections;
  }

  private analyzeAndroidSpecificFiles(): Correction[] {
    const corrections: Correction[] = [];

    // Check for build.gradle files
    const buildGradlePaths = [
      './android/app/build.gradle',
      './android/build.gradle'
    ];

    buildGradlePaths.forEach(gradlePath => {
      if (fs.existsSync(gradlePath)) {
        const gradleCorrections = this.analyzeBuildGradle(gradlePath);
        corrections.push(...gradleCorrections);
      }
    });

    return corrections;
  }

  private analyzeBuildGradle(gradlePath: string): Correction[] {
    const corrections: Correction[] = [];

    try {
      const content = fs.readFileSync(gradlePath, 'utf8');

      // Check for React Native version in build.gradle
      if (content.includes('react-native') && !content.includes('com.facebook.react:react-native')) {
        corrections.push(this.createCorrection(
          'android-gradle-react-native-dep',
          'warning',
          'medium',
          'React Native dependency configuration',
          gradlePath,
          'React Native dependency might be misconfigured',
          'Ensure proper React Native dependency in build.gradle',
          'compilation'
        ));
      }

      // Check for minSdkVersion
      if (!content.includes('minSdkVersion')) {
        corrections.push(this.createCorrection(
          'android-gradle-min-sdk',
          'error',
          'high',
          'Minimum SDK version not specified',
          gradlePath,
          'Missing minSdkVersion',
          'Add minSdkVersion to android configuration',
          'compilation'
        ));
      }

      // Check for targetSdkVersion
      if (!content.includes('targetSdkVersion')) {
        corrections.push(this.createCorrection(
          'android-gradle-target-sdk',
          'warning',
          'medium',
          'Target SDK version not specified',
          gradlePath,
          'Missing targetSdkVersion',
          'Add targetSdkVersion to android configuration',
          'compatibility'
        ));
      }

    } catch (error) {
      // Ignore read errors for additional files
    }

    return corrections;
  }

  private isUsingNewArchitecture(): boolean {
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        const rnVersion = deps['react-native'];
        
        if (rnVersion) {
          const majorVersion = this.extractMajorVersion(rnVersion);
          return majorVersion >= 0.68; // New Architecture introduced in 0.68
        }
      }
    } catch {
      // Ignore errors
    }
    return false;
  }

  private extractMajorVersion(version: string): number {
    const match = version.match(/[0-9]+/);
    return match ? parseInt(match[0]) : 0;
  }

  // Fixed: Made async to match base class signature
  protected async analyzeConfigFile(configPath: string, configContent: string): Promise<Correction[]> {
    const corrections: Correction[] = [];

    try {
      // Check for internet permission
      if (!configContent.includes('android.permission.INTERNET')) {
        corrections.push(this.createCorrection(
          'android-internet-permission',
          'error',
          'critical',
          'Android internet permission missing',
          configPath,
          'Missing android.permission.INTERNET',
          'Add <uses-permission android:name="android.permission.INTERNET" /> to AndroidManifest.xml',
          'runtime'
        ));
      }

      // Check for backup configuration
      if (!configContent.includes('android:allowBackup')) {
        corrections.push(this.createCorrection(
          'android-backup-config',
          'suggestion',
          'low',
          'Android backup configuration missing',
          configPath,
          'Missing android:allowBackup',
          'Configure app backup settings in AndroidManifest.xml',
          'runtime'
        ));
      }

      // Check for application theme
      if (!configContent.includes('android:theme')) {
        corrections.push(this.createCorrection(
          'android-theme-config',
          'suggestion',
          'low',
          'Android theme configuration missing',
          configPath,
          'Missing android:theme',
          'Add theme configuration to application tag',
          'ui'
        ));
      }

      // Check for screen orientation
      if (!configContent.includes('android:screenOrientation')) {
        corrections.push(this.createCorrection(
          'android-orientation-config',
          'suggestion',
          'low',
          'Android screen orientation not specified',
          configPath,
          'Missing android:screenOrientation',
          'Consider setting screen orientation (portrait/landscape)',
          'ui'
        ));
      }

      // Check for hardware acceleration
      if (!configContent.includes('android:hardwareAccelerated')) {
        corrections.push(this.createCorrection(
          'android-hardware-acceleration',
          'suggestion',
          'low',
          'Android hardware acceleration not configured',
          configPath,
          'Missing android:hardwareAccelerated',
          'Enable hardware acceleration for better performance',
          'performance'
        ));
      }

      // Check for React Native specific requirements
      if (!configContent.includes('com.facebook.react.devsupport')) {
        corrections.push(this.createCorrection(
          'android-dev-support',
          'info',
          'low',
          'React Native dev support configuration',
          configPath,
          'Missing dev support configuration',
          'Ensure React Native dev support is properly configured',
          'development'
        ));
      }

      // Check for new architecture flags (if using new React Native architecture)
      if (this.isUsingNewArchitecture() && !configContent.includes('com.facebook.react.newarchitecture')) {
        corrections.push(this.createCorrection(
          'android-new-arch-config',
          'warning',
          'medium',
          'New Architecture configuration missing',
          configPath,
          'Missing New Architecture flags',
          'Add New Architecture configuration for React Native',
          'performance'
        ));
      }

    } catch (error) {
      corrections.push(this.createCorrection(
        'android-manifest-read-error',
        'error',
        'high',
        'Failed to read Android manifest',
        configPath,
        `Read error: ${error}`,
        'Check file permissions and XML syntax',
        'compilation'
      ));
    }

    return corrections;
  }

  analyzeAndroidManifest(manifestPath: string): Correction[] {
    const corrections: Correction[] = [];

    try {
      const content = fs.readFileSync(manifestPath, 'utf8');

      if (!content.includes('android.permission.INTERNET')) {
        corrections.push(this.createCorrection( // Fixed: changed from 'create' to 'createCorrection'
          'android-internet-permission',
          'error',
          'critical',
          'Android internet permission missing',
          'android/app/src/main/AndroidManifest.xml',
          'Missing android.permission.INTERNET',
          'Add internet permission to AndroidManifest.xml',
          'runtime'
        ));
      }

      if (!content.includes('android:allowBackup')) {
        corrections.push(this.createCorrection(
          'android-backup-config',
          'suggestion',
          'low',
          'Android backup configuration missing',
          'android/app/src/main/AndroidManifest.xml',
          'Missing android:allowBackup',
          'Configure app backup settings in AndroidManifest.xml',
          'runtime'
        ));
      }
    } catch (error) {
      console.warn('Could not analyze Android manifest:', error);
    }

    return corrections;
  }
}