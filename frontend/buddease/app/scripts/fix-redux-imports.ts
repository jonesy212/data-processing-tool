#!/usr/bin/env tsx
// fix-redux-imports.ts

import fs from 'fs';
import path from 'path';

function fixReduxImportsInFile(filePath: string, dryRun: boolean = false) {
    console.log(`🔍 Analyzing: ${filePath}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let changesMade = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;
            
            // Check for Redux Toolkit imports
            if (line.includes('@reduxjs/toolkit') && line.includes('import {')) {
                const match = line.match(/import\s+\{([^}]+)\}\s+from\s+['"]@reduxjs\/toolkit['"]/);
                
                if (match) {
                    const importsStr = match[1];
                    const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);
                    
                    // Separate Redux types from values
                    const reduxTypes = ['PayloadAction', 'Action', 'Reducer', 'Middleware', 
                                       'Store', 'Dispatch', 'ThunkAction', 'AnyAction', 
                                       'State', 'Slice', 'CaseReducer'];
                    
                    const reduxValues = ['createSlice', 'createReducer', 'configureStore', 
                                        'createAsyncThunk', 'combineReducers', 'createAction', 
                                        'createEntityAdapter', 'getDefaultMiddleware'];
                    
                    const typeImports: string[] = [];
                    const valueImports: string[] = [];
                    
                    imports.forEach(importName => {
                        if (reduxTypes.includes(importName)) {
                            typeImports.push(importName);
                        } else if (reduxValues.includes(importName)) {
                            valueImports.push(importName);
                        } else if (importName.endsWith('Action') || 
                                  importName.endsWith('Reducer') || 
                                  importName.endsWith('State') || 
                                  importName.endsWith('Slice')) {
                            // Pattern-based detection for Redux types
                            typeImports.push(importName);
                        } else {
                            // Default to value if we can't determine
                            valueImports.push(importName);
                        }
                    });
                    
                    // Check if we need to make changes
                    if (typeImports.length > 0 && valueImports.length === 0) {
                        // All imports are types - should be import type
                        if (!line.includes('import type')) {
                            console.log(`Line ${lineNum}: All Redux imports are types: ${typeImports.join(', ')}`);
                            
                            if (!dryRun) {
                                lines[i] = line.replace('import {', 'import type {');
                                changesMade++;
                                console.log(`   ✅ Converted to import type`);
                            } else {
                                console.log(`   🔍 Would convert to import type`);
                            }
                        }
                    } else if (typeImports.length > 0 && valueImports.length > 0) {
                        // Mixed imports - need to split
                        console.log(`Line ${lineNum}: Mixed Redux imports - Types: ${typeImports.join(', ')}, Values: ${valueImports.join(', ')}`);
                        
                        if (!dryRun) {
                            const typeImport = `import type { ${typeImports.join(', ')} } from "@reduxjs/toolkit";`;
                            const valueImport = `import { ${valueImports.join(', ')} } from "@reduxjs/toolkit";`;
                            lines[i] = `${typeImport}\n${valueImport}`;
                            changesMade++;
                            console.log(`   ✅ Split into separate imports`);
                        } else {
                            console.log(`   🔍 Would split into:`);
                            console.log(`      import type { ${typeImports.join(', ')} } from "@reduxjs/toolkit";`);
                            console.log(`      import { ${valueImports.join(', ')} } from "@reduxjs/toolkit";`);
                        }
                    }
                }
            }
            
            // Check for Axios imports
            if ((line.includes('axios') || line.includes('"axios"')) && line.includes('import {')) {
                const match = line.match(/import\s+\{([^}]+)\}\s+from\s+['"]axios['"]/);
                
                if (match) {
                    const importsStr = match[1];
                    const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);
                    
                    // Separate Axios types from values
                    const axiosTypes = ['AxiosResponse', 'AxiosRequestConfig', 'AxiosInstance', 
                                       'AxiosStatic', 'AxiosPromise'];
                    
                    const axiosValues = ['AxiosError', 'default', 'create']; // AxiosError is a class
                    
                    const typeImports: string[] = [];
                    const valueImports: string[] = [];
                    
                    imports.forEach(importName => {
                        if (axiosTypes.includes(importName)) {
                            typeImports.push(importName);
                        } else if (axiosValues.includes(importName)) {
                            valueImports.push(importName);
                        } else {
                            // Default to type for pattern matching
                            if (importName.startsWith('Axios')) {
                                typeImports.push(importName);
                            } else {
                                valueImports.push(importName);
                            }
                        }
                    });
                    
                    // Check if we need to make changes
                    if (typeImports.length > 0 && valueImports.length === 0) {
                        // All imports are types - should be import type
                        if (!line.includes('import type')) {
                            console.log(`Line ${lineNum}: All Axios imports are types: ${typeImports.join(', ')}`);
                            
                            if (!dryRun) {
                                lines[i] = line.replace('import {', 'import type {');
                                changesMade++;
                                console.log(`   ✅ Converted to import type`);
                            } else {
                                console.log(`   🔍 Would convert to import type`);
                            }
                        }
                    } else if (typeImports.length > 0 && valueImports.length > 0) {
                        // Mixed imports - need to split
                        console.log(`Line ${lineNum}: Mixed Axios imports - Types: ${typeImports.join(', ')}, Values: ${valueImports.join(', ')}`);
                        
                        if (!dryRun) {
                            const typeImport = `import type { ${typeImports.join(', ')} } from "axios";`;
                            const valueImport = `import { ${valueImports.join(', ')} } from "axios";`;
                            lines[i] = `${typeImport}\n${valueImport}`;
                            changesMade++;
                            console.log(`   ✅ Split into separate imports`);
                        } else {
                            console.log(`   🔍 Would split into:`);
                            console.log(`      import type { ${typeImports.join(', ')} } from "axios";`);
                            console.log(`      import { ${valueImports.join(', ')} } from "axios";`);
                        }
                    }
                }
            }
            
            // Check for MobX imports
            if ((line.includes('mobx') || line.includes('"mobx"') || line.includes('"mobx-react"')) && 
                line.includes('import {')) {
                
                const match = line.match(/import\s+\{([^}]+)\}\s+from\s+['"](mobx|mobx-react)['"]/);
                
                if (match) {
                    const importsStr = match[1];
                    const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);
                    
                    // Separate MobX types from values
                    const mobxTypes = ['IObservableArray', 'IObservableValue', 'IObservableObject',
                                      'IReactionDisposer', 'IAutorunOptions', 'IReactionOptions',
                                      'IComputedValue', 'IComputedValueOptions', 'ObservableMap',
                                      'ObservableSet', 'Reaction', 'Autorun', 'When', 'Computed'];
                    
                    const mobxValues = ['observable', 'makeObservable', 'makeAutoObservable', 'autorun',
                                       'reaction', 'when', 'computed', 'action', 'runInAction', 'flow',
                                       'toJS', 'isObservable', 'isObservableArray', 'isObservableObject',
                                       'isObservableMap', 'isObservableSet', 'isComputed', 'isAction'];
                    
                    const typeImports: string[] = [];
                    const valueImports: string[] = [];
                    
                    imports.forEach(importName => {
                        if (mobxTypes.includes(importName)) {
                            typeImports.push(importName);
                        } else if (mobxValues.includes(importName)) {
                            valueImports.push(importName);
                        } else if (importName.startsWith('I') && /[A-Z]/.test(importName[1])) {
                            // Interface naming pattern
                            typeImports.push(importName);
                        } else {
                            // Default to value
                            valueImports.push(importName);
                        }
                    });
                    
                    // Check if we need to make changes
                    if (typeImports.length > 0 && valueImports.length === 0) {
                        // All imports are types - should be import type
                        if (!line.includes('import type')) {
                            console.log(`Line ${lineNum}: All MobX imports are types: ${typeImports.join(', ')}`);
                            
                            if (!dryRun) {
                                lines[i] = line.replace('import {', 'import type {');
                                changesMade++;
                                console.log(`   ✅ Converted to import type`);
                            } else {
                                console.log(`   🔍 Would convert to import type`);
                            }
                        }
                    } else if (typeImports.length > 0 && valueImports.length > 0) {
                        // Mixed imports - need to split
                        console.log(`Line ${lineNum}: Mixed MobX imports - Types: ${typeImports.join(', ')}, Values: ${valueImports.join(', ')}`);
                        
                        if (!dryRun) {
                            const typeImport = `import type { ${typeImports.join(', ')} } from "${match[2]}";`;
                            const valueImport = `import { ${valueImports.join(', ')} } from "${match[2]}";`;
                            lines[i] = `${typeImport}\n${valueImport}`;
                            changesMade++;
                            console.log(`   ✅ Split into separate imports`);
                        } else {
                            console.log(`   🔍 Would split into:`);
                            console.log(`      import type { ${typeImports.join(', ')} } from "${match[2]}";`);
                            console.log(`      import { ${valueImports.join(', ')} } from "${match[2]}";`);
                        }
                    }
                }
            }
        }
        
        if (changesMade > 0 && !dryRun) {
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            console.log(`\n✅ Updated ${filePath} (${changesMade} changes)`);
        } else if (dryRun && changesMade > 0) {
            console.log(`\n🔍 DRY RUN: Would make ${changesMade} changes`);
        } else {
            console.log(`\n✅ No Redux/Axios/MobX imports need fixing`);
        }
        
    } catch (error: any) {
        console.error(`❌ Error: ${error.message}`);
    }
}

// Helper functions
function isDirectory(filePath: string): boolean {
    try {
        return fs.statSync(filePath).isDirectory();
    } catch {
        return false;
    }
}

function processFile(filePath: string, dryRun: boolean) {
    if (fs.existsSync(filePath) && (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))) {
        console.log('\n' + '='.repeat(60));
        fixReduxImportsInFile(filePath, dryRun);
    }
}

function processDirectory(dirPath: string, dryRun: boolean) {
    console.log(`📁 Processing directory: ${dirPath}`);
    
    try {
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            
            if (fs.statSync(fullPath).isDirectory()) {
                // Skip node_modules and other directories
                if (!file.includes('node_modules') && !file.startsWith('.')) {
                    processDirectory(fullPath, dryRun);
                }
            } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                processFile(fullPath, dryRun);
            }
        }
    } catch (error: any) {
        console.error(`❌ Error reading directory ${dirPath}: ${error.message}`);
    }
}

// Main execution
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('--dryrun');
const help = args.includes('--help') || args.includes('-h');

if (help) {
    console.log(`
🚀 Fix Redux/Axios/MobX Imports
================================

Usage:
  tsx fix-redux-imports.ts <file-or-directory> [options]

Options:
  --dry-run, --dryrun    Preview changes without applying
  --help, -h             Show this help message

Examples:
  tsx fix-redux-imports.ts FilterSlice.ts
  tsx fix-redux-imports.ts src/core/state --dry-run

What it fixes:
  • Redux Toolkit: PayloadAction (type) vs createSlice (runtime)
  • Axios: AxiosResponse (type) vs AxiosError (runtime)
  • MobX: IObservableArray (type) vs observable (runtime)
    `);
    process.exit(0);
}

// Find the first argument that's not a flag
const targetArg = args.find(arg => !arg.startsWith('--'));

if (!targetArg) {
    console.error('❌ Error: No target specified');
    console.log('Usage: tsx fix-redux-imports.ts <file-or-directory> [options]');
    process.exit(1);
}

const targetPath = path.resolve(process.cwd(), targetArg);

if (!fs.existsSync(targetPath)) {
    console.error(`❌ Target not found: ${targetArg}`);
    console.log(`   Searched at: ${targetPath}`);
    process.exit(1);
}

if (isDirectory(targetPath)) {
    processDirectory(targetPath, dryRun);
} else {
    processFile(targetPath, dryRun);
}

console.log('\n🎉 Done!');