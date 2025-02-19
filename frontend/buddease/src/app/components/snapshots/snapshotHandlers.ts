// snapshotHandlers.ts
import { UpdateSnapshotPayload } from "@/app/components/database/Payload";
import { allCategories } from '@/app/components/models/data/DataStructureCategories';
import { SnapshotData } from '@/app/components/snapshots';
import { SnapshotsArray } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { useSecureStoreId } from './../utils/useSecureStoreId';


import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { K, T } from "@/app/components/models/data/dataStoreMethods";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import updateUI from '../documents/editing/updateUI';
import { BaseData, Data } from "../models/data/Data";
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import axiosInstance from '../security/csrfToken';
import { endpoints } from './../../api/ApiEndpoints';
import { SnapshotManager, useSnapshotManager } from './../../components/hooks/useSnapshotManager';
import SnapshotStore from './../../components/snapshots/SnapshotStore';
import { CategoryProperties } from './../../pages/personas/ScenarioBuilder';

import { getSubscribersAPI } from "@/app/api/subscriberApi";
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CustomSnapshotData } from '.';
import * as snapshotApi from '../../api/SnapshotApi';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import { getCategoryProperties } from '../libraries/categories/CategoryManager';
import { Category } from '../libraries/categories/generateCategoryProperties';
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { useSnapshotSlice } from '../state/redux/slices/SnapshotSlice';
import {
    NotificationTypeEnum,
    useNotification
} from "../support/NotificationContext";
import NOTIFICATION_MESSAGES from '../support/NotificationMessages';
import { createSnapshotStoreOptions } from "../typings/YourSpecificSnapshotType";
import { Subscriber } from "../users/Subscriber";
import { addToSnapshotList, generateSnapshotId } from "../utils/snapshotUtils";
import useSecureSnapshotId from '../utils/useSecureSnapshotId';
import { FetchSnapshotPayload } from './FetchSnapshotPayload';
import { Snapshot, Snapshots } from './LocalStorageSnapshotStore';
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import { createSnapshotItem, SnapshotItem } from "./SnapshotList";
import SnapshotManagerOptions from './SnapshotManagerOptions';
import { snapshotStoreConfig, SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { useSnapshotStore } from "./useSnapshotStore";
const { notify } = useNotification();
const dispatch = useDispatch()

const API_BASE_URL = endpoints
// Handler for creating a snapshot
export const createInitSnapshot = (additionalData: any): void => {
  const newSnapshot = {
    id: generateSnapshotId,
    data: {},
    timestamp: new Date(),
  };

  newSnapshot.data = {
    ...newSnapshot.data,
    ...additionalData,
  };
};

export const initSnapshot: T = {
  length: 0,
  id: "initial-id",
  category: "initial-category",
  subscriberId: 'initial-subscriber',
  timestamp: new Date(),
  content: undefined,
  data: undefined
};


const snapshotSubscribers: Map<string, Set<Subscriber<BaseData, BaseData>>> = new Map();

export const subscribeToSnapshots =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotStore: SnapshotStore<T, K>,
  snapshotId: string,
  snapshotData: SnapshotData<T, K>,
  category: symbol | string | Category | undefined,
  snapshotConfig: SnapshotStoreConfig<T, K>,
  callback: (
    snapshotStore: SnapshotStore<T, K>, 
    snapshots: SnapshotsArray<T, K>
  ) => Subscriber<T, K> | null,
  snapshots: SnapshotsArray<T, K>,
  unsubscribe?: UnsubscribeDetails, 
): SnapshotsArray<T, K> => {
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, new Set<Subscriber<BaseData<any>, K>>());
  }

  if (callback !== null) {
    const subscriber = callback(snapshotStore, snapshots);
    if (subscriber !== null) {
      const subscribersSet = snapshotSubscribers.get(snapshotId) as Set<Subscriber<BaseData<any>, K>>;
      subscribersSet.add(subscriber);
    }
  }

  console.log(`Subscribed to snapshots with ID: ${snapshotId}`);
  return snapshots;
};



export const subscribeToSnapshot =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotId: string,
  callback: (snapshot: Snapshot<T, K>) => Subscriber<T, K> | null,
  snapshot: Snapshot<T, K>
): Subscriber<T, K> | null => {
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, new Set<Subscriber<T, K>>());
  }

  const subscriber = callback(snapshot);

  if (subscriber !== null) {
    const subscribersSet = snapshotSubscribers.get(snapshotId);
    subscribersSet?.add(subscriber);
    console.log(`Subscribed to snapshot with ID: ${snapshotId}`);
  }

  return subscriber;
};



// Create a function to initialize the snapshot store
const initializeSnapshotStore = async (
  id: string,
  snapshotStoreData: SnapshotStoreConfig<T, K<T>>[],
  // category: symbol | string | Category | undefined,
  categoryProperties: CategoryProperties | undefined,
  dataStoreMethods: DataStoreMethods<T, K<T>>,
): Promise<SnapshotStore<BaseData, K<T>>> => {
  // Initialize snapshotManager and snapshotStore
  const category = "New Category";
  const storeId = useSecureStoreId()
  if(!storeId){
    throw new Error("Invalid store identifier provided");
  }
  const snapshotManager = await useSnapshotManager<BaseData, BaseData>(storeId);
  const snapshotStore = await createSnapshotStore<BaseData, BaseData>(
    id,
    snapshotStoreData,
    category,
    categoryProperties,
    dataStoreMethods,
   );

  // Ensure snapshotStore and snapshotManager are not null before using them
  if (!snapshotStore || !snapshotManager) {
    throw new Error("SnapshotStore or SnapshotManager is not initialized");
  }

  const timestamp = new Date();

  // Example newData object
  const newData: Data<BaseData<any>> = {
    id: "new-id",
    name: "New Name",
    value: "New Value",
    timestamp: new Date(),
    category: "New Category",
  };

  // Convert newData to a Map<string, Data>
  const newDataMap = new Map<string, Data<BaseData<any>>>();
  newDataMap.set(newData.id!.toString(), newData);

  // Example usage:
  const newSnapshot: Snapshot<T, K<T>> = {
    id: "123",
    data: newDataMap,
    timestamp: new Date(),
    category: "New Category",
    type: "",
    meta: new Map<string, Snapshot< BaseData<any>, any>>(),
    snapshotStoreConfig: {} as SnapshotStoreConfig<T, any> | null | undefined,
    getSnapshotItems: function(): (SnapshotStoreConfig<T, K> | SnapshotItem< BaseData<any>, any>)[] {
      const items: (SnapshotStoreConfig<T, K> | SnapshotItem< BaseData<any>, any>)[] = [];
  
      // Add the snapshot store configuration to the array if it exists
      this.snapshotStoreConfig && items.push(this.snapshotStoreConfig);
  
      // Iterate over the snapshot data and add each item to the array
      this.data?.forEach((item: any, key: any) => {
        const snapshotItem = createSnapshotItem(
          snapshotId,
          data,
          key,
          item,
          this.category, 
          this.snapshotStore,  
          this.snapshotStoreConfig ?? null
          );
        items.push(snapshotItem);
      });
  
      return items;
    }
    
    // ... rest of the code remains unchanged
  };
  return snapshotStore;
};

async function createSnapshotStore<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  id: string,
  snapshotStoreData: SnapshotStoreConfig<T, K>[],
  category: symbol | string | Category | undefined,
  categoryProperties: CategoryProperties | undefined,
  dataStoreMethods: DataStoreMethods<T, K>,
): Promise<SnapshotStore<T, K>> {
  
  // Logic to set up the storeId, options, and operation
  const storeId = await snapshotApi.getSnapshotStoreId(id);
  
  const options = await useSnapshotManager(storeId) 
    ? new SnapshotManagerOptions().get() 
    : {};

  const config: SnapshotStoreConfig<T, K>[] = snapshotStoreData;

  const operation: SnapshotOperation<T, K> = {
    operationType: SnapshotOperationType.CreateSnapshot, // Example operation type
    // Add any additional properties as needed
  };

  const snapshotStore: SnapshotStore<T, K> = {
    snapshots: [],
    taskIdToAssign: "",
    config,
    addSnapshot: async (
      snapshot: Snapshot<T, K>, snapshotId: string,
      subscribers: SubscriberCollection<T, K>
    ) => {
      // Implement addSnapshot logic here
    },
    snapshotId: "",
    updateSnapshot(
      snapshotId: string,
      data: Map<string, Snapshot<T, K>>,
      events: Record<string, CalendarManagerStoreClass<T, K>[]>,
      snapshotStore: SnapshotStore<T, K>,
      dataItems: RealtimeDataItem[],
      newData: Snapshot<T, K>,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, K>
    ): Promise<{ snapshot: Snapshot<T, K>; }> {
      return new Promise<{ snapshot: Snapshot<T, K>; }>(async (resolve, reject) => {
        const snapshotPromise = snapshotStore.getSnapshot(async (id: string) => {
          const foundSnapshot = data.get(id);
          if (foundSnapshot) {
            return {
              category: foundSnapshot.category,
              timestamp: foundSnapshot.timestamp,
              id: foundSnapshot.id,
              snapshot: foundSnapshot,
              snapshotStore: snapshotStore,
              data: foundSnapshot.data as T,
            };
          } else {
            return undefined;
          }
        });

        const snapshot = await snapshotPromise;

        if (!snapshot) {
          return reject(new Error(`Snapshot with ID ${snapshotId} not found`));
        }

        console.log(`Snapshot with ID ${snapshotId} found`);
        resolve({ snapshot: snapshotStore });
      });
    },    
    // Rest of the properties
    removeSnapshot: () => { },
    clearSnapshots: () => { },
    initialState: null,
    category: category ? category.toString() : undefined ,
    timestamp: new Date(),


    
    handleSnapshot: (id: string,
      snapshotId: string,
      snapshot: T | null,
      snapshotData: T,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<T, K>,
      type: string,
      event: Event,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<T,
        K
      >
    ): Promise<Snapshot<T, K> | null> => {
      const result = handleDelegate(
        (
          delegate: DataStoreMethods<T, K>,

        ) => delegate.handleSnapshot,
        id,
        snapshotId,
        snapshot,
        snapshotData,
        category,
        callback,
        snapshots,
        type,
        event,
        snapshotContainer,
        snapshotStoreConfig
      );
  
      return result !== undefined ? result : Promise.resolve(null);
    },
    state: [],
    subscribers: [],
    createSnapshot: () => ({} as Snapshot< BaseData<any>, Data>),
    configureSnapshotStore: () => { },
    createSnapshotSuccess: () => { },
    snapshotConfig: config,
    delegate: [],
    getDelegate: (context: {
      useSimulatedDataSource: boolean;
      simulatedDataSource: SnapshotStoreConfig<
        SnapshotWithCriteria<any, BaseData>,
        K
      >[];
    })=> {

    },
    determinePrefix: () => "",
    handleSnapshotSuccess: () => { },
    async createSnapshotFailure(
      snapshotId: string,
      snapshotManager: SnapshotManager<T, K>,
      snapshot: Snapshot<T, K>,
      payload: { error: Error }
    ): Promise<void> {
      console.error(`Snapshot creation failed for ID: ${snapshotId}`, payload.error);
      // Notify or log the error within the snapshot manager context
      await snapshotManager.handleFailure(snapshotId, snapshot, payload.error);
    },
    
    async batchTakeSnapshot(
      snapshotStore: SnapshotStore<T, K>,
      snapshots: Snapshots<T, K>
    ): Promise<{ snapshots: Snapshots<T, K> }> {
      const snapshotResults: Snapshots<T, K> = new Map();

      for (const [id, snapshotData] of snapshots) {
        try {
          const snapshot = await dataStoreMethods.createSnapshot(id, snapshotData);
          snapshotResults.set(id, snapshot);
        } catch (error) {
          console.error(`Failed to take snapshot for ID: ${id}`, error);
          if (snapshotStore.createSnapshotFailure) {
            await snapshotStore.createSnapshotFailure(id, snapshotManager, snapshotData, { error });
          }
        }
      }

      return { snapshots: snapshotResults };
    },
 
    onSnapshot: (
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      type: string,
      event: Event,
      callback: (snapshot: Snapshot<T, K>) => void
    ): Snapshot<T, K> => {
      try {
        // Execute the callback with the provided snapshot
        callback(snapshot);
  
        // Optionally log or perform other actions based on type and event
        console.log(`Snapshot with ID ${snapshotId} updated. Type: ${type}, Event: ${event.type}`);
        
        // Return the snapshot after processing
        return snapshot;
      } catch (error) {
        console.error("Error handling snapshot:", error);
        throw error; // Propagate the error if necessary
      }
    },    
  onSnapshots: (
    snapshots: Snapshot<T, K>[],
    type: string,
    event: Event,
    callback: (snapshots: Snapshot<T, K>[]) => void
  ): Snapshot<T, K>[] => {
    try {
      // Execute the callback with the collection of snapshots
      callback(snapshots);

      // Optionally log or perform other actions based on type and event
      console.log(`Processed ${snapshots.length} snapshots. Type: ${type}, Event: ${event.type}`);
      
      // Return the collection of snapshots after processing
      return snapshots;
    } catch (error) {
      console.error("Error handling snapshots:", error);
      throw error; // Propagate the error if necessary
    }
  },
    snapshotData: {},
    initSnapshot: () => { },
    clearSnapshot: () => { },
    getSnapshots: () => [],
    takeSnapshot: (
      snapshot: Snapshot<T, K>,
      subscribers?: Subscriber<T, K>[]
    ): Promise<{ snapshot: Snapshot<T, K>; }> => {
      return new Promise<{ snapshot: Snapshot<T, K>; }>(async (resolve, reject) => {
        resolve({ snapshot: snapshot });
      });
    },
    addSnapshotSuccess: () => { },
    getSubscribers: (
      subscribers: Subscriber<T, K>[], 
      snapshots: Snapshots<T, K>
    ): Promise<{
      subscribers: Subscriber<T, K>[],
      snapshots: Snapshots<T, K>;
    }> => {
      return new Promise<{
        subscribers: Subscriber<T, K>[],
        snapshots: Snapshots<T, K>;
      }>(async (resolve, reject) => {
        resolve({
          subscribers: subscribers,
          snapshots: snapshots
        });
      });
    },
    addSubscriber: () => { },
    validateSnapshot: () => true,
    getSnapshot: (
      snapshot: (id: string) =>
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
    ) => Promise.resolve({} as Snapshot<T, K>),
    getAllSnapshots: () => [],
    takeSnapshotSuccess: () => { },
    updateSnapshotFailure: () => { },
    takeSnapshotsSuccess: () => { },
    fetchSnapshot(
      callback: (
        snapshotId: string,
        payload: FetchSnapshotPayload<K>,
        snapshotStore: SnapshotStore<T, K>,
        payloadData: T |  BaseData<any>,
        category: Category | undefined,
        categoryProperties: CategoryProperties | undefined,
        timestamp: Date,
        data: T,
        delegate: SnapshotWithCriteria<T, K>[]
      ) => void
    ): Promise<{
      id: any;
      category: Category | undefined;
      categoryProperties: CategoryProperties;
      timestamp: any;
      snapshot: Snapshot<T, K>;
      data: T;
      getItem?: (snapshot: Snapshot<T, K>) => Snapshot<T, K> | undefined;
    }> {
      try {
        // Assuming 'delegate' is an array of snapshot criteria or similar, and we need to fetch a snapshot
        // Here 'fetchSnapshot' is called on the delegate, modify as per your actual fetching logic
    
        const snapshotId = useSecureSnapshotId()
        const data = await snapshotApi.getSnapshotData<T, K>(snapshotId, additionalHeaders)
        const timestamp = Date.now()
        const fetchedSnapshot = await delegate[0].fetchSnapshot(
          snapshotId,
          category,
          timestamp,
          callback,
          data
        );
    
        // Return the required object structure
        return {
          id: fetchedSnapshot.id,
          category: fetchedSnapshot.category,
          categoryProperties: fetchedSnapshot.categoryProperties,
          timestamp: fetchedSnapshot.timestamp,
          snapshot: fetchedSnapshot.snapshot,
          data: fetchedSnapshot.data as T,
          getItem: fetchedSnapshot.getItem,
        };
      } catch (error) {
        console.error("Error fetching snapshot:", error);
        throw error; // Handle or propagate the error as needed
      }
    },
    
    updateSnapshotSuccess: () => { },
    updateSnapshotsSuccess: () => { },
    fetchSnapshotSuccess: () => { },
    updateSnapshotForSubscriber: () => { },
    updateMainSnapshots: () => { },
    batchUpdateSnapshots: () => { },
    batchFetchSnapshotsRequest: () => { },
    batchTakeSnapshotsRequest: () => { },
    batchUpdateSnapshotsRequest: () => { },
    batchFetchSnapshots: () => { },
    getData: () => ({} as Promise<SnapshotWithCriteria<T, K> | undefined>),
    batchFetchSnapshotsSuccess: () => { },
    batchFetchSnapshotsFailure: () => { },
    batchUpdateSnapshotsFailure: () => { },
    notifySubscribers: (
      subscribers: Subscriber<T, K>[],
      data: Partial<SnapshotStoreConfig<T, any>>
    ): Subscriber<T, K>[] => {
      return subscribers;
    },
    notify: () => { },
    updateSnapshots: () => { },
    updateSnapshotsFailure: () => { },
    flatMap<U extends Iterable<any>>(
      callback: (
        value: SnapshotStoreConfig<T, K>, 
        index: number, array: SnapshotStoreConfig<T, K>[]
      ) => U): U extends (infer I)[] ? I[] : U[] {

      const results: U[] = [];
      for (let i = 0; i < config.length; i++) {
        const result = callback(config[i], i, config);
        results.push(result);
      }
      return results.flat() as U extends (infer I)[] ? I[] : U[];
    },

    setData: () => { },
    getState: () => ({} as any),
    setState: () => { },
    handleActions: () => { },
    setSnapshots: () => { },
    mergeSnapshots: () => [],
    reduceSnapshots<U>(
      callback: (acc: U, snapshot: Snapshot<T, K>) => U,
      initialValue: U
    ): U | undefined {
      return this.snapshots.reduce(callback, initialValue);
    },
    sortSnapshots: () => [],
    filterSnapshots: () => [],
    mapSnapshots: async () => [],
    findSnapshot: () => ({} as Snapshot<T, K>),
    subscribe: () => { },
    unsubscribe: () => { },
    fetchSnapshotFailure: (
      snapshotId: string,
      snapshotManager: SnapshotManager<T, K>,
      snapshot: Snapshot<T, K>,
      date: Date | undefined,
      payload: { error: Error }
    ) => { },
    generateId: () => "",
    [Symbol.iterator]: () => ({} as IterableIterator<Snapshot<T, K>>),
    [Symbol.asyncIterator]: () => ({} as AsyncIterableIterator<T>),
  };

  return snapshotStore;
}

export const createSnapshotSuccess = async  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K>,
  storeId: number
) => {
  try {
    // Get the snapshot manager for the provided storeId
    const snapshotManager = await useSnapshotManager(storeId);

    // Ensure the snapshotManager and its state are available
    if (snapshotManager && snapshotManager.state) {
      const snapshotStore = snapshotManager.state;
      
      // Find the specific snapshot store configuration using storeId
      const snapshotStoreConfig = snapshotStore.find(
        (store) => store.id === storeId
      );

      // If the store configuration is found, proceed with the update
      if (snapshotStoreConfig) {
        const updatedSnapshotData = {
          ...snapshot,
          timestamp: new Date(),
        };

        // Update the snapshot store by adding the new snapshot data
        const updatedSnapshotStore = snapshotStore.map((store) => {
          if (store.id === storeId) {
            return {
              ...store,
              snapshots: [...store.snapshots, updatedSnapshotData],
            };
          }
          return store;
        });

        // Update the state of the snapshot manager with the new snapshot store data
        snapshotManager.setState(updatedSnapshotStore);
      }
    }

    // Additional handling for the snapshot store if it exists and has data
    const snapshotStore = snapshotManager.snapshotManager?.state;
    if (snapshotStore && snapshotStore.length > 0) {
      const updatedSnapshotData = {
        id: generateSnapshotId, // Ensure the ID is generated correctly
        data: {
          ...snapshot.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        timestamp: new Date(),
        category: "update",
        length: 0, // Add logic for determining length if needed
        content: undefined, // Modify if content is to be set
      };

      // Find the store to update with the new snapshot data
      const updatedSnapshotStore = snapshotStore.map((store) => {
        if (store.id === storeId) {
          return {
            ...store,
            snapshots: [...store.snapshots, updatedSnapshotData],
          };
        }
        return store;
      });

      // Set the updated store in the snapshot manager
      snapshotManager.setState(updatedSnapshotStore);
    }
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error creating snapshot success:", error);
  }
};


export const onSnapshot = async  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotId: number,
  snapshot: Snapshot<T, K>,
  type: string,
  event: Event,
  callback: (snapshot: Snapshot<T, K>) => void
): Promise<void> => {
  const snapshotManager = await useSnapshotManager<T, K>();
  const snapshotStore = snapshotManager?.state;

  if (snapshotStore && snapshotStore.length > 0) {
    const updatedSnapshotData: Snapshot<T, K> = {
      ...snapshot,
      id: generateSnapshotId,
      data: {
        ...(snapshot.data as T),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as T,
      timestamp: new Date(),
      category: "update",
      length: 0,
      content: undefined,
    };

    snapshotStore.push(updatedSnapshotData);

    // Call the callback with the updated snapshot
    callback(updatedSnapshotData);
  } else {
    // Call the callback with the original snapshot if no updates were made
    callback(snapshot);
  }
}


export const onSnapshots = async  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotId: string,
  snapshots: Snapshots<T, K>,
  type: string,
  event: Event,
  callback: (snapshots: Snapshots<T, K>) => void
): Promise<void> => {
  const snapshotManager = await useSnapshotManager<T, K>();
  const snapshotStore = snapshotManager?.state;

  if (snapshotStore && snapshotStore.length > 0) {
    const updatedSnapshotData: Snapshot<T, K>[] = snapshots.map((snapshot) => ({
      ...snapshot,
      id: generateSnapshotId,
      data: {
        ...(snapshot.data as T),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as T,
      timestamp: new Date(),
      category: "update",
      length: 0,
      content: undefined,
    }));

    snapshotStore.push(...updatedSnapshotData);

    // Call the callback with the updated snapshots
    callback(updatedSnapshotData);
  } else {
    // Call the callback with the original snapshots if no updates were made
    callback(snapshots);
  }
}

const defaultGetDelegate = (snapshotStoreConfig: SnapshotStoreConfig<any, any>[] | undefined): SnapshotStoreConfig<any, any>[] => {
  return []; // Default implementation, adjust as needed
};


export const delegate = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(): Promise<SnapshotStoreConfig<T, K>[]> => {
  try {
    const snapshotManager = await useSnapshotManager<T, K>(storeId);

    if (!snapshotManager || !snapshotManager.delegate) {
      console.error("snapshotManager or delegate is undefined");
      return [];
    }

    return snapshotManager.delegate(); // Call the async delegate function
  } catch (error) {
    console.error("Failed to retrieve delegate:", error);
    return [];
  }
};



export const getDelegate = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotStoreConfig: SnapshotStoreConfig<T, K>[] | undefined,
  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>
): Promise<SnapshotStoreConfig<T, K>[]> => {
  try {
    // Assuming useSnapshotManager is a function that returns a Promise with a snapshot manager object
    const snapshotManager = await useSnapshotManager<T, K>();

    // Check if snapshotManager and delegate exist
    if (snapshotManager && snapshotManager.delegate) {
      // Delegate should match the expected type
      return snapshotManager.delegate;
    } else {
      // Return an empty array if delegate is not available
      return [];
    }
  } catch (err: unknown) {
    // Handle errors by rejecting the promise
    if (err instanceof Error) {
      throw new Error(`Failed to get delegate: ${err.message}`);
    } else {
      throw new Error('Failed to get delegate: Unknown error');
    }
  }
};



export const determinePrefix = async () => {
  const storeId = useSecureStoreId()
  const snapshotManager = await useSnapshotManager<T, K>(storeId);
  if (!snapshotManager) {
    throw new Error("SnapshotManager is null");
  }
  const snapshotId = snapshotManager.snapshotId;
  if (typeof snapshotId === 'string') {
    const prefix = snapshotId.substring(0, 2);
    return prefix;
  } else {
    throw new Error("SnapshotId is not a string");
  }
};


export const handleSnapshotSuccess = <T extends Data<T>>(message: string, snapshot: Snapshot<T>): Promise<Snapshot<T>> => {
  return new Promise(async (resolve, reject) => {
    try {
      const initialStoreId = useSecureStoreId()
      if (!initialStoreId) {
        throw new Error("Invalid store Id")
      }
      const snapshotManager = (await useSnapshotManager(initialStoreId)).snapshotManager; // Assuming useSnapshotManager returns the correct type
      const snapshotStore = snapshotManager!.state;
      const subscribers = snapshotStoreConfig.subscriberManagement!.subscribers;
      if (snapshotStore && snapshotStore.length > 0) {
        const updatedSnapshotData = {
          id: generateSnapshotId,
          data: {
            ...snapshot.data,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          timestamp: new Date(),
          category: "update",
          length: 0,
          content: undefined,
        };

        // Check if snapshotStore[0] is defined before invoking setSnapshotData
        if (snapshotStore.length > 0 && snapshotStore[0]) {
          const firstSnapshot = snapshotStore[0];
          const updatedSnapshot = {
            ...firstSnapshot,
            data: updatedSnapshotData,
          };
          await snapshotManager!.setSnapshotData(updatedSnapshot, subscribers);
        }
      }

      resolve(snapshot);
    } catch (error) {
      reject(error);
    }
  });
};


export const updateSnapshots = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K>
) => {
  const snapshotStore = await useSnapshotManager();

  if (snapshotStore && snapshotStore.length > 0) {
    const updatedSnapshotData = {
      id: generateSnapshotId,
      data: {
        ...snapshot.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      timestamp: new Date(),
      category: "update",
      length: 0,
      content: undefined,
    };

    if (snapshotStore.length > 0 && snapshotStore[0]) {
      const firstSnapshot = snapshotStore[0];
      const updatedSnapshot = {
        ...firstSnapshot,
        data: updatedSnapshotData,
      };

      try {
        const subscribers = await getSubscribersAPI<T, K>(); // Await to get the actual data

        await snapshotStore?.setSnapshotData(updatedSnapshot, subscribers);
      } catch (error) {
        console.error("Error updating snapshots:", error);
        throw error;
      }
    }

    return Promise.resolve(updatedSnapshotData);
  }

  return Promise.resolve(undefined);
};



export const updateSnapshotSuccess = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K>,
  subscribers: Subscriber<T, K>[],
  snapshotData: SnapshotData<T, K>
) => {
  const snapshotStore = await useSnapshotStore(addToSnapshotList);
  if (!snapshotStore || !snapshotStore.state) {
    throw new Error("SnapshotManager or state is null");
  }

  if (snapshotStore.state.length > 0) {
    const updatedSnapshotData: Partial<SnapshotStoreConfig<T, T>> = {
      id: generateSnapshotId,
      data: {
        ...snapshot.data,
        createdAt: new Date(),
        updatedAt: new Date(),
        timestamp: new Date().getTime(),
      },
      timestamp: new Date().toISOString(),
      category: "update",
      length: 0,
      content: undefined,
    };

    const firstSnapshot = snapshotStore.state[0];
    const updatedSnapshot = {
      ...firstSnapshot,
      data: updatedSnapshotData,
    };

    snapshotStore.setSnapshotData(new Map([[updatedSnapshot.id, updatedSnapshot]]), subscribers, updatedSnapshotData);
    return Promise.resolve(updatedSnapshotData);
  }

  return Promise.resolve(undefined);
};


export const updateSnapshotFailure = async<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  subscribers: Subscriber<T, K>[],
  payload: { error: Payload },
) => {
  const snapshotManager = await useSnapshotManager();
  if (!snapshotManager) {
    return Promise.resolve(undefined);
  }
  const snapshotStore = snapshotManager.state;
  if (snapshotStore && snapshotStore.length > 0) {
    const updatedSnapshotData = {
      id: generateSnapshotId,
      data: {
        ...payload.error,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      timestamp: new Date(),
      category: "update",
      length: 0,
      content: undefined,
    };
    if (snapshotStore[0]) {
      const firstSnapshot = snapshotStore[0];
      const updatedSnapshot = {
        ...firstSnapshot,
        data: updatedSnapshotData,
      };
      snapshotManager.setSnapshotData(updatedSnapshot, subscribers);
    }
    return Promise.resolve(updatedSnapshotData);
  }
  return Promise.resolve(undefined);
};


export const setSnapshotManager = async (snapshotManager: SnapshotManager<T, K>) => {
  const snapshotManagerStore = (await useSnapshotManager());
  snapshotManagerStore.delegate = snapshotManager;
  return snapshotManagerStore;
}



export const createSnapshotFailure = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K>, // Assuming T is your data type
  error: any,
) => {
  const snapshotManager = useSnapshotManager()

  if (!snapshotManager?.state && !setSnapshotManager) {
    return Promise.resolve(undefined);
  }

  const state = useSnapshotManager<T, K>().state;
  useEffect(() => {
    if (state.length > 0) {
      const generatedSnapshotId = generateSnapshotId; // Example function to generate ID
      const updatedSnapshotData = {
        id: generatedSnapshotId,
        data: {
          ...snapshot.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        timestamp: new Date(),
        category: 'update',
        length: 0, // Adjust as needed
        content: undefined, // Adjust as needed
      };

      // Assuming your setSnapshotData function mutates the snapshot object in the state
      state[0].setSnapshotData(updatedSnapshotData);

      // Create a new snapshot manager state and update using setSnapshotManager
      const newState = [...state, updatedSnapshotData]; // Example of creating new state with updated data
      setSnapshotManager(newState);
    }
  }, [state, setSnapshotManager]);

  // Other logic related to handling the error or additional actions
};

export const addSnapshotSuccess = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K>
) => {
  const snapshotStore = await useSnapshotStore(addToSnapshotList, storeProps);

  if (!snapshotStore || !snapshotStore.state) {
    throw new Error("SnapshotManager or state is null");
  }

  if (snapshotStore.state.length > 0) {
    const updatedSnapshotData = {
      id: generateSnapshotId,
      data: {
        ...snapshot.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      timestamp: new Date(),
      category: "update",
      length: 0,
      content: undefined,
    };

    // Ensure firstSnapshotId is a string before passing it to getSnapshot
    const firstSnapshotId = snapshotStore.state[0]?.id;

    if (firstSnapshotId !== undefined && firstSnapshotId !== null) {
      const firstSnapshot = new Promise<Snapshot<T, K> | null>((resolve, reject) => {
        // Convert firstSnapshotId to a string if it's a number
        const idAsString = firstSnapshotId.toString();

        const snapshot = snapshotStore.getSnapshot(idAsString); // Pass idAsString to getSnapshot
        if (snapshot) {
          resolve(snapshot);
        } else {
          reject(new Error("firstSnapshot is undefined"));
        }
      });

      if (firstSnapshot) {
        if (typeof firstSnapshot.setSnapshotData === 'function') {
          firstSnapshot.setSnapshotData(updatedSnapshotData as Snapshot<T, K>);
        } else {
          console.error('setSnapshotData method is not defined on firstSnapshot');
        }

        notify(
          "success",
          "Snapshot updated successfully",
          NOTIFICATION_MESSAGES.Snapshot.UPDATING_SNAPSHOT_SUCCESS,
          new Date(),
          NotificationTypeEnum.Success
        );

        return {
          snapshot: [snapshot],
        };
      }
    }
  }

  // Add this line to close the if (snapshotStore.state.length > 0) block
  return { snapshot: [] };
};



export const updateSnapshot =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotId: string,
  snapshot: Snapshot<T, K>
) => {
  const subscribers = snapshotSubscribers.get(snapshotId);
  if (subscribers) {
    subscribers.forEach((subscriber) => {
      subscriber.callback(snapshot);
    });
  }
};


const updateSnapshot = async <T extends { data: any }, K extends CustomSnapshotData>(
  snapshotId: string,
  data: SnapshotStore<T, K>,
  events: Record<string, CalendarManagerStoreClass<T, K>[]>,
  snapshotStore: SnapshotStore<T, K>,
  dataItems: RealtimeDataItem[],
  newData: Partial<T> |  BaseData<any>,
  payload: UpdateSnapshotPayload<T>
): Promise<{ snapshot: SnapshotStore<T, K>[] }> => {
  try {
    // Update the snapshot data
    const updatedSnapshotData: T = {
      ...snapshotStore.data,
      ...(newData as Partial<T>), // Merge new data with existing snapshot data
      createdAt: new Date(),
      updatedAt: new Date(),
    } as T;

    // Update the snapshot store with the new data
    snapshotStore.data = updatedSnapshotData;

    // Handle events
    if (events[snapshotId]) {
      events[snapshotId].forEach(event => {
        // Process each event
      });
    }

    // Process data items
    dataItems.forEach(item => {
      // Process each data item
    });

    // Handle additional payload updates
    if (payload) {
      // Process the payload if needed
    }

    // Trigger callbacks for subscribers
    const subscribers = snapshotSubscribers.get(snapshotId);
    if (subscribers) {
      subscribers.forEach((subscriber: Subscriber<any, any>) => {
        // If `subscriber` is indeed a function (which matches the `Callback` type)
        if (typeof subscriber === 'function') {
          (subscriber as unknown as Callback<SnapshotStore<T, K>>)(snapshotStore);
        }
      });
    }

    return {
      snapshot: [snapshotStore],
    };
  } catch (error) {
    console.error('Error updating snapshot:', error);
    throw error;
  }
};



// Define the function to handle successful snapshot updates
export const updateSnapshotsSuccess = (): void => {
  // Implement logic to handle a successful snapshot update
  // For example, you might want to update the UI, show a notification, or log the event

  console.log("Snapshots updated successfully.");

  // If you have a notification system, you can notify the user
  useNotification().notify(
    "UpdateSnapshotsSuccessId",
    "Snapshots have been updated successfully.",
    null,
    new Date(),
    NotificationTypeEnum.Success
  );

  // If you need to perform other actions, such as updating state or triggering other processes, do that here
};

/**
 * Deletes a snapshot based on the provided snapshotId.
 * @param snapshotId The ID of the snapshot to delete.
 * @param snapshotData Optional snapshot data needed for the deletion process.
 * @param category Category information related to the snapshot.
 * @returns A promise that resolves to void when the snapshot is successfully deleted.
 */


const deleteSnapshot = async (
  snapshotId: string,
  snapshotData?: SnapshotStoreConfig<any, any>,
  category?: string
): Promise<void> => {
  try {
    // Example: Constructing the API endpoint URL
    const apiUrl = `${API_BASE_URL}/snapshots/${snapshotId}`;

    // Example: Constructing headers if needed
    const headers = {
      'Content-Type': 'application/json',
      // Add authentication headers if required
    };

    // Example: Constructing the request body if needed
    const requestBody = {
      snapshotData, // Include any data needed for deletion
      category, // Include category information if needed
    };

    // Example: Sending a DELETE request using axios
    const response = await axiosInstance.delete(apiUrl, {
      headers,
      data: requestBody, // Use `data` for DELETE requests in axios
    });

    // Example: Handle response if necessary
    console.log('Snapshot deleted successfully:', response.data);

    // Optionally return any specific data upon successful deletion
    return Promise.resolve();
  } catch (error) {
    // Example: Handle error cases
    console.error('Error deleting snapshot:', error);
    throw error; // Propagate the error further if needed
  }
};


export const getAllSnapshots = async  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotConfig: SnapshotStoreConfig<T, K>
): Promise<SnapshotStore<T, K>[]> => {
  try {
    const snapshotPromises = snapshotConfig.snapshots.map(
      async (snapshotData: SnapshotData<T, K>) => {
      // Safely cast the category from the command line argument
      const categoryArg = process.argv[3];
      // Ensure that the category is a valid key of `CategoryKeys`
      const category = categoryArg as keyof typeof allCategories;
      // get current snapshotStoreState from snapshotConfig
      const snapshotStoreState = snapshotConfig.snapshots.find(
        (value) => value.snapshotId === snapshotData.snapshotId
      );
      const initialState = snapshotStoreState?.data || null;
      // Access name, version, and schema from snapshotData
      const { name, version, schema } = snapshotData; // Ensure these are defined in SnapshotUnion<T, K>

      const options = createSnapshotStoreOptions<T, K>({
        initialState,
        snapshotId: snapshotData.snapshotId,
        category: category as unknown as Category,
        categoryProperties: snapshotData.categoryProperties,
        dataStoreMethods: {
          // Provide appropriate dataStoreMethods
        },
      });

      const categoryProperties = getCategoryProperties(category);
      const snapshotId = snapshotData.snapshotId;
      const storeId = await snapshotApi.getSnapshotStoreId(String(snapshotId))
      const config: SnapshotStoreConfig<T, K> = snapshotConfig;

      const operation: SnapshotOperation<T, K> = {
        operationType: SnapshotOperationType.FindSnapshot
      };

      const snapshotStore = new SnapshotStore<T, K>(storeId, name, version, schema, category, options, config, operation);

      return snapshotStore;
    });

    return Promise.all(snapshotPromises);
  } catch (error) {
    throw error;
  }
};


export const batchTakeSnapshot = async  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: SnapshotStore<T, K>, // Use both type arguments for SnapshotStore
  snapshots:  SnapshotsArray<T, K> // Use both type arguments for SnapshotStore
): Promise<{ snapshots:  SnapshotsArray<T, K> }> => {
  try {
    const result:  SnapshotsArray<T, K> = [...snapshots];
    return { snapshots: result };
  } catch (error) {
    throw error;
  }
};


// Handler for batch updating snapshots
const batchUpdateSnapshots = async  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  subscribers: Subscriber<T, K>[],
  snapshots: SnapshotsArray<T, K>
): Promise<{ snapshots: SnapshotsArray<T, K> }[]> => {
  try {
    return [{ snapshots: [] }];
  } catch (error) {
    throw error;
  }
};



export const batchUpdateSnapshotsSuccess =  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  subscribers: Subscriber<T, K>[],
  snapshots: SnapshotStore<T, K>[]
): { snapshots: SnapshotStore<T, K>[] }[] => {
  return [{ snapshots }];
};


// Handler for batch taking snapshots request

export const batchTakeSnapshotsRequest = async  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotData: (
    subscribers: Subscriber<T, K>[],
    snapshots: SnapshotStore<T, K>[]
  ) => Promise<SnapshotStore<T, K>[]>
): Promise<{ snapshots: SnapshotStore<T, K>[] }> => {
  const snapshots = await snapshotData([], []);
  return { snapshots };
};



export const batchUpdateSnapshotsRequest = async  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotData: (
    subscribers: Subscriber<T, K>[],
    snapshots: Snapshots<T, K>
  ) => Promise<Snapshots<T, K>>
): Promise<{ snapshots: Snapshots<T, K> }> => {
  const snapshots = await snapshotData([], []);
  return { snapshots };
};



// Define batchFetchSnapshotsRequest function
export async function batchFetchSnapshotsRequest <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  subscribers: Subscriber<T, K>[],
  snapshots: Snapshots< BaseData<any>, Meta>
): Promise<{
  subscribers: Subscriber<T, K>[];
  snapshots: Snapshots< BaseData<any>, Meta>;
}> {
  console.log("Batch snapshot fetching requested.");

  try {
    const target = {
      endpoint: "https://example.com/api/snapshots/batch",
      params: {
        limit: 100,
        sortBy: "createdAt",
      },
    };

    const response = await fetch(target.endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(target.params),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch snapshots. Status: ${response.status}`);
    }

    const fetchedSnapshots: Snapshots< BaseData<any>, Meta> = await response.json();

    console.log("Fetched snapshots:", fetchedSnapshots);
    return {
      subscribers,
      snapshots: fetchedSnapshots,
    };
  } catch (error) {
    console.error("Error fetching snapshots in batch:", error);
    throw error;
  }
}

// Handler for batch fetching snapshots success
export const batchFetchSnapshotsSuccess = <
  T extends  BaseData<any>, 
  K extends T = T>(
  subscribers: Subscriber<Snapshot<T, K>>[],
  snapshots: SnapshotStore<Snapshot<T, K>, K>[]
): SnapshotStore<Snapshot<T, K>, K>[] => {
  return [...snapshots];
}

// Handler for batch fetching snapshots failure
export const batchFetchSnapshotsFailure = <
  T extends  BaseData<any>, 
  K extends T = T>(payload: { error: Error }) => {
  // handle failure

};

// Handler for batch updating snapshots failure
export const batchUpdateSnapshotsFailure = (payload: { error: Error }) => {
  // handle failure
};

function adaptSnapshot<T extends  BaseData<any>,
  K extends T = T>(snapshot: Snapshot<T, K>): Snapshot<T, K> {
  const adaptedSnapshot: Snapshot<T, K> = {
    id: snapshot.id,
    timestamp: snapshot.timestamp,
    category: snapshot.category,
    data: snapshot.data as T,
    getSnapshotId: snapshot.getSnapshotId,
    compareSnapshotState: snapshot.compareSnapshotState,
    eventRecords: null,
    snapshotStore: null,
    getParentId: snapshot.getParentId,
    getChildIds: snapshot.getChildIds,
    addChild: snapshot.addChild,
    removeChild: snapshot.removeChild,
    getChildren: snapshot.getChildren,
    hasChildren: snapshot.hasChildren,
    isDescendantOf: snapshot.isDescendantOf,
    dataItems: () => null,
    newData: null,
    stores: snapshot.stores,
    getStore: snapshot.getStore,
    addStore: snapshot.addStore,
    mapSnapshot: snapshot.mapSnapshot,
    removeStore: snapshot.removeStore,
    unsubscribe: snapshot.unsubscribe,
    fetchSnapshot: snapshot.fetchSnapshot,
    addSnapshotFailure: snapshot.addSnapshotFailure,
    configureSnapshotStore: snapshot.configureSnapshotStore,
    updateSnapshotSuccess: snapshot.updateSnapshotSuccess,
    createSnapshotFailure: snapshot.createSnapshotFailure,
    createSnapshotSuccess: snapshot.createSnapshotSuccess,
    createSnapshots: snapshot.createSnapshots,
    onSnapshot: snapshot.onSnapshot,
    onSnapshots: snapshot.onSnapshots,
    events: undefined,
    handleSnapshot: snapshot.handleSnapshot,
    meta: undefined
  };

  return adaptedSnapshot;
}


const notifySubscribers = async <
  T extends  BaseData<any>, 
  K extends T = T>(
    snapshotId: string,
    subscribers: Subscriber<T, K>[],
    callback: (data: any) => void
): Promise<Subscriber<T, K>[]> => {
  const snapshotManager = useSnapshotManager()
  const { handleError } = useErrorHandling(); // Access handleError function from useErrorHandling

  if (!snapshotManager || !snapshotManager.onSnapshot) {
    handleError("Snapshot Manager not initialized.");
    return [];
  }

  await Promise.all(
    subscribers.map(async (subscriber) => {
      await snapshotManager.onSnapshot(
        snapshotId,
        callback,
        async (snapshot: Snapshot<T, K>) => {
          const adaptedSnapshot: Snapshot<T, K> = adaptSnapshot<T, K>(snapshot);

          // 1. Send Notifications
          dispatch(
            useSnapshotSlice.actions.sendNotification({
              snapshot: adaptedSnapshot,
              subscriber,
            })
          );

          // 2. Update UI
          await updateUI(adaptedSnapshot, subscriber); // Implement updateUI function

          // 3. Execute Subscribers' Callbacks
          await executeCallback(adaptedSnapshot, subscriber); // Implement executeCallback function

          // 4. Broadcast Changes
          await broadcastChanges(adaptedSnapshot, subscriber); // Implement broadcastChanges function

          // 5. Update Database
          await updateDatabase(adaptedSnapshot); // Implement updateDatabase function

          // 6. Trigger Actions
          await triggerActions(adaptedSnapshot); // Implement triggerActions function

          // 7. Log Changes
          logChanges(adaptedSnapshot); // Implement logChanges function

          // 8. Handle Errors
          try {
            handleError(adaptedSnapshot.toString()); // Implement handleErrors function
          } catch (error) {
            console.error("Error occurred while handling errors:", error);
          }
        }
      );
    })
  );

  return subscribers;
};

export { adaptSnapshot, batchFetchSnapshots, batchFetchSnapshotsFailure, batchFetchSnapshotsSuccess, batchUpdateSnapshots, batchUpdateSnapshotsFailure, createSnapshotStore, deleteSnapshot, fetchSnapshot, initializeSnapshotStore, notifySubscribers, updateSnapshot };

