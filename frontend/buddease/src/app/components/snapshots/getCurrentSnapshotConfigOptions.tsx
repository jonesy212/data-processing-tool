// getCurrentSnapshotConfigOptions.ts
import * as snapshotApi from '../../../app/api/SnapshotApi'
import { IHydrateResult } from "mobx-persist";
import { toast } from "react-toastify";
import { getSnapshotCriteria, getSnapshotId } from "../../../app/api/SnapshotApi";
import UniqueIDGenerator from "../../../app/generators/GenerateUniqueIds";
import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
import { SnapshotManager, useSnapshotManager } from "../hooks/useSnapshotManager";
import { BaseData, Data } from "../models/data/Data";
import { NotificationPosition } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import CalendarEvent from "../state/stores/CalendarEvent";
import { NotificationType, NotificationTypeEnum } from "../support/NotificationContext";
import { createSnapshotStoreOptions } from "../typings/YourSpecificSnapshotType";
import { Subscriber } from "../users/Subscriber";
import { generateSnapshotId } from "../utils/snapshotUtils";
import { DataWithPriority, DataWithTimestamp, DataWithVersion } from "../utils/versionUtils";
import { Payload, Snapshot, Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion, UpdateSnapshotPayload } from "./LocalStorageSnapshotStore";
import { SnapshotConfig } from "./snapshot";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import { ConfigureSnapshotStorePayload, K, T } from "./SnapshotConfig";
import { SnapshotContainer } from "./SnapshotContainer";
import { SnapshotData } from "./SnapshotData";
import SnapshotStore from "./SnapshotStore";
import { snapshotStoreConfig, SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { Category } from '../libraries/categories/generateCategoryProperties';

const snapshotContainer = new Map<string, SnapshotStore<T, K>>();

export const getCurrentSnapshotConfigOptions= <T extends Data, K extends Data>(
  category: Category,
  categoryProperties: CategoryProperties,
  delegate: any,
  snapshotData: SnapshotStore<T, K>,
  snapshot: (
    id: string,
    snapshotId: string | null,
    snapshotData: Snapshot<SnapshotWithCriteria<BaseData, any>, K> | null,
    category: Category | undefined,
    categoryProperties: CategoryProperties,
    callback: (snapshot: Snapshot<SnapshotWithCriteria<BaseData, any>, K> | null) => void,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
  ) => Promise<Snapshot<T, K>>,

  initSnapshot: (
    snapshot: SnapshotStore<T, K> | Snapshot<T, K> | null,
    snapshotId: string | null,
    snapshotData: SnapshotStore<T, K>,
    category: string | CategoryProperties | undefined,
    snapshotConfig: SnapshotStoreConfig<Data, K>,
    callback: (snapshotStore: SnapshotStore<T, K>) => void
  ) => void,

  subscribeToSnapshots: (
    snapshot: SnapshotStore<T, K>,
    snapshotId: string,
    snapshotData: SnapshotStore<T, K>,
    category: string | CategoryProperties | undefined,
    snapshotConfig: SnapshotStoreConfig<Data, K>,
    callback: (snapshotStore: SnapshotStore<any, any>) => void
  ) => void,

  createSnapshot: (
    id: string,
    snapshotData: Snapshot<T, K>,
    category?: string | CategoryProperties,
    callback?: (snapshot: Snapshot<Data, K>) => void,
    snapshotDataStore?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<Data, K>
  ) => Snapshot<T, K> | null,

  createSnapshotStore: (
    id: string,
    snapshotId: number,
    snapshotStoreData: Snapshots<T>,
    category?: string | CategoryProperties,
    callback?: (snapshotStore: SnapshotStore<T, K>) => void,
    snapshotDataConfig?: SnapshotStoreConfig<Data, K>[]
  ) => Promise<SnapshotStore<T, K> | null>,

  configureSnapshot: (
    id: string,
    snapshotData: Snapshot<T, K>,
    category?: string | CategoryProperties,
    callback?: (snapshot: Snapshot<Data, K>) => void,
    snapshotDataStore?: SnapshotStore<T, K>,
    snapshotStoreConfig?: SnapshotStoreConfig<Data, K>
  ) => Snapshot<T, K> | null,
): SnapshotStoreConfig<Data, K> => {
  const isDataWithPriority = (data: any): data is Partial<DataWithPriority> => {
    return data && typeof data === 'object' && 'priority' in data;
  };

  const isDataWithVersion = (data: any): data is Partial<DataWithVersion> => {
    return data && typeof data === 'object' && 'version' in data;
  }

  const isDataWithTimestamp = (data: any): data is Partial<DataWithTimestamp> => {
    return data && typeof data === 'object' && 'timestamp' in data;
  }

  // Ensure the return object conforms to SnapshotStoreConfig<Data, K>
   const config: SnapshotStoreConfig<Data, K> = {
    mapSnapshots: (
      storeIds: number[],
      snapshotId: string,
      category: string | CategoryProperties | undefined,
      snapshot: Snapshot<Data, K>,
      timestamp: string | number | Date | undefined,
      type: string,
      event: Event,
      id: number,
      snapshotStore: SnapshotStore<Data, K>,
      data: Data
    ): Promise<SnapshotsArray<Snapshot<any, BaseData>>> => {
      return new Promise<SnapshotsArray<Snapshot<any, BaseData>>>((resolve, reject) => {
        try {
          // Validate inputs
          if (!storeIds || !snapshotId || !snapshot || !type || !event) {
            throw new Error("One or more required parameters are undefined or null");
          }
  
          const correctSnapshotStore: SnapshotStore<Data, K> | undefined = snapshotContainer.get(snapshotId);
          if (!correctSnapshotStore) {
            throw new Error(`SnapshotStore not found for snapshotId: ${snapshotId}`);
          }
  
          // Use the correct data type for `getSnapshotStoreData`
          const snapshotStoreData = correctSnapshotStore.getSnapshotStoreData(
            correctSnapshotStore, // Pass the correct SnapshotStore object
            snapshot,
            snapshotId,
            snapshotStore // Pass SnapshotStore<T, K> instead of Data
          );
          
          if (!snapshotStoreData) {
            throw new Error(`Snapshot store data not found for snapshotId: ${snapshotId}`);
          }
  
          // Handle different possible types for snapshotStoreData
          const snapshotArray: SnapshotsArray<Snapshot<any, BaseData>> = Array.isArray(snapshotStoreData)
            ? snapshotStoreData // Already an array of snapshots
            : typeof snapshotStoreData === 'object' && Object.values(snapshotStoreData)[0] instanceof SnapshotStore
            ? Object.values(snapshotStoreData).flatMap(store => store.getSnapshotArray())
            : Object.values(snapshotStoreData);
  
          // Process snapshots and convert to the expected type
          const processedSnapshots = snapshotArray.map((snapshot) => {
            const updatedSnapshot = { ...snapshot };
  
            if (isDataWithPriority(updatedSnapshot)) {
              updatedSnapshot.priority = updatedSnapshot.priority || '0';
            }
  
            if (isDataWithVersion(updatedSnapshot)) {
              updatedSnapshot.version = updatedSnapshot.version || undefined; // Ensure version is a string
            }
  
            if (isDataWithTimestamp(updatedSnapshot)) {
              updatedSnapshot.timestamp = updatedSnapshot.timestamp
                ? new Date(updatedSnapshot.timestamp).toISOString() as ((string | number | Date) & Date)
                : new Date().toISOString() as ((string | number | Date) & Date);
            }
  
            return updatedSnapshot as Snapshot<any, BaseData>; // Ensure it matches SnapshotsArray<Snapshot<any, BaseData>>
          });
  
          // Sort based on priority and version
          processedSnapshots.sort((a, b) => {
            const priorityA = Number(a.priority) || 0;
            const priorityB = Number(b.priority) || 0;
            if (priorityA !== priorityB) {
              return priorityB - priorityA;
            }
            return (Number(b.version) || 0) - (Number(a.version) || 0);
          });
  
          // Resolve the promise with the processed snapshot array
          resolve(processedSnapshots);
        } catch (error) {
          console.error("Error mapping snapshots:", error);
          reject(error); // Reject the promise with the error
        }
      });
    },
  

    id: snapshotData.id || "",
    timestamp: snapshotData.timestamp || new Date().toISOString(),
    snapshotId:
      snapshotData.id !== undefined && snapshotData.id !== null
        ? snapshotData.id.toString()
        : "",
    snapshotStore: snapshotStoreConfig.snapshotStore,
    snapshot: async (
      id: string,
      snapshotId: string | null,
      snapshotData: Snapshot<SnapshotWithCriteria<BaseData, any>, K> | null,
      category: Category | undefined,
      categoryProperties: CategoryProperties,
      callback: (snapshot: Snapshot<SnapshotWithCriteria<BaseData, any>, K> | null) => void,
      snapshotContainer?: Data | null | undefined,
      snapshotStoreConfigData?: SnapshotStoreConfig<SnapshotWithCriteria<BaseData, any>, K>,
    ) => {
      return new Promise((resolve, reject) => {
        try {
          // Use default value for `categoryProperties` if `category` is undefined
          const categoryProps = category || categoryProperties;
    
          const snapshotContainer = snapshot(
            id,
            snapshotId,
            snapshotData,
            categoryProps,
            categoryProperties,
            callback
          );
          if (snapshotContainer !== undefined) {
            resolve(snapshotContainer);
          } else {
            reject(new Error("Snapshot container is undefined"));
          }
        } catch (error) {
          console.error("Error fetching snapshot:", error);
          reject(error);
        }
      });
    },
    category,
    initSnapshot,
    subscribeToSnapshots,
    createSnapshot,
    createSnapshotStore,
    configureSnapshot,
    delegate,
    data: {
      ...(snapshotData.data && typeof snapshotData.data === 'object' ? snapshotData.data : {}),
      priority:
        snapshotData.data &&
        isDataWithPriority(snapshotData.data) &&
        snapshotData.data.priority !== undefined
          ? snapshotData.data.priority.toString()
          : undefined,
    } as T,
    getSnapshotId: () => (snapshotData.id ? snapshotData.id.toString() : ""),
     name: snapshotData.title ?? "",
     description: snapshotData.description ?? "",
     tags: snapshotData.tags ?? {},
     
    metadata: {},
    config: [],

    version:
      snapshotData.data &&
      isDataWithVersion(snapshotData.data) &&
      snapshotData.data.version !== undefined
        ? snapshotData.data.version.toString()
        : "",

    initialState: snapshotData.initializedState ?? null,
    snapshotCategory: snapshotData.category ?? undefined,
    snapshotSubscriberId: snapshotData.subscriberId ?? null,
    snapshotContent: snapshotData.content ?? undefined,
    handleSnapshot: snapshotData.handleSnapshot ?? null,
    state: snapshotData.state ?? undefined,

    configureSnapshotStore: snapshotData.configureSnapshotStore ?? null,

    updateSnapshotSuccess: snapshotData.updateSnapshotSuccess ?? null,
    createSnapshotFailure: snapshotData.createSnapshotFailure ?? null,
    batchTakeSnapshot: snapshotData.batchTakeSnapshot ?? null,
    snapshots: [],
    subscribers: [],
    mapSnapshot: snapshotData.mapSnapshot ?? null,
    createSnapshotStores: snapshotData.createSnapshotStores ?? null,
    createSnapshotSuccess: snapshotData.createSnapshotSuccess ?? null,

    onSnapshots: snapshotData.onSnapshots,
    snapshotData: () => ({ snapshots: {} as Snapshots<T> }),
    clearSnapshot: () => snapshotData.clearSnapshotSuccess ?? null,
    handleSnapshotOperation: snapshotData.handleSnapshotOperation ?? null,
    content: undefined,
    onSnapshotStore: (
      snapshotId: string,
      snapshots: Snapshots<T>,
      type: string,
      event: Event,
      callback: (snapshots: Snapshots<T>) => void
    ) => {
      // Implement the onSnapshotStore function or provide a default behavior
      console.log('onSnapshotStore called');
      callback(snapshots);
    },
    displayToast: (
      message: string,
      type: string,
      duration: number,
      onClose: () => void
    ) => {
      // Implement the displayToast function or provide a default behavior
      console.log('displayToast called');
      if (type === 'success') {
        toast.success(message, {
          position: 'top-right',
          autoClose: duration,
          onClose: onClose,
        });
      } else if (type === 'error') {
        toast.error(message, {
          position: 'top-right',
          autoClose: duration,
          onClose: onClose,
        });
      }
  
    },
   
    fetchInitialSnapshotData: (
      snapshotId: string,
      snapshotData: SnapshotStore<T, K>,
      category: string | CategoryProperties | undefined,
      snapshotConfig: SnapshotStoreConfig<Data, K>,
      callback: (snapshotStore: SnapshotStore<T, K>) => Promise<Snapshot<T, K>>
    ): Promise<Snapshot<T, K>> => {
      
      // Implement the fetchInitialSnapshotData function or provide a default behavior
      console.log('fetchInitialSnapshotData called');
      return Promise.resolve(callback(snapshotData))
    },
  
    updateSnapshot: (
      snapshotId: string,
      data: Map<string, BaseData>,
      events: Record<string, CalendarEvent<T, K>[]>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      newData: T,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, any>,
      callback: (snapshotStore: SnapshotStore<T, K>) => Promise<{ snapshot: Snapshot<Data, K>; }>
    ) => {
      // Implement the updateSnapshot function or provide a default behavior
      console.log('updateSnapshot called');
      return Promise.resolve(callback(snapshotStore));
    }, 
    
     
getSnapshots: async (
  category: string,
  snapshots: Snapshots<BaseData> | SnapshotsObject<BaseData>
): Promise<{ snapshots: Snapshots<BaseData> }> => {
  try {
    let filteredSnapshots: Snapshots<BaseData>;

    if (Array.isArray(snapshots)) {
      // Filter snapshots if it's an array
      filteredSnapshots = snapshots.filter(snapshot => {
        // Check if snapshot and snapshot.data are valid and category is a property of BaseData
        if (snapshot && snapshot.data && 'category' in snapshot.data) {
          if (snapshot.data instanceof Map) {
            // Handle Map case
            return Array.from(snapshot.data.values()).some(s => s.data && 'category' in s.data && s.data.category === category);
          }
          // Handle plain object case
          return snapshot.data.category === category;
        }
        return false;
      });
    } else {
      // Filter snapshots if it's an object
      filteredSnapshots = Object.keys(snapshots)
        .filter(key => {
          const snapshot = snapshots[key];
          return snapshot && snapshot.data && 'category' in snapshot.data && snapshot.data.category === category;
        })
        .reduce((result, key) => {
          result[key] = snapshots[key];
          return result;
        }, {} as SnapshotsObject<BaseData>);
    }

    // Return the filtered snapshots
    return { snapshots: filteredSnapshots };
  } catch (error) {
    console.error("Error getting snapshots based on category:", error);
    throw error;
  }
},
    
    async addSnapshotToStore(
      storeId: number,
      snapshot: Snapshot<Data, K>,
      snapshotStore: SnapshotStore<T, K>,
      snapshotStoreData: SnapshotStore<T, K>,
      category: string | CategoryProperties | undefined,
      subscribers: Subscriber<Data, CustomSnapshotData>[]
    ): Promise<{ snapshotStore: SnapshotStore<T, K> }> {
      try {
        // Find the snapshot store by storeId if necessary
        // Assuming you have a way to find a snapshot store by its ID, if needed
        // This is just a placeholder and might not be needed if you already have the snapshotStore instance
        const store = this.findSnapshotStoreById(storeId);
        if (!store) {
          throw new Error(`Snapshot store with ID ${storeId} not found`);
        }

        // Add the snapshot to the store's snapshots
        store.snapshots.push(snapshot);

        // Update the store's category if provided
        if (category) {
          store.category = category;
        }

        // Update the store's subscribers if provided
        if (subscribers && subscribers.length > 0) {
          store.subscribers = subscribers;
        }

        // Perform any additional logic needed with snapshotStoreData
        // Assuming snapshotStoreData is used for some additional processing or validation

        // Save or update the snapshot store
        await this.saveSnapshotStore(store);

        // Return the updated snapshot store
        return { snapshotStore: store };
      } catch (error) {
        // Handle errors appropriately
        console.error('Error adding snapshot to store:', error);
        throw new Error('Failed to add snapshot to store');
      }
    },

     getSnapshotByStoreId(
      
    )

    async takeSnapshot(snapshot: Snapshot<Data, K>): Promise<{ snapshot: Snapshot<Data, K> }> {
      try {
        // Assign a unique ID to the snapshot
        const snapshotId = UniqueIDGenerator.generateSnapshotID();
        const newSnapshot: Snapshot<T, K> = {
          ...snapshot,
          id: snapshotId
        };
  
        // Assuming you have a storeId and other parameters needed for addSnapshotToStore
        const storeId = await snapshotApi.getSnapshotStoreId(Number(snapshotId))
        const snapshotStore: SnapshotStore<T, K> = this.getSnapshotStoreById(storeId);
        const snapshotStoreData: SnapshotStore<T, K> = snapshotStore; // Example data
        const category: string | CategoryProperties | undefined = "exampleCategory"; // Example category
        const subscribers: Subscriber<Data, CustomSnapshotData>[] = []; // Example subscribers
  
        // Add the snapshot to the store
        await this.addSnapshotToStore(storeId, newSnapshot, snapshotStore, snapshotStoreData, category, subscribers);
  
        // Return the new snapshot
        return { snapshot: newSnapshot };
      } catch (error) {
        console.error("Error taking snapshot:", error);
        throw error;
      }
    },
  
    
  // Method to add a snapshot
  addSnapshot: (snapshot: T, subscribers: Subscriber<BaseData, K>[]): void => {
    try {
      
      const snapshotManager = await useSnapshotManager<T, K>();
      const snapshotStore = snapshotManager?.state;
      
      if (snapshotStore && snapshotStore.length > 0) {
        
        // Logic to add the snapshot to the store or collection
        // update snapshot : T to snapshot : Snapshot<T, K > 
        const updatedSnapshotData: Snapshot<T, K> = {
          ...snapshot,
          id: generateSnapshotId,
          data: {
            ...(snapshot.data as T),
            createdAt: new Date(),
            updatedAt: new Date(),
          } as T,
          getDataStore = async ():Promise< Map<string, T>> => {
            try {
              // Generate some example data
              const exampleData: DataStore<T, K>[] = [
                {
                  id: '1',
                  data: {
                    // Your data properties here
                  } as T,
                  metadata: {
                    // Your metadata properties here
                  } as K,
                  mapSnapshot: function (id: number, snapshotId: string, snapshot: Snapshot<Data, K>, type: string, event: Event): Promise<Snapshot<T, K> | undefined> {
                    throw new Error('Function not implemented.');
                  },
                  mapSnapshots: function (storeIds: number[], snapshotId: string, category: string | CategoryProperties | undefined, snapshot: Snapshot<Data, K>, timestamp: string | number | Date | undefined, type: string, event: Event, id: number, snapshotStore: SnapshotStore<Data, any>, data: Data): Promise<Snapshots<T>> {
                    throw new Error('Function not implemented.');
                  },
                  mapSnapshotStore: function (id: number): Promise<SnapshotStore<T, K> | undefined> {
                    throw new Error('Function not implemented.');
                  },
                  addData: function (data: Snapshot<T, K>): void {
                    throw new Error('Function not implemented.');
                  },
                  getData: function (id: number): Promise<SnapshotWithCriteria<T, K> | undefined> {
                    throw new Error('Function not implemented.');
                  },
                  getStoreData: function (id: number): Promise<SnapshotStore<T, K>[]> {
                    throw new Error('Function not implemented.');
                  },
                  getItem: function (id: string): Promise<Snapshot<T, K> | undefined> {
                    throw new Error('Function not implemented.');
                  },
                  removeData: function (id: number): void {
                    throw new Error('Function not implemented.');
                  },
                  updateData: function (id: number, newData: Snapshot<T, K>): void {
                    throw new Error('Function not implemented.');
                  },
                  updateStoreData: function (data: Data, id: number, newData: SnapshotStore<T, K>): void {
                    throw new Error('Function not implemented.');
                  },
                  updateDataTitle: function (id: number, title: string): void {
                    throw new Error('Function not implemented.');
                  },
                  updateDataDescription: function (id: number, description: string): void {
                    throw new Error('Function not implemented.');
                  },
                  addDataStatus: function (id: number, status: 'pending' | 'inProgress' | 'completed'): void {
                    throw new Error('Function not implemented.');
                  },
                  updateDataStatus: function (id: number, status: 'pending' | 'inProgress' | 'completed'): void {
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
                  getBackendVersion: function (): IHydrateResult<number> | Promise<string> {
                    throw new Error('Function not implemented.');
                  },
                  getFrontendVersion: function (): IHydrateResult<number> | Promise<string> {
                    throw new Error('Function not implemented.');
                  },
                  getAllKeys: function (): Promise<string[]> {
                    throw new Error('Function not implemented.');
                  },
                  fetchData: function (id: number): Promise<SnapshotStore<T, K>[]> {
                    throw new Error('Function not implemented.');
                  },
                  setItem: function (id: string, item: Snapshot<T, K>): Promise<void> {
                    throw new Error('Function not implemented.');
                  },
                  removeItem: function (key: string): Promise<void> {
                    throw new Error('Function not implemented.');
                  },
                  getAllItems: function (): Promise<Snapshot<T, K>[]> | undefined {
                    throw new Error('Function not implemented.');
                  },
                  getDelegate: function (context: { useSimulatedDataSource: boolean; simulatedDataSource: SnapshotStoreConfig<Data, K>[]; }): Promise<SnapshotStoreConfig<Data, any>[]> {
                    throw new Error('Function not implemented.');
                  },
                  updateDelegate: function (config: SnapshotStoreConfig<Data, K>[]): Promise<SnapshotStoreConfig<Data, K>[]> {
                    throw new Error('Function not implemented.');
                  },
                  getSnapshot: function (snapshot: (id: string) =>
                    | Promise<{
                      category: Category | undefined;
                      categoryProperties: CategoryProperties;
                      timestamp: string | number | Date | undefined;
                      id: string | number | undefined;
                      snapshot: Snapshot<T, K>;
                      snapshotStore: SnapshotStore<T, K>;
                      data: T;
                      }>
                    | undefined
                  ): Promise<Snapshot<T, K> | undefined> {
                    throw new Error('Function not implemented.');
                  },
                  getSnapshotWithCriteria: function (category: any, timestamp: any, id: number, snapshot: Snapshot<BaseData, K>, snapshotStore: SnapshotStore<T, K>, data: T): Promise<SnapshotWithCriteria<T, K> | undefined> {
                    throw new Error('Function not implemented.');
                  },
                  getSnapshotContainer: function (category: any, timestamp: any, id: number, snapshot: Snapshot<BaseData, K>, snapshotStore: SnapshotStore<T, K>, data: T): Promise<SnapshotContainer<T, K> | undefined> {
                    throw new Error('Function not implemented.');
                  },
                  getSnapshotVersions: function (category: any, timestamp: any, id: number, snapshot: Snapshot<BaseData, K>, snapshotStore: SnapshotStore<T, K>, data: T): Promise<Snapshot<T, K>[] | undefined> {
                    throw new Error('Function not implemented.');
                  }
                },
                // Add more example data items if needed
              ];
              
              // Return the generated data
              return exampleData;
            } catch (error) {
              // Handle any errors that occur during the data generation
              console.error('Error generating data store:', error);
              throw error; // Rethrow the error after logging it
            }
          },          
          timestamp: new Date(),
          category: "update",
          length: 0,
          content: undefined,
          snapshotStoreConfig: null,
          getSnapshotItems: [],
          defaultSubscribeToSnapshots: ,
          transformSubscriber: function (sub: Subscriber<T, K>): Subscriber<T, K> {
            throw new Error('Function not implemented.');
          },
          transformDelegate: function (): SnapshotStoreConfig<Data, K>[] {
            throw new Error('Function not implemented.');
          },
          initializedState: undefined,
          getAllKeys: function (): Promise<string[]> | undefined {
            throw new Error('Function not implemented.');
          },
          getAllItems: function (): Promise<Snapshot<T, K>[]> | undefined {
            throw new Error('Function not implemented.');
          },
          addDataStatus: function (id: number, status: 'completed' | 'pending' | 'inProgress'): void {
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
          updateDataStatus: function (id: number, status: 'completed' | 'pending' | 'inProgress'): void {
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
          defaultSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K>>, snapshot: Snapshot<Data, K>): string {
            throw new Error('Function not implemented.');
          },
          handleSubscribeToSnapshot: function (snapshotId: string, callback: Callback<Snapshot<T, K>>, snapshot: Snapshot<Data, K>): void {
            throw new Error('Function not implemented.');
          },
          removeItem: function (key: string): Promise<void> {
            throw new Error('Function not implemented.');
          },
          getSnapshot: function (
            snapshot: (id: string) => Promise<{
            category: any;
            timestamp: any;
            id: any; snapshot: Snapshot<Data, K>;
            snapshotStore: SnapshotStore<T, K>;
            data: T;
          }> | undefined): Promise<Snapshot<T, K>> {
            throw new Error('Function not implemented.');
          },
          getSnapshotSuccess: function (snapshot: Snapshot<Data, K>): Promise<SnapshotStore<T, K>> {
            throw new Error('Function not implemented.');
          },
          setItem: function (key: string, value: T): Promise<void> {
            throw new Error('Function not implemented.');
          },
          addSnapshotSuccess: function (snapshot: T, subscribers: Subscriber<T, K>[]): void {
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
          getDelegate: function (snapshotStoreConfig: SnapshotStoreConfig<Data, K>[]): SnapshotStoreConfig<Data, K>[] {
            throw new Error('Function not implemented.');
          },
          determineCategory: function (snapshot: Snapshot<Data, K> | null | undefined): string {
            throw new Error('Function not implemented.');
          },
          determinePrefix: function <T extends Data>(snapshot: T | null | undefined, category: string): string {
            throw new Error('Function not implemented.');
          },
          removeSnapshot: function (snapshotToRemove: SnapshotStore<T, K>): void {
            throw new Error('Function not implemented.');
          },
          addSnapshotItem: function (item: Snapshot<any, any> | SnapshotStoreConfig<Data, K>): void {
            throw new Error('Function not implemented.');
          },
          addNestedStore: function (store: SnapshotStore<T, K>): void {
            throw new Error('Function not implemented.');
          },
          clearSnapshots: function (): void {
            throw new Error('Function not implemented.');
          },
          addSnapshot: function (snapshot: Snapshot<Data, K>, subscribers: Subscriber<T, K>[]): Promise<void> {
            throw new Error('Function not implemented.');
          },
          createSnapshot: undefined,
          createInitSnapshot: function (id: string, snapshotData: SnapshotStoreConfig<any, T>, category: string): Snapshot<Data, Data> {
            throw new Error('Function not implemented.');
          },
          setSnapshotSuccess: function (snapshotData: SnapshotStore<T, K>, subscribers: ((data: Subscriber<T, K>) => void)[]): void {
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
          initSnapshot: function (snapshotConfig: SnapshotStoreConfig<Data, K>, snapshotData: SnapshotStore<T, K>): void {
            throw new Error('Function not implemented.');
          },
          takeSnapshot: function (snapshot: Snapshot<Data, K>, subscribers: Subscriber<T, K>[]): Promise<{ snapshot: Snapshot<Data, K>; }> {
            throw new Error('Function not implemented.');
          },
          takeSnapshotSuccess: function (snapshot: Snapshot<Data, K>): void {
            throw new Error('Function not implemented.');
          },
          takeSnapshotsSuccess: function (snapshots: T[]): void {
            throw new Error('Function not implemented.');
          },
          flatMap: function <U extends Iterable<any>>(callback: (value: SnapshotStoreConfig<Data, K>, index: number, array: SnapshotStoreConfig<Data, K>[]) => U): U extends (infer I)[] ? I[] : U[] {
            throw new Error('Function not implemented.');
          },
          getState: function () {
            throw new Error('Function not implemented.');
          },
          setState: function (state: any): void {
            throw new Error('Function not implemented.');
          },
          validateSnapshot: function (snapshot: Snapshot<Data, K>): boolean {
            throw new Error('Function not implemented.');
          },
          handleActions: function (action: (selectedText: string) => void): void {
            throw new Error('Function not implemented.');
          },
          setSnapshot: function (snapshot: Snapshot<Data, K>): void {
            throw new Error('Function not implemented.');
          },
          transformSnapshotConfig: function <T extends BaseData>(config: SnapshotStoreConfig<BaseData, T>): SnapshotStoreConfig<BaseData, T> {
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
          reduceSnapshots: function (): void {
            throw new Error('Function not implemented.');
          },
          sortSnapshots: function (): void {
            throw new Error('Function not implemented.');
          },
          filterSnapshots: function (): void {
            throw new Error('Function not implemented.');
          },
          findSnapshot: function (): void {
            throw new Error('Function not implemented.');
          },
          getSubscribers: function (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T>): Promise<{ subscribers: Subscriber<T, K>[]; snapshots: Snapshots<T>; }> {
            throw new Error('Function not implemented.');
          },
          notify: function (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition | undefined): void {
            throw new Error('Function not implemented.');
          },
          notifySubscribers: function (subscribers: Subscriber<T, K>[], data: Partial<SnapshotStoreConfig<BaseData, any>>): Subscriber<BaseData, K>[] {
            throw new Error('Function not implemented.');
          },
          getSnapshots: function (category: string, data: Snapshots<T>): void {
            throw new Error('Function not implemented.');
          },
          getAllSnapshots: function (data: (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T>) => Promise<Snapshots<T>>): void {
            throw new Error('Function not implemented.');
          },
          generateId: function (): string {
            throw new Error('Function not implemented.');
          },
          batchFetchSnapshots: function (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T>): void {
            throw new Error('Function not implemented.');
          },
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
          snapshot: null,
          getSnapshotId: function (key: string | SnapshotData<T, K>): unknown {
            throw new Error('Function not implemented.');
          },
          compareSnapshotState: function (arg0: Snapshot<T, K> | null, state: any): unknown {
            throw new Error('Function not implemented.');
          },
          eventRecords: null,
          snapshotStore: null,
          getParentId: function (snapshot: Snapshot<Data, K>): string | null {
            throw new Error('Function not implemented.');
          },
          getChildIds: function (childSnapshot: Snapshot<BaseData, K>): void {
            throw new Error('Function not implemented.');
          },
          addChild: function (snapshot: Snapshot<Data, K>): void {
            throw new Error('Function not implemented.');
          },
          removeChild: function (snapshot: Snapshot<Data, K>): void {
            throw new Error('Function not implemented.');
          },
          getChildren: function (): void {
            throw new Error('Function not implemented.');
          },
          hasChildren: function (): boolean {
            throw new Error('Function not implemented.');
          },
          isDescendantOf: function (snapshot: Snapshot<Data, K>, childSnapshot: Snapshot<T, K>): boolean {
            throw new Error('Function not implemented.');
          },
          dataItems: null,
          newData: null,
          getInitialState: function (): Snapshot<T, K> | null {
            throw new Error('Function not implemented.');
          },
          getConfigOption: function (): SnapshotStoreConfig<Data, K> | null {
            throw new Error('Function not implemented.');
          },
          getTimestamp: function (): Date | undefined {
            throw new Error('Function not implemented.');
          },
          getData: function (): T | Map<string, Snapshot<T, K>> | null | undefined {
            throw new Error('Function not implemented.');
          },
          setData: function (data: Map<string, Snapshot<T, K>>): void {
            throw new Error('Function not implemented.');
          },
          addData: function (): void {
            throw new Error('Function not implemented.');
          },
          stores: null,
          getStore: function (storeId: number, snapshotStore: SnapshotStore<T, K>, snapshotId: string, snapshot: Snapshot<Data, K>, type: string, event: Event): SnapshotStore<T, K> | null {
            throw new Error('Function not implemented.');
          },
          addStore: function (storeId: number, snapshotStore: SnapshotStore<T, K>, snapshotId: string, snapshot: Snapshot<Data, K>, type: string, event: Event): void | null {
            throw new Error('Function not implemented.');
          },
          mapSnapshot: function (storeId: number, snapshotStore: SnapshotStore<T, K>, snapshotId: string, snapshot: Snapshot<Data, K>, type: string, event: Event): Snapshot<T, K> | null {
            throw new Error('Function not implemented.');
          },
          mapSnapshots: function (storeIds: number[], snapshotId: string, snapshot: Snapshot<Data, K>, type: string, event: Event): void | null {
            throw new Error('Function not implemented.');
          },
          removeStore: function (storeId: number, store: SnapshotStore<T, K>, snapshotId: string, snapshot: Snapshot<Data, K>, type: string, event: Event): void | null {
            throw new Error('Function not implemented.');
          },
          unsubscribe: function (callback: Callback<Snapshot<T, K>>): void {
            throw new Error('Function not implemented.');
          },
          fetchSnapshot: function (callback: (snapshotId: string, payload: FetchSnapshotPayload<K>, snapshotStore: SnapshotStore<T, K>, payloadData: Data | T) => void): Snapshot<T, K> {
            throw new Error('Function not implemented.');
          },
          addSnapshotFailure: function (snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<Data, K>, payload: { error: Error; }): void {
            throw new Error('Function not implemented.');
          },
          configureSnapshotStore: function (snapshotStore: SnapshotStore<T, K>, snapshotId: string, data: Map<string, Snapshot<T, K>>, events: Record<string, CalendarEvent<T, K>[]>, dataItems: RealtimeDataItem[], newData: Snapshot<T, K>, payload: ConfigureSnapshotStorePayload<T>, store: SnapshotStore<any, K>, callback: (snapshotStore: SnapshotStore<T, K>) => void): void | null {
            throw new Error('Function not implemented.');
          },
          updateSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<Data, K>, payload: { error: Error; }): void | null {
            throw new Error('Function not implemented.');
          },
          createSnapshotFailure: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<Data, K>, payload: { error: Error; }): Promise<void> {
            throw new Error('Function not implemented.');
          },
          createSnapshotSuccess: function (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<Data, K>, payload: { error: Error; }): void | null {
            throw new Error('Function not implemented.');
          },
          createSnapshots: function (id: string, snapshotId: string, snapshot: Snapshot<Data, K>, snapshotManager: SnapshotManager<T, K>, payload: CreateSnapshotsPayload<T, K>, callback: (snapshots: Snapshot<T, K>[]) => void | null, snapshotDataConfig?: SnapshotConfig<T, K>[] | undefined, category?: string | CategoryProperties): Snapshot<T, K>[] | null {
            throw new Error('Function not implemented.');
          },
          onSnapshot: function (snapshotId: string, snapshot: Snapshot<Data, K>, type: string, event: Event, callback: (snapshot: Snapshot<Data, K>) => void): void {
            throw new Error('Function not implemented.');
          },
          onSnapshots: function (snapshotId: string, snapshots: Snapshots<T>, type: string, event: Event, callback: (snapshots: Snapshots<T>) => void): void {
            throw new Error('Function not implemented.');
          },
          label: undefined,
          events: {
            callbacks: function (snapshot: Snapshots<T>): void {
              throw new Error('Function not implemented.');
            },
            eventRecords: undefined
          },
          handleSnapshot: function (snapshotId: string, snapshot: Snapshot<Data, K> | null, snapshots: Snapshots<T>, type: string, event: Event): Promise<void> | null {
            throw new Error('Function not implemented.');
          },
          meta: undefined,
          getStores: function (
            snapshotId: string,
            snapshot: Snapshot<Data, K>,
            snapshotStore: SnapshotStore<T, K>,
            snapshotManager: SnapshotManager<T, K>,
            payload: { error: Error; }
          ): void {
            throw new Error('Function not implemented.');
          },
         
        };
    
        snapshotStore.push(updatedSnapshotData);
  
        // Notify all subscribers about the new snapshot
        subscribers.forEach(subscriber => subscriber.onSnapshot(updatedSnapshotData));
      }
    } catch (error) {
      console.error("Error adding snapshot:", error);
      throw error;
    }
  },
  

  // Method to add a snapshot success
  addSnapshotSuccess: (snapshot: Snapshot<Data, K>, subscribers: Subscriber<BaseData, K>[]): void => {
    // Implementation logic here
  },

  // Method to remove a snapshot
  removeSnapshot: (snapshotToRemove: SnapshotStore<T, K>): void => {
    // Implementation logic here
  },

  // Method to get subscribers based on current subscribers and snapshots
  getSubscribers: async (
    subscribers: Subscriber<BaseData, K>[],
    snapshots: Snapshots<T>
  ): Promise<{ subscribers: Subscriber<BaseData, K>[]; snapshots: Snapshots<T> }> => {
    // Implementation logic here
    // For now, returning a placeholder
    return { subscribers, snapshots: {} as Snapshots<T> };
  },

  // Method to add a subscriber
  addSubscriber: (
    subscriber: Subscriber<BaseData, K>,
    data: T,
    snapshotConfig: SnapshotStoreConfig<BaseData, T>[],
    delegate: SnapshotStoreConfig<BaseData, K>[],
    sendNotification: (type: NotificationTypeEnum) => void
  ): void => {
    // Implementation logic here
  },

  // Method to validate a snapshot
  validateSnapshot: (data: Snapshot<Data, K>): boolean => {
    // Implementation logic here
    return true;
  },

  // Method to get a snapshot
  getSnapshot: (
    snapshot: (
      id: string
    ) => Promise<{
      category: any;
      timestamp: any; 
      id: any;
      snapshot: Snapshot<Data, K>;
      data: T
    }> | undefined
  ): Promise<Snapshot<T, K>> => {
    const snapshotId = await this.getSnapshotId(key).toString();
    return new Promise((resolve, reject) => {
      if (typeof snapshotId === 'undefined') {
        reject(new Error('snapshotId is undefined'));
      } else {
        snapshot(snapshotId)?.then(result => {
          if (result) {
            resolve(result.snapshot);
          } else {
            reject(new Error('Snapshot not found'));
          }
        }).catch(reject);
      }
    });
  },
  // Method to get a snapshot container using direct parameters
    getSnapshotContainer: async (
      snapshotFetcher: (id: string | number) => Promise<{ 
        category: any; 
        timestamp: any; 
        id: any; 
        snapshotStore: SnapshotStore<T, K>; 
        snapshot: Snapshot<Data, K>; 
        snapshots: Snapshots<T>
        data: T;
      }> | undefined
    ): Promise<SnapshotContainer<T, K>> => {
      try {
        const criteria = await getSnapshotCriteria(snapshotContainer, snapshot);
        const id = await getSnapshotId(criteria)
        const fetchedData = await snapshotFetcher(id ? id : id!.toString()
        );
        
        if (fetchedData) {
          const { category, timestamp, id, snapshot, data, snapshotStore, snapshots } = fetchedData;
          // Logic to construct SnapshotContainer
          const snapshotContainer: SnapshotContainer<T, K> = {
            category,
            timestamp,
            id,
            snapshotStore: snapshotStore,
            snapshotData: snapshotData,
            data: data,
            snapshot: snapshot,
            snapshots: snapshots
          };
          return snapshotContainer;
        } else {
          throw new Error("Failed to fetch snapshot data.");
        }
      } catch (error) {
        console.error("Error fetching snapshot container:", error);
        throw error;
      }
    },

  // Method to get all snapshots
  getAllSnapshots: async (
    data: (
      subscribers: Subscriber<T, K>[],
      snapshots: Snapshots<T>
    ) => Promise<Snapshots<T>>
  ): Promise<Snapshots<T>> => {
    // check for existing snapshots
    const existingSnapshots = await data(this.subscribers, this.snapshots);
    if (existingSnapshots) {
      return existingSnapshots;
    }
    // If no existing snapshots, fetch new snapshots
    const newSnapshots = await data(this.subscribers, this.snapshots);
  },

  // Method to take a snapshot success
  takeSnapshotSuccess: (snapshot: Snapshot<Data, K>): void => {
    // Implementation logic here
  },

  // Method to handle update snapshot failure
  updateSnapshotFailure: (payload: { error: string }): void => {
    // Implementation logic here
  },

  // Method to handle take snapshots success
  takeSnapshotsSuccess: (snapshots: T[]): void => {
    // Implementation logic here
  },

  // Method to fetch a snapshot
  fetchSnapshot: async (
    id: string,
    category: string | CategoryProperties | undefined,
    timestamp: Date,
    snapshot: Snapshot<Data, K>,
    data: T,
    delegate: SnapshotWithCriteria<T, K>[] | null
  ): Promise<{
    id: any;
    category: string | CategoryProperties | undefined;
    timestamp: any; 
    snapshot: Snapshot<Data, K>; 
    data: T;
    delegate: SnapshotWithCriteria<T, K>[] | null
  }> => {
    // Implementation logic here
    // For now, returning a placeholder
    return { id, category, timestamp, snapshot, data, delegate };
    },
  
  
    addSnapshotToStore: async(
      storeId: number,
      snapshot: Snapshot<Data, K>,
      snapshotStore: SnapshotStore<T, K>,
      snapshotStoreData: SnapshotStore<T, K>,
      category: string | CategoryProperties | undefined,
      subscribers: Subscriber<Data, CustomSnapshotData>[]
    ): Promise<{ snapshotStore: SnapshotStore<T, K> }> => { 
      return new Promise((resolve, reject) => {
        try {

          const options = createSnapshotStoreOptions<T, K>({
            initialState,
            snapshotId: "", // Provide appropriate snapshotId
            category: category as unknown as CategoryProperties,
            dataStoreMethods: {
              // Provide appropriate dataStoreMethods
            }
          });
          const config: SnapshotStoreConfig<Data, K> = snapshotStoreConfig;
    
      const operation: SnapshotOperation = {
        // Provide the required operation details
        operationType: SnapshotOperationType.FindSnapshot
      };


          const snapshotStore = new SnapshotStore<T, K>(options, config, operation);
          resolve({ snapshotStore });
        } catch (error) {
          reject(error);
        }
      })
      },
    
   
    getSnapshotSuccess: undefined,
    setSnapshotSuccess: undefined,
    setSnapshotFailure: undefined,
   
    updateSnapshotsSuccess: undefined,
    fetchSnapshotSuccess: undefined,
    updateSnapshotForSubscriber: undefined,
    
    updateMainSnapshots: undefined,
    batchProcessSnapshots: undefined,
    batchUpdateSnapshots: undefined,
   
    batchFetchSnapshotsRequest: undefined,
    batchTakeSnapshotsRequest: undefined,
    batchUpdateSnapshotsRequest: undefined,
   
    batchFetchSnapshots: undefined,
    getData: undefined,
    batchFetchSnapshotsSuccess: undefined,
   
    batchFetchSnapshotsFailure: undefined,
    batchUpdateSnapshotsFailure: undefined,
    notifySubscribers: undefined,
   
    notify: undefined,
    getCategory: undefined,
    updateSnapshots: undefined,
    updateSnapshotsFailure: undefined,
    
    
  // flatMap: <U>(
  //   callback: (
  //     snapshot: Snapshot<Data, K> | SnapshotStoreConfig<Data, K>,
  //     index: number,
  //     array: (Snapshot<T, K> | SnapshotStoreConfig<Data, K>)[]
  //   ) => U | U[]
  // ): U[] => {
  //   // Implement the flatMap logic here
  //   const result: U[] = [];
  //   // Example implementation, adjust as needed
  //   const array = [] as (Snapshot<T, K> | SnapshotStoreConfig<Data, K>)[];
  //   array.forEach((value, index) => {
  //     const callbackResult = callback(value, index, array);
  //     if (Array.isArray(callbackResult)) {
  //       result.push(...callbackResult);
  //     } else {
  //       result.push(callbackResult);
  //     }
  //   });
  //   return result;
  // },

    setData: (data: K) => { },
 
    getState: () => { },
    setState: (state: any) =>{},
    handleActions: (action: any) => {},
   
    setSnapshots: (snapshots: Snapshots<T>) =>{},
    mergeSnapshots: async (snapshots: Snapshots<T>, category: string) => {},
    // reduceSnapshots: <U>(callback: (acc: U, snapshot: Snapshot<Data, K>) => U, initialValue: U) => U,
    sortSnapshots: (compareFn: (
      a: Snapshot<T, K>,
      b: Snapshot<T, K>
    ) => number) => {},
    filterSnapshots: (predicate: (snapshot: Snapshot<Data, K>) => boolean) => {
      if(!this.snapshot.filter(predicate))
      return this.snapshots.filter(predicate);
    },
    findSnapshot: undefined,
   
    subscribe: undefined,
    
    unsubscribe: (
      callback: (snapshot: Snapshot<Data, K>
        
      ) => void) => {},
   
    fetchSnapshotFailure: (payload: { error: Error; }) =>{}, 
    generateId: () => "",
    [Symbol.iterator]: function* (): IterableIterator<T> { yield* [] as T[]; },
    [Symbol.asyncIterator]: async function* (): AsyncIterableIterator<T> { yield* [] as T[]; },
  };

  return config
};

