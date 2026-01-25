import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, relative, dirname } from 'path';

const filePath = resolve(process.cwd(), 'src/app/snapshots/snapshotContainerUtils.ts');

if (!existsSync(filePath)) {
  console.log('❌ File not found:', filePath);
  process.exit(1);
}

const content = readFileSync(filePath, 'utf8');
let newContent = content;

// Convert all @/app imports to relative paths
newContent = newContent.replace(/from ['"](@\/app\/[^'"]+)['"]/g, (match, importPath) => {
  const actualPath = importPath.replace('@/app/', 'src/app/');
  const relativePath = relative(dirname(filePath), resolve(process.cwd(), actualPath));
  return `from '${relativePath}'`;
});

console.log('🔧 Converting @/app imports to relative paths...');
writeFileSync(filePath, newContent);
console.log('✅ Updated: src/app/snapshots/snapshotContainerUtils.ts');

// Show a sample of changes
console.log('\n📋 Sample changes:');
const oldLines = content.split('\n');
const newLines = newContent.split('\n');
let changeCount = 0;

for (let i = 0; i < Math.min(oldLines.length, newLines.length) && changeCount < 5; i++) {
  if (oldLines[i] !== newLines[i] && oldLines[i].includes('@/app')) {
    console.log(`Line ${i+1}:`);
    console.log(`  OLD: ${oldLines[i].trim()}`);
    console.log(`  NEW: ${newLines[i].trim()}`);
    console.log('');
    changeCount++;
  }
}

console.log('🚀 Now try running: pnpm run generate:corrections');
