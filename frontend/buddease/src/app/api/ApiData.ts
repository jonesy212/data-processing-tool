// ApiData.ts
import { NotificationType, NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError, AxiosResponse } from 'axios';
import dotProp from 'dot-prop';
import HighlightEvent from '../components/documents/screenFunctionality/HighlightEvent';
import { useDataStore } from '../components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { addLog } from '../components/state/redux/slices/LogSlice';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
import { YourResponseType } from '../components/typings/types';
import Version from '../components/versions/Version';
import { endpoints } from './ApiEndpoints';
import { handleApiError } from './ApiLogs';
import axiosInstance from './axiosInstance';
import headersConfig from './headers/HeadersConfig';

// Define the API base URL
const API_BASE_URL = dotProp.getProperty(endpoints, 'data');

interface DataNotificationMessages {
  FETCH_DATA_DETAILS_SUCCESS: string;
  FETCH_DATA_DETAILS_ERROR: string;
  UPDATE_DATA_DETAILS_SUCCESS: string;
  UPDATE_DATA_DETAILS_ERROR: string;
  ERROR_WRITING_TO_CACHE: string;
  // Add more keys as needed
}

// Define API notification messages
const apiNotificationMessages: DataNotificationMessages = {
  FETCH_DATA_DETAILS_SUCCESS: NOTIFICATION_MESSAGES.Client.FETCH_CLIENT_DETAILS_SUCCESS,
  FETCH_DATA_DETAILS_ERROR: NOTIFICATION_MESSAGES.Client.FETCH_CLIENT_DETAILS_ERROR,
  UPDATE_DATA_DETAILS_SUCCESS: NOTIFICATION_MESSAGES.Client.UPDATE_CLIENT_DETAILS_SUCCESS,
  UPDATE_DATA_DETAILS_ERROR: NOTIFICATION_MESSAGES.Client.UPDATE_CLIENT_DETAILS_ERROR,
  ERROR_WRITING_TO_CACHE: NOTIFICATION_MESSAGES.Cache.ERROR_WRITING_TO_CACHE
  // Add more properties as needed
};
// Function to handle API errors and notify
export const handleApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: keyof DataNotificationMessages
) => {
  handleApiError(error, errorMessage);
  if (errorMessageId) {
    const errorMessageText = apiNotificationMessages[errorMessageId];
    useNotification().notify(
      errorMessageId,
      errorMessageText,
      null,
      new Date(),
      "ApiClientError" as NotificationType
    );
  }
};


// Modify the fetchData function to accept the endpoint for fetching highlights
export async function fetchData(endpoint: string): Promise<YourResponseType> {
  try {
    const fetchDataEndpoint = `${API_BASE_URL}${endpoint}`;
    const response = await axiosInstance.get<YourResponseType>(fetchDataEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    const errorMessage = 'Failed to fetch data';
    handleApiErrorAndNotify(
      error as AxiosError<unknown>,
      errorMessage,
      'FetchDataErrorId' as keyof DataNotificationMessages
    );
    throw error;
  }
}


// Use fetchData to fetch highlights

// Use fetchData to fetch highlights
export const fetchHighlights = async (): Promise<HighlightEvent[]> => {
  try {
    // Use dotProp to retrieve the endpoint string
    const endpoint = dotProp.getProperty(endpoints, 'highlights.list');
    
    if (typeof endpoint !== 'string') {
      throw new Error('Endpoint is not a string');
    }

    const response: YourResponseType = await fetchData(endpoint);
    // Assuming highlights are nested within YourResponseType, adjust this accordingly
    const highlights = response.highlights as HighlightEvent[];
    return highlights;
  } catch (error: any) {
    handleApiError(
      error,
      NOTIFICATION_MESSAGES.errorMessage.FETCH_HIGHLIGHTS_ERROR
    );
    throw error;
  }
};

export const addData = async (newData: Omit<any, 'id'>, highlight: Omit<HighlightEvent, 'id'>): Promise<void> => {
  try {
    // Ensure the endpoint is accessed correctly using dot notation
    const addDataEndpoint = `${API_BASE_URL}.addData`; 
    const response = await axiosInstance.post(addDataEndpoint, newData);

    if (response.status === 200 || response.status === 201) {
      const createdData = response.data;
      addLog(`Data added: ${JSON.stringify(createdData)}`); // Log successful data addition

      const dataStore = useDataStore();
      dataStore.addDataSuccess({ data: createdData });
    } else {
      console.error('Failed to add data:', response.statusText);
    }
  } catch (error) {
    console.error('Error adding data:', error);
    handleApiErrorAndNotify(error as AxiosError<unknown>,
      'Failed to add data',
      'AddDataErrorId' as keyof DataNotificationMessages
    );
  }
};


export const removeData = async (dataId: number): Promise<void> => {
  try {
    const deleteDataEndpoint = `${API_BASE_URL}.deleteData.${dataId}`;
    if (deleteDataEndpoint) {
      await axiosInstance.delete(deleteDataEndpoint);
    } else {
      throw new Error(`Delete endpoint not found for data ID: ${dataId}`);
    }
  } catch (error) {
    console.error('Error removing data:', error);
    handleApiErrorAndNotify(error as AxiosError<unknown>,
      'Failed to remove data',
      'RemoveDataErrorId' as keyof DataNotificationMessages
    );
  }
};

export const getDataVersions = async (
  versionId: number
): Promise<Version[]> => {
  try {
    const versionsEndpoint = `${API_BASE_URL}.getDataVersions.${versionId}`;

    if (!versionsEndpoint) {
      throw new Error(
        `Versions endpoint not found for version ID: ${versionId}`
      );
    }
    const response:AxiosResponse = await axiosInstance.get<Version[]>(versionsEndpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching versions:", error);
    handleApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch versions",
      "FetchVersionsErrorId" as keyof DataNotificationMessages
    );
    return []; // Return an empty array in case of error
  }
};

export const updateData = async (dataId: number, newData: any): Promise<any> => {
  try {
    const dataUpdateUrl = `${API_BASE_URL}.updateData.${dataId}`;
    if (!dataUpdateUrl) {
      throw new Error(`Update data endpoint not found for data ID: ${dataId}`);
    }
  
    // Integrate header management
    const response: AxiosResponse = await axiosInstance.put(
      dataUpdateUrl,
      newData,
      { headers: headersConfig } 
    );
  
    const updatedData = response.data;
  
    // Notify success message
    const successMessage = dotProp.deepKeys(apiNotificationMessages.UPDATE_DATA_DETAILS_ERROR) as unknown as string
    if (!successMessage) {
      throw new Error('Success message not found for update data operation');
    }
    useNotification().notify(
      'UpdateDataSuccessId',
      successMessage,
      { dataId },
      new Date(),
      NotificationTypeEnum.Success
    );
  
      
    addLog(`Data updated: ${JSON.stringify(updatedData)}`); // Log successful data update
  
    return updatedData;
  } catch (error: any) {
    // Handle error and notify failure message
    const errorMessage = 'Failed to update data';
    handleApiError(error, errorMessage);
    const errorMessageId = dotProp.deepKeys(apiNotificationMessages.UPDATE_DATA_DETAILS_ERROR) as unknown as string;
    if (!errorMessageId) {
      throw new Error('Error message ID not found for update data operation');
    }
    useNotification().notify(
      'UpdateDataErrorId',
      errorMessageId,
      { dataId, error: errorMessage },
      new Date(),
      NotificationTypeEnum.Error
    );
  
    throw error;
  }
};


export const fetchDataById = async (dataId: number): Promise<any> => {
  try {
    const fetchDataByIdEndpoint = `${API_BASE_URL}/single/${dataId}`;
    const response = await axiosInstance.get(fetchDataByIdEndpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching data by ID:", error);
    handleApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch data by ID",
      "FetchDataByIdError" as keyof DataNotificationMessages
    );
    throw error;
  }
};

export const createData = async (newData: any): Promise<void> => {
  try {
    const createDataEndpoint = `${API_BASE_URL}.addData`;
    await axiosInstance.post(createDataEndpoint, newData);
  } catch (error: any) {
    console.error('Error creating data:', error);
    handleApiErrorAndNotify(error as AxiosError<unknown>,
      'Failed to create data',
      'CreateDataErrorId' as keyof DataNotificationMessages
    );
    throw error;
  }
};

export const deleteData = async (dataId: number): Promise<void> => {
  try {
    const deleteDataEndpoint = `${API_BASE_URL}.deleteData.${dataId}`;
    await axiosInstance.delete(deleteDataEndpoint);
  } catch (error: any) {
    const errorMessage = 'Failed to delete data';
    console.error(errorMessage, error);
    handleApiErrorAndNotify(
      error as AxiosError<unknown>, errorMessage,
      'DeleteDataErrorId' as keyof DataNotificationMessages
    );
    throw error;
  }
};

export const getBackendVersion = async (): Promise<string> => {
  try {
    const versionEndpoint = `${API_BASE_URL}.getBackendVersion`;

    const response = await axiosInstance.get(versionEndpoint);
    return response.data.toString();
  } catch (error) {
    console.error("Error fetching backend version:", error);
    handleApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to fetch backend version",
      "FetchBackendVersionErrorId" as keyof DataNotificationMessages
    );
  }
  return "unknown";
};

export const getFrontendVersion = async (): Promise<string> => {
  try {
    return process.env.REACT_APP_VERSION || "unknown";
  } catch (error) {
    console.error("Error fetching frontend version:", error);
    return "unknown";
  }
};
