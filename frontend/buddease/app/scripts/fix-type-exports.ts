// fix-type-exports.ts
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

interface TypeExportIssue {
  file: string;
  line: number;
  exportName: string;
  exportType: 'interface' | 'type' | 'class' | 'function' | 'const';
  isTypeOnly: boolean;
  usedAsRuntime: boolean;
  importedBy: string[];
}

class TypeExportAnalyzer {
  private projectRoot: string;
  private srcRoot: string;
  private issues: TypeExportIssue[] = [];
  private exportMap = new Map<string, Array<{
    file: string;
    name: string;
    isTypeOnly: boolean;
  }>>();

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.srcRoot = path.join(projectRoot, 'src');
  }



  async analyze(): Promise<TypeExportIssue[]> {
    console.log('🔍 Analyzing type exports for ESM compatibility...\n');
    
    // 1. Scan all exports in the project
    const allSourceFiles = this.getAllSourceFiles(this.srcRoot);
    console.log(`📂 Found ${allSourceFiles.length} source files`);
    
    // 2. Build export map
    for (const file of allSourceFiles) {
      await this.analyzeExports(file);
    }
    
    // 3. Find import sites to determine usage
    for (const file of allSourceFiles) {
      await this.analyzeImports(file);
    }
    
    // 4. Identify problematic exports
    this.identifyProblematicExports();
    
    return this.issues;
  }


  async focusOnStores(): Promise<void> {
    console.log('🎯 Focusing on store-related type imports...\n');
    
    // 1. Find all store files
    const storeFiles = this.getAllSourceFiles(this.srcRoot)
      .filter(file => /stores?/.test(file) || /DataStore/.test(file));
    
    console.log(`📂 Found ${storeFiles.length} store-related files`);
    
    // 2. Analyze each store file
    for (const storeFile of storeFiles) {
      console.log(`\n📊 Analyzing: ${path.relative(this.projectRoot, storeFile)}`);
      
      const content = fs.readFileSync(storeFile, 'utf8');
      const sourceFile = ts.createSourceFile(
        storeFile,
        content,
        ts.ScriptTarget.Latest,
        true
      );
      
      // Find all exports - FIXED: renamed from 'exports' to 'foundExports'
      const foundExports: Array<{ name: string; isTypeOnly: boolean }> = [];
      
      const visit = (node: ts.Node) => {
        // Check for class exports (likely stores)
        if (ts.isClassDeclaration(node) && node.name) {
          const modifiers = node.modifiers || [];
          if (modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
            foundExports.push({  // FIXED: changed from exports.push
              name: node.name.getText(),
              isTypeOnly: false // Classes are runtime
            });
          }
        }
        
        // Check for interface/type exports
        if (ts.isInterfaceDeclaration(node) && node.name) {
          const modifiers = node.modifiers || [];
          if (modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
            foundExports.push({  // FIXED: changed from exports.push
              name: node.name.getText(),
              isTypeOnly: true
            });
          }
        }
        
        if (ts.isTypeAliasDeclaration(node) && node.name) {
          const modifiers = node.modifiers || [];
          if (modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
            foundExports.push({  // FIXED: changed from exports.push
              name: node.name.getText(),
              isTypeOnly: true
            });
          }
        }
        
        ts.forEachChild(node, visit);
      };
      
      visit(sourceFile);
      
      // Report findings
      if (foundExports.length > 0) {  // FIXED: changed from exports.length
        foundExports.forEach(exp => {  // FIXED: changed from exports.forEach
          const marker = exp.isTypeOnly ? '📝 (type-only)' : '⚡ (runtime)';
          console.log(`   ${marker} ${exp.name}`);
        });
        
        // Check if there are type-only exports that might be problematic
        const typeOnlyExports = foundExports.filter(e => e.isTypeOnly);  // FIXED: changed from exports.filter
        if (typeOnlyExports.length > 0) {
          console.log(`   ⚠️  Found ${typeOnlyExports.length} type-only exports that might need 'import type'`);
        }
      } else {
        console.log('   No exports found');
      }
    }
    
    // 3. Find all imports of store files
    console.log('\n🔍 Searching for store imports throughout the project...');
    
    const allFiles = this.getAllSourceFiles(this.srcRoot);
    const storeImports: Array<{
      file: string;
      line: number;
      importName: string;
      importPath: string;
      isTypeOnly: boolean;
    }> = [];
    
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      const sourceFile = ts.createSourceFile(
        file,
        content,
        ts.ScriptTarget.Latest,
        true
      );
      
      const visit = (node: ts.Node) => {
        if (ts.isImportDeclaration(node)) {
          const importPath = (node.moduleSpecifier as ts.StringLiteral).text;
          
          // Check if this import is from a store
          if (importPath.includes('stores') || importPath.includes('DataStore')) {
            const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
            const isTypeOnly = node.importClause?.isTypeOnly || false;
            
            if (node.importClause?.namedBindings && 
                ts.isNamedImports(node.importClause.namedBindings)) {
              
              node.importClause.namedBindings.elements.forEach(element => {
                const importedName = element.name.getText();
                storeImports.push({
                  file,
                  line,
                  importName: importedName,
                  importPath,
                  isTypeOnly
                });
              });
            }
          }
        }
        
        ts.forEachChild(node, visit);
      };
      
      visit(sourceFile);
    }
    
    console.log(`📊 Found ${storeImports.length} store imports`);
    
    // Group problematic imports
    const problematicImports = storeImports.filter(imp => !imp.isTypeOnly);
    
    if (problematicImports.length > 0) {
      console.log(`\n🚨 Found ${problematicImports.length} potentially problematic imports (missing 'type' keyword):`);
      
      // Group by import path
      const grouped = problematicImports.reduce((acc, imp) => {
        const key = imp.importPath;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(imp);
        return acc;
      }, {} as Record<string, typeof problematicImports>);
      
      Object.entries(grouped).forEach(([importPath, imports]) => {
        console.log(`\n📦 From: ${importPath}`);
        
        // Group by file
        const byFile = imports.reduce((acc, imp) => {
          const key = imp.file;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(imp);
          return acc;
        }, {} as Record<string, typeof imports>);
        
        Object.entries(byFile).forEach(([file, fileImports]) => {
          const relativePath = path.relative(this.projectRoot, file);
          console.log(`   📄 ${relativePath}:`);
          
          fileImports.forEach(imp => {
            console.log(`      Line ${imp.line}: import { ${imp.importName} }`);
          });
        });
      });
      
      // Ask if user wants to fix them
      console.log('\n💡 To fix these, run:');
      console.log('   pnpm run fix-type-exports --stores --fix');
    }
  }

  private getAllSourceFiles(dir: string): string[] {
    const files: string[] = [];
    
    const scan = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        // Skip node_modules, dist, etc.
        if (entry.name.startsWith('.') || 
            entry.name === 'node_modules' || 
            entry.name === 'dist' ||
            entry.name === '.git' ||
            entry.name === 'build' ||
            entry.name === '.next') {
          continue;
        }
        
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (/\.(ts|tsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    };
    
    scan(dir);
    return files;
  }

  private async analyzeExports(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      const exportList: Array<{  // This is declared as exportList
        name: string;
        isTypeOnly: boolean;
        line: number;
      }> = [];

      const visit = (node: ts.Node) => {
        // Named exports: export { X, Y }
        if (ts.isExportDeclaration(node)) {
          const isTypeOnly = node.isTypeOnly || false;
          
          if (node.exportClause && ts.isNamedExports(node.exportClause)) {
            const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
            
            node.exportClause.elements.forEach(element => {
              exportList.push({  // Correct: using exportList
                name: element.name.getText(),
                isTypeOnly,
                line
              });
            });
          }
        }
        
        // Default export
        if (ts.isExportAssignment(node)) {
          const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          exportList.push({  // Correct: using exportList
            name: 'default',
            isTypeOnly: false,
            line
          });
        }
        
        // Direct exports: export class/interface/function/const
        const modifiers = (node as any).modifiers;
        if (modifiers?.some((m: any) => m.kind === ts.SyntaxKind.ExportKeyword)) {
          const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          
          if (ts.isClassDeclaration(node) && node.name) {
            exportList.push({  // Correct: using exportList
              name: node.name.getText(),
              isTypeOnly: false,
              line
            });
          } else if (ts.isInterfaceDeclaration(node) && node.name) {
            exportList.push({  // Correct: using exportList
              name: node.name.getText(),
              isTypeOnly: true,
              line
            });
          } else if (ts.isTypeAliasDeclaration(node) && node.name) {
            exportList.push({  // Correct: using exportList
              name: node.name.getText(),
              isTypeOnly: true,
              line
            });
          } else if (ts.isFunctionDeclaration(node) && node.name) {
            exportList.push({  // Correct: using exportList
              name: node.name.getText(),
              isTypeOnly: false,
              line
            });
          } else if (ts.isVariableStatement(node)) {
            // Handle variable statements with multiple declarations
            node.declarationList.declarations.forEach(decl => {
              if (ts.isIdentifier(decl.name)) {
                exportList.push({  // Correct: using exportList
                  name: decl.name.getText(),
                  isTypeOnly: false,
                  line
                });
              }
            });
          }
        }
        
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);

      // Store in export map - using exportList
      exportList.forEach(exp => {  // Changed: using exportList
        const key = exp.name;
        if (!this.exportMap.has(key)) {
          this.exportMap.set(key, []);
        }
        this.exportMap.get(key)!.push({
          file: filePath,
          name: exp.name,
          isTypeOnly: exp.isTypeOnly
        });
      });

    } catch (error) {
      console.warn(`⚠️ Could not analyze exports in ${filePath}:`, error);
    }
  }

  public getExportsForFile(filePath: string): Array<{
    name: string;
    isTypeOnly: boolean;
    line: number;
  }> {
    const results: Array<{
      name: string;
      isTypeOnly: boolean;
      line: number;
    }> = [];
    
    // Get all entries from exportMap
    const entries = Array.from(this.exportMap.entries());
    
    // Filter for exports that come from the specified file
    for (const [exportName, exportEntries] of entries) {
      // Find exports from this specific file
      const fileExports = exportEntries.filter(entry => entry.file === filePath);
      
      if (fileExports.length > 0) {
        // Get the first export from this file (there could be multiple with same name?)
        const firstExport = fileExports[0];
        
        results.push({
          name: exportName,
          isTypeOnly: firstExport.isTypeOnly,
          line: 0 // You'll need to store line numbers in your exportMap structure
        });
      }
    }
    
    return results;
  }
  // Or provide direct access to filtered exportMap
  public getExportMap(): Map<string, Array<{
    file: string;
    name: string;
    isTypeOnly: boolean;
  }>> {
    return this.exportMap;
  }

  private async analyzeImports(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      const importsMap = new Map<string, {  // Changed from 'exports' to 'importsMap'
        importPath: string;
        isTypeOnly: boolean;
        line: number;
      }>();

      const visit = (node: ts.Node) => {
        if (ts.isImportDeclaration(node)) {
          const importPath = (node.moduleSpecifier as ts.StringLiteral).text;
          const isTypeOnly = node.importClause?.isTypeOnly || false;
          const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
          
          if (node.importClause?.namedBindings && 
              ts.isNamedImports(node.importClause.namedBindings)) {
            
            node.importClause.namedBindings.elements.forEach(element => {
              const importedName = element.name.getText();
              importsMap.set(importedName, {  // Changed from 'exports' to 'importsMap'
                importPath,
                isTypeOnly,
                line
              });
            });
          }
          
          // Default import
          if (node.importClause?.name) {
            importsMap.set('default', {  // Changed from 'exports' to 'importsMap'
              importPath,
              isTypeOnly,
              line
            });
          }
        }
        
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);

      // Check each import against export map
      importsMap.forEach((importInfo, importedName) => {  // Changed from 'exports' to 'importsMap'
        const matchingExports = this.exportMap.get(importedName) || [];
        
        matchingExports.forEach(exp => {
          // Check if there's a potential issue
          if (exp.isTypeOnly && !importInfo.isTypeOnly) {
            // Type-only export being imported as runtime import
            this.issues.push({
              file: filePath,
              line: importInfo.line,
              exportName: importedName,
              exportType: this.determineExportType(exp.file, importedName),
              isTypeOnly: exp.isTypeOnly,
              usedAsRuntime: true,
              importedBy: [exp.file]
            });
          }
        });
      });

    } catch (error) {
      console.warn(`⚠️ Could not analyze imports in ${filePath}:`, error);
    }
  }

  private determineExportType(filePath: string, exportName: string): TypeExportIssue['exportType'] {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      let exportType: TypeExportIssue['exportType'] = 'type';

      const visit = (node: ts.Node) => {
        if (ts.isInterfaceDeclaration(node) && node.name?.getText() === exportName) {
          exportType = 'interface';
        } else if (ts.isTypeAliasDeclaration(node) && node.name?.getText() === exportName) {
          exportType = 'type';
        } else if (ts.isClassDeclaration(node) && node.name?.getText() === exportName) {
          exportType = 'class';
        } else if (ts.isFunctionDeclaration(node) && node.name?.getText() === exportName) {
          exportType = 'function';
        } else if (ts.isVariableStatement(node)) {
          node.declarationList.declarations.forEach(decl => {
            if (ts.isIdentifier(decl.name) && decl.name.getText() === exportName) {
              exportType = 'const';
            }
          });
        }
        
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
      return exportType;

    } catch (error) {
      return 'type';
    }
  }

  private identifyProblematicExports(): void {
    const typeOnlyExports = new Map<string, TypeExportIssue>();
    
    this.issues.forEach(issue => {
      const key = `${issue.exportName}@${issue.importedBy[0]}`;
      if (!typeOnlyExports.has(key) || issue.usedAsRuntime) {
        typeOnlyExports.set(key, issue);
      }
    });
    
    this.issues = Array.from(typeOnlyExports.values());
  }

  async fixIssues(): Promise<{ fixed: number; skipped: number }> {
    console.log('\n🔧 Fixing type export issues...\n');
    
    let fixed = 0;
    let skipped = 0;
    
    // Group issues by exporting file
    const issuesByFile = new Map<string, TypeExportIssue[]>();
    this.issues.forEach(issue => {
      const exportFile = issue.importedBy[0];
      if (!issuesByFile.has(exportFile)) {
        issuesByFile.set(exportFile, []);
      }
      issuesByFile.get(exportFile)!.push(issue);
    });
    
    // Fix each file
    for (const [filePath, fileIssues] of issuesByFile) {
      if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filePath}`);
        skipped += fileIssues.length;
        continue;
      }
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        let hasChanges = false;
        
        // Sort issues by line number (descending) to avoid line number shifts
        const sortedIssues = [...fileIssues].sort((a, b) => b.line - a.line);
        
        for (const issue of sortedIssues) {
          const lineIndex = issue.line - 1;
          if (lineIndex >= 0 && lineIndex < lines.length) {
            const line = lines[lineIndex];
            if (issue.exportType === 'interface' || issue.exportType === 'type') {
            // Check if it's already a type-only export
            if (!line.includes('export type') && !line.includes('export interface')) {
              // Fix: add 'type' keyword for type aliases
              if (issue.exportType === 'type') {
                const fixedLine = line.replace(/export\s+(type|interface)?/, 'export type ');
                lines[lineIndex] = fixedLine;
                hasChanges = true;
                fixed++;
                
                console.log(`✅ Fixed: ${path.relative(this.projectRoot, filePath)}:${issue.line}`);
                console.log(`   Before: ${line.trim()}`);
                console.log(`   After:  ${fixedLine.trim()}`);
              } else {
                  // For interfaces, ensure they're exported as type-only
                  if (!line.includes('export interface')) {
                    const fixedLine = line.replace(/export\s+/, 'export interface ');
                    lines[lineIndex] = fixedLine;
                    hasChanges = true;
                    fixed++;
                    
                    console.log(`✅ Fixed: ${path.relative(this.projectRoot, filePath)}:${issue.line}`);
                    console.log(`   Before: ${line.trim()}`);
                    console.log(`   After:  ${fixedLine.trim()}`);
                  }
                }
              } else {
                skipped++;
              }
            }
          }
        }
        
        // Write changes back
        if (hasChanges) {
          fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        }
        
      } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error);
        skipped += fileIssues.length;
      }
    }
    
    return { fixed, skipped };
  }

  generateReport(issues: TypeExportIssue[]): string {
    const reportLines: string[] = [
      '# 📦 Type Export Analysis Report',
      '',
      `**Generated:** ${new Date().toISOString()}`,
      `**Total Issues Found:** ${issues.length}`,
      '',
      '## 🚨 Type Export Issues',
      '',
      'These exports are defined as types/interfaces but may be imported at runtime, causing ESM errors:',
      '',
      '| File | Line | Export Name | Export Type | Issue |',
      '|------|------|-------------|-------------|-------|',
    ];
    
    issues.forEach(issue => {
      const relativePath = path.relative(this.projectRoot, issue.file);
      const issueDesc = issue.isTypeOnly && issue.usedAsRuntime 
        ? 'Type-only export used as runtime import'
        : 'Potential type/runtime mismatch';
      
      reportLines.push(
        `| ${relativePath} | ${issue.line} | ${issue.exportName} | ${issue.exportType} | ${issueDesc} |`
      );
    });
    
    reportLines.push(
      '',
      '## 🛠️ How to Fix',
      '',
      '### 1. **Fix Exporting File**',
      'Change type-only exports to use `export type`:',
      '```typescript',
      '// Before:',
      'export interface SnapshotManager { ... }',
      'export type MyType = { ... };',
      '',
      '// After:',
      'export interface SnapshotManager { ... } // Already correct',
      'export type MyType = { ... }; // Already correct',
      '```',
      '',
      '### 2. **Fix Importing File**',
      'Change runtime imports to type-only imports:',
      '```typescript',
      '// Before:',
      'import { SnapshotManager } from "@/app/hooks/useSnapshotManager";',
      '',
      '// After:',
      'import type { SnapshotManager } from "@/app/hooks/useSnapshotManager";',
      '```',
      '',
      '### 3. **Common Patterns**',
      '',
      '#### Interface exports that need fixing:',
      '```typescript',
      '// Bad - exported as runtime value',
      'export { SnapshotManager };',
      '',
      '// Good - exported as type',
      'export type { SnapshotManager };',
      '```',
      '',
      '#### Mixed exports:',
      '```typescript',
      '// Bad - mixing types and values',
      'export { SnapshotManager, useSnapshotManager };',
      '',
      '// Good - separate',
      'export type { SnapshotManager };',
      'export { useSnapshotManager };',
      '```',
      '',
      '## 📊 Statistics',
      ''
    );
    
    // Group by export type
    const byType = issues.reduce((acc, issue) => {
      acc[issue.exportType] = (acc[issue.exportType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(byType).forEach(([type, count]) => {
      reportLines.push(`- **${type} exports:** ${count}`);
    });
    
    // Most problematic files
    const byFile = issues.reduce((acc, issue) => {
      const key = issue.file;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topFiles = Object.entries(byFile)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    if (topFiles.length > 0) {
      reportLines.push(
        '',
        '## 📍 Top Problematic Files',
        ''
      );
      
      topFiles.forEach(([file, count]) => {
        const relativePath = path.relative(this.projectRoot, file);
        reportLines.push(`- **${relativePath}:** ${count} issues`);
      });
    }
    
    return reportLines.join('\n');
  }

  getIssues(): TypeExportIssue[] {
    return this.issues;
  }

  clearIssues(): void {
    this.issues = [];
    this.exportMap.clear();
  }
}

// Utility function for quick checking
export async function checkSpecificFile(filePath: string): Promise<void> {
  console.log(`🔍 Checking specific file: ${filePath}\n`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }
  
  const analyzer = new TypeExportAnalyzer();
  
  // Analyze exports in the file
  await analyzer.getExportsForFile(filePath);
  
  // Get exports from the file
  const exportMap = analyzer.getExportMap();
  const fileExports = Array.from(exportMap.entries())
    .filter(([_, exports]) => exports.some((e: any) => e.file === filePath))
    .map(([name, exports]) => ({ 
      name, 
      exports: exports.filter((e: any) => e.file === filePath) 
    }));
  
  console.log(`📊 Found ${fileExports.length} exports in ${path.basename(filePath)}:`);
  
  if (fileExports.length === 0) {
    console.log('   No exports found');
    return;
  }
  
  fileExports.forEach(({ name, exports }) => {
    const exp = exports[0];
    const exportType = exp.isTypeOnly ? 'type-only' : 'runtime';
    console.log(`  - ${name} (${exportType})`);
    
    // Check if this is a problematic export
    if (exp.isTypeOnly) {
      console.log(`    ⚠️  This is a type-only export`);
      console.log(`    💡 Importers should use: import type { ${name} }`);
    }
  });
  
  // Check the file content for specific patterns
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log('\n📝 Checking for problematic patterns:');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for mixed exports
    if (line.includes('export {') && line.includes('}')) {
      const hasInterface = line.includes('interface');
      const hasType = line.includes('type ');
      const hasFunction = line.includes('function');
      const hasConst = line.includes('const');
      
      if ((hasInterface || hasType) && (hasFunction || hasConst)) {
        console.log(`  ⚠️  Line ${lineNum}: Mixed type/value export`);
        console.log(`     ${line.trim()}`);
        console.log(`     💡 Consider separating type and value exports`);
      }
    }
    
    // Check for type-only exports without 'export type'
    if ((line.includes('export interface') || line.includes('export type ')) && 
        !line.includes('export type {') && 
        line.includes('export {')) {
      console.log(`  ⚠️  Line ${lineNum}: Type re-export may need 'export type'`);
      console.log(`     ${line.trim()}`);
    }
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const analyzeOnly = args.includes('--analyze') || args.includes('--scan');
  const fix = args.includes('--fix');
  const quick = args.includes('--quick');
  const stores = args.includes('--stores'); // NEW
  const checkFile = args.find(arg => !arg.startsWith('--') && (arg.endsWith('.ts') || arg.endsWith('.tsx')));
  
  if (stores) {
    const analyzer  = new TypeExportAnalyzer()
    await analyzer.focusOnStores();
    return;
  }
  if (checkFile) {
    await checkSpecificFile(path.resolve(process.cwd(), checkFile));
    return;
  }
  
  if (quick) {
    console.log('⚡ Quick type mismatch detection\n');
    // For quick detection, use TypeScript directly
    try {
      const { execSync } = await import('child_process');
      const result = execSync('npx tsc --noEmit --listFiles 2>&1 | head -20', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log(result);
    } catch (error: any) {
      console.log('TypeScript found errors (expected):');
      if (error.stdout) {
        const output = error.stdout.toString();
        const errors = output.split('\n').filter((line: string) => 
          line.includes('does not provide an export') ||
          line.includes('is a type and must be imported')
        );
        
        if (errors.length > 0) {
          console.log('\nFound type export issues:');
          errors.slice(0, 10).forEach((err: string, i: number) => {
            console.log(`${i + 1}. ${err}`);
          });
        }
      }
    }
    return;
  }
  
  console.log('🔍 Type Export ESM Compatibility Analyzer\n');
  
  const analyzer = new TypeExportAnalyzer();
  
  const issues = await analyzer.analyze();
  
  if (issues.length === 0) {
    console.log('✅ No type export issues found!');
    process.exit(0);
  }
  
  console.log(`📊 Found ${issues.length} potential type export issues\n`);
  
  // Show immediate issues
  console.log('📋 Top issues found:');
  const immediateIssues = issues.filter(issue => 
    issue.exportType === 'interface' || 
    issue.exportType === 'type'
  ).slice(0, 10);
  
  immediateIssues.forEach((issue, i) => {
    const relativePath = path.relative(process.cwd(), issue.file);
    const importFile = path.relative(process.cwd(), issue.importedBy[0]);
    console.log(`${i + 1}. ${relativePath}:${issue.line}`);
    console.log(`   Export: ${issue.exportName} (${issue.exportType})`);
    console.log(`   Used in: ${importFile}`);
  });
  
  if (issues.length > 10) {
    console.log(`   ... and ${issues.length - 10} more`);
  }


  
  
  // Generate report
  const report = analyzer.generateReport(issues);
  const reportDir = './reports';
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, 'type-export-issues.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`\n📄 Full report saved to: ${reportPath}`);
  
  // Apply fixes if requested
  if (fix) {
    console.log('\n🔧 Applying fixes...');
    const result = await analyzer.fixIssues();
    console.log(`\n📊 Fix Results:`);
    console.log(`✅ Fixed: ${result.fixed} issues`);
    console.log(`⏭️  Skipped: ${result.skipped} issues`);
    
    if (result.fixed > 0) {
      console.log('\n💡 Tip: Run the analyzer again to verify fixes');
      console.log('   Command: pnpm run analyze-type-exports');
    }
  } else if (!analyzeOnly) {
    console.log('\n💡 To fix these issues automatically, run:');
    console.log('   pnpm run fix-type-exports');
    console.log('\n💡 For a quick check, run:');
    console.log('   pnpm run detect-type-mismatches');
  }
}

// ES Module check
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TypeExportAnalyzer };
