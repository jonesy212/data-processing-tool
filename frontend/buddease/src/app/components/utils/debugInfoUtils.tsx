import { Data } from "@/app/components/models/data/Data";
import { SnapshotStoreConfig } from "@/app/components/snapshots/SnapshotStoreConfig";

export function addDebugInfo<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  configs: SnapshotStoreConfig<T, Meta, K>[],
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
