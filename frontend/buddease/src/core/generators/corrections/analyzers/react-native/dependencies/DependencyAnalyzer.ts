// DependencyAnalyzer.ts

import { BaseAnalyzer } from '@/core/generators/corrections/analyzers/BaseAnalyzer';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

class VersionChecker {
  extractMajorVersion(version: string): number {
    const match = version.match(/[0-9]+/);
    return match ? parseInt(match[0]) : 0;
  }
}

export class DependencyAnalyzer extends BaseAnalyzer {
   private versionChecker = new VersionChecker();

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    console.log('📦 Analyzing dependencies...');

    const packageErrors = this.analyzePackageDependencies();
    corrections.push(...packageErrors);

    // Analyze dependency conflicts
    const conflictErrors = await this.analyzeDependencyConflicts();
    corrections.push(...conflictErrors);

    // Analyze unused dependencies
    const unusedErrors = await this.analyzeUnusedDependencies();
    corrections.push(...unusedErrors);

    // Analyze security vulnerabilities
    const securityErrors = await this.analyzeSecurityVulnerabilities();
    corrections.push(...securityErrors);

    // Analyze peer dependencies
    const peerErrors = this.analyzePeerDependencies();
    corrections.push(...peerErrors);

    // Analyze dependency versions
    const versionErrors = this.analyzeDependencyVersions();
    corrections.push(...versionErrors);

    // Analyze React Native specific dependencies
    const reactNativeErrors = this.analyzeReactNativeDependencies();
    corrections.push(...reactNativeErrors);

    return corrections;
  }

    /**
   * Public method to analyze React Native dependencies
   * This wraps the private implementation for external access
   */
  public analyzeReactNativeDependencies(): Correction[] {
    return this.analyzeReactNativeDependenciesPrivate();
  }


  private analyzePackageDependencies(): Correction[] {
    const corrections: Correction[] = [];
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      corrections.push(this.createCorrection(
        'missing-package-json',
        'error',
        'critical',
        'package.json file not found',
        'package.json',
        'File not found',
        'Create a package.json file in the project root',
        'compilation'
      ));
      return corrections;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = packageJson.dependencies || {};
      const devDeps = packageJson.devDependencies || {};
      const allDeps = { ...deps, ...devDeps };

      // Check for missing dependencies
      if (Object.keys(deps).length === 0 && Object.keys(devDeps).length === 0) {
        corrections.push(this.createCorrection(
          'no-dependencies',
          'warning',
          'medium',
          'No dependencies found in package.json',
          'package.json',
          JSON.stringify(packageJson, null, 2),
          'Add necessary dependencies for your project',
          'structure'
        ));
      }

      // Check for very old package versions
      const oldPackages = this.findOldPackages(allDeps);
      corrections.push(...oldPackages);

      // Check for deprecated packages
      const deprecatedPackages = this.findDeprecatedPackages(allDeps);
      corrections.push(...deprecatedPackages);

      // Check for large dependencies
      const largePackages = this.findLargePackages(allDeps);
      corrections.push(...largePackages);

      // Check for duplicate dependencies
      const duplicatePackages = this.findDuplicatePackages(deps, devDeps);
      corrections.push(...duplicatePackages);

      // Check for missing TypeScript types
      const missingTypes = this.findMissingTypes(allDeps);
      corrections.push(...missingTypes);

    } catch (error) {
      corrections.push(this.createCorrection(
        'package-json-parse-error',
        'error',
        'high',
        'Failed to parse package.json',
        'package.json',
        'Parse error',
        'Fix JSON syntax errors in package.json',
        'compilation'
      ));
    }

    return corrections;
  }

  private findOldPackages(deps: Record<string, string>): Correction[] {
    const corrections: Correction[] = [];
    const currentYear = new Date().getFullYear();

    Object.entries(deps).forEach(([name, version]) => {
      // Check for very old major versions
      const majorVersion = this.extractMajorVersion(version);
      
      if (majorVersion < 2 && !this.isStablePackage(name)) {
        corrections.push(this.createCorrection(
          `old-package-${name}`,
          'warning',
          'medium',
          `Package "${name}" has very old major version: ${version}`,
          'package.json',
          `${name}: ${version}`,
          `Consider updating to a newer version of ${name}`,
          'performance'
        ));
      }

      // Check for pre-release versions in production
      if (version.includes('alpha') || version.includes('beta') || version.includes('rc')) {
        corrections.push(this.createCorrection(
          `prerelease-package-${name}`,
          'warning',
          'medium',
          `Package "${name}" uses pre-release version: ${version}`,
          'package.json',
          `${name}: ${version}`,
          `Use stable release version for production`,
          'runtime'
        ));
      }
    });

    return corrections;
  }

  private findDeprecatedPackages(deps: Record<string, string>): Correction[] {
    const corrections: Correction[] = [];
    
    const deprecatedPackages: Record<string, string> = {
      'request': 'Use node-fetch, axios, or native fetch instead',
      'express-session': 'Consider using JWT or other stateless authentication',
      'moment': 'Use date-fns or native Date APIs',
      'lodash': 'Consider using native JavaScript methods',
      'underscore': 'Use native JavaScript methods or lodash',
      'bluebird': 'Use native Promise or async/await',
      'grunt': 'Use webpack, vite, or other modern build tools',
      'gulp': 'Use webpack, vite, or other modern build tools',
      'bower': 'Use npm or yarn for package management'
    };

    Object.keys(deps).forEach(name => {
      if (deprecatedPackages[name]) {
        corrections.push(this.createCorrection(
          `deprecated-package-${name}`,
          'warning',
          'medium',
          `Deprecated package detected: ${name}`,
          'package.json',
          `${name}: ${deps[name]}`,
          deprecatedPackages[name],
          'structure'
        ));
      }
    });

    return corrections;
  }

  private findLargePackages(deps: Record<string, string>): Correction[] {
    const corrections: Correction[] = [];
    
    const largePackages = [
      'webpack', 'babel-core', 'typescript', 'react-dom', 'moment',
      'lodash', 'antd', 'material-ui', 'bootstrap'
    ];

    largePackages.forEach(name => {
      if (deps[name]) {
        corrections.push(this.createCorrection(
          `large-package-${name}`,
          'suggestion',
          'low',
          `Large package detected: ${name} (consider alternatives)`,
          'package.json',
          `${name}: ${deps[name]}`,
          `Consider lighter alternatives or tree-shaking configuration`,
          'performance'
        ));
      }
    });

    return corrections;
  }

  private findDuplicatePackages(deps: Record<string, string>, devDeps: Record<string, string>): Correction[] {
    const corrections: Correction[] = [];
    
    // Find packages in both dependencies and devDependencies
    Object.keys(deps).forEach(name => {
      if (devDeps[name]) {
        corrections.push(this.createCorrection(
          `duplicate-package-${name}`,
          'warning',
          'medium',
          `Package "${name}" exists in both dependencies and devDependencies`,
          'package.json',
          `dependencies: ${deps[name]}, devDependencies: ${devDeps[name]}`,
          `Move to either dependencies or devDependencies, not both`,
          'structure'
        ));
      }
    });

    return corrections;
  }

  private findMissingTypes(deps: Record<string, string>): Correction[] {
    const corrections: Correction[] = [];
    
    // Common packages that need TypeScript types
    const packagesNeedingTypes = [
      'react', 'react-dom', 'node', 'express', 'webpack',
      'jest', 'mocha', 'chai', 'lodash', 'moment'
    ];

    packagesNeedingTypes.forEach(name => {
      if (deps[name] && !deps[`@types/${name}`] && name !== 'node') {
        corrections.push(this.createCorrection(
          `missing-types-${name}`,
          'suggestion',
          'low',
          `TypeScript types missing for package: ${name}`,
          'package.json',
          `${name}: ${deps[name]}`,
          `Install types: pnpm install --save-dev @types/${name}`,
          'compilation'
        ));
      }
    });

    // Special case for node types
    if ((deps.typescript || deps.tsc) && !deps['@types/node']) {
      corrections.push(this.createCorrection(
        'missing-node-types',
        'suggestion',
        'low',
        'TypeScript Node.js types missing',
        'package.json',
        'TypeScript detected but @types/node missing',
        'Install Node.js types: pnpm install --save-dev @types/node',
        'compilation'
      ));
    }

    return corrections;
  }
  
  private async analyzeDependencyConflicts(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    try {
      // Check for dependency conflicts using npm/pnpm
      const { stdout, stderr } = await execAsync('pnpm ls --depth=0', {
        cwd: process.cwd(),
        timeout: 30000
      }).catch(error => ({ stdout: '', stderr: error.stderr || error.message }));

      if (stderr.includes('ERR_PNPM')) {
        // Parse pnpm conflict errors
        const conflictLines = stderr
          .split('\n')
          .filter((line: string) => line.includes('conflict') || line.includes('ERR_PNPM'));

        conflictLines.forEach((line: string) => {
          corrections.push(this.createCorrection(
            'dependency-conflict',
            'error',
            'high',
            'Dependency version conflict detected',
            'package.json',
            line.trim(),
            'Resolve version conflicts in package.json',
            'compilation'
          ));
        });
      }

    } catch (error) {
      // Ignore errors - dependency checking might not be available
    }

    return corrections;
  }

  private async analyzeUnusedDependencies(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    try {
      // Use depcheck to find unused dependencies
      const { stdout } = await execAsync('npx depcheck', {
        cwd: process.cwd(),
        timeout: 30000
      }).catch(error => ({ stdout: '', stderr: error.stderr }));

      if (stdout.includes('Unused dependencies') || stdout.includes('Unused devDependencies')) {
        const lines = stdout.split('\n');
        const unusedSection = lines.findIndex(line => line.includes('Unused'));
        
        if (unusedSection !== -1) {
          for (let i = unusedSection + 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line && !line.includes('Missing') && !line.includes('*')) {
              corrections.push(this.createCorrection(
                `unused-dependency-${line}`,
                'warning',
                'low',
                `Unused dependency: ${line}`,
                'package.json',
                `Dependency: ${line}`,
                `Remove unused dependency: pnpm remove ${line}`,
                'performance'
              ));
            }
          }
        }
      }

    } catch (error) {
      // depcheck might not be installed, skip this check
    }

    return corrections;
  }

  private async analyzeSecurityVulnerabilities(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    try {
      // Check for known security vulnerabilities
      const { stdout } = await execAsync('pnpm audit --audit-level high', {
        cwd: process.cwd(),
        timeout: 60000
      }).catch(error => ({ stdout: '', stderr: error.stderr }));

      if (stdout.includes('high') || stdout.includes('critical')) {
        const lines = stdout.split('\n');
        const vulnerabilityLines = lines.filter(line =>
          line.includes('high') || line.includes('critical')
        );

        vulnerabilityLines.forEach(line => {
          corrections.push(this.createCorrection(
            'security-vulnerability',
            'error',
            'critical',
            'Security vulnerability in dependencies',
            'package.json',
            line.trim(),
            'Run: pnpm audit fix --force to address vulnerabilities',
            'security'
          ));
        });
      }

    } catch (error) {
      // pnpm audit might not be available
    }

    return corrections;
  }

  private analyzePeerDependencies(): Correction[] {
    const corrections: Correction[] = [];
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) return corrections;

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const peerDeps = packageJson.peerDependencies || {};

      // Check for peer dependencies without corresponding dependencies
      Object.keys(peerDeps).forEach(name => {
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        if (!deps[name]) {
          corrections.push(this.createCorrection(
            `missing-peer-dependency-${name}`,
            'warning',
            'medium',
            `Peer dependency "${name}" not installed`,
            'package.json',
            `peerDependencies: ${name}: ${peerDeps[name]}`,
            `Install the peer dependency: pnpm install ${name}`,
            'compilation'
          ));
        }
      });

    } catch (error) {
      // Error handling already covered
    }

    return corrections;
  }

  private analyzeDependencyVersions(): Correction[] {
    const corrections: Correction[] = [];
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) return corrections;

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Check for version mismatches in common dependency groups
      const reactVersion = allDeps.react;
      const reactDomVersion = allDeps['react-dom'];
      
      if (reactVersion && reactDomVersion && reactVersion !== reactDomVersion) {
        corrections.push(this.createCorrection(
          'react-version-mismatch',
          'error',
          'high',
          `React and React DOM versions don't match`,
          'package.json',
          `React: ${reactVersion}, React DOM: ${reactDomVersion}`,
          'Align React and React DOM to the same version',
          'compilation'
        ));
      }

      // Check for wildcard versions
      Object.entries(allDeps).forEach(([name, version]) => {
        if (version === '*' || version === 'latest') {
          corrections.push(this.createCorrection(
            `wildcard-version-${name}`,
            'warning',
            'medium',
            `Package "${name}" uses wildcard version`,
            'package.json',
            `${name}: ${version}`,
            `Use specific version to prevent breaking changes`,
            'runtime'
          ));
        }
      });

    } catch (error) {
      // Error handling already covered
    }

    return corrections;
  }

  private analyzeReactNativeDependenciesPrivate(): Correction[] {
    const corrections: Correction[] = [];
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      return corrections;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      const rnVersion = deps['react-native'];
      if (rnVersion) {
        const majorVersion = this.versionChecker.extractMajorVersion(rnVersion);

        if (majorVersion < 0.60) {
          corrections.push(this.createCorrection(
            'old-react-native-version',
            'warning',
            'high',
            `React Native version ${rnVersion} is very old`,
            'package.json',
            `react-native: ${rnVersion}`,
            'Consider upgrading to a newer version of React Native',
            'performance'
          ));
        }

        if (majorVersion >= 0.60) {
          const hasNewArch = majorVersion >= 0.68;
          if (hasNewArch) {
            corrections.push(this.createCorrection(
              'react-native-new-arch',
              'info',
              'low',
              'React Native New Architecture detected',
              'package.json',
              `react-native: ${rnVersion}`,
              'Ensure all native modules support the New Architecture',
              'performance'
            ));
          }
        }
      }

      const commonDeps = [
        'react-native-gesture-handler',
        'react-native-reanimated',
        'react-native-screens',
        'react-native-safe-area-context'
      ];

      commonDeps.forEach(dep => {
        if (!deps[dep]) {
          corrections.push(this.createCorrection(
            `missing-rn-dependency-${dep}`,
            'suggestion',
            'low',
            `Common React Native dependency missing: ${dep}`,
            'package.json',
            `Dependency not found: ${dep}`,
            `Consider installing ${dep} for better React Native experience`,
            'structure'
          ));
        }
      });

      if (this.checkForDuplicateReact()) {
        corrections.push(this.createCorrection(
          'duplicate-react-instance-rn',
          'error',
          'high',
          'Potential duplicate React instance in React Native project',
          'package.json',
          JSON.stringify(deps, null, 2),
          'Check for multiple React versions in node_modules',
          'runtime'
        ));
      }

      if (!deps['hermes-engine'] && !deps['@react-native-community/cli-platform-android']) {
        corrections.push(this.createCorrection(
          'missing-hermes-config',
          'suggestion',
          'low',
          'Hermes JavaScript engine not explicitly configured',
          'package.json',
          'Hermes configuration missing',
          'Consider enabling Hermes for better performance',
          'performance'
        ));
      }
    } catch {
      // Error handled elsewhere
    }

    return corrections;
  }


    /**
   * Core React Native dependency analysis logic used by both public and private methods
   */
  private performReactNativeDependencyAnalysis(deps: Record<string, string>, rnVersion: string): Correction[] {
    const corrections: Correction[] = [];

    // Analyze React Native version
    corrections.push(...this.analyzeReactNativeVersion(rnVersion));

    // Analyze common React Native dependencies
    corrections.push(...this.analyzeCommonRNDependencies(deps));

    // Check for duplicate React instances
    corrections.push(...this.analyzeDuplicateReactIssues(deps));

    // Analyze Hermes configuration
    corrections.push(...this.analyzeHermesConfiguration(deps));

    // Analyze native dependencies compatibility
    corrections.push(...this.analyzeNativeDependenciesCompatibility(deps, rnVersion));

    // Analyze deprecated React Native packages
    corrections.push(...this.analyzeDeprecatedRNDependencies(deps));

    return corrections;
  }



    /**
   * Analyze React Native version for compatibility and performance issues
   */
  private analyzeReactNativeVersion(rnVersion: string): Correction[] {
    const corrections: Correction[] = [];
    const majorVersion = this.versionChecker.extractMajorVersion(rnVersion);

    // Version compatibility checks
    if (majorVersion < 0.60) {
      corrections.push(this.createCorrection(
        'old-react-native-version',
        'warning',
        'high',
        `React Native version ${rnVersion} is very old`,
        'package.json',
        `react-native: ${rnVersion}`,
        'Consider upgrading to React Native 0.68+ for better performance and features',
        'performance'
      ));
    } else if (majorVersion >= 0.60 && majorVersion < 0.64) {
      corrections.push(this.createCorrection(
        'react-native-version-upgrade',
        'suggestion',
        'medium',
        `React Native version ${rnVersion} can be upgraded`,
        'package.json',
        `react-native: ${rnVersion}`,
        'Consider upgrading to React Native 0.68+ for autolinking and better performance',
        'performance'
      ));
    }

    // New Architecture detection
    if (majorVersion >= 0.68) {
      corrections.push(this.createCorrection(
        'react-native-new-arch',
        'info',
        'low',
        'React Native New Architecture compatible',
        'package.json',
        `react-native: ${rnVersion}`,
        'Ensure all native modules support the New Architecture (Fabric & TurboModules)',
        'performance'
      ));
    }

    // Pre-release version warning
    if (rnVersion.includes('alpha') || rnVersion.includes('beta') || rnVersion.includes('rc')) {
      corrections.push(this.createCorrection(
        'react-native-prerelease',
        'warning',
        'medium',
        'Using pre-release version of React Native',
        'package.json',
        `react-native: ${rnVersion}`,
        'Pre-release versions may be unstable. Consider using stable release for production',
        'runtime'
      ));
    }

    return corrections;
  }



  /**
   * Analyze common React Native dependencies
   */
  private analyzeCommonRNDependencies(deps: Record<string, string>): Correction[] {
    const corrections: Correction[] = [];

    const essentialDeps = [
      'react-native-gesture-handler',
      'react-native-reanimated', 
      'react-native-screens',
      'react-native-safe-area-context'
    ];

    const recommendedDeps = [
      'react-native-vector-icons',
      'react-native-navigation',
      '@react-navigation/native',
      'react-native-device-info'
    ];

    // Check essential dependencies
    essentialDeps.forEach(name => {
      if (!deps[name]) {
        corrections.push(this.createCorrection(
          `missing-rn-dependency-${name}`,
          'suggestion',
          'medium',
          `Common React Native dependency missing: ${name}`,
          'package.json',
          `Dependency not found: ${name}`,
          `Consider installing ${name} for better React Native experience`,
          'structure'
        ));
      }
    });

    // Check recommended dependencies
    recommendedDeps.forEach(name => {
      if (!deps[name]) {
        corrections.push(this.createCorrection(
          `missing-rn-recommended-${name}`,
          'suggestion',
          'low',
          `Recommended React Native dependency missing: ${name}`,
          'package.json',
          `Dependency not found: ${name}`,
          `Consider installing ${name} for additional functionality`,
          'structure'
        ));
      }
    });

    return corrections;
  }




  /**
   * Analyze duplicate React instances and version conflicts
   */
  private analyzeDuplicateReactIssues(deps: Record<string, string>): Correction[] {
    const corrections: Correction[] = [];

    if (this.checkForDuplicateReact()) {
      corrections.push(this.createCorrection(
        'duplicate-react-instance-rn',
        'error',
        'high',
        'Potential duplicate React instance in React Native project',
        'package.json',
        JSON.stringify(deps, null, 2),
        'Check for multiple React versions in node_modules. Use "npm ls react" to verify',
        'runtime'
      ));
    }

    // Check React version compatibility
    const reactVersion = deps.react;
    const rnVersion = deps['react-native'];
    
    if (reactVersion && rnVersion) {
      const reactMajor = this.versionChecker.extractMajorVersion(reactVersion);
      const rnMajor = this.versionChecker.extractMajorVersion(rnVersion);

      // Basic React/React Native version compatibility check
      if (reactMajor >= 18 && rnMajor < 0.68) {
        corrections.push(this.createCorrection(
          'react-version-compatibility',
          'warning',
          'medium',
          'Potential React version compatibility issue',
          'package.json',
          `React: ${reactVersion}, React Native: ${rnVersion}`,
          'React 18+ works best with React Native 0.68+. Consider upgrading React Native',
          'runtime'
        ));
      }
    }

    return corrections;
  }



    /**
   * Analyze Hermes JavaScript engine configuration
   */
  private analyzeHermesConfiguration(deps: Record<string, string>): Correction[] {
    const corrections: Correction[] = [];

    // Check if Hermes is configured
    const hasHermesConfig = deps['hermes-engine'] || deps['hermesvm'];
    const hasCliConfig = deps['@react-native-community/cli-platform-android'] || 
                        deps['@react-native-community/cli-platform-ios'];

    if (!hasHermesConfig && !hasCliConfig) {
      corrections.push(this.createCorrection(
        'missing-hermes-config',
        'suggestion',
        'low',
        'Hermes JavaScript engine not explicitly configured',
        'package.json',
        'Hermes configuration missing',
        'Consider enabling Hermes for better performance. Add hermes-engine to dependencies',
        'performance'
      ));
    }

    // Check if Hermes is enabled but old version
    if (deps['hermes-engine']) {
      const hermesVersion = deps['hermes-engine'];
      const hermesMajor = this.versionChecker.extractMajorVersion(hermesVersion);
      
      if (hermesMajor < 0.11) {
        corrections.push(this.createCorrection(
          'old-hermes-version',
          'warning',
          'medium',
          'Old Hermes engine version',
          'package.json',
          `hermes-engine: ${hermesVersion}`,
          'Upgrade Hermes to latest version for better performance and features',
          'performance'
        ));
      }
    }

    return corrections;
  }


    /**
   * Analyze native dependencies compatibility with React Native version
   */
  private analyzeNativeDependenciesCompatibility(deps: Record<string, string>, rnVersion: string): Correction[] {
    const corrections: Correction[] = [];
    const rnMajor = this.versionChecker.extractMajorVersion(rnVersion);

    // Common native dependencies that might have compatibility issues
    const nativeDependencies = [
      'react-native-camera',
      'react-native-maps',
      'react-native-firebase',
      'react-native-video',
      'react-native-image-picker',
      'react-native-push-notification'
    ];

    nativeDependencies.forEach(dep => {
      if (deps[dep]) {
        // Check if native dependency might have issues with current RN version
        if (rnMajor >= 0.70 && !this.isKnownCompatible(dep, rnVersion)) {
          corrections.push(this.createCorrection(
            `native-dep-compatibility-${dep}`,
            'warning',
            'medium',
            `Native dependency ${dep} may need compatibility check`,
            'package.json',
            `${dep}: ${deps[dep]} with React Native: ${rnVersion}`,
            `Verify ${dep} compatibility with React Native ${rnVersion}. Check package documentation.`,
            'runtime'
          ));
        }
      }
    });

    return corrections;
  }



  /**
   * Analyze deprecated React Native packages
   */
  private analyzeDeprecatedRNDependencies(deps: Record<string, string>): Correction[] {
    const corrections: Correction[] = [];

    const deprecatedPackages: Record<string, { alternative: string, reason: string }> = {
      'react-native-deprecated-custom-components': {
        alternative: '@react-navigation/native',
        reason: 'Use modern navigation solutions'
      },
      'react-native-navigation': {
        alternative: '@react-navigation/native',
        reason: 'Wix navigation is being phased out'
      },
      'react-native-fbsdk': {
        alternative: 'react-native-fbsdk-next',
        reason: 'Use the maintained fork'
      },
      'react-native-linear-gradient': {
        alternative: 'expo-linear-gradient',
        reason: 'Expo version is better maintained'
      }
    };

    Object.entries(deprecatedPackages).forEach(([dep, info]) => {
      if (deps[dep]) {
        corrections.push(this.createCorrection(
          `deprecated-rn-package-${dep}`,
          'warning',
          'medium',
          `Deprecated React Native package: ${dep}`,
          'package.json',
          `${dep}: ${deps[dep]}`,
          `Consider migrating to ${info.alternative}. ${info.reason}`,
          'structure'
        ));
      }
    });

    return corrections;
  }


  /**
   * Check if a native dependency is known to be compatible
   */
  private isKnownCompatible(dep: string, rnVersion: string): boolean {
    // This would typically check against a compatibility database
    // For now, return true for common well-maintained packages
    const wellMaintainedPackages = [
      'react-native-gesture-handler',
      'react-native-reanimated',
      'react-native-screens',
      'react-native-safe-area-context'
    ];
    
    return wellMaintainedPackages.includes(dep);
  }

  private checkForDuplicateReact(): boolean {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) return false;

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      const reactPackages = Object.keys(deps).filter(dep =>
        dep.includes('react') && !dep.includes('react-native')
      );

      return reactPackages.length > 2;
    } catch {
      return false;
    }
  }

  // Helper methods
  private extractMajorVersion(version: string): number {
    const match = version.match(/[0-9]+/);
    return match ? parseInt(match[0]) : 0;
  }

  private isStablePackage(name: string): boolean {
    // Some packages are stable even with major version 1
    const stableV1Packages = ['react', 'react-dom', 'typescript', 'webpack'];
    return stableV1Packages.includes(name);
  }
}