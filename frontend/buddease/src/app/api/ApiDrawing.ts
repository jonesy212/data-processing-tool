// ApiDrawing.ts
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import { AxiosError } from "axios";
import { YourResponseType } from "../components/typings/types";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";
import headersConfig from "./headers/HeadersConfig";
import useErrorHandling from "../components/hooks/useErrorHandling";
import { BaseData } from "../components/models/data/Data";
import { StructuredMetadata } from "../configs/StructuredMetadata";

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
      "ApiClientError" as NotificationType
    );
  }
};

// Fetch drawing data
export const fetchDrawing = <
  T extends BaseData<any> = BaseData<any, any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(): Promise<YourResponseType<T, K, Meta>> => {
  // Initialize the useErrorHandling hook
  const { handleError } = useErrorHandling();

  return new Promise<YourResponseType<T, K, Meta>>(async (resolve, reject) => {
    try {
      const fetchDrawingEndpoint = `${API_BASE_URL}/fetch`; // Adjust the endpoint as needed
      const response = await axiosInstance.get<YourResponseType<T, K, Meta>>(
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
  T extends BaseData<any> = BaseData<any, any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(drawingId: number): Promise<YourResponseType<T, K, Meta>> => {
  // Initialize the useErrorHandling hook
  const { handleError } = useErrorHandling();

  return new Promise<YourResponseType<T, K, Meta>>(async (resolve, reject) => {
    try {
      const fetchDrawingByIdEndpoint = `${API_BASE_URL}/fetch/${drawingId}`;
      const response = await axiosInstance.get<YourResponseType<T, K, Meta>>(
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
      NotificationTypeEnum.Success
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
      { drawingId },
      new Date(),
      NotificationTypeEnum.Success
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
      NotificationTypeEnum.Success
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
      { drawingId },
      new Date(),
      NotificationTypeEnum.Success
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
