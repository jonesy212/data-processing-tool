#!/usr/bin/env tsx
// Fixed Type-Only Import Fixer - NO COMMENTS BUG
import type { FixResult, TypeImportError } from '@/app/scripts/import-utils'
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { ImportFix } from '@/core/generators/corrections/ImportFixServicies'
import { enhanceFixesWithContext } from '@/core/generators/corrections/BaseImportFix'
import  { 
  shouldBeTypeImport, 
  fixImportStatement, 
  findInterfaceExports,
  createBackup, 
  groupFixesByFile, 
  sortFixesDescending, 
  getContextTips,
} from '@/app/scripts/import-utils'



// Helper to safely get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else {
    return String(error);
  }
}


function fixNamespaceImports(errors: TypeImportError[]): FixResult[] {
  const fixes: FixResult[] = [];
  
  for (const error of errors) {
    if (error.typeName === '*' && error.importStatement) {
      // This is a namespace import error
      const original = error.importStatement;
      
      // Check if it's already a type import
      if (original.includes('import type *')) {
        continue; // Already correct
      }
      
      // Convert to type import
      let fixed = original;
      
      if (original.includes('import * as')) {
        // Pattern: import * as Something from 'path'
        fixed = original.replace(/^import\s+\*/, 'import type *');
      }
      
      if (fixed !== original) {
        // CRITICAL: Ensure no comment prefix
        if (fixed.startsWith('//')) {
          console.error(`❌ BUG DETECTED: Generated fix starts with //!`);
          console.error(`   This means the fix generator created COMMENT instead of CODE`);
          console.error(`   File: ${error.file}`);
          console.error(`   Line: ${error.line || 1}`);
          console.error(`   Original: "${original.substring(0, 80)}${original.length > 80 ? '...' : ''}"`);
          console.error(`   Generated: "${fixed.substring(0, 80)}${fixed.length > 80 ? '...' : ''}"`);
          
          // Skip this fix entirely - better to leave error than created broken code
          console.error(`   SKIPPING this fix - leaving original line unchanged`);
          continue; // Skip this error, don't return null
        }
        
        fixes.push({
          file: error.file,
          original: original,
          fixed: fixed,
          success: true,
          line: error.line || 1
        });
      }
    }
  }
  
  return fixes;
}



function showTimeSavings(fixesCount: number) {
  const MANUAL_TIME_PER_FIX = 15; // seconds
  const AUTOMATED_TIME_PER_FIX = 0.5; // seconds
  
  const manualTime = fixesCount * MANUAL_TIME_PER_FIX;
  const automatedTime = fixesCount * AUTOMATED_TIME_PER_FIX;
  const timeSaved = manualTime - automatedTime;
  
  console.log('\n⏱️  TIME SAVINGS ESTIMATE:');
  console.log('='.repeat(40));
  console.log(`Manual time: ${Math.round(manualTime / 60)} minutes`);
  console.log(`Automated time: ${Math.round(automatedTime)} seconds`);
  console.log(`Time saved: ${Math.round(timeSaved / 60)} minutes`);
  console.log(`Efficiency: ${Math.round(manualTime / automatedTime)}x faster!`);
}

function captureAllTypeErrors(): TypeImportError[] {
  console.log('🔍 Running TypeScript compiler to capture ALL type-only import errors...\n');
  
  const errors: TypeImportError[] = [];
  
  try {
    // Run tsc and capture ALL output
    const output = execSync('npx tsc --noEmit --skipLibCheck 2>&1', {
      encoding: 'utf8',
      stdio: 'pipe'
    }).toString();
    
    const lines = output.split('\n');
    
    // Parse ALL type-only import errors from TypeScript output
    const errorRegex = /([^\(\s]+)\((\d+),(\d+)\): error TS1484: '([^']+)' is a type/;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const errorMatch = line.match(errorRegex);
      
      if (errorMatch) {
        const [, file, lineStr, columnStr, typeName] = errorMatch;
        errors.push({
          typeName,
          file: path.resolve(process.cwd(), file),
          line: parseInt(lineStr),
          column: parseInt(columnStr),
          originalLine: ''
        });
      }
    }
    
    console.log(`📊 Found ${errors.length} type-only import errors\n`);
    
  } catch (error: any) {
    console.log('⚠️  TypeScript compiler found errors (this is expected)...');
    
    if (error.stderr) {
      const errorOutput = error.stderr.toString();
      const lines = errorOutput.split('\n');
      const errorRegex = /([^\(\s]+)\((\d+),(\d+)\): error TS1484: '([^']+)' is a type/;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const errorMatch = line.match(errorRegex);
        
        if (errorMatch) {
          const [, file, lineStr, columnStr, typeName] = errorMatch;
          errors.push({
            typeName,
            file: path.resolve(process.cwd(), file),
            line: parseInt(lineStr),
            column: parseInt(columnStr),
            originalLine: ''
          });
        }
      }
      
      console.log(`📊 Found ${errors.length} type-only import errors in error output\n`);
    }
  }
  
  return errors;
}

function findImportStatements(errors: TypeImportError[]): TypeImportError[] {
  console.log('🔍 Finding import statements for each error...\n');
  
  const results: TypeImportError[] = [];
  
  for (const error of errors) {
    try {
      const filePath = normalizePath(error.file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n');
      
      if (error.line && error.line <= lines.length) {
        // Try to find the import statement
        let importStart = error.line - 1;
        
        // Look backward for start of import
        while (importStart > 0 && !lines[importStart].trim().startsWith('import')) {
          importStart--;
        }
        
        // Look forward for end of import
        let importEnd = importStart;
        while (importEnd < lines.length && !lines[importEnd].trim().endsWith(';')) {
          importEnd++;
        }
        
        // Combine multi-line import
        const importStatement = lines.slice(importStart, importEnd + 1)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (importStatement.includes('import') && importStatement.includes(error.typeName)) {
          results.push({
            ...error,
            file: filePath,
            importStatement,
            line: importStart + 1
          });
        }
      }
    } catch (fileError) {
      console.log(`❌ Could not read ${error.file}:`, getErrorMessage(fileError));
    }
  }
  
  return results;
}

function generateFixes(errors: TypeImportError[]): FixResult[] {
  console.log('\n🔧 Generating fixes...\n');
  
  const fixes: FixResult[] = [];
  const processedImports = new Set<string>();
  
    const namespaceFixes = fixNamespaceImports(errors);
    fixes.push(...namespaceFixes);
  
  // Group errors by file and import statement
  const importMap = new Map<string, Map<string, TypeImportError[]>>();
  
  for (const error of errors) {
    if (!error.importStatement) continue;
    
    const key = `${error.file}:${error.importStatement}`;
    if (processedImports.has(key)) continue;
    processedImports.add(key);
    
    if (!importMap.has(error.file)) {
      importMap.set(error.file, new Map());
    }
    
    const fileMap = importMap.get(error.file)!;
    if (!fileMap.has(error.importStatement)) {
      fileMap.set(error.importStatement, []);
    }
    
    fileMap.get(error.importStatement)!.push(error);
  }
  
  // Generate fixes
  for (const [filePath, fileMap] of importMap) {
    const fileName = path.basename(filePath);
    console.log(`📝 ${fileName}:`);
    
    for (const [importStmt, typeErrors] of fileMap) {
      const typeNames = typeErrors.map(e => e.typeName);
      
      // Parse the import statement
      const isNamedImport = importStmt.includes('{');
      const isDefaultImport = /import\s+(\w+)\s+from/.test(importStmt);
      
      let fixedImport = importStmt;
      
      if (isNamedImport) {
        // Named import: import { X, Y } from 'path'
        const match = importStmt.match(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/);
        if (match) {
          const [, importsStr, source] = match;
          const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);
          
          // Check if ALL imports in this statement are types
          const allAreTypes = imports.every(imp => 
            typeNames.some(typeName => imp === typeName)
          );
          
          if (allAreTypes) {
            // CRITICAL FIX: Just add 'type', don't add comments!
            fixedImport = `import type { ${imports.join(', ')} } from '${source}'`;
          } else {
            // Mixed imports
            const typeImports = imports.filter(imp => 
              typeNames.some(typeName => imp === typeName)
            );
            const valueImports = imports.filter(imp => 
              !typeNames.some(typeName => imp === typeName)
            );
            
            if (typeImports.length > 0) {
              // Split into type and value imports
              fixedImport = `import type { ${typeImports.join(', ')} } from '${source}';\nimport { ${valueImports.join(', ')} } from '${source}'`;
            }
          }
        }
      } else if (isDefaultImport) {
        // Default import: import X from 'path'
        const match = importStmt.match(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
        if (match && typeNames.includes(match[1])) {
          fixedImport = importStmt.replace('import ', 'import type ');
        }
      }
      
      if (fixedImport !== importStmt) {
        // CRITICAL: Ensure fixed import doesn't start with //
        if (fixedImport.startsWith('//')) {
          console.error(`   ❌ ERROR: Generated fix starts with //! Fixing...`);
          fixedImport = fixedImport.replace(/^\/\/\s*/, '');
        }
        
        fixes.push({
          file: filePath,
          original: importStmt,
          fixed: fixedImport,
          success: true,
          line: typeErrors[0].line || 1
        });
        
        console.log(`   Line ${typeErrors[0].line}: ${typeNames.join(', ')}`);
        console.log(`   ${importStmt.substring(0, 60)}${importStmt.length > 60 ? '...' : ''}`);
        console.log(`   → ${fixedImport.substring(0, 60)}${fixedImport.length > 60 ? '...' : ''}`);
      }
    }
  }
  
  return fixes;
}


function applyFixes(fixes: FixResult[], dryRun: boolean = false) {
  console.log(`\n${dryRun ? '🔍 DRY RUN' : '🔧 APPLYING FIXES'}`);
  console.log('='.repeat(50));
  
  if (dryRun) {
    console.log(`Would apply ${fixes.length} fixes across ${new Set(fixes.map(f => f.file)).size} files`);
    
    fixes.slice(0, 10).forEach(fix => {
      const shortOriginal = fix.original.length > 50 ? fix.original.substring(0, 50) + '...' : fix.original;
      const shortFixed = fix.fixed.length > 50 ? fix.fixed.substring(0, 50) + '...' : fix.fixed;
      console.log(`  ${path.basename(fix.file)}:${fix.line || 1}: ${shortOriginal} → ${shortFixed}`);
    });
    
    if (fixes.length > 10) {
      console.log(`  ... and ${fixes.length - 10} more fixes`);
    }
    
    return;
  }
  
  let totalApplied = 0;
  let totalFailed = 0;
  
  // Use shared helper
  const fixesByFile = groupFixesByFile(fixes);
  
  for (const [filePath, fileFixes] of fixesByFile) {
    try {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`\n📄 ${relativePath}: ${fileFixes.length} fix${fileFixes.length > 1 ? 'es' : ''}`);
      
      // Use shared helper
      const backupPath = createBackup(filePath);
      console.log(`   💾 Backup: ${path.basename(backupPath)}`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      let lines = content.split('\n');
      
      // Use shared helper
      const sortedFixes = sortFixesDescending(fileFixes);
      
      // KEEP ALL THE ORIGINAL LOGIC - it's specific to this script
      for (const fix of sortedFixes) {
        const lineIndex = fix.line - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          let importStart = lineIndex;
          while (importStart > 0 && !lines[importStart].trim().startsWith('import')) {
            importStart--;
          }
          
          let importEnd = importStart;
          while (importEnd < lines.length && !lines[importEnd].trim().endsWith(';')) {
            importEnd++;
          }
          
          const actualImport = lines.slice(importStart, importEnd + 1)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          if (actualImport === fix.original) {
            let cleanFixed = fix.fixed;
            if (cleanFixed.startsWith('//')) {
              cleanFixed = cleanFixed.replace(/^\/\/\s*/, '');
              console.log(`   ⚠️  Removed // prefix from fix`);
            }
            
            if (cleanFixed.includes('\n')) {
              const newLines = cleanFixed.split('\n');
              lines.splice(importStart, importEnd - importStart + 1, ...newLines);
            } else {
              lines[importStart] = cleanFixed;
            }
            
            totalApplied++;
            console.log(`   ✅ Fixed line ${importStart + 1}`);
          } else {
            console.log(`   ⚠️  Skipping - import doesn't match`);
            console.log(`      Expected: "${fix.original.substring(0, 60)}..."`);
            console.log(`      Found: "${actualImport.substring(0, 60)}..."`);
            totalFailed++;
          }
        }
      }
      
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      
    } catch (error) {
      console.log(`   ❌ Error:`, getErrorMessage(error));
      totalFailed += fileFixes.length;
    }
  }
  
  console.log('\n📊 SUMMARY:');
  console.log(`   Total files: ${fixesByFile.size}`);
  console.log(`   Total fixes: ${fixes.length}`);
  console.log(`   Applied: ${totalApplied}`);
  console.log(`   Failed: ${totalFailed}`);
  
  if (totalFailed > 0) {
    console.log(`\n💡 ${getContextTips('type')}`);
    console.log(`\n🔍 Consider checking these specific patterns:`);
    console.log(`   • Mixed imports (types + values in same statement)`);
    console.log(`   • Namespace imports that contain both types and values`);
    console.log(`   • Default imports from type-only modules`);
  }
}

function captureAllTypeErrorsQuick(): TypeImportError[] {
  console.log('⚡ QUICK MODE - Using enhanced pattern matching...\n');
  
  const errors: TypeImportError[] = [];
  const commonTypes = [
    'BaseDataEntity', 'BaseDataRoot', 'DefaultExcludedFields', 'DefaultMeta',
    'UnifiedMetadata', 'StructuredMetadata', 'Attachment', 'SharedMetadata',
    'EventManager', 'InitializedState', 'DocumentData', 'DocumentOptions',
    'UserSettings', 'ExcludedFields', 'ModifiedDate', 'AppPhase', 'PhaseMilestone',
    'CollaborationOptions', 'TeamCollaborationAnalysis', 'Category', 'BaseData',
    'CategoryProperties', 'SnapshotsArray', 'SnapshotUnion', 'SnapshotData',
    'SnapshotStoreConfig', 'SubscriberCollection', 'RealtimeDataItem', 'SnapshotEvents'
  ];
  
  for (const typeName of commonTypes) {
    try {
      const stdout = execSync(
        `grep -rn "import.*${typeName}.*from" src/ --include="*.ts" --include="*.tsx" | grep -v "import type" || true`,
        { encoding: 'utf8' }
      ).toString();
      
      const importLines = stdout.split('\n').filter(Boolean);
      importLines.forEach(line => {
        const [filePath, lineNumStr, ...rest] = line.split(':');
        errors.push({
          typeName,
          file: filePath,
          line: parseInt(lineNumStr) || 1,
          importStatement: rest.join(':').trim(),
          originalLine: ''
        });
      });
    } catch (e) {
      // Continue
    }
  }
  
  console.log(`📊 Found ${errors.length} potential type imports using pattern matching\n`);
  return errors;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('--dryrun');
  const quickMode = args.includes('--quick');
  
  console.log('🚀 Fixed Type-Only Import Fixer (NO COMMENT BUG)');
  console.log('='.repeat(50));
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }
  
  if (quickMode) {
    console.log('⚡ QUICK MODE - Using enhanced pattern matching\n');
  }
  
  try {
    // Step 1: Capture errors
    const errors = quickMode ? captureAllTypeErrorsQuick() : captureAllTypeErrors();
    
    if (errors.length === 0) {
      console.log('✅ No type-only import errors found!');
      return;
    }
    
    // Step 2: Find import statements
    const errorsWithImports = findImportStatements(errors);
    
    // Step 3: Generate fixes
    const fixes = generateFixes(errorsWithImports);
    
    if (fixes.length === 0) {
      console.log('✅ No fixes needed (or all imports are already correct)');
      return;
    }
    
    // Step 4: Apply fixes
    applyFixes(fixes, dryRun);
    showTimeSavings(fixes.length);

    if (!dryRun) {
      console.log('\n🔍 Verifying fixes...');
      try {
        const stdout = execSync('npx tsc --noEmit --skipLibCheck 2>&1 | grep -c "is a type and must be imported" || true', {
          encoding: 'utf8'
        }).toString();
        const remainingErrors = parseInt(stdout.trim()) || 0;
        console.log(`📊 Remaining type-only import errors: ${remainingErrors}`);
        
        if (remainingErrors > 0) {
          console.log('\n⚠️  Some errors remain. You may need to:');
          console.log('   1. Run the fixer again');
          console.log('   2. Check for edge cases manually');
          console.log('   3. Look for default imports that need attention');
        } else {
          console.log('\n🎉 All type-only import errors fixed!');
        }
      } catch (e) {
        console.log('⚠️  Could not verify fixes automatically');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', getErrorMessage(error));
    process.exit(1);
  }
}


async function detectAndFixTypeImports() {
    console.log('🔍 Detecting type import issues...');
    
    // Create backup directory
    const backupDir = path.join(process.cwd(), '.type-import-fixes');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    // First, run TypeScript to get errors
    let tscOutput = '';
    try {
        tscOutput = execSync(
            'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
            { encoding: 'utf8' }
        );
    } catch (error: any) {
        tscOutput = error.stdout || error.stderr || error.message;
    }

    // Parse errors - use a better typed interface
    interface RawImportFix {
        file: string;
        line: number;
        typeName: string;
        shouldBeTypeOnly: boolean;
    }

    const rawFixes: RawImportFix[] = [];
    const lines = tscOutput.split('\n');
    
    for (const line of lines) {
        if (line.includes('is a type and must be imported using a type-only import')) {
            const fileMatch = line.match(/(.*\.(?:ts|tsx)):(\d+):/);
            if (fileMatch) {
                const file = fileMatch[1];
                const lineNum = parseInt(fileMatch[2]);
                
                const typeMatch = line.match(/'(.*)' is a type/);
                const typeName = typeMatch ? typeMatch[1] : 'unknown';
                
                rawFixes.push({
                    file: path.resolve(process.cwd(), file),
                    line: lineNum,
                    typeName,
                    shouldBeTypeOnly: true
                });
            }
        }
    }

    console.log(`\n📊 Found ${rawFixes.length} type import issues to fix`);

    if (rawFixes.length === 0) {
        console.log('✅ No type import issues found!');
        return;
    }

    // Group by file - fix the type assertion
    const filesToFix = new Map<string, RawImportFix[]>();
    rawFixes.forEach(fix => {
        // Add type guard to ensure file is defined
        if (!fix.file) return;
        
        if (!filesToFix.has(fix.file)) {
            filesToFix.set(fix.file, []);
        }
        filesToFix.get(fix.file)!.push(fix);
    });

    // Process each file
    let totalFixed = 0;
    for (const [filePath, fixes] of filesToFix) {
        console.log(`\n📄 Processing: ${path.relative(process.cwd(), filePath)}`);
        
        if (!fs.existsSync(filePath)) {
            console.log(`   ⚠️ File not found, skipping`);
            continue;
        }

        // Create backup
        const backupPath = path.join(
            backupDir,
            `${path.basename(filePath)}-${Date.now()}.bak`
        );
        fs.copyFileSync(filePath, backupPath);
        console.log(`   📦 Backup created: ${backupPath}`);

        let content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let modified = false;

        // Sort fixes by line number (descending) to avoid line number shifting
        fixes.sort((a, b) => b.line - a.line);

        for (const fix of fixes) {
            if (fix.line < 1 || fix.line > lines.length) {
                console.log(`   ⚠️ Invalid line ${fix.line}, skipping`);
                continue;
            }

            const lineIndex = fix.line - 1;
            let line = lines[lineIndex];
            const originalLine = line;

            // Check what kind of import we have
            if (line.includes(`import {`)) {
                // Named import
                if (line.includes(`import { ${fix.typeName} }`)) {
                    // Change to type-only import
                    line = line.replace(
                        `import { ${fix.typeName} }`,
                        `import type { ${fix.typeName} }`
                    );
                } else if (line.includes(`import {`)) {
                    // Type is part of a list, need to separate
                    const importMatch = line.match(/import\s*{([^}]+)}/);
                    if (importMatch) {
                        const imports = importMatch[1].split(',').map((i: string) => i.trim());
                        const typeImports = imports.filter((i: string) => 
                            fixes.some(f => f.typeName === i) || 
                            i.toLowerCase().includes('type') ||
                            i === fix.typeName
                        );
                        const valueImports = imports.filter((i: string) => 
                            !typeImports.includes(i)
                        );

                        if (typeImports.length > 0 && valueImports.length > 0) {
                            // Need to split into two imports
                            const typeImportLine = `import type { ${typeImports.join(', ')} } from`;
                            const valueImportLine = `import { ${valueImports.join(', ')} } from`;
                            
                            // Extract the from clause
                            const fromMatch = line.match(/from\s+['"][^'"]+['"]/);
                            const fromClause = fromMatch ? fromMatch[0] : '';
                            
                            if (fromClause) {
                                lines[lineIndex] = `${typeImportLine} ${fromClause};`;
                                // Insert value import after type import
                                lines.splice(lineIndex + 1, 0, `${valueImportLine} ${fromClause};`);
                                modified = true;
                                totalFixed++;
                                console.log(`   ✅ Split imports for ${fix.typeName}`);
                            }
                        }
                    }
                }
            } else if (line.includes(`import * as`)) {
                // Namespace import - need to change whole import to type
                if (line.includes(`from`)) {
                    line = line.replace('import * as', 'import type * as');
                    lines[lineIndex] = line;
                    modified = true;
                    totalFixed++;
                    console.log(`   ✅ Changed namespace import to type-only`);
                }
            }

            if (line !== originalLine) {
                lines[lineIndex] = line;
                modified = true;
                totalFixed++;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            console.log(`   ✅ Fixed ${fixes.length} issues`);
        } else {
            console.log(`   ℹ️ No changes needed (already fixed?)`);
        }
    }

    console.log(`\n🎉 Fixed ${totalFixed} type import issues`);
    console.log(`📦 Backups saved in: ${backupDir}`);
    
    // Verify fixes
    console.log('\n🔍 Verifying fixes...');
    try {
        execSync('npx tsc --noEmit --isolatedModules --verbatimModuleSyntax', {
            stdio: 'inherit'
        });
        console.log('✅ All type import errors resolved!');
    } catch {
        console.log('⚠️ Some errors may remain. Run again or fix manually.');
    }
}



export async function detectImportFixes(): Promise<ImportFix[]> {
    const fixes: ImportFix[] = [];
    
    try {
        const output = execSync(
            'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
            { encoding: 'utf8' }
        );

        const lines = output.split('\n');
        
        for (const line of lines) {
            if (line.includes('is a type and must be imported using a type-only import')) {
                const fix = await parseImportError(line);
                if (fix) {
                    fixes.push(fix);
                }
            }
        }
        
        // Enhance with additional analysis - make sure the types match
        const enhancedFixes = await enhanceFixesWithContext(fixes as any);
        return enhancedFixes;
        
    } catch (error) {
        console.error('Error detecting import fixes:', error);
        return [];
    }
}


function generateNewLine(
    originalLine: string,
    typeName: string,
    fixType: ImportFix['fixType']
): string {
    switch (fixType) {
        case 'add-type-keyword':
            return generateTypeKeywordLine(originalLine, typeName);
        case 'split-import':
            return generateSplitImportLine(originalLine, typeName);
        case 'namespace-to-type':
            return generateNamespaceToTypeLine(originalLine);
        default:
            return originalLine; // No change
    }
}

function generateTypeKeywordLine(originalLine: string, typeName: string): string {
    // Example: "import { User, getUser } from './types';" 
    // becomes "import type { User } from './types';"
    
    // Extract the import parts
    const importMatch = originalLine.match(/^import\s+(?:(type\s+)?)?([^'"]+)\s+from\s+['"]([^'"]+)['"]/);
    if (!importMatch) return originalLine;
    
    const [, existingTypeKeyword, importClause, source] = importMatch;
    
    if (existingTypeKeyword) {
        // Already has type keyword, ensure typeName is included
        if (importClause.includes(`{`)) {
            // Extract imports inside braces
            const braceMatch = importClause.match(/\{([^}]+)\}/);
            if (braceMatch) {
                const imports = braceMatch[1].split(',').map(i => i.trim());
                if (!imports.includes(typeName)) {
                    // Add the missing type
                    const newImports = [...imports, typeName].sort();
                    return originalLine.replace(
                        /\{[^}]+\}/,
                        `{ ${newImports.join(', ')} }`
                    );
                }
            }
        }
        return originalLine; // Already correct
    }
    
    // Add type keyword before the import
    return originalLine.replace(/^import\s+/, 'import type ');
}

function generateSplitImportLine(originalLine: string, typeName: string): string {
    // Example: "import { User, getUser, getUsers } from './types';"
    // becomes:
    // "import type { User } from './types';"
    // "import { getUser, getUsers } from './types';"
    
    const importMatch = originalLine.match(/^import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
    if (!importMatch) return originalLine;
    
    const [, importItems, source] = importMatch;
    const items = importItems.split(',').map(item => item.trim());
    
    // Separate type and value imports based on naming conventions
    const typeImports: string[] = [];
    const valueImports: string[] = [];
    
    for (const item of items) {
        if (isLikelyTypeName(item)) {
            typeImports.push(item);
        } else {
            valueImports.push(item);
        }
    }
    
    // Ensure the specific typeName is in typeImports
    if (!typeImports.includes(typeName) && isLikelyTypeName(typeName)) {
        typeImports.push(typeName);
        // Remove from valueImports if it was mistakenly there
        const index = valueImports.indexOf(typeName);
        if (index > -1) {
            valueImports.splice(index, 1);
        }
    }
    
    // Generate new lines
    const lines: string[] = [];
    
    if (typeImports.length > 0) {
        lines.push(`import type { ${typeImports.sort().join(', ')} } from '${source}';`);
    }
    
    if (valueImports.length > 0) {
        lines.push(`import { ${valueImports.sort().join(', ')} } from '${source}';`);
    }
    
    return lines.join('\n');
}



function extractImportPath(originalLine: string): string {
    const fromMatch = originalLine.match(/from\s+['"]([^'"]+)['"]/);
    return fromMatch ? fromMatch[1] : '';
}

function getConfidenceLevel(confidenceScore: number): 'high' | 'medium' | 'low' {
    if (confidenceScore >= 80) return 'high';
    if (confidenceScore >= 60) return 'medium';
    return 'low';
}



function extractImports(originalLine: string): string[] {
    if (!originalLine.includes('{') || !originalLine.includes('}')) {
        return [];
    }
    
    const braceMatch = originalLine.match(/\{([^}]+)\}/);
    if (!braceMatch) return [];
    
    return braceMatch[1].split(',').map(item => item.trim());
}

function generateNamespaceToTypeLine(originalLine: string): string {
    // Example: "import * as Types from './types';"
    // becomes "import type * as Types from './types';"
    
    return originalLine.replace(/^import\s+\*/, 'import type *');
}

function isLikelyTypeName(name: string): boolean {
    // Heuristics for identifying likely type names
    const typePatterns = [
        /^[A-Z]/,                     // Starts with capital letter
        /(Type|Interface|Props|Config|Options|Settings)$/, // Common suffixes
        /^T[A-Z]/,                    // Generic type convention (T, TKey, TValue)
    ];
    
    const valuePatterns = [
        /^[a-z]/,                     // Starts with lowercase
        /^(get|set|is|has|create|update|delete)/, // Common function prefixes
        /^use[A-Z]/,                  // React hook convention
    ];
    
    const looksLikeType = typePatterns.some(pattern => pattern.test(name));
    const looksLikeValue = valuePatterns.some(pattern => pattern.test(name));
    
    // If it looks like a type and doesn't look like a value, it's probably a type
    return looksLikeType && !looksLikeValue;
}


async function parseImportError(errorLine: string): Promise<ImportFix | null> {
    // Extract file and line
    const fileMatch = errorLine.match(/(.*\.(?:ts|tsx)):(\d+):/);
    if (!fileMatch) return null;
    
    const [, filePath, lineStr] = fileMatch;
    const lineNumber = parseInt(lineStr);
    
    // Extract type name
    const typeMatch = errorLine.match(/'(.*)' is a type/);
    const typeName = typeMatch ? typeMatch[1] : 'unknown';
    
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const originalLine = lines[lineNumber - 1]?.trim() || '';
    
    // Determine fix type
    const fixType = determineFixType(originalLine, typeName) || 'add-type-keyword';

    // Generate new line
    const newLine = generateNewLine(originalLine, typeName, fixType);
    

    // Calculate confidence
    const confidenceScore = calculateConfidence(originalLine, typeName, fixType);
    
    // Create the fix object with all required properties
    const fix: ImportFix = {
        filePath,
        originalLine,
        newLine,
        missingTypes: [typeName],
        targetImportPath: extractImportPath(originalLine),
        reason: `Type '${typeName}' must be imported with type-only import`,
        confidence: getConfidenceLevel(confidenceScore),
        confidenceScore,
        lineNumber, // Make sure this is always a number
        fixType,
        createdAt: new Date(),
        status: 'pending',
        fixId: `fix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        autoFixable: confidenceScore > 70
    } as ImportFix; // Type assertion to satisfy the union type
    
    return fix;
}

function determineFixType(originalLine: string, typeName: string): ImportFix['fixType'] {
    if (originalLine.includes('import * as')) {
        return 'namespace-to-type';
    }
    
    if (originalLine.includes('{') && originalLine.includes('}')) {
        // Check if there are both types and values
        const imports = extractImports(originalLine);
        const hasValues = imports.some(imp => 
            !isLikelyTypeName(imp) && imp !== typeName
        );
        
        if (hasValues) {
            return 'split-import';
        }
    }
    
    return 'add-type-keyword';
}

function calculateConfidence(originalLine: string, typeName: string, fixType: string): number {
    let score = 50; // Base score
    
    // Higher confidence for simple adds
    if (fixType === 'add-type-keyword') score += 30;
    
    // Type name patterns increase confidence
    if (/^[A-Z]/.test(typeName)) score += 10;
    if (typeName.endsWith('Type') || typeName.endsWith('Props')) score += 15;
    
    // Clear import patterns
    if (originalLine.includes('from')) score += 5;
    
    return Math.min(100, score);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  detectAndFixTypeImports().catch(console.error);
}


// ES module entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', getErrorMessage(error));
    process.exit(1);
  });
}


export { detectAndFixTypeImports };
