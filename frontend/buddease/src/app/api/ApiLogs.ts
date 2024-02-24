//ApiLogs.ts

import {
    NotificationType,
    useNotification,
} from "@/app/components/support/NotificationContext";
import axios, { AxiosError, AxiosResponse } from "axios";
import { observable, runInAction } from "mobx";
import { addLog } from "../components/state/redux/slices/LogSlice";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
import { endpoints } from "./ApiEndpoints";
import axiosInstance from "./axiosInstance";

const API_BASE_URL = endpoints.logging; // Assuming logging endpoints are defined in ApiEndpoints.ts

const { notify } = useNotification(); // Destructure notify from useNotification

// Helper function to handle API errors

export const handleApiError = (
  error: AxiosError<unknown>,
  errorMessage: string
): void => {
  console.error(`API Error: ${errorMessage}`);
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
      notify(
        NOTIFICATION_MESSAGES.Generic.ERROR,
        errorMessage,
        new Date(),
        "Error" as NotificationType
      );
    } else if (error.request) {
      console.error("No response received. Request details:", error.request);
      notify(
        NOTIFICATION_MESSAGES.Generic.ERROR,
        errorMessage,
        new Date(),
        "Error" as NotificationType
      );
    } else {
      console.error("Error details:", error.message);
      notify(
        NOTIFICATION_MESSAGES.Generic.ERROR,
        errorMessage,
        new Date(),
        "Error" as NotificationType
      );
    }
  } else {
    console.error("Non-Axios error:", error);
    notify(
      NOTIFICATION_MESSAGES.Generic.ERROR,
      errorMessage,
      new Date(),
      "Error" as NotificationType
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
        NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
        "Log Info Success",
        new Date(),
        {} as NotificationType
      );
      return response; // Return the AxiosResponse object
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to log info message"
      );
      notify(
        NOTIFICATION_MESSAGES.Logger.LOG_INFO_ERROR,
        "Log Info Error",
        new Date(),
        "LoggingInfo"
      );
      throw error;
    }
  },

  logWarning: async (
    message: string,
    user: string | null = null
  ): Promise<AxiosResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        API_BASE_URL.logWarning,
        { message, user }
      );
      runInAction(() => {
        addLog(`Warning: ${message}`);
      });
      notify(
        NOTIFICATION_MESSAGES.Logger.LOG_WARNING_SUCCESS,
        "Log Warning Success",
        new Date(),
        "LoggingWarning"
      );
      return response;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to log warning message"
      );
      notify(
        NOTIFICATION_MESSAGES.Logger.LOG_WARNING_ERROR,
        "Log Warning Error",
        new Date(),
        "LoggingWarning"
      );
      throw error;
    }
  },

  logError: async (
    message: string,
    user: string | null = null
  ): Promise<AxiosResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        API_BASE_URL.logError,
        { message, user }
      );
      runInAction(() => {
        addLog(`Error: ${message}`);
      });
      notify(
        NOTIFICATION_MESSAGES.Logger.LOG_ERROR_SUCCESS,
        "Log Error Success",
        new Date(),
        {} as NotificationType
      );
      return response;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        "Failed to log error message"
      );
      notify(
        NOTIFICATION_MESSAGES.Logger.LOG_ERROR_FAILURE,
        "Log Error Error",
        new Date(),
        "LoggingError"
      );
      throw error;
    }
  },

  logApiRequest: async (endpoint: string): Promise<void> => {
    try {
      // Perform the API request
      await axios.get(endpoint);

      // Log the API request success
      notify(
        NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
        `API Request to ${endpoint} successful.`,
        new Date(),
        "Info" as NotificationType
      );
    } catch (error) {
      // Log the API request failure using handleApiError
        handleApiError(error as AxiosError<unknown>,
        `Failed to make API request to ${endpoint}`);
    }
  },
});
