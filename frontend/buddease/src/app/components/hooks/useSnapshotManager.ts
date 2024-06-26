// useSnapshotManager.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import { useEffect } from "react";
import { Data } from "../models/data/Data";
import { Task } from "../models/tasks/Task";
import SnapshotStore from "../snapshots/SnapshotStore";
import { useTaskManagerStore } from "../state/stores/TaskStore ";
import useTodoManagerStore from "../state/stores/TodoStore";
import { useUndoRedoStore } from "../state/stores/UndoRedoStore";
import { userManagerStore } from "../state/stores/UserStore";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { Todo } from "../todos/Todo";
import { User } from "../users/User";
import useAsyncHookLinker, { AsyncHook, LibraryAsyncHook } from "./useAsyncHookLinker";
import { useSnapshotStore } from "../snapshots/useSnapshotStore";
import { snapshotConfig } from "../snapshots/SnapshotConfig";
import { Subscriber } from "../users/Subscriber";
import { SubscriptionPayload } from "../actions/SubscriptionActions";
import {
  CustomSnapshotData,
  Snapshot,
} from "../snapshots/LocalStorageSnapshotStore";

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
  initialStartIdleTimeout: () => {}, // Add initialStartIdleTimeout method
  resetIdleTimeout: async () => {}, // Add resetIdleTimeout method
  startAnimation: () => {}, // Add startAnimation method
  stopAnimation: () => {}, // Add stopAnimation method
  animateIn: () => {}, // Add animateIn method
  toggleActivation: () => {}, // Add toggleActivation method
  cleanup: undefined,
  progress: null,
  name: "",
  duration: undefined,
};

const useSnapshotManager = async <T extends Data>() => {
  const addToSnapshotList = async (
    snapshot: SnapshotStore<Snapshot<T>>,
    subscribers: Subscriber<CustomSnapshotData | Snapshot<T>>[]
  ) => {
    const snapshotStore = await snapshot; // Assuming snapshotStore is awaited here
    snapshotStore.addSnapshot(snapshot, subscribers);
  };
  const snapshotId = useSnapshotStore(addToSnapshotList);
  const delegate = (await snapshotStore).getDelegate()
  const snapshotStore = useSnapshotStore(addToSnapshotList);
  const todoManagerStore = useTodoManagerStore(); // Example custom hook
  const taskManagerStore = useTaskManagerStore(); // Example custom hook
  const userManagedStore = userManagerStore(); // Example custom hook
  const undoRedoStore = useUndoRedoStore(); // Example custom hook

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
      (await snapshotStore).createSnapshotFailure({
        error: "error creating snapshot: " + error,
      });
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

  const setSnapshotData = async (snapshot: Snapshot<any>) => {
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
      (await snapshotStore).setSnapshotSuccess(snapshotData);
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
      (await snapshotStore).setSnapshotSuccess.setSnapshotFailure({
        error: "error setting snapshot: " + error,
      });
      // Using a custom error message
      notify(
        "snapshotSetSuccess",
        "Snapshot set was unsuccessful",
        NOTIFICATION_MESSAGES.Generic.ERROR,
        new Date(),
        "Error" as NotificationType
      );
    }
  };

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
          (await snapshotStore).takeSnapshotSuccess(createdSnapshot, []);
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
    snapshotStore: SnapshotStore<Snapshot<Data>>
  ) => {
    try {
      const response = await fetch(`/api/snapshots/${id}`);
      const snapshotData = await response.json();

      // Store the snapshot data using the provided SnapshotStore
      const snapshot = useSnapshotManager().initSnapshot(
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
        (await snapshotStore).updateSnapshotSuccess({
          snapshot: updatedSnapshot,
        });
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
    snapshotToRemove: SnapshotStore<Snapshot<T>>
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

  const takeSnapshotSuccess = async (snapshot: Todo) => {
    (await snapshotStore).takeSnapshotSuccess({ snapshot });
  };

  const takeSnapshotsSuccess = (snapshots: Todo[]) => {
    snapshotStore.takeSnapshotsSuccess({ snapshots });
  };

  const getSnapshots = async (snapshots: SnapshotStore<Snapshot<Data>>) => {
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
  ) => {
    try {
      // Update snapshot logic
      const response = await fetch(`/api/snapshots/${updatedSnapshotId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSnapshot),
      });

      if (response.ok) {
        const updated = await response.json();
        snapshotStore.updateSnapshotsSuccess({ snapshot: updated });
        // Notify success
        notify(
          "updatedSnapshot",
          "Snapshot updated successfully",
          NOTIFICATION_MESSAGES.Generic.DEFAULT,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } else {
        console.error("Failed to update snapshot:", response.statusText);
        // Notify failure
        notify(
          "updateSnapshotFailure",
          "Failed to update snapshot",
          NOTIFICATION_MESSAGES.Generic.ERROR,
          new Date(),
          "Error" as NotificationType
        );
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
      // Notify failure
      notify(
        "updateSnapshotFailure",
        "Error updating snapshot",
        NOTIFICATION_MESSAGES.Generic.ERROR,
        new Date(),
        "Error" as NotificationType
      );
    }
  };

  const updateSnapshots = async (updatedSnapshots: Todo[]) => {
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
        (await snapshotStore).batchUpdateSnapshotsSuccess({
          snapshots: updated,
        });
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
        snapshotStore.batchUpdateSnapshotsFailure({
          error: (error as Error).message,
        });
      } else {
        console.error("An unknown error occurred:", error);
      }
    }
  };

  const fetchSnapshots = async () => {
    try {
      // Adjust the API endpoint based on your project
      const response = await fetch("/api/snapshots");
      const snapshotsData = await response.json();
      snapshotStore.batchFetchSnapshotsSuccess({ snapshots: snapshotsData });
      // Notify success
      notify(
        "fetchSnapshotsSuccess",
        "Snapshots fetched successfully",
        NOTIFICATION_MESSAGES.Generic.DEFAULT,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      if (typeof error === "object" && error !== null && "message" in error) {
        console.error("Error fetching snapshots:", error);
        snapshotStore.batchFetchSnapshotsFailure({
          error: (error as Error).message,
        });
      } else {
        console.error("Error fetching snapshots:", error);
        snapshotStore.batchFetchSnapshotsFailure({ error: String(error) });
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
      snapshotStore.batchFetchSnapshotsSuccess({ snapshots: snapshotsData });
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
        snapshotStore.batchFetchSnapshotsFailure({
          error: (error as Error).message,
        });
      } else {
        console.error("Error fetching snapshots:", error);
        snapshotStore.batchFetchSnapshotsFailure({ error: String(error) });
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
    snapshot: Snapshot<Todo>
  ) => {
    (await snapshotStore).subscribeToSnapshot(snapshotId, callback, snapshot);
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
