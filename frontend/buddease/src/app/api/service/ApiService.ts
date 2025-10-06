import FileData from "@/app/components/models/data/FileData";
import { useNotification } from '@/app/context/NotificationContext';
import useSecureStoreId from '@/app/hooks/useSecureStoreId';
import { getBackendStructureFilePath, STORE_KEYS } from "@/app/utils/cache/CacheManager";
import { CustomApp } from '@/app/utils/web3/dAppAdapter/DApp';
import { currentAppName } from "@/app/versions/AppVersion";
import { ConfigurationService } from "@/config/ConfigurationService";
import { getAuthToken } from '@/server/auth/getAuthToken';
import { AxiosRequestConfig } from "axios";
import { Style as DocxStyle } from 'docx';
import { endpoints } from "./ApiEndpoints";

// Define the API base URL
const API_BASE_URL = endpoints.data; // Assuming 'endpoints' has a property 'data' for the base URL
const { notify } = useNotification();


interface CustomStyle extends DocxStyle {
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  fontFamily?: string;
  // Add other custom properties as needed
}

const storeId = useSecureStoreId()
if (!storeId){
  throw new Error("storeId already exists")
}

const authToken = getAuthToken()

// Usage example:
const cacheKey = STORE_KEYS.USER_PREFERENCES; // Replace with the actual key you want to use

// Get the file path dynamically based on the cache key
const filePath = getBackendStructureFilePath(cacheKey);

async function initializeAppData() {
  const configServiceInstance = ConfigurationService.getInstance();

  // Await all configuration values
  const apiKey = await configServiceInstance.getApiKey();
  const appId = await configServiceInstance.getAppId();
  const appDescription = await configServiceInstance.getAppDescription();
  const username = await configServiceInstance.getUsername(); // assuming you added this

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
}

class ApiService extends BaseApiService {
  constructor(API_BASE_URL: string) {
    super(API_BASE_URL);
  }

  // Define the post method (now simplified)
  public async post<T>(endpointPath: string, requestData: any, config?: AxiosRequestConfig): Promise<T> {
    return super.post<T>(endpointPath, requestData, config);
  }

  // Define the get method (now simplified)
  public async get<T>(endpointPath: string, config?: AxiosRequestConfig): Promise<T> {
    return super.get<T>(endpointPath, config);
  }

  // Define the callApi method (can be removed or kept for backward compatibility)
  public async callApi<T>(endpointPath: string, requestData: any): Promise<T> {
    return this.post<T>(endpointPath, requestData);
  }

  // Define sendFileChangeEvent method to send file change data
  public async sendFileChangeEvent(file: FileData): Promise<void> {
    try {
      const endpointPath = '/file/change-event';
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

      await this.post<void>(endpointPath, requestData);
    } catch (error) {
      console.error('Error in sendFileChangeEvent:', error);
      throw error;
    }
  }

  // Add other API-specific methods here
  public async getUserProfile(userId: string): Promise<any> {
    return this.get<any>(`/users/${userId}/profile`);
  }

  public async updateUserSettings(userId: string, settings: any): Promise<any> {
    return this.put<any>(`/users/${userId}/settings`, settings);
  }
}


export default ApiService;
export { initializeAppData };
export type { CustomStyle };

