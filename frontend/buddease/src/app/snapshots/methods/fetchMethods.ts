// fetchMethods.ts
export const FetchMethods = {
  fetchData: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotId: string,
    snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
    const snapshot = await snapshotManager.getSnapshot(snapshotId);
    return snapshot || null;
  },

  fetchStoreData: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    return snapshotStore.getAllSnapshots();
  },

  fetchSnapshot: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotId: string
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
    return this.getSnapshotById(snapshotId) || null;
  },

  batchFetchSnapshots: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
      snapshots: Snapshots<T, K, Meta, ExcludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>;
      snapshots: Snapshots<T, K, Meta, ExcludedFields>;
    }>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    const snapshotIds = this.getSnapshotIdsByCriteria(criteria);
    const subscribers: SubscriberCollection<T, K, Meta, ExcludedFields> = this.getSubscribersByCriteria(criteria);
    const snapshots: Snapshots<T, K, Meta, ExcludedFields> = this.getSnapshotsMapByCriteria(criteria);

    const { snapshots: fetchedSnapshots } = await snapshotData(snapshotIds, subscribers, snapshots);

    return Object.values(fetchedSnapshots);
  },
};
