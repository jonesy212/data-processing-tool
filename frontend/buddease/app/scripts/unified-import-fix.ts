#!/usr/bin/env tsx
// scripts/typescript/import-management/unified-import-fix.ts
// Unified file fixer - CLI tool for fixing individual files

import * as fs from 'fs';
import * as path from 'path';
import { findFilePath } from '@/app/scripts/import-utils';
import { type PassResult } from '@/scripts/typescript/import-management/shared/import-fix-core'
import type { UnifiedFixOptions } from '@/scripts/typescript/import-management/shared/unified-file-fixer-core'
import { UnifiedFileFixerCore } from '@/scripts/typescript/import-management/shared/unified-file-fixer-core'
import { glob } from 'glob';


async function resolveFilePath(fileArg: string): Promise<string | null> {
  // 1. Check if it's already a valid path
  if (fs.existsSync(fileArg)) {
    return path.resolve(fileArg);
  }
  
  // 2. Check if it's in src directory
  const srcPath = path.join(process.cwd(), 'src', fileArg);
  if (fs.existsSync(srcPath)) {
    return srcPath;
  }
  
  // 3. Search for the file
  const pattern = `**/${fileArg}`;
  const files = await glob(pattern, { 
    cwd: process.cwd(),
    ignore: ['node_modules/**', '.git/**'],
    absolute: true 
  });
  
  return files[0] || null;
}

export class UnifiedFileFixer extends UnifiedFileFixerCore {}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const fileArg = args.find(arg => !arg.startsWith('--'));
  
  if (!fileArg) {
    console.error('❌ Error: No file specified');
    console.log('\nUsage: pnpm fix:file <file> [options]');
    console.log('\nOptions:');
    console.log('  --dry-run       Preview changes without applying');
    console.log('  --no-backup     Skip creating backups');
    console.log('  --skip-mixed    Skip mixed import fixing');
    console.log('  --skip-interface Skip interface import fixing');
    console.log('  --skip-general  Skip general import fixing');
    console.log('  --verbose       Show detailed output');
    console.log('  --threshold     Confidence threshold (default: 70)');
    process.exit(1);
  }

  const options: UnifiedFixOptions = {
    dryRun: args.includes('--dry-run'),
    backup: !args.includes('--no-backup'),
    skipMixed: args.includes('--skip-mixed'),
    skipInterface: args.includes('--skip-interface'),
    skipGeneral: args.includes('--skip-general'),
    verbose: args.includes('--verbose'),
    confidenceThreshold: args.includes('--threshold') 
      ? parseInt(args[args.indexOf('--threshold') + 1]) || 70 
      : 70
  };

  try {
    let exactPath = fileArg;
    if (!fs.existsSync(exactPath)) {
      exactPath = await resolveFilePath(fileArg) || fileArg;
    }
    if (!fs.existsSync(exactPath)) {
      console.error(`❌ File not found: ${fileArg}`);
      process.exit(1);
    }
    
    console.log(`🎯 Found file: ${exactPath}`);
    
    const fixer = new UnifiedFileFixer(exactPath, options);
    const result = await fixer.analyzeAndFix();

    if (!result.success && result.error) {
      console.error(`❌ ${result.error}`);
      process.exit(1);
    }

    if (result.success) {
      console.log(`\n✅ Fix completed successfully`);
      console.log(`📊 ${result.errorsFixed || 0} imports fixed`);
      
      if (options.verbose && result.metadata) {
        console.log('\n📋 Details:', JSON.stringify(result.metadata, null, 2));
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}