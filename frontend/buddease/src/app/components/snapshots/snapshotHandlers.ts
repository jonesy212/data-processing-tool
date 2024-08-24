import { SnapshotsArray, SnapshotUnion } from '@/app/components/snapshots/LocalStorageSnapshotStore';
// snapshotHandlers.ts

import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { useSubscription } from '@refinedev/core';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import updateUI from '../documents/editing/updateUI';
import { BaseData, Data } from "../models/data/Data";
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import axiosInstance from '../security/csrfToken';
import { endpoints } from './../../api/ApiEndpoints';
import { SnapshotManager, useSnapshotManager } from './../../components/hooks/useSnapshotManager';
import SnapshotStore, { SubscriberCollection }  from './../../components/snapshots/SnapshotStore';
import { CategoryProperties } from './../../pages/personas/ScenarioBuilder';

import { getSubscribersAPI } from "@/app/api/subscriberApi";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { IHydrateResult } from "mobx-persist";
import * as snapshotApi from '../../api/SnapshotApi';
import { NotificationPosition } from "../models/data/StatusType";
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { clearSnapshots, useSnapshotSlice } from '../state/redux/slices/SnapshotSlice';
import CalendarManagerStoreClass, { CalendarEvent } from '../state/stores/CalendarEvent';
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification
} from "../support/NotificationContext";
import NOTIFICATION_MESSAGES from '../support/NotificationMessages';
import { createSnapshotStoreOptions } from "../typings/YourSpecificSnapshotType";
import { Subscriber } from "../users/Subscriber";
import { addToSnapshotList, generateSnapshotId } from "../utils/snapshotUtils";
import { Payload, Snapshot, Snapshots, UpdateSnapshotPayload } from './LocalStorageSnapshotStore';
import { SnapshotConfig } from "./snapshot";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import { ConfigureSnapshotStorePayload } from './SnapshotConfig';
import { SnapshotItem } from "./SnapshotList";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { useSnapshotStore } from "./useSnapshotStore";
import { Category } from '../libraries/categories/generateCategoryProperties';
import FetchSnapshotPayload from './FetchSnapshotPayload';
import SnapshotManagerOptions from './SnapshotManagerOptions';

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



// type Subscriber<T extends BaseData, K extends BaseData> = (
//   snapshot: Snapshot<T, K>,
//   add: (snapshot: Snapshot<T, K>) => void,
// ) => void;


// type Subscribers<T extends BaseData, K extends BaseData> = (
//   snapshots: Snapshots<T>
// ) => Subscribers<T, K>

const snapshotSubscribers: Map<string, Set<Subscriber<T, K>>> = new Map();



export const subscribeToSnapshots = <T extends Data, K extends Data>(
  snapshotId: string,
  callback: (snapshots: SnapshotsArray<T>) => Subscriber<T, K> | null,
  snapshots: SnapshotsArray<T>
): SnapshotsArray<T> => {
  // Ensure the snapshotSubscribers map has an entry for the snapshotId
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, new Set());
  }

  if (callback !== null) {
    const subscriber = callback(snapshots);
    if (subscriber !== null) {
      // Add the subscriber to the set of subscribers for the snapshotId
      const subscribersSet = snapshotSubscribers.get(snapshotId) as Set<Subscriber<T, K>>;
      subscribersSet.add(subscriber);
    }
  }

  console.log(`Subscribed to snapshots with ID: ${snapshotId}`);
  return snapshots;
};




export const subscribeToSnapshot = <T extends BaseData, K extends BaseData>(
  snapshotId: string,
  callback: (snapshot: Snapshot<T, K>) => Subscriber<T, K> | null,
  snapshot: Snapshot<T, K>,
): Subscriber<T, K> | null => {
  // Ensure the snapshotSubscribers map has an entry for the snapshotId with a Set
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, new Set<Subscriber<T, K>>());
  }

  // Call the callback with the snapshot and get the subscriber
  const subscriber = callback(snapshot);

  if (subscriber !== null) {
    // Add the subscriber to the Set of subscribers for the snapshotId
    const subscribersSet = snapshotSubscribers.get(snapshotId);
    subscribersSet?.add(subscriber);
    console.log(`Subscribed to snapshot with ID: ${snapshotId}`);
  }

  return subscriber; // Return the subscriber or null
};



// Create a function to initialize the snapshot store
const initializeSnapshotStore = async (

): Promise<SnapshotStore<BaseData, K>> => {
  // Initialize snapshotManager and snapshotStore
  const storeId = 
  const snapshotManager = await useSnapshotManager<BaseData, BaseData>();
  const snapshotStore = await createSnapshotStore<BaseData, BaseData>();

  // Ensure snapshotStore and snapshotManager are not null before using them
  if (!snapshotStore || !snapshotManager) {
    throw new Error("SnapshotStore or SnapshotManager is not initialized");
  }

  const category = "New Category";
  const timestamp = new Date();

  // Example newData object
  const newData: Data = {
    id: "new-id",
    name: "New Name",
    value: "New Value",
    timestamp: new Date(),
    category: "New Category",
  };

  // Convert newData to a Map<string, Data>
  const newDataMap = new Map<string, Data>();
  newDataMap.set(newData.id!.toString(), newData);

  // Example usage:
  const newSnapshot: Snapshot<Data, K> = {
    id: "123",
    data: newDataMap,
    timestamp: new Date(),
    category: "New Category",
    type: "",
    meta: new Map<string, Snapshot<Data, any>>(),
    snapshotStoreConfig: {} as SnapshotStoreConfig<Snapshot<any, BaseData> | SnapshotWithCriteria<any, BaseData>, any>,
    getSnapshotItems: function(): (SnapshotStoreConfig<Snapshot<any, BaseData> | SnapshotWithCriteria<any, BaseData>, any> | SnapshotItem<Data, any>)[] {
      const items: (SnapshotStoreConfig<Snapshot<any, BaseData> | SnapshotWithCriteria<any, BaseData>, any> | SnapshotItem<Data, any>)[] = [];
  
      // Add the snapshot store configuration to the array if it exists
      this.snapshotStoreConfig && items.push(this.snapshotStoreConfig);
  
      // Iterate over the snapshot data and add each item to the array
      this.data?.forEach((item: any, key: any) => {
        const snapshotItem: SnapshotItem<Data, any> = {
          id: key,
          value: item,
          timestamp: this.timestamp ?? new Date(),
          category: this.category ?? 'defaultSnapshot',
          message: this.message,
          user: this.user,

          label: this.label ? this.label.toString() : '',
          updatedAt: new Date(),
          store: this.store ? this.store : undefined,
          data: this.data,
          metadata: this.metadata
        };
        items.push(snapshotItem);
      });
  
      return items;
    },
    
    // ... rest of the code remains unchanged
  };
  return snapshotStore;
};

async function createSnapshotStore<T extends BaseData, K extends BaseData>(
  id: string,
  snapshotStoreData: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[],
  category: Category,
  categoryProperties: CategoryProperties,
  dataStoreMethods: DataStoreMethods<T, K>,
): Promise<SnapshotStore<T, K>> {
  
  // Logic to set up the storeId, options, and operation
  const storeId = await snapshotApi.getSnapshotStoreId(Number(id));
  
  const options = await useSnapshotManager(storeId) 
    ? new SnapshotManagerOptions().get() 
    : {};

  const config: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[] = snapshotStoreData;

  const operation: SnapshotOperation = {
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
    ): Promise<{ snapshot: SnapshotStore<T, K>; }> {
      return new Promise<{ snapshot: SnapshotStore<T, K>; }>(async (resolve, reject) => {
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
    category: category.toString(),
    timestamp: new Date(),


    
    handleSnapshot: (id: string,
      snapshotId: string,
      snapshot: T | null,
      snapshotData: T,
      category: Category | undefined,
      categoryProperties: CategoryProperties,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<T>,
      type: string,
      event: Event,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<
        SnapshotWithCriteria<any, BaseData>,
        K
      >
    ): Promise<Snapshot<T, K> | null> => {
      const result = this.handleDelegate(
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
    createSnapshot: () => ({} as Snapshot<Data>),
    configureSnapshotStore: () => { },
    createSnapshotSuccess: () => { },
    snapshotConfig: config,
    delegate: [],
    getDelegate: [],
    determinePrefix: () => "",
    handleSnapshotSuccess: () => { },
    createSnapshotFailure: () => { },
    batchTakeSnapshot: () => { },
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
      snapshots: Snapshots<T>
    ): Promise<{
      subscribers: Subscriber<T, K>[],
      snapshots: Snapshots<T>;
    }> => {
      return new Promise<{
        subscribers: Subscriber<T, K>[],
        snapshots: Snapshots<T>;
      }>(async (resolve, reject) => {
        resolve({
          subscribers: subscribers,
          snapshots: snapshots
        });
      });
    },
    addSubscriber: () => { },
    validateSnapshot: () => true,
    getSnapshot: () => Promise.resolve({} as Snapshot<T, K>),
    getAllSnapshots: () => [],
    takeSnapshotSuccess: () => { },
    updateSnapshotFailure: () => { },
    takeSnapshotsSuccess: () => { },
    fetchSnapshot(
      callback: (
        snapshotId: string,
        payload: FetchSnapshotPayload<K>,
        snapshotStore: SnapshotStore<T, K>,
        payloadData: T | Data,
        category: Category | undefined,
        categoryProperties: CategoryProperties,
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
          categoryProperties: categoryProperties,
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
      data: Partial<SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, any>>
    ): Subscriber<T, K>[] => {
      return subscribers;
    },
    notify: () => { },
    updateSnapshots: () => { },
    updateSnapshotsFailure: () => { },
    flatMap<U extends Iterable<any>>(
      callback: (
        value: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>, 
        index: number, array: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[]
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
    fetchSnapshotFailure: () => { },
    generateId: () => "",
    [Symbol.iterator]: () => ({} as IterableIterator<Snapshot<T, K>>),
    [Symbol.asyncIterator]: () => ({} as AsyncIterableIterator<T>),
  };

  return snapshotStore;
}


export const createSnapshotSuccess = async <T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
) => {
  const snapshotManager = await useSnapshotManager();
  const snapshotStore = snapshotManager?.state;
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

  }
}

export const onSnapshot = async <T extends BaseData, K extends BaseData>(
  snapshotId: string,
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


export const onSnapshots = async <T extends BaseData, K extends BaseData>(
  snapshotId: string,
  snapshots: Snapshots<T>,
  type: string,
  event: Event,
  callback: (snapshots: Snapshots<T>) => void
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


export const delegate = async <T extends Data, K extends Data>(): Promise<SnapshotStoreConfig<SnapshotUnion<T>, K>[]> => {
  try {
    const snapshotManager = await useSnapshotManager<T, K>();

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



export const getDelegate = async <T extends Data, K extends Data>(
  snapshotStoreConfig: SnapshotStoreConfig<SnapshotUnion<T>, K>[] | undefined,
  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>
): Promise<SnapshotStoreConfig<SnapshotUnion<T>, K>[]> => {
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
  const snapshotManager = await useSnapshotManager<T, K>();
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


export const handleSnapshotSuccess = <T extends Data>(snapshot: Snapshot<T>): Promise<Snapshot<T>> => {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshotManager = await useSnapshotManager(); // Assuming useSnapshotManager returns the correct type
      const snapshotStore = snapshotManager?.state;
      const subscribers = snapshotStoreConfig.subscribers;
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
          await snapshotManager.setSnapshotData(updatedSnapshot, subscribers);
        }
      }

      resolve(snapshot);
    } catch (error) {
      reject(error);
    }
  });
};


export const updateSnapshots = async <T extends Data, K extends Data>(
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



export const updateSnapshotSuccess = async <T extends Data, K extends Data>(
  snapshot: Snapshot<T, K>,
  subscribers: Subscriber<T, K>[],
  snapshotData: Snapshot<T, K>
) => {
  const snapshotStore = await useSnapshotStore(addToSnapshotList);
  if (!snapshotStore || !snapshotStore.state) {
    throw new Error("SnapshotManager or state is null");
  }

  if (snapshotStore.state.length > 0) {
    const updatedSnapshotData: Partial<SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, T>> = {
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


export const updateSnapshotFailure = async<T extends Data, K extends Data>(
  subscribers: Subscriber<T, K>,
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



export const createSnapshotFailure = async <T extends Data, K extends Data>(
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

export const addSnapshotSuccess = async <T extends Data, K extends Data>(
  snapshot: Snapshot<T, K>
) => {
  const snapshotStore = await useSnapshotStore(addToSnapshotList);

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


const updateSnapshot = async <T extends { data: any }, K extends CustomSnapshotData>(
  snapshotId: string,
  data: SnapshotStore<T, K>,
  events: Record<string, CalendarEvent<T, K>[]>,
  snapshotStore: SnapshotStore<T, K>,
  dataItems: RealtimeDataItem[],
  newData: Partial<T> | Data,
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
          (subscriber as unknown as Callback<Snapshot<any, any>>)(snapshotStore);
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
export const deleteSnapshot = async (
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




export const getAllSnapshots = async <T extends BaseData, K extends BaseData>(
  snapshotConfig: SnapshotStoreConfig<SnapshotUnion<T>, K>
): Promise<SnapshotStore<T, K>[]> => {
  const category = process.argv[3] as keyof CategoryProperties;

  try {
    const snapshotPromises = snapshotConfig.snapshots.map(async (snapshotData: Snapshot<SnapshotUnion<T, any>, K>) => {
      // get current snapshotStoreState from snapshotConfig
      const snapshotStoreState = snapshotConfig.snapshots.find(
        (snapshot: Snapshot<SnapshotUnion<T, any>, K>) => snapshot.snapshotId === snapshotData.snapshotId
      );
      const initialState = snapshotStoreState?.data || null;
      const options = createSnapshotStoreOptions<T, K>({
        initialState,
        snapshotId: snapshotData.snapshotId, // Use snapshotData.snapshotId
        category: category as unknown as CategoryProperties,
        dataStoreMethods: {
          // Provide appropriate dataStoreMethods
        }
      });

      const snapshotId = snapshotData.snapshotId; // Use snapshotData instead of snapshot
      const storeId = await snapshotApi.getSnapshotStoreId(Number(snapshotId))
      const config: SnapshotStoreConfig<SnapshotUnion<T>, K> = snapshotConfig; // Use snapshotConfig instead of snapshotStoreConfig

      const operation: SnapshotOperation = {
        // Provide the required operation details
        operationType: SnapshotOperationType.FindSnapshot
      };

      const snapshotStore = new SnapshotStore<T, K>(storeId, category, options, config, operation);

      return snapshotStore;
    });

    return Promise.all(snapshotPromises);
  } catch (error) {
    throw error;
  }
};



export const batchTakeSnapshot = async <T extends BaseData, K extends BaseData>(
  snapshot: SnapshotStore<T, K>, // Use both type arguments for SnapshotStore
  snapshots:  SnapshotsArray<T> // Use both type arguments for SnapshotStore
): Promise<{ snapshots:  SnapshotsArray<T> }> => {
  try {
    const result:  SnapshotsArray<T> = [...snapshots];
    return { snapshots: result };
  } catch (error) {
    throw error;
  }
};


// Handler for batch updating snapshots
const batchUpdateSnapshots = async <T extends BaseData, K extends BaseData>(
  subscribers: Subscriber<T, K>[],
  snapshots: SnapshotsArray<T>
): Promise<{ snapshots: SnapshotsArray<T> }[]> => {
  try {
    return [{ snapshots: [] }];
  } catch (error) {
    throw error;
  }
};



export const batchUpdateSnapshotsSuccess = <T extends BaseData, K extends BaseData>(
  subscribers: Subscriber<T, K>[],
  snapshots: SnapshotStore<T, K>[]
): { snapshots: SnapshotStore<T, K>[] }[] => {
  return [{ snapshots }];
};


// Handler for batch taking snapshots request

export const batchTakeSnapshotsRequest = async <T extends BaseData, K extends BaseData>(
  snapshotData: (
    subscribers: Subscriber<T, K>[],
    snapshots: SnapshotStore<T, K>[]
  ) => Promise<SnapshotStore<T, K>[]>
): Promise<{ snapshots: SnapshotStore<T, K>[] }> => {
  const snapshots = await snapshotData([], []);
  return { snapshots };
};



export const batchUpdateSnapshotsRequest = async <T extends BaseData, K extends BaseData>(
  snapshotData: (
    subscribers: Subscriber<T, K>[],
    snapshots: Snapshots<T>
  ) => Promise<Snapshots<T>>
): Promise<{ snapshots: Snapshots<T> }> => {
  const snapshots = await snapshotData([], []);
  return { snapshots };
};



// Define batchFetchSnapshotsRequest function
export async function batchFetchSnapshotsRequest(
  subscribers: Subscriber<T, K>[],
  snapshots: Snapshots<Data>
): Promise<{
  subscribers: Subscriber<T, K>[];
  snapshots: Snapshots<Data>;
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

    const fetchedSnapshots: Snapshots<Data> = await response.json();

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
export const batchFetchSnapshotsSuccess = (
  subscribers: Subscriber<Snapshot<T, K>>[],
  snapshots: SnapshotStore<Snapshot<T, K>, K>[]
): SnapshotStore<Snapshot<T, K>, K>[] => {
  return [...snapshots];
}


// Handler for batch fetching snapshots failure
export const batchFetchSnapshotsFailure = (payload: { error: Error }) => {
  // handle failure
};

// Handler for batch updating snapshots failure
export const batchUpdateSnapshotsFailure = (payload: { error: Error }) => {
  // handle failure
};

function adaptSnapshot<T extends Data, K extends Data>(snapshot: Snapshot<Data, K>): Snapshot<T, K> {
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
    dataItems: null,
    newData: undefined,
    stores: null,
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


export const notifySubscribers = async <T extends Data>(
  snapshotId: string,
  subscribers: Subscriber<T, K>[],
  callback: (data: any) => void
): Promise<Subscriber<T, K>[]> => {
  const snapshotManager = useSnapshotManager
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
        async (snapshot: Snapshot<Data, K>) => {
          const adaptedSnapshot: Snapshot<Data, K> = adaptSnapshot<Data, K>(snapshot);

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

export { createSnapshotStore, initializeSnapshotStore, updateSnapshot, fetchSnapshot, deleteSnapshot, batchFetchSnapshots, batchUpdateSnapshots, batchFetchSnapshotsSuccess, batchFetchSnapshotsFailure, batchUpdateSnapshotsFailure, notifySubscribers, adaptSnapshot };
