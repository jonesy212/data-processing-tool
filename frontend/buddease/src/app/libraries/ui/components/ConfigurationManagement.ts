// ConfigurationManagement.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
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
  // Strict type-safe single entity
  applyStoreConfig(snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void;

  handleSnapshotConfig(config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void;

  // Flexible union type for components dealing with multiple entities
  applyUnionConfig?(snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion, any, any>): void;
}
