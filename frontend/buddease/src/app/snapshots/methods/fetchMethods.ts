// fetchMethods.ts
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { Attachment } from '@/app/documents/attachment/Attachment';

export const FetchMethods = {
  fetchData: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
      this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotId: string,
      snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
      const snapshot = await snapshotManager.getSnapshot(snapshotId);
      return snapshot || null;
  },

fetchStoreData: async function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
  return snapshotStore.getAllSnapshots();
},

fetchSnapshot: async function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotId: string
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
  return this.getSnapshotById(snapshotId) || null;
},

batchFetchSnapshots: async function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    criteria: CriteriaType,
    snapshotData: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    }>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    const snapshotIds = this.getSnapshotIdsByCriteria(criteria);
    const subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = this.getSubscribersByCriteria(criteria);
    const snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = this.getSnapshotsMapByCriteria(criteria);

    const { snapshots: fetchedSnapshots } = await snapshotData(snapshotIds, subscribers, snapshots);

    return Object.values(fetchedSnapshots);
  },
};
