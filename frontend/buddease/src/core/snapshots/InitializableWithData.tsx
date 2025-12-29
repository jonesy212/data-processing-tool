// InitializableWithData.tsx
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';


interface InitializableWithData<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  initializeWithData(data: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): void | undefined
  hasSnapshots(): Promise<boolean>;   
  addSnapshot(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>
}

export type { InitializableWithData };
