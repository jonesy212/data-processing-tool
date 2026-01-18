// diagnose-line-specific.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Line 332 Diagnostic Analysis\n');
console.log('='.repeat(70));

const TARGET_FILE = 'src/app/snapshots/sampleSnapshotInstance.ts';
const TARGET_LINE = 332;
const CONTEXT_LINES = 5;

try {
  // Check if file exists
  if (!fs.existsSync(TARGET_FILE)) {
    console.error(`❌ File not found: ${TARGET_FILE}`);
    console.log(`   Current directory: ${process.cwd()}`);
    process.exit(1);
  }

  // Read and analyze the file
  const content = fs.readFileSync(TARGET_FILE, 'utf8');
  const lines = content.split('\n');
  
  if (TARGET_LINE > lines.length) {
    console.error(`❌ File only has ${lines.length} lines`);
    process.exit(1);
  }

  // Display context
  displayContext(lines, TARGET_LINE, CONTEXT_LINES);
  
  // Analyze the specific line
  analyzeLine(lines[TARGET_LINE - 1], TARGET_LINE);
  
  // Check TypeScript errors for this line
  checkTypescriptErrors(TARGET_FILE, TARGET_LINE);
  
  // Provide fix suggestions
  provideFixSuggestions(lines[TARGET_LINE - 1]);

} catch (error) {
  console.error('❌ Error:', error.message);
}

// ========== HELPER FUNCTIONS ==========

function displayContext(lines, targetLine, contextLines) {
  console.log('📄 CODE CONTEXT:\n');
  
  const start = Math.max(0, targetLine - contextLines - 1);
  const end = Math.min(lines.length, targetLine + contextLines);
  
  console.log(`Lines ${start + 1}-${end}:`);
  console.log('-'.repeat(70));
  
  for (let i = start; i < end; i++) {
    const lineNum = i + 1;
    const prefix = lineNum === targetLine ? '>>> ' : '    ';
    const line = lines[i];
    
    // Truncate very long lines
    const displayLine = line.length > 120 
      ? line.substring(0, 117) + '...' 
      : line;
    
    console.log(`${prefix}${lineNum.toString().padStart(3)}: ${displayLine}`);
  }
  console.log('');
}

function analyzeLine(line, lineNumber) {
  console.log('🔬 LINE ANALYSIS:');
  console.log('-'.repeat(70));
  
  console.log(`Line ${lineNumber}: "${line}"`);
  console.log(`Length: ${line.length} characters`);
  console.log(`Trimmed length: ${line.trim().length} characters`);
  
  // Character analysis
  console.log('\n📏 CHARACTER ANALYSIS:');
  const brackets = [
    { open: '<', close: '>', name: 'Generic/JSX' },
    { open: '(', close: ')', name: 'Parentheses' },
    { open: '{', close: '}', name: 'Braces' },
    { open: '[', close: ']', name: 'Brackets' },
    { open: '`', close: '`', name: 'Template literal' }
  ];
  
  brackets.forEach(({ open, close, name }) => {
    const openCount = (line.match(new RegExp(`\\${open}`, 'g')) || []).length;
    const closeCount = (line.match(new RegExp(`\\${close}`, 'g')) || []).length;
    
    if (openCount !== closeCount) {
      console.log(`⚠️  ${name}: ${openCount} opening, ${closeCount} closing`);
      if (openCount > closeCount) {
        console.log(`   Missing ${openCount - closeCount} closing ${close}`);
      }
    }
  });
  
  // Check for specific patterns
  console.log('\n🎯 PATTERN DETECTION:');
  
  const patterns = [
    { 
      regex: /<[^>]*=/, 
      message: 'Generic type with = before >',
      fix: 'Change <Type = to <Type> ='
    },
    { 
      regex: /\([^)]*=[^)]*\)/, 
      message: 'Assignment inside parentheses',
      fix: 'Check if this should be a comparison (== or ===)'
    },
    { 
      regex: /[^=]==[^=]/, 
      message: 'Possible assignment (=) instead of comparison (==)',
      fix: 'Change = to == or ==='
    },
    { 
      regex: /:\s*[^=]*=\s*[^;]*$/, 
      message: 'Type annotation with assignment',
      fix: 'Should be: variable: Type = value'
    }
  ];
  
  patterns.forEach(pattern => {
    if (pattern.regex.test(line)) {
      console.log(`⚠️  ${pattern.message}`);
      console.log(`   Fix: ${pattern.fix}`);
    }
  });
}

function checkTypescriptErrors(filePath, targetLine) {
  console.log('\n🔧 TYPESCRIPT CHECK:');
  console.log('-'.repeat(70));
  
  try {
    const output = execSync(`npx tsc --noEmit "${filePath}" 2>&1`, { encoding: 'utf8' });
    const lines = output.split('\n');
    
    const lineErrors = lines.filter(line => 
      line.includes(`(${targetLine},`) && line.includes('error TS')
    );
    
    if (lineErrors.length > 0) {
      console.log(`Found ${lineErrors.length} TypeScript error(s) on line ${targetLine}:`);
      lineErrors.forEach(error => {
        console.log(`  • ${error.trim()}`);
      });
    } else {
      console.log(`No TypeScript errors found specifically on line ${targetLine}`);
      console.log('(But there may be errors elsewhere in the file)');
    }
    
  } catch (error) {
    console.log('TypeScript output:', error.stdout || error.message);
  }
}

function provideFixSuggestions(line) {
  console.log('\n💡 FIX SUGGESTIONS:');
  console.log('-'.repeat(70));
  
  // Common fixes based on patterns
  if (line.includes('<') && line.includes('=') && !line.includes('>')) {
    console.log('1. 🔧 Likely issue: Unclosed generic type');
    console.log('   Wrong:   SomeType<Param = value');
    console.log('   Correct: SomeType<Param> = value');
    console.log('');
    console.log('   Try this fix:');
    console.log('   sed -i \'s/\\(<[^>]*\\) = /\\1> = /\' src/app/snapshots/sampleSnapshotInstance.ts');
  }
  
  if ((line.match(/\(/g) || []).length > (line.match(/\)/g) || []).length) {
    console.log('2. 🔧 Likely issue: Unclosed parentheses');
    console.log('   Check for missing ) after function calls or conditions');
  }
  
  console.log('\n🚀 IMMEDIATE ACTIONS:');
  console.log('1. Open the file:');
  console.log(`   code -g ${TARGET_FILE}:${TARGET_LINE}`);
  console.log('');
  console.log('2. Look at column 91 specifically:');
  console.log('   The error says "column 91", so check what character is there');
  console.log('');
  console.log('3. Common characters at error positions:');
  console.log('   • = (should probably be > or ) or ;)');
  console.log('   • , (might be missing)');
  console.log('   • : (might be in wrong place)');
}