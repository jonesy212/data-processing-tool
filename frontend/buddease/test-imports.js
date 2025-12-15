const path = require('path');
const fs = require('fs');

const filesToCheck = [
  'src/app/logging/ChangeLogEntry.ts',
  'src/app/scripts/ApiSynchronizationScript.ts', 
  'src/app/hooks/useServerFileSystem.ts',
  'src/app/api/DatabaseClient.ts'
];

console.log('Checking if files exist:');
filesToCheck.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${file} - ${exists ? 'Exists' : 'Missing'}`);
});

console.log('\nCurrent directory structure:');
console.log(process.cwd());
