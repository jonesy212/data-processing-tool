import { SnapshotData } from '@/app/snapshots';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";

import { NotificationType } from '@/app/context/NotificationContext';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { BaseData, Data } from '@/app/models/data/Data';
import { Snapshots, SnapshotUnion } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { Subscriber } from "@/app/subscribers/Subscriber";
import { RealtimeDataItem } from "@/app/typings/realtimeTypes";
import {
  Payload,
  UpdateSnapshotPayload
} from "@/app/server/database/Payload";
import { SnapshotOperation } from "../actions/SnapshotActions";
import { CustomSnapshotData } from "./SnapshotData";
import SnapshotStore from "./SnapshotStore";

import { DataStore } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";

import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotContext } from '@/app/snapshots/SnapshotSubscriberManagement';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { CategoryProperties } from '@/pages/personas/ScenarioBuilder';

// SnapshotStoreSubset.ts
interface SnapshotStoreSubset<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  snapshotId: string | null;
  taskIdToAssign: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

  // Adds a snapshot, handling a new snapshot and a list of subscribers.
  addSnapshot: (snapshot: Omit<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "id">, subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void;

  // Handles snapshot configuration with a snapshot and a list of configurations.
  onSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  config: SnapshotStoreConfig<
        SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        DefaultMeta<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
        SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
      >[]      
    ) => void;

  // Called when a snapshot is successfully added.
  addSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void;

  // Updates a snapshot and handles various data and event parameters.
  updateSnapshot: (
    snapshotId: string,
    data: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newData: T | Data<T, K, Meta, Attachment, ExcludedFields>,
    payload: UpdateSnapshotPayload<T>
  ) => Promise<{ snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }>;

  // Removes a snapshot by ID.
  removeSnapshot: (snapshotId: string) => void;

  // Clears all snapshots.
  clearSnapshots: () => void;

  // Initializes a snapshot with various possible data types.
  createInitSnapshot: (snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<BaseData> | null | undefined) => void;

  // Called when a snapshot creation is successful.
  createSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, storeId: number) => void;

  // Called when a snapshot creation fails.
  createSnapshotFailure: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, error: any) => Promise<void>;

  // Updates multiple snapshots and returns a result.
  updateSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<any>;

  // Called when a snapshot update is successful.
  updateSnapshotSuccess: (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
  takeSnapshot: (updatedSnapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<BaseData[] | null>;

  // Called when a snapshot is successfully taken.
  takeSnapshotSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  // Called when multiple snapshots are successfully taken.
  takeSnapshotsSuccess: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void;

  // Configures the snapshot store with a specific configuration.
  configureSnapshotStore: (snapshotConfigStore: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

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
  setSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  // Sets multiple snapshots.
  setSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  // Clears a snapshot by ID.
  clearSnapshot: (snapshotId: string) => void;

  // Merges multiple snapshots into one.
  mergeSnapshots: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,  category: string) => void;

  // Reduces a collection of snapshots to a single value.
  reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => U, initialValue: U) => U;

  // Sorts snapshots using a comparison function.
  sortSnapshots: (compareFn: (a: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, b: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => number) => void;

  // Filters snapshots based on a predicate.
  filterSnapshots: (predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  // Maps snapshots to a new form using a callback function.
  mapSnapshots: <U>(callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => U) => U[];

  // Finds a snapshot that matches a predicate.
  findSnapshot: (predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

  // Gets subscribers related to a snapshot.
  getSubscribers: (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  // Sends a notification.
  notify: (id: string, message: string, content: any, date: Date, type: NotificationType) => void;

  // Notifies subscribers with specific data.
  notifySubscribers: (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], data: CustomSnapshotData<T, K, Meta, Attachment, keyof T> | Snapshot<BaseData>) => Promise<T>;

  // Subscribes to snapshot updates.
  subscribe: () => void;

  // Unsubscribes from snapshot updates.
  unsubscribe: () => void;

  // Fetches a snapshot by ID.
  fetchSnapshot: (id: string) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  // Called when a snapshot is successfully fetched.
  fetchSnapshotSuccess: (snapshot: Snapshot<T> | null, snapshotId: string) => void;

  // Called when fetching a snapshot fails.
  fetchSnapshotFailure: () => void;

  // Gets a snapshot by ID.
  getSnapshot: (id: string) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;

  // Gets snapshots with optional category and filter.
  getSnapshots: (category?: string, filter?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean) => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  // Gets all snapshots with optional filter.
    getAllSnapshots: (
      storeId: number,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      ctx: SnapshotContext<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
        timestamp: string;
        type: string;
        id: number;
        categoryProperties?: CategoryProperties;
        dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        data: T;
      },
      filter?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean,
      dataCallback?: (
        subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      ) => Promise<SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>
    ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;

  // Generates a unique ID.
  generateId: () => string;

  // Batch fetches snapshots.
  batchFetchSnapshots: () => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

  // Requests to batch take snapshots.
  batchTakeSnapshotsRequest: () => Promise<void>;

  // Requests to batch update snapshots.
  batchUpdateSnapshotsRequest: () => Promise<void>;

  // Called when batch fetching snapshots succeeds.
  batchFetchSnapshotsSuccess: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  // Called when batch fetching snapshots fails.
  batchFetchSnapshotsFailure: (error: any) => void;

  // Called when batch updating snapshots succeeds.
  batchUpdateSnapshotsSuccess: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  // Called when batch updating snapshots fails.
  batchUpdateSnapshotsFailure: (error: any) => void;

  // Takes multiple snapshots in a batch.
  batchTakeSnapshot: () => Promise<void>;

  // Handles snapshot operations.
  handleSnapshotOperation: (action: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;

  // Gets a custom store for snapshots.
  getCustomStore: () => SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}


export default SnapshotStoreSubset;