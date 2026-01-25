// ApiParameter.ts
import { handleApiError } from '@/core/api/ApiLogs';
import internalApiService from '@/core/api/ApiClient';
import { endpoints } from "@/core/api/endpointConfigurations";
import { headersConfig } from '@/core/components/shared/SharedHeaders';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useErrorHandling } from "@/core/hooks/useErrorHandling";
import { useNotification } from '@/core/state/context/NotificationContext';
import type { YourResponseType } from '@/core/typings/responseTypes';
import { AxiosError } from "axios";

// Define the API base URL
const API_BASE_URL = endpoints.parameter; // Assuming you have a parameter endpoint


export interface ApiParameter {
  // Basic parameter info
  name: string; // Parameter name like 'parameterId', 'newParameterData', etc.
  type: string; // TypeScript type like 'string', 'number', 'any', 'YourResponseType<T>'
  
  // Optional metadata
  optional?: boolean;
  defaultValue?: any;
  
  // From your actual API usage
  parameterId?: string | number;
  parameterType?: string;
}

// Define API notification messages for parameter operations
interface ParameterNotificationMessages {
  FETCH_PARAMETER_SUCCESS: string;
  FETCH_PARAMETER_ERROR: string;
  CREATE_PARAMETER_SUCCESS: string;
  CREATE_PARAMETER_ERROR: string;
  UPDATE_PARAMETER_SUCCESS: string;
  UPDATE_PARAMETER_ERROR: string;
  DELETE_PARAMETER_SUCCESS: string;
  DELETE_PARAMETER_ERROR: string;
  SAVE_PARAMETER_SUCCESS: string;    
  SAVE_PARAMETER_ERROR: string;      
  VALIDATE_PARAMETER_SUCCESS: string;
  VALIDATE_PARAMETER_ERROR: string;
  // Add more keys as needed
}

const parameterNotificationMessages: ParameterNotificationMessages = {
  FETCH_PARAMETER_SUCCESS: "Parameter fetched successfully",
  FETCH_PARAMETER_ERROR: "Failed to fetch parameter",
  CREATE_PARAMETER_SUCCESS: "Parameter created successfully",
  CREATE_PARAMETER_ERROR: "Failed to create parameter",
  UPDATE_PARAMETER_SUCCESS: "Parameter updated successfully",
  UPDATE_PARAMETER_ERROR: "Failed to update parameter",
  DELETE_PARAMETER_SUCCESS: "Parameter deleted successfully",
  DELETE_PARAMETER_ERROR: "Failed to delete parameter",
  SAVE_PARAMETER_SUCCESS: "Parameter saved successfully",
  SAVE_PARAMETER_ERROR: "Failed to save parameter",
  VALIDATE_PARAMETER_SUCCESS: "Parameter validated successfully",
  VALIDATE_PARAMETER_ERROR: "Failed to validate parameter",
  // Add more messages as needed
};

// Function to handle API errors and notify
export const handleParameterApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof ParameterNotificationMessages,
  additionalData?: any
) => {
  const { notify } = useNotification();
  
  // Get the error message text from the notification messages
  const errorMessageText = parameterNotificationMessages[errorMessageId] || errorMessage;
  
  // Create more detailed error message based on HTTP status
  let userFriendlyMessage = errorMessageText;
  const axiosError = error as AxiosError;
  
  if (axiosError.response) {
    switch (axiosError.response.status) {
      case 400:
        userFriendlyMessage = "Invalid parameter data";
        break;
      case 401:
        userFriendlyMessage = "Authentication required";
        break;
      case 403:
        userFriendlyMessage = "Permission denied";
        break;
      case 404:
        userFriendlyMessage = "Parameter not found";
        break;
      case 409:
        userFriendlyMessage = "Parameter conflict";
        break;
      case 422:
        userFriendlyMessage = "Parameter validation failed";
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
    id: `parameter_error_${errorMessageId}_${Date.now()}`,
    message: userFriendlyMessage,
    data: {
      entityType: 'parameter',
      entityId: additionalData?.parameterId || 'unknown',
      action: additionalData?.action || 'unknown',
      originalError: axiosError.message,
      statusCode: axiosError.response?.status,
      extra: additionalData || {}
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.OPERATION_ERROR,
    level: 'error' as const
  });
  
  // Call the original error handler
  handleApiError(error, userFriendlyMessage);
};

// Fetch parameter by ID
export const fetchParameter = async (parameterId: string): Promise<any> => {
  try {
    const fetchParameterEndpoint = `${API_BASE_URL}/${parameterId}`;
    const response = await internalApiService.get(fetchParameterEndpoint, {
      headers: headersConfig,
    });
    
    // Success notification
    const { notify } = useNotification();
    notify({
      id: `parameter_fetch_success_${parameterId}_${Date.now()}`,
      message: parameterNotificationMessages.FETCH_PARAMETER_SUCCESS,
      data: {
        entityType: 'parameter',
        entityId: parameterId,
        action: 'fetch',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    return response.data;
    
  } catch (error: any) {
    console.error("Error fetching parameter:", error);
    handleParameterApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch parameter",
      "FETCH_PARAMETER_ERROR" as keyof ParameterNotificationMessages,
      { 
        parameterId, 
        action: 'fetch' 
      }
    );
    throw error;
  }
};

// Fetch parameter data by ID with generic typing
export const fetchParameterById = <
  T extends BaseDataEntity, 
  K extends T, 
  Meta extends DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(parameterId: number): Promise<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  const { handleError } = useErrorHandling();

  return new Promise<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(async (resolve, reject) => {
    try {
      const fetchParameterByIdEndpoint = `${API_BASE_URL}/fetch/${parameterId}`;
      const response = await internalApiService.get<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
        fetchParameterByIdEndpoint,
        {
          headers: headersConfig
        }
      );
      
      // Success notification
      const { notify } = useNotification();
      notify({
        id: `parameter_fetch_by_id_success_${parameterId}_${Date.now()}`,
        message: parameterNotificationMessages.FETCH_PARAMETER_SUCCESS,
        data: {
          entityType: 'parameter',
          entityId: parameterId.toString(),
          action: 'fetch_by_id',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      
      resolve(response.data);
    } catch (error: any) {
      console.error("Error fetching parameter by ID:", error);
      const errorMessage = "Failed to fetch parameter by ID";
      handleError(errorMessage, { componentStack: error.stack });
      
      handleParameterApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        "FETCH_PARAMETER_ERROR" as keyof ParameterNotificationMessages,
        { 
          parameterId, 
          action: 'fetch_by_id' 
        }
      );
      
      reject(error);
    }
  });
};

// Create a new parameter
export const createParameter = async (newParameterData: any): Promise<void> => {
  try {
    const createParameterEndpoint = `${API_BASE_URL}/create`;
    await internalApiService.post(createParameterEndpoint, newParameterData, {
      headers: headersConfig,
    });
    
    // Success notification
    const { notify } = useNotification();
    notify({
      id: `parameter_create_success_${Date.now()}`,
      message: parameterNotificationMessages.CREATE_PARAMETER_SUCCESS,
      data: {
        entityType: 'parameter',
        action: 'create',
        parameterData: newParameterData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
  } catch (error: any) {
    console.error("Error creating parameter:", error);
    handleParameterApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to create parameter",
      "CREATE_PARAMETER_ERROR" as keyof ParameterNotificationMessages,
      { parameterData: newParameterData, action: 'create' }
    );
    throw error;
  }
};

// Update parameter
export const updateParameter = async (
  parameterId: number,
  updatedParameterData: any
): Promise<void> => {
  try {
    const updateParameterEndpoint = `${API_BASE_URL}/update/${parameterId}`;
    await internalApiService.put(updateParameterEndpoint, updatedParameterData, {
      headers: headersConfig,
    });
    
    // Success notification
    const { notify } = useNotification();
    notify({
      id: `parameter_update_success_${parameterId}_${Date.now()}`,
      message: parameterNotificationMessages.UPDATE_PARAMETER_SUCCESS,
      data: {
        entityType: 'parameter',
        entityId: parameterId.toString(),
        action: 'update',
        parameterData: updatedParameterData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
  } catch (error: any) {
    console.error("Error updating parameter:", error);
    handleParameterApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to update parameter",
      "UPDATE_PARAMETER_ERROR" as keyof ParameterNotificationMessages,
      { 
        parameterId, 
        parameterData: updatedParameterData, 
        action: 'update' 
      }
    );
    throw error;
  }
};

// Delete parameter
export const deleteParameter = async (parameterId: string): Promise<void> => {
  try {
    const deleteParameterEndpoint = `${API_BASE_URL}/${parameterId}`;
    await internalApiService.delete(deleteParameterEndpoint, {
      headers: headersConfig,
    });
    
    // Success notification
    const { notify } = useNotification();
    notify({
      id: `parameter_delete_success_${Date.now()}`,
      message: parameterNotificationMessages.DELETE_PARAMETER_SUCCESS,
      data: {
        entityType: 'parameter',
        entityId: parameterId,
        action: 'delete',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
  } catch (error: any) {
    console.error("Error deleting parameter:", error);
    handleParameterApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to delete parameter",
      "DELETE_PARAMETER_ERROR" as keyof ParameterNotificationMessages,
      { parameterId, action: 'delete' }
    );
    throw error;
  }
};

// Save parameter to database
export const saveParameterToDatabase = async (
  parameterData: any
): Promise<boolean> => {
  try {
    const saveParameterEndpoint = `${API_BASE_URL}/save`;
    const response = await internalApiService.post(saveParameterEndpoint, parameterData, {
      headers: headersConfig,
    });

    const { notify } = useNotification();
    notify({
      id: `parameter_save_success_${Date.now()}`,
      message: parameterNotificationMessages.SAVE_PARAMETER_SUCCESS,
      data: {
        entityType: 'parameter',
        entityId: response.data?.id || 'new',
        action: 'save_to_database',
        parameterData: parameterData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });

    return true;
  } catch (error: any) {
    console.error("Error saving parameter to database:", error);
    
    // Create custom error notification
    const { notify } = useNotification();
    const axiosError = error as AxiosError;
    
    let userMessage = parameterNotificationMessages.SAVE_PARAMETER_ERROR;
    if (axiosError.response?.status === 400) {
      userMessage = "Invalid parameter data for database";
    } else if (axiosError.response?.status === 409) {
      userMessage = "Parameter already exists in database";
    }
    
    notify({
      id: `parameter_save_error_${Date.now()}`,
      message: userMessage,
      data: {
        entityType: 'parameter',
        action: 'save_to_database',
        parameterData: parameterData,
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

// Validate parameter
export const validateParameter = async (
  parameterData: any
): Promise<{ isValid: boolean; errors?: string[] }> => {
  try {
    const validateParameterEndpoint = `${API_BASE_URL}/validate`;
    const response = await internalApiService.post(validateParameterEndpoint, parameterData, {
      headers: headersConfig,
    });

    const { notify } = useNotification();
    notify({
      id: `parameter_validate_success_${Date.now()}`,
      message: parameterNotificationMessages.VALIDATE_PARAMETER_SUCCESS,
      data: {
        entityType: 'parameter',
        action: 'validate',
        parameterData: parameterData,
        validationResult: response.data,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });

    return { isValid: true, ...response.data };
  } catch (error: any) {
    console.error("Error validating parameter:", error);
    
    const { notify } = useNotification();
    const axiosError = error as AxiosError;
    
    let userMessage = parameterNotificationMessages.VALIDATE_PARAMETER_ERROR;
    if (axiosError.response?.status === 422) {
      userMessage = "Parameter validation failed";
    }
    
    notify({
      id: `parameter_validate_error_${Date.now()}`,
      message: userMessage,
      data: {
        entityType: 'parameter',
        action: 'validate',
        parameterData: parameterData,
        originalError: axiosError.message,
        statusCode: axiosError.response?.status,
        validationErrors: axiosError.response?.data?.errors || [],
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const
    });
    
    // Return validation errors if available
    if (axiosError.response?.status === 422 && axiosError.response?.data?.errors) {
      return { 
        isValid: false, 
        errors: axiosError.response.data.errors 
      };
    }
    
    return { isValid: false, errors: [userMessage] };
  }
};

// Fetch all parameters
export const fetchAllParameters = async (): Promise<any[]> => {
  try {
    const fetchAllEndpoint = `${API_BASE_URL}/all`;
    const response = await internalApiService.get(fetchAllEndpoint, {
      headers: headersConfig,
    });
    
    // Success notification
    const { notify } = useNotification();
    notify({
      id: `parameter_fetch_all_success_${Date.now()}`,
      message: "All parameters fetched successfully",
      data: {
        entityType: 'parameter',
        action: 'fetch_all',
        count: response.data?.length || 0,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    return response.data;
    
  } catch (error: any) {
    console.error("Error fetching all parameters:", error);
    handleParameterApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch all parameters",
      "FETCH_PARAMETER_ERROR" as keyof ParameterNotificationMessages,
      { action: 'fetch_all' }
    );
    throw error;
  }
};

// Fetch parameters by type
export const fetchParametersByType = async (parameterType: string): Promise<any[]> => {
  try {
    const fetchByTypeEndpoint = `${API_BASE_URL}/type/${parameterType}`;
    const response = await internalApiService.get(fetchByTypeEndpoint, {
      headers: headersConfig,
    });
    
    // Success notification
    const { notify } = useNotification();
    notify({
      id: `parameter_fetch_by_type_success_${parameterType}_${Date.now()}`,
      message: `Parameters of type '${parameterType}' fetched successfully`,
      data: {
        entityType: 'parameter',
        action: 'fetch_by_type',
        parameterType: parameterType,
        count: response.data?.length || 0,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const
    });
    
    return response.data;
    
  } catch (error: any) {
    console.error("Error fetching parameters by type:", error);
    handleParameterApiErrorAndNotify(
      error as AxiosError<unknown>,
      `Failed to fetch parameters of type '${parameterType}'`,
      "FETCH_PARAMETER_ERROR" as keyof ParameterNotificationMessages,
      { 
        parameterType, 
        action: 'fetch_by_type' 
      }
    );
    throw error;
  }
};