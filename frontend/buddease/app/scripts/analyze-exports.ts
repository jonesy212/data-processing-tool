#!/usr/bin/env tsx
// analyze-exports.ts

import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';

console.log('🔍 Analyzing TypeScript exports in project...\n');

const projectRoot = process.cwd();

// Find TypeScript files in core
function findTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      if (item.name.startsWith('.') || item.name === 'node_modules') {
        continue;
      }
      
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        files.push(...findTypeScriptFiles(fullPath));
      } else if (item.isFile() && 
                (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`⚠️ Could not scan ${dir}:`, error.message);
  }
  
  return files;
}

// Analyze a file's exports
function analyzeFileExports(filePath: string): {
  runtimeExports: string[];
  typeOnlyExports: string[];
} {
  const runtimeExports: string[] = [];
  const typeOnlyExports: string[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );
    
    const visit = (node: ts.Node) => {
      // Interface exports (type-only)
      if (ts.isInterfaceDeclaration(node)) {
        const isExported = node.modifiers?.some(m => 
          m.kind === ts.SyntaxKind.ExportKeyword
        );
        if (isExported) {
          typeOnlyExports.push(node.name.text);
        }
      }
      
      // Type alias exports (type-only)
      else if (ts.isTypeAliasDeclaration(node)) {
        const isExported = node.modifiers?.some(m => 
          m.kind === ts.SyntaxKind.ExportKeyword
        );
        if (isExported) {
          typeOnlyExports.push(node.name.text);
        }
      }
      
      // Class exports (runtime)
      else if (ts.isClassDeclaration(node) && node.name) {
        const isExported = node.modifiers?.some(m => 
          m.kind === ts.SyntaxKind.ExportKeyword
        );
        if (isExported) {
          runtimeExports.push(node.name.text);
        }
      }
      
      // Function exports (runtime)
      else if (ts.isFunctionDeclaration(node) && node.name) {
        const isExported = node.modifiers?.some(m => 
          m.kind === ts.SyntaxKind.ExportKeyword
        );
        if (isExported) {
          runtimeExports.push(node.name.text);
        }
      }
      
      // Export declarations
      else if (ts.isExportDeclaration(node)) {
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
          node.exportClause.elements.forEach(element => {
            const name = element.name.text;
            if (node.isTypeOnly) {
              typeOnlyExports.push(name);
            } else {
              runtimeExports.push(name);
            }
          });
        }
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    
  } catch (error) {
    console.warn(`⚠️ Could not analyze ${filePath}:`, error.message);
  }
  
  return { runtimeExports, typeOnlyExports };
}

async function main() {
  // Find core files
  const coreDir = path.join(projectRoot, 'src/core');
  console.log(`📂 Scanning: ${coreDir}\n`);
  
  if (!fs.existsSync(coreDir)) {
    console.error(`❌ Core directory not found: ${coreDir}`);
    return;
  }
  
  const files = findTypeScriptFiles(coreDir);
  console.log(`📊 Found ${files.length} TypeScript files in core\n`);
  
  // Analyze first 30 files (for speed)
  const filesToAnalyze = files.slice(0, 30);
  
  const allRuntime: string[] = [];
  const allTypeOnly: string[] = [];
  
  console.log('📈 Analyzing exports...\n');
  
  for (const file of filesToAnalyze) {
    const relativePath = path.relative(projectRoot, file);
    const { runtimeExports, typeOnlyExports } = analyzeFileExports(file);
    
    if (runtimeExports.length > 0 || typeOnlyExports.length > 0) {
      console.log(`📄 ${path.basename(file)}:`);
      if (runtimeExports.length > 0) {
        console.log(`   🏃 Runtime: ${runtimeExports.slice(0, 3).join(', ')}${runtimeExports.length > 3 ? `... (+${runtimeExports.length - 3})` : ''}`);
      }
      if (typeOnlyExports.length > 0) {
        console.log(`   📋 Type-only: ${typeOnlyExports.slice(0, 3).join(', ')}${typeOnlyExports.length > 3 ? `... (+${typeOnlyExports.length - 3})` : ''}`);
      }
    }
    
    allRuntime.push(...runtimeExports);
    allTypeOnly.push(...typeOnlyExports);
  }
  
  // Create cache
  const cache = {
    runtimeExports: [...new Set(allRuntime)],
    typeOnlyExports: [...new Set(allTypeOnly)],
    analyzedFiles: filesToAnalyze.length,
    totalFiles: files.length,
    timestamp: new Date().toISOString()
  };
  
  const cachePath = path.join(projectRoot, '.export-analysis-cache.json');
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
  
  console.log('\n📊 SUMMARY:');
  console.log(`   Files analyzed: ${filesToAnalyze.length}/${files.length}`);
  console.log(`   Runtime exports found: ${cache.runtimeExports.length}`);
  console.log(`   Type-only exports found: ${cache.typeOnlyExports.length}`);
  console.log(`\n💾 Cache saved to: ${cachePath}`);
  
  // Show examples
  console.log('\n🏃 Top Runtime Exports:');
  cache.runtimeExports.slice(0, 10).forEach(exp => console.log(`   • ${exp}`));
  
  console.log('\n📋 Top Type-Only Exports:');
  cache.typeOnlyExports.slice(0, 10).forEach(exp => console.log(`   • ${exp}`));
}

main().catch(console.error);