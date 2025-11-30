// debug-tsx.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load tsx internals to see what's happening
try {
  const tsxPath = require.resolve('tsx');
  console.log('📦 tsx resolved to:', tsxPath);
  
  const tsxPkg = require('tsx/package.json');
  console.log('🔧 tsx version:', tsxPkg.version);
  console.log('📁 tsx exports:', JSON.stringify(tssxPkg.exports, null, 2));
} catch (error) {
  console.log('❌ Cannot load tsx:', error.message);
}

// Test path resolution
console.log('\n🧪 Testing path resolution:');
const testPaths = [
  '@/app/generators/corrections/CorrectionGenerator',
  '@/app/typings/correctionTypes', 
  '@/utils/BuildErrorHandler'
];

for (const path of testPaths) {
  try {
    const resolved = require.resolve(path);
    console.log(`✅ ${path} -> ${resolved}`);
  } catch (error) {
    console.log(`❌ ${path} -> ${error.message}`);
  }
}