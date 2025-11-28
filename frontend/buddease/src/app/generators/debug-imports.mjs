// debug-imports.mjs
import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

console.log('🔍 DEBUG: Starting comprehensive import test...\n');

// Test all the problematic imports from your error
const testImports = [
  // From the error message
  '@/app',
  
  // From your debug file
  '@/app/snapshots/SnapshotStoreConfig',
  '@/app/config/BaseConfig',
  '@/app/documents/attachment/Attachment',
  '@/app/generators/corrections/analyzers/react-native/config/ConfigFileAnalyzer',
  '@/app/generators/corrections/CorrectionGenerator',
  '@/app/typings/correctionTypes',
  '@/utils/BuildErrorHandler',
  
  // Common paths that might be problematic
  '@/app/snapshots/snapshotContainerUtils',
  '@/app/generators/corrections/analyzers/ReactNativeAnalyzer',
  '@/app/generators/corrections/analyzers/ReactWebAnalyzer'
];

console.log('🧪 Testing individual imports:\n');

for (const importPath of testImports) {
  console.log(`Testing: "${importPath}"`);
  
  try {
    // Method 1: Direct require.resolve
    const resolved = require.resolve(importPath, {
      paths: [process.cwd(), resolve(process.cwd(), 'src')]
    });
    console.log(`  ✅ require.resolve: ${resolved}`);
  } catch (error) {
    console.log(`  ❌ require.resolve: ${error.message}`);
  }
  
  try {
    // Method 2: Check if file exists directly
    let expectedPath = '';
    if (importPath.startsWith('@/app/')) {
      expectedPath = resolve(process.cwd(), 'src/app', importPath.slice(6));
    } else if (importPath.startsWith('@/')) {
      expectedPath = resolve(process.cwd(), 'src', importPath.slice(2));
    } else if (importPath.startsWith('@/utils/')) {
      expectedPath = resolve(process.cwd(), 'src/utils', importPath.slice(8));
    }
    
    if (expectedPath) {
      const fs = require('fs');
      const exists = fs.existsSync(expectedPath) || 
                     fs.existsSync(expectedPath + '.ts') || 
                     fs.existsSync(expectedPath + '.tsx');
      
      console.log(`  📍 Expected path: ${expectedPath}`);
      console.log(`  📍 File exists: ${exists}`);
      
      if (!exists) {
        // Check what's actually in the directory
        const dir = dirname(expectedPath);
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir).slice(0, 5);
          console.log(`  📁 Directory contents: ${files.join(', ')}`);
        }
      }
    }
  } catch (error) {
    console.log(`  ⚠️ Path check error: ${error.message}`);
  }
  
  console.log('---');
}

// Test the specific problematic file
console.log('\n🔎 Testing the exact file from error:');
const problematicFile = 'src/app/snapshots/snapshotContainerUtils.ts';
const fullPath = resolve(process.cwd(), problematicFile);
const fs = require('fs');

if (fs.existsSync(fullPath)) {
  console.log(`✅ File exists: ${fullPath}`);
  
  // Read and analyze the file
  const content = fs.readFileSync(fullPath, 'utf8');
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  console.log(`📦 Found ${imports.length} imports in the file:`);
  imports.forEach(imp => console.log(`   - ${imp}`));
  
} else {
  console.log(`❌ File not found: ${fullPath}`);
  
  // Check what's in the snapshots directory
  const snapshotsDir = resolve(process.cwd(), 'src/app/snapshots');
  if (fs.existsSync(snapshotsDir)) {
    const files = fs.readdirSync(snapshotsDir);
    console.log(`📁 Files in snapshots directory: ${files.join(', ')}`);
  }
}