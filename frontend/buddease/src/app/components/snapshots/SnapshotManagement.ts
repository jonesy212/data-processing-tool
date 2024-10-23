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
export interface SnapshotManagement<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  takeSnapshot(snapshot: Snapshot<T, Meta, K>): Promise<{ snapshot: Snapshot<T, Meta, K>; }>;
  updateSnapshot(snapshotId: string, data: Map<string, Snapshot<T, Meta, K>>, events: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<BaseData, Meta, BaseData>, K>[]>, snapshotStore: SnapshotStore<T, Meta, K>, dataItems: RealtimeDataItem[], newData: Snapshot<T, Meta, K>, payload: UpdateSnapshotPayload<T>, store: SnapshotStore<any, any>, callback: (snapshotStore: SnapshotStore<T, Meta, K>) => Promise<{ snapshot: Snapshot<T, Meta, K>; }>): Promise<{ snapshot: Snapshot<T, Meta, K> }>;
  mergeSnapshots(snapshots: Snapshots<T, Meta>, category: string): Promise<void>;
  reduceSnapshots<U>(callback: (acc: U, snapshot: Snapshot<T, Meta, K>) => U, initialValue: U): U;
  filterSnapshots(predicate: (snapshot: Snapshot<T, Meta, K>) => boolean): Snapshot<T, Meta, K>[];
  findSnapshot(predicate: (snapshot: Snapshot<T, Meta, K>) => boolean): Snapshot<T, Meta, K> | undefined;

  // Snapshot Management
  getSnapshotById: (
    snapshot: (
      id: string
    ) => Promise<{
      category: Category;
      timestamp: string | number | Date | undefined;
      id: string | number | undefined;
      snapshot: Snapshot<T, Meta, K>;
      snapshotStore: SnapshotStore<T, Meta, K>;
      data: T;
    }> | undefined
  ) => Promise<Snapshot<T, Meta, K> | null>;

  createSnapshot: (
    id: string,
    snapshotData: SnapshotData<T, Meta, K>,
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, Meta, K>) => void,
    SnapshotData?: SnapshotStore<T, Meta, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, Meta, K> | null,
    snapshotStoreConfigSearch?: SnapshotStoreConfig<SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>,
  ) => Snapshot<T, Meta, K> | null;

  updateSnapshot: (
    snapshotId: string,
    data: Map<string, Snapshot<T, Meta, K>>,
    events: Record<string, CalendarManagerStoreClass<SnapshotWithCriteria<BaseData, Meta, BaseData>, K>[]>,
    snapshotStore: SnapshotStore<T, Meta, K>,
    dataItems: RealtimeDataItem[],
    newData: Snapshot<T, Meta, K>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, any>,
    callback: (snapshotStore: SnapshotStore<T, Meta, K>) => Promise<{ snapshot: Snapshot<T, Meta, K> }>
  ) => Promise<{ snapshot: Snapshot<T, Meta, K> }>;

  // Other methods related to snapshot management
}