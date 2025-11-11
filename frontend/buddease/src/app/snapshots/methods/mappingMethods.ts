// mappingMethods.ts
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { CriteriaType } from '@/app/pages/searches/CriteriaType';
import {
  SnapshotsArray,
  SnapshotsObject
} from "@/app/snapshots/LocalStorageSnapshotStore";
import { SnapshotWithData } from "@/app/components/calendar/CalendarApp";
import { WrappedU } from "@/app/snapshots/isCompatibleTempData";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Snapshot } from "@/app/snapshots/Snapshot";
import { SnapshotEvent } from '@/app/typings/snapshotTypes';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { Attachment } from "@/app/documents/attachment/Attachment";

// ------------------------
// mapSnapshots
// ------------------------
export const MapMethods = {
  
  mapSnapshot: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: number,
    storeId: string | number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    criteria: CriteriaType,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    mapFn: (item: T) => T,
    isAsync: boolean = false
  ): Promise<string | undefined> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    try {
      // Validate required parameters
      if (!snapshot || !snapshotStore || !mapFn) {
        console.warn("Snapshot, snapshotStore, and mapFn are required");
        return isAsync ? Promise.resolve(undefined) : null;
      }

      const mappingOperation = () => {
        // Apply mapping function to snapshot data
        const mappedData = mapFn(snapshot.data);
        
        // Create mapped snapshot
        const mappedSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
          ...snapshot,
          data: mappedData,
          lastModified: new Date(),
          mappingMetadata: {
            originalId: snapshot.id,
            mappedAt: new Date(),
            criteria,
            storeId: storeId.toString()
          }
        };

        // Execute callback with mapped snapshot
        if (callback) {
          try {
            callback(mappedSnapshot);
          } catch (callbackError) {
            console.warn("Callback execution failed in mapSnapshot:", callbackError);
          }
        }

        // Update snapshot store if needed
        if (snapshotStore && typeof snapshotStore.updateSnapshot === 'function') {
          try {
            snapshotStore.updateSnapshot(snapshotId, mappedSnapshot);
          } catch (updateError) {
            console.warn("Failed to update snapshot in store:", updateError);
          }
        }

        // Handle snapshot container
        if (snapshotContainer && typeof snapshotContainer.addSnapshot === 'function') {
          try {
            snapshotContainer.addSnapshot(mappedSnapshot);
          } catch (containerError) {
            console.warn("Failed to add snapshot to container:", containerError);
          }
        }

        // Trigger event if provided
        if (event && typeof event.trigger === 'function') {
          try {
            event.trigger('snapshot_mapped', {
              id,
              storeId,
              snapshotId,
              snapshot: mappedSnapshot,
              criteria,
              type,
              timestamp: new Date()
            });
          } catch (eventError) {
            console.warn('Failed to trigger snapshot mapped event:', eventError);
          }
        }

        return mappedSnapshot;
      };

      // Handle async vs sync execution
      if (isAsync) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const result = mappingOperation();
            resolve(result?.id || undefined);
          }, 0);
        });
      } else {
        const result = mappingOperation();
        return result;
      }

    } catch (error) {
      console.error("Error in mapSnapshot:", error);
      
      if (isAsync) {
        return Promise.resolve(undefined);
      } else {
        return null;
      }
    }
  }
   mapSnapshots: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T 
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  // ✅ Add this parameter
    storeIds: number[],
    snapshotId: string,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
    timestamp: string | number | Date | undefined,
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
    data: T,
    callback: (
      storeIds: number[],
      snapshotId: string,
      categoryProperties: CategoryProperties | undefined,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
      timestamp: string | number | Date | undefined,
      type: string,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      id: number,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
      data: K,
      index: number,
      category?: Category,
    ) => SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    
    category?: Category,
  ): Promise<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
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
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  // ✅ Add this parameter
    storeId: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void  
): SnapshotWithData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
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

  // ADD MORE METHODS HERE
}