#!/usr/bin/env tsx
// unified-type-import-fixer.ts - CORRECTED with built-in multi-line support

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { TypeImportFixerWithBackup } from '@/scripts/typescript/type-imports/shared-imports'
import { fixMixedImports } from '@/app/scripts/fix-mixed-type-imports'

// Import the WORKING multi-line logic
import {
    detectMixedImportFromText,
    MixedImport,
    isTrulyMixedImport,
    splitMixedImportProperly,
    getCompleteImportBlock
} from '@/scripts/typescript/type-imports/mixed-import-fixer';

interface FixStats {
    totalErrors: number;
    namespaceErrors: number;
    typeErrors: number;
    mixedImports: number;
    filesAffected: number;
    timeSaved: number;
}


class UnifiedTypeImportFixer {
    private backupDir: string;
    private fixStats: FixStats;
    private dryRun: boolean;
    private verbose: boolean;
    private typeImportFixer: TypeImportFixerWithBackup;

    constructor(dryRun: boolean = false, verbose: boolean = false) {
        this.backupDir = path.join(process.cwd(), '.unified-type-fixes');
        this.dryRun = dryRun;
        this.verbose = verbose;
        this.fixStats = {
            totalErrors: 0,
            namespaceErrors: 0,
            typeErrors: 0,
            mixedImports: 0,
            filesAffected: 0,
            timeSaved: 0
        };
        this.typeImportFixer = new TypeImportFixerWithBackup();

        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async run() {
        console.log('🚀 UNIFIED TYPE IMPORT FIXER');
        console.log('='.repeat(60));
        
        if (this.dryRun) {
            console.log('🔍 DRY RUN MODE - No changes will be made\n');
        }

        // Step 1: Run diagnostics
        console.log('\n📊 Step 1: Running diagnostics...');
        const diagnostics = await this.runDiagnostics();
        
        if (diagnostics.totalErrors === 0) {
            console.log('✅ No type import errors found!');
            return { success: true, stats: this.fixStats };
        }

        // Step 2: Show analysis
        console.log('\n📋 Step 2: Analysis Report');
        console.log('='.repeat(40));
        this.showDiagnostics(diagnostics);

        // Step 3: Fix namespace imports
        console.log('\n🔧 Step 3: Fixing namespace imports...');
        const namespaceFixed = await this.fixNamespaceImports();
        
        // Step 4: Fix mixed imports
        console.log('\n🔧 Step 4: Fixing mixed imports...');
        const mixedFixed = await fixMixedImports();

        // Step 5: Fix regular type imports (WITH MULTI-LINE SUPPORT)
        console.log('\n🔧 Step 5: Fixing regular type imports...');
        const typeFixed = await this.fixRegularTypeImports();

        // Step 6: Verify fixes
        console.log('\n🔍 Step 6: Verifying fixes...');
        const verification = await this.verifyFixes();

        // Step 7: Show summary
        console.log('\n📊 FINAL SUMMARY');
        console.log('='.repeat(60));
        this.showFinalSummary();

        return {
            success: verification.allFixed,
            stats: this.fixStats,
            verification
        };
    }

    private async fixNamespaceImports(): Promise<number> {
        if (this.fixStats.namespaceErrors === 0) {
            console.log('   ✅ No namespace imports to fix');
            return 0;
        }

        console.log(`   🔧 Fixing ${this.fixStats.namespaceErrors} namespace imports...`);
        
        const errors = await this.typeImportFixer.detectNamespaceImportErrors();
        
        if (this.dryRun) {
            console.log(`   🔍 Would fix ${errors.length} namespace imports`);
            return 0;
        }

        const backups = await this.typeImportFixer.applyNamespaceFixes(errors, false);
        console.log(`   ✅ Fixed ${backups.length} namespace imports`);
        return backups.length;
    }

    private async fixMixedImports(): Promise<number> {
        if (this.fixStats.mixedImports === 0) {
            console.log('   ✅ No mixed imports to fix');
            return 0;
        }

        console.log(`   🔧 Fixing ${this.fixStats.mixedImports} mixed imports...`);
        
        const mixedImports = await this.typeImportFixer.detectMixedImports();
        if (mixedImports.length === 0) {
            return 0;
        }
        
        if (this.dryRun) {
            console.log(`   🔍 Would fix ${mixedImports.length} mixed imports`);
            return 0;
        }

        const backups = await this.typeImportFixer.applyMixedImportFixes(mixedImports, false);
        console.log(`   ✅ Fixed ${backups.length} mixed imports`);
        return backups.length;
    }

    private getCompleteImportBlock(filePath: string, lineNum: number): { text: string; startLine: number; endLine: number } | null {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            // Find the start of the import
            let startLine = lineNum - 1;
            while (startLine > 0) {
                const line = lines[startLine];
                if (line.includes('import') && line.includes('{')) {
                    break;
                }
                startLine--;
            }
            
            // Find the end of the import
            let endLine = startLine;
            let braceCount = 0;
            while (endLine < lines.length) {
                const line = lines[endLine];
                braceCount += (line.match(/{/g) || []).length;
                braceCount -= (line.match(/}/g) || []).length;
                
                if (braceCount === 0 && line.includes('from')) {
                    break;
                }
                endLine++;
                
                // Safety limit
                if (endLine - startLine > 50) break;
            }
            
            const importLines = lines.slice(startLine, endLine + 1);
            return {
                text: importLines.join('\n'),
                startLine: startLine + 1,
                endLine: endLine + 1
            };
        } catch (error) {
            return null;
        }
    }
    
    private async fixRegularTypeImports(): Promise<number> {
        if (this.fixStats.typeErrors === 0) {
            console.log('   ✅ No regular type imports to fix');
            return 0;
        }

        console.log(`   🔧 Fixing ${this.fixStats.typeErrors} regular type imports...`);
        
        let totalFixed = 0;
        const diagnostics = await this.runDiagnostics();
        
        // Group by file
        const errorsByFile = new Map<string, any[]>();
        diagnostics.errors.forEach(error => {
            if (error.type === 'type') {
                if (!errorsByFile.has(error.file)) {
                    errorsByFile.set(error.file, []);
                }
                errorsByFile.get(error.file)!.push(error);
            }
        });
        
        for (const [filePath, fileErrors] of errorsByFile) {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                let fileFixed = 0;
                
                // Sort descending to avoid line number issues
                const sortedErrors = [...fileErrors].sort((a, b) => b.line - a.line);
                
                for (const error of sortedErrors) {
                    const lineIndex = error.line - 1;
                    if (lineIndex < 0 || lineIndex >= lines.length) continue;
                    
                    // Get the COMPLETE import block (handles multi-line)
                    const importBlock = this.getCompleteImportBlock(filePath, error.line);
                    if (!importBlock) continue;
                    
                    // Check if it's a mixed import
                    const isMixed = isTrulyMixedImport(importBlock.text);
                    
                    if (isMixed) {
                        // Split into type/value imports
                        const mixedDetect = detectMixedImportFromText(importBlock.text, error.line, filePath);
                        const splitImports = splitMixedImportProperly(mixedDetect);
                        
                        if (!this.dryRun) {
                            // Replace the entire block
                            lines.splice(
                                importBlock.startLine - 1,
                                importBlock.endLine - importBlock.startLine + 1,
                                ...splitImports
                            );
                            fileFixed++;
                        }
                    } else {
                        // Simple type-only import - just add 'type' keyword
                        const fixedImport = importBlock.text.replace(
                            /^import\s+{/m,
                            'import type {'
                        );
                        
                        if (fixedImport !== importBlock.text && !this.dryRun) {
                            lines.splice(
                                importBlock.startLine - 1,
                                importBlock.endLine - importBlock.startLine + 1,
                                fixedImport
                            );
                            fileFixed++;
                        }
                    }
                }
                
                if (!this.dryRun && fileFixed > 0) {
                    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
                    console.log(`   ✅ Fixed ${fileFixed} imports in ${path.relative(process.cwd(), filePath)}`);
                }
                
                totalFixed += fileFixed;
            } catch (error) {
                console.error(`   ❌ Error processing ${filePath}:`, error);
            }
        }
        
        return totalFixed;
    }

    private async runDiagnostics() {
        const errors: Array<{
            type: 'namespace' | 'type' | 'mixed';
            file: string;
            line: number;
            typeName: string;
            importStatement?: string;
        }> = [];

        try {
            const output = execSync(
                'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
                { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
            );

            const lines = output.split('\n');
            
            for (const line of lines) {
                if (line.includes("'*' is a type")) {
                    const match = line.match(/(.*\.(?:ts|tsx))\((\d+),/);
                    if (match) {
                        errors.push({
                            type: 'namespace',
                            file: match[1],
                            line: parseInt(match[2]),
                            typeName: '*'
                        });
                        this.fixStats.namespaceErrors++;
                    }
                } else if (line.includes('is a type and must be imported')) {
                    const match = line.match(/(.*\.(?:ts|tsx))\((\d+),.*error TS1484: '([^']+)' is a type/);
                    if (match) {
                        errors.push({
                            type: 'type',
                            file: match[1],
                            line: parseInt(match[2]),
                            typeName: match[3]
                        });
                        this.fixStats.typeErrors++;
                    }
                }
            }

        } catch (error) {
            console.error('❌ Diagnostics failed:', error);
        }

        this.fixStats.totalErrors = errors.length;
        this.fixStats.filesAffected = new Set(errors.map(e => e.file)).size;

        return { errors, totalErrors: errors.length };
    }

    // THE CRITICAL FIX: Use the working multi-line logic
    private getFullMultiLineImport(filePath: string, startLine: number): string | null {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            let currentLine = startLine - 1;
            let importText = '';
            let braceCount = 0;
            let foundImportStart = false;
            
            // Find the start of the import (might be on an earlier line)
            for (let i = currentLine; i >= 0; i--) {
                const line = lines[i];
                if (line.includes('import') && line.includes('{')) {
                    currentLine = i;
                    foundImportStart = true;
                    break;
                }
            }
            
            if (!foundImportStart) return null;
            
            // Read forward to get the complete import
            for (let i = currentLine; i < lines.length; i++) {
                const line = lines[i];
                importText += line + '\n';
                
                // Count braces
                const openBraces = (line.match(/{/g) || []).length;
                const closeBraces = (line.match(/}/g) || []).length;
                braceCount += openBraces - closeBraces;
                
                // Check if we found the complete import
                if (braceCount === 0 && line.includes('from')) {
                    return importText.trim();
                }
                
                // Safety limit to prevent infinite loops
                if (i - currentLine > 20) break;
            }
        } catch (error) {
            console.error(`Error reading file for multi-line import: ${error}`);
        }
        
        return null;
    }

    private getImportLineRange(filePath: string, startLine: number): { start: number; count: number } {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        let start = startLine - 1;
        let end = startLine - 1;
        
        // Find start
        for (let i = startLine - 1; i >= 0; i--) {
            if (lines[i].includes('import') && lines[i].includes('{')) {
                start = i;
                break;
            }
        }
        
        // Find end
        let braceCount = 0;
        for (let i = start; i < lines.length; i++) {
            const line = lines[i];
            braceCount += (line.match(/{/g) || []).length;
            braceCount -= (line.match(/}/g) || []).length;
            
            if (braceCount === 0 && line.includes('from')) {
                end = i;
                break;
            }
        }
        
        return { start, count: end - start + 1 };
    }

    private showDiagnostics(diagnostics: any) {
        console.log(`📁 Files affected: ${diagnostics.errors.length > 0 ? 
            new Set(diagnostics.errors.map((e: any) => e.file)).size : 0}`);
        console.log(`📝 Total errors: ${diagnostics.totalErrors}`);
        console.log(`  • Namespace imports: ${this.fixStats.namespaceErrors}`);
        console.log(`  • Type-only imports: ${this.fixStats.typeErrors}`);
        console.log(`  • Mixed imports: ${this.fixStats.mixedImports}`);
    }

    private async verifyFixes(): Promise<{ allFixed: boolean; remainingErrors: number }> {
        console.log('   🔍 Checking remaining errors...');
        
        try {
            const output = execSync(
                'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
                { encoding: 'utf8' }
            );

            const remainingErrors = output.split('\n').filter(line => 
                line.includes('is a type and must be imported')
            ).length;

            if (remainingErrors === 0) {
                console.log('   ✅ All type import errors fixed!');
                return { allFixed: true, remainingErrors: 0 };
            } else {
                console.log(`   ⚠️ ${remainingErrors} errors remain`);
                console.log('   💡 Some errors may require manual attention');
                return { allFixed: false, remainingErrors };
            }
        } catch (error) {
            console.error('   ❌ Verification failed');
            return { allFixed: false, remainingErrors: -1 };
        }
    }

    private showFinalSummary() {
        const timePerFix = 30; // seconds
        const estimatedTimeSaved = (this.fixStats.totalErrors * timePerFix) / 60;
        
        console.log(`📈 STATISTICS:`);
        console.log(`   Total errors found: ${this.fixStats.totalErrors}`);
        console.log(`   Files affected: ${this.fixStats.filesAffected}`);
        console.log(`   Estimated time saved: ${estimatedTimeSaved.toFixed(1)} minutes`);
        
        console.log(`\n🎯 CATEGORIES:`);
        console.log(`   Namespace imports: ${this.fixStats.namespaceErrors}`);
        console.log(`   Type-only imports: ${this.fixStats.typeErrors}`);
        console.log(`   Mixed imports: ${this.fixStats.mixedImports}`);
        
        console.log(`\n💡 NEXT STEPS:`);
        if (!this.dryRun) {
            console.log(`   1. Run tests to ensure nothing broke`);
            console.log(`   2. Check backups in: ${this.backupDir}`);
            console.log(`   3. Commit your changes`);
        } else {
            console.log(`   1. Review the proposed changes above`);
            console.log(`   2. Run without --dry-run to apply fixes`);
            console.log(`   3. Or run specific fixers for more control`);
        }
        
        console.log(`\n🚀 QUICK COMMANDS:`);
        console.log(`   pnpm fix:types:all          # Run complete fix`);
        console.log(`   pnpm fix:types:dry          # Preview changes`);
        console.log(`   pnpm fix:types:namespace    # Fix only namespace`);
        console.log(`   pnpm fix:types:verify       # Check current status`);
    }
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const verbose = args.includes('--verbose');
    const help = args.includes('--help');

    if (help) {
        console.log(`
🚀 Unified Type Import Fixer
============================

Usage:
  pnpm fix:types:all [options]

Options:
  --dry-run    Preview changes without applying
  --verbose    Show detailed output
  --help       Show this help message
        `);
        return;
    }

    const fixer = new UnifiedTypeImportFixer(dryRun, verbose);
    const result = await fixer.run();
    
    process.exit(result.success ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

export { UnifiedTypeImportFixer };