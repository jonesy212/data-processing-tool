#!/usr/bin/env tsx
// update-type-imports.ts
// Script to update all files to use shared types

import fs from 'fs';
import path from 'path';

const filesToUpdate = [
    'fix-all-type-imports-comprehensive.ts',
    'fix-all-type-imports.ts',
    'fix-type-imports-with-backup.ts',
    'import-utils.ts',
    'BaseImportFix.ts'
];

function updateFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Remove local FixResult interface
    const lines = content.split('\n');
    const newLines = [];
    let inFixResultInterface = false;
    
    for (const line of lines) {
        if (line.includes('interface FixResult') || line.includes('type FixResult =')) {
            inFixResultInterface = true;
            continue;
        }
        
        if (inFixResultInterface && (line.trim() === '}' || line.trim() === '};')) {
            inFixResultInterface = false;
            continue;
        }
        
        if (!inFixResultInterface) {
            newLines.push(line);
        }
    }
    
    // Add import if not present
    const updatedContent = newLines.join('\n');
    if (!updatedContent.includes('from \'@/app/scripts/types/import-fixes\'')) {
        const importLine = "import type { FixResult, TypeImportError } from '@/app/scripts/types/import-fixes';";
        const linesWithImport = updatedContent.split('\n');
        
        // Find the first import line and insert after it
        const firstImportIndex = linesWithImport.findIndex(line => line.startsWith('import'));
        if (firstImportIndex !== -1) {
            linesWithImport.splice(firstImportIndex + 1, 0, importLine);
        } else {
            linesWithImport.unshift(importLine);
        }
        
        fs.writeFileSync(filePath, linesWithImport.join('\n'), 'utf8');
        console.log(`✅ Updated: ${filePath}`);
    }
}

async function main() {
    console.log('🔄 Updating files to use shared types...');
    
    for (const file of filesToUpdate) {
        const filePath = path.join(process.cwd(), 'src/app/scripts', file);
        if (fs.existsSync(filePath)) {
            updateFile(filePath);
        }
    }
    
    console.log('🎉 All files updated!');
}


if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', getErrorMessage(error));
    process.exit(1);
  });
}