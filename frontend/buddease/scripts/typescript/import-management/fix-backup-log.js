// fix-backup-log.js
const fs = require('fs');
const content = fs.readFileSync('fix-all-type-imports.ts', 'utf8');

// Replace the backup log line
const fixed = content.replace(
  'console.log(`   💾 Backup: ${backupPath}`);',
  `const relativeBackupPath = path.relative(process.cwd(), backupPath);
        console.log(\`   💾 Backup: \${relativeBackupPath}\`);`
);

fs.writeFileSync('fix-all-type-imports.ts', fixed, 'utf8');
console.log('✅ Fixed backup log line');
