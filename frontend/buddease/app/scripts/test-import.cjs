#!/usr/bin/env node

// scripts/test-import.js
// Test if specific imports work

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing imports...\n');

// Test paths from your TeamStore.tsx
const testImports = [
  '@/app/api/ApiUser',
  '@/app/api/ApiVideo',
  '@/app/api/TeamManagementApi',
  '@/core/state/stores/AssignBaseStore',
  '@/app/components/teams/Team',
  '@/core/config/BaseConfig',
  '@/app/documents/attachment/Attachment',
  '@/app/features/support/NotificationMessages',
  '@/app/hooks/useSnapshotManager',
  '@/app/models/data/Data',
  '@/utils/fileHeaderManager'
];

console.log('📋 Testing 11 imports from TeamStore.tsx:');
console.log('═'.repeat(50));

let working = 0;
let broken = 0;

testImports.forEach((importPath, index) => {
  try {
    // Remove @/ prefix and check if file exists
    const relativePath = importPath.replace('@/', 'src/');
    const fullPath = path.join(process.cwd(), relativePath);
    
    // Check with different extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
    let found = false;
    
    for (const ext of extensions) {
      const testPath = ext.startsWith('/') 
        ? fullPath + ext 
        : fullPath + ext;
      
      if (fs.existsSync(testPath)) {
        found = true;
        break;
      }
    }
    
    if (found) {
      console.log(`✅ ${index + 1}. ${importPath} - EXISTS`);
      working++;
    } else {
      console.log(`❌ ${index + 1}. ${importPath} - MISSING`);
      broken++;
      
      // Try to find similar files
      const dir = path.dirname(fullPath);
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => 
          f.includes(path.basename(fullPath)) ||
          f.includes(path.basename(fullPath).toLowerCase())
        );
        
        if (files.length > 0) {
          console.log(`   Possible matches: ${files.join(', ')}`);
        }
      }
    }
  } catch (error) {
    console.log(`❌ ${index + 1}. ${importPath} - ERROR: ${error.message}`);
    broken++;
  }
});

console.log('\n📊 SUMMARY:');
console.log('═'.repeat(50));
console.log(`Working imports: ${working}`);
console.log(`Broken imports: ${broken}`);
console.log(`Success rate: ${Math.round((working / testImports.length) * 100)}%`);

if (broken > 0) {
  console.log('\n💡 ACTION NEEDED:');
  console.log('═'.repeat(50));
  console.log('1. Check your tsconfig.json path aliases:');
  console.log('   Ensure "@/app/*" points to "./src/app/*"');
  console.log('   Ensure "@/utils/*" points to "./src/utils/*"');
  console.log('\n2. Check if files actually exist:');
  console.log('   ls -la src/app/api/ # Check ApiUser.ts exists');
  console.log('\n3. Run TypeScript manually:');
  console.log('   npx tsc --noEmit --skipLibCheck false');
}


