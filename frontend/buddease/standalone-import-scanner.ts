#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🚀 Standalone Import Error Scanner');
console.log('══════════════════════════════════\n');

interface ImportError {
  filePath: string;
  lineNumber: number;
  importPath: string;
  errorType: 'TYPESCRIPT' | 'MISSING';
  severity: 'high' | 'medium' | 'low';
  suggestedFix?: string;
}

async function main() {
  const errors: ImportError[] = [];
  
  // Method 1: Run TypeScript compiler
  console.log('🔍 Step 1: Running TypeScript compiler...');
  try {
    const tsOutput = execSync('npx tsc --noEmit --listFiles 2>&1', { encoding: 'utf8' });
    parseTypeScriptErrors(tsOutput, errors);
  } catch (error: any) {
    if (error.stdout) {
      parseTypeScriptErrors(error.stdout, errors);
    }
  }
  
  console.log(`   Found ${errors.length} TypeScript import errors`);
  
  // Method 2: Simple file scan (skip scanning for now to avoid CSS issues)
  console.log('\n🔍 Step 2: Skipping file scan (to avoid CSS issues)');
  console.log('   Use TypeScript errors only for now');
  
  // Display results
  console.log('\n📊 RESULTS:');
  console.log('══════════════════════════════════');
  console.log(`Total import errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n📋 Top 20 import errors:');
    errors.slice(0, 20).forEach((error, index) => {
      const relativePath = path.relative(process.cwd(), error.filePath);
      console.log(`${index + 1}. ${relativePath}:${error.lineNumber}`);
      console.log(`   Import: "${error.importPath}"`);
      console.log(`   Type: ${error.errorType}, Severity: ${error.severity}`);
      if (error.suggestedFix) {
        console.log(`   Fix: ${error.suggestedFix.substring(0, 80)}...`);
      }
      console.log('');
    });
    
    if (errors.length > 20) {
      console.log(`... and ${errors.length - 20} more errors`);
    }
    
    // Save to file
    const outputDir = path.join(process.cwd(), 'import-analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: errors.length,
      errors: errors.map(e => ({
        ...e,
        filePath: path.relative(process.cwd(), e.filePath)
      }))
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'import-errors.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log(`\n💾 Report saved to: ${path.join(outputDir, 'import-errors.json')}`);
  } else {
    console.log('✅ No import errors found!');
  }
}

function parseTypeScriptErrors(output: string, errors: ImportError[]) {
  const lines = output.split('\n');
  const errorRegex = /^(.+?)\((\d+),(\d+)\): error TS\d+: (.+)$/;
  const importRegex = /Cannot find module ['"](.+?)['"]/;

  lines.forEach(line => {
    const match = line.match(errorRegex);
    if (match) {
      const [, filePath, lineNum, , message] = match;
      const importMatch = message.match(importRegex);

      if (importMatch) {
        const importPath = importMatch[1];
        
        // Skip node modules and CSS files
        if (importPath.includes('.css') || importPath.includes('.scss') || importPath.includes('.sass')) {
          return;
        }
        
        errors.push({
          filePath: path.resolve(filePath),
          lineNumber: parseInt(lineNum),
          importPath,
          errorType: 'TYPESCRIPT',
          severity: determineSeverity(importPath),
          suggestedFix: suggestFix(importPath, filePath)
        });
      }
    }
  });
}

function determineSeverity(importPath: string): 'high' | 'medium' | 'low' {
  if (importPath.includes('@/app/') || importPath.includes('@/src/app/')) {
    return 'high';
  }
  if (importPath.includes('@/components/') || importPath.includes('@/hooks/')) {
    return 'high';
  }
  if (importPath.includes('@/utils/') || importPath.includes('@/lib/')) {
    return 'medium';
  }
  return 'low';
}

function suggestFix(importPath: string, sourceFile: string): string {
  // Simple fix suggestions based on common patterns
  if (importPath.startsWith('@/')) {
    return `Check if file exists: ${importPath.replace('@/', 'src/')}`;
  }
  if (importPath.startsWith('.')) {
    const dir = path.dirname(sourceFile);
    const resolved = path.resolve(dir, importPath);
    return `Check: ${resolved}`;
  }
  return `Check npm package: ${importPath}`;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
