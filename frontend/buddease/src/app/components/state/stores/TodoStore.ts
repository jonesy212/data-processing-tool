import { NotificationType } from '@/app/components/support/NotificationContext';
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { generateSnapshotId } from './../../utils/snapshotUtils';
// TodoManagerStore.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { makeAutoObservable } from "mobx";
import { MutableRefObject, useRef, useState } from "react";
import { useSnapshotManager } from "../../hooks/useSnapshotManager";
import { Data } from "../../models/data/Data";
import { Snapshot, Snapshots } from '../../snapshots/LocalStorageSnapshotStore';
import SnapshotStore from "../../snapshots/SnapshotStore";
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import {
    NotificationTypeEnum,
    useNotification,
} from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { Todo } from "../../todos/Todo";
import { todoService } from "../../todos/TodoService";
import useSecureStoreId from '../../utils/useSecureStoreId';
import { AllStatus } from './DetailsListStore';
import { T, K, Meta} from "@/app/components/models/data/dataStoreMethods";

const { notify } = useNotification();

interface TodoManagerStoreProps {
  initialTodos?: Record<string, Todo<T, K, Meta>>; // Optional initial todos
}

export interface TodoManagerStore<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K> 
> {
  dispatch: (action: any) => void;
  todos: Record<string, Todo<T, K, Meta>>;
  todoList: Todo<T>[];
  toggleTodo: (id: string) => void;
  addTodo: (todo: Todo<T>) => void;
  loading: MutableRefObject<boolean>;
  error: string | null;
  addTodos: (
    newTodos: Todo<T>[],
    data: SnapshotStore<Snapshot<any, any, any>>
  ) => void;
  removeTodo: (id: string) => void;
  assignTodoToUser: (todoId: string, userId: string) => void;
  updateTodoTitle: (payload: { id: string; newTitle: string }) => void;
  fetchTodosSuccess: (payload: { todos: Todo<T>[] }) => void;
  fetchTodosFailure: (payload: { error: string }) => void;
  openTodoSettingsPage: (todoId: number, teamId: number) => void;
  getTodoId: (todo: Todo<T>) => string | null;
  getTeamId: (todo: Todo<T>) => string | null;
  fetchTodosRequest: () => void;
  completeAllTodosSuccess: () => void;
  completeAllTodos: () => void;
  completeAllTodosFailure: (payload: { error: string }) => void;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
   setDynamicNotificationMessage: (message: Message, type: NotificationType) => void;
  
  subscribeToSnapshot: (
    id: string,
    callback: (snapshot: Snapshot<Todo<T, K, Meta>, Meta, Data>) => void,
    snapshot: Snapshot<Todo<T, K, Meta>, Meta, Data>
  ) => void;
  
  batchFetchTodoSnapshotsRequest: (payload: Record<string, Todo<T>[]>) => void;
  assignedTaskStore: (id: string, assignedTo: string) => void;
  updateTaskTitle: (id: string, newTitle: string) => void;
  updateTaskDescription: (id: string, newDescription: string) => void;
  updateTaskStatus: (id: string, newStatus: AllStatus) => void;


  
}
const useTodoManagerStore = <
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(props: TodoManagerStoreProps): TodoManagerStore<T, K> => {
  
  const [todos, setTodos] = useState<Record<string, Todo>>(props.initialTodos || {});
  const [subscriptions, setSubscriptions] = useState<
    Record<string, () => void>
    >({});
  const loading = useRef(false);
  const error = useRef("");
  const [uiState, setUIState] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: false, error: null });
  const [NOTIFICATION_MESSAGE, setNotificationMessage] = useState<string>("");

  const storeId = useSecureStoreId()
  if(!storeId){
    throw new Error("Store ID is required in order to create notification todo store");
  }
  // Inside useTodoManagerStore function
  const snapshotStore = useSnapshotManager(storeId);
  // Initialize SnapshotStore
  const onSnapshotCallbacks: ((snapshot: Snapshot<Todo<T, K, Meta>, K, Meta>) => void)[] = [];

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
        batchFetchTodoSnapshotsRequest();
        break;
      case "BATCH_FETCH_SNAPSHOTS_SUCCESS":
        batchFetchSnapshotsSuccess(action.payload);
        break;
    }
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


  const addTodos = (
    newTodos: Todo[],
    data: SnapshotStore<Todo<T, K, Meta>>,
    subscribers?: SubscriberCollection<T, K>
  ): void => {
    setTodos((prevTodos: Record<string, Todo>) => {
      const updatedTodos = { ...prevTodos };
  
      newTodos.forEach((todo) => {
        updatedTodos[todo.id as string] = todo;
  
        // Take snapshot for each todo
        if (data) {
          // Convert todo to snapshot format
          const snapshot: Snapshot<Todo<T, K, Meta>, Meta, Todo> = {
            todoSnapshotId: generateSnapshotId,
            initialState: todo,
            category: "todo",
            timestamp: new Date(),
            // Other properties specific to Snapshot<Todo> if needed
          };


          if(!subscribers){
            throw new Error("No subscribers")
          }
  
          // Take the snapshot
          data.takeSnapshot(snapshot, subscribers);

        }
      });
  
      // Update state with new todos
      return updatedTodos;
    });
  };
  

  const todoList = Object.values(todos);
  const subscribeToSnapshot = (
    id: string,
    callback: (snapshot: Snapshot<Todo<T, K, Meta>, Meta, Todo>) => void,
    snapshot: Snapshot<Todo<T, K, Meta>, Meta, Todo> // Add 'snapshot' as an argument
  ) => {
    // Define the conversion functions
    const todoToData = (todo: Todo): Data => {
      // Implement the conversion logic here for Todo to Data
      const data: Data = {
        timestamp: undefined,
        category: ""
      };
      return data;
    };
  
    const dataToTodo = (data: Data): Todo => {
      // Implement the conversion logic here for Data to Todo
      const todo: Todo = {
        _id: "",
        id: "",
        done: false,
        todos: [],
        title: "",
        description: "",
        dueDate: null,
        priority: undefined,
        assignedTo: null,
        assigneeId: "",
        assignee: null,
        assignedUsers: [],
        collaborators: [],
        labels: [],
        subtasks: [],
        save: function (): Promise<void> {
          throw new Error("Function not implemented.");
        },
        snapshot: {
          timestamp: "",
          category: undefined
        },
        timestamp: "",
        category: undefined
      };
      return todo;
    };
  
    // Simulate creating a Todo
    const todo: Todo = {
      // Todo properties
    } as Todo;
  
    // Convert Todo to Data
    const data: Data = todoToData(todo);
  
    // Convert Data to Todo
    const convertedTodo: Todo = dataToTodo(data);
  
    // Check the type of 'data' and 'convertedTodo' to determine the correct conversion
    if ('id' in data && 'id' in convertedTodo) {
      // Perform conversion logic specific to Todo
      const convertedSnapshot: Snapshot<Todo<T, K, Meta>, Meta, Todo> = {
        ...snapshot, // Spread the 'snapshot' passed as an argument
        id,
        data: {
          ...snapshot.data,
          id: convertedTodo.id,
          _id: convertedTodo._id,
          title: convertedTodo.title,
          status: convertedTodo.status,
          todos: convertedTodo.todos,
          dueDate: convertedTodo.dueDate,
          description: convertedTodo.description,
          category: convertedTodo.category,
          assignedTo: convertedTodo.assignedTo,
          assigneeId: convertedTodo.assigneeId,
          startDate: convertedTodo.startDate,
          elapsedTime: convertedTodo.elapsedTime,
          timeEstimate: convertedTodo.timeEstimate,
          timeSpent: convertedTodo.timeSpent,
          assignedUsers: convertedTodo.assignedUsers,
          collaborators: convertedTodo.collaborators,
          done: convertedTodo.done,
          labels: convertedTodo.labels,
          assignee: convertedTodo.assignee,
          priority: convertedTodo.priority,
          dependencies: convertedTodo.dependencies,
          recurring: convertedTodo.recurring,
          subtasks: convertedTodo.subtasks,
          entities: convertedTodo.entities,
          projectId: convertedTodo.projectId,
          milestoneId: convertedTodo.milestoneId,
          phaseId: convertedTodo.phaseId,
          taskId: convertedTodo.taskId,
          teamId: convertedTodo.teamId,
          creatorId: convertedTodo.creatorId,
          order: convertedTodo.order,
          parentId: convertedTodo.parentId,
          createdAt: convertedTodo.createdAt,
          updatedAt: convertedTodo.updatedAt,
          isActive: convertedTodo.isActive,
          tags: convertedTodo.tags,
          isDeleted: convertedTodo.isDeleted,
          isArchived: convertedTodo.isArchived,
          isCompleted: convertedTodo.isCompleted,
          isRecurring: convertedTodo.isRecurring,
          isBeingDeleted: convertedTodo.isBeingDeleted,
          isBeingEdited: convertedTodo.isBeingEdited,
          isBeingCompleted: convertedTodo.isBeingCompleted,
          isBeingReassigned: convertedTodo.isBeingReassigned,
          recurringRule: convertedTodo.recurringRule,
          recurringEndDate: convertedTodo.recurringEndDate,
          recurringFrequency: convertedTodo.recurringFrequency,
          recurringCount: convertedTodo.recurringCount,
          recurringDaysOfWeek: convertedTodo.recurringDaysOfWeek,
          recurringDaysOfMonth: convertedTodo.recurringDaysOfMonth,
          recurringMonthsOfYear: convertedTodo.recurringMonthsOfYear,
          save: convertedTodo.save,
          snapshot: convertedTodo.snapshot,
          analysisType: convertedTodo.analysisType,
          analysisResults: convertedTodo.analysisResults,
          videoData: convertedTodo.videoData,
          timestamp: convertedTodo.timestamp,
          suggestedDay: convertedTodo.suggestedDay,
          suggestedWeeks: convertedTodo.suggestedWeeks,
          suggestedMonths: convertedTodo.suggestedMonths,
          suggestedSeasons: convertedTodo.suggestedSeasons,
          eventId: convertedTodo.eventId,
          suggestedStartTime: convertedTodo.suggestedStartTime,
          suggestedEndTime: convertedTodo.suggestedEndTime,
          suggestedDuration: convertedTodo.suggestedDuration,
          data: convertedTodo.data,
          // Include other Todo-specific properties
        }
      };
      // Call the callback with the converted snapshot
      callback(convertedSnapshot);
    } else {

      
      // Perform conversion logic specific to Data
      const convertedSnapshot: Snapshot<Todo<T, K, Meta>, Meta, Todo> = {
        ...snapshot, // Spread the 'snapshot' passed as an argument
        data: {
          ...snapshot.data,
          _id: convertedTodo._id || '', // Ensure _id is assigned a value or a default value
          id: convertedTodo.id || '', // Ensure id is assigned a value or a default value
          content: convertedTodo.content || '', // Ensure content is assigned a value or a default value
          done: convertedTodo.done || false, // Ensure done is assigned a value or a default value
          status: convertedTodo.status || undefined, // Ensure status is assigned a value or a default value
          todos: convertedTodo.todos || [],
          title: convertedTodo.title || '',
          selectedTodo: convertedTodo.selectedTodo || undefined,
          progress: convertedTodo.progress || undefined,
          description: convertedTodo.description || '',
          dueDate: convertedTodo.dueDate || null,
          payload: convertedTodo.payload || undefined,
          type: convertedTodo.type || undefined,
          priority: convertedTodo.priority || undefined,
          assignedTo: convertedTodo.assignedTo || null,
          assigneeId: convertedTodo.assigneeId || '',
          assignee: convertedTodo.assignee || null,
          assignedUsers: convertedTodo.assignedUsers || [],
          collaborators: convertedTodo.collaborators || [],
          labels: convertedTodo.labels || [],
          comments: convertedTodo.comments || [],
          attachments: convertedTodo.attachments || [],
          checklists: convertedTodo.checklists || [],
          startDate: convertedTodo.startDate || undefined,
          elapsedTime: convertedTodo.elapsedTime || undefined,
          timeEstimate: convertedTodo.timeEstimate || undefined,
          timeSpent: convertedTodo.timeSpent || undefined,
          dependencies: convertedTodo.dependencies || [],
          recurring: convertedTodo.recurring || null,
          subtasks: convertedTodo.subtasks || [],
          entities: convertedTodo.entities || [],
          projectId: convertedTodo.projectId || '',
          milestoneId: convertedTodo.milestoneId || '',
          phaseId: convertedTodo.phaseId || '',
          taskId: convertedTodo.taskId || '',
          teamId: convertedTodo.teamId || '',
          creatorId: convertedTodo.creatorId || '',
          order: convertedTodo.order || undefined,
          parentId: convertedTodo.parentId || null,
          createdAt: convertedTodo.createdAt || undefined,
          updatedAt: convertedTodo.updatedAt || undefined,
          isActive: convertedTodo.isActive || false,
          tags: convertedTodo.tags || [],
          isDeleted: convertedTodo.isDeleted || false,
          isArchived: convertedTodo.isArchived || false,
          isCompleted: convertedTodo.isCompleted || false,
          isRecurring: convertedTodo.isRecurring || false,
          isBeingDeleted: convertedTodo.isBeingDeleted || false,
          isBeingEdited: convertedTodo.isBeingEdited || false,
          isBeingCompleted: convertedTodo.isBeingCompleted || false,
          isBeingReassigned: convertedTodo.isBeingReassigned || false,
          recurringRule: convertedTodo.recurringRule || '',
          recurringEndDate: convertedTodo.recurringEndDate || undefined,
          recurringFrequency: convertedTodo.recurringFrequency || '',
          recurringCount: convertedTodo.recurringCount || undefined,
          recurringDaysOfWeek: convertedTodo.recurringDaysOfWeek || [],
          recurringDaysOfMonth: convertedTodo.recurringDaysOfMonth || [],
          recurringMonthsOfYear: convertedTodo.recurringMonthsOfYear || [],
          save: convertedTodo.save || (() => Promise.resolve()), // Default save function
          snapshot: convertedTodo.snapshot || {}, // Default snapshot
          analysisType: convertedTodo.analysisType || undefined,
          analysisResults: convertedTodo.analysisResults || [],
          videoData: convertedTodo.videoData || undefined,
          timestamp: convertedTodo.timestamp || '',
          suggestedDay: convertedTodo.suggestedDay || null,
          suggestedWeeks: convertedTodo.suggestedWeeks || null,
          suggestedMonths: convertedTodo.suggestedMonths || null,
          suggestedSeasons: convertedTodo.suggestedSeasons || null,
          eventId: convertedTodo.eventId || '',
          suggestedStartTime: convertedTodo.suggestedStartTime || '',
          suggestedEndTime: convertedTodo.suggestedEndTime || '',
          suggestedDuration: convertedTodo.suggestedDuration || '',
          data: convertedTodo.data !== undefined ? convertedTodo.data : undefined,
          category: convertedTodo.category || '',

          // Map properties from Data to Snapshot
        }
      };
      // Call the callback with the converted snapshot
      callback(convertedSnapshot);
    }
  };
  

  const removeTodo = (id: string) => {
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      delete updatedTodos[id];
      return updatedTodos;
    });
  };

  const getTodoId = (todo: Todo): string | null => {
    return todo.id as string;
  };
  const getTeamId = (todo: Todo): string | null => {
    return todo.teamId as string;
  };

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

    if (typeof NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT === "string") {
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

  const batchFetchTodoSnapshotsRequest = () => {
    console.log("Fetching snapshots...");
    // You can add loading indicators or other UI updates here
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Data.PAGE_LOADING);
  };

  const batchFetchSnapshotsSuccess = async (payload: {
    snapshots: Snapshots<Data, Meta>;
  }) => {
    console.log("Snapshots fetched successfully!");
    const { snapshots } = payload;

    const { snapshotManager, snapshotStore } = await useSnapshotManager();
  
    if (!snapshotManager && snapshotManager?.snapshotStore) {
      snapshotManager.setSnapshots(snapshots);
    }
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

  
  const assignTodoToUser = async (todoId: string, userId: string) => {
    setUIState({ loading: true, error: null });
    try {
      await todoService.assignTodoToUser(todoId, userId);
      setTodos((prevTodos) => ({
        ...prevTodos,
        [todoId]: {
          ...prevTodos[todoId],
          assignedTo: userId
        }
      }));
      notify(
        "assignTodoToUser",
        "Todo assigned successfully!",
        NOTIFICATION_MESSAGES.Todos.TODO_ASSIGNED_SUCCESSFULLY,
        new Date(),
        NotificationTypeEnum.Success
      );
    } catch (error: any) {
      setUIState({ loading: false, error: error.message });
      notify(
        "assignTodoToUserFailure",
        error.message,
        NOTIFICATION_MESSAGES.Todos.TODO_ASSIGN_ERROR,
        new Date(),
        NotificationTypeEnum.Error
      );
    } finally {
      setUIState({ loading: false, error: null });
    }
  };

  const updateTaskTitle = (todoId: string, newTitle: string) => {
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      if (updatedTodos[todoId]) {
        updatedTodos[todoId] = {
          ...updatedTodos[todoId],
          title: newTitle
        };
      }
      return updatedTodos;
    });
    notify(
      "updateTaskTitle",
      "Task title updated successfully!",
      NOTIFICATION_MESSAGES.Todos.TODO_TITLE_UPDATED,
      new Date(),
      NotificationTypeEnum.Success
    );
  };

  const updateTaskDescription = (todoId: string, newDescription: string) => {
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      if (updatedTodos[todoId]) {
        updatedTodos[todoId] = {
          ...updatedTodos[todoId],
          description: newDescription
        };
      }
      return updatedTodos;
    });
    notify(
      "updateTaskDescription",
      "Task description updated successfully!",
      NOTIFICATION_MESSAGES.Todos.TODO_DESCRIPTION_UPDATED,
      new Date(),
      NotificationTypeEnum.Success
    );
  };

  const updateTaskStatus = (todoId: string, newStatus: "pending" | "in-progress" | "completed") => {
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      if (updatedTodos[todoId]) {
        updatedTodos[todoId] = {
          ...updatedTodos[todoId],
          status: newStatus
        };
      }
      return updatedTodos;
    });
    notify(
      "updateTaskStatus",
      "Task status updated successfully!",
      NOTIFICATION_MESSAGES.Todos.TODO_STATUS_UPDATED,
      new Date(),
      NotificationTypeEnum.Success
    );
  };


  const useTodoManagerStore = makeAutoObservable(
    {
      // Todos
      dispatch,
      todos,
      loading,
      error,
      toggleTodo: (id) => updateTaskStatus(id, todos[id].status === "completed" ? "pending" : "completed"),
      assignedTaskStore: assignTodoToUser,
      updateTaskTitle,
      updateTaskDescription,
      updateTaskStatus,
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
      getTeamId,
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

      // snapshot actions
      createSnapshotSuccess: createSnapshotSuccess,
      // batch actions
      batchFetchTodoSnapshotsRequest,

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

export type { TodoManagerStoreProps };
