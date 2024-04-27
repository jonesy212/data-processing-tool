// TodoService.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import axios from "axios";
import { Todo } from "./Todo";

const BASE_URL = endpoints.todos

export const todoService = {

  fetchTodoById: async (todoId: string): Promise<Todo> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/todos/${todoId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch todo');
    }
  },

  assignTodoToUser: async (todoId: string, userId: string) => { 
    try {
      const response = await axios.post(`${BASE_URL}/api/todos/${todoId}/users/${userId}`);
      return response.data
    } catch (error) {
      throw new Error('Failed to assign todo to user');
    }
  },

  unassignTodoFromTeam: async (todoId: string, teamId: string) => { 
    try {
      await axios.delete(`${BASE_URL}/api/todos/${todoId}/teams/${teamId}`);
      
    } catch (error) {
      throw new Error("Failed to unassign todo from team");
    }
  },
    
    fetchTodos: async (): Promise<Todo[]> => {
    try {
      const response = await axios.get(`${BASE_URL}/api/todos`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch todos");
    }
  },
    
  fetchTodoDetails: async (todoId: string): Promise<Todo> => { 
    try {
      const response = await axios.get(`${BASE_URL}/api/todos/${todoId}`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch todo details");
    }
  },

  addTodo: async (newTodo: Todo): Promise<Todo> => {
    try {
      const response = await axios.post(`${BASE_URL}/api/todos`, newTodo, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to add todo");
    }
  },

  removeTodo: async (todoId: number): Promise<void> => {
    try {
      await axios.delete(`${BASE_URL}/api/todos/${todoId}`);
    } catch (error) {
      throw new Error("Failed to remove todo");
    }
  },

  updateTodo: async (todoId: number, newTitle: string): Promise<Todo> => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/todos/${todoId}`,
        { title: newTitle },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to update todo");
    }
  },

  completeAllTodos: async (): Promise<void> => {
    try {
      await axios.post(`${BASE_URL}/api/todos/complete-all`);
    } catch (error) {
      throw new Error("Failed to complete all todos");
    }
  },

  toggleTodo: async (todoId: number): Promise<void> => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/todos/${todoId}/toggle`
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to toggle todo");
    }
  },

  // multiple/bulk action
  removeTodos: async (todoIds: number[]): Promise<void> => {
    try {
      // Assuming there is an endpoint to remove multiple todos
      await axios.post(`${BASE_URL}/api/todos/remove-multiple`, { todoIds });
    } catch (error) {
      throw new Error("Failed to remove todos");
    }
  },

  toggleTodos: async (todoIds: number[]): Promise<void> => {
    try {
      // Assuming there is an endpoint to toggle multiple todos
      await axios.post(`${BASE_URL}/api/todos/toggle-multiple`, { todoIds });
    } catch (error) {
      throw new Error("Failed to toggle todos");
    }
  },
};
