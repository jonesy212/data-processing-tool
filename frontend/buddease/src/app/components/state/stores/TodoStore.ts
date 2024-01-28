// TodoManagerStore.ts
import omit from "lodash/omit";
import { makeAutoObservable } from "mobx";
import { useRef, useState } from "react";
import useSnapshotManager from "../../hooks/useSnapshotManager";
import { Data } from "../../models/data/Data";
import { subscriptionService } from "../../subscriptions/SubscriptionService";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { Todo } from "../../todos/Todo";
import SnapshotStore, { Snapshot } from "./SnapshotStore";
import { CommonData } from "../../models/CommonData";
import myInitUserSnapshotData from "../../users/userSnapshotData";
import { UserData } from "../../users/User";
export interface TodoManagerStore {
  todos: Record<string, Todo>;
  toggleTodo: (id: string) => void;
  addTodo: (todo: Todo) => void;
  addTodos: (newTodos: Todo[], data: SnapshotStore<Data | UserData>) => void; // Update this line
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
  snapshot: (newSnapshot: Omit<Todo, "id">) => Promise<void>;
  // snapshotStore: SnapshotStore<Record<string, Todo[]>>
  initSnapshot: (
    snapshotStore: SnapshotStore<Data | UserData>,
    snapshotData: Snapshot<Data>
  ) => Promise<void>;
  takeSnapshotSuccess: (snapshot: Record<string, Todo>) => void;
  updateSnapshot: (
    snapshotId: string,
    updatedData: Omit<Todo, "id">
  ) => Promise<void>;
  updateSnapshotFailure: (payload: { error: string }) => void;
  takeSnapshotsSuccess: (snapshots: Record<string, Todo[]>) => void;

  fetchSnapshot: (snapshotId: string) => void;
  onSnapshot: (snapshot: Record<string, Todo>) => void;
  getSnapshot: (snapshot: Record<string, Todo>) => Record<string, Todo[]>;
  getSnapshots: (snapshots: Record<string, Record<string, Todo[]>>) => void;
  takeSnapshot: (data: Record<string, Todo[]>) => void;
  updateSnapshotSuccess: (snapshot: Record<string, Todo[]>) => void;

  fetchSnapshotSuccess: (snapshot: Todo[]) => void;
  createSnapshotSuccess: (snapshot: Record<string, Todo[]>) => void;
  createSnapshotFailure: (error: string) => void;

  batchUpdateSnapshotsSuccess: (snapshotData: Record<string, Todo[]>) => void;
  batchFetchSnapshotsRequest: (snapshotData: Record<string, Todo[]>) => void;
  batchFetchSnapshotsSuccess: (snapshotData: Record<string, Todo[]>) => void;
  batchFetchSnapshotsFailure: (payload: { error: string }) => void;
  batchUpdateSnapshotsFailure: (payload: { error: string }) => void;

  subscribeToSnapshot: (
    snapshotId: string,
    callback: (snapshot: Todo) => void
  ) => void;
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

  const snapshotSubscriptionService = subscriptionService;

  const takeSnapshot = (data: Record<string, Todo[]>) => {
    const timestamp = Date.now();
    const snapshot: Record<string, Todo[]> = {
      ...data,
      [timestamp]: todos,
      snapshots: [],
    };

    onSnapshotCallbacks.forEach((callback) => callback(snapshot));
  };

  const takeSnapshotSuccess = async (
    snapshotStore: SnapshotStore<Data | UserData>,
    snapshot: Snapshot<Data | UserData>
  ) => { 
    try {
      let data: UserData | Data;
      if ('userDataSpecificProperty' in snapshot.data) {
        // 'userDataSpecificProperty' is a property specific to UserData
        data = snapshot.data as UserData;
      } else {
        // Assuming 'data' is of type Data
        data = snapshot.data as Data;
      }
      
      // Ensure 'data' is defined before calling createSnapshot
      if (!data) {
        throw new Error("Data is missing.");
      }
  
      snapshotStore.createSnapshot(data, snapshot); // Provide both data and snapshot parameters
      setNotificationMessage(NOTIFICATION_MESSAGES.Snapshot.CREATED);
    } catch (error) {
      setNotificationMessage(NOTIFICATION_MESSAGES.Snapshot);
    }
  }
  

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

  const loading = useRef(false);

  const addTodos = (
    newTodos: Todo[],
    data: SnapshotStore<Snapshot<Data>>
  ): void => {
    setTodos((prevTodos: Record<string, Todo>) => {
      const updatedTodos = { ...prevTodos };

      newTodos.forEach(async (todo) => {
        updatedTodos[todo.id as string] = todo;

        // Take snapshot for each todo
        if (data) {
          // Use lodash omit to exclude 'id' property
          const todoWithoutId: Omit<Todo, "id"> = omit(todo, "id");
          const updatedSnapshots: Data = {
            _id: "", // Provide a default or placeholder value
            id: "", // Provide a default or placeholder value
            title: "", // Provide a default or placeholder value
            tags: [], // Provide a default or placeholder value
            analysisType: todoWithoutId.analysisType,
            analysisResults: todoWithoutId.analysisResults,
            status: todoWithoutId.status,
            isActive: todoWithoutId.isActive,
            then: (callback: (newData: Data) => void) => {
              // Placeholder implementation, can be empty or throw an error
              console.warn("Placeholder implementation for 'then' property");
            },
            // Add other properties as needed
          };
          data.takeSnapshot(updatedSnapshots);
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

  const getSnapshots = async (
    snapshot: SnapshotStore<Snapshot<Data>[]>
  ): Promise<Record<string, Todo[]>[]> => {
    // Assuming snapshotStore.getSnapshots() returns a Promise
    const snapshots = await snapshotStore.getSnapshots(snapshot);

    // Perform any transformation or processing needed to convert Snapshot<Todo> to Record<string, Todo[]>
    const transformedSnapshots: Record<string, Todo[]>[] = snapshots.map(
      (snapshot: Snapshot<Data>): Record<string, Todo[]> => {
        // Example: Dummy conversion, replace this with your actual logic
        const data = snapshot.data as Todo;
        const todos: Todo[] = data.todos || [];
        return { [snapshot.timestamp.toString()]: todos };
      }
    );

    return transformedSnapshots;
  };

  const getSnapshot = async (snapshotId: string) => {
    try {
      loading.current = true;

      const snapshot = await snapshotStore.fetchSnapshot(snapshotId);

      return snapshot;
    } catch (error) {
      throw error;
    } finally {
      loading.current = false;
    }
  };

  const createSnapshotSuccess = () => {
    console.log("Snapshot created successfully!");
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  };

  const createSnapshotFailure = (error: string) => {
    console.error("Create snapshot failure:", error);
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.PROCESSING_BATCH);
  };

  const subscribeToSnapshot = async (
    snapshotId: string,
    snapshot: (snapshot: Todo) => void
  ) => {
    try {
      loading.current = true;

      try {
        const unsubscribe = snapshotStore.subscribeToSnapshot(
          snapshotId,
          snapshot
        );
        // Ensure prevSubscriptions has the correct type annotation
        setSubscriptions({} as Record<string, () => void>);

        // Use `unsubscribe` here or pass it to another function for further processing
        // For example:
        // someFunctionThatNeedsUnsubscribe(unsubscribe);
      } catch (error) {
        const errorMessage =
          typeof error === "string"
            ? error
            : "An error occurred during the subscription.";
        batchFetchSnapshotsFailure({ error: errorMessage });
      } finally {
        loading.current = false;
      }
    } catch (error) {
      console.error("Error in subscribeToSnapshot:", error);
      // Handle any errors that occurred in the outer try block
    }
  };

  const setSubscriptions = (prevSubscriptions: Record<string, () => void>) =>
    prevSubscriptions;

  const updateSnapshot = async (
    snapshot: SnapshotStore<Snapshot<Todo>[]>,
    snapshotId: string,
    updatedSnapshot: Snapshot<Todo>
  ) => {
    try {
      loading.current = true;

      // Convert updatedSnapshot to the required type (Omit<Todo, "id">)
      const updatedData: Omit<Todo, "id"> = updatedSnapshot as unknown as Omit<
        Todo,
        "id"
      >;

      await snapshotStore.updateSnapshot(snapshotId, updatedData);
      fetchSnapshotSuccess(snapshot);
      setDynamicNotificationMessage(
        NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
      );
    } catch (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : "An error occurred during the update.";
      batchFetchSnapshotsFailure({ error: errorMessage });
    } finally {
      loading.current = false;
    }
  };

  const updateSnapshotFailure = (error: string) => {
    console.error("Update snapshot failure:", error);
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.Snapshot.UPDATING_SNAPSHOT
    );
  };

  const updateSnapshotSuccess = () => {
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
    batchFetchSnapshotsRequest();
  };

  // Update the usage accordingly
  const batchFetchSnapshotsFailure = ({ error }: { error: string }) => {
    console.error("Batch fetch snapshots failure:", error);
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.Snapshot.FETCHING_SNAPSHOTS
    );
    batchFetchSnapshotsFailure({ error }); // Pass the error as an object
  };

  const batchUpdateSnapshotsSuccess = () => {
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  };

  const batchUpdateSnapshotsFailure = ({ error }: { error: any }) => {
    console.error("Batch update snapshots failure:", error);
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.Snapshot.UPDATING_SNAPSHOTS
    );
  };

  const onSnapshot = (snapshot: SnapshotStore<Snapshot<Todo>[]>) => {
    fetchSnapshotSuccess(snapshot);
  };

  const fetchSnapshotSuccess = (snapshot: SnapshotStore<Snapshot<Todo>[]>) => {
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
  };

  const useTodoManagerStore = makeAutoObservable(
    {
      // Todos
      todos,
      toggleTodo,
      addTodo,
      addTodos,
      removeTodo,
      updateTodoTitle,

      // Fetching Todos
      fetchTodosSuccess,
      fetchTodosRequest,
      fetchTodosFailure,

      // Completing Todos
      completeAllTodosSuccess,
      completeAllTodos,
      completeAllTodosFailure,

      // Notifications
      NOTIFICATION_MESSAGE,
      NOTIFICATION_MESSAGES,
      setDynamicNotificationMessage,

      // Snapshot Management
      takeSnapshot,
      snapshot: useSnapshotManager().addSnapshot,
      takeSnapshotSuccess,
      takeSnapshotsSuccess: snapshotStore.takeSnapshotsSuccess,
      fetchSnapshot: snapshotStore.fetchSnapshot,
      fetchSnapshotSuccess,
      createSnapshotSuccess,
      createSnapshotFailure,

      // Snapshot Initialization and Updates
      initSnapshot: snapshotStore.initSnapshot,
      updateSnapshot,
      updateSnapshotSuccess,
      updateSnapshotFailure,

      // Batch Snapshot Operations
      batchFetchSnapshotsRequest,
      batchFetchSnapshotsSuccess,
      batchFetchSnapshotsFailure,
      batchUpdateSnapshotsSuccess,
      batchUpdateSnapshotsFailure,

      // Snapshot Subscriptions
      subscribeToSnapshot,
      setSubscriptions,

      // Snapshot Events
      onSnapshot,
      getSnapshot,
      getSnapshots,

      // Miscellaneous
      snapshotStore,
    },
    {
      // Exclude the following function from being considered as an action
      setDynamicNotificationMessage: false,
    }
  );

  return useTodoManagerStore;
};

export default useTodoManagerStore;
