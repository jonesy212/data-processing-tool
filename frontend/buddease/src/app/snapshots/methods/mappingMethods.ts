// mappingMethods.ts
import { Snapshot } from "@/app/snapshots/Snapshot";
import SnapshotStore from "./SnapshotStore";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { SnapshotEvent } from '@/app/typings/eventTypes';
import {
    SnapshotsArray,
    SnapshotsObject
} from "@/app/LocalStorageSnapshotStore";
import { SnapshotWithData } from "@/app/calendar/CalendarApp";
import { WrappedU } from "@/app/isCompatibleTempData";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";

// ------------------------
// mapSnapshots
// ------------------------
export const MapMethods = {

   mapSnapshots: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>  
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,  // ✅ Add this parameter
    storeIds: number[],
    snapshotId: string,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,  
    data: T,
    callback: (
      storeIds: number[],
      snapshotId: string,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
      timestamp: string | number | Date | undefined,
      type: string,
      event: SnapshotEvent<T, K, Meta, ExcludedFields>,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,  
      data: K,
      index: number
    ) => SnapshotsObject<T, K, Meta, ExcludedFields>
  ): Promise<SnapshotsArray<T, K, Meta>> {
    // Implementation using this.* for instance access
    if (!this.delegate || this.delegate.length === 0) {
      return Promise.resolve([]);
    }

    return this.delegate[0].mapSnapshots(
      storeIds,
      snapshotId,
      category,
      categoryProperties,
      snapshot,
      timestamp,
      type,
      event,
      id,
      snapshotStore,
      data,
      callback
    );
  },


// ------------------------
// mapSnapshotWithDetails
// ------------------------
  mapSnapshotWithDetails: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>  
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,  // ✅ Add this parameter
    storeId: number,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,  
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
    type: string,
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void  
  ): SnapshotWithData<T, K, Meta, ExcludedFields> | null {
  try {
    // Validate input
    if (!snapshot || !snapshotStore) {
      console.warn("Snapshot and snapshotStore are required");
      return null;
    }

    // Create enhanced snapshot with details
    const snapshotWithDetails: SnapshotWithData<WrappedU, WrappedU, Meta, ExcludedFields> = {
      ...snapshot,
      storeId,
      snapshotStore,
      mappedAt: new Date(),
      mappingContext: {
        type,
        eventType: event?.type,
        timestamp: new Date()
      }
    };

    // Execute callback with the snapshot
    if (callback) {
      try {
        callback(snapshot);
      } catch (callbackError) {
        console.warn("Callback execution failed in mapSnapshotWithDetails:", callbackError);
      }
    }

    // Trigger event if provided
    if (event && typeof event.trigger === 'function') {
      try {
        event.trigger('snapshot_mapped', {
          storeId,
          snapshotId,
          snapshot: snapshotWithDetails,
          type,
          timestamp: new Date()
        });
      } catch (eventError) {
        console.warn('Failed to trigger snapshot mapped event:', eventError);
      }
    }

    return snapshotWithDetails;

  } catch (error) {
    console.error("Error in mapSnapshotWithDetails:", error);
    return null;
  }
}


}