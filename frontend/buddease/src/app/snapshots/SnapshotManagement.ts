import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { BaseData } from "@/app/models/data/Data";
import { RealtimeDataItem } from "@/app/models/realtime/RealtimeData";
import { Snapshot, Snapshots, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";
import { SnapshotData } from "./SnapshotData";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";

// SnapshotManagement interface for snapshot operations
export interface SnapshotManagement<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> {
  takeSnapshot(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }>;
  updateSnapshot(
    snapshotId: string, 
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<BaseData, BaseData>, K, Meta>[]>,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>, 
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[], 
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    payload: UpdateSnapshotPayload<T>, 
    store: SnapshotStore<any, any>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>
    ) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }>): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>;
  mergeSnapshots(snapshots: Snapshots<T, K, Meta, ExcludedFields>, category: string): Promise<void>;
  reduceSnapshots<U>(callback: (acc: U, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => U, initialValue: U): U;
  filterSnapshots(predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  findSnapshot(predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

  // Snapshot Management
  getSnapshotById: (
    snapshot: (
      id: string
    ) => Promise<{
      category: Category;
      timestamp: string | number | Date | undefined;
      id: string | number | undefined;
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>;
      data: T;
    }> | undefined
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;

  createSnapshot: (
    id: string,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    category: Category | undefined,    categoryProperties: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotData?: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    snapshotStoreConfigSearch?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K, Meta>,
  ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  updateSnapshots(
    snapshotsToUpdate: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Array of snapshots to be updated
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, // Map of existing data
    events: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<BaseData, BaseData>, K, Meta>[]>, // Event records
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>, // SnapshotStore instance
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[], // Data items for updates
    payload: UpdateSnapshotPayload<T>, // Payload with additional update data
    store: SnapshotStore<any, any>, // Additional SnapshotStore for shared operations
    callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> // Callback function
  ): Promise<{ snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }>; // Return type with updated snapshots

  // Other methods related to snapshot management
}