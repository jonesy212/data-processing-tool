// TodoManagerStore.ts
import omit from "lodash/omit";
import { makeAutoObservable } from "mobx";
import { useRef, useState } from "react";
import useSnapshotManager from "../../hooks/useSnapshotManager";
import { Data } from "../../models/data/Data";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { Todo } from "../../todos/Todo";
import { Snapshot } from "./SnapshotStore";
export interface TodoManagerStore {
  todos: Record<string, Todo>;
  toggleTodo: (id: string) => void;
  addTodo: (todo: Todo) => void;
  addTodos: (newTodos: Todo[], data: {}) => void;
  removeTodo: (id: string) => void;
  updateTodoTitle: (payload: { id: string; newTitle: string }) => void;
  fetchTodosSuccess: (payload: { todos: Todo[] }) => void;
  fetchTodosFailure: (payload: { error: string }) => void; // Add this
  fetchTodosRequest: () => void; // Add this
  completeAllTodosSuccess: () => void; // Add this
  completeAllTodos: () => void; // Add this
  completeAllTodosFailure: (payload: { error: string }) => void;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  setDynamicNotificationMessage: (message: string) => void; // Add this property
  //snapshot
  snapshot: (newSnapshot: Omit<Todo, "id">) => Promise<void>
  // snapshotStore: SnapshotStore<Record<string, Todo[]>>
  
  initSnapshot: () => void;
  takeSnapshotSuccess: (snapshot: Record<string, Todo[]>) => void;
  updateSnapshot: (snapshotId: string, updatedData: Omit<Todo, "id">) => Promise<void>;
  updateSnapshotFailure: ((snapshot: string) => void);
  
  fetchSnapshot: (snapshotId: string) => void;
  onSnapshot: (snapshot: Record<string, Todo>) => void;
  getSnapshot: (snapshot: Record<string, Todo>) => Record<string, Todo[]>;
  getSnapshots: (snapshots: Record<string, Record<string, Todo[]>>) => void;
  takeSnapshot: (data: Record<string, Todo[]>) => void;
  updateSnapshotSuccess: (snapshot: Record<string, Todo[]>) => void;
  
  batchFetchSnapshotsRequest: (snapshotData: Record<string, Todo[]>) => void
  batchFetchSnapshotsSuccess: (snapshotData: Record<string, Todo[]>) => void
  batchFetchSnapshotsFailure: (payload: { error: string }) => void;
  fetchSnapshotSuccess: (snapshot: Todo[]) => void
}

const useTodoManagerStore = (): TodoManagerStore => {
  const [todos, setTodos] = useState<Record<string, Todo>>({});
  const [NOTIFICATION_MESSAGE, setNotificationMessage] = useState<string>("");

  // Inside useTodoManagerStore function
  const snapshotStore = useSnapshotManager();

  // Initialize SnapshotStore
  const onSnapshotCallbacks: ((
    snapshotData: Record<string, Todo[]>
  ) => void)[] = [];

  const takeSnapshot = (data: Record<string, Todo[]>) => {
    const timestamp = Date.now();
    const snapshot: Record<string, Todo[]> = {
      ...data,
      [timestamp]: todos,
      snapshots: [],
    };

    onSnapshotCallbacks.forEach((callback) => callback(snapshot));
  };

  
  const toggleTodo = (id: string) => {
    setTodos((prevTodos) => {
      const todo = prevTodos[id];
      if (todo) {
        todo.done = !todo.done;
      }
      return { ...prevTodos, [id]: todo };
    });
  };

  const addTodo = (todo: Todo & { id: string | number }) => {
    setTodos((prevTodos) => ({ ...prevTodos, [todo.id]: todo }));
  };
  
  
  const addTodos = (newTodos: Todo[]) => {
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
  
      newTodos.forEach(async (todo) => {
        updatedTodos[todo.id] = todo;
  
        // Take snapshot for each todo
        if (snapshotStore) {
          // Use lodash omit to exclude 'id' property
          const todoWithoutId: Omit<Todo, 'id'> = omit(todo, 'id');
          const updatedSnapshots = {
            ...snapshotStore.getSnapshots(),
            [todo.id]: todoWithoutId,
          };
          snapshotStore.takeSnapshot(await updatedSnapshots);
        }
      });
  
      // Update state
      return updatedTodos;
    });
  };
  
  
  

  const removeTodo = (id: string) => {
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      delete updatedTodos[id];
      return updatedTodos;
    });
  };

  const updateTodoTitle = (payload: { id: string; newTitle: string }) => {
    setTodos((prevTodos) => {
      const todo = prevTodos[payload.id];
      if (todo) {
        todo.title = payload.newTitle;
      }
      return { ...prevTodos, [payload.id]: todo };
    });
  };

  const fetchTodosSuccess = (payload: { todos: Todo[] }) => {
    const { todos: newTodos } = payload;
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      newTodos.forEach((todo) => {
        updatedTodos[todo.id] = todo;
      });
      return updatedTodos;
    });
  };

  const completeAllTodosSuccess = () => {
    console.log("All Todos completed successfully!");
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  };

  const completeAllTodos = () => {
    console.log("Completing all Todos...");
    // You can add loading indicators or other UI updates here

    // Simulate asynchronous completion
    setTimeout(() => {
      // Update todos to mark all as done
      setTodos((prevTodos) => {
        const updatedTodos: Record<string, Todo> = {};
        Object.keys(prevTodos).forEach((id) => {
          updatedTodos[id] = { ...prevTodos[id], done: true };
        });
        return updatedTodos;
      });

      // Trigger success
      completeAllTodosSuccess();
    }, 1000);
  };

  

  const fetchTodosFailure = (payload: { error: string }) => {
    console.error("Fetch Todos Failure:", payload.error);
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.Error.ERROR_FETCHING_DATA
    );
  };

  const fetchTodosRequest = () => {
    console.log("Fetching Todos...");
    // You can add loading indicators or other UI updates here
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.DataLoading.PAGE_LOADING
    );
  };

  const batchFetchSnapshotsRequest = () => {
    console.log("Fetching snapshots...");
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.DataLoading.PAGE_LOADING
    );
    snapshotStore.fetchSnapshots();
  };

  const completeAllTodosFailure = (payload: { error: string }) => {
    console.error("Complete All Todos Failure:", payload.error);
    // You can add additional error handling or trigger notifications as needed
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.PROCESSING_BATCH);
  };

  // Function to set a dynamic notification message
  const setDynamicNotificationMessage = (message: string) => {
    setNotificationMessage(message);
  };

 
  const loading = useRef(false)
  
  const getSnapshots = async (): Promise<Record<string, Todo[]>[]> => {
    // Assuming snapshotStore.getSnapshots() returns a Promise
    const snapshots = await snapshotStore.getSnapshots();
    
    // Perform any transformation or processing needed to convert Snapshot<Todo> to Record<string, Todo[]>
    const transformedSnapshots: Record<string, Todo[]>[] = snapshots.map((snapshot: Snapshot<Data>): Record<string, Todo[]> => {
      // Example: Dummy conversion, replace this with your actual logic
      const data = snapshot.data as Todo;
      const todos: Todo[] = data.todos || [];
      return { [snapshot.timestamp.toString()]: todos };
    });
  
    return transformedSnapshots;
  };


  const getSnapshot = async (snapshotId: string): Promise<Snapshot<Todo>> => { 
    try {
      loading.current = true;
      const snapshot = await snapshotStore.getSnapshot(snapshotId);
      return snapshot;
    } catch (error) {
      throw error;
    } finally {
      loading.current = false;
    }
  }

  
  
  const updateSnapshot = async (snapshotId: string, updatedData: Omit<Todo, "id">) => {
    try {
      loading.current = true;
      await snapshotStore.updateSnapshot(snapshotId, updatedData);
      fetchSnapshotSuccess();
      setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : 'An error occurred during the update.';
      batchFetchSnapshotsFailure({ error: errorMessage });
    } finally {
      loading.current = false;
    }
  }

  const updateSnapshotFailure = (error: string) => { 
    console.error("Update snapshot failure:", error);
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.Snapshot.UPDATING_SNAPSHOT
    );
  }


  const updateSnapshotSuccess = () => { 
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
    batchFetchSnapshotsRequest();
  
  }

  
// Update the usage accordingly
const batchFetchSnapshotsFailure = ({ error }: { error: string }) => { 
  console.error("Batch fetch snapshots failure:", error);
  setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Snapshot.FETCHING_SNAPSHOTS);
  batchFetchSnapshotsFailure({ error }); // Pass the error as an object
}


  const onSnapshot = (snapshot: Record<string, Todo>) => { 
  fetchSnapshotSuccess();
}

  const fetchSnapshotSuccess = () => {
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
    snapshotStore.onSnapshot(
      "fetchSnapshotSuccess",
      (snapshot: Todo) =>
        void {
          setDynamicNotificationMessage(
            NOTIFICATION_MESSAGES: any,
            snapshot: (snapshotData: Record<string, Todo[]>) => void
          ) {
            setNotificationMessage(
              NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
            );
          },
          todos,
          takeSnapshot,
          snapshotStore,
          fetchSnapshotSuccess,
          setTodos,
          setNotificationMessage,
        }
    );
  };




  const batchFetchSnapshotsSuccess = () => { 
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  }

  makeAutoObservable(
    {
      todos,
      toggleTodo,
      addTodo,
      addTodos,
      removeTodo,
      updateTodoTitle,
      fetchTodosSuccess,
      fetchTodosFailure,
      fetchTodosRequest,
      completeAllTodosSuccess,
      completeAllTodos,
      completeAllTodosFailure,
      NOTIFICATION_MESSAGE,
      NOTIFICATION_MESSAGES,
      setDynamicNotificationMessage,
      
      takeSnapshot,
      snapshot: useSnapshotManager().addSnapshot,
      updateSnapshotSuccess,
      batchFetchSnapshotsRequest,
      batchFetchSnapshotsSuccess,
      batchFetchSnapshotsFailure
    },
    {
      setDynamicNotificationMessage: false, // Ensure this function is not considered as an action
    }
  );

  return {
    todos,
    toggleTodo,
    addTodo,
    addTodos,
    removeTodo,
    takeSnapshot,
    updateTodoTitle,
    fetchTodosSuccess,
    fetchTodosFailure,
    fetchTodosRequest,
    completeAllTodosSuccess,
    completeAllTodos,
    completeAllTodosFailure,
    NOTIFICATION_MESSAGE,
    NOTIFICATION_MESSAGES,
    setDynamicNotificationMessage,
    fetchSnapshot: snapshotStore.fetchSnapshot,
    
    initSnapshot: snapshotStore.initSnapshot,
    getSnapshots,
    snapshot: snapshotStore.addSnapshot,
    snapshotStore,
    takeSnapshotSuccess: snapshotStore.takeSnapshotSuccess,
    getSnapshot,
    onSnapshot,
    updateSnapshot,
    fetchSnapshotSuccess,
    updateSnapshotSuccess,
    updateSnapshotFailure,

    batchFetchSnapshotsSuccess,
    batchFetchSnapshotsRequest,
    batchFetchSnapshotsFailure
  };
};

export default useTodoManagerStore;
