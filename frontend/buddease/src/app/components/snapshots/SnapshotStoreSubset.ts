import { SnapshotData } from '@/app/components/snapshots';
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { NotificationType } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { Payload, Snapshot, Snapshots, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";
import { SnapshotOperation } from "./SnapshotActions";
import { CustomSnapshotData } from "./SnapshotData";
import SnapshotStore from "./SnapshotStore";

import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";

// // SnapshotStoreSubset.ts
interface SnapshotStoreSubset<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  snapshotId: string | null;
  taskIdToAssign: Snapshot<T, K> | undefined;

  // Adds a snapshot, handling a new snapshot and a list of subscribers.
  addSnapshot: (snapshot: Omit<Snapshot<T, K>, "id">, subscribers: Subscriber<T, K>[]) => void;

  // Handles snapshot configuration with a snapshot and a list of configurations.
  onSnapshot: (snapshot: Snapshot<T, K>,
    config: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K, Meta>[]
      
  ) => void;

  // Called when a snapshot is successfully added.
  addSnapshotSuccess: (snapshot: Snapshot<T, K>, subscribers: Subscriber<T, K>[]) => void;

  // Updates a snapshot and handles various data and event parameters.
  updateSnapshot: (
    snapshotId: string,
    data: SnapshotStore<T, K>,
    events: Record<string, CalendarManagerStoreClass<T, K>[]>,
    snapshotStore: SnapshotStore<T, K>,
    dataItems: RealtimeDataItem[],
    newData: T | Data,
    payload: UpdateSnapshotPayload<T>
  ) => Promise<{ snapshot: SnapshotStore<T, K>[] }>;

  // Removes a snapshot by ID.
  removeSnapshot: (snapshotId: string) => void;

  // Clears all snapshots.
  clearSnapshots: () => void;

  // Initializes a snapshot with various possible data types.
  createInitSnapshot: (snapshotData: SnapshotData<T, K> | Snapshot<BaseData> | null | undefined) => void;

  // Called when a snapshot creation is successful.
  createSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;

  // Called when a snapshot creation fails.
  createSnapshotFailure: (snapshot: Snapshot<T, K>, error: any) => Promise<void>;

  // Updates multiple snapshots and returns a result.
  updateSnapshots: (snapshots: Snapshots<T, K>) => Promise<any>;

  // Called when a snapshot update is successful.
  updateSnapshotSuccess: (
    snapshot: Snapshot<T, K>
  ) => Promise<{
    id: string;
    data: {
      createdAt: Date;
      updatedAt: Date;
      category?: string | Category;
      getData?: (id: number) => Promise<T | undefined>;
    };
    timestamp: Date;
    category: string;
    length: number;
    content: undefined;
  } | undefined>;

  // Called when a snapshot update fails.
  updateSnapshotFailure: (error: Payload) => void;

  // Called when all snapshots are updated successfully.
  updateSnapshotsSuccess: () => void;

  // Called when updating snapshots fails.
  updateSnapshotsFailure: (error: Payload) => void;

  // Initializes a snapshot with specific configuration and data.
  initSnapshot: (snapshotStore: SnapshotStoreConfig<BaseData, BaseData>, snapshotData: SnapshotData<BaseData>) => void;

  // Takes a snapshot and returns a list of BaseData or null.
  takeSnapshot: (updatedSnapshots: Snapshot<T, K>) => Promise<BaseData[] | null>;

  // Called when a snapshot is successfully taken.
  takeSnapshotSuccess: (snapshot: Snapshot<T, K>) => void;

  // Called when multiple snapshots are successfully taken.
  takeSnapshotsSuccess: (snapshots: Snapshot<T, K>[]) => void;

  // Configures the snapshot store with a specific configuration.
  configureSnapshotStore: (snapshotConfigStore: SnapshotStoreConfig<T, Data>) => void;

  // Gets the current data.
  getData: () => T | null;

  // Sets the data.
  setData: (data: T) => void;

  // Gets the current state.
  getState: () => any;

  // Sets the state.
  setState: (state: any) => void;

  // Validates a snapshot against certain criteria.
  validateSnapshot: (snapshot: Snapshot<T>) => boolean;

  // Handles a snapshot, potentially with null and ID.
  handleSnapshot: (snapshot: Snapshot<T> | null, snapshotId: string) => void;

  // Handles various actions related to snapshots.
  handleActions: (action: any) => void;

  // Sets a snapshot.
  setSnapshot: (snapshot: Snapshot<T, K>) => void;

  // Sets multiple snapshots.
  setSnapshots: (snapshots: Snapshots<T, K>) => void;

  // Clears a snapshot by ID.
  clearSnapshot: (snapshotId: string) => void;

  // Merges multiple snapshots into one.
  mergeSnapshots: (snapshots: Snapshots<T, K>,  category: string) => void;

  // Reduces a collection of snapshots to a single value.
  reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<T, K>) => U, initialValue: U) => U;

  // Sorts snapshots using a comparison function.
  sortSnapshots: (compareFn: (a: Snapshot<T, K>, b: Snapshot<T, K>) => number) => void;

  // Filters snapshots based on a predicate.
  filterSnapshots: (predicate: (snapshot: Snapshot<T, K>) => boolean) => Snapshot<T, K>[];

  // Maps snapshots to a new form using a callback function.
  mapSnapshots: <U>(callback: (snapshot: Snapshot<T, K>) => U) => U[];

  // Finds a snapshot that matches a predicate.
  findSnapshot: (predicate: (snapshot: Snapshot<T, K>) => boolean) => Snapshot<T, K> | undefined;

  // Gets subscribers related to a snapshot.
  getSubscribers: (subscribers: Subscriber<T, K>[], snapshots: Snapshot<T, K>) => void;

  // Sends a notification.
  notify: (id: string, message: string, content: any, date: Date, type: NotificationType) => void;

  // Notifies subscribers with specific data.
  notifySubscribers: (subscribers: Subscriber<T, K>[], data: CustomSnapshotData | Snapshot<BaseData>) => Promise<T>;

  // Subscribes to snapshot updates.
  subscribe: () => void;

  // Unsubscribes from snapshot updates.
  unsubscribe: () => void;

  // Fetches a snapshot by ID.
  fetchSnapshot: (id: string) => Promise<Snapshot<T, any>>;

  // Called when a snapshot is successfully fetched.
  fetchSnapshotSuccess: (snapshot: Snapshot<T> | null, snapshotId: string) => void;

  // Called when fetching a snapshot fails.
  fetchSnapshotFailure: () => void;

  // Gets a snapshot by ID.
  getSnapshot: (id: string) => Snapshot<T, K> | undefined;

  // Gets snapshots with optional category and filter.
  getSnapshots: (category?: string, filter?: (snapshot: Snapshot<T, K>) => boolean) => Promise<Snapshots<T, K>>;

  // Gets all snapshots with optional filter.
  getAllSnapshots: (filter?: (snapshot: Snapshot<T, K>) => boolean) => Promise<Snapshots<T, K>>;

  // Generates a unique ID.
  generateId: () => string;

  // Batch fetches snapshots.
  batchFetchSnapshots: () => Promise<Snapshots<T, K>>;

  // Requests to batch take snapshots.
  batchTakeSnapshotsRequest: () => Promise<void>;

  // Requests to batch update snapshots.
  batchUpdateSnapshotsRequest: () => Promise<void>;

  // Called when batch fetching snapshots succeeds.
  batchFetchSnapshotsSuccess: (snapshots: Snapshots<T, K>) => void;

  // Called when batch fetching snapshots fails.
  batchFetchSnapshotsFailure: (error: any) => void;

  // Called when batch updating snapshots succeeds.
  batchUpdateSnapshotsSuccess: (snapshots: Snapshots<T, K>) => void;

  // Called when batch updating snapshots fails.
  batchUpdateSnapshotsFailure: (error: any) => void;

  // Takes multiple snapshots in a batch.
  batchTakeSnapshot: () => Promise<void>;

  // Handles snapshot operations.
  handleSnapshotOperation: (action: SnapshotOperation) => void;

  // Gets a custom store for snapshots.
  getCustomStore: () => SnapshotStore<T, K>;
}


export default SnapshotStoreSubset;