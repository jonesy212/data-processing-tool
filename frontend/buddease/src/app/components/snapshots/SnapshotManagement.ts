 import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { Snapshot, Snapshots, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";

// SnapshotManagement interface for snapshot operations
export interface SnapshotManagement<T extends Data, K extends Data> {
  takeSnapshot(snapshot: Snapshot<T, K>): Promise<{ snapshot: Snapshot<T, K>; }>;
  updateSnapshot(snapshotId: string, data: Map<string, Snapshot<T, K>>, events: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<BaseData, BaseData>, K>[]>, snapshotStore: SnapshotStore<T, K>, dataItems: RealtimeDataItem[], newData: Snapshot<T, K>, payload: UpdateSnapshotPayload<T>, store: SnapshotStore<any, any>, callback: (snapshotStore: SnapshotStore<T, K>) => Promise<{ snapshot: Snapshot<T, K>; }>): Promise<{ snapshot: Snapshot<T, K> }>;
  mergeSnapshots(snapshots: Snapshots<T>, category: string): Promise<void>;
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
    snapshotData: Snapshot<T, K>,
    category: string | Category,
    categoryProperties: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K>) => void,
    snapshotDataStore?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K> | null,
    snapshotStoreConfigSearch?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>
  ) => Snapshot<T, K> | null;

  updateSnapshot: (
    snapshotId: string,
    data: Map<string, Snapshot<T, K>>,
    events: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<BaseData, BaseData>, K>[]>,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, K>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, any>,
    callback: (snapshotStore: SnapshotStore<T, K>) => Promise<{ snapshot: Snapshot<T, K> }>
  ) => Promise<{ snapshot: Snapshot<T, K> }>;

  // Other methods related to snapshot management
}