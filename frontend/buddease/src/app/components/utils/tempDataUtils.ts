import { Data } from "../models/data/Data";
import { SnapshotStoreConfig } from "./snapshotStoreConfig";

export function storeTempData<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  configs: SnapshotStoreConfig<T, Meta, K>[],
  configId: string,
  tempResults: T[]
): void {
  for (const config of configs) {
    if (config.id === configId) {
      config.tempData = {
        tempResults,
        cacheTime: new Date(),
      };
      console.log(`Temporary data stored for config ID: ${configId}`);
      return;
    }
  }
  console.warn(`No config found with ID: ${configId}`);
}

export function getTempData<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  configs: SnapshotStoreConfig<T, Meta, K>[],
  configId: string
): T[] | undefined {
  for (const config of configs) {
    if (config.id === configId) {
      console.log(`Temporary data retrieved for config ID: ${configId}`);
      return config.tempData?.tempResults;
    }
  }
  console.warn(`No temporary data found for config ID: ${configId}`);
  return undefined;
}
