// SnapshotContext.ts
import { IHydrateResult } from "mobx-persist";
import * as React from "react";
import { createContext, ReactNode, useContext, useState } from "react";
import { SnapshotManager } from "../components/hooks/useSnapshotManager";
import { Category } from "../components/libraries/categories/generateCategoryProperties";
import { BaseData, Data, DataDetails } from "../components/models/data/Data";
import {
    NotificationPosition,
    StatusType,
} from "../components/models/data/StatusType";
import { DataStoreMethods } from "../components/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import {
    Payload,
    Snapshot,
    Snapshots,
    SnapshotUnion
} from "../components/snapshots/LocalStorageSnapshotStore";

import { FetchedSnapshotStore } from "../components/snapshots/FetchSnapshotStorePayload";
import {
    SnapshotConfig
} from "../components/snapshots/SnapshotConfig";
import SnapshotStore, {
    SubscriberCollection,
} from "../components/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "../components/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "../components/snapshots/SnapshotWithCriteria";
import { Callback } from "../components/snapshots/subscribeToSnapshotsImplementation";
import {
    NotificationType,
    NotificationTypeEnum,
} from "../components/support/NotificationContext";
import { Subscriber } from "../components/users/Subscriber";
import UniqueIDGenerator from "../generators/GenerateUniqueIds";
import { CategoryProperties } from "../pages/personas/ScenarioBuilder";

// const fetchSnapshotFromAPI = async (id: string) => {
//   try {
//     const response = await fetch(`/api/snapshots/${id}`);
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching snapshot:", error);
//     throw error;
//   }
// };

interface SnapshotContextType<T extends Data, K extends Data> {
  snapshot: Snapshot<T, K> | null;
  snapshots: Snapshot<T, K>[]; // Using generic types
  createSnapshot: (
    id: string,
    snapshotData: SnapshotStoreConfig<any, T>,
    category: string
  ) => void;
  fetchSnapshot: (id: string) => Promise<Snapshot<T, K>>;
  snapshotStore: SnapshotStore<T, K>;
}

// Create the context with default values
export const SnapshotContext = createContext<
  SnapshotContextType<any, any> | undefined
>(undefined);

export const SnapshotProvider = <T extends Data, K extends Data>({
  children,
}: {
  children: ReactNode;
}) => {
  const [snapshot, setSnapshot] = useState<Snapshot<T, K> | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot<T, K>[]>([]);

  // Function to create a new snapshot
  const createSnapshot = (
    id: string,
    snapshotData: SnapshotStoreConfig<T, K>,
    category: Category
  ) => {
    try {
      const newSnapshot: Snapshot<T, K> = {
        id,
        data: snapshotData.data,
        timestamp: snapshotData.timestamp || new Date(),
        category,
        topic: snapshotData.topic || "",
        meta: snapshotData.meta || ({} as Data),
        snapshotStoreConfig: {} as SnapshotStoreConfig<T, any>,
        getSnapshotItems: snapshotData.getSnapshotItems(category, snapshots),
        defaultSubscribeToSnapshots: function (
          snapshotId: string,
          callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
          snapshot: Snapshot<T, K> | null
        ): void {
          throw new Error("Function not implemented.");
        },
        versionInfo: null,
        transformSubscriber: function (
          sub: Subscriber<T, K>
        ): Subscriber<T, K> {
          throw new Error("Function not implemented.");
        },
        transformDelegate: function (): SnapshotStoreConfig<T, K>[] {
          throw new Error("Function not implemented.");
        },
        initializedState: undefined,
        getAllKeys: function (
          storeId: number,
          snapshotId: string,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          snapshot: Snapshot<SnapshotUnion<BaseData>, K> | null,
          timestamp: string | number | Date | undefined,
          type: string,
          event: Event,
          id: number,
          snapshotStore: SnapshotStore<SnapshotUnion<BaseData>, K>,
          data: T
        ): Promise<string[] | undefined> {
          throw new Error("Function not implemented.");
        },
        getAllItems: function (): Promise<Snapshot<T, K>[] | undefined> {
          throw new Error("Function not implemented.");
        },
        addDataStatus: function (
          id: number,
          status: StatusType | undefined
        ): void {
          throw new Error("Function not implemented.");
        },
        removeData: function (id: number): void {
          throw new Error("Function not implemented.");
        },
        updateData: function (id: number, newData: Snapshot<T, K>): void {
          throw new Error("Function not implemented.");
        },
        updateDataTitle: function (id: number, title: string): void {
          throw new Error("Function not implemented.");
        },
        updateDataDescription: function (
          id: number,
          description: string
        ): void {
          throw new Error("Function not implemented.");
        },
        updateDataStatus: function (
          id: number,
          status: StatusType | undefined
        ): void {
          throw new Error("Function not implemented.");
        },
        addDataSuccess: function (payload: { data: Snapshot<T, K>[] }): void {
          throw new Error("Function not implemented.");
        },
        getDataVersions: function (
          id: number
        ): Promise<Snapshot<T, K>[] | undefined> {
          throw new Error("Function not implemented.");
        },
        updateDataVersions: function (
          id: number,
          versions: Snapshot<T, K>[]
        ): void {
          throw new Error("Function not implemented.");
        },
        getBackendVersion: function (): Promise<string | undefined> {
          throw new Error("Function not implemented.");
        },
        getFrontendVersion: function (): Promise<
          string | IHydrateResult<number>
        > {
          throw new Error("Function not implemented.");
        },
        fetchData: function (id: number): Promise<SnapshotStore<T, K>[]> {
          throw new Error("Function not implemented.");
        },
        defaultSubscribeToSnapshot: function (
          snapshotId: string,
          callback: Callback<Snapshot<T, K>>,
          snapshot: Snapshot<T, K>
        ): string {
          throw new Error("Function not implemented.");
        },
        handleSubscribeToSnapshot: function (
          snapshotId: string,
          callback: Callback<Snapshot<T, K>>,
          snapshot: Snapshot<T, K>
        ): void {
          throw new Error("Function not implemented.");
        },
        removeItem: function (key: string): Promise<void> {
          throw new Error("Function not implemented.");
        },
        getSnapshot: function (
          snapshot: (id: string) =>
            | Promise<{
                category: any;
                timestamp: any;
                id: any;
                snapshot: Snapshot<T, K>;
                snapshotStore: SnapshotStore<T, K>;
                data: T;
              }>
            | undefined
        ): Promise<Snapshot<T, K>> {
          throw new Error("Function not implemented.");
        },
        getSnapshotSuccess: function (
          snapshot: Snapshot<T, K>
        ): Promise<SnapshotStore<T, K>> {
          throw new Error("Function not implemented.");
        },
        setItem: function (key: T, value: T): Promise<void> {
          throw new Error("Function not implemented.");
        },
        getDataStore: (): Promise<InitializedDataStore> => {
          throw new Error("Function not implemented.");
        },
        addSnapshotSuccess: function (
          snapshot: Snapshot<T, K>,
          subscribers: SubscriberCollection<T, K>
        ): void {
          throw new Error("Function not implemented.");
        },
        deepCompare: function (objA: any, objB: any): boolean {
          throw new Error("Function not implemented.");
        },
        shallowCompare: function (objA: any, objB: any): boolean {
          throw new Error("Function not implemented.");
        },
        getDataStoreMethods: function (): DataStoreMethods<T, K> {
          throw new Error("Function not implemented.");
        },
        getDelegate: function (context: {
          useSimulatedDataSource: boolean;
          simulatedDataSource: SnapshotStoreConfig<T, K>[];
        }): SnapshotStoreConfig<T, K>[] {
          throw new Error("Function not implemented.");
        },
        determineCategory: function (
          snapshot: Snapshot<T, K> | null | undefined
        ): string {
          throw new Error("Function not implemented.");
        },
        determinePrefix: function <T extends Data>(
          snapshot: T | null | undefined,
          category: string
        ): string {
          throw new Error("Function not implemented.");
        },
        removeSnapshot: function (snapshotToRemove: Snapshot<T, K>): void {
          throw new Error("Function not implemented.");
        },
        addSnapshotItem: function (
          item: Snapshot<any, any> | SnapshotStoreConfig<T, K>
        ): void {
          throw new Error("Function not implemented.");
        },
        addNestedStore: function (store: SnapshotStore<T, K>): void {
          throw new Error("Function not implemented.");
        },
        clearSnapshots: function (): void {
          throw new Error("Function not implemented.");
        },
        addSnapshot: function (
          snapshot: Snapshot<T, K>,
          snapshotId: string,
          subscribers: SubscriberCollection<T, K>
        ): Promise<Snapshot<T, K> | undefined> {
          throw new Error("Function not implemented.");
        },
        createSnapshot: undefined,

        createInitSnapshot: function (
          id: string,
          initialData: T,
          snapshotStoreConfig: SnapshotStoreConfig<SnapshotUnion<any>, K>,
          category: Category
        ): Promise<SnapshotWithCriteria<T, K>> {
          throw new Error("Function not implemented.");
        },
        setSnapshotSuccess: function (
          snapshotData: SnapshotStore<T, K>,
          subscribers: SubscriberCollection<T, K>
        ): void {
          throw new Error("Function not implemented.");
        },
        setSnapshotFailure: function (error: Error): void {
          throw new Error("Function not implemented.");
        },
        updateSnapshots: function (): void {
          throw new Error("Function not implemented.");
        },
        updateSnapshotsSuccess: function (
          snapshotData: (
            subscribers: Subscriber<T, K>[],
            snapshot: Snapshots<T>
          ) => void
        ): void {
          throw new Error("Function not implemented.");
        },
        updateSnapshotsFailure: function (error: Payload): void {
          throw new Error("Function not implemented.");
        },
        initSnapshot: function (
          snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
          snapshotId: string | null,
          snapshotData: SnapshotStore<T, K>,
          category: symbol | string | Category | undefined,
          snapshotConfig: SnapshotStoreConfig<T, K>,
          callback: (snapshotStore: SnapshotStore<any, any>) => void
        ): void {
          throw new Error("Function not implemented.");
        },
        takeSnapshot: function (
          snapshot: Snapshot<T, K>,
          subscribers: Subscriber<T, K>[]
        ): Promise<{ snapshot: Snapshot<T, K> }> {
          throw new Error("Function not implemented.");
        },
        takeSnapshotSuccess: function (snapshot: Snapshot<T, K>): void {
          throw new Error("Function not implemented.");
        },
        takeSnapshotsSuccess: function (snapshots: T[]): void {
          throw new Error("Function not implemented.");
        },
        flatMap: function <U extends Iterable<any>>(
          callback: (
            value: SnapshotStoreConfig<T, K>,
            index: number,
            array: SnapshotStoreConfig<T, K>[]
          ) => U
        ): U extends (infer I)[] ? I[] : U[] {
          throw new Error("Function not implemented.");
        },
        getState: function () {
          throw new Error("Function not implemented.");
        },
        setState: function (state: any): void {
          throw new Error("Function not implemented.");
        },
        validateSnapshot: function (
          snapshotId: string,
          snapshot: Snapshot<T, K>
        ): boolean {
          throw new Error("Function not implemented.");
        },
        handleActions: function (action: (selectedText: string) => void): void {
          throw new Error("Function not implemented.");
        },
        setSnapshot: function (snapshot: Snapshot<T, K>): void {
          throw new Error("Function not implemented.");
        },
        transformSnapshotConfig: function <U extends BaseData>(
          config: SnapshotConfig<U, U>
        ): SnapshotConfig<U, U> {
          throw new Error("Function not implemented.");
        },
        transformSnapshotStoreConfig: function <U extends BaseData>(
          config: SnapshotStoreConfig<U, U>
        ): SnapshotStoreConfig<U, U> {
          throw new Error("Function not implemented.");
        },
        setSnapshots: function (snapshots: Snapshots<T>): void {
          throw new Error("Function not implemented.");
        },
        clearSnapshot: function (): void {
          throw new Error("Function not implemented.");
        },
        mergeSnapshots: function (
          snapshots: Snapshots<T>,
          category: string
        ): void {
          throw new Error("Function not implemented.");
        },
        reduceSnapshots: function <U>(
          callback: (acc: U, snapshot: Snapshot<T, K>) => U,
          initialValue: U
        ): U | undefined {
          throw new Error("Function not implemented.");
        },
        sortSnapshots: function (): void {
          throw new Error("Function not implemented.");
        },
        filterSnapshots: function (): void {
          throw new Error("Function not implemented.");
        },
        findSnapshot: function (
          predicate: (snapshot: Snapshot<T, K>) => boolean
        ): Snapshot<T, K> | undefined {
          throw new Error("Function not implemented.");
        },
        getSubscribers: function (
          subscribers: Subscriber<T, K>[],
          snapshots: Snapshots<T>
        ): Promise<{
          subscribers: Subscriber<T, K>[];
          snapshots: Snapshots<T>;
        }> {
          throw new Error("Function not implemented.");
        },
        notify: function (
          id: string,
          message: string,
          content: any,
          date: Date,
          type: NotificationType,
          notificationPosition?: NotificationPosition | undefined
        ): void {
          throw new Error("Function not implemented.");
        },
        notifySubscribers: function (
          message: string,
          subscribers: Subscriber<T, K>[],
          data: Partial<SnapshotStoreConfig<SnapshotUnion<BaseData>, any>>
        ): Subscriber<T, K>[] {
          throw new Error("Function not implemented.");
        },

        getAllSnapshots: async (
          storeId: number,
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

              // if snapshotData is an instance of SnapshotUnion, convert to snapshot array
              if (
                typeof snapshotData === "object" &&
                "getSnapshots" in snapshotData
              ) {
                const snapshotArray = snapshotData.getSnapshots();
                return snapshotArray;
              }
            }
            // Fallback to standard logic if no callback is provided
            const keys = await dataStoreMethods.getAllKeys(
              storeId,
              snapshotId,
              category,
              categoryProperties,
              snapshot,
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

            // if items is nul ensure we search Snapshot
            if (keys.length === 0) {
              return [];
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
        batchFetchSnapshots: snapshotData?.batchFetchSnapshots,
        batchTakeSnapshotsRequest: function (
          snapshotData: (
            snapshotIds: string[],
            snapshots: Snapshots<T>,
            subscribers: Subscriber<T, K>[]
          ) => Promise<{
            subscribers: Subscriber<T, K>[];
          }>
        ): Promise<void> {
          throw new Error("Function not implemented.");
        },

        batchUpdateSnapshotsRequest: function (
          snapshotData: (subscribers: Subscriber<T, K>[]) => Promise<{
            subscribers: Subscriber<T, K>[];
          }>,
          snapshotManager: SnapshotManager<T, K>
        ): Promise<void> {
          // Change return type to Promise<void>
          return new Promise<void>((resolve, reject) => {
            // Function to fetch a snapshot by id
            const fetchSnapshot = <T extends Data, K extends Data>(
              id: string
            ): Promise<Snapshot<T, K>> => {
              return new Promise<Snapshot<T, K>>((resolve, reject) => {
                // Fetch the snapshot from the API
                fetchSnapshotFromAPI<T, K>(id)
                  .then((snapshot) => {
                    // Resolve the promise with the fetched snapshot
                    resolve(snapshot);
                  })
                  .catch((error: any) => {
                    // Reject the promise with the error
                    reject(error);
                  });
              });
            };

            // Example of using snapshotData to get subscribers
            snapshotData([]) // Assuming you pass an initial empty array
              .then((result) => {
                // Optionally, you can use the subscribers here
                const subscribers = result.subscribers;

                const snapshotStore: SnapshotStore<T, K> =
                  snapshotManager.snapshotStore;
                // If you have additional logic to process the subscribers,
                // do that here before resolving

                // Provide context value
                const value: SnapshotContextType<T, K> = {
                  snapshot, // Ensure `snapshot` is defined in your scope
                  snapshots, // Ensure `snapshots` is defined in your scope
                  createSnapshot, // Ensure `createSnapshot` is defined
                  fetchSnapshot,
                  snapshotStore, // Ensure `snapshotStore` is defined
                };

                // Render the context provider with the provided value
                return (
                  <SnapshotContext.Provider value={value}>
                    {children}
                  </SnapshotContext.Provider>
                );
              })
              .then(() => {
                resolve(); // Resolve the outer promise after the context provider is rendered
              })
              .catch((error) => {
                reject(error); // Reject the outer promise if an error occurs
              });
          });
        },
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  };
};

// Custom hook to use the SnapshotContext
export const useSnapshot = <
  T extends Data,
  K extends Data
>(): SnapshotContextType<T, K> => {
  const context = useContext(SnapshotContext) as
    | SnapshotContextType<T, K>
    | undefined;
  if (!context) {
    throw new Error("useSnapshot must be used within a SnapshotProvider");
  }
  return context;
};

function fetchSnapshotFromAPI<T extends Data, K extends Data>(
  id: string
): Promise<Snapshot<T, K>> {
  return new Promise((resolve, reject) => {
    // Wrapping async logic in a Promise
    fetch(`/api/snapshots/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch snapshot with ID: ${id}. Status: ${response.status}`
          );
        }
        return response.json(); // Parse the JSON response
      })
      .then((data) => {
        
      // Use type assertion to ensure the data fits the expected structure
      const fetchedData = data as FetchedSnapshotStore<T, K>;

        // Ensure the data fits the Snapshot<T, K> type
        const fetchedSnapshot: Snapshot<T, K> = {
          id: fetchedData.snapshotStore.id,
          data: fetchedData.data,
          storeId: fetchedData.snapshotStore.storeId,
          timestamp: new Date(fetchedData.snapshotStore.timestamp), // Assuming timestamp is returned as a string
          category: fetchedData.snapshotStore.category,
          topic: fetchedData.snapshotStore.topic,
          meta: fetchedData.snapshotStore.meta,
          snapshotStoreConfig: fetchedData.snapshotStore.snapshotStoreConfig,
          getSnapshotItems: fetchedData.snapshotStore.getSnapshotItems,
          defaultSubscribeToSnapshots: fetchedData.snapshotStore.defaultSubscribeToSnapshots,
          versionInfo: fetchedData.snapshotStore.versionInfo,
          initialState: fetchedData.snapshotStore.initialState,
          isCore: fetchedData.snapshotStore.isCore,

          transformSubscriber: fetchedData.snapshotStore.snapshotConfig.transformSubscriber,
          taskIdToAssign: fetchedData.snapshotStore.snapshotConfig.taskIdToAssign,
          schema: fetchedData.snapshotStore.snapshotConfig.schema,

          currentCategory: fetchedData.snapshotStore.currentCategory,
          generateId: fetchedData.snapshotStore.generateId,
          config: fetchedData.snapshotStore.getConfig(),
          subscribe: fetchedData.snapshotStore.subscribe,

          items: fetchedData.snapshotStore.getItems(),

          stores: fetchedData.snapshotStore.stores,

          fetchSnapshotSuccess: fetchedData.snapshotStore.fetchSnapshotSuccess,

          childIds: fetchedData.snapshotStore.snapshotConfig.childIds,

          getParentId: fetchedData.snapshotStore.getParentId,
          getChildIds: fetchedData.snapshotStore.getChildIds,
          addChild: fetchedData.snapshotStore.addChild,
          removeChild: fetchedData.snapshotStore.removeChild,

          getChildren: fetchedData.snapshotStore.getChildren,
          hasChildren: fetchedData.snapshotStore.hasChildren,
          isDescendantOf: fetchedData.snapshotStore.isDescendantOf,
          getSnapshotById: fetchedData.snapshotStore.getSnapshotById,

          transformDelegate: fetchedData.snapshotStore.transformDelegate,
          initializedState: fetchedData.snapshotStore.initializedState,
          getAllKeys: fetchedData.snapshotStore.getAllKeys,
          getAllItems: fetchedData.snapshotStore.getAllItems,
          addDataStatus: fetchedData.snapshotStore.addDataStatus,
          removeData: fetchedData.snapshotStore.removeData,
          updateData: fetchedData.snapshotStore.updateData,
          updateDataTitle: fetchedData.snapshotStore.updateDataTitle,
          updateDataDescription: fetchedData.snapshotStore.updateDataDescription,
          updateDataStatus: fetchedData.snapshotStore.updateDataStatus,
          addDataSuccess: fetchedData.snapshotStore.addDataSuccess,
          getDataVersions: fetchedData.snapshotStore.getDataVersions,
          updateDataVersions: fetchedData.snapshotStore.updateDataVersions,
          getBackendVersion: fetchedData.snapshotStore.getBackendVersion,
          getFrontendVersion: fetchedData.snapshotStore.getFrontendVersion,
          fetchData: fetchedData.snapshotStore.fetchData,
          defaultSubscribeToSnapshot: fetchedData.snapshotStore.defaultSubscribeToSnapshot,
          handleSubscribeToSnapshot: fetchedData.snapshotStore.handleSubscribeToSnapshot,
          removeItem: fetchedData.snapshotStore.removeItem,
          getSnapshot: fetchedData.snapshotStore.getSnapshot,
          getSnapshotSuccess: fetchedData.snapshotStore.getSnapshotSuccess,
          setItem: fetchedData.snapshotStore.setItem,
          getDataStore: fetchedData.snapshotStore.getDataStore,
          addSnapshotSuccess: fetchedData.snapshotStore.addSnapshotSuccess,
          deepCompare: fetchedData.snapshotStore.deepCompare,
          shallowCompare: fetchedData.snapshotStore.shallowCompare,
          getDataStoreMethods: fetchedData.snapshotStore.getDataStoreMethods,
          getDelegate: fetchedData.snapshotStore.getDelegate,
          determineCategory: fetchedData.snapshotStore.determineCategory,
          determinePrefix: fetchedData.snapshotStore.determinePrefix,
          removeSnapshot: fetchedData.snapshotStore.removeSnapshot,
          addSnapshotItem: fetchedData.snapshotStore.addSnapshotItem,
          addNestedStore: fetchedData.snapshotStore.addNestedStore,
          clearSnapshots: fetchedData.snapshotStore.clearSnapshots,
          addSnapshot: fetchedData.snapshotStore.addSnapshot,
          createSnapshot: fetchedData.snapshotStore.createSnapshot,
          createInitSnapshot: fetchedData.snapshotStore.createInitSnapshot,
          setSnapshotSuccess: fetchedData.snapshotStore.setSnapshotSuccess,
          setSnapshotFailure: fetchedData.snapshotStore.setSnapshotFailure,
          updateSnapshots: fetchedData.snapshotStore.updateSnapshots,
          updateSnapshotsSuccess: fetchedData.snapshotStore.updateSnapshotsSuccess,
          updateSnapshotsFailure: fetchedData.snapshotStore.updateSnapshotsFailure,
          initSnapshot: fetchedData.snapshotStore.initSnapshot,
          takeSnapshot: fetchedData.snapshotStore.takeSnapshot,
          takeSnapshotSuccess: fetchedData.snapshotStore.takeSnapshotSuccess,
          takeSnapshotsSuccess: fetchedData.snapshotStore.takeSnapshotsSuccess,
          flatMap: fetchedData.snapshotStore.flatMap,
          getState: fetchedData.snapshotStore.getState,
          setState: fetchedData.snapshotStore.setState,
          validateSnapshot: fetchedData.snapshotStore.validateSnapshot,
          handleActions: fetchedData.snapshotStore.handleActions,
          setSnapshot: fetchedData.snapshotStore.setSnapshot,
          transformSnapshotConfig: fetchedData.snapshotStore.transformSnapshotConfig,
          setSnapshots: fetchedData.snapshotStore.setSnapshots,
          clearSnapshot: fetchedData.snapshotStore.clearSnapshot,
          mergeSnapshots: fetchedData.snapshotStore.mergeSnapshots,
          reduceSnapshots: fetchedData.snapshotStore.reduceSnapshots,
          sortSnapshots: fetchedData.snapshotStore.sortSnapshots,
          filterSnapshots: fetchedData.snapshotStore.filterSnapshots,
          findSnapshot: fetchedData.snapshotStore.findSnapshot,
          getSubscribers: fetchedData.snapshotStore.getSubscribers,
          notify: fetchedData.snapshotStore.notify,
          notifySubscribers: fetchedData.snapshotStore.notifySubscribers,
          getAllSnapshots: fetchedData.snapshotStore.getAllSnapshots,
          initialConfig: fetchedData.snapshotStore.snapshotConfig.initialConfig,
          removeSubscriber: fetchedData.snapshotStore.snapshotConfig.removeSubscriber,
          onInitialize: fetchedData.snapshotStore.snapshotConfig.onInitialize,
          onError: fetchedData.snapshotStore.snapshotConfig.onError,

          snapshot: fetchedData.snapshotStore.snapshot,
          setCategory: fetchedData.snapshotStore.snapshotConfig.setCategory,
          applyStoreConfig: fetchedData.snapshotStore.snapshotConfig.applyStoreConfig,
          snapshotData: fetchedData.snapshotStore.snapshotConfig.snapshotData,

          getItem: fetchedData.snapshotStore.getItem,
          getDataStoreMap: fetchedData.snapshotStore.getDataStoreMap,
          emit: fetchedData.snapshotStore.emit,
          addStoreConfig: fetchedData.snapshotStore.snapshotConfig.addStoreConfig,

          handleSnapshotConfig: fetchedData.snapshotStore.snapshotConfig.handleSnapshotConfig,
          getSnapshotConfig: fetchedData.snapshotStore.snapshotConfig.getSnapshotConfig,
          getSnapshotListByCriteria: fetchedData.snapshotStore.snapshotConfig.getSnapshotListByCriteria,
          mapSnapshots: fetchedData.snapshotStore.mapSnapshots,

          takeLatestSnapshot: fetchedData.snapshotStore.snapshotConfig.takeLatestSnapshot,
          updateSnapshot: fetchedData.snapshotStore.updateSnapshot,
          addSnapshotSubscriber: fetchedData.snapshotStore.snapshotConfig.addSnapshotSubscriber,
          removeSnapshotSubscriber: fetchedData.snapshotStore.removeSnapshotSubscriber,

          getSnapshotConfigItems: fetchedData.snapshotStore.snapshotConfig.getSnapshotConfigItems,
          subscribeToSnapshots: fetchedData.snapshotStore.subscribeToSnapshots,
          executeSnapshotAction: fetchedData.snapshotStore.executeSnapshotAction,
          subscribeToSnapshot: fetchedData.snapshotStore.subscribeToSnapshot,

          unsubscribeFromSnapshot: fetchedData.snapshotStore.snapshotConfig.unsubscribeFromSnapshot,
          subscribeToSnapshotsSuccess: fetchedData.snapshotStore.snapshotConfig.subscribeToSnapshotsSuccess,
          unsubscribeFromSnapshots: fetchedData.snapshotStore.snapshotConfig.unsubscribeFromSnapshots,
          getSnapshotItemsSuccess: fetchedData.snapshotStore.snapshotConfig.getSnapshotItemsSuccess,

          getAllSnapshotEntries: fetchedData.snapshotStore.snapshotConfig.getAllSnapshotEntries,

          setSnapshotCategory: fetchedData.snapshotStore.snapshotConfig.setSnapshotCategory,
          getSnapshotCategory: fetchedData.snapshotStore.snapshotConfig.getSnapshotCategory,
          getSnapshotData: fetchedData.snapshotStore.snapshotConfig.getSnapshotData,
          deleteSnapshot: fetchedData.snapshotStore.snapshotConfig.deleteSnapshot,
          getSnapshots: fetchedData.snapshotStore.getSnapshots,
          compareSnapshots: fetchedData.snapshotStore.snapshotConfig.compareSnapshots,
          compareSnapshotItems: fetchedData.snapshotStore.snapshotConfig.compareSnapshotItems,

          getSnapshotId: fetchedData.snapshotStore.getSnapshotId,

          getSnapshotItemSuccess: fetchedData.snapshotStore.snapshotConfig.getSnapshotItemSuccess,
          getSnapshotKeys: fetchedData.snapshotStore.snapshotConfig.getSnapshotKeys,
          getSnapshotIdSuccess: fetchedData.snapshotStore.snapshotConfig.getSnapshotIdSuccess,
          getSnapshotValuesSuccess: fetchedData.snapshotStore.snapshotConfig.getSnapshotValuesSuccess,

          getSnapshotWithCriteria: fetchedData.snapshotStore.snapshotConfig.getSnapshotWithCriteria,
          reduceSnapshotItems: fetchedData.snapshotStore.snapshotConfig.reduceSnapshotItems,
          subscribeToSnapshotList: fetchedData.snapshotStore.snapshotConfig.subscribeToSnapshotList,
          label: fetchedData.snapshotStore.snapshotConfig.label,

          events: fetchedData.snapshotStore.events,
          restoreSnapshot: fetchedData.snapshotStore.restoreSnapshot,
          handleSnapshot: fetchedData.snapshotStore.handleSnapshot,
          subscribers: fetchedData.snapshotStore.subscribers,
          snapshotStore: fetchedData.snapshotStore.snapshotStore,

          mappedSnapshotData: fetchedData.snapshotStore.snapshotConfig.mappedSnapshotData,
          getAllValues: fetchedData.snapshotStore.snapshotConfig.getAllValues,
          getSnapshotEntries: fetchedData.snapshotStore.snapshotConfig.getSnapshotEntries,
          batchTakeSnapshot: fetchedData.snapshotStore.batchTakeSnapshot,
          batchFetchSnapshots: fetchedData.snapshotStore.batchFetchSnapshots,
          batchTakeSnapshotsRequest: fetchedData.snapshotStore.batchTakeSnapshotsRequest,
          batchUpdateSnapshotsRequest: fetchedData.snapshotStore.batchUpdateSnapshotsRequest,
          filterSnapshotsByStatus: fetchedData.snapshotStore.snapshotConfig.filterSnapshotsByStatus,
          filterSnapshotsByCategory: fetchedData.snapshotStore.snapshotConfig.filterSnapshotsByCategory,
          filterSnapshotsByTag: fetchedData.snapshotStore.snapshotConfig.filterSnapshotsByTag,
          batchFetchSnapshotsSuccess: fetchedData.snapshotStore.batchFetchSnapshotsSuccess,
          batchFetchSnapshotsFailure: fetchedData.snapshotStore.batchFetchSnapshotsFailure,
          batchUpdateSnapshotsSuccess: fetchedData.snapshotStore.batchUpdateSnapshotsSuccess,
          batchUpdateSnapshotsFailure: fetchedData.snapshotStore.batchUpdateSnapshotsFailure,
          handleSnapshotSuccess: fetchedData.snapshotStore.handleSnapshotSuccess,
          compareSnapshotState: fetchedData.snapshotStore.compareSnapshotState,
          payload: fetchedData.snapshotStore.snapshotConfig.payload,
          dataItems: fetchedData.snapshotStore.dataItems,
          newData: fetchedData.snapshotStore.newData,
          getInitialState: fetchedData.snapshotStore.getInitialState,
          getConfigOption: fetchedData.snapshotStore.getConfigOption,
          getTimestamp: fetchedData.snapshotStore.getTimestamp,
          getStores: fetchedData.snapshotStore.getStores,
          getData: fetchedData.snapshotStore.getData,
          setData: fetchedData.snapshotStore.setData,
          addData: fetchedData.snapshotStore.addData,
          getStore: fetchedData.snapshotStore.snapshotConfig.getStore,
          addStore: fetchedData.snapshotStore.addStore,
          mapSnapshot: fetchedData.snapshotStore.mapSnapshot,
          mapSnapshotWithDetails: fetchedData.snapshotStore.snapshotConfig.mapSnapshotWithDetails,
          removeStore: fetchedData.snapshotStore.removeStore,
          unsubscribe: fetchedData.snapshotStore.unsubscribe,
          fetchSnapshot: fetchedData.snapshotStore.fetchSnapshot,
          updateSnapshotFailure: fetchedData.snapshotStore.updateSnapshotFailure,
          fetchSnapshotFailure: fetchedData.snapshotStore.fetchSnapshotFailure,
          addSnapshotFailure: fetchedData.snapshotStore.addSnapshotFailure,
          configureSnapshotStore: fetchedData.snapshotStore.configureSnapshotStore,
          updateSnapshotSuccess: fetchedData.snapshotStore.updateSnapshotSuccess,
          createSnapshotFailure: fetchedData.snapshotStore.createSnapshotFailure,
          createSnapshotSuccess: fetchedData.snapshotStore.createSnapshotSuccess,
          createSnapshots: fetchedData.snapshotStore.createSnapshots,
          onSnapshot: fetchedData.snapshotStore.onSnapshot,
          onSnapshots: fetchedData.snapshotStore.onSnapshots,
        };
        resolve(fetchedSnapshot); // Resolve with the snapshot
      })
      .catch((error) => {
        reject(error); // Reject in case of error
      });
  });
}

function fetchSnapshotStoreFromAPI<T extends Data, K extends Data>(
  id: string
): Promise<SnapshotStore<T, K>> {
  return new Promise((resolve, reject) => {
    // Wrapping async logic in a Promise
    fetch(`/api/snapshotStores/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch snapshot store with ID: ${id}. Status: ${response.status}`
          );
        }
        return response.json(); // Parse the JSON response
      })
      .then((data) => {
        // Use type assertion to ensure the data fits the expected structure
        const fetchedData = data as FetchedSnapshotStore<T, K>;

        // Ensure the data fits the SnapshotStore<T, K> type
        const fetchedSnapshotStore: SnapshotStore<T, K> = {
          id: fetchedData.snapshotStore.id,
          snapshots: fetchedData.snapshotStore.snapshots,
          snapshotCount: fetchedData.snapshotStore.snapshots.length, // Adding snapshotCount
          lastUpdated:
            fetchedData.snapshotStore.snapshots.length > 0
              ? new Date(
                  Math.max(
                    ...fetchedData.snapshotStore.snapshots.map((snapshot) =>
                      new Date(snapshot.updatedAt ?? 0).getTime()
                    )
                  )
                ).toISOString()
              : null,
          snapshotTitles: fetchedData.snapshotStore.snapshots.map(
            (snapshot) => snapshot.title
          ),
          activeSnapshots: fetchedData.snapshotStore.snapshots.filter(
            (snapshot) => snapshot.isActive
          ),
          snapshotCategories: Array.from(
            new Set(
              fetchedData.snapshotStore.snapshots.map(
                (snapshot) => snapshot.category
              )
            )
          ),
          snapshotSummary: {
            count: fetchedData.snapshotStore.snapshots.length,
            totalSize: fetchedData.snapshotStore.snapshots.reduce(
              (acc, snapshot) => acc + (snapshot.size || 0),
              0
            ),
          },
          isEmpty: fetchedData.snapshotStore.snapshots.length === 0,
          recentSnapshotCount: fetchedData.snapshotStore.snapshots.filter(
            (snapshot) => {
              const createdAt = new Date(snapshot.createdAt);
              return (
                new Date().getTime() - createdAt.getTime() <=
                30 * 24 * 60 * 60 * 1000
              );
            }
          ).length,
          // snapshotData: fetchedData.snapshotData,
          category: fetchedData.snapshotStore.category,
          topic: fetchedData.snapshotStore.topic,
          meta: fetchedData.snapshotStore.meta,
          snapshotStoreConfig: fetchedData.snapshotStore.snapshotStoreConfig,
          addSnapshot: fetchedData.snapshotStore.addSnapshot,
          removeSnapshot: fetchedData.snapshotStore.removeSnapshot,
          updateSnapshot: fetchedData.snapshotStore.updateSnapshot,
          // getSnapshotById: fetchedData.getSnapshotById,
          findSnapshot: fetchedData.snapshotStore.findSnapshot,
          filterSnapshots: fetchedData.snapshotStore.filterSnapshots,
          sortSnapshots: fetchedData.snapshotStore.sortSnapshots,
          mapSnapshots: fetchedData.snapshotStore.mapSnapshots,
          reduceSnapshots: fetchedData.snapshotStore.reduceSnapshots,
          clearSnapshots: fetchedData.snapshotStore.clearSnapshots,
          // getSnapshotData: fetchedData.getSnapshotData,
          notifySubscribers: fetchedData.notifySubscribers,
          subscribeToSnapshots: fetchedData.subscribeToSnapshots,
          unsubscribe: fetchedData.unsubscribe,
          configureSnapshotStore: fetchedData.configureSnapshotStore,
          getAllSnapshots: fetchedData.getAllSnapshots,
          // getConfigOption: fetchedData.getConfigOption,
          // getTimestamp: fetchedData.getTimestamp,
          // getStores: fetchedData.getStores,
          getStore: fetchedData.getStore,
          addStore: fetchedData.addStore,
          removeStore: fetchedData.removeStore,
          handleSnapshot: fetchedData.handleSnapshot,
          setSnapshot: fetchedData.setSnapshot,
          getData: fetchedData.getData,
          setData: fetchedData.setData,
          addData: fetchedData.addData,
          removeData: fetchedData.removeData,
          updateData: fetchedData.updateData,
          fetchSnapshot: fetchedData.fetchSnapshot,
          initSnapshot: fetchedData.initSnapshot,
          takeSnapshot: fetchedData.takeSnapshot,
          validateSnapshot: fetchedData.validateSnapshot,
          mergeSnapshots: fetchedData.mergeSnapshots,
          batchUpdateSnapshotsRequest: fetchedData.batchUpdateSnapshotsRequest,
          batchUpdateSnapshotsSuccess: fetchedData.batchUpdateSnapshotsSuccess,
          batchUpdateSnapshotsFailure: fetchedData.batchUpdateSnapshotsFailure,
          batchTakeSnapshot: fetchedData.batchTakeSnapshot,
          batchFetchSnapshots: fetchedData.batchFetchSnapshots,
          batchFetchSnapshotsSuccess: fetchedData.batchFetchSnapshotsSuccess,
          batchFetchSnapshotsFailure: fetchedData.batchFetchSnapshotsFailure,
          batchTakeSnapshotsRequest: fetchedData.batchTakeSnapshotsRequest,
          handleSnapshotSuccess: fetchedData.handleSnapshotSuccess,
          getSnapshotId: fetchedData.getSnapshotId,
          compareSnapshotState: fetchedData.compareSnapshotState,
          eventRecords: fetchedData.eventRecords,
          snapshotStore: fetchedData.snapshotStore,
          getParentId: fetchedData.getParentId,
          getChildIds: fetchedData.getChildIds,
          // addChild: fetchedData.addChild,
          // removeChild: fetchedData.removeChild,
          // getChildren: fetchedData.getChildren,
          // hasChildren: fetchedData.hasChildren,
          // isDescendantOf: fetchedData.isDescendantOf,
          dataItems: fetchedData.dataItems,
          newData: fetchedData.newData,
          // getInitialState: fetchedData.getInitialState,
          getBackendVersion: fetchedData.getBackendVersion,
          getFrontendVersion: fetchedData.getFrontendVersion,
          flatMap: fetchedData.flatMap,
          getAllKeys: fetchedData.getAllKeys,
          getAllItems: fetchedData.getAllItems,
          mapSnapshot: fetchedData.mapSnapshot,
          getState: fetchedData.getState,
          setState: fetchedData.setState,
          // label: fetchedData.label,
          events: fetchedData.events,
          notify: fetchedData.notify,
          addSnapshotSuccess: fetchedData.addSnapshotSuccess,
          addSnapshotFailure: fetchedData.addSnapshotFailure,
          createSnapshot: fetchedData.createSnapshot,
          // createSnapshots: fetchedData.createSnapshots,
          createSnapshotSuccess: fetchedData.createSnapshotSuccess,
          createSnapshotFailure: fetchedData.createSnapshotFailure,
          onSnapshot: fetchedData.onSnapshot,
          onSnapshots: fetchedData.onSnapshots,
          handleActions: fetchedData.handleActions,
          findIndex: fetchedData.findIndex,
          splice: fetchedData.splice,
          key: "",
          keys: [],
          date: undefined,
          config: null,
          title: "",
          message: undefined,
          timestamp: undefined,
          createdBy: "",
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
          getSnapshotItems: fetchedData.getSnapshotItems,
          dataStore: undefined,
          snapshotStores: undefined,
          initialState: undefined,
          snapshotItems: [],
          nestedStores: [],
          snapshotIds: [],
          dataStoreMethods: undefined,
          delegate: undefined,
          findSnapshotStoreById: fetchedData.findSnapshotStoreById,
          saveSnapshotStore: fetchedData.saveSnapshotStore,
          subscriberId: undefined,
          length: undefined,
          content: undefined,
          value: null,
          todoSnapshotId: undefined,
          storeId: 0,
          handleSnapshotOperation: fetchedData.handleSnapshotOperation,
          getCustomStore: fetchedData.getCustomStore,
          addSCustomStore: fetchedData.addSCustomStore,
          getDataStore: fetchedData.getDataStore,
          addSnapshotToStore: fetchedData.addSnapshotToStore,
          addSnapshotItem: fetchedData.addSnapshotItem,
          addNestedStore: fetchedData.addNestedStore,
          defaultSubscribeToSnapshots: fetchedData.defaultSubscribeToSnapshots,
          defaultCreateSnapshotStores: fetchedData.defaultCreateSnapshotStores,
          createSnapshotStores: fetchedData.createSnapshotStores,
          subscribeToSnapshot: fetchedData.subscribeToSnapshot,
          defaultOnSnapshots: fetchedData.defaultOnSnapshots,
          transformSubscriber: fetchedData.transformSubscriber,
          isSnapshotStoreConfig: fetchedData.isSnapshotStoreConfig,
          transformDelegate: fetchedData.transformDelegate,
          initializedState: undefined,
          transformedDelegate: [],
          getSnapshotIds: [],
          getNestedStores: [],
          getFindSnapshotStoreById: undefined,
          addDataStatus: fetchedData.addDataStatus,
          updateDataTitle: fetchedData.updateDataTitle,
          updateDataDescription: fetchedData.updateDataDescription,
          updateDataStatus: fetchedData.updateDataStatus,
          addDataSuccess: fetchedData.addDataSuccess,
          getDataVersions: fetchedData.getDataVersions,
          updateDataVersions: fetchedData.updateDataVersions,
          fetchData: fetchedData.fetchData,
          defaultSubscribeToSnapshot: fetchedData.defaultSubscribeToSnapshot,
          handleSubscribeToSnapshot: fetchedData.handleSubscribeToSnapshot,
          snapshot: fetchedData.snapshot,
          removeItem: fetchedData.removeItem,
          getSnapshot: fetchedData.getSnapshot,
          getSnapshotSuccess: fetchedData.getSnapshotSuccess,
          getSnapshotArray: fetchedData.getSnapshotArray,
          getItem: fetchedData.getItem,
          setItem: fetchedData.setItem,
          deepCompare: fetchedData.deepCompare,
          shallowCompare: fetchedData.shallowCompare,
          getDataStoreMethods: fetchedData.getDataStoreMethods,
          getDelegate: fetchedData.getDelegate,
          determineCategory: fetchedData.determineCategory,
          determineSnapshotStoreCategory:
            fetchedData.determineSnapshotStoreCategory,
          determinePrefix: fetchedData.determinePrefix,
          updateSnapshotSuccess: fetchedData.updateSnapshotSuccess,
          updateSnapshotFailure: fetchedData.updateSnapshotFailure,
          createInitSnapshot: fetchedData.createInitSnapshot,
          clearSnapshotSuccess: fetchedData.clearSnapshotSuccess,
          clearSnapshotFailure: fetchedData.clearSnapshotFailure,
          setSnapshotSuccess: fetchedData.setSnapshotSuccess,
          setSnapshotFailure: fetchedData.setSnapshotFailure,
          updateSnapshots: fetchedData.updateSnapshots,
          updateSnapshotsSuccess: fetchedData.updateSnapshotsSuccess,
          updateSnapshotsFailure: fetchedData.updateSnapshotsFailure,
          takeSnapshotSuccess: fetchedData.takeSnapshotSuccess,
          takeSnapshotsSuccess: fetchedData.takeSnapshotsSuccess,
          transformSnapshotConfig: fetchedData.transformSnapshotConfig,
          setSnapshotData: fetchedData.setSnapshotData,
          setSnapshots: fetchedData.setSnapshots,
          clearSnapshot: fetchedData.clearSnapshot,
          mapSnapshotsAO: fetchedData.mapSnapshotsAO,
          getSubscribers: fetchedData.getSubscribers,
          subscribe: fetchedData.subscribe,
          fetchSnapshotSuccess: fetchedData.fetchSnapshotSuccess,
          fetchSnapshotFailure: fetchedData.fetchSnapshotFailure,
          getSnapshots: fetchedData.getSnapshots,
          getSnapshotStoreData: fetchedData.getSnapshotStoreData,
          generateId: fetchedData.generateId,
          [Symbol.iterator]: data[Symbol.iterator],
        };
        resolve(fetchedSnapshotStore); // Resolve with the snapshot store
      })
      .catch((error) => {
        reject(error); // Reject in case of error
      });
  });
}
