//TaskManagerStore.tsx
import { generateNewTask } from "@/app/generators/GenerateNewTask";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { Data } from "../../models/data/Data";
import { Task } from "../../models/tasks/Task";
import { NotificationType, useNotification } from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { TaskActions } from "../../tasks/TaskActions";
import { useApiManagerSlice } from "../redux/slices/ApiSlice";
import { AssignTaskStore, useAssignTaskStore } from "./AssignTaskStore";
import SnapshotStore, { SnapshotStoreConfig } from "./SnapshotStore";

export interface TaskManagerStore {
  tasks: Record<string, Task[]>;
  taskTitle: string;
  taskDescription: string;
  taskStatus: "pending" | "inProgress" | "completed";
  assignedTaskStore: AssignTaskStore;
  updateTaskTitle: (title: string) => void;
  updateTaskDescription: (description: string) => void;
  updateTaskStatus: (status: "pending" | "inProgress" | "completed") => void;
  updateTaskDueDate: (taskId: string, dueDate: Date) => void;
  addTaskSuccess: (payload: { task: Task }) => void;
  addTask: (task: Task) => void;
  addTasks: (tasks: Task[]) => void;
  removeTask: (taskId: string) => void;
  removeTasks: (taskIds: string[]) => void;
  fetchTasksSuccess: (payload: { tasks: Task[] }) => void;
  fetchTasksFailure: (payload: { error: string }) => void;
  fetchTasksRequest: () => void;
  completeAllTasksSuccess: () => void;
  completeAllTasks: () => void;
  completeAllTasksFailure: (payload: { error: string }) => void;
  NOTIFICATION_MESSAGE: string;
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES;
  setDynamicNotificationMessage: (message: string) => void;
  snapshotStore: SnapshotStore<Record<string, Task[]>>; // Include a SnapshotStore for tasks
  takeTaskSnapshot: (taskId: string) => void;
  markTaskAsComplete: (taskId: string) => void;
  // Add more methods or properties as needed
  batchFetchSnapshotsRequest: (snapshotData: Record<string, Task[]>) => void;
}

const useTaskManagerStore = (): TaskManagerStore => {
  const { notify } = useNotification();
  const { markTaskAsCompleteSuccess, markTaskAsCompleteFailure } = TaskActions; // Update import

  const [tasks, setTasks] = useState<Record<string, Task[]>>({
    pending: [],
    inProgress: [],
    completed: [],
  });
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [taskStatus, setTaskStatus] = useState<
    "pending" | "inProgress" | "completed"
  >("pending");
  const [NOTIFICATION_MESSAGE, setNotificationMessage] = useState<string>(""); // Initialize it with an empty string

  // Include the AssignTaskStore
  const assignedTaskStore = useAssignTaskStore();
  // Initialize SnapshotStore

  const snapshotStore = new SnapshotStore(
    {} as SnapshotStoreConfig<Record<string, Task[]>>
  );

  // Method to reassign a task to a new user
  const reassignTask = (
    taskId: string,
    oldUserId: string,
    newUserId: string
  ) => {
    assignedTaskStore.reassignUser(taskId, oldUserId, newUserId);
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT
    );
  };

  const updateTaskTitle = (title: string) => {
    setTaskTitle(title);
  };

  const updateTaskDescription = (description: string) => {
    setTaskDescription(description);
  };

  const updateTaskStatus = (status: "pending" | "inProgress" | "completed") => {
    setTaskStatus(status);
  };

  const addTaskSuccess = (payload: { task: Task }) => {
    const { task } = payload;
    setTasks((prevTasks) => {
      const taskId = task.id;
      return { ...prevTasks, [taskId]: [...(prevTasks[taskId] || []), task] };
    });
  };

  const takeTaskSnapshot = (taskId: string) => {
    // Ensure the taskId exists in the tasks
    if (!tasks[taskId]) {
      console.error(`Task with ID ${taskId} does not exist.`);
      return;
    }

    // Create a snapshot of the current tasks for the specified taskId
    const taskSnapshot = { [taskId]: [...tasks[taskId]] };

    // Store the snapshot in the SnapshotStore
    snapshotStore.takeSnapshot(taskSnapshot as unknown as Data);
  };

  const addTask = () => {
    // Ensure the title is not empty before adding a task
    if (taskTitle.trim().length === 0) {
      console.error("Task title cannot be empty.");
      return;
    }

    const newTask = generateNewTask();

    // Ensure the title is not empty before adding a task
    if (taskTitle.trim().length === 0) {
      console.error("Task title cannot be empty.");
      return;
    }

    newTask.then((task) => {
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

  const batchFetchSnapshotsRequest = (
    snapshotData: Record<string, Task[]>
  ): void => {
    const snapshots = Object.values(snapshotData);

    snapshots.forEach(async (snapshot) => {
      const taskId = Object.keys(snapshot)[0];
      const tasks = Object.values(snapshot)[0];

      setTasks((prevTasks) => {
        return {
          ...prevTasks,
          [taskId]: [...(prevTasks[taskId] || []), ...tasks],
        };
      });
    });
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
    setDynamicNotificationMessage(
      NOTIFICATION_MESSAGES.DataLoading.PAGE_LOADING
    );
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

      const { markTaskComplete } = useApiManagerSlice.actions;

      // Dispatch the asynchronous action (no need to await)
      markTaskComplete(taskId as unknown as number);

      // Simulating asynchronous operation
      setTimeout((error) => {
        notify(
          error as NotificationType,
          NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
      }, 1000);
    } catch (error) {
      console.error(`Error marking task ${taskId} as complete`, error);

      dispatch(markTaskAsCompleteFailure({ taskId: "taskId", error: "error" })),
      notify(
        error as NotificationType,
        NOTIFICATION_MESSAGES.Error.DEFAULT("Error marking task as complete")),
        "Error"
          }
  };
  // Function to set a dynamic notification message
  const setDynamicNotificationMessage = (message: string) => {
    setNotificationMessage(message);
  };

  // Add more methods or properties as needed

  const useTaskManagerStore=  makeAutoObservable({
    tasks,
    ...tasks,
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
    removeTask,
    removeTasks,
    reassignTask,
    addTaskSuccess,
    fetchTasksSuccess,
    fetchTasksFailure,
    fetchTasksRequest,
    completeAllTasksSuccess,
    completeAllTasks,
    completeAllTasksFailure,
    NOTIFICATION_MESSAGE,
    NOTIFICATION_MESSAGES,
    setDynamicNotificationMessage,
    markTaskAsComplete,
    addTaskFailure,
    snapshotStore,
    takeTaskSnapshot,
    batchFetchSnapshotsRequest,
  });

  return useTaskManagerStore
};

export { useTaskManagerStore };
