// restoreInterfaceFixToPoint.ts
import { PhaseBackupSystem } from '@/src/core/error-analyzer/phases/PhaseBackupSystem';

export async function restoreInterfaceFixToPoint(
  projectRoot: string,
  timestamp: number
): Promise<void> {
  const backupSystem = new PhaseBackupSystem(projectRoot);

  const point = backupSystem.findRestorePointByTimestamp(timestamp);

  if (!point) {
    throw new Error(`Restore point not found near timestamp ${timestamp}`);
  }

  await backupSystem.restoreToPoint(point.id);

  console.log(`✅ Restored to point: ${point.name}`);
}