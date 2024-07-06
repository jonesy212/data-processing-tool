// useSnapshotManager.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import { useEffect } from "react";
import { BaseData, Data } from "../models/data/Data";
import { Task } from "../models/tasks/Task";
import {
  CustomSnapshotData,
  Snapshot,
} from "../snapshots/LocalStorageSnapshotStore";
import { SnapshotStoreConfig } from "../snapshots/SnapshotConfig";
import SnapshotStore from "../snapshots/SnapshotStore";
import { useSnapshotStore } from "../snapshots/useSnapshotStore";
import { useTaskManagerStore } from "../state/stores/TaskStore ";
import useTodoManagerStore from "../state/stores/TodoStore";
import { useUndoRedoStore } from "../state/stores/UndoRedoStore";
import { userManagerStore } from "../state/stores/UserStore";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { Todo } from "../todos/Todo";
import { Subscriber } from "../users/Subscriber";
import { User } from "../users/User";
import asyncFunction from "../utils/asyncFunction";
import useAsyncHookLinker, { LibraryAsyncHook } from "./useAsyncHookLinker";

const { notify } = useNotification();
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

const useSnapshotManager = async <T extends BaseData>() => {
  // Example function using snapshotStore
  // Declare and initialize snapshotStore
  const addToSnapshotList = async (
    snapshot: SnapshotStore<any>,
    subscribers: Subscriber<BaseData>[]
    ) => {
    await snapshotStore.addSnapshot(snapshot, subscribers);
    };
  const snapshotStorePromise: Promise<SnapshotStore<any>> = useSnapshotStore(addToSnapshotList);
  const snapshotStore = await snapshotStorePromise;

  // Example custom hooks
  const todoManagerStore = useTodoManagerStore();
  const taskManagerStore = useTaskManagerStore();
  const userManagedStore = userManagerStore();
  const undoRedoStore = useUndoRedoStore();


  const snapshotId = useSnapshotStore(addToSnapshotList);
  // Example usage of delegate
  const delegate = snapshotStore.getDelegate();

  const initSnapshot = async (
    snapshotStore: SnapshotStore<T>,
    snapshotData: Snapshot<T>
  ) => {
    try {
      // Assuming fetchSnapshot is a function to fetch the initial snapshot
      const initialSnapshotData = await fetchSnapshot("initSnapshot");

      // Use the useSnapshotManager hook to create and set the initial snapshot
      const snapshotManager = useSnapshotManager<T>();
      const initSnapshot = await (await snapshotManager).initSnapshot(
        snapshotStore,
        initialSnapshotData
      );

      // Log the initial snapshot data
      console.log("Initial snapshot data:", initSnapshot);

      // Initialize the snapshot manager with the initial snapshot data
    } catch (error) {
      console.error("Error initializing snapshot:", error);
    }
  };

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
        (await snapshotStore).addSnapshotSuccess(createdSnapshot, []);
      } else {
        console.error("Failed to add snapshot:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding snapshot:", error);
    }
  };

  // Use the useAsyncHookLinker hook with the async hook
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
  }, [todoManagerStore]);

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
      (await snapshotStore).createSnapshotSuccess(snapshotData);
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
      const errorMessage = "error creating snapshot: " + (error instanceof Error ? error.message : String(error));
      const snapshot = { /* Define a default snapshot object or obtain it from the context */ };
  
      (await snapshotStore).createSnapshotFailure(snapshot, new Error(errorMessage));
  
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
      (await snapshotStore).setSnapshotSuccess(
  
        snapshotData,
        subscribers,
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
      const errorMessage = "Error setting snapshot: " + (error instanceof Error ? error.message : String(error));
      (await snapshotStore).setSnapshotFailure(new Error(errorMessage));
      
      // Using a custom error message
      notify(
        "snapshotSetFailure",
        "Snapshot set was unsuccessful",
        NOTIFICATION_MESSAGES.Generic.ERROR,
        new Date(),
        "Error" as NotificationType
      );
    }
  }
  
  const handleSnapshot: SnapshotStoreConfig<BaseData, any>["handleSnapshot"] = (
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
          const updatedState = snapshot.state.map(item => ({
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
      };
  
      // Call the async processing function but do not return its promise
      processSnapshot().catch(error => {
        console.error("Error in processSnapshot:", error);
      });
  
      // Return void
      return null;
    };
  }
  

    const takeSnapshot = async (
      snapshotData: Omit<Todo, "id">,
      subscribers: Subscriber<CustomSnapshotData | Data>[]

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
          (await snapshotStore).takeSnapshotSuccess(createdSnapshot);
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
  
  
  
  const getSnapshot = async (
    id: string,
    snapshotStore: SnapshotStore<BaseData>
  ) => {
    try {
      const response = await fetch(`/api/snapshots/${id}`);
      const snapshotData = await response.json();

      // Store the snapshot data using the provided SnapshotStore
      const snapshot = (await useSnapshotManager()).initSnapshot(
        snapshotStore,
        snapshotData
      );

      return snapshot;
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      throw error;
    }
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
        (await snapshotStore).updateSnapshotSuccess(); // Call without arguments

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
      (await snapshotStore).updateSnapshotFailure({
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
    snapshotToRemove: SnapshotStore<BaseData>
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
    (await snapshotStore).removeSnapshot(snapshotToRemove);
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

  const takeSnapshotSuccess = async (snapshot: SnapshotStore<BaseData>) => {
    (await snapshotStore).takeSnapshotSuccess(snapshot);
  };

  const takeSnapshotsSuccess = async (snapshots: Todo[]) => {
    (await snapshotStore).takeSnapshotsSuccess({ snapshots });
  };

  const getSnapshots = async (snapshots: SnapshotStore<BaseData>) => {
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
    callback: (snapshot: Snapshot<Data>) => void,
    asyncCallback: (snapshot: Snapshot<Data>) => Promise<void>

  ) => {
    (async () => {
      const store = await snapshotStore;
      store.subscribeToSnapshots(snapshotId, async (snapshot: Snapshot<Data>) => {
        callback(snapshot);
        await asyncCallback(snapshot);
      });
    })();
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
        (await snapshotStore).updateSnapshotsSuccess((subscribers, snapshots) => {
          // Handle the subscribers and snapshots as needed
          return { subscribers: [], snapshots: updated }; // Adjust accordingly
        });
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
        (await snapshotStore).updateSnapshotFailure({
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
  
  
const updateSnapshots = async (updatedSnapshots: Subscriber<BaseData>[]) => {
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
      (await snapshotStore).batchUpdateSnapshotsSuccess(updatedSnapshots, updated);
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
      snapshotStore.batchFetchSnapshotsFailure({ error: new Error(String(error)) })
    } else {
      console.error("An unknown error occurred:", error);
    }
  }
};


const fetchSnapshots = async () => {
  try {
    const response = await fetch("/api/snapshots");
    const snapshotsData = await response.json();
    snapshotStore.batchFetchSnapshotsSuccess([], snapshotsData);
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
      await snapshotStore.batchFetchSnapshotsFailure({ error });
    } else {
      // Otherwise, convert the error to a string
      console.error("Error fetching snapshots:", error);
       snapshotStore.batchFetchSnapshotsFailure({ error: new Error(String(error)) });
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
       snapshotStore.batchFetchSnapshotsSuccess([], snapshotsData);
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
        snapshotStore.batchFetchSnapshotsFailure({ error: new Error(String(error)) });
      } else {
        console.error("Error fetching snapshots:", error);
        snapshotStore.batchFetchSnapshotsFailure({ error: new Error(String(error)) });
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

  const state = (await snapshotStore).state;

  const { notify } = useNotification();
  const subscribeToSnapshot = async (
    snapshotId: string,
    callback: (snapshot: Snapshot<T>) => void,
    snapshot: Snapshot<BaseData>
  ) => {
   snapshotStore.subscribeToSnapshot(snapshotId, callback, snapshot);
  };

  // Add more methods as needed
  return {
    state,
    snapshotId,
    delegate,
    initSnapshot,
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
  // }
  // return {
  //   loading: true,
  //   error: "Snapshot manager not initialized",

  // };
};

export default useSnapshotManager;
