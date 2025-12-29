// ApiData.ts
import internalApiService from "@/core/api/ApiClient";
import { fetchUserIdsFromDatabase } from "@/core/api/ApiDatabase";
import { handleApiError } from '@/core/api/ApiLogs';
import { endpoints } from '@/core/api/endpointConfigurations';
import { headersConfig } from '@/core/components/shared/SharedHeaders';
import NOTIFICATION_MESSAGES from '@/core/features/support/NotificationMessages';
import { notificationStore } from '@/core/features/support/NotificationProvider';
import { NotificationType, NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import HighlightEvent from '@/core/highlighting/screenFunctionality/HighlightEvent';
import { useNotification } from '@/core/state/context/NotificationContext';
import { addLog } from '@/core/state/redux/slices/LogSlice';
import { useDataStore } from '@/core/state/stores/DataStore';
import { YourResponseType } from '@/core/typings/responseTypes';
import { AxiosError, AxiosResponse } from 'axios';

// Define the API base URL
const { data: API_BASE_URL } = endpoints;
export let setDynamicData: React.Dispatch<React.SetStateAction<any>>;

interface DataNotificationMessages {
  FETCH_DATA_DETAILS_SUCCESS: string;
  FETCH_DATA_DETAILS_ERROR: string;
  UPDATE_DATA_DETAILS_SUCCESS: string;
  UPDATE_DATA_DETAILS_ERROR: string;
  ERROR_WRITING_TO_CACHE: string;
  FETCH_DEX_DATA_ERROR: string;
  FETCH_EXCHANGE_DATA_ERROR: string;
  GENERATE_VERSION_ERROR_ID: string;
  FETCH_HIGHLIGHTS_ERROR: string;
  ADD_DATA_SUCCESS: string;
  ADD_DATA_ERROR: string;
  REMOVE_DATA_SUCCESS: string;
  REMOVE_DATA_ERROR: string;
  GET_STORE_SUCCESS: string;
  GET_STORE_ERROR: string;
  GET_VERSIONS_SUCCESS: string;
  GET_VERSIONS_ERROR: string;
  GET_KEYS_SUCCESS: string;
  GET_KEYS_ERROR: string;
  GET_DYNAMIC_DATA_SUCCESS: string;
  GET_DYNAMIC_DATA_ERROR: string;
}

// Define API notification messages
const apiNotificationMessages: DataNotificationMessages = {
  FETCH_DATA_DETAILS_SUCCESS: NOTIFICATION_MESSAGES.Client.FETCH_CLIENT_DETAILS_SUCCESS,
  FETCH_DATA_DETAILS_ERROR: NOTIFICATION_MESSAGES.Client.FETCH_CLIENT_DETAILS_ERROR,
  UPDATE_DATA_DETAILS_SUCCESS: NOTIFICATION_MESSAGES.Client.UPDATE_CLIENT_DETAILS_SUCCESS,
  UPDATE_DATA_DETAILS_ERROR: NOTIFICATION_MESSAGES.Client.UPDATE_CLIENT_DETAILS_ERROR,
  ERROR_WRITING_TO_CACHE: NOTIFICATION_MESSAGES.Cache.ERROR_WRITING_TO_CACHE,
  FETCH_DEX_DATA_ERROR: NOTIFICATION_MESSAGES.DEX.FETCH_DEX_DATA_ERROR,
  FETCH_EXCHANGE_DATA_ERROR: NOTIFICATION_MESSAGES.DEX.FETCH_EXCHANGE_DATA_ERROR,
  GENERATE_VERSION_ERROR_ID: NOTIFICATION_MESSAGES.Version.GENERATE_VERSION_ERROR_ID,
  FETCH_HIGHLIGHTS_ERROR: "Failed to fetch highlights",
  ADD_DATA_SUCCESS: "Data added successfully",
  ADD_DATA_ERROR: "Failed to add data",
  REMOVE_DATA_SUCCESS: "Data removed successfully",
  REMOVE_DATA_ERROR: "Failed to remove data",
  GET_STORE_SUCCESS: "Store data fetched successfully",
  GET_STORE_ERROR: "Failed to fetch store data",
  GET_VERSIONS_SUCCESS: "Versions fetched successfully",
  GET_VERSIONS_ERROR: "Failed to fetch versions",
  GET_KEYS_SUCCESS: "Keys fetched successfully",
  GET_KEYS_ERROR: "Failed to fetch keys",
  GET_DYNAMIC_DATA_SUCCESS: "Dynamic data fetched successfully",
  GET_DYNAMIC_DATA_ERROR: "Failed to fetch dynamic data"
};
// Success notification for data-related actions
const notifyDataSuccess = (
  id: string,
  messageKey: keyof DataNotificationMessages,
  data: any = null
) => {
  const messageText = apiNotificationMessages[messageKey];
  useNotification().notify({
    id,
    message: messageText,
    data,
    timestamp: new Date(),
    type: NotificationTypeEnum.SUCCESS
  });
};


const handleApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  messageKey: keyof DataNotificationMessages,
  additionalData?: any
) => {
  const { notify } = useNotification();
  
  // Get the error message text from the notification messages
  const errorMessageText = apiNotificationMessages[messageKey] || errorMessage;
  
  // Create more detailed error message based on HTTP status
  let userFriendlyMessage = errorMessageText;
  const axiosError = error as AxiosError;
  
  if (axiosError.response) {
    switch (axiosError.response.status) {
      case 400:
        userFriendlyMessage = "Invalid data provided";
        break;
      case 401:
        userFriendlyMessage = "Authentication required";
        break;
      case 403:
        userFriendlyMessage = "You don't have permission to perform this operation";
        break;
      case 404:
        userFriendlyMessage = "Resource not found";
        break;
      case 409:
        userFriendlyMessage = "Conflict occurred";
        break;
      case 422:
        userFriendlyMessage = "Validation failed";
        break;
      case 500:
        userFriendlyMessage = "Server error";
        break;
    }
  } else if (axiosError.request) {
    userFriendlyMessage = "Network error: Unable to connect to server";
  }
  
  // Show notification using consistent object format
  notify({
    id: `error_${String(messageKey)}_${Date.now()}`,
    message: userFriendlyMessage,
    data: {
      entityType: additionalData?.entityType || 'data',
      entityId: additionalData?.entityId || 'unknown',
      action: additionalData?.action || String(messageKey).toLowerCase().replace('_error', ''),
      originalError: axiosError.message,
      statusCode: axiosError.response?.status,
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      extra: additionalData || {},
      timestamp: new Date().toISOString()
    },
    timestamp: new Date(),
    type: NotificationTypeEnum.ERROR,
    level: 'error' as const
  });
  
  // Call the original error handler with the enhanced message
  handleApiError(error, userFriendlyMessage);
  
  // Optional: Log to analytics or monitoring service
  if (additionalData?.logError) {
    logError({
      errorMessageId: messageKey,
      error: axiosError,
      userMessage: userFriendlyMessage,
      additionalData
    });
  }
};

class DataApiService {
  private notify: (params: {
    id: string;
    message: string;
    data: any;
    timestamp: Date;
    type: NotificationType;
  }) => void;

  constructor(
    notify: (params: {
      id: string;
      message: string;
      data: any;
      timestamp: Date;
      type: NotificationType;
    }) => void
  ) {
    this.notify = notify;
  }


  private async requestHandler(
    request: () => Promise<AxiosResponse>,
    successMessageId: keyof DataNotificationMessages,
    errorMessageId: keyof DataNotificationMessages,
    notificationData: any = null
  ): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await request();
      
      // Success notification
      this.notify({
        id: `data-${String(successMessageId)}`,
        message: apiNotificationMessages[successMessageId],
        data: notificationData,
        timestamp: new Date(),
        type: NotificationTypeEnum.SUCCESS
      });
      
      return response;
    } catch (error: any) {
      handleApiError(error, apiNotificationMessages[errorMessageId]);
      
      // Error notification
      handleApiErrorAndNotify(
        error as AxiosError<unknown>,
        apiNotificationMessages[errorMessageId],
        errorMessageId
      );
      
      throw error;
    }
  }

  async fetchData(endpoint: string, id?: number): Promise<{ data: YourResponseType<any, any, any, any, any, any> } | null> {
    try {
      let url = endpoint;
      if (id !== undefined) url += `/${id}`;

      const response = await this.requestHandler(
        () => internalApiService.get(url),
        "FETCH_DATA_DETAILS_SUCCESS",
        "FETCH_DATA_DETAILS_ERROR",
        { endpoint, id }
      );

      return { data: response.data };
    } catch (error) {
      console.error("Failed to fetch data:", error);
      return null;
    }
  }


  async fetchHighlights(id: number): Promise<HighlightEvent[]> {
    try {
      const endpoint = `${API_BASE_URL}/highlights`;
      
      const response = await this.requestHandler(
        () => internalApiService.get(endpoint, {
          config: { params: { id }}
        }),
        "FETCH_DATA_DETAILS_SUCCESS",
        "FETCH_HIGHLIGHTS_ERROR",
        { id }
      );

      const highlights = response.data.highlights as HighlightEvent[];

      // Fetch user IDs if highlights contain user references
      for (const highlight of highlights) {
        const userIds = await fetchUserIdsFromDatabase(highlight.taskId.toString());
        highlight.userIds = userIds.map(id => Number(id));
      }

      return highlights;
    } catch (error: any) {
      handleApiErrorAndNotify(
        error as AxiosError<unknown>,
        "Failed to fetch highlights",
        "FETCH_HIGHLIGHTS_ERROR"
      );
      throw error;
    }
  }


  async addData(newData: Omit<any, 'id'>, highlight: Omit<HighlightEvent, 'id'>): Promise<void> {
    try {
      const response = await this.requestHandler(
        () => internalApiService.post(`${API_BASE_URL}/data`, newData),
        "ADD_DATA_SUCCESS",
        "ADD_DATA_ERROR",
        { newData, highlight }
      );

      if (response.status === 200 || response.status === 201) {
        const createdData = response.data;
        addLog(`Data added: ${JSON.stringify(createdData)}`);

        const dataStore = useDataStore();
        dataStore.addDataSuccess({ data: createdData });
      }
    } catch (error) {
      console.error('Error adding data:', error);
      throw error;
    }
  }


  async removeData(dataId: number): Promise<void> {
    try {
      await this.requestHandler(
        () => internalApiService.delete(`${API_BASE_URL}/data/${dataId}`),
        "REMOVE_DATA_SUCCESS", 
        "REMOVE_DATA_ERROR",
        { dataId }
      );
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  }


  async getDataVersions(versionId: number): Promise<any[]> {
    try {
      const response = await this.requestHandler(
        () => internalApiService.get(`${API_BASE_URL}/versions/${versionId}`),
        "GET_VERSIONS_SUCCESS",
        "GET_VERSIONS_ERROR",
        { versionId }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching versions:", error);
      return [];
    }
  }

  async updateData(dataId: number, newData: any): Promise<any> {
    try {
      // Fetch necessary user IDs before proceeding with the update
      const userIds = await fetchUserIdsFromDatabase(newData.taskId);
      newData.userIds = userIds;

      const response = await this.requestHandler(
        () => internalApiService.put(
          `${API_BASE_URL}/data/${dataId}`, 
          newData, 
          {
            config: {headers: headersConfig } // Headers in Axios config
          }
        ),
        "UPDATE_DATA_DETAILS_SUCCESS",
        "UPDATE_DATA_DETAILS_ERROR",
        { dataId, newData }
        // No headers in ApiRequestOptions
      );

      addLog(`Data updated: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error: any) {
      console.error('Error updating data:', error);
      throw error;
    }
  }

  async getStoreIds(storeId: number): Promise<void> {
    try {
      const response = await this.requestHandler(
        () => internalApiService.get(`${API_BASE_URL}/store/${storeId}`),
        "GET_STORE_SUCCESS",
        "GET_STORE_ERROR",
        { storeId }
      );
      
      const storeData = response.data;
      const storeIdKey = `storeId_${storeId}`;
      const notificationContent = `Store ID: ${storeId}, Data: ${JSON.stringify(storeData)}`;
      const notificationDate = new Date();
      const notificationType = NotificationTypeEnum.GET_STORE_SUCCESS;

      notificationStore.notify(
        storeIdKey,
        notificationContent,
        notificationDate,
        notificationType
      );
    } catch (error) {
      console.error('Error fetching store ID:', error);
      throw error;
    }
  }


  async getBackendVersion(): Promise<string> {
    try {
      const response = await this.requestHandler(
        () => internalApiService.get(endpoints.version.backend),
        "FETCH_DATA_DETAILS_SUCCESS",
        "FETCH_DATA_DETAILS_ERROR"
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching backend version:", error);
      return "unknown";
    }
  }

  async getFrontendVersion(): Promise<string> {
    try {
      const response = await this.requestHandler(
        () => internalApiService.get(endpoints.version.frontend),
        "FETCH_DATA_DETAILS_SUCCESS",
        "FETCH_DATA_DETAILS_ERROR"
      );
      return response.data.version;
    } catch (error: any) {
      console.error("Error fetching frontend version:", error);
      return "unknown";
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const response = await this.requestHandler(
        () => internalApiService.get(`${API_BASE_URL}/keys`),
        "GET_KEYS_SUCCESS",
        "GET_KEYS_ERROR"
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching all keys:", error);
      return [];
    }
  }

  async fetchUpdatedDynamicData(): Promise<any> {
    try {
      const response = await this.requestHandler(
        () => internalApiService.get(`${API_BASE_URL}/dynamic-data`),
        "GET_DYNAMIC_DATA_SUCCESS",
        "GET_DYNAMIC_DATA_ERROR"
      );
      const updatedData = response.data;
      if (setDynamicData) {
        setDynamicData(updatedData);
      }
      return updatedData;
    } catch (error: any) {
      console.error('Error fetching updated dynamic data:', error);
      throw error;
    }
  }
}

const dataApiService = new DataApiService(useNotification().notify);

// ✅ EXPORT: The service instance
export default dataApiService;

// Legacy exports for backward compatibility
export { apiNotificationMessages, dataApiService, handleApiErrorAndNotify };
