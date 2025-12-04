// scripts/fix-imports.ts
import { ImportFixerService } from '@/app/generators/corrections/ImportFixServicies';
import { execSync } from 'child_process';

async function runTypeScriptCheck(): Promise<string[]> {
  console.log('🔍 Running TypeScript compiler to detect import errors...');
  
  try {
    const result = execSync('npx tsc --noEmit --pretty false 2>&1', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Parse TypeScript errors
    const errors: string[] = [];
    const lines = result.split('\n');
    
    for (const line of lines) {
      if (line.includes('error TS2307') || line.includes('Cannot find module')) {
        // Extract module name from error
        const match = line.match(/Cannot find module ['"]([^'"]+)['"]/);
        if (match && match[1]) {
          errors.push(match[1]);
        }
      }
    }
    
    console.log(`📋 Found ${errors.length} TypeScript import errors`);
    return errors;
  } catch (error: any) {
    // TypeScript found errors (which is what we want)
    const output = error.stdout || error.stderr || '';
    const errors: string[] = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('error TS2307') || line.includes('Cannot find module')) {
        const match = line.match(/Cannot find module ['"]([^'"]+)['"]/);
        if (match && match[1]) {
          errors.push(match[1]);
        }
      }
    }
    
    console.log(`📋 Found ${errors.length} TypeScript import errors`);
    return errors;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const interactive = args.includes('--interactive');
  const minConfidence = args.includes('--high') ? 'high' : 
                       args.includes('--medium') ? 'medium' : 'low';

  console.log('🎯 Import Fixer - Fixing ACTUAL TypeScript Errors\n');
  
  // Run TypeScript to get actual errors
  console.log('🔍 Running TypeScript to find real import errors...');
  const tsErrors = await runTypeScriptCheck();
  
  if (tsErrors.length === 0) {
    console.log('✅ No TypeScript import errors found!');
    return;
  }
  
  console.log(`🚨 Found ${tsErrors.length} ACTUAL TypeScript import errors:`);
  tsErrors.slice(0, 10).forEach((error, index) => {
    console.log(`  ${index + 1}. ${error}`);
  });
  
  if (tsErrors.length > 10) {
    console.log(`  ... and ${tsErrors.length - 10} more`);
  }
  
  // Now run the import fixer with focus on these errors
  const confirmationType = interactive ? 'interactive' : 'console';
  const fixer = new ImportFixerService(confirmationType);

  try {
    // Scan project with confidence analysis
    const { analyses, fixesByConfidence } = await fixer.scanProjectWithConfidence();

    const totalFixes = fixesByConfidence.high.length + 
                      fixesByConfidence.medium.length + 
                      fixesByConfidence.low.length;

    // Display TypeScript errors alongside scanner results
    console.log('\n📊 Import Issues Summary:');
    console.log(`   TypeScript compilation errors: ${tsErrors.length}`);
    console.log(`   High confidence fixes: ${fixesByConfidence.high.length}`);
    console.log(`   Medium confidence fixes: ${fixesByConfidence.medium.length}`);
    console.log(`   Low confidence fixes: ${fixesByConfidence.low.length}`);
    console.log(`   Total files analyzed: ${analyses.length}`);

    // If no fixes found but we have TypeScript errors, warn the user
    if (totalFixes === 0 && tsErrors.length > 0) {
      console.log('\n⚠️  IMPORTANT: TypeScript found import errors but scanner couldn\'t detect them.');
      console.log('   This might be because:');
      console.log('   1. The import paths are too complex for automatic detection');
      console.log('   2. The errors are in node_modules or external packages');
      console.log('   3. The project tree wasn\'t built correctly');
      console.log('\n💡 Try running: pnpm analyze:corrections:all');
      return;
    }

    if (totalFixes === 0 && tsErrors.length === 0) {
      console.log('✅ No import issues found!');
      return;
    }

    // Show sample of issues
    if (fixesByConfidence.high.length > 0) {
      console.log('\n🔧 High Confidence Fixes (sample):');
      fixesByConfidence.high.slice(0, 3).forEach((fix, index) => {
        console.log(`\n${index + 1}. 📁 ${fix.filePath}`);
        console.log(`   💡 ${fix.reason || 'Auto-detected import issue'}`);
        console.log(`   ❌ ${fix.originalLine || 'MISSING IMPORT'}`);
        console.log(`   ✅ ${fix.newLine}`);
      });
    }

    if (dryRun) {
      console.log('\n🔍 DRY RUN: No changes were applied');
      console.log('💡 Remove --dry-run flag to apply fixes');
      return;
    }

    // Apply fixes based on confidence level
    if (fixesByConfidence.high.length > 0) {
      console.log('\n🚀 Applying high confidence fixes...');
      const result = await fixer.applyFixesWithConfidence(fixesByConfidence.high, 'high');
      if (result.success) {
        console.log(`✅ Applied ${result.applied} high confidence fixes`);
      }
    }

    // Handle medium confidence fixes
    if (fixesByConfidence.medium.length > 0) {
      if (interactive) {
        console.log('\n🔍 Medium confidence fixes require review:');
        const result = await fixer.applyFixesWithConfidence(fixesByConfidence.medium, 'medium');
        if (result.success) {
          console.log(`✅ Applied ${result.applied} medium confidence fixes`);
        }
      } else {
        console.log(`\n📋 ${fixesByConfidence.medium.length} medium confidence fixes available`);
        console.log('💡 Run with --interactive to review and apply medium confidence fixes');
      }
    }

    // Inform about low confidence fixes
    if (fixesByConfidence.low.length > 0) {
      console.log(`\n⚠️  ${fixesByConfidence.low.length} low confidence fixes detected`);
      console.log('💡 These may require manual review as they have lower accuracy');
    }

  } catch (error) {
    console.error('❌ Error during import analysis:', error);
    process.exit(1);
  }
}

// Handle command line arguments and run
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🎯 Import Fixer - Usage

Commands:
  pnpm fix-imports                    # Auto-fix high confidence issues
  pnpm fix-imports --dry-run          # Show what would be fixed
  pnpm fix-imports --interactive      # Interactive mode for all fixes
  pnpm fix-imports --high             # Only apply high confidence fixes
  pnpm fix-imports --medium           # Apply high & medium confidence fixes

Options:
  --dry-run, -d    Show what would be fixed without applying
  --interactive, -i Interactive confirmation for each fix
  --high           Only apply high confidence fixes
  --medium         Apply high & medium confidence fixes
  --help, -h       Show this help message

Note: This tool runs TypeScript compilation first to detect actual errors,
      then uses smart analysis to suggest fixes.
  `);
  process.exit(0);
}

main().catch(console.error);