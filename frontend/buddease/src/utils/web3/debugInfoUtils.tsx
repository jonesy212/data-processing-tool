import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { Attachment } from '@/app/documents/attachment/Attachment';

export function addDebugInfo<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
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
