// advancedTransform.ts

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import SnapshotStore, { Snapshot } from '@/core/snapshots/Snapshot';

// ✅ Keep this as a standalone utility function (not in TransformMethods)
export function transformSubscriberAdvanced<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  subscriber: (
    event: string,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: any[],
    criteria: any,
    category: symbol | string | undefined
  ) => void,
  transformSnapshot: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  transformSnapshotStore: (
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  transformSnapshotCriteria: (criteria: any) => any
): (
  event: string,
  snapshotId: string,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  dataItems: any[],
  criteria: any,
  category: symbol | string | undefined
) => void {
  return (
    event,
    snapshotId,
    snapshot,
    snapshotStore,
    dataItems,
    criteria,
    category
  ) => {
    const transformedSnapshot = transformSnapshot(snapshot);
    const transformedSnapshotStore = transformSnapshotStore(snapshotStore);
    const transformedCriteria = transformSnapshotCriteria(criteria);

    subscriber(
      event,
      snapshotId,
      transformedSnapshot,
      transformedSnapshotStore,
      dataItems,
      transformedCriteria,
      category
    );
  };
}


// ✅ Complete 6-parameter version that maintains all generic parameters
export function transformSubscriberMappedAdvanced<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
  U extends BaseDataEntity = T,
  V extends U = U,
  Meta2 extends DefaultMeta<U, V> = DefaultMeta<U, V>,
  AttachmentType2 extends Attachment = AttachmentType,
  ExcludedFields2 extends keyof U = DefaultExcludedFields<U>,
  IncludedFields2 extends keyof U = keyof U
>(
  subscriber: (
    event: string,
    snapshotId: string,
    snapshot: Snapshot<U, V, Meta2, AttachmentType2, ExcludedFields2, IncludedFields2>,
    snapshotStore: SnapshotStore<U, V, Meta2, AttachmentType2, ExcludedFields2, IncludedFields2>,
    dataItems: any[],
    criteria: any,
    category: symbol | string | undefined
  ) => void,
  transformSnapshot: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Snapshot<U, V, Meta2, AttachmentType2, ExcludedFields2, IncludedFields2>,
  transformSnapshotStore: (
    store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => SnapshotStore<U, V, Meta2, AttachmentType2, ExcludedFields2, IncludedFields2>,
  transformSnapshotCriteria: (criteria: any) => any
): (
  event: string,
  snapshotId: string,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  dataItems: any[],
  criteria: any,
  category: symbol | string | undefined
) => void {
  return (
    event: string,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: any[],
    criteria: any,
    category: symbol | string | undefined
  ) => {
    const transformedSnapshot = transformSnapshot(snapshot);
    const transformedSnapshotStore = transformSnapshotStore(snapshotStore);
    const transformedCriteria = transformSnapshotCriteria(criteria);

    subscriber(
      event,
      snapshotId,
      transformedSnapshot,
      transformedSnapshotStore,
      dataItems,
      transformedCriteria,
      category
    );
  };
}