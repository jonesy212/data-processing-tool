// TodoManagerStore.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import { makeAutoObservable } from "mobx";
import { useRef, useState } from "react";
import useSnapshotManager from "../../hooks/useSnapshotManager";
import { Data } from "../../models/data/Data";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { Todo } from "../../todos/Todo";
import SnapshotStore, { Snapshot } from "./SnapshotStore";

export interface TodoManagerStore {
  todos: Record<string, Todo>;
  todoList: Todo[];
  toggleTodo: (id: string) => void;
  addTodo: (todo: Todo) => void;
  addTodos: (newTodos: Todo[], data: SnapshotStore<Snapshot<Data>>) => void;
  removeTodo: (id: string) => void;
  updateTodoTitle: (payload: { id: string; newTitle: string }) => void;
  fetchTodosSuccess: (payload: { todos: Todo[] }) => void;
  fetchTodosFailure: (payload: { error: string }) => void;
  fetchTodosRequest: () => void;
  completeAllTodosSuccess: () => void;
  completeAllTodos: () => void;
  completeAllTodosFailure: (payload: { error: string }) => void;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  setDynamicNotificationMessage: (message: string) => void;
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
          const updatedSnapshots: Snapshot<Data> = {
            timestamp: Date.now(),
            data: {} as Data
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
      NOTIFICATION_MESSAGES.Data.PAGE_LOADING
    );
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
// / Define function to open todo settings page
  const openTodoSettingsPage = (todoId: number, teamId: number) => {
    window.location.href = endpoints.todos.assign(todoId, teamId);
  };

  
  const createSnapshotSuccess = () => {
    console.log("Snapshot created successfully!");
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  };



  const batchFetchSnapshotsRequest = () => { 
    console.log("Fetching snapshots...");
    // You can add loading indicators or other UI updates here
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.Data.PAGE_LOADING
    );
  
  }
  const setSubscriptions = (prevSubscriptions: Record<string, () => void>) =>
    prevSubscriptions;

  
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
  
      // Miscellaneous
      snapshotStore,
      openTodoSettingsPage,

      // batch actions
      batchFetchSnapshotsRequest,
    },
    {
      // Exclude the following function from being considered as an action
      setDynamicNotificationMessage: false,
    }
  );
  
  return useTodoManagerStore;
}  
export default useTodoManagerStore;
