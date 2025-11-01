// ApiData.ts
import { fetchUserIdsFromDatabase } from "@/app/api/ApiDatabase";
import { handleApiError } from '@/app/api/ApiLogs';
import axiosInstance from '@/app/api/csrfToken';
import { NotificationType, NotificationTypeEnum, useNotification } from "@/app/context/NotificationContext";
import NOTIFICATION_MESSAGES from '@/app/features/support/NotificationMessages';
import { notificationStore } from '@/app/features/support/NotificationProvider';
import { useDataStore } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { addLog } from '@/app/state/redux/slices/LogSlice';
import HighlightEvent from '@/app/documents/highlighting/screenFunctionality/HighlightEvent';
import { YourResponseType } from '@/app/typings/responseTypes';
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { endpoints } from '@/app/api/endpointConfigurations';
import headersConfig from '@/api/headers/HeadersConfig';
import { VersionData } from "@/app/versions/VersionData";
import { AxiosError, AxiosResponse } from 'axios';
import internalApiService from "./ApiClient"; // ✅ ADD THIS

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
  GENERATE_VERSION_ERROR_ID: NOTIFICATION_MESSAGES.Version.GENERATE_VERSION_ERROR_ID
};


const handleApiErrorAndNotify = <
  T extends Record<string, string>
>(
  error: AxiosError<unknown>,
  defaultMessage: string,
  errorId: keyof T,
  notificationMessages: T,
  serviceType: string = "Api"
) => {
  const message = notificationMessages[errorId] || defaultMessage;
  console.error(`Error: ${message}`, error);
  
  useNotification().notify(
    String(errorId),
    message,
    null,
    new Date(),
    `${serviceType}Error` as NotificationType
  );
};

// ✅ NEW: Create DataApiService class following CalendarApiService pattern
class DataApiService {
  notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: string
  ) => void;

  constructor(
    notify: (
      id: string,
      message: string,
      data: any,
      date: Date,
      type: string
    ) => void
  ) {
    this.notify = notify;
  }

  // ✅ ADD: Request handler following CalendarApiService pattern
  private async requestHandler(
    request: () => Promise<AxiosResponse>,
    successMessageId: keyof DataNotificationMessages,
    errorMessageId: keyof DataNotificationMessages
  ): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await request();
      this.notify(
        successMessageId,
        apiNotificationMessages[successMessageId],
        response.data,
        new Date(),
        "Success"
      );
      return response;
    } catch (error: any) {
      handleApiError(error, apiNotificationMessages[errorMessageId]);
      throw error;
    }
  }

  async fetchData(endpoint: string, id?: number): Promise<{ data: YourResponseType<any, any, StructuredMetadata<any, any>> } | null> {
    try {
      let url = endpoint;
      if (id !== undefined) url += `/${id}`;

      const response = await this.requestHandler(
        () => internalApiService.get(url), // ✅ Use internalApiService
        "FETCH_DATA_DETAILS_SUCCESS",
        "FETCH_DATA_DETAILS_ERROR"
      );

      return { data: response.data };
    } catch (error) {
      console.error("Failed to fetch data:", error);
      return null;
    }
  }

  // ✅ UPDATE: Use internalApiService for highlights
  async fetchHighlights(id: number): Promise<HighlightEvent[]> {
    try {
      const endpoint = `${API_BASE_URL}/highlights`;
      
      const response = await this.requestHandler(
        () => internalApiService.get(endpoint, { params: { id } }), // ✅ Use internalApiService
        "FETCH_DATA_DETAILS_SUCCESS",
        "FETCH_DATA_DETAILS_ERROR"
      );

      const highlights = response.data.highlights as HighlightEvent[];

      // Fetch user IDs if highlights contain user references
      for (const highlight of highlights) {
        const userIds = await fetchUserIdsFromDatabase(highlight.taskId.toString());
        highlight.userIds = userIds.map(id => Number(id));
      }

      return highlights;
    } catch (error: any) {
      handleApiError(error, NOTIFICATION_MESSAGES.Error.FETCH_HIGHLIGHTS_ERROR);
      throw error;
    }
  }

  // ✅ UPDATE: Use internalApiService for adding data
  async addData(newData: Omit<any, 'id'>, highlight: Omit<HighlightEvent, 'id'>): Promise<void> {
    try {
      const response = await this.requestHandler(
        () => internalApiService.post(`${API_BASE_URL}/data`, newData), // ✅ Use internalApiService
        "UPDATE_DATA_DETAILS_SUCCESS",
        "UPDATE_DATA_DETAILS_ERROR"
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

  // ✅ UPDATE: Use internalApiService for removing data
  async removeData(dataId: number): Promise<void> {
    try {
      await this.requestHandler(
        () => internalApiService.delete(`${API_BASE_URL}/data/${dataId}`), // ✅ Use internalApiService
        "UPDATE_DATA_DETAILS_SUCCESS", 
        "UPDATE_DATA_DETAILS_ERROR"
      );
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  }

  // ✅ UPDATE: Use internalApiService for versions
  async getDataVersions(versionId: number): Promise<Version<any, any>[]> {
    try {
      const response = await this.requestHandler(
        () => internalApiService.get(`${API_BASE_URL}/versions/${versionId}`), // ✅ Use internalApiService
        "FETCH_DATA_DETAILS_SUCCESS",
        "FETCH_DATA_DETAILS_ERROR"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching versions:", error);
      return [];
    }
  }

  // ✅ UPDATE: Use internalApiService for updating data
  async updateData(dataId: number, newData: any): Promise<any> {
    try {
      // Fetch necessary user IDs before proceeding with the update
      const userIds = await fetchUserIdsFromDatabase(newData.taskId);
      newData.userIds = userIds;

      const response = await this.requestHandler(
        () => internalApiService.put(`${API_BASE_URL}/data/${dataId}`, newData, { // ✅ Use internalApiService
          headers: headersConfig
        }),
        "UPDATE_DATA_DETAILS_SUCCESS",
        "UPDATE_DATA_DETAILS_ERROR"
      );

      addLog(`Data updated: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error: any) {
      console.error('Error updating data:', error);
      throw error;
    }
  }

  // ✅ UPDATE: Use internalApiService for store operations
  async getStoreIds(storeId: number): Promise<void> {
    try {
      const response = await this.requestHandler(
        () => internalApiService.get(`${API_BASE_URL}/store/${storeId}`), // ✅ Use internalApiService
        "FETCH_DATA_DETAILS_SUCCESS",
        "FETCH_DATA_DETAILS_ERROR"
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

  // ✅ ADD: Version methods using internalApiService
  async getBackendVersion(): Promise<string> {
    try {
      const response = await this.requestHandler(
        () => internalApiService.get(endpoints.version.backend), // ✅ Use internalApiService
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
        () => internalApiService.get(endpoints.version.frontend), // ✅ Use internalApiService
        "FETCH_DATA_DETAILS_SUCCESS",
        "FETCH_DATA_DETAILS_ERROR"
      );
      return response.data.version;
    } catch (error: any) {
      console.error("Error fetching frontend version:", error);
      return "unknown";
    }
  }

  // ✅ ADD: Additional methods following the pattern
  async getAllKeys(): Promise<string[]> {
    try {
      const response = await this.requestHandler(
        () => internalApiService.get(`${API_BASE_URL}/keys`), // ✅ Use internalApiService
        "FETCH_DATA_DETAILS_SUCCESS",
        "FETCH_DATA_DETAILS_ERROR"
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
        () => internalApiService.get(`${API_BASE_URL}/dynamic-data`), // ✅ Use internalApiService
        "FETCH_DATA_DETAILS_SUCCESS",
        "FETCH_DATA_DETAILS_ERROR"
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

// ✅ CREATE: Instance of DataApiService
const dataApiService = new DataApiService(useNotification);

// ✅ EXPORT: The service instance and individual functions for backward compatibility
export default dataApiService;

// Legacy exports for backward compatibility
export {
  dataApiService as addData,
  dataApiService as fetchData,
  dataApiService as fetchHighlights,
  dataApiService as removeData,
  dataApiService as updateData,
  dataApiService as getDataVersions,
  dataApiService as getStoreIds,
  dataApiService as getBackendVersion,
  dataApiService as getFrontendVersion,
  dataApiService as getAllKeys,
  dataApiService as fetchUpdatedDynamicData,
  apiNotificationMessages,
  handleApiErrorAndNotify
};