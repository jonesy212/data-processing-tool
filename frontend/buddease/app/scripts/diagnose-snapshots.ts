#!/usr/bin/env tsx
// diagnose-snapshots.ts

import fs from 'fs';
import path from 'path';

function diagnoseSampleSnapshot() {
  const filePath = 'src/app/snapshots/sampleSnapshotInstance.ts';
  
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    return;
  }
  
  console.log('🔍 Diagnosing:', filePath);
  console.log('=' .repeat(60));
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Common patterns to check for
  const patterns = {
    missingSemicolon: /[^;]\s*$/,
    missingComma: /[^,]\s*$/,
    unclosedBrace: /{/g,
    unclosedParen: /\(/g,
    unclosedBracket: /\[/g
  };
  
  let issueCount = 0;
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for common syntax issues
    if (line.includes('{') && !line.includes('}')) {
      console.log(`Line ${lineNum}: ⚠️  Possible unclosed brace`);
      issueCount++;
    }
    
    if (line.includes('(') && !line.includes(')') && line.trim().endsWith('(')) {
      console.log(`Line ${lineNum}: ⚠️  Possible unclosed parenthesis`);
      issueCount++;
    }
    
    if (line.includes('`') && (line.split('`').length - 1) % 2 !== 0) {
      console.log(`Line ${lineNum}: ⚠️  Possible unclosed template literal`);
      issueCount++;
    }
    
    // Check for common TypeScript patterns
    if (line.includes(':') && !line.includes(';') && !line.includes('}')) {
      console.log(`Line ${lineNum}: ⚠️  Type declaration might need semicolon`);
      issueCount++;
    }
  });
  
  console.log('\n📊 STATISTICS:');
  console.log(`Total lines: ${lines.length}`);
  console.log(`Potential issues found: ${issueCount}`);
  
  // Show first 20 lines for context
  console.log('\n📄 FIRST 20 LINES:');
  console.log('-' .repeat(60));
  lines.slice(0, 20).forEach((line, index) => {
    console.log(`${(index + 1).toString().padStart(3)}: ${line}`);
  });
}