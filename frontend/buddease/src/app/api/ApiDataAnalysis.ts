// ApiDataAnalysis.ts
// ApiDataAnalysis.ts
import { NotificationType, NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError, AxiosResponse } from 'axios';
import dotProp from 'dot-prop';
import { useDataStore } from '../components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { addLog } from '../components/state/redux/slices/LogSlice';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
import { YourResponseType } from '../components/typings/types';
import { endpoints} from './ApiEndpoints';
import { handleApiError } from './ApiLogs';
import axiosInstance from './axiosInstance';
import headersConfig from './headers/HeadersConfig';
import { dataAnalysisSagas } from './fetchDataAnalysisAPI';
import { useDispatch } from 'react-redux';
import { DataAnalysisActions } from '../components/projects/DataAnalysisPhase/DataAnalysisActions';
const dispatch = useDispatch()
// Define the API base URL for data analysis

const DATA_ANALYSIS_BASE_URL = dotProp.getProperty(endpoints.dataAnalysis, 'dataAnalysis');

interface DataAnalysisNotificationMessages {
  ANALYZE_DATA_SUCCESS: string;
  ANALYZE_DATA_ERROR: string;
  GET_ANALYSIS_RESULTS_SUCCESS: string;
  GET_ANALYSIS_RESULTS_ERROR: string;
  // Add more keys as needed
}

// Define API notification messages for data analysis
const dataAnalysisNotificationMessages: DataAnalysisNotificationMessages = {
  ANALYZE_DATA_SUCCESS: NOTIFICATION_MESSAGES.DataAnalysis.ANALYZE_DATA_SUCCESS,
  ANALYZE_DATA_ERROR: NOTIFICATION_MESSAGES.DataAnalysis.ANALYZE_DATA_ERROR,
  GET_ANALYSIS_RESULTS_SUCCESS: NOTIFICATION_MESSAGES.DataAnalysis.GET_ANALYSIS_RESULTS_SUCCESS,
  GET_ANALYSIS_RESULTS_ERROR: NOTIFICATION_MESSAGES.DataAnalysis.GET_ANALYSIS_RESULTS_ERROR,
  // Add more properties as needed
};

// Function to handle API errors and notify for data analysis
export const handleDataAnalysisApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: string
) => {
  handleApiError(error, errorMessage);
  if (errorMessageId) {
    const errorMessageText = dotProp.getProperty(dataAnalysisNotificationMessages, errorMessageId);
    useNotification().notify(
      errorMessageId,
      errorMessageText as unknown as string,
      null,
      new Date(),
      'DataAnalysisApiClientError' as NotificationType
    );
  }
};

// Modify the fetchData function to accept the endpoint for data analysis
export async function fetchDataAnalysis(endpoint: string): Promise<YourResponseType> {
  try {
    const fetchDataAnalysisEndpoint = `${DATA_ANALYSIS_BASE_URL}${endpoint}`;
    const response = await axiosInstance.get<YourResponseType>(fetchDataAnalysisEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data analysis:', error);
    const errorMessage = 'Failed to fetch data analysis';
    handleDataAnalysisApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FetchDataAnalysisErrorId'
    );
    throw error;
  }
}
export const fetchSentimentAnalysis = async (text: string) => {
  try {
    const endpoint = dotProp.getProperty(
      DATA_ANALYSIS_BASE_URL,
      "sentimentAnalysis"
    );
    if (typeof endpoint !== "string") {
      throw new Error("Endpoint is not a string");
    }
    const response = await fetchDataAnalysis(endpoint);
    // Process sentiment analysis results
    const sentiment = response.data;
    const id = "someUniqueId"; // Provide the appropriate id value
    const state = {
      /* Provide the current state object */
    };
    useDataStore().updateData(Number(id), {
      ...state,
      sentimentAnalysis: sentiment,
      newData: text,
    });
    dispatch(
      DataAnalysisActions.addAnalysisLog({
        type: "info",
        message: "Sentiment analysis fetched successfully",
        timestamp: Date.now(),
      })
    );
  } catch (error: any) {
    handleDataAnalysisApiErrorAndNotify(
      error,
      NOTIFICATION_MESSAGES.errorMessage.FETCH_SENTIMENT_ANALYSIS_ERROR,
      "FetchSentimentAnalysisErrorId"
    );
  }
};

// Use fetchDataAnalysis to fetch analysis results

export const fetchAnalysisResults = async (): Promise<any> => {
  try {
    const endpoint = dotProp.getProperty(DATA_ANALYSIS_BASE_URL, 'getAnalysisResults');
    if (typeof endpoint !== 'string') {
      throw new Error('Endpoint is not a string');
    }

    const response: YourResponseType = await fetchDataAnalysis(endpoint);
    // Adjust according to the structure of your analysis results
    const analysisResults = response.analysisResults;
    return analysisResults;
  } catch (error: any) {
    handleDataAnalysisApiErrorAndNotify(
      error,
      NOTIFICATION_MESSAGES.errorMessage.FETCH_ANALYSIS_RESULTS_ERROR,
      'FetchAnalysisResultsErrorId'
    );
    throw error;
  }
};

// Add more functions as needed for data analysis API operations
