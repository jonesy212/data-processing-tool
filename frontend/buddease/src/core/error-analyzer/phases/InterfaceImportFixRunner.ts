// InterfaceImportFixRunner.ts
import type { autoFixInterfaceImports } from '@/core/error-analyzer/utils/autoFixInterfaceImports';
import type { previewInterfaceImportDiff } from '@/core/error-analyzer/utils/previewInterfaceImportDiff';
import { PhaseBackupSystem } from '@/core/error-analyzer/phases/PhaseBackupSystem';
import fs from 'fs';
import pLimit from 'p-limit';
import { isFileGitDirty } from './gitUtils';



export interface InterfaceImportFixOptions {
  dryRun?: boolean;
  preview?: boolean;
  restoreLast?: boolean;
  restorePoint?: number;
  parallel?: boolean;
  maxConcurrency?: number;
  gitAware?: boolean;
}


export class InterfaceImportFixRunner {
  private backupSystem: PhaseBackupSystem;

  constructor(private projectRoot: string) {
    this.backupSystem = new PhaseBackupSystem(projectRoot);
  }

  async run(
    files: string[],
    options: InterfaceImportFixOptions = {}
  ): Promise<void> {
    /* ---------------- Restore modes ---------------- */

    if (options.restoreLast) {
      await this.restoreLastPoint();
      return;
    }

    if (options.restorePoint) {
      await this.restoreToTimestamp(options.restorePoint);
      return;
    }

    /* ---------------- Preview only ---------------- */

    if (options.preview) {
      await this.preview(files);
      return;
    }

    /* ---------------- Fix execution ---------------- */

    const restorePoint = await this.backupSystem.backupMultipleEntities(
      files,
      'interface-import-fix',
      'Interface Import Auto-Fix'
    );

    const limiter = pLimit(options.maxConcurrency ?? 4);

    const tasks = files.map(file =>
      limiter(() => this.fixSingleFile(file, options))
    );

    const results = await Promise.allSettled(tasks);

    const failed = results.filter(r => r.status === 'rejected');

    if (failed.length > 0) {
      console.error(`❌ ${failed.length} file(s) failed — rolling back`);
      await this.backupSystem.restoreToPoint(restorePoint.id);
      throw new Error('Interface import fix failed. Rollback completed.');
    }

    console.log(`✅ Interface import fixes completed (${files.length} files)`);
  }

  /* ---------------- Per-file fix ---------------- */

  private async fixSingleFile(
    file: string,
    options: InterfaceImportFixOptions
  ): Promise<void> {
    const original = fs.readFileSync(file, 'utf8');

    if (options.gitAware && !isFileGitDirty(file)) {
      console.log(`🪶 Git clean — skipping ${file}`);
      return;
    }

    if (!options.dryRun) {
      await this.backupSystem.backupEntity(
        file,
        file,
        'interface-import-fix',
        ['interface', 'imports']
      );
    }

    const fixed = await autoFixInterfaceImports(this.projectRoot, [file]);

    if (options.preview) {
      console.log(previewInterfaceImportDiff(original, fixed));
      return;
    }

    if (!options.dryRun) {
      fs.writeFileSync(file, fixed, 'utf8');
    }
  }

  /* ---------------- Restore helpers ---------------- */

  private async restoreLastPoint(): Promise<void> {
    const points = this.backupSystem.listRestorePoints();
    const last = points.at(-1);

    if (!last) {
      throw new Error('No restore points available');
    }

    await this.backupSystem.restoreToPoint(last.id);
    console.log(`✅ Restored to last restore point: ${last.name}`);
  }

  private async restoreToTimestamp(timestamp: number): Promise<void> {
    const point = this.backupSystem.findRestorePointByTimestamp(timestamp);

    if (!point) {
      throw new Error(`No restore point found for timestamp ${timestamp}`);
    }

    await this.backupSystem.restoreToPoint(point.id);
    console.log(`✅ Restored to restore point: ${point.name}`);
  }

  /* ---------------- Preview ---------------- */

  private async preview(files: string[]): Promise<void> {
    for (const file of files) {
      const original = fs.readFileSync(file, 'utf8');
      const fixed = await autoFixInterfaceImports(this.projectRoot, [file]);
      console.log(`\n📄 ${file}`);
      console.log(previewInterfaceImportDiff(original, fixed));
    }
  }
}