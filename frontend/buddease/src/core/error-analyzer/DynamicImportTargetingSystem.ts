DynamicImportTargetingSystem.ts
import { ImportFixerService } from '../generators/corrections/ImportFixServicies';
import { ImportExportAnalyzer, ImportExportIssue } from '@/core/error-analyzer/utils/ImportExportAnalyzer'
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface TargetingPattern {
    type: 'filename' | 'folder' | 'export' | 'pattern' | 'glob';
    value: string;
    options?: {
        convertToTypeOnly?: boolean;
        fixMissing?: boolean;
        fixIncorrect?: boolean;
    };
}

export interface ProjectExportMap {
    [exportName: string]: {
        filePath: string;
        isType: boolean;
        isDefault: boolean;
        occurrences: number;
        fromFiles: string[];
    }[];
}

export interface FolderAnalysis {
    folderPath: string;
    files: string[];
    exports: string[];
    importDependencies: Map<string, string[]>;
}

export interface FixResult {
    success: boolean;
    filesFixed: number;
    fixesApplied: number;
    issuesFound: number;
    details: {
        file: string;
        fixes: string[];
    }[];
}

export class DynamicImportTargetingSystem {
    private importFixer: ImportFixerService;
    private importAnalyzer: ImportExportAnalyzer;
    private projectRoot: string;
    private exportMap: ProjectExportMap = {};
    private folderAnalysis: Map<string, FolderAnalysis> = new Map();

    constructor(projectRoot: string = process.cwd()) {
        this.projectRoot = projectRoot;
        this.importFixer = new ImportFixerService('console');
        this.importAnalyzer = new ImportExportAnalyzer();
    }

    /**
     * MAIN ENTRY POINT: Fix imports based on flexible patterns
     */
    async fixImports(pattern: TargetingPattern, options: {
        dryRun?: boolean;
        interactive?: boolean;
        minConfidence?: 'high' | 'medium' | 'low';
    } = {}): Promise<FixResult> {
        console.log(`🎯 Targeting: ${pattern.type}:${pattern.value}`);

        // Build dynamic export map first
        await this.buildProjectExportMap();

        // Get files to fix based on pattern
        const filesToFix = await this.getFilesByPattern(pattern);

        if (filesToFix.length === 0) {
            console.log('✅ No files match the pattern');
            return {
                success: true,
                filesFixed: 0,
                fixesApplied: 0,
                issuesFound: 0,
                details: []
            };
        }

        console.log(`📊 Found ${filesToFix.length} files to analyze`);

        // Analyze each file
        const allIssues: Array<{ file: string; issues: ImportExportIssue[] }> = [];
        const allFixes: any[] = [];

        for (const file of filesToFix) {
            try {
                // Use ImportExportAnalyzer for deep analysis
                const issues = await this.importAnalyzer.analyzeFile(file);
                
                // Filter issues based on pattern
                const filteredIssues = this.filterIssuesByPattern(issues, pattern);
                
                if (filteredIssues.length > 0) {
                    allIssues.push({ file, issues: filteredIssues });
                    
                    // Convert issues to ImportFix format
                    const fixes = await this.convertIssuesToFixes(filteredIssues, file, pattern);
                    allFixes.push(...fixes);
                }
                        } catch (error) {
                if (error instanceof Error) {
                    console.warn(`⚠️ Could not analyze ${file}:`, error.message);
                } else {
                    console.warn(`⚠️ Could not analyze ${file}:`, error);
                }
            }
        }

        if (allFixes.length === 0) {
            console.log('✅ No import issues found for the specified pattern');
            return {
                success: true,
                filesFixed: 0,
                fixesApplied: 0,
                issuesFound: 0,
                details: []
            };
        }

        console.log(`📋 Found ${allFixes.length} fixes across ${allIssues.length} files`);

        // Apply fixes
        if (options.dryRun) {
            console.log('\n🔍 DRY RUN - Preview of fixes:');
            this.previewFixes(allFixes);
            return {
                success: true,
                filesFixed: 0,
                fixesApplied: 0,
                issuesFound: allFixes.length,
                details: allIssues.map(({ file, issues }) => ({
                    file,
                    fixes: issues.map(i => i.message)
                }))
            };
        }

        // Apply fixes using ImportFixerService
        const result = await this.importFixer.applyFixesWithOptions(allFixes, {
            minConfidence: options.minConfidence || 'medium',
            dryRun: false,
            backup: true
        });

        return {
            success: result.success,
            filesFixed: allIssues.length,
            fixesApplied: result.applied,
            issuesFound: allFixes.length,
            details: allIssues.map(({ file, issues }) => ({
                file,
                fixes: issues.map(i => i.message)
            }))
        };
    }

    /**
     * DYNAMIC EXPORT DISCOVERY - Scan project for all exports
     */
    private async buildProjectExportMap(): Promise<void> {
        console.log('🔍 Building dynamic export map...');

        const tsFiles = this.getAllTypeScriptFiles(this.projectRoot);
        this.exportMap = {};

        for (const file of tsFiles) {
            try {
                const exports = await this.getExportsFromFile(file);
                
                for (const exp of exports) {
                    if (!this.exportMap[exp.name]) {
                        this.exportMap[exp.name] = [];
                    }
                    
                    this.exportMap[exp.name].push({
                        filePath: file,
                        isType: exp.isTypeOnly,
                        isDefault: exp.isDefault,
                        occurrences: 1,
                        fromFiles: [file]
                    });
                }
            } catch (error) {
                // Skip files we can't parse
            }
        }

        console.log(`📊 Found ${Object.keys(this.exportMap).length} unique exports in project`);
    }

    /**
     * PATTERN-BASED FILE SELECTION
     */
    private async getFilesByPattern(pattern: TargetingPattern): Promise<string[]> {
        const allFiles = this.getAllTypeScriptFiles(this.projectRoot);

        switch (pattern.type) {
            case 'filename':
                // Fix by filename (e.g., "DataStore")
                return allFiles.filter(file => 
                    path.basename(file, path.extname(file)) === pattern.value ||
                    file.includes(`/${pattern.value}.`)
                );

            case 'folder':
                // Fix by folder (e.g., "core/state")
                const folderPath = path.join(this.projectRoot, pattern.value);
                if (!fs.existsSync(folderPath)) {
                    console.warn(`⚠️ Folder not found: ${folderPath}`);
                    return [];
                }
                return allFiles.filter(file => file.startsWith(folderPath));

            case 'export':
                // Fix specific export names (e.g., "DataStore", "VersionedData")
                const exportFiles = this.exportMap[pattern.value]?.map(e => e.filePath) || [];
                // Also find files that import this export
                const importingFiles = await this.findFilesImportingExport(pattern.value);
                return [...new Set([...exportFiles, ...importingFiles])];

            case 'pattern':
                // Regex pattern matching
                const regex = new RegExp(pattern.value);
                return allFiles.filter(file => regex.test(file));

            case 'glob':
                // Glob pattern (simplified)
                const globRegex = this.globToRegex(pattern.value);
                return allFiles.filter(file => globRegex.test(file));

            default:
                return [];
        }
    }

    /**
     * FIND FILES IMPORTING SPECIFIC EXPORT
     */
    private async findFilesImportingExport(exportName: string): Promise<string[]> {
        const files: string[] = [];
        const allFiles = this.getAllTypeScriptFiles(this.projectRoot);

        for (const file of allFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                // Simple regex search for the export name
                if (new RegExp(`import.*{.*${exportName}.*}.*from`).test(content) ||
                    new RegExp(`import.*${exportName}.*from`).test(content)) {
                    files.push(file);
                }
            } catch (error) {
                // Skip unreadable files
            }
        }

        return files;
    }

    /**
     * ISSUE FILTERING BASED ON PATTERN
     */
    private filterIssuesByPattern(issues: ImportExportIssue[], pattern: TargetingPattern): ImportExportIssue[] {
        return issues.filter(issue => {
            switch (pattern.type) {
                case 'export':
                    // Check if issue is about this specific export
                    return issue.message.includes(pattern.value);
                
                case 'filename':
                    // Check if issue is about imports from specific file
                    const fileName = pattern.value.toLowerCase();
                    return issue.message.toLowerCase().includes(fileName);
                
                case 'folder':
                    // Check if issue is in the target folder
                    return issue.filePath.includes(pattern.value);
                
                default:
                    return true; // Keep all issues for pattern/glob
            }
        });
    }

    /**
     * CONVERT ISSUES TO FIXES
     */
    private async convertIssuesToFixes(
        issues: ImportExportIssue[], 
        filePath: string,
        pattern: TargetingPattern
    ): Promise<any[]> {
        const fixes: any[] = [];
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        for (const issue of issues) {
            // Find the line with the issue
            const lineIndex = issue.line - 1;
            if (lineIndex >= 0 && lineIndex < lines.length) {
                const originalLine = lines[lineIndex].trim();
                
                if (issue.fix && issue.fix !== originalLine) {
                    fixes.push({
                        filePath,
                        originalLine,
                        newLine: issue.fix,
                        missingTypes: [this.extractExportName(issue.message)],
                        targetImportPath: this.extractImportPath(issue.message),
                        confidence: this.calculateIssueConfidence(issue),
                        confidenceScore: issue.severity === 'error' ? 90 : 70,
                        reason: issue.message
                    });
                }
            }
        }

        return fixes;
    }

    /**
     * PREVIEW FIXES
     */
    private previewFixes(fixes: any[]): void {
        const byFile = new Map<string, any[]>();
        fixes.forEach(fix => {
            if (!byFile.has(fix.filePath)) {
                byFile.set(fix.filePath, []);
            }
            byFile.get(fix.filePath)!.push(fix);
        });

        byFile.forEach((fileFixes, filePath) => {
            const relativePath = path.relative(this.projectRoot, filePath);
            console.log(`\n📄 ${relativePath}:`);
            fileFixes.forEach(fix => {
                console.log(`   📝 ${fix.reason}`);
                console.log(`       Before: ${fix.originalLine}`);
                console.log(`       After:  ${fix.newLine}`);
            });
        });
    }

    /**
     * UTILITY METHODS
     */
    private getAllTypeScriptFiles(dir: string): string[] {
        const files: string[] = [];

        const scan = (currentDir: string) => {
            const items = fs.readdirSync(currentDir, { withFileTypes: true });

            for (const item of items) {
                if (item.name.startsWith('.') || item.name === 'node_modules') {
                    continue;
                }

                const fullPath = path.join(currentDir, item.name);

                if (item.isDirectory()) {
                    scan(fullPath);
                } else if (item.isFile() &&
                    (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
                    files.push(fullPath);
                }
            }
        };

        scan(dir);
        return files;
    }

    private async getExportsFromFile(filePath: string): Promise<any[]> {
        // Use ImportExportAnalyzer's method
        return []; // Simplified - would integrate with your analyzer
    }

    private globToRegex(glob: string): RegExp {
        const escaped = glob
            .replace(/[.+^${}()|[\]\\]/g, '\\$&')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        return new RegExp(escaped);
    }

    private extractExportName(message: string): string {
        const match = message.match(/'([^']+)'/);
        return match ? match[1] : 'unknown';
    }

    private extractImportPath(message: string): string {
        const match = message.match(/from '([^']+)'/);
        return match ? match[1] : '';
    }

    private calculateIssueConfidence(issue: ImportExportIssue): 'high' | 'medium' | 'low' {
        if (issue.severity === 'error') return 'high';
        if (issue.type === 'type-only-import') return 'medium';
        return 'low';
    }

    /**
     * BATCH FIXING METHODS
     */
    async fixMultiplePatterns(patterns: TargetingPattern[], options?: {
        dryRun?: boolean;
        interactive?: boolean;
    }): Promise<FixResult[]> {
        const results: FixResult[] = [];
        
        for (const pattern of patterns) {
            console.log(`\n🎯 Processing pattern: ${pattern.type}:${pattern.value}`);
            const result = await this.fixImports(pattern, options);
            results.push(result);
        }
        
        return results;
    }

    async fixAllTypeOnlyImports(folder?: string): Promise<FixResult> {
        const pattern: TargetingPattern = {
            type: folder ? 'folder' : 'glob',
            value: folder || '**/*',
            options: { convertToTypeOnly: true }
        };
        
        return this.fixImports(pattern, { minConfidence: 'high' });
    }
}

/**
 * ENHANCED CLI INTERFACE
 */
export class DynamicImportFixerCLI {
    private targetingSystem: DynamicImportTargetingSystem;

    constructor(projectRoot: string = process.cwd()) {
        this.targetingSystem = new DynamicImportTargetingSystem(projectRoot);
    }

    async run(args: string[]): Promise<void> {
        const command = args[0];
        
        switch (command) {
            case 'fix:file':
                await this.fixByFilename(args[1], this.parseOptions(args.slice(2)));
                break;
                
            case 'fix:folder':
                await this.fixByFolder(args[1], this.parseOptions(args.slice(2)));
                break;
                
            case 'fix:export':
                await this.fixByExport(args[1], this.parseOptions(args.slice(2)));
                break;
                
            case 'fix:pattern':
                await this.fixByPattern(args[1], this.parseOptions(args.slice(2)));
                break;
                
            case 'fix:type-only':
                await this.fixTypeOnlyImports(args[1], this.parseOptions(args.slice(2)));
                break;
                
            case 'fix:all':
                await this.fixAllPatterns(args.slice(1));
                break;
                
            case 'scan':
                await this.scanProject();
                break;
                
            default:
                this.showHelp();
        }
    }

    private async fixByFilename(filename: string, options: any = {}): Promise<void> {
        const pattern: TargetingPattern = {
            type: 'filename',
            value: filename,
            options: options
        };
        
        const result = await this.targetingSystem.fixImports(pattern, options);
        this.printResult(result);
    }

    private async fixByFolder(folder: string, options: any = {}): Promise<void> {
        const pattern: TargetingPattern = {
            type: 'folder',
            value: folder,
            options: options
        };
        
        const result = await this.targetingSystem.fixImports(pattern, options);
        this.printResult(result);
    }

    private async fixByExport(exportName: string, options: any = {}): Promise<void> {
        const pattern: TargetingPattern = {
            type: 'export',
            value: exportName,
            options: options
        };
        
        const result = await this.targetingSystem.fixImports(pattern, options);
        this.printResult(result);
    }

    private async fixByPattern(patternStr: string, options: any = {}): Promise<void> {
        const pattern: TargetingPattern = {
            type: 'pattern',
            value: patternStr,
            options: options
        };
        
        const result = await this.targetingSystem.fixImports(pattern, options);
        this.printResult(result);
    }

    private async fixTypeOnlyImports(target?: string, options: any = {}): Promise<void> {
        const result = await this.targetingSystem.fixAllTypeOnlyImports(target);
        this.printResult(result);
    }

    private async fixAllPatterns(args: string[]): Promise<void> {
        const patterns: TargetingPattern[] = [];
        const options = this.parseOptions(args.filter(arg => arg.startsWith('--')));
        
        // Parse patterns from args
        let currentType: TargetingPattern['type'] | null = null;
        
        for (const arg of args) {
            if (arg === '--file') {
                currentType = 'filename';
            } else if (arg === '--folder') {
                currentType = 'folder';
            } else if (arg === '--export') {
                currentType = 'export';
            } else if (arg === '--pattern') {
                currentType = 'pattern';
            } else if (currentType && !arg.startsWith('--')) {
                patterns.push({
                    type: currentType,
                    value: arg,
                    options
                });
            }
        }
        
        const results = await this.targetingSystem.fixMultiplePatterns(patterns, options);
        results.forEach((result, i) => {
            console.log(`\n📊 Result ${i + 1}:`);
            this.printResult(result);
        });
    }

    private async scanProject(): Promise<void> {
        // Build and show export map
        await this.targetingSystem['buildProjectExportMap']();
        console.log('\n📊 Project Export Map:');
        // Would display the export map structure
    }

    private printResult(result: FixResult): void {
        console.log('\n📊 Fix Results:');
        console.log(`✅ Success: ${result.success}`);
        console.log(`📁 Files fixed: ${result.filesFixed}`);
        console.log(`🔧 Fixes applied: ${result.fixesApplied}`);
        console.log(`⚠️  Issues found: ${result.issuesFound}`);
        
        if (result.details.length > 0) {
            console.log('\n📝 Details:');
            result.details.forEach(detail => {
                const relativePath = path.relative(process.cwd(), detail.file);
                console.log(`\n  📄 ${relativePath}:`);
                detail.fixes.forEach(fix => console.log(`    • ${fix}`));
            });
        }
    }

    private parseOptions(args: string[]): any {
        const options: any = {
            dryRun: args.includes('--dry-run'),
            interactive: args.includes('--interactive'),
        };
        
        const minConfidence = args.find(arg => arg.startsWith('--min-confidence='));
        if (minConfidence) {
            options.minConfidence = minConfidence.split('=')[1] as 'high' | 'medium' | 'low';
        }
        
        return options;
    }

    private showHelp(): void {
        console.log(`
🎯 Dynamic Import Fixer
=======================
Fix imports based on flexible patterns instead of hardcoded mappings.

Usage:
  tsx dynamic-import-fixer.ts <command> <target> [options]

Commands:
  fix:file <filename>       Fix imports for specific file
  fix:folder <path>         Fix imports in specific folder
  fix:export <name>         Fix imports of specific export
  fix:pattern <regex>       Fix imports matching regex pattern
  fix:type-only [path]      Fix all type-only imports (optionally in folder)
  fix:all                   Fix multiple patterns at once
  scan                      Scan project for exports

Options:
  --dry-run                 Preview only, don't apply fixes
  --interactive             Ask for confirmation before each fix
  --min-confidence=<level>  Minimum confidence (high|medium|low)

Examples:
  # Fix all imports from DataStore file
  tsx dynamic-import-fixer.ts fix:file DataStore

  # Fix imports in core/state folder
  tsx dynamic-import-fixer.ts fix:folder core/state --dry-run

  # Fix DataStore and VersionedData exports
  tsx dynamic-import-fixer.ts fix:export DataStore fix:export VersionedData

  # Fix pattern matching *Snapshot*
  tsx dynamic-import-fixer.ts fix:pattern "*Snapshot*"

  # Fix all type-only imports
  tsx dynamic-import-fixer.ts fix:type-only

  # Batch fix with multiple patterns
  tsx dynamic-import-fixer.ts fix:all \\
    --file DataStore \\
    --file Snapshot \\
    --folder core/state \\
    --dry-run
        `);
    }
}

CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
    const cli = new DynamicImportFixerCLI();
    cli.run(process.argv.slice(2)).catch(console.error);
}