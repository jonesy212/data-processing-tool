// snapshots/SnapshotSlice.ts
import { Payload } from '@/app/components/database/Payload';
import { SnapshotManager, useSnapshotManager } from "@/app/components/hooks/useSnapshotManager";
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData, Data } from "@/app/components/models/data/Data";
import { NotificationPosition, StatusType } from "@/app/components/models/data/StatusType";
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import { DataStoreMethods } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Callback, SnapshotConfig, SnapshotData, SnapshotWithCriteria } from "@/app/components/snapshots";
import { Snapshot, Snapshots } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { ConfigureSnapshotStorePayload } from "@/app/components/snapshots/SnapshotConfig";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";

import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { NotificationType } from "@/app/components/support/NotificationContext";
import { Subscriber } from "@/app/components/users/Subscriber";
import { sendNotification } from "@/app/components/users/UserSlice";
import { findCorrectSnapshotStore, isSnapshot } from "@/app/components/utils/snapshotUtils";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { FC } from "react";
import { WritableDraft } from "../ReducerGenerator";


interface SnapshotState {
  snapshotId: string;
  snapshotStores: SnapshotStore<BaseData, BaseData>[];
  snapshots: Snapshot<BaseData, BaseData>[];
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
  simulatedDataSource: SnapshotStoreConfig<BaseData, BaseData>[];
}): Promise<DataStore<BaseData, BaseData>[]> => {
  const dataSource = context.useSimulatedDataSource
    ? context.simulatedDataSource
    : await fetchRealDataSource();

  return dataSource.map((config) => initializeDataStore(config));
};

// Async thunk to call getDelegate and handle state updates
export const fetchDataStores = createAsyncThunk(
  'snapshot/fetchDataStores',
  async (context: { useSimulatedDataSource: boolean; simulatedDataSource: SnapshotStoreConfig<BaseData, BaseData>[] }) => {
    return await getDelegate(context);
  }
);

export const useSnapshotSlice = createSlice({
  name: "snapshot",
  initialState,
  reducers: {
    addSnapshot: (
      state,
      action: PayloadActionWithMeta<Snapshot<BaseData, BaseData>>
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
        snapshotToRemove.data = {} as Map<string, WritableDraft<Snapshot<BaseData, BaseData>>>
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

    

    batchRemoveSnapshotsRequest: <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
      state, // Specify state type here
      action: PayloadAction<{ startDate: Date; endDate: Date }>
    ) => {

      const snapshotManager = useSnapshotManager;
      const subscribers = snapshotManager(state.storeId)

      state.loading = true;
      state.error = null;

      const notifySubscribers = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
        subscribers: Subscriber<T, K>[]
      ) => {
        const { startDate, endDate } = action.payload;
        const snapshots = state.snapshots.filter(
          (snapshot: Snapshot<T, K>) =>
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

      const notifySubscribers = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
        subscribers: Subscriber<T, K>[],
        action: PayloadAction<{ snapshot: Snapshot<T, K>; subscriber: Subscriber<T, K> }>
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

      const createSnapshot = 
      // For demonstration purposes, we're just going to return the same snapshots
      state.snapshots = [
        {
          id: "1",
          key: "value",
          topic: "topic",
          configOption: {} as string | WritableDraft<SnapshotStoreConfig<BaseData, BaseData>> | string,
          config: {} as Promise<SnapshotStoreConfig<BaseData<any>, BaseData<any>>| null>,
          subscription: {} as WritableDraft<Subscription<BaseData<any>>, BaseData<any, any, any>>,
          initialState: {} as WritableDraft<SnapshotStoreConfig<BaseData<any>, BaseData<any>>>,
          category: "category",
          store: "",
          timestamp: new Date(),
          snapshotStoreConfig: undefined,
          getSnapshotItems: getSnapshotItems,
          defaultSubscribeToSnapshots: function (
            napshotId: string,
            callback: (snapshots: Snapshots<T, K>) => Subscriber<T, K> | null,
            snapshot: Snapshot<T, K> | null
          ): void {
            throw new Error("Function not implemented.");
          },
          versionInfo: null,
          transformSubscriber: function (subscriberId: string, sub: Subscriber<BaseData, BaseData>): Subscriber<BaseData, BaseData> {
            throw new Error("Function not implemented.");
          },
          transformDelegate: function (): Promise<SnapshotStoreConfig<BaseData, BaseData>[]> {
            throw new Error("Function not implemented.");
          },
          initializedState: undefined,
          getAllKeys: function (): Promise<string[]> | undefined {
            throw new Error("Function not implemented.");
          },
          getAllItems: function (): Promise<Snapshot<BaseData, BaseData>[] | undefined> {
            throw new Error("Function not implemented.");
          },
          addDataStatus: function (id: number, status: StatusType | undefined): void {
            throw new Error("Function not implemented.");
          },
          removeData: function (id: number): void {
            throw new Error("Function not implemented.");
          },
          updateData: function (id: number, newData: Snapshot<BaseData, BaseData>): void {
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
          addDataSuccess: function (payload: { data: Snapshot<BaseData, BaseData>[]; }): void {
            throw new Error("Function not implemented.");
          },
          getDataVersions: function (id: number): Promise<Snapshot<BaseData, BaseData>[] | undefined> {
            throw new Error("Function not implemented.");
          },
          updateDataVersions: function (id: number, versions: Snapshot<BaseData, BaseData>[]): void {
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
          defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<BaseData, BaseData>>, snapshot: Snapshot<BaseData, BaseData>): string {
            throw new Error("Function not implemented.");
          },
          handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<BaseData, BaseData>>, snapshot: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          removeItem: function (key: string | number): Promise<void> {
            throw new Error("Function not implemented.");
          },
          getSnapshot: function (snapshot: (id: string) => Promise<{ category: any; timestamp: any; id: any; snapshot: Snapshot<BaseData, BaseData>; snapshotStore: SnapshotStore<BaseData, BaseData>; data: BaseData; }> | undefined): Promise<Snapshot<BaseData, BaseData>> {
            throw new Error("Function not implemented.");
          },
          getSnapshotSuccess: function (snapshot: Snapshot<BaseData, BaseData>): Promise<SnapshotStore<BaseData, BaseData>> {
            throw new Error("Function not implemented.");
          },
          setItem: function (key: BaseData<any, any, any>, value: BaseData<any, any, any>): Promise<void> {
            throw new Error("Function not implemented.");
          },
          getDataStore: (): Promise<DataStore<BaseData, BaseData>[]> =>{
            throw new Error("Function not implemented.")
          },
          getDataStoreMap: (): Promise<Map<string, DataStore<BaseData, BaseData>>> => {
            return Promise.resolve(new Map<string, DataStore<BaseData, BaseData>>());
          },
          addSnapshotSuccess: function (
            snapshot: BaseData,
            subscribers: Subscriber<BaseData, BaseData>[]
          ): void {
            throw new Error("Function not implemented.");
          },
          deepCompare: function (objA: any, objB: any): boolean {
            throw new Error("Function not implemented.");
          },
          shallowCompare: function (objA: any, objB: any): boolean {
            throw new Error("Function not implemented.");
          },
          getDataStoreMethods: function (): DataStoreMethods<BaseData, BaseData> {
            throw new Error("Function not implemented.");
          },

          determineCategory: function (snapshot: Snapshot<BaseData, BaseData> | null | undefined): string {
            throw new Error("Function not implemented.");
          },
          determinePrefix: function (snapshot: BaseData | null | undefined, category: string): string {
            throw new Error("Function not implemented.");
          },
          removeSnapshot: function (snapshotToRemove: SnapshotStore<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          addSnapshotItem: function (item: Snapshot<any, any> | SnapshotStoreConfig<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          addNestedStore: function (store: SnapshotStore<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          clearSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          addSnapshot: function (
            snapshot: Snapshot<BaseData, BaseData>, 
            snapshotId: string, 
            subscribers: SubscriberCollection<BaseData, BaseData>
          ): Promise<Snapshot<BaseData<any, any, any>, BaseData<any, any, any>> | undefined> {
            throw new Error("Function not implemented.");
          },
          createSnapshot: createSnapshot,
          createInitSnapshot: function (
            id: string,
            initialData: T,
            snapshotData: SnapshotData<any, K>,
            snapshotStoreConfig: SnapshotStoreConfig<T, K>,
            category: symbol | string | Category | undefined,
            additionalData: any
            ): Promise<Snapshot<BaseData, BaseData>> {
            throw new Error("Function not implemented.");
          },
          setSnapshotSuccess: function (snapshotData: SnapshotData<BaseData, BaseData>, subscribers: ((data: Subscriber<BaseData, BaseData>) => void)[]): void {
            throw new Error("Function not implemented.");
          },
          setSnapshotFailure: function (error: Error): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<BaseData, BaseData>[], snapshot: Snapshots<BaseData>) => void): void {
            throw new Error("Function not implemented.");
          },
          updateSnapshotsFailure: function (error: Payload): void {
            throw new Error("Function not implemented.");
          },
          initSnapshot: function (
            snapshot: SnapshotStore<BaseData, BaseData> | Snapshot<BaseData, BaseData> | null,
            snapshotId: string | number | null,
            snapshotData: SnapshotData<BaseData, BaseData>,
            category: Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            snapshotConfig: SnapshotStoreConfig<BaseData, BaseData>,
            callback: (snapshotStore: SnapshotStore<any, any>) => void,
            snapshotStoreConfig: SnapshotStoreConfig<BaseData, BaseData>,
            snapshotStoreConfigSearch: SnapshotStoreConfig<
            SnapshotWithCriteria<any, K>,
            SnapshotWithCriteria<any, K>>
          ): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshot: function (snapshot: Snapshot<BaseData, BaseData>, subscribers: Subscriber<BaseData, BaseData>[]): Promise<{ snapshot: Snapshot<BaseData, BaseData>; }> {
            throw new Error("Function not implemented.");
          },
          takeSnapshotSuccess: function (snapshot: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          takeSnapshotsSuccess: function (snapshots: BaseData[]): void {
            throw new Error("Function not implemented.");
          },
          flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<BaseData, BaseData>, index: number, array: SnapshotStoreConfig<BaseData, BaseData>[]) => U): U extends (infer I)[] ? I[] : U[] {
            throw new Error("Function not implemented.");
          },
          getState: function () {
            throw new Error("Function not implemented.");
          },
          setState: function (state: any): void {
            throw new Error("Function not implemented.");
          },
          validateSnapshot: function (snapshotId: string, snapshot: Snapshot<BaseData, BaseData>): boolean {
            throw new Error("Function not implemented.");
          },
          handleActions: function (action: (selectedText: string) => void): void {
            throw new Error("Function not implemented.");
          },
          setSnapshot: function (snapshot: Snapshot<BaseData, BaseData>): void {
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
          reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<BaseData, BaseData>) => U, initialValue: U): U | undefined {
            throw new Error("Function not implemented.");
          },
          sortSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          filterSnapshots: function (): void {
            throw new Error("Function not implemented.");
          },
          findSnapshot: function (
            predicate: (snapshot: Snapshot<BaseData, BaseData>) => boolean
          ): Snapshot<BaseData, BaseData> | undefined {
            throw new Error("Function not implemented.");
          },
          getSubscribers: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): Promise<{ subscribers: Subscriber<BaseData, BaseData>[]; snapshots: Snapshots<BaseData>; }> {
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
          notifySubscribers: function (message: string, subscribers: Subscriber<BaseData, BaseData>[], data: Partial<SnapshotStoreConfig<BaseData, any>>): Subscriber<BaseData, BaseData>[] {
            throw new Error("Function not implemented.");
          },
          getSnapshots: function (category: string, data: Snapshots<BaseData>): void {
            throw new Error("Function not implemented.");
          },
          getAllSnapshots: function (data: (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>) => Promise<Snapshots<BaseData>>): void {
            throw new Error("Function not implemented.");
          },
          generateId: function (): string {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshots: function (
            criteria: CriteriaType,
            snapshotData: (
              snapshotIds: string[],
              subscribers: SubscriberCollection<BaseData, BaseData>,
              snapshots: Snapshots<BaseData>
            ) => Promise<{
              subscribers: SubscriberCollection<BaseData, BaseData>;
              snapshots: Snapshots<BaseData>; // Include snapshots here for consistency
            }>
          ): Promise<Snapshots<BaseData>> {
            throw new Error("Function not implemented.");
          },
          batchTakeSnapshotsRequest: function (
            criteria: CriteriaType,
            snapshotData: (
              snapshotIds: string[],
              snapshots: Snapshots<T, K>,
              subscribers: Subscriber<BaseData, BaseData>[]
            ) => Promise<{
              subscribers: Subscriber<BaseData, BaseData>[]
            }>
          ): Promise<void> {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsRequest: function (
            snapshotData: (subscribers: SubscriberCollection<BaseData, BaseData>) => Promise<{
              subscribers: SubscriberCollection<BaseData, BaseData>;
              snapshots: Snapshots<T, K>
            }>,
            snapshotManager: SnapshotManager<BaseData, BaseData>
          ): Promise<{ subscribers: Subscriber<BaseData, BaseData>[]; snapshots: Snapshots<BaseData>; }> {
            throw new Error("Function not implemented.");
          },
          filterSnapshotsByStatus: (status: StatusType): Snapshots<BaseData<any>> => {},
          filterSnapshotsByCategory: (category: Category): Snapshots<BaseData<any>>  => {},
          filterSnapshotsByTag: (tag: Tag): Snapshots<BaseData<any>>  => {},
          batchFetchSnapshotsSuccess: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): void {
            throw new Error("Function not implemented.");
          },
          batchFetchSnapshotsFailure: function ( 
            date: Date,
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
            payload: { error: Error; }): void {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<BaseData, BaseData>[], snapshots: Snapshots<BaseData>): void {
            throw new Error("Function not implemented.");
          },
          batchUpdateSnapshotsFailure: function (
            date: Date,
            snapshotId: string | number | null,
            snapshotManager: SnapshotManager<T, K>,
            snapshot: Snapshot<T, K>,
            payload: { error: Error; }
          ): void {
            throw new Error("Function not implemented.");
          },
          batchTakeSnapshot: function (
            
            id: number,
            snapshotId: string,
            snapshot: Snapshot<T, K>,
            snapshotStore: SnapshotStore<T, K>,
            snapshots: Snapshots<T, K>,
          ): Promise<{ snapshots: Snapshots<BaseData>; }> {
            throw new Error("Function not implemented.");
          },
          handleSnapshotSuccess: function (message: string, snapshot: Snapshot<BaseData, BaseData> | null, snapshotId: string): void {
            throw new Error("Function not implemented.");
          },
          getSnapshotId: function (key: string | SnapshotData<BaseData, BaseData>): unknown {
            throw new Error("Function not implemented.");
          },
          compareSnapshotState: function (snapshot1: Snapshot<BaseData, BaseData> | null, state: any): boolean {
            throw new Error("Function not implemented.");
          },
          eventRecords: null,
          snapshotStore: null,
          getParentId: function (snapshot: Snapshot<BaseData, BaseData>): string | null {
            throw new Error("Function not implemented.");
          },
          getChildIds: function (childSnapshot: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          addChild: function (snapshot: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          removeChild: function (snapshot: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          getChildren: function (): void {
            throw new Error("Function not implemented.");
          },
          hasChildren: function (): boolean {
            throw new Error("Function not implemented.");
          },
          isDescendantOf: function (snapshot: Snapshot<BaseData, BaseData>, childSnapshot: Snapshot<BaseData, BaseData>): boolean {
            throw new Error("Function not implemented.");
          },
          dataItems: null,
          newData: null,
          data: undefined,
          getInitialState: function (): Snapshot<BaseData, BaseData> | null {
            throw new Error("Function not implemented.");
          },
          getConfigOption: function (): SnapshotStoreConfig<BaseData, BaseData> | null {
            throw new Error("Function not implemented.");
          },
          getTimestamp: function (): Date | undefined {
            throw new Error("Function not implemented.");
          },
          getStores: function (): Map<number, SnapshotStore<Data, any>>[] {
            throw new Error("Function not implemented.");
          },
          getData: function (): BaseData | Map<string, Snapshot<BaseData, BaseData>> | null | undefined {
            throw new Error("Function not implemented.");
          },
          setData: function (data: Map<string, Snapshot<BaseData, BaseData>>): void {
            throw new Error("Function not implemented.");
          },
          addData: function (data: Snapshot<BaseData, BaseData>): void {
            throw new Error("Function not implemented.");
          },
          stores: (storeProps: any): SnapshotStore<T, K>[] => {},
          getStore: function (
            storeId: number, 
            snapshotStore: SnapshotStore<BaseData, BaseData>, 
            snapshotId: string, 
            snapshot: Snapshot<BaseData, BaseData>, 
            snapshotStoreConfig: SnapshotStoreConfig<BaseData, BaseData>,
            type: string, 
            event: Event
          ): SnapshotStore<BaseData, BaseData> | null {
            throw new Error("Function not implemented.");
          },
          addStore: function (
            storeId: number,
            snapshotId: string,
            snapshotStore: SnapshotStore<T, K>,
            snapshot: Snapshot<T, K>,
            type: string,
            event: Event
          ): SnapshotStore<BaseData, BaseData> | null {
            throw new Error("Function not implemented.");
          },
          mapSnapshot: function (storeId: number, snapshotStore: SnapshotStore<BaseData, BaseData>, snapshotId: string, snapshot: Snapshot<BaseData, BaseData>, type: string, event: Event): Promise<string | undefined> | null {
            throw new Error("Function not implemented.");
          },
          mapSnapshots: function (storeIds: number[], snapshotId: string, snapshot: Snapshot<BaseData, BaseData>, type: string, event: Event): void | null {
            throw new Error("Function not implemented.");
          },
          removeStore: function (storeId: number, store: SnapshotStore<BaseData, BaseData>, snapshotId: string, snapshot: Snapshot<BaseData, BaseData>, type: string, event: Event): void | null {
            throw new Error("Function not implemented.");
          },
          unsubscribe: function (callback: Callback<Snapshot<BaseData, BaseData>>): void {
            throw new Error("Function not implemented.");
          },
          fetchSnapshot: function (
            callback: (
              snapshotId: string,
              payload: FetchSnapshotPayload<BaseData>,
              snapshotStore: SnapshotStore<BaseData, BaseData>,
              payloadData: BaseData | Data,
              category: symbol | string | Category | undefined,
              timestamp: Date,
              data: BaseData,
              delegate: SnapshotWithCriteria<BaseData, BaseData>[]
            ) => Snapshot<BaseData, BaseData>
          ): Snapshot<BaseData, BaseData> {
            throw new Error("Function not implemented.");
          },
          addSnapshotFailure: function (snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<BaseData, BaseData>, payload: { error: Error; }): void {
            throw new Error("Function not implemented.");
          },
          configureSnapshotStore: function (snapshotStore: SnapshotStore<BaseData, BaseData>, snapshotId: string, data: Map<string, Snapshot<BaseData, BaseData>>, events: Record<string, CalendarEvent<BaseData, BaseData>[]>, dataItems: RealtimeDataItem[], newData: Snapshot<BaseData, BaseData>, payload: ConfigureSnapshotStorePayload<BaseData>, store: SnapshotStore<any, BaseData>, callback: (snapshotStore: SnapshotStore<BaseData, BaseData>) => void): void | null {
            throw new Error("Function not implemented.");
          },
          updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<BaseData, BaseData>, payload: { error: Error; }): void | null {
            throw new Error("Function not implemented.");
          },
          createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<BaseData, BaseData>, payload: { error: Error; }): Promise<void> {
            throw new Error("Function not implemented.");
          },
          createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<BaseData, BaseData>, snapshot: Snapshot<BaseData, BaseData>, payload: { error: Error; }): void | null {
            throw new Error("Function not implemented.");
          },
          createSnapshots: function (id: string, snapshotId: string, snapshot: Snapshot<BaseData, BaseData>, snapshotManager: SnapshotManager<BaseData, BaseData>, payload: CreateSnapshotsPayload<BaseData, BaseData>, callback: (snapshots: Snapshot<BaseData, BaseData>[]) => void | null, snapshotDataConfig?: SnapshotConfig<BaseData, BaseData>[] | undefined, category?: string | symbol | Category): Snapshot<BaseData, BaseData>[] | null {
            throw new Error("Function not implemented.");
          },
          onSnapshot: function (snapshotId: string, snapshot: Snapshot<BaseData, BaseData>, type: string, event: Event, callback: (snapshot: Snapshot<BaseData, BaseData>) => void): void {
            throw new Error("Function not implemented.");
          },
          onSnapshots: function (snapshotId: string, snapshots: Snapshots<BaseData>, type: string, event: Event, callback: (snapshots: Snapshots<BaseData>) => void): void {
            throw new Error("Function not implemented.");
          },
          label: undefined,
          events: undefined,
          handleSnapshot: function (id: string, snapshotId: string, snapshot: BaseData | null, snapshotData: BaseData, category: symbol | string | Category | undefined, callback: (snapshot: BaseData) => void, snapshots: Snapshots<Data>, type: string, event: Event, snapshotContainer?: BaseData | undefined, snapshotStoreConfig?: SnapshotStoreConfig<BaseData, BaseData> | undefined): Promise<Snapshot<BaseData, BaseData> | null> {
            throw new Error("Function not implemented.");
          },
          subscribeToSnapshots: function (snapshotId: string, unsubscribeType: string, unsubscribeDate: Date, unsubscribeReason: string, unsubscribeData: any, callback: (snapshots: Snapshots<BaseData>) => Snapshot<BaseData, BaseData> | null): void {
            throw new Error("Function not implemented.");
          },
          meta: undefined,
          subscribers: []
        },
        {
          id: "2",
          data: {
            assignee: {
              name: "user_2",
              email: "<EMAIL>",
            },
            startDate: new Date(),
            endDate: new Date(),
            component: {} as FC<any>,
          },
        },
      ];
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
        snapshots: WritableDraft<Snapshot<Data, Data>>[];
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
      .addCase(fetchDataStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataStores.fulfilled, (state, action: PayloadAction<DataStore<BaseData, BaseData>[]>) => {
        state.loading = false;
        state.dataStores = action.payload;
      })
      .addCase(fetchDataStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch data stores';
      });
  },
});


// Helper function to fetch the actual data source
async function fetchRealDataSource(): Promise<SnapshotStoreConfig<BaseData, BaseData>[]> {
  // Placeholder logic, replace with actual fetch logic as needed
  return Promise.resolve([
    // Example configs
  ] as SnapshotStoreConfig<BaseData, BaseData>[]);
}

// Helper to initialize each DataStore from a SnapshotStoreConfig
function initializeDataStore(config: SnapshotStoreConfig<BaseData, BaseData>): DataStore<BaseData, BaseData> {
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
