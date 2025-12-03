// ImportFixerService.ts
import fs from 'fs';
import path from 'path';
import { Correction, ComplexFix, ImportCorrection } from '@/app/generators/corrections/CorrectionGenerator';
import { ConsoleConfirmationService } from '@/app/services/ConsoleConfirmationService';
import { InteractiveConfirmationService } from '@/app/services/InteractiveConfirmationService';
import { FileConfirmationService } from '@/app/services/FileConfirmationService';
import { CorrectionType, CorrectionSeverity, CorrectionCategory } from '@/app/typings/correctionTypes';
import { ConfirmationService } from '@/app/services/ConfirmationService';
import { ImportAnalysis } from '@app/generators/corrections/reports/ImportReport'

export interface ImportFix {
    filePath: string;
    originalLine: string;
    newLine: string;
    missingTypes: string[];
    targetImportPath: string;
    reason?: string
}

export interface ParsedImport {
    fullLine: string;
    importPath: string;
    namedImports: string[];
    defaultImport?: string;
    isTypeOnly: boolean;
    lineNumber: number;
}


export class ImportFixerService {
    private readonly KNOWN_IMPORT_MAPPINGS: Map<string, string> = new Map([
        ['NotificationType', '@/app/features/support/UnifiedNotificationTypes'],
        ['NotificationTypeEnum', '@/app/features/support/UnifiedNotificationTypes'],
        ['UnifiedMetaDataOptions', '@/app/config/MetadataOptions'],
        ['ChecklistItemProps', '@/app/models/ChecklistItem'],
        // Add more mappings as needed
    ]);

    private readonly IMPORT_PATTERNS = {
        // Pattern 1: import { A, B } from 'path';
        NAMED_IMPORT: /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"];?/,

        // Pattern 2: import A, { B } from 'path';
        MIXED_IMPORT: /import\s+([^,{]+),\s*{([^}]+)}\s+from\s+['"]([^'"]+)['"];?/,

        // Pattern 3: import A from 'path';
        DEFAULT_IMPORT: /import\s+([^{}\s]+)\s+from\s+['"]([^'"]+)['"];?/,

        // Pattern 4: import type { A } from 'path';
        TYPE_IMPORT: /import\s+type\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"];?/,
    };

    private confirmationService: ConfirmationService;

    constructor(confirmationType: 'console' | 'interactive' | 'file' = 'console') {
        switch (confirmationType) {
            case 'interactive':
                this.confirmationService = new InteractiveConfirmationService();
                break;
            case 'file':
                this.confirmationService = new FileConfirmationService();
                break;
            default:
                this.confirmationService = new ConsoleConfirmationService();
        }
    }

    /**
     * Analyze a file for import errors and suggest fixes
     */
    async analyzeFile(filePath: string): Promise<ImportAnalysis> {
          if (!this.projectTreeBuilt) {
            await this.buildProjectTree();
        }

        const content = await fs.promises.readFile(filePath, 'utf8');
        const lines = content.split('\n');
        const imports = this.parseImports(lines);
        const errors = this.detectImportErrors(content);
        const smartFixes = await this.analyzeSmartFixes(content, filePath, imports);


        const suggestedFixes: ImportFix[] = [];

        for (const error of errors) {
            const fix = this.suggestImportFix(error, imports, filePath);
            if (fix) {
                suggestedFixes.push(fix);
            }
        }

        suggestedFixes.push(...smartFixes);

        return {
            filePath,
            errors,
            imports,
            suggestedFixes
        };
    }

        private async analyzeSmartFixes(content: string, filePath: string, existingImports: ParsedImport[]): Promise<ImportFix[]> {
        const fixes: ImportFix[] = [];
        const lines = content.split('\n');

        lines.forEach((line, lineNumber) => {
            const trimmedLine = line.trim();
            if (!trimmedLine.startsWith('import')) return;

            // Check for mixed import patterns
            for (const pattern of this.MIXED_IMPORT_PATTERNS) {
                if (pattern.pattern.test(trimmedLine)) {
                    fixes.push({
                        filePath,
                        originalLine: trimmedLine,
                        newLine: pattern.corrections.join('\n'),
                        missingTypes: [],
                        targetImportPath: 'multiple',
                        reason: pattern.reason,
                        confidence: 'high'
                    });
                }
            }

            // Check for common API import mistakes
            if (trimmedLine.includes('@/app/api/SnapshotApi') && trimmedLine.includes('handleApiError')) {
                fixes.push({
                    filePath,
                    originalLine: trimmedLine,
                    newLine: "import { handleApiError } from '@/app/api/ApiLogs'",
                    missingTypes: ['handleApiError'],
                    targetImportPath: '@/app/api/ApiLogs',
                    reason: 'handleApiError should be imported from ApiLogs, not SnapshotApi',
                    confidence: 'high'
                });
            }

            // Check for header config mistakes
            if (trimmedLine.includes('@/app/api/headers/HeadersConfig') && trimmedLine.includes('headersConfig')) {
                fixes.push({
                    filePath,
                    originalLine: trimmedLine,
                    newLine: "import { headersConfig } from '@/app/components/shared/SharedHeaders'",
                    missingTypes: ['headersConfig'],
                    targetImportPath: '@/app/components/shared/SharedHeaders',
                    reason: 'headersConfig should be imported from SharedHeaders, not HeadersConfig',
                    confidence: 'high'
                });
            }
        });

        return fixes;
    }

    // ENHANCED: Better path resolution
    private async findCorrectImportPath(missingType: string, currentFile: string): Promise<string | null> {
        // First check known mappings
        const knownPath = this.KNOWN_IMPORT_MAPPINGS.get(missingType);
        if (knownPath) return knownPath;

        // Then search project tree
        for (const [filePath, fileInfo] of this.projectTree) {
            if (fileInfo.exports.some(exp => 
                exp.toLowerCase() === missingType.toLowerCase() ||
                exp.toLowerCase().includes(missingType.toLowerCase())
            )) {
                return `@/${filePath.replace('src/', '')}`;
            }
        }

        return null;
    }

    /**
     * Parse all imports from file content
     */
    private parseImports(lines: string[]): ParsedImport[] {
        const imports: ParsedImport[] = [];

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Skip non-import lines
            if (!trimmedLine.startsWith('import')) return;

            let match: RegExpMatchArray | null = null;
            let parsedImport: Partial<ParsedImport> = {
                fullLine: line,
                lineNumber: index + 1
            };

            // Check each import pattern
            if (match = trimmedLine.match(this.IMPORT_PATTERNS.NAMED_IMPORT)) {
                parsedImport.namedImports = this.parseNamedImports(match[1]);
                parsedImport.importPath = match[2];
                parsedImport.isTypeOnly = false;
            }
            else if (match = trimmedLine.match(this.IMPORT_PATTERNS.MIXED_IMPORT)) {
                parsedImport.defaultImport = match[1].trim();
                parsedImport.namedImports = this.parseNamedImports(match[2]);
                parsedImport.importPath = match[3];
                parsedImport.isTypeOnly = false;
            }
            else if (match = trimmedLine.match(this.IMPORT_PATTERNS.DEFAULT_IMPORT)) {
                parsedImport.defaultImport = match[1].trim();
                parsedImport.importPath = match[2];
                parsedImport.isTypeOnly = false;
            }
            else if (match = trimmedLine.match(this.IMPORT_PATTERNS.TYPE_IMPORT)) {
                parsedImport.namedImports = this.parseNamedImports(match[1]);
                parsedImport.importPath = match[2];
                parsedImport.isTypeOnly = true;
            }

            if (parsedImport.importPath) {
                imports.push(parsedImport as ParsedImport);
            }
        });

        return imports;
    }

    /**
     * Parse named imports from import clause
     */
    private parseNamedImports(importClause: string): string[] {
        return importClause
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0)
            .map(item => {
                // Handle aliases: import { A as B } 
                const aliasMatch = item.match(/(\w+)\s+as\s+(\w+)/);
                return aliasMatch ? aliasMatch[1] : item; // Return original name
            });
    }

    /**
     * Detect import errors from TypeScript compilation output or static analysis
     */
    private detectImportErrors(content: string): string[] {
        const errors: string[] = [];

        // This would typically come from TypeScript compiler output
        // For now, we'll simulate with a simple pattern
        const errorPattern = /Cannot find name '([^']+)'/g;
        let match: RegExpMatchArray | null;

        while ((match = errorPattern.exec(content)) !== null) {
            errors.push(match[1]);
        }

        return errors;
    }

    /**
     * Suggest fixes for import errors
     */
    private async suggestImportFix(
        missingType: string,
        existingImports: ParsedImport[],
        filePath: string
    ): Promise<ImportFix | null> {

        const targetPath = await this.findCorrectImportPath(missingType, filePath);
        if (!targetPath) {
            console.warn(`No mapping found for missing type: ${missingType}`);
            return null;
        }

        // Check if we already import from this path
        const existingImport = existingImports.find(imp =>
            imp.importPath === targetPath
        );

        // Find the import line that's causing the error (if any)
        const problematicImport = existingImports.find(imp =>
            imp.namedImports.includes(missingType) && imp.importPath !== targetPath
        );

        if (problematicImport) {
            return this.createFixForMisplacedImport(
                problematicImport,
                missingType,
                targetPath,
                filePath,
                existingImports
            );
        }

        // No existing import for this type - need to add it
        return this.createFixForMissingImport(
            missingType,
            targetPath,
            filePath,
            existingImports
        );
    }

    /**
     * Create fix when type is imported from wrong path
     */
    private createFixForMisplacedImport(
        problematicImport: ParsedImport,
        missingType: string,
        targetPath: string,
        filePath: string,
        allImports: ParsedImport[]
    ): ImportFix {

        // Remove the type from problematic import
        const remainingImports = problematicImport.namedImports.filter(
            imp => imp !== missingType
        );

        let newProblematicLine = '';
        if (remainingImports.length > 0) {
            // Reconstruct the import line without the problematic type
            if (problematicImport.defaultImport) {
                newProblematicLine = `import ${problematicImport.defaultImport}, { ${remainingImports.join(', ')} } from '${problematicImport.importPath}';`;
            } else {
                newProblematicLine = `import { ${remainingImports.join(', ')} } from '${problematicImport.importPath}';`;
            }
        } else {
            // No imports left - remove the entire line
            newProblematicLine = '';
        }

        // Check if target import already exists
        const targetImport = allImports.find(imp => imp.importPath === targetPath);
        let newTargetLine = '';

        if (targetImport) {
            // Add to existing target import
            const newImports = [...targetImport.namedImports, missingType].sort();
            newTargetLine = `import { ${newImports.join(', ')} } from '${targetPath}';`;
        } else {
            // Create new import for target path
            newTargetLine = `import { ${missingType} } from '${targetPath}';`;
        }

        return {
            filePath,
            originalLine: problematicImport.fullLine,
            newLine: newProblematicLine,
            missingTypes: [missingType],
            targetImportPath: targetPath,
            reason: `Move ${missingType} from ${problematicImport.importPath} to ${targetPath}`,
            confidence: 'high'
        };
    }

    /**
     * Create fix when type is not imported at all
     */
    private createFixForMissingImport(
        missingType: string,
        targetPath: string,
        filePath: string,
        allImports: ParsedImport[]
    ): ImportFix {

        const targetImport = allImports.find(imp => imp.importPath === targetPath);

        if (targetImport) {
            const newImports = [...targetImport.namedImports, missingType].sort();
            let newLine = '';

            if (targetImport.defaultImport) {
                newLine = `import ${targetImport.defaultImport}, { ${newImports.join(', ')} } from '${targetPath}';`;
            } else {
                newLine = `import { ${newImports.join(', ')} } from '${targetPath}';`;
            }

            return {
                filePath,
                originalLine: targetImport.fullLine,
                newLine,
                missingTypes: [missingType],
                targetImportPath: targetPath,
                reason: `Add ${missingType} to existing import from ${targetPath}`,
                confidence: 'medium'
            };
        } else {
            const newLine = `import { ${missingType} } from '${targetPath}';`;

            return {
                filePath,
                originalLine: '',
                newLine,
                missingTypes: [missingType],
                targetImportPath: targetPath,
                reason: `Add new import for ${missingType} from ${targetPath}`,
                confidence: 'medium'
            };
        }
    }

        // Smart scan with confidence filtering
    async scanProjectWithConfidence(rootDir: string = process.cwd()): Promise<{ analyses: ImportAnalysis[], fixesByConfidence: { high: ImportFix[], medium: ImportFix[], low: ImportFix[] } }> {
        const analyses = await this.scanProject(rootDir);
        const allFixes = analyses.flatMap(analysis => analysis.suggestedFixes);

        const fixesByConfidence = {
            high: allFixes.filter(fix => fix.confidence === 'high'),
            medium: allFixes.filter(fix => fix.confidence === 'medium'),
            low: allFixes.filter(fix => fix.confidence === 'low')
        };

        return { analyses, fixesByConfidence };
    }

    // Apply fixes with confidence-based filtering
    async applyFixesWithConfidence(fixes: ImportFix[], minConfidence: 'high' | 'medium' | 'low' = 'medium'): Promise<{ success: boolean; applied: number }> {
        const confidenceLevels = { high: 3, medium: 2, low: 1 };
        const minLevel = confidenceLevels[minConfidence];
        
        const filteredFixes = fixes.filter(fix => 
            confidenceLevels[fix.confidence || 'medium'] >= minLevel
        );

        return this.applyFixesWithConfirmation(filteredFixes);
    }

    /**
     * Apply fixes to files with safety checks
     */
    async applyFixes(fixes: ImportFix[], backup: boolean = true): Promise<{ success: boolean; backupPath?: string }> {
        if (fixes.length === 0) {
            return { success: true };
        }

        const filePath = fixes[0].filePath;

        // Create backup
        let backupPath: string | undefined;
        if (backup) {
            backupPath = await this.createBackup(filePath);
        }

        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            let newContent = content;

            // Group fixes by original line to handle multiple changes to same line
            const fixesByLine = new Map<string, ImportFix[]>();
            fixes.forEach(fix => {
                const key = fix.originalLine || 'NEW_IMPORT';
                if (!fixesByLine.has(key)) {
                    fixesByLine.set(key, []);
                }
                fixesByLine.get(key)!.push(fix);
            });

            // Apply fixes
            for (const [originalLine, lineFixes] of fixesByLine) {
                if (originalLine === 'NEW_IMPORT') {
                    // Add new imports at the top
                    const newImports = lineFixes.map(fix => fix.newLine).join('\n');
                    newContent = this.insertImport(newContent, newImports);
                } else {
                    // Replace existing lines
                    const primaryFix = lineFixes[0];
                    newContent = newContent.replace(primaryFix.originalLine, primaryFix.newLine);
                }
            }

            // Validate the fix before applying
            if (await this.validateFix(content, newContent)) {
                await fs.promises.writeFile(filePath, newContent, 'utf8');
                return { success: true, backupPath };
            } else {
                throw new Error('Fix validation failed');
            }

        } catch (error) {
            // Restore backup if fix failed
            if (backupPath) {
                await this.restoreBackup(filePath, backupPath);
            }
            throw error;
        }
    }

    /**
     * Create backup of file
     */
    private async createBackup(filePath: string): Promise<string> {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        await fs.promises.copyFile(filePath, backupPath);
        return backupPath;
    }

    /**
     * Restore from backup
     */
    private async restoreBackup(filePath: string, backupPath: string): Promise<void> {
        await fs.promises.copyFile(backupPath, filePath);
        await fs.promises.unlink(backupPath);
    }

    /**
     * Validate that fix doesn't break the file
     */
    private async validateFix(original: string, fixed: string): Promise<boolean> {
        // Basic validation - file should still be valid TypeScript
        // You could add more sophisticated validation here
        return fixed.length > 0 &&
            fixed.includes('import') &&
            !fixed.includes('Cannot find name');
    }

    /**
     * Insert new imports at the correct position
     */
    private insertImport(content: string, newImports: string): string {
        const lines = content.split('\n');

        // Find the last import statement
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import')) {
                lastImportIndex = i;
            } else if (lastImportIndex !== -1 && lines[i].trim().length > 0 && !lines[i].trim().startsWith('import')) {
                // We've passed the import section
                break;
            }
        }

        if (lastImportIndex !== -1) {
            // Insert after the last import
            lines.splice(lastImportIndex + 1, 0, newImports);
        } else {
            // No imports found, insert at top
            lines.unshift(newImports);
        }

        return lines.join('\n');
    }

    /**
     * Scan entire project for import issues
     */
    async scanProject(rootDir: string = process.cwd()): Promise<ImportAnalysis[]> {
        const analyses: ImportAnalysis[] = [];
        const tsFiles = this.getAllTypeScriptFiles(rootDir);

        console.log(`🔍 Scanning ${tsFiles.length} TypeScript files for import issues...`);

        for (const file of tsFiles) {
            try {
                const analysis = await this.analyzeFile(file);
                if (analysis.errors.length > 0) {
                    analyses.push(analysis);
                    console.log(`📁 ${file}: ${analysis.errors.length} import issues`);
                }
            } catch (error) {
                console.warn(`⚠️ Could not analyze ${file}:`, error);
            }
        }

        return analyses;
    }

    /**
     * Get all TypeScript files in project
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

    /**
     * Generate corrections for the PatternAnalyzer
     */
    generateImportCorrections(analyses: ImportAnalysis[]): Correction[] {
        const corrections: Correction[] = [];

        analyses.forEach(analysis => {
            analysis.suggestedFixes.forEach(fix => {
                corrections.push(this.createImportCorrection(fix));
            });
        });

        return corrections;
    }

    /**
     * Create a comprehensive import correction with complex fix support
     */
    private createImportCorrection(fix: ImportFix): Correction {
        const lineNumber = this.extractLineNumberFromFix(fix);

        return {
            id: `import-fix-${path.basename(fix.filePath)}-${fix.missingTypes.join('-')}-${Date.now()}`,
            type: 'suggestion' as CorrectionType,
            severity: 'medium' as CorrectionSeverity,
            message: `Fix import for ${fix.missingTypes.join(', ')} from ${fix.targetImportPath}`,
            file: fix.filePath,
            line: lineNumber,
            code: fix.originalLine || 'MISSING IMPORT',
            codeSnippet: fix.originalLine || 'MISSING IMPORT',
            suggestedFix: fix.newLine, // Keep for backward compatibility
            category: 'imports' as CorrectionCategory,
            description: `Import ${fix.missingTypes.join(', ')} from correct path: ${fix.targetImportPath}`,
            priority: this.calculateFixPriority(fix),
            timestamp: new Date().toISOString(),
            complexFix: {
                type: 'import',
                data: fix,
                apply: () => this.applyImportFix(fix)
            }
        };
    }

    /**
     * Apply a single import fix (for complexFix integration)
     */
    private async applyImportFix(fix: ImportFix): Promise<boolean> {
        try {
            const result = await this.applyFixes([fix], true);
            if (result.success) {
                console.log(`✅ Applied import fix for ${fix.missingTypes.join(', ')} in ${path.basename(fix.filePath)}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to apply import fix:', error);
            return false;
        }
    }

    /**
     * Extract line number from fix for better error reporting
     */
    private extractLineNumberFromFix(fix: ImportFix): number | undefined {
        // This would need to be implemented based on your file parsing logic
        // For now, return undefined or implement based on your needs
        return undefined;
    }

    /**
     * Calculate priority based on fix complexity and impact
     */
    private calculateFixPriority(fix: ImportFix): number {
        let priority = 50; // Default medium priority

        // Higher priority for multiple missing types
        if (fix.missingTypes.length > 1) {
            priority += 10;
        }

        // Higher priority for misplaced imports (existing but wrong path)
        if (fix.originalLine && fix.originalLine !== '') {
            priority += 5;
        }

        return Math.min(100, Math.max(1, priority));
    }

    /**
     * Apply fixes with user confirmation
     */
    async applyFixesWithConfirmation(fixes: ImportFix[]): Promise<{ success: boolean; applied: number }> {
        if (fixes.length === 0) {
            return { success: true, applied: 0 };
        }

        // Group fixes by file for better presentation
        const fileGroups = this.groupFixesByFile(fixes);
        const changes = Array.from(fileGroups.entries()).map(([file, fileFixes]) => ({
            file,
            changes: fileFixes.map(fix =>
                fix.originalLine
                    ? `Move ${fix.missingTypes.join(', ')} to ${fix.targetImportPath}`
                    : `Add ${fix.missingTypes.join(', ')} from ${fix.targetImportPath}`
            )
        }));

        // Get user confirmation
        const confirmed = await this.confirmationService.confirmMultiple(changes);

        if (!confirmed) {
            console.log('❌ Import fixes cancelled by user');
            return { success: false, applied: 0 };
        }

        // Apply fixes file by file
        let totalApplied = 0;

        for (const [filePath, fileFixes] of fileGroups) {
            try {
                const result = await this.applyFixes(fileFixes, true);
                if (result.success) {
                    console.log(`✅ Applied ${fileFixes.length} fixes to ${path.basename(filePath)}`);
                    totalApplied += fileFixes.length;
                }
            } catch (error) {
                console.error(`❌ Failed to apply fixes to ${filePath}:`, error);
            }
        }

        return { success: true, applied: totalApplied };
    }

    private groupFixesByFile(fixes: ImportFix[]): Map<string, ImportFix[]> {
        const groups = new Map<string, ImportFix[]>();

        fixes.forEach(fix => {
            if (!groups.has(fix.filePath)) {
                groups.set(fix.filePath, []);
            }
            groups.get(fix.filePath)!.push(fix);
        });

        return groups;
    }

    /**
     * Scan and fix entire project with confirmation
     */
    async scanAndFixProject(rootDir: string = process.cwd()): Promise<{ success: boolean; applied: number }> {
        console.log('🔍 Scanning project for import issues...');

        const analyses = await this.scanProject(rootDir);
        const allFixes = analyses.flatMap(analysis => analysis.suggestedFixes);

        if (allFixes.length === 0) {
            console.log('✅ No import issues found!');
            return { success: true, applied: 0 };
        }

        console.log(`📋 Found ${allFixes.length} import fixes across ${analyses.length} files`);

        return this.applyFixesWithConfirmation(allFixes);
    }

    /**
     * Generate corrections and apply them with complex fix support
     */
    async generateAndApplyCorrections(rootDir: string = process.cwd()): Promise<{ success: boolean; corrections: Correction[]; applied: number }> {
        console.log('🔍 Generating import corrections...');

        const analyses = await this.scanProject(rootDir);
        const corrections = this.generateImportCorrections(analyses);

        if (corrections.length === 0) {
            console.log('✅ No import corrections needed!');
            return { success: true, corrections: [], applied: 0 };
        }

        console.log(`📋 Generated ${corrections.length} import corrections`);

        // Apply corrections that have complex fixes
        let applied = 0;
        for (const correction of corrections) {
            if (correction.complexFix) {
                try {
                    const success = await correction.complexFix.apply();
                    if (success) {
                        applied++;
                    }
                } catch (error) {
                    console.error(`❌ Failed to apply correction ${correction.id}:`, error);
                }
            }
        }

        return {
            success: applied > 0,
            corrections,
            applied
        };
    }
}

// Usage examples:
export async function testImportFixes() {
    const fixer = new ImportFixerService();

    // Method 1: Traditional scan and fix
    const analyses = await fixer.scanProject();

    // Method 2: Generate corrections with complex fix support
    const { success, corrections, applied } = await fixer.generateAndApplyCorrections();

    console.log(`✅ Applied ${applied} import corrections using complex fix system`);
}

// Export helper functions
export function isImportCorrection(correction: Correction): correction is ImportCorrection {
    return (correction as ImportCorrection).fixType === 'import';
}

export function hasComplexFix(correction: Correction): correction is Correction & { complexFix: ComplexFix } {
    return !!(correction as any).complexFix;
}


// Smart scanning with confidence levels
const fixer = new ImportFixerService('interactive');

// Scan with confidence analysis
const { analyses, fixesByConfidence } = await fixer.scanProjectWithConfidence();

console.log(`High confidence fixes: ${fixesByConfidence.high.length}`);
console.log(`Medium confidence fixes: ${fixesByConfidence.medium.length}`);
console.log(`Low confidence fixes: ${fixesByConfidence.low.length}`);

// Apply only high confidence fixes automatically
await fixer.applyFixesWithConfidence(fixesByConfidence.high, 'high');

// Review medium confidence fixes
if (fixesByConfidence.medium.length > 0) {
    console.log('\n🔍 Review medium confidence fixes:');
    fixesByConfidence.medium.forEach(fix => {
        console.log(`📁 ${fix.filePath}`);
        console.log(`   💡 ${fix.reason}`);
        console.log(`   ❌ ${fix.originalLine}`);
        console.log(`   ✅ ${fix.newLine}`);
    });
}