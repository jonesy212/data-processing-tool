import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { NotificationType } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { Payload, Snapshot, Snapshots, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";
import { SnapshotOperation } from "./SnapshotActions";
import { CustomSnapshotData } from "./SnapshotData";
import SnapshotStore from "./SnapshotStore";

import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";

// // SnapshotStoreSubset.ts
interface SnapshotStoreSubset<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
  snapshotId: string | null;
  taskIdToAssign: Snapshot<T, Meta, K> | undefined;

  // Adds a snapshot, handling a new snapshot and a list of subscribers.
  addSnapshot: (snapshot: Omit<Snapshot<T, Meta, K>, "id">, subscribers: Subscriber<T, Meta, K>[]) => void;

  // Handles snapshot configuration with a snapshot and a list of configurations.
  onSnapshot: (snapshot: Snapshot<T, Meta, K>,
    config: SnapshotStoreConfig<SnapshotWithCriteria<any, Meta, BaseData>, Meta, K>[]
      
  ) => void;

  // Called when a snapshot is successfully added.
  addSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>, subscribers: Subscriber<T, Meta, K>[]) => void;

  // Updates a snapshot and handles various data and event parameters.
  updateSnapshot: (
    snapshotId: string,
    data: SnapshotStore<T, Meta, K>,
    events: Record<string, CalendarManagerStoreClass<T, Meta, K>[]>,
    snapshotStore: SnapshotStore<T, Meta, K>,
    dataItems: RealtimeDataItem[],
    newData: T | Data,
    payload: UpdateSnapshotPayload<T>
  ) => Promise<{ snapshot: SnapshotStore<T, Meta, K>[] }>;

  // Removes a snapshot by ID.
  removeSnapshot: (snapshotId: string) => void;

  // Clears all snapshots.
  clearSnapshots: () => void;

  // Initializes a snapshot with various possible data types.
  createInitSnapshot: (snapshotData: SnapshotData<T, Meta, K> | Snapshot<BaseData> | null | undefined) => void;

  // Called when a snapshot creation is successful.
  createSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;

  // Called when a snapshot creation fails.
  createSnapshotFailure: (snapshot: Snapshot<T, Meta, K>, error: any) => Promise<void>;

  // Updates multiple snapshots and returns a result.
  updateSnapshots: (snapshots: Snapshots<T, Meta>) => Promise<any>;

  // Called when a snapshot update is successful.
  updateSnapshotSuccess: (
    snapshot: Snapshot<T, Meta, K>
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
  initSnapshot: (snapshotStore: SnapshotStoreConfig<BaseData, Meta, BaseData>, snapshotData: SnapshotData<BaseData>) => void;

  // Takes a snapshot and returns a list of BaseData or null.
  takeSnapshot: (updatedSnapshots: Snapshot<T, Meta, K>) => Promise<BaseData[] | null>;

  // Called when a snapshot is successfully taken.
  takeSnapshotSuccess: (snapshot: Snapshot<T, Meta, K>) => void;

  // Called when multiple snapshots are successfully taken.
  takeSnapshotsSuccess: (snapshots: Snapshot<T, Meta, K>[]) => void;

  // Configures the snapshot store with a specific configuration.
  configureSnapshotStore: (snapshotConfigStore: SnapshotStoreConfig<T, Meta, Data>) => void;

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
  setSnapshot: (snapshot: Snapshot<T, Meta, K>) => void;

  // Sets multiple snapshots.
  setSnapshots: (snapshots: Snapshots<T, Meta>) => void;

  // Clears a snapshot by ID.
  clearSnapshot: (snapshotId: string) => void;

  // Merges multiple snapshots into one.
  mergeSnapshots: (snapshots: Snapshots<T, Meta>) => void;

  // Reduces a collection of snapshots to a single value.
  reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<T, Meta, K>) => U, initialValue: U) => U;

  // Sorts snapshots using a comparison function.
  sortSnapshots: (compareFn: (a: Snapshot<T, Meta, K>, b: Snapshot<T, Meta, K>) => number) => void;

  // Filters snapshots based on a predicate.
  filterSnapshots: (predicate: (snapshot: Snapshot<T, Meta, K>) => boolean) => Snapshot<T, Meta, K>[];

  // Maps snapshots to a new form using a callback function.
  mapSnapshots: <U>(callback: (snapshot: Snapshot<T, Meta, K>) => U) => U[];

  // Finds a snapshot that matches a predicate.
  findSnapshot: (predicate: (snapshot: Snapshot<T, Meta, K>) => boolean) => Snapshot<T, Meta, K> | undefined;

  // Gets subscribers related to a snapshot.
  getSubscribers: (subscribers: Subscriber<T, Meta, K>[], snapshots: Snapshot<T, Meta, K>) => void;

  // Sends a notification.
  notify: (id: string, message: string, content: any, date: Date, type: NotificationType) => void;

  // Notifies subscribers with specific data.
  notifySubscribers: (subscribers: Subscriber<T, Meta, K>[], data: CustomSnapshotData | Snapshot<BaseData>) => Promise<T>;

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
  getSnapshot: (id: string) => Snapshot<T, Meta, K> | undefined;

  // Gets snapshots with optional category and filter.
  getSnapshots: (category?: string, filter?: (snapshot: Snapshot<T, Meta, K>) => boolean) => Promise<Snapshots<T, Meta>>;

  // Gets all snapshots with optional filter.
  getAllSnapshots: (filter?: (snapshot: Snapshot<T, Meta, K>) => boolean) => Promise<Snapshots<T, Meta>>;

  // Generates a unique ID.
  generateId: () => string;

  // Batch fetches snapshots.
  batchFetchSnapshots: () => Promise<Snapshots<T, Meta>>;

  // Requests to batch take snapshots.
  batchTakeSnapshotsRequest: () => Promise<void>;

  // Requests to batch update snapshots.
  batchUpdateSnapshotsRequest: () => Promise<void>;

  // Called when batch fetching snapshots succeeds.
  batchFetchSnapshotsSuccess: (snapshots: Snapshots<T, Meta>) => void;

  // Called when batch fetching snapshots fails.
  batchFetchSnapshotsFailure: (error: any) => void;

  // Called when batch updating snapshots succeeds.
  batchUpdateSnapshotsSuccess: (snapshots: Snapshots<T, Meta>) => void;

  // Called when batch updating snapshots fails.
  batchUpdateSnapshotsFailure: (error: any) => void;

  // Takes multiple snapshots in a batch.
  batchTakeSnapshot: () => Promise<void>;

  // Handles snapshot operations.
  handleSnapshotOperation: (action: SnapshotOperation) => void;

  // Gets a custom store for snapshots.
  getCustomStore: () => SnapshotStore<T, Meta, K>;
}


export default SnapshotStoreSubset;