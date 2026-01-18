// check-type-consistency.ts
import fs from 'fs';
import path from 'path';

function checkTypeConsistency() {
  const typeFiles = [
    'fix-all-type-imports-comprehensive.ts',
    'fix-all-type-imports.ts',
    'fix-type-imports-with-backup.ts'
  ];
  
  console.log('🔍 Checking type consistency...');
  
  typeFiles.forEach(file => {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    if (content.includes('interface FixResult') || content.includes('type FixResult =')) {
      console.log(`⚠️ Local FixResult found in: ${file}`);
    } else {
      console.log(`✅ ${file} uses shared types`);
    }
  });
}

checkTypeConsistency();