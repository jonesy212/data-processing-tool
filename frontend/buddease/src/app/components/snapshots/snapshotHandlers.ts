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
import SnapshotStore from './../../components/snapshots/SnapshotStore';
import { CategoryProperties } from './../../pages/personas/ScenarioBuilder';

import { clearSnapshots, useSnapshotSlice } from '../state/redux/slices/SnapshotSlice';
import { CalendarEvent } from '../state/stores/CalendarEvent';
import {
  NotificationTypeEnum,
  useNotification
} from "../support/NotificationContext";
import NOTIFICATION_MESSAGES from '../support/NotificationMessages';
import { addToSnapshotList, generateSnapshotId } from "../utils/snapshotUtils";
import { Payload, Snapshot, Snapshots, UpdateSnapshotPayload } from './LocalStorageSnapshotStore';
import { K, SnapshotStoreConfig, T, snapshotConfig } from './SnapshotConfig';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { resolve } from "path";
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



type Subscriber<T extends BaseData, K extends BaseData> = (
  snapshot: Snapshot<T, K>,
  add: (snapshot: Snapshot<T, K>) => void,
) => void;


type Subscribers<T extends BaseData, K extends BaseData> = (
  snapshots: Snapshots<T>
) => Subscribers<T, K>

const snapshotSubscribers: Map<string, Set<Subscriber<Data, any>>> = new Map();

// Combine and update the subscribeToSnapshots function

// Combine and update the subscribeToSnapshots function
export const subscribeToSnapshots = <T extends Data, K extends Data>(
  snapshotId: string,
  callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
  snapshots: Snapshots<T>
): void => {
  // Ensure the snapshotSubscribers map has an entry for the snapshotId
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, new Set());
  }

  if (callback !== null) {
    const subscriber = callback(snapshots);
    if (subscriber !== null) {
      // Add the subscriber to the set of subscribers for the snapshotId
      const subscribersSet = snapshotSubscribers.get(snapshotId) as Set<Subscriber<T, K>>;

      if (subscribersSet) {
        subscribersSet.add(subscriber);
      }
    }
  }

  console.log(`Subscribed to snapshots with ID: ${snapshotId}`);
};




export const subscribeToSnapshot = <T extends BaseData, K extends BaseData>(
  snapshotId: string,
  callback: (snapshot: Snapshot<T, K>) => Subscriber<T, K> | null,
): void => {
  // Ensure the snapshotSubscribers map has an entry for the snapshotId
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, []);
  }
  // Add the callback to the list of subscribers for the snapshotId
  snapshotSubscribers.get(snapshotId)?.push(callback);
  console.log(`Subscribed to snapshot with ID: ${snapshotId}`);
}



// Create a function to initialize the snapshot store
const initializeSnapshotStore = async (

): Promise<SnapshotStore<BaseData, K>> => {
  // Initialize snapshotManager and snapshotStore
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
  const newSnapshot: Snapshot<Data> = {
    id: "123",
    data: newDataMap,
    timestamp: new Date(),
    category: "New Category",
    type: "",
    meta: {},
  };

  // Define methods to be exposed by the snapshot store
  const addSnapshot = (snapshot: Snapshot<Data>) => {
    // Implement addSnapshot logic here
  };

  const unsubscribe = useSubscription({
    channel: "snapshot",
    types: ["update", "remove"],
    onLiveEvent: (event: any) => {
      console.log("Received live event", event);
      // Implement logic to handle live events here
    }
  });

  // Create an instance of SnapshotStore with the implemented methods
  const snapshotStoreInstance: SnapshotStore<BaseData, any> = {
    snapshots: [], 
    taskIdToAssign: "", 
    config: [snapshotManager],
    addSnapshot: snapshotStore.addSnapshot,
    snapshotId: snapshotStore.snapshotId?.toString(),
    updateSnapshot: snapshotStore.updateSnapshot,
    removeSnapshot: snapshotStore.removeSnapshot,
    clearSnapshots: snapshotStore.clearSnapshots,
    initialState: null,
    category,
    timestamp,
    handleSnapshot: snapshotStore.handleSnapshot,
    state: [],
    subscribers: [],
    
    
  createSnapshot(
    id: string,
    snapshotData: SnapshotStoreConfig<any, T>,
    category: string
  ): Snapshot<Data> {
    if (!snapshotData) {
      throw new Error("snapshotData is null or undefined");
    }

    let data: Data;
    if ("data" in snapshotData && snapshotData.data) {
      data = snapshotData.data;
    } else if (snapshotData.data && "data" in snapshotData.data) {
      data = snapshotData.data.data;
    } else {
      throw new Error("snapshotData does not have a valid 'data' property");
    }

    id =
      typeof data.id === "string"
        ? data.id
        : String(
            UniqueIDGenerator.generateID(
              "SNAP",
              "defaultID",
              NotificationTypeEnum.GeneratedID
            )
          );

    const snapshot: Snapshot<Data> = {
      id,
      data,
      timestamp: snapshotData.timestamp || new Date(),
      category: this.category,
      topic: this.topic,
      meta: this.meta
    };

    // Add null checks
    if (this.snapshots) {
      this.snapshots.push(snapshot);
    } else {
      console.error("Snapshots array is not initialized.");
    }

    if (this.getDelegate() && this.getDelegate().length > 0) {
      this.getDelegate()[0].createSnapshotSuccess(snapshot);
    } else {
      console.error("Delegate is not initialized or is empty.");
    }

    return snapshot;
  },
 

    configureSnapshotStore: (snapshotStore: SnapshotStore<BaseData, K>) => {
      // Implement configureSnapshotStore logic here

    },
    createSnapshotSuccess: (snapshot: Snapshot<Data>) => {
      // Implement createSnapshotSuccess logic here
    },

    snapshotConfig: snapshotConfig,
    delegate: delegate,
    getDelegate: getDelegate,
    determinePrefix: determinePrefix,
    handleSnapshotSuccess: handleSnapshotSuccess,
    createSnapshotFailure: createSnapshotFailure,
    batchTakeSnapshot: batchTakeSnapshot,
    onSnapshot: onSnapshot,
    onSnapshots: onSnapshots,
    snapshotData: snapshotData,
    initSnapshot: initSnapshot,
    clearSnapshot: clearSnapshot,
    clearSnapshots: clearSnapshots,
    getSnapshots: getSnapshots,
    takeSnapshot: takeSnapshot,
    addSnapshotSuccess: addSnapshotSuccess,
    getSubscribers: getSubscribers,
    addSubscriber: addSubscriber,
    validateSnapshot: validateSnapshot,
    getSnapshot: getSnapshot,
    getAllSnapshots: getAllSnapshots,
    takeSnapshotSuccess: takeSnapshotSuccess,
    
    updateSnapshotFailure: updateSnapshotFailure,
    takeSnapshotsSuccess: takeSnapshotsSuccess,
    fetchSnapshot: fetchSnapshot,
    updateSnapshotSuccess: updateSnapshotSuccess,
    
    updateSnapshotsSuccess: updateSnapshotsSuccess,
    fetchSnapshotSuccess: fetchSnapshotSuccess,
    updateSnapshotForSubscriber: updateSnapshotForSubscriber,
    updateMainSnapshots: updateMainSnapshots,
    
    batchUpdateSnapshots: batchUpdateSnapshots,
    batchFetchSnapshotsRequest: batchFetchSnapshotsRequest,
    batchTakeSnapshotsRequest: batchTakeSnapshotsRequest,
    batchUpdateSnapshotsRequest: batchUpdateSnapshotsRequest,
    
    batchFetchSnapshots: batchFetchSnapshots,
    getData: getData,
    batchFetchSnapshotsSuccess: batchFetchSnapshotsSuccess,
    batchFetchSnapshotsFailure: batchFetchSnapshotsFailure,
    batchUpdateSnapshotsFailure: batchUpdateSnapshotsFailure,
    notifySubscribers: notifySubscribers,
    notify: notify,
    updateSnapshots: updateSnapshots,
    updateSnapshotsFailure: updateSnapshotsFailure,
    flatMap: flatMap,
    setData: setData,
    getState: getState,
    setState: setState,
    handleActions: handleActions,
    setSnapshots: setSnapshots,
    mergeSnapshots: mergeSnapshots,
    
    reduceSnapshots: reduceSnapshots,
    sortSnapshots: sortSnapshots,
    filterSnapshots: filterSnapshots,
    mapSnapshots: mapSnapshots,
    findSnapshot: findSnapshot,
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    fetchSnapshotFailure: batchFetchSnapshotsFailure,
    generateId: generateId,
    [Symbol.iterator]: () => IterableIterator<T>,
    [Symbol.asyncIterator]: () => AsyncIterableIterator<T>,
  };

  // Return the initialized snapshot store
  return snapshotStoreInstance;
};

// Assume this function exists to create a snapshot store
async function createSnapshotStore<T extends BaseData, K extends BaseData>(): Promise<SnapshotStore<T, K>> {
  // Implement the logic to create a snapshot store
  const snapshotStore: SnapshotStore<T, K> = {
    // Fill with actual implementations
    snapshots: [],
    taskIdToAssign: "",
    config: [],
    addSnapshot: async (
      snapshot: Snapshot<T, K>,
      subscribers: Subscriber<BaseData, K>[]
    ) => {
      
    },
    snapshotId: "",
    updateSnapshot: () => {},
    removeSnapshot: () => {},
    clearSnapshots: () => {},
    initialState: null,
    category: "",
    timestamp: new Date(),
    handleSnapshot: () => {},
    state: [],
    subscribers: [],
    createSnapshot: () => ({} as Snapshot<Data>),
    configureSnapshotStore: () => {},
    createSnapshotSuccess: () => {},
    snapshotConfig: [],
    delegate: [],
    getDelegate: [],
    determinePrefix: () => "",
    handleSnapshotSuccess: () => {},
    createSnapshotFailure: () => {},
    batchTakeSnapshot: () => {},
    onSnapshot: () => {},
    onSnapshots: () => {},
    snapshotData: {},
    initSnapshot: () => {},
    clearSnapshot: () => {},
    clearSnapshots: () => {},
    getSnapshots: () => [],
    takeSnapshot: () => {},
    addSnapshotSuccess: () => {},
    getSubscribers: () => [],
    addSubscriber: () => {},
    validateSnapshot: () => true,
    getSnapshot: () => ({} as Snapshot<Data>),
    getAllSnapshots: () => [],
    takeSnapshotSuccess: () => {},
    updateSnapshotFailure: () => {},
    takeSnapshotsSuccess: () => {},
    fetchSnapshot: (
      snapshotId: string,
      category: string | CategoryProperties | undefined,
      timestamp: Date,
      snapshot: Snapshot<BaseData, K>,
      data: T,
      delegate: SnapshotStoreConfig<BaseData, K>[]
    ) => {
      return Promise.resolve();
    },
    updateSnapshotSuccess: () => {},
    updateSnapshotsSuccess: () => {},
    fetchSnapshotSuccess: () => {},
    updateSnapshotForSubscriber: () => {},
    updateMainSnapshots: () => {},
    batchUpdateSnapshots: () => {},
    batchFetchSnapshotsRequest: () => {},
    batchTakeSnapshotsRequest: () => {},
    batchUpdateSnapshotsRequest: () => {},
    batchFetchSnapshots: () => {},
    getData: () => ({} as Data),
    batchFetchSnapshotsSuccess: () => {},
    batchFetchSnapshotsFailure: () => {},
    batchUpdateSnapshotsFailure: () => {},
    notifySubscribers: () => {},
    notify: () => {},
    updateSnapshots: () => {},
    updateSnapshotsFailure: () => {},
    flatMap: () => [],
    setData: () => {},
    getState: () => ({} as any),
    setState: () => {},
    handleActions: () => {},
    setSnapshots: () => {},
    mergeSnapshots: () => [],
    reduceSnapshots: () => [],
    sortSnapshots: () => [],
    filterSnapshots: () => [],
    mapSnapshots: () => [],
    findSnapshot: () => ({} as Snapshot<Data>),
    subscribe: () => {},
    unsubscribe: () => {},
    fetchSnapshotFailure: () => {},
    generateId: () => "id",
    [Symbol.iterator]: () => ({} as IterableIterator<Snapshot<T, K>>),
    [Symbol.asyncIterator]: () => ({} as AsyncIterableIterator<T>),
  };
  return snapshotStore;
}
;


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


export const delegate = async (): Promise<SnapshotStoreConfig<T, K>[]> => {
  const snapshotManager = await useSnapshotManager<BaseData, BaseData>();
  if (!snapshotManager || !snapshotManager.delegate) {
    console.error("snapshotManager or delegate is undefined");
    return [];
  }
  return snapshotManager.delegate;
};


export const getDelegate = <T extends Data, K extends Data>(): Promise<SnapshotStoreConfig<T, K>[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshotManager = await useSnapshotManager<T, K>();
      const delegate = snapshotManager?.delegate;

      if (delegate) {
        resolve(delegate);
      } else {
        resolve([]);
      }
    } catch (err) {
      reject(err);
    }
  });
};


export const determinePrefix = async () => { 
  const snapshotManager = await useSnapshotManager<T, K>();
  if (!snapshotManager) {
    throw new Error("SnapshotManager is null");
  }
  const snapshotId = snapshotManager.snapshotId;
  const prefix = snapshotId.substring(0, 2);
  return prefix;
};


export const handleSnapshotSuccess = <T extends Data>(snapshot: Snapshot<T>): Promise<Snapshot<T>> => {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshotManager = await useSnapshotManager(); // Assuming useSnapshotManager returns the correct type
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
  
        // Check if snapshotStore[0] is defined before invoking setSnapshotData
        if (snapshotStore.length > 0 && snapshotStore[0]) {
          const firstSnapshot = snapshotStore[0];
          const updatedSnapshot = {
            ...firstSnapshot,
            data: updatedSnapshotData,
          };
          await snapshotManager.setSnapshotData(updatedSnapshot);
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

  snapshotStore?.state

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
      (await useSnapshotManager()).setSnapshotData(updatedSnapshot);
    }
    return Promise.resolve(updatedSnapshotData);
  }
  return Promise.resolve(undefined);
}
export const updateSnapshotSuccess = async <T extends Data, K extends Data>(
  snapshot: Snapshot<T>,
  subscribers: Subscriber<T, K>[],
  snapshotData: Snapshot<T, K>
) => {
  const snapshotStore = await useSnapshotStore(addToSnapshotList);
  if (!snapshotStore || !snapshotStore.state) {
    throw new Error("SnapshotManager or state is null");
  }

  if (snapshotStore.state.length > 0) {
    const updatedSnapshotData: Partial<SnapshotStoreConfig<BaseData, T>> = {
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
  payload: {error: Payload},
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


export const setSnapshotManager = async (snapshotManager: SnapshotManager) => {
  const snapshotManagerStore = (await useSnapshotManager());
  snapshotManagerStore.delegate = snapshotManager;
  return snapshotManagerStore;
}


  
export const createSnapshotFailure = async <T>(
  snapshot: Snapshot<T>, // Assuming T is your data type
  error: any,
) => {
  const { state, setSnapshotManager } = (await useSnapshotManager()); // Assuming useSnapshotManager returns state and setSnapshotManager

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




export const addSnapshotSuccess = async <T>(
  snapshot: Snapshot<T>) => {
  const snapshotStore = (await useSnapshotManager()).error.state;
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
      // Assuming setSnapshotData is a method on Snapshot<T>
      if (typeof firstSnapshot.setSnapshotData === 'function') {
        firstSnapshot.setSnapshotData(updatedSnapshotData as Snapshot<T>);
      } else {
        console.error('setSnapshotData method is not defined on snapshotStore[0]');
      }
    } else {
      console.error('snapshotStore is empty or undefined');
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
  return { snapshot: [] };
};


export const updateSnapshot = async <T extends { data: any }>(
  snapshotId: string,
  data: SnapshotStore<T, K>,
  events: Record<string, CalendarEvent[]>,
  snapshotStore: SnapshotStore<T, K>,
  dataItems: RealtimeDataItem[],
  newData: T | Data,
  payload: UpdateSnapshotPayload<T>
): Promise<{ snapshot: SnapshotStore<T, K>[] }> => {
  try {
    // Perform necessary operations with the provided arguments
    // For example, update the snapshot data and handle events, data items, etc.

    // Simulate updating the snapshot data
    const updatedSnapshotData: T = {
      ...snapshotStore.data,
      ...newData,  // Merge new data with existing snapshot data
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update the snapshot store with the new data
    snapshotStore.data = updatedSnapshotData;

    // Handle events, data items, and payload if necessary
    // For example:
    // - Update events based on the snapshotId
    // - Process dataItems
    // - Use payload for additional updates

    // Placeholder for event handling
    if (events[snapshotId]) {
      events[snapshotId].forEach(event => {
        // Handle each event
      });
    }

    // Placeholder for processing data items
    dataItems.forEach(item => {
      // Process each data item
    });

    // Placeholder for additional payload handling
    if (payload) {
      // Handle payload updates
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
  snapshotConfig: SnapshotStoreConfig<T, K>
): Promise<SnapshotStore<T, K>[]> => {
  const category = process.argv[3] as keyof CategoryProperties;

  const options = await useSnapshotManager<T, K>()

  try {
    return Promise.resolve(
      snapshotConfig.snapshots.map((snapshotData: Snapshot<T, K>) => {
        const snapshotStore = new SnapshotStore<T, K>(options);
        return snapshotStore;
      })
    );
  } catch (error) {
    throw error;
  }
};



export const batchTakeSnapshot = async <T extends BaseData, K extends BaseData>(
  snapshot: SnapshotStore<T, K>, // Use both type arguments for SnapshotStore
  snapshots: SnapshotStore<T, K>[] // Use both type arguments for SnapshotStore
): Promise<{ snapshots: SnapshotStore<T, K>[] }> => {
  try {
    const result: SnapshotStore<T, K>[] = [...snapshots];
    return { snapshots: result };
  } catch (error) {
    throw error;
  }
};
// Handler for batch updating snapshots
export const batchUpdateSnapshots = async <T extends BaseData, K extends BaseData>(
  subscribers: Subscriber<T>[],
  snapshots: SnapshotStore<T, K>[] // Use generic type T for Snapshot and any for data
): Promise<{ snapshot: SnapshotStore<T, K>[] }[]> => {
  try {
    return [{ snapshot: [] }];
  } catch (error) {
    throw error;
  }
};



export const batchUpdateSnapshotsSuccess = <T extends BaseData, K extends BaseData>(
  subscribers: Subscriber<Snapshot<T>>[],
  snapshots: SnapshotStore<T, K>[]
): { snapshots: SnapshotStore<T, K>[] }[] => {
  return [{ snapshots }];
};


// Handler for batch taking snapshots request

export const batchTakeSnapshotsRequest = async <T extends BaseData, K extends BaseData>(
  snapshotData: (
    subscribers: Subscriber<Snapshot<T>>[],
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

    const fetchedSnapshots:  Snapshots<Data> = await response.json();

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
  subscribers: Subscriber<Snapshot<T>>[],
  snapshots: SnapshotStore<Snapshot<T>, K>[]
): SnapshotStore<Snapshot<T>, K>[] => {
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
        async (snapshot: Snapshot<Data>) => {
          const adaptedSnapshot: Snapshot<Data> = adaptSnapshot<Data>(snapshot);

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

export {createSnapshotStore}