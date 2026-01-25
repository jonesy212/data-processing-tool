import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { glob } from 'glob';

console.log('🔍 Searching for all @/state imports...\n');

// Find all TypeScript/JS files
const files = await glob('src/**/*.{ts,tsx,js,jsx}', { 
  ignore: ['node_modules/**', 'dist/**', 'build/**'] 
});

let fixedCount = 0;

for (const file of files) {
  const filePath = resolve(process.cwd(), file);
  const content = readFileSync(filePath, 'utf8');
  
  // Check for @/state imports (without /app)
  if (content.includes('@/state/') && !content.includes('@/app/state/')) {
    let newContent = content;
    let fileFixed = false;
    
    // Fix: @/state/ -> @/app/state/
    newContent = newContent.replace(/from\s+['"]@\/state\/([^'"]+)['"]/g, (match, path) => {
      fileFixed = true;
      return `from '@/app/state/${path}'`;
    });
    
    if (fileFixed) {
      writeFileSync(filePath, newContent);
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    }
  }
}

console.log(`\n🎉 Fixed ${fixedCount} files with @/state imports`);
console.log('🚀 Now try running: pnpm generate:corrections');
