// ApiContent.ts
import { NotificationPosition } from '@/app/models/data/StatusType';
import { handleApiError } from '@/app/api/ApiLogs';
import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from '@/app/api/endpointConfigurations';
import headersConfig from '@/app/api/headers/HeadersConfig';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from "@/app/documents/attachment/Attachment";
import useErrorHandling from '@/app/hooks/useErrorHandling';
import { NotificationType, NotificationTypeEnum, useNotification } from '@/app/state/context/NotificationContext';
import { NotificationService } from '@/app/state/stores/NotificationService';
import { YourResponseType } from '@/app/typings/responseTypes';
import { AxiosError } from 'axios';
import { ContentState } from 'draft-js';

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
// Updated function to handle API errors and notify
const handleContentApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof ContentNotificationMessages, // Use keyof to enforce valid keys
  position: NotificationPosition = NotificationPosition.TopRight
) => {
  handleApiError(error, errorMessage);

  if (errorMessageId) {
    const errorMessageText = contentNotificationMessages[errorMessageId];

    useNotification().notify({
      id: String(errorMessageId),
      message: errorMessageText,
      data: { originalError: errorMessage, error: error },
      timestamp: new Date(),
      type: "ApiClientError" as NotificationType,
      position,
    });
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
const fetchContent = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): Promise<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  const { handleError } = useErrorHandling();

  return new Promise((resolve, reject) => {
    try {
      const fetchContentEndpoint = `${API_BASE_URL}/fetch`;

      axiosInstance.get<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
        fetchContentEndpoint,
        { headers: headersConfig }
      )
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        console.error("Error fetching content:", error);
        const errorMessage = "Failed to fetch content";
        handleError(errorMessage, { componentStack: error.stack });
        reject(error);
      });

    } catch (error: any) {
      console.error("Error fetching content:", error);
      const errorMessage = "Failed to fetch content";
      handleError(errorMessage, { componentStack: error.stack });
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
      NotificationTypeEnum.SUCCESS
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
    NotificationService.notify({
      id: "CreateContentSuccessId",
      message: contentNotificationMessages.CREATE_CONTENT_SUCCESS,
      type: NotificationTypeEnum.SUCCESS,
      timestamp: new Date(),
    });
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
      NotificationTypeEnum.SUCCESS
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

 
const getMetadataForContent = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  contentId: string,
  contentState: ContentState // Include contentState in the function parameters
): Promise<StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
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

