// debug-esm-imports.mjs
import { readFileSync, existsSync, readdirSync } from 'fs';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 DEBUG: Testing ES Module Resolution\n');

// Test the exact error case
const testCases = [
  {
    name: 'EXACT ERROR CASE',
    import: '@/app',
    expected: 'This should NOT resolve as a package'
  },
  {
    name: 'File imports',
    import: '@/app/snapshots/snapshotContainerUtils',
    expected: 'src/app/snapshots/snapshotContainerUtils.ts'
  },
  {
    name: 'Config imports', 
    import: '@/app/config/BaseConfig',
    expected: 'src/app/config/BaseConfig.ts'
  }
];

for (const test of testCases) {
  console.log(`\n🧪 ${test.name}: "${test.import}"`);
  
  // Method 1: Check if it exists as a file
  const possiblePaths = [
    test.import.replace('@/app/', 'src/app/'),
    test.import.replace('@/', 'src/'),
    test.import
  ];
  
  let found = false;
  for (const possiblePath of possiblePaths) {
    const fullPath = resolve(process.cwd(), possiblePath);
    const extensions = ['', '.ts', '.tsx', '.js', '.mjs', '/index.ts', '/index.tsx'];
    
    for (const ext of extensions) {
      const testPath = fullPath + ext;
      if (existsSync(testPath)) {
        console.log(`  ✅ Found: ${testPath}`);
        found = true;
        break;
      }
    }
    if (found) break;
  }
  
  if (!found) {
    console.log(`  ❌ No file found for: ${test.import}`);
    
    // Show what's in the directory structure
    if (test.import.startsWith('@/app/')) {
      const dirPath = test.import.replace('@/app/', 'src/app/').split('/').slice(0, -1).join('/');
      const fullDirPath = resolve(process.cwd(), dirPath);
      
      if (existsSync(fullDirPath)) {
        const files = readdirSync(fullDirPath).slice(0, 8);
        console.log(`  📁 Directory ${dirPath}: ${files.join(', ')}`);
      } else {
        console.log(`  📁 Directory doesn't exist: ${fullDirPath}`);
      }
    }
  }
}

// Test the problematic file specifically
console.log('\n🔎 ANALYZING PROBLEMATIC FILE:');
const problematicFile = 'src/app/snapshots/snapshotContainerUtils.ts';
const fullPath = resolve(process.cwd(), problematicFile);

if (existsSync(fullPath)) {
  console.log(`✅ File exists: ${problematicFile}`);
  
  const content = readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  
  // Find all import statements
  const importLines = lines
    .map((line, index) => ({ line: line.trim(), index: index + 1 }))
    .filter(({ line }) => line.startsWith('import'));
  
  console.log(`📦 Found ${importLines.length} import statements:`);
  
  importLines.forEach(({ line, index }) => {
    console.log(`   ${index}: ${line}`);
    
    // Extract the import path
    const importMatch = line.match(/from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      const importPath = importMatch[1];
      console.log(`      📍 Import path: "${importPath}"`);
      
      if (importPath.startsWith('@/app')) {
        console.log(`      ⚠️  THIS IS THE PROBLEM - ES modules treat this as a package`);
      }
    }
  });
} else {
  console.log(`❌ File not found: ${problematicFile}`);
}