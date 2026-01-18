#!/usr/bin/env tsx
// unified-type-import-fixer.ts
// Comprehensive solution that ties everything together

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import shared types
import type {
    FixResult,
    TypeImportError,
    BackupInfo,
    GeneralFixResult,
    ImportPattern
} from './types/import-fixes';

// Import utility functions
import {
    shouldBeTypeImport,
    fixImportStatement,
    findInterfaceExports,
    createBackup,
    groupFixesByFile,
    sortFixesDescending,
    getContextTips
} from './import-utils';

// Import specialized fixers
import { verifyNamespaceImports } from './verify-namespace-imports';
import { TypeImportFixerWithBackup } from './fix-type-imports-with-backup';

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

        // Create backup directory
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    

async run() {
    console.log('🚀 UNIFIED TYPE IMPORT FIXER');
    console.log('='.repeat(60));
    
    if (this.dryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be made');
    }

    // Step 1: Run comprehensive diagnostics
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

    // Step 3: Fix namespace imports first
    console.log('\n🔧 Step 3: Fixing namespace imports...');
    const namespaceFixed = await this.fixNamespaceImports();
    
    // Step 4: Fix mixed imports (do these first as they're more complex)
    console.log('\n🔧 Step 4: Fixing mixed imports...');
    const mixedFixed = await this.fixMixedImports();

    // Step 5: Fix regular type imports
    console.log('\n🔧 Step 5: Fixing regular type imports...');
    const typeFixed = await this.fixRegularTypeImports();

    // Step 6: Fix simple type imports
    console.log('\n🔧 Step 6: Fixing simple type imports...');
    const simpleFixed = await this.fixSimpleTypeImports();

    // Step 7: Verify fixes
    console.log('\n🔍 Step 7: Verifying fixes...');
    const verification = await this.verifyFixes();

    // Step 8: Show summary
    console.log('\n📊 FINAL SUMMARY');
    console.log('='.repeat(60));
    this.showFinalSummary();

    return {
        success: verification.allFixed,
        stats: this.fixStats,
        verification
    };
}


    private async fixRegularTypeImports(): Promise<number> {
    if (this.fixStats.typeErrors === 0) {
        console.log('   ✅ No regular type imports to fix');
        return 0;
    }

    console.log(`   🔧 Fixing ${this.fixStats.typeErrors} regular type imports...`);
    
    try {
        // Use the fix-interface-imports.ts script for regular type imports
        const output = execSync(
            `tsx ${path.join(__dirname, 'fix-interface-imports.ts')} core-types ${this.dryRun ? '--dry-run' : ''}`,
            { encoding: 'utf8' }
        );
        
        // Parse output to count fixes
        const lines = output.split('\n');
        const appliedLine = lines.find(line => line.includes('Applied:') || line.includes('Fixed:'));
        
        if (appliedLine) {
            const match = appliedLine.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
        }
        
        // Alternative: call the function directly
        if (!this.dryRun) {
            const fixesApplied = await fixTypeOnlyImportsFromCore(this.dryRun ? ['--dry-run'] : []);
            return fixesApplied || 0;
        }
        
        return 0;
    } catch (error) {
        console.error('   ❌ Failed to fix regular type imports:', error);
        return 0;
    }
}

    // Update the fixMixedImports method:
    private async fixMixedImports(): Promise<number> {
        if (this.fixStats.mixedImports === 0) {
            console.log('   ✅ No mixed imports to fix');
            return 0;
        }

        console.log(`   🔧 Fixing ${this.fixStats.mixedImports} mixed imports...`);
        
        try {
            // Use the fix-mixed-type-imports.ts script
            const output = execSync(
                `tsx ${path.join(__dirname, 'fix-mixed-type-imports.ts')} ${this.dryRun ? '--dry-run' : ''}`,
                { encoding: 'utf8' }
            );
            
            // Parse output to count fixes
            const lines = output.split('\n');
            const totalFixed = lines
                .filter(line => line.includes('✅ Fixed') || line.includes('✅ Split') || line.includes('import(s) to fix'))
                .reduce((count, line) => {
                    const match = line.match(/(\d+)/);
                    return match ? count + parseInt(match[1]) : count;
                }, 0);
            
            console.log(`   ✅ Fixed ${totalFixed || 0} mixed imports`);
            return totalFixed || 0;
            
        } catch (error) {
            console.error('   ❌ Failed to fix mixed imports:', error);
            return 0;
        }
    }

    // Also add a new method to handle simple type-only imports:
    private async fixSimpleTypeImports(): Promise<number> {
        console.log(`   🔧 Fixing simple type imports...`);
        
        try {
            // Use fix-interface-imports.ts in safe mode (high-confidence)
            const output = execSync(
                `tsx ${path.join(__dirname, 'fix-interface-imports.ts')} safe ${this.dryRun ? '--dry-run' : ''}`,
                { encoding: 'utf8' }
            );
            
            const lines = output.split('\n');
            const fixedLine = lines.find(line => line.includes('Fixed:') || line.includes('Applied:'));
            
            if (fixedLine) {
                const match = fixedLine.match(/(\d+)/);
                return match ? parseInt(match[1]) : 0;
            }
            
            return 0;
        } catch (error) {
            console.error('   ❌ Failed to fix simple type imports:', error);
            return 0;
        }
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
                // Check for namespace imports
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
                }
                // Check for regular type imports
                else if (line.includes('is a type and must be imported')) {
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

            // Check for mixed imports by analyzing the actual files
            for (const error of errors.filter(e => e.type === 'type')) {
                try {
                    const filePath = path.resolve(process.cwd(), error.file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const lines = content.split('\n');
                    
                    if (error.line <= lines.length) {
                        const importLine = lines[error.line - 1];
                        const imports = this.extractImports(importLine);
                        
                        if (imports && imports.length > 1) {
                            // Check if this line has other imports that might be values
                            const hasValues = await this.lineHasValueImports(filePath, error.line, imports);
                            if (hasValues) {
                                error.type = 'mixed';
                                this.fixStats.mixedImports++;
                                this.fixStats.typeErrors--;
                            }
                        }
                    }
                } catch {
                    // Skip files we can't read
                }
            }

        } catch (error) {
            console.error('❌ Diagnostics failed:', error);
        }

        this.fixStats.totalErrors = errors.length;
        this.fixStats.filesAffected = new Set(errors.map(e => e.file)).size;

        return { errors, totalErrors: errors.length };
    }

    private extractImports(line: string): string[] | null {
        const match = line.match(/import\s+{([^}]+)}/);
        if (!match) return null;
        
        return match[1].split(',').map(i => i.trim()).filter(Boolean);
    }

    private async lineHasValueImports(filePath: string, lineNum: number, imports: string[]): Promise<boolean> {
        // Simple heuristic: if any import doesn't look like a type name
        const valuePatterns = [
            /^[a-z]/,  // Starts with lowercase
            /^(get|set|is|has|use|create|update|delete)/i,  // Common function prefixes
            /Handler$|Helper$|Service$/  // Common suffixes for values

            /^[A-Z][a-z]+[A-Z][a-z]+$/, // PascalCase multi-word (likely components)
            /Modal$/, // ChatSettingsModal, UserModal, etc. (components)
            /Button$/,
            /Input$/,
            /Form$/,
            /Dialog$/,
            /Card$/,
            /Panel$/,
        ];

        return imports.some(imp => 
            valuePatterns.some(pattern => pattern.test(imp))
        );
    }

    private showDiagnostics(diagnostics: any) {
        console.log(`📁 Files affected: ${diagnostics.errors.length > 0 ? 
            new Set(diagnostics.errors.map((e: any) => e.file)).size : 0}`);
        console.log(`📝 Total errors: ${diagnostics.totalErrors}`);
        console.log(`  • Namespace imports: ${this.fixStats.namespaceErrors}`);
        console.log(`  • Type-only imports: ${this.fixStats.typeErrors}`);
        console.log(`  • Mixed imports: ${this.fixStats.mixedImports}`);
        
        if (this.verbose && diagnostics.errors.length > 0) {
            console.log('\n🔍 Top 10 errors:');
            const fileGroups = new Map<string, number>();
            
            diagnostics.errors.forEach((error: any) => {
                const count = fileGroups.get(error.file) || 0;
                fileGroups.set(error.file, count + 1);
            });
            
            Array.from(fileGroups.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .forEach(([file, count], i) => {
                    console.log(`${i + 1}. ${path.relative(process.cwd(), file)}: ${count} errors`);
                });
        }
    }

    private async fixNamespaceImports(): Promise<number> {
        if (this.fixStats.namespaceErrors === 0) {
            console.log('   ✅ No namespace imports to fix');
            return 0;
        }

        console.log(`   🔧 Fixing ${this.fixStats.namespaceErrors} namespace imports...`);
        
        const fixer = new TypeImportFixerWithBackup();
        const errors = await fixer.detectNamespaceImportErrors();
        
        if (this.dryRun) {
            console.log(`   🔍 Would fix ${errors.length} namespace imports`);
            return 0;
        }

        const backups = await fixer.applyNamespaceFixes(errors, false);
        console.log(`   ✅ Fixed ${backups.length} namespace imports`);
        return backups.length;
    }

    private async fixRegularTypeImports(): Promise<number> {
        if (this.fixStats.typeErrors === 0) {
            console.log('   ✅ No regular type imports to fix');
            return 0;
        }

        console.log(`   🔧 Fixing ${this.fixStats.typeErrors} regular type imports...`);
        
        try {
            // Use the comprehensive fixer for regular imports
            const output = execSync(
                `tsx ${path.join(__dirname, 'fix-all-type-imports.ts')} ${this.dryRun ? '--dry-run' : ''}`,
                { encoding: 'utf8' }
            );
            
            // Parse output to count fixes
            const lines = output.split('\n');
            const appliedLine = lines.find(line => line.includes('Applied:') || line.includes('Fixed:'));
            
            if (appliedLine) {
                const match = appliedLine.match(/(\d+)/);
                return match ? parseInt(match[1]) : 0;
            }
            
            return 0;
        } catch (error) {
            console.error('   ❌ Failed to fix regular type imports:', error);
            return 0;
        }
    }

    private async fixMixedImports(): Promise<number> {
        if (this.fixStats.mixedImports === 0) {
            console.log('   ✅ No mixed imports to fix');
            return 0;
        }

        console.log(`   🔧 Fixing ${this.fixStats.mixedImports} mixed imports...`);
        
        try {
            // Use the enhanced mixed import fixer
            const output = execSync(
                `tsx ${path.join(__dirname, 'fix-mixed-type-imports.ts')} ${this.dryRun ? '--dry-run' : ''}`,
                { encoding: 'utf8' }
            );
            
            // Parse output to count fixes
            const lines = output.split('\n');
            const totalFixed = lines
                .filter(line => line.includes('✅ Fixed') || line.includes('✅ Split'))
                .length;
            
            console.log(`   ✅ Fixed ${totalFixed} mixed imports`);
            return totalFixed;
        } catch (error) {
            console.error('   ❌ Failed to fix mixed imports:', error);
            return 0;
        }
    }

    private async verifyFixes(): Promise<{ allFixed: boolean; remainingErrors: number }> {
        console.log('   🔍 Checking remaining errors...');
        
        try {
            const output = execSync(
                'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
                { encoding: 'utf8' }
            );

            const remainingErrors = output.split('\n')
                .filter(line => line.includes('is a type and must be imported'))
                .length;

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
    const dryRun = args.includes('--dry-run') || args.includes('--dryrun');
    const verbose = args.includes('--verbose') || args.includes('-v');
    const help = args.includes('--help') || args.includes('-h');

    if (help) {
        console.log(`
🚀 Unified Type Import Fixer
============================

Usage:
  pnpm fix:types:all [options]

Options:
  --dry-run, --dryrun    Preview changes without applying
  --verbose, -v          Show detailed output
  --help, -h             Show this help message

Examples:
  pnpm fix:types:all                 # Fix all type import errors
  pnpm fix:types:all --dry-run       # Preview what would be fixed
  pnpm fix:types:all --verbose       # Show detailed diagnostics

What it fixes:
  • Namespace imports (import * as)
  • Type-only imports missing 'import type'
  • Mixed imports (types and values in same statement)

Backup & Safety:
  • Creates backups in .unified-type-fixes/
  • Shows preview before making changes
  • Can be rolled back manually
        `);
        return;
    }

    const fixer = new UnifiedTypeImportFixer(dryRun, verbose);
    const result = await fixer.run();
    
    process.exit(result.success ? 0 : 1);
}

// ES Module entry point
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

export { UnifiedTypeImportFixer };