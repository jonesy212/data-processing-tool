// ApiDatabase.ts
import {
  NotificationTypeEnum,
  useNotification,
} from "@/app/context/NotificationContext";
import { User } from "@/app/users/User";
import { AxiosError } from "axios";
import { handleApiError } from "@/app/api/ApiLogs";

// Define API notification messages for user fetch operations
const userApiNotificationMessages = {
  FETCH_USERS_SUCCESS: "Users fetched successfully",
  FETCH_USERS_ERROR: "Failed to fetch users",
  FETCH_USER_ERROR: "Failed to fetch user",
  FETCH_USER_SUCCESS: "User fetched successfully"
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
      NotificationTypeEnum.ERROR
    );
  }
};


// Fetch user IDs from the database
// For INTERNAL database access (your own PostgreSQL)
const fetchUserIdsFromDatabase = async (taskId: string): Promise<string[]> => {
  try {
    const response = await fetch(`/api/users?taskId=${taskId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Notify success
    useNotification().notify(
      "FETCH_USERS_SUCCESS",
      userApiNotificationMessages.FETCH_USERS_SUCCESS,
      null,
      new Date(),
      NotificationTypeEnum.SUCCESS
    );
    
    return data.userIds || [];
  } catch (error) {
    console.error("Error fetching user IDs:", error);
    handleUserApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch user IDs",
      "FETCH_USERS_ERROR"
    );
    throw error;
  }
};


const fetchUserFromDatabase = async (userId: string): Promise<User | null> => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`User with ID ${userId} not found`);
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const user = await response.json();
    
    // Notify success
    useNotification().notify(
      "FETCH_USER_SUCCESS",
      userApiNotificationMessages.FETCH_USER_SUCCESS,
      null,
      new Date(),
      NotificationTypeEnum.SUCCESS
    );
    
    return user as User;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    handleUserApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch user details",
      "FETCH_USER_ERROR"
    );
    return null;
  }
};



// Add more database operations as needed
const createUserInDatabase = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    handleUserApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to create user",
      "FETCH_USER_ERROR"
    );
    throw error;
  }
};

// Exporting the function to use in other parts of the application
export {
  createUserInDatabase, fetchUserFromDatabase, fetchUserIdsFromDatabase
};
