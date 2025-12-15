import { spawnSync } from 'child_process';

// Test loading ImportErrorSummary step by step
console.log('🔍 Tracing import chain...\n');

const tests = [
  { name: '1. Test fs/path imports', code: "import fs from 'fs'; import path from 'path'; console.log('✓ Basic imports OK')" },
  { name: '2. Test CircularDependencyDetector', code: "import { CircularDependencyDetector } from '@/app/generators/corrections/CircularDependencyDetector'; console.log('✓ CircularDependencyDetector OK')" },
  { name: '3. Test ImportFixServicies', code: "import { ImportFix } from '@/app/generators/corrections/ImportFixServicies'; console.log('✓ ImportFixServicies OK')" },
  { name: '4. Test PatternAnalyzer', code: "import { PatternAnalyzer } from '@/app/generators/corrections/analyzers/PatternAnalyzer'; console.log('✓ PatternAnalyzer OK')" },
  { name: '5. Test ReactWebAnalyzer', code: "import { ReactWebAnalyzer } from '@/app/generators/corrections/analyzers/ReactWebAnalyzer'; console.log('✓ ReactWebAnalyzer OK')" },
  { name: '6. Test ErrorAnalyzer', code: "import { ErrorAnalyzer } from '@/app/generators/corrections/ErrorAnalyzer'; console.log('✓ ErrorAnalyzer OK')" },
  { name: '7. Test full ImportErrorSummary', code: "import './src/app/generators/corrections/ImportErrorSummary.ts'; console.log('✓ Full ImportErrorSummary OK')" },
];

for (const test of tests) {
  console.log(`\n${test.name}`);
  console.log('─'.repeat(40));
  
  const result = spawnSync('node', [
    '--import=./css-loader.mjs',
    '--import=tsx',
    '-e',
    test.code
  ], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  if (result.status === 0) {
    console.log('✅ PASS');
  } else {
    console.log('❌ FAIL');
    console.log('Error:', result.stderr.substring(0, 200));
  }
}
