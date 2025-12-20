// ConfigurationManagement.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';

interface ConfigurationManagement<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  applyStoreConfig(snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void;
  handleSnapshotConfig(config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void;
  // other config-related methods
}

export type { ConfigurationManagement };
