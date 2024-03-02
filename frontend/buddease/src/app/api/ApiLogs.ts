// ApiLogs.ts

import { endpoints } from '@/app/api/ApiEndpoints';
import DefaultNotificationContext, {
  NotificationTypeEnum,
} from "@/app/components/support/NotificationContext";
import axios, { AxiosError, AxiosResponse } from "axios";
import { observable, runInAction } from "mobx";
import { addLog } from "../components/state/redux/slices/LogSlice";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = endpoints.logging; // Assuming logging endpoints are defined in ApiEndpoints.ts

const { notify } = DefaultNotificationContext; // Destructure notify from DefaultNotificationContext

// Helper function to handle API errors
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
      notify(
        "ErrorId",
        NOTIFICATION_MESSAGES.Generic.ERROR,
        { errorMessage, responseData: error.response.data }, // Pass additional data in content
        new Date(),
        NotificationTypeEnum.Error // Updated NotificationTypeEnum
      );
    } else if (error.request) {
      console.error("No response received. Request details:", error.request);
      notify(
        "ErrorId",
        NOTIFICATION_MESSAGES.Generic.ERROR,
        { errorMessage, requestDetails: error.request }, // Pass additional data in content
        new Date(),
        NotificationTypeEnum.Error // Updated NotificationTypeEnum
      );
    } else {
      console.error("Error details:", error.message);
      notify(
        "ErrorId",
        NOTIFICATION_MESSAGES.Generic.ERROR,
        { errorMessage, errorDetails: error.message }, // Pass additional data in content
        new Date(),
        NotificationTypeEnum.Error // Updated NotificationTypeEnum
      );
    }
  } else {
    console.error("Non-Axios error:", error);
    notify(
      "ErrorId",
      NOTIFICATION_MESSAGES.Generic.ERROR,
      { errorMessage, errorDetails: error }, // Pass additional data in content
      new Date(),
      NotificationTypeEnum.Error // Updated NotificationTypeEnum
    );
  }
};

export const logsApiService = observable({
  logInfo: async (
    message: string,
    user: string | null = null
  ): Promise<AxiosResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        API_BASE_URL.logInfo,
        { message, user }
      );
      runInAction(() => {
        addLog(`Info: ${message}`);
      });
      notify(
        "LogInfoSuccessId",
        NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
        { message },
        new Date(),
        NotificationTypeEnum.Info // Updated NotificationTypeEnum
      );
      return response; // Return the AxiosResponse object
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to log info message"
      );
      notify(
        "LogInfoErrorId",
        NOTIFICATION_MESSAGES.Logger.LOG_INFO_ERROR,
        { message },
        new Date(),
        NotificationTypeEnum.Error // Updated NotificationTypeEnum
      );
      throw error;
    }
  },

  // logWarning and logError methods remain unchanged

  logApiRequest: async (endpoint: string): Promise<void> => {
    try {
      // Perform the API request
      await axios.get(endpoint);

      // Log the API request success
      notify(
        "logApi",
        "ApiRequestSuccessId",
        `API Request to ${endpoint} successful.`,
        new Date(),
        NotificationTypeEnum.Info // Updated NotificationTypeEnum
      );
    } catch (error) {
      // Log the API request failure using handleApiError
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
      const response: AxiosResponse = await axiosInstance.post(
        API_BASE_URL.logError,
        { message, user }
      );
      runInAction(() => {
        addLog(`Success: ${message}`);
      });
      notify(
        "LogSuccessId",
        NOTIFICATION_MESSAGES.Logger.LOG_SUCCESS,
        { message },
        new Date(),
        NotificationTypeEnum.Success
      );
      return response;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to log success message"
      );
      notify(
        "LogSuccessErrorId",
        NOTIFICATION_MESSAGES.Logger.LOG_ERROR,
        { message },
        new Date(),
        NotificationTypeEnum.Error
      );
      throw error;
    }
  },

  logFailure: async (
    message: string,
    user: string | null = null
  ): Promise<AxiosResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        API_BASE_URL.logFailure,
        { message, user }
      );
      runInAction(() => {
        addLog(`Failure: ${message}`);
      });
      notify(
        "LogFailureId",
        NOTIFICATION_MESSAGES.Logger.LOG_FAILURE_ERROR,
        { message },
        new Date(),
        NotificationTypeEnum.LoggingError
      );
      return response;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to log failure message"
      );
      notify(
        "LogFailureErrorId",
        NOTIFICATION_MESSAGES.Logger.LOG_FAILURE_ERROR,
        { message },
        new Date(),
        NotificationTypeEnum.Error
      );
      throw error;
    }
  },
});
