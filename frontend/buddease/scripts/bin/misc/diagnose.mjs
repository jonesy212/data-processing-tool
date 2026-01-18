import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

const cwd = process.cwd();

console.log('=== IMPORT DIAGNOSIS ===\n');

// 1. Check tsconfig.json
console.log('1. Checking tsconfig.json...');
try {
  const tsconfigPath = join(cwd, 'tsconfig.json');
  if (existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
    console.log('   Found tsconfig.json');
    
    if (tsconfig.compilerOptions?.paths) {
      console.log('   Path aliases:');
      Object.entries(tsconfig.compilerOptions.paths).forEach(([key, value]) => {
        console.log(`     ${key} → ${JSON.stringify(value)}`);
      });
    } else {
      console.log('   No path aliases found in compilerOptions.paths');
    }
  } else {
    console.log('   ❌ No tsconfig.json found');
  }
} catch (error) {
  console.log('   ❌ Error reading tsconfig:', error.message);
}

// 2. Check the actual file locations
console.log('\n2. File locations:');
const bgService = 'src/app/services/BackgroundService.ts';
const apiScript = 'app/scripts/ApiSynchronizationScript.ts';
const changeLog = 'src/app/logging/ChangeLogEntry.ts';
const useServerFs = 'src/app/hooks/useServerFileSystem.ts';
const dbClient = 'src/app/api/DatabaseClient.ts';

const files = [
  { name: 'BackgroundService.ts', path: bgService },
  { name: 'ApiSynchronizationScript.ts', path: apiScript },
  { name: 'ChangeLogEntry.ts', path: changeLog },
  { name: 'useServerFileSystem.ts', path: useServerFs },
  { name: 'DatabaseClient.ts', path: dbClient }
];

files.forEach(file => {
  const fullPath = join(cwd, file.path);
  const exists = existsSync(fullPath);
  console.log(`   ${exists ? '✅' : '❌'} ${file.name}: ${file.path}`);
  
  if (exists && file.name === 'BackgroundService.ts') {
    try {
      const content = readFileSync(fullPath, 'utf8');
      const importLines = content.split('\n')
        .filter(l => l.includes('import'))
        .map(l => l.trim());
      console.log('     Imports in this file:');
      importLines.forEach(line => console.log(`       ${line}`));
    } catch (e) {}
  }
});

// 3. Calculate relative paths
console.log('\n3. Relative paths from BackgroundService.ts:');
console.log('   BackgroundService.ts location: src/app/services/');
console.log('   To ApiSynchronizationScript.ts (app/scripts/):');
console.log('     Go up 3 levels: ../../..');
console.log('     Then into app/scripts/: ../../../app/scripts/ApiSynchronizationScript');

// 4. Check for jsconfig.json too
console.log('\n4. Checking for jsconfig.json...');
const jsconfigPath = join(cwd, 'jsconfig.json');
if (existsSync(jsconfigPath)) {
  try {
    const jsconfig = JSON.parse(readFileSync(jsconfigPath, 'utf8'));
    console.log('   Found jsconfig.json');
    if (jsconfig.compilerOptions?.paths) {
      console.log('   Path aliases:');
      Object.entries(jsconfig.compilerOptions.paths).forEach(([key, value]) => {
        console.log(`     ${key} → ${JSON.stringify(value)}`);
      });
    }
  } catch (error) {
    console.log('   Error reading jsconfig:', error.message);
  }
} else {
  console.log('   No jsconfig.json');
}

console.log('\n=== RECOMMENDATION ===');
console.log('Since your files are in mixed locations (some in src/app/, some in app/):');
console.log('1. Use relative imports in BackgroundService.ts:');
console.log('   import { ApiSynchronizationScript } from \'../../../app/scripts/ApiSynchronizationScript\';');
console.log('\n2. OR move all files to consistent location (recommended):');
console.log('   Either all in src/app/ or all in app/');
