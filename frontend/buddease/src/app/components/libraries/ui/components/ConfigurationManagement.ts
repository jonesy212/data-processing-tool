ConfigurationManagement.ts
interface ConfigurationManagement<T extends Data, K extends Data> {
  applyStoreConfig(snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData>, T>): void;
  handleSnapshotConfig(config: SnapshotStoreConfig<T, K>): void;
  // other config-related methods
}