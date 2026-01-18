#!/usr/bin/env tsx
// debug-ts-error.ts
// Debug specific TypeScript file errors

import fs from 'fs';
import path from 'path';
import ts from 'typescript';
import { execSync } from 'child_process';

async function debugTypeScript() {
  console.log('🔧 TypeScript Error Debugger');
  console.log('='.repeat(60));
  
  // Get the file path from arguments, or auto-detect
  const args = process.argv.slice(2);
  let targetFile = args[0];
  
  if (!targetFile) {
    console.log('📋 No file specified. Analyzing current TypeScript errors...\n');
    
    try {
      // Run TypeScript compiler to get current errors
      const tsOutput = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf-8' });
      const errorLines = tsOutput.split('\n').filter(line => line.includes('error TS'));
      
      if (errorLines.length === 0) {
        console.log('✅ No TypeScript errors found!');
        return;
      }
      
      console.log(`📊 Found ${errorLines.length} TypeScript errors:\n`);
      
      // Display first 5 errors
      errorLines.slice(0, 5).forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      
      if (errorLines.length > 5) {
        console.log(`... and ${errorLines.length - 5} more errors`);
      }
      
      // Try to extract file from first error
      const firstError = errorLines[0];
      const fileMatch = firstError.match(/(app\/[^:]+):\d+:\d+/);
      
      if (fileMatch) {
        targetFile = fileMatch[1];
        console.log(`\n🎯 Focusing on first error in: ${targetFile}`);
        console.log('='.repeat(60));
        await analyzeFile(targetFile);
      } else {
        console.log('\n🔍 Could not extract file from error. Try:');
        console.log('   pnpm debug:ts-error path/to/file.ts');
      }
      
    } catch (error) {
      console.error('❌ Error analyzing TypeScript output:', error.message);
    }
    
  } else {
    // Analyze specific file
    await analyzeFile(targetFile);
  }
}

async function analyzeFile(filePath: string) {
  const fullPath = path.resolve(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${filePath}`);
    console.log(`Looking for: ${fullPath}`);
    
    // Try to find similar files
    console.log('\n🔍 Searching for similar files...');
    const searchPattern = path.basename(filePath);
    
    try {
      const findCmd = `find app -name "*${searchPattern}*" -type f 2>/dev/null | head -5`;
      const foundFiles = execSync(findCmd, { encoding: 'utf-8' }).trim();
      
      if (foundFiles) {
        console.log('Similar files found:');
        console.log(foundFiles.split('\n').map(f => `  - ${f}`).join('\n'));
      } else {
        console.log('No similar files found');
      }
    } catch (e) {
      // Ignore find errors
    }
    
    return;
  }

  console.log(`🔍 Analyzing: ${filePath}`);
  
  try {
    // First, check if this file has TypeScript errors
    const tsCheckCmd = `npx tsc --noEmit ${fullPath} 2>&1 | grep "${filePath}" || true`;
    const fileErrors = execSync(tsCheckCmd, { encoding: 'utf-8' }).trim();
    
    if (fileErrors) {
      console.log('\n📄 TypeScript Errors in this file:');
      console.log(fileErrors.split('\n').map(line => `  ${line}`).join('\n'));
    } else {
      console.log('\n✅ No TypeScript errors found in this file');
    }
    
    // Show file structure
    console.log('\n📁 File Analysis:');
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    
    console.log(`  • Lines: ${lines.length}`);
    console.log(`  • Size: ${(content.length / 1024).toFixed(1)} KB`);
    
    // Check for common issues
    console.log('\n🔍 Checking for common patterns:');
    
    // Check imports
    const importLines = lines.filter(line => line.includes('import ') || line.includes('from '));
    if (importLines.length > 0) {
      console.log(`  • Imports: ${importLines.length} import statements`);
      
      // Check for type-only imports
      const typeImports = lines.filter(line => 
        line.includes('import type') || 
        line.includes('import * as') ||
        (line.includes('import {') && line.includes('} from'))
      );
      
      if (typeImports.length > 0) {
        console.log(`  • Type imports: ${typeImports.length} found`);
      }
    }
    
    // Check exports
    const exportLines = lines.filter(line => line.includes('export '));
    if (exportLines.length > 0) {
      console.log(`  • Exports: ${exportLines.length} export statements`);
    }
    
    // Show a preview of the file
    console.log('\n👀 File Preview (first 10 lines):');
    console.log('='.repeat(60));
    lines.slice(0, 10).forEach((line, index) => {
      console.log(`${(index + 1).toString().padStart(3)}: ${line}`);
    });
    
    if (lines.length > 10) {
      console.log(`... and ${lines.length - 10} more lines`);
    }
    
    console.log('='.repeat(60));
    
    // Check for syntax issues
    const jsxLines = lines.filter(line => line.includes('<') && line.includes('>'));
    if (jsxLines.length > 0) {
      console.log(`\n⚛️  JSX detected: ${jsxLines.length} lines contain JSX`);
    }
    
    // Count errors by type
    if (fileErrors) {
      const errorTypes: Record<string, number> = {};
      fileErrors.split('\n').forEach(error => {
        const match = error.match(/error TS(\d+)/);
        if (match) {
          const code = `TS${match[1]}`;
          errorTypes[code] = (errorTypes[code] || 0) + 1;
        }
      });
      
      if (Object.keys(errorTypes).length > 0) {
        console.log('\n📊 Error Breakdown:');
        Object.entries(errorTypes).forEach(([code, count]) => {
          console.log(`  • ${code}: ${count} error${count > 1 ? 's' : ''}`);
        });
        
        // Provide fix suggestions
        console.log('\n🔧 Suggested fixes:');
        if (errorTypes['TS2307']) {
          console.log('  • TS2307: Module not found - check import paths');
          console.log('    Try: pnpm fix:types --dry-run');
        }
        if (errorTypes['TS2322']) {
          console.log('  • TS2322: Type mismatch - check prop types');
        }
        if (errorTypes['TS2345']) {
          console.log('  • TS2345: Argument type mismatch');
        }
      }
    }
    
  } catch (error: any) {
    console.error(`❌ Error analyzing file: ${error.message}`);
  }
}

// Run the debugger
debugTypeScript().catch(console.error);