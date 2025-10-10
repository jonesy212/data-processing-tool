// ApiDrawing.ts
import { handleApiError } from '@/app/api/ApiLogs';
import axiosInstance from "@/app/api/csrfToken";
import { endpoints } from "@/app/api/endpointConfigurations";
import headersConfig from "@/app/api/headers/HeadersConfig";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/context/NotificationContext";
import useErrorHandling from "@/app/hooks/useErrorHandling";
import { YourResponseType } from "@/app/typings/responseTypes";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { AxiosError } from "axios";



// Define the API base URL
const API_BASE_URL = endpoints.drawing; // Accessing property directly

// Define API notification messages for drawing operations
interface DrawingNotificationMessages {
  FETCH_DRAWING_SUCCESS: string;
  FETCH_DRAWING_ERROR: string;
  CREATE_DRAWING_SUCCESS: string;
  CREATE_DRAWING_ERROR: string;
  UPDATE_DRAWING_SUCCESS: string;
  UPDATE_DRAWING_ERROR: string;
  DELETE_DRAWING_SUCCESS: string;
  DELETE_DRAWING_ERROR: string;
  // Add more keys as needed
}

const drawingNotificationMessages: DrawingNotificationMessages = {
  FETCH_DRAWING_SUCCESS: "Drawing fetched successfully",
  FETCH_DRAWING_ERROR: "Failed to fetch drawing",
  CREATE_DRAWING_SUCCESS: "Drawing created successfully",
  CREATE_DRAWING_ERROR: "Failed to create drawing",
  UPDATE_DRAWING_SUCCESS: "Drawing updated successfully",
  UPDATE_DRAWING_ERROR: "Failed to update drawing",
  DELETE_DRAWING_SUCCESS: "Drawing deleted successfully",
  DELETE_DRAWING_ERROR: "Failed to delete drawing",
  // Add more messages as needed
};

// Function to handle API errors and notify
export const handleDrawingApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof DrawingNotificationMessages
) => {
  handleApiError(error, errorMessage);
  if (errorMessageId) {
    const errorMessageText = drawingNotificationMessages[errorMessageId];
    useNotification().notify(
      errorMessageId,
      errorMessageText,
      null,
      new Date(),
      NotificationTypeEnum.API_CLIENT_ERROR,
      "ApiClientError" as NotificationType
    );
  }
};

// Fetch drawing data
export const fetchDrawing = <
  T extends BaseDataEntity, 
  K extends T, 
  Meta extends DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): Promise<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  // Initialize the useErrorHandling hook
  const { handleError } = useErrorHandling();

  return new Promise<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(async (resolve, reject) => {
    try {
      const fetchDrawingEndpoint = `${API_BASE_URL}/fetch`; // Adjust the endpoint as needed
      const response = await axiosInstance.get<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
        fetchDrawingEndpoint,
        {
          headers: headersConfig,
        }
      );
      resolve(response.data);
    } catch (error: any) {
      console.error("Error fetching drawing:", error);
      const errorMessage = "Failed to fetch drawing";
      handleError(errorMessage, { componentStack: error.stack });
      reject(error);
    }
  });
};

// Fetch drawing data by ID
export const fetchDrawingById = <
  T extends BaseDataEntity, 
  K extends T, 
  Meta extends DefaultMeta<T, K>, 
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(drawingId: number): Promise<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  // Initialize the useErrorHandling hook
  const { handleError } = useErrorHandling();

  return new Promise<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(async (resolve, reject) => {
    try {
      const fetchDrawingByIdEndpoint = `${API_BASE_URL}/fetch/${drawingId}`;
      const response = await axiosInstance.get<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
        fetchDrawingByIdEndpoint,
        {
          headers: headersConfig
        }
      );
      resolve(response.data);
    } catch (error: any) {
      console.error("Error fetching drawing by ID:", error);
      const errorMessage = "Failed to fetch drawing by ID";
      handleError(errorMessage, { componentStack: error.stack });
      reject(error);
    }
  });
};

// Create a new drawing
export const createDrawing = async (newDrawingData: any): Promise<void> => {
  try {
    const createDrawingEndpoint = `${API_BASE_URL}/create`; // Adjust the endpoint as needed
    await axiosInstance.post(createDrawingEndpoint, newDrawingData, {
      headers: headersConfig,
    });
    // Notify success message
    useNotification().notify(
      "CreateDrawingSuccessId",
      drawingNotificationMessages.CREATE_DRAWING_SUCCESS,
      null,
      new Date(),
      NotificationTypeEnum.SUCCESS
    );
  } catch (error: any) {
    console.error("Error creating drawing:", error);
    handleDrawingApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to create drawing",
      "CreateDrawingErrorId" as keyof DrawingNotificationMessages
    );
    throw error;
  }
};

// Update an existing drawing
export const updateDrawing = async (
  drawingId: number,
  updatedDrawingData: any
): Promise<void> => {
  try {
    const updateDrawingEndpoint = `${API_BASE_URL}/update/${drawingId}`; // Adjust the endpoint as needed
    await axiosInstance.put(updateDrawingEndpoint, updatedDrawingData, {
      headers: headersConfig,
    });
    // Notify success message
    useNotification().notify(
      "UpdateDrawingSuccessId",
      drawingNotificationMessages.UPDATE_DRAWING_SUCCESS,
      `${drawingNotificationMessages.UPDATE_DRAWING_SUCCESS} (ID: ${drawingId})`, 
      new Date(),
      NotificationTypeEnum.SUCCESS
    );
  } catch (error: any) {
    console.error("Error updating drawing:", error);
    handleDrawingApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to update drawing",
      "UpdateDrawingErrorId" as keyof DrawingNotificationMessages
    );
    throw error;
  }
};

export const saveDrawingToDatabase = async (
  drawingData: any
): Promise<boolean> => {
  try {
    const saveDrawingEndpoint = `${API_BASE_URL}/save`;
    await axiosInstance.post(saveDrawingEndpoint, drawingData, {
      headers: headersConfig,
    });

    useNotification().notify(
      "SaveDrawingSuccessId",
      drawingNotificationMessages.CREATE_DRAWING_SUCCESS,
      null,
      new Date(),
      NotificationTypeEnum.SUCCESS
    );

    // Return true to indicate successful saving
    return true;
  } catch (error: any) {
    console.error("Error saving drawing to database:", error);
    handleDrawingApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to save drawing to database",
      "SaveDrawingErrorId"  as keyof DrawingNotificationMessages
    );
    // Return false to indicate failure
    return false;
  }
};

// Delete a drawing
export const deleteDrawing = async (drawingId: number): Promise<void> => {
  try {
    const deleteDrawingEndpoint = `${API_BASE_URL}/delete/${drawingId}`; // Adjust the endpoint as needed
    await axiosInstance.delete(deleteDrawingEndpoint, {
      headers: headersConfig,
    });
    // Notify success message
    useNotification().notify(
      "DeleteDrawingSuccessId",
      drawingNotificationMessages.DELETE_DRAWING_SUCCESS,
      `${drawingNotificationMessages.DELETE_DRAWING_SUCCESS} (ID: ${drawingId})`, 
      new Date(),
      NotificationTypeEnum.SUCCESS
    );
  } catch (error: any) {
    console.error("Error deleting drawing:", error);
    handleDrawingApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to delete drawing",
      "DeleteDrawingErrorId"  as keyof DrawingNotificationMessages
    );
    throw error;
  }
};
