// ApiVersion.ts

import { AxiosError } from "axios";
import axiosInstance from "./axiosInstance"; // Ensure this is set up correctly for API calls
import { NotificationType, useNotification } from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
import { handleApiError } from "./ApiLogs";
import { YourResponseType } from "../components/typings/types";
import { endpoints } from "./ApiEndpoints";
import { BaseData, Data } from "../components/models/data/Data";
import { Snapshot } from "../components/snapshots/LocalStorageSnapshotStore";
import { StructuredMetadata } from "../configs/StructuredMetadata";

// Define the API base URL for version data
const VERSION_DATA_BASE_URL = endpoints.versionData;

// Notification messages specific to version data
const versionDataNotificationMessages = {
  FETCH_VERSION_DATA_SUCCESS: NOTIFICATION_MESSAGES.VersionData.FETCH_VERSION_DATA_SUCCESS,
  FETCH_VERSION_DATA_ERROR: NOTIFICATION_MESSAGES.VersionData.FETCH_VERSION_DATA_ERROR,
  FETCH_ANALYSIS_RESULTS_ERROR: NOTIFICATION_MESSAGES.DataAnalysis.FETCH_ANALYSIS_RESULTS_ERROR
};

// Handle API errors specifically for version data
const handleVersionDataApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessageId: keyof typeof versionDataNotificationMessages
) => {
  handleApiError(error, "Version Data API error occurred");
  if (errorMessageId) {
    const errorMessageText = versionDataNotificationMessages[errorMessageId];
    useNotification().notify(
      errorMessageId,
      errorMessageText,
      null,
      new Date(),
      "VERSION_DATA_API_CLIENT_ERROR" as NotificationType
    );
  }
};

const fetchVersionData = <
  T extends BaseData, 
  K extends T = T,
>(snapshotId: string): Promise<Snapshot<T, K>> => {
  const fetchVersionDataEndpoint = `${VERSION_DATA_BASE_URL}/${snapshotId}`;

  return new Promise<Snapshot<T, K>>(async (resolve, reject) => {
    try {
      const response = await axiosInstance.get<Snapshot<T, K>>(fetchVersionDataEndpoint);
      resolve(response.data);  // Resolve the promise with the response data
    } catch (error) {
      console.error("Error fetching version data:", error);
      handleVersionDataApiErrorAndNotify(error as AxiosError<unknown>, "FETCH_VERSION_DATA_ERROR");
      reject(error);  // Reject the promise with the error
    }
  });
};

// Additional standard API methods can be defined below as needed

// Example: Fetch analytics data
const fetchAnalyticsData = async <
  T extends BaseData, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
  >(analyticsId: string
  
): Promise<YourResponseType<T, K, Meta>> => {
  const fetchAnalyticsEndpoint = `${VERSION_DATA_BASE_URL}/analytics/${analyticsId}`;

  try {
    const response = await axiosInstance.get<YourResponseType<T, K, Meta>>(fetchAnalyticsEndpoint);
    return Promise.resolve(response.data);  // Explicitly wrapping the return in a Promise if needed
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    handleVersionDataApiErrorAndNotify(error as AxiosError<unknown>, "FETCH_ANALYSIS_RESULTS_ERROR");
    return Promise.reject(error);
  }
};


// Example: Store versioned analytics data
const storeVersionedAnalyticsData = async (analyticsData: any): Promise<void> => {
  try {
    // Attempt to store versioned analytics data in local storage
    localStorage.setItem('versionedAnalyticsData', JSON.stringify(analyticsData));
    console.log('Versioned analytics data stored:', analyticsData);
  } catch (localStorageError) {
    console.error('Failed to store versioned analytics data:', localStorageError);
    // Optionally handle backend storage or notify
    // handleVersionDataApiErrorAndNotify(...);
  }
};


export {fetchVersionData,
    fetchAnalyticsData,
    storeVersionedAnalyticsData,}