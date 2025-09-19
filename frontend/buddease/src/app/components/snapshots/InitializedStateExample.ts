// InitializedStateExample.ts

import { Snapshot } from ".";
import { UnsubscribeDetails } from "../../../data_analysis/frontend/buddease/src/app/components/event/DynamicEventHandlerExample";
import { CombinedEvents } from "../../../data_analysis/frontend/buddease/src/app/components/hooks/useSnapshotManager";
import { Category } from "../../../data_analysis/frontend/buddease/src/app/components/libraries/categories/generateCategoryProperties";
import { T } from "../../../data_analysis/frontend/buddease/src/app/components/models/data/dataStoreMethods";
import { RealtimeDataItem } from "../../../data_analysis/frontend/buddease/src/app/components/models/realtime/RealtimeData";
import { InitializedState, initializeState } from "../../../data_analysis/frontend/buddease/src/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import CalendarManagerStoreClass from "../../../data_analysis/frontend/buddease/src/app/components/state/stores/CalendarManagerStore";
import { SubscriberCallbackType } from "../../../data_analysis/frontend/buddease/src/app/components/subscriptions/Subscription";
import { SubscriberCollection } from "../../../data_analysis/frontend/buddease/src/app/components/users/SubscriberCollection";
import { category } from "../../../data_analysis/frontend/buddease/src/app/components/utils/snapshotUtils";
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from "../../../data_analysis/frontend/buddease/src/app/configs/BaseConfig";
import { StructuredMetadata } from "../../../data_analysis/frontend/buddease/src/app/configs/StructuredMetadata";
import { UpdateSnapshotPayload } from "../../../data_analysis/frontend/buddease/src/server/database/Payload";
import { SnapshotsArray } from "./LocalStorageSnapshotStore";
import { SnapshotContainer } from "./SnapshotContainer";
import { SnapshotData } from "./SnapshotData";
import { SnapshotEvents } from "./SnapshotEvents";
import { SnapshotIdentity } from "./SnapshotIdentity";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { AppEntity, AppK, AppMeta, AppExcludedFields } from "./snapshotStoreConfigInstance";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";

// Helper function to generate unique IDs
export function generateId(prefix: string = 'snapshot'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Type guards
export function isSnapshotIdentity<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(obj: any): obj is SnapshotIdentity<T, K, Meta, ExcludedFields> {
  return obj && (obj.id !== undefined || obj.snapshotId !== undefined);
}

export function hasValidSnapshotIdentity(obj: any): boolean {
  return isSnapshotIdentity(obj) && 
         (obj.id !== null && obj.id !== undefined) &&
         (obj.timestamp instanceof Date || 
          typeof obj.timestamp === 'string' || 
          typeof obj.timestamp === 'number');
}

// Example initial state
const initialState: InitializedState<AppEntity, AppK> = {};

const snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField> = {
  id: "",
  category: category,
  timestamp: new Date(),
  createdBy: "",
  description: "",
  tags: {},
  metadata: {},
  deleted: false,
  isCore: false,
  initialConfig: "",
  onInitialize: (callback: () => void) => {},
  
  taskIdToAssign: "",
  schema: "",
  currentCategory: "",
  mappedSnapshotData: {} as Map<string, Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>>,
 
  storeId: 0,
  versionInfo: "",
  initializedState: "",
  criteria: "",
 
  snapshotContainer: {} as SnapshotContainer<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
  config: {} as Promise<SnapshotStoreConfig<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>>,
  restoreSnapshot: (
    id: string,
    snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
    snapshotId: string,
    snapshotData: SnapshotData<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
    savedState: SnapshotStore<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
    category: Category | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<AppEntity, AppK, AppMeta>,
    type: string,
    event: string | SnapshotEvents<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
    subscribers: SubscriberCollection<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>
  ): void => { },
 
  meta: {} as StructuredMetadata<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
  mappedSnapshot: new Map<string, Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>>(),
  data: new Map<string, Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>>(),
  initialState: initializeState(initialState),
  events: {
    eventRecords: {},
    subscribers: [], // Assuming this is correctly typed elsewhere
    eventIds: [],
    callbacks: {
      snapshotAdded: [
        (snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>) => {
          console.log("Snapshot added:", snapshot);
        },
      ],
      snapshotRemoved: [
        (snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>) => {
          console.log("Snapshot removed:", snapshot);
        },
      ],
      // Add more event keys and their corresponding callback arrays as needed
    } as Record<string, ((snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>) => void)[]>,

    // Method to handle snapshot added event
    onSnapshotAdded: function (
      event: string,
      snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
      snapshotId: string,
      subscribers: SubscriberCollection<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
      snapshotStore: SnapshotStore<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
      dataItems: RealtimeDataItem<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>[],
      subscriberId: string,
      criteria: SnapshotWithCriteria<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
      category: Category
    ) {
      // const snapshotId = getSnapshotId(criteria)
      this.emit(
        "snapshotAdded",
        snapshot,
        String(snapshotId),
        subscribers,
        snapshotStore,
        dataItems,
        criteria,
        category
      );
    },

    // Method to handle snapshot removed event
    onSnapshotRemoved: function (
      event: string,
      snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
      snapshotId: string,
      subscribers: SubscriberCollection<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
      type: string,
      snapshotStore: SnapshotStore<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
      dataItems: RealtimeDataItem<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>[],
      criteria: SnapshotWithCriteria<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
      category: Category,
      snapshotData: SnapshotData<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>
    ) {
      this.emit(
        "snapshotRemoved",
        snapshot,
        String(snapshotId),
        subscribers,
        type,
        snapshotStore,
        dataItems,
        criteria,
        category,
        snapshotData
      );
    },
    // Method to handle snapshot updated event

    // Method to handle snapshot updated event
    onSnapshotUpdated: function (
      event: string,
      snapshotId: string,
      snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
      data: Map<string, Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>>,
      events: Record<string, CalendarManagerStoreClass<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>[]>,
      snapshotStore: SnapshotStore<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
      dataItems: RealtimeDataItem<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>[],
      newData: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
      payload: UpdateSnapshotPayload<AppEntity>,
      store: SnapshotStore<any, AppK>
    ) {
      console.log("Snapshot updated:", {
        snapshotId,
        data,
        events,
        snapshotStore,
        dataItems,
        newData,
        payload,
        store,
      });
    },

    // Method to subscribe to an event
    on: function (
      event: string,
      callback: (snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>) => void
    ) {
      if (!this.callbacks[event]) {
        this.callbacks[event] = [];
      }
      this.callbacks[event].push(callback);
    },

    // Method to unsubscribe from an event
    off: function (
      event: string,
      callback: (snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>) => void
    ) {
      if (this.callbacks[event]) {
        this.callbacks[event] = this.callbacks[event].filter(
          (cb) => cb !== callback
        );
      }
    },

    // Method to emit (trigger) an event
    emit: function (event: string, snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>) {
      if (this.callbacks[event]) {
        this.callbacks[event].forEach((callback) => callback(snapshot));
      }
    },

    // Method to subscribe to an event once
    once: function (
      event: string,
      callback: (snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>) => void
    ) {
      const onceCallback = (snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>) => {
        callback(snapshot);
        this.off(event, onceCallback);
      };
      this.on(event, onceCallback);
    },

    addRecord: function (
      event: string,
      record: CalendarManagerStoreClass<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
      callback: (snapshot: CalendarManagerStoreClass<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>) => void
    ) {
      // Ensure eventRecords is not null
      if (this.eventRecords === null) {
        this.eventRecords = {}; // Initialize eventRecords if it is null
      }

      if (!this.eventRecords[event]) {
        this.eventRecords[event] = [];
      }

      this.eventRecords[event].push(record);
      callback(record);
    },

    // Method to remove all event listeners
    removeAllListeners: function (event?: string) {
      if (event) {
        delete this.callbacks[event];
      } else {
        this.callbacks = {} as Record<
          string,
          ((snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>) => void)[]
        >;
      }
    },

    // Method to subscribe to an event (alias for on)
    subscribe: function (
      event: string,
      callback: (snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>) => void
    ) {
      this.on(event, callback);
    },

      // Method to unsubscribe from an event (alias for off)
    unsubscribe: function (
      event: string,
      snapshotId: number,
      unsubscribeDetails: UnsubscribeDetails,
      callback: SubscriberCallbackType<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField> | null
    ) {
      // You'll need to implement the actual off method with these parameters
      // For now, this is a placeholder implementation
      if (this.callbacks[event]) {
        this.callbacks[event] = this.callbacks[event].filter(
          (cb) => cb !== callback
        );
      }
    },

    // Method to trigger an event (alias for emit)
    trigger: function (
      event: string | CombinedEvents<AppEntity, AppK> | SnapshotEvents<AppEntity, AppK>,
      snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
      snapshotId: string,
      subscribers: SubscriberCollection<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>
    ) {
      // You'll need to implement the actual emit method with these parameters
      // For now, this is a placeholder implementation
      if (typeof event === 'string' && this.callbacks[event]) {
        this.callbacks[event].forEach((callback) => callback(snapshot));
      }
    },
  },
}