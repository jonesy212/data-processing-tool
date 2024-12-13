//TaskManagerStore.tsx
import { addSnapshot } from '@/app/api/SnapshotApi';
import { saveAs } from '@/app/components/documents/editing/autosave';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { generateNewTask } from "@/app/generators/GenerateNewTask";
import { makeAutoObservable } from "mobx";
import { title } from 'process';
import { useState } from "react";
import FilterTasksRequest from "../../../pages/searchs/FilterTasksRequest";
import { TaskActions } from '../../actions/TaskActions';
import useApiManager from "../../hooks/dynamicHooks/useApiManager";
import { useSnapshotManager } from "../../hooks/useSnapshotManager";
import { BaseData, Data } from "../../models/data/Data";
import { PriorityTypeEnum, TaskStatus } from "../../models/data/StatusType";
import { Task, tasksDataSource } from "../../models/tasks/Task";
import { CustomSnapshotData, Snapshot } from '../../snapshots/LocalStorageSnapshotStore';
import { updateSnapshot } from '../../snapshots/snapshotHandlers';
import SnapshotStore from "../../snapshots/SnapshotStore";
import { useSnapshotStore } from '../../snapshots/useSnapshotStore';
import {
    NotificationTypeEnum,
    useNotification,
} from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { taskService } from "../../tasks/TaskService";
import { Todo } from "../../todos/Todo";
import { Subscriber } from '../../users/Subscriber';
import { User } from "../../users/User";
import useSecureStoreId from '../../utils/useSecureStoreId';
import { useApiManagerSlice } from "../redux/slices/ApiSlice";
import { clearSnapshots, removeSnapshot } from '../redux/slices/SnapshotSlice';
import { useTaskManagerSlice } from "../redux/slices/TaskSlice";
import { AssignTaskStore, useAssignTaskStore } from "./AssignTaskStore";

export interface TaskManagerStore {
  tasks: Record<string, Task[]>;
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
    status: "pending" | "inProgress" | "completed"
  ) => Task[];
  getTaskCountByStatus: (
    status: "pending" | "inProgress" | "completed"
  ) => number;
  clearAllTasks: () => void;
  archiveCompletedTasks: () => void;
  updateTaskAssignee: (
    taskId: string,
    assignee: User
  ) => (dispatch: any) => Promise<void>;
  getTasksByAssignee: (tasks: Task[], assignee: User) => Promise<Task[]>;
  getTaskById: (taskId: string) => Task | null;
  sortByDueDate: () => void;
  exportTasksToCSV: () => void;

  // Define dispatch function
  dispatch: (action: any) => void;
  addTaskSuccess: (payload: { task: Task }) => void;
  addTask: (task: Task) => void;
  addTasks: (tasks: Task[]) => void;

  assignTaskToUser: (taskId: string, userId: string) => void;
  removeTask: (taskId: string) => void;
  removeTasks: (taskIds: string[]) => void;
  fetchTasksByTaskId: (taskId: string) => Promise<string>;
  fetchTasksSuccess: (payload: { tasks: Task[] }) => void;
  fetchTasksFailure: (payload: { error: string }) => void;
  fetchTasksRequest: () => void;
  completeAllTasksSuccess: (success: string) => void;
  completeAllTasks: (payload: { task: Task[] }) => void;
  completeAllTasksFailure: (payload: { error: string }) => void;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
   setDynamicNotificationMessage: (message: Message, type: NotificationType) => void;
  takeTaskSnapshot: (taskId: string) => void;
  markTaskAsComplete: (taskId: string) => void;

  updateTaskPositionSuccess: (payload: { task: Task }) => void;
  // Add more methods or properties as needed
  batchFetchTaskSnapshotsRequest: (
    snapshotData: Record<string, Task[]>
  ) => void;
  batchFetchTaskSnapshotsSuccess: (taskId:  Record<string, Task[]>) => void;
  batchFetchUserSnapshotsRequest: (
    snapshotData: Record<string, User[]>
  ) => void


}

const useTaskManagerStore = (): TaskManagerStore => {
  const { notify } = useNotification();
  const { markTaskAsCompleteSuccess, markTaskAsCompleteFailure, setAssignedTaskStore } = TaskActions;
  const assignTaskToUser = useApiManager();
  const [tasks, setTasks] = useState<Record<string, Task[]>>({
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

  const initSnapshot = {} as Snapshot<Data, Data>;

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
    

    const reassignedTasks = ["task1", "task2", "task3"];

    const taskSnapshotStore: Promise<SnapshotStore<Snapshot<Task>>> = useSnapshotStore(addToSnapshotList);
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
  const reassignedTasks =
    (assignedTaskStore[taskId] as Task[])?.map((task) => {
      if (task.userId === oldUserId) {
        return { ...task, userId: newUserId };
      }
      return task;
    }) || [];

  setAssignedTaskStore({
    ...assignedTaskStore,
    [taskId]: reassignedTasks,
    task: undefined,
    assignee: "",
  });

  setDynamicNotificationMessage(
    NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
  );
};

    const reassignUser = (
      taskId: string,
      oldUserId: string,
      newUserId: string
    ) => {
      const reassignedTasks = assignedTaskStore[taskId]?.map((task: Task) => {
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

    const updateTaskTitle = (title: string) => {
      setTaskTitle(title);
    };

    const updateTaskDescription = (description: string) => {
      setTaskDescription(description);
    };

    const updateTaskStatus = (
      status: TaskStatus
    ) => {
      setTaskStatus(status);
    };
  };

  const addTaskSuccess = (payload: { task: Task }) => {
    const { task } = payload;
    setTasks((prevTasks) => {
      const taskId = task.id;
      return { ...prevTasks, [taskId]: [...(prevTasks[taskId] || []), task] };
    });
  };

  const takeTaskSnapshot = async <
    T extends BaseData<any>,
    K extends T = T,
    Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
  >(taskId: string, storeId?: number) => {
    // Ensure the taskId exists in the tasks
    if (!tasks[taskId]) {
      console.error(`Task with ID ${taskId} does not exist.`);
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

  const addTask = (task: Task) => {
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

    newTask.then((task: Task) => {
      setTasks((prevTasks) => {
        const taskId = task.id;
        return { ...prevTasks, [taskId]: [...(prevTasks[taskId] || []), task] };
      });
    });

    // Reset input fields after adding a task
    setTaskTitle("");
    setTaskDescription("");
    setTaskStatus("pending");
  };

  const removeTask = (taskId: string) => {
    setTasks((prevTasks: Record<string, Task[]>) => {
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

  const reassignTask = (
    taskId: string,
    oldUserId: string,
    newUserId: string
  ) => {
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
    // Update the task
    const updatedTask = { ...tasks[taskId][0], assignedUserId: newUserId };
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      updatedTasks[taskId] = [updatedTask];
      return updatedTasks;
    });
  };

  const addTasks = (tasksToAdd: Task[]) => {
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

  const fetchTasksSuccess = (payload: { tasks: Task[] }) => {
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
      (task: Task) => task.id === taskId
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

  const updateTaskDescription = (description: string, taskId: string) => {
    updateTaskDescription(description, taskId);
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
      setTasks((prevTasks: Record<string, Task[]>) => {
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
      setTimeout((error: Error) => {
        notify(
          "markTaskAsCompleteFailure",
          `Error marking task ${taskId} as complete`,
          NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      }, 1000);
    } catch (error) {
      console.error(`Error marking task ${taskId} as complete`, error);

      dispatch(markTaskAsCompleteFailure({ taskId: "taskId", error: "error" })),
        notify(
          "markTaskAsCompleteFailure",
          `Error marking task ${taskId} as complete`,
          NOTIFICATION_MESSAGES.Error.DEFAULT,
          new Date(new Date().getTime()),
          NotificationTypeEnum.OperationError
        );
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
          NotificationTypeEnum.OperationSuccess
        );
      }, 1000);
    };



  // Function to fetch a task by its ID
  const getTaskById = (taskId: string): Promise<Task | null> => {
    return new Promise<Task | null>(async (resolve, reject) => {
      try {
        setTimeout(() => {
          const task: Task | undefined = tasksDataSource[taskId];
  
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
  

  const sortByDueDate = (tasks: Task[]) => {
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
      // Simulating asynchronous operation
      setTimeout(() => {
        notify(
          "updateTaskPriorityFailure",
          `Error updating priority for task ${taskId}`,
          NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      }, 1000);
    } catch (error) {
      console.error(`Error updating priority for task ${taskId}`, error);

      dispatch(
        TaskActions.updateTaskPriorityFailure({
          taskId,
          error: error.message,
        })
      ),
        notify(
          "updateTaskPriorityFailure",
          `Error updating priority for task ${taskId}`,
          NOTIFICATION_MESSAGES.Error.DEFAULT,
          new Date(),
          NotificationTypeEnum.OperationError
        );
    }
  };



  const filterTasksByStatus = (status: TaskStatus) => {
    return tasksDataSource.filter((task: Task) => task.status === status);
  }
  const updateTaskAssignee =
    (taskId: string, assignee: User) => async (dispatch: any) => {
      try {
        // Update task assignee
        // Assuming setTasks is a local state updater
        setTasks((prevTasks) => {
          const updatedTasks = { ...prevTasks };
          const taskToUpdate = updatedTasks[taskId];
          if (taskToUpdate) {
            taskToUpdate[0].assignee = assignee;
          }
          return updatedTasks;
        });
      } catch (err) {
        console.error(`Error updating task ${taskId} assignee`, err);
      }

      // Dispatch the synchronous action immediately
      dispatch(updateTaskAssigneeSuccess(taskId, assignee));
      updateTaskAssignee(taskId, assignee);

      // Simulating asynchronous operation
      setTimeout((error: Error) => {
        notify(
          "updateTaskAssigneeFailure",
          `Error updating task ${taskId} assignee`,
          NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      }, 1000);
    };

  // Define an index signature for taskCountByStatus
  const taskCountByStatus: { [key: string]: number } = {};

  const getTaskCountByStatus = async (tasks: Task[]) => {
    try {
      const statuses = Object.keys(TaskStatus);
      for (const status of statuses) {
        taskCountByStatus[status] = tasks.filter(
          (task: Task) => task.status === status
        ).length;
      }
      // Simulating asynchronous operation
      setTimeout(() => {
        notify(
          "getTaskCountByStatusFailure",
          `Error getting task count by status`,
          NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      }, 1000);

      return taskCountByStatus;
    } catch (error) {
      console.error(`Error getting task count by status`, error);
      notify(
        "getTaskCountByStatusFailure",
        `Error getting task count by status`,
        NOTIFICATION_MESSAGES.Error.DEFAULT,
        new Date(),
        NotificationTypeEnum.OperationError
      );
    }
  };

  const updateTaskPositionSuccess = async (payload: { taskId: string }) => {
    const { taskId } = payload;
    // Assuming getTaskById is asynchronous and returns a promise
    const task = await getTaskById(taskId);
    if (task) {
      const { status } = task; // Access status property directly
      const taskList = tasks[status];
      const taskIndex = taskList.findIndex((t) => t.id === taskId);
      const updatedTaskList = [
        ...taskList.slice(0, taskIndex),
        task,
        ...taskList.slice(taskIndex + 1),
      ];
      setTasks({
        ...tasks,
        [status]: updatedTaskList
      })
    }
  }


  const clearAllTasks = () => {
    setTasks({});
  };

  const archiveCompletedTasks = () => {
    try {
      // Convert tasksDataSource to an array
      const tasksArray = Object.values(tasksDataSource);
      
      // Filter completed tasks
      const completedTasks = tasksArray.filter(
        (task: Task) => task.status === TaskStatus.Completed
      );
  
      // Create a new tasksDataSource excluding completed tasks
      const updatedTasks = tasksArray.reduce((acc, task) => {
        if (task.status !== TaskStatus.Completed) {
          acc[task.id] = task;
        }
        return acc;
      }, {} as Record<string, Task>);
  
      // Simulate updating the state with the new tasks object
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error archiving completed tasks", error);
    }
  };
  

  const getTasksByAssignee = async (tasks: Task[], assignee: User) => {
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
      Object.values(snapshotData).forEach((tasks: T[], index: number) => {
        tasks.forEach((task: T) => {
          // Create a snapshot for each task
          const snapshot: Snapshot<Omit<T, "id">> = {
            data: task,
            timestamp: new Date(),
            category: "task",
          };

          // Add the snapshot to the SnapshotManager
          useSnapshotManager().addSnapshot(snapshot);
        });
      });

      // Resolve with a message indicating success
      resolve("Batch fetch task snapshots completed successfully.");
    });
  };

  const batchFetchTaskSnapshotsSuccess =
    async (taskId: Promise<string>) => async (dispatch: any) => {
      console.log(`Task ${taskId} fetched`);
      notify(
        "batchFetchTaskSnapshotsFailure",
        `Task ${taskId} fetched`,
        NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );

      // Assuming you have a method to fetch tasks by taskId from your data source
      const tasks = fetchTasksByTaskId(await taskId); // Implement this method

      // Check if tasks is not null or undefined
      if (tasks) {
        // Dispatch the fetched tasks to the store or perform any necessary logic
        dispatch(batchFetchTaskSnapshotsSuccess(tasks));

        // Simulating asynchronous operation
        setTimeout((error: Error) => {
          notify(
            "batchFetchTaskSnapshotsFailure",
            `Error fetching task ${taskId}`,
            NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
            new Date(),
            NotificationTypeEnum.OperationSuccess
          );
        }, 1000);
      } else {
        console.error(`Tasks not found for taskId ${taskId}`);
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

 
  const markTaskAsInProgressSuccess =
    (taskId: string, requestData: string) => (dispatch: any) => {
      console.log(`Task ${taskId} marked as in progress`);
      notify(
        "markTaskAsInProgressSuccess",
        `Task ${taskId} marked as in progress`,
        NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
      dispatch(markTaskAsInProgressSuccess(taskId, requestData));
      const { markTaskAsInProgress } = taskService;
      markTaskAsInProgress(taskId, requestData);
      // Simulating asynchronous operation
      setTimeout((error: Error) => {
        notify(
          "markTaskAsInProgressFailure",
          `Error marking task ${taskId} as in progress`,
          NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      }, 1000);
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
        NotificationTypeEnum.OperationSuccess
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
  }
  );


  return useTaskManagerStore;
};

export { useTaskManagerStore };
  
  

  
  

  
  
  
  async function addToSnapshotList(
  snapshot: SnapshotStore<any>,
  subscribers: Subscriber<Data | CustomSnapshotData>[]): Promise<void> {
  // Add the snapshot to the SnapshotManager
  (await  useSnapshotManager()).addSnapshot(snapshot);
   }

function tasksDataSourceToCSV(tasksDataSource: Record<string, Task>) {
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

