// ReactWebAnalyzer.ts
analyzers/ReactWebAnalyzer.ts
import { BuildAnalyzer } from '@/core/generators/corrections/analyzers/BuildAnalyzer';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

export class ReactWebAnalyzer extends BuildAnalyzer {
    private reactWebErrors = {
        // React Web-specific errors
        'Hook called conditionally': {
            severity: 'critical' as const,
            category: 'runtime' as const,
            fix: 'Move React Hook outside of conditional logic'
        },
        'Rendered more hooks than during previous render': {
            severity: 'critical' as const,
            category: 'runtime' as const,
            fix: 'Ensure Hooks are called in the same order every render'
        },
        'Cannot update a component while rendering a different component': {
            severity: 'high' as const,
            category: 'runtime' as const,
            fix: 'Move state updates to useEffect or event handlers'
        },
        'Invalid hook call': {
            severity: 'critical' as const,
            category: 'runtime' as const,
            fix: 'Ensure React is properly installed and Hooks are called in functional components'
        },
        'Text content did not match': {
            severity: 'high' as const,
            category: 'runtime' as const,
            fix: 'Fix hydration mismatch between server and client rendering'
        }
    };

    async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Only run React web analysis if React is detected
    if (!this.hasReact()) {
        return corrections;
    }

    console.log('🔍 Analyzing React web dependencies...');

    const nextJsErrors = this.analyzeNextJs();
    corrections.push(...nextJsErrors);

    // Vite analysis
    const viteErrors = this.analyzeVite();
    corrections.push(...viteErrors);

    // React dependency analysis
    const dependencyErrors = this.analyzeReactDependencies();
    corrections.push(...dependencyErrors);

    // React specific configuration analysis
    const configErrors = this.analyzeReactConfig();
    corrections.push(...configErrors);

    // ADD THIS: React error pattern analysis
    const patternErrors = await this.analyzeReactErrorPatterns();
    corrections.push(...patternErrors);

    return corrections;
    }

    private hasReact(): boolean {
        const packageJsonPath = path.resolve(process.cwd(), 'package.json');
        if (!fs.existsSync(packageJsonPath)) return false;

        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            return !!(deps.react || deps['react-dom']);
        } catch {
            return false;
        }
    }

    private analyzeNextJs(): Correction[] {
        const corrections: Correction[] = [];
        const nextConfigPath = path.resolve(process.cwd(), 'next.config.js');
    
        if (fs.existsSync(nextConfigPath)) {
            try {
                const content = fs.readFileSync(nextConfigPath, 'utf8');
        
                // Check target settings
                if (content.includes('target:') && !content.includes('target: \'server\'')) {
                    corrections.push(this.createCorrection(
                        'nextjs-target-warning',
                        'warning',
                        'medium',
                        'Next.js target setting may affect React hydration',
                        'next.config.js',
                        this.extractLineContaining(content, 'target:'),
                        'Ensure target setting is appropriate for your deployment',
                        'runtime'
                    ));
                }

                // Check for React 18 features
                if (!content.includes('experimental') && !content.includes('reactRoot')) {
                    corrections.push(this.createCorrection(
                        'nextjs-react-18-features',
                        'suggestion',
                        'low',
                        'Next.js may not be optimized for React 18 features',
                        'next.config.js',
                        content.substring(0, 200) + '...',
                        'Consider enabling React 18 experimental features in Next.js config',
                        'performance'
                    ));
                }

                // Check for missing compiler options
                if (!content.includes('compiler') && this.hasDependency('styled-components')) {
                    corrections.push(this.createCorrection(
                        'nextjs-styled-components-compiler',
                        'suggestion',
                        'medium',
                        'Next.js compiler not configured for styled-components',
                        'next.config.js',
                        content.substring(0, 200) + '...',
                        'Add compiler: { styledComponents: true } to Next.js config',
                        'performance'
                    ));
                }

            } catch (error) {
                console.warn('Could not analyze Next.js config:', error);
            }
        }

        return corrections;
    }

    private analyzeVite(): Correction[] {
        const corrections: Correction[] = [];
        const viteConfigPath = path.resolve(process.cwd(), 'vite.config.js');
    
        if (fs.existsSync(viteConfigPath)) {
            try {
                const content = fs.readFileSync(viteConfigPath, 'utf8');
        
                if (!content.includes('@vitejs/plugin-react')) {
                    corrections.push(this.createCorrection(
                        'vite-missing-react-plugin',
                        'error',
                        'high',
                        'Vite React plugin not found in config',
                        'vite.config.js',
                        content.substring(0, 200) + '...',
                        'Add @vitejs/plugin-react to Vite configuration',
                        'compilation'
                    ));
                }

                // Check for React specific Vite settings
                if (!content.includes('jsx') && !content.includes('react')) {
                    corrections.push(this.createCorrection(
                        'vite-react-jsx-config',
                        'suggestion',
                        'low',
                        'Vite JSX configuration not explicitly set for React',
                        'vite.config.js',
                        content.substring(0, 200) + '...',
                        'Consider setting jsx: \'react-jsx\' in Vite config for better React support',
                        'compilation'
                    ));
                }

            } catch (error) {
                console.warn('Could not analyze Vite config:', error);
            }
        }

        return corrections;
    }

    private analyzeReactDependencies(): Correction[] {
        const corrections: Correction[] = [];
        const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    
        if (!fs.existsSync(packageJsonPath)) {
            return corrections;
        }

        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
            // Check React and React DOM versions
            const reactVersion = deps.react;
            const reactDomVersion = deps['react-dom'];
      
            if (reactVersion && reactDomVersion) {
                // Check for version mismatches
                if (reactVersion !== reactDomVersion) {
                    corrections.push(this.createCorrection(
                        'react-version-mismatch',
                        'error',
                        'critical',
                        `React (${reactVersion}) and React DOM (${reactDomVersion}) versions don't match`,
                        'package.json',
                        `React: ${reactVersion}, React DOM: ${reactDomVersion}`,
                        'Align React and React DOM to the same version',
                        'compilation'
                    ));
                }
        
                // Check for React 18+ features
                const reactMajor = this.extractMajorVersion(reactVersion);
                if (reactMajor >= 18) {
                    // Check for React 18 specific dependencies
                    if (!deps['react-dom'] || this.extractMajorVersion(deps['react-dom']) < 18) {
                        corrections.push(this.createCorrection(
                            'react-18-dom-mismatch',
                            'error',
                            'high',
                            'React 18 requires React DOM 18+',
                            'package.json',
                            `React: ${reactVersion}, React DOM: ${reactDomVersion}`,
                            'Update React DOM to version 18 or higher',
                            'compilation'
                        ));
                    }

                    // Check for concurrent features support
                    if (this.hasDependency('@types/react') && this.extractMajorVersion(deps['@types/react']) < 18) {
                        corrections.push(this.createCorrection(
                            'react-18-types-mismatch',
                            'warning',
                            'medium',
                            'React 18 TypeScript types may be outdated',
                            'package.json',
                            `@types/react: ${deps['@types/react']}`,
                            'Update @types/react to version 18 or higher for full type support',
                            'compilation'
                        ));
                    }
                }
            }
      
            // Check for missing React dependencies
            if (!deps.react) {
                corrections.push(this.createCorrection(
                    'missing-react',
                    'error',
                    'critical',
                    'React dependency not found',
                    'package.json',
                    JSON.stringify(deps, null, 2),
                    'Install React: npm install react',
                    'compilation'
                ));
            }
      
            if (!deps['react-dom']) {
                corrections.push(this.createCorrection(
                    'missing-react-dom',
                    'error',
                    'critical',
                    'React DOM dependency not found',
                    'package.json',
                    JSON.stringify(deps, null, 2),
                    'Install React DOM: npm install react-dom',
                    'compilation'
                ));
            }
      
            // Check for TypeScript React types
            if (deps.typescript && !deps['@types/react'] && !deps['@types/react-dom']) {
                corrections.push(this.createCorrection(
                    'missing-react-types',
                    'warning',
                    'medium',
                    'TypeScript types for React not installed',
                    'package.json',
                    JSON.stringify(deps, null, 2),
                    'Install React TypeScript types: npm install --save-dev @types/react @types/react-dom',
                    'compilation'
                ));
            }

            // Check for common React library compatibility
            const reactLibraries = [
                'react-router-dom',
                'react-query',
                'react-hook-form',
                'styled-components',
                'emotion'
            ];

            for (const lib of reactLibraries) {
                if (deps[lib]) {
                    const libVersion = deps[lib];
                    const libMajor = this.extractMajorVersion(libVersion);
          
                    // Check for very old versions of popular libraries
                    if (libMajor < 5 && lib !== 'react-router-dom') {
                        corrections.push(this.createCorrection(
                            `old-${lib}-version`,
                            'warning',
                            'medium',
                            `${lib} version ${libVersion} may be outdated`,
                            'package.json',
                            `${lib}: ${libVersion}`,
                            `Consider updating ${lib} to a newer version`,
                            'performance'
                        ));
                    }

                    // React Router DOM specific checks
                    if (lib === 'react-router-dom' && libMajor >= 6) {
                        // Check for v6+ specific dependencies
                        if (!deps['react-router'] && libMajor >= 6) {
                            corrections.push(this.createCorrection(
                                'react-router-dom-v6-missing-peer',
                                'warning',
                                'low',
                                'react-router-dom v6+ requires react-router peer dependency',
                                'package.json',
                                `react-router-dom: ${libVersion}`,
                                'Install react-router as a dependency',
                                'structure'
                            ));
                        }
                    }
                }
            }

            // Check for state management libraries
            const stateLibraries = ['redux', 'mobx', 'recoil', 'zustand'];
            const installedStateLibs = stateLibraries.filter(lib => deps[lib]);
      
            if (installedStateLibs.length > 1) {
                corrections.push(this.createCorrection(
                    'multiple-state-libraries',
                    'warning',
                    'medium',
                    `Multiple state management libraries detected: ${installedStateLibs.join(', ')}`,
                    'package.json',
                    JSON.stringify(installedStateLibs, null, 2),
                    'Consider using only one state management solution to avoid complexity',
                    'structure'
                ));
            }

            // Check for duplicate React instances
            if (this.checkForDuplicateReact()) {
                corrections.push(this.createCorrection(
                    'duplicate-react-instance',
                    'error',
                    'high',
                    'Potential duplicate React instance detected',
                    'package.json',
                    JSON.stringify(deps, null, 2),
                    'Check for multiple React versions in node_modules or use yarn resolutions',
                    'runtime'
                ));
            }

            // Check for deprecated React packages
            const deprecatedPackages = {
                'create-react-class': 'Use ES6 classes or functional components with hooks',
                'prop-types': 'Consider using TypeScript for type checking instead',
                'react-addons-css-transition-group': 'Use React Transition Group or CSS-in-JS solutions'
            };

            for (const [deprecated, suggestion] of Object.entries(deprecatedPackages)) {
                if (deps[deprecated]) {
                    corrections.push(this.createCorrection(
                        `deprecated-${deprecated}`,
                        'warning',
                        'medium',
                        `Deprecated React package: ${deprecated}`,
                        'package.json',
                        `Dependency: ${deprecated}`,
                        suggestion,
                        'structure'
                    ));
                }
            }

            // Check for missing development dependencies
            if (!deps['@vitejs/plugin-react'] && this.hasDependency('vite')) {
                corrections.push(this.createCorrection(
                    'vite-react-plugin-missing',
                    'warning',
                    'medium',
                    'Vite React plugin not installed',
                    'package.json',
                    'Vite detected but React plugin missing',
                    'Install @vitejs/plugin-react for better React support with Vite',
                    'compilation'
                ));
            }

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

    private analyzeReactConfig(): Correction[] {
        const corrections: Correction[] = [];
    
        // Check for React specific configuration files
        const configFiles = [
            '.babelrc', '.babelrc.js', 'babel.config.js',
            'webpack.config.js', 'craco.config.js'
        ];

        for (const configFile of configFiles) {
            const configPath = path.resolve(process.cwd(), configFile);
            if (fs.existsSync(configPath)) {
                const configErrors = this.analyzeReactConfigFile(configPath, configFile);
                corrections.push(...configErrors);
            }
        }

        return corrections;
    }

    private analyzeReactConfigFile(configPath: string, configFile: string): Correction[] {
        const corrections: Correction[] = [];
    
        try {
            const content = fs.readFileSync(configPath, 'utf8');
      
            // Babel config checks
            if (configFile.includes('babel')) {
                if (!content.includes('@babel/preset-react') && !content.includes('preset-react')) {
                    corrections.push(this.createCorrection(
                        'babel-missing-react-preset',
                        'error',
                        'high',
                        'Babel config missing React preset',
                        configFile,
                        content.substring(0, 200) + '...',
                        'Add @babel/preset-react to Babel configuration',
                        'compilation'
                    ));
                }

                // Check for React fast refresh
                if (!content.includes('react-refresh') && this.hasDependency('react-refresh')) {
                    corrections.push(this.createCorrection(
                        'babel-missing-react-refresh',
                        'suggestion',
                        'low',
                        'Babel config missing React Fast Refresh',
                        configFile,
                        content.substring(0, 200) + '...',
                        'Add react-refresh/babel plugin for better development experience',
                        'performance'
                    ));
                }
            }

            // Webpack config checks
            if (configFile.includes('webpack')) {
                if (!content.includes('React') && !content.includes('react')) {
                    corrections.push(this.createCorrection(
                        'webpack-react-config',
                        'suggestion',
                        'low',
                        'Webpack config may not be optimized for React',
                        configFile,
                        content.substring(0, 200) + '...',
                        'Consider adding React-specific Webpack optimizations',
                        'performance'
                    ));
                }
            }

        } catch (error) {
            corrections.push(this.createCorrection(
                `config-parse-error-${configFile}`,
                'error',
                'high',
                `Failed to parse ${configFile}`,
                configFile,
                'Parse error',
                `Fix syntax errors in ${configFile}`,
                'compilation'
            ));
        }

        return corrections;
    }

    // Helper methods
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

    private extractMajorVersion(version: string): number {
        const match = version.match(/[0-9]+/);
        return match ? parseInt(match[0]) : 0;
    }

    private checkForDuplicateReact(): boolean {
        // This is a simplified check - in reality you'd need to analyze node_modules
        const packageJsonPath = path.resolve(process.cwd(), 'package.json');
        if (!fs.existsSync(packageJsonPath)) return false;

        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
            // Check for multiple React-related packages that might cause conflicts
            const reactPackages = Object.keys(deps).filter(dep =>
                dep.includes('react') && !dep.includes('react-native')
            );
      
            return reactPackages.length > 5; // Heuristic for potential duplicates
        } catch {
            return false;
        }
    }
    
    private async analyzeReactErrorPatterns(): Promise<Correction[]> {
        const corrections: Correction[] = [];
  
        try {
            // Scan source files for React-specific error patterns
            const srcDir = path.resolve(process.cwd(), 'src');
            if (fs.existsSync(srcDir)) {
                const sourceErrors = await this.scanReactSourceFiles(srcDir);
                corrections.push(...sourceErrors);
            }

            // Check build logs for React errors
            const buildErrors = this.analyzeBuildLogsForReactErrors();
            corrections.push(...buildErrors);

        } catch (error) {
            console.warn('Could not analyze React error patterns:', error);
        }

        return corrections;
    }

    private async scanReactSourceFiles(dir: string): Promise<Correction[]> {
        const corrections: Correction[] = [];

        try {
            const files = await fs.promises.readdir(dir, { recursive: true });

            for (const file of files) {
                if (!this.isReactSourceFile(file)) continue;

                const filePath = path.join(dir, file);

                /* ----  NEW: skip folders that look like source files  ---- */
                const stat = await fs.promises.stat(filePath).catch(() => null);
                if (!stat || stat.isDirectory()) {
                    if (stat?.isDirectory()) {
                        console.log(
                            chalk.yellow(
                                `⚠️  Skipped directory that looks like a source file: ${path.relative(process.cwd(), filePath)} ` +
                                `(rename or remove the folder to suppress this message)`
                            )
                        );
                    }
                    continue;
                }

                /* ----  normal file processing  ---- */
                try {
                    const content = await fs.promises.readFile(filePath, 'utf8');
                    const fileErrors = this.analyzeReactSourceFile(content, filePath);
                    corrections.push(...fileErrors);
                } catch (readError) {
                    console.warn(`Could not read file ${filePath}:`, readError);
                }
            }
        } catch (error) {
            console.warn(`Could not scan directory ${dir}:`, error);
        }

        return corrections;
    }

    private isReactSourceFile(filename: string): boolean {
        const extensions = ['.ts', '.tsx', '.js', '.jsx'];
        return extensions.some(ext => filename.endsWith(ext));
    }

    private analyzeReactSourceFile(content: string, filePath: string): Correction[] {
        const corrections: Correction[] = [];
        const lines = content.split('\n');
  
        const reactPatterns = [
            {
                pattern: /useState.*if.*\(|if.*useState|useEffect.*if.*\(|if.*useEffect/,
                handler: (match: RegExpMatchArray, lineNum: number, line: string) => ({
                    type: 'error' as const,
                    severity: 'critical' as const,
                    message: 'React Hook called conditionally',
                    code: line.trim(),
                    fix: 'Move Hook outside of conditional logic - Hooks must be called unconditionally',
                    category: 'runtime' as const
                })
            },
            {
                pattern: /useState.*\(.*\).*useState/,
                handler: (match: RegExpMatchArray, lineNum: number, line: string) => ({
                    type: 'warning' as const,
                    severity: 'high' as const,
                    message: 'Multiple useState calls might indicate complex state - consider useReducer',
                    code: line.trim(),
                    fix: 'Combine related state into single useState or use useReducer for complex state',
                    category: 'structure' as const
                })
            },
            {
                pattern: /useEffect.*\[\s*\]/,
                handler: (match: RegExpMatchArray, lineNum: number, line: string) => ({
                    type: 'warning' as const,
                    severity: 'medium' as const,
                    message: 'Empty dependency array in useEffect',
                    code: line.trim(),
                    fix: 'Ensure empty dependency array is intentional for mount-only effects',
                    category: 'runtime' as const
                })
            },
            {
                pattern: /useEffect.*setState/,
                handler: (match: RegExpMatchArray, lineNum: number, line: string) => ({
                    type: 'warning' as const,
                    severity: 'high' as const,
                    message: 'State update in useEffect without proper dependencies',
                    code: line.trim(),
                    fix: 'Add proper dependencies to useEffect or consider if state update is necessary',
                    category: 'runtime' as const
                })
            },
            {
                pattern: /<div.*onClick={.*}>/,
                handler: (match: RegExpMatchArray, lineNum: number, line: string) => ({
                    type: 'suggestion' as const,
                    severity: 'low' as const,
                    message: 'Consider using <button> for clickable elements for accessibility',
                    code: line.trim(),
                    fix: 'Replace div with button element or add role="button" and tabIndex',
                    category: 'structure' as const
                })
            },
            {
                pattern: /key={index}/,
                handler: (match: RegExpMatchArray, lineNum: number, line: string) => ({
                    type: 'warning' as const,
                    severity: 'medium' as const,
                    message: 'Using array index as React key',
                    code: line.trim(),
                    fix: 'Use unique stable IDs instead of array indices for keys',
                    category: 'performance' as const
                })
            }
        ];

        lines.forEach((line, index) => {
            for (const { pattern, handler } of reactPatterns) {
                const match = line.match(pattern);
                if (match) {
                    const errorData = handler(match, index + 1, line);
                    corrections.push(this.createCorrection(
                        `react-pattern-${filePath}-${index + 1}`,
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

    private analyzeBuildLogsForReactErrors(): Correction[] {
        const corrections: Correction[] = [];
        const logFiles = ['build.log', 'next.build.log', 'vite.build.log'];

        for (const logFile of logFiles) {
            const logPath = path.resolve(process.cwd(), logFile);
            if (fs.existsSync(logPath)) {
                try {
                    const logContent = fs.readFileSync(logPath, 'utf8');
                    const reactErrors = this.parseReactBuildErrors(logContent, logFile);
                    corrections.push(...reactErrors);
                } catch (error) {
                    console.warn(`Could not read log file ${logFile}:`, error);
                }
            }
        }

        return corrections;
    }

    private parseReactBuildErrors(logContent: string, logFile: string): Correction[] {
        const corrections: Correction[] = [];
        const lines = logContent.split('\n');
  
        lines.forEach((line, index) => {
            for (const [errorPattern, errorInfo] of Object.entries(this.reactWebErrors)) {
                if (line.toLowerCase().includes(errorPattern.toLowerCase())) {
                    corrections.push(this.createCorrection(
                        `react-build-error-${logFile}-${index}`,
                        'error',
                        errorInfo.severity,
                        `React error detected: ${errorPattern}`,
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
}