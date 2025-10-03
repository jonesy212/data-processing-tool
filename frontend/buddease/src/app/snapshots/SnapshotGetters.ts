// SnapshotGetters.ts

interface SnapshotGetters {
  getSnapshotsBySubscriberSuccess: any;
  getSnapshotsByTopic: any;
  getSnapshotsByTopicSuccess: any;
  getSnapshotsByCategory: any;
  getSnapshotsByCategorySuccess: any;
  getSnapshotsByKey: any;
  getSnapshotsByKeySuccess: any;
  getSnapshotsByPriority: any;
  getSnapshotsByPrioritySuccess: any;
  getStoreData: (id: number) => Promise<SnapshotStore<T, K, Meta, ExcludedFields>[]>;
  updateStoreData: any;
  updateDelegate: any;
  getSnapshotContainer: any;
  getSnapshotVersions: any;
  createSnapshot: any;
  criteria: CriteriaType;
}

export SnapshotGetter