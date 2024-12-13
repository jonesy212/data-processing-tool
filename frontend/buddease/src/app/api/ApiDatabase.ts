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
import { User } from "../components/users/User";
  
  // Define API notification messages for user fetch operations
  const userApiNotificationMessages = {
    FETCH_USERS_SUCCESS: "Users fetched successfully",
    FETCH_USERS_ERROR: "Failed to fetch users",
    FETCH_USER_ERROR: "Failed to fetch user"
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
};


// Fetch user IDs from the database
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
  

  const fetchUserFromDatabase = async (userId: string): Promise<User | null> => {
    try {
      const response = await axiosInstance.get(`${endpoints.data.user}/${userId}`, {
        headers: headersConfig,
      });
  
      if (!response.data) return null;
  
      // Assume the API response directly maps to the User interface
      return response.data as User;
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      handleUserApiErrorAndNotify(
        error as AxiosError<unknown>,
        "Failed to fetch user details",
        "FETCH_USER_ERROR"
      );
      return null; // Return null if the user is not found or an error occurs
    }
  };
  
  // Exporting the function to use in other parts of the application
  export { fetchUserIdsFromDatabase, fetchUserFromDatabase };
  