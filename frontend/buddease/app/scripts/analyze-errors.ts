// analyze-errors.ts

import { BuildErrorHandler } from '@/utils/BuildErrorHandler';
import { ErrorReporter } from '@/utils/ErrorReporter';
import fs from 'fs';
import path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🔧 Error Analysis System');
  console.log('═'.repeat(40));

  if (command === 'build' || command === '--build') {
    await BuildErrorHandler.analyzeAndFixBuild();
  } 
  else if (command === 'typescript' || command === '--typescript') {
    await BuildErrorHandler.handleTypeCheck();
  }
  else if (command === 'file' && args[1]) {
    // Analyze a specific file
    const filePath = path.resolve(process.cwd(), args[1]);
    if (fs.existsSync(filePath)) {
      await analyzeFileErrors(filePath);
    } else {
      console.error('❌ File not found:', filePath);
    }
  }
  else if (command === 'quick' && args[1]) {
    // Quick analysis of error output
    const errorOutput = args[1];
    ErrorReporter.printQuickFixSummary(errorOutput);
  }
  else {
    console.log(`
Usage:
  pnpm analyze:errors build          - Analyze build errors
  pnpm analyze:errors typescript     - Analyze TypeScript errors
  pnpm analyze:errors file <path>    - Analyze specific file
  pnpm analyze:errors quick "<error>" - Quick analysis of error message

Examples:
  pnpm analyze:errors build
  pnpm analyze:errors file src/app/generators/corrections/analyzers/ReactNativeAnalyzer.ts
  pnpm analyze:errors quick "Expected ) but found {"
    `);
  }
}

async function analyzeFileErrors(filePath: string): Promise<void> {
  console.log(`📁 Analyzing file: ${filePath}`);
  
  try {
    // Check file syntax
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const { stderr } = await execAsync(`npx tsc --noEmit --skipLibCheck "${filePath}"`, {
      cwd: process.cwd()
    }).catch(error => ({ stderr: error.stderr || error.message }));

    if (stderr) {
      console.log('\n📋 File analysis results:');
      ErrorReporter.printQuickFixSummary(stderr);
      
      const reportFile = await ErrorReporter.generateErrorReport(stderr, './file-error-reports');
      console.log(`📄 Detailed report: ${reportFile}`);
    } else {
      console.log('✅ No syntax errors found in file');
    }

  } catch (error) {
    console.error('❌ Error analyzing file:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };
