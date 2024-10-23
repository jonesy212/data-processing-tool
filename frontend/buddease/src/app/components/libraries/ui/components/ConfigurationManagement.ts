ConfigurationManagement.ts
interface ConfigurationManagement<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  applyStoreConfig(snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, T>): void;
  handleSnapshotConfig(config: SnapshotStoreConfig<T, Meta, K>): void;
  // other config-related methods
}