#!/usr/bin/env tsx
// scripts/verify-namespace-imports.ts

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function verifyNamespaceImports() {
  console.log('🔍 Verifying namespace imports...\n');
  
  try {
    const output = execSync(
      'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
    
    const namespaceErrors = output.split('\n')
      .filter(line => line.includes("'*' is a type and must be imported"));
    
    if (namespaceErrors.length === 0) {
      console.log('✅ All namespace imports are properly typed!');
      return true;
    }
    
    console.log(`❌ Found ${namespaceErrors.length} namespace import errors:\n`);
    
    // Group by file
    const errorsByFile = new Map<string, string[]>();
    
    namespaceErrors.forEach(error => {
      const match = error.match(/(.*\.(?:ts|tsx))/);
      if (match) {
        const file = match[1];
        if (!errorsByFile.has(file)) {
          errorsByFile.set(file, []);
        }
        errorsByFile.get(file)!.push(error);
      }
    });
    
    console.log('📁 Files with namespace import errors:');
    errorsByFile.forEach((errors, file) => {
      console.log(`\n${file}:`);
      errors.slice(0, 3).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.substring(err.indexOf(': ') + 2)}`);
      });
      if (errors.length > 3) {
        console.log(`  ... and ${errors.length - 3} more`);
      }
    });
    
    console.log('\n💡 Quick fix: pnpm fix:types:namespace');
    return false;
    
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

if (require.main === module) {
  const success = verifyNamespaceImports();
  process.exit(success ? 0 : 1);
}

export { verifyNamespaceImports };