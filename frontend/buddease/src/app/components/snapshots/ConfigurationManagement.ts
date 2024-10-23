import { BaseData, Data } from '@/app/components/models/data/Data';
import { SnapshotStoreConfig } from '@/app/components/snapshots';
import { SnapshotUnion } from '@/app/components/snapshots/LocalStorageSnapshotStore';

interface ConfigurationManagement<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  applyStoreConfig(snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, T>): void;
  handleSnapshotConfig(config: SnapshotStoreConfig<T, Meta, K>): void;
  // other config-related methods
}

export type { ConfigurationManagement };
