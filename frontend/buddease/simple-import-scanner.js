#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Simple Import Error Scanner (JavaScript)');
console.log('═══════════════════════════════════════════\n');

// Just run TypeScript compiler
console.log('🔍 Running TypeScript compiler...');
try {
  const tsOutput = execSync('npx tsc --noEmit --listFiles 2>&1', { encoding: 'utf8' });
  parseTypeScriptErrors(tsOutput);
} catch (error) {
  if (error.stdout) {
    parseTypeScriptErrors(error.stdout);
  } else {
    console.log('Error running tsc:', error.message);
  }
}

function parseTypeScriptErrors(output) {
  const lines = output.split('\n');
  const errorRegex = /^(.+?)\((\d+),(\d+)\): error TS\d+: (.+)$/;
  const importRegex = /Cannot find module ['"](.+?)['"]/;
  
  const importErrors = [];
  
  lines.forEach(line => {
    const match = line.match(errorRegex);
    if (match) {
      const [, filePath, lineNum, , message] = match;
      const importMatch = message.match(importRegex);

      if (importMatch) {
        const importPath = importMatch[1];
        
        // Skip CSS files
        if (importPath.includes('.css') || importPath.includes('.scss') || importPath.includes('.sass')) {
          return;
        }
        
        importErrors.push({
          file: path.resolve(filePath),
          line: parseInt(lineNum),
          import: importPath
        });
      }
    }
  });
  
  console.log(`📊 Found ${importErrors.length} import errors\n`);
  
  if (importErrors.length > 0) {
    console.log('📋 Top import errors:');
    importErrors.slice(0, 20).forEach((error, index) => {
      const relativePath = path.relative(process.cwd(), error.file);
      console.log(`${index + 1}. ${relativePath}:${error.line}`);
      console.log(`   Cannot find: "${error.import}"`);
      console.log('');
    });
    
    // Save results
    const outputDir = path.join(process.cwd(), 'import-analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'simple-import-errors.json'),
      JSON.stringify({
        timestamp: new Date().toISOString(),
        totalErrors: importErrors.length,
        errors: importErrors.map(e => ({
          ...e,
          file: path.relative(process.cwd(), e.file)
        }))
      }, null, 2)
    );
    
    console.log(`💾 Results saved to: ${path.join(outputDir, 'simple-import-errors.json')}`);
  }
}
