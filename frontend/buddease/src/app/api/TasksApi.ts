import { AxiosError } from 'axios';
import dotProp from 'dot-prop';
import { Task } from '../components/models/tasks/Task';
import { useTaskManagerStore } from '../components/state/stores/TaskStore ';
import { handleApiErrorAndNotify } from './ApiData';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

// Define the API base URL
const API_BASE_URL = dotProp.getProperty(endpoints, 'tasks.list');


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
  // Add more properties as needed
};

// Function to handle API errors and notify for tasks
const handleTaskApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: string
) => {
  handleApiErrorAndNotify(error, errorMessage, errorMessageId);
};

export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}`);
    return response.data.tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to fetch tasks',
      'FetchTasksErrorId'
    );
    throw error;
  }
};

export const addTask = async (newTask: Omit<Task, 'id'>): Promise<void> => {
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
      'AddTaskErrorId'
    );
    throw error;
  }
};
export const removeTask = async (taskId: number): Promise<void> => {
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
      'RemoveTaskErrorId'
    );
    throw error;
  }
};

export const toggleTask = async (taskId: number): Promise<Task> => {
  try {
    const toggleTaskEndpoint = `${API_BASE_URL}.toggle.${taskId}`;
    const response = await axiosInstance.put(toggleTaskEndpoint);

    return response.data;
  } catch (error) {
    console.error('Error toggling task:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to toggle task',
      'ToggleTaskErrorId'
    );
    throw error;
  }
};

export const updateTask = async (taskId: number, newTitle: string): Promise<Task> => {
  try {
    const updateTaskEndpoint = `${API_BASE_URL}.update.${taskId}`;
    const response = await axiosInstance.put(updateTaskEndpoint, { title: newTitle });

    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to update task',
      'UpdateTaskErrorId'
    );
    throw error;
  }
};

export const completeAllTasks = async (): Promise<void> => {
  try {
    const completeAllTasksEndpoint = `${API_BASE_URL}.completeAll`;
    await axiosInstance.post(completeAllTasksEndpoint);
  } catch (error) {
    console.error('Error completing all tasks:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to complete all tasks',
      'CompleteAllTasksErrorId'
    );
    throw error;
  }
};

export const assignTaskToTeam = async (taskId: number, teamId: number): Promise<void> => {
  try {
    const assignTaskToTeamEndpoint = `${API_BASE_URL}.assign.${taskId}.${teamId}`;
    await axiosInstance.post(assignTaskToTeamEndpoint);
  } catch (error) {
    console.error('Error assigning task to team:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to assign task to team',
      'AssignTaskToTeamErrorId'
    );
    throw error;
  }
};

export const unassignTask = async (taskId: number): Promise<void> => {
  try {
    const unassignTaskEndpoint = `${API_BASE_URL}.unassign.${taskId}`;
    await axiosInstance.post(unassignTaskEndpoint);
  } catch (error) {
    console.error('Error unassigning task:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to unassign task',
      'UnassignTaskErrorId'
    );
    throw error;
  }
};


export const fetchTask = async (taskId: number): Promise<Task> => {
  try {
    const fetchTaskEndpoint = `${API_BASE_URL}.single.${taskId}`;
    const response = await axiosInstance.get(fetchTaskEndpoint);
    return response.data.task;
  } catch (error) {
    console.error('Error fetching task:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to fetch task',
      'FetchTaskErrorId'
    );
    throw error;
  }
};

export const createTask = async (newTask: Task): Promise<void> => {
  try {
    const createTaskEndpoint = `${API_BASE_URL}.add`;
    await axiosInstance.post(createTaskEndpoint, newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to create task',
      'CreateTaskErrorId'
    );
    throw error;
  }
};

export const deleteTask = async (taskId: number): Promise<void> => {
  try {
    const deleteTaskEndpoint = `${API_BASE_URL}.delete.${taskId}`;
    await axiosInstance.delete(deleteTaskEndpoint);
  } catch (error) {
    console.error('Error deleting task:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to delete task',
      'DeleteTaskErrorId'
    );
    throw error;
  }
};

export const bulkAssignTasks = async (taskIds: number[], teamId: number): Promise<void> => {
  try {
    const bulkAssignTasksEndpoint = `${API_BASE_URL}.bulkAssign`;
    await axiosInstance.post(bulkAssignTasksEndpoint, { taskIds, teamId });
  } catch (error) {
    console.error('Error bulk assigning tasks:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to bulk assign tasks',
      'BulkAssignTasksErrorId'
    );
    throw error;
  }
};

export const bulkUnassignTasks = async (taskIds: number[]): Promise<void> => {
  try {
    const bulkUnassignTasksEndpoint = `${API_BASE_URL}.bulkUnassign`;
    await axiosInstance.post(bulkUnassignTasksEndpoint, { taskIds });
  } catch (error) {
    console.error('Error bulk unassigning tasks:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to bulk unassign tasks',
      'BulkUnassignTasksErrorId'
    );
    throw error;
  }
};

// For todos
export const bulkAssignTodos = async (todoIds: number[], teamId: number): Promise<void> => {
  try {
    const bulkAssignTodosEndpoint = `${API_BASE_URL}.bulkAssignTodos`;
    await axiosInstance.post(bulkAssignTodosEndpoint, { todoIds, teamId });
  } catch (error) {
    console.error('Error bulk assigning todos:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to bulk assign todos',
      'BulkAssignTodosErrorId'
    );
    throw error;
  }
};

export const bulkUnassignTodos = async (todoIds: number[]): Promise<void> => {
  try {
    const bulkUnassignTodosEndpoint = `${API_BASE_URL}.bulkUnassignTodos`;
    await axiosInstance.post(bulkUnassignTodosEndpoint, { todoIds });
  } catch (error) {
    console.error('Error bulk unassigning todos:', error);
    handleTaskApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to bulk unassign todos',
      'BulkUnassignTodosErrorId'
    );
    throw error;
  }
};
