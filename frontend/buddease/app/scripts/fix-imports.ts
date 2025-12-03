// scripts/fix-imports.ts
import { ImportFixerService } from '@/app/generators/corrections/ImportFixServicies';

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const interactive = args.includes('--interactive');
  const minConfidence = args.includes('--high') ? 'high' : 
                       args.includes('--medium') ? 'medium' : 'low';

  console.log('🎯 Import Fixer - Smart Import Analysis\n');
  
  const confirmationType = interactive ? 'interactive' : 'console';
  const fixer = new ImportFixerService(confirmationType);

  try {
    // Scan project with confidence analysis
    const { analyses, fixesByConfidence } = await fixer.scanProjectWithConfidence();

    const totalFixes = fixesByConfidence.high.length + 
                      fixesByConfidence.medium.length + 
                      fixesByConfidence.low.length;

    if (totalFixes === 0) {
      console.log('✅ No import issues found!');
      return;
    }

    // Display summary
    console.log('📊 Import Issues Summary:');
    console.log(`   High confidence: ${fixesByConfidence.high.length} fixes`);
    console.log(`   Medium confidence: ${fixesByConfidence.medium.length} fixes`);
    console.log(`   Low confidence: ${fixesByConfidence.low.length} fixes`);
    console.log(`   Total files analyzed: ${analyses.length}`);

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
  `);
  process.exit(0);
}

main().catch(console.error);