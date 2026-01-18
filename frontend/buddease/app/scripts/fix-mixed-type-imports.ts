#!/usr/bin/env tsx
// fix-mixed-type-imports.ts

// Enhanced fixer specifically for mixed type/value imports

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { shouldBeTypeImport } from './import-utils';

interface MixedImport {
    file: string;
    line: number;
    original: string;
    typeImports: string[];
    valueImports: string[];
    source: string;
    needsSplit: boolean;
    isTypeOnly?: boolean; 
}

async function main() {
    console.log('🔍 Enhanced Type Import Fixer - Pattern-Based Detection');
    console.log('='.repeat(60));
    
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const backup = !args.includes('--no-backup');
    const target = args.find(arg => !arg.startsWith('--'));
    
    if (target) {
        await focusOnTarget(target, dryRun, backup);
    } else {
        console.log('🌐 Fixing all files in project...');
        await fixAllFiles(dryRun, backup);
    }
}

async function fixSpecificFile(filePath: string, dryRun: boolean, backup: boolean) {
    console.log(`\n🔍 Analyzing: ${filePath}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Find ALL import statements (including multi-line)
        const importRegex = /import\s+\{[\s\S]*?\}\s+from\s+['"]([^'"]+)['"]/g;
        const imports: Array<{
            match: string;
            startIndex: number;
            endIndex: number;
            lineNumber: number;
        }> = [];
        
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const importText = match[0];
            const startIndex = match.index;
            const endIndex = startIndex + importText.length;
            
            // Calculate line number
            const linesBefore = content.substring(0, startIndex).split('\n');
            const lineNumber = linesBefore.length;
            
            imports.push({
                match: importText,
                startIndex,
                endIndex,
                lineNumber
            });
        }
        
        if (imports.length === 0) {
            console.log('✅ No imports found in this file');
            return;
        }
        
        console.log(`📊 Found ${imports.length} import(s) to analyze\n`);
        
        const mixedImports: MixedImport[] = [];
        
        // Analyze each import
        for (const imp of imports) {
            console.log(`DEBUG: Analyzing import on line ${imp.lineNumber}:`);
            console.log(imp.match.substring(0, 100) + (imp.match.length > 100 ? '...' : ''));
            
            const mixedImport = detectMixedImportFromText(imp.match, imp.lineNumber, filePath);

            // Handle BOTH mixed imports AND type-only imports
            if (mixedImport.needsSplit || mixedImport.isTypeOnly) {  // ADD: || mixedImport.isTypeOnly
                mixedImports.push(mixedImport);
            } else {
                console.log(`✅ Line ${imp.lineNumber}: No changes needed (all values)`);
            }
        }
        
        if (mixedImports.length === 0) {
            console.log('✅ No mixed imports found in this file');
            return;
        }
        
        console.log(`📊 Found ${mixedImports.length} mixed import(s) to fix\n`);
        
        // Create backup if needed
        if (backup && !dryRun) {
            const backupPath = `${filePath}.backup-${Date.now()}`;
            fs.writeFileSync(backupPath, content, 'utf8');
            console.log(`💾 Backup created: ${backupPath}`);
        }
        
        // Process mixed imports from bottom to top to avoid line number issues
        const sortedImports = [...mixedImports].sort((a, b) => b.line - a.line);
        let modifiedContent = content;
        let modified = false;
        
        for (const mixedImport of sortedImports) {
            console.log(`\n📝 Line ${mixedImport.line}:`);
            console.log(`   Original: ${mixedImport.original.substring(0, 80)}${mixedImport.original.length > 80 ? '...' : ''}`);
            console.log(`   Types: ${mixedImport.typeImports.join(', ')}`);
            console.log(`   Values: ${mixedImport.valueImports.join(', ')}`);
            
            const splitLines = splitMixedImport(mixedImport);
            
            if (dryRun) {
                console.log(`   🔍 DRY RUN - Would replace with:`);
                splitLines.forEach(line => console.log(`      ${line}`));
            } else {
                // Find and replace in the content
                const importRegex = new RegExp(escapeRegex(mixedImport.original), 's');
                const replacement = splitLines.join('\n');
                modifiedContent = modifiedContent.replace(importRegex, replacement);
                modified = true;
                console.log(`   ✅ Split into ${splitLines.length} import(s)`);
            }
        }
        
        // Write changes if modified
        if (modified && !dryRun) {
            fs.writeFileSync(filePath, modifiedContent, 'utf8');
            console.log(`\n✅ File updated: ${filePath}`);
        } else if (dryRun) {
            console.log(`\n🔍 DRY RUN complete - no changes made`);
        }
        
    } catch (error) {
        console.error(`❌ Error analyzing ${filePath}:`, (error as Error).message);
    }
}

function detectMixedImportFromText(importText: string, lineNum: number, filePath: string): MixedImport {
    const result: MixedImport = {
        file: filePath,
        line: lineNum,
        original: importText,
        typeImports: [],
        valueImports: [],
        source: '',
        needsSplit: false
    };
    
    // Parse import statement
    const importMatch = importText.match(/import\s+\{([\s\S]*?)\}\s+from\s+['"]([^'"]+)['"]/);
    if (!importMatch) return result;
    
    const [, importsStr, source] = importMatch;
    const cleanSource = source.replace(/;+$/, '');
    result.source = cleanSource;
    
    // Clean imports
    const cleanImportsStr = importsStr.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();
    const imports = cleanImportsStr.split(',').map(i => i.trim()).filter(Boolean);
    
    // SPECIAL CASE for 'pg' imports
    if (cleanSource === 'pg' || cleanSource.includes('pg')) {
        console.log(`🔍 Special handling for 'pg' imports`);
        
        // Known types from pg
        const pgTypes = ['PoolConfig', 'QueryConfig', 'QueryConfigValues', 'QueryResult', 'QueryResultRow'];
        const pgValues = ['Pool', 'Client', 'Connection'];
        
        imports.forEach(importName => {
            if (pgTypes.includes(importName) || 
                importName.includes('Config') || 
                importName.includes('Result') ||
                importName.includes('Row') ||
                importName.includes('Values')) {
                result.typeImports.push(importName);
            } else if (pgValues.includes(importName) || importName === 'Pool') {
                result.valueImports.push(importName);
            } else {
                // Default classification
                if (shouldBeTypeImport(importName, imports)) {
                    result.typeImports.push(importName);
                } else {
                    result.valueImports.push(importName);
                }
            }
        });
        
        result.needsSplit = result.typeImports.length > 0 && result.valueImports.length > 0;
        return result;
    }
    
    console.log(`DEBUG: Analyzing imports: ${imports.join(', ')}`);
    
    // Separate types from values
    const typeImports: string[] = [];
    const valueImports: string[] = [];
    
    imports.forEach(importName => {
        const isType = shouldBeTypeImport(importName, imports);
        console.log(`DEBUG: ${importName} -> isType: ${isType}`);
        if (isType) {
            typeImports.push(importName);
        } else {
            valueImports.push(importName);
        }
    });
    
    console.log(`DEBUG: Types: ${typeImports.join(', ')}`);
    console.log(`DEBUG: Values: ${valueImports.join(', ')}`);
    
    // Only need to split if we have BOTH types AND values
    if (typeImports.length > 0 && valueImports.length > 0) {
        result.typeImports = typeImports;
        result.valueImports = valueImports;
        result.needsSplit = true;
    } else if (typeImports.length === imports.length) {
        // All are types - should be import type
        result.typeImports = typeImports;
        result.needsSplit = false;  // Keep false for "split" but we need another flag
        result.isTypeOnly = true;   // NEW: Add this flag
    } else if (valueImports.length === imports.length) {
        // All are values - no change needed
        result.valueImports = valueImports;
        result.needsSplit = false;
    }
    
    return result;
}


function detectDefaultAndNamedImport(line: string, lineNum: number, filePath: string): MixedImport | null {
    // Pattern: import defaultExport, { namedExport1, namedExport2 } from 'source'
    const match = line.match(/import\s+(\w+)\s*,\s*\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
    if (!match) return null;
    
    const [, defaultImport, namedImportsStr, source] = match;
    const namedImports = namedImportsStr.split(',').map(i => i.trim()).filter(Boolean);
    
    // Clean source (remove trailing semicolon)
    const cleanSource = source.replace(/;+$/, '');
    
    // Check which named imports are types
    const typeImports: string[] = [];
    const valueImports: string[] = [];
    
    namedImports.forEach(importName => {
        if (shouldBeTypeImport(importName, namedImports)) {
            typeImports.push(importName);
        } else {
            valueImports.push(importName);
        }
    });
    
    // Always keep default import as runtime
    const result: MixedImport = {
        file: filePath,
        line: lineNum,
        original: line.trim(),
        typeImports,
        valueImports: [defaultImport, ...valueImports], // Default + any runtime named imports
        source: cleanSource,
        needsSplit: typeImports.length > 0
    };
    
    return result;
}

function escapeRegex(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


function detectMixedImport(line: string, lineNum: number, filePath: string): MixedImport {
    
    // First check for default + named imports
    const defaultNamed = detectDefaultAndNamedImport(line, lineNum, filePath);
    if (defaultNamed) {
        console.log(`DEBUG: Found default+named import: ${defaultNamed.original}`);
        return defaultNamed;
    }

    const result: MixedImport = {
        file: filePath,
        line: lineNum,
        original: line.trim(),
        typeImports: [],
        valueImports: [],
        source: '',
        needsSplit: false
    };
    
    // Skip if it doesn't start with import
    if (!line.includes('import')) {
        return result;
    }
    
    // Check for the start of a multi-line import
    const isImportStart = line.includes('import') && line.includes('{') && !line.includes('}');
    if (isImportStart) {
        // This is the start of a multi-line import - we need to get the full import
        const fullImport = getFullMultiLineImport(filePath, lineNum);
        if (fullImport) {
            return analyzeFullImport(fullImport, lineNum, filePath);
        }
    }
    
    // Parse single-line import statement
    const importMatch = line.match(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/);
    if (!importMatch) return result;
    
    const [, importsStr, source] = importMatch;
    const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);
    
    result.source = source;
    
    // Separate types from values
    const typeImports: string[] = [];
    const valueImports: string[] = [];
    
    imports.forEach(importName => {
        if (shouldBeTypeImport(importName, imports)) {
            typeImports.push(importName);
        } else {
            valueImports.push(importName);
        }
    });
    
    // In detectMixedImportFromText function, replace the final logic:
    if (typeImports.length > 0 && valueImports.length > 0) {
        // Scenario 1: Mixed imports - needs splitting
        result.typeImports = typeImports;
        result.valueImports = valueImports;
        result.needsSplit = true;
    } else if (typeImports.length === imports.length) {
        // Scenario 2: All are types - needs conversion to import type
        result.typeImports = typeImports;
        result.needsSplit = false;  // Keep false for "split" but we need another flag
        result.isTypeOnly = true;   // NEW: Add this flag
    } else if (valueImports.length === imports.length) {
        // Scenario 3: All are values - no change needed
        result.valueImports = valueImports;
        result.needsSplit = false;
    }
    
    return result;
}

function getFullMultiLineImport(filePath: string, startLine: number): string | null {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Start from the line where import begins
        let currentLine = startLine - 1;
        let importText = '';
        let braceCount = 0;
        
        // Find the opening brace
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
        }
    } catch (error) {
        console.error(`Error reading file for multi-line import: ${error}`);
    }
    
    return null;
}

function analyzeFullImport(fullImport: string, lineNum: number, filePath: string): MixedImport {
    const result: MixedImport = {
        file: filePath,
        line: lineNum,
        original: fullImport,
        typeImports: [],
        valueImports: [],
        source: '',
        needsSplit: false
    };
    
    // Extract import names and source
    const importMatch = fullImport.match(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/s); // 's' flag for multi-line
    if (!importMatch) return result;
    
    const [, importsStr, source] = importMatch;
    // Clean up the imports string (remove newlines, extra spaces)
    const cleanImportsStr = importsStr.replace(/\s+/g, ' ').replace(/\n/g, ' ');
    const imports = cleanImportsStr.split(',').map(i => i.trim()).filter(Boolean);
    
    result.source = source;
    
    console.log(`DEBUG Multi-line: Analyzing imports: ${imports.join(', ')}`);
    
    // Separate types from values
    const typeImports: string[] = [];
    const valueImports: string[] = [];
    
    imports.forEach(importName => {
        const isType = shouldBeTypeImport(importName, imports);
        console.log(`DEBUG Multi-line: ${importName} -> isType: ${isType}`);
        if (isType) {
            typeImports.push(importName);
        } else {
            valueImports.push(importName);
        }
    });
    
    console.log(`DEBUG Multi-line: Types: ${typeImports.join(', ')}`);
    console.log(`DEBUG Multi-line: Values: ${valueImports.join(', ')}`);
    
    // Only need to split if we have BOTH types AND values
    if (typeImports.length > 0 && valueImports.length > 0) {
        result.typeImports = typeImports;
        result.valueImports = valueImports;
        result.needsSplit = true;
    } else if (typeImports.length === imports.length) {
        // All are types - should be import type
        result.typeImports = typeImports;
        result.needsSplit = true;
    } else if (valueImports.length === imports.length) {
        // All are values - no change needed
        result.valueImports = valueImports;
        result.needsSplit = false;
    }
    
    return result;
}

function splitMixedImport(mixedImport: MixedImport): string[] {
    const lines: string[] = [];
    const cleanSource = mixedImport.source.replace(/;+$/, '');
    
    // NEW: Handle type-only imports (all imports are types)
    if (mixedImport.isTypeOnly && mixedImport.typeImports.length > 0) {
        // Convert to import type
        if (mixedImport.original.includes('\n')) {
            // Multi-line import - preserve formatting
            const importMatch = mixedImport.original.match(/^(import\s*\{)/);
            if (importMatch) {
                const beforeBrace = importMatch[1];
                const afterBrace = mixedImport.original.substring(beforeBrace.length);
                lines.push('import type {' + afterBrace);
            } else {
                // Fallback for multi-line
                lines.push(mixedImport.original.replace(/^import\s*\{/, 'import type {'));
            }
        } else {
            // Single-line import
            lines.push(`import type { ${mixedImport.typeImports.join(', ')} } from '${cleanSource}';`);
        }
        return lines;
    }
    
    // Handle mixed imports (some types, some values)
    if (mixedImport.typeImports.length > 0) {
        lines.push(`import type { ${mixedImport.typeImports.join(', ')} } from '${cleanSource}';`);
    }
    
    // Handle value imports
    if (mixedImport.valueImports.length > 0) {
        // Check if we have a default import
        const hasDefault = mixedImport.original.includes('import ') && 
                          !mixedImport.original.includes('import {') &&
                          mixedImport.original.includes(' from ');
        
        if (hasDefault) {
            // Default import format
            lines.push(`import ${mixedImport.valueImports[0]} from '${cleanSource}';`);
        } else {
            // Named imports format
            lines.push(`import { ${mixedImport.valueImports.join(', ')} } from '${cleanSource}';`);
        }
    }
    
    return lines;
}

async function fixAllFiles(dryRun: boolean, backup: boolean) {
    console.log('\n📋 Finding all mixed imports in project...');
    
    try {
        // Find all import statements in the project
        const findCmd = `grep -rn "import.*{" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "import type" || true`;
        const output = execSync(findCmd, { encoding: 'utf8' });
        const lines = output.split('\n').filter(Boolean);
        
        console.log(`📊 Found ${lines.length} potential imports to analyze`);
        
        const allMixedImports: MixedImport[] = [];
        
        // Analyze each import
        for (const line of lines) {
            const match = line.match(/^(.*?):(\d+):(.*)$/);
            if (!match) continue;
            
            const [, filePath, lineNumStr, importText] = match;
            const lineNum = parseInt(lineNumStr);
            
            const mixedImport = detectMixedImport(importText, lineNum, filePath);
            if (mixedImport.needsSplit) {
                allMixedImports.push(mixedImport);
            }
        }
        
        if (allMixedImports.length === 0) {
            console.log('✅ No mixed imports found in project!');
            return;
        }
        
        console.log(`⚠️ Found ${allMixedImports.length} mixed imports to fix\n`);
        
        if (dryRun) {
            console.log('🔍 DRY RUN MODE - Showing what would be fixed:');
            console.log('='.repeat(60));
            
            // Group by file for display
            const byFile = new Map<string, MixedImport[]>();
            allMixedImports.forEach(imp => {
                if (!byFile.has(imp.file)) {
                    byFile.set(imp.file, []);
                }
                byFile.get(imp.file)!.push(imp);
            });
            
            byFile.forEach((imports, filePath) => {
                console.log(`\n📄 ${path.relative(process.cwd(), filePath)}:`);
                imports.forEach(imp => {
                    console.log(`  Line ${imp.line}: ${imp.original}`);
                    console.log(`    Types: ${imp.typeImports.join(', ')}`);
                    console.log(`    Values: ${imp.valueImports.join(', ')}`);
                });
            });
            
            return;
        }
        
        console.log('🔧 Applying fixes...');
        console.log('='.repeat(60));
        
        // Group by file and sort by line (descending)
        const byFile = new Map<string, MixedImport[]>();
        allMixedImports.forEach(imp => {
            if (!byFile.has(imp.file)) {
                byFile.set(imp.file, []);
            }
            byFile.get(imp.file)!.push(imp);
        });
        
        let totalFixed = 0;
        let filesModified = 0;
        
        for (const [filePath, imports] of byFile) {
            console.log(`\n📄 Processing: ${path.relative(process.cwd(), filePath)}`);
            
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n');
                
                // Create backup
                if (backup) {
                    const backupPath = `${filePath}.backup-${Date.now()}`;
                    fs.writeFileSync(backupPath, content, 'utf8');
                    console.log(`  💾 Backup created`);
                }
                
                // Sort imports by line (descending) to avoid line number shifting
                const sortedImports = [...imports].sort((a, b) => b.line - a.line);
                let fileChanged = false;
                
                for (const mixedImport of sortedImports) {
                    const lineIndex = mixedImport.line - 1;
                    if (lineIndex >= 0 && lineIndex < lines.length) {
                        const splitLines = splitMixedImport(mixedImport);
                        lines.splice(lineIndex, 1, ...splitLines);
                        fileChanged = true;
                        totalFixed++;
                        console.log(`  ✅ Fixed line ${mixedImport.line}`);
                    }
                }
                
                if (fileChanged) {
                    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
                    filesModified++;
                }
                
            } catch (error) {
                console.error(`  ❌ Error processing file: ${error.message}`);
            }
        }
        
        console.log(`\n📊 SUMMARY:`);
        console.log(`  Files modified: ${filesModified}`);
        console.log(`  Total mixed imports fixed: ${totalFixed}`);
        
    } catch (error) {
        console.error('❌ Error finding mixed imports:', error);
    }
}

async function focusOnTarget(target: string, dryRun: boolean, backup: boolean) {
    console.log(`🎯 Focusing on: ${target}\n`);
    
    // Check if target exists as given
    let fullPath = path.resolve(process.cwd(), target);
    
    if (!fs.existsSync(fullPath)) {
        // Try to find it in src directory
        const possiblePaths = [
            path.resolve(process.cwd(), 'src', target),
            path.resolve(process.cwd(), 'src', target + '.ts'),
            path.resolve(process.cwd(), 'src', target + '.tsx'),
            path.resolve(process.cwd(), target + '.ts'),
            path.resolve(process.cwd(), target + '.tsx'),
        ];
        
        // Search recursively in src directory
        const findCmd = `find src/ -name "${target}*" -type f 2>/dev/null | head -5`;
        try {
            const foundFiles = execSync(findCmd, { encoding: 'utf8' })
                .split('\n')
                .filter(f => f.trim() && (f.endsWith('.ts') || f.endsWith('.tsx')));
            
            if (foundFiles.length > 0) {
                console.log(`🔍 Found ${foundFiles.length} possible matches:`);
                foundFiles.forEach((file, i) => {
                    console.log(`   ${i + 1}. ${file}`);
                });
                
                // Use the first match
                fullPath = path.resolve(process.cwd(), foundFiles[0]);
                console.log(`\n📁 Using: ${foundFiles[0]}`);
            }
        } catch (error) {
            // Continue with original path
        }
    }
    
    if (!fs.existsSync(fullPath)) {
        console.error(`❌ Target not found: ${target}`);
        console.log(`   Searched at: ${fullPath}`);
        console.log(`💡 Try using a relative path like: src/core/api/DatabaseClient.ts`);
        return;
    }
    
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
        console.log(`📁 Analyzing directory: ${target}\n`);
        await fixAllFilesInDirectory(fullPath, dryRun, backup);
    } else if (stats.isFile()) {
        await fixSpecificFile(fullPath, dryRun, backup);
    } else {
        console.error(`❌ Target is neither file nor directory: ${target}`);
    }
}

async function fixAllFilesInDirectory(dirPath: string, dryRun: boolean, backup: boolean) {
    // Find all TypeScript files in directory
    const findCmd = `find "${dirPath}" -name "*.ts" -o -name "*.tsx"`;
    const files = execSync(findCmd, { encoding: 'utf8' })
        .split('\n')
        .filter(f => f.trim() && !f.includes('node_modules'));
    
    console.log(`Found ${files.length} TypeScript files in directory\n`);
    
    if (files.length === 0) {
        console.log('⚠️  No TypeScript files found in directory');
        return;
    }
    
    // Analyze each file
    for (const file of files) {
        await fixSpecificFile(file, dryRun, backup);
    }
    
    if (files.length > 20) {
        console.log(`... and ${files.length - 20} more files processed`);
    }
}



if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main, detectMixedImport, splitMixedImport };