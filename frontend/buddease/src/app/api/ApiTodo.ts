// ApiTodo.ts
"use client";

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from '@/app/api/endpointConfigurations';
import NOTIFICATION_MESSAGES from '@/app/features/support/NotificationMessages';
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { useNotification } from "@/app/state/context/NotificationContext";
import { Todo } from '@/app/todos/Todo';
import { AxiosError } from 'axios';

// Define the API base URL for todos
const API_BASE_URL = endpoints.todos.list

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
  CHECK_TODO_COMPLETION_ERROR: string;
  COMPLETE_ALL_TODOS_ERROR: string;
  ASSIGN_TODO_TO_TEAM_ERROR: string;
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
  CHECK_TODO_COMPLETION_ERROR: 'Failed to check todo completion.',
  COMPLETE_ALL_TODOS_ERROR: 'Failed to complete all todos.',
  ASSIGN_TODO_TO_TEAM_ERROR: 'Failed to assign todo to team.',
  // Add more properties as needed
};

// Function to handle API errors and notify for todos
const handleTodoApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessageId: keyof TodoNotificationMessages,
  additionalData?: any
) => {
  const { notify } = useNotification();
  
  // Get the error message text from the notification messages
  const errorMessage = todoApiNotificationMessages[errorMessageId] || NOTIFICATION_MESSAGES.Todos.Error;
  
  // Create more detailed error message based on HTTP status
  let userFriendlyMessage = errorMessage;
  const axiosError = error as AxiosError;
  
  if (axiosError.response) {
    switch (axiosError.response.status) {
      case 400:
        userFriendlyMessage = "Invalid todo data";
        break;
      case 401:
        userFriendlyMessage = "Authentication required for todo operations";
        break;
      case 403:
        userFriendlyMessage = "You don't have permission to modify this todo";
        break;
      case 404:
        userFriendlyMessage = "Todo not found";
        break;
      case 409:
        userFriendlyMessage = "Todo conflict occurred";
        break;
      case 422:
        userFriendlyMessage = "Todo validation failed";
        break;
      case 500:
        userFriendlyMessage = "Server error while processing todo";
        break;
    }
  } else if (axiosError.request) {
    userFriendlyMessage = "Network error: Unable to connect to todo server";
  }
  
  // Log the error for debugging
  console.error("Todo API Error:", {
    messageId: errorMessageId,
    message: userFriendlyMessage,
    originalError: axiosError.message,
    statusCode: axiosError.response?.status,
    additionalData
  });
  
  // Show notification using consistent object format
  notify({
    id: `todo_error_${errorMessageId}_${Date.now()}`,
    message: userFriendlyMessage,
    data: {
      entityType: 'todo',
      entityId: additionalData?.todoId?.toString() || 'unknown',
      action: additionalData?.action || errorMessageId.toLowerCase().replace('_error', ''),
      originalError: axiosError.message,
      statusCode: axiosError.response?.status,
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      extra: additionalData || {},
      timestamp: new Date().toISOString()
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR,
    level: 'error' as const
  });
  
  // Re-throw the error
  throw error;
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
export const addTodo = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(newTodo: Omit<Todo<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'id'>): Promise<void> => {
  try {
    const addTodoEndpoint = `${API_BASE_URL}.add`;
    await axiosInstance.post(addTodoEndpoint, newTodo);
  } catch (error) {
    console.error('Error adding todo:', error);
    handleTodoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "ADD_TODO_ERROR"
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
      'REMOVE_TODO_ERROR'
    );
    throw error;
  }
};


// Update todo
export const updateTodo = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  todoId: number, 
  updatedFields: Partial<Todo<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): Promise<void> => {
  try {
    const updateTodoEndpoint = `${API_BASE_URL}.update.${todoId}`;
    const response = await axiosInstance.put(updateTodoEndpoint, updatedFields);

    // Success notification using consistent object format
    const { notify } = useNotification();
    notify({
      id: `todo_update_success_${todoId}_${Date.now()}`,
      message: todoApiNotificationMessages.UPDATE_TODO_SUCCESS || "Todo updated successfully",
      data: {
        entityType: 'todo',
        entityId: todoId.toString(),
        action: 'update',
        updatedFields: updatedFields,
        responseData: response.data,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
  } catch (error) {
    console.error('Error updating todo:', error);
    handleTodoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "UPDATE_TODO_ERROR" as keyof TodoNotificationMessages,
      { 
        todoId, 
        updatedFields, 
        action: 'update' 
      }
    );
    throw error;
  }
};

// Check todo completion
export const checkTodoCompletion = async (todoId: string): Promise<void> => { 
  try {
    // Include todoId in the endpoint URL
    const checkTodoCompletionEndpoint = `${API_BASE_URL}/checkCompletion/${todoId}`;
    await axiosInstance.get(checkTodoCompletionEndpoint);
  } catch (error) {
    handleTodoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "CHECK_TODO_COMPLETION_ERROR"
    );
  }
};

// Complete all todos
export const completeAllTodos = async (): Promise<void> => {
  try {
    const completeAllTodosEndpoint = `${API_BASE_URL}.completeAll`;
    await axiosInstance.post(completeAllTodosEndpoint);
  } catch (error) {
    console.error('Error completing all todos:', error);
    handleTodoApiErrorAndNotify(
      error as AxiosError<unknown>,
      "COMPLETE_ALL_TODOS_ERROR"
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
      "ASSIGN_TODO_TO_TEAM_ERROR"
    );
    throw error;
  }
};

export const fetchTodosSuccess = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  req: Request,
  res: Response
): Promise<Todo<T,K>[]> => {
  return [];
}


export const fetchTodosFailure = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  req: Request,
  res: Response
): Promise<Todo<T,K>[]> => {
  return [];
}

export const completeAllTodosRequest = async (
  req: Request,
  res: Response
): Promise<void> => {};

export const completeAllTodosSuccess = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  req: Request,
  res: Response
): Promise<Todo<T,K>[]> => {
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
