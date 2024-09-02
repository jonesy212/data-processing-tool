import { IHydrateResult } from 'mobx-persist';
import * as React from 'react';
import { createContext, ReactNode, useContext, useState } from 'react';
import { CreateSnapshotsPayload } from '../components/database/Payload';
import { SnapshotManager } from '../components/hooks/useSnapshotManager';
import { Category } from '../components/libraries/categories/generateCategoryProperties';
import { BaseData, Data, DataDetails } from '../components/models/data/Data';
import { NotificationPosition, StatusType } from '../components/models/data/StatusType';
import { RealtimeDataItem } from '../components/models/realtime/RealtimeData';
import { DataStoreMethods } from '../components/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { DataStore } from '../components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import {FetchSnapshotPayload} from '../components/snapshots/FetchSnapshotPayload';
import { Payload, Snapshot, Snapshots, SnapshotsArray, SnapshotUnion } from '../components/snapshots/LocalStorageSnapshotStore';
import { SnapshotConfig } from '../components/snapshots/snapshot';
import { ConfigureSnapshotStorePayload } from '../components/snapshots/SnapshotConfig';
import { SnapshotData } from '../components/snapshots/SnapshotData';
import SnapshotStore, { SubscriberCollection } from '../components/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '../components/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from '../components/snapshots/SnapshotWithCriteria';
import { Callback } from '../components/snapshots/subscribeToSnapshotsImplementation';
import { CalendarEvent } from '../components/state/stores/CalendarEvent';
import { NotificationType, NotificationTypeEnum } from '../components/support/NotificationContext';
import { Subscriber } from '../components/users/Subscriber';
import UniqueIDGenerator from '../generators/GenerateUniqueIds';
import { CategoryProperties } from '../pages/personas/ScenarioBuilder';


interface SnapshotContextType<T extends Data, K extends Data> {
  snapshot: Snapshot<T, K> | null;
  snapshots: Snapshot<T, K>[]; // Using generic types
  createSnapshot: (id: string, snapshotData: SnapshotStoreConfig<any, T>, category: string) => void;
  fetchSnapshot: (id: string) => Promise<Snapshot<T, K>>;
  snapshotStore: SnapshotStore<T, K>;

}

// Create the context with default values
export const SnapshotContext = createContext<SnapshotContextType<any, any> | undefined>(undefined);

export const SnapshotProvider = <T extends Data, K extends Data>({ children }: { children: ReactNode }) => {
  const [snapshot, setSnapshot] = useState<Snapshot<T, K> | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot<T, K>[]>([]);

  // Function to create a new snapshot
  const createSnapshot = (id: string,
    snapshotData: SnapshotStoreConfig<any, T>, category: Category) => {
    try {
      const newSnapshot: Snapshot<T, K> = {
        id,
        data: snapshotData.data,
        timestamp: snapshotData.timestamp || new Date(),
        category,
        topic: snapshotData.topic || '',
        meta: snapshotData.meta || ({} as Data),
        snapshotStoreConfig: {} as SnapshotStoreConfig<T, any>,
        getSnapshotItems: snapshotData.getSnapshotItems(category, snapshots),
        defaultSubscribeToSnapshots: function (
          snapshotId: string,
          callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
          snapshot: Snapshot<T, K> | null
        ): void {
          throw new Error('Function not implemented.');
        },
        versionInfo: null,
        transformSubscriber: function (sub: Subscriber<T, K>): Subscriber<T, K> {
          throw new Error('Function not implemented.');
        },
        transformDelegate: function (): SnapshotStoreConfig<T, K>[] {
          throw new Error('Function not implemented.');
        },
        initializedState: undefined,
        getAllKeys: function (
          storeId: number,
          snapshotId: string,
          category: symbol | string | Category | undefined,
          snapshot: Snapshot<T, K>,
          timestamp: string | number | Date | undefined,
          type: string,
          event: Event,
          id: number,
          snapshotStore: SnapshotStore<T, K>,
          data: T
        ): Promise<string[] | undefined>  {
          throw new Error('Function not implemented.');
        },
        getAllItems: function (): Promise<Snapshot<T, K>[]> | undefined {
          throw new Error('Function not implemented.');
        },
        addDataStatus: function (id: number, status: StatusType | undefined): void {
          throw new Error('Function not implemented.');
        },
        removeData: function (id: number): void {
          throw new Error('Function not implemented.');
        },
        updateData: function (id: number, newData: Snapshot<T, K>): void {
          throw new Error('Function not implemented.');
        },
        updateDataTitle: function (id: number, title: string): void {
          throw new Error('Function not implemented.');
        },
        updateDataDescription: function (id: number, description: string): void {
          throw new Error('Function not implemented.');
        },
        updateDataStatus: function (id: number, status: StatusType | undefined): void {
          throw new Error('Function not implemented.');
        },
        addDataSuccess: function (payload: { data: Snapshot<T, K>[]; }): void {
          throw new Error('Function not implemented.');
        },
        getDataVersions: function (id: number): Promise<Snapshot<T, K>[] | undefined> {
          throw new Error('Function not implemented.');
        },
        updateDataVersions: function (id: number, versions: Snapshot<T, K>[]): void {
          throw new Error('Function not implemented.');
        },
        getBackendVersion: function (): Promise<string | undefined> {
          throw new Error('Function not implemented.');
        },
        getFrontendVersion: function (): Promise<string | IHydrateResult<number>> {
          throw new Error('Function not implemented.');
        },
        fetchData: function (id: number): Promise<SnapshotStore<T, K>[]> {
          throw new Error('Function not implemented.');
        },
        defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K>>, snapshot: Snapshot<T, K>): string {
          throw new Error('Function not implemented.');
        },
        handleSubscribeToSnapshot: function (snapshotId: string,
          callback: Callback<Snapshot<T, K>>,
          snapshot: Snapshot<T, K>): void {
          throw new Error('Function not implemented.');
        },
        removeItem: function (key: string): Promise<void> {
          throw new Error('Function not implemented.');
        },
        getSnapshot: function (snapshot: (id: string) => Promise<{ category: any; timestamp: any; id: any; snapshot: Snapshot<T, K>; snapshotStore: SnapshotStore<T, K>; data: T; }> | undefined): Promise<Snapshot<T, K>> {
          throw new Error('Function not implemented.');
        },
        getSnapshotSuccess: function (snapshot: Snapshot<T, K>): Promise<SnapshotStore<T, K>> {
          throw new Error('Function not implemented.');
        },
        setItem: function (key: T, value: T): Promise<void> {
          throw new Error('Function not implemented.');
        },
        getDataStore: (): Promise<DataStore<T, K>> => {
          throw new Error('Function not implemented.');
        },
        addSnapshotSuccess: function (snapshot: T, subscribers: SubscriberCollection<T, K>): void {
          throw new Error('Function not implemented.');
        },
        deepCompare: function (objA: any, objB: any): boolean {
          throw new Error('Function not implemented.');
        },
        shallowCompare: function (objA: any, objB: any): boolean {
          throw new Error('Function not implemented.');
        },
        getDataStoreMethods: function (): DataStoreMethods<T, K> {
          throw new Error('Function not implemented.');
        },
        getDelegate: function (context: { 
          useSimulatedDataSource: boolean; 
          simulatedDataSource: SnapshotStoreConfig<T, K>[];
        }
        ): SnapshotStoreConfig<T, K>[] {
          throw new Error('Function not implemented.');
        },
        determineCategory: function (snapshot: Snapshot<T, K> | null | undefined): string {
          throw new Error('Function not implemented.');
        },
        determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
          throw new Error('Function not implemented.');
        },
        removeSnapshot: function (snapshotToRemove: Snapshot<T, K>): void {
          throw new Error('Function not implemented.');
        },
        addSnapshotItem: function (item: Snapshot<any, any> | SnapshotStoreConfig<T, K>): void {
          throw new Error('Function not implemented.');
        },
        addNestedStore: function (store: SnapshotStore<T, K>): void {
          throw new Error('Function not implemented.');
        },
        clearSnapshots: function (): void {
          throw new Error('Function not implemented.');
        },
        addSnapshot: function (
          snapshot: Snapshot<T, K>,
          snapshotId: string,
          subscribers: SubscriberCollection<T, K>
        ): Promise<Snapshot<T, K> | undefined> {
          throw new Error('Function not implemented.');
        },
        createSnapshot: undefined,
        createInitSnapshot: function (
          id: string,
           initialData: T, 
          snapshotStoreConfig: SnapshotStoreConfig<SnapshotUnion<any>, K>,
          category: K
        ): SnapshotWithCriteria<T, K> {
          throw new Error('Function not implemented.');
        },
        setSnapshotSuccess: function (
          snapshotData: SnapshotStore<T, K>,
          subscribers: SubscriberCollection<T, K>
          ): void {
          throw new Error('Function not implemented.');
        },
        setSnapshotFailure: function (error: Error): void {
          throw new Error('Function not implemented.');
        },
        updateSnapshots: function (): void {
          throw new Error('Function not implemented.');
        },
        updateSnapshotsSuccess: function (snapshotData: (subscribers: Subscriber<T, K>[], snapshot: Snapshots<T>) => void): void {
          throw new Error('Function not implemented.');
        },
        updateSnapshotsFailure: function (error: Payload): void {
          throw new Error('Function not implemented.');
        },
        initSnapshot: function (
          snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
          snapshotId: string | null,
          snapshotData: SnapshotStore<T, K>,
          category: symbol | string | Category | undefined,
          snapshotConfig: SnapshotStoreConfig<T, K>,
          callback: (snapshotStore: SnapshotStore<any, any>) => void
        ): void {
          throw new Error('Function not implemented.');
        },
        takeSnapshot: function (snapshot: Snapshot<T, K>, subscribers: Subscriber<T, K>[]): Promise<{ snapshot: Snapshot<T, K>; }> {
          throw new Error('Function not implemented.');
        },
        takeSnapshotSuccess: function (snapshot: Snapshot<T, K>): void {
          throw new Error('Function not implemented.');
        },
        takeSnapshotsSuccess: function (snapshots: T[]): void {
          throw new Error('Function not implemented.');
        },
        flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<T, K>, index: number, array: SnapshotStoreConfig<T, K>[]) => U): U extends (infer I)[] ? I[] : U[] {
          throw new Error('Function not implemented.');
        },
        getState: function () {
          throw new Error('Function not implemented.');
        },
        setState: function (state: any): void {
          throw new Error('Function not implemented.');
        },
        validateSnapshot: function (
          snapshotId: string, 
          snapshot: Snapshot<T, K>
        ): boolean {
          throw new Error('Function not implemented.');
        },
        handleActions: function (action: (selectedText: string) => void): void {
          throw new Error('Function not implemented.');
        },
        setSnapshot: function (snapshot: Snapshot<T, K>): void {
          throw new Error('Function not implemented.');
        },
        transformSnapshotConfig: function <T extends BaseData>(config: SnapshotStoreConfig<T, T>): SnapshotStoreConfig<T, T> {
          throw new Error('Function not implemented.');
        },
        setSnapshots: function (snapshots: Snapshots<T>): void {
          throw new Error('Function not implemented.');
        },
        clearSnapshot: function (): void {
          throw new Error('Function not implemented.');
        },
        mergeSnapshots: function (snapshots: Snapshots<T>, category: string): void {
          throw new Error('Function not implemented.');
        },
        reduceSnapshots: function <U>(callback: (acc: U, snapshot: Snapshot<T, K>) => U, initialValue: U): U | undefined {
          throw new Error('Function not implemented.');
        },
        sortSnapshots: function (): void {
          throw new Error('Function not implemented.');
        },
        filterSnapshots: function (): void {
          throw new Error('Function not implemented.');
        },
        findSnapshot: function (predicate: (snapshot: Snapshot<T, K>) => boolean): Snapshot<T, K> | undefined {
          throw new Error('Function not implemented.');
        },
        getSubscribers: function (
          subscribers: Subscriber<T, K>[], 
          snapshots: Snapshots<T>
        ): Promise<{
          subscribers: Subscriber<T, K>[]; 
          snapshots: Snapshots<T>;
         }> {
          throw new Error('Function not implemented.');
        },
        notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
          throw new Error('Function not implemented.');
        },
        notifySubscribers: function (
          subscribers: Subscriber<T, K>[],
          data: Partial<SnapshotStoreConfig<SnapshotUnion<BaseData>, any>>
        ): Subscriber<T, K>[] {
          throw new Error('Function not implemented.');
        },

        getAllSnapshots: async (
          snapshotId: string,
          snapshotData: T,
          timestamp: string,
          type: string,
          event: Event,
          id: number,
          snapshotStore: SnapshotStore<T, K>,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<T, K>,
          data: T,
          dataCallback?: (
            subscribers: Subscriber<T, K>[],
            snapshots: Snapshots<T>
          ) => Promise<Snapshots<T>>
        ): Promise<Snapshot<T, K>[]> => {
          try {
            // If a callback is provided, use it to get the snapshots
            if (dataCallback) {
              const subscribers = await dataStoreMethods.getSubscribers(); // Assuming you have a method to get subscribers
              const snapshots = await dataCallback(subscribers, []); // Pass subscribers and an empty array initially
              return Object.values(snapshots); // Convert SnapshotsObject to an array
            }
        
            // Fallback to standard logic if no callback is provided
            const keys = await dataStoreMethods.getAllKeys(
              snapshotId,
              category,
              snapshotStore,
              timestamp,
              type,
              event,
              id,
              snapshotStore,
              data
            );
        
            // Handle the case when keys is undefined
            if (!keys) {
              throw new Error("Failed to retrieve keys");
            }
        
            // Retrieve snapshots using the simplified getSnapshotByKey
            const items: (Snapshot<T, K> | undefined)[] = await Promise.all(
              keys.map(async (key) => {
                const item = await dataStoreMethods.getSnapshotByKey(id, key); // Pass storeId and key
                return item;
              })
            );
        
            // Filter out undefined values and return the resulting array of snapshots
            return items.filter(
              (item): item is Snapshot<T, K> => item !== undefined
            );
        
          } catch (error: any) {
            throw new Error(`Failed to get all snapshots: ${error.message}`);
          }
        },               
        // Updated generateId method
        generateId(
          prefix: string,
          name: string,
          type: NotificationTypeEnum,
          id?: string,
          title?: string,
          chatThreadName?: string,
          chatMessageId?: string,
          chatThreadId?: string,
          dataDetails?: DataDetails,
          generatorType?: string
        ): string {
          // Use UniqueIDGenerator to generate the ID based on the parameters
          return UniqueIDGenerator.generateID(
            prefix,
            name,
            type,
            id,
            title,
            chatThreadName,
            chatMessageId,
            chatThreadId,
            dataDetails,
            generatorType
          );
        },
        batchFetchSnapshots: snapshotData?.batchFetchSnapshotsRequest,
        batchTakeSnapshotsRequest: function (snapshotData: any): void {
          throw new Error('Function not implemented.');
        },
        batchUpdateSnapshotsRequest: function (snapshotData: (subscribers: Subscriber<T, K>[]) => Promise<{ subscribers: Subscriber<T, K>[]; snapshots: Snapshots<T>; }>): void {
          throw new Error('Function not implemented.');
        },
        filterSnapshotsByStatus: undefined,
        filterSnapshotsByCategory: undefined,
        filterSnapshotsByTag: undefined,
        batchFetchSnapshotsSuccess: function (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T>): void {
          throw new Error('Function not implemented.');
        },
        batchFetchSnapshotsFailure: function (payload: { error: Error; }): void {
          throw new Error('Function not implemented.');
        },
        batchUpdateSnapshotsSuccess: function (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T>): void {
          throw new Error('Function not implemented.');
        },
        batchUpdateSnapshotsFailure: function (payload: { error: Error; }): void {
          throw new Error('Function not implemented.');
        },
        batchTakeSnapshot: function (snapshotStore: SnapshotStore<T, K>, snapshots: Snapshots<T>): Promise<{ snapshots: Snapshots<T>; }> {
          throw new Error('Function not implemented.');
        },
        handleSnapshotSuccess: function (snapshot: Snapshot<Data, Data> | null, snapshotId: string): void {
          throw new Error('Function not implemented.');
        },
        getSnapshotId: function (key: string | SnapshotData<T, K>): unknown {
          throw new Error('Function not implemented.');
        },
        compareSnapshotState: function (arg0: Snapshot<T, K> | null, state: any): unknown {
          throw new Error('Function not implemented.');
        },
        eventRecords: null,
        snapshotStore: null,
        getParentId: function (snapshot: Snapshot<T, K>): string | null {
          throw new Error('Function not implemented.');
        },
        getChildIds: function (childSnapshot: Snapshot<BaseData, K>): void {
          throw new Error('Function not implemented.');
        },
        addChild: function (snapshot: Snapshot<T, K>): void {
          throw new Error('Function not implemented.');
        },
        removeChild: function (snapshot: Snapshot<T, K>): void {
          throw new Error('Function not implemented.');
        },
        getChildren: function (): void {
          throw new Error('Function not implemented.');
        },
        hasChildren: function (): boolean {
          throw new Error('Function not implemented.');
        },
        isDescendantOf: function (snapshot: Snapshot<T, K>, childSnapshot: Snapshot<T, K>): boolean {
          throw new Error('Function not implemented.');
        },
        dataItems: null,
        newData: null,
        getInitialState: function (): Snapshot<T, K> | null {
          throw new Error('Function not implemented.');
        },
        getConfigOption: function (): SnapshotStoreConfig<T, K> | null {
          throw new Error('Function not implemented.');
        },
        getTimestamp: function (): Date | undefined {
          throw new Error('Function not implemented.');
        },
        getStores: function (): Map<number, SnapshotStore<Data, any>>[] {
          throw new Error('Function not implemented.');
        },
        getData: function (): T | Map<string, Snapshot<T, K>> | null | undefined {
          throw new Error('Function not implemented.');
        },
        setData: function (data: Map<string, Snapshot<T, K>>): void {
          throw new Error('Function not implemented.');
        },
        addData: function (data: Snapshot<T, K>): void {
          throw new Error('Function not implemented.');
        },
        stores: null,
        getStore: function (storeId: number, snapshotStore: SnapshotStore<T, K>, snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event): SnapshotStore<T, K> | null {
          throw new Error('Function not implemented.');
        },
        addStore: function (storeId: number, snapshotStore: SnapshotStore<T, K>, snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event): void | null {
          throw new Error('Function not implemented.');
        },
        mapSnapshot: function (storeId: number, snapshotStore: SnapshotStore<T, K>, snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event): Promise<string | undefined> | null {
          throw new Error('Function not implemented.');
        },
        mapSnapshots: function (storeIds: number[],
          snapshotId: string,
          category: symbol | string | Category | undefined,
          snapshot: Snapshot<T, K>,
          timestamp: string | number | Date | undefined,
          type: string,
          event: Event,
          id: number,
          snapshotStore: SnapshotStore<T, K>,
          data: K,
          callback: (
            storeIds: number[],
            snapshotId: string,
            category: symbol | string | Category | undefined,
            snapshot: Snapshot<T, K>,
            timestamp: string | number | Date | undefined,
            type: string,
            event: Event,
            id: number,
            snapshotStore: SnapshotStore<T, K>,
            data: K,
            index: number
          ) => any
        ): any | null {
          throw new Error('Function not implemented.');
        },
        removeStore: function (storeId: number, store: SnapshotStore<T, K>, snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event): void | null {
          throw new Error('Function not implemented.');
        },
        unsubscribe: function (callback: Callback<Snapshot<T, K>>): void {
          throw new Error('Function not implemented.');
        },
        fetchSnapshot: function (callback: (
          snapshotId: string,
          payload: FetchSnapshotPayload<K>, 
          snapshotStore: SnapshotStore<T, K>, 
          payloadData: T | Data, 
          category: symbol | string | Category | undefined, 
          timestamp: Date,
          data: T, 
          delegate: SnapshotWithCriteria<T, K>[]
        ) => Snapshot<T, K>): Snapshot<T, K> {
          throw new Error('Function not implemented.');
        },
        addSnapshotFailure: function (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error; }): void {
          throw new Error('Function not implemented.');
        },
        configureSnapshotStore: function (snapshotStore: SnapshotStore<T, K>, snapshotId: string, data: Map<string, Snapshot<T, K>>, events: Record<string, CalendarEvent<T, K>[]>, dataItems: RealtimeDataItem[], newData: Snapshot<T, K>, payload: ConfigureSnapshotStorePayload<T>, store: SnapshotStore<any, K>, callback: (snapshotStore: SnapshotStore<T, K>) => void): void | null {
          throw new Error('Function not implemented.');
        },
        updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error; }): void | null {
          throw new Error('Function not implemented.');
        },
        createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error; }): Promise<void> {
          throw new Error('Function not implemented.');
        },
        createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, payload: { error: Error; }): void | null {
          throw new Error('Function not implemented.');
        },
        createSnapshots: function (
          id: string, 
          snapshotId: string, snapshot: Snapshot<T, K>,
           snapshotManager: SnapshotManager<T, K>, 
          payload: CreateSnapshotsPayload<T, K>,
          callback: (snapshots: Snapshot<T, K>[]
             
           ) => void | null, snapshotDataConfig?: SnapshotConfig<T, K>[] | undefined, category?: string | CategoryProperties): Snapshot<T, K>[] | null {
          throw new Error('Function not implemented.');
        },
        onSnapshot: function (snapshotId: string, snapshot: Snapshot<T, K>, type: string, event: Event, callback: (snapshot: Snapshot<T, K>) => void): void {
          throw new Error('Function not implemented.');
        },
        onSnapshots: function (snapshotId: string, snapshots: Snapshots<T>, type: string, event: Event, callback: (snapshots: Snapshots<T>) => void): void {
          throw new Error('Function not implemented.');
        },
        label: undefined,
        events: undefined,

        handleSnapshot: function (
          id: string,
          snapshotId: string,
          snapshot: T | null,
          snapshotData: T,
          category: Category | undefined,
          callback: (snapshot: T) => void,
          snapshots: SnapshotsArray<T>,
          type: string,
          event: Event,
          snapshotContainer?: T,
          snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null,
          ): Promise<Snapshot<T, K> | null> {
          throw new Error('Function not implemented.');
        },

        subscribeToSnapshots: function (
          snapshotId: string,
          callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null
        ):  [] | SnapshotsArray<T> {
          throw new Error('Function not implemented.');
        }
      };

      setSnapshots(prev => [...prev, newSnapshot]);
      setSnapshot(newSnapshot);
    } catch (error) {
      console.error('Error creating snapshot:', error);
    }
  };

  // Function to fetch a snapshot by id
  const fetchSnapshot = <T extends Data, K extends Data>(id: string) => {
    return new Promise<Snapshot<T, K>>((resolve, reject) => {
      // Fetch the snapshot from the API
      fetchSnapshotFromAPI<T, K>(id)
        .then((snapshot) => {
          // Resolve the promise with the fetched snapshot
          resolve(snapshot);
        })
        .catch((error) => {
          // Reject the promise with the error
          reject(error);
        });
    });
  };
  

  // Provide context value
  const value: SnapshotContextType<T, K> = {
    snapshot,
    snapshots,
    createSnapshot,
    fetchSnapshot
  };

  return (
    <SnapshotContext.Provider value={value}>
      {children}
    </SnapshotContext.Provider>
  );
};

// Custom hook to use the SnapshotContext
export const useSnapshot = <T extends Data, K extends Data>(): SnapshotContextType<T, K> => {
  const context = useContext(SnapshotContext) as SnapshotContextType<T, K> | undefined;
  if (!context) {
    throw new Error('useSnapshot must be used within a SnapshotProvider');
  }
  return context;
};



function fetchSnapshotFromAPI<T extends Data, K extends Data>(id: string): Promise<Snapshot<T, K>> {
  return new Promise((resolve, reject) => {
    // Wrapping async logic in a Promise
    fetch(`/api/snapshots/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch snapshot with ID: ${id}. Status: ${response.status}`);
        }
        return response.json(); // Parse the JSON response
      })
      .then(data => {
        // Ensure the data fits the Snapshot<T, K> type
        const fetchedSnapshot: Snapshot<T, K> = {
          id: data.id,
          data: data.data,
          timestamp: new Date(data.timestamp), // Assuming timestamp is returned as a string
          category: data.category,
          topic: data.topic,
          meta: data.meta,
          snapshotStoreConfig: data.snapshotStoreConfig,
          getSnapshotItems: data.getSnapshotItems,
          defaultSubscribeToSnapshots: data.defaultSubscribeToSnapshots,
          versionInfo: data.versionInfo,
          transformSubscriber: data.transformSubscriber,
          transformDelegate: data.transformDelegate,
          initializedState: data.initializedState,
          getAllKeys: data.getAllKeys,
          getAllItems: data.getAllItems,
          addDataStatus: data.addDataStatus,
          removeData: data.removeData,
          updateData: data.updateData,
          updateDataTitle: data.updateDataTitle,
          updateDataDescription: data.updateDataDescription,
          updateDataStatus: data.updateDataStatus,
          addDataSuccess: data.addDataSuccess,
          getDataVersions: data.getDataVersions,
          updateDataVersions: data.updateDataVersions,
          getBackendVersion: data.getBackendVersion,
          getFrontendVersion: data.getFrontendVersion,
          fetchData: data.fetchData,
          defaultSubscribeToSnapshot: data.defaultSubscribeToSnapshot,
          handleSubscribeToSnapshot: data.handleSubscribeToSnapshot,
          removeItem: data.removeItem,
          getSnapshot: data.getSnapshot,
          getSnapshotSuccess: data.getSnapshotSuccess,
          setItem: data.setItem,
          getDataStore: data.getDataStore,
          addSnapshotSuccess: data.addSnapshotSuccess,
          deepCompare: data.deepCompare,
          shallowCompare: data.shallowCompare,
          getDataStoreMethods: data.getDataStoreMethods,
          getDelegate: data.getDelegate,
          determineCategory: data.determineCategory,
          determinePrefix: data.determinePrefix,
          removeSnapshot: data.removeSnapshot,
          addSnapshotItem: data.addSnapshotItem,
          addNestedStore: data.addNestedStore,
          clearSnapshots: data.clearSnapshots,
          addSnapshot: data.addSnapshot,
          createSnapshot: data.createSnapshot,
          createInitSnapshot: data.createInitSnapshot,
          setSnapshotSuccess: data.setSnapshotSuccess,
          setSnapshotFailure: data.setSnapshotFailure,
          updateSnapshots: data.updateSnapshots,
          updateSnapshotsSuccess: data.updateSnapshotsSuccess,
          updateSnapshotsFailure: data.updateSnapshotsFailure,
          initSnapshot: data.initSnapshot,
          takeSnapshot: data.takeSnapshot,
          takeSnapshotSuccess: data.takeSnapshotSuccess,
          takeSnapshotsSuccess: data.takeSnapshotsSuccess,
          flatMap: data.flatMap,
          getState: data.getState,
          setState: data.setState,
          validateSnapshot: data.validateSnapshot,
          handleActions: data.handleActions,
          setSnapshot: data.setSnapshot,
          transformSnapshotConfig: data.transformSnapshotConfig,
          setSnapshots: data.setSnapshots,
          clearSnapshot: data.clearSnapshot,
          mergeSnapshots: data.mergeSnapshots,
          reduceSnapshots: data.reduceSnapshots,
          sortSnapshots: data.sortSnapshots,
          filterSnapshots: data.filterSnapshots,
          findSnapshot: data.findSnapshot,
          getSubscribers: data.getSubscribers,
          notify: data.notify,
          notifySubscribers: data.notifySubscribers,
          getAllSnapshots: data.getAllSnapshots,
          initialConfig: data.initialConfig,
          removeSubscriber: data.removeSubscriber,
          onInitialize: data.onInitialize,
          onError: data.onError,
         
          snapshot: data.snapshot,
          setCategory: data.setCategory,
          applyStoreConfig: data.applyStoreConfig,
          snapshotData: data.snapshotData,
         
          getItem: data.getItem,
          getDataStoreMap: data.getDataStoreMap,
          emit: data.emit,
          addStoreConfig: data.addStoreConfig,
          
          handleSnapshotConfig: data.handleSnapshotConfig,
          getSnapshotConfig: data.getSnapshotConfig,
          getSnapshotListByCriteria: data.getSnapshotListByCriteria,
          mapSnapshots: data.mapSnapshots,
         
          takeLatestSnapshot: data.takeLatestSnapshot,
          updateSnapshot: data.updateSnapshot,
          addSnapshotSubscriber: data.addSnapshotSubscriber,
          removeSnapshotSubscriber: data.removeSnapshotSubscriber,
         
          getSnapshotConfigItems: data.getSnapshotConfigItems,
          subscribeToSnapshots: data.subscribeToSnapshots,
          executeSnapshotAction: data.executeSnapshotAction,
          subscribeToSnapshot: data.subscribeToSnapshot,
         
          unsubscribeFromSnapshot: data.unsubscribeFromSnapshot,
          subscribeToSnapshotsSuccess: data.subscribeToSnapshotsSuccess,
          unsubscribeFromSnapshots: data.unsubscribeFromSnapshots,
          getSnapshotItemsSuccess: data.getSnapshotItemsSuccess,
         
          getSnapshotItemSuccess: data.getSnapshotItemSuccess,
          getSnapshotKeys: data.getSnapshotKeys,
          getSnapshotIdSuccess: data.getSnapshotIdSuccess,
          getSnapshotValuesSuccess: data.getSnapshotValuesSuccess,
         
          getSnapshotWithCriteria: data.getSnapshotWithCriteria,
          reduceSnapshotItems: data.reduceSnapshotItems,
          subscribeToSnapshotList: data.subscribeToSnapshotList,
          label: data.label,
         
          events: data.events,
          restoreSnapshot: data.restoreSnapshot,
          handleSnapshot: data.handleSnapshot,
          subscribers: data.subscribers,
          snapshotStore: data.snapshotStore,
           };
        resolve(fetchedSnapshot); // Resolve with the snapshot
      })
      .catch(error => {
        reject(error); // Reject in case of error
      });
  });
}



function fetchSnapshotStoreFromAPI<T extends Data, K extends Data>(id: string): Promise<SnapshotStore<T, K>> {
  return new Promise((resolve, reject) => {
    // Wrapping async logic in a Promise
    fetch(`/api/snapshotStores/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch snapshot store with ID: ${id}. Status: ${response.status}`);
        }
        return response.json(); // Parse the JSON response
      })
      .then(data => {
        // Ensure the data fits the SnapshotStore<T, K> type
        const fetchedSnapshotStore: SnapshotStore<T, K> = {
          id: data.id,
          snapshots: data.snapshots,
          // snapshotData: data.snapshotData,
          category: data.category,
          topic: data.topic,
          meta: data.meta,
          snapshotStoreConfig: data.snapshotStoreConfig,
          addSnapshot: data.addSnapshot,
          removeSnapshot: data.removeSnapshot,
          updateSnapshot: data.updateSnapshot,
          // getSnapshotById: data.getSnapshotById,
          findSnapshot: data.findSnapshot,
          filterSnapshots: data.filterSnapshots,
          sortSnapshots: data.sortSnapshots,
          mapSnapshots: data.mapSnapshots,
          reduceSnapshots: data.reduceSnapshots,
          clearSnapshots: data.clearSnapshots,
          // getSnapshotData: data.getSnapshotData,
          notifySubscribers: data.notifySubscribers,
          subscribeToSnapshots: data.subscribeToSnapshots,
          unsubscribe: data.unsubscribe,
          configureSnapshotStore: data.configureSnapshotStore,
          getAllSnapshots: data.getAllSnapshots,
          // getConfigOption: data.getConfigOption,
          // getTimestamp: data.getTimestamp,
          // getStores: data.getStores,
          getStore: data.getStore,
          addStore: data.addStore,
          removeStore: data.removeStore,
          handleSnapshot: data.handleSnapshot,
          setSnapshot: data.setSnapshot,
          getData: data.getData,
          setData: data.setData,
          addData: data.addData,
          removeData: data.removeData,
          updateData: data.updateData,
          fetchSnapshot: data.fetchSnapshot,
          initSnapshot: data.initSnapshot,
          takeSnapshot: data.takeSnapshot,
          validateSnapshot: data.validateSnapshot,
          mergeSnapshots: data.mergeSnapshots,
          batchUpdateSnapshotsRequest: data.batchUpdateSnapshotsRequest,
          batchUpdateSnapshotsSuccess: data.batchUpdateSnapshotsSuccess,
          batchUpdateSnapshotsFailure: data.batchUpdateSnapshotsFailure,
          batchTakeSnapshot: data.batchTakeSnapshot,
          batchFetchSnapshots: data.batchFetchSnapshots,
          batchFetchSnapshotsSuccess: data.batchFetchSnapshotsSuccess,
          batchFetchSnapshotsFailure: data.batchFetchSnapshotsFailure,
          batchTakeSnapshotsRequest: data.batchTakeSnapshotsRequest,
          handleSnapshotSuccess: data.handleSnapshotSuccess,
          getSnapshotId: data.getSnapshotId,
          compareSnapshotState: data.compareSnapshotState,
          eventRecords: data.eventRecords,
          snapshotStore: data.snapshotStore,
          getParentId: data.getParentId,
          getChildIds: data.getChildIds,
          // addChild: data.addChild,
          // removeChild: data.removeChild,
          // getChildren: data.getChildren,
          // hasChildren: data.hasChildren,
          // isDescendantOf: data.isDescendantOf,
          dataItems: data.dataItems,
          newData: data.newData,
          // getInitialState: data.getInitialState,
          getBackendVersion: data.getBackendVersion,
          getFrontendVersion: data.getFrontendVersion,
          flatMap: data.flatMap,
          getAllKeys: data.getAllKeys,
          getAllItems: data.getAllItems,
          mapSnapshot: data.mapSnapshot,
          getState: data.getState,
          setState: data.setState,
          // label: data.label,
          events: data.events,
          notify: data.notify,
          addSnapshotSuccess: data.addSnapshotSuccess,
          addSnapshotFailure: data.addSnapshotFailure,
          createSnapshot: data.createSnapshot,
          // createSnapshots: data.createSnapshots,
          createSnapshotSuccess: data.createSnapshotSuccess,
          createSnapshotFailure: data.createSnapshotFailure,
          onSnapshot: data.onSnapshot,
          onSnapshots: data.onSnapshots,
          handleActions: data.handleActions,
          findIndex: data.findIndex,
          splice: data.splice,
          key: '',
          keys: [],
          date: undefined,
          config: undefined,
          title: '',
          message: undefined,
          timestamp: undefined,
          createdBy: '',
          type: undefined,
          subscribers: [],
          store: undefined,
          stores: null,
          snapshotConfig: undefined,
          snapshotMethods: undefined,
          getSnapshotsBySubscriber: undefined,
          getSnapshotsBySubscriberSuccess: undefined,
          getSnapshotsByTopic: undefined,
          getSnapshotsByTopicSuccess: undefined,
          getSnapshotsByCategory: undefined,
          getSnapshotsByCategorySuccess: undefined,
          getSnapshotsByKey: undefined,
          getSnapshotsByKeySuccess: undefined,
          getSnapshotsByPriority: undefined,
          getSnapshotsByPrioritySuccess: undefined,
          getStoreData: undefined,
          updateStoreData: undefined,
          updateDelegate: undefined,
          getSnapshotContainer: undefined,
          getSnapshotVersions: undefined,
          deleteSnapshot: undefined,
          getSnapshotItems: data.getSnapshotItems,
          dataStore: undefined,
          snapshotStores: undefined,
          initialState: undefined,
          snapshotItems: [],
          nestedStores: [],
          snapshotIds: [],
          dataStoreMethods: undefined,
          delegate: undefined,
          findSnapshotStoreById: data.findSnapshotStoreById,
          saveSnapshotStore: data.saveSnapshotStore,
          subscriberId: undefined,
          length: undefined,
          content: undefined,
          value: null,
          todoSnapshotId: undefined,
          storeId: 0,
          handleSnapshotOperation: data.handleSnapshotOperation,
          getCustomStore: data.getCustomStore,
          addSCustomStore: data.addSCustomStore,
          getDataStore: data.getDataStore,
          addSnapshotToStore: data.addSnapshotToStore,
          addSnapshotItem: data.addSnapshotItem,
          addNestedStore: data.addNestedStore,
          defaultSubscribeToSnapshots: data.defaultSubscribeToSnapshots,
          defaultCreateSnapshotStores: data.defaultCreateSnapshotStores,
          createSnapshotStores: data.createSnapshotStores,
          subscribeToSnapshot: data.subscribeToSnapshot,
          defaultOnSnapshots: data.defaultOnSnapshots,
          transformSubscriber: data.transformSubscriber,
          isSnapshotStoreConfig: data.isSnapshotStoreConfig,
          transformDelegate: data.transformDelegate,
          initializedState: undefined,
          transformedDelegate: [],
          getSnapshotIds: [],
          getNestedStores: [],
          getFindSnapshotStoreById: undefined,
          addDataStatus: data.addDataStatus,
          updateDataTitle: data.updateDataTitle,
          updateDataDescription: data.updateDataDescription,
          updateDataStatus: data.updateDataStatus,
          addDataSuccess: data.addDataSuccess,
          getDataVersions: data.getDataVersions,
          updateDataVersions: data.updateDataVersions,
          fetchData: data.fetchData,
          defaultSubscribeToSnapshot: data.defaultSubscribeToSnapshot,
          handleSubscribeToSnapshot: data.handleSubscribeToSnapshot,
          snapshot: data.snapshot,
          removeItem: data.removeItem,
          getSnapshot: data.getSnapshot,
          getSnapshotSuccess: data.getSnapshotSuccess,
          getSnapshotArray: data.getSnapshotArray,
          getItem: data.getItem,
          setItem: data.setItem,
          deepCompare: data.deepCompare,
          shallowCompare: data.shallowCompare,
          getDataStoreMethods: data.getDataStoreMethods,
          getDelegate: data.getDelegate,
          determineCategory: data.determineCategory,
          determineSnapshotStoreCategory: data.determineSnapshotStoreCategory,
          determinePrefix: data.determinePrefix,
          updateSnapshotSuccess: data.updateSnapshotSuccess,
          updateSnapshotFailure: data.updateSnapshotFailure,
          createInitSnapshot: data.createInitSnapshot,
          clearSnapshotSuccess: data.clearSnapshotSuccess,
          clearSnapshotFailure: data.clearSnapshotFailure,
          setSnapshotSuccess: data.setSnapshotSuccess,
          setSnapshotFailure: data.setSnapshotFailure,
          updateSnapshots: data.updateSnapshots,
          updateSnapshotsSuccess: data.updateSnapshotsSuccess,
          updateSnapshotsFailure: data.updateSnapshotsFailure,
          takeSnapshotSuccess: data.takeSnapshotSuccess,
          takeSnapshotsSuccess: data.takeSnapshotsSuccess,
          transformSnapshotConfig: data.transformSnapshotConfig,
          setSnapshotData: data.setSnapshotData,
          setSnapshots: data.setSnapshots,
          clearSnapshot: data.clearSnapshot,
          mapSnapshotsAO: data.mapSnapshotsAO,
          getSubscribers: data.getSubscribers,
          subscribe: data.subscribe,
          fetchSnapshotSuccess: data.fetchSnapshotSuccess,
          fetchSnapshotFailure: data.fetchSnapshotFailure,
          getSnapshots: data.getSnapshots,
          getSnapshotStoreData: data.getSnapshotStoreData,
          generateId: data.generateId,
          [Symbol.iterator]: data[Symbol.iterator]
        };
        resolve(fetchedSnapshotStore); // Resolve with the snapshot store
      })
      .catch(error => {
        reject(error); // Reject in case of error
      });
  });
}
