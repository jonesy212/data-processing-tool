// analyzers/PlatformDetector.ts
import fs from 'fs';
import path from 'path';

export class PlatformDetector {
  static detect(): 'web' | 'mobile' | 'desktop' {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return 'web';
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (deps['react-native']) return 'mobile';
      if (deps['electron']) return 'desktop';
      return 'web';
    } catch (error) {
      console.warn('Could not detect platform, defaulting to web:', error);
      return 'web';
    }
  }
}