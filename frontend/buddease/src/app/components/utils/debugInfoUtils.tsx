import { SnapshotStoreConfig } from "@/app/components/snapshots/SnapshotStoreConfig";
import { Data } from "@/app/components/models/data/Data";

export function addDebugInfo<T extends Data, K extends Data>(
  configs: SnapshotStoreConfig<T, K>[],
  configId: string,
  message: string,
  operation?: string
): void {
  for (const config of configs) {
    if (config.id === configId) {
      config.debugInfo = {
        message,
        timestamp: new Date().toISOString(),
        operation,
      };
      console.log(`Debug info added: ${message}`);
      return;
    }
  }
  console.warn(`No config found with ID: ${configId}`);
}
