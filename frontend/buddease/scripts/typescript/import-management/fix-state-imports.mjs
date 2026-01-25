import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { resolve, join } from 'path';

console.log('🔍 Searching for @/state imports...\n');

function scanDirectory(dir) {
  let fixedCount = 0;
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      if (item === 'node_modules' || item === 'dist' || item === 'build') continue;
      
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        fixedCount += scanDirectory(fullPath);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
        const content = readFileSync(fullPath, 'utf8');
        
        if (content.includes('@/state/') && !content.includes('@/app/state/')) {
          let newContent = content;
          let fileFixed = false;
          
          // Fix: @/state/ -> @/app/state/
          newContent = newContent.replace(/from\s+['"]@\/state\/([^'"]+)['"]/g, (match, path) => {
            fileFixed = true;
            return `from '@/app/state/${path}'`;
          });
          
          if (fileFixed) {
            writeFileSync(fullPath, newContent);
            console.log(`✅ Fixed: ${fullPath.replace(process.cwd() + '/', '')}`);
            fixedCount++;
          }
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return fixedCount;
}

const fixedCount = scanDirectory(resolve(process.cwd(), 'src'));
console.log(`\n🎉 Fixed ${fixedCount} files with @/state imports`);
console.log('🚀 Now try running: pnpm generate:corrections');
