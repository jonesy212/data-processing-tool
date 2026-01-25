const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();

// Check specific file
const filePath = path.join(PROJECT_ROOT, 'src/app/api/ApiHighlightEvent.tsx');
console.log(`Checking: ${filePath}`);

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log('\nLines 1-20:');
  lines.slice(0, 20).forEach((line, i) => {
    console.log(`${i + 1}: ${line}`);
  });
  
  console.log('\nAll imports:');
  lines.forEach((line, i) => {
    if (line.includes('import')) {
      console.log(`${i + 1}: ${line.trim()}`);
    }
  });
  
  // Check what exists
  const importPaths = [
    '@/core/snapshots/methods/dataMethods',
    '@/core/api/ApiData'
  ];
  
  console.log('\nChecking if imports exist:');
  importPaths.forEach(imp => {
    const relativePath = imp.replace(/^@\//, '');
    const possiblePaths = [
      path.join(PROJECT_ROOT, 'src/app', relativePath),
      path.join(PROJECT_ROOT, 'src', relativePath),
      path.join(PROJECT_ROOT, 'app', relativePath)
    ];
    
    let found = false;
    possiblePaths.forEach(base => {
      const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
      extensions.forEach(ext => {
        const testPath = base + ext;
        if (fs.existsSync(testPath)) {
          console.log(`✅ ${imp} → ${path.relative(PROJECT_ROOT, testPath)}`);
          found = true;
        }
      });
    });
    
    if (!found) {
      console.log(`❌ ${imp} not found`);
    }
  });
} else {
  console.log('File not found');
}
