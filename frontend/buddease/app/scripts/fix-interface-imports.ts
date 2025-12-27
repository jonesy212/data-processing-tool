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
  line?: number;
}



async function focusOnTarget(target: string) {
  console.log(`🎯 Focusing on: ${target}\n`);
  
  // Check if target exists
  const fullPath = path.resolve(process.cwd(), target);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Target not found: ${target}`);
    console.log(`   Searched at: ${fullPath}`);
    return;
  }
  
  const stats = fs.statSync(fullPath);
  
  if (stats.isDirectory()) {
    await analyzeDirectory(target);
  } else if (stats.isFile()) {
    await analyzeFile(target);
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
  
  // Use Node.js to find files instead of shell command for better portability
  function findTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && item !== 'node_modules' && !item.startsWith('.')) {
            files.push(...findTypeScriptFiles(fullPath));
          } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
            files.push(fullPath);
          }
        } catch (error) {
          // Skip files we can't access
        }
      }
    } catch (error) {
      // Skip directories we can't access
    }
    
    return files;
  }
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = fs.existsSync(srcDir) 
    ? findTypeScriptFiles(srcDir)
    : findTypeScriptFiles(process.cwd());
  
  console.log(`📁 Scanning ${files.length} TypeScript files...`);
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const interfaces: string[] = [];
      
      // Find interface exports
      const interfaceRegex = /export\s+(?:type\s+)?interface\s+(\w+)/g;
      let match;
      while ((match = interfaceRegex.exec(content)) !== null) {
        interfaces.push(match[1]);
      }
      
      // Find type exports
      const typeRegex = /export\s+type\s+(\w+)(?:\s*=\s*[^;]+)?;/g;
      while ((match = typeRegex.exec(content)) !== null) {
        interfaces.push(match[1]);
      }
      
      // Find export type { ... } statements
      const typeExportRegex = /export\s+type\s*\{([^}]+)\}/g;
      while ((match = typeExportRegex.exec(content)) !== null) {
        const types = match[1].split(',').map(t => t.trim()).filter(Boolean);
        interfaces.push(...types);
      }
      
      if (interfaces.length > 0) {
        const relativePath = path.relative(process.cwd(), file);
        result.push({
          file: relativePath,
          interfaces: [...new Set(interfaces)] // Remove duplicates
        });
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
  const issues: Array<{interface: string; file: string; count: number; examples: string[]}> = [];
  const allChanges: Array<{interface: string; fromFile: string; importFile: string; line: number; original: string}> = [];
  
  for (const interfaceFile of interfaceFiles) {
    const fileName = path.basename(interfaceFile.file, path.extname(interfaceFile.file));
    
    for (const interfaceName of interfaceFile.interfaces) {
      const findCmd = `grep -rn "import.*${interfaceName}.*from.*['\"]${fileName}['\"]" src/ --include="*.ts" --include="*.tsx" | grep -v "import type" || true`;
      const output = execSync(findCmd, { encoding: 'utf8' });
      
      const importLines = output.split('\n').filter(Boolean);
      const count = importLines.length;
      
      if (count > 0) {
        const examples = importLines.slice(0, 3); // Keep first 3 as examples
        
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
    reportContent += `**Total interface files:** ${interfaceFiles.length}\n`;
    reportContent += `**Interfaces needing fixes:** ${issues.length}\n`;
    reportContent += `**Total imports to fix:** ${total}\n\n`;
    
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
    
    filesByFixCount.slice(0, 10).forEach(([filePath, changes], index) => {
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
    await analyzeFile(file, true);
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
  
  // Group by file for batch processing
  const fixesByFile = new Map<string, FixResult[]>();
  fixes.forEach(fix => {
    if (!fixesByFile.has(fix.file)) {
      fixesByFile.set(fix.file, []);
    }
    fixesByFile.get(fix.file)!.push(fix);
  });
  
  for (const [filePath, fileFixes] of fixesByFile) {
    try {
      // Create backup
      const backupPath = `${filePath}.backup-${Date.now()}`;
      const content = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(backupPath, content, 'utf8');
      console.log(`💾 Backup created: ${backupPath}`);
      
      // Apply fixes
      const lines = content.split('\n');
      
      // Sort fixes by line number (descending) to avoid line number shifting
      const sortedFixes = [...fileFixes].sort((a, b) => (b.line || 0) - (a.line || 0));
      
      for (const fix of sortedFixes) {
        const lineIndex = (fix.line || 1) - 1;
        if (lineIndex >= 0 && lineIndex < lines.length) {
          if (lines[lineIndex].includes(fix.original)) {
            lines[lineIndex] = lines[lineIndex].replace(fix.original, fix.fixed);
            applied++;
            console.log(`✅ Fixed: ${path.basename(filePath)}:${fix.line}`);
          } else {
            console.warn(`⚠️  Line ${fix.line} doesn't match expected content`);
            failed++;
          }
        }
      }
      
      // Write changes
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, (error as Error).message);
      failed += fileFixes.length;
    }
  }
  
  console.log(`\n📊 Results:`);
  console.log(`✅ Applied: ${applied} fixes`);
  console.log(`❌ Failed: ${failed} fixes`);
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

// Main execution
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

Examples:
  # Analyze a specific file
  tsx fix-interface-imports.ts target src/app/state/stores/DataStore.ts --dry-run
  
  # Analyze a directory
  tsx fix-interface-imports.ts analyze src/app/snapshots --dry-run
  
  # Fix ALL interface imports
  tsx fix-interface-imports.ts all
  
  # Quick-fix DataStore imports
  tsx fix-interface-imports.ts quick
  
  # Preview all fixes
  tsx fix-interface-imports.ts preview
  
  # Scan and generate report
  tsx fix-interface-imports.ts scan --report
  
  # Interactive mode
  tsx fix-interface-imports.ts interactive
  
  # Safe mode (only high-confidence fixes)
  tsx fix-interface-imports.ts safe
    `);
    return;
  }
  
  const command = args[0];
  const restArgs = args.slice(1);
  const dryRun = restArgs.includes('--dry-run');
  const apply = restArgs.includes('--apply');
  const report = restArgs.includes('--report');
  
  if (dryRun) {
    console.log('🔍 DRY RUN - No changes will be made\n');
  }
  
  try {
    switch (command) {
      case 'target':
      case 'analyze': {
        const target = restArgs.find(arg => !arg.startsWith('--'));
        if (!target) {
          console.error('❌ Error: No target specified for analysis');
          console.log('   Usage: tsx fix-interface-imports.ts target <file-or-directory>');
          process.exit(1);
        }
        
        if (dryRun) {
          await analyzeDirectory(target);
        } else {
          await focusOnTarget(target);
        }
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
        await scanInterfaceImports(report);
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
            await applyFixes(fixes);
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
