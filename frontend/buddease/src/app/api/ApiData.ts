// ApiData.ts
// import { endpoints } from './ApiEndpoints';
import { NotificationType, NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError, AxiosResponse } from 'axios';
import HighlightEvent from '../components/documents/screenFunctionality/HighlightEvent';
import { useDataStore } from '../components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { addLog } from '../components/state/redux/slices/LogSlice';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
import { YourResponseType } from '../components/typings/types';
import Version from '../components/versions/Version';
import { handleApiError } from './ApiLogs';
import axiosInstance from './axiosInstance';
import headersConfig from './headers/HeadersConfig';
import NotificationStore from '../components/state/stores/NotificationStore';
import { notificationStore } from '../components/support/NotificationProvider';
import { endpoints } from './endpointConfigurations';
// Define the API base URL
const { data: API_BASE_URL } = endpoints;
export let setDynamicData: React.Dispatch<React.SetStateAction<any>>; // Define setDynamicData globally

interface DataNotificationMessages {
  FETCH_DATA_DETAILS_SUCCESS: string;
  FETCH_DATA_DETAILS_ERROR: string;
  UPDATE_DATA_DETAILS_SUCCESS: string;
  UPDATE_DATA_DETAILS_ERROR: string;
  ERROR_WRITING_TO_CACHE: string;
  FETCH_DEX_DATA_ERROR: string;
  FETCH_EXCHANGE_DATA_ERROR: string;
  // Add more keys as needed
}

// Define API notification messages
export const apiNotificationMessages: DataNotificationMessages = {
  FETCH_DATA_DETAILS_SUCCESS: NOTIFICATION_MESSAGES.Client.FETCH_CLIENT_DETAILS_SUCCESS,
  FETCH_DATA_DETAILS_ERROR: NOTIFICATION_MESSAGES.Client.FETCH_CLIENT_DETAILS_ERROR,
  UPDATE_DATA_DETAILS_SUCCESS: NOTIFICATION_MESSAGES.Client.UPDATE_CLIENT_DETAILS_SUCCESS,
  UPDATE_DATA_DETAILS_ERROR: NOTIFICATION_MESSAGES.Client.UPDATE_CLIENT_DETAILS_ERROR,
  ERROR_WRITING_TO_CACHE: NOTIFICATION_MESSAGES.Cache.ERROR_WRITING_TO_CACHE,
  FETCH_DEX_DATA_ERROR: NOTIFICATION_MESSAGES.DEX.FETCH_DEX_DATA_ERROR,
  FETCH_EXCHANGE_DATA_ERROR: NOTIFICATION_MESSAGES.DEX.FETCH_DEX_DATA_ERROR,
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



export const fetchData = async (endpoint: string, id: number): Promise<{ data: YourResponseType } | null> => {
  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    // Return the data wrapped in an object with a 'data' property
    return { data };
  } catch (error) {
    // Handle any errors that occur during the fetch operation
    console.error("Failed to fetch data:", error);
    return null;
  }
};


export const getBackendVersion = async (): Promise<string> => {
  try {
    const response = await axiosInstance.get(endpoints.version.backend);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching backend version:", error);
    return "unknown";
  }
};


// Use fetchData to fetch highlights
export const fetchHighlights = async (): Promise<HighlightEvent[]> => {
  try {
    // Access the endpoint directly from the endpoints object
    const endpoint = endpoints.highlights.list;

    if (typeof endpoint !== "string") {
      throw new Error("Endpoint is not a string");
    }

    const response = await fetchData(endpoint);
    if (!response || !response.data) {
      throw new Error("Response or response.data is null");
    }
    const highlights = response.data.highlights as HighlightEvent[];
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


// Function to update data
export const updateData = async (dataId: number, newData: any): Promise<any> => {
  try {
    const dataUpdateUrl = `${API_BASE_URL}.updateData.${dataId}`;
    if (!dataUpdateUrl) {
      throw new Error(`Update data endpoint not found for data ID: ${dataId}`);
    }

    // Integrate header management
    const response = await axiosInstance.put(
      dataUpdateUrl,
      newData,
      { headers: headersConfig } 
    );

    const updatedData = response.data;

    // Notify success message
    const successMessage = apiNotificationMessages.UPDATE_DATA_DETAILS_ERROR;
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
    const errorMessageId = apiNotificationMessages.UPDATE_DATA_DETAILS_ERROR;
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


export const getStoreIds = async (storeId: number): Promise<void> => {
  try {
    const storeIdEndpoint = `${API_BASE_URL}/store/${storeId}`;
    const response = await axiosInstance.get(storeIdEndpoint);
    
    // Assuming response.data contains the necessary data to notify
    const storeData = response.data;
    const storeIdKey = `storeId_${storeId}`;
    const notificationContent = `Store ID: ${storeId}, Data: ${JSON.stringify(storeData)}`;
    const notificationDate = new Date();
    const notificationType = NotificationTypeEnum.GetStoreSuccess;

    // Assuming you have a singleton instance of NotificationStore
    notificationStore.notify(
      storeIdKey,
      notificationContent,
      notificationDate,
      notificationType
    );
  } catch (error) {
    console.error('Error fetching store ID:', error);
    handleApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to fetch store ID',
      'FetchStoreIdError' as keyof DataNotificationMessages
    );
    throw error;
  }
};




export const getStoreId = async (storeId: number): Promise<void> => {
  try {
    const storeIdEndpoint = `${API_BASE_URL}/store/${storeId}`;
    const response = await axiosInstance.get(storeIdEndpoint);
    
    // Assuming response.data contains the necessary data to notify
    const storeData = response.data;
    const storeIdKey = `storeId_${storeId}`;
    const notificationContent = `Store ID: ${storeId}, Data: ${JSON.stringify(storeData)}`;
    const notificationDate = new Date();
    const notificationType = NotificationTypeEnum.GetStoreSuccess;

    // Assuming you have a singleton instance of NotificationStore
    notificationStore.notify(
      storeIdKey,
      notificationContent,
      notificationDate,
      notificationType
    );
  } catch (error) {
    console.error('Error fetching store ID:', error);
    handleApiErrorAndNotify(
      error as AxiosError<unknown>,
      'Failed to fetch store ID',
      'FetchStoreIdError' as keyof DataNotificationMessages
    );
    throw error;
  }
};



// Function to fetch updated dynamic data from API
export const fetchUpdatedDynamicData = async () => {
  try {
    const updatedDynamicDataEndpoint = `${API_BASE_URL}/your-api-endpoint`; // Update with your API endpoint
    const response = await axiosInstance.get(updatedDynamicDataEndpoint);
    const updatedData = response.data;
    setDynamicData(updatedData);
  } catch (error: any) {
    console.error('Error fetching updated dynamic data:', error);
    // Handle error using the provided pattern
    handleApiErrorAndNotify(error,
      "Failed to fetch updated dynamic data",
      "FetchUpdatedDynamicDataErrorId" as keyof DataNotificationMessages
    );
  }
};


export const getFrontendVersion = async (): Promise<string> => {
  try {
    // Adjust the endpoint path as necessary
    const response = await axiosInstance.get(endpoints.version.frontend);
    return response.data.version; // Assuming the response structure has a `version` field
  } catch (error: any) {
    console.error("Error fetching frontend version:", error);
    handleApiErrorAndNotify(error, "Failed to fetch frontend version", "GetFrontendVersionErrorId" as keyof DataNotificationMessages)
    return "unknown";
  }
};


export const getAllKeys = async (): Promise<string[]> => {
  try {
    const allKeysEndpoint = `${API_BASE_URL}.getAllKeys`;
    const response = await axiosInstance.get(allKeysEndpoint);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching all keys:", error);

    // Handle error using the provided pattern
    handleApiErrorAndNotify(error, "Failed to fetch all keys", "GetAllKeysErrorId" as keyof DataNotificationMessages)
    return [];
  }
}
