// useSnapshotManager.ts
import { useEffect } from "react";
import { Data } from "../models/data/Data";
import { Task } from "../models/tasks/Task";
import SnapshotStore, { Snapshot } from "../state/stores/SnapshotStore";
import { useTaskManagerStore } from "../state/stores/TaskStore ";
import useTodoManagerStore from "../state/stores/TodoStore";
import { userManagerStore } from "../state/stores/UserStore";
import { Todo } from "../todos/Todo";
import { User } from "../users/User";


const useSnapshotManager = () => {
  const todoManagerStore = useTodoManagerStore();
  const taskManagerStore = useTaskManagerStore();
  const userManagedStore = userManagerStore();
  useEffect(() => {
    // Fetch snapshots or perform any initialization logic
    todoManagerStore.batchFetchSnapshotsRequest({} as Record<string, Todo[]>);
    taskManagerStore.batchFetchSnapshotsRequest({} as Record<string, Task[]>);
    userManagedStore.batchFetchSnapshotsRequest({} as Record<string, User[]>);
    
    const fetchSnapshots = async () => {
      try {
        // Adjust the API endpoint based on your project
        const response = await fetch("/api/snapshots");
        const snapshotsData = await response.json();
        todoManagerStore.batchFetchSnapshotsRequest({ snapshots: snapshotsData });
      } catch (error) {
        console.error("Error fetching snapshots:", error);
        todoManagerStore.batchFetchSnapshotsFailure({ error: error.message });
      }
    };

    fetchSnapshots();
  }, [todoManagerStore]);

  const fetchSnapshot = async (id: string) => {
    try {
      const response = await fetch(`/api/snapshots/${id}`);
      const snapshot = await response.json();
      todoManagerStore.fetchSnapshotSuccess({ snapshot });
    } catch (error) {
      console.error("Error fetching snapshot:", error);
    }
  };

  
  const getSnapshot = async ( id: string, snapshot: SnapshotStore<Snapshot<Data>>) => { 
    try {
      const response = await fetch(`/api/snapshots/${id}`);
      const snapshot = await response.json();
      useSnapshotManager
      return snapshot;
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      throw error;
    }
  }

  const takeSnapshotSuccess = (snapshots: Todo[]) => { 
    todoManagerStore.takeSnapshotSuccess({snapshots});
  }

  const addSnapshot = async (newSnapshot: Omit<Todo, "id">) => {
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
        const createdSnapshot: Todo = await response.json();
        // Example: todoManagerStore.addSnapshotSuccess({ snapshot: createdSnapshot });
      } else {
        console.error("Failed to add snapshot:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding snapshot:", error);
    }
  };

  const takeSnapshot = async (snapshotData: Omit<Todo, "id">) => {
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
        todoManagerStore.takeSnapshotSuccess({ snapshot: createdSnapshot });
      } else {
        console.error("Failed to take snapshot:", response.statusText);
      }
    } catch (error) {
      console.error("Error taking snapshot:", error);
    }
  };

  const getSnapshots = async () => {
    try {
      const response = await fetch("/api/snapshots");
      const snapshots = await response.json();
      return snapshots;
    } catch (error) {
      console.error("Error fetching snapshots:", error);
    }
  };

  const onSnapshot = (snapshotId: string, callback: (snapshot: Todo) => void) => {
    todoManagerStore.subscribeToSnapshot(snapshotId, callback);
    };

  const initSnapshot = async () => {
    try {
      await fetchSnapshot('initialSnapshot');
    } catch (error) {
      console.error("Error initializing snapshot:", error);
    }
  };
  const updateSnapshot = async (snapshotId: string, updatedSnapshot: Omit<Todo, "id">) => {
    try {
      // Update snapshot logic
      const response = await fetch(`/api/snapshots/${snapshotId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedSnapshot)
      });
  
      if (response.ok) {
        const updated = await response.json();
        todoManagerStore.updateSnapshotSuccess({ snapshot: updated });
      } else {
        console.error("Failed to update snapshot:", response.statusText);
      }
    } catch (error) { 
      console.error("Error updating snapshot:", error);
      todoManagerStore.updateSnapshotFailure({ error: error.message });
    }
  }
  
    const fetchSnapshots = async () => {
      try {
        // Adjust the API endpoint based on your project
        const response = await fetch("/api/snapshots");
        const snapshotsData = await response.json();
        todoManagerStore.batchFetchSnapshotsSuccess({ snapshots: snapshotsData });
      } catch (error) {
        console.error("Error fetching snapshots:", error);
        todoManagerStore.batchFetchSnapshotsFailure({ error: error.message });
      }
    }
  
  const batchFetchSnapshotsFailure = (payload: { error: string }) => { 
    async () => { 
      try {
        // Adjust the API endpoint based on your project
        const response = await fetch("/api/snapshots");
        const snapshotsData = await response.json();
        todoManagerStore.batchFetchSnapshotsSuccess({ snapshots: snapshotsData });
      } catch (error) {
        console.error("Error fetching snapshots:", error);
        todoManagerStore.batchFetchSnapshotsFailure({ error: error.message });
      }
    };
  

  }

  // Add more methods as needed
  return {
    todoManagerStore,
    addSnapshot,
    getSnapshots,
    takeSnapshot,
    fetchSnapshot,
    onSnapshot,
    initSnapshot,
    updateSnapshot,
    getSnapshot,
    fetchSnapshots,
    takeSnapshotSuccess,
    batchFetchSnapshotsFailure,
    loading: todoManagerStore.loading,
    error: todoManagerStore.error,
  };
};

export default useSnapshotManager;
