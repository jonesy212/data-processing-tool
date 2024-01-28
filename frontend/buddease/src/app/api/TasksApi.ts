import { Task } from '../components/models/tasks/Task';
import { useTaskManagerStore } from '../components/state/stores/TaskStore ';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

const API_BASE_URL = endpoints.tasks.list;

export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const response = await axiosInstance.get(API_BASE_URL);
    return response.data.tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const addTask = async (newTask: Omit<Task, 'id'>) => {
  try {
    const response = await axiosInstance.post(endpoints.tasks.add, newTask);

    if (response.status === 200 || response.status === 201) {
      const createdTask: Task = response.data;
      const taskManagerStore = useTaskManagerStore();
      taskManagerStore.addTaskSuccess({ task: createdTask });
    } else {
      console.error('Failed to add task:', response.statusText);
    }
  } catch (error) {
    console.error('Error adding task:', error);
  }
};

export const removeTask = async (taskId: number): Promise<void> => {
  try {
    await axiosInstance.delete(endpoints.tasks.remove(taskId));
  } catch (error) {
    console.error('Error removing task:', error);
    throw error;
  }
};

export const toggleTask = async (taskId: number): Promise<Task> => {
  try {
    const response = await axiosInstance.put(endpoints.tasks.toggle(taskId));
    return response.data;
  } catch (error) {
    console.error('Error toggling task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: number, newTitle: string): Promise<Task> => {
  try {
    const response = await axiosInstance.put(endpoints.tasks.update(taskId), { name: newTitle });
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const completeAllTasks = async (): Promise<void> => {
  try {
    await axiosInstance.post(endpoints.tasks.completeAll);
  } catch (error) {
    console.error('Error completing all tasks:', error);
    throw error;
  }
};

export const assignTaskToTeam = async (taskId: number, teamId: number): Promise<void> => {
  try {
    await axiosInstance.post(endpoints.tasks.assign(taskId, teamId));
  } catch (error) {
    console.error('Error assigning task to team:', error);
    throw error;
  }
};

export const unassignTask = async (taskId: number): Promise<void> => {
  try {
    await axiosInstance.post(endpoints.tasks.unassign(taskId));
  } catch (error) {
    console.error('Error unassigning task:', error);
    throw error;
  }
};

export const fetchTask = async (taskId: number): Promise<Task> => {
  try {
    const response = await axiosInstance.get(endpoints.tasks.single(taskId));
    return response.data.task;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

export const createTask = async (newTask: Task): Promise<void> => {
  try {
    await axiosInstance.post(endpoints.tasks.add, newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: number): Promise<void> => {
  try {
    await axiosInstance.delete(endpoints.tasks.remove(taskId));
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};


export const bulkAssignTasks = async (taskIds: number[], teamId: number): Promise<void> => {
  try {
    await axiosInstance.post(endpoints.tasks.bulkAssign, { taskIds, teamId });
  } catch (error) {
    console.error('Error bulk assigning tasks:', error);
    throw error;
  }
};

export const bulkUnassignTasks = async (taskIds: number[]): Promise<void> => {
  try {
    await axiosInstance.post(endpoints.tasks.bulkUnassign, { taskIds });
  } catch (error) {
    console.error('Error bulk unassigning tasks:', error);
    throw error;
  }
};

// For todos
export const bulkAssignTodos = async (todoIds: number[], teamId: number): Promise<void> => {
  try {
    await axiosInstance.post(endpoints.todos.bulkAssign, { todoIds, teamId });
  } catch (error) {
    console.error('Error bulk assigning todos:', error);
    throw error;
  }
};

export const bulkUnassignTodos = async (todoIds: number[]): Promise<void> => {
  try {
    await axiosInstance.post(endpoints.todos.bulkUnassign, { todoIds });
  } catch (error) {
    console.error('Error bulk unassigning todos:', error);
    throw error;
  }
};