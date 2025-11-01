import { BaseData, Data } from '@/app/models/data/Data';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { SnapshotStoreConfig } from '@/app/snapshots';
import { SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';

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
