import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const problematicFile = 'src/app/snapshots/snapshotContainerUtils.ts';
const fullPath = resolve(process.cwd(), problematicFile);

console.log('🔍 Deep search for import issues in:', problematicFile, '\n');

if (!existsSync(fullPath)) {
  console.log('❌ File not found:', fullPath);
  process.exit(1);
}

const content = readFileSync(fullPath, 'utf8');

// Check for dynamic imports
const dynamicImports = content.match(/import\([^)]*\)/g);
if (dynamicImports) {
  console.log('🔄 Dynamic imports found:');
  dynamicImports.forEach(imp => console.log('   ', imp));
}

// Check for export patterns that might cause issues
const exportPatterns = [
  /export\s+\*\s+from\s+['"]([^'"]+)['"]/g,
  /export\s+\{[^}]*\}\s+from\s+['"]([^'"]+)['"]/g
];

exportPatterns.forEach(pattern => {
  let match;
  while ((match = pattern.exec(content)) !== null) {
    console.log(`📤 Re-export found: ${match[0]}`);
    if (match[1] === '@/core') {
      console.log('   ❌ PROBLEMATIC: Re-exporting from @/core directly');
    }
  }
});

// Check for any line that has @/core without a subpath in ANY context
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('@/core') && !line.includes('@/core/')) {
    console.log(`⚠️  SUSPICIOUS at line ${index + 1}: ${line.trim()}`);
  }
});

console.log('\n✅ Deep search complete.');
