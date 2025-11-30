// run-report-tests.ts (place in project root - run with: npx tsx run-report-tests.ts)
import { ReportTester } from '@/app/generators/corrections/ReportTester';

async function main() {
  console.log('🧪 Starting Comprehensive Report Tests\n');
  
  // Test with various component types
  const testComponents = [
    'src/app/components/UserProfile.tsx',
    'src/app/utils/security.ts',
    'src/app/api/auth.ts'
  ];
  
  for (const component of testComponents) {
    try {
      await ReportTester.testWithRealComponent(component);
    } catch (error) {
      // FIX: Handle unknown type properly
      if (error instanceof Error) {
        console.log(`⚠️  Could not test ${component}:`, error.message);
      } else {
        console.log(`⚠️  Could not test ${component}:`, String(error));
      }
    }
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('📁 Check frontend/buddease/corrections/ for generated reports');
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error('❌ Unhandled error:', error.message);
  } else {
    console.error('❌ Unhandled error:', String(error));
  }
  process.exit(1);
});