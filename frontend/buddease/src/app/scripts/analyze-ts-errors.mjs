#!/usr/bin/env node
// app/scripts/analyze-ts-errors.mjs

import { existsSync } from 'fs';
import { mkdir, readFile } from 'fs/promises';
import { createRequire } from 'module';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadTypeScriptSystem() {
  try {
    // First try to load from dist (if compiled)
    const { TypeScriptErrorFixSystem } = await import('../dist/app/error-analyzer/index.js');
    return TypeScriptErrorFixSystem;
  } catch {
    try {
      // Fallback to TypeScript source with ts-node/register
      require('ts-node/register');
      const { TypeScriptErrorFixSystem } = require('../src/app/error-analyzer');
      return TypeScriptErrorFixSystem;
    } catch (error) {
      console.error('❌ Failed to load TypeScript analyzer:', error.message);
      console.error('\n💡 Make sure dependencies are installed:');
      console.error('  pnpm add -D ts-node typescript');
      console.error('\n📁 Or check the analyzer exists at:');
      console.error('  src/app/error-analyzer/index.ts');
      console.error('  dist/app/error-analyzer/index.js');
      process.exit(1);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  // Parse arguments with enhanced options
  const options = {
    inputFile: null,
    readFromStdin: false,
    outputDir: './reports/ts-fixes',
    format: 'markdown',
    groupBy: 'file',
    minConfidence: 0,
    verbose: false,
    quiet: false,
    summaryOnly: false,
    quickSummary: false,
    generateReports: true
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--stdin' || arg === '-') {
      options.readFromStdin = true;
    } else if (arg === '--input' && args[i + 1]) {
      options.inputFile = args[++i];
    } else if (arg === '--output' && args[i + 1]) {
      options.outputDir = args[++i];
    } else if (arg === '--format' && args[i + 1]) {
      options.format = args[++i];
      if (!['markdown', 'json'].includes(options.format)) {
        console.error(`❌ Unsupported format: ${options.format}. Use 'markdown' or 'json'`);
        process.exit(1);
      }
    } else if (arg === '--group-by' && args[i + 1]) {
      options.groupBy = args[++i];
      const validGroupings = ['file', 'type', 'confidence', 'priority', 'severity'];
      if (!validGroupings.includes(options.groupBy)) {
        console.error(`❌ Invalid group-by: ${options.groupBy}. Use: ${validGroupings.join(', ')}`);
        process.exit(1);
      }
    } else if (arg === '--min-confidence' && args[i + 1]) {
      options.minConfidence = parseInt(args[++i], 10);
      if (isNaN(options.minConfidence) || options.minConfidence < 0 || options.minConfidence > 100) {
        console.error('❌ min-confidence must be between 0 and 100');
        process.exit(1);
      }
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--quiet' || arg === '-q') {
      options.quiet = true;
    } else if (arg === '--summary-only' || arg === '--summary') {
      options.summaryOnly = true;
      options.generateReports = false;
    } else if (arg === '--quick-summary') {
      options.quickSummary = true;
      options.generateReports = false;
    } else if (arg === '--no-reports') {
      options.generateReports = false;
    } else if (!arg.startsWith('--') && !options.inputFile && !options.readFromStdin) {
      options.inputFile = arg;
    }
  }
  
  // Validate
  if (!options.readFromStdin && !options.inputFile) {
    console.error('❌ Error: No input specified. Use --stdin or --input <file>');
    showHelp();
    process.exit(1);
  }
  
  if (options.verbose && !options.quiet) {
    console.log('📦 Loading TypeScript error analyzer...');
  }
  
  const TypeScriptErrorFixSystem = await loadTypeScriptSystem();
  const fixSystem = new TypeScriptErrorFixSystem();
  
  // Read error data
  let errorData;
  
  if (options.readFromStdin) {
    if (options.verbose && !options.quiet) {
      console.log('📥 Reading from stdin...');
    }
    errorData = await readStdin();
  } else {
    if (!existsSync(options.inputFile)) {
      console.error(`❌ Error: Input file not found: ${options.inputFile}`);
      console.error('💡 Try running: pnpm tsc --noEmit --pretty false 2>&1 > ts-errors.json');
      process.exit(1);
    }
    
    if (options.verbose && !options.quiet) {
      console.log(`📄 Reading from file: ${options.inputFile}`);
    }
    
    errorData = await readFile(options.inputFile, 'utf8');
  }
  
  // Parse JSON or raw TypeScript output
  let errors;
  try {
    // Try to parse as JSON first
    errors = JSON.parse(errorData);
    if (!Array.isArray(errors)) {
      throw new Error('Error data must be a JSON array');
    }
    
    if (options.verbose && !options.quiet) {
      console.log(`✅ Loaded ${errors.length} TypeScript errors from JSON`);
    }
  } catch (jsonError) {
    // Try to parse raw TypeScript compiler output
    try {
      errors = parseRawTypeScriptOutput(errorData);
      if (errors.length === 0) {
        console.error('❌ No TypeScript errors found in input');
        process.exit(1);
      }
      
      if (options.verbose && !options.quiet) {
        console.log(`✅ Parsed ${errors.length} TypeScript errors from raw output`);
      }
    } catch (parseError) {
      console.error('❌ Failed to parse error data:', parseError.message);
      console.error('\n💡 Input format can be:');
      console.error('1. JSON array: [{"resource": "file.ts", "code": "2304", ...}]');
      console.error('2. Raw tsc output: error TS2304: Cannot find name ...');
      console.error('\n📋 Try: pnpm tsc --noEmit --pretty false 2>&1 | pnpm analyze:ts-errors:stdin');
      console.error('     or: pnpm type-check 2>&1 | pnpm analyze:ts-errors:stdin');
      process.exit(1);
    }
  }
  
  // Create output directory if needed
  if (options.generateReports) {
    try {
      await mkdir(options.outputDir, { recursive: true });
      if (options.verbose && !options.quiet) {
        console.log(`📁 Output directory: ${options.outputDir}`);
      }
    } catch (error) {
      console.error(`❌ Could not create output directory: ${options.outputDir}`);
      process.exit(1);
    }
  }
  
  // Run analysis
  if (!options.quiet) {
    console.log('🔬 Analyzing TypeScript errors...');
  }
  
  try {
    if (options.generateReports) {
      await fixSystem.analyzeAndGenerateReports(errors, {
        outputDir: options.outputDir,
        format: options.format,
        groupBy: options.groupBy,
        minConfidence: options.minConfidence
      });
      
      if (!options.quiet) {
        console.log(`✅ Analysis complete!`);
        console.log(`📋 Reports saved to: ${options.outputDir}`);
        console.log('');
        console.log('📊 To view summary:');
        console.log(`  cat ${options.outputDir}/summary.md | head -20`);
        console.log('');
        console.log('📂 To view all reports:');
        console.log(`  ls -la ${options.outputDir}/*.md`);
      }
    }
    
    // Always generate summary
    if (options.summaryOnly || options.quickSummary) {
      const summary = await fixSystem.generateQuickSummary(errors);
      console.log('\n' + summary);
    } else if (options.generateReports) {
      // Still show brief summary even with reports
      const summary = await fixSystem.generateQuickSummary(errors);
      if (!options.quiet) {
        console.log('\n📋 Quick Summary:');
        console.log(summary.split('\n').slice(0, 10).join('\n'));
      }
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    if (error.stack && options.verbose) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

function parseRawTypeScriptOutput(output) {
  const lines = output.split('\n');
  const errors = [];
  const errorPattern = /^(.*\.(?:ts|tsx|js|jsx))\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/;
  
  for (const line of lines) {
    const match = line.match(errorPattern);
    if (match) {
      const [, resource, startLine, startColumn, code, message] = match;
      errors.push({
        resource: resource.trim(),
        code: `TS${code}`,
        message: message.trim(),
        startLineNumber: parseInt(startLine, 10),
        startColumn: parseInt(startColumn, 10),
        severity: 8 // Error severity in VS Code format
      });
    }
  }
  
  return errors;
}

async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('readable', () => {
      let chunk;
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk;
      }
    });
    
    process.stdin.on('end', () => {
      resolve(data);
    });
  });
}

function showHelp() {
  console.log(`
🔍 TypeScript Error Analyzer (PNPM Edition)
==========================================

Analyze and generate fix reports for TypeScript compilation errors.

Usage:
  pnpm analyze:ts-errors [options] <input-file>
  pnpm analyze:ts-errors --stdin
  pnpm analyze:ts-errors --help

Examples:
  pnpm analyze:ts-errors ts-errors.json
  pnpm tsc --noEmit 2>&1 | pnpm analyze:ts-errors --stdin
  pnpm analyze:ts-errors --input errors.json --output ./analysis
  pnpm analyze:ts-errors --stdin --group-by type --min-confidence 70
  pnpm analyze:ts-errors --summary-only ts-errors.json

Options:
  --input <file>       Path to JSON file with TypeScript errors
  --stdin, -           Read errors from standard input
  --output <dir>       Output directory for reports (default: ./reports/ts-fixes)
  --format <format>    Output format: markdown, json (default: markdown)
  --group-by <type>    Group errors by: file, type, confidence, priority, severity
  --min-confidence <n> Minimum confidence % to include (default: 0)
  --summary-only       Only show summary, don't generate reports
  --quick-summary      Show quick summary and exit
  --no-reports         Don't generate detailed reports
  --verbose, -v        Verbose output
  --quiet, -q          Quiet mode (minimal output)
  --help, -h           Show this help message

Input Formats Accepted:
  1. JSON array (VS Code error format):
     [{"resource":"file.ts","code":"2304","message":"Cannot find name 'x'",...}]
     
  2. Raw TypeScript compiler output:
     file.ts(10,5): error TS2304: Cannot find name 'x'

Quick Workflows:
  1. Analyze current TypeScript errors:
     pnpm type-check 2>&1 | pnpm analyze:ts-errors --stdin
     
  2. Generate comprehensive fix plan:
     pnpm analyze:ts-output
     
  3. Quick error summary:
     pnpm analyze:ts-errors --quick-summary ts-errors.json
     
  4. Track progress over time:
     pnpm track:ts-progress

Integration with existing commands:
  • pnpm analyze:ts-errors:advanced    - Full interactive analysis
  • pnpm fix:ts-errors                 - Generate fix reports
  • pnpm dev:with-ts-fixes             - Dev mode with error analysis
  • pnpm build:with-ts-fixes           - Build with error analysis
`);
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  process.exit(0);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

export { main };
