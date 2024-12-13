// ApiContent.ts
import { BaseData } from '@/app/components/models/data/Data';
import { NotificationType, NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import { AxiosError } from "axios";
import { ContentState } from "draft-js";
import useErrorHandling from "../components/hooks/useErrorHandling";
import { YourResponseType } from "../components/typings/types";
import { StructuredMetadata } from "../configs/StructuredMetadata";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";
import headersConfig from "./headers/HeadersConfig";

// Define the API base URL
const API_BASE_URL = endpoints.content

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
  UPDATE_CONTENT_ERROR_ID: string;
  CREATE_CONTENT_ERROR_ID: string;
  DELETE_CONTENT_ERROR_ID: string;
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
  UPDATE_CONTENT_ERROR_ID: "Failed to update content",
  CREATE_CONTENT_ERROR_ID: "Failed to create content",
  DELETE_CONTENT_ERROR_ID: "Failed to delete content",
  // Add more messages as needed
};


// Function to handle API errors and notify
const handleContentApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof ContentNotificationMessages // Use keyof to enforce valid keys
) => {
  handleApiError(error, errorMessage);
  
  if (errorMessageId) {
    const errorMessageText = contentNotificationMessages[errorMessageId]; // Access directly
    useNotification().notify(
      errorMessageId,
      errorMessageText,
      null,
      new Date(),
      "ApiClientError" as NotificationType
    );
  }
};


// Function to fetch contentId from API based on contentState
const fetchContentIdFromAPI = async (contentState: ContentState): Promise<string> => {
  try {
    // Make an API call to fetch the content ID
    const response = await axiosInstance.post(`${API_BASE_URL}/getContentId`, {
      contentState, // Send the contentState as part of the request body
    });

    // Check if response contains the contentId
    if (response.data && response.data.contentId) {
      return response.data.contentId;
    } else {
      throw new Error('Content ID not found in the response.');
    }
  } catch (error) {
    console.error("Error fetching content ID:", error);
    throw error; // Propagate the error to the caller
  }
};
// Fetch content data
const fetchContent = (): Promise<YourResponseType<any>> => {
  // Initialize the useErrorHandling hook
  const { handleError } = useErrorHandling();

  return new Promise<YourResponseType<any>>((resolve, reject) => {
    try {
      const fetchContentEndpoint = `${API_BASE_URL}/fetch`; // Adjust the endpoint as needed
      axiosInstance.get<YourResponseType<any>>(fetchContentEndpoint, {
        headers: headersConfig,
      })
      .then(response => {
        // Resolve with the response data
        resolve(response.data);
      })
      .catch(error => {
        // Handle any errors that occur during the fetch
        console.error("Error fetching content:", error);

        // Call the handleError function to handle and log the error
        const errorMessage = "Failed to fetch content";
        handleError(errorMessage, { componentStack: error.stack });

        // Reject with the error
        reject(error);
      });
    } catch (error: any) {
      // Handle synchronous errors
      console.error("Error fetching content:", error);

      // Call the handleError function to handle and log the error
      const errorMessage = "Failed to fetch content";
      handleError(errorMessage, { componentStack: error.stack });

      // Reject with the error
      reject(error);
    }
  });
};

// Update an existing content
const updateContent = async (
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
  } catch (error) {
    console.error("Error updating content:", error);
    handleContentApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to update content",
      "UPDATE_CONTENT_ERROR_ID"
    );
    throw error;
  }
};


// Create a new content
const createContent = async (newContentData: any): Promise<void> => {
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
      "CREATE_CONTENT_ERROR_ID"
    );
    throw error;
  }
};

// Delete a content
const deleteContent = async (contentId: number): Promise<void> => {
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
       "DELETE_CONTENT_ERROR_ID"
    );
    throw error;
  }
};


const saveTaskHistoryToDatabase = async (
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
  
const createContentStateFromText = (text: string): any => {
  // Create a new content state object with the text and the current date/time
  
    return {
        text: text,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
};

 
const getMetadataForContent = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  contentId: string,
  contentState: ContentState // Include contentState in the function parameters
): Promise<StructuredMetadata<T, K>> => {
  try {
    // Make API call to fetch metadata for the content
    const getMetadataEndpoint = `${API_BASE_URL}/metadata/${contentId}`;
    const response = await axiosInstance.get(getMetadataEndpoint, {
      headers: headersConfig // Ensure headersConfig is properly defined
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching metadata for content:", error);
    throw error;
  }
};


const getTaskHistoryFromDatabase = async (
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


const fetchContentDataFromAPI = async (
  contentId: string,
): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/fetch/${contentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching content data:", error);
    throw error;
  }
};

const fetchContentId = async (contentId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/fetch/${contentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching content data:", error);
    throw error;
  }
}

const getContentIdFromURL = (url: string): string => {
  const urlParts = url.split("/");
  const contentId = urlParts[urlParts.length - 1];
  return contentId;
  };

  export {
  createContent, createContentStateFromText, deleteContent, fetchContent, fetchContentDataFromAPI,
  fetchContentId, fetchContentIdFromAPI, getContentIdFromURL, getMetadataForContent,
  getTaskHistoryFromDatabase, handleContentApiErrorAndNotify, saveTaskHistoryToDatabase, updateContent
};

