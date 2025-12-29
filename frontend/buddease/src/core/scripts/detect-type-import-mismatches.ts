// scripts/detect-type-import-mismatches.ts
import { execSync } from 'child_process';

function detectTypeImportMismatches() {
  console.log('🔍 Detecting type import mismatches...\n');
  
  try {
    // Run TypeScript with specific flags to catch import/export mismatches
    const result = execSync(
      'npx tsc --noEmit --isolatedModules --importsNotUsedAsValues error --verbatimModuleSyntax 2>&1',
      { encoding: 'utf8' }
    );
    
    const errors = result.split('\n').filter(line => 
      line.includes('is a type and must be imported using') ||
      line.includes('cannot be used as a value') ||
      line.includes('exported using')
    );
    
    if (errors.length > 0) {
      console.log(`⚠️ Found ${errors.length} type import/export mismatches:\n`);
      errors.slice(0, 20).forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
      
      if (errors.length > 20) {
        console.log(`\n... and ${errors.length - 20} more errors`);
      }
      
      // Create a quick fix script
      const quickFixScript = `
// Quick fix for type imports
const fs = require('fs');
const path = require('path');

${errors.slice(0, 50).map((error, i) => {
  const match = error.match(/(.*\.tsx?):(\d+):/);
  if (match) {
    const file = match[1];
    const line = parseInt(match[2]);
    return `// Fix ${path.basename(file)}:${line}`;
  }
  return '';
}).filter(Boolean).join('\n')}
      `;
      
      console.log('\n💡 Add these compiler options to tsconfig.json:');
      console.log(`
{
  "compilerOptions": {
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "importsNotUsedAsValues": "error"
  }
}
      `);
    } else {
      console.log('✅ No type import mismatches detected!');
    }
    
  } catch (error: any) {
    console.log('TypeScript found errors (this is what we want!):');
    if (error.stdout) {
      const errors = error.stdout.toString().split('\n').filter((line: string) => 
        line.includes('is a type and must be imported using') ||
        line.includes('cannot be used as a value')
      );
      
      if (errors.length > 0) {
        console.log('\nFound type import mismatches:');
        errors.slice(0, 10).forEach((err: string, i: number) => {
          console.log(`${i + 1}. ${err}`);
        });
      }
    }
  }
}

detectTypeImportMismatches();