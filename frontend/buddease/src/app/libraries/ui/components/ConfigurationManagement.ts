import { BaseData } from '@/app/models/data/Data';
import { SnapshotStoreConfig } from '@/app/snapshots';
import { SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { StructuredMetadata } from '@/config/StructuredMetadata';

//ConfigurationManagement.ts
interface ConfigurationManagement<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T> {
  applyStoreConfig(snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K, Meta>): void;
  handleSnapshotConfig(config: SnapshotStoreConfig<T, K>): void;
  // other config-related methods
}