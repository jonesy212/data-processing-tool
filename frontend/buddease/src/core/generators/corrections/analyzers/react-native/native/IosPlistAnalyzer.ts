// IosPlistAnalyzer.ts
import { ConfigFileAnalyzer } from '@/core/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer';
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';

export class IosPlistAnalyzer extends ConfigFileAnalyzer {
  protected getConfigPaths(): string[] {
    return [
      './ios/App/Info.plist',
      './ios/App/App-Info.plist',
      './ios/Info.plist',
      './ios/App/AppName/Info.plist'
    ];
  }

  protected async analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]> {
    const corrections: Correction[] = [];

    try {
      // Read the config file content first!
      const configContent = await this.readConfigFile(configPath);
      const fileName = path.basename(configPath);

      // Check if file was successfully read
      if (configContent === null) {
        corrections.push(this.createCorrection(
          'ios-plist-missing',
          'error',
          'high',
          `iOS Info.plist file not found: ${fileName}`,
          configPath,
          'File not accessible',
          `Ensure ${fileName} exists and is readable`,
          'compilation'
        ));
        return corrections;
      }

      // Use fileName in logging for better context
      console.log(`🔍 Analyzing iOS configuration: ${fileName}`);

      // Now you can use configContent for your analysis
      // Check for App Transport Security
      if (!configContent.includes('NSAppTransportSecurity')) {
        corrections.push(this.createCorrection(
          'ios-ats-config',
          'warning',
          'medium',
          `iOS ATS not configured in ${fileName}`,
          configPath,
          'Missing NSAppTransportSecurity',
          `Configure ATS settings in ${fileName} for network requests`,
          'runtime'
        ));
      }

      // Check for camera permission description
      if (!configContent.includes('NSCameraUsageDescription')) {
        corrections.push(this.createCorrection(
          'ios-camera-permission',
          'suggestion',
          'low',
          `Camera permission missing in ${fileName}`,
          configPath,
          'Missing NSCameraUsageDescription',
          `Add camera usage description to ${fileName} for apps using camera`,
          'runtime'
        ));
      }

      // Check for microphone permission description
      if (!configContent.includes('NSMicrophoneUsageDescription')) {
        corrections.push(this.createCorrection(
          'ios-microphone-permission',
          'suggestion',
          'low',
          `Microphone permission missing in ${fileName}`,
          configPath,
          'Missing NSMicrophoneUsageDescription',
          `Add microphone usage description to ${fileName} for apps using audio`,
          'runtime'
        ));
      }

      // Check for photo library permission
      if (!configContent.includes('NSPhotoLibraryUsageDescription')) {
        corrections.push(this.createCorrection(
          'ios-photo-library-permission',
          'suggestion',
          'low',
          `Photo library permission missing in ${fileName}`,
          configPath,
          'Missing NSPhotoLibraryUsageDescription',
          `Add photo library usage description to ${fileName} for apps accessing photos`,
          'runtime'
        ));
      }

      // Check for location permissions
      if (!configContent.includes('NSLocationWhenInUseUsageDescription') && 
          !configContent.includes('NSLocationAlwaysUsageDescription')) {
        corrections.push(this.createCorrection(
          'ios-location-permission',
          'suggestion',
          'low',
          `Location permissions missing in ${fileName}`,
          configPath,
          'Missing location usage descriptions',
          `Add location usage descriptions to ${fileName} if app uses location services`,
          'runtime'
        ));
      }

      // Check for required device capabilities
      if (!configContent.includes('UIRequiredDeviceCapabilities')) {
        corrections.push(this.createCorrection(
          'ios-required-capabilities',
          'info',
          'low',
          `Device capabilities not specified in ${fileName}`,
          configPath,
          'Missing UIRequiredDeviceCapabilities',
          `Specify required device capabilities in ${fileName} for App Store`,
          'deployment'
        ));
      }

      // Check for supported interface orientations
      if (!configContent.includes('UISupportedInterfaceOrientations')) {
        corrections.push(this.createCorrection(
          'ios-orientations-config',
          'suggestion',
          'low',
          `Interface orientations not specified in ${fileName}`,
          configPath,
          'Missing UISupportedInterfaceOrientations',
          `Define supported interface orientations in ${fileName} for your app`,
          'ui'
        ));
      }

      // Check for React Native specific configurations
      if (!configContent.includes('UIViewControllerBasedStatusBarAppearance')) {
        corrections.push(this.createCorrection(
          'ios-status-bar-config',
          'suggestion',
          'low',
          `Status bar appearance not configured in ${fileName}`,
          configPath,
          'Missing UIViewControllerBasedStatusBarAppearance',
          `Configure status bar appearance in ${fileName} for React Native apps`,
          'ui'
        ));
      }

      // Check for background modes if needed
      if (this.appUsesBackgroundFeatures() && !configContent.includes('UIBackgroundModes')) {
        corrections.push(this.createCorrection(
          'ios-background-modes',
          'warning',
          'medium',
          `Background modes not configured in ${fileName}`,
          configPath,
          'Missing UIBackgroundModes',
          `Configure background modes in ${fileName} for apps requiring background execution`,
          'runtime'
        ));
      }

      // Additional iOS 14+ permissions
      if (!configContent.includes('NSUserTrackingUsageDescription')) {
        corrections.push(this.createCorrection(
          'ios-tracking-permission',
          'suggestion',
          'low',
          `Tracking permission missing in ${fileName} (iOS 14+)`,
          configPath,
          'Missing NSUserTrackingUsageDescription',
          `Add tracking usage description to ${fileName} for apps that track users`,
          'runtime'
        ));
      }

      // Check for local network permissions (iOS 14+)
      if (!configContent.includes('NSLocalNetworkUsageDescription')) {
        corrections.push(this.createCorrection(
          'ios-local-network-permission',
          'suggestion', 
          'low',
          `Local network permission missing in ${fileName} (iOS 14+)`,
          configPath,
          'Missing NSLocalNetworkUsageDescription',
          `Add local network usage description to ${fileName} for apps using local network`,
          'runtime'
        ));
      }

      // Log analysis completion
      console.log(`✅ Analyzed ${fileName}: ${corrections.length} issues found`);

    } catch (error) {
      const fileName = path.basename(configPath);
      corrections.push(this.createCorrection(
        'ios-plist-read-error',
        'error',
        'high',
        `Failed to read iOS configuration: ${fileName}`,
        configPath,
        `Read error: ${error}`,
        `Check file permissions and PLIST syntax in ${fileName}`,
        'compilation'
      ));
    }

    return corrections;
  }

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Use parent class analysis for Info.plist files
    const plistCorrections = await super.analyze();
    corrections.push(...plistCorrections);
    
    // Add additional iOS-specific analysis
    const additionalCorrections = this.analyzeIosSpecificFiles();
    corrections.push(...additionalCorrections);

    return corrections;
  }

  private async readConfigFile(configPath: string): Promise<string | null> {
    try {
      const fullPath = path.resolve(process.cwd(), configPath);
      if (!fs.existsSync(fullPath)) return null;
      return await fs.promises.readFile(fullPath, 'utf8');
    } catch {
      return null;
    }
  }

  private analyzeIosSpecificFiles(): Correction[] {
    const corrections: Correction[] = [];

    // Check for Podfile
    const podfilePath = './ios/Podfile';
    if (fs.existsSync(podfilePath)) {
      const podfileCorrections = this.analyzePodfile(podfilePath);
      corrections.push(...podfileCorrections);
    }

    // Check for project.pbxproj
    const pbxprojPaths = this.findPbxprojFiles();
    pbxprojPaths.forEach(pbxprojPath => {
      const pbxprojCorrections = this.analyzePbxproj(pbxprojPath);
      corrections.push(...pbxprojCorrections);
    });

    return corrections;
  }

  public analyzeIosPlist(plistPath: string): Correction[] {
    return this.analyzeIosPlistPrivate(plistPath);
  }

  private analyzeIosPlistPrivate(plistPath: string): Correction[] {
    const corrections: Correction[] = [];
    
    try {
      if (!fs.existsSync(plistPath)) {
        corrections.push(this.createCorrection(
          'ios-plist-missing',
          'error',
          'high',
          'iOS Info.plist file not found',
          plistPath,
          '',
          'Create Info.plist file in iOS project directory',
          'ios'
        ));
        return corrections;
      }

      const content = fs.readFileSync(plistPath, 'utf8');
      
      // Check for required iOS permissions and descriptions
      const requiredPermissions = [
        {
          key: 'NSCameraUsageDescription',
          message: 'Camera access required',
          description: 'This app needs camera access to capture photos and videos.'
        },
        {
          key: 'NSPhotoLibraryUsageDescription', 
          message: 'Photo library access required',
          description: 'This app needs photo library access to save and share images.'
        },
        {
          key: 'NSMicrophoneUsageDescription',
          message: 'Microphone access required',
          description: 'This app needs microphone access for audio recording.'
        },
        {
          key: 'NSLocationWhenInUseUsageDescription',
          message: 'Location access required',
          description: 'This app needs location access to provide location-based services.'
        },
        {
          key: 'NSFaceIDUsageDescription',
          message: 'Face ID usage description required',
          description: 'This app uses Face ID for secure authentication.'
        }
      ];

      // Check for missing permissions
      requiredPermissions.forEach(permission => {
        if (!content.includes(permission.key)) {
          corrections.push(this.createCorrection(
            `ios-missing-${permission.key.toLowerCase()}`,
            'warning',
            'medium',
            `Missing ${permission.key} in Info.plist`,
            plistPath,
            `Add <key>${permission.key}</key><string>${permission.description}</string>`,
            `Add ${permission.key} with user-friendly description to Info.plist`,
            'ios'
          ));
        }
      });

      // Check for app configuration
      const configChecks = [
        {
          key: 'CFBundleDisplayName',
          pattern: /<key>CFBundleDisplayName<\/key>\s*<string>(.+)<\/string>/,
          message: 'App display name not set',
          suggestion: 'Set CFBundleDisplayName for your app name'
        },
        {
          key: 'CFBundleVersion',
          pattern: /<key>CFBundleVersion<\/key>\s*<string>(.+)<\/string>/,
          message: 'Bundle version not set', 
          suggestion: 'Set CFBundleVersion for app versioning'
        },
        {
          key: 'CFBundleIdentifier',
          pattern: /<key>CFBundleIdentifier<\/key>\s*<string>(.+)<\/string>/,
          message: 'Bundle identifier not set',
          suggestion: 'Set unique CFBundleIdentifier (e.g., com.company.appname)'
        }
      ];

      configChecks.forEach(check => {
        const match = content.match(check.pattern);
        if (!match || !match[1] || match[1].includes('$(PRODUCT_NAME)')) {
          corrections.push(this.createCorrection(
            `ios-missing-${check.key.toLowerCase()}`,
            'warning',
            'medium',
            check.message,
            plistPath,
            content.substring(0, 500), // Show first 500 chars for context
            check.suggestion,
            'ios'
          ));
        }
      });

      // Check for background modes if needed
      if (content.includes('UIBackgroundModes')) {
        const backgroundModes = [
          'audio', 'location', 'voip', 'fetch', 'processing'
        ];
        
        backgroundModes.forEach(mode => {
          if (content.includes(mode) && !content.includes(`${mode} usage description`)) {
            corrections.push(this.createCorrection(
              `ios-background-${mode}-description`,
              'warning', 
              'medium',
              `Missing description for background mode: ${mode}`,
              plistPath,
              content,
              `Add usage description for ${mode} background mode`,
              'ios'
            ));
          }
        });
      }

      // Check for deprecated keys
      const deprecatedKeys = [
        'UIRequiredDeviceCapabilities',
        'UIRequiresPersistentWiFi'
      ];

      deprecatedKeys.forEach(deprecatedKey => {
        if (content.includes(deprecatedKey)) {
          corrections.push(this.createCorrection(
            `ios-deprecated-${deprecatedKey.toLowerCase()}`,
            'warning',
            'low',
            `Deprecated key found: ${deprecatedKey}`,
            plistPath,
            content,
            `Remove deprecated key ${deprecatedKey} from Info.plist`,
            'ios'
          ));
        }
      });

    } catch (error) {
      corrections.push(this.createCorrection(
        'ios-plist-parse-error',
        'error',
        'high',
        'Failed to parse iOS Info.plist',
        plistPath,
        error instanceof Error ? error.message : 'Unknown error',
        'Check Info.plist XML format and syntax',
        'ios'
      ));
    }
    
    return corrections;
  }

  private analyzePodfile(podfilePath: string): Correction[] {
    const corrections: Correction[] = [];

    try {
      const content = fs.readFileSync(podfilePath, 'utf8');

      // Check for React Native specific pod configurations
      if (content.includes('use_react_native') && !content.includes('platform :ios')) {
        corrections.push(this.createCorrection(
          'ios-podfile-platform',
          'warning',
          'medium',
          'iOS platform version not specified in Podfile',
          podfilePath,
          'Missing platform version',
          'Specify iOS platform version in Podfile',
          'compilation'
        ));
      }

      // Check for minimum iOS version
      if (!content.includes('platform :ios')) {
        corrections.push(this.createCorrection(
          'ios-podfile-min-version',
          'error',
          'high',
          'iOS platform configuration missing in Podfile',
          podfilePath,
          'Missing platform configuration',
          'Add platform :ios, \'11.0\' or higher to Podfile',
          'compilation'
        ));
      }

      // Check for React Native new architecture flags
      if (this.isUsingNewArchitecture() && !content.includes('RCT_NEW_ARCH_ENABLED')) {
        corrections.push(this.createCorrection(
          'ios-podfile-new-arch',
          'warning',
          'medium',
          'New Architecture flags missing in Podfile',
          podfilePath,
          'Missing New Architecture configuration',
          'Add New Architecture flags to Podfile for React Native 0.68+',
          'performance'
        ));
      }

    } catch (error) {
      // Ignore read errors for additional files
    }

    return corrections;
  }

  private analyzePbxproj(pbxprojPath: string): Correction[] {
    const corrections: Correction[] = [];

    try {
      const content = fs.readFileSync(pbxprojPath, 'utf8');

      // Check for code signing configuration
      if (!content.includes('PROVISIONING_PROFILE_SPECIFIER')) {
        corrections.push(this.createCorrection(
          'ios-pbxproj-code-signing',
          'info',
          'low',
          'Code signing configuration in project file',
          pbxprojPath,
          'Automatic code signing might not be configured',
          'Configure code signing settings in Xcode',
          'deployment'
        ));
      }

      // Check for deployment target
      if (!content.includes('IPHONEOS_DEPLOYMENT_TARGET')) {
        corrections.push(this.createCorrection(
          'ios-pbxproj-deployment-target',
          'warning',
          'medium',
          'Deployment target not explicitly set',
          pbxprojPath,
          'Missing IPHONEOS_DEPLOYMENT_TARGET',
          'Set explicit deployment target in project settings',
          'compatibility'
        ));
      }

    } catch (error) {
      // Ignore read errors
    }

    return corrections;
  }

  private findPbxprojFiles(): string[] {
    const pbxprojFiles: string[] = [];
    const iosPath = './ios';
    
    if (fs.existsSync(iosPath)) {
      try {
        const files = fs.readdirSync(iosPath, { recursive: true });
        files.forEach(file => {
          if (String(file).endsWith('.pbxproj')) {
            pbxprojFiles.push(path.join(iosPath, String(file)));
          }
        });
      } catch {
        // Ignore directory read errors
      }
    }
    
    return pbxprojFiles;
  }

  private appUsesBackgroundFeatures(): boolean {
    // Check if app might need background modes
    // This could be enhanced by checking package.json for specific dependencies
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        // Common packages that might need background modes
        const backgroundPackages = [
          'react-native-background-timer',
          'react-native-background-fetch',
          'react-native-background-geolocation',
          '@react-native-community/geolocation'
        ];
        
        return backgroundPackages.some(pkg => deps[pkg]);
      }
    } catch {
      // Ignore errors
    }
    return false;
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
}