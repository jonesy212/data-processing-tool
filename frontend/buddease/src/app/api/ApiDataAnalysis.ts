// ApiDataAnalysis.ts
import {
  NotificationType,
  useNotification
} from "@/app/components/support/NotificationContext";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { Data } from "../components/models/data/Data";
import { PriorityTypeEnum } from "../components/models/data/StatusType";
import { DataAnalysisResult } from "../components/projects/DataAnalysisPhase/DataAnalysisResult";
import { Snapshot } from "../components/snapshots/LocalStorageSnapshotStore";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
import { YourResponseType } from "../components/typings/types";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";
import headersConfig from "./headers/HeadersConfig";
const dispatch = useDispatch();
// Define the API base URL for data analysis

const DATA_ANALYSIS_BASE_URL = endpoints.dataAnalysis;


// Validate and extract the endpoint

const getEndpoint = (): string => {
  if (typeof DATA_ANALYSIS_BASE_URL !== "object" || !DATA_ANALYSIS_BASE_URL) {
    throw new Error("DATA_ANALYSIS_BASE_URL is not an object or is null/undefined");
  }

  const sentimentAnalysisEndpoint = DATA_ANALYSIS_BASE_URL.getSentimentAnalysisResults;

  if (typeof sentimentAnalysisEndpoint !== "string") {
    throw new Error("Endpoint getSentimentAnalysisResults is not a string");
  }

  return sentimentAnalysisEndpoint;
};




interface DataAnalysisNotificationMessages {
  ANALYZE_DATA_SUCCESS: string;
  ANALYZE_DATA_ERROR: string;
  // GET_ANALYSIS_RESULTS_SUCCESS: string;
  // GET_ANALYSIS_RESULTS_ERROR: string;
  FETCH_ANALYSIS_RESULTS_ERROR: string;
  // Add more keys as needed
}

// Define API notification messages for data analysis
const dataAnalysisNotificationMessages: DataAnalysisNotificationMessages = {
  ANALYZE_DATA_SUCCESS: NOTIFICATION_MESSAGES.DataAnalysis.ANALYZE_DATA_SUCCESS,
  ANALYZE_DATA_ERROR: NOTIFICATION_MESSAGES.DataAnalysis.ANALYZE_DATA_ERROR,
  FETCH_ANALYSIS_RESULTS_ERROR: NOTIFICATION_MESSAGES.DataAnalysis.FETCH_ANALYSIS_RESULTS_ERROR,
  // Add more properties as needed
};

// Function to handle API errors and notify for data analysis
export const handleDataAnalysisApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof DataAnalysisNotificationMessages
) => {
  handleApiError(error, errorMessage);
  if (errorMessageId) {
    const errorMessageText = dataAnalysisNotificationMessages[errorMessageId];
    useNotification().notify(
      errorMessageId,
      errorMessageText,
      null,
      new Date(),
      "DATA_ANALYSIS_API_CLIENT_ERROR" as NotificationType
    );
  }
};

// Function to fetch data analysis
export function fetchDataAnalysis(
  endpoint: string,
  text?: string
): Promise<YourResponseType | Snapshot<Data>> {
  const fetchDataAnalysisEndpoint = `${DATA_ANALYSIS_BASE_URL}${endpoint}`;
  const config = {
    headers: headersConfig,
    params: text ? { text } : undefined, // Add text as params if provided
  };

  return axiosInstance
    .get<YourResponseType | Snapshot<Data>>(fetchDataAnalysisEndpoint, config)
    .then((response) => response.data as Snapshot<Data>)
    .catch((error) => {
      console.error("Error fetching data analysis:", error);
      const errorMessage = "Failed to fetch data analysis";
      handleDataAnalysisApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        "FETCH_ANALYSIS_RESULTS_ERROR"
      );
      return Promise.reject(error);
    });
}

// Function to fetch analysis results
export const fetchAnalysisResults = (): Promise<any> => {
  const endpoint = DATA_ANALYSIS_BASE_URL.getAnalysisResults;

  if (typeof endpoint !== "string") {
    return Promise.reject(new Error("Endpoint is not a string"));
  }

  
  return fetchDataAnalysis(endpoint)
    .then((response) => {
      const analysisResults = response.data as DataAnalysisResult;
      if (!analysisResults) {
        return Promise.reject(new Error("Invalid response data"));
      }
      const { description, phase, priority, sentiment,sentimentAnalysis, ...rest } = analysisResults;
      return {
        ...rest,
        description: description ?? undefined,
        phase: phase ?? undefined,
        priority: priority as PriorityTypeEnum | undefined,
        data: analysisResults.data,
        sentiment: analysisResults.sentiment,
        sentimentAnalysis: analysisResults.sentimentAnalysis,
      };
    })

    .catch((error) => {
      handleDataAnalysisApiErrorAndNotify(
        error as AxiosError<unknown>,
        NOTIFICATION_MESSAGES.errorMessage.FETCH_ANALYSIS_RESULTS_ERROR,
        "FETCH_ANALYSIS_RESULTS_ERROR"
      );
      return Promise.reject(error);
    });
}

export const fetchSentimentAnalysisResults = (text: string): Promise<string> => {
  const endpoint = getEndpoint();

  return fetchDataAnalysis(endpoint, text) // Pass text directly
    .then((result: any) => result.sentiment)
    .catch((error: any) => {
      console.error("Error performing sentiment analysis:", error);
      return "Unknown"; // Return 'Unknown' sentiment in case of error
    });
};



export const storeAnalyticsData = async (analyticsData: any): Promise<void> => {
  try {
    // Attempt to store analytics data in local storage
    localStorage.setItem('analyticsData', JSON.stringify(analyticsData));
    console.log('Analytics data stored in local storage:', analyticsData);
  } catch (localStorageError) {
    console.error('Failed to store analytics data in local storage:', localStorageError);

    try {
      // If storing in local storage fails or if it's not available, send to backend
      await sendAnalyticsDataToBackend(analyticsData);
    } catch (backendError) {
      console.error('Failed to send analytics data to backend:', backendError);
      // Handle the error using the API error handler and notify
      handleDataAnalysisApiErrorAndNotify(
        backendError as AxiosError<unknown>,
        'Failed to store analytics data',
        'FETCH_ANALYSIS_RESULTS_ERROR' // Example error message key from dataAnalysisNotificationMessages
      );
      throw new Error('Failed to store analytics data');
    }
  }
};

export const sendAnalyticsDataToBackend = async (analyticsData: any): Promise<void> => {
  try {
    const response = await axiosInstance.post('/analytics', analyticsData);
    console.log('Analytics data sent to backend successfully:', response.data);
  } catch (error) {
    console.error('Failed to send analytics data to backend:', error);
    throw new Error('Failed to send analytics data to backend');
  }
};