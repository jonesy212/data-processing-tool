import { createBackup, restoreBackup } from '../../error-analyzer/phases/PhaseBackupSystem';

async function autoFixInterfaceImportsWithBackup(projectRoot: string, files: string[]) {
    // Step 1: Backup before applying fixes
    await createBackup(projectRoot, { description: "Before interface import auto-fix" });

    // Step 2: Apply interface import fixes
    await autoFixInterfaceImports(projectRoot, files);

    console.log("✅ Interface import fixes applied. Backup created.");
}

// Undo / rollback if something goes wrong
async function undoInterfaceFixes() {
    await restoreBackup(); // Restores latest backup
    console.log("↩️ Interface import fixes rolled back successfully.");
}
