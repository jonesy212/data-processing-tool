import { join, dirname } from 'path';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cwd = process.cwd();

const filesToCheck = [
  'src/app/logging/ChangeLogEntry.ts',
  'src/app/scripts/ApiSynchronizationScript.ts',
  'src/app/hooks/useServerFileSystem.ts',
  'src/app/api/DatabaseClient.ts',
  'app/services/BackgroundService.ts'
];

console.log('Checking if files exist (from:', cwd, '):');
filesToCheck.forEach(file => {
  const fullPath = join(cwd, file);
  const exists = existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${file} - ${exists ? 'Exists' : 'Missing'}`);
  
  if (exists && file === 'app/services/BackgroundService.ts') {
    try {
      const content = readFileSync(fullPath, 'utf8');
      console.log('\n📄 BackgroundService.ts imports:');
      const importLines = content.split('\n').filter(line => line.includes('import'));
      importLines.forEach(line => console.log('  ', line.trim()));
    } catch (e) {
      // ignore read errors
    }
  }
});

console.log('\n📁 Checking directory structure:');
const dirsToCheck = [
  'src/app',
  'app',
  'src',
  '.'
];

dirsToCheck.forEach(dir => {
  const fullPath = join(cwd, dir);
  const exists = existsSync(fullPath);
  console.log(`${exists ? '📁' : '❌'} ${dir}/ - ${exists ? 'Exists' : 'Missing'}`);
  
  if (exists && dir === 'src/app') {
    try {
      const items = readFileSync ? fs.readdirSync(fullPath) : [];
      console.log(`  Contents: ${items.slice(0, 10).join(', ')}${items.length > 10 ? '...' : ''}`);
    } catch (e) {}
  }
});
