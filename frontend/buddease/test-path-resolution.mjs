// test-path-resolution.mjs
// test-path-resolution.mjs
import { existsSync } from 'fs';
import { resolve } from 'path';

const testPaths = [
  '@/app/generators/corrections/analyzers/react-native/config/DebugBabelAnalyzer',
  '@/utils/fileHeaderManager'
];

console.log('🔍 Testing if files exist:\n');

testPaths.forEach(importPath => {
  const relativePath = importPath.replace('@/', 'src/');
  const fullPath = resolve(process.cwd(), relativePath + '.ts');
  
  console.log(`📁 ${importPath}`);
  console.log(`   📍 ${fullPath}`);
  console.log(`   ✅ ${existsSync(fullPath) ? 'EXISTS' : 'MISSING'}`);
  
  if (!existsSync(fullPath)) {
    // Check directory
    const dirPath = resolve(process.cwd(), relativePath.split('/').slice(0, -1).join('/'));
    console.log(`   📂 Directory exists: ${existsSync(dirPath)}`);
  }
  console.log('---');
});