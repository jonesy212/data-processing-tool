// restoreLastInterfaceFix.ts
import { PhaseBackupSystem } from '@/src/core/error-analyzer/phases/PhaseBackupSystem';

async function restoreLastInterfaceFix(projectRoot: string): Promise<void> {
  const backupSystem = new PhaseBackupSystem(projectRoot);
  const records = backupSystem.getBackupRecords();

  const last = records
    .filter(r =>
      r.metadata?.tags?.includes('auto-fix-interface-imports') &&
      r.status === 'active'
    )
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

  if (!last) {
    throw new Error('No interface import backups found.');
  }

  await backupSystem.restoreBackup(last.id);
  console.log(`✅ Restored last interface import fix: ${last.id}`);
}
