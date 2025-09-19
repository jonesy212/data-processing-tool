// InitializableWithData.tsx

interface InitializableWithData<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  initializeWithData(data: SnapshotUnion<T, K, Meta>[]): void | undefined;
  hasSnapshots(): Promise<boolean>;   
  addSnapshot(
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>
  ): Promise<Snapshot<T, K, Meta, ExcludedFields> | undefined>;
}

export type { InitializableWithData }