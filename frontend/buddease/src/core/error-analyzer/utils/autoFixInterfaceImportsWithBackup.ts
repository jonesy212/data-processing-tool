import { autoFixInterfaceImports } from '@/core/error-analyzer/utils/autoFixInterfaceImports';
import { restoreBackup } from '@/src/core/error-analyzer/phases/PhaseBackupSystem';


async function autoFixInterfaceImportsWithBackup(
  projectRoot: string,
  files: string[],
  options: { dryRun?: boolean } = {}
): Promise<void> {
  const backupSystem = new PhaseBackupSystem(projectRoot);
  const backupIds: string[] = [];

  try {
    // ─────────────────────────────────────────────
    // STEP 1: Backup each file before mutation
    // ─────────────────────────────────────────────
    for (const file of files) {
      const { backupId } = await backupSystem.createBackup(
        file,
        'auto-fix-interface-imports',
        ['pre-fix']
      );
      backupIds.push(backupId);
    }

    // ─────────────────────────────────────────────
    // STEP 2: Apply interface import fixes
    // ─────────────────────────────────────────────
    if (!options.dryRun) {
      await autoFixInterfaceImports(projectRoot, files);
    }

    console.log(
      options.dryRun
        ? '🧪 Dry run complete. No files modified.'
        : '✅ Interface import fixes applied successfully.'
    );

  } catch (error) {
    console.error('❌ Import auto-fix failed. Rolling back changes…');

    // ─────────────────────────────────────────────
    // STEP 3: Rollback in reverse order
    // ─────────────────────────────────────────────
    for (const backupId of backupIds.reverse()) {
      try {
        await backupSystem.restoreBackup(backupId);
      } catch (restoreError) {
        console.error(`❌ Failed to restore backup ${backupId}`, restoreError);
      }
    }

    throw error;
  }
}

// Undo / rollback if something goes wrong
async function undoInterfaceFixes() {
    await restoreBackup(); // Restores latest backup
    console.log("↩️ Interface import fixes rolled back successfully.");
}