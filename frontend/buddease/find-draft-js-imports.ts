import fs from 'fs';
import path from 'path';

console.log('🔍 Searching for files that import draft-js...\n');

// Search in TypeScript/JavaScript files
const searchExtensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

function searchFile(filePath: string): string[] {
  const results: string[] = [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for import/require statements with draft-js
    const patterns = [
      /import\s+.*from\s+['"]draft-js['"]/g,
      /import\s+.*from\s+['"][^'"]*\/draft-js['"]/g,
      /require\s*\(\s*['"]draft-js['"]\s*\)/g,
      /require\s*\(\s*['"][^'"]*\/draft-js['"]\s*\)/g,
      /from\s+['"]draft-js\/dist\/[^'"]*['"]/g,
      /['"]draft-js['"]/g, // Any reference to draft-js as a string
    ];
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          results.push(`Line ${index + 1}: ${line.trim()}`);
          break;
        }
      }
    });
    
    return results;
  } catch (err) {
    return [];
  }
}

function walkDirectory(dir: string): string[] {
  const filesWithDraftJs: string[] = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      
      try {
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and hidden directories
          if (!item.includes('node_modules') && !item.startsWith('.')) {
            filesWithDraftJs.push(...walkDirectory(fullPath));
          }
        } else if (searchExtensions.some(ext => item.endsWith(ext))) {
          const results = searchFile(fullPath);
          if (results.length > 0) {
            const relativePath = path.relative(process.cwd(), fullPath);
            console.log(`📄 ${relativePath}:`);
            results.forEach(result => console.log(`   ${result}`));
            console.log('');
            filesWithDraftJs.push(fullPath);
          }
        }
      } catch (err) {
        // Skip inaccessible files
      }
    }
  } catch (err) {
    // Skip inaccessible directories
  }
  
  return filesWithDraftJs;
}

// Start search from src directory
console.log('📁 Starting search in src/ directory...\n');
const srcDir = path.join(process.cwd(), 'src');
if (fs.existsSync(srcDir)) {
  const foundFiles = walkDirectory(srcDir);
  
  console.log('\n📊 SUMMARY:');
  console.log('════════════════════════════════════');
  if (foundFiles.length === 0) {
    console.log('✅ No files found importing draft-js directly');
  } else {
    console.log(`Found ${foundFiles.length} file(s) referencing draft-js:`);
    foundFiles.forEach(file => {
      console.log(`  • ${path.relative(process.cwd(), file)}`);
    });
  }
} else {
  console.log('❌ src/ directory not found');
}

// Also check the root directory for config files
console.log('\n🔍 Checking root directory for package.json, tsconfig, etc...\n');
const rootFiles = ['package.json', 'tsconfig.json', 'next.config.js', 'metro.config.js'];
rootFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const results = searchFile(file);
    if (results.length > 0) {
      console.log(`📄 ${file}:`);
      results.forEach(result => console.log(`   ${result}`));
    }
  }
});
