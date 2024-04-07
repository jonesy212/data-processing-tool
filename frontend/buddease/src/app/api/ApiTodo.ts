// TodoApi.ts


import { AxiosError } from 'axios';
import dotProp from 'dot-prop';
import { Todo } from '../components/todos/Todo';
import { handleApiErrorAndNotify } from './ApiData';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

// Define the API base URL for todos
const API_BASE_URL = dotProp.getProperty(endpoints, 'todos.list');

// Define interface for todo notification messages
interface TodoNotificationMessages {
  FETCH_TODOS_SUCCESS: string;
  FETCH_TODOS_ERROR: string;
  ADD_TODO_SUCCESS: string;
  ADD_TODO_ERROR: string;
  REMOVE_TODO_SUCCESS: string;
  REMOVE_TODO_ERROR: string;
  UPDATE_TODO_SUCCESS: string;
  UPDATE_TODO_ERROR: string;
  // Add more keys as needed
}

// Define API notification messages for todos
const todoApiNotificationMessages: TodoNotificationMessages = {
  FETCH_TODOS_SUCCESS: 'Todos fetched successfully.',
  FETCH_TODOS_ERROR: 'Failed to fetch todos.',
  ADD_TODO_SUCCESS: 'Todo added successfully.',
  ADD_TODO_ERROR: 'Failed to add todo.',
  REMOVE_TODO_SUCCESS: 'Todo removed successfully.',
  REMOVE_TODO_ERROR: 'Failed to remove todo.',
  UPDATE_TODO_SUCCESS: 'Todo updated successfully.',
  UPDATE_TODO_ERROR: 'Failed to update todo.',
  // Add more properties as needed
};

// Function to handle API errors and notify for todos
const handleTodoApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: string
) => {
  handleApiErrorAndNotify(error, errorMessage, errorMessageId);
};







export const fetchTodos = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/api/todos`);
    return response.data.todos;
  } catch (error) {
    // Handle error
    console.error("Error fetching todos:", error);
    throw error;
  }
};

  






export const toggleTodo = async (
  todoId: number,
  entityType: string
): Promise<void> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/toggle/${entityType}/${todoId}`
    );
    // Handle success if needed
  } catch (error) {
    // Handle error
    console.error("Error toggling todo:", error);
    throw error;
  }
};

  
  export const updateTodoTitle = async (todoId: number, newTitle: string): Promise<void> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/api/todos/${todoId}/update`, { title: newTitle });
      // Handle success if needed
    } catch (error) {
      // Handle error
      console.error('Error updating todo title:', error);
      throw error;
    }
  };
  





  
  export const uncompleteTodo = async (todoId: number): Promise<void> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/api/todos/${todoId}/uncomplete`);
      // Handle success if needed
    } catch (error) {
      // Handle error
      console.error('Error uncompleting todo:', error);
      throw error;
    }
  };

// Add todo
export const addTodo = async (newTodo: Omit<Todo, 'id'>): Promise<void> => {
  try {
    const addTodoEndpoint = `${API_BASE_URL}.add`;
    await axiosInstance.post(addTodoEndpoint, newTodo);
  } catch (error) {
    console.error('Error adding todo:', error);
    handleTodoApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to add todo',
      'AddTodoErrorId'
    );
    throw error;
  }
};

// Remove todo
export const removeTodo = async (todoId: number): Promise<void> => {
  try {
    const removeTodoEndpoint = `${API_BASE_URL}.remove.${todoId}`;
    await axiosInstance.delete(removeTodoEndpoint);
  } catch (error) {
    console.error('Error removing todo:', error);
    handleTodoApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to remove todo',
      'RemoveTodoErrorId'
    );
    throw error;
  }
};

// Update todo
export const updateTodo = async (todoId: number, updatedFields: Partial<Todo>): Promise<void> => {
  try {
    const updateTodoEndpoint = `${API_BASE_URL}.update.${todoId}`;
    await axiosInstance.put(updateTodoEndpoint, updatedFields);
  } catch (error) {
    console.error('Error updating todo:', error);
    handleTodoApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to update todo',
      'UpdateTodoErrorId'
    );
    throw error;
  }
};


export const checkTodoCompletion = async (todoId: string): Promise<void> => { 
  try {
    // Include todoId in the endpoint URL
    const checkTodoCompletionEndpoint = `${API_BASE_URL}/checkCompletion/${todoId}`;
    await axiosInstance.get(checkTodoCompletionEndpoint);
  } catch (error) {
    handleTodoApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to check todo completion',
      'CheckTodoCompletionErrorId',
    );
  }
}

// Complete all todos
export const completeAllTodos = async (): Promise<void> => {
  try {
    const completeAllTodosEndpoint = `${API_BASE_URL}.completeAll`;
    await axiosInstance.post(completeAllTodosEndpoint);
  } catch (error) {
    console.error('Error completing all todos:', error);
    handleTodoApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to complete all todos',
      'CompleteAllTodosErrorId'
    );
    throw error;
  }
};

// Assign todo to team
export const assignTodoToTeam = async (todoId: number, teamId: number): Promise<void> => {
  try {
    const assignTodoToTeamEndpoint = `${API_BASE_URL}.assign.${todoId}.${teamId}`;
    await axiosInstance.post(assignTodoToTeamEndpoint);
  } catch (error) {
    console.error('Error assigning todo to team:', error);
    handleTodoApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to assign todo to team',
      'AssignTodoToTeamErrorId'
    );
    throw error;
  }
};

export const fetchTodosSuccess = async (
  req: Request,
  res: Response
): Promise<Todo[]> => {
  return [];
}



export const fetchTodosFailure = async (
  req: Request,
  res: Response
): Promise<Todo[]> => {
  return [];
}




export const completeAllTodosRequest = async (
  req: Request,
  res: Response
): Promise<void> => {};

export const completeAllTodosSuccess = async (
  req: Request,
  res: Response
): Promise<Todo[]> => {
  return [];
}



  
  export const completeAllTodosFailure = async (): Promise<void> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/api/todos/completeAllFailure`);
      // Handle success if needed
      
    } catch (error) {
      // Handle error
      console.error('Error completing all todos failure:', error);
      throw error;
    }
  };