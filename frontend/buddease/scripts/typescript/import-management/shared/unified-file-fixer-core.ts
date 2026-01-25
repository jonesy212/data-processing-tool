#!/usr/bin/env tsx
// scripts/typescript/import-management/shared/unified-file-fixer-core.ts
// Core UnifiedFileFixer class shared between tools

import type { FixResult } from '@/app/scripts/import-fix-types';
import { buildErrorResult } from '@/app/scripts/import-fix-types';
import { createBackup } from '@/app/scripts/import-utils';
import type { UnifiedFixOptions } from '@/scripts/typescript/import-management/shared/import-fix-core';
import {
  buildSuccessResult,
  getDefaultOptions,
  runAllFixPasses
} from '@/scripts/typescript/import-management/shared/import-fix-core';
import * as fs from 'fs';
import * as path from 'path';

export class UnifiedFileFixerCore {
  protected options: Required<UnifiedFixOptions>;
  protected startTime: Date;

  constructor(protected filePath: string, options: UnifiedFixOptions = {}) {
    this.options = getDefaultOptions(options);
    this.startTime = new Date();
  }

  async analyzeAndFix(): Promise<FixResult> {
    const relativePath = path.relative(process.cwd(), this.filePath);
    console.log(`🔍 Analyzing: ${relativePath}`);
    
    if (!fs.existsSync(this.filePath)) {
      return buildErrorResult(
        this.filePath, 
        '', // Empty content since file doesn't exist
        new Error(`File not found: ${this.filePath}`)
      );
    }

    const ext = path.extname(this.filePath);
    if (!['.ts', '.tsx'].includes(ext)) {
      const content = await fs.promises.readFile(this.filePath, 'utf-8');
      return buildErrorResult(
        this.filePath,
        content,
        new Error(`Invalid file type: ${ext}. Only .ts and .tsx files are supported`)
      );
    }

    // Create backup
    let backupPath: string | undefined;
    if (this.options.backup && !this.options.dryRun) {
      backupPath = createBackup(this.filePath);
      if (this.options.verbose) {
        console.log(`💾 Backup: ${path.basename(backupPath)}`);
      }
    }

    // Run all fix passes using shared logic
    const content = fs.readFileSync(this.filePath, 'utf8');
    const fixData = await runAllFixPasses(content, this.filePath, this.options);
    
    // Apply changes
    let success = false;
    
    if (!this.options.dryRun && fixData.fixed !== fixData.original) {
      fs.writeFileSync(this.filePath, fixData.fixed, 'utf8');
      console.log('\n✅ Fixes applied successfully');
      success = true;
    } else if (this.options.dryRun) {
      console.log('\n🔍 DRY RUN - No changes made');
      success = fixData.errorsFixed === 0;
    }

    return buildSuccessResult(this.filePath, {
      ...fixData,
      backupPath,
      startTime: this.startTime
    }, this.options);
  }
}