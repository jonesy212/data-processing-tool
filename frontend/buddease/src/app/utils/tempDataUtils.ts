import { StructuredMetadata } from "@/config/StructuredMetadata";
import { UnifiedMetadata } from "@/config/MetaDataOptions";
import { Data } from '@/app/models/data/Data';
import { SnapshotStoreConfig } from "./snapshotStoreConfig";
import { BaseData } from '@/app/models/data/Data';

export function storeTempData<
T extends  BaseData<any>,
 K extends T = T>(
  configs: SnapshotStoreConfig<T, K>,
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

export function getTempData<
  T extends  
  BaseData<any>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
  configs: SnapshotStoreConfig<T extends  BaseData<any>>,
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
