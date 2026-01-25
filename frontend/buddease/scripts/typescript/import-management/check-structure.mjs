import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const cwd = process.cwd();

console.log('=== PROJECT STRUCTURE ANALYSIS ===\n');

// Check ApiSynchronizationScript.ts
console.log('1. Looking for ApiSynchronizationScript.ts:');
const possibleApiPaths = [
  'app/scripts/ApiSynchronizationScript.ts',
  'src/app/scripts/ApiSynchronizationScript.ts',
  'scripts/ApiSynchronizationScript.ts'
];

possibleApiPaths.forEach(path => {
  const fullPath = join(cwd, path);
  console.log(`   ${existsSync(fullPath) ? '✅' : '❌'} ${path}`);
  if (existsSync(fullPath)) {
    console.log(`       Found at: ${fullPath}`);
  }
});

// Check BackgroundService.ts
console.log('\n2. Looking for BackgroundService.ts:');
const possibleBgPaths = [
  'src/app/services/BackgroundService.ts',
  'app/services/BackgroundService.ts',
  'services/BackgroundService.ts'
];

possibleBgPaths.forEach(path => {
  const fullPath = join(cwd, path);
  console.log(`   ${existsSync(fullPath) ? '✅' : '❌'} ${path}`);
  if (existsSync(fullPath)) {
    console.log(`       Found at: ${fullPath}`);
    // Show first few imports
    try {
      const fs = await import('fs');
      const content = fs.readFileSync(fullPath, 'utf8');
      const imports = content.split('\n').filter(l => l.includes('import')).slice(0, 5);
      console.log('       First imports:');
      imports.forEach(imp => console.log(`         ${imp.trim()}`));
    } catch (e) {}
  }
});

// Check what @/ might resolve to
console.log('\n3. Testing path resolution:');
const testImports = [
  '@/app/scripts/ApiSynchronizationScript',
  '@/src/app/scripts/ApiSynchronizationScript',
  '../../app/scripts/ApiSynchronizationScript',  // relative from src/app/services/
  '../../../app/scripts/ApiSynchronizationScript' // relative from src/app/services/
];

console.log('   From src/app/services/BackgroundService.ts:');
testImports.forEach(imp => {
  console.log(`   • ${imp}`);
});
