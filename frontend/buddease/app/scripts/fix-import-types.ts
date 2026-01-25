#!/usr/bin/env tsx
// fix-import-types.ts - CLI tool for analyzing and fixing import type issues

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import type {
    ImportFix,
    ImportAnalysisResult,
    ImportStatement,
    ModuleExportInfo,
    FixApplicationResult,
    ImportFixOptions,
    FixType,
    ImportPattern
} from './import-fix-types';

async function main() {
    console.log('🔍 Import Type Analyzer & Fixer');
    console.log('='.repeat(60));
    
    const args = process.argv.slice(2);
    
    // Parse options with explicit fallbacks to avoid undefined
    const targetPath = args[0] || '.';
    
    const thresholdArg = args.find(arg => arg.startsWith('--threshold='));
    const thresholdValue = thresholdArg ? thresholdArg.split('=')[1] : '80';
    const confidenceThreshold = parseInt(thresholdValue) || 80;
    
    const maxFilesArg = args.find(arg => arg.startsWith('--max-files='));
    const maxFileCount = maxFilesArg ? parseInt(maxFilesArg.split('=')[1]) || undefined : undefined;
    
    const options: ImportFixOptions = {
        dryRun: args.includes('--dry-run'),
        createBackups: !args.includes('--no-backup'),
        targetPath: targetPath,           // Now guaranteed string
        confidenceThreshold: confidenceThreshold, // Now guaranteed number
        maxFileCount: maxFileCount        // Still optional
    };
    
    console.log(`🎯 Target: ${options.targetPath}`);
    console.log(`🔍 Dry run: ${options.dryRun ? 'YES' : 'NO'}`);
    console.log(`💾 Create backups: ${options.createBackups ? 'YES' : 'NO'}`);
    console.log(`📊 Confidence threshold: ${options.confidenceThreshold}%`);
    if (options.maxFileCount !== undefined) {
        console.log(`📁 Max files to process: ${options.maxFileCount}`);
    }
    console.log('');
    
    // Step 1: Analyze module exports
    console.log('📚 Building module export map...');
    const moduleExportMap = await buildModuleExportMap(options.maxFileCount);
    console.log(`   Found ${Object.keys(moduleExportMap).length} modules\n`);
    
    // Step 2: Find all import issues
    console.log('🔍 Analyzing imports for type issues...');
    const analysisResults = await analyzeImportIssues(options.targetPath, moduleExportMap, options);
    
    const totalIssues = analysisResults.reduce((sum, result) => sum + result.issues.length, 0);
    
    if (totalIssues === 0) {
        console.log('\n✅ No import type issues found!');
        return;
    }
    
    // Step 3: Display findings
    console.log(`\n📊 Found ${totalIssues} import issue(s) across ${analysisResults.length} file(s):\n`);
    displayAnalysisResults(analysisResults, options.confidenceThreshold);
    
    // Step 4: Apply fixes
    if (!options.dryRun) {
        const applicableFixes = analysisResults.flatMap(result => 
            result.issues.filter(issue => issue.confidenceScore >= options.confidenceThreshold)
        );
        
        if (applicableFixes.length === 0) {
            console.log('\n⚠️ No fixes meet the confidence threshold for auto-application');
            return;
        }
        
        console.log(`\n🚀 Applying ${applicableFixes.length} fix(es) with ≥${options.confidenceThreshold}% confidence...\n`);
        
        const results = await applyFixes(applicableFixes, options.createBackups);
        displayFixResults(results);
    } else {
        console.log('\n🔍 DRY RUN - No changes made');
        if (options.confidenceThreshold > 0) {
            const autoFixableCount = analysisResults.reduce((sum, result) => 
                sum + result.issues.filter(issue => issue.confidenceScore >= options.confidenceThreshold).length, 0
            );
            console.log(`✨ ${autoFixableCount} fix(es) would be auto-applied with current threshold`);
        }
    }
}

async function buildModuleExportMap(maxFileCount?: number): Promise<Record<string, ModuleExportInfo>> {
    const map: Record<string, ModuleExportInfo> = {};
    
    // Find TypeScript files excluding node_modules
    const findFiles = (): string[] => {
        try {
            const cmd = `find src/ -name "*.ts" -o -name "*.tsx" 2>/dev/null`;
            let files = execSync(cmd, { encoding: 'utf8' })
                .split('\n')
                .filter(f => f.trim())
                .filter(f => !f.includes('node_modules'));
            
            if (maxFileCount && maxFileCount > 0) {
                files = files.slice(0, maxFileCount);
            }
            
            return files;
        } catch {
            return [];
        }
    };
    
    const files = findFiles();
    console.log(`   Scanning ${files.length} file(s)...`);
    
    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const relativePath = path.relative(process.cwd(), file);
            const modulePath = `@/${relativePath.replace(/\.(ts|tsx)$/, '')}`;
            
            const exportInfo = analyzeModuleExports(content);
            if (exportInfo.allExports.length > 0) {
                map[modulePath] = exportInfo;
                console.log(`   📍 ${path.basename(file)}: ${exportInfo.types.length} type(s), ${exportInfo.values.length} value(s)`);
            }
            
        } catch (error) {
            console.error(`   ⚠️ Error analyzing ${file}:`, (error as Error).message);
        }
    }
    
    return map;
}

function analyzeModuleExports(content: string): ModuleExportInfo {
    const types: Set<string> = new Set();
    const values: Set<string> = new Set();
    let hasDefaultExport = false;
    
    const lines = content.split('\n');
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
            continue;
        }
        
        // Named exports: export { X, Y } or export type { X, Y }
        const namedExportMatch = trimmedLine.match(/export\s+(?:type\s+)?\{\s*([^}]+)\s*\}/);
        if (namedExportMatch) {
            const exports = namedExportMatch[1].split(',').map(e => e.trim()).filter(Boolean);
            
            if (trimmedLine.includes('export type {')) {
                exports.forEach(exp => types.add(exp));
            } else {
                // Mixed exports - use naming convention heuristics
                exports.forEach(exp => {
                    // Heuristic: Capitalized names like User, ConfigType are likely types
                    // Lowercase names like formatUser, config are likely values
                    if (exp.match(/^[A-Z]/) && !exp.includes('_')) {
                        types.add(exp);
                    } else {
                        values.add(exp);
                    }
                });
            }
        }
        
        // Interface exports
        const interfaceMatch = trimmedLine.match(/export\s+(?:default\s+)?interface\s+(\w+)/);
        if (interfaceMatch) {
            types.add(interfaceMatch[1]);
        }
        
        // Type alias exports
        const typeAliasMatch = trimmedLine.match(/export\s+(?:default\s+)?type\s+(\w+)/);
        if (typeAliasMatch) {
            types.add(typeAliasMatch[1]);
        }
        
        // Function exports
        const functionMatch = trimmedLine.match(/export\s+(?:async\s+)?function\s+(\w+)/);
        if (functionMatch) {
            values.add(functionMatch[1]);
        }
        
        // Class exports (non-abstract)
        const classMatch = trimmedLine.match(/export\s+(?!abstract\s*)class\s+(\w+)/);
        if (classMatch) {
            values.add(classMatch[1]);
        }
        
        // Variable exports
        const variableMatch = trimmedLine.match(/export\s+(?:const|let|var)\s+(\w+)/);
        if (variableMatch) {
            values.add(variableMatch[1]);
        }
        
        // Default exports
        const defaultMatch = trimmedLine.match(/export\s+default\s+(\w+|class|function)/);
        if (defaultMatch) {
            hasDefaultExport = true;
            if (defaultMatch[1] && !['class', 'function'].includes(defaultMatch[1])) {
                // Named default export
                values.add(defaultMatch[1]);
            }
        }
        
        // Enum exports
        const enumMatch = trimmedLine.match(/export\s+enum\s+(\w+)/);
        if (enumMatch) {
            types.add(enumMatch[1]);
        }
    }
    
    return {
        types: Array.from(types),
        values: Array.from(values),
        allExports: Array.from(new Set([...types, ...values])),
        isTypeOnly: types.size > 0 && values.size === 0,
        hasDefaultExport
    };
}

async function analyzeImportIssues(
    targetPath: string, 
    moduleExportMap: Record<string, ModuleExportInfo>,
    options: ImportFixOptions
): Promise<ImportAnalysisResult[]> {
    
    const files = findTargetFiles(targetPath);
    if (options.maxFileCount && options.maxFileCount > 0) {
        files.splice(options.maxFileCount);
    }
    
    console.log(`   Checking ${files.length} file(s)...\n`);
    
    const results: ImportAnalysisResult[] = [];
    
    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');
            
            const importStatements: ImportStatement[] = [];
            const issues: ImportFix[] = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                const lineNumber = i + 1;
                
                // Skip if already a type import or not an import
                if (!line.startsWith('import ') || line.includes('import type ')) {
                    continue;
                }
                
                // Parse import statement
                const importInfo = parseImportStatement(line, lineNumber);
                if (!importInfo || !importInfo.sourcePath.startsWith('@/')) {
                    continue;
                }
                
                importStatements.push(importInfo);
                
                // Check for issues
                const moduleInfo = moduleExportMap[importInfo.sourcePath];
                if (!moduleInfo) {
                    continue;
                }
                
                const detectedIssues = detectImportIssues(
                    file, 
                    importInfo, 
                    moduleInfo
                );
                
                issues.push(...detectedIssues);
            }
            
            if (issues.length > 0) {
                results.push({
                    filePath: file,
                    imports: importStatements,
                    issues: issues,
                    hasErrors: true,
                    errorCount: issues.length
                });
            }
            
        } catch (error) {
            console.error(`   ⚠️ Error analyzing ${file}:`, (error as Error).message);
        }
    }
    
    return results;
}

function findTargetFiles(targetPath: string): string[] {
    if (!fs.existsSync(targetPath)) {
        // Try to find matching files
        try {
            const cmd = `find . -name "${targetPath}*" -type f 2>/dev/null | grep -v node_modules`;
            return execSync(cmd, { encoding: 'utf8' })
                .split('\n')
                .filter(f => f.trim());
        } catch {
            console.error(`❌ Target not found: ${targetPath}`);
            return [];
        }
    }
    
    const stats = fs.statSync(targetPath);
    if (stats.isFile()) {
        return [targetPath];
    }
    
    // Directory - find all TypeScript files
    try {
        const cmd = `find ${targetPath} -name "*.ts" -o -name "*.tsx" 2>/dev/null`;
        return execSync(cmd, { encoding: 'utf8' })
            .split('\n')
            .filter(f => f.trim())
            .filter(f => !f.includes('node_modules'));
    } catch {
        return [];
    }
}

function parseImportStatement(line: string, lineNumber: number): ImportStatement | null {
    // Default import: import X from 'module'
    const defaultMatch = line.match(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
    if (defaultMatch) {
        return {
            lineNumber,
            originalLine: line,
            importType: 'default' as ImportPattern,
            sourcePath: defaultMatch[2],
            importedNames: [defaultMatch[1]],
            isTypeOnly: false,
            hasIssues: false
        };
    }
    
    // Named imports: import { X, Y } from 'module'
    const namedMatch = line.match(/^import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/);
    if (namedMatch) {
        const names = namedMatch[1].split(',').map(n => n.trim()).filter(Boolean);
        return {
            lineNumber,
            originalLine: line,
            importType: 'named' as ImportPattern,
            sourcePath: namedMatch[2],
            importedNames: names,
            isTypeOnly: false,
            hasIssues: false
        };
    }
    
    // Mixed imports: import X, { Y } from 'module'
    const mixedMatch = line.match(/^import\s+(\w+),\s*\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/);
    if (mixedMatch) {
        const names = [mixedMatch[1], ...mixedMatch[2].split(',').map(n => n.trim()).filter(Boolean)];
        return {
            lineNumber,
            originalLine: line,
            importType: 'mixed' as ImportPattern,
            sourcePath: mixedMatch[3],
            importedNames: names,
            isTypeOnly: false,
            hasIssues: false
        };
    }
    
    // Namespace import: import * as X from 'module'
    const namespaceMatch = line.match(/^import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
    if (namespaceMatch) {
        return {
            lineNumber,
            originalLine: line,
            importType: 'namespace' as ImportPattern,
            sourcePath: namespaceMatch[2],
            importedNames: [namespaceMatch[1]],
            isTypeOnly: false,
            hasIssues: false
        };
    }
    
    return null;
}

function detectImportIssues(
    filePath: string,
    importInfo: ImportStatement,
    moduleInfo: ModuleExportInfo
): ImportFix[] {
    
    const issues: ImportFix[] = [];
    
    importInfo.importedNames.forEach(name => {
        // Check if this import is a type-only export
        const isType = moduleInfo.types.includes(name);
        const isValue = moduleInfo.values.includes(name);
        
        if (isType && !isValue) {
            // This should be a type-only import
            issues.push({
                filePath,
                lineNumber: importInfo.lineNumber,
                originalLine: importInfo.originalLine,
                newLine: addTypeKeyword(importInfo.originalLine),
                missingTypes: [name],
                targetImportPath: importInfo.sourcePath,
                reason: `'${name}' is a type-only export from ${importInfo.sourcePath}`,
                fixType: 'add-type-keyword' as FixType,
                confidenceScore: 95,
                autoFixable: true
            });
        } else if (isType && isValue) {
            // Could be either - check usage
            const confidence = inferTypeUsageConfidence(filePath, name);
            if (confidence > 70) {
                issues.push({
                    filePath,
                    lineNumber: importInfo.lineNumber,
                    originalLine: importInfo.originalLine,
                    newLine: addTypeKeyword(importInfo.originalLine),
                    missingTypes: [name],
                    targetImportPath: importInfo.sourcePath,
                    reason: `'${name}' from ${importInfo.sourcePath} is likely used as a type (${confidence}% confidence)`,
                    fixType: 'add-type-keyword' as FixType,
                    confidenceScore: confidence,
                    autoFixable: confidence > 80
                });
            }
        }
    });
    
    // Special case: module is type-only but imported as values
    if (moduleInfo.isTypeOnly && importInfo.importType === 'named') {
        issues.push({
            filePath,
            lineNumber: importInfo.lineNumber,
            originalLine: importInfo.originalLine,
            newLine: addTypeKeyword(importInfo.originalLine),
            missingTypes: moduleInfo.types,
            targetImportPath: importInfo.sourcePath,
            reason: `Module ${importInfo.sourcePath} only exports types`,
            fixType: 'add-type-keyword' as FixType,
            confidenceScore: 100,
            autoFixable: true
        });
    }
    
    return issues;
}

function addTypeKeyword(importLine: string): string {
    return importLine.replace(/^import\s+/, 'import type ');
}

function inferTypeUsageConfidence(filePath: string, importName: string): number {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for strong type usage indicators
        const strongPatterns = [
            new RegExp(`:\\s*${importName}\\b`), // Type annotation: const user: User
            new RegExp(`<\\s*${importName}\\b`), // Generic type: Array<User>
            new RegExp(`extends\\s+${importName}\\b`), // Interface extension: interface Props extends UserProps
            new RegExp(`implements\\s+${importName}\\b`), // Class implementation: class User implements IUser
        ];
        
        const strongMatches = strongPatterns.filter(pattern => pattern.test(content)).length;
        if (strongMatches > 0) {
            return Math.min(90 + strongMatches * 2, 99); // High confidence
        }
        
        // Check for weaker indicators
        const weakPatterns = [
            new RegExp(`typeof\\s+${importName}\\b`), // Type query: typeof User
            new RegExp(`keyof\\s+${importName}\\b`), // Keyof: keyof User
        ];
        
        const weakMatches = weakPatterns.filter(pattern => pattern.test(content)).length;
        if (weakMatches > 0) {
            return 75 + weakMatches * 3; // Medium-high confidence
        }
        
        // Check if name is PascalCase (common convention for types)
        if (/^[A-Z][a-zA-Z]*$/.test(importName)) {
            return 65; // Medium confidence based on naming convention
        }
        
    } catch {
        // File read error - return low confidence
    }
    
    return 30; // Low confidence - needs manual review
}

function displayAnalysisResults(results: ImportAnalysisResult[], confidenceThreshold: number) {
    results.forEach((result, index) => {
        console.log(`${index + 1}. 📄 ${path.relative(process.cwd(), result.filePath)}`);
        console.log(`   ${result.issues.length} issue(s) found:\n`);
        
        result.issues.forEach((issue, issueIndex) => {
            const confidenceBadge = issue.confidenceScore >= confidenceThreshold ? '✅' : '⚠️';
            console.log(`   ${issueIndex + 1}. ${confidenceBadge} Line ${issue.lineNumber} (${issue.confidenceScore}% confidence)`);
            console.log(`      Reason: ${issue.reason}`);
            console.log(`      Type: ${issue.fixType}`);
            console.log(`      ❌ ${issue.originalLine}`);
            console.log(`      ✅ ${issue.newLine}`);
            if (!issue.autoFixable) {
                console.log(`      🔧 Manual review recommended`);
            }
            console.log('');
        });
    });
}

async function applyFixes(
    fixes: ImportFix[], 
    createBackups: boolean
): Promise<FixApplicationResult[]> {
    
    // Group fixes by file
    const fixesByFile = new Map<string, ImportFix[]>();
    fixes.forEach(fix => {
        const fileFixes = fixesByFile.get(fix.filePath) || [];
        fileFixes.push(fix);
        fixesByFile.set(fix.filePath, fileFixes);
    });
    
    const results: FixApplicationResult[] = [];
    
    for (const [filePath, fileFixes] of fixesByFile) {
        try {
            // Create backup if requested
            let backupPath: string | undefined;
            if (createBackups) {
                backupPath = `${filePath}.backup-${Date.now()}`;
                fs.copyFileSync(filePath, backupPath);
                console.log(`💾 Backup created: ${path.relative(process.cwd(), backupPath)}`);
            }
            
            // Apply fixes to file
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            // Sort fixes by line number (descending to avoid line shift issues)
            const sortedFixes = [...fileFixes].sort((a, b) => b.lineNumber - a.lineNumber);
            
            let fixesApplied = 0;
            for (const fix of sortedFixes) {
                const lineIndex = fix.lineNumber - 1;
                if (lineIndex >= 0 && lineIndex < lines.length) {
                    if (fix.newLine.includes('\n')) {
                        // Multi-line replacement
                        const replacementLines = fix.newLine.split('\n');
                        lines.splice(lineIndex, 1, ...replacementLines);
                        console.log(`   ✅ Split import on line ${fix.lineNumber}`);
                    } else {
                        // Single line replacement
                        if (lines[lineIndex].trim() === fix.originalLine.trim()) {
                            lines[lineIndex] = lines[lineIndex].replace(fix.originalLine, fix.newLine);
                            console.log(`   ✅ Fixed line ${fix.lineNumber}: ${fix.reason}`);
                            fixesApplied++;
                        }
                    }
                }
            }
            
            // Write updated content
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            console.log(`   📝 Updated: ${path.relative(process.cwd(), filePath)}\n`);
            
            results.push({
                filePath,
                success: true,
                fixesApplied,
                backupPath
            });
            
        } catch (error) {
            console.error(`   ❌ Error fixing ${filePath}:`, (error as Error).message);
            results.push({
                filePath,
                success: false,
                fixesApplied: 0,
                error: (error as Error).message
            });
        }
    }
    
    return results;
}

function displayFixResults(results: FixApplicationResult[]) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('\n📈 Fix Results:');
    console.log(`✅ Successfully updated ${successful.length} file(s)`);
    
    if (failed.length > 0) {
        console.log(`❌ Failed to update ${failed.length} file(s)`);
        failed.forEach(result => {
            console.log(`   - ${path.relative(process.cwd(), result.filePath)}: ${result.error}`);
        });
    }
    
    const totalApplied = successful.reduce((sum, r) => sum + r.fixesApplied, 0);
    console.log(`🎯 Total fixes applied: ${totalApplied}`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

export {
    main,
    buildModuleExportMap,
    analyzeImportIssues,
    applyFixes
};