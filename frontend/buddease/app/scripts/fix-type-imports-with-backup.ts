#!/usr/bin/env tsx
// fix-type-imports-with-backup.ts
// Specifically handles namespace imports and ensures backups

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { TypeImportError } from '@/app/scripts/import-utils'

interface BackupInfo {
    file: string;
    backupPath: string;
    timestamp: string;
    originalContent: string;
    fixedContent: string;
    errorCount: number;
}



// For SPECIFIC namespace imports ('*' imports)
export interface NamespaceImportError {
    typeName: string;        // Will always be '*' for namespace imports
    file: string;
    line: number;           // REQUIRED - we always have line for these
    originalLine: string;   // The actual import line from the file
    errorMessage: string;   // Full error message from TypeScript
}


export type ImportErrorTyp =
    | TypeImportError
    | NamespaceImportError
    | {
        file: string;
        line: number;
        originalLine: string;
        fixType: 'namespace' | 'named' | 'default';
        error: string;
    };



function isNamespaceImportError(error: any): error is NamespaceImportError {
    return error.typeName === '*' &&
        typeof error.line === 'number' &&
        typeof error.originalLine === 'string';
}

// Type guard for general type imports
function isGeneralTypeImportError(error: any): error is TypeImportError {
    return typeof error.typeName === 'string' &&
        error.typeName !== '*' &&
        typeof error.file === 'string';
}



// Helper function to fix general type imports
function fixGeneralTypeImport(originalLine: string, typeName: string): string {
    // Pattern 1: Named imports - import { X, Y, Z } from 'path'
    const namedImportRegex = /^(\s*)import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"](.*)$/;
    const namedMatch = originalLine.match(namedImportRegex);

    if (namedMatch) {
        const [, whitespace, importsStr, sourcePath, trailing] = namedMatch;
        const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);

        // Check if this type is in the imports
        const typeIndex = imports.findIndex(imp => imp === typeName);
        if (typeIndex === -1) {
            return originalLine; // Type not in this import
        }

        // Check if ALL imports are types (we need to know this from context)
        // For simplicity, we'll convert the whole import to type-only
        // In a more advanced version, you'd check which imports are actually types
        return `${whitespace}import type { ${imports.join(', ')} } from '${sourcePath}'${trailing}`;
    }

    // Pattern 2: Default import - import X from 'path'
    const defaultImportRegex = /^(\s*)import\s+(\w+)\s+from\s+['"]([^'"]+)['"](.*)$/;
    const defaultMatch = originalLine.match(defaultImportRegex);

    if (defaultMatch) {
        const [, whitespace, importName, sourcePath, trailing] = defaultMatch;
        if (importName === typeName) {
            return `${whitespace}import type ${importName} from '${sourcePath}'${trailing}`;
        }
    }

    // Pattern 3: Mixed imports - import X, { Y, Z } from 'path'
    const mixedImportRegex = /^(\s*)import\s+(\w+)\s*,\s*{([^}]+)}\s+from\s+['"]([^'"]+)['"](.*)$/;
    const mixedMatch = originalLine.match(mixedImportRegex);

    if (mixedMatch) {
        // This is complex - would need to split into multiple imports
        // For now, return original and log warning
        console.warn(`  ⚠️ Complex mixed import found for ${typeName} - manual fix needed`);
        return originalLine;
    }

    return originalLine; // No changes if pattern not recognized
}


interface GeneralFixResult {
    file: string;
    line: number;
    originalLine: string;
    fixedLine: string;
    typeName: string;
    success: boolean;
}

export interface FileVersion {
    filePath: string;
    timestamp: string;
    content: string;
    hash: string;
    errorCount: number;
    fixedErrors: string[];
    affectedFiles?: string[]; // Files that import/export from this
    dependencies?: string[]; // Files this file depends on
}

export interface VersionArchive {
    id: string;
    timestamp: string;
    totalFiles: number;
    totalErrors: number;
    files: FileVersion[];
    summary: {
        namespaceErrors: number;
        generalTypeErrors: number;
        fixedFiles: string[];
        remainingIssues: string[];
    };
}



async function debugTypeScriptOutput(): Promise<void> {
  console.log('🔍 Debugging TypeScript output...');
  
  try {
    const output: string = execSync(
      'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
    
    console.log('📊 TypeScript output analysis:');
    console.log('='.repeat(60));
    
    const lines: string[] = output.split('\n');
    
    // Count different types of errors
    const totalErrors: number = lines.filter((line: string) => line.includes('error TS')).length;
    const syntaxErrors: number = lines.filter((line: string) => 
      line.includes('error TS1005') || 
      line.includes('error TS1434') || 
      line.includes('error TS1127') ||
      line.includes('error TS1109') ||
      line.includes('error TS1359')
    ).length;
    
    const typeImportErrors: string[] = lines.filter((line: string) => 
      line.includes('is a type and must be imported')
    );
    
    const namespaceErrors: string[] = lines.filter((line: string) => 
      line.includes("'*' is a type")
    );
    
    // Look for TS1484 errors (type import errors)
    const ts1484Errors: string[] = lines.filter((line: string) => 
      line.includes('TS1484')
    );
    
    console.log(`Total TypeScript errors: ${totalErrors}`);
    console.log(`Syntax errors: ${syntaxErrors}`);
    console.log(`Type import errors (is a type...): ${typeImportErrors.length}`);
    console.log(`Namespace import errors (* is a type): ${namespaceErrors.length}`);
    console.log(`TS1484 errors: ${ts1484Errors.length}`);
    
    if (typeImportErrors.length > 0) {
      console.log('\n🔍 Type import errors found:');
      typeImportErrors.slice(0, 5).forEach((error: string, index: number) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (namespaceErrors.length > 0) {
      console.log('\n🔍 Namespace import errors found:');
      namespaceErrors.slice(0, 5).forEach((error: string, index: number) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (ts1484Errors.length > 0) {
      console.log('\n🔍 TS1484 errors found:');
      ts1484Errors.slice(0, 5).forEach((error: string, index: number) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    // Show sample of other errors
    const otherErrors: string[] = lines.filter((line: string) => 
      line.includes('error TS') && 
      !line.includes('is a type') &&
      !line.includes('error TS1005') &&
      !line.includes('error TS1434') &&
      !line.includes('error TS1127') &&
      !line.includes('error TS1109') &&
      !line.includes('error TS1359')
    );
    
    if (otherErrors.length > 0) {
      console.log('\n🔍 Other TypeScript errors (first 5):');
      otherErrors.slice(0, 5).forEach((error: string, index: number) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log('='.repeat(60));
    
  } catch (error: any) {
    console.error('❌ Error running TypeScript:', error.message);
    
    if (error.stdout) {
      const output: string = error.stdout.toString();
      console.log('\n📋 TypeScript stdout:');
      console.log(output.substring(0, 1000));
    }
    
    if (error.stderr) {
      const stderr: string = error.stderr.toString();
      console.log('\n📋 TypeScript stderr:');
      console.log(stderr.substring(0, 500));
    }
  }
}

class TypeImportFixerWithBackup {
    private backupDir: string;
    private rollbackDir: string;

    constructor() {
        this.backupDir = path.join(process.cwd(), '.type-import-backups');
        this.rollbackDir = path.join(process.cwd(), '.type-import-rollback');

        // Create backup directories
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
        if (!fs.existsSync(this.rollbackDir)) {
            fs.mkdirSync(this.rollbackDir, { recursive: true });
        }
    }





    async detectNamespaceImportErrors(): Promise<NamespaceImportError[]> {
        console.log('🔍 Detecting namespace import errors...');

        const errors: NamespaceImportError[] = [];

        try {
            const output = execSync(
                'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
                { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
            );

            const lines = output.split('\n');

            for (const line of lines) {
                if (line.includes("'*' is a type") ||
                    line.includes("'*' must be imported") ||
                    line.includes("namespace import") ||
                    line.includes("import *")) {

                    // Try to extract file and line number with multiple patterns
                    let match = line.match(/(.*\.(?:ts|tsx))\((\d+),(\d+)\):/);
                    if (!match) {
                        // Try another pattern
                        match = line.match(/(.*\.(?:ts|tsx)):(\d+):(\d+)/);
                    }


                    if (match) {
                        const [, file, lineStr] = match;
                        console.log(`Found potential namespace error: ${line}`);

                        const lineNum = parseInt(lineStr);

                        if (isNaN(lineNum) || lineNum < 1) {
                            console.warn(`⚠️ Invalid line number: ${line}`);
                            continue;
                        }

                        try {
                            const filePath = path.resolve(process.cwd(), file);
                            const fileContent = fs.readFileSync(filePath, 'utf8');
                            const fileLines = fileContent.split('\n');

                            const lineIndex = lineNum - 1;
                            const originalLine = lineIndex >= 0 && lineIndex < fileLines.length
                                ? fileLines[lineIndex]
                                : '';

                            errors.push({
                                typeName: '*',
                                file: filePath,
                                line: lineNum,
                                originalLine: originalLine.trim(),
                                errorMessage: line.trim()
                            });
                        } catch (fileError) {
                            console.warn(`⚠️ Could not read ${file}: ${fileError}`);
                        }
                    }
                }
            }
        } catch (error: any) {
            if (error.stdout) {
                const output = error.stdout.toString();
                const lines = output.split('\n');

                for (const line of lines) {
                    if (line.includes("'*' is a type and must be imported using a type-only import")) {
                        const match = line.match(/(.*\.(?:ts|tsx))\((\d+),(\d+)\):/);
                        if (match) {
                            const [, file, lineStr] = match;
                            const lineNum = parseInt(lineStr);

                            if (isNaN(lineNum) || lineNum < 1) continue;

                            try {
                                const filePath = path.resolve(process.cwd(), file);
                                const fileContent = fs.readFileSync(filePath, 'utf8');
                                const fileLines = fileContent.split('\n');
                                const originalLine = lineNum > 0 && lineNum <= fileLines.length
                                    ? fileLines[lineNum - 1]
                                    : '';

                                errors.push({
                                    typeName: '*',
                                    file: filePath,
                                    line: lineNum,
                                    originalLine: originalLine.trim(),
                                    errorMessage: line.trim()
                                });
                            } catch {
                                // Skip files we can't read
                            }
                        }
                    }
                }
            }
        }

        console.log(`📊 Found ${errors.length} namespace import errors`);
        return errors;
    }

    async detectGeneralTypeImportErrors(): Promise<TypeImportError[]> {
        console.log('🔍 Detecting general type import errors...');

        const errors: TypeImportError[] = [];

        try {
            const output = execSync(
                'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
                { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
            );

            const lines = output.split('\n');

            for (const line of lines) {
                const typeImportMatch = line.match(/(.*\.(?:ts|tsx))\((\d+),(\d+)\): error TS1484: '([^']+)' is a type/);

                if (typeImportMatch) {
                    const [, file, lineStr, colStr, typeName] = typeImportMatch;

                    // Skip if it's a namespace import (we handle those separately)
                    if (typeName === '*') {
                        continue;
                    }

                    const lineNum = parseInt(lineStr);
                    const colNum = parseInt(colStr);

                    if (isNaN(lineNum) || lineNum < 1) {
                        console.warn(`⚠️ Invalid line number in error: ${line}`);
                        continue;
                    }

                    try {
                        const filePath = path.resolve(process.cwd(), file);
                        const fileContent = fs.readFileSync(filePath, 'utf8');
                        const fileLines = fileContent.split('\n');

                        // Get the original line
                        const lineIndex = lineNum - 1;
                        const originalLine = lineIndex >= 0 && lineIndex < fileLines.length
                            ? fileLines[lineIndex].trim()
                            : '';

                        // Find the import statement starting at this line
                        let importStart = lineNum - 1;

                        // Look backward for the start of import
                        while (importStart > 0 && !fileLines[importStart].trim().startsWith('import')) {
                            importStart--;
                        }

                        // Look forward for the end of import
                        let importEnd = importStart;
                        while (importEnd < fileLines.length && !fileLines[importEnd].trim().endsWith(';')) {
                            importEnd++;
                        }

                        // Extract the full import statement
                        const importStatement = fileLines
                            .slice(importStart, importEnd + 1)
                            .join(' ')
                            .replace(/\s+/g, ' ')
                            .trim();

                        errors.push({
                            typeName,
                            file: filePath,
                            line: lineNum,
                            column: colNum,
                            importStatement,
                            originalLine, // ADDED
                            errorMessage: line.trim() // ADDED
                        });

                    } catch (fileError) {
                        console.warn(`⚠️ Could not process file ${file}: ${fileError}`);
                        errors.push({
                            typeName,
                            file: path.resolve(process.cwd(), file),
                            line: lineNum,
                            column: colNum,
                            originalLine: '', // ADDED default
                            errorMessage: line.trim() // ADDED
                        });
                    }
                }
            }

        } catch (error: any) {
            if (error.stdout) {
                const output = error.stdout.toString();
                const lines = output.split('\n');

                for (const line of lines) {
                    const typeImportMatch = line.match(/(.*\.(?:ts|tsx))\((\d+),(\d+)\): error TS1484: '([^']+)' is a type/);

                    if (typeImportMatch && typeImportMatch[4] !== '*') {
                        const [, file, lineStr, colStr, typeName] = typeImportMatch;
                        const lineNum = parseInt(lineStr);
                        const colNum = parseInt(colStr);

                        errors.push({
                            typeName,
                            file: path.resolve(process.cwd(), file),
                            line: lineNum,
                            column: colNum,
                            originalLine: '', // ADDED default
                            errorMessage: line.trim() // ADDED
                        });
                    }
                }
            }
        }

        console.log(`📊 Found ${errors.length} general type import errors`);
        return errors;
    }

    migrateLegacyBackups(): void {
        const legacyDir = path.join(process.cwd(), '.import-fix-backups');

        if (fs.existsSync(legacyDir)) {
            console.log('🔍 Found legacy backup directory, migrating...');

            const legacyFiles = fs.readdirSync(legacyDir);
            legacyFiles.forEach(file => {
                const oldPath = path.join(legacyDir, file);
                const newPath = path.join(this.backupDir, `legacy-${file}`);

                if (fs.statSync(oldPath).isFile()) {
                    fs.copyFileSync(oldPath, newPath);
                    console.log(`   Migrated: ${file} → legacy-${file}`);
                }
            });

            // Archive the old directory
            fs.renameSync(legacyDir, `${legacyDir}-archived-${Date.now()}`);
            console.log('✅ Legacy backups migrated and archived');
        }
    }

    createBackup(filePath: string): BackupInfo {
        const timestamp = Date.now();
        const backupFileName = `${path.basename(filePath)}-${timestamp}.backup`;
        const backupPath = path.join(this.backupDir, backupFileName);

        const originalContent = fs.readFileSync(filePath, 'utf8');
        fs.writeFileSync(backupPath, originalContent, 'utf8');

        const backupInfo: BackupInfo = {
            file: filePath,
            backupPath,
            timestamp: new Date(timestamp).toISOString(),
            originalContent,
            fixedContent: '',
            errorCount: 0
        };

        // Also save to rollback directory for quick access
        const rollbackPath = path.join(this.rollbackDir, 'latest.backup');
        fs.writeFileSync(rollbackPath, JSON.stringify(backupInfo, null, 2), 'utf8');

        return backupInfo;
    }

    fixNamespaceImport(error: NamespaceImportError): string {
        const { originalLine } = error;

        // Check if this is a namespace import
        if (originalLine.includes('import * as')) {
            // Add 'type' keyword before '*'
            return originalLine.replace(/^import\s+\*/, 'import type *');
        }

        return originalLine; // No change if not a namespace import
    }

    async applyNamespaceFixes(errors: NamespaceImportError[], dryRun: boolean = false): Promise<BackupInfo[]> {
        const backups: BackupInfo[] = [];

        // Group errors by file
        const errorsByFile = new Map<string, NamespaceImportError[]>();
        errors.forEach(error => {
            if (!errorsByFile.has(error.file)) {
                errorsByFile.set(error.file, []);
            }
            errorsByFile.get(error.file)!.push(error);
        });

        console.log(`\n🔧 Applying namespace fixes to ${errorsByFile.size} files...`);

        for (const [filePath, fileErrors] of errorsByFile) {
            console.log(`\n📄 ${path.relative(process.cwd(), filePath)}:`);
            console.log(`   Found ${fileErrors.length} namespace import errors`);

            // Create backup
            const backupInfo = this.createBackup(filePath);
            backups.push(backupInfo);

            if (dryRun) {
                console.log(`   ⚠️ DRY RUN - Would create backup: ${path.basename(backupInfo.backupPath)}`);
                fileErrors.forEach(error => {
                    const fixedLine = this.fixNamespaceImport(error);
                    console.log(`   Line ${error.line}: "${error.originalLine}"`);
                    console.log(`         → "${fixedLine}"`);
                });
                continue;
            }

            // Read file
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');

            // Sort errors by line number (descending) to avoid line shifting
            const sortedErrors = [...fileErrors].sort((a, b) => b.line - a.line);

            for (const error of sortedErrors) {
                const lineIndex = error.line - 1;
                if (lineIndex >= 0 && lineIndex < lines.length) {
                    const originalLine = lines[lineIndex];
                    const fixedLine = this.fixNamespaceImport(error);

                    if (fixedLine !== originalLine) {
                        lines[lineIndex] = fixedLine;
                        console.log(`   ✅ Fixed line ${error.line}: "${originalLine.substring(0, 60)}..."`);
                        console.log(`         → "${fixedLine.substring(0, 60)}..."`);
                    }
                }
            }

            // Write fixed file
            const fixedContent = lines.join('\n');
            backupInfo.fixedContent = fixedContent;
            backupInfo.errorCount = fileErrors.length;

            fs.writeFileSync(filePath, fixedContent, 'utf8');
            console.log(`   💾 Backup saved: ${path.basename(backupInfo.backupPath)}`);
        }

        return backups;
    }

    async applyGeneralTypeFixes(
        errors: TypeImportError[],
        dryRun: boolean = false
    ): Promise<GeneralFixResult[]> {

        console.log(`\n🔧 Applying general type import fixes...`);

        const allFixResults: GeneralFixResult[] = [];

        // Group errors by file
        const errorsByFile = new Map<string, TypeImportError[]>();
        errors.forEach(error => {
            if (!errorsByFile.has(error.file)) {
                errorsByFile.set(error.file, []);
            }
            errorsByFile.get(error.file)!.push(error);
        });

        console.log(`Processing ${errorsByFile.size} files...`);

        for (const [filePath, fileErrors] of errorsByFile) {
            const relativePath = path.relative(process.cwd(), filePath);
            console.log(`\n📄 ${relativePath}: ${fileErrors.length} errors`);

            // Create backup if not dry run
            if (!dryRun) {
                this.createBackup(filePath);
            }

            try {
                // Read the file
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                const fileFixResults: GeneralFixResult[] = [];

                // Process errors in this file
                const processedLines = new Set<number>();

                for (const error of fileErrors) {
                    // Skip if we already processed this line
                    if (error.line && processedLines.has(error.line)) {
                        continue;
                    }

                    if (!error.line) {
                        console.warn(`  ⚠️ Skipping error without line number for type: ${error.typeName}`);
                        continue;
                    }

                    const lineIndex = error.line - 1;
                    if (lineIndex < 0 || lineIndex >= lines.length) {
                        console.warn(`  ⚠️ Invalid line ${error.line} for type: ${error.typeName}`);
                        continue;
                    }

                    const originalLine = lines[lineIndex];

                    // Skip if already fixed (contains 'import type')
                    if (originalLine.includes('import type')) {
                        console.log(`  ℹ️ Line ${error.line} already fixed for ${error.typeName}`);
                        continue;
                    }

                    // Determine fix strategy based on import pattern
                    const fixedLine = fixGeneralTypeImport(originalLine, error.typeName);

                    if (fixedLine !== originalLine) {
                        if (!dryRun) {
                            lines[lineIndex] = fixedLine;
                        }

                        fileFixResults.push({
                            file: filePath,
                            line: error.line,
                            originalLine,
                            fixedLine,
                            typeName: error.typeName,
                            success: true
                        });

                        console.log(`  ✅ Line ${error.line}: ${error.typeName}`);
                        console.log(`     Before: ${originalLine.substring(0, 60)}${originalLine.length > 60 ? '...' : ''}`);
                        console.log(`     After:  ${fixedLine.substring(0, 60)}${fixedLine.length > 60 ? '...' : ''}`);

                        processedLines.add(error.line);
                    }
                }

                // Apply fixes if not dry run
                if (!dryRun && fileFixResults.length > 0) {
                    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
                    console.log(`  ✏️ Applied ${fileFixResults.length} fixes`);
                } else if (dryRun && fileFixResults.length > 0) {
                    console.log(`  ⚠️ DRY RUN - Would apply ${fileFixResults.length} fixes`);
                } else {
                    console.log(`  ℹ️ No fixes needed (already correct or can't auto-fix)`);
                }

                allFixResults.push(...fileFixResults);

            } catch (error) {
                console.error(`  ❌ Error processing ${relativePath}:`, error);
            }
        }

        return allFixResults;
    }

    saveBackupReport(backups: BackupInfo[]): string {
        const reportPath = path.join(this.backupDir, `backup-report-${Date.now()}.json`);

        const report = {
            timestamp: new Date().toISOString(),
            totalFiles: backups.length,
            totalErrors: backups.reduce((sum, backup) => sum + backup.errorCount, 0),
            backups: backups.map(backup => ({
                file: path.relative(process.cwd(), backup.file),
                backupFile: path.basename(backup.backupPath),
                timestamp: backup.timestamp,
                errorCount: backup.errorCount
            }))
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
        return reportPath;
    }

    rollbackLast(): boolean {
        const rollbackPath = path.join(this.rollbackDir, 'latest.backup');

        if (!fs.existsSync(rollbackPath)) {
            console.log('❌ No rollback backup found');
            return false;
        }

        try {
            const backupInfo: BackupInfo = JSON.parse(fs.readFileSync(rollbackPath, 'utf8'));

            if (!fs.existsSync(backupInfo.file)) {
                console.log(`❌ Original file not found: ${backupInfo.file}`);
                return false;
            }

            // Restore original content
            fs.writeFileSync(backupInfo.file, backupInfo.originalContent, 'utf8');

            // Move backup to rollback archive
            const archivePath = path.join(
                this.rollbackDir,
                `rolled-back-${Date.now()}.json`
            );
            fs.writeFileSync(archivePath, JSON.stringify(backupInfo, null, 2), 'utf8');

            console.log(`✅ Rolled back: ${path.relative(process.cwd(), backupInfo.file)}`);
            console.log(`   Original content restored from: ${path.basename(backupInfo.backupPath)}`);

            return true;
        } catch (error) {
            console.error('❌ Rollback failed:', error);
            return false;
        }
    }

    listBackups(): void {
        const backups = fs.readdirSync(this.backupDir)
            .filter(file => file.endsWith('.backup') || file.endsWith('.json'))
            .sort()
            .reverse();

        console.log('\n📦 Available backups:');
        console.log('='.repeat(50));

        if (backups.length === 0) {
            console.log('No backups found');
            return;
        }

        backups.forEach((backup, index) => {
            const backupPath = path.join(this.backupDir, backup);
            const stats = fs.statSync(backupPath);
            console.log(`${index + 1}. ${backup} (${new Date(stats.mtime).toLocaleString()})`);
        });
    }


    // Public accessor methods
    getBackupDir(): string {
        return this.backupDir;
    }

    getRollbackDir(): string {
        return this.rollbackDir;
    }

    saveReport(data: any, filename?: string): string {
        const reportName = filename || `fix-report-${Date.now()}.json`;
        const reportPath = path.join(this.backupDir, reportName);
        fs.writeFileSync(reportPath, JSON.stringify(data, null, 2), 'utf8');
        return reportPath;
    }
}

async function fixAllTypeImportsWithBackup(dryRun: boolean = false) {
    console.log('🚀 Comprehensive Type Import Fixer with Backup');
    console.log('='.repeat(50));

    if (dryRun) {
        console.log('🔍 DRY RUN - No changes will be made\n');
    }

    const fixer = new TypeImportFixerWithBackup();

    // Migrate any legacy backups
    fixer.migrateLegacyBackups();

    // Step 1: Detect namespace imports
    console.log('\n🔍 Step 1: Detecting namespace imports...');
    const namespaceErrors = await fixer.detectNamespaceImportErrors();

    // Step 2: Detect general type imports
    console.log('\n🔍 Step 2: Detecting general type imports...');
    const generalErrors = await fixer.detectGeneralTypeImportErrors();

    // Summary
    console.log('\n📊 ERROR SUMMARY:');
    console.log(`   Namespace imports (import * as): ${namespaceErrors.length}`);
    console.log(`   General type imports: ${generalErrors.length}`);
    console.log(`   Total: ${namespaceErrors.length + generalErrors.length}`);

    if (namespaceErrors.length + generalErrors.length === 0) {
        console.log('\n✅ No type import errors found!');
        return;
    }

    // Step 3: Apply namespace fixes
    let namespaceBackups: BackupInfo[] = [];
    if (namespaceErrors.length > 0) {
        console.log('\n🔧 Step 3: Fixing namespace imports...');
        namespaceBackups = await fixer.applyNamespaceFixes(namespaceErrors, dryRun);
        console.log(`✅ Fixed ${namespaceErrors.length} namespace imports`);
    }

    // Step 4: Apply general type fixes
    let generalResults: GeneralFixResult[] = [];
    if (generalErrors.length > 0) {
        console.log('\n🔧 Step 4: Fixing general type imports...');
        generalResults = await fixer.applyGeneralTypeFixes(generalErrors, dryRun);
        console.log(`✅ Fixed ${generalResults.length} general type imports`);
    }

    // Step 5: Verification
    if (!dryRun) {
        console.log('\n🔍 Step 5: Verifying fixes...');

        // Quick verification by checking remaining errors
        try {
            const output = execSync(
                'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
                { encoding: 'utf8' }
            );

            const remainingErrors = output.split('\n').filter(line =>
                line.includes('is a type and must be imported')
            ).length;

            if (remainingErrors === 0) {
                console.log('✅ All type import errors fixed!');
            } else {
                console.log(`⚠️ Still have ${remainingErrors} type import errors`);
                console.log('   Some may require manual attention or another run');
            }
        } catch {
            console.log('⚠️ Verification failed - check TypeScript output manually');
        }
    }

    // Step 6: Backup report
    if (!dryRun && (namespaceBackups.length > 0 || generalResults.length > 0)) {
        const timestamp = new Date().toISOString();
        const report = {
            timestamp,
            dryRun,
            namespaceErrors: namespaceErrors.length,
            generalErrors: generalErrors.length,
            namespaceFixes: namespaceBackups.length,
            generalFixes: generalResults.length,
            filesFixed: new Set([
                ...namespaceErrors.map(e => e.file),
                ...generalErrors.map(e => e.file)
            ]).size
        };

        const reportPath = path.join(fixer.getBackupDir(), `fix-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`\n📝 Report saved: ${reportPath}`);
    }

    console.log('\n🎉 Fixing complete!');
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run') || args.includes('--dryrun');
    const rollback = args.includes('--rollback');
    const list = args.includes('--list');
    const namespaceOnly = args.includes('--namespace-only');
    const generalOnly = args.includes('--general-only');

    console.log('🚀 Type Import Fixer with Backup System');
    console.log('='.repeat(50));

    const fixer = new TypeImportFixerWithBackup();

    if (args.includes('--debug')) {
        await debugTypeScriptOutput();
        return;
    }
    if (list) {
        fixer.listBackups();
        return;
    }

    if (rollback) {
        console.log('🔄 Rolling back last fix...');
        const success = fixer.rollbackLast();
        if (success) {
            console.log('✅ Rollback complete');
        }
        return;
    }

    if (namespaceOnly || generalOnly) {
        // Run specific mode
        if (namespaceOnly) {
            console.log('🔍 Namespace-only mode...\n');
            const errors = await fixer.detectNamespaceImportErrors();
            if (errors.length > 0) {
                await fixer.applyNamespaceFixes(errors, dryRun);
            } else {
                console.log('✅ No namespace import errors found');
            }
        }

        if (generalOnly) {
            console.log('🔍 General type-only mode...\n');
            const errors = await fixer.detectGeneralTypeImportErrors();
            if (errors.length > 0) {
                await fixer.applyGeneralTypeFixes(errors, dryRun);
            } else {
                console.log('✅ No general type import errors found');
            }
        }
    } else {
        // Run comprehensive mode
        await fixAllTypeImportsWithBackup(dryRun);
    }

    console.log('\n💡 Quick commands:');
    console.log('   pnpm fix:types:all --dry-run       Preview all fixes');
    console.log('   pnpm fix:types:all                 Apply all fixes');
    console.log('   pnpm fix:types:namespace-only      Fix only namespace imports');
    console.log('   pnpm fix:types:general-only        Fix only general type imports');
    console.log('   pnpm fix:types:rollback           Rollback last fix');
    console.log('   pnpm fix:types:list               List backups');
}

if (import.meta.url === new URL(import.meta.url).href) {
    main().catch(console.error);
}

export {
    TypeImportFixerWithBackup,
    fixAllTypeImportsWithBackup
};