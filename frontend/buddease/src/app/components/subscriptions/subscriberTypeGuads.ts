// subscriberTypeGuads.ts
import { SnapshotStoreConfig } from '@/app/components/snapshots';

import { BaseData } from '@/app/components/models/data/Data';
import { Subscriber } from "@/app/components/users/Subscriber";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { SnapshotStoreOptions } from "../hooks/useSnapshotManager";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { SnapshotData, SnapshotsArray } from "../snapshots";
import { SnapshotSubscriberManagement } from "../snapshots/SnapshotSubscriberManagement";

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
  snapshotStore: SnapshotStore<T, K>,
  snapshotId: string,
  snapshotData: SnapshotData<T, K>,
  category: symbol | string | Category | undefined,
  snapshotConfig: SnapshotStoreConfig<T, K>,
  callback: (snapshots: SnapshotsArray<T, K>) => Subscriber<T, K> | null,
  snapshots: SnapshotsArray<T, K>
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
