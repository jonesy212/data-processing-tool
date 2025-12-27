#!/usr/bin/env tsx

// src/app/scripts/quick-type-check.ts
// Quick type check for common issues

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function quickTypeCheck() {
  console.log('⚡ Quick Type Check\n');

  let foundIssues = false;

  // 1. Check for your specific error
  console.log('1. Checking for specific error pattern...');
  try {
    execSync('pnpm run ts:test-phase 2>&1 | grep -i "does not provide an export" || true', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
  } catch (error: any) {
    const output = error.stdout || error.stderr || error.message;
    if (output.includes('does not provide an export')) {
      console.log('   ❌ Found the specific error!');
      foundIssues = true;
      
      // Extract the problematic file
      const match = output.match(/(src\/[^:]+\.tsx?):/);
      if (match) {
        console.log(`   File: ${match[1]}`);
        
        // Check the file
        const filePath = path.resolve(process.cwd(), match[1]);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');
          
          // Find the problematic import
          lines.forEach((line, index) => {
            if (line.includes('import') && line.includes('Snapshot')) {
              console.log(`   Line ${index + 1}: ${line.trim()}`);
            }
          });
        }
      }
    } else {
      console.log('   ✅ No specific error found');
    }
  }

  // 2. Quick TypeScript check
  console.log('\n2. Running quick TypeScript check...');
  try {
    const result = execSync('npx tsc --noEmit --listFiles 2>&1 | head -5', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('   ✅ TypeScript file listing successful');
  } catch (error: any) {
    console.log('   ❌ TypeScript found errors');
    foundIssues = true;
    
    if (error.stdout) {
      const output = error.stdout.toString();
      const lines = output.split('\n').slice(0, 10);
      lines.forEach((line: string) => {
        console.log(`   ${line}`);
      });
    }
  }

  // 3. Check specific problematic files
  console.log('\n3. Checking known problematic files...');
  
  const problematicFiles = [
    'src/app/snapshots/snapshotStoreConfigInstance.ts',
    'src/app/hooks/useSnapshotManager.ts',
    'src/app/snapshots/SnapshotType.ts',
    'src/app/api/SnapshotApi.ts'
  ];

  for (const file of problematicFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for type-only exports that might be problematic
      const hasTypeExports = content.includes('export interface') || 
                            content.includes('export type ') ||
                            content.includes('export enum');
      
      // Check for mixed exports
      const lines = content.split('\n');
      let mixedExports = false;
      let snapshotManagerExports = false;
      
      lines.forEach((line, index) => {
        if (line.includes('export') && line.includes('SnapshotManager')) {
          snapshotManagerExports = true;
          console.log(`   📍 ${file}:${index + 1} - ${line.trim()}`);
        }
        
        if (line.includes('export {') && line.includes('}')) {
          // Check if mixing types and values
          const hasInterface = line.includes('interface');
          const hasType = line.includes('type ');
          const hasFunction = line.includes('function');
          const hasConst = line.includes('const');
          
          if ((hasInterface || hasType) && (hasFunction || hasConst)) {
            mixedExports = true;
            console.log(`   ⚠️  ${file}:${index + 1} - Mixed export: ${line.trim()}`);
          }
        }
      });
      
      if (hasTypeExports || mixedExports || snapshotManagerExports) {
        foundIssues = true;
      }
    } else {
      console.log(`   ⏭️  ${file} - File not found`);
    }
  }

  // 4. Check for import type usage
  console.log('\n4. Checking for import type usage...');
  
  // Find files that import SnapshotManager
  const importPattern = /import.*SnapshotManager.*from/;
  const snapshotImports: string[] = [];
  
  function findFilesWithPattern(dir: string, pattern: RegExp): string[] {
    const results: string[] = [];
    
    const scan = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.') || 
            entry.name === 'node_modules' || 
            entry.name === 'dist') {
          continue;
        }
        
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (/\.(ts|tsx)$/.test(entry.name)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (pattern.test(content)) {
              results.push(fullPath);
            }
          } catch (error) {
            // Skip files we can't read
          }
        }
      }
    };
    
    scan(dir);
    return results;
  }
  
  const srcDir = path.join(process.cwd(), 'src');
  const filesWithSnapshotImport = findFilesWithPattern(srcDir, importPattern);
  
  if (filesWithSnapshotImport.length > 0) {
    console.log(`   Found ${filesWithSnapshotImport.length} files importing SnapshotManager:`);
    filesWithSnapshotImport.slice(0, 5).forEach(file => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`   📄 ${relativePath}`);
      
      // Check if they use import type
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (line.includes('SnapshotManager')) {
          if (line.includes('import type')) {
            console.log(`      ✅ Line ${index + 1}: Uses import type`);
          } else if (line.includes('import')) {
            console.log(`      ⚠️  Line ${index + 1}: Does NOT use import type`);
            foundIssues = true;
          }
        }
      });
    });
    
    if (filesWithSnapshotImport.length > 5) {
      console.log(`   ... and ${filesWithSnapshotImport.length - 5} more files`);
    }
  } else {
    console.log('   ✅ No files found importing SnapshotManager');
  }

  // 5. Summary and recommendations
  console.log('\n' + '='.repeat(60));
  console.log('📊 QUICK CHECK SUMMARY');
  console.log('='.repeat(60));
  
  if (foundIssues) {
    console.log('\n❌ Found potential type export issues!\n');
    console.log('💡 Recommended actions:');
    console.log('   1. Run detailed analysis:');
    console.log('      pnpm run analyze-type-exports');
    console.log('\n   2. Check specific problematic exports:');
    console.log('      pnpm run check-type-file src/app/hooks/useSnapshotManager.ts');
    console.log('\n   3. Fix issues automatically:');
    console.log('      pnpm run fix-type-exports');
    console.log('\n   4. Common fixes needed:');
    console.log('      • Change: export { SnapshotManager }');
    console.log('        To: export type { SnapshotManager }');
    console.log('\n      • Change: import { SnapshotManager }');
    console.log('        To: import type { SnapshotManager }');
  } else {
    console.log('\n✅ No obvious type export issues found!');
    console.log('\n💡 For thorough analysis, run:');
    console.log('   pnpm run analyze-type-exports');
  }

  console.log('\n' + '='.repeat(60));
}

// ES Module check
if (import.meta.url === `file://${process.argv[1]}`) {
  quickTypeCheck().catch(console.error);
}

export { quickTypeCheck };