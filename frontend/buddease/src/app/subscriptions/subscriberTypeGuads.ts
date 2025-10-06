// subscriberTypeGuads.ts
import { SnapshotStoreConfig } from '@/app/snapshots';

import { BaseData } from '@/app/models/data/Data';
import { SnapshotStoreOptions } from "@/app/hooks/useSnapshotManager";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { SnapshotData, SnapshotsArray } from "@/app/snapshots";
import { SnapshotSubscriberManagement } from "@/app/snapshots/SnapshotSubscriberManagement";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { StructuredMetadata } from "@/config/StructuredMetadata";

// Type guard to differentiate between SnapshotSubscriberManagement and SnapshotStoreOptions
function isSnapshotSubscriberManagement<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    obj: SnapshotSubscriberManagement<T, K> | SnapshotStoreOptions<T, K>
  ): obj is SnapshotSubscriberManagement<T, K> {
    return (
      typeof obj.subscribeToSnapshots === 'function' &&
      obj.subscribeToSnapshots.length === 7 // Length of parameters for SnapshotSubscriberManagement
    );
  }


// Usage Example
function handleSubscription<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  obj: SnapshotSubscriberManagement<T, K> | SnapshotStoreOptions<T, K>,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotId: string,
  snapshotData: SnapshotData<T, K>,
  category: Category | undefined,  snapshotConfig: SnapshotStoreConfig<T, K>,
  callback: (snapshots: SnapshotsArray<T, K, Meta>) => Subscriber<T, K> | null,
  snapshots: SnapshotsArray<T, K, Meta>
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
      callback as (snapshotStore: SnapshotStore<any, any>) => Subscriber<T, K> | null,
      snapshots
    );
  }
}


export {
  handleSubscription, isSnapshotSubscriberManagement
};

