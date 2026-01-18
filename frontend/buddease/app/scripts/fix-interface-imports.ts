#!/usr/bin/env tsx
// fix-interface-imports.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { FixResult } from '@/app/scripts/import-utils'
import  {  
  fixImportStatement, 
  findInterfaceExports,
  createBackup, 
  groupFixesByFile, 
  sortFixesDescending, 
  getContextTips,
  applyFixes as applyFixesShared ,
 } from '@/app/scripts/import-utils'
import { shouldBeTypeImport as originalShouldBeTypeImport } from '@/app/scripts/import-utils';

 import { RuntimeDetector } from '@/utils/runtime-detector'

 function escapeForShell(str: string): string {
  return str
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`')
    .replace(/\"/g, '\\"')
    .replace(/\'/g, "\\'")
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

function escapeForGrep(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\$/g, '\\$')
    .replace(/\./g, '\\.')
    .replace(/\*/g, '\\*')
    .replace(/\?/g, '\\?')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

const shouldBeTypeImportCache = new Map<string, boolean>();

function shouldBeTypeImportCached(importName: string, allImports?: string[]): boolean {
  const cacheKey = allImports ? `${importName}:${allImports.join(',')}` : importName;
  
  if (shouldBeTypeImportCache.has(cacheKey)) {
    return shouldBeTypeImportCache.get(cacheKey)!;
  }
  
  // ADD SPECIAL CASES FOR SPECIFIC MODULES
  if (importName === 'BrandingSettings') {
    // BrandingSettings should ONLY be imported as type from BrandingSettings.ts
    // NOT as a default import from BrandingService
    console.log(`⚠️  Special case: ${importName} should be imported from BrandingSettings.ts`);
    // Return false to avoid converting this specific import
    // OR you could return true and handle it differently
    shouldBeTypeImportCache.set(cacheKey, false);
    return false;
  }
  
  const result = originalShouldBeTypeImport(importName, allImports);
  shouldBeTypeImportCache.set(cacheKey, result);
  
  return result;
}


async function fixSimpleTypeImports(filePath: string): Promise<FixResult[]> {
    console.log(`🔍 Fixing simple type imports in: ${filePath}`);
    
    const fixes: FixResult[] = [];
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;
            
            // Skip if already has import type
            if (line.includes('import type')) continue;
            
            // Check for simple named imports
            const namedMatch = line.match(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
            if (namedMatch) {
                const [, importsStr, source] = namedMatch;
                const imports = importsStr.split(',').map(i => i.trim()).filter(Boolean);
                
                // Check if ALL imports in this statement should be type imports
                const allShouldBeType = imports.every(imp => originalShouldBeTypeImport(imp, imports));
                
                if (allShouldBeType) {
                    const fixedImport = line.replace('import {', 'import type {');
                    fixes.push({
                        file: filePath,
                        original: line.trim(),
                        fixed: fixedImport.trim(),
                        success: true,
                        line: lineNum
                    });
                    
                    console.log(`✅ Line ${lineNum}: All imports are types`);
                    console.log(`   ${line.trim()}`);
                    console.log(`   → ${fixedImport.trim()}\n`);
                }
            }
        }
        
        return fixes;
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return [];
    }
}
// Add this function to verify exports before making changes
async function verifyCoreTypeImportsWithExportCheck(): Promise<void> {
  console.log('🔍 VERIFYING core module exports to ensure correct type imports...\n');
  
  // List of files that showed questionable changes
  const questionableImports = [
    {
      file: 'src/core/state/stores/HistoryStore.ts',
      imports: ['baseStore'],
      reason: 'baseStore might be a runtime export (store instance)'
    },
    {
      file: 'src/core/users/userJourney/IdeaCreationPhase.ts',
      imports: ['IdeaCreationPhase'],
      reason: 'Default export might be a component or class'
    },
    {
      file: 'src/core/generators/corrections/analyzers/UsageAnalyzer.ts',
      imports: ['getUsageData', 'analyzeTypeContext', 'isMethodUsage'],
      reason: 'These are likely runtime functions'
    }
  ];
  
  console.log('📋 Checking questionable imports:\n');
  
  for (const { file, imports, reason } of questionableImports) {
    console.log(`🔍 ${file}:`);
    console.log(`   ⚠️  ${reason}`);
    
    try {
      const fullPath = path.resolve(process.cwd(), file);
      if (!fs.existsSync(fullPath)) {
        console.log(`   ❌ File not found: ${file}`);
        continue;
      }
      
      const content = fs.readFileSync(fullPath, 'utf8');
      const sourceFile = ts.createSourceFile(
        file,
        content,
        ts.ScriptTarget.Latest,
        true
      );
      
      // Analyze exports
      const exports = this.analyzeExports(sourceFile);
      
      console.log(`   📊 Exports found:`);
      exports.forEach(exportInfo => {
        const isTypeOnly = exportInfo.isTypeOnly ? '(type-only)' : '(runtime)';
        console.log(`      - ${exportInfo.name} ${isTypeOnly}`);
        if (imports.includes(exportInfo.name)) {
          console.log(`        ^ This is marked as ${exportInfo.isTypeOnly ? 'type-only' : 'runtime'}`);
        }
      });
      
    } catch (error: any) {
      console.log(`   ❌ Error analyzing ${file}: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('💡 RECOMMENDATION: Update the fix-interface-imports script to:');
  console.log('   1. Check actual exports from source files');
  console.log('   2. Distinguish between type-only and runtime exports');
  console.log('   3. Only convert imports that are truly type-only');
}

// Helper function to analyze exports from a file
function analyzeExports(sourceFile: ts.SourceFile): Array<{
  name: string;
  isTypeOnly: boolean;
  exportType: 'interface' | 'type' | 'class' | 'function' | 'variable' | 'default';
}> {
  const exports: Array<{
    name: string;
    isTypeOnly: boolean;
    exportType: string;
  }> = [];
  
  const visit = (node: ts.Node) => {
    // Check export type
    let isTypeOnly = false;
    let name = '';
    let exportType = '';
    
    // Interface exports (always type-only)
    if (ts.isInterfaceDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      isTypeOnly = true;
      name = node.name.text;
      exportType = 'interface';
    }
    
    // Type alias exports (always type-only)
    else if (ts.isTypeAliasDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      isTypeOnly = true;
      name = node.name.text;
      exportType = 'type';
    }
    
    // Class exports (runtime - NOT type-only unless imported for type checking)
    else if (ts.isClassDeclaration(node) && node.name && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      isTypeOnly = false; // Classes can be used as types but are also runtime
      name = node.name.text;
      exportType = 'class';
    }
    
    // Function exports (runtime)
    else if (ts.isFunctionDeclaration(node) && node.name && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      isTypeOnly = false;
      name = node.name.text;
      exportType = 'function';
    }
    
    // Variable exports (runtime)
    else if (ts.isVariableStatement(node)) {
      const hasExport = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
      if (hasExport) {
        ts.forEachChild(node, (child) => {
          if (ts.isVariableDeclaration(child) && child.name && ts.isIdentifier(child.name)) {
            isTypeOnly = false; // Variables are runtime
            name = child.name.text;
            exportType = 'variable';
          }
        });
      }
    }
    
    // Export declarations (export { ... })
    else if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach(element => {
          name = element.name.text;
          
          // Try to determine if this is a type-only export
          // Look for export type { ... } syntax
          isTypeOnly = node.isTypeOnly || false;
          exportType = 'named';
        });
      }
    }
    
    if (name && exportType) {
      exports.push({ name, isTypeOnly, exportType });
    }
    
    ts.forEachChild(node, visit);
  };
  
  visit(sourceFile);
  return exports;
}


async function focusOnTarget(target: string) {
  console.log(`🎯 Focusing on: ${target}\n`);
  
  // First, try to find the file using our smarter finder
  let fullPath = findFileInProject(target);
  
  if (!fullPath) {
    console.error(`❌ Target not found: ${target}`);
    console.log(`   Current directory: ${process.cwd()}`);
    console.log(`💡 Try these commands instead:`);
    console.log(`   • pnpm fix:interface-imports:target src/path/to/${target}`);
    console.log(`   • pnpm fix:interface-imports:analyze src/path/to/${target}`);
    console.log(`   • Use the full relative path`);
    
    // Suggest based on common patterns
    if (target.includes('.')) {
      const baseName = target.replace(/\.[^.]+$/, '');
      console.log(`\n🔍 Common locations to check:`);
      console.log(`   • src/${baseName}.tsx`);
      console.log(`   • src/components/${baseName}.tsx`);
      console.log(`   • src/pages/${baseName}.tsx`);
      console.log(`   • src/core/${baseName}.tsx`);
    }
    return;
  }
  
  console.log(`📁 Found: ${path.relative(process.cwd(), fullPath)}`);
  
  const stats = fs.statSync(fullPath);
  
  if (stats.isDirectory()) {
    await analyzeDirectory(fullPath);
  } else if (stats.isFile()) {
    await analyzeImportsInTargetFile(fullPath);
  } else {
    console.error(`❌ Target is neither file nor directory: ${target}`);
  }
}

function findFileInProject(fileName: string): string | null {
  console.log(`🔍 Searching for: ${fileName}`);
  
  // Extract base name and extension
  const baseName = path.basename(fileName, path.extname(fileName));
  const ext = path.extname(fileName);
  const hasExtension = ext !== '';
  
  // Common directories to search
  const searchDirs = [
    '.',           // current directory
    'src',
    'app',
    'lib',
    'components',
    'pages',
    'utils',
    'types',
    'models',
    'core',
    'src/core',
    'src/components',
    'src/pages',
    'src/utils',
    'src/types',
    'src/models',
    'app/components',
    'app/pages',
  ];
  
  // Try extensions in order of likelihood
  const extensions = hasExtension 
    ? [ext]  // Use provided extension
    : ['.tsx', '.ts', '.jsx', '.js'];  // Try common extensions
  
  // Build list of paths to check
  const pathsToCheck: string[] = [];
  
  for (const dir of searchDirs) {
    for (const extension of extensions) {
      // With original filename structure
      if (hasExtension) {
        pathsToCheck.push(path.resolve(process.cwd(), dir, fileName));
      }
      
      // With baseName + extension
      pathsToCheck.push(path.resolve(process.cwd(), dir, baseName + extension));
      
      // Also try with nested wildcards for common patterns
      if (dir.includes('src') || dir.includes('app')) {
        // Try in subdirectories
        const nestedPaths = [
          `${dir}/**/${baseName}${extension}`,
          `${dir}/*/${baseName}${extension}`,
          `${dir}/*/*/${baseName}${extension}`,
        ];
        nestedPaths.forEach(np => {
          pathsToCheck.push(path.resolve(process.cwd(), np));
        });
      }
    }
  }
  
  // Check each path
  for (const testPath of pathsToCheck) {
    // Handle wildcard paths
    if (testPath.includes('*')) {
      try {
        const findPattern = testPath.replace(process.cwd() + '/', './');
        const findCmd = `find . -path "${findPattern}" -type f 2>/dev/null | head -1`;
        const found = execSync(findCmd, { encoding: 'utf8' }).trim();
        if (found) {
          const resolvedPath = path.resolve(process.cwd(), found);
          console.log(`✅ Found via pattern: ${path.relative(process.cwd(), resolvedPath)}`);
          return resolvedPath;
        }
      } catch {
        continue;
      }
    } else if (fs.existsSync(testPath)) {
      console.log(`✅ Found at: ${path.relative(process.cwd(), testPath)}`);
      return testPath;
    }
  }
  
  // Final attempt: recursive search
  try {
    console.log(`🔍 Doing recursive search...`);
    
    // Build search pattern
    let searchPattern = baseName;
    if (hasExtension) {
      searchPattern = fileName;
    }
    
    const findCmd = `find . -type f -name "*${searchPattern}*" 2>/dev/null | grep -v node_modules | grep -v ".spec" | grep -v ".test" | grep -E "\\.(ts|tsx|js|jsx)$" | head -10`;
    
    const found = execSync(findCmd, { encoding: 'utf8' })
      .split('\n')
      .filter(f => f.trim())
      .map(f => path.resolve(process.cwd(), f.trim()));
    
    if (found.length > 0) {
      // Try to find the best match
      const bestMatch = found.find(f => 
        f.includes(`/${baseName}.`) || 
        path.basename(f) === fileName ||
        path.basename(f, path.extname(f)) === baseName
      ) || found[0];
      
      console.log(`✅ Found via recursive search: ${path.relative(process.cwd(), bestMatch)}`);
      return bestMatch;
    }
  } catch (error) {
    console.log(`🔍 Recursive search failed: ${error.message}`);
  }
  
  return null;
}

async function analyzeImportsInTargetFile(filePath: string): Promise<void> {
  console.log(`📄 Analyzing imports in: ${filePath}\n`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fileName = path.basename(filePath, path.extname(filePath));
    
    const fixes: FixResult[] = [];
    
    // Step 1: Find all imports in the file
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Skip if already has import type
      if (line.includes('import type')) continue;
      
      // Check if this is an import statement
      if (line.trim().startsWith('import ')) {
        // Parse the import
        const importMatch = line.match(/^import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
        
        if (importMatch) {
          const [, importNamesStr, sourcePath] = importMatch;
          const importNames = importNamesStr.split(',').map(name => name.trim());
          
          // NEW: Check each import by examining the source file
          const typeOnlyImports: string[] = [];
          const runtimeImports: string[] = [];
          
          for (const importName of importNames) {
            const shouldBeType = await shouldBeTypeImportWithSourceCheck(importName, sourcePath);
            if (shouldBeType) {
              typeOnlyImports.push(importName);
            } else {
              runtimeImports.push(importName);
            }
          }
          
          // If ALL imports are type-only, convert the whole import
          if (typeOnlyImports.length === importNames.length) {
            const fixedImport = line.replace('import {', 'import type {');
            fixes.push({
              file: filePath,
              original: line.trim(),
              fixed: fixedImport.trim(),
              success: true,
              line: lineNumber
            });
            
            console.log(`✅ Line ${lineNumber}: Whole import should be type-only`);
            console.log(`   ${line.trim()}`);
            console.log(`   → ${fixedImport.trim()}\n`);
          }
          // If mixed imports (some type, some runtime), we need to split
          else if (typeOnlyImports.length > 0) {
            console.log(`⚠️  Line ${lineNumber}: Mixed imports need splitting`);
            console.log(`   ${line.trim()}`);
            console.log(`   Type-only: ${typeOnlyImports.join(', ')}`);
            console.log(`   Runtime: ${runtimeImports.join(', ')}`);
            
            // Create separate imports
            if (typeOnlyImports.length > 0) {
              const typeImport = `import type { ${typeOnlyImports.join(', ')} } from '${sourcePath}'`;
              console.log(`   Add: ${typeImport}`);
            }
            if (runtimeImports.length > 0) {
              const runtimeImport = `import { ${runtimeImports.join(', ')} } from '${sourcePath}'`;
              console.log(`   Keep: ${runtimeImport}`);
            }
            console.log('');
          }
        }
        // Also check for default imports
        else if (line.match(/^import\s+(?:type\s+)?(\w+)\s+from\s+['"]([^'"]+)['"]/)) {
          const defaultMatch = line.match(/^import\s+(?:type\s+)?(\w+)\s+from\s+['"]([^'"]+)['"]/);
          if (defaultMatch) {
            const [, importName, sourcePath] = defaultMatch;
            
            // NEW: Check the source file for default exports
            const shouldBeType = await shouldBeTypeImportWithSourceCheck(importName, sourcePath, true);
            
            if (shouldBeType) {
              const fixedImport = line.replace('import ', 'import type ');
              fixes.push({
                file: filePath,
                original: line.trim(),
                fixed: fixedImport.trim(),
                success: true,
                line: lineNumber
              });
              
              console.log(`✅ Line ${lineNumber}: Default import should be type-only`);
              console.log(`   ${line.trim()}`);
              console.log(`   → ${fixedImport.trim()}\n`);
            }
          }
        }
      }
    }
    
    // Rest of the function remains the same...
    // Step 2: Apply fixes if any
    if (fixes.length > 0) {
      console.log(`📊 Found ${fixes.length} import(s) to fix\n`);
      
      // Show preview
      console.log('🔧 PREVIEW OF CHANGES:');
      console.log('═'.repeat(80));
      
      fixes.forEach(fix => {
        const relativePath = path.relative(process.cwd(), fix.file);
        console.log(`${relativePath}:${fix.line}`);
        console.log(`  ❌ ${fix.original}`);
        console.log(`  ✅ ${fix.fixed}\n`);
      });
      
      // Ask for confirmation
      console.log('🚀 Apply these fixes? (y/n)');
      const confirmed = await promptConfirmation();
      
      if (confirmed) {
        console.log('\n🔧 Applying fixes...');
        // Use the local function that you know works
        await applyFixesLocal(fixes);
        
        console.log('\n✅ Fixes applied successfully!');
        
        // Verify the fix was actually applied
        console.log('\n🔍 Verifying changes...');
        const updatedContent = fs.readFileSync(filePath, 'utf8');
        const updatedLines = updatedContent.split('\n');
        
        // Check line 7 specifically
        if (updatedLines.length >= 7) {
          const line7 = updatedLines[6]; // 0-based index
          console.log(`Line 7 after fix: ${line7}`);
          
          if (line7.includes('import type BrandingSettings')) {
            console.log('✅ Verified: Line 7 now has "import type"');
          } else {
            console.log('❌ ERROR: Line 7 still does not have "import type"');
            console.log(`   Found: ${line7}`);
          }
        }
      } else {
        console.log('\n❌ Fixes not applied');
      }
    } else {
      console.log('✅ All imports are already correct!\n');
    }
    
  } catch (error: any) {
    console.error(`❌ Error analyzing ${filePath}:`, error.message);
  }
}


async function shouldBeTypeImportWithExportCheck(importName: string, sourcePath: string): Promise<boolean> {
    // First, check if the export even exists
    const resolvedPath = await resolveSourcePath(sourcePath);
    if (!resolvedPath) {
        console.log(`   ⚠️  Cannot find source file: ${sourcePath}`);
        return shouldBeTypeImport(importName, [importName]); // Fallback
    }
    
    try {
        const sourceContent = fs.readFileSync(resolvedPath, 'utf8');
        
        // Check if export exists
        const exportPatterns = [
            new RegExp(`export\\s+(?:const|let|var|function|class)\\s+${importName}\\b`),
            new RegExp(`export\\s+default\\s+${importName}\\b`),
            new RegExp(`export\\s*\\{[^}]*\\b${importName}\\b[^}]*\\}`),
        ];
        
        const exists = exportPatterns.some(pattern => pattern.test(sourceContent));
        if (!exists) {
            console.log(`   ⚠️  ${importName} not found in ${sourcePath}`);
            return false; // Don't try to fix non-existent imports
        }
        
        // Then check if it should be a type import
        return shouldBeTypeImport(importName, [importName]);
        
    } catch (error) {
        return shouldBeTypeImport(importName, [importName]); // Fallback
    }
}


// Check source file to determine if import should be type-only
async function shouldBeTypeImportWithSourceCheck(
  importName: string, 
  sourcePath: string, 
  isDefaultImport: boolean = false
): Promise<boolean> {
  // First, resolve the source path to an actual file
  let resolvedPath = sourcePath;
  
  // Handle module paths starting with @/
  if (sourcePath.startsWith('@/')) {
    resolvedPath = sourcePath.replace('@/', 'src/');
  }
  
  // Try different extensions
  const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', ''];
  let actualFile: string | null = null;
  
  for (const ext of possibleExtensions) {
    const testPath = path.resolve(process.cwd(), `${resolvedPath}${ext}`);
    if (fs.existsSync(testPath)) {
      actualFile = testPath;
      break;
    }
    // Also try with /index
    const indexPath = path.resolve(process.cwd(), `${resolvedPath}/index${ext}`);
    if (fs.existsSync(indexPath)) {
      actualFile = indexPath;
      break;
    }
  }
  
  if (!actualFile) {
    console.log(`   ⚠️  Could not find source file: ${sourcePath}`);
    // Fall back to pattern matching
    return shouldBeTypeImportCached(importName, [importName]);
  }
  
  try {
    const sourceContent = fs.readFileSync(actualFile, 'utf8');
    
    if (isDefaultImport) {
      // Check if default export is a type
      return isDefaultExportAType(sourceContent, importName);
    } else {
      // Check if named export is a type
      return isNamedExportAType(sourceContent, importName);
    }
    
  } catch (error) {
    console.log(`   ⚠️  Error reading source file ${actualFile}: ${error}`);
    // Fall back to pattern matching
    return shouldBeTypeImportCached(importName, [importName]);
  }
}

// NEW FUNCTION: Check if default export is a type
function isDefaultExportAType(sourceContent: string, importName: string): boolean {
  // Look for default exports that are types
  const lines = sourceContent.split('\n');
  
  for (const line of lines) {
    // Check for default interface export
    if (line.includes('export default interface') && line.includes(importName)) {
      return true;
    }
    
    // Check for default type export
    if (line.includes('export default type') && line.includes(importName)) {
      return true;
    }
    
    // Check for export default { something } where something is a type
    if (line.includes('export default') && line.includes(importName)) {
      // Check what's being exported
      const beforeExport = sourceContent.substring(0, sourceContent.indexOf(line));
      
      // Look for interface or type declaration before the export
      if (beforeExport.includes(`interface ${importName}`) || 
          beforeExport.includes(`type ${importName}`)) {
        return true;
      }
    }
  }
  
  // If we can't determine, use pattern matching
  return shouldBeTypeImportCached(importName, [importName]);
}

// NEW FUNCTION: Check if named export is a type
function isNamedExportAType(sourceContent: string, exportName: string): boolean {
  // Look for type-only exports
  const patterns = [
    // export interface {name}
    new RegExp(`export\\s+interface\\s+${exportName}\\b`),
    // export type {name}
    new RegExp(`export\\s+type\\s+${exportName}\\b`),
    // export type { name }
    new RegExp(`export\\s+type\\s*{[^}]*\\b${exportName}\\b[^}]*}`),
    // export { type name }
    new RegExp(`export\\s*{[^}]*type\\s+${exportName}\\b[^}]*}`),
  ];
  
  for (const pattern of patterns) {
    if (pattern.test(sourceContent)) {
      return true;
    }
  }
  
  // Look for regular exports that might be runtime
  const runtimePatterns = [
    // export function {name}
    new RegExp(`export\\s+function\\s+${exportName}\\b`),
    // export class {name}
    new RegExp(`export\\s+class\\s+${exportName}\\b`),
    // export const/let/var {name}
    new RegExp(`export\\s+(?:const|let|var)\\s+${exportName}\\b`),
    // export { name } (not type)
    new RegExp(`export\\s*{[^}]*\\b${exportName}\\b[^}]*}`),
  ];
  
  for (const pattern of runtimePatterns) {
    if (pattern.test(sourceContent)) {
      return false; // This is a runtime export
    }
  }
  
  // If we can't determine, use pattern matching
  return shouldBeTypeImportCached(exportName, [exportName]);
}


async function fixAllInterfaceImports() {
  console.log('🔍 Finding ALL interface imports that need fixing...\n');
  
  // Step 1: Find all files that export interfaces
  console.log('1. Finding all interface exports...');
  const interfaceFiles = findInterfaceExports();
  console.log(`   Found ${interfaceFiles.length} files with interface exports\n`);
  
  // Step 2: For each interface, find imports that need fixing
  const allFixes: FixResult[] = [];
  
  for (const interfaceFile of interfaceFiles) {
    const fixes = await findAndFixInterfaceImports(interfaceFile);
    allFixes.push(...fixes);
  }
  
  // Step 3: Show summary
  console.log('\n📊 SUMMARY:');
  console.log(`   Total interface files: ${interfaceFiles.length}`);
  console.log(`   Total fixes needed: ${allFixes.length}`);
  
  const successfulFixes = allFixes.filter(f => f.success);
  console.log(`   Successfully fixed: ${successfulFixes.length}`);
  
  // Step 4: Ask to apply fixes
  if (allFixes.length > 0) {
    console.log('\n🚀 Apply all fixes? (y/n)');
    const confirmed = await promptConfirmation();
    
    if (confirmed) {
      console.log('\n🔧 Applying fixes...');
      applyFixesShared(allFixes);
    } else {
      console.log('\n❌ Cancelled');
    }
  } else {
    console.log('\n✅ No interface import fixes needed!');
  }
}


async function findAndFixInterfaceImports(interfaceFile: {file: string; interfaces: string[]}): Promise<FixResult[]> {
  const fixes: FixResult[] = [];
  const fileName = path.basename(interfaceFile.file, path.extname(interfaceFile.file));
  
  for (const interfaceName of interfaceFile.interfaces) {
    console.log(`   Checking ${interfaceName} from ${fileName}`);
    
    // Skip problematic interface names
    if (interfaceName.includes('${')) {
      console.log(`   ⚠️  Skipping ${interfaceName} - contains shell expansion characters`);
      continue;
    }
    
    // Escape the interface name
    const escapedInterfaceName = escapeForShell(interfaceName);
    const escapedFileName = escapeForShell(fileName);
    
    // Use a simpler, more reliable approach
    const findCmd = `grep -rn "import.*from.*${escapedFileName}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "import type" | grep "${escapedInterfaceName}" || true`;
    
    try {
      const output = execSync(findCmd, { encoding: 'utf8' });
      const importLines = output.split('\n').filter(line => {
        const trimmed = line.trim();
        return trimmed && 
               trimmed.includes('import') && 
               trimmed.includes(interfaceName) &&
               !trimmed.includes('import type');
      });
      
      for (const importLine of importLines) {
        const match = importLine.match(/^(.*?):(\d+):(.*)$/);
        if (!match) continue;
        
        const [, filePath, lineNumStr, originalImport] = match;
        const lineNum = parseInt(lineNumStr) || 1;
        
        if (!filePath || !originalImport) continue;
        
        // Create the fixed import
        let fixedImport = originalImport;
        if (originalImport.startsWith('import {')) {
          fixedImport = originalImport.replace('import {', 'import type {');
        } else if (originalImport.startsWith(`import ${interfaceName} from`)) {
          console.log(`   ⚠️  ${interfaceName} has default import - manual check needed in ${filePath}`);
          continue;
        }
        
        fixes.push({
          file: filePath,
          original: originalImport.trim(),
          fixed: fixedImport.trim(),
          success: true,
          line: lineNum
        });
        
        console.log(`     - ${path.basename(filePath)}:${lineNum}: ${originalImport} → ${fixedImport}`);
      }
    } catch (error: any) {
      if (error.status !== 1) {
        console.warn(`   Warning: Error searching for ${interfaceName}:`, error.message);
      }
    }
  }
  
  return fixes;
}

// Also add a quick fix for DataStore specifically
async function quickFixDataStore() {
  console.log('🚀 Quick-fixing DataStore imports...\n');
  
  // Find all DataStore imports that aren't using import type
  const findCmd = `grep -rn "import.*DataStore.*from.*DataStore" src/ --include="*.ts" --include="*.tsx" | grep -v "import type"`;
  const output = execSync(findCmd, { encoding: 'utf8' });
  
  const imports = output.split('\n').filter(Boolean);
  console.log(`Found ${imports.length} DataStore imports to fix\n`);
  
  const fixes: FixResult[] = [];
  
  for (const importLine of imports) {
    const [filePath, ...rest] = importLine.split(':');
    const originalImport = rest.join(':').replace(/^\d+:/, '').trim();
    
    if (!filePath || !originalImport) continue;
    
    // Fix the import
    let fixedImport = originalImport;
    if (originalImport.includes('import {') && originalImport.includes('DataStore')) {
      fixedImport = originalImport.replace('import {', 'import type {');
    }
    
    fixes.push({
      file: filePath,
      original: originalImport,
      fixed: fixedImport,
      success: true
    });
    
    console.log(`   ${path.basename(filePath)}: ${originalImport} → ${fixedImport}`);
  }
  
  if (fixes.length > 0) {
    console.log('\n🚀 Apply DataStore fixes? (y/n)');
    const confirmed = await promptConfirmation();
    
    if (confirmed) {
      applyFixesShared(fixes);
    }
  }
}

// Add missing functions that were called but not defined
async function previewInterfaceFixes(args: string[]) {
  console.log('🔍 PREVIEW MODE - Showing what would be fixed\n');
  
  const interfaceFiles = findInterfaceExports();
  console.log(`Found ${interfaceFiles.length} interface files\n`);
  
  const allChanges: Array<{
    interfaceFile: string;
    interfaceName: string;
    importFile: string;
    originalImport: string;
    fixedImport: string;
    lineNumber: number;
  }> = [];
  
  // Limit preview to avoid overwhelming output
  const previewLimit = Math.min(interfaceFiles.length, 10);
  
  for (const interfaceFile of interfaceFiles.slice(0, previewLimit)) {
    const fileName = path.basename(interfaceFile.file, path.extname(interfaceFile.file));
    console.log(`📁 ${fileName}:`);
    
    for (const interfaceName of interfaceFile.interfaces.slice(0, 5)) { // Limit interfaces per file
      // FIXED: Use escaped quotes in the grep pattern
      // Find imports of this interface from this specific file
      const findCmd = `grep -rn "import.*${interfaceName}.*from.*${fileName}" src/ --include="*.ts" --include="*.tsx" | grep -v "import type" | head -5`;
      
      try {
        const output = execSync(findCmd, { encoding: 'utf8' });
        const imports = output.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed && 
                 trimmed.includes('import') && 
                 trimmed.includes(interfaceName) &&
                 trimmed.includes(fileName) &&
                 !trimmed.includes('import type');
        });
        
        if (imports.length > 0) {
          console.log(`   ${interfaceName}: ${imports.length} imports would be fixed`);
          
          // Collect details for each import
          for (const importLine of imports) {
            const [filePath, lineNumStr, ...rest] = importLine.split(':');
            const lineNum = parseInt(lineNumStr) || 1;
            const originalImport = rest.join(':').trim();
            
            if (!originalImport) continue;
            
            // Create the fixed import
            let fixedImport = originalImport;
            if (originalImport.startsWith('import {')) {
              fixedImport = originalImport.replace('import {', 'import type {');
            } else if (originalImport.startsWith(`import ${interfaceName} from`)) {
              // Handle default imports
              fixedImport = originalImport.replace('import ', 'import type ');
            }
            
            allChanges.push({
              interfaceFile: interfaceFile.file,
              interfaceName,
              importFile: filePath,
              originalImport,
              fixedImport,
              lineNumber: lineNum
            });
          }
        }
      } catch (error) {
        // If grep finds no matches, it returns exit code 1 - that's okay
        if ((error as any).status !== 1) {
          console.warn(`   Warning: Error searching for ${interfaceName}:`, (error as Error).message);
        }
      }
    }
  }
  
  // Generate detailed report file
  if (allChanges.length > 0) {
    const reportDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `interface-import-fixes-${timestamp}.md`);
    
    // Create detailed markdown report
    let reportContent = `# Interface Import Fixes Preview\n\n`;
    reportContent += `**Generated:** ${new Date().toISOString()}\n`;
    reportContent += `**Total fixes found:** ${allChanges.length}\n`;
    reportContent += `**Interface files analyzed:** ${previewLimit} of ${interfaceFiles.length}\n\n`;
    reportContent += `> **Note:** This is a preview only. No changes have been made.\n\n`;
    
    // Group by interface file
    const groupedByInterfaceFile: Record<string, typeof allChanges> = {};
    allChanges.forEach(change => {
      if (!groupedByInterfaceFile[change.interfaceFile]) {
        groupedByInterfaceFile[change.interfaceFile] = [];
      }
      groupedByInterfaceFile[change.interfaceFile].push(change);
    });
    
    for (const [interfaceFile, changes] of Object.entries(groupedByInterfaceFile)) {
      const fileName = path.basename(interfaceFile, path.extname(interfaceFile));
      const relativeInterfacePath = path.relative(process.cwd(), interfaceFile);
      reportContent += `## ${fileName}\n`;
      reportContent += `**Source file:** \`${relativeInterfacePath}\`\n\n`;
      
      // Group by interface name
      const groupedByInterface: Record<string, typeof changes> = {};
      changes.forEach(change => {
        if (!groupedByInterface[change.interfaceName]) {
          groupedByInterface[change.interfaceName] = [];
        }
        groupedByInterface[change.interfaceName].push(change);
      });
      
      for (const [interfaceName, interfaceChanges] of Object.entries(groupedByInterface)) {
        reportContent += `### ${interfaceName}\n`;
        reportContent += `**Imports to fix:** ${interfaceChanges.length}\n\n`;
        
        // Table of changes
        reportContent += `| Import File | Line | Original | Fixed |\n`;
        reportContent += `|-------------|------|----------|-------|\n`;
        
        interfaceChanges.forEach(change => {
          const relativePath = path.relative(process.cwd(), change.importFile);
          reportContent += `| \`${relativePath}\` | ${change.lineNumber} | \`${change.originalImport}\` | \`${change.fixedImport}\` |\n`;
        });
        
        reportContent += '\n';
      }
    }
    
    // Add summary table
    reportContent += `## Summary\n\n`;
    reportContent += `| Interface | Source File | Import Count |\n`;
    reportContent += `|-----------|-------------|--------------|\n`;
    
    const summary: Record<string, {file: string; count: number}> = {};
    allChanges.forEach(change => {
      const key = `${change.interfaceName}:${change.interfaceFile}`;
      if (!summary[key]) {
        summary[key] = { file: change.interfaceFile, count: 0 };
      }
      summary[key].count++;
    });
    
    Object.entries(summary).forEach(([key, data]) => {
      const [interfaceName] = key.split(':');
      const fileName = path.basename(data.file, path.extname(data.file));
      reportContent += `| ${interfaceName} | ${fileName} | ${data.count} |\n`;
    });
    
    // Save the report
    fs.writeFileSync(reportFile, reportContent, 'utf8');
    console.log(`\n📊 Detailed report saved to: ${reportFile}`);
    
    // Also create a simple text summary
    const summaryFile = path.join(reportDir, `interface-import-summary-${timestamp}.txt`);
    let summaryContent = `INTERFACE IMPORT FIXES SUMMARY\n`;
    summaryContent += `Generated: ${new Date().toISOString()}\n`;
    summaryContent += `Total fixes needed: ${allChanges.length}\n\n`;
    
    Object.entries(summary).forEach(([key, data]) => {
      const [interfaceName] = key.split(':');
      const fileName = path.basename(data.file, path.extname(data.file));
      summaryContent += `${interfaceName} (from ${fileName}): ${data.count} imports\n`;
    });
    
    fs.writeFileSync(summaryFile, summaryContent, 'utf8');
    console.log(`📋 Summary saved to: ${summaryFile}`);
    
    // Show quick summary in console
    console.log(`\n📊 Quick Summary:`);
    console.log(`├─ Total fixes found: ${allChanges.length}`);
    console.log(`├─ Files affected: ${new Set(allChanges.map(c => c.importFile)).size}`);
    console.log(`└─ Interfaces affected: ${Object.keys(summary).length}`);
  } else {
    console.log('\n✅ No interface import fixes needed!');
  }
  
  console.log('\n⚠️  Preview only - no changes made');
  
  if (interfaceFiles.length > previewLimit) {
    console.log(`\n📝 Note: Preview limited to first ${previewLimit} interface files (out of ${interfaceFiles.length})`);
    console.log(`   Use 'scan --report' for a full analysis of all files`);
  }
}

async function scanInterfaceImports(generateReport: boolean = false) {
  console.log('🔍 Scanning for interface import issues...\n');
  
  const interfaceFiles = findInterfaceExports();
  console.log(`📊 Found ${interfaceFiles.length} interface files to scan\n`);
  
  const issues: Array<{interface: string; file: string; count: number; examples: string[]}> = [];
  const allChanges: Array<{interface: string; fromFile: string; importFile: string; line: number; original: string}> = [];
  
  let processedFiles = 0;
  const totalFiles = interfaceFiles.length;
  
  // Process in batches to show progress
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < interfaceFiles.length; i += BATCH_SIZE) {
    const batch = interfaceFiles.slice(i, i + BATCH_SIZE);
    processedFiles += batch.length;
    
    console.log(`📈 Progress: ${processedFiles}/${totalFiles} files (${Math.round(processedFiles/totalFiles*100)}%)`);
    
    for (const interfaceFile of batch) {
      const fileName = path.basename(interfaceFile.file, path.extname(interfaceFile.file));
      
      // Skip problematic files
      if (fileName.includes('$') || fileName.includes('{') || fileName.includes('}')) {
        console.log(`   ⏭️  Skipping problematic filename: ${fileName}`);
        continue;
      }
      
      // Only check first 3 interfaces per file to speed up
      const interfacesToCheck = interfaceFile.interfaces.slice(0, 3);
      
      for (const interfaceName of interfacesToCheck) {
        // Skip problematic interface names
        if (interfaceName.includes('$') || interfaceName.includes('{') || interfaceName.includes('}')) {
          continue;
        }
        
        // Use a simpler approach: first find files that import from this file
        try {
          // Step 1: Find files that import from this filename
          const findImportsFromFile = `grep -l "from.*${fileName}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -10 || true`;
          const filesOutput = execSync(findImportsFromFile, { 
            encoding: 'utf8',
            timeout: 2000 // 2 second timeout
          });
          
          const files = filesOutput.split('\n').filter(Boolean);
          
          if (files.length === 0) continue;
          
          let count = 0;
          const importLines: string[] = [];
          
          // Step 2: Check each file for this specific interface
          for (const file of files) {
            try {
              const checkCmd = `grep -n "import.*${interfaceName}.*from" "${file}" 2>/dev/null | grep -v "import type" || true`;
              const importsOutput = execSync(checkCmd, { 
                encoding: 'utf8',
                timeout: 1000 // 1 second timeout
              });
              
              const lines = importsOutput.split('\n').filter(Boolean);
              if (lines.length > 0) {
                count += lines.length;
                importLines.push(...lines.map(line => `${file}:${line}`));
              }
            } catch (error) {
              // Skip file on error
              continue;
            }
          }
          
          if (count > 0) {
            const examples = importLines.slice(0, 3);
            
            issues.push({
              interface: interfaceName,
              file: fileName,
              count,
              examples
            });
            
            // Collect details
            for (const importLine of importLines) {
              const [filePath, lineNumStr, ...rest] = importLine.split(':');
              const lineNum = parseInt(lineNumStr) || 1;
              const originalImport = rest.join(':').trim();
              
              allChanges.push({
                interface: interfaceName,
                fromFile: fileName,
                importFile: filePath,
                line: lineNum,
                original: originalImport
              });
            }
          }
        } catch (error: any) {
          // Skip on error
          continue;
        }
      }
    }
  }
  
  if (generateReport) {
    console.log('\n📊 INTERFACE IMPORT REPORT');
    console.log('========================\n');
    
    if (issues.length === 0) {
      console.log('✅ No interface import issues found!');
      return;
    }
    
    // Sort by count descending
    issues.sort((a, b) => b.count - a.count);
    
    console.log('Top issues needing fixes:');
    const displayCount = Math.min(issues.length, 20);
    issues.slice(0, displayCount).forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.interface} from ${issue.file}: ${issue.count} imports need "import type"`);
      if (issue.examples.length > 0) {
        console.log(`   Examples:`);
        issue.examples.forEach(example => {
          const [file, line] = example.split(':');
          console.log(`   - ${path.basename(file)}:${line}`);
        });
      }
    });
    
    const total = issues.reduce((sum, issue) => sum + issue.count, 0);
    console.log(`\n📈 Total fixes needed: ${total} across ${issues.length} interfaces`);
    
    // Generate detailed report file
    const reportDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `interface-import-scan-${timestamp}.md`);
    
    let reportContent = `# Interface Import Scan Report\n\n`;
    reportContent += `**Generated:** ${new Date().toISOString()}\n`;
    reportContent += `**Total interface files scanned:** ${interfaceFiles.length}\n`;
    reportContent += `**Interfaces needing fixes:** ${issues.length}\n`;
    reportContent += `**Total imports to fix:** ${total}\n\n`;
    reportContent += `> **Note:** Scan limited to first 3 interfaces per file and first 10 importing files for performance.\n\n`;
    
    // Full list sorted by count
    reportContent += `## All Issues (sorted by frequency)\n\n`;
    reportContent += `| Interface | From File | Import Count |\n`;
    reportContent += `|-----------|-----------|--------------|\n`;
    
    issues.forEach(issue => {
      reportContent += `| ${issue.interface} | ${issue.file} | ${issue.count} |\n`;
    });
    
    fs.writeFileSync(reportFile, reportContent, 'utf8');
    console.log(`\n📊 Full report saved to: ${reportFile}`);
    
    // Generate action plan
    const actionFile = path.join(reportDir, `interface-import-action-plan-${timestamp}.md`);
    let actionContent = `# Interface Import Fix Action Plan\n\n`;
    actionContent += `**Total fixes needed:** ${total}\n`;
    actionContent += `**Suggested execution order:**\n\n`;
    
    // Group by file for batch fixes
    const fixesByFile: Record<string, Array<typeof allChanges[0]>> = {};
    allChanges.forEach(change => {
      if (!fixesByFile[change.importFile]) {
        fixesByFile[change.importFile] = [];
      }
      fixesByFile[change.importFile].push(change);
    });
    
    actionContent += `## Batch 1: Files with most fixes\n\n`;
    
    // Sort files by number of fixes
    const filesByFixCount = Object.entries(fixesByFile)
      .sort(([, changesA], [, changesB]) => changesB.length - changesA.length);
    
    const topFiles = Math.min(filesByFixCount.length, 10);
    filesByFixCount.slice(0, topFiles).forEach(([filePath, changes], index) => {
      const relativePath = path.relative(process.cwd(), filePath);
      actionContent += `### ${index + 1}. ${relativePath} (${changes.length} fixes)\n\n`;
      
      // Group by interface
      const groupedByInterface: Record<string, typeof changes> = {};
      changes.forEach(change => {
        if (!groupedByInterface[change.interface]) {
          groupedByInterface[change.interface] = [];
        }
        groupedByInterface[change.interface].push(change);
      });
      
      for (const [interfaceName, interfaceChanges] of Object.entries(groupedByInterface)) {
        actionContent += `- ${interfaceName} (${interfaceChanges.length} imports)\n`;
        interfaceChanges.slice(0, 3).forEach(change => {
          actionContent += `  - Line ${change.line}: \`${change.original}\`\n`;
        });
        if (interfaceChanges.length > 3) {
          actionContent += `  - ... and ${interfaceChanges.length - 3} more\n`;
        }
      }
      actionContent += '\n';
    });
    
    fs.writeFileSync(actionFile, actionContent, 'utf8');
    console.log(`📊 Action plan saved to: ${actionFile}`);
  }
}

async function interactiveFixInterfaceImports(args: string[]) {
  console.log('🎯 INTERACTIVE MODE\n');
  console.log('⚠️  This mode shows you each interface found and lets you decide which to fix.\n');
  
  // Get all interface files with progress
  console.log('🔍 Finding interface files...');
  const interfaceFiles = findInterfaceExports();
  console.log(`✅ Found ${interfaceFiles.length} files with interface exports\n`);
  
  let totalFixed = 0;
  let totalSkipped = 0;
  let totalNoImports = 0;
  let currentFileIndex = 0;
  
  // Update the prompt function to include 'exit'
  async function promptContinue(): Promise<'y' | 'n' | 'exit'> {
    return new Promise((resolve) => {
      const stdin = process.stdin;
      stdin.setEncoding('utf8');
      
      process.stdout.write(`\n📄 Continue to next file? (${currentFileIndex + 1}/${interfaceFiles.length}) (y/n/exit): `);
      
      stdin.once('data', (key) => {
        const answer = key.toString().toLowerCase().trim();
        if (answer === 'y' || answer === 'yes') {
          resolve('y');
        } else if (answer === 'exit' || answer === 'quit' || answer === 'q') {
          resolve('exit');
        } else {
          resolve('n');
        }
        stdin.pause();
      });
    });
  }
  
  for (const interfaceFile of interfaceFiles) {
    currentFileIndex++;
    const fileName = path.basename(interfaceFile.file, path.extname(interfaceFile.file));
    const relativePath = path.relative(process.cwd(), interfaceFile.file);
    
    console.log(`\n📁 File ${currentFileIndex}/${interfaceFiles.length}: ${fileName}`);
    console.log(`   📍 Source: ${relativePath}`);
    console.log(`   📊 Exports ${interfaceFile.interfaces.length} interfaces: ${interfaceFile.interfaces.slice(0, 3).join(', ')}${interfaceFile.interfaces.length > 3 ? `... (+${interfaceFile.interfaces.length - 3} more)` : ''}`);
    
    let fileFixed = 0;
    let interfaceIndex = 0;
    
    // Limit to first 5 interfaces per file to keep it manageable
    const interfacesToCheck = interfaceFile.interfaces.slice(0, 5);
    
    for (const interfaceName of interfacesToCheck) {
      interfaceIndex++;
      console.log(`\n   🔍 [${interfaceIndex}/${interfacesToCheck.length}] Checking ${interfaceName}...`);
      
      try {
        // Use a faster, more targeted search
        const findCmd = `grep -l "import.*${interfaceName}.*from.*${fileName}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -10 || true`;
        const filesOutput = execSync(findCmd, { 
          encoding: 'utf8',
          timeout: 2000 // 2 second timeout
        });
        
        const files = filesOutput.split('\n').filter(Boolean);
        
        if (files.length === 0) {
          console.log(`      ✅ No imports found for ${interfaceName}`);
          totalNoImports++;
          continue;
        }
        
        console.log(`      📊 Found ${files.length} file(s) importing ${interfaceName}`);
        
        // Collect actual import lines
        let importLines: string[] = [];
        let nonTypeImportCount = 0;
        
        for (const file of files) {
          try {
            const checkCmd = `grep -n "import.*${interfaceName}" "${file}" 2>/dev/null | grep -v "import type" || true`;
            const importsOutput = execSync(checkCmd, { 
              encoding: 'utf8',
              timeout: 1000 
            });
            
            const lines = importsOutput.split('\n').filter(Boolean);
            if (lines.length > 0) {
              nonTypeImportCount += lines.length;
              importLines.push(...lines.map(line => `${file}:${line}`));
            }
          } catch {
            // Skip this file
          }
        }
        
        if (nonTypeImportCount === 0) {
          console.log(`      ✅ All imports already use "import type"`);
          continue;
        }
        
        console.log(`      ❌ Found ${nonTypeImportCount} import(s) that need "import type"`);
        
        // Show examples
        if (importLines.length > 0) {
          console.log(`      📝 Examples:`);
          importLines.slice(0, 2).forEach(line => {
            const [filePath, lineNum, importText] = line.split(':');
            const truncatedImport = importText.length > 50 ? importText.substring(0, 50) + '...' : importText;
            console.log(`        - ${path.basename(filePath)}:${lineNum}: ${truncatedImport}`);
          });
          
          if (importLines.length > 2) {
            console.log(`        ... and ${importLines.length - 2} more`);
          }
        }
        
        const confirmed = await promptConfirmationWithMessage(
          `\n      🚀 Fix ${nonTypeImportCount} import(s) of ${interfaceName}? (y/n/skip): `
        );
        
        if (confirmed === 'y') {
          // Apply fixes for this interface
          const fixes: FixResult[] = [];
          
          for (const importLine of importLines) {
            const [filePath, lineNumStr, ...rest] = importLine.split(':');
            const lineNum = parseInt(lineNumStr) || 1;
            const originalImport = rest.join(':').trim();
            
            if (originalImport.includes('import {') && originalImport.includes(interfaceName)) {
              const fixedImport = originalImport.replace('import {', 'import type {');
              
              fixes.push({
                file: filePath,
                original: originalImport,
                fixed: fixedImport,
                success: true,
                line: lineNum
              });
            }
          }
          
          if (fixes.length > 0) {
            await applyFixesShared(fixes);
            fileFixed += fixes.length;
            totalFixed += fixes.length;
            console.log(`      ✅ Fixed ${fixes.length} import(s) of ${interfaceName}`);
          }
        } else if (confirmed === 'skip') {
          console.log(`      ⏭️  Skipped ${interfaceName}`);
          totalSkipped++;
        } else {
          console.log(`      ❌ Cancelled ${interfaceName}`);
        }
        
      } catch (error: any) {
        console.log(`      ⚠️  Error checking ${interfaceName}: ${error.message}`);
        continue;
      }
    }
    
    if (fileFixed > 0) {
      console.log(`   🎉 Fixed ${fileFixed} import(s) in this file`);
    }
    
    // Ask if user wants to continue after each file
    if (currentFileIndex < interfaceFiles.length) {
      const continueResponse = await promptContinue();
      
      if (continueResponse === 'exit') {
        console.log('\n👋 Exiting interactive mode');
        break;
      } else if (continueResponse === 'n') {
        console.log('\n👋 Stopping at user request');
        break;
      }
      // If 'y', continue loop
    }
  }
  
  console.log(`\n📊 INTERACTIVE MODE COMPLETE:`);
  console.log(`   ✅ Fixed: ${totalFixed} import(s)`);
  console.log(`   ⏭️  Skipped: ${totalSkipped} interface(s)`);
  console.log(`   📭 No imports: ${totalNoImports} interface(s)`);
  console.log(`   📁 Files processed: ${Math.min(currentFileIndex, interfaceFiles.length)}/${interfaceFiles.length}`);
}

async function safeFixInterfaceImports(args: string[]) {
  console.log('🛡️  SAFE MODE - Only fixing high-confidence interface imports\n');
  console.log('🔍 Scanning for known type-only patterns...\n');
  
  // Expanded list of high-confidence type patterns
  const HIGH_CONFIDENCE_PATTERNS = [
    'DataStore',
    'Snapshot',
    'PhaseContext',
    'ExecutionContext',
    'MilestoneDefinition',
    'EntityAnalysis',
    'WorkflowTransition',
    'BaseEntity',
    'UserEntity',
    'Config',
    'Props',
    'State',
    'Options',
    'Metadata',
    'Payload',
    'Event',
    'Type',
    'Interface',
    'Entity',
    'Store',
    'Manager',
    'Handler'
  ];
  
  const interfaceFiles = findInterfaceExports();
  console.log(`📊 Found ${interfaceFiles.length} interface files\n`);
  
  const allFixes: FixResult[] = [];
  let filesScanned = 0;
  
  // First, show what we're looking for
  console.log('🔎 Looking for these patterns:');
  HIGH_CONFIDENCE_PATTERNS.slice(0, 10).forEach(pattern => {
    console.log(`   - ${pattern}`);
  });
  if (HIGH_CONFIDENCE_PATTERNS.length > 10) {
    console.log(`   ... and ${HIGH_CONFIDENCE_PATTERNS.length - 10} more`);
  }
  console.log('');
  
  for (const interfaceFile of interfaceFiles) {
    filesScanned++;
    const fileName = path.basename(interfaceFile.file, path.extname(interfaceFile.file));
    
    // Show progress every 20 files
    if (filesScanned % 20 === 0) {
      console.log(`📈 Progress: ${filesScanned}/${interfaceFiles.length} files`);
    }
    
    for (const interfaceName of interfaceFile.interfaces) {
      // Check if this interface matches any high-confidence pattern
      const isHighConfidence = HIGH_CONFIDENCE_PATTERNS.some(pattern => 
        interfaceName.includes(pattern) || 
        interfaceName.endsWith(pattern) ||
        new RegExp(`^${pattern}[A-Z]`).test(interfaceName)
      );
      
      if (!isHighConfidence) continue;
      
      console.log(`🔧 Found high-confidence interface: ${interfaceName} (from ${fileName})`);
      
      try {
        // Use more efficient search
        const findCmd = `grep -l "import.*${interfaceName}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -20 || true`;
        const filesOutput = execSync(findCmd, { 
          encoding: 'utf8',
          timeout: 2000 
        });
        
        const files = filesOutput.split('\n').filter(Boolean);
        
        if (files.length === 0) {
          console.log(`   ⏭️  No imports found for ${interfaceName}`);
          continue;
        }
        
        console.log(`   📊 Found ${files.length} file(s) importing ${interfaceName}`);
        
        // Check each file
        for (const file of files) {
          try {
            const checkCmd = `grep -n "import.*${interfaceName}.*from" "${file}" 2>/dev/null | grep -v "import type" || true`;
            const importsOutput = execSync(checkCmd, { 
              encoding: 'utf8',
              timeout: 1000 
            });
            
            const importLines = importsOutput.split('\n').filter(Boolean);
            
            for (const importLine of importLines) {
              const [filePath, lineNumStr, ...rest] = importLine.split(':');
              const lineNum = parseInt(lineNumStr) || 1;
              const originalImport = rest.join(':').trim();
              
              if (originalImport.includes('import {') && originalImport.includes(interfaceName)) {
                const fixedImport = originalImport.replace('import {', 'import type {');
                
                allFixes.push({
                  file: filePath,
                  original: originalImport,
                  fixed: fixedImport,
                  success: true,
                  line: lineNum
                });
                
                console.log(`      ✅ Will fix: ${path.basename(filePath)}:${lineNum}`);
              }
            }
          } catch {
            // Skip file on error
            continue;
          }
        }
        
      } catch (error: any) {
        console.log(`   ⚠️  Error checking ${interfaceName}: ${error.message}`);
        continue;
      }
    }
  }
  
  if (allFixes.length > 0) {
    console.log(`\n📋 SAFE MODE RESULTS:`);
    console.log(`   Found ${allFixes.length} high-confidence fixes across ${new Set(allFixes.map(f => f.file)).size} files`);
    
    // Group fixes by file for summary
    const fixesByFile: Record<string, FixResult[]> = {};
    allFixes.forEach(fix => {
      if (!fixesByFile[fix.file]) {
        fixesByFile[fix.file] = [];
      }
      fixesByFile[fix.file].push(fix);
    });
    
    console.log('\n📝 Files that will be modified:');
    Object.entries(fixesByFile).slice(0, 10).forEach(([filePath, fixes]) => {
      console.log(`   - ${path.basename(filePath)}: ${fixes.length} fix(es)`);
    });
    
    if (Object.keys(fixesByFile).length > 10) {
      console.log(`   ... and ${Object.keys(fixesByFile).length - 10} more files`);
    }
    
    console.log('\n🚀 Apply these safe fixes? (y/n)');
    const confirmed = await promptConfirmation();
    
    if (confirmed) {
      console.log('\n🔧 Applying safe fixes...');
      await applyFixesShared(allFixes);
      console.log('✅ Safe fixes applied successfully!');
    } else {
      console.log('\n❌ Safe fixes cancelled');
    }
  } else {
    console.log('\n✅ No high-confidence interface imports need fixing');
  }
}

async function promptConfirmationWithMessage(message: string): Promise<'y' | 'n' | 'skip'> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setEncoding('utf8');
    
    process.stdout.write(message);
    
    stdin.once('data', (key) => {
      const answer = key.toString().toLowerCase().trim();
      if (answer === 'y' || answer === 'yes') {
        resolve('y');
      } else if (answer === 'skip') {
        resolve('skip');
      } else {
        resolve('n');
      }
      stdin.pause();
    });
  });
}


async function analyzeDirectory(dirPath: string) {
  console.log(`📁 Analyzing directory: ${dirPath}\n`);
  
  // Find all TypeScript files in directory
  const findCmd = `find ${dirPath} -name "*.ts" -o -name "*.tsx"`;
  const files = execSync(findCmd, { encoding: 'utf8' })
    .split('\n')
    .filter(f => f.trim() && !f.includes('node_modules'));
  
  console.log(`Found ${files.length} TypeScript files in directory\n`);
  
  if (files.length === 0) {
    console.log('⚠️  No TypeScript files found in directory');
    return;
  }
  
  // Analyze each file
  for (const file of files.slice(0, 20)) { // Limit to first 20 files
    await analyzeFile(file, false);
  }
  
  if (files.length > 20) {
    console.log(`... and ${files.length - 20} more files not shown`);
  }
}

async function analyzeFile(filePath: string, quiet: boolean = false): Promise<FixResult[]> {
  if (!quiet) {
    console.log(`📄 Analyzing file: ${filePath}\n`);
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Find all type/interface exports in this file
    const typeExports = findTypeExports(content);
    const runtimeExports = findRuntimeExports(content);
    
    if (typeExports.length === 0) {
      if (!quiet) {
        console.log(`   ⏭️  No type/interface exports found in ${fileName}`);
      }
      return []; // Return empty array instead of undefined
    }
    
    if (!quiet) {
      console.log(`📊 ${fileName} exports:`);
      console.log(`   Type exports: ${typeExports.length > 0 ? typeExports.join(', ') : 'none'}`);
      console.log(`   Runtime exports: ${runtimeExports.length > 0 ? runtimeExports.join(', ') : 'none'}\n`);
    }
    
    // Find imports for each type export
    const allFixes: FixResult[] = [];
    
    for (const typeName of typeExports) {
      const fixes = await findImportsForExport(typeName, filePath);
      allFixes.push(...fixes);
      
      if (fixes.length > 0 && !quiet) {
        console.log(`   ${typeName}: ${fixes.length} imports need fixing`);
      }
    }
    
    if (allFixes.length > 0) {
      if (!quiet) {
        console.log(`\n📋 Found ${allFixes.length} total fixes needed for ${fileName}`);
        showFixPreview(allFixes, filePath);
      }
      return allFixes; // Return the array of fixes
    } else if (!quiet) {
      console.log(`✅ All imports of ${fileName} are already correct`);
    }
    
    return []; // Return empty array if no fixes
    
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}:`, (error as Error).message);
    return []; // Return empty array on error
  }
}

function findTypeExports(content: string): string[] {
  const typeExports: string[] = [];
  
  // Look for type exports (lines like "export type { ... }")
  const typeExportMatch = content.match(/export\s+type\s*{([^}]+)}/);
  if (typeExportMatch) {
    const types = typeExportMatch[1].split(',').map(t => t.trim()).filter(Boolean);
    typeExports.push(...types);
  }
  
  // Look for interface exports
  const interfaceMatches = content.match(/export\s+interface\s+(\w+)/g);
  if (interfaceMatches) {
    const interfaces = interfaceMatches.map(m => {
      const nameMatch = m.match(/export\s+interface\s+(\w+)/);
      return nameMatch ? nameMatch[1] : '';
    }).filter(Boolean);
    typeExports.push(...interfaces);
  }
  
  // Look for type aliases
  const typeAliasMatches = content.match(/export\s+type\s+(\w+)/g);
  if (typeAliasMatches) {
    const typeAliases = typeAliasMatches.map(m => {
      const nameMatch = m.match(/export\s+type\s+(\w+)/);
      return nameMatch ? nameMatch[1] : '';
    }).filter(Boolean);
    typeExports.push(...typeAliases);
  }
  
  return [...new Set(typeExports)]; // Remove duplicates
}

function findRuntimeExports(content: string): string[] {
  const runtimeExports: string[] = [];
  
  // Look for runtime exports (functions, classes, constants)
  const exportMatches = content.match(/export\s*{([^}]+)}/g);
  if (exportMatches) {
    // Get all exports from all export statements
    exportMatches.forEach(exportStmt => {
      const match = exportStmt.match(/export\s*{([^}]+)}/);
      if (match) {
        const exports = match[1].split(',').map(e => e.trim()).filter(Boolean);
        runtimeExports.push(...exports);
      }
    });
  }
  
  // Look for direct exports
  const directExports = [
    ...(content.match(/export\s+function\s+(\w+)/g) || []),
    ...(content.match(/export\s+const\s+(\w+)/g) || []),
    ...(content.match(/export\s+let\s+(\w+)/g) || []),
    ...(content.match(/export\s+var\s+(\w+)/g) || []),
    ...(content.match(/export\s+class\s+(\w+)/g) || []),
  ];
  
  directExports.forEach(exp => {
    const nameMatch = exp.match(/export\s+\w+\s+(\w+)/);
    if (nameMatch) {
      runtimeExports.push(nameMatch[1]);
    }
  });
  
  return [...new Set(runtimeExports)]; // Remove duplicates
}

async function findImportsForExport(exportName: string, sourceFile: string): Promise<FixResult[]> {
  const fixes: FixResult[] = [];
  const fileName = path.basename(sourceFile, path.extname(sourceFile));
  
  // Get relative path for import matching
  const relativePath = path.relative(process.cwd(), sourceFile);
  const importPath = relativePath.replace(/\.(ts|tsx)$/, '');
  
  // Search for imports of this export
  const findCmd = `grep -rn "import.*{[^}]*\\b${exportName}\\b[^}]*}.*from.*['\"][^'\"]*${fileName}['\"]" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true`;
  
  try {
    const output = execSync(findCmd, { encoding: 'utf8' });
    const importLines = output.split('\n').filter(Boolean);
    
    for (const importLine of importLines) {
      const [filePath, ...rest] = importLine.split(':');
      const lineNum = parseInt(rest[0]) || 1;
      const originalImport = rest.slice(1).join(':').trim();
      
      if (!filePath || !originalImport) continue;
      
      // Skip if already using import type
      if (originalImport.includes('import type {')) {
        continue;
      }
      
      // Create the fix
      const fixedImport = originalImport.replace('import {', 'import type {');
      
      fixes.push({
        file: filePath,
        original: originalImport,
        fixed: fixedImport,
        success: true,
        line: lineNum
      });
    }
  } catch (error) {
    // Ignore grep errors
  }
  
  return fixes;
}

function showFixPreview(fixes: FixResult[], sourceFile: string) {
  console.log('\n📝 PREVIEW of changes needed:');
  console.log('═'.repeat(60));
  
  // Group fixes by file
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
  
  console.log('\n═'.repeat(60));
  console.log(`Total fixes needed: ${fixes.length} across ${fixesByFile.size} files`);
}

async function applyFixesLocal(fixes: FixResult[]) {
  console.log('\n🔧 Applying fixes...');
  
  let applied = 0;
  let failed = 0;
  
  // Use shared helper
  const fixesByFile = groupFixesByFile(fixes);
  
  for (const [filePath, fileFixes] of fixesByFile) {
    try {
      // Use shared helper
      const backupPath = createBackup(filePath);
      console.log(`💾 Backup created: ${backupPath}`);
      
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      // Use shared helper
      const sortedFixes = sortFixesDescending(fileFixes);
      
      // KEEP ALL THE ORIGINAL LOGIC - it's specific to this script
      for (const fix of sortedFixes) {
        let lineIndex = (fix.line || 1) - 1;
        
        if (lineIndex < 0 || lineIndex >= lines.length || !lines[lineIndex].includes(fix.original)) {
          lineIndex = lines.findIndex(line => 
            line.includes(fix.original) && 
            !line.includes('import type')
          );
          
          if (lineIndex === -1) {
            const importMatch = fix.original.match(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/);
            if (importMatch) {
              const [, importNames, sourcePath] = importMatch;
              const importNamesList = importNames.split(',').map(name => name.trim());
              
              lineIndex = lines.findIndex(line => {
                if (line.includes('import type')) return false;
                if (!line.includes(sourcePath)) return false;
                return importNamesList.every(name => line.includes(name));
              });
            }
          }
        }
        
        if (lineIndex >= 0 && lineIndex < lines.length) {
          if (lines[lineIndex].includes(fix.original) && !lines[lineIndex].includes('import type')) {
            lines[lineIndex] = lines[lineIndex].replace(fix.original, fix.fixed);
            applied++;
            console.log(`✅ Fixed: ${path.basename(filePath)}:${lineIndex + 1} (${fix.original} → ${fix.fixed})`);
          } else if (lines[lineIndex].includes('import type')) {
            console.log(`⏭️  Skipped: ${path.basename(filePath)}:${lineIndex + 1} (already using import type)`);
          } else {
            console.warn(`⚠️  Line ${lineIndex + 1} in ${filePath} doesn't match expected content`);
            console.warn(`    Looking for: ${fix.original}`);
            console.warn(`    Found: ${lines[lineIndex]}`);
            failed++;
          }
        } else {
          console.warn(`⚠️  Could not find import in ${filePath}: ${fix.original}`);
          failed++;
        }
      }
      
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, (error as Error).message);
      failed += fileFixes.length;
    }
  }
  
  console.log(`\n📊 Results:`);
  console.log(`✅ Applied: ${applied} fixes`);
  console.log(`❌ Failed: ${failed} fixes`);
  
  if (failed > 0) {
    console.log(`\n💡 ${getContextTips('interface')}`);
  }
}

async function collectFixesForTarget(target: string): Promise<FixResult[]> {
  const fullPath = path.resolve(process.cwd(), target);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Target not found: ${target}`);
    return [];
  }
  
  const stats = fs.statSync(fullPath);
  const allFixes: FixResult[] = [];
  
  if (stats.isDirectory()) {
    // Find all TypeScript files in directory
    const findCmd = `find ${target} -name "*.ts" -o -name "*.tsx"`;
    const files = execSync(findCmd, { encoding: 'utf8' })
      .split('\n')
      .filter(f => f.trim() && !f.includes('node_modules'));
    
    console.log(`📁 Analyzing ${files.length} files in directory: ${target}\n`);
    
    for (const file of files) {
      const fixes = await analyzeFile(file, true);
      allFixes.push(...fixes); // fixes is always an array now
    }
    
  } else if (stats.isFile()) {
    // Single file - analyzeFile now always returns an array
    const fixes = await analyzeFile(target, false);
    allFixes.push(...fixes);
  }
  
  return allFixes;
}

// Add this function near the other prompt functions:
async function promptCommand(): Promise<string> {
  console.log('\n🔧 Available commands:');
  console.log('  1. target <path>   - Analyze specific file/directory');
  console.log('  2. all             - Fix ALL interface imports');
  console.log('  3. quick           - Quick-fix DataStore imports');
  console.log('  4. preview         - Preview what would be fixed');
  console.log('  5. scan            - Scan and report issues');
  console.log('  6. interactive     - Interactive mode');
  console.log('  7. safe            - Safe mode (high-confidence only)');
  console.log('  8. help            - Show help');
  console.log('  9. exit            - Exit');
  
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setEncoding('utf8');
    
    process.stdout.write('\nEnter command number or name: ');
    
    stdin.once('data', (input) => {
      const command = input.toString().toLowerCase().trim();
      const commands: Record<string, string> = {
        '1': 'target',
        '2': 'all',
        '3': 'quick',
        '4': 'preview',
        '5': 'scan',
        '6': 'interactive',
        '7': 'safe',
        '8': 'help',
        '9': 'exit'
      };
      
      if (commands[command]) {
        resolve(commands[command]);
      } else {
        resolve(command);
      }
    });
  });
}

// Also update the promptConfirmation function to handle auto-apply:
async function promptConfirmation(question: string = 'Apply these fixes?'): Promise<boolean> {
  const args = process.argv.slice(2);
  if (args.includes('--apply')) {
    console.log(`${question} auto-confirmed (--apply flag used)`);
    return true;
  }
  
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setEncoding('utf8');
    
    process.stdout.write(`${question} (y/n): `);
    
    stdin.once('data', (key) => {
      const answer = key.toString().toLowerCase().trim();
      resolve(answer === 'y' || answer === 'yes');
      stdin.pause();
    });
  });
}



// New function specifically for the pattern in your error
async function fixTypeOnlyImportsFromCore(args: string[] = []) {  // ADD args parameter
  console.log('🔍 Fixing type-only imports from core modules...\n');


  const runtimeDetector = new RuntimeDetector();
  
  // First, analyze exports to learn what's runtime vs type
  console.log('📚 Learning export patterns from core modules...\n');
  await runtimeDetector.analyzeCoreExports();
  
  console.log('⚠️  IMPORTANT: Using more accurate export checking to avoid incorrect changes\n');
  
    const exportAnalysis = new Map<string, {
    typeOnlyExports: Set<string>;
    runtimeExports: Set<string>;
    allExports: Set<string>;
  }>();
  
  for (const modulePath of coreModules) {
    const fullPath = modulePath.replace('@/', 'src/');
    
    // Try multiple extensions
    const possiblePaths = [
      fullPath + '.ts',
      fullPath + '.tsx',
      fullPath + '/index.ts',
      fullPath + '/index.tsx'
    ];
    
    let actualPath = '';
    for (const possiblePath of possiblePaths) {
      const resolved = path.resolve(process.cwd(), possiblePath);
      if (fs.existsSync(resolved)) {
        actualPath = resolved;
        break;
      }
    }
    
    if (!actualPath) {
      console.log(`⚠️  Could not find: ${modulePath}`);
      continue;
    }
    
    try {
      const content = fs.readFileSync(actualPath, 'utf8');
      const sourceFile = ts.createSourceFile(
        actualPath,
        content,
        ts.ScriptTarget.Latest,
        true
      );
      
      const { typeOnlyExports, runtimeExports } = analyzeExportsAccurately(sourceFile);
      
      exportAnalysis.set(modulePath, {
        typeOnlyExports: new Set(typeOnlyExports),
        runtimeExports: new Set(runtimeExports),
        allExports: new Set([...typeOnlyExports, ...runtimeExports])
      });
      
      console.log(`✅ ${modulePath}:`);
      console.log(`   📊 Type-only exports: ${typeOnlyExports.length > 0 ? typeOnlyExports.join(', ') : 'none'}`);
      console.log(`   📊 Runtime exports: ${runtimeExports.length > 0 ? runtimeExports.join(', ') : 'none'}`);
      
    } catch (error: any) {
      console.log(`❌ Error analyzing ${actualPath}: ${error.message}`);
    }
  }
  
  const originalShouldBeTypeImport = (importName: string, sourceModule: string): boolean => {
    // Ask the runtime detector
    const isRuntime = runtimeDetector.isRuntimeExport(importName);
    
    if (isRuntime) {
      console.log(`   ⚠️  ${importName} appears to be a RUNTIME export`);
      return false; // DON'T convert to import type
    }
    
    // Check export analysis if available
    const exportInfo = runtimeDetector.getExportAnalysis(sourceModule, importName);
    if (exportInfo) {
      return exportInfo.isTypeOnly;
    }
    
    // Fallback: Only convert if it looks strongly like a type
    const strongTypePatterns = [
      /Entity$/i,
      /Interface$/i,
      /Type$/i,
      /Props$/i,
      /State$/i,
      /Config$/i,
      /Options$/i,
      /Metadata$/i
    ];
    
    return strongTypePatterns.some(pattern => pattern.test(importName));
  };

  const deepScan = args.includes('--deep-scan') || args.includes('--all');
  const aggressive = args.includes('--aggressive');
  
  if (deepScan) {
    console.log('🔍 DEEP SCAN MODE - Finding ALL type imports from core...\n');
    // Use more comprehensive pattern matching
    const findCmd = `find src/ -name "*.ts" -o -name "*.tsx" -exec grep -l "from.*@/core" {} \\; 2>/dev/null`;
    // This will find ALL files, not just first matches
  }

  // Track processed files to avoid duplicates
  const processedFiles = new Set<string>();
  
  // Define core modules to check (expanded list)
  const coreModules = [
    '@/core/config/BaseConfig',
    '@/core/config/MetaDataOptions',
    '@/core/config/StructuredMetadata',
    '@/core/documents/attachment/Attachment',
    '@/core/shared/SharedMetadata',
    '@/core/state/stores/DataStore',
    '@/core/typings/ReminderTypes',
    '@/core/config/useMetadata',
    '@/core/state/redux/slices/NofiticationsSlice',
    '@/core/state/redux/slices/RootSlice',
    '@/core/state/stores/DetailsListStore',
    '@/core/typings/meetingTypes',
    '@/core/models/data/Data',
    '@/core/models/data/StatusType',
    '@/core/models/tasks/Task',
    '@/core/state/redux/ReducerGenerator',
    '@/core/models/data/EventPriorityClassification',
    '@/core/calendar/CalendarEvent',
    '@/core/components/calendar/CalendarContext',
    '@/core/components/calendar/Month'
  ];
  
  console.log('📋 Checking core modules:\n');
  coreModules.forEach(module => {
    console.log(`   📍 ${module}`);
  });
  console.log('');
  
  // Step 1: Build comprehensive map of all type-only exports from core modules
  const typeOnlyExports = new Map<string, Set<string>>();
  
  for (const modulePath of coreModules) {
    const fullPath = modulePath.replace('@/', 'src/');
    
    // Try multiple extensions
    const possiblePaths = [
      fullPath + '.ts',
      fullPath + '.tsx',
      fullPath + '/index.ts',
      fullPath + '/index.tsx'
    ];
    
    let actualPath = '';
    for (const possiblePath of possiblePaths) {  // FIX: Renamed variable to avoid conflict
      const resolved = path.resolve(process.cwd(), possiblePath);  // FIX: Use path.resolve not path2.resolve
      if (fs.existsSync(resolved)) {
        actualPath = resolved;
        break;
      }
    }
    
    if (!actualPath) {
      console.log(`⚠️  Could not find: ${modulePath}`);
      continue;
    }
    
    try {
      const content = fs.readFileSync(actualPath, 'utf8');
      const exports = findTypeOnlyExports(content);
      
      if (exports.length > 0) {
        typeOnlyExports.set(modulePath, new Set(exports));
        console.log(`✅ ${modulePath}: ${exports.length} type-only export(s)`);
      } else {
        console.log(`⚠️  ${modulePath}: No type-only exports found`);
      }
    } catch (error: any) {
      console.log(`❌ Error reading ${actualPath}: ${error.message}`);
    }
  }
  
  // Step 2: Find ALL imports from these modules
  console.log('\n🔍 Searching for ALL imports from core modules...\n');
  
  // Create one comprehensive grep pattern for ALL core modules
  const modulePatterns = coreModules.map(module => {
    // Extract the last part for pattern matching
    const parts = module.split('/');
    const fileName = parts[parts.length - 1];
    return fileName;
  }).filter(Boolean);
  
  const pattern = modulePatterns.join('|');
  console.log(`📊 Search pattern: ${pattern}`);
  
  // Find ALL files that import from ANY core module
  const findCmd = `grep -l "from.*@/core" src/ --include="*.ts" --include="*.tsx" -r 2>/dev/null || true`;
  
  try {
    const output = execSync(findCmd, { 
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    const allFiles = output.split('\n')
      .filter(f => f.trim())
      .filter(f => !f.includes('node_modules'))
      .filter(f => !f.includes('test.'))
      .filter(f => !f.includes('.spec.'));
    
    console.log(`📊 Found ${allFiles.length} files importing from @/core\n`);
    
    const allFixes: FixResult[] = [];
    
    // Process each file
    for (const filePath of allFiles) {
      if (processedFiles.has(filePath)) continue;
      processedFiles.add(filePath);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineNumber = i + 1;
          
          // Check if this is an import from @/core
          if (line.includes('from') && line.includes('@/core')) {
            // Parse the import statement
            const importMatch = line.match(/^import\s+(?:(type\s+)?\{([^}]+)\}|([^\{]+))\s+from\s+['"](@\/core\/[^'"]+)['"]/);
            
            if (importMatch) {
              const isAlreadyType = !!importMatch[1];
              const namedImports = importMatch[2];
              const defaultImport = importMatch[3];
              const sourceModule = importMatch[4];
              
              // Skip if already using import type
              if (isAlreadyType) continue;
              
              // Check if this module has type-only exports
              const typeExports = typeOnlyExports.get(sourceModule);
              
              if (typeExports) {
                if (namedImports) {
                  // Check each named import
                  const imports = namedImports.split(',').map(name => name.trim());
                  const allImportsAreTypes = imports.every(name => 
                    typeExports.has(name) || 
                    name.endsWith('Entity') ||
                    name.endsWith('Metadata') ||
                    name.endsWith('Config') ||
                    name.endsWith('Store') ||
                    name.endsWith('Type') ||
                    name.endsWith('Interface') ||
                    name.endsWith('Props') ||
                    name.endsWith('Options') ||
                    name.endsWith('State')
                  );
                  
                  if (allImportsAreTypes && line.startsWith('import {')) {
                    const fixedImport = line.replace('import {', 'import type {');
                    
                    allFixes.push({
                      file: filePath,
                      original: line,
                      fixed: fixedImport,
                      success: true,
                      line: lineNumber
                    });
                    
                    console.log(`📝 ${path.basename(filePath)}:${lineNumber}`);
                    console.log(`   BEFORE: ${line}`);
                    console.log(`   AFTER:  ${fixedImport}`);
                    console.log('');
                  }
                }
              }
            }
          }
        }
      } catch (error: any) {
        console.log(`⚠️  Error processing ${filePath}: ${error.message}`);
      }
    }
    
    // Step 3: Also look for specific patterns that might have been missed
    console.log('\n🔍 Running targeted searches for common patterns...\n');
    
    const targetedPatterns = [
      { pattern: 'DataStore', module: '@/core/state/stores/DataStore' },
      { pattern: 'Entity', modules: ['@/core/models', '@/core/config'] },
      { pattern: 'Metadata', modules: ['@/core/config', '@/core/shared'] },
      { pattern: 'Props', modules: ['@/core/components', '@/core/typings'] },
      { pattern: 'State', modules: ['@/core/state'] },
      { pattern: 'Config', modules: ['@/core/config'] },
      { pattern: 'Type', modules: ['@/core/typings', '@/core/models'] },
      { pattern: 'Options', modules: ['@/core/config'] },
      { pattern: 'Interface', modules: ['@/core'] }
    ];
    
    for (const { pattern, modules } of targetedPatterns) {
      console.log(`🔎 Checking pattern: ${pattern}`);
      
      const moduleList = Array.isArray(modules) ? modules : [modules];
      const modulePattern = moduleList.join('|').replace(/\//g, '\\/');
      
      const findCmd = `grep -rn "import.*${pattern}.*from.*@/core" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "import type" | head -50 || true`;
      
      try {
        const output = execSync(findCmd, { encoding: 'utf8' });
        const lines = output.split('\n').filter(Boolean);
        
        if (lines.length > 0) {
          console.log(`   📊 Found ${lines.length} potential ${pattern} imports to check`);
          
          for (const importLine of lines) {
            const [filePath, lineNumStr, ...rest] = importLine.split(':');
            const lineNum = parseInt(lineNumStr) || 1;
            const lineText = rest.join(':').trim();
            
            // Skip if already in fixes
            const alreadyFixed = allFixes.some(f => 
              f.file === filePath && f.line === lineNum
            );
            
            if (!alreadyFixed && lineText.includes('import {')) {
              const fixedImport = lineText.replace('import {', 'import type {');
              
              allFixes.push({
                file: filePath,
                original: lineText,
                fixed: fixedImport,
                success: true,
                line: lineNum
              });
            }
          }
        }
      } catch (error: any) {
        // Continue on error
      }
    }
    
    // Remove duplicates
    const uniqueFixes = Array.from(
      new Map(allFixes.map(fix => [`${fix.file}:${fix.line}:${fix.original}`, fix])).values()
    );
    
    if (uniqueFixes.length > 0) {
      console.log('='.repeat(80));
      console.log('📊 CHANGE SUMMARY');
      console.log('='.repeat(80));
      
      console.log(`\n📋 Total changes: ${uniqueFixes.length} import(s) in ${new Set(uniqueFixes.map(f => f.file)).size} file(s)\n`);
      
      // Group fixes by file for better display
      const fixesByFile: Record<string, FixResult[]> = {};
      uniqueFixes.forEach(fix => {
        if (!fixesByFile[fix.file]) {
          fixesByFile[fix.file] = [];
        }
        fixesByFile[fix.file].push(fix);
      });
      
      // Show detailed changes per file
      Object.entries(fixesByFile).forEach(([filePath, fixes]) => {
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(`📄 ${relativePath} (${fixes.length} change${fixes.length > 1 ? 's' : ''}):`);
        
        fixes.forEach((fix, index) => {
          console.log(`   ${index + 1}. Line ${fix.line}:`);
          console.log(`      ❌ ${fix.original}`);
          console.log(`      ✅ ${fix.fixed}`);
        });
        console.log('');
      });
      
      // Generate report and ask for confirmation
      const reportDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFile = path.join(reportDir, `core-type-import-fixes-${timestamp}.md`);
      
      // Create report file
      let reportContent = `# Core Type Import Fix Report\n\n`;
      reportContent += `**Generated:** ${new Date().toISOString()}\n`;
      reportContent += `**Total fixes:** ${uniqueFixes.length}\n`;
      reportContent += `**Files modified:** ${Object.keys(fixesByFile).length}\n\n`;
      
      // Add summary table
      reportContent += `## Summary\n\n`;
      reportContent += `| File | Changes | Status |\n`;
      reportContent += `|------|---------|--------|\n`;
      
      Object.entries(fixesByFile).forEach(([filePath, fixes]) => {
        const relativePath = path.relative(process.cwd(), filePath);
        reportContent += `| \`${relativePath}\` | ${fixes.length} | ✅ Ready |\n`;
      });
      
      fs.writeFileSync(reportFile, reportContent, 'utf8');
      console.log(`📊 Detailed report saved to: ${reportFile}\n`);
      
      // Ask for confirmation
      console.log('🚀 Apply these changes? (y/n)');
      const confirmed = await promptConfirmation();
      
      // In the confirmed section:
      if (confirmed) {
        // Apply fixes using shared helper
        const fixesByFileGrouped = groupFixesByFile(uniqueFixes);
        
        console.log('\n🔧 Applying fixes...\n');
        let applied = 0;
        
        for (const [filePath, fileFixes] of fixesByFileGrouped) {
          try {
            // Create backup
            const backupPath = createBackup(filePath);
            console.log(`💾 Backup created: ${backupPath}`);
            
            // ADD verbose: true HERE
            const result = await applyFixesShared(fileFixes, { verbose: true });
            
            if (result) {
              applied += fileFixes.length;
            }
          } catch (error: any) {
            console.error(`❌ Error fixing ${filePath}:`, error.message);
          }
        }
        
        console.log('\n' + '='.repeat(80));
        console.log('📊 FINAL RESULTS');
        console.log('='.repeat(80));
        console.log(`✅ Successfully applied: ${applied} fixes`);
        console.log(`📁 Files modified: ${Object.keys(fixesByFile).length}`);
        
        if (applied === uniqueFixes.length) {
          console.log('\n🎉 All core type imports fixed successfully!');
          
          // Run one more check to make sure we got everything
          console.log('\n🔍 Verifying all fixes were applied...');
          await verifyFixes();
        }
      } else {
        console.log('\n❌ Changes cancelled');
      }
    } else {
      console.log('\n✅ No type-only import fixes needed!');
    }
  } catch (error: any) {
    console.error('❌ Error searching for imports:', error.message);
  }
}


// Helper function to find type-only exports
function findTypeOnlyExports(content: string): string[] {
  const typeExports: string[] = [];
  
  // Match interface exports
  const interfaceExports = content.match(/export\s+interface\s+(\w+)/g) || [];
  interfaceExports.forEach(exportLine => {
    const match = exportLine.match(/export\s+interface\s+(\w+)/);
    if (match) typeExports.push(match[1]);
  });
  
  // Match type exports
  const typeAliasExports = content.match(/export\s+type\s+(\w+)(?:\s*=|;)/g) || [];
  typeAliasExports.forEach(exportLine => {
    const match = exportLine.match(/export\s+type\s+(\w+)/);
    if (match) typeExports.push(match[1]);
  });
  
  // Match export type { ... } statements
  const exportTypeStatements = content.match(/export\s+type\s*\{([^}]+)\}/g) || [];
  exportTypeStatements.forEach(exportLine => {
    const match = exportLine.match(/export\s+type\s*\{([^}]+)\}/);
    if (match) {
      const exports = match[1].split(',').map(name => name.trim()).filter(Boolean);
      typeExports.push(...exports);
    }
  });
  
  return [...new Set(typeExports)]; // Remove duplicates
}



// Verification function
// Enhanced verification function
async function verifyFixes() {
  console.log('\n🔍 Running verification check...\n');
  
  // Find imports that should be type-only
  const findCmd = `grep -rn "import.*from.*@/core" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "import type" || true`;
  
  try {
    const output = execSync(findCmd, { encoding: 'utf8' });
    const remaining = output.split('\n').filter(Boolean);
    
    if (remaining.length === 0) {
      console.log('✅ Verification passed: No remaining non-type imports found');
      return;
    }
    
    console.log(`⚠️  Found ${remaining.length} potential issues remaining:\n`);
    
    // Group imports by type to show what needs fixing
    const importIssues = new Map<string, Array<{
      file: string;
      line: number;
      importText: string;
      shouldBeType: boolean;
      reason: string;
    }>>();
    
    // Instead of hardcoded patterns, use the classifier to check each import
    for (const importLine of remaining) {
      const match = importLine.match(/^(.*?):(\d+):(.*)$/);
      if (!match) continue;
      
      const [, filePath, lineNumStr, importText] = match;
      const lineNum = parseInt(lineNumStr) || 1;
      
      // Clean up the import text for analysis
      const cleanImport = importText.trim();
      
      // Extract import names from the statement
      const importNames = extractImportNames(cleanImport);
      
      // Check each import name using the classifier
      importNames.forEach(importName => {
        if (classifier.originalShouldBeTypeImport(importName)) {
          // Get the reason from the classifier if you have that capability
          // If your classifier doesn't track reasons, you can add this functionality
          const key = `Type import: ${importName}`;
          if (!importIssues.has(key)) {
            importIssues.set(key, []);
          }
          importIssues.get(key)!.push({
            file: filePath,
            line: lineNum,
            importText: cleanImport,
            shouldBeType: true,
            reason: `${importName} should be a type-only import`
          });
        }
      });
    }
    
    // Sort issues by frequency (most common first)
    const sortedIssues = Array.from(importIssues.entries())
      .sort(([, a], [, b]) => b.length - a.length);
    
    // Show summary by type
    console.log('📊 SUMMARY BY TYPE:');
    console.log('─'.repeat(80));
    
    let totalTypeIssues = 0;
    sortedIssues.forEach(([type, issues]) => {
      console.log(`\n🔸 ${type}: ${issues.length} occurrence(s)`);
      totalTypeIssues += issues.length;
      
      // Show first 2 examples
      issues.slice(0, 2).forEach((issue, i) => {
        const fileName = path.basename(issue.file);
        const fixedImport = issue.importText.replace('import {', 'import type {');
        console.log(`   ${i + 1}. ${fileName}:${issue.line}`);
        console.log(`      ❌ Current: ${issue.importText}`);
        console.log(`      ✅ Should be: ${fixedImport}`);
      });
      
      if (issues.length > 2) {
        console.log(`      ... and ${issues.length - 2} more`);
      }
    });
    
    // Show remaining imports that weren't categorized
    const categorizedCount = totalTypeIssues;
    const uncategorizedCount = remaining.length - categorizedCount;
    
    if (uncategorizedCount > 0) {
      console.log(`\n🔹 Other imports to check: ${uncategorizedCount}`);
      
      // Show a few examples of uncategorized imports
      let shown = 0;
      console.log('\n📝 Examples of imports that need manual review:');
      for (const importLine of remaining) {
        const match = importLine.match(/^(.*?):(\d+):(.*)$/);
        if (!match) continue;
        
        const [, filePath, lineNumStr, importText] = match;
        const lineNum = parseInt(lineNumStr) || 1;
        const cleanImport = importText.trim();
        
        // Skip if this import was already categorized
        let wasCategorized = false;
        for (const [, issues] of sortedIssues) {
          if (issues.some(issue => 
            issue.file === filePath && 
            issue.line === lineNum && 
            issue.importText === cleanImport
          )) {
            wasCategorized = true;
            break;
          }
        }
        
        if (!wasCategorized && shown < 5) {
          const fileName = path.basename(filePath);
          console.log(`   ${fileName}:${lineNum}: ${cleanImport}`);
          shown++;
        }
        
        if (shown >= 5) break;
      }
      
      if (uncategorizedCount > 5) {
        console.log(`   ... and ${uncategorizedCount - 5} more`);
      }
    }
    
    // Show total statistics
    console.log('\n📈 STATISTICS:');
    console.log('─'.repeat(80));
    console.log(`   Total imports found: ${remaining.length}`);
    console.log(`   Type-only imports identified: ${categorizedCount}`);
    console.log(`   Needs manual review: ${uncategorizedCount}`);
    console.log(`   Unique types: ${sortedIssues.length}`);
    
    // Generate quick fix command
    if (sortedIssues.length > 0) {
      const mostCommonType = sortedIssues[0][0];
      const typeName = mostCommonType.replace('Named import: ', '').replace('Default import: ', '');
      
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('─'.repeat(80));
      console.log(`1. Run focused fix for "${typeName}":`);
      console.log(`   pnpm fix:interface-imports:core-types --aggressive`);
      console.log(`2. Or run the regular fix again to catch more:`);
      console.log(`   pnpm fix:interface-imports:core-types`);
      console.log(`3. Check specific files:`);
      sortedIssues.slice(0, 3).forEach(([type, issues]) => {
        const exampleFile = issues[0]?.file;
        if (exampleFile) {
          const relativePath = path.relative(process.cwd(), exampleFile);
          console.log(`   - ${relativePath}`);
        }
      });
    }
    
    // Generate a quick fix file
    const fixFile = path.join(process.cwd(), 'reports', `remaining-fixes-${Date.now()}.txt`);
    const fixDir = path.dirname(fixFile);
    if (!fs.existsSync(fixDir)) {
      fs.mkdirSync(fixDir, { recursive: true });
    }
    
    let fixContent = `# Remaining Type Import Issues\n`;
    fixContent += `Generated: ${new Date().toISOString()}\n`;
    fixContent += `Total issues: ${remaining.length}\n\n`;
    
    sortedIssues.forEach(([type, issues]) => {
      fixContent += `## ${type}\n`;
      issues.forEach(issue => {
        const relativePath = path.relative(process.cwd(), issue.file);
        const fixedImport = issue.importText.replace('import {', 'import type {');
        fixContent += `- ${relativePath}:${issue.line}\n`;
        fixContent += `  ❌ ${issue.importText}\n`;
        fixContent += `  ✅ ${fixedImport}\n`;
      });
      fixContent += '\n';
    });
    
    fs.writeFileSync(fixFile, fixContent, 'utf8');
    console.log(`\n📊 Detailed report saved to: ${fixFile}`);
    
  } catch (error) {
    console.log('✅ Verification completed');
  }
}

async function quickScanInterfaceImports() {
  console.log('🚀 QUICK SCAN for interface import issues...\n');
  console.log('📊 This scan focuses on common interface patterns and is much faster than a full scan.\n');
  
  // Common interface patterns that should always be type-only
  const commonPatterns = [
    { 
      pattern: 'DataStore', 
      description: 'Data stores and interfaces',
      examples: ['DataStore', 'IDataStore', 'DataStoreConfig', 'DataStoreOptions']
    },
    { 
      pattern: 'Entity', 
      description: 'Database entities and models',
      examples: ['Entity', 'BaseEntity', 'UserEntity', 'ProductEntity']
    },
    { 
      pattern: 'Props', 
      description: 'React component props',
      examples: ['Props', 'ComponentProps', 'ButtonProps', 'ModalProps']
    },
    { 
      pattern: 'State', 
      description: 'Application state types',
      examples: ['State', 'AppState', 'UserState', 'FormState']
    },
    { 
      pattern: 'Config', 
      description: 'Configuration types',
      examples: ['Config', 'AppConfig', 'DatabaseConfig', 'AuthConfig']
    },
    { 
      pattern: 'Options', 
      description: 'Options and settings types',
      examples: ['Options', 'PluginOptions', 'BuildOptions', 'RuntimeOptions']
    },
    { 
      pattern: 'Interface', 
      description: 'Interface declarations',
      examples: ['Interface', 'UserInterface', 'ApiInterface', 'ServiceInterface']
    },
    { 
      pattern: 'Type', 
      description: 'Type aliases',
      examples: ['Type', 'UserType', 'ActionType', 'ResponseType']
    },
    { 
      pattern: 'Metadata', 
      description: 'Metadata types',
      examples: ['Metadata', 'FileMetadata', 'UserMetadata', 'DocumentMetadata']
    },
    { 
      pattern: 'Payload', 
      description: 'Data payloads',
      examples: ['Payload', 'ApiPayload', 'EventPayload', 'RequestPayload']
    }
  ];
  
  const allIssues: Array<{
    pattern: string;
    fileCount: number;
    issueCount: number;
    exampleFiles: string[];
  }> = [];
  
  let totalFilesWithIssues = 0;
  let totalIssuesFound = 0;
  
  console.log('🔍 Checking for imports without "import type"...\n');
  
  for (const { pattern, description, examples } of commonPatterns) {
    console.log(`🔎 Pattern: ${pattern}`);
    console.log(`   📝 ${description}`);
    console.log(`   💡 Examples: ${examples.slice(0, 3).join(', ')}${examples.length > 3 ? '...' : ''}`);
    
    try {
      // Step 1: Find files that import anything matching this pattern
      console.log(`   🔍 Searching for imports...`);
      const findCmd = `grep -l "import.*${pattern}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -15 || true`;
      const filesOutput = execSync(findCmd, { 
        encoding: 'utf8',
        timeout: 3000 
      });
      
      const files = filesOutput.split('\n').filter(Boolean);
      
      if (files.length === 0) {
        console.log(`   ✅ No files importing ${pattern}\n`);
        continue;
      }
      
      console.log(`   📊 Found ${files.length} file(s) importing ${pattern}`);
      
      let patternIssueCount = 0;
      const patternExampleFiles: string[] = [];
      
      // Step 2: Check each file for imports without "import type"
      for (const file of files) {
        try {
          const checkCmd = `grep -n "import.*${pattern}.*from" "${file}" 2>/dev/null | grep -v "import type" | head -3 || true`;
          const issuesOutput = execSync(checkCmd, { 
            encoding: 'utf8',
            timeout: 1000 
          });
          
          const issues = issuesOutput.split('\n').filter(Boolean);
          
          if (issues.length > 0) {
            patternIssueCount += issues.length;
            patternExampleFiles.push(path.basename(file));
            
            // Show first issue as example
            if (patternExampleFiles.length === 1 && issues.length > 0) {
              const [firstIssue] = issues;
              const [, lineNum, importText] = firstIssue.split(':');
              const truncatedImport = importText.length > 60 ? importText.substring(0, 60) + '...' : importText;
              console.log(`      ❌ ${path.basename(file)}:${lineNum}: ${truncatedImport}`);
            }
          }
        } catch {
          // Skip file on error
          continue;
        }
      }
      
      if (patternIssueCount > 0) {
        console.log(`   ⚠️  Found ${patternIssueCount} import(s) without "import type" in ${patternExampleFiles.length} file(s)`);
        console.log(`      📁 Files: ${patternExampleFiles.slice(0, 3).join(', ')}${patternExampleFiles.length > 3 ? `... (+${patternExampleFiles.length - 3} more)` : ''}`);
        
        allIssues.push({
          pattern,
          fileCount: patternExampleFiles.length,
          issueCount: patternIssueCount,
          exampleFiles: patternExampleFiles
        });
        
        totalFilesWithIssues += patternExampleFiles.length;
        totalIssuesFound += patternIssueCount;
      } else {
        console.log(`   ✅ All ${pattern} imports use "import type"\n`);
      }
      
    } catch (error: any) {
      if (error.message.includes('timeout')) {
        console.log(`   ⏱️  Timeout searching for ${pattern} (skipping)\n`);
      } else {
        console.log(`   ⚠️  Error searching for ${pattern}: ${error.message}\n`);
      }
      continue;
    }
    
    console.log(''); // Empty line between patterns
  }
  
  // Generate summary report
  console.log('📊 QUICK SCAN RESULTS');
  console.log('='.repeat(50));
  
  if (allIssues.length === 0) {
    console.log('\n🎉 SUCCESS: No issues found!');
    console.log('All common interface patterns are correctly using "import type"');
    return;
  }
  
  // Sort issues by count (highest first)
  allIssues.sort((a, b) => b.issueCount - a.issueCount);
  
  console.log(`\n⚠️  FOUND ${totalIssuesFound} ISSUES across ${totalFilesWithIssues} files\n`);
  
  console.log('📈 TOP ISSUES BY PATTERN:');
  console.log('┌' + '─'.repeat(40) + '┐');
  
  allIssues.slice(0, 8).forEach((issue, index) => {
    const rank = index + 1;
    const bar = '█'.repeat(Math.min(Math.floor(issue.issueCount / 3), 20));
    console.log(`│ ${rank}. ${issue.pattern.padEnd(12)} ${issue.issueCount.toString().padStart(3)} issues ${bar.padEnd(20)} │`);
  });
  
  console.log('└' + '─'.repeat(40) + '┘');
  
  // Show detailed breakdown
  console.log('\n📋 DETAILED BREAKDOWN:');
  allIssues.forEach(issue => {
    console.log(`\n🔸 ${issue.pattern}: ${issue.issueCount} issue(s) in ${issue.fileCount} file(s)`);
    if (issue.exampleFiles.length > 0) {
      console.log(`   📁 Files affected: ${issue.exampleFiles.slice(0, 5).join(', ')}${issue.exampleFiles.length > 5 ? `... (+${issue.exampleFiles.length - 5} more)` : ''}`);
    }
  });
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (allIssues.length > 0) {
    const topPattern = allIssues[0].pattern;
    console.log(`1. Run focused fix: pnpm fix:interface-imports:target src/ --pattern ${topPattern}`);
    console.log(`2. Use safe mode: pnpm fix:interface-imports:safe`);
    console.log(`3. Fix top issue first: ${topPattern} (${allIssues[0].issueCount} issues)`);
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('• Run interactive mode: pnpm fix:interface-imports:interactive');
  console.log('• Run safe mode: pnpm fix:interface-imports:safe');
  console.log('• Run full scan: pnpm fix:interface-imports:scan --report');
  
  // Save quick report
  const reportDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const quickReportFile = path.join(reportDir, `quick-scan-${timestamp}.md`);
  
  let reportContent = `# Quick Interface Import Scan Report\n\n`;
  reportContent += `**Generated:** ${new Date().toISOString()}\n`;
  reportContent += `**Total issues found:** ${totalIssuesFound}\n`;
  reportContent += `**Files affected:** ${totalFilesWithIssues}\n`;
  reportContent += `**Patterns checked:** ${commonPatterns.length}\n\n`;
  
  reportContent += `## Issues Found\n\n`;
  reportContent += `| Pattern | Issues | Files | Priority |\n`;
  reportContent += `|---------|--------|-------|----------|\n`;
  
  allIssues.forEach(issue => {
    const priority = issue.issueCount > 10 ? '🔴 HIGH' : issue.issueCount > 3 ? '🟡 MEDIUM' : '🟢 LOW';
    reportContent += `| ${issue.pattern} | ${issue.issueCount} | ${issue.fileCount} | ${priority} |\n`;
  });
  
  reportContent += `\n## Recommended Actions\n\n`;
  if (allIssues.length > 0) {
    const topIssue = allIssues[0];
    reportContent += `1. **Fix ${topIssue.pattern} first** - ${topIssue.issueCount} issues across ${topIssue.fileCount} files\n`;
    reportContent += `2. Use \`pnpm fix:interface-imports:safe\` for automatic high-confidence fixes\n`;
    reportContent += `3. Use \`pnpm fix:interface-imports:interactive\` for selective fixing\n`;
  }
  
  reportContent += `\n## Files to Check\n\n`;
  allIssues.forEach(issue => {
    reportContent += `### ${issue.pattern}\n`;
    issue.exampleFiles.forEach(file => {
      reportContent += `- ${file}\n`;
    });
    reportContent += '\n';
  });
  
  fs.writeFileSync(quickReportFile, reportContent, 'utf8');
  console.log(`\n📊 Quick report saved to: ${quickReportFile}`);
  console.log('\n✅ Quick scan complete!');
}



async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Interface Import Fixer
======================
Fixes 'import type' issues for TypeScript interfaces and types.

Usage:
  tsx fix-interface-imports.ts <command> [options]

Commands:
  target <path>          Analyze and fix specific file or directory
  all                    Fix ALL interface imports in the project
  quick                  Quick-fix DataStore imports specifically
  preview                Preview what would be fixed (no changes)
  scan                   Scan and report on interface import issues
  interactive            Interactive mode with per-interface confirmation
  safe                   Only fix high-confidence interface imports
  analyze <path>         Analyze a file or directory (alias for target)
  core-types             Fix type-only imports from core modules

Options:
  --apply                Apply fixes immediately (without confirmation)
  --dry-run              Preview what would be changed without applying
  --help, -h             Show this help
  --report               Generate detailed report (with scan command)
  --quick                Quick scan mode (faster but less thorough)
  --deep-scan            Deep scan mode (more comprehensive, slower)
  --all                  Same as --deep-scan
  --aggressive           Aggressive mode (more pattern matching)

Examples:
  # Fix type imports from core modules
  tsx fix-interface-imports.ts core-types
  
  # Deep scan for core types
  tsx fix-interface-imports.ts core-types --deep-scan
  
  # Analyze a specific file
  tsx fix-interface-imports.ts target src/core/state/stores/DataStore.ts --dry-run
  
  # Analyze a directory
  tsx fix-interface-imports.ts analyze src/core/snapshots --dry-run
  
  # Fix ALL interface imports
  tsx fix-interface-imports.ts all
  
  # Quick-fix DataStore imports
  tsx fix-interface-imports.ts quick
  
  # Preview all fixes
  tsx fix-interface-imports.ts preview
  
  # Scan and generate report
  tsx fix-interface-imports.ts scan --report
  
  # Quick scan (faster)
  tsx fix-interface-imports.ts scan --quick
  
  # Interactive mode
  tsx fix-interface-imports.ts interactive
  
  # Safe mode (only high-confidence interface imports)
  tsx fix-interface-imports.ts safe
    `);
    return;
  }
  
  const command = args[0];
  const restArgs = args.slice(1);
  const dryRun = restArgs.includes('--dry-run');
  const apply = restArgs.includes('--apply');
  const report = restArgs.includes('--report');
  const quick = restArgs.includes('--quick');
  const deepScan = restArgs.includes('--deep-scan') || restArgs.includes('--all');
  const aggressive = restArgs.includes('--aggressive');
  
  if (dryRun) {
    console.log('🔍 DRY RUN - No changes will be made\n');
  }
  
  try {
    switch (command) {
      case 'core-types':
        if (dryRun) {
          console.log('⚠️  DRY RUN: Would fix type-only imports from core modules');
          // Create a preview version for dry-run
          const previewArgs = [...restArgs.filter(arg => !arg.startsWith('--')), '--preview'];
          await fixTypeOnlyImportsFromCore(previewArgs);
        } else {
          // Pass all remaining args (including flags) to the function
          await fixTypeOnlyImportsFromCore(restArgs);
        }
        break;
        
      case 'target': {
        const target = restArgs.find(arg => !arg.startsWith('--'));
        if (!target) {
          console.error('❌ Error: No target specified for analysis');
          console.log('   Usage: tsx fix-interface-imports.ts target <file-or-directory>');
          process.exit(1);
        }
        
        await focusOnTarget(target);
        break;
      }

      case 'analyze': {
        const target = restArgs.find(arg => !arg.startsWith('--'));
        if (!target) {
          console.error('❌ Error: No target specified for analysis');
          console.log('   Usage: tsx fix-interface-imports.ts target <file-or-directory>');
          process.exit(1);
        }
        
        // FIX: Always use focusOnTarget, which handles both files and directories
        await focusOnTarget(target);
        break;
      }
      
      case 'all':
        if (dryRun) {
          console.log('⚠️  DRY RUN: Would fix ALL interface imports');
          const interfaceFiles = findInterfaceExports();
          console.log(`Found ${interfaceFiles.length} interface files to analyze`);
        } else {
          await fixAllInterfaceImports();
        }
        break;
        
      case 'quick':
        if (dryRun) {
          console.log('⚠️  DRY RUN: Would quick-fix DataStore imports');
          const findCmd = `grep -rn "import.*DataStore.*from.*DataStore" src/ --include="*.ts" --include="*.tsx" | grep -v "import type"`;
          const output = execSync(findCmd, { encoding: 'utf8' });
          const imports = output.split('\n').filter(Boolean);
          console.log(`Found ${imports.length} DataStore imports to fix`);
        } else {
          await quickFixDataStore();
        }
        break;
        
      case 'preview':
        await previewInterfaceFixes(restArgs);
        break;
        
      case 'scan':
        if (quick) {
          await quickScanInterfaceImports();
        } else {
          await scanInterfaceImports(report);
        }
        break;
        
      case 'interactive':
        await interactiveFixInterfaceImports(restArgs);
        break;
        
      case 'safe':
        await safeFixInterfaceImports(restArgs);
        break;
        
      default: {
        // Handle old-style direct target (backward compatibility)
        const target = args.find(arg => !arg.startsWith('--'));
        if (target && fs.existsSync(path.resolve(process.cwd(), target))) {
          console.log('⚠️  Using legacy syntax - consider using "target <path>" instead');
          const fixes = await collectFixesForTarget(target);
          
          if (fixes.length === 0) {
            console.log('\n✅ No interface import fixes needed!');
            return;
          }
          
          console.log(`\n📊 Summary:`);
          console.log(`   Total fixes needed: ${fixes.length}`);
          console.log(`   Files affected: ${new Set(fixes.map(f => f.file)).size}`);
          
          if (!dryRun && (apply || await promptConfirmation(`Apply ${fixes.length} fixes?`))) {
            await applyFixesShared(fixes);
          }
        } else {
          console.error(`❌ Unknown command: ${command}`);
          console.log('   Use --help to see available commands');
          process.exit(1);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error executing command ${command}:`, error);
    process.exit(1);
  }
}

// ES Module entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
