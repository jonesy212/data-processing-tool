// useSnapshotManager.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { useEffect, useState } from "react";
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import { Task } from "../models/tasks/Task";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import {
  CustomSnapshotData,
  Snapshot,
  Snapshots,
  createSnapshotOptions
} from "../snapshots/LocalStorageSnapshotStore";
import { SnapshotStoreConfig } from "../snapshots/SnapshotConfig";
import SnapshotStore from "../snapshots/SnapshotStore";
import { Callback, subscribeToSnapshotImpl, subscribeToSnapshotsImpl } from "../snapshots/subscribeToSnapshotsImplementation";
import { useSnapshotStore } from "../snapshots/useSnapshotStore";
import { useTaskManagerStore } from "../state/stores/TaskStore ";
import useTodoManagerStore from "../state/stores/TodoStore";
import { useUndoRedoStore } from "../state/stores/UndoRedoStore";
import { userManagerStore } from "../state/stores/UserStore";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { Todo } from "../todos/Todo";
import { convertSnapshot } from "../typings/YourSpecificSnapshotType";
import { Subscriber } from "../users/Subscriber";
import { User } from "../users/User";
import asyncFunction from "../utils/asyncFunction";
import useAsyncHookLinker, { LibraryAsyncHook } from "./useAsyncHookLinker";

const { notify } = useNotification();

interface SnapshotStoreOptions<T extends BaseData, K extends BaseData> {
  data: Partial<SnapshotStore<T, K>>;
  initialState?: SnapshotStore<T, K> | Snapshot<T, K> | null;
  category: string | CategoryProperties;
  date: string | Date;
  type: string | null;
  snapshotId: string | number;
  snapshotConfig: SnapshotStoreConfig<T, K>[];
  subscribeToSnapshots?: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => Subscriber<T, T> | null,
    snapshot: Snapshot<T, K>
  ) => void;
  subscribeToSnapshot?: (
    snapshotId: string,
    callback: Callback<Snapshot<T, T>>,
    snapshot: Snapshot<T, K>
  ) => void;
  unsubscribeToSnapshots?: (
    snapshotId: string,
    callback: (snapshot: Snapshots<T>) => void
  ) => void;
  unsubscribeToSnapshot?: (
    snapshotId: string,
    callback: (snapshot: Snapshot<T, K>) => void
  ) => void;
  delegate: SnapshotStoreConfig<T, K>[];
  dataStoreMethods: DataStore<T, K>;
  configOption?: SnapshotStoreConfig<T, K> | null;
}


interface SnapshotManager<T extends BaseData, K extends BaseData> {
  initSnapshot: (
    snapshotConfig: SnapshotStoreConfig<T, K>,
    snapshotData: SnapshotStore<T, K>
  ) => Promise<void>;
  state: SnapshotStore<T, K>[];
  
}

// Define the async hook configuration
const asyncHook: LibraryAsyncHook = {
  enable: () => {},
  disable: () => {},
  condition: () => Promise.resolve(true),
  asyncEffect: async () => {
    // Implementation logic for async effect
    console.log("Async effect ran!");

    // Return a cleanup function
    return () => {
      console.log("Async effect cleaned up!");
    };
  },
  idleTimeoutId: null, // Initialize idleTimeoutId
  startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
    // Implementation logic for starting idle timeout
    const timeoutId = setTimeout(onTimeout, timeoutDuration);
    if (timeoutId !== null) {
      asyncHook.idleTimeoutId = timeoutId;
    }
  },
  isActive: false,
};

const options = <T extends BaseData, K extends BaseData = T>({
  initialState,
  snapshotId,
  category,
  dataStoreMethods,
}: {
  initialState: SnapshotStore<T, K> | Snapshot<T, K> | null;
  snapshotId: string;
  category: CategoryProperties;
  dataStoreMethods: Partial<DataStore<T, K>>;
}): SnapshotStoreOptions<T, K> => ({
  data: {} as Partial<SnapshotStore<T, K>>, // Adjust as per your actual data requirement
  initialState,
  snapshotId,
  category,
  date: new Date(),
  type: "default-type",
  snapshotConfig: [], // Adjust as needed
  subscribeToSnapshots: (
    snapshotId: string,
    callback: (snapshots: Snapshots<T>) => Subscriber<T, T> | null,
    snapshot: Snapshot<T, K>
  ) => {
    const convertedSnapshot = convertSnapshot(snapshot);
    subscribeToSnapshotsImpl(snapshotId, callback, convertedSnapshot);
  },
  subscribeToSnapshot: (
    snapshotId: string,
    callback: Callback<Snapshot<T, T>>,
    snapshot: Snapshot<T, K>
  ) => {
    const convertedSnapshot = convertSnapshot(snapshot);
    subscribeToSnapshotImpl(snapshotId, callback, convertedSnapshot);
  },
  delegate: [], // Adjust as needed
  dataStoreMethods: dataStoreMethods as DataStore<T, K>,
});


// Function to convert Snapshot<T, K> to Content
const convertSnapshotToContent = <T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
): Content => {
  const data: CustomSnapshotData | null | undefined = snapshot.data instanceof Map
    ? convertMapToCustomSnapshotData(snapshot.data)
    : snapshot.data;

  return {
    id: snapshot.id ?? "default-id",
    title: snapshot.title ?? "default-title",
    description: snapshot.description ?? "default-description",
    subscriberId: snapshot.subscriberId ?? "default-subscriber-id",
    category: snapshot.category,
    timestamp: snapshot.timestamp ?? new Date(),
    length: 0,
    data: data
  };
};

// Example conversion function from Map to CustomSnapshotData
const convertMapToCustomSnapshotData = (map: Map<string, BaseData>): CustomSnapshotData => {
  // Implement the logic to convert a Map to CustomSnapshotData
  // For example:
  const customData: CustomSnapshotData = {
    id: "map-id", // or some appropriate value
    // other required properties
  };
  return customData;
};

const createSnapshotConfig = <T extends BaseData, K extends BaseData>(
  snapshotStore: SnapshotStore<T, K>,
  snapshotContent?: Snapshot<T, K>
): SnapshotStoreConfig<T, K> => {
  const content = snapshotContent ? convertSnapshotToContent(snapshotContent) : undefined;

  return {
    snapshotStore,
    snapshotId: "initial-id",
    snapshotCategory: "initial-category",
    snapshotSubscriberId: "initial-subscriber",
    timestamp: new Date(),
    snapshotContent: content,
    id: null,
    data: {} as T,
    initialState: null,
    handleSnapshot: (snapshot: Snapshot<T, K> | null, snapshotId: string) => {
      if (snapshot) {
        console.log(`Handling snapshot with ID: ${snapshotId}`);
      } else {
        console.log(`No snapshot to handle for ID: ${snapshotId}`);
      }
    },
    state: null,
    snapshots: [],
    subscribers: [],
    category: "default-category", // Adjust if needed
    getSnapshotId: () => "default-id", // Provide an appropriate implementation
    snapshot: async <T extends BaseData, K extends BaseData>(
      id: string,
      snapshotData: SnapshotStoreConfig<T, K>,
      category: string | CategoryProperties | undefined,
      callback: (snapshotStore: SnapshotStore<T, K>) => void
    ) => {
      // Create or obtain a SnapshotStore instance as needed
      /* obtain or create your snapshot object */
      const snapshot: Snapshot<T, K> = snapshotData.createSnapshot(
        id,
        snapshotData,
        category,
        callback
      );
      
      // Ensure that createSnapshotOptions returns the correct type
      const options: SnapshotStoreOptions<T, K> = createSnapshotOptions<T, K>(snapshot);
      
      // Ensure that SnapshotStore is correctly instantiated
      const snapshotStore = new SnapshotStore<T, K>(options);
      
      // Call the provided callback function with the snapshot store
      callback(snapshotStore);
      
      // Return the result
      return {
        snapshotStore,
      };
    }, // Adjust if needed
    createSnapshot: () => ({ 
      id: "default-id",
      data: new Map<string, T>(),
      timestamp: new Date(),
      category: "default-category",
      subscriberId: "default-subscriber-id",
      // Adjust as needed
    }) // Provide an appropriate implementation
    // Include other required properties and methods
  };
};



const useSnapshotManager = async <T extends BaseData, K extends BaseData>() => {
  // Initialize state for snapshotManager and snapshotConfig
  const [snapshotManager, setSnapshotManager] = useState<SnapshotStoreConfig<
    T,
    K
  > | null>(null);
  const [snapshotStore, setSnapshotStore] = useState<SnapshotStore<
    T,
    K
  > | null>(null);

  useEffect(() => {
    const initSnapshotManager = async () => {
      const options: SnapshotStoreOptions<T, K> = {
        data: {}, // Provide actual data if required
        initialState: null, // Provide initial state
        snapshotId: "",
        category: {
          name: "initial-category",
          description: "",
          icon: "",
          color: "",
          iconColor: "",
          isActive: false,
          isPublic: false,
          isSystem: false,
          isDefault: false,
          isHidden: false,
          isHiddenInList: false,
          UserInterface: [],
          DataVisualization: [],
          Forms: undefined,
          Analysis: [],
          Communication: [],
          TaskManagement: [],
          Crypto: [],
          brandName: "",
          brandLogo: "",
          brandColor: "",
          brandMessage: "",
        }, // Provide category as an object
        date: new Date(),
        type: "initial-type", // Example value, adjust as needed
        snapshotConfig: [], // Example value, adjust as needed
        subscribeToSnapshots: (snapshotId, callback) => {
          // Implement subscribeToSnapshots function
        },
        subscribeToSnapshot: (snapshotId, callback, snapshot) => {
          // Implement subscribeToSnapshot function
        },
        delegate: [], // Example value, adjust as needed
        dataStoreMethods: {} as DataStore<T, K>, // Provide actual data store methods
      };

      // Initialize SnapshotStore with options
      const snapshotStore = new SnapshotStore<T, K>(options);

      // Example initialization of SnapshotStoreConfig
      // Use the utility function to create snapshotConfig
      const snapshotConfig = createSnapshotConfig(snapshotStore);

      setSnapshotManager(snapshotConfig);

      setSnapshotStore(snapshotStore);
    };

    initSnapshotManager();
  }, []); // Empty dependency array ensures useEffect runs only once

  // Ensure snapshotManager is set before proceeding
  if (!snapshotManager) {
    return null; // or handle appropriately
  }


  const initSnapshot = <T extends BaseData, K extends BaseData>(
    snapshotManager: SnapshotManager<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    snapshotData: Snapshot<T>
  ): Promise<Snapshot<T>> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Fetch initial snapshot data
        const initialSnapshotData = await fetchSnapshot("initSnapshot");
  
        // Check if snapshotManager is initialized
        if (!snapshotManager) {
          reject(new Error("Snapshot manager is not initialized"));
          return;
        }
  
        // Create a SnapshotStoreConfig instance using the utility function
        const snapshotConfig = createSnapshotConfig(snapshotStore, initialSnapshotData);
  
        // Pass the snapshotConfig to initSnapshot (which returns void)
        await snapshotManager.initSnapshot(snapshotConfig, snapshotStore);
  
        // Initialize the snapshot with the provided snapshotData
        // Note: Here we assume you have a way to convert `snapshotData` to `SnapshotStoreConfig`
        const snapshot = convertToSnapshot(
          snapshotStore,
          snapshotData
        );
  
        resolve(snapshot);
      } catch (error) {
        console.error("Error initializing snapshot:", error);
        reject(error);
      }
    });
  };


  const convertToSnapshot = <T extends BaseData, K extends BaseData>(
    snapshotStore: SnapshotStore<T, K>,
    snapshotData: Snapshot<T>
  ): Promise<Snapshot<T>> => {
    return new Promise((resolve, reject) => {
      try {
        // Implement logic to convert snapshotData to the correct format if needed
        // This may involve additional fetching or transformation
        // Placeholder implementation:
        const result: Snapshot<T> = snapshotData; // Replace with actual conversion logic
  
        // Resolve the promise with the converted snapshot
        resolve(result);
      } catch (error) {
        // Reject the promise if there is an error
        console.error("Error converting snapshot data:", error);
        reject(error);
      }
    });
  };
  
  

  const fetchSnapshot = async (id: string) => {
    try {
      const response = await fetch(`/api/snapshots/${id}`);
      const snapshotData = await response.json();
      return snapshotData;
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      throw error;
    }
  };
  // Example function to add a snapshot to the list
  const addToSnapshotList = async (
    snapshotStore: SnapshotStore<any, any>,
    subscribers: Subscriber<BaseData, K>[]
  ) => {
    await snapshotManager.snapshotStore.addSnapshot(snapshotStore, subscribers);

    // Example custom hooks
    const todoManagerStore = useTodoManagerStore();
    const taskManagerStore = useTaskManagerStore();
    const userManagedStore = userManagerStore();
    const undoRedoStore = useUndoRedoStore();

    const snapshotId = useSnapshotStore(addToSnapshotList);
    
    // Example usage of delegate
    const delegate = snapshotManager.snapshotStore.getDelegate();
    
  
    // Ensure snapshotManager is defined and call initSnapshot
    (async () => {
      const snapshotManager = await useSnapshotManager<BaseData, BaseData>();
      if (snapshotManager) {
        const initialSnapshotData: Snapshot<T> = {};
         initSnapshot(
          snapshotManager,
          snapshotStore!,
          initialSnapshotData
        );
      } else {
        console.error("Snapshot manager is not initialized");
      }
    })();

    const addSnapshot = async (newSnapshot: Omit<T, "id">) => {
      try {
        // Adjust the API endpoint and request details based on your project
        const response = await fetch("/api/snapshots", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSnapshot),
        });

        if (response.ok) {
          // Adjust the response handling based on your project
          const createdSnapshot: T = await response.json();
          snapshotManager.snapshotStore.addSnapshotSuccess(createdSnapshot, []);
        } else {
          console.error("Failed to add snapshot:", response.statusText);
        }
      } catch (error) {
        console.error("Error adding snapshot:", error);
      }
    };

    //   // Use the useAsyncHookLinker hook with the async hook
    useAsyncHookLinker({ hooks: [asyncHook] });

    useEffect(() => {
      // Fetch snapshots or perform any initialization logic
      todoManagerStore.batchFetchTodoSnapshotsRequest(
        {} as Record<string, Todo[]>
      );
      taskManagerStore.batchFetchTaskSnapshotsSuccess(
        {} as Record<string, Task[]>
      );
      userManagedStore.batchFetchUserSnapshotsRequest(
        {} as Record<string, User[]>
      );
      undoRedoStore.batchFetchUndoRedoSnapshotsRequest(
        {} as Record<string, Todo[]>
      );

      fetchSnapshots();
      createSnapshot();
    }, [todoManagerStore, taskManagerStore, userManagedStore, undoRedoStore]);

    const createSnapshot = async () => {
      try {
        // Make API call to create snapshot using the defined endpoint
        const response = await fetch(endpoints.snapshots.add.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Pass snapshot data
          }),
        });
        const snapshotData = await response.json();
        snapshotManager.snapshotStore.createSnapshotSuccess(snapshotData);
        // Notify success
        notify(
          "createSnapshotManagerSuccess",
          "Snapshot created successfully!",
          NOTIFICATION_MESSAGES.Generic.DEFAULT,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error: any) {
        // Notify failure
        const errorMessage =
          "error creating snapshot: " +
          (error instanceof Error ? error.message : String(error));
        const snapshot = {
          /* Define a default snapshot object or obtain it from the context */
        };

        snapshotManager.snapshotStore.createSnapshotFailure(
          snapshot,
          new Error(errorMessage)
        );

        // Using a custom error message
        notify(
          "snapshotCreationSuccess",
          "Snapshot creation was unsuccessful",
          NOTIFICATION_MESSAGES.Generic.ERROR,
          new Date(),
          "Error" as NotificationType
        );
      }
    };

    const setSnapshotData = async (
      snapshot: Snapshot<any>,
      subscribers: ((data: Snapshot<BaseData>) => void)[]
    ) => {
      try {
        // Make API call to set snapshot data using the defined endpoint
        const response = await fetch(endpoints.snapshots.set.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Pass snapshot data
          }),
        });
        const snapshotData = await response.json();
        snapshotManager.snapshotStore.setSnapshotSuccess(
          snapshotData,
          subscribers
        );
        // Notify success
        notify(
          "setSnapshotManagerSuccess",
          "Snapshot set successfully!",
          NOTIFICATION_MESSAGES.Generic.DEFAULT,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error: any) {
        // Notify failure
        const errorMessage =
          "Error setting snapshot: " +
          (error instanceof Error ? error.message : String(error));
        snapshotManager.snapshotStore.setSnapshotFailure(
          new Error(errorMessage)
        );

        // Using a custom error message
        notify(
          "snapshotSetFailure",
          "Snapshot set was unsuccessful",
          NOTIFICATION_MESSAGES.Generic.ERROR,
          new Date(),
          "Error" as NotificationType
        );
      }
    };

    const handleSnapshot: SnapshotStoreConfig<
      BaseData,
      any
    >["handleSnapshot"] = (
      snapshot: Snapshot<BaseData> | null,
      snapshotId: string
    ) => {
      const processSnapshot = async () => {
        if (snapshot) {
          console.log(`Handling snapshot with ID ${snapshotId}`);

          // Ensure snapshot.state is not null or undefined
          const state = snapshot.state || [];
          // Update state or perform operations based on the snapshot
          if (Array.isArray(snapshot.state)) {
            const updatedState = snapshot.state.map((item) => ({
              ...item,
              processed: true, // Example: Update each item's processed flag
            }));

            try {
              // Example: Perform async operation (asyncFunction)
              await asyncFunction();
              console.log("Async operation completed");
            } catch (error) {
              console.error("Error in async operation:", error);
              // Handle error as needed
            }
          } else {
            console.warn(`Snapshot with ID ${snapshotId} is null`);
          }
        }

        // Call the async processing function but do not return its promise
        processSnapshot().catch((error) => {
          console.error("Error in processSnapshot:", error);
        });

        // Return void
        return null;
      };
    };

    const takeSnapshot = async (
      snapshotData: Omit<Todo, "id">,
      subscribers: Subscriber<CustomSnapshotData, Data>[]
    ) => {
      try {
        // Take snapshot logic
        const response = await fetch("/api/snapshots/take", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(snapshotData),
        });

        if (response.ok) {
          const createdSnapshot = await response.json();
          snapshotManager.snapshotStore.takeSnapshotSuccess(createdSnapshot);
        } else {
          console.error("Failed to take snapshot:", response.statusText);
        }
      } catch (error) {
        console.error("Error taking snapshot:", error);
      }
    };

    const fetchSnapshotSuccess = (
      snapshot: Omit<T, "id">,
      snapshotId: string
    ) => {
      if (snapshot) {
        addSnapshot(snapshot);
      } else {
        console.warn(`Snapshot with ID ${snapshotId} not found.`);
      }
    };
    const state = snapshotManager.snapshotStore.state;

   
    const getSnapshot = <T extends BaseData, K extends BaseData>(
      id: string,
      snapshotStore: SnapshotStore<T, K>
    ): Promise<Snapshot<T>> => {
      return new Promise(async (resolve, reject) => {
        try {
          // Ensure snapshotManager is initialized before proceeding
          const snapshotManager = await useSnapshotManager<T, K>();
          if (!snapshotManager) {
            reject(new Error("Snapshot manager is not initialized"));
            return;
          }
    
          // Fetch the snapshot data from the API
          const response = await fetch(`/api/snapshots/${id}`);
          if (!response.ok) {
            reject(new Error(`Failed to fetch snapshot: ${response.statusText}`));
            return;
          }
    
          const snapshotData: Snapshot<T> = await response.json();
    
          // Create a snapshot using the initialized snapshotManager
          const snapshot = initSnapshot(
            snapshotManager,
            snapshotStore,
            snapshotData
          );
    
          resolve(snapshot);
        } catch (error) {
          console.error("Error fetching or initializing snapshot:", error);
          reject(error);
        }
      });
    };
    
    

    const setSnapshot = async (
      snapshotId: string,
      snapshotData: Snapshot<Data>
    ) => {
      try {
        const response = await fetch(`/api/snapshots/${snapshotId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(snapshotData),
        });

        // Check if the response is okay and handle accordingly
        if (response.ok) {
          // Adjust the response handling based on your project
          const updatedSnapshot: Todo[] = await response.json();
          snapshotManager.snapshotStore.updateSnapshotSuccess(); // Call without arguments

          // Notify success
          notify(
            "updateSnapshotSuccess",
            "Snapshot updated successfully",
            NOTIFICATION_MESSAGES.Generic.DEFAULT,

            new Date(),
            NotificationTypeEnum.OperationSuccess
          );
        } else {
          console.error("Failed to update snapshot:", response.statusText);
          // Notify failure
          notify(
            "updateSnapshotError",
            "Snapshot update failed",
            NOTIFICATION_MESSAGES.Generic.ERROR,
            new Date(),
            "Error" as NotificationType
          );
        }
      } catch (error) {
        console.error("Error updating snapshot:", error);
        snapshotManager.snapshotStore.updateSnapshotFailure({
          error: "Error updating snapshot: " + error,
        });
        // Notify failure
        notify(
          "snapshotUpdateError",
          "Snapshot update failed",
          NOTIFICATION_MESSAGES.Generic.ERROR,
          new Date(),
          "Error" as NotificationType
        );
      }
    };

    const setSnapshots = async (snapshots: Snapshot<Data>[]) => {
      try {
        const response = await fetch(`/api/snapshots`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(snapshots),
        });
      } catch (error) {
        console.error("Error updating snapshots:", error);
        throw error;
      }
    };

    const removeSnapshot = async (
      snapshotToRemove: Snapshot<T, K>
    ) => {
      try {
        const response = await fetch(`/api/snapshots/${snapshotToRemove.id}`, {
          method: "DELETE",
        });
        // Handle response
        if (!response.ok) {
          console.error("Failed to remove snapshot:", response.statusText);
          notify(
            "removeSnapshotError",
            "Snapshot removal failed",
            NOTIFICATION_MESSAGES.Generic.ERROR,
            new Date(),
            "Error" as NotificationType
          );
          return;
        }
      } catch (error) {
        console.error("Error removing snapshot:", error);
        throw error;
      }

      notify(
        "removeSnapshotSuccess",
        "Snapshot removed successfully",
        NOTIFICATION_MESSAGES.Generic.DEFAULT,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );

      // Remove the snapshot from the store
      snapshotManager.snapshotStore.removeSnapshot(snapshotToRemove);
    };

    const clearSnapshots = async () => {
      try {
        const response = await fetch(`/api/snapshots`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("Error clearing snapshots:", error);
        throw error;
      }
    };

    const takeSnapshotSuccess = async (snapshot: SnapshotStore<T, K>) => {
      snapshotManager.snapshotStore.takeSnapshotSuccess(snapshot);
    };

    const takeSnapshotsSuccess = async (snapshots: T[]) => {
      snapshotManager.snapshotStore.takeSnapshotsSuccess(snapshots);
    };

    const getSnapshots = async (snapshots: SnapshotStore<BaseData, K>[]) => {
      try {
        const response = await fetch("/api/snapshots");
        const snapshots = await response.json();
        return snapshots;
      } catch (error) {
        console.error("Error fetching snapshots:", error);
      }
    };

    const onSnapshot = (
      snapshotId: string,
      callback: (snapshot: Snapshot<T>) => void,
      asyncCallback: (snapshot: Snapshot<T>) => Promise<void>
    ) => {
      (async () => {
        const store = snapshotManager.snapshotStore;
        store.subscribeToSnapshots(
          snapshotId,
          async (snapshot: Snapshot<T>) => {
            callback(snapshot);
            await asyncCallback(snapshot);
          }
        );
      })();
    };

 

    const updateSnapshot = async (
      updatedSnapshotId: string,
      updatedSnapshot: Omit<Todo, "id">
    ): Promise<{ snapshot: Snapshot<Data> }> => {
      try {
        const response = await fetch(`/api/snapshots/${updatedSnapshotId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSnapshot),
        });

        if (response.ok) {
          const updated = await response.json();
          snapshotManager.snapshotStore.updateSnapshotsSuccess(
            (subscribers, snapshots) => {
              // Handle the subscribers and snapshots as needed
              return { subscribers: [], snapshots: updated }; // Adjust accordingly
            }
          );
          notify(
            "updatedSnapshot",
            "Snapshot updated successfully",
            NOTIFICATION_MESSAGES.Generic.DEFAULT,
            new Date(),
            NotificationTypeEnum.OperationSuccess
          );
          return { snapshot: updated }; // Return the updated snapshot
        } else {
          console.error("Failed to update snapshot:", response.statusText);
          notify(
            "updateSnapshotFailure",
            "Failed to update snapshot",
            NOTIFICATION_MESSAGES.Generic.ERROR,
            new Date(),
            "Error" as NotificationType
          );
          throw new Error("Failed to update snapshot");
        }
      } catch (error) {
        console.error("Error updating snapshot:", error);
        if (typeof error === "object" && error !== null && "message" in error) {
          snapshotManager.snapshotStore.updateSnapshotFailure({
            error: (error as Error).message,
          });
        } else {
          console.error("An unknown error occurred:", error);
        }
        notify(
          "updateSnapshotFailure",
          "Error updating snapshot",
          NOTIFICATION_MESSAGES.Generic.ERROR,
          new Date(),
          "Error" as NotificationType
        );
        throw error; // Propagate the error
      }
    };

    const updateSnapshots = async (
      updatedSnapshots: Subscriber<T, K>[]
    ) => {
      try {
        // Adjust the API endpoint based on your project
        const response = await fetch("/api/snapshots/batch", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSnapshots),
        });

        if (response.ok) {
          const updated = await response.json();
          snapshotManager.snapshotStore.batchUpdateSnapshotsSuccess(
            updatedSnapshots,
            updated
          );
          // Notify success
          notify(
            "updateSnapshotsSuccess",
            "Snapshots updated successfully",
            NOTIFICATION_MESSAGES.Generic.DEFAULT,
            new Date(),
            NotificationTypeEnum.OperationSuccess
          );
        } else {
          console.error("Failed to update snapshots:", response.statusText);
          // Notify failure
          notify(
            "updateSnapshoFailure",
            "Failed to update snapshots",
            NOTIFICATION_MESSAGES.Generic.ERROR,
            new Date(),
            "Error" as NotificationType
          );
        }
      } catch (error) {
        console.error("Error updating snapshots:", error);
        if (typeof error === "object" && error !== null && "message" in error) {
          snapshotManager.snapshotStore.batchFetchSnapshotsFailure({
            error: new Error(String(error)),
          });
        } else {
          console.error("An unknown error occurred:", error);
        }
      }
    };

    const fetchSnapshots = async () => {
      try {
        const response = await fetch("/api/snapshots");
        const snapshotsData = await response.json();
        snapshotManager.snapshotStore.batchFetchSnapshotsSuccess(
          [],
          snapshotsData
        );
        // Notify success
        notify(
          "fetchSnapshotsSuccess",
          "Snapshots fetched successfully",
          NOTIFICATION_MESSAGES.Generic.DEFAULT,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        if (error instanceof Error) {
          // If error is an instance of Error, pass it directly
          console.error("Error fetching snapshots:", error);
          await snapshotManager.snapshotStore.batchFetchSnapshotsFailure({
            error,
          });
        } else {
          // Otherwise, convert the error to a string
          console.error("Error fetching snapshots:", error);
          snapshotManager.snapshotStore.batchFetchSnapshotsFailure({
            error: new Error(String(error)),
          });
        }
        // Notify failure
        notify(
          "fetchSnapshotsFailure",
          "Failed to fetch snapshots",
          NOTIFICATION_MESSAGES.Generic.ERROR,
          new Date(),
          "Error" as NotificationType
        );
      }
    };

    const batchFetchSnapshotsFailure = async (payload: { error: string }) => {
      try {
        // Adjust the API endpoint based on your project
        const response = await fetch("/api/snapshots");
        const snapshotsData = await response.json();
        snapshotManager.snapshotStore.batchFetchSnapshotsSuccess(
          [],
          snapshotsData
        );
        // Notify success
        notify(
          "batchSnapshotSuccess",
          "Snapshots fetched successfully",
          NOTIFICATION_MESSAGES.Generic.DEFAULT,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        if (typeof error === "object" && error !== null && "message" in error) {
          console.error("Error fetching snapshots:", error);
          snapshotManager.snapshotStore.batchFetchSnapshotsFailure({
            error: new Error(String(error)),
          });
        } else {
          console.error("Error fetching snapshots:", error);
          snapshotManager.snapshotStore.batchFetchSnapshotsFailure({
            error: new Error(String(error)),
          });
        }
        // Notify failure
        notify(
          "batchSnapshotError",
          "Failed to fetch snapshots",
          NOTIFICATION_MESSAGES.Generic.ERROR,
          new Date(),
          "Error" as NotificationType
        );
      }
    };

    
    const { notify } = useNotification();
    const subscribeToSnapshot = async (
      snapshotId: string,
      callback: (snapshot: Snapshot<T, K>) => void,
      snapshot: Snapshot<BaseData>
    ) => {
      snapshotManager.snapshotStore.subscribeToSnapshot(
        snapshotId,
        callback,
       );
    };

    // Add more methods as needed
    return {
      state,
      snapshotId,
      delegate,
      initSnapshot,
      setSnapshotManager,
      fetchSnapshot,
      todoManagerStore,
      addSnapshot,
      getSnapshots,
      takeSnapshot,
      onSnapshot,
      getSnapshot,
      setSnapshot,
      updateSnapshot,
      updateSnapshots,
      fetchSnapshots,
      fetchSnapshotSuccess,
      takeSnapshotSuccess,
      takeSnapshotsSuccess,
      batchFetchSnapshotsFailure,
      subscribeToSnapshot,
      setSnapshots,
      removeSnapshot,
      clearSnapshots,
      addToSnapshotList,
      setSnapshotData,
      handleSnapshot,
      loading: todoManagerStore.loading,
      error: todoManagerStore.error,
    };
  }; // return {
  //   loading: true,
  //   error: "Snapshot manager not initialized",

  // };
};

export default useSnapshotManager;
export { options };
export type { SnapshotManager, SnapshotStoreOptions };

