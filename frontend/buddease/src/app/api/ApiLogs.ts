// Apilogs.ts
import { DataTypeEnums } from '@/app/features/support/UnifiedNotificationTypes';
import axiosInstance from "@/app/api/csrfToken";
import { endpoints } from "@/app/api/endpointConfigurations";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes'
import { useNotification } from '@/app/state/context/NotificationContext';
import { addLog } from "@/app/state/redux/slices/LogSlice";
import axios, { AxiosError, AxiosResponse } from "axios";
import { getApiEndpointUrl } from '@/app/api/endpointConfigurations';
import { observable, runInAction } from "mobx";

const API_BASE_URL = endpoints.logging;
const { notify } = useNotification();

export const handleApiError = (
  error: AxiosError<unknown> | Error,
  errorMessage: string
): void => {
  console.error(`API Error: ${errorMessage}`);
  
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
      notify({
        id: `error${errorMessage.replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.Generic.ERROR,
        data: { 
          originalError: error.message,
          extra: {
            errorMessage,
            responseData: error.response.data,
            status: error.response.status
          }
        },
        timestamp: new Date(),
        type: DataTypeEnums.Notification.ERROR,
        level: 'error'
      });
    } else if (error.request) {
      console.error("No response received. Request details:", error.request);
      notify({
        id: `error${errorMessage.replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.Generic.ERROR,
        data: { 
          originalError: error.message,
          extra: {
            errorMessage,
            requestDetails: error.request
          }
        },
        timestamp: new Date(),
        type: DataTypeEnums.Notification.ERROR,
        level: 'error'
      });
    } else {
      console.error("Error details:", error.message);
      notify({
        id: `error${errorMessage.replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.Generic.ERROR,
        data: { 
          originalError: error.message,
          extra: {
            errorMessage
          }
        },
        timestamp: new Date(),
        type: DataTypeEnums.Notification.ERROR,
        level: 'error'
      });
    }
  } else {
    console.error("Non-Axios error:", error);
    notify({
      id: `error${errorMessage.replace(/\s+/g, '')}`,
      message: NOTIFICATION_MESSAGES.Generic.ERROR,
      data: { 
        originalError: error.message,
        extra: {
          errorMessage,
          errorDetails: error
        }
      },
      timestamp: new Date(),
      type: DataTypeEnums.Notification.ERROR,
      level: 'error'
    });
  }
};


export const logsApiService = observable({
  logInfo: async (
    message: string,
    user: string | null = null
  ): Promise<AxiosResponse> => {
    try {
      // Use getApiEndpointUrl to get the actual URL string
      const logInfoEndpoint = getApiEndpointUrl('logging', 'logInfo', { message, user });
      if (!logInfoEndpoint) {
        throw new Error("Log info endpoint not found");
      }
      const response: AxiosResponse = await axiosInstance.post(
        logInfoEndpoint,
        { message, user }
      );
      runInAction(() => {
        addLog(`Info: ${message}`);
      });
      notify({
        id: `logInfoSuccess${message.replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
        data: { 
          extra: { message, user }
        },
        timestamp: new Date(),
        type: DataTypeEnums.Notification.INFO,
        level: 'info'
      });
      return response;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to log info message"
      );
      notify({
        id: `logInfoError${message.replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.Logger.LOG_INFO_ERROR,
        data: { 
          originalError: (error as Error).message,
          extra: { message, user }
        },
        timestamp: new Date(),
        type: DataTypeEnums.Notification.ERROR,
        level: 'error'
      });
      throw error;
    }
  },

  logApiRequest: async (endpoint: string): Promise<void> => {
    try {
      await axios.get(endpoint);
      notify({
        id: `apiRequestSuccess${endpoint.replace(/\s+/g, '')}`,
        message: `API Request to ${endpoint} successful.`,
        data: { 
          extra: { endpoint }
        },
        timestamp: new Date(),
        type: DataTypeEnums.Notification.INFO,
        level: 'info'
      });
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        `Failed to make API request to ${endpoint}`
      );
    }
  },

  logSuccess: async (
    message: string,
    user: string | null = null
  ): Promise<AxiosResponse> => {
    try {
      // Use getApiEndpointUrl to get the actual URL string
      const logSuccessEndpoint = getApiEndpointUrl('logging', 'logSuccess', { message, user });
      if (!logSuccessEndpoint) {
        throw new Error("Log success endpoint not found");
      }
      const response: AxiosResponse = await axiosInstance.post(
        logSuccessEndpoint,
        { message, user }
      );
      runInAction(() => {
        addLog(`Success: ${message}`);
      });
      notify({
        id: `logSuccess${message.replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.Logger.LOG_SUCCESS,
        data: { 
          extra: { message, user }
        },
        timestamp: new Date(),
        type: DataTypeEnums.Notification.SUCCESS,
        level: 'success'
      });
      return response;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to log success message"
      );
      notify({
        id: `logSuccessError${message.replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
        data: { 
          originalError: (error as Error).message,
          extra: { message, user }
        },
        timestamp: new Date(),
        type: DataTypeEnums.Notification.ERROR,
        level: 'error'
      });
      throw error;
    }
  },

  logFailure: async (
    message: string,
    user: string | null = null
  ): Promise<AxiosResponse> => {
    try {
      // Use getApiEndpointUrl to get the actual URL string
      const logFailureEndpoint = getApiEndpointUrl('logging', 'logFailure', { message, user });
      if (!logFailureEndpoint) {
        throw new Error("Log failure endpoint not found");
      }
      const response: AxiosResponse = await axiosInstance.post(
        logFailureEndpoint,
        { message, user }
      );
      runInAction(() => {
        addLog(`Failure: ${message}`);
      });
      notify({
        id: `logFailure${message.replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.Logger.LOG_FAILURE_ERROR,
        data: { 
          extra: { message, user }
        },
        timestamp: new Date(),
        type: DataTypeEnums.Notification.LOGGING_ERROR,
        level: 'error'
      });
      return response;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to log failure message"
      );
      notify({
        id: `logFailureError${message.replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.Logger.LOG_FAILURE_ERROR,
        data: { 
          originalError: (error as Error).message,
          extra: { message, user }
        },
        timestamp: new Date(),
        type: DataTypeEnums.Notification.ERROR,
        level: 'error'
      });
      throw error;
    }
  },
});