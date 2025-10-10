import { BaseData } from '@/app/models/data/Data';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { StructuredMetadata } from "@/config/StructuredMetadata";

export function addDebugInfo<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>(
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
