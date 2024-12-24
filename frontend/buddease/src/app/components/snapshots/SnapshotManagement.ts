import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData } from "../models/data/Data";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { Snapshot, Snapshots, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";
import { SnapshotData } from "./SnapshotData";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";

// SnapshotManagement interface for snapshot operations
export interface SnapshotManagement<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  takeSnapshot(snapshot: Snapshot<T, K>): Promise<{ snapshot: Snapshot<T, K>; }>;
  updateSnapshot(
    snapshotId: string, 
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<BaseData, BaseData>, K, Meta>[]>,
    snapshotStore: SnapshotStore<T, K>, 
    dataItems: RealtimeDataItem[], 
    newData: Snapshot<T, K>, 
    payload: UpdateSnapshotPayload<T>, 
    store: SnapshotStore<any, any>,
    callback: (snapshotStore: SnapshotStore<T, K>
    ) => Promise<{ snapshot: Snapshot<T, K>; }>): Promise<{ snapshot: Snapshot<T, K> }>;
  mergeSnapshots(snapshots: Snapshots<T, K>, category: string): Promise<void>;
  reduceSnapshots<U>(callback: (acc: U, snapshot: Snapshot<T, K>) => U, initialValue: U): U;
  filterSnapshots(predicate: (snapshot: Snapshot<T, K>) => boolean): Snapshot<T, K>[];
  findSnapshot(predicate: (snapshot: Snapshot<T, K>) => boolean): Snapshot<T, K> | undefined;

  // Snapshot Management
  getSnapshotById: (
    snapshot: (
      id: string
    ) => Promise<{
      category: Category;
      timestamp: string | number | Date | undefined;
      id: string | number | undefined;
      snapshot: Snapshot<T, K>;
      snapshotStore: SnapshotStore<T, K>;
      data: T;
    }> | undefined
  ) => Promise<Snapshot<T, K> | null>;

  createSnapshot: (
    id: string,
    snapshotData: SnapshotData<T, K>,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K>) => void,
    snapshotData?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | null,
    snapshotStoreConfigSearch?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K, Meta>,
  ) => Snapshot<T, K> | null;

  updateSnapshots(
    snapshotsToUpdate: Snapshot<T, K>[], // Array of snapshots to be updated
    data: Map<string, Snapshot<T, K>>, // Map of existing data
    events: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<BaseData, BaseData>, K, Meta>[]>, // Event records
    snapshotStore: SnapshotStore<T, K>, // SnapshotStore instance
    dataItems: RealtimeDataItem[], // Data items for updates
    payload: UpdateSnapshotPayload<T>, // Payload with additional update data
    store: SnapshotStore<any, any>, // Additional SnapshotStore for shared operations
    callback: (snapshotStore: SnapshotStore<T, K>) => Promise<{ snapshot: Snapshot<T, K>; }> // Callback function
  ): Promise<{ snapshots: Snapshot<T, K>[] }>; // Return type with updated snapshots

  // Other methods related to snapshot management
}