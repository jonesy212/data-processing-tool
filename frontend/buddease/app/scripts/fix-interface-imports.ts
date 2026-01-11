#!/usr/bin/env tsx
// src/scripts/fix-interface-imports.ts

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { FixResult,
  
 } from '@/app/scripts/import-utils'
import  { 
  shouldBeTypeImport, 
  fixImportStatement, 
  findInterfaceExports,
  createBackup, 
  groupFixesByFile, 
  sortFixesDescending, 
  getContextTips,
  applyFixes as applyFixesShared ,
 } from '@/app/scripts/import-utils'


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

async function focusOnTarget(target: string) {
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
    console.log(`💡 Try using a relative path like: src/core/state/stores/CommonEvent.ts`);
    return;
  }
  
  const stats = fs.statSync(fullPath);
  
  if (stats.isDirectory()) {
    await analyzeDirectory(target);
  } else if (stats.isFile()) {
    await analyzeFile(fullPath);
  } else {
    console.error(`❌ Target is neither file nor directory: ${target}`);
  }
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

async function applyFixes(fixes: FixResult[]) {
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
async function fixTypeOnlyImportsFromCore() {
  console.log('🔍 Fixing type-only imports from core modules...\n');
  
  // Define patterns to look for
  const coreTypePatterns = [
    {
      patterns: ['BaseDataEntity', 'BaseDataRoot', 'DefaultExcludedFields', 'DefaultMeta'],
      from: '@/core/config/BaseConfig'
    },
    {
      patterns: ['UnifiedMetadata'],
      from: '@/core/config/MetaDataOptions'
    },
    {
      patterns: ['StructuredMetadata'],
      from: '@/core/config/StructuredMetadata'
    },
    {
      patterns: ['Attachment'],
      from: '@/core/documents/attachment/Attachment'
    },
    {
      patterns: ['SharedMetadata'],
      from: '@/core/shared/SharedMetadata'
    },
    {
      patterns: ['EventManager', 'InitializedState'],
      from: '@/core/state/stores/DataStore'
    }
  ];
  
  const allFixes: FixResult[] = [];
  const changesByFile: Record<string, Array<{before: string, after: string, line: number}>> = {};
  
  console.log('📋 Targeted core modules:\n');
  coreTypePatterns.forEach(({ from, patterns }) => {
    console.log(`   📍 ${from}`);
    console.log(`      Exports: ${patterns.join(', ')}`);
  });
  console.log('');
  
  for (const { patterns, from } of coreTypePatterns) {
    console.log(`🔍 Checking: ${from}`);
    
    // Extract just the filename without path for grep
    const fileName = from.split('/').pop() || '';
    if (!fileName) continue;
    
    // Build grep pattern
    const importPatterns = patterns.map(pattern => `\\b${pattern}\\b`).join('|');
    const findCmd = `grep -rn "import.*{.*\\(${importPatterns}\\).*}.*from.*${fileName}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "import type" || true`;
    
    try {
      const output = execSync(findCmd, { encoding: 'utf8' });
      const importLines = output.split('\n').filter(Boolean);
      
      if (importLines.length > 0) {
        console.log(`   📊 Found ${importLines.length} import(s) to fix`);
      }
      
      for (const importLine of importLines) {
        const [filePath, lineNumStr, ...rest] = importLine.split(':');
        const lineNum = parseInt(lineNumStr) || 1;
        const originalImport = rest.join(':').trim();
        
        if (!filePath || !originalImport) continue;
        
        // Create the fixed import
        let fixedImport = originalImport;
        if (originalImport.startsWith('import {')) {
          fixedImport = originalImport.replace('import {', 'import type {');
          
          // Track changes for report
          if (!changesByFile[filePath]) {
            changesByFile[filePath] = [];
          }
          changesByFile[filePath].push({
            before: originalImport,
            after: fixedImport,
            line: lineNum
          });
          
          allFixes.push({
            file: filePath,
            original: originalImport,
            fixed: fixedImport,
            success: true,
            line: lineNum
          });
          
          // Show the exact change
          console.log(`   📝 ${path.basename(filePath)}:${lineNum}`);
          console.log(`      BEFORE: ${originalImport}`);
          console.log(`      AFTER:  ${fixedImport}`);
          console.log('');
        }
      }
    } catch (error: any) {
      // Continue on grep errors
    }
  }
  
  // Also find and fix any other imports from core that look like types
  console.log('🔍 Checking for other type-only imports from @/core...\n');
  const coreFindCmd = `grep -rn "import.*{.*}.*from.*@/core" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "import type" | head -30 || true`;
  
  try {
    const output = execSync(coreFindCmd, { encoding: 'utf8' });
    const importLines = output.split('\n').filter(Boolean);
    
    console.log(`📊 Found ${importLines.length} potential type import(s) from @/core\n`);
    
    for (const importLine of importLines) {
      const [filePath, lineNumStr, ...rest] = importLine.split(':');
      const lineNum = parseInt(lineNumStr) || 1;
      const originalImport = rest.join(':').trim();
      
      if (!filePath || !originalImport || !originalImport.includes('import {')) continue;
      
      // Extract import names to check if they're types
      const match = originalImport.match(/^import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/);
      if (!match) continue;
      
      const imports = match[1].split(',').map(i => i.trim()).filter(Boolean);
      const source = match[2];
      
      // Check if any imported name looks like a type
      const hasType = imports.some(name => 
        shouldBeTypeImport(originalImport, [name]) || 
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
      
      if (hasType) {
        const fixedImport = originalImport.replace('import {', 'import type {');
        
        // Track changes for report
        if (!changesByFile[filePath]) {
          changesByFile[filePath] = [];
        }
        changesByFile[filePath].push({
          before: originalImport,
          after: fixedImport,
          line: lineNum
        });
        
        allFixes.push({
          file: filePath,
          original: originalImport,
          fixed: fixedImport,
          success: true,
          line: lineNum
        });
        
        // Show the exact change
        console.log(`📝 ${path.basename(filePath)}:${lineNum}`);
        console.log(`   BEFORE: ${originalImport}`);
        console.log(`   AFTER:  ${fixedImport}`);
        console.log('');
      }
    }
  } catch (error: any) {
    // Continue on grep errors
  }
  
  if (allFixes.length > 0) {
    console.log('='.repeat(80));
    console.log('📊 CHANGE SUMMARY');
    console.log('='.repeat(80));
    
    // Group fixes by file for better display
    const fixesByFile: Record<string, FixResult[]> = {};
    allFixes.forEach(fix => {
      if (!fixesByFile[fix.file]) {
        fixesByFile[fix.file] = [];
      }
      fixesByFile[fix.file].push(fix);
    });
    
    // Show detailed changes per file
    console.log(`\n📋 Total changes: ${allFixes.length} import(s) in ${Object.keys(fixesByFile).length} file(s)\n`);
    
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
    
    // Generate detailed report file
    const reportDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `core-type-import-fixes-${timestamp}.md`);
    
    let reportContent = `# Core Type Import Fix Report\n\n`;
    reportContent += `**Generated:** ${new Date().toISOString()}\n`;
    reportContent += `**Total fixes:** ${allFixes.length}\n`;
    reportContent += `**Files modified:** ${Object.keys(fixesByFile).length}\n\n`;
    
    // Add summary table
    reportContent += `## Summary\n\n`;
    reportContent += `| File | Changes | Status |\n`;
    reportContent += `|------|---------|--------|\n`;
    
    Object.entries(fixesByFile).forEach(([filePath, fixes]) => {
      const relativePath = path.relative(process.cwd(), filePath);
      reportContent += `| \`${relativePath}\` | ${fixes.length} | ✅ Ready |\n`;
    });
    
    // Add detailed changes
    reportContent += `\n## Detailed Changes\n\n`;
    
    Object.entries(fixesByFile).forEach(([filePath, fixes]) => {
      const relativePath = path.relative(process.cwd(), filePath);
      reportContent += `### ${relativePath}\n\n`;
      
      fixes.forEach((fix, index) => {
        reportContent += `**Change ${index + 1}** (Line ${fix.line}):\n\n`;
        reportContent += `\`\`\`diff\n`;
        reportContent += `- ${fix.original}\n`;
        reportContent += `+ ${fix.fixed}\n`;
        reportContent += `\`\`\`\n\n`;
      });
    });
    
    // Add command to apply
    reportContent += `## How to Apply\n\n`;
    reportContent += `These changes will be applied when you confirm in the interactive prompt.\n\n`;
    reportContent += `If you want to preview the changes without applying:\n`;
    reportContent += `\`\`\`bash\n`;
    reportContent += `tsx fix-interface-imports.ts core-types --dry-run\n`;
    reportContent += `\`\`\`\n`;
    
    fs.writeFileSync(reportFile, reportContent, 'utf8');
    console.log(`📊 Detailed report saved to: ${reportFile}\n`);
    
    // Ask for confirmation
    console.log('🚀 Apply these changes? (y/n)');
    const confirmed = await promptConfirmation();
    
    if (confirmed) {
      console.log('\n🔧 Applying fixes...\n');
      
      let applied = 0;
      let failed = 0;
      
      // Group fixes by file for efficient processing
      const fixesByFileGrouped = groupFixesByFile(allFixes);
      
      for (const [filePath, fileFixes] of fixesByFileGrouped) {
        try {
          // Create backup
          const backupPath = createBackup(filePath);
          console.log(`💾 Backup created: ${backupPath}`);
          
          // Read file content
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');
          
          // Sort fixes by line number (descending) to avoid line number shifting
          const sortedFixes = sortFixesDescending(fileFixes);
          
          // Apply fixes
          for (const fix of sortedFixes) {
            let lineIndex = (fix.line || 1) - 1;
            
            // Find the line if line number doesn't match
            if (lineIndex < 0 || lineIndex >= lines.length || !lines[lineIndex].includes(fix.original)) {
              lineIndex = lines.findIndex(line => line.includes(fix.original) && !line.includes('import type'));
            }
            
            if (lineIndex >= 0 && lineIndex < lines.length) {
              lines[lineIndex] = lines[lineIndex].replace(fix.original, fix.fixed);
              applied++;
              console.log(`✅ ${path.basename(filePath)}:${lineIndex + 1} - Fixed`);
              console.log(`   ❌ Was: ${fix.original}`);
              console.log(`   ✅ Now: ${fix.fixed}`);
            } else {
              console.warn(`⚠️  Could not find import in ${filePath}: ${fix.original}`);
              failed++;
            }
          }
          
          // Write updated content
          fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
          
        } catch (error) {
          console.error(`❌ Error fixing ${filePath}:`, (error as Error).message);
          failed += fileFixes.length;
        }
      }
      
      console.log('\n' + '='.repeat(80));
      console.log('📊 FINAL RESULTS');
      console.log('='.repeat(80));
      console.log(`✅ Successfully applied: ${applied} fixes`);
      console.log(`❌ Failed: ${failed} fixes`);
      console.log(`📁 Files modified: ${Object.keys(fixesByFile).length}`);
      
      if (failed === 0) {
        console.log('\n🎉 All core type imports fixed successfully!');
      }
      
    } else {
      console.log('\n❌ Changes cancelled');
      console.log('💡 You can review the report at:', reportFile);
    }
  } else {
    console.log('\n✅ No type-only import fixes needed!');
    
    // Still generate a report showing no changes needed
    const reportDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportDir, `core-type-import-fixes-${timestamp}.md`);
    
    let reportContent = `# Core Type Import Fix Report\n\n`;
    reportContent += `**Generated:** ${new Date().toISOString()}\n`;
    reportContent += `**Status:** ✅ No changes needed\n\n`;
    reportContent += `All imports from @/core modules are already correctly using \`import type\` where appropriate.\n`;
    
    fs.writeFileSync(reportFile, reportContent, 'utf8');
    console.log(`📊 Report saved to: ${reportFile}`);
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

Options:
  --apply                Apply fixes immediately (without confirmation)
  --dry-run              Preview what would be changed without applying
  --help, -h             Show this help
  --report               Generate detailed report (with scan command)
  --quick                Quick scan mode (faster but less thorough)

Examples:
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
  
  if (dryRun) {
    console.log('🔍 DRY RUN - No changes will be made\n');
  }
  
  try {
    switch (command) {
      case 'core-types':
        if (dryRun) {
          console.log('⚠️  DRY RUN: Would fix type-only imports from core modules');
          // You could add a preview here
        } else {
          await fixTypeOnlyImportsFromCore();
        }
        break;
        
      case 'target':
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
