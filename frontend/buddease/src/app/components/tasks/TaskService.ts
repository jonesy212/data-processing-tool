// taskService.ts
import axios from "axios";
import { Task } from "../models/tasks/Task";

const BASE_URL = "https://your-api-base-url"; // Replace with your actual API base URL

export const taskService = {
  fetchTasks: async (): Promise<Task[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/tasks`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch tasks");
    }
  },

  fetchTask: async (taskId: number): Promise<Task> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch task with ID ${taskId}`);
    }
  },

  addTask: async (newTask: Task): Promise<Task> => {
    try {
      const response = await axios.post(`${BASE_URL}/api/tasks`, newTask, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to add task");
    }
  },

  removeTask: async (taskId: number): Promise<void> => {
    try {
      await axios.delete(`${BASE_URL}/api/tasks/${taskId}`);
    } catch (error) {
      throw new Error("Failed to remove task");
    }
  },

  updateTask: async (taskId: number, newTitle: string): Promise<Task> => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/tasks/${taskId}`,
        { title: newTitle },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to update task");
    }
  },

  completeAllTasks: async (): Promise<void> => {
    try {
      await axios.post(`${BASE_URL}/api/tasks/complete-all`);
    } catch (error) {
      throw new Error("Failed to complete all tasks");
    }
  },

  toggleTask: async (taskId: number): Promise<void> => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/tasks/${taskId}/toggle`
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to toggle task");
    }
  },

  // multiple/bulk action
  removeTasks: async (taskIds: number[]): Promise<void> => {
    try {
      // Assuming there is an endpoint to remove multiple tasks
      await axios.post(`${BASE_URL}/api/tasks/remove-multiple`, { taskIds });
    } catch (error) {
      throw new Error("Failed to remove tasks");
    }
  },

  toggleTasks: async (taskIds: number[]): Promise<void> => {
    try {
      // Assuming there is an endpoint to toggle multiple tasks
      await axios.post(`${BASE_URL}/api/tasks/toggle-multiple`, { taskIds });
    } catch (error) {
      throw new Error("Failed to toggle tasks");
    }
  },
};
