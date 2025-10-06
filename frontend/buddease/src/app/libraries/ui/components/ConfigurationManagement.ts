import { BaseData } from '@/app/models/data/Data';
import { SnapshotStoreConfig } from '@/app/snapshots';
import { SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { StructuredMetadata } from '@/config/StructuredMetadata';

//ConfigurationManagement.ts
interface ConfigurationManagement<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  applyStoreConfig(snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K, Meta>): void;
  handleSnapshotConfig(config: SnapshotStoreConfig<T, K>): void;
  // other config-related methods
}