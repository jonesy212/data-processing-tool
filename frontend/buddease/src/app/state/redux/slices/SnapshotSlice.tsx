// SnapshotSlice.tsx
// snapshots/SnapshotSlice.ts

import { BaseDataRoot } from '@/app/config/BaseConfig';
import { SnapshotManager, useSnapshotManager } from "@/app/hooks/useSnapshotManager";
import {
  createAndAddSnapshot,
  fetchDataStores,
} from "@/app/thunks"; // adjust imports

import { CreateSnapshotsPayload, Payload } from '@/app/interfaces/payload/payloadTypes';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { BaseData, Data } from '@/app/models/data/Data';
import { NotificationPosition, StatusType } from "@/app/models/data/StatusType";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from "@/app/pages/searches/CriteriaType";
import { DataStoreMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { Snapshots } from "@/app/snapshots/LocalStorageSnapshotStore";
import type { Snapshot } from '@/app/snapshots/Snapshot';;
import { ConfigureSnapshotStorePayload, SnapshotConfig } from "@/app/snapshots/SnapshotConfig";
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { DataStore } from "@/app/state/stores/DataStore";
import { Callback } from "@/app/subscribers/subscribeToSnapshotsImplementation";
import { createDefaultSnapshotData, SnapshotEntityDataInterface } from '@/app/typings/entities/SnapshotEntity';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';

import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes';
import { Content } from "@/app/models/content/AddContent";
import { K, Meta, T } from "@/app/models/data/dataStoreMethods";
import { Tag } from '@/app/models/tracker/Tag';
import { FetchSnapshotPayload } from "@/app/snapshots/FetchSnapshotPayload";
import { getSnapshotItems } from "@/app/snapshots/snapshotOperations";
import { WritableDraft } from "@/app/state/redux/ReducerGenerator";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { Subscription } from '@/app/subscriptions/Subscription';
import { findCorrectSnapshotStore, isSnapshot } from "@/utils/snapshotUtils";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";


type PayloadActionWithMeta<T, M = never> = PayloadAction<T, string, M>;



// Async function to fetch DataStore list based on context
export const getDelegate = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(context: {
  useSimulatedDataSource: boolean;
  simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}): Promise<DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  const dataSource = context.useSimulatedDataSource
    ? context.simulatedDataSource
    : await fetchRealDataSource();

  return dataSource.map((config) => initializeDataStore(config));
};

// Create an async thunk
export const batchFetchSnapshots = createAsyncThunk<
  { baseSnapshot: SnapshotEntityDataInterface; meta: Meta }, // return type
  { startDate: Date; endDate: Date; storeId: number; meta: Meta }, // payload type
  { rejectValue: any } // thunkAPI type
>(
  'snapshot/batchFetchSnapshots',
  async ({ startDate, endDate, storeId, meta }, thunkAPI) => {
    try {
      const snapshotManager = useSnapshotManager(initialStoreId);
      const subscribers = snapshotManager(storeId);

      // ✅ Use factory to create a properly typed empty snapshot
      const baseSnapshot = createDefaultSnapshotData({
        id: `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        // optional overrides:
        createdAt: startDate,
        updatedAt: endDate,
        metadata: {} as SnapshotUnifiedMetadata,
      });

      return { baseSnapshot, meta };
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// --------------------
// Generic Slice Factory
// --------------------
export function createGenericSnapshotSlice<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>() {
  interface SnapshotState {
    snapshotId: string;
    snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    snapshotStores: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    dataStores?: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; // added for fetchDataStores
    loading: boolean;
    error: string | null;
    storeId: number;
  }

  const initialState: SnapshotState = {
    snapshotId: "initial-id",
    snapshots: [],
    snapshotStores: [],
    dataStores: [],
    loading: false,
    error: null,
    storeId: 0,
  };

  // --------------------
  // Core Slice Definition
  // --------------------
  const useSnapshotSlice = createSlice({
    name: "snapshot",
    initialState,
    reducers: {
      addSnapshot: (
        state,
        action: PayloadActionWithMeta<
          Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        >
      ) => {
        if (isSnapshot(action.payload)) {
          const correctStore = findCorrectSnapshotStore(
            action.payload,
            state.snapshotStores
          );
          if (correctStore) {
            correctStore.snapshots.push(action.payload);
          } else {
            state.error = "No matching snapshot store found";
          }
        } else {
          state.error = "Snapshot data does not match expected type";
        }
      },

      removeSnapshot: (state, action: PayloadAction<string>) => {
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
          snapshotToRemove.data = {} as Map<
            string,
            WritableDraft<
              Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
            >
          >;
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

      // --- Batch Remove Snapshots ---
      batchRemoveSnapshotsRequest: (
        state,
        action: PayloadAction<{ startDate: Date; endDate: Date }>
      ) => {
        state.loading = true;
        state.error = null;
      },

      batchFetchSnapshotsRequest: (
        state,
        action: PayloadAction<{
          startDate: Date;
          endDate: Date;
          storeId: number;
          meta?: Meta;
        }>
      ) => {
        state.loading = true;
        state.error = null;
      },

      batchFetchSnapshotsSuccess: (
        state,
        action: PayloadAction<{
          snapshots: WritableDraft<
            Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
          >[];
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
          snapshots: WritableDraft<
            Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
          >[];
        }>
      ) => {
        state.loading = false;
        state.snapshots = action.payload.snapshots;
        state.error = null;

        // Example: handling specific snapshot updates
        state.snapshots.forEach((snapshot) => {
          if (snapshot.id === "specific-id") {
            snapshot.status = "updated";
            console.log("Specific snapshot updated", snapshot);
          }
        });
      },

      batchUpdateSnapshotsFailure: (
        state,
        action: PayloadAction<{ error: { code: string; message: string } }>
      ) => {
        state.loading = false;
        state.error = action.payload.error.message;

        switch (action.payload.error.code) {
          case "not-found":
            state.error =
              "Snapshot not found. Please check the ID and try again.";
            break;
          case "permission-denied":
            state.error = "You do not have permission to perform this action.";
            break;
          case "network-error":
            state.error = "Network error. Please check your connection.";
            break;
          default:
            state.error = "An unexpected error occurred.";
            break;
        }
      },

      batchRemoveSnapshotsSuccess: (state, action: PayloadAction<string[]>) => {
        state.loading = false;
        state.snapshots = state.snapshots.filter(
          (snapshot) => !action.payload.includes(snapshot.id as string)
        );
      },

      batchRemoveSnapshotsFailure: (
        state,
        action: PayloadAction<{ error: string }>
      ) => {
        state.loading = false;
        state.error = action.payload.error;
      },
    },

    // --------------------
    // Async Thunks Integration
    // --------------------
    extraReducers: (builder) => {
      builder
        .addCase(createAndAddSnapshot.fulfilled, (state, action) => {
          if (isSnapshot(action.payload)) {
            const correctStore = findCorrectSnapshotStore(
              action.payload,
              state.snapshotStores as SnapshotStore<BaseDataEntity, BaseDataEntity>[]
            );
            if (correctStore) {
              correctStore.snapshots.push(action.payload);
            } else {
              state.error = "No matching snapshot store found";
            }
          } else {
            state.error = "Snapshot data does not match expected type";
          }
        })
        .addCase(createAndAddSnapshot.rejected, (state, action) => {
          state.error = action.payload as string;
        })
        .addCase(fetchDataStores.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(
          fetchDataStores.fulfilled,
          (
            state,
            action: PayloadAction<
              DataStore<
                T,
                K,
                Meta,
                AttachmentType,
                ExcludedFields,
                IncludedFields
              >[]
            >
          ) => {
            state.loading = false;
            state.dataStores = action.payload;
          }
        )
        .addCase(fetchDataStores.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message || "Failed to fetch data stores";
        })
        .addCase(batchFetchSnapshots.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(batchFetchSnapshots.fulfilled, (state, action) => {
          state.loading = false;
          const { baseSnapshot, meta } = action.payload;

          // Handle snapshot logic here
          if (meta?.notify) {
            // optional: notify subscribers
          }
        })
        .addCase(batchFetchSnapshots.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
    },
  });

  return useSnapshotSlice;
}


export const createMockSnapshot = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  // For demonstration purposes, we're just going to return the same snapshots
  return {
    id: "1",
    key: "value",
    topic: "topic",
    configOption: {} as string | WritableDraft<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | string,
    config: {} as Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>,
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
    fetchData: function (endpoint: string, id: number): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
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
    getSnapshot: function (snapshot: (id: string) => Promise<{ category: any; timestamp: any; id: any; snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; data: BaseData; }> | undefined): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
      throw new Error("Function not implemented.");
    },
    getSnapshotSuccess: function (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
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
    removeSnapshot: function (snapshotToRemove: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    addSnapshotItem: function (item: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    addNestedStore: function (store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
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
    updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], snapshot: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): void {
      throw new Error("Function not implemented.");
    },
    updateSnapshotsFailure: function (error: Payload): void {
      throw new Error("Function not implemented.");
    },
    initSnapshot: function (
      snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
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
    setSnapshots: function (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    clearSnapshot: function (): void {
      throw new Error("Function not implemented.");
    },
    mergeSnapshots: function (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, category: string): void {
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
    getSubscribers: function (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<{ subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> {
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
    getSnapshots: function (category: string, data: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    getAllSnapshots: function (data: (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
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
        snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      ) => Promise<{
        subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Include snapshots here for consistency
      }>
    ): Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
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
      snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Promise<{ subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]; snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> {
      throw new Error("Function not implemented.");
    },
    filterSnapshotsByStatus: (status: StatusType): Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {},
    filterSnapshotsByCategory: (category: Category): Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  => {},
    filterSnapshotsByTag: (tag: Tag): Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  => {},
    batchFetchSnapshotsSuccess: function (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    batchFetchSnapshotsFailure: function ( 
      date: Date,
      snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      payload: { error: Error; }): void {
      throw new Error("Function not implemented.");
    },
    batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
      throw new Error("Function not implemented.");
    },
    batchUpdateSnapshotsFailure: function (
      date: Date,
      snapshotId: string | number | null,
      snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    ): Promise<{ snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> {
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
    getStores: function (): Map<number, SnapshotStore<Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, any>>[] {
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
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      snapshotId: string, 
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string, 
      event: Event
    ): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
      throw new Error("Function not implemented.");
    },
    addStore: function (
      storeId: number,
      snapshotId: string,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: Event
    ): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
      throw new Error("Function not implemented.");
    },
    mapSnapshot: function (storeId: number, snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: string, event: Event): Promise<string | undefined> | null {
      throw new Error("Function not implemented.");
    },
    mapSnapshots: function (storeIds: number[], snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: string, event: Event): void | null {
      throw new Error("Function not implemented.");
    },
    removeStore: function (storeId: number, store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotId: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: string, event: Event): void | null {
      throw new Error("Function not implemented.");
    },
    unsubscribe: function (callback: Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void {
      throw new Error("Function not implemented.");
    },
    fetchSnapshot: function (
      callback: (
        snapshotId: string,
        payload: FetchSnapshotPayload<BaseData>,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        payloadData: BaseData | Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        timestamp: Date,
        data: BaseData,
        delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        category?: Category,              
      ) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
      throw new Error("Function not implemented.");
    },
    addSnapshotFailure: function (snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): void {
      throw new Error("Function not implemented.");
    },
    configureSnapshotStore: function (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotId: string, data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, events: Record<string, CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>, dataItems: RealtimeDataItem[], newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: ConfigureSnapshotStorePayload<BaseData>, store: SnapshotStore<any, BaseData>, callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): void | null {
      throw new Error("Function not implemented.");
    },
    updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): void | null {
      throw new Error("Function not implemented.");
    },
    createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): Promise<void> {
      throw new Error("Function not implemented.");
    },
    createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, payload: { error: Error; }): void | null {
      throw new Error("Function not implemented.");
    },
    createSnapshots: function (
      id: string, 
      snapshotId: string, 
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      payload: CreateSnapshotsPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null, 
      snapshotDataConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined, 
      category?: string | symbol | Category
    ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null {
      throw new Error("Function not implemented.");
    },
    onSnapshot: function (
      snapshotId: string, 
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      type: string, 
      event: Event, 
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): void {
      throw new Error("Function not implemented.");
    },
    onSnapshots: function (
      snapshotId: string, 
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
      type: string, event: Event, 
      callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void): void {
      throw new Error("Function not implemented.");
    },
    label: undefined,
    events: undefined,
    handleSnapshot: function (id: string, snapshotId: string, snapshot: BaseData | null, snapshotData: BaseData, category: symbol | string | Category | undefined, callback: (snapshot: BaseData) => void, snapshots: Snapshots<Data>, type: string, event: Event, snapshotContainer?: BaseData | undefined, snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
      throw new Error("Function not implemented.");
    },
    subscribeToSnapshots: function (snapshotId: string, unsubscribeType: string, unsubscribeDate: Date, unsubscribeReason: string, unsubscribeData: any, callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null): void {
      throw new Error("Function not implemented.");
    },
    meta: undefined,
    subscribers: []
  }
}


// Helper function to fetch the actual data source
async function fetchRealDataSource<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
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
