// subscriberTypeGuads.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';

import type { Attachment } from '@/core/documents/attachment/Attachment';

import type { SnapshotStoreOptions } from "@/core/hooks/useSnapshotManager";
import { Category } from "@/core/libraries/categories/generateCategoryProperties";
import { SnapshotData, SnapshotsArray } from "@/core/snapshots/SnapshotData";
import { SnapshotSubscriberManagement } from "@/core/snapshots/SnapshotSubscriberManagement";
import { Subscriber } from "@/core/subscribers/Subscriber";

// Type guard to differentiate between SnapshotSubscriberManagement and SnapshotStoreOptions
function isSnapshotSubscriberManagement<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
    obj: SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): obj is SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return (
      typeof obj.subscribeToSnapshots === 'function' &&
      obj.subscribeToSnapshots.length === 7 // Length of parameters for SnapshotSubscriberManagement
    );
  }


// Usage Example
function handleSubscription<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
    obj: SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      | SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotId: string,
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  callback: (snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  category?: Category,
): void {
  if (isSnapshotSubscriberManagement(obj)) {
    // Handle SnapshotSubscriberManagement case
    const result = obj.subscribeToSnapshots(
      snapshotStore,
      snapshotId,
      snapshotData,
      category,
      snapshotConfig,
      callback,
      snapshots
    );
    // Do something with result
  } else {
    // Handle SnapshotStoreOptions case
    obj.subscribeToSnapshots(
      snapshotStore,
      snapshotId,
      snapshotData,
      category,
      snapshotConfig,
      callback as (snapshotStore: SnapshotStore<any, any>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
      snapshots
    );
  }
}


export {
    handleSubscription, isSnapshotSubscriberManagement
};

