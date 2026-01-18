#!/usr/bin/env tsx
// fix-wrong-imports.ts

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ImportFix {
    file: string;
    line: number;
    original: string;
    fixed: string;
    reason: string;
}

interface ModuleExportMap {
    [modulePath: string]: {
        types: string[];
        values: string[];
        exports: string[];
        isTypeOnly?: boolean;
    }
}

async function main() {
    console.log('🔍 Fixing Wrong Imports and Import Type Issues');
    console.log('='.repeat(60));
    
    const args = process.argv.slice(2);
    const target = args[0] || '.';
    const dryRun = args.includes('--dry-run');
    
    console.log(`🎯 Target: ${target}\n`);
    
    // Step 1: Build a map of what each module actually exports
    console.log('📚 Analyzing module exports...');
    const exportMap = await buildExportMap();
    
    // Step 2: Find all imports in the target
    console.log('\n🔍 Finding imports to check...');
    const fixes = await findImportIssues(target, exportMap);
    
    if (fixes.length === 0) {
        console.log('\n✅ No import issues found!');
        return;
    }
    
    // Step 3: Show what needs to be fixed
    console.log(`\n📊 Found ${fixes.length} import(s) to fix:\n`);
    
    // Group by file
    const fixesByFile = new Map<string, ImportFix[]>();
    fixes.forEach(fix => {
        if (!fixesByFile.has(fix.file)) {
            fixesByFile.set(fix.file, []);
        }
        fixesByFile.get(fix.file)!.push(fix);
    });
    
    fixesByFile.forEach((fileFixes, filePath) => {
        console.log(`📄 ${filePath}:`);
        fileFixes.forEach(fix => {
            console.log(`   Line ${fix.line}: ${fix.reason}`);
            console.log(`      ❌ ${fix.original}`);
            console.log(`      ✅ ${fix.fixed}`);
        });
        console.log('');
    });
    
    // Step 4: Apply fixes if not dry run
    if (!dryRun) {
        console.log('🚀 Applying fixes...\n');
        await applyFixes(fixes);
        console.log('✅ All fixes applied!');
    } else {
        console.log('🔍 DRY RUN - No changes made');
    }
}

async function buildExportMap(): Promise<ModuleExportMap> {
    const map: ModuleExportMap = {};
    
    // Find all TypeScript files in the project
    const findCmd = `find src/ -name "*.ts" -o -name "*.tsx" | head -100`;
    const files = execSync(findCmd, { encoding: 'utf8' })
        .split('\n')
        .filter(f => f.trim())
        .filter(f => !f.includes('node_modules'));
    
    console.log(`   Scanning ${files.length} files...`);
    
    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const relativePath = path.relative(process.cwd(), file);
            const modulePath = `@/${relativePath.replace(/\.(ts|tsx)$/, '')}`;
            
            const exports = analyzeExports(content);
            map[modulePath] = exports;
            
            if (exports.types.length > 0) {
                console.log(`   📍 ${path.basename(file)}: ${exports.types.length} type(s)`);
            }
            
        } catch (error) {
            // Skip files we can't read
        }
    }
    
    return map;
}

function analyzeExports(content: string): { types: string[], values: string[], exports: string[], isTypeOnly?: boolean } {
    const types: string[] = [];
    const values: string[] = [];
    const allExports: string[] = [];
    
    // Helper to check if a line is likely a type
    const isTypeLine = (line: string): boolean => {
        const typePatterns = [
            /export\s+(?:type\s+)?\{[^}]*\}/,
            /export\s+interface\s+\w+/,
            /export\s+type\s+\w+\s*=/,
            /export\s+enum\s+\w+/,
            /export\s+abstract\s+class\s+\w+/
        ];
        return typePatterns.some(pattern => pattern.test(line));
    };
    
    // Helper to check if a line is likely a value
    const isValueLine = (line: string): boolean => {
        const valuePatterns = [
            /export\s+const\s+\w+/,
            /export\s+let\s+\w+/,
            /export\s+var\s+\w+/,
            /export\s+function\s+\w+/,
            /export\s+(?!abstract\s+)class\s+\w+/,
            /export\s+default\s+/,
            /export\s+\{.*from/
        ];
        return valuePatterns.some(pattern => pattern.test(line));
    };
    
    const lines = content.split('\n');
    
    for (const line of lines) {
        // Check for named exports
        const namedMatch = line.match(/export\s+(?:type\s+)?\{([^}]+)\}/);
        if (namedMatch) {
            const exports = namedMatch[1].split(',').map(e => e.trim()).filter(Boolean);
            allExports.push(...exports);
            
            if (line.includes('export type {')) {
                types.push(...exports);
            } else {
                // Need to check each export individually
                exports.forEach(exp => {
                    if (exp.match(/[A-Z]/) && !exp.match(/^[a-z]/)) {
                        // Likely a type if starts with capital
                        types.push(exp);
                    } else {
                        values.push(exp);
                    }
                });
            }
        }
        
        // Check for interface exports
        const interfaceMatch = line.match(/export\s+interface\s+(\w+)/);
        if (interfaceMatch) {
            const name = interfaceMatch[1];
            types.push(name);
            allExports.push(name);
        }
        
        // Check for type alias exports
        const typeAliasMatch = line.match(/export\s+type\s+(\w+)/);
        if (typeAliasMatch) {
            const name = typeAliasMatch[1];
            types.push(name);
            allExports.push(name);
        }
        
        // Check for function exports
        const functionMatch = line.match(/export\s+function\s+(\w+)/);
        if (functionMatch) {
            const name = functionMatch[1];
            values.push(name);
            allExports.push(name);
        }
        
        // Check for class exports
        const classMatch = line.match(/export\s+(?:abstract\s+)?class\s+(\w+)/);
        if (classMatch && !line.includes('abstract')) {
            const name = classMatch[1];
            values.push(name);
            allExports.push(name);
        }
        
        // Check for const/let/var exports
        const variableMatch = line.match(/export\s+(?:const|let|var)\s+(\w+)/);
        if (variableMatch) {
            const name = variableMatch[1];
            values.push(name);
            allExports.push(name);
        }
        
        // Check for default exports
        const defaultMatch = line.match(/export\s+default\s+(\w+)/);
        if (defaultMatch) {
            const name = defaultMatch[1];
            values.push(name);
            allExports.push(name);
        }
    }
    
    // Remove duplicates
    const uniqueTypes = [...new Set(types)];
    const uniqueValues = [...new Set(values)];
    const uniqueExports = [...new Set(allExports)];
    
    return {
        types: uniqueTypes,
        values: uniqueValues,
        exports: uniqueExports,
        isTypeOnly: uniqueTypes.length > 0 && uniqueValues.length === 0
    };
}

async function findImportIssues(target: string, exportMap: ModuleExportMap): Promise<ImportFix[]> {
    const fixes: ImportFix[] = [];
    
    // Find files to analyze
    let files: string[] = [];
    
    if (fs.existsSync(target)) {
        const stats = fs.statSync(target);
        if (stats.isDirectory()) {
            const findCmd = `find ${target} -name "*.ts" -o -name "*.tsx"`;
            files = execSync(findCmd, { encoding: 'utf8' })
                .split('\n')
                .filter(f => f.trim())
                .filter(f => !f.includes('node_modules'));
        } else if (stats.isFile()) {
            files = [target];
        }
    } else {
        // Try to find the file
        const findCmd = `find . -name "${target}*" -type f 2>/dev/null | grep -v node_modules`;
        try {
            files = execSync(findCmd, { encoding: 'utf8' })
                .split('\n')
                .filter(f => f.trim());
        } catch {
            console.error(`❌ Target not found: ${target}`);
            return [];
        }
    }
    
    console.log(`   Checking ${files.length} files...\n`);
    
    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineNum = i + 1;
                
                // Skip if already using import type
                if (line.includes('import type')) continue;
                
                // Parse import statement
                const importMatch = line.match(/^import\s+(?:(\w+)\s+from\s+|{([^}]+)}\s+from\s+)?['"]([^'"]+)['"]/);
                if (!importMatch) continue;
                
                const defaultImport = importMatch[1];
                const namedImports = importMatch[2];
                const source = importMatch[3];
                
                // Skip non-@/ imports
                if (!source.startsWith('@/')) continue;
                
                // Check if we know about this module
                const moduleInfo = exportMap[source];
                if (!moduleInfo) continue;
                
                // Handle default imports
                if (defaultImport) {
                    if (moduleInfo.types.includes(defaultImport) && !moduleInfo.values.includes(defaultImport)) {
                        // This should be import type
                        const fixedImport = line.replace('import ', 'import type ');
                        fixes.push({
                            file,
                            line: lineNum,
                            original: line.trim(),
                            fixed: fixedImport.trim(),
                            reason: `${defaultImport} is a type-only export from ${source}`
                        });
                    } else if (moduleInfo.values.includes(defaultImport) && moduleInfo.types.includes(defaultImport)) {
                        // Mixed - check if it's used as a type
                        const isUsedAsType = await checkIfUsedAsType(file, defaultImport);
                        if (isUsedAsType) {
                            const fixedImport = line.replace('import ', 'import type ');
                            fixes.push({
                                file,
                                line: lineNum,
                                original: line.trim(),
                                fixed: fixedImport.trim(),
                                reason: `${defaultImport} is used as a type from ${source}`
                            });
                        }
                    }
                }
                
                // Handle named imports
                if (namedImports) {
                    const imports = namedImports.split(',').map(imp => imp.trim());
                    const typeImports: string[] = [];
                    const valueImports: string[] = [];
                    
                    imports.forEach(imp => {
                        if (moduleInfo.types.includes(imp) && !moduleInfo.values.includes(imp)) {
                            typeImports.push(imp);
                        } else if (moduleInfo.values.includes(imp) && !moduleInfo.types.includes(imp)) {
                            valueImports.push(imp);
                        } else {
                            // Could be both - need to check usage
                            typeImports.push(imp);
                        }
                    });
                    
                    // If all imports are types, convert whole import
                    if (typeImports.length > 0 && valueImports.length === 0) {
                        const fixedImport = line.replace('import {', 'import type {');
                        fixes.push({
                            file,
                            line: lineNum,
                            original: line.trim(),
                            fixed: fixedImport.trim(),
                            reason: `All imports are types from ${source}`
                        });
                    }
                    // If mixed, need to split
                    else if (typeImports.length > 0 && valueImports.length > 0) {
                        const typeImport = `import type { ${typeImports.join(', ')} } from '${source}';`;
                        const valueImport = `import { ${valueImports.join(', ')} } from '${source}';`;
                        fixes.push({
                            file,
                            line: lineNum,
                            original: line.trim(),
                            fixed: `${typeImport}\n${valueImport}`,
                            reason: `Mixed imports from ${source} - need to split`
                        });
                    }
                }
            }
            
        } catch (error) {
            console.error(`   ⚠️ Error analyzing ${file}:`, (error as Error).message);
        }
    }
    
    return fixes;
}

async function checkIfUsedAsType(file: string, importName: string): Promise<boolean> {
    try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for type usage patterns
        const typeUsagePatterns = [
            new RegExp(`:\\s*${importName}\\b`), // Type annotation
            new RegExp(`<\\s*${importName}\\b`), // Generic type
            new RegExp(`extends\\s+${importName}\\b`), // Extension
            new RegExp(`implements\\s+${importName}\\b`), // Implementation
            new RegExp(`typeof\\s+${importName}\\b`), // Type query
            new RegExp(`keyof\\s+${importName}\\b`), // Keyof
        ];
        
        return typeUsagePatterns.some(pattern => pattern.test(content));
    } catch {
        return false;
    }
}

async function applyFixes(fixes: ImportFix[]): Promise<void> {
    // Group by file
    const fixesByFile = new Map<string, ImportFix[]>();
    fixes.forEach(fix => {
        if (!fixesByFile.has(fix.file)) {
            fixesByFile.set(fix.file, []);
        }
        fixesByFile.get(fix.file)!.push(fix);
    });
    
    for (const [file, fileFixes] of fixesByFile) {
        try {
            // Create backup
            const backupPath = `${file}.backup-${Date.now()}`;
            fs.copyFileSync(file, backupPath);
            console.log(`💾 Backup: ${backupPath}`);
            
            // Read file
            const content = fs.readFileSync(file, 'utf8');
            let lines = content.split('\n');
            
            // Sort fixes by line number (descending)
            const sortedFixes = [...fileFixes].sort((a, b) => b.line - a.line);
            
            // Apply fixes
            for (const fix of sortedFixes) {
                const lineIndex = fix.line - 1;
                if (lineIndex >= 0 && lineIndex < lines.length) {
                    if (fix.fixed.includes('\n')) {
                        // Multi-line replacement (splitting imports)
                        const replacementLines = fix.fixed.split('\n');
                        lines.splice(lineIndex, 1, ...replacementLines);
                        console.log(`   ✅ Split import on line ${fix.line}`);
                    } else {
                        // Single line replacement
                        lines[lineIndex] = lines[lineIndex].replace(fix.original, fix.fixed);
                        console.log(`   ✅ Fixed line ${fix.line}: ${fix.reason}`);
                    }
                }
            }
            
            // Write file
            fs.writeFileSync(file, lines.join('\n'), 'utf8');
            console.log(`   📝 Updated: ${file}\n`);
            
        } catch (error) {
            console.error(`   ❌ Error fixing ${file}:`, (error as Error).message);
        }
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}