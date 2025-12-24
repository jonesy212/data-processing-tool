// app/scripts/analyze-snapshots-tsc.mjs (ES MODULE VERSION)
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Snapshot Files TypeScript Analysis\n');
console.log('='.repeat(70));

// Get project root (where package.json is)
const PROJECT_ROOT = process.cwd();
const SNAPSHOTS_PATH = path.join(PROJECT_ROOT, 'src/app/snapshots');
const COMMAND = `npx tsc --noEmit ${SNAPSHOTS_PATH}/*.ts ${SNAPSHOTS_PATH}/*.tsx 2>&1`;

console.log(`📁 Project Root: ${PROJECT_ROOT}`);
console.log(`📁 Snapshots Path: ${SNAPSHOTS_PATH}`);

// Check if snapshots directory exists
if (!fs.existsSync(SNAPSHOTS_PATH)) {
  console.error(`❌ Snapshots directory not found: ${SNAPSHOTS_PATH}`);
  console.log('\n💡 Try running from the project root directory');
  console.log('   Current directory:', PROJECT_ROOT);
  process.exit(1);
}

try {
  console.log(`\n📁 Analyzing: ${SNAPSHOTS_PATH}`);
  console.log(`⚙️  Command: ${COMMAND}\n`);
  
  // Run TypeScript compiler
  const output = execSync(COMMAND, { encoding: 'utf8' });
  
  if (!output.trim()) {
    console.log('✅ No TypeScript errors found in snapshot files!');
    process.exit(0);
  }
  
  // Parse errors efficiently
  const errors = parseTscOutput(output);
  
  if (errors.length === 0) {
    console.log('✅ No parsable TypeScript errors found.');
    process.exit(0);
  }
  
  // Display results
  displayErrorSummary(errors);
  displayFileAnalysis(errors);
  displayTopIssues(errors);
  displayRecommendations(errors, PROJECT_ROOT);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n💡 Try running manually:');
  console.log(`   ${COMMAND}`);
}

// ========== HELPER FUNCTIONS ==========

function parseTscOutput(output) {
  const errors = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    if (!line.includes('error TS')) continue;
    
    // Match: filename(line,col): error TS1234: message
    const match = line.match(/^(.*?\.(?:ts|tsx))\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/);
    if (match) {
      const [, file, lineNum, column, code, message] = match;
      errors.push({
        file: path.resolve(file.trim()),
        fileName: path.basename(file.trim()),
        line: parseInt(lineNum, 10),
        column: parseInt(column, 10),
        code,
        message: message.trim(),
        raw: line
      });
    }
  }
  
  return errors;
}

function displayErrorSummary(errors) {
  console.log('📊 ERROR SUMMARY');
  console.log('-'.repeat(70));
  
  const totalErrors = errors.length;
  const uniqueFiles = new Set(errors.map(e => e.fileName));
  
  console.log(`📈 Total Errors: ${totalErrors}`);
  console.log(`📁 Files Affected: ${uniqueFiles.size}`);
  
  // Error code distribution
  const codeCounts = {};
  errors.forEach(e => {
    codeCounts[e.code] = (codeCounts[e.code] || 0) + 1;
  });
  
  const sortedCodes = Object.entries(codeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  console.log('\n🎯 Top 5 Error Types:');
  sortedCodes.forEach(([code, count]) => {
    const desc = getErrorDescription(code);
    const percentage = ((count / totalErrors) * 100).toFixed(1);
    console.log(`   TS${code.padEnd(6)} ${count.toString().padStart(3)}× (${percentage}%) - ${desc}`);
  });
}

function displayFileAnalysis(errors) {
  console.log('\n📁 FILE-BY-FILE ANALYSIS');
  console.log('-'.repeat(70));
  
  // Group by file
  const byFile = {};
  errors.forEach(error => {
    if (!byFile[error.fileName]) byFile[error.fileName] = [];
    byFile[error.fileName].push(error);
  });
  
  // Sort by error count (descending)
  const sortedFiles = Object.entries(byFile)
    .sort((a, b) => b[1].length - a[1].length);
  
  sortedFiles.forEach(([fileName, fileErrors]) => {
    const errorCount = fileErrors.length;
    const firstError = fileErrors[0];
    
    console.log(`\n📄 ${fileName}`);
    console.log(`   Errors: ${errorCount}`);
    
    // Show first error location
    if (firstError) {
      console.log(`   First error at line ${firstError.line}, column ${firstError.column}`);
      console.log(`   Error: TS${firstError.code} - ${firstError.message.substring(0, 80)}`);
    }
    
    // Show context for the first error
    if (firstError && errorCount > 0) {
      try {
        const content = fs.readFileSync(firstError.file, 'utf8');
        const lines = content.split('\n');
        const startLine = Math.max(0, firstError.line - 2);
        const endLine = Math.min(lines.length, firstError.line + 1);
        
        console.log(`   Context (lines ${startLine + 1}-${endLine}):`);
        for (let i = startLine; i < endLine; i++) {
          const lineNum = i + 1;
          const prefix = lineNum === firstError.line ? '>>> ' : '    ';
          console.log(`${prefix}${lineNum.toString().padStart(3)}: ${lines[i]}`);
        }
      } catch (e) {
        // Couldn't read file - skip context
      }
    }
  });
}

function displayTopIssues(errors) {
  console.log('\n🔥 TOP ISSUES TO FIX');
  console.log('-'.repeat(70));
  
  // Find the worst file
  const byFile = {};
  errors.forEach(e => {
    byFile[e.fileName] = (byFile[e.fileName] || 0) + 1;
  });
  
  const worstFile = Object.entries(byFile)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (worstFile) {
    const [fileName, count] = worstFile;
    const percentage = ((count / errors.length) * 100).toFixed(1);
    console.log(`🎯 1. Fix ${fileName} first`);
    console.log(`    ${count} errors (${percentage}% of total)`);
  }
  
  // Find most common error type
  const codeCounts = {};
  errors.forEach(e => {
    codeCounts[e.code] = (codeCounts[e.code] || 0) + 1;
  });
  
  const mostCommon = Object.entries(codeCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (mostCommon) {
    const [code, count] = mostCommon;
    const desc = getErrorDescription(code);
    console.log(`🎯 2. Batch fix all TS${code} errors`);
    console.log(`    ${count} occurrences - ${desc}`);
  }
  
  // Find files with few errors (quick wins)
  const quickWins = errors.filter(e => {
    // Files with 3 or fewer errors
    const fileErrorCount = errors.filter(err => err.fileName === e.fileName).length;
    return fileErrorCount <= 3;
  });
  
  const quickWinFiles = [...new Set(quickWins.map(e => e.fileName))];
  
  if (quickWinFiles.length > 0) {
    console.log(`🎯 3. Quick wins (${quickWinFiles.length} files with ≤3 errors):`);
    quickWinFiles.slice(0, 3).forEach(file => {
      const fileErrors = errors.filter(e => e.fileName === file);
      console.log(`    • ${file} (${fileErrors.length} errors)`);
    });
  }
}

function displayRecommendations(errors, projectRoot) {
  console.log('\n🚀 RECOMMENDED ACTIONS');
  console.log('-'.repeat(70));
  
  const relativePath = path.relative(projectRoot, __dirname);
  
  console.log('📝 Run these commands in order:');
  console.log('');
  
  // Check if we have the line 332 error specifically
  const line332Error = errors.find(e => e.line === 332);
  if (line332Error) {
    console.log('1. 🔍 Diagnose the specific line 332 issue:');
    console.log(`   cd ${projectRoot}`);
    console.log('   sed -n "330,335p" src/app/snapshots/sampleSnapshotInstance.ts');
    console.log('');
  }
  
  console.log('2. 📊 Check TypeScript errors for a specific file:');
  console.log(`   cd ${projectRoot}`);
  console.log('   npx tsc --noEmit src/app/snapshots/sampleSnapshotInstance.ts 2>&1 | head -10');
  console.log('');
  
  console.log('3. 🔧 Try to fix common issues automatically:');
  console.log(`   cd ${projectRoot}`);
  console.log('   node app/scripts/auto-fix-generics.js');
  console.log('');
  
  console.log('4. 🛠️  Run your existing correction system:');
  console.log(`   cd ${projectRoot}`);
  console.log('   pnpm analyze:snapshots');
  console.log('');
  
  console.log('💡 Pro tip: Focus on one file at a time!');
  console.log('   Fix sampleSnapshotInstance.ts first (104 errors),');
  console.log('   then snapshotBuilder.ts (29 errors),');
  console.log('   then addToSnapshotList.tsx (11 errors).');
}

function getErrorDescription(code) {
  const descriptions = {
    '1002': 'Missing comma (",")',
    '1003': 'Missing identifier (variable/function name)',
    '1005': "Missing comma (',') in list/parameters",
    '1109': 'Expression expected after keyword',
    '1110': 'Type annotation expected',
    '1128': 'Missing semicolon, bracket, or declaration',
    '1135': 'Argument expected in function call',
    '1161': 'Unclosed template literal (`...`)',
    '1434': 'Invalid JSX expression',
    '2304': 'Cannot find name (missing import)',
    '2322': 'Type mismatch',
    '2741': 'Missing property in type'
  };
  
  return descriptions[code] || `TS${code} error - check TypeScript docs`;
}