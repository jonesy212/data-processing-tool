#!/usr/bin/env tsx
// run-phase-safely.ts

import { execSync, spawn } from 'child_process';

async function runPhaseSafely(phaseName: string, options: string[] = []) {
  console.log(`🛡️  Running phase safely: ${phaseName}\n`);
  
  // Step 1: Check for TypeScript errors
  console.log('1. Checking for TypeScript errors...');
  try {
    execSync('pnpm type-check 2>&1 | grep -E "(does not provide an export|is a type and must be imported)" | head -5', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('   ✅ No critical import errors detected');
  } catch (error: any) {
    const output = error.stdout?.toString() || '';
    if (output.includes('does not provide an export')) {
      console.log('   ⚠️  Import/export errors detected');
      console.log('\n💡 Running automatic fixes...\n');
      
      // Run fixes
      execSync('pnpm fix-type-exports --fix', { stdio: 'inherit' });
      execSync('pnpm fix-imports:safe', { stdio: 'inherit' });
      
      console.log('\n✅ Fixes applied. Continuing...\n');
    }
  }
  
  // Step 2: Run the actual phase
  console.log(`2. Running phase: ${phaseName}`);
  
  const args = ['src/app/error-analyzer/cli/phases-cli.ts', 'phase', phaseName, ...options];
  
  const process = spawn('tsx', args, {
    stdio: 'inherit',
    shell: true
  });
  
  return new Promise((resolve, reject) => {
    process.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Phase failed with code ${code}`));
      }
    });
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: pnpm run-phase-safely <phase-name> [options]');
    console.log('\nExamples:');
    console.log('  pnpm run-phase-safely error-grouping');
    console.log('  pnpm run-phase-safely error-grouping --area frontend');
    return;
  }
  
  const phaseName = args[0];
  const options = args.slice(1);
  
  try {
    await runPhaseSafely(phaseName, options);
    console.log('\n🎉 Phase completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Phase failed:', error.message);
    
    // Provide helpful suggestions
    if (error.message.includes('does not provide an export')) {
      console.log('\n🔧 DataStore Import Issue Detected!');
      console.log('\nQuick fix sequence:');
      console.log('  1. pnpm fix-type-exports --fix');
      console.log('  2. pnpm fix-imports:safe');
      console.log('  3. pnpm type-check');
      console.log('  4. pnpm run-phase-safely ' + phaseName);
    }
    
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}