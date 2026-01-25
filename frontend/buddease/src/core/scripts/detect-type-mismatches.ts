// detect-type-mismatches.ts
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function detectTypeMismatches() {
  console.log('🔍 Detecting type import mismatches...\n');

  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  let hasVerbatimSyntax = false;
  let tsconfigError = '';

  if (fs.existsSync(tsconfigPath)) {
    try {
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
      
      // Remove trailing commas and fix common JSON issues
      const fixedContent = tsconfigContent
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
      
      const tsconfig = JSON.parse(fixedContent);
      hasVerbatimSyntax = tsconfig.compilerOptions?.verbatimModuleSyntax === true;
      console.log(`📄 Using tsconfig.json (verbatimModuleSyntax: ${hasVerbatimSyntax})`);
    } catch (error: any) {
      tsconfigError = error.message;
      console.warn('⚠️ Could not parse tsconfig.json:', error.message);
      console.log('   Using default TypeScript flags');
    }
  }

  // Use spawn instead of execSync to handle large outputs
  const flags = hasVerbatimSyntax 
    ? ['--noEmit', '--isolatedModules']
    : ['--noEmit', '--isolatedModules', '--verbatimModuleSyntax'];
  
  console.log(`Running: npx tsc ${flags.join(' ')}`);

  return new Promise<boolean>((resolve) => {
    const tscProcess = spawn('npx', ['tsc', ...flags], {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    let stdout = '';
    let stderr = '';
    let hasStackError = false;

    tscProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    tscProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      // Check for stack overflow error
      if (data.toString().includes('Maximum call stack size exceeded')) {
        hasStackError = true;
      }
    });

    tscProcess.on('close', (code) => {
      console.log(`\nTypeScript exited with code: ${code}`);
      
      if (hasStackError) {
        console.error('❌ TYPE INFERENCE STACK OVERFLOW DETECTED');
        console.error('   This is caused by recursive/infinite generic type definitions.');
        console.error('\n💡 POSSIBLE SOLUTIONS:');
        console.error('1. Reduce complexity of recursive generic types');
        console.error('2. Use type assertions to break type inference loops');
        console.error('3. Simplify deeply nested generic interfaces');
        console.error('4. Check for circular type references in:');
        console.error('   - Snapshot<T, K, ...> types');
        console.error('   - Data<T, K, ...> types');
        console.error('   - Todo<T, K, ...> types');
        console.error('\n🔧 Quick fix: Disable some type checks temporarily:');
        console.error(`
  "compilerOptions": {
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "maxNodeModuleJsDepth": 0
  }
        `);
        resolve(true);
        return;
      }

      // Combine outputs
      const output = stdout + stderr;
      const allErrors = output.split('\n').filter(line => line.trim().length > 0);
      
      if (allErrors.length === 0 && code === 0) {
        console.log('✅ No TypeScript errors found!');
        resolve(false);
        return;
      }

      console.log(`📊 Found ${allErrors.length} total TypeScript errors/warnings`);

      // Show first 20 errors
      console.log('\n🚨 FIRST 20 ERRORS:');
      allErrors.slice(0, 20).forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });

      if (allErrors.length > 20) {
        console.log(`   ... and ${allErrors.length - 20} more`);
      }

      // Group by file for analysis
      const errorsByFile = new Map<string, string[]>();
      allErrors.forEach(error => {
        const match = error.match(/(src\/[^:]+\.(?:ts|tsx|js|jsx)):/);
        if (match) {
          const file = match[1];
          if (!errorsByFile.has(file)) {
            errorsByFile.set(file, []);
          }
          errorsByFile.get(file)!.push(error);
        }
      });

      if (errorsByFile.size > 0) {
        console.log('\n📁 TOP FILES WITH ERRORS:');
        Array.from(errorsByFile.entries())
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, 10)
          .forEach(([file, errors], i) => {
            const relativePath = path.relative(process.cwd(), file);
            console.log(`${i + 1}. ${relativePath}: ${errors.length} errors`);
            
            // Show first 2 errors for each file
            if (errors.length > 0) {
              errors.slice(0, 2).forEach((err, j) => {
                console.log(`   ${j + 1}. ${err.substring(err.indexOf(': ') + 2)}`);
              });
              if (errors.length > 2) {
                console.log(`   ... and ${errors.length - 2} more`);
              }
            }
          });
      }

      // Check for specific error patterns
      const stackOverflowErrors = allErrors.filter(err => 
        err.includes('Maximum call stack') || 
        err.includes('call stack size exceeded')
      );

      const syntaxErrors = allErrors.filter(err => 
        err.includes('error TS') && 
        (err.includes('expected') || err.includes('unexpected'))
      );

      const typeErrors = allErrors.filter(err => 
        err.includes('error TS') &&
        (err.includes('type') || err.includes('Type'))
      );

      console.log('\n📊 ERROR CATEGORIES:');
      console.log(`   Stack overflow: ${stackOverflowErrors.length}`);
      console.log(`   Syntax errors: ${syntaxErrors.length}`);
      console.log(`   Type errors: ${typeErrors.length}`);
      console.log(`   Other errors: ${allErrors.length - syntaxErrors.length - typeErrors.length}`);

      // Provide specific advice based on error types
      if (stackOverflowErrors.length > 0) {
        console.log('\n💡 STACK OVERFLOW ADVICE:');
        console.log('   1. Check for recursive generic types in:');
        console.log('      - Snapshot<T, K, Meta...>');
        console.log('      - Data<T, K, Meta...>');
        console.log('      - Todo<T, K, Meta...>');
        console.log('   2. Add type constraints to break cycles');
        console.log('   3. Use simpler types for complex generics');
      }

      if (syntaxErrors.length > 0) {
        console.log('\n💡 SYNTAX ERROR ADVICE:');
        console.log('   1. Fix the files listed above');
        console.log('   2. Check for missing commas, brackets, or semicolons');
        console.log('   3. Look for files with wrong extensions (.ts vs .tsx)');
      }

      // Generate error report file
      const reportPath = path.join(process.cwd(), 'type-errors-report.txt');
      const report = [
        '=== TYPE ERROR REPORT ===',
        `Generated: ${new Date().toISOString()}`,
        `Total errors: ${allErrors.length}`,
        '',
        'TOP FILES WITH ERRORS:',
        ...Array.from(errorsByFile.entries())
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, 20)
          .map(([file, errors], i) => `${i + 1}. ${file}: ${errors.length} errors`),
        '',
        'ALL ERRORS:',
        ...allErrors.map((err, i) => `${i + 1}. ${err}`)
      ].join('\n');

      fs.writeFileSync(reportPath, report);
      console.log(`\n📝 Full error report saved to: ${reportPath}`);

      resolve(allErrors.length > 0);
    });

    // Timeout after 30 seconds to prevent hanging
    setTimeout(() => {
      if (tscProcess.exitCode === null) {
        console.error('⏰ TypeScript check timed out after 30 seconds');
        tscProcess.kill();
        resolve(true);
      }
    }, 30000);
  });
}

// Alternative: Run TypeScript incrementally with limited depth
function runLimitedTypeCheck() {
  console.log('\n🔧 Running limited type check to avoid stack overflow...');
  
  const limitedFlags = [
    '--noEmit',
    '--skipLibCheck',
    '--skipDefaultLibCheck',
    '--maxNodeModuleJsDepth', '0',
    '--diagnostics' // Show memory usage
  ];

  try {
    const result = execSync(`npx tsc ${limitedFlags.join(' ')} 2>&1`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    // Filter to show only real errors, not warnings
    const lines = result.split('\n');
    const errors = lines.filter(line => 
      line.includes('error TS') && !line.includes('warning')
    );

    console.log(`Found ${errors.length} critical errors (warnings hidden)`);
    errors.slice(0, 20).forEach((error, i) => {
      console.log(`${i + 1}. ${error}`);
    });

    return errors.length > 0;
  } catch (error: any) {
    console.error('Limited check failed:', error.message);
    return true;
  }
}

// ES Module check
if (import.meta.url === `file://${process.argv[1]}`) {
  detectTypeMismatches().then(hasErrors => {
    if (hasErrors) {
      console.log('\n💡 Try running a limited check:');
      console.log('   pnpm tsx src/app/scripts/detect-type-mismatches.ts --limited');
    }
    process.exit(hasErrors ? 1 : 0);
  }).catch(console.error);
}

export { detectTypeMismatches, runLimitedTypeCheck };