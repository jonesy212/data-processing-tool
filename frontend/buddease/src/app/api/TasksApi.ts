import axios from 'axios';
import { Task } from '../components/models/tasks/Task';


const API_BASE_URL = '/api/tasks';  // Replace with your actual API endpoint

export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data.tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const addTask = async (newTask: Task): Promise<Task> => {
  try {
    const response = await axios.post(API_BASE_URL, newTask);
    return response.data;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

export const removeTask = async (taskId: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${taskId}`);
  } catch (error) {
    console.error('Error removing task:', error);
    throw error;
  }
};

export const toggleTask = async (taskId: number): Promise<Task> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${taskId}`);
    return response.data;
  } catch (error) {
    console.error('Error toggling task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: number, newTitle: string): Promise<Task> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${taskId}`, { name: newTitle });
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const completeAllTasks = async (): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/complete-all`);
  } catch (error) {
    console.error('Error completing all tasks:', error);
    throw error;
  }
};

export const assignTaskToTeam = async (taskId: number, teamId: number): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/${taskId}/assign/${teamId}`);
  } catch (error) {
    console.error('Error assigning task to team:', error);
    throw error;
  }
};

export const unassignTask = async (taskId: number): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/${taskId}/unassign`);
  } catch (error) {
    console.error('Error unassigning task:', error);
    throw error;
  }
};

export const fetchTask = async (taskId: number): Promise<Task> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${taskId}`);
    return response.data.task;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
};

export const createTask = async (newTask: Task): Promise<void> => {
  try {
    await axios.post(API_BASE_URL, newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};


export const deleteTask = async (taskId: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/${taskId}`);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// Add more functions as needed for your specific use cases

// Add more functions as needed for your specific use cases
