// find-css-imports.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');

function findCSSImports(dir, results = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      // Skip node_modules and hidden directories
      if (!item.name.includes('node_modules') && 
          !item.name.startsWith('.') && 
          item.name !== 'dist' && 
          item.name !== 'build') {
        findCSSImports(fullPath, results);
      }
    } else if (item.isFile() && 
              (item.name.endsWith('.ts') || 
               item.name.endsWith('.tsx') || 
               item.name.endsWith('.js') || 
               item.name.endsWith('.jsx'))) {
      
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Find CSS imports
        const cssImportRegex = /import\s+.*['"](\.{0,2}[^'"]*\.css[^'"]*)['"]/g;
        let match;
        
        while ((match = cssImportRegex.exec(content)) !== null) {
          results.push({
            file: fullPath,
            line: content.substring(0, match.index).split('\n').length,
            import: match[1],
            fullMatch: match[0]
          });
        }
        
        // Also find require() CSS imports
        const requireCSSRegex = /require\s*\(\s*['"](\.{0,2}[^'"]*\.css[^'"]*)['"]\s*\)/g;
        while ((match = requireCSSRegex.exec(content)) !== null) {
          results.push({
            file: fullPath,
            line: content.substring(0, match.index).split('\n').length,
            import: match[1],
            fullMatch: match[0],
            type: 'require'
          });
        }
        
      } catch (error) {
        console.warn(`Could not read ${fullPath}:`, error.message);
      }
    }
  }
  
  return results;
}

console.log('🔍 Searching for ALL CSS imports in your codebase...\n');

const cssImports = findCSSImports(projectRoot);

if (cssImports.length === 0) {
  console.log('✅ No CSS imports found!');
} else {
  console.log(`🚨 Found ${cssImports.length} CSS imports:\n`);
  
  // Group by file
  const byFile = {};
  cssImports.forEach(item => {
    const relativePath = path.relative(projectRoot, item.file);
    if (!byFile[relativePath]) byFile[relativePath] = [];
    byFile[relativePath].push(item);
  });
  
  Object.entries(byFile).forEach(([file, imports]) => {
    console.log(`📄 ${file}:`);
    imports.forEach(item => {
      console.log(`   Line ${item.line}: ${item.fullMatch}`);
    });
    console.log('');
  });
  
  console.log('🔧 To fix these issues, wrap each CSS import with:');
  console.log('   if (typeof window !== \'undefined\') {');
  console.log('     import("path/to/styles.css");');
  console.log('   }');
}

// Also check for CSS imports in strings that might be dynamic
console.log('\n🔍 Checking for dynamic CSS imports (in strings)...');
const dynamicCSSImports = [];
cssImports.forEach(item => {
  if (item.import.includes('${') || item.import.includes('+')) {
    dynamicCSSImports.push(item);
  }
});

if (dynamicCSSImports.length > 0) {
  console.log('Found dynamic CSS imports that need special handling:');
  dynamicCSSImports.forEach(item => {
    console.log(`  ${path.relative(projectRoot, item.file)}:${item.line} - ${item.import}`);
  });
}