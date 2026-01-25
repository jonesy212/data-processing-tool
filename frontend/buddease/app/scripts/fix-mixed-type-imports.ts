#!/usr/bin/env tsx
// fix-mixed-type-imports.ts

// Enhanced fixer specifically for mixed type/value imports

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { shouldBeTypeImport } from '@/app/scripts/import-utils'
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


// Add this near the top of the file, after imports
function resolveTargetPath(target: string): string | null {
    // If it already exists as given
    const absolutePath = path.resolve(process.cwd(), target);
    if (fs.existsSync(absolutePath)) {
        return absolutePath;
    }
    
    // If it starts with src/ but doesn't exist, try without src/
    if (target.startsWith('src/') || target.startsWith('./src/')) {
        const withoutSrc = target.replace(/^(\.\/)?src\//, '');
        const testPath = path.resolve(process.cwd(), 'src', withoutSrc);
        if (fs.existsSync(testPath)) {
            return testPath;
        }
    }
    
    // Try to find in src directory
    const inSrc = path.resolve(process.cwd(), 'src', target);
    if (fs.existsSync(inSrc)) {
        return inSrc;
    }
    
    // Try with .tsx extension
    const withTsx = path.resolve(process.cwd(), 'src', target + '.tsx');
    if (fs.existsSync(withTsx)) {
        return withTsx;
    }
    
    // Try with .ts extension
    const withTs = path.resolve(process.cwd(), 'src', target + '.ts');
    if (fs.existsSync(withTs)) {
        return withTs;
    }
    
    return null;
}


// Add this helper function near the top
function logImportsDebug(content: string) {
    console.log('\n🔍 DEBUG - Manual import search:');
    
    // Look for all lines that start with import
    const lines = content.split('\n');
    let importCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('import')) {
            importCount++;
            const isTypeImport = line.includes('import type');
            console.log(`   Line ${i + 1}: ${isTypeImport ? '✅ Type' : '⚠️ Regular'} import`);
            console.log(`      ${line.substring(0, 70)}${line.length > 70 ? '...' : ''}`);
        }
    }
    
    console.log(`\n📊 Total imports found manually: ${importCount}`);
    
    // Also show specific patterns
    console.log('\n🔍 Pattern matching:');
    const patterns = [
        /import\s+type\s+{[^}]+}\s+from\s+['"][^'"]+['"]/g,
        /import\s+{[^}]+}\s+from\s+['"][^'"]+['"]/g,
        /import\s+\w+\s+from\s+['"][^'"]+['"]/g,
    ];
    
    patterns.forEach((pattern, idx) => {
        const matches = content.match(pattern) || [];
        console.log(`   Pattern ${idx + 1}: Found ${matches.length} matches`);
        if (matches.length > 0 && matches.length < 3) {
            matches.forEach(match => {
                console.log(`      ${match.substring(0, 70)}${match.length > 70 ? '...' : ''}`);
            });
        }
    });
}



async function checkFileImports(filePath: string) {
    console.log(`\n🔍 Checking imports in: ${path.relative(process.cwd(), filePath)}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        let totalImports = 0;
        let typeImports = 0;
        let valueImports = 0;
        let mixedImports = 0;
        
        // Simple regex to find imports
        const importRegex = /^import\s+(?:type\s+)?/;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (importRegex.test(line)) {
                totalImports++;
                
                if (line.includes('import type')) {
                    typeImports++;
                    console.log(`   Line ${i + 1}: ✅ Type import`);
                } else if (line.includes('import {') && line.includes('} from')) {
                    // Check if this might be a mixed import
                    const hasType = /(?:Props|Type|Interface|Config|Settings|Data|Entity|Meta)$/.test(line);
                    if (hasType) {
                        mixedImports++;
                        console.log(`   Line ${i + 1}: ⚠️  Possible mixed import: ${line.substring(0, 60)}...`);
                    } else {
                        valueImports++;
                        console.log(`   Line ${i + 1}: ✅ Value import`);
                    }
                } else if (line.includes('import ') && line.includes(' from ')) {
                    valueImports++;
                    console.log(`   Line ${i + 1}: ✅ Value import`);
                }
            }
        }
        
        console.log(`\n📊 Summary for ${path.basename(filePath)}:`);
        console.log(`   Total imports: ${totalImports}`);
        console.log(`   Type imports: ${typeImports}`);
        console.log(`   Value imports: ${valueImports}`);
        console.log(`   Possible mixed imports: ${mixedImports}`);
        
        if (mixedImports === 0 && totalImports > 0) {
            console.log(`\n✅ All imports are properly typed!`);
        } else if (mixedImports > 0) {
            console.log(`\n⚠️  Found ${mixedImports} potential mixed imports that need fixing`);
        }
        
        return { totalImports, typeImports, valueImports, mixedImports };
        
    } catch (error) {
        console.error(`❌ Error checking file: ${error.message}`);
        return null;
    }
}




export async function fixMixedImports(
  content: string,
  filePath: string
): Promise<{modified: boolean; content: string; count: number; fixes: ImportFix[]}> {
  // Copy the mixed import logic from unified-type-import-fixer.ts
  const fixes: ImportFix[] = [];
  let modifiedContent = content;
  let count = 0;
  
  // Find imports with mixed type/value specifiers
  const importRegex = /import\s+(?:(type)\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const [fullMatch, typeKeyword, importList, source] = match;
    
    if (typeKeyword) continue; // Already has type keyword
    
    const imports = importList.split(',').map(i => i.trim());
    
    // Check which imports should be type-only
    const typeImports = imports.filter(name => 
      name.endsWith('Type') || 
      name.endsWith('Interface') ||
      name.endsWith('Props') ||
      name.includes('Config')
    );
    
    const valueImports = imports.filter(name => !typeImports.includes(name));
    
    if (typeImports.length > 0 && valueImports.length > 0) {
      // Mixed import - need to split
      const newImports: string[] = [];
      
      if (valueImports.length > 0) {
        newImports.push(`import { ${valueImports.join(', ')} } from '${source}';`);
      }
      if (typeImports.length > 0) {
        newImports.push(`import type { ${typeImports.join(', ')} } from '${source}';`);
      }
      
      modifiedContent = modifiedContent.replace(fullMatch, newImports.join('\n'));
      count++;
    }
  }
  
  return { modified: count > 0, content: modifiedContent, count, fixes };
}

async function fixSpecificFile(filePath: string, dryRun: boolean, backup: boolean) {
    console.log(`\n🔍 Analyzing: ${filePath}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Collect TypeScript errors if possible
        let tsErrors = new Set<string>();
        try {
            tsErrors = await collectTypeScriptErrors();
        } catch (error) {
            console.log('⚠️  Using pattern-based detection only');
        }
        
        const mixedImports: MixedImport[] = [];
        
        // Process each line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip lines that are already type imports or don't contain import
            if (!line.startsWith('import ') || line.startsWith('import type')) {
                continue;
            }
            
            console.log(`\nAnalyzing line ${i + 1}: ${line.substring(0, 80)}${line.length > 80 ? '...' : ''}`);
            
            try {
                // Use the detectMixedImportFromTextEnhanced function
                const mixedImport = detectMixedImportFromTextEnhanced(
                    line, 
                    i + 1, 
                    filePath, 
                    tsErrors
                );
                
                if (mixedImport.needsSplit || mixedImport.isTypeOnly) {
                    mixedImports.push(mixedImport);
                    console.log(`   ⚠️  Needs fixing: types=${mixedImport.typeImports.join(', ')}, values=${mixedImport.valueImports.join(', ')}`);
                } else {
                    console.log(`   ✅ No changes needed`);
                }
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
            }
        }
        
        if (mixedImports.length === 0) {
            console.log('\n✅ No imports need fixing in this file');
            return;
        }
        
        console.log(`\n📊 Found ${mixedImports.length} import(s) to fix`);
        
        // Create backup if needed
        if (backup && !dryRun) {
            const backupPath = `${filePath}.backup-${Date.now()}`;
            fs.writeFileSync(backupPath, content, 'utf8');
            console.log(`💾 Backup created: ${backupPath}`);
        }
        
        // Process from bottom to top
        const sortedImports = [...mixedImports].sort((a, b) => b.line - a.line);
        let modifiedLines = [...lines];
        let fixedCount = 0;
        
        for (const mixedImport of sortedImports) {
            const lineIndex = mixedImport.line - 1;
            
            if (lineIndex >= 0 && lineIndex < modifiedLines.length) {
                console.log(`\n📝 Fixing line ${mixedImport.line}:`);
                console.log(`   Original: ${mixedImport.original}`);
                
                const splitLines = splitMixedImport(mixedImport);
                
                if (dryRun) {
                    console.log(`   🔍 DRY RUN - Would replace with:`);
                    splitLines.forEach(l => console.log(`      ${l}`));
                } else {
                    // Replace the line with split imports
                    modifiedLines.splice(lineIndex, 1, ...splitLines);
                    fixedCount++;
                    console.log(`   ✅ Fixed: split into ${splitLines.length} import(s)`);
                }
            }
        }
        
        // Write changes if not dry run
        if (!dryRun && fixedCount > 0) {
            fs.writeFileSync(filePath, modifiedLines.join('\n'), 'utf8');
            console.log(`\n✅ Updated file: ${fixedCount} import(s) fixed`);
        } else if (dryRun) {
            console.log(`\n🔍 DRY RUN: Would fix ${fixedCount} import(s)`);
        }
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
}

function detectMixedImportFromTextEnhanced(
    importText: string, 
    lineNum: number, 
    filePath: string, 
    tsErrors?: Set<string>,
    usePatternOnly: boolean = false
): MixedImport {
    const result: MixedImport = {
        file: filePath,
        line: lineNum,
        original: importText,
        typeImports: [],
        valueImports: [],
        source: '',
        needsSplit: false
    };
    
    const importMatch = importText.match(/import\s+\{([\s\S]*?)\}\s+from\s+['"]([^'"]+)['"]/);
    if (!importMatch) return result;
    
    const [, importsStr, source] = importMatch;
    const cleanSource = source.replace(/;+$/, '');
    result.source = cleanSource;
    
    const cleanImportsStr = importsStr.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim();
    const imports = cleanImportsStr.split(',').map(i => i.trim()).filter(Boolean);
    
    console.log(`DEBUG: Analyzing imports: ${imports.join(', ')}`);
    
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
    
    // SPECIAL CASE: Redux Toolkit imports
    if (cleanSource.includes('@reduxjs/toolkit') || cleanSource.includes('redux')) {
        console.log(`🔍 Special handling for Redux Toolkit imports`);
        
        // Known Redux types
        const reduxTypes = ['PayloadAction', 'Action', 'Reducer', 'Middleware', 'Store', 'Dispatch', 'ThunkAction', 'AnyAction'];
        const reduxValues = ['createSlice', 'createReducer', 'configureStore', 'createAsyncThunk', 'combineReducers'];
        
        imports.forEach(importName => {
            if (reduxTypes.includes(importName)) {
                result.typeImports.push(importName);
            } else if (reduxValues.includes(importName)) {
                result.valueImports.push(importName);
            } else if (importName.endsWith('Action') || importName.endsWith('Reducer') || importName.endsWith('State')) {
                // Anything ending with Action, Reducer, or State is likely a type
                result.typeImports.push(importName);
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
    
    // Check TypeScript errors first (if available)
    const typeImports: string[] = [];
    const valueImports: string[] = [];
    
    imports.forEach(importName => {
        // If we have TypeScript errors, check those first
        if (tsErrors && tsErrors.size > 0) {
            const errorKey = `${filePath}:${lineNum}:${importName}`;
            if (tsErrors.has(errorKey)) {
                typeImports.push(importName);
                console.log(`DEBUG: ${importName} -> has TypeScript error`);
                return;
            }
        }
        
        // Check if this should be a type import based on patterns
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
        console.log(`⚠️  Line ${lineNum}: Mixed import needs splitting`);
    } else if (typeImports.length === imports.length) {
        // All are types - should be import type
        result.typeImports = typeImports;
        result.needsSplit = false;
        result.isTypeOnly = true;
        console.log(`⚠️  Line ${lineNum}: All imports are types, converting to type import`);
    } else if (valueImports.length === imports.length) {
        // All are values - no change needed
        result.valueImports = valueImports;
        result.needsSplit = false;
        console.log(`✅ Line ${lineNum}: All imports are values`);
    }
    
    return result;
}

export function detectMixedImportFromText(importText: string, lineNum: number, filePath: string, tsErrors?: Set<string>): MixedImport {
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
    
    // Check which imports have TypeScript errors (if tsErrors is provided)
    const typeImportsWithErrors: string[] = [];
    const valueImports: string[] = [];
    
    imports.forEach(importName => {
        // If we have TypeScript errors, check if this import has an error
        if (tsErrors && tsErrors.size > 0) {
            const errorKey = `${filePath}:${lineNum}:${importName}`;
            const hasError = tsErrors.has(errorKey);
            
            if (hasError) {
                typeImportsWithErrors.push(importName);
            } else {
                valueImports.push(importName);
            }
        } else {
            // Fall back to pattern-based detection when no tsErrors
            const isType = shouldBeTypeImport(importName, imports);
            console.log(`DEBUG: ${importName} -> isType: ${isType}`);
            if (isType) {
                typeImportsWithErrors.push(importName);
            } else {
                valueImports.push(importName);
            }
        }
    });
    
    console.log(`DEBUG: Types: ${typeImportsWithErrors.join(', ')}`);
    console.log(`DEBUG: Values: ${valueImports.join(', ')}`);
    
    // Only need to split if we have BOTH types AND values
    if (typeImportsWithErrors.length > 0 && valueImports.length > 0) {
        result.typeImports = typeImportsWithErrors;
        result.valueImports = valueImports;
        result.needsSplit = true;
        console.log(`⚠️  Line ${lineNum}: Mixed import needs splitting (${tsErrors ? 'TS error detection' : 'pattern detection'})`);
    } else if (typeImportsWithErrors.length === imports.length) {
        // All are types - should be import type
        result.typeImports = typeImportsWithErrors;
        result.needsSplit = false;
        result.isTypeOnly = true;
        console.log(`⚠️  Line ${lineNum}: All imports ${tsErrors ? 'have TS errors' : 'are types'}, converting to type import`);
    } else if (valueImports.length === imports.length) {
        // All are values - no change needed
        result.valueImports = valueImports;
        result.needsSplit = false;
        console.log(`✅ Line ${lineNum}: No ${tsErrors ? 'TS errors' : 'type imports'} found`);
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

async function collectTypeScriptErrors(): Promise<Set<string>> {
    console.log('🔍 Collecting TypeScript errors...');
    const errors = new Set<string>();
    
    try {
        // Use a timeout to prevent hanging
        const output = execSync(
            'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
            { 
                encoding: 'utf8', 
                maxBuffer: 10 * 1024 * 1024,
                timeout: 10000 // 10 second timeout
            }
        );
        
        // Process the output
        const lines = output.split('\n');
        let foundErrors = 0;
        
        for (const line of lines) {
            // Look for type import errors specifically
            if (line.includes('is a type and must be imported using a type-only import')) {
                // Try different patterns to extract file, line, and type name
                let match = line.match(/(.*\.(?:ts|tsx))\((\d+),(\d+)\): error TS1484: '([^']+)' is a type/);
                
                if (!match) {
                    // Try alternative pattern
                    match = line.match(/(.*\.(?:ts|tsx)):(\d+):(\d+): error TS1484: '([^']+)' is a type/);
                }
                
                if (!match) {
                    // Try even more flexible pattern
                    const fileMatch = line.match(/([^()]+\.(?:ts|tsx))/);
                    const lineMatch = line.match(/\((\d+),/);
                    const typeMatch = line.match(/'([^']+)' is a type/);
                    
                    if (fileMatch && lineMatch && typeMatch) {
                        const file = fileMatch[1];
                        const lineNum = lineMatch[1];
                        const typeName = typeMatch[1];
                        const filePath = path.resolve(process.cwd(), file);
                        const errorKey = `${filePath}:${lineNum}:${typeName}`;
                        errors.add(errorKey);
                        foundErrors++;
                        console.log(`   Found error: ${file}:${lineNum} - ${typeName} (flexible match)`);
                        continue;
                    }
                }
                
                if (match) {
                    const [, file, lineNumStr, , typeName] = match;
                    const filePath = path.resolve(process.cwd(), file);
                    const errorKey = `${filePath}:${lineNumStr}:${typeName}`;
                    errors.add(errorKey);
                    foundErrors++;
                    console.log(`   Found error: ${file}:${lineNumStr} - ${typeName}`);
                }
            }
        }
        
        console.log(`📊 Found ${foundErrors} TypeScript type import errors`);
        
    } catch (error: any) {
        console.error('❌ Error collecting TypeScript errors:', error.message);
        
        if (error.code === 'ETIMEDOUT') {
            console.log('⏱️  TypeScript check timed out - skipping error collection');
        } else if (error.status === 2) {
            console.log('⚠️  TypeScript has syntax errors - using fallback error detection');
            
            // Try to extract errors from stderr if available
            if (error.stderr) {
                const stderr = error.stderr.toString();
                const lines = stderr.split('\n');
                
                for (const line of lines) {
                    if (line.includes('is a type and must be imported using a type-only import')) {
                        const match = line.match(/(.*\.(?:ts|tsx))\((\d+),(\d+)\): error TS1484: '([^']+)' is a type/);
                        if (match) {
                            const [, file, lineNumStr, , typeName] = match;
                            const filePath = path.resolve(process.cwd(), file);
                            const errorKey = `${filePath}:${lineNumStr}:${typeName}`;
                            errors.add(errorKey);
                            console.log(`   Found error from stderr: ${file}:${lineNumStr} - ${typeName}`);
                        }
                    }
                }
            }
            
            // Also try stdout
            if (error.stdout) {
                const stdout = error.stdout.toString();
                const lines = stdout.split('\n');
                
                for (const line of lines) {
                    if (line.includes('is a type and must be imported using a type-only import')) {
                        const match = line.match(/(.*\.(?:ts|tsx))\((\d+),(\d+)\): error TS1484: '([^']+)' is a type/);
                        if (match) {
                            const [, file, lineNumStr, , typeName] = match;
                            const filePath = path.resolve(process.cwd(), file);
                            const errorKey = `${filePath}:${lineNumStr}:${typeName}`;
                            errors.add(errorKey);
                            console.log(`   Found error from stdout: ${file}:${lineNumStr} - ${typeName}`);
                        }
                    }
                }
            }
        }
    }
    
    return errors;
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
    
    // Try to find the file (excluding backups)
    let fullPath = findFileInProject(target);
    
    if (!fullPath) {
        console.error(`❌ Target not found: ${target}`);
        console.log(`   Current directory: ${process.cwd()}`);
        
        // Check if it might be in backup directories
        console.log(`🔍 Checking if file exists in backup directories...`);
        
        try {
            const findBackupCmd = `find . -type f -name "*${path.basename(target)}*" \
                -path "*/.migration-backups/*" \
                -o -path "*/*backup*" 2>/dev/null | head -3`;
            
            const backupFiles = execSync(findBackupCmd, { encoding: 'utf8' })
                .split('\n')
                .filter(f => f.trim() && (f.endsWith('.ts') || f.endsWith('.tsx')));
            
            if (backupFiles.length > 0) {
                console.log(`⚠️  Found ${backupFiles.length} copies in backup directories:`);
                backupFiles.forEach((file, i) => {
                    console.log(`   ${i + 1}. ${file}`);
                });
                console.log(`\n💡 This file appears to be in backup directories only.`);
                console.log(`   Try finding the active version in src/ directory.`);
            }
        } catch (error) {
            // Ignore errors
        }
        
        console.log(`\n💡 Suggestions:`);
        console.log(`   • Use the full relative path: src/core/components/models/teams/TeamData.tsx`);
        console.log(`   • Check if the file exists in src/ directory`);
        console.log(`   • Run \`pnpm fix:file:all\` to fix all files in the project`);
        
        // Show common directories for similar files
        const baseName = path.basename(target, path.extname(target));
        console.log(`\n🔍 Common locations for ${baseName}:`);
        const commonLocations = [
            `src/core/components/models/teams/${baseName}.tsx`,
            `src/core/models/teams/${baseName}.tsx`,
            `src/components/models/teams/${baseName}.tsx`,
            `src/teams/${baseName}.tsx`,
            `src/core/components/${baseName}.tsx`,
            `src/core/${baseName}.tsx`,
        ];
        
        commonLocations.forEach(loc => {
            if (fs.existsSync(path.resolve(process.cwd(), loc))) {
                console.log(`   ✅ ${loc}`);
            }
        });
        
        return;
    }
    
    const relativePath = path.relative(process.cwd(), fullPath);
    console.log(`📁 Found: ${relativePath}`);
    
    // Double-check this isn't a backup file
    if (relativePath.includes('.migration-backups') || 
        relativePath.includes('.backup') || 
        relativePath.includes('-backup') ||
        relativePath.includes('backup-')) {
        console.error(`❌ WARNING: Found file in backup directory: ${relativePath}`);
        console.log(`   Skipping backup file - modify the actual source file instead.`);
        console.log(`   Expected location: src/core/components/models/teams/TeamData.tsx`);
        return;
    }
    
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
        console.log(`📁 Analyzing directory: ${target}\n`);
        await fixAllFilesInDirectory(fullPath, dryRun, backup);
    } else if (stats.isFile()) {
        // Optional: Add import check before running fix
        const content = fs.readFileSync(fullPath, 'utf8');
        const hasImports = content.includes('import');
        
        if (!hasImports) {
            console.log(`⚠️  File doesn't appear to have any imports.`);
            console.log(`   Content preview: ${content.substring(0, 200)}...`);
        }
        
        await fixSpecificFile(fullPath, dryRun, backup);
    } else {
        console.error(`❌ Target is neither file nor directory: ${target}`);
    }
}


function findFileInProject(fileName: string): string | null {
    const baseName = path.basename(fileName, path.extname(fileName));
    const ext = path.extname(fileName);
    const hasExtension = ext !== '';
    
    console.log(`🔍 Searching for: ${fileName}`);
    console.log(`   Base name: ${baseName}`);
    console.log(`   Has extension: ${hasExtension}`);
    
    // First check if it exists as given
    let fullPath = path.resolve(process.cwd(), fileName);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ Found at exact path: ${fileName}`);
        return fullPath;
    }
    
    // Common directories to search (only actual source directories)
    const searchDirs = [
        'src',
        'src/core',
        'src/components',
        'src/pages',
        'src/utils',
        'src/types',
        'src/models',
        'src/core/components',
        'src/core/models',
        'src/core/state',
        'app',
        'app/components',
        'app/pages',
        'lib',
        'components',
        'pages',
        'utils',
        'types',
        'models',
        'core'
    ];
    
    // Try extensions in order of likelihood
    const extensions = hasExtension 
        ? [ext]  // Use provided extension
        : ['.tsx', '.ts', '.jsx', '.js'];  // Try common extensions
    
    // Try exact matches first in common directories
    for (const dir of searchDirs) {
        for (const extension of extensions) {
            // With original filename structure
            if (hasExtension) {
                const testPath = path.resolve(process.cwd(), dir, fileName);
                if (fs.existsSync(testPath)) {
                    console.log(`✅ Found in ${dir}/: ${fileName}`);
                    return testPath;
                }
            }
            
            // With baseName + extension
            const testPath = path.resolve(process.cwd(), dir, baseName + extension);
            if (fs.existsSync(testPath)) {
                console.log(`✅ Found in ${dir}/: ${baseName}${extension}`);
                return testPath;
            }
        }
    }
    
    // If not found in common directories, then do recursive search
    console.log(`🔍 File not found in common directories, doing recursive search...`);
    
    try {
        // Build search pattern
        let searchPattern = baseName;
        if (hasExtension) {
            searchPattern = fileName;
        }
        
        // Use find command for recursive search but EXCLUDE backup directories
        const findCmd = `find . -type f -name "*${searchPattern}*" \
            -not -path "*/node_modules/*" \
            -not -path "*/.git/*" \
            -not -path "*/.migration-backups/*" \
            -not -path "*/.backup*" \
            -not -path "*/backup*" \
            -not -path "*/.type-import-backups/*" \
            -not -path "*/.unified-type-fixes/*" \
            -not -path "*/*.backup*" \
            -not -path "*/*backup*" \
            2>/dev/null | grep -E "\\.(ts|tsx|js|jsx)$" | head -10`;
        
        const found = execSync(findCmd, { encoding: 'utf8' })
            .split('\n')
            .filter(f => f.trim())
            .map(f => path.resolve(process.cwd(), f.trim()))
            .filter(filePath => {
                // Additional filtering to exclude backup-looking paths
                const relativePath = path.relative(process.cwd(), filePath);
                return !relativePath.includes('.backup') &&
                       !relativePath.includes('.migration-backups') &&
                       !relativePath.includes('-backup') &&
                       !relativePath.includes('backup-');
            });
        
        if (found.length > 0) {
            console.log(`   Found ${found.length} potential matches (excluding backups):`);
            found.forEach((file, i) => {
                const relativePath = path.relative(process.cwd(), file);
                console.log(`   ${i + 1}. ${relativePath}`);
            });
            
            // Try to find the best match - prioritize files in src/ directory
            const bestMatch = found.find(f => 
                f.includes('/src/') && (
                    f.includes(`/${baseName}.`) || 
                    path.basename(f) === fileName ||
                    path.basename(f, path.extname(f)) === baseName
                )
            ) || found[0];
            
            const relativeBest = path.relative(process.cwd(), bestMatch);
            console.log(`✅ Found via recursive search: ${relativeBest}`);
            return bestMatch;
        }
    } catch (error) {
        console.log(`🔍 Recursive search failed: ${error.message}`);
    }
    
    return null;
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



if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main, detectMixedImport, splitMixedImport };