// check-imports.mjs
import { readFileSync } from 'fs';

const filePath = './src/app/generators/corrections/CorrectionGenerator.ts';
const content = readFileSync(filePath, 'utf8');

console.log('📄 First 10 lines of CorrectionGenerator.ts:\n');
const lines = content.split('\n').slice(0, 15);
lines.forEach((line, i) => {
  console.log(`${i + 1}: ${line}`);
});

// Extract all imports
const importRegex = /from\s+['"]([^'"]+)['"]/g;
const imports = [];
let match;

while ((match = importRegex.exec(content)) !== null) {
  imports.push(match[1]);
}

console.log('\n📦 All imports found:\n');
imports.forEach(imp => {
  console.log(`   ${imp}`);
  if (imp.startsWith('@/')) {
    console.log(`   ⚠️  This is a path-mapped import`);
  }
});