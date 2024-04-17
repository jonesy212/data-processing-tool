// TodoManagerStore.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import { makeAutoObservable } from "mobx";
import { useRef, useState } from "react";
import useSnapshotManager from "../../hooks/useSnapshotManager";
import { Data } from "../../models/data/Data";
import SnapshotStore, { Snapshot } from "../../snapshots/SnapshotStore";
import { NotificationTypeEnum, useNotification } from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { Todo } from "../../todos/Todo";
import { todoService } from "../../todos/TodoService";


const {notify} = useNotification()
export interface TodoManagerStore {
  dispatch: (action: any) => void;
  todos: Record<string, Todo>;
  todoList: Todo[];
  toggleTodo: (id: string) => void;
  addTodo: (todo: Todo) => void;
  addTodos: (newTodos: Todo[], data: SnapshotStore<Snapshot<Data>>) => void;
  removeTodo: (id: string) => void;
  assignTodoToUser: (todoId: string, userId: string) => void;
  updateTodoTitle: (payload: { id: string; newTitle: string }) => void;
  fetchTodosSuccess: (payload: { todos: Todo[] }) => void;
  fetchTodosFailure: (payload: { error: string }) => void;
  
  openTodoSettingsPage: (todoId: number, teamId: number) => void;
  getTodoId: (todo: Todo) => string;
  
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
  batchFetchSnapshotsRequest: (payload: Record<string, Todo[]>) => void;
}

const useTodoManagerStore = (): TodoManagerStore => {
  const [todos, setTodos] = useState<Record<string, Todo>>({});
  const [subscriptions, setSubscriptions] = useState<
    Record<string, () => void>
    >({});
    const [uiState, setUIState] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });
  
  const assignTodoToUser = async (todoId: string, userId: string) => { 
    setUIState({ loading: true, error: null });
    try {
      await todoService.assignTodoToUser(todoId, userId);
      notify(
        "assignTodoToUser",
        "Todo assigned successfully!",
        NOTIFICATION_MESSAGES.Todos.TODO_ASSIGNED_SUCCESSFULLY,
        new Date,
        NotificationTypeEnum.Success
      );
    } catch (error: any) {
      setUIState({ loading: false, error: error.message });
      notify(
        "assignTodoToUserFailure",
        error.message,
        NOTIFICATION_MESSAGES.Todos.TODO_ASSIGN_ERROR,
        new Date,
        NotificationTypeEnum.Error,
      );
    }
  }

  const [NOTIFICATION_MESSAGE, setNotificationMessage] = useState<string>("");

  // Inside useTodoManagerStore function
  const snapshotStore = useSnapshotManager();
  // Initialize SnapshotStore
  const onSnapshotCallbacks: ((
    snapshotData: Record<string, Todo[]>
  ) => void)[] = [];


  

  const dispatch = (action: any) => {
    switch (action.type) {
      case "FETCH_TODOS_REQUEST":
        fetchTodosRequest();
        break;
      case "FETCH_TODOS_SUCCESS":
        fetchTodosSuccess(action.payload);
        break;
      case "FETCH_TODOS_FAILURE":
        fetchTodosFailure(action.payload);
        break;
      case "COMPLETE_ALL_TODOS_REQUEST":
        completeAllTodosRequest(action.payload);
        break;
      case "COMPLETE_ALL_TODOS_SUCCESS":
        completeAllTodosSuccess();
        break;
      case "COMPLETE_ALL_TODOS_FAILURE":
        completeAllTodosFailure(action.payload);
        break;
      case "BATCH_FETCH_SNAPSHOTS_REQUEST":
        batchFetchSnapshotsRequest();
        break;
      case "BATCH_FETCH_SNAPSHOTS_SUCCESS":
        batchFetchSnapshotsSuccess(action.payload);        break;
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
          const updatedSnapshots: SnapshotStore<Snapshot<Data>> = {
            timestamp: new Date,
            data: {} as Data,
          } as SnapshotStore<Snapshot<Data>>
          data.takeSnapshot(updatedSnapshots);
        }
      });

      // Update state
      return updatedTodos;
    });
  };

  const todoList = Object.values(todos);

  const subscribeToSnapshot = (
    snapshotId: string,
    callback: (snapshot: Todo) => void
  ) => {
    onSnapshotCallbacks.push();
    snapshotStore.subscribeToSnapshot(snapshotId, (snapshot) => {
      callback(snapshot);
    });
  };

  const removeTodo = (id: string) => {
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      delete updatedTodos[id];
      return updatedTodos;
    });
  };


  const getTodoId = (todo: Todo): string => { 
    return todo.id as string;
  }

  const fetchTodo = async (): Promise<void> => {
    if (loading.current) {
      return;
    }
    loading.current = true;
    try {
      const response = await fetch(
        `${window.location.origin}${endpoints.todos.fetch}`
      );
      const todos = await response.json();
      fetchTodosSuccess({ todos });
    } catch (error: any) {
      fetchTodosFailure({ error: error.message });
      setDynamicNotificationMessage(
        NOTIFICATION_MESSAGES.Todos.TODO_FETCH_ERROR
      );
    } finally {
      loading.current = false;
    }
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

  const completeAllTodosRequest = (payload: { todos: Todo[] }) => {
    console.log("Completing all Todos...");
    // Show loading indicator
    setUIState({ loading: true, error: null });
    // Simulate asynchronous completion
    setTimeout(() => {
      // Your logic to handle completion of all todos
      // Hide loading indicator
      setUIState({ loading: false, error: null });
      completeAllTodos(); // Trigger completion logic
    }, 1000);
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  };




  const completeAllTodosSuccess = () => {
    console.log("All Todos completed successfully!");
    // You can add additional logic or trigger notifications as needed
    
    if (typeof NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT === 'string') {
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
      );
    }
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
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Data.PAGE_LOADING);
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

  const createSnapshotSuccess = () => {
    console.log("Snapshot created successfully!");
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  };

  const openTodoSettingsPage = (todoId: number, teamId: number) => {
    window.location.href =
      typeof endpoints.todos.assign === "function"
        ? endpoints.todos.assign(todoId, teamId)
        : "";
  };

  const batchFetchSnapshotsRequest = () => {
    console.log("Fetching snapshots...");
    // You can add loading indicators or other UI updates here
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Data.PAGE_LOADING);
  };

  const batchFetchSnapshotsSuccess = (payload: {
    snapshots: Snapshot<Data>[];
  }) => {
    console.log("Snapshots fetched successfully!");
    const { snapshots } = payload;
    snapshotStore.setSnapshots(snapshots);
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  };
  
  // For example, if the user has previous subscriptions stored in localStorage
  const prevSubscriptions = localStorage.getItem("subscriptions");
  if (prevSubscriptions) {
    setSubscriptions(JSON.parse(prevSubscriptions));
  }

  const useTodoManagerStore = makeAutoObservable(
    {
      // Todos
      dispatch,
      todos,
      toggleTodo,
      addTodo,
      addTodos,
      todoList,
      removeTodo,
      updateTodoTitle,
      assignTodoToUser,
      setSubscriptions,
      // Fetching Todos
      fetchTodosSuccess,
      fetchTodosRequest,
      fetchTodosFailure,
      getTodoId,
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

      // snapshot subscriptions
      subscribeToSnapshot,
    },
    {
      // Exclude the following function from being considered as an action
      setDynamicNotificationMessage: false,
      setSubscriptions: false,
    }
  );

  return useTodoManagerStore;
};
export default useTodoManagerStore;
