// app/scripts/import-cleanup.ts
import { execSync } from 'child_process';

async function runImportCleanup() {
  console.log('🚀 Starting Comprehensive Import Cleanup\n');
  console.log('='.repeat(60));
  
  // Step 1: Analyze current state
  console.log('📊 Step 1: Analyzing current import status...');
  try {
    execSync('pnpm run imports:stats', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Could not get stats, continuing...');
  }
  
  // Step 2: Fix broken imports
  console.log('\n🔧 Step 2: Fixing broken imports...');
  try {
    execSync('pnpm run fix-imports:safe', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Some imports could not be fixed automatically');
  }
  
  // Step 3: Deduplicate imports
  console.log('\n🧹 Step 3: Removing duplicate imports...');
  try {
    execSync('pnpm run imports:deduplicate', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Deduplication encountered issues');
  }
  
  // Step 4: Final analysis
  console.log('\n📈 Step 4: Final analysis...');
  try {
    execSync('pnpm run imports:stats', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Could not get final stats');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Import cleanup complete!');
  console.log('='.repeat(60));
  
  console.log('\n💡 Next steps:');
  console.log('   • Review the reports in ./reports/');
  console.log('   • Run tests: pnpm test');
  console.log('   • Check TypeScript: pnpm run type-check');
}

if (require.main === module) {
  runImportCleanup().catch(console.error);
}

export { runImportCleanup };