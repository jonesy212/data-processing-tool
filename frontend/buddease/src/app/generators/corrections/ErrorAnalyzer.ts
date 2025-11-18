// ErrorAnalyzer.ts

import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import { ReactNativeAnalyzer } from './analyzers/ReactNativeAnalyzer';
import { BabelConfigAnalyzer } from './analyzers/react-native/config/BabelConfigAnalyzer';
import { ReactWebAnalyzer } from './analyzers/ReactWebAnalyzer';
import { TypeScriptAnalyzer } from './analyzers/TypeScriptAnalyzer';
import { BuildAnalyzer } from './analyzers/BuildAnalyzer';
import { DependencyAnalyzer } from '@/app/generators/corrections/analyzers/react-native/dependencies/DependencyAnalyzer';
import { PatternAnalyzer } from './analyzers/PatternAnalyzer';
import { PlatformDetector } from './analyzers/PlatformDetector';
import { BaseAnalyzer } from './analyzers/BaseAnalyzer';
import { ConfigFileAnalyzer } from '@/app/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer';

// Config Analyzers
import { TsConfigAnalyzer } from './analyzers/react-native/config/TsConfigAnalyzer';
import { AppConfigAnalyzer } from './analyzers/react-native/config/AppConfigAnalyzer';
import { AppJsonAnalyzer } from './analyzers/react-native/config/AppJsonAnalyzer';
import { MetroConfigAnalyzer } from './analyzers/react-native/config/MetroConfigAnalyzer';
import { RNConfigAnalyzer } from './analyzers/react-native/config/RNConfigAnalyzer';
import { PackageJsonAnalyzer } from './analyzers/react-native/errors/PackageJsonAnalyzer';
import { MetroLogAnalyzer } from './analyzers/react-native/errors/MetroLogAnalyzer';

// Native Analyzers
import { AndroidManifestAnalyzer } from './analyzers/react-native/native/AndroidManifestAnalyzer';
import { IosPlistAnalyzer } from './analyzers/react-native/native/IosPlistAnalyzer';

import path from 'path';
import fs from 'fs';

export class ErrorAnalyzer extends ConfigFileAnalyzer {
    private analyzers: BaseAnalyzer[];
    private configAnalyzers: ConfigFileAnalyzer[];
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
        super()
        this.platformInfo = PlatformDetector.getPlatformInfo();
        this.analyzers = this.initializeAnalyzers();
        this.configAnalyzers = this.initializeConfigAnalyzers();

        console.log('🎯 Detected platforms:', this.platformInfo.allPlatforms.join(', '));
        if (this.platformInfo.isMultiPlatform) {
            console.log('🔧 Multi-platform project detected');
        }
    }

    protected getConfigPaths(): string[] {
        const configPaths: string[] = [];
        const commonConfigFiles = [
            // Build tool configs
            'metro.config.js', 'metro.config.ts',
            'rn-cli.config.js', 'rn-cli.config.ts',

            // Web bundlers
            'webpack.config.js', 'webpack.config.ts', 'webpack.config.mjs',
            'vite.config.js', 'vite.config.ts', 'vite.config.mjs',

            // Framework configs
            'next.config.js', 'next.config.ts', 'next.config.mjs',

            // Transpilation configs
            'babel.config.js', 'babel.config.ts', 'babel.config.mjs',
            '.babelrc', '.babelrc.json',

            // TypeScript configs
            'tsconfig.json', 'tsconfig.build.json', 'jsconfig.json',

            // Package config
            'package.json',

            // App configs (React Native)
            'app.config.js', 'app.config.ts', 'app.json', 'App.json'
        ];

        for (const configFile of commonConfigFiles) {
            const configPath = path.resolve(process.cwd(), configFile);
            if (fs.existsSync(configPath)) {
                configPaths.push(configFile); // Push relative path, not absolute
            }
        }
        return configPaths;
    }

    private async validateConfigFile(configPath: string, configFile: string): Promise<string | null> {
        try {
            const content = await fs.promises.readFile(configPath, 'utf8');

            // Basic validation checks
            if (content.trim().length === 0) {
                return 'Configuration file is empty';
            }

            if (configFile.endsWith('.json')) {
                JSON.parse(content); // This will throw if invalid JSON
            }

            return null; // No errors
        } catch (error) {
            return error instanceof Error ? error.message : 'Unknown validation error';
        }
    }

    protected async analyzeConfigFile(configPath: string, configFile: string): Promise<Correction[]> {
        const corrections: Correction[] = [];

        try {
            const validationError = await this.validateConfigFile(configPath, configFile);
            if (validationError) {
                corrections.push(this.createCorrection(
                    `config-validation-error-${configFile}`,
                    'error',
                    'high',
                    `Configuration file validation failed: ${validationError}`,
                    configFile,
                    `Validation error: ${validationError}`,
                    'Fix the configuration file syntax and structure',
                    'compilation'
                ));
                return corrections; // Stop further analysis if basic validation fails
            }
            const content = await fs.promises.readFile(configPath, 'utf8');

            // Analyze based on config file type
            switch (configFile) {
                case 'package.json':
                    corrections.push(...await this.analyzePackageJson(content, configFile));
                    break;

                case 'tsconfig.json':
                    corrections.push(...await this.analyzeTsConfig(content, configFile));
                    break;

                case 'babel.config.js':
                case 'babel.config.ts':
                case '.babelrc':
                case '.babelrc.json':
                    corrections.push(...await this.analyzeBabelConfig(content, configFile));
                    break;

                case 'metro.config.js':
                case 'metro.config.ts':
                    corrections.push(...await this.analyzeMetroConfig(content, configFile));
                    break;

                case 'next.config.js':
                case 'next.config.ts':
                case 'next.config.mjs':
                    corrections.push(...await this.analyzeNextConfig(content, configFile));
                    break;

                case 'webpack.config.js':
                case 'webpack.config.ts':
                case 'webpack.config.mjs':
                    corrections.push(...await this.analyzeWebpackConfig(content, configFile));
                    break;

                case 'vite.config.js':
                case 'vite.config.ts':
                case 'vite.config.mjs':
                    corrections.push(...await this.analyzeViteConfig(content, configFile));
                    break;

                case 'app.config.js':
                case 'app.config.ts':
                case 'app.json':
                case 'App.json':
                    corrections.push(...await this.analyzeAppConfig(content, configFile));
                    break;

                default:
                    corrections.push(...await this.analyzeGenericConfig(content, configFile));
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            corrections.push(this.createCorrection(
                `config-read-error-${configFile}`,
                'error',
                'high',
                `Failed to read configuration file: ${configFile}`,
                configFile,
                `File read error: ${errorMessage}`,
                `Check file permissions and ensure ${configFile} is accessible`,
                'compilation'
            ));
        }

        return corrections;
    }

    private async analyzePackageJson(content: string, configFile: string): Promise<Correction[]> {
        const corrections: Correction[] = [];

        try {
            const packageJson = JSON.parse(content);
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

            // Check for React 19 with React Native compatibility
            if (deps.react && deps['react-native']) {
                const reactVersion = this.extractMajorVersion(deps.react);
                const rnVersion = this.extractMajorVersion(deps['react-native']);

                // React 19 with React Native 0.82 might have compatibility issues
                if (reactVersion >= 19 && rnVersion < 1) {
                    corrections.push(this.createCorrection(
                        'react-19-rn-compatibility',
                        'warning',
                        'high',
                        `React ${reactVersion} may have compatibility issues with React Native ${rnVersion}`,
                        configFile,
                        `React: ${deps.react}, React Native: ${deps['react-native']}`,
                        'Consider using React 18 or check React Native compatibility with React 19',
                        'runtime'
                    ));
                }
            }

            // Check for Next.js 16 with React 19
            if (deps.next && deps.react) {
                const nextVersion = this.extractMajorVersion(deps.next);
                const reactVersion = this.extractMajorVersion(deps.react);

                if (nextVersion === 16 && reactVersion >= 19) {
                    corrections.push(this.createCorrection(
                        'next-16-react-19-compatibility',
                        'warning',
                        'medium',
                        'Next.js 16 may not be fully compatible with React 19',
                        configFile,
                        `Next.js: ${deps.next}, React: ${deps.react}`,
                        'Consider upgrading to Next.js 14+ for better React 19 support',
                        'compilation'
                    ));
                }
            }

            // Check for missing platform-specific dependencies
            if (this.platformInfo.hasWeb && !deps['react-native-web']) {
                corrections.push(this.createCorrection(
                    'missing-react-native-web',
                    'suggestion',
                    'medium',
                    'react-native-web not installed for web platform',
                    configFile,
                    'react-native-web dependency missing',
                    'Install react-native-web: npm install react-native-web',
                    'compilation'
                ));
            }

            // Check for duplicate React instances
            const reactPackages = Object.keys(deps).filter(dep =>
                dep.includes('react') && !dep.includes('react-native')
            );
            if (reactPackages.length > 10) { // High number of React packages might indicate duplicates
                corrections.push(this.createCorrection(
                    'potential-duplicate-react',
                    'warning',
                    'medium',
                    'Multiple React-related packages detected - potential for duplicate React instances',
                    configFile,
                    `Found ${reactPackages.length} React-related packages`,
                    'Check for duplicate React versions in node_modules or use package resolutions',
                    'runtime'
                ));
            }

        } catch (error) {
            corrections.push(this.createCorrection(
                'package-json-parse-error',
                'error',
                'critical',
                'Invalid package.json syntax',
                configFile,
                'JSON parse error',
                'Fix JSON syntax errors in package.json',
                'compilation'
            ));
        }

        return corrections;
    }

    private async analyzeTsConfig(content: string, configFile: string): Promise<Correction[]> {
        const corrections: Correction[] = [];

        try {
            const tsConfig = JSON.parse(content);

            // Check for excessive lib configurations
            if (tsConfig.compilerOptions?.lib && tsConfig.compilerOptions.lib.length > 8) {
                corrections.push(this.createCorrection(
                    'tsconfig-excessive-libs',
                    'suggestion',
                    'low',
                    'TypeScript lib configuration includes many redundant libraries',
                    configFile,
                    `libs: ${tsConfig.compilerOptions.lib.join(', ')}`,
                    'Consider simplifying lib configuration to essential libraries only',
                    'performance'
                ));
            }

            // Check for mixed module systems
            if (tsConfig.compilerOptions?.module === 'esnext' && tsConfig.compilerOptions?.target === 'ES2017') {
                corrections.push(this.createCorrection(
                    'tsconfig-module-target-mismatch',
                    'warning',
                    'medium',
                    'ESNext module system with ES2017 target may cause compatibility issues',
                    configFile,
                    `module: ${tsConfig.compilerOptions.module}, target: ${tsConfig.compilerOptions.target}`,
                    'Consider aligning module and target versions (e.g., both ESNext)',
                    'compilation'
                ));
            }

            // Check for Next.js plugin in multi-platform context
            if (tsConfig.compilerOptions?.plugins?.some((p: any) => p.name === 'next') && this.platformInfo.hasMobile) {
                corrections.push(this.createCorrection(
                    'tsconfig-next-plugin-mobile',
                    'warning',
                    'medium',
                    'Next.js TypeScript plugin detected in multi-platform project',
                    configFile,
                    'Next.js plugin in TypeScript configuration',
                    'Ensure Next.js plugin does not interfere with React Native TypeScript processing',
                    'compilation'
                ));
            }

            // Check path configuration complexity
            if (tsConfig.compilerOptions?.paths && Object.keys(tsConfig.compilerOptions.paths).length > 30) {
                corrections.push(this.createCorrection(
                    'tsconfig-complex-paths',
                    'suggestion',
                    'low',
                    'TypeScript path configuration is very complex',
                    configFile,
                    `${Object.keys(tsConfig.compilerOptions.paths).length} path mappings configured`,
                    'Consider simplifying path configuration or using module aliases',
                    'maintainability'
                ));
            }

            // Check for noEmit with incremental (common issue)
            if (tsConfig.compilerOptions?.noEmit && tsConfig.compilerOptions?.incremental) {
                corrections.push(this.createCorrection(
                    'tsconfig-noemit-incremental',
                    'warning',
                    'medium',
                    'noEmit with incremental may not work as expected',
                    configFile,
                    'noEmit: true, incremental: true',
                    'Consider disabling incremental compilation when noEmit is enabled',
                    'compilation'
                ));
            }

        } catch (error) {
            corrections.push(this.createCorrection(
                'tsconfig-parse-error',
                'error',
                'critical',
                'Invalid tsconfig.json syntax',
                configFile,
                'JSON parse error',
                'Fix JSON syntax errors in tsconfig.json',
                'compilation'
            ));
        }

        return corrections;
    }

    private async analyzeBabelConfig(content: string, configFile: string): Promise<Correction[]> {
        const corrections: Correction[] = [];

        // Check for React Native Web plugin in multi-platform
        if (this.platformInfo.hasWeb && this.platformInfo.hasMobile) {
            if (!content.includes('react-native-web') && !content.includes('babel-plugin-react-native-web')) {
                corrections.push(this.createCorrection(
                    'babel-missing-rn-web',
                    'suggestion',
                    'medium',
                    'Babel config missing react-native-web plugin for multi-platform',
                    configFile,
                    content.substring(0, 200),
                    'Add babel-plugin-react-native-web for better React Native Web support',
                    'compilation'
                ));
            }
        }

        // Check for module resolver for path aliases
        if (!content.includes('module-resolver') && !content.includes('babel-plugin-module-resolver')) {
            corrections.push(this.createCorrection(
                'babel-missing-module-resolver',
                'suggestion',
                'low',
                'Babel module resolver not configured',
                configFile,
                content.substring(0, 200),
                'Add babel-plugin-module-resolver to handle path aliases from tsconfig',
                'compilation'
            ));
        }

        return corrections;
    }

    private async analyzeMetroConfig(content: string, configFile: string): Promise<Correction[]> {
        const corrections: Correction[] = [];

        // Check for React Native Web resolver in multi-platform
        if (this.platformInfo.hasWeb && !content.includes('react-native-web')) {
            corrections.push(this.createCorrection(
                'metro-missing-rn-web-resolver',
                'suggestion',
                'medium',
                'Metro config missing React Native Web resolver',
                configFile,
                content.substring(0, 200),
                'Add react-native-web to Metro resolver for web platform support',
                'compilation'
            ));
        }

        return corrections;
    }

    private async analyzeNextConfig(content: string, configFile: string): Promise<Correction[]> {
        const corrections: Correction[] = [];

        // Check for transpilePackages for React Native Web
        if (this.platformInfo.hasMobile && !content.includes('transpilePackages') && !content.includes('react-native')) {
            corrections.push(this.createCorrection(
                'next-missing-transpile-packages',
                'suggestion',
                'medium',
                'Next.js config not configured to transpile React Native packages',
                configFile,
                content.substring(0, 200),
                'Add transpilePackages for React Native dependencies',
                'compilation'
            ));
        }

        return corrections;
    }

    private async analyzeWebpackConfig(content: string, configFile: string): Promise<Correction[]> {
        const corrections: Correction[] = [];

        // Check for React Native Web aliases
        if (this.platformInfo.hasMobile && this.platformInfo.hasWeb) {
            if (!content.includes('react-native') && !content.includes('react-native-web')) {
                corrections.push(this.createCorrection(
                    'webpack-missing-rn-aliases',
                    'suggestion',
                    'medium',
                    'Webpack config missing React Native Web aliases',
                    configFile,
                    content.substring(0, 200),
                    'Add aliases for react-native -> react-native-web',
                    'compilation'
                ));
            }
        }

        return corrections;
    }

    private async analyzeViteConfig(content: string, configFile: string): Promise<Correction[]> {
        const corrections: Correction[] = [];

        // Check for React plugin with React 19
        if (content.includes('@vitejs/plugin-react')) {
            corrections.push(this.createCorrection(
                'vite-react-plugin-version',
                'info',
                'low',
                'Check @vitejs/plugin-react compatibility with React 19',
                configFile,
                content.substring(0, 200),
                'Ensure @vitejs/plugin-react version supports React 19',
                'compilation'
            ));
        }

        return corrections;
    }

    // Helper method to extract major version from version string
    private extractMajorVersion(version: string): number {
        // Handle version ranges like "^19.2.0", "~19.2.0", ">=19.2.0"
        const cleanVersion = version.replace(/[\^~>=]/, '');
        const match = cleanVersion.match(/[0-9]+/);
        return match ? parseInt(match[0]) : 0;
    }

    // Helper method to extract lines containing specific text
    private extractLineContaining(content: string, searchString: string): string {
        const lines = content.split('\n');
        const line = lines.find(l => l.includes(searchString));
        return line ? line.trim() : '';
    }

    private initializeConfigAnalyzers(): ConfigFileAnalyzer[] {
        const analyzers: ConfigFileAnalyzer[] = [
            // Core config files (all platforms)
            new TsConfigAnalyzer(),
            new BabelConfigAnalyzer(),
            new BuildAnalyzer(),
            new PackageJsonAnalyzer(),
            new MetroLogAnalyzer(),
        ];

        // React Native specific
        if (this.platformInfo.hasMobile) {
            analyzers.push(
                new MetroConfigAnalyzer(),
                new RNConfigAnalyzer(),
                new AppJsonAnalyzer(),
                new AppConfigAnalyzer(),
                new AndroidManifestAnalyzer(),
                new IosPlistAnalyzer()
            );
        }

        // Web specific - add when you create web config analyzers
        if (this.platformInfo.hasWeb) {
            // new WebpackConfigAnalyzer(), new ViteConfigAnalyzer(), etc.
        }

        return analyzers;
    }

    private initializeAnalyzers(): BaseAnalyzer[] {
        const baseAnalyzers: BaseAnalyzer[] = [
            new TypeScriptAnalyzer(),
            new BuildAnalyzer(),
            new DependencyAnalyzer(),
            new PatternAnalyzer()
        ];

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
        const [generalResults, configResults] = await Promise.all([
            Promise.all(this.analyzers.map(analyzer =>
                analyzer.analyze().catch(error => {
                    console.warn(`Analyzer ${analyzer.constructor.name} failed:`, error);
                    return [];
                })
            )),
            Promise.all(this.configAnalyzers.map(analyzer =>
                analyzer.analyze().catch(error => {
                    console.warn(`Config analyzer ${analyzer.constructor.name} failed:`, error);
                    return [];
                })
            ))
        ]);

        // Combine results
        generalResults.forEach(corrections => allCorrections.push(...corrections));
        configResults.forEach(corrections => allCorrections.push(...corrections));

        // Additional analysis
        const commonErrorCorrections = await this.analyzeCommonBuildErrors();
        allCorrections.push(...commonErrorCorrections);

        if (this.platformInfo.isMultiPlatform) {
            const multiPlatformCorrections = this.analyzeMultiPlatformIssues();
            allCorrections.push(...multiPlatformCorrections);
        }
        // Global deduplication across all analyzers
        return this.deduplicateCorrectionsGlobally(allCorrections);

    }


    private async safeAnalyzerExecution(analyzer: BaseAnalyzer, type: string): Promise<Correction[]> {
        try {
            const startTime = Date.now();
            const results = await analyzer.analyze();
            const duration = Date.now() - startTime;
            
            console.log(`   ✅ ${type} ${analyzer.constructor.name}: ${results.length} issues in ${duration}ms`);
            return results;
        } catch (error) {
            console.warn(`   ❌ ${type} ${analyzer.constructor.name} failed:`, error);
            return [];
        }
    }

    // Add this method to ErrorAnalyzer
    private deduplicateCorrectionsGlobally(corrections: Correction[]): Correction[] {
    const seen = new Map<string, Correction>();
    const uniqueCorrections: Correction[] = [];

    corrections.forEach(correction => {
        const key = this.createCorrectionKey(correction);
        
        if (!seen.has(key)) {
        seen.set(key, correction);
        uniqueCorrections.push(correction);
        } else {
        // Keep the one with higher severity if there's a conflict
        const existing = seen.get(key)!;
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const currentSeverity = severityOrder[correction.severity as keyof typeof severityOrder] || 0;
        const existingSeverity = severityOrder[existing.severity as keyof typeof severityOrder] || 0;
        
        if (currentSeverity > existingSeverity) {
            const index = uniqueCorrections.indexOf(existing);
            if (index > -1) {
            uniqueCorrections[index] = correction;
            seen.set(key, correction);
            }
        }
        }
    });

    return uniqueCorrections;
    }
    async analyzeConfiguration(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Track which files have been analyzed to prevent duplicates
    const analyzedFiles = new Set<string>();
    const fileCorrectionCount = new Map<string, number>();
    
    console.log('🔧 Starting configuration analysis...');
    
    // Run config analyzers
    const configAnalysisPromises = this.configAnalyzers.map(analyzer => {
        const analyzerName = analyzer.constructor.name;
        console.log(`   📊 Running ${analyzerName}...`);
        
        return analyzer.analyze().catch(error => {
        console.warn(`   ❌ ${analyzerName} failed:`, error.message);
        return [];
        });
    });

    const configResults = await Promise.all(configAnalysisPromises);

    // Use a Set to track unique corrections
    const seenCorrections = new Set<string>();

    configResults.forEach((configCorrections, index) => {
        const analyzerName = this.configAnalyzers[index].constructor.name;
        let analyzerCorrectionCount = 0;
        
        configCorrections.forEach(correction => {
        // Track analyzed files
        if (correction.file) {
            analyzedFiles.add(correction.file);
            fileCorrectionCount.set(correction.file, (fileCorrectionCount.get(correction.file) || 0) + 1);
        }
        
        // Fix undefined descriptions
        if (!correction.c || correction.description === 'undefined') {
            correction.description = correction.message || 'No description provided';
        }
        
        // Create a unique key for deduplication
        const correctionKey = this.createCorrectionKey(correction);
        
        if (!seenCorrections.has(correctionKey)) {
            corrections.push(correction);
            seenCorrections.add(correctionKey);
            analyzerCorrectionCount++;
        }
        });
        
        console.log(`   📈 ${analyzerName}: ${analyzerCorrectionCount} unique corrections`);
    });

    // Log comprehensive analysis summary
    console.log('\n📊 Configuration Analysis Summary:');
    console.log(`   Files Analyzed: ${analyzedFiles.size}`);
    console.log(`   Unique Corrections: ${corrections.length}`);
    console.log(`   Duplicates Prevented: ${seenCorrections.size - corrections.length}`);
    
    // Log files with multiple corrections
    fileCorrectionCount.forEach((count, file) => {
        if (count > 1) {
        console.log(`   📄 ${file}: ${count} corrections`);
        }
    });

    return corrections;
    }

    private createCorrectionKey(correction: Correction): string {
    // Create a comprehensive key for deduplication
    const baseKey = `${correction.file}:${correction.message}:${correction.type}:${correction.severity}`;
    
    // Include code snippet if available for better uniqueness
    if (correction.code) {
        return `${baseKey}:${correction.code.substring(0, 50)}`;
    }
    
    return baseKey;
    }

    // Analyze build logs for common cross-platform errors
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

    // Parse common errors from build logs
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

    // Check for common errors in recent terminal output (simulated)
    private checkForCommonErrorsInRecentOutput(): Correction[] {
        const corrections: Correction[] = [];

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


    private async analyzeAppConfig(content: string, configFile: string): Promise<Correction[]> {
        const corrections: Correction[] = [];

        try {
            // Handle both JSON and JS/TS config files
            let appConfig: any = null;

            if (configFile.endsWith('.json')) {
                appConfig = JSON.parse(content);
            } else {
                // For JS/TS config files, we'll do basic string analysis
                // In a real implementation, you might use a proper parser
                appConfig = this.parseJavaScriptConfig(content);
            }

            if (appConfig) {
                // Check for basic required properties
                if (!appConfig.name && !appConfig.expo?.name) {
                    corrections.push(this.createCorrection(
                        'app-config-missing-name',
                        'warning',
                        'medium',
                        'App config missing name property',
                        configFile,
                        'name property not found',
                        'Add name property to app configuration for better identification',
                        'structure'
                    ));
                }

                // Check for version
                if (!appConfig.version && !appConfig.expo?.version) {
                    corrections.push(this.createCorrection(
                        'app-config-missing-version',
                        'warning',
                        'low',
                        'App config missing version property',
                        configFile,
                        'version property not found',
                        'Add version property to track app versions',
                        'structure'
                    ));
                }

                // Check for platform-specific configurations
                if (this.platformInfo.hasMobile) {
                    corrections.push(...this.analyzeMobileAppConfig(appConfig, configFile));
                }

                // Check for Expo-specific configurations
                if (appConfig.expo) {
                    corrections.push(...this.analyzeExpoConfig(appConfig.expo, configFile));
                }

                // Check for multi-platform setup
                if (this.platformInfo.isMultiPlatform) {
                    corrections.push(...this.analyzeMultiPlatformAppConfig(appConfig, configFile));
                }
            }

            // Additional analysis for JavaScript config files
            if (configFile.endsWith('.js') || configFile.endsWith('.ts')) {
                corrections.push(...this.analyzeJavaScriptAppConfig(content, configFile));
            }

        } catch (error) {
            corrections.push(this.createCorrection(
                'app-config-parse-error',
                'error',
                'high',
                `Failed to parse app configuration: ${configFile}`,
                configFile,
                'Parse error',
                `Fix syntax errors in ${configFile}`,
                'compilation'
            ));
        }

        return corrections;
    }

    private analyzeMobileAppConfig(appConfig: any, configFile: string): Correction[] {
        const corrections: Correction[] = [];

        // Check for iOS configuration
        if (!appConfig.ios && !appConfig.expo?.ios) {
            corrections.push(this.createCorrection(
                'app-config-missing-ios',
                'suggestion',
                'medium',
                'iOS configuration missing from app config',
                configFile,
                'ios configuration not found',
                'Add iOS-specific configuration for better iOS support',
                'platform'
            ));
        }

        // Check for Android configuration
        if (!appConfig.android && !appConfig.expo?.android) {
            corrections.push(this.createCorrection(
                'app-config-missing-android',
                'suggestion',
                'medium',
                'Android configuration missing from app config',
                configFile,
                'android configuration not found',
                'Add Android-specific configuration for better Android support',
                'platform'
            ));
        }

        // Check for bundle identifiers/package names
        const iosBundleId = appConfig.ios?.bundleIdentifier || appConfig.expo?.ios?.bundleIdentifier;
        const androidPackage = appConfig.android?.package || appConfig.expo?.android?.package;

        if (!iosBundleId && !androidPackage) {
            corrections.push(this.createCorrection(
                'app-config-missing-identifiers',
                'warning',
                'high',
                'App identifiers missing for both iOS and Android',
                configFile,
                'No bundle identifier or package name found',
                'Add bundleIdentifier for iOS and package for Android',
                'deployment'
            ));
        }

        // Check for orientation settings
        if (!appConfig.orientation && !appConfig.expo?.orientation) {
            corrections.push(this.createCorrection(
                'app-config-missing-orientation',
                'suggestion',
                'low',
                'Screen orientation not specified',
                configFile,
                'orientation setting not found',
                'Set orientation to "portrait", "landscape", or "default"',
                'ui'
            ));
        }

        return corrections;
    }

    private analyzeExpoConfig(expoConfig: any, configFile: string): Correction[] {
        const corrections: Correction[] = [];

        // Check for SDK version
        if (!expoConfig.sdkVersion) {
            corrections.push(this.createCorrection(
                'expo-missing-sdk-version',
                'warning',
                'medium',
                'Expo SDK version not specified',
                configFile,
                'sdkVersion property missing',
                'Specify Expo SDK version for better compatibility',
                'compilation'
            ));
        }

        // Check for platform-specific Expo settings
        if (expoConfig.ios) {
            if (!expoConfig.ios.buildNumber && !expoConfig.ios.buildNumber) {
                corrections.push(this.createCorrection(
                    'expo-ios-missing-build-number',
                    'suggestion',
                    'low',
                    'iOS build number not specified in Expo config',
                    configFile,
                    'ios.buildNumber missing',
                    'Add build number for iOS app store submissions',
                    'deployment'
                ));
            }
        }

        if (expoConfig.android) {
            if (!expoConfig.android.versionCode) {
                corrections.push(this.createCorrection(
                    'expo-android-missing-version-code',
                    'suggestion',
                    'low',
                    'Android version code not specified in Expo config',
                    configFile,
                    'android.versionCode missing',
                    'Add version code for Android Play Store submissions',
                    'deployment'
                ));
            }
        }

        // Check for splash screen configuration
        if (!expoConfig.splash) {
            corrections.push(this.createCorrection(
                'expo-missing-splash-config',
                'suggestion',
                'low',
                'Splash screen configuration missing',
                configFile,
                'splash configuration not found',
                'Add splash screen configuration for better user experience',
                'ui'
            ));
        }

        return corrections;
    }

    private analyzeMultiPlatformAppConfig(appConfig: any, configFile: string): Correction[] {
        const corrections: Correction[] = [];

        // Check for web configuration in multi-platform setup
        if (this.platformInfo.hasWeb && !appConfig.web && !appConfig.expo?.web) {
            corrections.push(this.createCorrection(
                'app-config-missing-web',
                'suggestion',
                'medium',
                'Web configuration missing in multi-platform app config',
                configFile,
                'web configuration not found',
                'Add web-specific configuration for better web platform support',
                'platform'
            ));
        }

        // Check for consistent theming across platforms
        const hasTheme = appConfig.theme || appConfig.expo?.theme;
        if (!hasTheme) {
            corrections.push(this.createCorrection(
                'app-config-missing-theme',
                'suggestion',
                'low',
                'Theme configuration missing for multi-platform app',
                configFile,
                'theme configuration not found',
                'Add theme configuration for consistent styling across platforms',
                'ui'
            ));
        }

        return corrections;
    }

    private analyzeJavaScriptAppConfig(content: string, configFile: string): Correction[] {
        const corrections: Correction[] = [];

        // Check for common patterns in JavaScript config files

        // Check for export statements
        if (!content.includes('export default') && !content.includes('module.exports') && !content.includes('export=')) {
            corrections.push(this.createCorrection(
                'js-config-missing-export',
                'error',
                'high',
                'JavaScript config file missing export statement',
                configFile,
                'No export found',
                'Add export default or module.exports to make config available',
                'compilation'
            ));
        }

        // Check for required imports
        if (content.includes('defineConfig') && !content.includes('import') && !content.includes('require')) {
            corrections.push(this.createCorrection(
                'js-config-missing-imports',
                'warning',
                'medium',
                'Possible missing imports in config file',
                configFile,
                'defineConfig used but no imports found',
                'Add necessary imports for config functions',
                'compilation'
            ));
        }

        // Check for TypeScript usage in JS files
        if (configFile.endsWith('.js') && content.includes(':')) {
            // Look for TypeScript-like type annotations in JS files
            const typeAnnotationPattern = /(const|let|var)\s+\w+\s*:\s*\w+/;
            if (typeAnnotationPattern.test(content)) {
                corrections.push(this.createCorrection(
                    'js-config-typescript-syntax',
                    'warning',
                    'low',
                    'TypeScript syntax detected in JavaScript config file',
                    configFile,
                    'Type annotations found in .js file',
                    'Consider renaming to .ts or removing TypeScript syntax',
                    'structure'
                ));
            }
        }

        return corrections;
    }

    private parseJavaScriptConfig(content: string): any {
        // Production-ready JavaScript config parsing with proper error handling
        // Uses Node.js VM for safe execution or regex fallbacks

        try {
            // Method 1: Try using Node.js VM for safe execution (most reliable)
            const vmResult = this.parseWithVM(content);
            if (vmResult !== null) {
                return vmResult;
            }

            // Method 2: Enhanced regex parsing (fallback)
            const regexResult = this.parseWithEnhancedRegex(content);
            if (regexResult !== null) {
                return regexResult;
            }

            // Method 3: Simple object extraction (last resort)
            return this.extractObjectFromContent(content);

        } catch (error) {
            console.debug(`Failed to parse JavaScript config: ${error}`);
            return null;
        }
    }

    private parseWithVM(content: string): any {
        // Use Node.js VM for safe execution in production
        try {
            const vm = require('vm');
            const Module = require('module');

            // Create a safe context
            const context = {
                module: { exports: {} },
                exports: {},
                require,
                console,
                process,
                __filename: 'config.js',
                __dirname: process.cwd()
            };

            vm.createContext(context);

            // Wrap in function to capture exports
            const wrappedContent = `
            (function() {
                ${content}
                return module.exports || exports || null;
            })()
        `;

            const result = vm.runInContext(wrappedContent, context);

            // Filter out functions and return only serializable data
            return this.filterSerializableConfig(result);

        } catch (error) {
            // VM might not be available or content might be invalid
            return null;
        }
    }

    private parseWithEnhancedRegex(content: string): any {
        // Enhanced regex parsing without ES2018 flags
        try {
            // Handle export default { ... }
            const exportDefaultPatterns = [
                /export\s+default\s*(\{[\s\S]*?\})(?=\s*;|\s*$)/m,  // export default { ... }
                /export\s+default\s*(\{[\s\S]*\})/m,               // fallback pattern
            ];

            for (const pattern of exportDefaultPatterns) {
                const match = content.match(pattern);
                if (match) {
                    const jsonString = this.convertJsObjectToJson(match[1]);
                    if (jsonString) {
                        return JSON.parse(jsonString);
                    }
                }
            }

            // Handle module.exports = { ... }
            const moduleExportsPatterns = [
                /module\.exports\s*=\s*(\{[\s\S]*?\})(?=\s*;|\s*$)/m,  // module.exports = { ... }
                /module\.exports\s*=\s*(\{[\s\S]*\})/m,                // fallback pattern
            ];

            for (const pattern of moduleExportsPatterns) {
                const match = content.match(pattern);
                if (match) {
                    const jsonString = this.convertJsObjectToJson(match[1]);
                    if (jsonString) {
                        return JSON.parse(jsonString);
                    }
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    private convertJsObjectToJson(jsObjectString: string): string | null {
        try {
            // Convert JavaScript object to JSON string
            let jsonString = jsObjectString
                // Remove trailing commas
                .replace(/,\s*}/g, '}')
                .replace(/,\s*]/g, ']')
                // Convert single quotes to double quotes
                .replace(/'/g, '"')
                // Handle unquoted keys
                .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
                // Remove comments
                .replace(/\/\/.*$/gm, '')
                .replace(/\/\*[\s\S]*?\*\//g, '')
                // Handle template literals (convert to strings)
                .replace(/`([^`]*)`/g, '"$1"')
                // Handle JavaScript-specific syntax
                .replace(/\bundefined\b/g, 'null')
                .replace(/\bNaN\b/g, 'null')
                .replace(/\bInfinity\b/g, 'null');

            // Validate that we have a proper JSON structure
            if (this.isValidJson(jsonString)) {
                return jsonString;
            }

            return null;
        } catch (error) {
            return null;
        }
    }
    private extractObjectFromContent(content: string): any {
        // Last resort: extract any object-like structure
        try {
            // Simpler approach: look for balanced braces
            let braceCount = 0;
            let startIndex = -1;
            let endIndex = -1;

            for (let i = 0; i < content.length; i++) {
                if (content[i] === '{') {
                    if (braceCount === 0) {
                        startIndex = i;
                    }
                    braceCount++;
                } else if (content[i] === '}') {
                    braceCount--;
                    if (braceCount === 0 && startIndex !== -1) {
                        endIndex = i;
                        break;
                    }
                }
            }

            if (startIndex !== -1 && endIndex !== -1) {
                const potentialObject = content.substring(startIndex, endIndex + 1);
                const jsonString = this.convertJsObjectToJson(potentialObject);
                if (jsonString && this.isValidJson(jsonString)) {
                    return JSON.parse(jsonString);
                }
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    private filterSerializableConfig(config: any): any {
        // Recursively filter out non-serializable values
        if (config === null || config === undefined) {
            return config;
        }

        if (typeof config !== 'object') {
            return typeof config === 'function' ? null : config;
        }

        if (Array.isArray(config)) {
            return config
                .map(item => this.filterSerializableConfig(item))
                .filter(item => item !== null);
        }

        const result: any = {};

        for (const [key, value] of Object.entries(config)) {
            if (typeof value === 'function' || value instanceof RegExp) {
                continue; // Skip functions and regex
            }

            const filteredValue = this.filterSerializableConfig(value);
            if (filteredValue !== null) {
                result[key] = filteredValue;
            }
        }

        return Object.keys(result).length > 0 ? result : null;
    }

    private isValidJson(str: string): boolean {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    }

    private async analyzeGenericConfig(content: string, configFile: string): Promise<Correction[]> {
        const corrections: Correction[] = [];

        // Generic analysis for any configuration file

        // Check for empty files
        if (content.trim().length === 0) {
            corrections.push(this.createCorrection(
                'config-file-empty',
                'warning',
                'medium',
                `Configuration file is empty: ${configFile}`,
                configFile,
                'Empty file',
                'Add appropriate configuration to the file',
                'structure'
            ));
            return corrections;
        }

        // Check file size (very large config files might indicate issues)
        if (content.length > 10000) { // 10KB threshold
            corrections.push(this.createCorrection(
                'config-file-large',
                'info',
                'low',
                `Configuration file is unusually large: ${configFile}`,
                configFile,
                `File size: ${content.length} characters`,
                'Consider splitting configuration or removing unnecessary settings',
                'maintainability'
            ));
        }

        // Check for common syntax issues
        corrections.push(...this.analyzeConfigSyntax(content, configFile));

        // Check for deprecated patterns
        corrections.push(...this.analyzeDeprecatedPatterns(content, configFile));

        // Check for security issues in config files
        corrections.push(...this.analyzeConfigSecurity(content, configFile));

        // Check for performance issues
        corrections.push(...this.analyzeConfigPerformance(content, configFile));

        return corrections;
    }

    private analyzeConfigSyntax(content: string, configFile: string): Correction[] {
        const corrections: Correction[] = [];

        // JSON syntax checking
        if (configFile.endsWith('.json')) {
            try {
                JSON.parse(content);
            } catch (error) {
                corrections.push(this.createCorrection(
                    'config-json-syntax-error',
                    'error',
                    'critical',
                    `JSON syntax error in ${configFile}`,
                    configFile,
                    `Error: ${(error as Error).message}`,
                    'Fix JSON syntax errors - check for missing commas, quotes, or brackets',
                    'compilation'
                ));
            }
        }

        // JavaScript syntax checking (basic)
        if (configFile.endsWith('.js') || configFile.endsWith('.ts')) {
            // Check for common JavaScript syntax issues
            if (content.includes('undefined') && content.match(/undefined[^=]/)) {
                corrections.push(this.createCorrection(
                    'config-js-undefined-usage',
                    'warning',
                    'medium',
                    `Potential undefined reference in ${configFile}`,
                    configFile,
                    'undefined usage detected',
                    'Check for missing variable declarations or imports',
                    'compilation'
                ));
            }

            // Check for console.log in config files (usually not desired)
            if (content.includes('console.log') && !content.includes('// console.log')) {
                corrections.push(this.createCorrection(
                    'config-console-log',
                    'suggestion',
                    'low',
                    `console.log found in config file: ${configFile}`,
                    configFile,
                    'console.log statement detected',
                    'Remove console.log from config files for production',
                    'maintainability'
                ));
            }
        }

        // Check for trailing commas in JSON (invalid)
        if (configFile.endsWith('.json')) {
            const trailingCommaPatterns = [
                /,\s*}\s*$/,  // Trailing comma before object closing brace
                /,\s*]\s*$/,  // Trailing comma before array closing bracket
                /,\s*}(?=\s*[,\]])/,  // Trailing comma in nested structures
                /,\s*](?=\s*[,\]])/   // Trailing comma in nested arrays
            ];

            const hasTrailingComma = trailingCommaPatterns.some(pattern => pattern.test(content));

            if (hasTrailingComma) {
                corrections.push(this.createCorrection(
                    'config-json-trailing-comma',
                    'error',
                    'high',
                    `Trailing comma in JSON file: ${configFile}`,
                    configFile,
                    'Trailing comma detected before } or ]',
                    'Remove trailing commas from JSON objects and arrays - JSON does not allow trailing commas',
                    'compilation'
                ));
            }
        }

        return corrections;
    }

    private analyzeDeprecatedPatterns(content: string, configFile: string): Correction[] {
        const corrections: Correction[] = [];

        const deprecatedPatterns = [
            {
                pattern: /var\s+\w+\s*=/g,
                message: 'var keyword used instead of const/let',
                fix: 'Replace var with const or let'
            },
            {
                pattern: /require\(['"`]react-native\/Libraries\/[\w\/]+['"`]\)/,
                message: 'Direct React Native internal library imports',
                fix: 'Use public APIs instead of internal libraries'
            },
            {
                pattern: /@types\/react-native\b.*\b0\./,
                message: 'Old React Native type definitions',
                fix: 'Update to latest @types/react-native'
            },
            {
                pattern: /expo-\w+-adapter/,
                message: 'Legacy Expo adapter packages',
                fix: 'Use current Expo SDK packages instead'
            }
        ];

        deprecatedPatterns.forEach(({ pattern, message, fix }) => {
            if (pattern.test(content)) {
                corrections.push(this.createCorrection(
                    `config-deprecated-${message.replace(/\s+/g, '-')}`,
                    'warning',
                    'medium',
                    `Deprecated pattern: ${message}`,
                    configFile,
                    'Deprecated code pattern detected',
                    fix,
                    'maintainability'
                ));
            }
        });

        return corrections;
    }

    private analyzeConfigSecurity(content: string, configFile: string): Correction[] {
        const corrections: Correction[] = [];

        const securityPatterns = [
            {
                pattern: /(apiKey|secret|password|token)\s*[:=]\s*['"`].*?['"`]/,
                message: 'Hardcoded API keys or secrets in config file',
                fix: 'Use environment variables for sensitive data'
            },
            {
                pattern: /eval\(/,
                message: 'eval() function usage in config',
                fix: 'Avoid eval() for security reasons'
            },
            {
                pattern: /process\.env\.\w+\s*[!=]==\s*undefined/,
                message: 'Environment variable existence checks',
                fix: 'Use proper environment variable validation'
            }
        ];

        securityPatterns.forEach(({ pattern, message, fix }) => {
            if (pattern.test(content)) {
                corrections.push(this.createCorrection(
                    `config-security-${message.replace(/\s+/g, '-')}`,
                    'warning',
                    'high',
                    `Security concern: ${message}`,
                    configFile,
                    'Potential security issue detected',
                    fix,
                    'security'
                ));
            }
        });

        return corrections;
    }

    private analyzeConfigPerformance(content: string, configFile: string): Correction[] {
        const corrections: Correction[] = [];

        const performancePatterns = [
            {
                pattern: /(setInterval|setTimeout)\([^,]*,\s*1\s*\)/,
                message: 'Very short interval timers',
                fix: 'Use longer intervals or requestAnimationFrame for better performance'
            },
            {
                pattern: /JSON\.parse\(JSON\.stringify/,
                message: 'Inefficient deep cloning',
                fix: 'Use structuredClone or library functions for deep cloning'
            },
            {
                pattern: /\.map\(.*?\)\.filter|\.filter\(.*?\)\.map/,
                message: 'Multiple array iterations',
                fix: 'Combine map and filter operations into single reduce'
            }
        ];

        performancePatterns.forEach(({ pattern, message, fix }) => {
            if (pattern.test(content)) {
                corrections.push(this.createCorrection(
                    `config-performance-${message.replace(/\s+/g, '-')}`,
                    'suggestion',
                    'low',
                    `Performance suggestion: ${message}`,
                    configFile,
                    'Potential performance improvement available',
                    fix,
                    'performance'
                ));
            }
        });

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

    private deduplicateCorrections(corrections: Correction[]): Correction[] {
        const seen = new Set();
        return corrections.filter(correction => {
            const key = `${correction.file}:${correction.line}:${correction.message}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }


    // Add these utility methods if needed elsewhere in your analyzer
    private safeJSONParse(str: string): any {
        try {
            return JSON.parse(str);
        } catch {
            return null;
        }
    }

    private isConfigLikeObject(obj: any): boolean {
        return obj &&
            typeof obj === 'object' &&
            !Array.isArray(obj) &&
            Object.keys(obj).length > 0;
    }

    // Get platform info for reporting
    getPlatformInfo() {
        return this.platformInfo;
    }

    // Provide common errors to other analyzers if needed
    getCommonErrors() {
        return this.commonErrors;
    }
}