// TaskStore.tsx
import type { Attachment } from '@/core/documents/attachment/Attachment';

import { TaskActions } from '@/core/actions/TaskActions';
import addSnapshot from '@/core/api/SnapshotApi';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { saveAs } from '@/core/documents/editing/autosave';
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { createSnapshot } from '@/core/snapshots/createSnapshot';
import { RealtimeDataItem } from '@/core/typings/realtimeTypes';

import { tasksDataSource } from '@/core/components/models/tasks/TaskDataSource';
import { NotificationType, NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { Message } from '@/core/generators/GenerateChatInterfaces';
import { generateNewTask } from "@/core/generators/GenerateNewTask";
import useApiManager from "@/core/hooks/dynamicHooks/useApiManager";
import useSecureStoreId from "@/core/hooks/useSecureStoreId";
import { useSnapshotManager } from "@/core/hooks/useSnapshotManager";
import type { BaseData, Data } from '@/core/models/data/Data';
import { PriorityTypeEnum, TaskStatus } from "@/core/models/data/StatusType";
import type { Task } from "@/core/models/tasks/Task";
import FilterTasksRequest from "@/core/pages/searches/FilterTasksRequest";
import { taskService } from "@/core/services/TaskService";
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { updateSnapshot } from '@/core/snapshots/snapshotHandlers';
import { clearSnapshots, removeSnapshot } from '@/core/snapshots/snapshotOperations';
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import { useSnapshotStore } from '@/core/snapshots/useSnapshotStore';
import { useNotification } from '@/core/state/context/NotificationContext';
import { useApiManagerSlice } from "@/core/state/redux/slices/ApiSlice";
import { useTaskManagerSlice } from "@/core/state/redux/slices/TaskSlice";
import { AssignTaskStore, useAssignTaskStore } from "@/core/state/stores/AssignTaskStore";
import type { AllStatus } from '@/core/state/stores/DetailsListStore';
import { Subscriber } from '@/core/subscribers/Subscriber';
import { Todo } from "@/core/todos/Todo";
import { User } from "@/core/users/User";
import { makeAutoObservable } from "mobx";
import { title } from 'process';
import { useState } from "react";

export interface TaskManagerStore<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  tasks: Record<
    string,
    Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  >;
  todos: {
    realtimeData: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  };
  taskTitle: string;
  taskId?: string;

  taskDescription: string;
  taskStatus:  AllStatus

  assignedTaskStore: AssignTaskStore;
  updateTaskTitle: (title: string, taskId: string) => void;
  updateTaskDescription: (description: string, taskId: string) => void;
  updateTaskStatus: (
    status: "pending" | "inProgress" | "completed",
    taskId: string
  ) => void;
  updateTaskDueDate: (taskId: string, dueDate: Date) => void;

  updateTaskPriority: (taskId: string, priority: PriorityTypeEnum) => void;
  filterTasksByStatus: (
    status: TaskStatus
  ) => Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  getTaskCountByStatus: (
    status: "pending" | "inProgress" | "completed"
  ) => number;
  clearAllTasks: () => void;
  archiveCompletedTasks: () => void;
  updateTaskAssignee: (
    taskId: string,
    assignee: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => (dispatch: any) => Promise<void>;
  getTasksByAssignee: (tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], assignee: User) => Promise<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
  getTaskById: (taskId: string) => Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  sortByDueDate: () => void;
  exportTasksToCSV: () => void;

  // Define dispatch function
  dispatch: (action: any) => void;
  addTaskSuccess: (payload: { task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }) => void;
  addTask: (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  addTasks: (tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void;

  
  assignTaskToUser: (taskId: string, userId: string) => void;
  removeTask: (taskId: string) => void;
  removeTasks: (taskIds: string[]) => void;
  fetchTasksByTaskId: (taskId: string) => Promise<string>;
  fetchTasksSuccess: (payload: { tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }) => void;
  fetchTasksFailure: (payload: { error: string }) => void;
  fetchTasksRequest: () => void;
  completeAllTasksSuccess: (success: string) => void;
  completeAllTasks: (payload: { task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }) => void;
  completeAllTasksFailure: (payload: { error: string }) => void;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
   setDynamicNotificationMessage: (message: Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, type: NotificationType) => void;
  takeTaskSnapshot: (taskId: string) => void;
  markTaskAsComplete: (taskId: string) => void;

  updateTaskPositionSuccess: (payload: { task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }) => void;
  // Add more methods or properties as needed
  batchFetchTaskSnapshotsRequest: (
    snapshotData: Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>
  ) => void;
  batchFetchTaskSnapshotsSuccess: (taskId:  Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>) => void;
  batchFetchUserSnapshotsRequest: (
    snapshotData: Record<string, User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>
  ) => void
}


const updateTaskPositionSuccess = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(payload: { task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }) => {
  const { task } = payload;

   // ✅ Extract from store
  const { tasks, setTasks, setDynamicNotificationMessage } = useTaskManagerStore();

  // Find the current position of the task
  const currentStatus = task.status;
  const taskList = tasks[currentStatus];

  if (!taskList) {
    console.error(`No task list found for status: ${currentStatus}`);
    return;
  }

  const taskIndex = taskList.findIndex((t) => t.id === task.id);

  if (taskIndex === -1) {
    console.error(`Task with ID ${task.id} not found in ${currentStatus} list`);
    return;
  }

  // Update the task in its current position
  setTasks((prevTasks) => {
    const updatedTasks = { ...prevTasks };
    const updatedTaskList = [...updatedTasks[currentStatus]];
    updatedTaskList[taskIndex] = task;

    return {
      ...updatedTasks,
      [currentStatus]: updatedTaskList,
    };
  });

  // Show success notification
  useTaskManagerStore().setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
};

const useTaskManagerStore = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): TaskManagerStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
 const { notify } = useNotification();
  const { markTaskAsCompleteSuccess, markTaskAsCompleteFailure, setAssignedTaskStore } = TaskActions;
  const assignTaskToUser = useApiManager();
  const [tasks, setTasks] = useState<Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>>({
    pending: [],
    inProgress: [],
    completed: [],
  });
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>(TaskStatus.Pending);
  const [NOTIFICATION_MESSAGE, setNotificationMessage] = useState<string>(""); // Initialize it with an empty string

  const taskStore = useAssignTaskStore(); // Include the AssignTaskStore
  // Include the AssignTaskStore
  const assignedTaskStore = useAssignTaskStore();
  // Initialize SnapshotStore

  const initSnapshot = {} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  const dispatch = (action: any) => {
    const { type, payload } = action;
    switch (type) {
      case TaskActions.addTaskSuccess.type:
        addTaskSuccess(payload);
        break;
      case TaskActions.addTaskFailure.type:
        addTaskFailure(payload);
        break;
      case TaskActions.fetchTasksSuccess.type:
        fetchTasksSuccess(payload);
        break;
      case TaskActions.fetchTasksFailure.type:
        fetchTasksFailure(payload);
        break;
      case TaskActions.fetchTasksRequest.type:
        fetchTasksRequest();
        break;
      case TaskActions.completeAllTasksSuccess.type:
        completeAllTasksSuccess();
        break;
      case TaskActions.completeAllTasksFailure.type:
        completeAllTasksFailure(payload);
        break;
      case TaskActions.completeAllTasks.type:
        completeAllTasks();
        break;
      case TaskActions.markTaskAsComplete.type:
        markTaskAsComplete(payload);
        break;
      case TaskActions.markTaskAsCompleteSuccess.type:
        markTaskAsCompleteSuccess(payload);
        break;
      case TaskActions.setAssignedTaskStore.type:
        setAssignedTaskStore(payload);
        break;
      default:
        break;
    }
  } 

    const reassignedTasks = ["task1", "task2", "task3"];

    const taskSnapshotStore: Promise<SnapshotStore<Snapshot<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>> = useSnapshotStore(addToSnapshotList);
    const taskIdToAssign = "someTaskId";
    
    
    taskStore.setAssignedTaskStore({
      ...assignedTaskStore,
      flatMap: () => { },
      snapshotId: '',
      taskIdToAssign: taskIdToAssign,
      addSnapshot: addSnapshot,
      updateSnapshot: updateSnapshot,
      removeSnapshot: removeSnapshot,
      clearSnapshots: clearSnapshots,
      createSnapshot: createSnapshot,
      createSnapshotSuccess: createSnapshotSuccess,
      createSnapshotFailure: createSnapshotFailure,
      updateSnapshots: updateSnapshots,
      updateSnapshotSuccess: updateSnapshotSuccess,
      updateSnapshotFailure: updateSnapshotFailure,
      updateSnapshotsSuccess: updateSnapshotsSuccess,
      updateSnapshotsFailure: updateSnapshotsFailure,
      initSnapshot: initSnapshot,
      takeSnapshot: takeSnapshot,
      takeSnapshotSuccess: takeSnapshotSuccess,
      takeSnapshotsSuccess: takeSnapshotsSuccess,
      configureSnapshotStore: configureSnapshotStore,
      getData: (): Promise<Data> => {
        throw new Error('Function not implemented.');
      },
      setData: setData,
      getState: getState,
      validateSnapshot: validateSnapshot,
      handleSnapshot: handleSnapshot,
      handleActions: handleActions,
      setSnapshot: setSnapshot,
      setSnapshots: setSnapshots,
      clearSnapshot: clearSnapshot,
      mergeSnapshots: mergeSnapshots,
      reduceSnapshots: reduceSnapshots,
      sortSnapshots: sortSnapshots,
      filterSnapshots: filterSnapshots,
      mapSnapshots: mapSnapshots,
      findSnapshot: findSnapshot,
      getSubscribers: getSubscribers,
      notify: notify,
      notifySubscribers: notifySubscribers,
      subscribe: subscribe,
      unsubscribe: unsubscribe,
      fetchSnapshot: fetchSnapshot,
      fetchSnapshotSuccess: fetchSnapshotSuccess,
      fetchSnapshotFailure: fetchSnapshotFailure,
      getSnapshot: getSnapshot,
      getSnapshots: getSnapshots,
      getAllSnapshots: getAllSnapshots,
      generateId: generateId,
      batchFetchSnapshots: batchFetchSnapshots,
      batchTakeSnapshotsRequest: batchTakeSnapshotsRequest,
      batchUpdateSnapshotsRequest: batchUpdateSnapshotsRequest,
      batchFetchSnapshotsSuccess: batchFetchSnapshotsSuccess,
      batchFetchSnapshotsFailure: batchFetchSnapshotsFailure,
      batchUpdateSnapshotsSuccess: batchUpdateSnapshotsSuccess,
      batchUpdateSnapshotsFailure: batchUpdateSnapshotsFailure,
      batchTakeSnapshot: batchTakeSnapshot,
      snapshots: [],
      config: undefined
    });

  const reassignTask = (
    taskId: string,
    oldUserId: string,
    newUserId: string
  ) => {
    try {
      // Check if task exists
      if (!tasks[taskId] || tasks[taskId].length === 0) {
        console.error(`Task with ID ${taskId} does not exist or has no data.`);
        setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.TASK_NOT_FOUND);
        return;
      }
      
      // Create snapshot before any changes
      const taskSnapshot = { [taskId]: [...tasks[taskId]] };
      useSnapshotManager().addSnapshot(
        taskSnapshot as unknown as Omit<Todo<T, K, Meta>, "id">
      );
      
      // Update assignedTaskStore (for task-user assignments)
      const assignedTasks = assignedTaskStore[taskId] ?? [];
      const reassignedTasks = assignedTasks.map((task) =>
        task.userId === oldUserId ? { ...task, userId: newUserId } : task
      );
      
      setAssignedTaskStore({
        ...assignedTaskStore,
        [taskId]: reassignedTasks,
      });
      
      // Update the main task with new assignee
      const updatedTask = { 
        ...tasks[taskId][0], 
        assignedUserId: newUserId,
        lastUpdated: new Date()
      };
      
      setTasks((prevTasks) => ({
        ...prevTasks,
        [taskId]: [updatedTask]
      }));
      
      // Show success notification
      setDynamicNotificationMessage(
        NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
      );
      
      // Optional: Log the reassignment
      console.log(`Reassigned task ${taskId} from user ${oldUserId} to ${newUserId}`);
      
    } catch (error) {
      console.error(`Error reassigning task ${taskId}:`, error);
      setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.DEFAULT);
    }
  };

    const reassignUser = (
      taskId: string,
      oldUserId: string,
      newUserId: string
    ) => {
      const reassignedTasks = assignedTaskStore[taskId]?.map((task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        // Ensure oldUserId is of type string
        const oldUserIdString: string = oldUserId.toString();
        if (task.userId === oldUserIdString) {
          return { ...task, userId: newUserId };
        }
        return task;
      });
      

      if (reassignedTasks) {
        setAssignedTaskStore({
          ...assignedTaskStore,
          [taskId]: reassignedTasks,
          task: undefined,
          assignee: "",
        });
      }
    };

    const updateTaskDescription = (description: string, taskId: string) => {
      setTaskDescription(description, taskId);
    };

  const addTaskSuccess = (payload: { task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }) => {
    const { task } = payload;
    setTasks((prevTasks) => {
      const taskId = task.id;
      return { ...prevTasks, [taskId]: [...(prevTasks[taskId] || []), task] };
    });
  };

  const takeTaskSnapshot = async <
    T extends BaseData<any>,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
  >(taskId: string, storeId?: number) => {
    // Ensure the taskId exists in the tasks
    if (!tasks[taskId]) {
      console.error(`Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> with ID ${taskId} does not exist.`);
      return;
    }

    if(!storeId && storeId !== null){
      storeId = useSecureStoreId()
    }
    // Create a snapshot of the current tasks for the specified taskId
    const taskSnapshot = { [taskId]: [...tasks[taskId]] };

    // Store the snapshot in the SnapshotStore
    
    (await useSnapshotManager(storeId)).snapshotManager.addSnapshot(
      taskSnapshot as unknown as Omit<Todo<T, K, Meta>, "id">
    );
  };


  const addTask = (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    // Ensure the title is not empty before adding a task
    if (taskTitle.trim().length === 0) {
      console.error("Task title cannot be empty.");
      return;
    }

    const projectId = useSecurProjectId()
    const newTask = generateNewTask(
      projectId,
      title,
      false,
      0
    );

    // Ensure the title is not empty before adding a task
    if (taskTitle.trim().length === 0) {
      console.error("Task title cannot be empty.");
      return;
    }

    newTask.then((task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
      setTasks((prevTasks) => {
        const taskId = task.id;
        return { ...prevTasks, [taskId]: [...(prevTasks[taskId] || []), task] };
      });
    });

    // Reset input fields after adding a task
    setTaskTitle("");
    setTaskDescription("");
    setTaskStatus(TaskStatus.Pending);
  };

  const removeTask = (taskId: string) => {
    setTasks((prevTasks: Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>) => {
      const updatedTasks = { ...prevTasks };
      delete updatedTasks[taskId];
      return updatedTasks;
    });
  };

  const removeTasks = (taskIds: string[]) => {
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      taskIds.forEach((taskId) => {
        delete updatedTasks[taskId];
      });
      return updatedTasks;
    });
  };


  const addTasks = (tasksToAdd: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {
    // Ensure at least one task is passed
    if (tasksToAdd.length === 0) {
      console.error("At least one task must be passed");
      return;
    }

    setTasks((prevTasks) => {
      tasksToAdd.forEach((task) => {
        const taskId = task.id;
        prevTasks[taskId] = [...(prevTasks[taskId] || []), task];
      });
      return prevTasks;
    });

    // Reset input fields after adding tasks
    setTaskTitle("");
    setTaskDescription("");
    setTaskStatus("pending");
  };

  const fetchTasksSuccess = (payload: { tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }) => {
    const { tasks: newTasks } = payload;
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };

      newTasks.forEach((task) => {
        if (!prevTasks[task.id]) {
          prevTasks[task.id] = [];
        }
        prevTasks[task.id].push(task);
      });

      return updatedTasks;
    });
  };

  const addTaskFailure = (payload: { error: string }) => {
    console.error(payload.error);
  };

  /**
   * Update the due date for a task
   *
   * @param {string} taskId - The ID of the task to update
   * @param {Date} dueDate - The new due date
   */

  const updateTaskDueDate = (taskId: string, dueDate: Date) => {
    const updatedTasks = { ...tasks };

    // Find the task and update its due date
    const taskToUpdate = updatedTasks.pending.find(
      (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => task.id === taskId
    );

    if (taskToUpdate) {
      taskToUpdate.dueDate = dueDate;
    } else {
      // Task not found, throw error or handle gracefully
    }

    // Update the tasks in the store
    setTasks(updatedTasks);
  };

  const updateTaskTitle = (title: string, taskId: string) => {
    updateTaskTitle(title, taskId);
  };

  const updateTaskStatus = (
    status: "pending" | "inProgress" | "completed",
    taskId: string
  ) => {
    updateTaskStatus(status, taskId);
  };

  const completeTask = (taskId: string) => {
    // Ensure the taskId exists in the tasks
    if (!tasks[taskId]) {
      console.error(`Task with ID ${taskId} does not exist.`);
      return;
    }

    // Create a snapshot of the current tasks for the specified taskId
    const taskSnapshot = { [taskId]: [...tasks[taskId]] };

    // Store the snapshot in the SnapshotStore
    useSnapshotManager().addSnapshot(
      taskSnapshot as unknown as Omit<Todo<T, K, Meta>, "id">
    );
  };

  const completeAllTasksSuccess = () => {
    console.log("All Tasks completed successfully!");
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  };

  const completeAllTasks = () => {
    console.log("Completing all Tasks...");
    // You can add loading indicators or other UI updates here

    // Simulate asynchronous completion
    setTimeout(() => {
      // Update tasks to mark all as done
      setTasks((prevTasks: Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>) => {
        const updatedTasks = { ...prevTasks };
        Object.keys(updatedTasks).forEach((id) => {
          updatedTasks[id] = prevTasks[id].map((task) => ({
            ...task,
            done: true,
          }));
        });
        return updatedTasks;
      });

      // Trigger success
      completeAllTasksSuccess();
    }, 1000);
  };

  const fetchTasksFailure = (payload: { error: string }) => {
    console.error("Fetch Tasks Failure:", payload.error);
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.Error.ERROR_FETCHING_DATA
    );
  };

  const fetchTasksRequest = () => {
    console.log("Fetching Tasks...");
    // You can add loading indicators or other UI updates here
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Data.PAGE_LOADING);
  };

  const completeAllTasksFailure = (payload: { error: string }) => {
    console.error("Complete All Tasks Failure:", payload.error);
    // You can add additional error handling or trigger notifications as needed
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.PROCESSING_BATCH);
  };

  const markTaskAsComplete = (taskId: string) => async (dispatch: any) => {
    try {
      // Update task status to complete
      // Assuming setTasks is a local state updater
      setTasks((prevTasks) => {
        const updatedTasks = { ...prevTasks };
        const taskToUpdate = updatedTasks[taskId];
        if (taskToUpdate) {
          taskToUpdate[0].status = "completed";
        }
        return updatedTasks;
      });

      // Dispatch the synchronous action immediately
      dispatch(markTaskAsCompleteSuccess(taskId));

      const { markTaskComplete } = useTaskManagerSlice.actions;

      // Dispatch the asynchronous action (no need to await)
      markTaskComplete(taskId);

      // Simulating asynchronous operation
      setTimeout(() => {
        // Note: This won't have access to the Redux thunk's `dispatch` context
        // You might want to move this to a different approach
        console.log(`Task ${taskId} completed asynchronously`);
      }, 1000);

      // Show success notification
      notify({
        id: `markTaskCompleteSuccess-${taskId}`,
        message: NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
        data: {
          extra: {
            taskId,
            operation: "Mark task as complete",
            status: "completed"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });

    } catch (error) {
      console.error(`Error marking task ${taskId} as complete`, error);

      dispatch(markTaskAsCompleteFailure({ 
        taskId: taskId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));

      notify({
        id: `markTaskCompleteError-${taskId}`,
        message: NOTIFICATION_MESSAGES.Error.DEFAULT,
        data: {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: `Error marking task ${taskId} as complete`,
            taskId
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
    }
  };

  const markTaskAsInProgress =

    (taskId: string, requestData: string) => async (dispatch: any) => {
      const taskToUpdate = tasks[taskId];
      try {
        // Update task status to in progress
        // Assuming setTasks is a local state updater
        setTasks((prevTasks) => {
          const updatedTasks = { ...prevTasks };
          const taskToUpdate = { ...updatedTasks[taskId], status: TaskStatus.InProgress };
          updatedTasks[taskId] = taskToUpdate;
          return updatedTasks;
        });
      } catch (err) {
        console.error(`Error marking task ${taskId} as in progress`, err);
      }
      dispatch(
        TaskActions.markTaskAsInProgressSuccess({
          taskId: {
            taskId: taskId,
            requestData: requestData,
            ...tasks,
            id: '',
            title: '',
            description: '',
            assignedTo: null,
            assigneeId: undefined,
            dueDate: undefined,
            payload: undefined,
            priority: PriorityTypeEnum.Low,
            previouslyAssignedTo: [],
            done: false,
            data: undefined,
            source: 'user',
            startDate: undefined,
            endDate: undefined,
            isActive: false,
            tags: [],
            [Symbol.iterator]: function (): Iterator<any, any, undefined> {
              throw new Error('Function not implemented.');
            },
            timestamp: undefined,
            category: ''
          },
          requestData,
        })
      );
      const { markTaskAsInProgress } = useTaskManagerSlice.actions;
      markTaskAsInProgress(String(taskToUpdate));
      // Simulating asynchronous operation
      setTimeout(() => {
        notify(
          "markTaskAsInProgressFailure",
          `Error marking task ${taskToUpdate} as in progress`,
          NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
          new Date(),
          NotificationTypeEnum.OPERATION_SUCCESS
        );
      }, 1000);
    };



  // Function to fetch a task by its ID
  const getTaskById = (taskId: string): Promise<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
    return new Promise<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>(async (resolve, reject) => {
      try {
        setTimeout(() => {
          const task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined = tasksDataSource[taskId];
  
          if (task) {
            resolve(task);
          } else {
            resolve(null);
          }
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  };
  

  const sortByDueDate = (tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {
    return tasks.sort((a, b) => {
      const dateA = new Date(a.dueDate ?? "");
      const dateB = new Date(b.dueDate ?? "");
      return dateA.getTime() - dateB.getTime();
    });
  };

  const exportTasksToCSV = async () => {
    // Convert tasks data to CSV format
    const tasksCSV = tasksDataSourceToCSV(tasksDataSource);

    const downloadCSVFile = (data: any, filename: any) => {
      const blob = new Blob([data], { type: "text/csv" });
      
      // Check if the property exists before accessing it
      if ((window.navigator as any).msSaveOrOpenBlob) {
        (window.navigator as any).msSaveBlob(blob, filename);
        // Download CSV as a blob for other browsers
      } else {
        saveAs(blob, filename);
      }
      // Download CSV file
      downloadCSVFile(tasksCSV, "tasks.csv");
      // Download CSV file as a blob
    };
  };
  
  const updateTaskPriority = (taskId: string, priority: PriorityTypeEnum) => async (dispatch: any) => {
    try {
      // Update task priority
      // Assuming setTasks is a local state updater
      setTasks((prevTasks) => {
        const updatedTasks = { ...prevTasks }; // Make a copy of the object
        const taskToUpdate = updatedTasks[taskId];
        if (taskToUpdate) {
          updatedTasks[taskId] = {
            ...taskToUpdate,
            priority: priority
          };
        }
        return updatedTasks;
      });
      
      // Dispatch the synchronous action immediately
      dispatch(TaskActions.updateTaskPrioritySuccess({
        taskId,
        priority
      }));
      
      // Show success notification
      notify({
        id: `updateTaskPrioritySuccess-${taskId}`,
        message: NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
        data: {
          extra: {
            taskId,
            priority,
            operation: "Update task priority"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
      
      // Simulating asynchronous operation (if needed)
      setTimeout(() => {
        // If you need to do something async after success
        console.log(`Priority updated for task ${taskId}`);
      }, 1000);
      
    } catch (error) {
      console.error(`Error updating priority for task ${taskId}`, error);

      dispatch(
        TaskActions.updateTaskPriorityFailure({
          taskId,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      );

      notify({
        id: `updateTaskPriorityError-${taskId}`,
        message: NOTIFICATION_MESSAGES.Error.DEFAULT,
        data: {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: `Error updating priority for task ${taskId}`,
            taskId,
            priority
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
    }
  };

  const filterTasksByStatus = (status: TaskStatus) => {
    return tasksDataSource.filter((task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => task.status === status);
  }

  // Define an index signature for taskCountByStatus
  const taskCountByStatus: { [key: string]: number } = {};

  
  const updateTaskAssignee = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  taskId: string, 
  assignee: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => async (dispatch: AppDispatch) => { // Use proper AppDispatch type if available
  const notificationId = `updateTaskAssignee-${taskId}-${Date.now()}`;
  
  try {
    // Update task assignee in local state
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      const taskToUpdate = updatedTasks[taskId];
      if (taskToUpdate && taskToUpdate[0]) {
        taskToUpdate[0].assignee = assignee;
      }
      return updatedTasks;
    });

    // Dispatch synchronous action
    dispatch(updateTaskAssigneeSuccess(taskId, assignee));
    
    // Show immediate success notification
    notify({
      id: notificationId,
      message: NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
      data: {
        extra: {
          taskId,
          assigneeId: assignee.id,
          assigneeName: assignee.name || 'Unknown',
          operation: "Update task assignee",
          timestamp: new Date().toISOString()
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success'
    });

    // Optional: Async operation (API call, server sync, etc.)
    // Uncomment and implement if needed:
    /*
    setTimeout(async () => {
      try {
        // API call to update assignee on server
        await api.updateTaskAssignee(taskId, assignee.id);
        
        // Optional: Show completion notification
        notify({
          id: `asyncUpdateAssigneeSuccess-${taskId}`,
          message: "Assignee sync completed",
          data: { taskId, assigneeId: assignee.id },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_SUCCESS,
          level: 'info'
        });
      } catch (serverError) {
        console.error(`Server sync failed for task ${taskId}`, serverError);
        
        notify({
          id: `serverSyncError-${taskId}`,
          message: "Server sync failed - changes saved locally",
          data: { 
            taskId, 
            assigneeId: assignee.id,
            error: serverError instanceof Error ? serverError.message : 'Unknown error'
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_ERROR,
          level: 'warning'
        });
      }
    }, 1000);
    */

  } catch (error) {
    console.error(`Error updating task ${taskId} assignee`, error);
    
    // Dispatch error action if available
    if (updateTaskAssigneeFailure) {
      dispatch(updateTaskAssigneeFailure({ 
        taskId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
    
    // Show error notification
    notify({
      id: `${notificationId}-error`,
      message: NOTIFICATION_MESSAGES.Error.DEFAULT,
      data: {
        originalError: error instanceof Error ? error.message : 'Unknown error',
        extra: {
          errorMessage: `Error updating task ${taskId} assignee`,
          taskId,
          assigneeId: assignee.id
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error'
    });
    
    // Optional: Re-throw if you want calling code to handle it
    // throw error;
  }
};
  

const getTaskCountByStatus = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {
    try {
      // Clear previous counts
      Object.keys(taskCountByStatus).forEach(key => {
        delete taskCountByStatus[key];
      });

      const statuses = Object.keys(TaskStatus);
      for (const status of statuses) {
        taskCountByStatus[status] = tasks.filter(
          (task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => task.status === status
        ).length;
      }

      // Show success notification immediately
      notify({
        id: `getTaskCountByStatusSuccess-${Date.now()}`,
        message: NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
        data: {
          extra: {
            operation: "Get task count by status",
            totalTasks: tasks.length,
            statusCounts: { ...taskCountByStatus }, // Create a copy
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });

      return { ...taskCountByStatus }; 
    } catch (error) {
      console.error(`Error getting task count by status`, error);
      
      notify({
        id: `getTaskCountByStatusError-${Date.now()}`,
        message: NOTIFICATION_MESSAGES.Error.DEFAULT,
        data: {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Error getting task count by status",
            totalTasks: tasks.length
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      
      // Return empty object on error
      return {};
    }
  };

  const updateTaskPositionSuccess = async (payload: { taskId: string }) => {
    const { taskId } = payload;
    const task = await getTaskById(taskId);
  
    if (task && task.status) {
      // Cast status to TaskStatus if needed
      const status = task.status as TaskStatus;
      const taskList = tasks[status] || []; // Provide fallback array
    
      const taskIndex = taskList.findIndex((t) => t.id === taskId);
    
      if (taskIndex !== -1) {
        const updatedTaskList = [
          ...taskList.slice(0, taskIndex),
          task,
          ...taskList.slice(taskIndex + 1),
        ];
      
        setTasks({
          ...tasks,
          [status]: updatedTaskList
        });
      }
    }
  }  

  const clearAllTasks = () => {
    setTasks({});
  };

  const archiveCompletedTasks = () => {
    try {
      // Get all tasks from data source (assuming it's Record<string, Task>)
      const allTasks = tasksDataSource as Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
      
      // Filter out completed tasks
      const filteredTasks: Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};
      
      Object.entries(allTasks).forEach(([taskId, task]) => {
        if (task.status !== TaskStatus.Completed) {
          filteredTasks[taskId] = task;
        }
      });

      // Transform to the expected state structure: Record<string, Task[]>
      const updatedState: Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> = {
        [TaskStatus.Pending]: [],
        [TaskStatus.InProgress]: [],
        [TaskStatus.Completed]: []
      };

      Object.values(filteredTasks).forEach(task => {
        if (task.status === TaskStatus.Pending) {
          updatedState[TaskStatus.Pending].push(task);
        } else if (task.status === TaskStatus.InProgress) {
          updatedState[TaskStatus.InProgress].push(task);
        } else if (task.status === TaskStatus.Completed) {
          updatedState[TaskStatus.Completed].push(task);
        }
      });

      // Update the state
      setTasks(updatedState);
      
      console.log(`Archived ${Object.keys(allTasks).length - Object.keys(filteredTasks).length} completed tasks`);
    } catch (error) {
      console.error("Error archiving completed tasks", error);
    }
  };


  const getTasksByAssignee = async (tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], assignee: User) => {
    try {
      // Simulate fetching tasks assigned to the given user
      const tasks = TaskActions.fetchTasksByTaskUserId({
        tasks: [],
        assigneeId: assignee.id as string,
      });
      // Return fetched tasks
      return tasks;
    } catch (error) {
      console.error("Error fetching tasks by assignee", error);
      throw error;
    }
  };

  const updateTaskAssigneeSuccess = (taskId: string, assignee: User) => {
    console.log(`Task ${taskId} assignee updated to ${assignee}`);
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
    return "Task assignee updated successfully.";
  };

  const fetchTasksByTask = async (filter: typeof FilterTasksRequest) => {
    try {
      // Simulate fetching tasks matching the given filter
      const tasks = await taskService.getTasks(JSON.stringify(filter));

      return tasks;
    } catch (error) {
      console.error("Error fetching tasks by filter criteria", error);
      throw error;
    }
  };

  const fetchTasksByTaskId = async (taskId: string): Promise<string> => {
    try {
      // Perform the actual fetching of the task using the taskId
      const task = await getTaskById(taskId);

      // Check if the task was successfully fetched
      if (task) {
        // Update the tasks state with the fetched task
        setTasks((prevTasks) => {
          const updatedTasks = { ...prevTasks };
          updatedTasks[task.id] = [task]; // Assuming task.id is unique
          return updatedTasks;
        });

        // Notify user of successful task fetching
        setDynamicNotificationMessage(
          NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
        );

        return "Tasks fetched successfully."; // Return success message
      } else {
        console.error(`Task with ID ${taskId} not found.`);
        // Notify user that task was not found
        setDynamicNotificationMessage(
          NOTIFICATION_MESSAGES.Error.TASK_NOT_FOUND
        );
        return "Task not found."; // Return error message
      }
    } catch (error) {
      console.error(`Error fetching task with ID ${taskId}:`, error);
      // Notify user of error while fetching task
      setDynamicNotificationMessage(
        NOTIFICATION_MESSAGES.Error.ERROR_FETCHING_TASK
      );
      throw new Error("Error fetching task."); // Throw error
    }
  };

  const fetchTasksByTaskIdFailure = (payload: { error: string }) => {
    console.error("Fetch Tasks Failure:", payload.error);
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.Error.ERROR_FETCHING_TASK
    );
  };

  const batchFetchTaskSnapshotsRequest = <T extends { id: string }>(
    snapshotData: Record<string, T[]>
  ): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      try {
        Object.values(snapshotData).forEach((tasks: T[], index: number) => {
          tasks.forEach((task: T) => {
            // Create a snapshot for each task
            const snapshot: Snapshot<Omit<T, "id">> = {
              data: { ...task },
              timestamp: new Date(),
              category: "task",
            };

            // Add the snapshot to the SnapshotManager
            useSnapshotManager(initialStoreId, storeProps).addSnapshot(snapshot);
          });
        });

        // Show success notification
        notify({
          id: `batchFetchTaskSnapshotsSuccess-${Date.now()}`,
          message: NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
          data: {
            extra: {
              operation: "Batch fetch task snapshots",
              totalTasks: Object.values(snapshotData).flat().length,
              timestamp: new Date().toISOString()
            }
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_SUCCESS,
          level: 'success'
        });

        // Resolve with a message indicating success
        resolve("Batch fetch task snapshots completed successfully.");
      } catch (error) {
        console.error("Error in batchFetchTaskSnapshotsRequest:", error);
      
        notify({
          id: `batchFetchTaskSnapshotsError-${Date.now()}`,
          message: NOTIFICATION_MESSAGES.Error.DEFAULT,
          data: {
            originalError: error instanceof Error ? error.message : 'Unknown error',
            extra: {
              errorMessage: "Failed to batch fetch task snapshots",
              snapshotCount: Object.keys(snapshotData).length
            }
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_ERROR,
          level: 'error'
        });
      
        reject(error);
      }
    });
  };

  const batchFetchTaskSnapshotsSuccess = (taskId: string) => async (dispatch: any) => {
    try {
      console.log(`Task ${taskId} fetched`);
    
      // Show success notification
      notify({
        id: `batchFetchTaskSnapshotsSuccess-${taskId}-${Date.now()}`,
        message: NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
        data: {
          extra: {
            taskId,
            operation: "Batch fetch task snapshots success",
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });

      // Assuming you have a method to fetch tasks by taskId from your data source
      const tasks = fetchTasksByTaskId(taskId); // Implement this method

      // Check if tasks is not null or undefined
      if (tasks) {
        // Dispatch the fetched tasks to the store or perform any necessary logic
        dispatch(batchFetchTaskSnapshotsSuccess(tasks));

        // Simulating asynchronous operation - if you need actual async behavior
        setTimeout(() => {
          console.log(`Async operation for task ${taskId} completed`);
          // If you need to notify after async operation:
          // notify({
          //   id: `asyncBatchFetchComplete-${taskId}`,
          //   message: "Async batch fetch completed",
          //   data: { taskId, taskCount: tasks.length },
          //   timestamp: new Date(),
          //   type: NotificationTypeEnum.OPERATION_SUCCESS,
          //   level: 'success'
          // });
        }, 1000);
      } else {
        console.error(`Tasks not found for taskId ${taskId}`);
      
        notify({
          id: `batchFetchTaskSnapshotsNotFound-${taskId}`,
          message: NOTIFICATION_MESSAGES.Error.DEFAULT,
          data: {
            extra: {
              errorMessage: `Tasks not found for taskId ${taskId}`,
              taskId
            }
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_ERROR,
          level: 'error'
        });
      }
    } catch (error) {
      console.error(`Error in batchFetchTaskSnapshotsSuccess for task ${taskId}:`, error);
    
      notify({
        id: `batchFetchTaskSnapshotsError-${taskId}-${Date.now()}`,
        message: NOTIFICATION_MESSAGES.Error.DEFAULT,
        data: {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: `Error fetching task ${taskId}`,
            taskId
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
    }
  };

  const batchFetchUserSnapshotsRequest =
    <T extends { id: string }>(
      snapshotData: Record<string, T[]>
    ) => {
      return new Promise<string>((resolve, reject) => {
        Object.values(snapshotData).forEach((users: T[], index: number) => {
          users.forEach((user: T) => {
            // Create a snapshot for each user
            const snapshot: Snapshot<Omit<T, "id">> = {
              data: user,
              timestamp: new Date(),
              category: "user" // Add the missing 'category' property
            };

            // Add the snapshot to the SnapshotManager
            useSnapshotManager().addSnapshot(snapshot);
          });
        });

        // Resolve with a message indicating success
        resolve("Batch fetch user snapshots completed successfully.");
      });
    };


  const markTaskAsInProgressSuccess = (taskId: string, requestData: string) => (dispatch: any) => {
    try {
      console.log(`Task ${taskId} marked as in progress`);
  
      // Show success notification
      notify({
        id: `markTaskAsInProgressSuccess-${taskId}-${Date.now()}`,
        message: NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
        data: {
          extra: {
            taskId,
            requestData,
            operation: "Mark task as in progress",
            status: "in-progress",
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
  
      // Dispatch the success action
      dispatch(markTaskAsInProgressSuccess(taskId, requestData));
  
      // Call the service method if needed
      const { markTaskAsInProgress } = taskService;
      if (markTaskAsInProgress) {
        markTaskAsInProgress(taskId, requestData);
      }
  
      // Simulating asynchronous operation - if actually needed
      setTimeout(() => {
        console.log(`Async operation for task ${taskId} in-progress status completed`);
        // If you need async notification:
        // notify({
        //   id: `asyncMarkTaskInProgressSuccess-${taskId}`,
        //   message: "Task in-progress status synced",
        //   data: { taskId, requestData },
        //   timestamp: new Date(),
        //   type: NotificationTypeEnum.OPERATION_SUCCESS,
        //   level: 'success'
        // });
      }, 1000);
  
    } catch (error) {
      console.error(`Error in markTaskAsInProgressSuccess for task ${taskId}:`, error);
  
      // Dispatch error action if you have one
      // dispatch(markTaskAsInProgressFailure({ taskId, error }));
  
      notify({
        id: `markTaskAsInProgressError-${taskId}-${Date.now()}`,
        message: NOTIFICATION_MESSAGES.Error.DEFAULT,
        data: {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: `Error marking task ${taskId} as in progress`,
            taskId,
            requestData
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
    }
  };

  const markTaskPending = (taskId: string) => async (dispatch: any) => {
    try {
      // Update task status to pending
      // Assuming setTasks is a local state updater
      setTasks((prevTasks) => {
        const updatedTasks = { ...prevTasks };
        const taskToUpdate = updatedTasks[taskId];
        if (taskToUpdate) {
          taskToUpdate[0].status = "pending";
        }
        return updatedTasks;
      });
    } catch (err) {
      console.error(`Error marking task ${taskId} as pending`, err);
    }
    dispatch(markTaskAsPendingSuccess(Number(taskId)));
    const { markTaskPending } = useApiManagerSlice.actions;
    markTaskPending({ id: String(taskId) });
    // Simulating asynchronous operation
    setTimeout((error: Error) => {
      notify(
        "taskPendingError",
        `Error marking task ${taskId} as pending`,
        NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
        new Date(),
        NotificationTypeEnum.OPERATION_SUCCESS
      );
    }, 1000);
    // Dispatch the asynchronous action (no need to await)
    markTaskPending({ id: taskId });
  };

  const markTaskAsPendingSuccess = (taskId: number) => {
    console.log("Marking task as pending success");
    // You can add additional logic or trigger notifications as needed
    useTaskManagerStore.markTaskAsPendingSuccess(taskId);
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  };
  // Function to set a dynamic notification message
  const setDynamicNotificationMessage = (message: string) => {
    setNotificationMessage(message);
  };

  // Add more methods or properties as needed

  const useTaskManagerStore = makeAutoObservable({
    tasks,
    taskTitle,
    taskDescription,
    taskStatus,
    assignedTaskStore,
    updateTaskDueDate,
    updateTaskTitle,
    updateTaskDescription,
    updateTaskStatus,
    addTask,
    addTasks,
    assignTaskToUser,
    dispatch,
    removeTask,
    removeTasks,
    reassignTask,
    addTaskSuccess,
    fetchTasksSuccess,
    fetchTasksFailure,
    fetchTasksRequest,
    completeAllTasksSuccess,
    completeTask,
    completeAllTasks,
    completeAllTasksFailure,

    NOTIFICATION_MESSAGE,
    NOTIFICATION_MESSAGES,
    setDynamicNotificationMessage,
    addTaskFailure,
    takeTaskSnapshot,
    batchFetchTaskSnapshotsRequest,
    batchFetchTaskSnapshotsSuccess,
    batchFetchUserSnapshotsRequest,
    fetchTasksByTask,
    fetchTasksByTaskIdFailure,
    markTaskPending,
    markTaskAsComplete,
    markTaskAsInProgress,

    markTaskAsPendingSuccess,
    fetchTasksByTaskId,

    updateTaskAssignee,
    getTasksByAssignee,
    getTaskById,
    sortByDueDate,
    exportTasksToCSV,
    updateTaskPriority,
    filterTasksByStatus,
    getTaskCountByStatus,
    updateTaskPositionSuccess,
    clearAllTasks,
    archiveCompletedTasks,
  });

  return useTaskManagerStore;
};

export { useTaskManagerStore };
  
  

  
  

  
  
  
  async function addToSnapshotList(
  snapshot: SnapshotStore<any>,
  subscribers: Subscriber<Data | CustomSnapshotData>[]): Promise<void> {
  
  const initialStoreId = useSecureStoreId()
    
  // Add the snapshot to the SnapshotManager
  (await  useSnapshotManager(initialStoreId)).addSnapshot(snapshot);
   }

function tasksDataSourceToCSV(tasksDataSource: Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) {
  throw new Error('Function not implemented.');
}

function notify(arg0: string, arg1: string, DEFAULT: string, arg3: Date, OperationSuccess: NotificationTypeEnum) {
  throw new Error('Function not implemented.');
}

function setTasks(arg0: (prevTasks: any) => any) {
  throw new Error('Function not implemented.');
}

function setNotificationMessage(message: string) {
  throw new Error('Function not implemented.');
}

