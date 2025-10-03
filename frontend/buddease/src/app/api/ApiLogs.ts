//Apilogs.ts
import axiosInstance from "@/app/api/csrfToken";
import { endpoints } from "@/app/api/endpointConfigurations";
import {
    NotificationTypeEnum,
    useNotification
} from "@/app/context/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { addLog } from "@/app/state/redux/slices/LogSlice";
import axios, { AxiosError, AxiosResponse } from "axios";
import { observable, runInAction } from "mobx";
// Other imports remain unchanged

// #todo
const API_BASE_URL = endpoints.logging; // Direct access to the logging endpoint

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
      notify(
        "ErrorId",
        NOTIFICATION_MESSAGES.Generic.ERROR,
        { errorMessage, responseData: error.response.data },
        new Date(),
        NotificationTypeEnum.ERROR
      );
    } else if (error.request) {
      console.error("No response received. Request details:", error.request);
      notify(
        "ErrorId",
        NOTIFICATION_MESSAGES.Generic.ERROR,
        { errorMessage, requestDetails: error.request },
        new Date(),
        NotificationTypeEnum.ERROR
      );
    } else {
      console.error("Error details:", error.message);
      notify(
        "ErrorId",
        NOTIFICATION_MESSAGES.Generic.ERROR,
        { errorMessage, errorDetails: error.message },
        new Date(),
        NotificationTypeEnum.ERROR
      );
    }
  } else {
    console.error("Non-Axios error:", error);
    notify(
      "ErrorId",
      NOTIFICATION_MESSAGES.Generic.ERROR,
      { errorMessage, errorDetails: error },
      new Date(),
      NotificationTypeEnum.ERROR
    );
  }
};


export const logsApiService = observable({
  logInfo: async (
    message: string,
    user: string | null = null
  ): Promise<AxiosResponse> => {
    try {
      //#todo  logSuccess
      const logInfoEndpoint = API_BASE_URL.logInfo; // Directly access logInfo
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
      notify(
        "LogInfoSuccessId",
        NOTIFICATION_MESSAGES.Logger.LOG_INFO_SUCCESS,
        { message },
        new Date(),
        NotificationTypeEnum.INFO
      );
      return response;
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
        NotificationTypeEnum.ERROR
      );
      throw error;
    }
  },

  logApiRequest: async (endpoint: string): Promise<void> => {
    try {
      await axios.get(endpoint);
      notify(
        "logApi",
        "ApiRequestSuccessId",
        `API Request to ${endpoint} successful.`,
        new Date(),
        NotificationTypeEnum.INFO
      );
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
      //#todo proper update 'logSuccess'
      const logSuccessEndpoint = API_BASE_URL.logSuccess; // Directly access logSuccess
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
      notify(
        "LogSuccessId",
        NOTIFICATION_MESSAGES.Logger.LOG_SUCCESS,
        { message },
        new Date(),
        NotificationTypeEnum.SUCCESS
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
        NotificationTypeEnum.ERROR
      );
      throw error;
    }
  },

  logFailure: async (
    message: string,
    user: string | null = null
  ): Promise<AxiosResponse> => {
    try {
      //#todo proper update 'logFailure'
      const logFailureEndpoint = API_BASE_URL.logFailure; // Directly access logFailure
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
      notify(
        "LogFailureId",
        NOTIFICATION_MESSAGES.Logger.LOG_FAILURE_ERROR,
        { message },
        new Date(),
        NotificationTypeEnum.LOGGING_ERROR
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
        NotificationTypeEnum.ERROR
      );
      throw error;
    }
  },
});