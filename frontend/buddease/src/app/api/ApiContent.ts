// ApiContent.ts
import { NotificationType, NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import { AxiosError } from "axios";
import dotProp from "dot-prop";
import { YourResponseType } from "../components/typings/types";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";
import headersConfig from "./headers/HeadersConfig";

// Define the API base URL
const API_BASE_URL = dotProp.getProperty(endpoints, "content");

// Define API notification messages for content operations
interface ContentNotificationMessages {
  FETCH_CONTENT_SUCCESS: string;
  FETCH_CONTENT_ERROR: string;
  CREATE_CONTENT_SUCCESS: string;
  CREATE_CONTENT_ERROR: string;
  UPDATE_CONTENT_SUCCESS: string;
  UPDATE_CONTENT_ERROR: string;
  DELETE_CONTENT_SUCCESS: string;
  DELETE_CONTENT_ERROR: string;
  // Add more keys as needed
}

const contentNotificationMessages: ContentNotificationMessages = {
  FETCH_CONTENT_SUCCESS: "Content fetched successfully",
  FETCH_CONTENT_ERROR: "Failed to fetch content",
  CREATE_CONTENT_SUCCESS: "Content created successfully",
  CREATE_CONTENT_ERROR: "Failed to create content",
  UPDATE_CONTENT_SUCCESS: "Content updated successfully",
  UPDATE_CONTENT_ERROR: "Failed to update content",
  DELETE_CONTENT_SUCCESS: "Content deleted successfully",
  DELETE_CONTENT_ERROR: "Failed to delete content",
  // Add more messages as needed
};

// Function to handle API errors and notify
export const handleContentApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: string
) => {
  handleApiError(error, errorMessage);
  if (errorMessageId) {
    const errorMessageText = dotProp.getProperty(
      contentNotificationMessages,
      errorMessageId
    );
    useNotification().notify(
      errorMessageId,
      errorMessageText as unknown as string,
      null,
      new Date(),
      "ApiClientError" as NotificationType
    );
  }
};

// Fetch content data
export async function fetchContent(): Promise<YourResponseType> {
  try {
    const fetchContentEndpoint = `${API_BASE_URL}/fetch`; // Adjust the endpoint as needed
    const response = await axiosInstance.get<YourResponseType>(
      fetchContentEndpoint,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching content:", error);
    const errorMessage = "Failed to fetch content";
    handleContentApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "FetchContentErrorId"
    );
    throw error;
  }
}

// Create a new content
export const createContent = async (newContentData: any): Promise<void> => {
  try {
    const createContentEndpoint = `${API_BASE_URL}/create`; // Adjust the endpoint as needed
    await axiosInstance.post(createContentEndpoint, newContentData, {
      headers: headersConfig,
    });
    // Notify success message
    useNotification().notify(
      "CreateContentSuccessId",
      contentNotificationMessages.CREATE_CONTENT_SUCCESS,
      null,
      new Date(),
      NotificationTypeEnum.Success
    );
  } catch (error: any) {
    console.error("Error creating content:", error);
    handleContentApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to create content",
      "CreateContentErrorId"
    );
    throw error;
  }
};

// Update an existing content
export const updateContent = async (
  contentId: number,
  updatedContentData: any
): Promise<void> => {
  try {
    const updateContentEndpoint = `${API_BASE_URL}/update/${contentId}`; // Adjust the endpoint as needed
    await axiosInstance.put(updateContentEndpoint, updatedContentData, {
      headers: headersConfig,
    });
    // Notify success message
    useNotification().notify(
      "UpdateContentSuccessId",
      contentNotificationMessages.UPDATE_CONTENT_SUCCESS,
      { contentId },
      new Date(),
      NotificationTypeEnum.Success
    );
  } catch (error: any) {
    console.error("Error updating content:", error);
    handleContentApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to update content",
      "UpdateContentErrorId"
    );
    throw error;
  }
};

// Delete a content
export const deleteContent = async (contentId: number): Promise<void> => {
  try {
    const deleteContentEndpoint = `${API_BASE_URL}/delete/${contentId}`; // Adjust the endpoint as needed
    await axiosInstance.delete(deleteContentEndpoint, {
      headers: headersConfig,
    });
    // Notify success message
    useNotification().notify(
      "DeleteContentSuccessId",
      contentNotificationMessages.DELETE_CONTENT_SUCCESS,
      { contentId },
      new Date(),
      NotificationTypeEnum.Success
    );
  } catch (error: any) {
    console.error("Error deleting content:", error);
    handleContentApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to delete content",
      "DeleteContentErrorId"
    );
    throw error;
  }
};


export const saveTaskHistoryToDatabase = async (
    taskId: string,
    previousState: any
  ): Promise<void> => {
    try {
      // Make API call to save task history to the database
      const saveTaskHistoryEndpoint = `${API_BASE_URL}/tasks/${taskId}/history`;
      await axiosInstance.post(saveTaskHistoryEndpoint, previousState, { headers: headersConfig });
      
      // Log a message indicating success
      console.log(`Task history for task ${taskId} saved successfully.`);
    } catch (error: any) {
      console.error("Error saving task history to database:", error);
      // Handle error as needed
      throw error;
    }
  };
  

export const getTaskHistoryFromDatabase = async (
    taskId: string
): Promise<any> => {
    try {
        // Make API call to fetch task history from the database
        const getTaskHistoryEndpoint = `${API_BASE_URL}/tasks/${taskId}/history`;
        const response = await axiosInstance.get(getTaskHistoryEndpoint, { headers: headersConfig });
        return response.data;
    } catch (error) {
        console.error("Error fetching task history from database:", error);
        throw error;
    }
}
