import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { BaseData } from '@/app/components/models/data/Data';
import { SnapshotStoreConfig } from '@/app/components/snapshots';
import { SnapshotUnion } from '@/app/components/snapshots/LocalStorageSnapshotStore';

//ConfigurationManagement.ts
interface ConfigurationManagement<T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  applyStoreConfig(snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, Meta, K>): void;
  handleSnapshotConfig(config: SnapshotStoreConfig<T, K>): void;
  // other config-related methods
}