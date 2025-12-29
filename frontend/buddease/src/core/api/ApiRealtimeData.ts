// ApiRealtimeData.ts
import { handleApiErrorAndNotify } from '@/core/api/ApiData';
import axiosInstance from '@/core/api/csrfToken';
import { endpoints } from '@/core/api/endpointConfigurations';
import { AxiosError, AxiosResponse } from 'axios';

/**
 * Base API URL for realtime data endpoints
 */
const realtimeApiBaseURL = endpoints; // Ensure endpoints.realtime exists in configuration

/**
 * Interface defining all realtime data notification messages
 */
interface RealtimeNotificationMessages {
  FetchRealtimeDataErrorId: string;
  FetchRealtimeDataByIdErrorId: string;
  PostNewRealtimeDataErrorId: string;
  UpdateRealtimeDataErrorId: string;
  DeleteRealtimeDataErrorId: string;
}

/**
 * Notification messages for realtime data operations
 */
const realtimeNotificationMessages: RealtimeNotificationMessages = {
  FetchRealtimeDataErrorId:
    "An error occurred while fetching realtime data. Please try again later.",
  FetchRealtimeDataByIdErrorId:
    "An error occurred while fetching the realtime data entry. Please check the entry ID and try again.",
  PostNewRealtimeDataErrorId:
    "An error occurred while posting new realtime data. Please try again later.",
  UpdateRealtimeDataErrorId:
    "An error occurred while updating realtime data. Please check the data details and try again.",
  DeleteRealtimeDataErrorId:
    "An error occurred while deleting realtime data. Please try again later.",
};

/**
 * Generic handler for realtime data API errors
 */
const handleRealtimeApiErrorAndNotify = (
  error: AxiosError<unknown>,
  defaultMessage: string,
  errorId: keyof RealtimeNotificationMessages
) => {
  handleApiErrorAndNotify(
    error,
    defaultMessage,
    errorId,
    realtimeNotificationMessages
  );
};

/**
 * Fetch all realtime data records
 */
export const fetchRealtimeData = async (): Promise<any[]> => {
  try {
    const response: AxiosResponse<any[]> = await axiosInstance.get(
      `${realtimeApiBaseURL}/realtime-data`
    );
    return response.data;
  } catch (error) {
    handleRealtimeApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to fetch realtime data',
      'FetchRealtimeDataErrorId'
    );
    return [];
  }
};

/**
 * Fetch a single realtime data entry by ID
 */
export const fetchRealtimeDataById = async (dataId: number): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosInstance.get(
      `${realtimeApiBaseURL}/realtime-data/${dataId}`
    );
    return response.data;
  } catch (error) {
    handleRealtimeApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to fetch realtime data by ID',
      'FetchRealtimeDataByIdErrorId'
    );
    throw error;
  }
};

/**
 * Post a new realtime data entry
 */
export const postNewRealtimeData = async (newData: any): Promise<void> => {
  try {
    await axiosInstance.post(`${realtimeApiBaseURL}/realtime-data`, newData);
  } catch (error) {
    handleRealtimeApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to post new realtime data',
      'PostNewRealtimeDataErrorId'
    );
    throw error;
  }
};

/**
 * Update an existing realtime data entry
 */
export const updateRealtimeData = async (
  dataId: number,
  updatedData: any
): Promise<void> => {
  try {
    await axiosInstance.put(
      `${realtimeApiBaseURL}/realtime-data/${dataId}`,
      updatedData
    );
  } catch (error) {
    handleRealtimeApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to update realtime data',
      'UpdateRealtimeDataErrorId'
    );
    throw error;
  }
};

/**
 * Delete a realtime data entry
 */
export const deleteRealtimeData = async (dataId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`${realtimeApiBaseURL}/realtime-data/${dataId}`);
  } catch (error) {
    handleRealtimeApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to delete realtime data',
      'DeleteRealtimeDataErrorId'
    );
    throw error;
  }
};
