#!/usr/bin/env tsx
// fix-all-type-imports-comprehensive.ts
// Comprehensive Type-Only Import Fixer

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { 
    FixResult, 
    TypeImportError,
    ImportPattern 
} from '@/app/scripts/types/import-fixes';


async function main() {
    console.log('🔍 Comprehensive Type-Only Import Fixer');
    console.log('='.repeat(50));

    // Step 1: Run TypeScript and capture all type-only import errors
    console.log('\n📋 Step 1: Finding all type-only import errors...');

    const typeErrors = await findTypeOnlyImportErrors();

    if (typeErrors.length === 0) {
        console.log('✅ No type-only import errors found!');
        return;
    }

    console.log(`⚠️ Found ${typeErrors.length} type-only import errors across ${new Set(typeErrors.map(e => e.file)).size} files`);

    // Step 2: Analyze and categorize the errors
    console.log('\n📊 Error Analysis:');
    const errorSummary = analyzeErrors(typeErrors);
    console.log(errorSummary);

    // Step 3: Generate fixes
    console.log('\n🔧 Step 2: Generating fixes...');
    const fixes = generateFixes(typeErrors);

    // Step 4: Show preview
    console.log('\n📝 Preview of fixes:');
    console.log('='.repeat(80));

    // Group by file
    const fixesByFile = new Map<string, FixResult[]>();
    fixes.forEach(fix => {
        if (!fixesByFile.has(fix.file)) {
            fixesByFile.set(fix.file, []);
        }
        fixesByFile.get(fix.file)!.push(fix);
    });

    fixesByFile.forEach((fileFixes, filePath) => {
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(`\n📄 ${relativePath}:`);
        fileFixes.forEach(fix => {
            console.log(`   Line ${fix.line}: "${fix.original}"`);
            console.log(`         → "${fix.fixed}"`);
        });
    });

    console.log('\n' + '='.repeat(80));

    // Step 5: Ask for confirmation
    console.log(`\n🚀 Apply ${fixes.length} fixes? (y/n)`);
    const confirmed = await promptConfirmation();

    if (confirmed) {
        console.log('\n🔧 Applying fixes...');
        await applyFixes(fixes);
        console.log('\n✅ Fixes applied!');

        // Step 6: Verify fixes
        console.log('\n🔍 Verifying fixes...');
        const remainingErrors = await findTypeOnlyImportErrors();
        if (remainingErrors.length > 0) {
            console.log(`⚠️ Still have ${remainingErrors.length} type-only import errors`);
            console.log('   Consider running the script again to fix any remaining issues');
        } else {
            console.log('✅ All type-only import errors fixed!');
        }
    } else {
        console.log('\n❌ Cancelled');
    }
}

async function findTypeOnlyImportErrors(): Promise<Array<{
    file: string;
    line: number;
    column: number;
    typeName: string;
    error: string;
}>> {
    const errors: Array<{
        file: string;
        line: number;
        column: number;
        typeName: string;
        error: string;
    }> = [];

    try {
        // Run TypeScript compiler with verbatimModuleSyntax checking
        const tscOutput = execSync('tsc --noEmit --skipLibCheck 2>&1', { encoding: 'utf8' });

        // Parse output to find type-only import errors
        const lines = tscOutput.split('\n');
        const errorPattern = /^(.*\.(?:ts|tsx))\((\d+),(\d+)\): error TS1484: '(.+?)' is a type and must be imported using a type-only import/;

        for (const line of lines) {
            const match = line.match(errorPattern);
            if (match) {
                const [, file, lineStr, columnStr, typeName] = match;
                errors.push({
                    file: path.resolve(process.cwd(), file),
                    line: parseInt(lineStr),
                    column: parseInt(columnStr),
                    typeName,
                    error: line.trim()
                });
            }
        }
    } catch (error: any) {
        // tsc returns non-zero exit code when there are errors, which is what we want
        if (error.status === 2) { // TypeScript compilation errors
            // Output is already captured by execSync
            // We'll parse it from stderr
            const errorOutput = error.stderr?.toString() || error.stdout?.toString() || '';
            const lines = errorOutput.split('\n');
            const errorPattern = /^(.*\.(?:ts|tsx))\((\d+),(\d+)\): error TS1484: '(.+?)' is a type and must be imported using a type-only import/;

            for (const line of lines) {
                const match = line.match(errorPattern);
                if (match) {
                    const [, file, lineStr, columnStr, typeName] = match;
                    errors.push({
                        file: path.resolve(process.cwd(), file),
                        line: parseInt(lineStr),
                        column: parseInt(columnStr),
                        typeName,
                        error: line.trim()
                    });
                }
            }
        } else {
            console.error('Error running tsc:', error.message);
        }
    }

    return errors;
}

function analyzeErrors(errors: Array<{ file: string; line: number; typeName: string; error: string }>): string {
    const typeCounts: Record<string, number> = {};
    const fileCounts: Record<string, number> = {};

    errors.forEach(error => {
        typeCounts[error.typeName] = (typeCounts[error.typeName] || 0) + 1;
        const fileKey = path.relative(process.cwd(), error.file);
        fileCounts[fileKey] = (fileCounts[fileKey] || 0) + 1;
    });

    let summary = '';

    // Top types
    summary += 'Top Type Errors:\n';
    const sortedTypes = Object.entries(typeCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    sortedTypes.forEach(([typeName, count]) => {
        summary += `  ${typeName}: ${count} occurrences\n`;
    });

    // Top files
    summary += '\nFiles with Most Errors:\n';
    const sortedFiles = Object.entries(fileCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    sortedFiles.forEach(([fileName, count]) => {
        summary += `  ${fileName}: ${count} errors\n`;
    });

    return summary;
}

function generateFixes(errors: Array<{ file: string; line: number; typeName: string; error: string }>): FixResult[] {
    const fixes: FixResult[] = [];

    // Group errors by file and line (multiple types might be imported on same line)
    const errorMap = new Map<string, Map<number, Set<string>>>();

    errors.forEach(error => {
        if (!errorMap.has(error.file)) {
            errorMap.set(error.file, new Map());
        }

        const fileMap = errorMap.get(error.file)!;
        if (!fileMap.has(error.line)) {
            fileMap.set(error.line, new Set());
        }

        fileMap.get(error.line)!.add(error.typeName);
    });

    // For each file and line, read the file and fix the import
    for (const [filePath, lineMap] of errorMap) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');

            for (const [lineNum, typeNames] of lineMap) {
                const lineIndex = lineNum - 1;
                if (lineIndex >= 0 && lineIndex < lines.length) {
                    const originalLine = lines[lineIndex];

                    // Skip if already using import type
                    if (originalLine.includes('import type')) {
                        continue;
                    }

                    // Check what kind of import this is
                    let fixedLine = originalLine;

                    // Pattern 1: Named imports - import { X, Y } from 'path'
                    const namedImportRegex = /^(\s*)import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"](.*)$/;
                    const namedMatch = originalLine.match(namedImportRegex);

                    if (namedMatch) {
                        const [, whitespace, importsStr, sourcePath, trailing] = namedMatch;
                        const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);

                        // Check if all imported names in this line are types
                        const allAreTypes = imports.every(imp => {
                            return Array.from(typeNames).some(typeName =>
                                imp === typeName || imp.includes(typeName)
                            );
                        });

                        if (allAreTypes) {
                            // Replace entire import with import type
                            fixedLine = `${whitespace}import type { ${imports.join(', ')} } from '${sourcePath}'${trailing}`;
                        } else {
                            // Some imports are types, some are values - need to split
                            console.warn(`⚠️ Mixed imports on line ${lineNum} in ${path.basename(filePath)} - manual fix needed`);
                            console.warn(`   Types: ${Array.from(typeNames).join(', ')}`);
                            console.warn(`   All imports: ${imports.join(', ')}`);
                            continue;
                        }
                    }

                    // Pattern 2: Default import - import X from 'path'
                    const defaultImportRegex = /^(\s*)import\s+(\w+)\s+from\s+['"]([^'"]+)['"](.*)$/;
                    const defaultMatch = originalLine.match(defaultImportRegex);

                    if (defaultMatch && typeNames.size === 1 && originalLine.includes(Array.from(typeNames)[0])) {
                        const [, whitespace, importName, sourcePath, trailing] = defaultMatch;
                        fixedLine = `${whitespace}import type ${importName} from '${sourcePath}'${trailing}`;
                    }

                    // Pattern 3: Mixed default and named - import X, { Y, Z } from 'path'
                    const mixedImportRegex = /^(\s*)import\s+(\w+)\s*,\s*{([^}]+)}\s+from\s+['"]([^'"]+)['"](.*)$/;
                    const mixedMatch = originalLine.match(mixedImportRegex);

                    if (mixedMatch) {
                        console.warn(`⚠️ Mixed default and named imports on line ${lineNum} in ${path.basename(filePath)} - manual fix needed`);
                        continue;
                    }

                    if (fixedLine !== originalLine) {
                        fixes.push({
                            file: filePath,
                            line: lineNum,
                            original: originalLine,
                            fixed: fixedLine,
                            error: '',
                            typeName: Array.from(typeNames).join(', ')
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`❌ Error reading file ${filePath}:`, error);
        }
    }

    return fixes;
}

async function applyFixes(fixes: FixResult[]) {
    // Group by file
    const fixesByFile = new Map<string, FixResult[]>();
    fixes.forEach(fix => {
        if (!fixesByFile.has(fix.file)) {
            fixesByFile.set(fix.file, []);
        }
        fixesByFile.get(fix.file)!.push(fix);
    });

    for (const [filePath, fileFixes] of fixesByFile) {
        try {
            // Create backup
            const backupPath = `${filePath}.backup-${Date.now()}`;
            const content = fs.readFileSync(filePath, 'utf8');
            fs.writeFileSync(backupPath, content, 'utf8');
            console.log(`💾 Backup: ${path.basename(filePath)}.backup`);

            // Apply fixes (sort by line descending to avoid shifting)
            const lines = content.split('\n');
            const sortedFixes = [...fileFixes].sort((a, b) => b.line - a.line);

            for (const fix of sortedFixes) {
                const lineIndex = fix.line - 1;
                if (lineIndex >= 0 && lineIndex < lines.length) {
                    lines[lineIndex] = fix.fixed;
                    console.log(`✅ Fixed: ${path.basename(filePath)}:${fix.line} (${fix.typeName})`);
                }
            }

            // Write file
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');

        } catch (error) {
            console.error(`❌ Error fixing ${filePath}:`, error);
        }
    }
}

async function promptConfirmation(): Promise<boolean> {
    return new Promise((resolve) => {
        const stdin = process.stdin;
        stdin.setEncoding('utf8');

        process.stdout.write('Apply fixes? (y/n): ');

        stdin.once('data', (key) => {
            const answer = key.toString().toLowerCase().trim();
            resolve(answer === 'y' || answer === 'yes');
            stdin.pause();
        });
    });
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}