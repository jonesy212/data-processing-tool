// ApiDrawing.ts
import { handleApiError } from '@/app/api/ApiLogs';
import axiosInstance from "@/app/api/csrfToken";
import { endpoints } from "@/app/api/endpointConfigurations";
import headersConfig from "@/app/api/headers/HeadersConfig";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { useErrorHandling } from "@/app/hooks/useErrorHandling";
import { useNotification } from '@/app/state/context/NotificationContext';
import { YourResponseType } from '@/app/typings/responseTypes';
import { AxiosError } from "axios";



// Define the API base URL
const API_BASE_URL = endpoints.drawing; // Accessing property directly

// Define API notification messages for drawing operations
interface DrawingNotificationMessages {
  FETCH_DRAWING_SUCCESS: string;
  FETCH_DRAWING_ERROR: string;
  CREATE_DRAWING_SUCCESS: string;
  CREATE_DRAWING_ERROR: string;
  UPDATE_DRAWING_SUCCESS: string;
  UPDATE_DRAWING_ERROR: string;
  DELETE_DRAWING_SUCCESS: string;
  DELETE_DRAWING_ERROR: string;
  SAVE_DRAWING_SUCCESS: string;    
  SAVE_DRAWING_ERROR: string;      
  // Add more keys as needed
}

const drawingNotificationMessages: DrawingNotificationMessages = {
  FETCH_DRAWING_SUCCESS: "Drawing fetched successfully",
  FETCH_DRAWING_ERROR: "Failed to fetch drawing",
  CREATE_DRAWING_SUCCESS: "Drawing created successfully",
  CREATE_DRAWING_ERROR: "Failed to create drawing",
  UPDATE_DRAWING_SUCCESS: "Drawing updated successfully",
  UPDATE_DRAWING_ERROR: "Failed to update drawing",
  DELETE_DRAWING_SUCCESS: "Drawing deleted successfully",
  DELETE_DRAWING_ERROR: "Failed to delete drawing",

  SAVE_DRAWING_SUCCESS: "Drawing saved successfully",
  SAVE_DRAWING_ERROR: "Failed to save drawing",
  // Add more messages as needed
};

// Function to handle API errors and notify
export const handleDrawingApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof DrawingNotificationMessages,
  additionalData?: any  // Add optional parameter
) => {
  const { notify } = useNotification();
  
  // Get the error message text from the notification messages
  const errorMessageText = drawingNotificationMessages[errorMessageId] || errorMessage;
  
  // Create more detailed error message based on HTTP status
  let userFriendlyMessage = errorMessageText;
  const axiosError = error as AxiosError;
  
  if (axiosError.response) {
    switch (axiosError.response.status) {
      case 400:
        userFriendlyMessage = "Invalid drawing data";
        break;
      case 401:
        userFriendlyMessage = "Authentication required";
        break;
      case 403:
        userFriendlyMessage = "Permission denied";
        break;
      case 404:
        userFriendlyMessage = "Drawing not found";
        break;
      case 409:
        userFriendlyMessage = "Drawing conflict";
        break;
      case 500:
        userFriendlyMessage = "Server error";
        break;
    }
  } else if (axiosError.request) {
    userFriendlyMessage = "Network error";
  }
  
  // Show notification using consistent object format
  notify({
    id: `drawing_error_${errorMessageId}_${Date.now()}`,
    message: userFriendlyMessage,
    data: {
      entityType: 'drawing',
      entityId: additionalData?.drawingId || 'unknown',
      action: additionalData?.action || 'unknown',
      originalError: axiosError.message,
      statusCode: axiosError.response?.status,
      extra: additionalData || {}
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR, // Use consistent enum
    level: 'error' as const
  });
  
  // Call the original error handler
  handleApiError(error, userFriendlyMessage);
};

// Now updateDrawing function with correct notification format
export const updateDrawing = async (
  drawingId: number,
  updatedDrawingData: any
): Promise<void> => {
  try {
    const updateDrawingEndpoint = `${API_BASE_URL}/update/${drawingId}`;
    await axiosInstance.put(updateDrawingEndpoint, updatedDrawingData, {
      headers: headersConfig,
    });
    
    // Success notification using consistent object format
    const { notify } = useNotification();
    notify({
      id: `drawing_update_success_${drawingId}_${Date.now()}`,
      message: drawingNotificationMessages.UPDATE_DRAWING_SUCCESS || "Drawing updated successfully",
      data: {
        entityType: 'drawing',
        entityId: drawingId.toString(),
        action: 'update',
        drawingData: updatedDrawingData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS, // Use consistent enum
      level: 'success' as const
    });
    
  } catch (error: any) {
    console.error("Error updating drawing:", error);
    handleDrawingApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to update drawing",
      "UPDATE_DRAWING_ERROR" as keyof DrawingNotificationMessages, // Use string constant
      { 
        drawingId, 
        drawingData: updatedDrawingData, 
        action: 'update' 
      }
    );
    throw error;
  }
};

// Also update fetchDrawing to work with the new signature
export const fetchDrawing = async (drawingId: string): Promise<any> => {
  try {
    const fetchDrawingEndpoint = `${API_BASE_URL}/${drawingId}`;
    const response = await axiosInstance.get(fetchDrawingEndpoint, {
      headers: headersConfig,
    });
    
    // Success notification
    const { notify } = useNotification();
    notify({
      id: `drawing_fetch_success_${drawingId}_${Date.now()}`,
      message: "Drawing fetched successfully",
      data: {
        entityType: 'drawing',
        entityId: drawingId,
        action: 'fetch',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    return response.data;
    
  } catch (error: any) {
    console.error("Error fetching drawing:", error);
    handleDrawingApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch drawing",
      "FETCH_DRAWING_ERROR" as keyof DrawingNotificationMessages,
      { 
        drawingId, 
        action: 'fetch' 
      }
    );
    throw error;
  }
};


// Fetch drawing data by ID
export const fetchDrawingById = <
  T extends BaseDataEntity, 
  K extends T, 
  Meta extends DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(drawingId: number): Promise<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  // Initialize the useErrorHandling hook
  const { handleError } = useErrorHandling();

  return new Promise<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(async (resolve, reject) => {
    try {
      const fetchDrawingByIdEndpoint = `${API_BASE_URL}/fetch/${drawingId}`;
      const response = await axiosInstance.get<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
        fetchDrawingByIdEndpoint,
        {
          headers: headersConfig
        }
      );
      resolve(response.data);
    } catch (error: any) {
      console.error("Error fetching drawing by ID:", error);
      const errorMessage = "Failed to fetch drawing by ID";
      handleError(errorMessage, { componentStack: error.stack });
      reject(error);
    }
  });
};


// Create a new drawing
export const createDrawing = async (newDrawingData: any): Promise<void> => {
  try {
    const createDrawingEndpoint = `${API_BASE_URL}/create`; // Adjust the endpoint as needed
    await axiosInstance.post(createDrawingEndpoint, newDrawingData, {
      headers: headersConfig,
    });
    
    // Success notification using consistent object format
    const { notify } = useNotification();
    notify({
      id: `drawing_create_success_${Date.now()}`,
      message: drawingNotificationMessages.CREATE_DRAWING_SUCCESS,
      data: {
        entityType: 'drawing',
        action: 'create',
        drawingData: newDrawingData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS, // Use OPERATION_SUCCESS for consistency
      level: 'success' as const
    });
    
  } catch (error: any) {
    console.error("Error creating drawing:", error);
    handleDrawingApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to create drawing",
      "CREATE_DRAWING_ERROR" as keyof DrawingNotificationMessages,
      { drawingData: newDrawingData, action: 'create' }
    );
    throw error;
  }
};

export const saveDrawingToDatabase = async (
  drawingData: any
): Promise<boolean> => {
  try {
    const saveDrawingEndpoint = `${API_BASE_URL}/save`;
    const response = await axiosInstance.post(saveDrawingEndpoint, drawingData, {
      headers: headersConfig,
    });

    const { notify } = useNotification();
    notify({
      id: `drawing_save_success_${Date.now()}`,
      message: "Drawing saved to database", // Direct message
      data: {
        entityType: 'drawing',
        entityId: response.data?.id || 'new',
        action: 'save_to_database',
        drawingData: drawingData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });

    return true;
  } catch (error: any) {
    console.error("Error saving drawing to database:", error);
    
    // Create custom error notification
    const { notify } = useNotification();
    const axiosError = error as AxiosError;
    
    let userMessage = "Failed to save drawing to database";
    if (axiosError.response?.status === 400) {
      userMessage = "Invalid drawing data for database";
    } else if (axiosError.response?.status === 409) {
      userMessage = "Drawing already exists in database";
    }
    
    notify({
      id: `drawing_save_error_${Date.now()}`,
      message: userMessage,
      data: {
        entityType: 'drawing',
        action: 'save_to_database',
        drawingData: drawingData,
        originalError: axiosError.message,
        statusCode: axiosError.response?.status,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    return false;
  }
};

export const deleteDrawing = async (drawingId: string): Promise<void> => {
  try {
    const deleteDrawingEndpoint = `${API_BASE_URL}/${drawingId}`;
    await axiosInstance.delete(deleteDrawingEndpoint, {
      headers: headersConfig,
    });
    
    // Success notification for delete
    const { notify } = useNotification();
    notify({
      id: `drawing_delete_success_${Date.now()}`,
      message: "Drawing deleted successfully", // Add to messages if needed
      data: {
        entityType: 'drawing',
        entityId: drawingId,
        action: 'delete',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
  } catch (error: any) {
    console.error("Error deleting drawing:", error);
    handleDrawingApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to delete drawing",
      "DELETE_DRAWING_ERROR" as keyof DrawingNotificationMessages,
      { drawingId, action: 'delete' }
    );
    throw error;
  }
};