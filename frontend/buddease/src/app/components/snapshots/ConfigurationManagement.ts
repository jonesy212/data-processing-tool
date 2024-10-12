import { SnapshotUnion } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { Data, BaseData } from '@/app/components/models/data/Data';
import { SnapshotStoreConfig } from '@/app/components/snapshots';

interface ConfigurationManagement<T extends Data, K extends Data> {
  applyStoreConfig(snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData>, T>): void;
  handleSnapshotConfig(config: SnapshotStoreConfig<T, K>): void;
  // other config-related methods
}

export type {ConfigurationManagement}