// batchMethods.ts
import { ExcludedFields } from "@/app/components/routing/Fields";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SnapshotManager } from "@/app/hooks/useSnapshotManager";
import { Snapshots } from "@/app/LocalStorageSnapshotStore";
import { CriteriaType } from "@/app/pages/searches/CriteriaType";
import { Snapshot } from "@/app/snapshots/Snapshot";
import { SnapshotActions } from "@/app/snapshots/SnapshotActions";
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/config/BaseConfig';

export const BatchMethods = {
  /**
   * Take snapshots of multiple items in batch.
   */
  batchTakeSnapshot: async function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    itemsOrSnapshotId: T[] | string,
    snapshotManagerOrStore?: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | { snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
    
    // Method 1: Take snapshots of multiple items using snapshot manager
    if (Array.isArray(itemsOrSnapshotId) && snapshotManagerOrStore instanceof SnapshotManager) {
      const items = itemsOrSnapshotId as T[];
      const snapshotManager = snapshotManagerOrStore as SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      
      const takenSnapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
      for (const item of items) {
        const snapshot = await snapshotManager.takeSnapshot(item);
        takenSnapshots.push(snapshot);
        // Optionally add to store
        this.snapshots.push(snapshot);
      }
      return takenSnapshots;
    }
    
    // Method 2: Delegate pattern for batch snapshot operation
    else if (typeof itemsOrSnapshotId === 'string' && snapshotManagerOrStore instanceof SnapshotStore && snapshots) {
      const snapshotId = itemsOrSnapshotId as string;
      const snapshotStore = snapshotManagerOrStore as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      
      const delegate = this.ensureDelegate();
      const result = await delegate.batchTakeSnapshot(snapshotId, snapshotStore, snapshots);
      return result;
    }
    
    // Invalid parameter combination
    throw new Error('Invalid parameters for batchTakeSnapshot. Use either: ' +
      '(items: T[], snapshotManager: SnapshotManager) or ' +
      '(snapshotId: string, snapshotStore: SnapshotStore, snapshots: Snapshots)');
  },
  
  /**
   * Update multiple snapshots at once.
   */
  batchUpdateSnapshots: function <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    updates: Array<{ id: string; newData: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> }>
  ): void {
    for (const update of updates) {
      const index = this.snapshots.findIndex(s => s.id === update.id);
      if (index !== -1) {
        this.snapshots[index] = {
          ...this.snapshots[index],
          ...update.newData,
        };
      }
    }
  },

  /**
   * Remove multiple snapshots by ID in batch.
   */
  batchRemoveSnapshots: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    ids: string[]
  ): void {
    this.snapshots = this.snapshots.filter(s => !ids.includes(s.id));
  },

  /**
   * Add multiple snapshots to the store at once.
   */
  batchAddSnapshots: function <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): void {
    this.snapshots.push(...snapshots);
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
    snapshotData?: (
      snapshotIds: string[],
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    }>,
    ids?: string[] // Optional parameter for direct ID fetching
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    
    // If IDs are provided directly, fetch by IDs
    if (ids && ids.length > 0) {
      const fetched: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
      for (const id of ids) {
        const snapshot = this.snapshots.find(s => s.id === id);
        if (snapshot) fetched.push(snapshot);
      }
      return fetched;
    }
    
    // If using delegate pattern with criteria and snapshotData callback
    if (criteria && snapshotData) {
      const delegate = this.ensureDelegate();
      
      // Call the delegate method and handle the result
      const result = await delegate.batchFetchSnapshots(criteria, snapshotData);
      
      // Extract snapshots from result
      const { snapshots } = result;

      // Convert Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> to array
      if (Array.isArray(snapshots)) {
        return snapshots;
      } else if (snapshots instanceof Map) {
        return Array.from(snapshots.values());
      } else if (typeof snapshots === 'object') {
        return Object.values(snapshots);
      }
      
      return [];
    }
    
    // Fallback: return empty array if no valid parameters
    return [];
  },


  async batchTakeSnapshotsRequest(snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
    const delegate = this.ensureDelegate();
    // Call the delegate method
    await delegate.batchTakeSnapshotsRequest(snapshotData);
  },

  batchUpdateSnapshotsRequest(
    snapshotData: (
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => Promise<{
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    }>
  ): Promise<void> {
    const delegate = this.ensureDelegate();
    snapshotData(this.subscribers).then(({ snapshots }) => {
      delegate.batchUpdateSnapshotsRequest(async (subscribers) => {
        const { snapshots } = await snapshotData(subscribers);
        return { subscribers, snapshots };
      });
    });
    return Promise.resolve();
  },

  batchFetchSnapshotsSuccess(
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    const delegate = this.ensureDelegate();
    delegate.batchFetchSnapshotsSuccess(subscribers, snapshots);
  },

  batchFetchSnapshotsFailure(
    date: Date,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    payload: { error: Error; }
  ): void {
    const delegate = this.ensureDelegate();
    delegate.batchFetchSnapshotsFailure(payload);
  },

  batchUpdateSnapshotsSuccess(
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void {
    const delegate = this.ensureDelegate();
    if (delegate.batchUpdateSnapshotsSuccess) {
      delegate.batchUpdateSnapshotsSuccess(subscribers, snapshots);
    } else {
      // Handle the case where batchUpdateSnapshotsSuccess is undefined
      console.error(
        "Delegate's batchUpdateSnapshotsSuccess is undefined. Cannot perform batch update."
      );
    }
  },

  batchUpdateSnapshotsFailure(
    date: Date, 
    snapshotId: string, 
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }

  ): void {
    const delegate = this.ensureDelegate();
    delegate.batchUpdateSnapshotsFailure(payload);
  },

  handleSnapshotSuccess(
    message: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotId: string
  ): void {
    // Ensure the snapshot is not null before proceeding
    if (snapshot) {
      // Perform actions required for handling the successful snapshot
      // For example, updating internal state, notifying subscribers, etc.
      SnapshotActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().handleTaskSnapshotSuccess({ message, snapshot, snapshotId });
      console.log(`Handling success for snapshot ID: ${snapshotId}`);
      // Implement additional logic here based on your application's needs
    }
    // No return statement needed since the method should return void
  },
};