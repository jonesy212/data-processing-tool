// snapshots/SnapshotSlice.ts
import { SnapshotManager, useSnapshotManager } from "@/app/hooks/useSnapshotManager";
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { BaseData, Data } from '@/app/models/data/Data';
import { NotificationPosition, StatusType } from "@/app/models/data/StatusType";
import { RealtimeDataItem } from "@/app/models/realtime/RealtimeData";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { DataStore } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { DataStoreMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { Callback, snapshot, SnapshotConfig, SnapshotData, SnapshotWithCriteria } from "@/app/snapshots";
import { Snapshot, Snapshots } from "@/app/snapshots/LocalStorageSnapshotStore";
import { ConfigureSnapshotStorePayload } from "@/app/snapshots/SnapshotConfig";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { CreateSnapshotsPayload, Payload } from '@/server/database/Payload';

import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { NotificationType } from "@/app/context/NotificationContext";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { Content } from "@/app/models/content/AddContent";
import { K, Meta, T } from "@/app/models/data/dataStoreMethods";
import { WritableDraft } from "@/app/ReducerGenerator";
import { ExcludedFields } from "@/app/routing/Fields";
import { FetchSnapshotPayload } from "@/app/snapshots/FetchSnapshotPayload";
import { getSnapshotItems } from "@/app/snapshots/snapshotOperations";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { SubscriberCollection } from "@/app/users/SubscriberCollection";
import { sendNotification } from "@/app/users/UserSlice";
import { findCorrectSnapshotStore, isSnapshot } from "@/app/utils/snapshotUtils";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Subscription } from "react-redux";
import { Tag } from "sanitize-html";


interface SnapshotState {
  snapshotId: string;
  snapshotStores: SnapshotStore<BaseData, BaseData>[];
  snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  loading: boolean;
  error: string | null;
  storeId: number
}

const initialState: SnapshotState = {
  snapshotId: "initial-id",
  snapshots: [],
  loading: false,
  error: null,
  snapshotStores: [],
  storeId: 0
};

type PayloadActionWithMeta<T, M = never> = PayloadAction<T, string, M>;



// Async function to fetch DataStore list based on context
export const getDelegate = async (context: {
  useSimulatedDataSource: boolean;
  simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}): Promise<DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  const dataSource = context.useSimulatedDataSource
    ? context.simulatedDataSource
    : await fetchRealDataSource();

  return dataSource.map((config) => initializeDataStore(config));
};

// Async thunk to call getDelegate and handle state updates
export const fetchDataStores = createAsyncThunk(
  'snapshot/fetchDataStores',
  async (context: { useSimulatedDataSource: boolean; simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }) => {
    return await getDelegate(context);
  }
);



// Create an async thunk
export const batchFetchSnapshots = createAsyncThunk(
  'snapshot/batchFetchSnapshots',
  async ({ startDate, endDate, storeId, meta }: { 
    startDate: Date; 
    endDate: Date; 
    storeId: number; 
    meta: Meta 
  }, thunkAPI) => {
    try {
      const snapshotManager = useSnapshotManager;
      const subscribers = snapshotManager(storeId);
      
      const baseSnapshot = await createCompleteSnapshot<T, K, Meta, Attachment, ExcludedFields>(
        entity, // You'll need to define where 'entity' comes from
        new Map(),
        'mock-snapshot-id',
        undefined,
        store,   // You'll need to define where 'store' comes from
        null,
        null,
        false,
        storeProps, // You'll need to define where 'storeProps' comes from
        {}
      );
      
      return { baseSnapshot, meta };
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);


const useSnapshotSlice = createSlice({
  name: "snapshot",
  initialState,
  reducers: {
    addSnapshot: (
      state,
      action: PayloadActionWithMeta<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
    ) => {
      if (isSnapshot(action.payload)) {
        const correctStore = findCorrectSnapshotStore(
          action.payload,
          state.snapshotStores as SnapshotStore<BaseData, BaseData>[]        );
        if (correctStore) {
          correctStore.snapshots.push(action.payload);
        } else {
          state.error = 'No matching snapshot store found';
        }
      } else {
        state.error = 'Snapshot data does not match expected type';
      }
    },
    removeSnapshot: (
      state,
      action: PayloadAction<string>
    ) => {
      state.snapshots = state.snapshots.filter(
        (snapshot) => snapshot.id !== action.payload
      );
    },

    clearSnapshots: (state) => {
      state.snapshots = [];
    },

    clearSnapshot: (state, action: PayloadAction<string>) => {
      const snapshotToRemove = state.snapshots.find(
        (snapshot) => snapshot.id === action.payload
      );
      if (snapshotToRemove) {
        snapshotToRemove.data = {} as Map<string, WritableDraft<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>
      }
    },

    updateSnapshot: (
      state,
      action: PayloadAction<{ id: string; newData: any }>
    ) => {
      const { id, newData } = action.payload;
      const snapshotToUpdate = state.snapshots.find(
        (snapshot) => snapshot.id === id
      );
      if (snapshotToUpdate) {
        snapshotToUpdate.data = newData;
      }
    },

    

    batchRemoveSnapshotsRequest: <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
      state, // Specify state type here
      action: PayloadAction<{ startDate: Date; endDate: Date }>
    ) => {

      const snapshotManager = useSnapshotManager;
      const subscribers = snapshotManager(state.storeId)

      state.loading = true;
      state.error = null;

      const notifySubscribers = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
        subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
      ) => {
        const { startDate, endDate } = action.payload;
        const snapshots = state.snapshots.filter(
          (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) =>
            snapshot.date &&
            (snapshot.updateSnapshotFailure?.date
              ? snapshot.addSnapshotFailure.date >= startDate && snapshot.date <= endDate
              : snapshot.date >= startDate && snapshot.date <= endDate)
        );
        if (snapshots.length > 0) {
          for (const snapshot of snapshots) {
            for (const subscriber of subscribers) {
              if (subscriber.getData() && subscriber.getData().name) {
                const recipient = subscriber.getData()?.name ?? 'Unknown Recipient';
                sendNotification({
                  message: `Snapshot removed: ${snapshot.id}`,
                  recipient: subscriber.getData().name,
                  snapshot: JSON.parse(JSON.stringify(snapshot.data)),
                });
              }
            }
          }
        }
      };
      notifySubscribers(subscribers)
    },

    batchFetchSnapshotsRequest: (
      state,
      action: PayloadAction<{ startDate: Date; endDate: Date; storeId: number, meta: Meta }>
    ) => {
      const { startDate, endDate, storeId } = action.payload;
   
      const snapshotManager = useSnapshotManager;
      const subscribers = snapshotManager(storeId)


      state.loading = true;
      state.error = null;

      const notifySubscribers = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
        subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        action: PayloadAction<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>
      ) => {
        const { snapshot, subscriber } = action.payload;
        const recipient = subscriber.getData()?.name;

        if (snapshot.id && recipient) {
          const snapshotData = state.snapshots.find(
            (s) => s.id === snapshot.id
          )?.data;
          
          if (snapshotData) {
            sendNotification({
              message: `New snapshot received: ${snapshot.id}`,
              recipient,
              snapshot: JSON.parse(JSON.stringify(snapshotData)),
            });
          }
        }
      }
  
      // Fetch snapshots from database or API
      // Ensure you can access 'meta' like 'action.meta.notify'
      if (action.meta?.notify) {
        // Additional logic if 'notify' is true
      }
      // Define WritableDraft to make T properties writable
      type WritableDraft<T> = {
        -readonly [P in keyof T]: T[P];
      };

      
      
      //   {
      //     id: "2",
      //   data: {
      //     assignee: {
      //       name: "user_2",
      //       email: "<EMAIL>",
      //     },
      //     startDate: new Date(),
      //     endDate: new Date(),
      //     component: {} as FC<any>,
      //   },
      // },
      // Notify subscribers
      notifySubscribers(
        snapshot,
        subscribers,
        // notify,
        // id,
        // notification,
        // date,
        // content,
        // type
      );
    },

    batchFetchSnapshotsSuccess: (
      state,
      action: PayloadAction<{
        snapshots: WritableDraft<Snapshot<BaseData, any>>[];
      }>
    ) => {
      state.loading = false;
      state.snapshots = action.payload.snapshots;
    },

    batchFetchSnapshotsFailure: (
      state,
      action: PayloadAction<{ error: string }>
    ) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    batchUpdateSnapshotsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    batchUpdateSnapshotsSuccess: (
      state,
      action: PayloadAction<{
        snapshots: WritableDraft<Snapshot<Data<T, K, Meta, Attachment, ExcludedFields>, Data>>[];
      }>
    ) => {
      state.loading = false;
      state.snapshots = action.payload.snapshots;
    
      // Additional logic
      // Log success message
      console.log('Snapshots updated successfully');
    
      // Optionally, you might want to update other parts of the state
      // Example: Resetting error message
      state.error = null;
    
      // Example: Handling specific snapshot updates if necessary
      state.snapshots.forEach(snapshot => {
        if (snapshot.id === "specific-id") {
          snapshot.status = "updated";
          console.log("Specific snapshot updated", snapshot);
        }
      });
    },
    

    batchUpdateSnapshotsFailure: (
      state,
      action: PayloadAction<{ error: { code: string, message: string } }>
    ) => {
      state.loading = false;
      state.error = action.payload.error.message;
      
      // Handle specific error codes
      switch (action.payload.error.code) {
        case "not-found":
          // Handle not found error
          console.error("Error: Snapshot not found");
          // You can set a specific error message or perform other state updates
          state.error = "Snapshot not found. Please check the ID and try again.";
          break;
        case "permission-denied":
          // Handle permission denied error
          console.error("Error: Permission denied");
          state.error = "You do not have permission to perform this action.";
          break;
        case "network-error":
          // Handle network error
          console.error("Error: Network error");
          state.error = "Network error. Please check your connection and try again.";
          break;
        default:
          // Handle other errors
          console.error("Error: " + action.payload.error.message);
          state.error = "An unexpected error occurred. Please try again.";
          break;
      }
    },
    

    batchRemoveSnapshotsSuccess: (state, action: PayloadAction<string[]>) => {
      state.loading = false;
      state.snapshots = state.snapshots.filter(
        (snapshot) => !action.payload.includes(snapshot.id as string)      );
    },
    batchRemoveSnapshotsFailure: (
      state,
      action: PayloadAction<{ error: string }>
    ) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    //  
  },
  extraReducers: (builder) => {
    builder
        .addCase(createAndAddSnapshot.fulfilled, (state, action) => {
          if (isSnapshot(action.payload)) {
            const correctStore = findCorrectSnapshotStore(
              action.payload,
              state.snapshotStores as SnapshotStore<BaseData, BaseData>[]
            );
            if (correctStore) {
              correctStore.snapshots.push(action.payload);
            } else {
              state.error = 'No matching snapshot store found';
            }
          } else {
            state.error = 'Snapshot data does not match expected type';
          }
        })
      .addCase(createAndAddSnapshot.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchDataStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataStores.fulfilled, (state, action: PayloadAction<DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>) => {
        state.loading = false;
        state.dataStores = action.payload;
      })
      .addCase(fetchDataStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch data stores';
      })
      .addCase(batchFetchSnapshots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(batchFetchSnapshots.fulfilled, (state, action) => {
        state.loading = false;
        const { baseSnapshot, meta } = action.payload;
        
        // Handle the snapshot data here
        if (meta?.notify) {
          // Additional logic if 'notify' is true
        }
        
        // Add your snapshot processing logic
      })
      .addCase(batchFetchSnapshots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// 1. Function that CREATES a snapshot object (local creation)
export const createSnapshotObject = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  Attachment = any,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  entity: T,
  store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  options: { 
    dataMap?: Map<string, any>;
    id?: string;
    meta?: Meta;
    parentSnapshot?: Snapshot<T, K, Meta, Attachment, ExcludedFields, any> | null;
    previousSnapshot?: Snapshot<T, K, Meta, Attachment, ExcludedFields, any> | null;
    isPartial?: boolean;
  } = {}
): Promise<Snapshot<T, K, Meta, Attachment, ExcludedFields, any>> => {
  return createCompleteSnapshot<T, K, Meta, Attachment, ExcludedFields>(
    entity,
    options.dataMap || new Map(),
    options.id || `snapshot-${Date.now()}`,
    options.meta,
    store,
    options.parentSnapshot || null,
    options.previousSnapshot || null,
    options.isPartial || false,
    storeProps,
    {}
  );
};

export const createMockSnapshot = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  Attachment = any,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(): Snapshot<T, K, Meta, Attachment, ExcludedFields, any> => {
  // For demonstration purposes, we're just going to return the same snapshots
  return {
    id: "1",
    key: "value",
    topic: "topic",
    configOption: {} as string | WritableDraft<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | string,
    config: {} as Promise<SnapshotStoreConfig<T, K, Meta, ExcludedField> | null>,
    subscription: {} as WritableDraft<Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    initialState: {} as WritableDraft<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    category: "category",
    store: "",
    timestamp: new Date(),
    snapshotStoreConfig: undefined,
    getSnapshotItems: getSnapshotItems,
    defaultSubscribeToSnapshots: function (
      napshotId: string,
      callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
    ): void {
      throw new Error("Function not implemented.");
    },
    versionInfo: null,
    transformSubscriber: function (subscriberId: string, sub: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
      throw new Error("Function not implemented.");
    },
    transformDelegate: function (): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
      throw new Error("Function not implemented.");
    },
    initializedState: undefined,
    getAllKeys: function (): Promise<string[]> | undefined {
      throw new Error("Function not implemented.");
    },
    getAllItems: function (): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
      throw new Error("Function not implemented.");
    },
    addDataStatus: function (id: number, status: StatusType | undefined): void {
      throw new Error("Function not implemented.");
    },
    removeData: function (id: number): void {
      throw new Error("Function not implemented.");
    },
    updateData: function (id: number, newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    updateDataTitle: function (id: number, title: string): void {
      throw new Error("Function not implemented.");
    },
    updateDataDescription: function (id: number, description: string): void {
      throw new Error("Function not implemented.");
    },
    updateDataStatus: function (id: number, status: StatusType | undefined): void {
      throw new Error("Function not implemented.");
    },
    addDataSuccess: function (payload: { data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; }): void {
      throw new Error("Function not implemented.");
    },
    getDataVersions: function (id: number): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
      throw new Error("Function not implemented.");
    },
    updateDataVersions: function (id: number, versions: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): void {
      throw new Error("Function not implemented.");
    },
    getBackendVersion: function (): Promise<string | number | undefined> {
      throw new Error("Function not implemented.");
    },
    getFrontendVersion: function (): Promise<string | number | undefined> {
      throw new Error("Function not implemented.");
    },
    fetchData: function (endpoint: string, id: number): Promise<SnapshotStore<BaseData, BaseData>[]> {
      throw new Error("Function not implemented.");
    },
    defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string {
      throw new Error("Function not implemented.");
    },
    handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    removeItem: function (key: string | number): Promise<void> {
      throw new Error("Function not implemented.");
    },
    getSnapshot: function (snapshot: (id: string) => Promise<{ category: any; timestamp: any; id: any; snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; snapshotStore: SnapshotStore<BaseData, BaseData>; data: BaseData; }> | undefined): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
      throw new Error("Function not implemented.");
    },
    getSnapshotSuccess: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<SnapshotStore<BaseData, BaseData>> {
      throw new Error("Function not implemented.");
    },
    setItem: function (key: BaseData<any, any, any>, value: BaseData<any, any, any>): Promise<void> {
      throw new Error("Function not implemented.");
    },
    getDataStore: (): Promise<DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> =>{
      throw new Error("Function not implemented.")
    },
    getDataStoreMap: (): Promise<Map<string, DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> => {
      return Promise.resolve(new Map<string, DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>());
    },
    addSnapshotSuccess: function (
      snapshot: BaseData,
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
    ): void {
      throw new Error("Function not implemented.");
    },
    deepCompare: function (objA: any, objB: any): boolean {
      throw new Error("Function not implemented.");
    },
    shallowCompare: function (objA: any, objB: any): boolean {
      throw new Error("Function not implemented.");
    },
    getDataStoreMethods: function (): DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
      throw new Error("Function not implemented.");
    },

    determineCategory: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined): string {
      throw new Error("Function not implemented.");
    },
    determinePrefix: function (snapshot: BaseData | null | undefined, category: string): string {
      throw new Error("Function not implemented.");
    },
    removeSnapshot: function (snapshotToRemove: SnapshotStore<BaseData, BaseData>): void {
      throw new Error("Function not implemented.");
    },
    addSnapshotItem: function (item: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    addNestedStore: function (store: SnapshotStore<BaseData, BaseData>): void {
      throw new Error("Function not implemented.");
    },
    clearSnapshots: function (): void {
      throw new Error("Function not implemented.");
    },
    addSnapshot: function (
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      snapshotId: string, 
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
      throw new Error("Function not implemented.");
    },
    createSnapshot: createSnapshot,
    createInitSnapshot: function (
      id: string,
      initialData: T,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category?: Category,            
      additionalData: any
      ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
      throw new Error("Function not implemented.");
    },
    setSnapshotSuccess: function (snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, subscribers: ((data: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void)[]): void {
      throw new Error("Function not implemented.");
    },
    setSnapshotFailure: function (error: Error): void {
      throw new Error("Function not implemented.");
    },
    updateSnapshots: function (): void {
      throw new Error("Function not implemented.");
    },
    updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], snapshot: Snapshots<BaseData>) => void): void {
      throw new Error("Function not implemented.");
    },
    updateSnapshotsFailure: function (error: Payload): void {
      throw new Error("Function not implemented.");
    },
    initSnapshot: function (
      snapshot: SnapshotStore<BaseData, BaseData> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
      snapshotId: string | number | null,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category?: Category,
      categoryProperties: CategoryProperties | undefined,
      snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: (snapshotStore: SnapshotStore<any, any>) => void,
      snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStoreConfigSearch: SnapshotStoreConfig<
      SnapshotWithCriteria<any, K>,
      SnapshotWithCriteria<any, K>>
    ): void {
      throw new Error("Function not implemented.");
    },
    takeSnapshot: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> {
      throw new Error("Function not implemented.");
    },
    takeSnapshotSuccess: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    takeSnapshotsSuccess: function (snapshots: BaseData[]): void {
      throw new Error("Function not implemented.");
    },
    flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, index: number, array: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => U): U extends (infer I)[] ? I[] : U[] {
      throw new Error("Function not implemented.");
    },
    getState: function () {
      throw new Error("Function not implemented.");
    },
    setState: function (state: any): void {
      throw new Error("Function not implemented.");
    },
    validateSnapshot: function (snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean {
      throw new Error("Function not implemented.");
    },
    handleActions: function (action: (selectedText: string) => void): void {
      throw new Error("Function not implemented.");
    },
    setSnapshot: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    transformSnapshotConfig: function <T extends BaseData>(config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
      throw new Error("Function not implemented.");
    },
    setSnapshots: function (snapshots: Snapshots<BaseData>): void {
      throw new Error("Function not implemented.");
    },
    clearSnapshot: function (): void {
      throw new Error("Function not implemented.");
    },
    mergeSnapshots: function (snapshots: Snapshots<BaseData>, category: string): void {
      throw new Error("Function not implemented.");
    },
    reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => U, initialValue: U): U | undefined {
      throw new Error("Function not implemented.");
    },
    sortSnapshots: function (): void {
      throw new Error("Function not implemented.");
    },
    filterSnapshots: function (): void {
      throw new Error("Function not implemented.");
    },
    findSnapshot: function (
      predicate: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean
    ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
      throw new Error("Function not implemented.");
    },
    getSubscribers: function (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], snapshots: Snapshots<BaseData>): Promise<{ subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; snapshots: Snapshots<BaseData>; }> {
      throw new Error("Function not implemented.");
    },
    notify: function (
      id: string, 
      message: string,
      content: Content<BaseData<any>, BaseData<any>>, 
      data: any,
      date: Date, 
      type: NotificationType, 
      notificationPosition?: NotificationPosition | undefined): void {
      throw new Error("Function not implemented.");
    },
    notifySubscribers: function (message: string, subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], data: Partial<SnapshotStoreConfig<BaseData, any>>): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
      throw new Error("Function not implemented.");
    },
    getSnapshots: function (category: string, data: Snapshots<BaseData>): void {
      throw new Error("Function not implemented.");
    },
    getAllSnapshots: function (data: (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], snapshots: Snapshots<BaseData>) => Promise<Snapshots<BaseData>>): void {
      throw new Error("Function not implemented.");
    },
    generateId: function (): string {
      throw new Error("Function not implemented.");
    },
    batchFetchSnapshots: function (
      criteria: CriteriaType,
      snapshotData: (
        snapshotIds: string[],
        subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshots: Snapshots<BaseData>
      ) => Promise<{
        subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        snapshots: Snapshots<BaseData>; // Include snapshots here for consistency
      }>
    ): Promise<Snapshots<BaseData>> {
      throw new Error("Function not implemented.");
    },
    batchTakeSnapshotsRequest: function (
      criteria: CriteriaType,
      snapshotData: (
        snapshotIds: string[],
        snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
      ) => Promise<{
        subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
      }>
    ): Promise<void> {
      throw new Error("Function not implemented.");
    },
    batchUpdateSnapshotsRequest: function (
      snapshotData: (subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<{
        subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      }>,
      snapshotManager: SnapshotManager<BaseData, BaseData>
    ): Promise<{ subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; snapshots: Snapshots<BaseData>; }> {
      throw new Error("Function not implemented.");
    },
    filterSnapshotsByStatus: (status: StatusType): Snapshots<BaseData<any>> => {},
    filterSnapshotsByCategory: (category: Category): Snapshots<BaseData<any>>  => {},
    filterSnapshotsByTag: (tag: Tag): Snapshots<BaseData<any>>  => {},
    batchFetchSnapshotsSuccess: function (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], snapshots: Snapshots<BaseData>): void {
      throw new Error("Function not implemented.");
    },
    batchFetchSnapshotsFailure: function ( 
      date: Date,
      snapshotManager: SnapshotManager<T, K>,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      payload: { error: Error; }): void {
      throw new Error("Function not implemented.");
    },
    batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], snapshots: Snapshots<BaseData>): void {
      throw new Error("Function not implemented.");
    },
    batchUpdateSnapshotsFailure: function (
      date: Date,
      snapshotId: string | number | null,
      snapshotManager: SnapshotManager<T, K>,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      payload: { error: Error; }
    ): void {
      throw new Error("Function not implemented.");
    },
    batchTakeSnapshot: function (
      
      id: number,
      snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    ): Promise<{ snapshots: Snapshots<BaseData>; }> {
      throw new Error("Function not implemented.");
    },
    handleSnapshotSuccess: function (message: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, snapshotId: string): void {
      throw new Error("Function not implemented.");
    },
    getSnapshotId: function (key: string | SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): unknown {
      throw new Error("Function not implemented.");
    },
    compareSnapshotState: function (snapshot1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null, state: any): boolean {
      throw new Error("Function not implemented.");
    },
    eventRecords: null,
    snapshotStore: null,
    getParentId: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string | null {
      throw new Error("Function not implemented.");
    },
    getChildIds: function (childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    addChild: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    removeChild: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    getChildren: function (): void {
      throw new Error("Function not implemented.");
    },
    hasChildren: function (): boolean {
      throw new Error("Function not implemented.");
    },
    isDescendantOf: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): boolean {
      throw new Error("Function not implemented.");
    },
    dataItems: null,
    newData: null,
    data: undefined,
    getInitialState: function (): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
      throw new Error("Function not implemented.");
    },
    getConfigOption: function (): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
      throw new Error("Function not implemented.");
    },
    getTimestamp: function (): Date | undefined {
      throw new Error("Function not implemented.");
    },
    getStores: function (): Map<number, SnapshotStore<Data<T, K, Meta, Attachment, ExcludedFields>, any>>[] {
      throw new Error("Function not implemented.");
    },
    getData: function (): BaseData | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined {
      throw new Error("Function not implemented.");
    },
    setData: function (data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
      throw new Error("Function not implemented.");
    },
    addData: function (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    stores: (storeProps: any): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {},
    getStore: function (
      storeId: number, 
      snapshotStore: SnapshotStore<BaseData, BaseData>, 
      snapshotId: string, 
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string, 
      event: Event
    ): SnapshotStore<BaseData, BaseData> | null {
      throw new Error("Function not implemented.");
    },
    addStore: function (
      storeId: number,
      snapshotId: string,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: Event
    ): SnapshotStore<BaseData, BaseData> | null {
      throw new Error("Function not implemented.");
    },
    mapSnapshot: function (storeId: number, snapshotStore: SnapshotStore<BaseData, BaseData>, snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: string, event: Event): Promise<string | undefined> | null {
      throw new Error("Function not implemented.");
    },
    mapSnapshots: function (storeIds: number[], snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: string, event: Event): void | null {
      throw new Error("Function not implemented.");
    },
    removeStore: function (storeId: number, store: SnapshotStore<BaseData, BaseData>, snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: string, event: Event): void | null {
      throw new Error("Function not implemented.");
    },
    unsubscribe: function (callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
      throw new Error("Function not implemented.");
    },
    fetchSnapshot: function (
      callback: (
        snapshotId: string,
        payload: FetchSnapshotPayload<BaseData>,
        snapshotStore: SnapshotStore<BaseData, BaseData>,
        payloadData: BaseData | Data<T, K, Meta, Attachment, ExcludedFields>,
        category?: Category,              timestamp: Date,
        data: BaseData,
        delegate: SnapshotWithCriteria<BaseData, BaseData>[]
      ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
      throw new Error("Function not implemented.");
    },
    addSnapshotFailure: function (snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): void {
      throw new Error("Function not implemented.");
    },
    configureSnapshotStore: function (snapshotStore: SnapshotStore<BaseData, BaseData>, snapshotId: string, data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, events: Record<string, CalendarEvent<BaseData, BaseData>[]>, dataItems: RealtimeDataItem[], newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: ConfigureSnapshotStorePayload<BaseData>, store: SnapshotStore<any, BaseData>, callback: (snapshotStore: SnapshotStore<BaseData, BaseData>) => void): void | null {
      throw new Error("Function not implemented.");
    },
    updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): void | null {
      throw new Error("Function not implemented.");
    },
    createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): Promise<void> {
      throw new Error("Function not implemented.");
    },
    createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): void | null {
      throw new Error("Function not implemented.");
    },
    createSnapshots: function (id: string, snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotManager: SnapshotManager<BaseData, BaseData>, payload: CreateSnapshotsPayload<BaseData, BaseData>, callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null, snapshotDataConfig?: SnapshotConfig<BaseData, BaseData>[] | undefined, category?: string | symbol | Category): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null {
      throw new Error("Function not implemented.");
    },
    onSnapshot: function (snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: string, event: Event, callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): void {
      throw new Error("Function not implemented.");
    },
    onSnapshots: function (snapshotId: string, snapshots: Snapshots<BaseData>, type: string, event: Event, callback: (snapshots: Snapshots<BaseData>) => void): void {
      throw new Error("Function not implemented.");
    },
    label: undefined,
    events: undefined,
    handleSnapshot: function (id: string, snapshotId: string, snapshot: BaseData | null, snapshotData: BaseData, category: symbol | string | Category | undefined, callback: (snapshot: BaseData) => void, snapshots: Snapshots<Data>, type: string, event: Event, snapshotContainer?: BaseData | undefined, snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
      throw new Error("Function not implemented.");
    },
    subscribeToSnapshots: function (snapshotId: string, unsubscribeType: string, unsubscribeDate: Date, unsubscribeReason: string, unsubscribeData: any, callback: (snapshots: Snapshots<BaseData>) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null): void {
      throw new Error("Function not implemented.");
    },
    meta: undefined,
    subscribers: []
  }
}


// Helper function to fetch the actual data source
async function fetchRealDataSource(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
  // Placeholder logic, replace with actual fetch logic as needed
  return Promise.resolve([
    // Example configs
  ] as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]);
}

// Helper to initialize each DataStore from a SnapshotStoreConfig
function initializeDataStore(config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return new DataStore(config); // Assuming DataStore constructor accepts SnapshotStoreConfig
}

export const {
  addSnapshot,
  removeSnapshot,
  updateSnapshot,
  clearSnapshot,
  clearSnapshots,
  batchFetchSnapshotsRequest,
  batchFetchSnapshotsSuccess,
  batchFetchSnapshotsFailure,
  batchUpdateSnapshotsRequest,
  batchUpdateSnapshotsSuccess,
  batchUpdateSnapshotsFailure,
  batchRemoveSnapshotsRequest,
  batchRemoveSnapshotsSuccess,
  batchRemoveSnapshotsFailure,
} = useSnapshotSlice.actions;

export default useSnapshotSlice.reducer;
export type { SnapshotState };
