// ApiDatabase.ts
import { handleApiError } from "@/app/api/ApiLogs";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { NotificationPosition } from "@/app/models/data/StatusType";
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes'
import { useNotification, NotificationDataPayload } from "@/app/state/context/NotificationContext";
import { User } from "@/app/users/User";
import { AxiosError } from "axios";

// Define API notification messages for user fetch operations
const userApiNotificationMessages = {
  FETCH_USERS_SUCCESS: "Users fetched successfully",
  FETCH_USERS_ERROR: "Failed to fetch users",
  FETCH_USER_ERROR: "Failed to fetch user",
  FETCH_USER_SUCCESS: "User fetched successfully",
  CREATE_USER_SUCCESS: "User created successfully",
  CREATE_USER_ERROR: "Failed to create user"
};

type UserApiNotificationKeys = keyof typeof userApiNotificationMessages;

// Helper functions for notifications
const notifySuccess = (
  id: string,
  message: string,
  data: NotificationDataPayload = {},
  position: NotificationPosition = NotificationPosition.TopRight
) => {
  useNotification().notify({
    id,
    message,
    type: NotificationTypeEnum.SUCCESS,
    timestamp: new Date(),
    position,
    data, // ✅ now includes structured data
  });
};


const notifyError = (
  id: string,
  message: string,
  data: NotificationDataPayload = {},
  position: NotificationPosition = NotificationPosition.TopRight
) => {
  useNotification().notify({
    id,
    message,
    type: NotificationTypeEnum.ERROR,
    timestamp: new Date(),
    position,
    data, // ✅ structured data
  });
};


// Function to handle API errors and notify
const handleUserApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: UserApiNotificationKeys,
  position: NotificationPosition = NotificationPosition.TopRight
) => {
  handleApiError(error, errorMessage);

  if (errorMessageId && userApiNotificationMessages.hasOwnProperty(errorMessageId)) {
    const errorMessageText = userApiNotificationMessages[errorMessageId];
    
    notifyError(errorMessageId, errorMessageText, {
      originalError: errorMessage,
      extra: { errorObject: error }
    }, position);
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
    const data = await response.json();
    
    notifySuccess("FETCH_USERS_SUCCESS", userApiNotificationMessages.FETCH_USERS_SUCCESS);
    
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

const fetchUserFromDatabase = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(userId: string): Promise<User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
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
    
    notifySuccess("FETCH_USER_SUCCESS", userApiNotificationMessages.FETCH_USER_SUCCESS);
    
    return user as User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
const createUserInDatabase = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(userData: Partial<User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): Promise<User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
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
    
    const newUser = await response.json();
    
    notifySuccess("CREATE_USER_SUCCESS", userApiNotificationMessages.CREATE_USER_SUCCESS);
    
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    handleUserApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to create user",
      "CREATE_USER_ERROR"
    );
    throw error;
  }
};

// Exporting the function to use in other parts of the application
export {
    createUserInDatabase,
    fetchUserFromDatabase,
    fetchUserIdsFromDatabase, handleUserApiErrorAndNotify, notifyError, notifySuccess
};

// Export types for use elsewhere
    export type { UserApiNotificationKeys };
