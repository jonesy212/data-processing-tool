// advancedTransform.ts

import { Snapshot } from "..";
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from "@/app/data_analysis/frontend/buddease/src/app/configs/BaseConfig";
import SnapshotStore from "@/app/snapshotstore";

// ✅ Keep this as a standalone utility function (not in TransformMethods)
export function transformSubscriberAdvanced<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  subscriber: (
    event: string,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    dataItems: any[],
    criteria: any,
    category: symbol | string | undefined
  ) => void,
  transformSnapshot: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  transformSnapshotStore: (
    store: SnapshotStore<T, K, Meta, ExcludedFields>
  ) => SnapshotStore<T, K, Meta, ExcludedFields>,
  transformSnapshotCriteria: (criteria: any) => any
): (
  event: string,
  snapshotId: string,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
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

// ✅ Keep this as a standalone utility function
export function transformSubscriberMappedAdvanced<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  U extends BaseDataEntity = T,
  V extends U = U,
  Meta2 = DefaultMeta<U, V>,
  ExcludedFields2 extends keyof U = DefaultExcludedFields<U>
>(
  subscriber: (
    event: string,
    snapshotId: string,
    snapshot: Snapshot<U, V, Meta2, ExcludedFields2>,
    snapshotStore: SnapshotStore<U, V, Meta2, ExcludedFields2>,
    dataItems: any[],
    criteria: any,
    category: symbol | string | undefined
  ) => void,
  transformSnapshot: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Snapshot<U, V, Meta2, ExcludedFields2>,
  transformSnapshotStore: (
    store: SnapshotStore<T, K, Meta, ExcludedFields>
  ) => SnapshotStore<U, V, Meta2, ExcludedFields2>,
  transformSnapshotCriteria: (criteria: any) => any
): (
  event: string,
  snapshotId: string,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
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