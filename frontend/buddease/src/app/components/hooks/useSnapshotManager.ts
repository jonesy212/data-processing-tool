// useSnapshotManager.ts
import { useEffect } from "react";
import useTodoManagerStore from "../state/stores/TodoStore";
import { Todo } from "../todos/Todo";

const useSnapshotManager = () => {
  const todoManagerStore = useTodoManagerStore();

  useEffect(() => {
    // Fetch snapshots or perform any initialization logic
    // Example: todoManagerStore.fetchSnapshotsRequest();

    const fetchSnapshots = async () => {
      try {
        // Adjust the API endpoint based on your project
        const response = await fetch("/api/snapshots");
        const snapshotsData = await response.json();
        // Example: todoManagerStore.fetchSnapshotsSuccess({ snapshots: snapshotsData.snapshots });
      } catch (error) {
        console.error("Error fetching snapshots:", error);
      }
    };

    fetchSnapshots();
  }, []);

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

  const getSnapshots = async () => {
    try {
      const response = await fetch("/api/snapshots");
      const snapshots = await response.json();
      return snapshots;
    } catch (error) {
      console.error("Error fetching snapshots:", error);
    }
  };
  // Add more methods as needed
  return { todoManagerStore, addSnapshot, getSnapshots };
};

export default useSnapshotManager;
