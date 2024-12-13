import { handleApiError } from '@/app/api/ApiLogs';
import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Dispatch } from '@reduxjs/toolkit';
import { AxiosError, AxiosResponse } from 'axios';
import { TaskHistoryEntry } from '../components/interfaces/history/TaskHistoryEntry';
import { Task } from '../components/models/tasks/Task';
import { historyManagerStore } from '../components/state/stores/HistoryStore';
import { useTaskManagerStore } from '../components/state/stores/TaskStore ';
import { NotificationType, useNotification } from '../components/support/NotificationContext';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

// Define the API base URL
const API_BASE_URL = endpoints.tasks.list;


interface TaskNotificationMessages {
  FETCH_TASKS_SUCCESS: string;
  FETCH_TASKS_ERROR: string;
  ADD_TASK_SUCCESS: string;
  ADD_TASK_ERROR: string;
  REMOVE_TASK_SUCCESS: string;
  REMOVE_TASK_ERROR: string;
  TOGGLE_TASK_SUCCESS: string;
  TOGGLE_TASK_ERROR: string;
  UPDATE_TASK_SUCCESS: string;
  UPDATE_TASK_ERROR: string;
  COMPLETE_ALL_TASKS_SUCCESS: string;
  COMPLETE_ALL_TASKS_ERROR: string;
  ASSIGN_TASK_TO_TEAM_SUCCESS: string;
  ASSIGN_TASK_TO_TEAM_ERROR: string;
  UNASSIGN_TASK_SUCCESS: string;
  UNASSIGN_TASK_ERROR: string;
  BULK_UNASSIGN_TASKS_ERROR: string;
  FETCH_TASK_ERROR: string;
  CREATE_TASK_ERROR: string;
  DELETE_TASK_ERROR: string;
  BULK_ASSIGN_TASKS_ERROR: string;
  BULK_ASSIGN_TODOS_ERROR: string;
  BULK_UNASSIGN_TODOS_ERROR: string;
  FETCH_TASK_HISTORY_ERROR: string;
  FETCH_TASKS_BY_USER_ERROR: string;
  FETCH_UPDATED_TASK_ERROR: string;

  // Add more keys as needed
}

// Define API notification messages for tasks
const taskApiNotificationMessages: TaskNotificationMessages = {
  FETCH_TASKS_SUCCESS: 'Tasks fetched successfully.',
  FETCH_TASKS_ERROR: 'Failed to fetch tasks.',
  ADD_TASK_SUCCESS: 'Task added successfully.',
  ADD_TASK_ERROR: 'Failed to add task.',
  REMOVE_TASK_SUCCESS: 'Task removed successfully.',
  REMOVE_TASK_ERROR: 'Failed to remove task.',
  TOGGLE_TASK_SUCCESS: 'Task toggled successfully.',
  TOGGLE_TASK_ERROR: 'Failed to toggle task.',
  UPDATE_TASK_SUCCESS: 'Task updated successfully.',
  UPDATE_TASK_ERROR: 'Failed to update task.',
  COMPLETE_ALL_TASKS_SUCCESS: 'All tasks completed successfully.',
  COMPLETE_ALL_TASKS_ERROR: 'Failed to complete all tasks.',
  ASSIGN_TASK_TO_TEAM_SUCCESS: 'Task assigned to team successfully.',
  ASSIGN_TASK_TO_TEAM_ERROR: 'Failed to assign task to team.',
  UNASSIGN_TASK_SUCCESS: 'Task unassigned successfully.',
  UNASSIGN_TASK_ERROR: 'Failed to unassign task.',
  BULK_UNASSIGN_TASKS_ERROR: 'Failed to bulk unassign tasks.',
  FETCH_TASK_ERROR: 'Failed to fetch task.',
  CREATE_TASK_ERROR: 'Failed to create task.',
  DELETE_TASK_ERROR: 'Failed to delete task.',
  BULK_ASSIGN_TASKS_ERROR: 'Failed to bulk assign tasks.',
  BULK_ASSIGN_TODOS_ERROR: 'Failed to bulk assign todos',
  BULK_UNASSIGN_TODOS_ERROR: 'Failed to bulk unassign todos',
  FETCH_TASK_HISTORY_ERROR: 'Failed to fetch task history',
  FETCH_TASKS_BY_USER_ERROR: 'Failed to fetch tasks by user',
  FETCH_UPDATED_TASK_ERROR: 'Failed to fetch updated task',
  // Add more properties as needed
};

type TaskApiNotificationKeys = keyof typeof taskApiNotificationMessages

// Function to handle API errors and notify for tasks
const handleTaskApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: TaskApiNotificationKeys
) => {
  handleApiError(error, errorMessage);
 
  if (errorMessageId && taskApiNotificationMessages.hasOwnProperty(errorMessageId)) {
    const errorMessageText = taskApiNotificationMessages[errorMessageId];
    // Notify the error message
    useNotification().notify(
      errorMessageId,
      errorMessageText,
      null,
      new Date(),
      "ApiClientError" as NotificationType
    );
  };
}



const fetchTasks = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(): Promise<Task<T, K>[]> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}`);
    return response.data.tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to fetch tasks',
      'FETCH_TASKS_ERROR'
    );
    throw error;
  }
};


const updateTaskPositionSuccess = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(task: Task<T, K>) => {
  return {
    type: 'UPDATE_TASK_POSITION_SUCCESS',
    payload: {
      task,
    },
  };
};


const updateTaskPosition = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(taskId: string, newPosition: number, dispatch: Dispatch, notify: () => void): Promise<void> => {
  try {
    const updateTaskEndpoint = `${API_BASE_URL}/updatePosition`; // Adjust the API endpoint according to your project's API structure
    const response: AxiosResponse<Task<T, K>> = await axiosInstance.post(updateTaskEndpoint, { task: taskId, position: newPosition });

    const updatedTask: Task<T, K> = response.data;

    // Update task in task manager store (if applicable)
    const taskManagerStore = useTaskManagerStore(); // Ensure this hook is correctly used
    taskManagerStore.updateTaskPositionSuccess({ task: updatedTask });

    // Dispatch an action to update the task's position in the Redux state
    dispatch(updateTaskPositionSuccess(updatedTask));

    // Notify the success message
    useNotification().notify(
      'UPDATE_TASK_SUCCESS',
      taskApiNotificationMessages.UPDATE_TASK_SUCCESS,
      null,
      new Date(),
      "ApiClientSuccess" as NotificationType
    );

    // Notify the caller (if needed)
    notify();
  } catch (error) {
    console.error('Error updating task position:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to update task position',
      'UPDATE_TASK_ERROR'
    );
    throw error; // Rethrow the error for further handling
  }
};

const addTask = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(newTask: Omit<Task<T, K>, 'id'>): Promise<void> => {
  try {
    const addTaskEndpoint = `${API_BASE_URL}.add`;
    const response = await axiosInstance.post(addTaskEndpoint, newTask);

    if (response.status === 200 || response.status === 201) {
      const taskManagerStore = useTaskManagerStore();
      taskManagerStore.addTaskSuccess({ task: response.data });
    } else {
      console.error('Failed to add task:', response.statusText);
    }
  } catch (error) {
    console.error('Error adding task:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to add task',
      'ADD_TASK_ERROR'
    );
    throw error;
  }
};
const removeTask = async (taskId: number): Promise<void> => {
  try {
    const removeTaskEndpoint = `${API_BASE_URL}.remove.${taskId}`;
    const response = await axiosInstance.delete(removeTaskEndpoint);

    if (response.status === 200 || response.status === 204) {
      // Successfully removed the task
    } else {
      console.error('Failed to remove task:', response.statusText);
    }
  } catch (error) {
    console.error('Error removing task:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to remove task',
      'REMOVE_TASK_ERROR'
    );
    throw error;
  }
};

const toggleTask = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(taskId: number): Promise<Task<T, K> | void> => {
  return new Promise<Task<T, K> | void>(async (resolve, reject) => {
    try {
      const toggleTaskEndpoint = `${API_BASE_URL}.toggle.${taskId}`;
      const response = await axiosInstance.put(toggleTaskEndpoint);

      response.data ? resolve(response.data) : resolve(); // Return task data if present, else resolve
      return response.data;
    } catch (error) {
      console.error('Error toggling task:', error);
      handleTaskApiErrorAndNotify(
        error as AxiosError<unknown>,
        'Failed to toggle task',
        'TOGGLE_TASK_ERROR'
      );
      reject(error)
      throw error;
    }
  })
};

const updateTask = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(taskId: number, newTitle: string): Promise<Task<T, K> | void> => {
  return new Promise<Task<T, K> | void>(async (resolve, reject) => {
    try {
      const updateTaskEndpoint = `${API_BASE_URL}.update.${taskId}`;
      const response = await axiosInstance.put(updateTaskEndpoint, { title: newTitle });

      response.data ? resolve(response.data) : resolve(); // Return task data if present, else resolve

      return response.data;

    } catch (error) {
      console.error('Error updating task:', error);
      handleTaskApiErrorAndNotify(
        error as AxiosError<unknown>,
        'Failed to update task',
        'UPDATE_TASK_ERROR'
      );
      reject(error)
      throw error;
    }
  })
};

const completeAllTasks = async (): Promise<void> => {
  try {
    const completeAllTasksEndpoint = `${API_BASE_URL}.completeAll`;
    await axiosInstance.post(completeAllTasksEndpoint);
  } catch (error) {
    console.error('Error completing all tasks:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to complete all tasks',
      'COMPLETE_ALL_TASKS_ERROR'
    );
    throw error;
  }
};

const assignTaskToTeam = async (taskId: number, teamId: number): Promise<void> => {
  try {
    const assignTaskToTeamEndpoint = `${API_BASE_URL}.assign.${taskId}.${teamId}`;
    await axiosInstance.post(assignTaskToTeamEndpoint);
  } catch (error) {
    console.error('Error assigning task to team:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to assign task to team',
      'ASSIGN_TASK_TO_TEAM_ERROR'
    );
    throw error;
  }
};


// Assuming getTaskHistoryFromDatabase is a function to fetch task history from the database
const getTaskHistoryFromDatabase = async (taskId: string) => {
  try {
    // Call your API endpoint to fetch task history based on taskId
    const response = await fetch(`/api/tasks/${taskId}/history`);
    if (!response.ok) {
      throw new Error('Failed to fetch task history');
    }
    const historyData = await response.json();
    return historyData;
  } catch (error) {
    console.error('Error fetching task history:', error);
    // Handle error as needed
    return [];
  }
};

const unassignTask = async (taskId: number): Promise<void> => {
  try {
    const unassignTaskEndpoint = `${API_BASE_URL}.unassign.${taskId}`;
    await axiosInstance.post(unassignTaskEndpoint);
  } catch (error) {
    console.error('Error unassigning task:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to unassign task',
      'UNASSIGN_TASK_ERROR'
    );
    throw error;
  }
};


const fetchTaskData = <
  T extends  BaseData<any>, 
  K extends T = T
>(taskId: number): Promise<Task<T, K> | void> => {
  return new Promise<Task<T, K> | void>(async (resolve, reject) => {
    try {
      const fetchTaskEndpoint = `${API_BASE_URL}.get.${taskId}`;
      const response = await axiosInstance.get<Task<T, K>>(fetchTaskEndpoint); // Added type annotation for response

      // Perform any necessary processing here

      response.data ? resolve(response.data) : resolve(); // Return task data if present, else resolve
    } catch (error) {
      console.error('Error fetching task:', error);
      handleTaskApiErrorAndNotify(
        error as AxiosError<unknown>,
        'Failed to fetch task',
        'FETCH_TASK_ERROR'
      );
      reject(error); // Reject the promise if an error occurs
    }
  });
};


const createTask = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(newTask: Task<T, K>): Promise<Task<T, K> | void> => {
  return new Promise<Task<T, K> | void>(async (resolve, reject) => {

    try {
      const createTaskEndpoint = `${API_BASE_URL}.add`;
      const response = await axiosInstance.post(createTaskEndpoint, newTask);

      response.data ? resolve(response.data) : resolve();

      return response.data;
    } catch (error) {
      console.error("Error creating task:", error);
      handleTaskApiErrorAndNotify(
        error as AxiosError<unknown>,
        "Failed to create task",
        "CREATE_TASK_ERROR"
      );

      reject(error)
      throw error;
    }
  })
}


const deleteTask = async (taskId: number): Promise<void> => {
  try {
    const deleteTaskEndpoint = `${API_BASE_URL}.delete.${taskId}`;
    await axiosInstance.delete(deleteTaskEndpoint);
  } catch (error) {
    console.error('Error deleting task:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to delete task',
      'DELETE_TASK_ERROR'
    );
    throw error;
  }
};

const bulkAssignTasks = async (taskIds: number[], teamId: number): Promise<void> => {
  try {
    const bulkAssignTasksEndpoint = `${API_BASE_URL}.bulkAssign`;
    await axiosInstance.post(bulkAssignTasksEndpoint, { taskIds, teamId });
  } catch (error) {
    console.error('Error bulk assigning tasks:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to bulk assign tasks',
      'BULK_ASSIGN_TASKS_ERROR'
    );
    throw error;
  }
};

const bulkUnassignTasks = async (taskIds: number[]): Promise<void> => {
  try {
    const bulkUnassignTasksEndpoint = `${API_BASE_URL}.bulkUnassign`;
    await axiosInstance.post(bulkUnassignTasksEndpoint, { taskIds });
  } catch (error) {
    console.error('Error bulk unassigning tasks:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to bulk unassign tasks',
      'BULK_UNASSIGN_TASKS_ERROR'
    );
    throw error;
  }
};

// For todos
const bulkAssignTodos = async (todoIds: number[], teamId: number): Promise<void> => {
  try {
    const bulkAssignTodosEndpoint = `${API_BASE_URL}.bulkAssignTodos`;
    await axiosInstance.post(bulkAssignTodosEndpoint, { todoIds, teamId });
  } catch (error) {
    console.error('Error bulk assigning todos:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to bulk assign todos',
      'BULK_ASSIGN_TODOS_ERROR'
    );
    throw error;
  }
};

const bulkUnassignTodos = async (todoIds: number[]): Promise<void> => {
  try {
    const bulkUnassignTodosEndpoint = `${API_BASE_URL}.bulkUnassignTodos`;
    await axiosInstance.post(bulkUnassignTodosEndpoint, { todoIds });
  } catch (error) {
    console.error('Error bulk unassigning todos:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to bulk unassign todos',
      'BULK_UNASSIGN_TODOS_ERROR'
    );
    throw error;
  }
};

const getTasksByUserId = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(userId: number): Promise<Task<T, K>[]> => {
  try {
    const getTasksByUserIdEndpoint = `${API_BASE_URL}.getByUser.${userId}`;
    const response = await axiosInstance.get<Task<T, K>[]>(getTasksByUserIdEndpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks by user:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to fetch tasks by user',
      'FETCH_TASKS_BY_USER_ERROR'
    );
    throw error;
  }
}

const getTaskHistory = async (taskId: string): Promise<TaskHistoryEntry[]> => {
  try {
    // Call the corresponding method from TaskHistoryStore to fetch task history entries
    const taskHistoryStoreInstance = historyManagerStore();
    return await taskHistoryStoreInstance.getTaskHistory(Number(taskId));
  } catch (error) {
    console.error('Error fetching task history:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to fetch task history',
      'FETCH_TASK_HISTORY_ERROR'
    );
    throw error;
  }
};

const fetchUsersByTaskApi = async (taskId: string): Promise<string[]> => {
  // Simulate an API call to fetch users by task ID
  return new Promise((resolve) => {
    setTimeout(() => {
      // Example response: simulate fetching user IDs
      const userIds = ['user1', 'user2', 'user3']; // Replace with actual logic
      resolve(userIds);
    }, 1000); // Simulate 1 second delay
  });
};

export {
    addTask, assignTaskToTeam, bulkAssignTasks, bulkAssignTodos, bulkUnassignTasks, bulkUnassignTodos, completeAllTasks, createTask,
    deleteTask, fetchTaskData, fetchTasks, fetchUsersByTaskApi, getTaskHistory, getTaskHistoryFromDatabase, getTasksByUserId, handleTaskApiErrorAndNotify, removeTask,
    toggleTask, unassignTask, updateTask, updateTaskPosition, updateTaskPositionSuccess
};

