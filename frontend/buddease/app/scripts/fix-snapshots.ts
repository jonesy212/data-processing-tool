#!/usr/bin/env tsx
// fix-snapshots.ts

import fs from 'fs';
import path from 'path';

interface TypeScriptError {
  resource: string;
  code: string;
  message: string;
  startLineNumber: number;
  startColumn: number;
}

class SnapshotsFixer {
  private projectRoot: string;
  
  constructor() {
    this.projectRoot = process.cwd();
  }
  
  async analyzeSnapshots(): Promise<void> {
    console.log('🔍 Analyzing snapshot files...\n');
    
    // Get errors
    const errorFile = process.argv[2] || 'ts-errors.json';
    if (!fs.existsSync(errorFile)) {
      console.error(`Error file not found: ${errorFile}`);
      console.log('Run: npx tsc --noEmit --pretty false 2> ts-errors.json');
      process.exit(1);
    }
    
    const errors: TypeScriptError[] = JSON.parse(fs.readFileSync(errorFile, 'utf8'));
    const snapshotErrors = errors.filter(e => e.resource.includes('/snapshots/'));
    
    console.log(`📊 Found ${snapshotErrors.length} errors in snapshots folder (${((snapshotErrors.length/errors.length)*100).toFixed(0)}% of total)`);
    console.log('');
    
    // Group by file
    const byFile = new Map<string, TypeScriptError[]>();
    snapshotErrors.forEach(error => {
      const file = error.resource;
      if (!byFile.has(file)) {
        byFile.set(file, []);
      }
      byFile.get(file)!.push(error);
    });
    
    // Show each file's issues
    console.log('📁 SNAPSHOT FILES ANALYSIS:');
    console.log('===========================\n');
    
    let fileCount = 1;
    for (const [filePath, fileErrors] of byFile.entries()) {
      const fileName = path.basename(filePath);
      const relativePath = path.relative(this.projectRoot, filePath);
      
      console.log(`${fileCount}. ${fileName}`);
      console.log(`   Path: ${relativePath}`);
      console.log(`   Total Errors: ${fileErrors.length}`);
      
      // Group errors by type
      const errorGroups = new Map<string, number>();
      fileErrors.forEach(e => {
        errorGroups.set(e.code, (errorGroups.get(e.code) || 0) + 1);
      });
      
      console.log(`   Error Breakdown:`);
      for (const [code, count] of errorGroups.entries()) {
        const description = this.getErrorDescription(code);
        console.log(`     • TS${code}: ${count}× - ${description}`);
      }
      
      // Show first 3 errors as examples
      console.log(`   Sample Errors:`);
      fileErrors.slice(0, 3).forEach((error, i) => {
        console.log(`     ${i+1}. Line ${error.startLineNumber}: ${error.message.substring(0, 80)}...`);
      });
      
      console.log('');
      fileCount++;
    }
    
    // Recommendations
    console.log('🎯 RECOMMENDED FIX STRATEGY:');
    console.log('============================\n');
    
    console.log('1. FIX SEQUENCE:');
    console.log('   a. sampleSnapshotInstance.ts (104 errors - the main issue)');
    console.log('   b. snapshotBuilder.ts (29 errors)');
    console.log('   c. addToSnapshotList.tsx (11 errors)');
    console.log('   d. convertMetadata.ts (1 error)');
    console.log('');
    
    console.log('2. COMMON ERROR PATTERNS:');
    const allCodes = snapshotErrors.map(e => e.code);
    const codeCounts = allCodes.reduce((acc, code) => {
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sortedCodes = Object.entries(codeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    sortedCodes.forEach(([code, count]) => {
      console.log(`   • TS${code}: ${count}× - ${this.getErrorDescription(code)}`);
    });
    console.log('');
    
    console.log('3. QUICK FIX COMMANDS:');
    console.log('   # Open the main problem file:');
    console.log('   code src/app/snapshots/sampleSnapshotInstance.ts');
    console.log('');
    console.log('   # Check just snapshot files:');
    console.log('   npx tsc --noEmit src/app/snapshots/*.ts src/app/snapshots/*.tsx 2>&1 | head -20');
  }
  
  private getErrorDescription(code: string): string {
    const descriptions: Record<string, string> = {
      '1002': 'Missing comma (",")',
      '1003': 'Missing identifier (variable/function name)',
      '1005': 'Missing comma in list/parameters',
      '1109': 'Expression expected after keyword',
      '1110': 'Type annotation expected',
      '1128': 'Declaration or statement expected - often missing semicolon or bracket',
      '1135': 'Argument expected in function call',
      '1161': 'Unclosed template literal (`string`)',
      '1434': 'Invalid JSX expression',
      '2809': 'Missing type argument for generic'
    };
    
    return descriptions[code] || `TS${code} error`;
  }
}

// Run the analysis
const fixer = new SnapshotsFixer();
fixer.analyzeSnapshots().catch(console.error);