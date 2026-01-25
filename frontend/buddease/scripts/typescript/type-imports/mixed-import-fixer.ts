#!/usr/bin/env tsx
// scripts/typescript/type-imports/mixed-import-fixer.ts

import fs from 'fs';
import path from 'path';
import ts from 'typescript';

// Import the working logic from your existing file
import { 
    detectMixedImportFromText as originalDetect,
    MixedImport as OriginalMixedImport 
} from '../../../app/scripts/fix-mixed-type-imports';

export interface MixedImport extends OriginalMixedImport {}

/**
 * PROPERLY split a mixed import - removes original and creates two imports
 */
function splitMixedImportProperly(mixedImport: MixedImport, fileContent?: string): string[] {
  const lines: string[] = [];
  const cleanSource = mixedImport.source.replace(/;+$/, '');
  
  // Check if we have file content for better classification
  const typeImports: string[] = [];
  const valueImports: string[] = [];
  
  for (const importName of [...mixedImport.typeImports, ...mixedImport.valueImports]) {
    const cleanName = importName.split(' as ')[0].trim();
    
    // Use enhanced classification if we have file content
    const isType = fileContent ? shouldBeTypeImport(cleanName, [], fileContent) : mixedImport.typeImports.includes(importName);
    
    if (isType) {
      typeImports.push(importName);
    } else {
      valueImports.push(importName);
    }
  }
  
  // Type imports first
  if (typeImports.length > 0) {
    lines.push(`import type { ${typeImports.sort().join(', ')} } from '${cleanSource}';`);
  }
  
  // Value imports second
  if (valueImports.length > 0) {
    lines.push(`import { ${valueImports.sort().join(', ')} } from '${cleanSource}';`);
  }
  
  return lines;
}

/**
 * Detect if an import is truly mixed (has both types and values)
 */
export function isTrulyMixedImport(importText: string): boolean {
    const mixed = originalDetect(importText, 1, '');
    return mixed.needsSplit && mixed.typeImports.length > 0 && mixed.valueImports.length > 0;
}

/**
 * Get the COMPLETE import block including multi-line
 */
export function getCompleteImportBlock(filePath: string, lineNum: number): { text: string; startLine: number; endLine: number } | null {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Find the start of the import
        let startLine = lineNum - 1;
        while (startLine > 0) {
            const line = lines[startLine];
            if (line.includes('import') && line.includes('{')) {
                break;
            }
            startLine--;
        }
        
        // Find the end of the import
        let endLine = startLine;
        let braceCount = 0;
        while (endLine < lines.length) {
            const line = lines[endLine];
            braceCount += (line.match(/{/g) || []).length;
            braceCount -= (line.match(/}/g) || []).length;
            
            if (braceCount === 0 && line.includes('from')) {
                break;
            }
            endLine++;
        }
        
        // Extract the complete block
        const importLines = lines.slice(startLine, endLine + 1);
        return {
            text: importLines.join('\n'),
            startLine: startLine + 1,
            endLine: endLine + 1
        };
    } catch (error) {
        return null;
    }
}

// Re-export the original detection function
export { originalDetect as detectMixedImportFromText };