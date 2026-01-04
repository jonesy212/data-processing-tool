PlatformDetector.ts
analyzers/PlatformDetector.ts
import { BaseAnalyzer } from '@/core/generators/corrections/analyzers/BaseAnalyzer';
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';

export type Platform = 'web' | 'mobile' | 'desktop' | 'hybrid';

export class PlatformDetector extends BaseAnalyzer {
    async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const platformInfo = PlatformDetector.getPlatformInfo();

    // Add platform-specific analysis and suggestions
    if (platformInfo.isMultiPlatform) {
      corrections.push(this.createCorrection(
        'multi-platform-detected',
        'info',
        'low',
        `Multi-platform project detected: ${platformInfo.allPlatforms.join(', ')}`,
        'package.json',
        `Primary platform: ${platformInfo.primaryPlatform}`,
        `Consider platform-specific optimizations for: ${platformInfo.allPlatforms.join(', ')}`,
        'platform',
        1
      ));
    }

    // Platform-specific recommendations
    if (platformInfo.hasMobile) {
      corrections.push(this.createCorrection(
        'mobile-platform-tips',
        'suggestion',
        'low',
        'Mobile platform detected',
        'package.json',
        'React Native or similar mobile framework found',
        'Optimize for touch interactions, mobile performance, and different screen sizes',
        'platform',
        1
      ));
    }

    if (platformInfo.hasWeb) {
      corrections.push(this.createCorrection(
        'web-platform-tips',
        'suggestion',
        'low',
        'Web platform detected',
        'package.json',
        'Web framework (React, Next.js, etc.) found',
        'Consider SEO, browser compatibility, and web performance optimizations',
        'platform',
        1
      ));
    }

    return corrections;
  }

  static detect(): Platform {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return 'web';
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      const scripts = packageJson.scripts || {};

      // Check platform indicators
      const hasReactNative = !!deps['react-native'];
      const hasReactNativeWeb = !!deps['react-native-web'];
      const hasElectron = !!deps['electron'];
      const hasNextJs = !!deps['next'];
      const hasExpo = !!deps['expo'];
      
      // Check for mobile-specific scripts
      const hasMobileScripts = scripts.android || scripts.ios || scripts['start:mobile'];
      const hasWebScripts = scripts.dev || scripts.build || scripts.start;
      
      // Platform detection logic
      if (hasReactNative && hasReactNativeWeb && hasWebScripts) {
        return 'hybrid'; // Both web and mobile (like your project)
      }
      
      if (hasReactNative && !hasWebScripts) {
        return 'mobile'; // React Native only
      }
      
      if (hasElectron) {
        return 'desktop';
      }
      
      if (hasReactNative && hasWebScripts) {
        return 'hybrid'; // React Native with web support
      }
      
      // Default to web for Next.js, Create React App, Vite, etc.
      return 'web';

    } catch (error) {
      console.warn('Could not detect platform, defaulting to web:', error);
      return 'web';
    }
  }

  static detectAllPlatforms(): Platform[] {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const platforms: Platform[] = [];
    
    if (!fs.existsSync(packageJsonPath)) {
      return ['web'];
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      const scripts = packageJson.scripts || {};

      // Check for web platform
      if (deps.react && deps['react-dom'] && (scripts.dev || scripts.build || scripts.start)) {
        platforms.push('web');
      }

      // Check for mobile platform
      if (deps['react-native'] && (scripts.android || scripts.ios || scripts['start:mobile'])) {
        platforms.push('mobile');
      }

      // Check for desktop platform
      if (deps.electron) {
        platforms.push('desktop');
      }

      // If no specific platforms detected but has React, assume web
      if (platforms.length === 0 && deps.react) {
        platforms.push('web');
      }

      return platforms.length > 0 ? platforms : ['web'];

    } catch (error) {
      console.warn('Could not detect platforms, defaulting to web:', error);
      return ['web'];
    }
  }

  static getBuildTargets(): { platform: Platform; buildCommand: string }[] {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const targets: { platform: Platform; buildCommand: string }[] = [];
    
    if (!fs.existsSync(packageJsonPath)) {
      return [{ platform: 'web', buildCommand: 'npm run build' }];
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const scripts = packageJson.scripts || {};

      // Web targets
      if (scripts.build) {
        targets.push({ platform: 'web', buildCommand: 'npm run build' });
      }
      if (scripts['build:web']) {
        targets.push({ platform: 'web', buildCommand: 'npm run build:web' });
      }

      // Mobile targets
      if (scripts.android) {
        targets.push({ platform: 'mobile', buildCommand: 'npm run android' });
      }
      if (scripts.ios) {
        targets.push({ platform: 'mobile', buildCommand: 'npm run ios' });
      }

      // Desktop targets
      if (scripts['build:desktop']) {
        targets.push({ platform: 'desktop', buildCommand: 'npm run build:desktop' });
      }

      return targets;

    } catch (error) {
      console.warn('Could not detect build targets:', error);
      return [{ platform: 'web', buildCommand: 'npm run build' }];
    }
  }

  static getPlatformInfo() {
    const primaryPlatform = this.detect();
    const allPlatforms = this.detectAllPlatforms();
    const buildTargets = this.getBuildTargets();

    return {
      primaryPlatform,
      allPlatforms,
      buildTargets,
      isMultiPlatform: allPlatforms.length > 1,
      hasWeb: allPlatforms.includes('web'),
      hasMobile: allPlatforms.includes('mobile'),
      hasDesktop: allPlatforms.includes('desktop')
    };
  }
}