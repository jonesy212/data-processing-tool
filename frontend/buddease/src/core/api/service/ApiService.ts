ApiService.ts
import { endpoints } from "@/core/api/endpointConfigurations";
import { BaseApiService } from '@/core/api/service/BaseApiService';
import { Style as DocxStyle } from '@/core/documents/DocumentOptions';
import { STORE_KEYS } from '@/core/libraries/cache/client/constants';
import FileData from "@/core/models/data/FileData";
import { getAuthToken } from '@/core/server/auth/getAuthToken';
import { ConfigurationService } from "@/core/services/ConfigurationService";
import { currentAppName } from "@/core/versions/AppVersion";
import { getBackendStructureFilePath } from '@/utils/cache/CacheWriteOptions';
import { CustomApp } from '@/utils/web3/dAppAdapter/DApp';
import { AxiosRequestConfig } from "axios";

// Define the API base URL - fix this based on your actual endpoint structure
// Assuming endpoints.data.baseUrl or similar structure
const API_BASE_URL = typeof endpoints.data === 'string' ? endpoints.data : 
                     (endpoints.data as any)?.baseUrl || 'http://localhost:3000/api';

interface CustomStyle extends DocxStyle {
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  fontFamily?: string;
  // Add other custom properties as needed
}

// Remove hooks from module level - these can't be used here
const { notify } = useNotification(); // ERROR: Can't use hooks outside components
const storeId = useSecureStoreId(); // ERROR: Can't use hooks outside components

// Helper function to get storeId when needed (call from React components)
export const getStoreId = async (): Promise<string> => {
  // You'll need to implement this differently
  // Could be from localStorage, context, or API
  const storeId = localStorage.getItem('storeId') || sessionStorage.getItem('storeId');
  if (!storeId) {
    throw new Error("Store ID not found");
  }
  return storeId;
};

// Usage example - make this a function, not module-level code
export const getCacheFilePath = async (): Promise<string> => {
  try {
    const storeId = await getStoreId();
    const cacheKey = STORE_KEYS.USER_PREFERENCES;
    return getBackendStructureFilePath(cacheKey);
  } catch (error) {
    console.error('Error getting cache file path:', error);
    return '';
  }
};

// Make authToken a function, not module-level
export const getAuthTokenAsync = async (): Promise<string> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token not found");
  }
  return token;
};

export async function initializeAppData(): Promise<CustomApp> {
  try {
    const configServiceInstance = ConfigurationService.getInstance();

    // Await all configuration values
    const apiKey = await configServiceInstance.getApiKey();
    const appId = await configServiceInstance.getAppId();
    const appDescription = await configServiceInstance.getAppDescription();
    const username = await configServiceInstance.getUsername() || 'anonymous';
    const authToken = await getAuthTokenAsync();

    // Import AppSettings if needed
    // Assuming AppSettings is available from somewhere
    const { AppSettings } = await import('@/core/settings/AppSettings');
    
    // Create AppSettings instance
    const appSettings = new AppSettings(apiKey, appId, appDescription, username);

    // Create the appData object
    const appData: CustomApp = {
      id: appSettings.getAppId(),
      username: appSettings.getUsername(),
      name: currentAppName,
      description: appSettings.getAppDescription(),
      authToken: authToken,
      apiKey: appSettings.getApiKey(),
      relatedData: [],
      sharedRelationships: {
        childIds: [],
        relatedData: [],
      },
    };

    return appData;
  } catch (error) {
    console.error('Error initializing app data:', error);
    throw error;
  }
}

class ApiService extends BaseApiService {
  private notificationHandler?: (message: string) => void;

  constructor(baseURL?: string) {
    // Use provided baseURL or fallback
    super(baseURL || API_BASE_URL);
  }

  // Optionally set notification handler
  setNotificationHandler(handler: (message: string) => void) {
    this.notificationHandler = handler;
  }

  // GET method
  public async get<T>(endpointPath: string, config?: AxiosRequestConfig): Promise<T> {
    return super.get<T>(endpointPath, config);
  }

  // POST method
  public async post<T>(endpointPath: string, requestData: any, config?: AxiosRequestConfig): Promise<T> {
    return super.post<T>(endpointPath, requestData, config);
  }

  // PUT method (full update)
  public async put<T>(endpointPath: string, requestData: any, config?: AxiosRequestConfig): Promise<T> {
    return super.put<T>(endpointPath, requestData, config);
  }

  // PATCH method (partial update)
  public async patch<T>(endpointPath: string, requestData: any, config?: AxiosRequestConfig): Promise<T> {
    return super.patch<T>(endpointPath, requestData, config);
  }

  // DELETE method
  public async delete<T>(endpointPath: string, config?: AxiosRequestConfig): Promise<T> {
    return super.delete<T>(endpointPath, config);
  }

  // HEAD method
  public async head<T>(endpointPath: string, config?: AxiosRequestConfig): Promise<T> {
    return super.head<T>(endpointPath, config);
  }

  // OPTIONS method
  public async options<T>(endpointPath: string, config?: AxiosRequestConfig): Promise<T> {
    return super.options<T>(endpointPath, config);
  }

  // Common API methods
  public async callApi<T>(endpointPath: string, requestData: any): Promise<T> {
    return this.post<T>(endpointPath, requestData);
  }

  public async sendFileChangeEvent(file: FileData): Promise<void> {
    try {
      // FIX: Check if endpoints.files exists and has sendFileChangeEvent
      if (!endpoints.files || !(endpoints.files as any).sendFileChangeEvent) {
        throw new Error('sendFileChangeEvent endpoint not configured');
      }
      
      const endpointConfig = (endpoints.files as any).sendFileChangeEvent;
      
      const requestData = {
        fileName: file.fileName,
        fileSize: file.fileSize,
        fileType: file.fileType,
        filePath: file.filePath,
        uploader: file.uploader,
        uploadDate: file.uploadDate,
        attachments: file.attachments,
        imageData: file.imageData,
      };

      await this.post<void>(endpointConfig.path, requestData);
      
      // Optional: Send notification
      if (this.notificationHandler) {
        this.notificationHandler(`File change event sent for ${file.fileName}`);
      }
    } catch (error) {
      console.error('Error in sendFileChangeEvent:', error);
      throw error;
    }
  }

  public async getUserProfile(userId: string): Promise<any> {
    return this.get<any>(`/users/${userId}/profile`);
  }

  public async updateUserSettings(userId: string, settings: any): Promise<any> {
    return this.put<any>(`/users/${userId}/settings`, settings);
  }

  public async partiallyUpdateUserSettings(userId: string, settings: Partial<any>): Promise<any> {
    return this.patch<any>(`/users/${userId}/settings`, settings);
  }

  public async deleteUserAccount(userId: string): Promise<void> {
    return this.delete<void>(`/users/${userId}`);
  }

  // Add method using getApiEndpoint helper if available
  public async sendFileChangeEventUsingHelper(file: FileData): Promise<void> {
    try {
      // If you have the getApiEndpoint utility
      const { getApiEndpoint } = await import('@/core/api/endpointConfigurations');
      const { url } = getApiEndpoint('files', 'sendFileChangeEvent');
      
      const requestData = {
        fileName: file.fileName,
        fileSize: file.fileSize,
        fileType: file.fileType,
        filePath: file.filePath,
        uploader: file.uploader,
        uploadDate: file.uploadDate,
        attachments: file.attachments,
        imageData: file.imageData,
      };

      await this.post<void>(url, requestData);
    } catch (error) {
      console.error('Error in sendFileChangeEvent:', error);
      throw error;
    }
  }
}

// Create singleton instance
let apiServiceInstance: ApiService | null = null;

export const getApiService = (baseURL?: string): ApiService => {
  if (!apiServiceInstance) {
    apiServiceInstance = new ApiService(baseURL);
  }
  return apiServiceInstance;
};

export default ApiService;
export type { CustomStyle };
