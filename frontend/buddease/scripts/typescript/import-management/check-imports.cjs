const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const filePath = path.join(PROJECT_ROOT, 'src/app/api/ApiHighlightEvent.tsx');

console.log('Checking:', filePath);
console.log('='.repeat(60));

if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log('\n📄 File content (lines 1-30):');
  lines.slice(0, 30).forEach((line, i) => {
    console.log(`${String(i + 1).padStart(3)}: ${line}`);
  });
  
  console.log('\n🔍 Looking for import of handleApiErrorAndNotify:');
  let foundImport = false;
  
  lines.forEach((line, i) => {
    if (line.includes('handleApiErrorAndNotify')) {
      console.log(`Line ${i + 1}: ${line.trim()}`);
      foundImport = true;
      
      // Check what module it's importing from
      if (line.includes('from')) {
        const match = line.match(/from\s+['"]([^'"]+)['"]/);
        if (match) {
          console.log(`   Importing from: ${match[1]}`);
          
          // Check if this file exists and exports handleApiErrorAndNotify
          const importPath = match[1];
          if (importPath.startsWith('@/')) {
            const relativePath = importPath.replace(/^@\//, '');
            const possiblePaths = [
              path.join(PROJECT_ROOT, 'src/app', relativePath),
              path.join(PROJECT_ROOT, 'src', relativePath),
            ];
            
            let foundFile = false;
            possiblePaths.forEach(base => {
              const extensions = ['.ts', '.tsx', '.js', '.jsx'];
              extensions.forEach(ext => {
                const testPath = base + ext;
                if (fs.existsSync(testPath)) {
                  console.log(`   ✅ File exists: ${path.relative(PROJECT_ROOT, testPath)}`);
                  foundFile = true;
                  
                  // Check if it exports handleApiErrorAndNotify
                  const fileContent = fs.readFileSync(testPath, 'utf8');
                  const exportsMatch = fileContent.match(/export\s*{[^}]*handleApiErrorAndNotify[^}]*}/);
                  if (exportsMatch) {
                    console.log(`   ✅ Exports handleApiErrorAndNotify`);
                  } else {
                    console.log(`   ❌ Does NOT export handleApiErrorAndNotify`);
                  }
                }
              });
            });
            
            if (!foundFile) {
              console.log(`   ❌ File not found`);
            }
          }
        }
      }
    }
  });
  
  if (!foundImport) {
    console.log('❌ handleApiErrorAndNotify not imported in this file');
  }
} else {
  console.log('❌ File not found');
}
