// ApiDatabase.ts
import {
    NotificationTypeEnum,
    useNotification,
  } from "@/app/components/support/NotificationContext";
  import { AxiosError } from "axios";
  import { handleApiError } from "./ApiLogs";
  import axiosInstance from "./axiosInstance";
  import headersConfig from "./headers/HeadersConfig";
  import { endpoints } from './endpointConfigurations';
  
  // Define API notification messages for user fetch operations
  const userApiNotificationMessages = {
    FETCH_USERS_SUCCESS: "Users fetched successfully",
    FETCH_USERS_ERROR: "Failed to fetch users",
  };
  
  type UserApiNotificationKeys = keyof typeof userApiNotificationMessages;

// Function to handle API errors and notify
const handleUserApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: UserApiNotificationKeys
) => {
  handleApiError(error, errorMessage);
  
  if (errorMessageId && userApiNotificationMessages.hasOwnProperty(errorMessageId)) {
    const errorMessageText = userApiNotificationMessages[errorMessageId];
    useNotification().notify(
      errorMessageId,
      errorMessageText,
      null,
      new Date(),
      "UserError" as NotificationTypeEnum
    );
  }
};  // Fetch user IDs from the database
  const fetchUserIdsFromDatabase = async (taskId: string): Promise<string[]> => {
    try {
      const response = await axiosInstance.get(`${endpoints.data.users}/task/${taskId}`, {
        headers: headersConfig,
      });
  
      // Assuming the response contains an array of user IDs
      return response.data.userIds; // Adjust according to your actual API response structure
    } catch (error) {
      console.error("Error fetching user IDs:", error);
      const errorMessage = "Failed to fetch user IDs";
      handleUserApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        "FETCH_USERS_ERROR"
      );
      throw error; // Rethrow the error for further handling if necessary
    }
  };
  
  // Exporting the function to use in other parts of the application
  export { fetchUserIdsFromDatabase };
  