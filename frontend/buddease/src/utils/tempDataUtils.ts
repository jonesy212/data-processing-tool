  import type { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig'
import { AppEntity } from "@/core/typings/entities/AppEntity";

  export function storeTempData<
    T extends BaseDataEntity = AppEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    configs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    T extends BaseDataEntity = BaseDataRoot,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    configs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
