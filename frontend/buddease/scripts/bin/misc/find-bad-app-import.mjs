import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const problematicFile = 'src/app/snapshots/snapshotContainerUtils.ts';
const fullPath = resolve(process.cwd(), problematicFile);

console.log('🔍 Searching for problematic imports in:', problematicFile, '\n');

if (!existsSync(fullPath)) {
  console.log('❌ File not found:', fullPath);
  process.exit(1);
}

const content = readFileSync(fullPath, 'utf8');
const lines = content.split('\n');

let foundProblem = false;

lines.forEach((line, index) => {
  const lineNumber = index + 1;
  const trimmed = line.trim();
  
  // Look for imports from '@/app' (without subpath)
  if (trimmed.includes("from '@/app'") || trimmed.includes('from "@/app"')) {
    console.log(`❌ FOUND BAD IMPORT at line ${lineNumber}:`);
    console.log(`   ${trimmed}`);
    console.log('   ⚠️  This imports from just @/app (should be @/app/something)\n');
    foundProblem = true;
  }
  
  // Also check for any @/app imports
  if (trimmed.includes('@/app') && trimmed.includes('import')) {
    console.log(`📦 Import at line ${lineNumber}: ${trimmed}`);
  }
});

if (!foundProblem) {
  console.log('✅ No obvious bad imports found.');
  console.log('🔍 The issue might be more complex - checking file structure...');
  
  // Check if the file has any exports that might be problematic
  const hasExports = lines.some(line => line.includes('export'));
  console.log(`📤 File has exports: ${hasExports}`);
}
