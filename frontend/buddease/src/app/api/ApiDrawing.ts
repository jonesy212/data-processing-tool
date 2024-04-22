// ApiDrawing.ts
import {
    NotificationType,
    NotificationTypeEnum,
    useNotification,
} from "@/app/components/support/NotificationContext";
import { AxiosError } from "axios";
import dotProp from "dot-prop";
import { YourResponseType } from "../components/typings/types";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";
import headersConfig from "./headers/HeadersConfig";

// Define the API base URL
const API_BASE_URL = dotProp.getProperty(endpoints, "drawing");

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
  errorMessageId: string
) => {
  handleApiError(error, errorMessage);
  if (errorMessageId) {
    const errorMessageText = dotProp.getProperty(
      drawingNotificationMessages,
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

// Fetch drawing data
export async function fetchDrawing(): Promise<YourResponseType> {
  try {
    const fetchDrawingEndpoint = `${API_BASE_URL}/fetch`; // Adjust the endpoint as needed
    const response = await axiosInstance.get<YourResponseType>(
      fetchDrawingEndpoint,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching drawing:", error);
    const errorMessage = "Failed to fetch drawing";
    handleDrawingApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      "FetchDrawingErrorId"
    );
    throw error;
  }
}

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
      "CreateDrawingErrorId"
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
      "UpdateDrawingErrorId"
    );
    throw error;
  }
};
export const saveDrawingToDatabase = async (
  drawingData: any
): Promise<void> => {
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
  } catch (error: any) {
    console.error("Error saving drawing to database:", error);
    handleDrawingApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to save drawing to database",
      "SaveDrawingErrorId"
    );
    throw error;
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
      "DeleteDrawingErrorId"
    );
    throw error;
  }
};
