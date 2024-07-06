import useSnapshotManager from '@/app/components/hooks/useSnapshotManager';
// snapshotHandlers.ts
import { endpoints } from '@/app/api/ApiEndpoints';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { useSubscription } from '@refinedev/core';
import { useDispatch } from 'react-redux';
import { SnapshotStoreConfig, snapshotConfig } from '../../components/snapshots/SnapshotConfig';
import updateUI from '../documents/editing/updateUI';
import useErrorHandling from '../hooks/useErrorHandling';
import { BaseData, Data } from "../models/data/Data";
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import axiosInstance from '../security/csrfToken';
import { clearSnapshots, useSnapshotSlice } from '../state/redux/slices/SnapshotSlice';
import { CalendarEvent } from '../state/stores/CalendarEvent';
import {
  NotificationTypeEnum,
  useNotification
} from "../support/NotificationContext";
import NOTIFICATION_MESSAGES from '../support/NotificationMessages';
import { generateSnapshotId } from "../utils/snapshotUtils";
import { Payload, Snapshot, UpdateSnapshotPayload } from './LocalStorageSnapshotStore';
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
const { notify } = useNotification();
const dispatch = useDispatch()

const API_BASE_URL = endpoints
// Handler for creating a snapshot
export const createSnapshot = (additionalData: any): void => {
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
};



type Subscriber<T> = (snapshot: T) => void;
export type T = any;

const snapshotSubscribers: Map<string, Subscriber<Snapshot<any>>[]> = new Map();

export const subscribeToSnapshots = (
  snapshotId: string,
  callback: (snapshot: Snapshot<any>) => void
): void => {
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, []);
  }

  snapshotSubscribers.get(snapshotId)?.push(callback);
  console.log(`Subscribed to snapshot with ID: ${snapshotId}`);
};




// Create a function to initialize the snapshot store
const initializeSnapshotStore = async (): Promise<SnapshotStore<Data>> => {
  // Initialize any required variables or state here

  const category = ""
  const timestamp = new Date()
  // Define or initialize newData (placeholder)
  
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
};


  // Define methods to be exposed by the snapshot store
  const addSnapshot = (snapshot: Snapshot<Data>) => {
    // Implement addSnapshot logic here
  };

  const unsubscribe = useSubscription({
    channel: "snapshot",
    types: ["update", "remove"],
    onLiveEvent: (event: any) => {
      return console.log("Received live event", event);
      // Implement logic to handle live events here
    }
  });
  // Create an instance of SnapshotStore with the implemented methods
  const snapshotStore: SnapshotStoreConfig<BaseData, any> = {
    snapshots: [], 
    taskIdToAssign: "", 
    config: snapshotConfig, 
    addSnapshot: (await useSnapshotManager()).addSnapshot,
    snapshotId: (await useSnapshotManager()).snapshotId.toString(),
    updateSnapshot: (await useSnapshotManager()).updateSnapshot,
    removeSnapshot: (await useSnapshotManager()).removeSnapshot,
    clearSnapshots: (await useSnapshotManager()).clearSnapshots,
    initialState: null,
    category,
    timestamp,
    handleSnapshot: (await useSnapshotManager()).handleSnapshot,
    state: [],
    subscribers: [],
    snapshots: [],
    createSnapshot: (snapshot: Snapshot<Data>) => {
      // Implement createSnapshot logic here
    },
    configureSnapshotStore: (snapshotStore: SnapshotStore<BaseData>) => {
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
    [Symbol.iterator]: ,
    [Symbol.asyncIterator]: ,
    


    // Implement other methods similarly

    };
  // delegate: useSnapshotManager().delegate

  // Return the initialized snapshot store
  return snapshotStore;
};


export const createSnapshotSuccess = async <T>(snapshot: Snapshot<T>) => {
  const snapshotStore = (await useSnapshotManager()).state;
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


export const delegate = async (): Promise<SnapshotStoreConfig<Snapshot<T>, T>[]> => {
    const snapshotManager = await useSnapshotManager();
    return snapshotManager.delegate;
};

export const getDelegate = async () => {
  const snapshotManager = (await useSnapshotManager());
  const delegate = snapshotManager.delegate;
  return delegate;
}

export const determinePrefix = async () => { 
  const snapshotManager = (await useSnapshotManager());
  const snapshotId = snapshotManager.snapshotId.toString();
  const prefix = snapshotId.substring(0, 2);
  return prefix;
}


export const handleSnapshotSuccess = <T extends Data>(snapshot: Snapshot<T>): Promise<Snapshot<T>> => {
  return new Promise(async (resolve, reject) => {
    try {
      const snapshotManager = await useSnapshotManager(); // Assuming useSnapshotManager returns the correct type
      const snapshotStore = snapshotManager.state;
      
      if (snapshotStore && snapshotStore.length > 0) {
        const updatedSnapshotData = {
          id: generateSnapshotId(),
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

export const updateSnapshots = async <T extends Data>(
  snapshot: Snapshot<T>
) => { 
  const snapshotStore = (await useSnapshotManager()).state;
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

export const updateSnapshotSuccess = async<T extends Data>(
  snapshot: Snapshot<T>
) => {
  const snapshotStore = (await useSnapshotManager()).state;
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

export const updateSnapshotFailure = async<T extends Data>(
  error: Payload
) => {
  const snapshotStore = (await useSnapshotManager()).state;
  if (snapshotStore && snapshotStore.length > 0) {
    const updatedSnapshotData = {
      id: generateSnapshotId,
      data: {
        ...error,
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
      (await useSnapshotManager()).setSnapshotData(updatedSnapshot, subscribers);
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

  
export const createSnapshotFailure = async (
  snapshot: Snapshot<T>,
  error: any,
) => {
  const snapshotStore = (await useSnapshotManager()).state;
  
  if (snapshotStore && snapshotStore.length > 0) {
    // Generate snapshot ID
    const generatedSnapshotId = generateSnapshotId; // Assuming generateSnapshotId is a function
    const updatedSnapshotData = {
      id: generatedSnapshotId,
      data: {
        ...snapshot.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      timestamp: new Date(),
      category: "update",
      length: 0, // Check if this is needed
      content: undefined, // Check if this is needed
    };

    // Check if snapshotStore[0] is defined before invoking setSnapshotData
    if (snapshotStore[0]?.setSnapshotData) {
      snapshotStore[0].setSnapshotData(updatedSnapshotData); // Assuming setSnapshotData mutates the snapshot object
    }
    
    // Assuming snapshotStore.unshift is a synchronous operation
    snapshotStore.unshift(updatedSnapshotData); // Add the updated snapshot to the beginning of the snapshot store

    // Create a new snapshot manager with the updated snapshot store
    const newState = new SnapshotManager(snapshotStore);
    // Update the snapshot store through a setter method if available
    await setSnapshotManager(newState); // Ensure this method exists and correctly updates state
  }
};




export const addSnapshotSuccess = async <T>(snapshot: Snapshot<T>) => {
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

// Call the function to initialize the snapshot store
const snapshotStore = await initializeSnapshotStore();

export const updateSnapshot = async <T extends { data: any }>(
  snapshotId: string,
  data: SnapshotStore<BaseData>,
  events: Record<string, CalendarEvent[]>,
  snapshotStore: SnapshotStore<T>,
  dataItems: RealtimeDataItem[],
  newData: T | Data,
  payload: UpdateSnapshotPayload<T>
): Promise<{ snapshot: SnapshotStore<T>[] }> => {
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
  snapshotConfig: SnapshotStoreConfig<Snapshot<T>, K>
): Promise<SnapshotStore<Snapshot<T>>[]> => {
  const category = process.argv[3] as keyof CategoryProperties;

  try {
    return Promise.resolve(
      snapshotConfig.snapshots.map((snapshotData: Snapshot<T>) => {
        const snapshotStore = new SnapshotStore<Snapshot<T>>(
          snapshot,
          category,
          new Date(),
          initSnapshot,
          null,
          subscribeToSnapshots,
          delegate,
          {
            ...snapshotData.data,
            priority: snapshotData.data?.priority?.toString(),
          }
        );
        return snapshotStore;
      })
    );
  } catch (error) {
    throw error;
  }
};
// Handler for batch taking snapshots
export const batchTakeSnapshot = async <T>(
  snapshot: SnapshotStore<Snapshot<T>>, // Use generic type T for Snapshot and any for data
  snapshots: SnapshotStore<Snapshot<T>>[] // Use generic type T for Snapshot and any for data
): Promise<{ snapshots: SnapshotStore<Snapshot<T>>[] }> => {
  try {
    const result: SnapshotStore<Snapshot<T>>[] = [...snapshots];
    return { snapshots: result };
  } catch (error) {
    throw error;
  }
};


// Handler for batch updating snapshots
export const batchUpdateSnapshots = async <T>(
  subscribers: Subscriber<Snapshot<T>>[],
  snapshots: SnapshotStore<Snapshot<T>>[] // Use generic type T for Snapshot and any for data
): Promise<{ snapshot: SnapshotStore<Snapshot<T>>[] }[]> => {
  try {
    return [{ snapshot: [] }];
  } catch (error) {
    throw error;
  }
};



export const batchUpdateSnapshotsSuccess = <T>(
  subscribers: Subscriber<Snapshot<T>>[],
  snapshots: SnapshotStore<Snapshot<T>>[]
): { snapshots: SnapshotStore<Snapshot<T>>[] }[] => {
  return [{ snapshots }];
};


// Handler for batch taking snapshots request

export const batchTakeSnapshotsRequest = async <T>(
  snapshotData: (
    subscribers: Subscriber<Snapshot<T>>[],
    snapshots: SnapshotStore<Snapshot<T>>[]
  ) => Promise<SnapshotStore<Snapshot<T>>[]>
): Promise<{ snapshots: SnapshotStore<Snapshot<T>>[] }> => {
  const snapshots = await snapshotData([], []);
  return { snapshots };
};



export const batchUpdateSnapshotsRequest = async <T>(
  snapshotData: (
    subscribers: Subscriber<Snapshot<T>>[],
    snapshots: SnapshotStore<Snapshot<T>>[]
  ) => Promise<SnapshotStore<Snapshot<T>>[]>
): Promise<{ snapshots: SnapshotStore<Snapshot<T>>[] }> => {
  const snapshots = await snapshotData([], []);
  return { snapshots };
};



// Define batchFetchSnapshotsRequest function
export async function batchFetchSnapshotsRequest(
  subscribers: Subscriber<Snapshot<Data>>[],
  snapshots: Snapshots<Data>
): Promise<{
  subscribers: Subscriber<Snapshot<Data>>[];
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

    const fetchedSnapshots: Snapshot<Data>[] = await response.json();

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
export const batchFetchSnapshotsSuccess = <T>(
  subscribers: Subscriber<Snapshot<T>>[],
  snapshots: SnapshotStore<Snapshot<T>>[]
): SnapshotStore<Snapshot<T>>[] => {
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

function adaptSnapshot<T extends Data>(snapshot: Snapshot<Data>): Snapshot<T> {
  const adaptedSnapshot: Snapshot<T> = {
    id: snapshot.id,
    timestamp: snapshot.timestamp,
    category: snapshot.category,
    data: snapshot.data as T,
  };

  return adaptedSnapshot;
}


export const notifySubscribers = async <T extends Data>(
  snapshotId: string,
  subscribers: Subscriber<T>[],
  callback: (data: any) => void
): Promise<Subscriber<T>[]> => {
  const snapshotManager = useSnapshotManager<T>();
  const { handleError } = useErrorHandling(); // Access handleError function from useErrorHandling

  await Promise.all(
    subscribers.map(async (subscriber) => {
      (await snapshotManager).onSnapshot(
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
