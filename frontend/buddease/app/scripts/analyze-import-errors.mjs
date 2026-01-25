#!/usr/bin/env node
// app/scripts/analyze-import-errors.cjs
// Generic import error analyzer - counts and categorizes import errors

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function main() {
  const args = process.argv.slice(2);
  const focusFile = args.find(arg => !arg.startsWith('-'));
  const verbose = args.includes('--verbose') || args.includes('-v');
  const summarize = args.includes('--summary') || args.includes('-s');
  
  console.log('📊 Import Error Analyzer\n');
  
  // Get TypeScript errors
  const tsErrors = getTypeScriptErrors();
  
  if (tsErrors.length === 0) {
    console.log('✅ No TypeScript import errors found');
    return;
  }
  
  // Filter by focus file if specified
  let filteredErrors = tsErrors;
  if (focusFile) {
    const fullPath = path.resolve(process.cwd(), focusFile);
    filteredErrors = tsErrors.filter(error => error.file === fullPath);
    console.log(`🔍 Focusing on: ${focusFile}`);
  }
  
  // Analyze and categorize
  const analysis = analyzeErrors(filteredErrors);
  
  // Display results
  if (summarize) {
    displaySummary(analysis);
  } else if (verbose) {
    displayVerbose(analysis, tsErrors);
  } else {
    displayStandard(analysis);
  }
  
  // Generate recommendations
  displayRecommendations(analysis);
}

function getTypeScriptErrors() {
  console.log('🔍 Running TypeScript compilation check...');
  
  let output = '';
  try {
    output = execSync('npx tsc --noEmit --skipLibCheck false 2>&1', {
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (error) {
    output = error.stdout?.toString() || error.stderr?.toString() || error.message;
  }
  
  return parseTypeScriptErrors(output);
}

function parseTypeScriptErrors(output) {
  const errors = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    if (line.includes('error TS2307') || line.includes('Cannot find module')) {
      const fileMatch = line.match(/([^\(]+)\((\d+),(\d+)\):/);
      const moduleMatch = line.match(/Cannot find module ['"]([^'"]+)['"]/);
      
      if (fileMatch && moduleMatch) {
        const file = path.resolve(process.cwd(), fileMatch[1]);
        const lineNum = parseInt(fileMatch[2]);
        const module = moduleMatch[1];
        
        errors.push({
          file,
          line: lineNum,
          module,
          fullError: line.trim(),
          type: 'module_not_found'
        });
      }
    } else if (line.includes('error TS2305') || line.includes('has no exported member')) {
      const fileMatch = line.match(/([^\(]+)\((\d+),(\d+)\):/);
      const memberMatch = line.match(/has no exported member ['"]([^'"]+)['"]/);
      
      if (fileMatch && memberMatch) {
        const file = path.resolve(process.cwd(), fileMatch[1]);
        const lineNum = parseInt(fileMatch[2]);
        const member = memberMatch[1];
        
        errors.push({
          file,
          line: lineNum,
          module: member,
          fullError: line.trim(),
          type: 'export_not_found'
        });
      }
    }
  }
  
  return errors;
}

function analyzeErrors(errors) {
  const analysis = {
    totalErrors: errors.length,
    byFile: new Map(),
    byPattern: new Map(),
    byType: {
      module_not_found: 0,
      export_not_found: 0
    },
    mostAffectedFiles: [],
    commonPatterns: []
  };
  
  // Group by file
  errors.forEach(error => {
    // Count by type
    analysis.byType[error.type]++;
    
    // Group by file
    if (!analysis.byFile.has(error.file)) {
      analysis.byFile.set(error.file, []);
    }
    analysis.byFile.get(error.file).push(error);
    
    // Extract pattern
    const pattern = extractPattern(error.module);
    if (!analysis.byPattern.has(pattern)) {
      analysis.byPattern.set(pattern, []);
    }
    analysis.byPattern.get(pattern).push(error);
  });
  
  // Find most affected files
  analysis.mostAffectedFiles = Array.from(analysis.byFile.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);
  
  // Find common patterns
  analysis.commonPatterns = Array.from(analysis.byPattern.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);
  
  return analysis;
}

function extractPattern(modulePath) {
  if (modulePath.startsWith('@/')) {
    // Group by alias pattern
    if (modulePath.startsWith('@/app/')) return '@/app/*';
    if (modulePath.startsWith('@/utils/')) return '@/utils/*';
    if (modulePath.startsWith('@/')) return '@/other/*';
  } else if (modulePath.startsWith('.')) {
    // Group by relative depth
    const depth = (modulePath.match(/\.\.\//g) || []).length;
    if (depth >= 3) return 'deep_relative';
    if (depth >= 1) return 'relative';
    return 'same_dir';
  } else {
    // External package
    const parts = modulePath.split('/');
    return parts[0]; // Just the package name
  }
  return 'other';
}

function displayStandard(analysis) {
  console.log('📊 IMPORT ERROR ANALYSIS');
  console.log('═'.repeat(50));
  console.log(`Total Errors: ${analysis.totalErrors}`);
  console.log(`Files with Errors: ${analysis.byFile.size}`);
  console.log(`Module Not Found: ${analysis.byType.module_not_found}`);
  console.log(`Export Not Found: ${analysis.byType.export_not_found}`);
  
  console.log('\n🔴 TOP AFFECTED FILES:');
  analysis.mostAffectedFiles.forEach(([file, errors], index) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`${index + 1}. ${relativePath} - ${errors.length} errors`);
  });
  
  console.log('\n🎯 COMMON PATTERNS:');
  analysis.commonPatterns.forEach(([pattern, errors], index) => {
    console.log(`${index + 1}. ${pattern}: ${errors.length} occurrences`);
  });
}

function displayVerbose(analysis, allErrors) {
  console.log('📋 VERBOSE ERROR DETAILS');
  console.log('═'.repeat(50));
  
  analysis.mostAffectedFiles.forEach(([file, errors], fileIndex) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`\n📄 ${fileIndex + 1}. ${relativePath} (${errors.length} errors):`);
    
    errors.slice(0, 5).forEach((error, errorIndex) => {
      console.log(`   ${errorIndex + 1}. Line ${error.line}: ${error.module}`);
    });
    
    if (errors.length > 5) {
      console.log(`   ... and ${errors.length - 5} more`);
    }
  });
  
  console.log('\n📈 ERROR TYPE BREAKDOWN:');
  Object.entries(analysis.byType).forEach(([type, count]) => {
    console.log(`   • ${type.replace('_', ' ')}: ${count}`);
  });
}

function displaySummary(analysis) {
  console.log('📈 SUMMARY REPORT');
  console.log('═'.repeat(50));
  console.log(`Total Import Errors: ${analysis.totalErrors}`);
  
  // Quick stats
  const topPattern = analysis.commonPatterns[0];
  const topFile = analysis.mostAffectedFiles[0];
  
  if (topPattern) {
    console.log(`Most Common Issue: ${topPattern[0]} (${topPattern[1].length}x)`);
  }
  
  if (topFile) {
    const relativePath = path.relative(process.cwd(), topFile[0]);
    console.log(`Worst File: ${relativePath} (${topFile[1].length} errors)`);
  }
  
  // Health score
  const healthScore = calculateHealthScore(analysis);
  console.log(`Health Score: ${healthScore}/100`);
  
  if (healthScore < 50) {
    console.log('🚨 Critical: Immediate attention needed');
  } else if (healthScore < 80) {
    console.log('⚠️  Warning: Needs attention soon');
  } else {
    console.log('✅ Good: Manageable issues');
  }
}

function calculateHealthScore(analysis) {
  let score = 100;
  
  // Deduct for total errors
  if (analysis.totalErrors > 100) score -= 40;
  else if (analysis.totalErrors > 50) score -= 30;
  else if (analysis.totalErrors > 20) score -= 20;
  else if (analysis.totalErrors > 10) score -= 10;
  
  // Deduct for affected files
  if (analysis.byFile.size > 20) score -= 20;
  else if (analysis.byFile.size > 10) score -= 10;
  else if (analysis.byFile.size > 5) score -= 5;
  
  // Deduct for severe patterns
  if (analysis.commonPatterns.some(p => p[0].includes('@/'))) {
    score -= 15; // Path alias issues are serious
  }
  
  return Math.max(0, Math.min(100, score));
}

function displayRecommendations(analysis) {
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('═'.repeat(50));
  
  // Check for common issues
  const hasAliasIssues = analysis.commonPatterns.some(p => p[0].includes('@/'));
  const hasDeepRelative = analysis.commonPatterns.some(p => p[0] === 'deep_relative');
  const hasExportIssues = analysis.byType.export_not_found > 0;
  
  if (hasAliasIssues) {
    console.log('1. Path alias issues detected:');
    console.log('   • Check tsconfig.json path mappings');
    console.log('   • Run: cat tsconfig.json | grep -A5 "paths"');
    console.log('   • Ensure baseUrl is set to "."');
  }
  
  if (hasDeepRelative) {
    console.log('2. Deep relative imports detected:');
    console.log('   • Consider using path aliases');
    console.log('   • Create barrel exports in parent directories');
  }
  
  if (hasExportIssues) {
    console.log('3. Export mismatch issues detected:');
    console.log('   • Check if imports match exports');
    console.log('   • Run: node app/scripts/check-export.cjs <file>');
    console.log('   • Look for default vs named export mismatches');
  }
  
  // General recommendations
  console.log('\n🚀 QUICK ACTIONS:');
  console.log('1. Focus on top file first:');
  if (analysis.mostAffectedFiles[0]) {
    const file = analysis.mostAffectedFiles[0][0];
    const relativePath = path.relative(process.cwd(), file);
    console.log(`   pnpm analyze:import-errors ${relativePath}`);
  }
  
  console.log('2. Check most common pattern:');
  if (analysis.commonPatterns[0]) {
    console.log(`   Pattern: ${analysis.commonPatterns[0][0]}`);
    console.log(`   Affects: ${analysis.commonPatterns[0][1].length} imports`);
  }
  
  console.log('\n📝 Run with flags for more info:');
  console.log('   --verbose or -v  : Detailed error listing');
  console.log('   --summary or -s  : Health score and summary');
}

// Handle command line
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = { getTypeScriptErrors, analyzeErrors };