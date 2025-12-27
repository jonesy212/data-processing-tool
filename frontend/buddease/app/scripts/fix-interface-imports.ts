#!/usr/bin/env tsx
// src/scripts/fix-interface-imports.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface FixResult {
  file: string;
  original: string;
  fixed: string;
  success: boolean;
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
      applyFixes(allFixes);
    } else {
      console.log('\n❌ Cancelled');
    }
  } else {
    console.log('\n✅ No interface import fixes needed!');
  }
}

function findInterfaceExports(): Array<{file: string; interfaces: string[]}> {
  const result: Array<{file: string; interfaces: string[]}> = [];
  
  // Find all TypeScript files
  const findCmd = 'find src/ -name "*.ts" -o -name "*.tsx"';
  const files = execSync(findCmd, { encoding: 'utf8' })
    .split('\n')
    .filter(f => f.trim() && !f.includes('node_modules'));
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const interfaceMatches = content.match(/export\s+(interface|type)\s+(\w+)/g);
      
      if (interfaceMatches) {
        const interfaces = interfaceMatches.map(match => {
          const nameMatch = match.match(/\s+(\w+)$/);
          return nameMatch ? nameMatch[1] : '';
        }).filter(Boolean);
        
        if (interfaces.length > 0) {
          result.push({
            file,
            interfaces
          });
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  return result;
}

async function findAndFixInterfaceImports(interfaceFile: {file: string; interfaces: string[]}): Promise<FixResult[]> {
  const fixes: FixResult[] = [];
  const fileName = path.basename(interfaceFile.file, path.extname(interfaceFile.file));
  
  for (const interfaceName of interfaceFile.interfaces) {
    console.log(`   Checking ${interfaceName} from ${fileName}`);
    
    // Find all imports of this interface
    const findCmd = `grep -rn "import.*${interfaceName}.*from.*${fileName}" src/ --include="*.ts" --include="*.tsx" || true`;
    const output = execSync(findCmd, { encoding: 'utf8' });
    
    const importLines = output.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && 
             trimmed.includes('import') && 
             trimmed.includes(interfaceName) &&
             !trimmed.includes('import type'); // Skip already fixed
    });
    
    for (const importLine of importLines) {
      const [filePath, ...rest] = importLine.split(':');
      const originalImport = rest.join(':').replace(/^\d+:/, '').trim();
      
      if (!filePath || !originalImport) continue;
      
      // Create the fixed import
      let fixedImport = originalImport;
      if (originalImport.startsWith('import {') || originalImport.startsWith('import {')) {
        fixedImport = originalImport.replace('import {', 'import type {');
      } else if (originalImport.startsWith(`import ${interfaceName} from`)) {
        // Default import - can't use import type with default imports
        console.log(`   ⚠️  ${interfaceName} has default import - manual check needed in ${filePath}`);
        continue;
      }
      
      fixes.push({
        file: filePath,
        original: originalImport,
        fixed: fixedImport,
        success: true
      });
      
      console.log(`     - ${path.basename(filePath)}: ${originalImport} → ${fixedImport}`);
    }
  }
  
  return fixes;
}

function applyFixes(fixes: FixResult[]) {
  let applied = 0;
  
  for (const fix of fixes) {
    if (!fix.success) continue;
    
    try {
      const content = fs.readFileSync(fix.file, 'utf8');
      const lines = content.split('\n');
      const fixedLines = lines.map(line => 
        line.includes(fix.original) ? line.replace(fix.original, fix.fixed) : line
      );
      
      if (fixedLines.join('\n') !== content) {
        fs.writeFileSync(fix.file, fixedLines.join('\n'), 'utf8');
        applied++;
        console.log(`✅ Fixed: ${path.basename(fix.file)}`);
      }
    } catch (error) {
        console.error(`❌ Error fixing ${fix.file}:`, (error as Error).message);
    }
  }
  
  console.log(`\n📊 Applied ${applied} of ${fixes.length} fixes`);
}

async function promptConfirmation(): Promise<boolean> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setEncoding('utf8');
    
    stdin.once('data', (key) => {
      resolve(key.toString().toLowerCase() === 'y');
      stdin.pause();
    });
  });
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
      applyFixes(fixes);
    }
  }
}

// Add missing functions that were called but not defined
async function previewInterfaceFixes(args: string[]) {
  console.log('🔍 PREVIEW MODE - Showing what would be fixed\n');
  
  const interfaceFiles = findInterfaceExports();
  console.log(`Found ${interfaceFiles.length} interface files\n`);
  
  for (const interfaceFile of interfaceFiles.slice(0, 10)) { // Limit preview
    const fileName = path.basename(interfaceFile.file, path.extname(interfaceFile.file));
    console.log(`📁 ${fileName}:`);
    
    for (const interfaceName of interfaceFile.interfaces.slice(0, 3)) { // Limit interfaces
      const findCmd = `grep -rn "import.*${interfaceName}.*from.*${fileName}" src/ --include="*.ts" --include="*.tsx" | head -2 || true`;
      const output = execSync(findCmd, { encoding: 'utf8' });
      
      const imports = output.split('\n').filter(Boolean);
      if (imports.length > 0) {
        console.log(`   ${interfaceName}: ${imports.length} imports would be fixed`);
      }
    }
    console.log('');
  }
  
  console.log('⚠️  Preview only - no changes made');
}

async function scanInterfaceImports(generateReport: boolean = false) {
  console.log('🔍 Scanning for interface import issues...\n');
  
  const interfaceFiles = findInterfaceExports();
  const issues: Array<{interface: string; file: string; count: number}> = [];
  
  for (const interfaceFile of interfaceFiles) {
    const fileName = path.basename(interfaceFile.file, path.extname(interfaceFile.file));
    
    for (const interfaceName of interfaceFile.interfaces) {
      const findCmd = `grep -rn "import.*${interfaceName}.*from.*${fileName}" src/ --include="*.ts" --include="*.tsx" | grep -v "import type" | wc -l`;
      const count = parseInt(execSync(findCmd, { encoding: 'utf8' }).trim()) || 0;
      
      if (count > 0) {
        issues.push({
          interface: interfaceName,
          file: fileName,
          count
        });
      }
    }
  }
  
  if (generateReport) {
    console.log('📊 INTERFACE IMPORT REPORT');
    console.log('========================\n');
    
    if (issues.length === 0) {
      console.log('✅ No interface import issues found!');
      return;
    }
    
    // Sort by count descending
    issues.sort((a, b) => b.count - a.count);
    
    console.log('Top issues needing fixes:');
    issues.slice(0, 20).forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.interface} from ${issue.file}: ${issue.count} imports need "import type"`);
    });
    
    const total = issues.reduce((sum, issue) => sum + issue.count, 0);
    console.log(`\n📈 Total fixes needed: ${total} across ${issues.length} interfaces`);
  }
}

async function interactiveFixInterfaceImports(args: string[]) {
  console.log('🎯 INTERACTIVE MODE\n');
  
  const interfaceFiles = findInterfaceExports();
  let totalFixed = 0;
  
  for (const interfaceFile of interfaceFiles) {
    const fileName = path.basename(interfaceFile.file, path.extname(interfaceFile.file));
    
    for (const interfaceName of interfaceFile.interfaces) {
      const findCmd = `grep -rn "import.*${interfaceName}.*from.*${fileName}" src/ --include="*.ts" --include="*.tsx" | grep -v "import type" || true`;
      const output = execSync(findCmd, { encoding: 'utf8' });
      
      const imports = output.split('\n').filter(Boolean);
      if (imports.length === 0) continue;
      
      console.log(`\n📄 ${interfaceName} (${fileName}):`);
      console.log(`   Found ${imports.length} imports to fix`);
      
      console.log('\n   Examples:');
      imports.slice(0, 3).forEach(importLine => {
        const [filePath] = importLine.split(':');
        console.log(`   - ${path.basename(filePath)}`);
      });
      
      const confirmed = await promptConfirmationWithMessage(`Fix ${imports.length} imports of ${interfaceName}? (y/n/skip): `);
      
      if (confirmed === 'y') {
        // Apply fixes for this interface
        const fixes: FixResult[] = [];
        
        for (const importLine of imports) {
          const [filePath, ...rest] = importLine.split(':');
          const originalImport = rest.join(':').replace(/^\d+:/, '').trim();
          
          if (originalImport.includes('import {') && originalImport.includes(interfaceName)) {
            const fixedImport = originalImport.replace('import {', 'import type {');
            
            fixes.push({
              file: filePath,
              original: originalImport,
              fixed: fixedImport,
              success: true
            });
          }
        }
        
        if (fixes.length > 0) {
          applyFixes(fixes);
          totalFixed += fixes.length;
        }
      } else if (confirmed === 'skip') {
        console.log(`   Skipped ${interfaceName}`);
      }
    }
  }
  
  console.log(`\n🎯 Total fixed: ${totalFixed} imports`);
}

async function safeFixInterfaceImports(args: string[]) {
  console.log('🛡️  SAFE MODE - Only fixing high-confidence interface imports\n');
  
  // Only fix interfaces that are definitely types (common patterns)
  const HIGH_CONFIDENCE_PATTERNS = [
    'DataStore',
    'Snapshot',
    'PhaseContext',
    'ExecutionContext',
    'MilestoneDefinition',
    'EntityAnalysis',
    'WorkflowTransition'
  ];
  
  const interfaceFiles = findInterfaceExports();
  const allFixes: FixResult[] = [];
  
  for (const interfaceFile of interfaceFiles) {
    for (const interfaceName of interfaceFile.interfaces) {
      if (HIGH_CONFIDENCE_PATTERNS.some(pattern => interfaceName.includes(pattern))) {
        console.log(`🔧 High confidence: ${interfaceName}`);
        
        const findCmd = `grep -rn "import.*${interfaceName}.*from" src/ --include="*.ts" --include="*.tsx" | grep -v "import type" || true`;
        const output = execSync(findCmd, { encoding: 'utf8' });
        
        const importLines = output.split('\n').filter(Boolean);
        
        for (const importLine of importLines) {
          const [filePath, ...rest] = importLine.split(':');
          const originalImport = rest.join(':').replace(/^\d+:/, '').trim();
          
          if (originalImport.includes('import {') && originalImport.includes(interfaceName)) {
            const fixedImport = originalImport.replace('import {', 'import type {');
            
            allFixes.push({
              file: filePath,
              original: originalImport,
              fixed: fixedImport,
              success: true
            });
          }
        }
      }
    }
  }
  
  if (allFixes.length > 0) {
    console.log(`\n📋 Found ${allFixes.length} high-confidence fixes`);
    console.log('\n🚀 Apply safe fixes? (y/n)');
    const confirmed = await promptConfirmation();
    
    if (confirmed) {
      applyFixes(allFixes);
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

// Main execution
// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Interface Import Fixer
=====================
Fixes 'import type' issues for interfaces that are incorrectly imported as values.

Usage:
  tsx fix-interface-imports.ts [options]

Options:
  --quick              Quick fix for DataStore imports only (specific)
  --all                Fix ALL interface imports (comprehensive)
  --preview            Show what would be changed without applying
  --interactive        Interactive mode with confirmation for each file
  --dry-run            Same as --preview
  --safe               Only fix high-confidence interface imports
  --report             Generate report of interface import issues
  --scan               Scan only, don't fix
  --help               Show this help

Examples:
  tsx fix-interface-imports.ts --quick --preview
  tsx fix-interface-imports.ts --all --interactive
  tsx fix-interface-imports.ts --scan --report
    `);
    return;
  }
  
  // Handle different modes
  if (args.includes('--preview') || args.includes('--dry-run')) {
    await previewInterfaceFixes(args);
  } else if (args.includes('--scan') || args.includes('--report')) {
    await scanInterfaceImports(args.includes('--report'));
  } else if (args.includes('--interactive')) {
    await interactiveFixInterfaceImports(args);
  } else if (args.includes('--safe')) {
    await safeFixInterfaceImports(args);
  } else if (args.includes('--quick')) {
    await quickFixDataStore();
  } else if (args.includes('--all')) {
    await fixAllInterfaceImports();
  } else {
    // Default: scan and report
    await scanInterfaceImports(true);
  }
}

// ES Module entry point
main().catch(console.error);