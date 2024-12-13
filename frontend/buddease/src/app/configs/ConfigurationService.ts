import { BaseData } from '@/app/components/models/data/Data';
import { useNotification } from '@/app/components/support/NotificationContext';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { SystemConfigs } from "../api/systemConfigs";
import { UserConfigs } from "../api/userConfigs";
import { Project, isProjectInSpecialPhase } from "../components/projects/Project";
import { AquaConfig } from "../components/web3/web_configs/AquaConfig";
import StoreConfig from "../shopping_center/ShoppingCenterConfig";
import {
    BackendConfig,
    backendConfig,
} from "./BackendConfig";

import fs from 'fs';
import { getConfigsData } from '../api/getConfigsApi';
import { EventRecord } from '../components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { VersionHistory } from '../components/versions/VersionData';
import { API_VERSION_HEADER } from './AppConfig';
import dataVersions from "./DataVersionsConfig";
import { frontendConfig } from "./FrontendConfig";
import LazyLoadScriptConfigImpl from "./LazyLoadScriptConfig";
import { ModuleType, userPreferences } from "./UserPreferences";
import userSettings from "./UserSettings";

interface BaseRetryConfig {
  maxRetries?: number;
  retryDelay?: number;
}

interface BaseCacheConfig {
  maxAge?: string | number;
  staleWhileRevalidate?: number;
}


interface BaseMetadataConfig<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  enableSnapshot?: boolean;
  eventRecords?: EventRecord<T, K>[] | []
}

export interface RetryConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
}

export interface CacheConfig {
  enabled: boolean;
  maxAge: number;
  staleWhileRevalidate: number;
  cacheKey: string;
}

export interface ApiConfig {
  [x: string]: any;
  name: any
  baseURL: string;
  timeout: number;
  headers: {
    [key: string]: string;
  };
  retry: RetryConfig;
  cache: CacheConfig;
  responseType: {
    contentType: string; // New property for content type
    encoding: string; // New property for encoding
    // Add more properties as needed
  } | string;
  withCredentials: boolean;
  onLoad?: (response: any) => void;
}

interface ConfigurationOptions {
  namingConventions: any;
  lazyLoadScriptConfig: LazyLoadScriptConfigImpl;
  apiConfig: ApiConfig;
  lastUpdated: VersionHistory;
  userPreferences: {
    modules: ModuleType;
    actions: never[];
    reducers: never[];
  };
  userSettings: {
    communicationMode: string;
    enableRealTimeUpdates: boolean;
    defaultFileType: string;
    // ...other user settings
  };

  backendConfig: BackendConfig; // Add backendDocumentConfig here

  configStructure: {
    systemConfigs: typeof SystemConfigs;
    userConfigs: typeof UserConfigs;
    aquaConfig: AquaConfig;
    storeConfig: StoreConfig;
    dataVersions: typeof dataVersions;
    frontendConfig: typeof frontendConfig;
    lazyLoadScriptConfig: LazyLoadScriptConfigImpl;
    userPreferences: typeof userPreferences;
    userSettings: typeof userSettings;
  }
  // other configuration options
}



// Define the API_VERSION_HEADER and DATA_PATH directly in the ConfigurationService file
export const DATA_PATH = getConfigsData()

const notify = useNotification
export class ConfigurationService {
  protected static instance: ConfigurationService;
  private apiConfig: ApiConfig;
  private cachedConfig: LazyLoadScriptConfigImpl | null = null;
  private apiConfigSubscribers: ((config: ApiConfig) => void)[] = [];

  private constructor() {
    // Initialize apiConfig with default values
    this.apiConfig = this.getDefaultApiConfig();

  }


  private readConfigFile(): any {
    const rawData = fs.readFileSync('config.json', 'utf-8');
    return JSON.parse(rawData);
  }
  // Handle API key retrieval
  async getApiKey(): Promise<string> {
    const config = await this.readConfigFile();
    return config.apiKey;
  }

  async getAppId(): Promise<string> {
    const config = await this.readConfigFile();
    return config.appId;
  }

  getAppDescription(): string {
    return this.readConfigFile().appDescription;
  }



// Update the getDefaultApiConfig method
private getDefaultApiConfig(): ApiConfig {
  return {
    name: "defaultName",
    timeout: 5000,
    headers: {},
    retry: {} as RetryConfig,
    cache: {} as CacheConfig,
    responseType: {
      contentType: API_VERSION_HEADER, // Use dynamic API version header
      encoding: "utf-8", // Default encoding
    },
    withCredentials: false,
    baseURL: process.env.REACT_APP_API_BASE_URL || "",
    backendConfig: backendConfig,
    frontendConfig: frontendConfig,
    onLoad: function (response: Response) {
      // Check if the response status is within the success range (200-299)
      if (response.status >= 200 && response.status < 300) {
        // Convert the response to JSON format
        response.json().then((data) => {
          // Process the response data here
          console.log("Response data:", data);
        }).catch((error) => {
          console.error("Error parsing response:", error);
        });
      } else {
        // Handle non-successful response status
        console.error("Request failed with status:", response.status);

        // Use the notify function to display a notification message
        const errorMessage = `Request failed with status: ${response.status}`;
        notify();

      }
    }
  }
}

  
  getAppName(currentAppName: string): string {
    return currentAppName || this.getDefaultApiConfig().name;
  }
  
  // New public method to expose getDefaultApiConfig
  getPublicDefaultApiConfig(): ApiConfig {
    return this.apiConfig;
  }

  static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  getSnapshotConfig(): LazyLoadScriptConfigImpl {
    // Example: Default configuration
    const defaultConfig: LazyLoadScriptConfigImpl = {
      timeout: 5000, // 5 seconds timeout for script loading
      onLoad: () => console.log("Script loaded successfully"),
      retryCount: 3, // Retry loading script up to 3 times
      retryDelay: 1000, // 1 second delay between retry attempts
      asyncLoad: true, // Asynchronously load scripts
      deferLoad: false, // Do not defer script execution
      onBeforeLoad: () => console.log("Loading script..."),
      onScriptError: (error:ErrorEvent) => console.log("Error loading script", error),
      onTimeout: () => console.log("Timeout loading script"),
      onCachedLoad: () => console.log("Script loaded from cache"),
      onCachedTimeout: () => console.log("Timeout loading script from cache"),
      onCachedError: (error: Error) =>
        console.log("Error loading script from cache", error),
      // Example: Add configuration options here
      systemConfigs: SystemConfigs,
      userConfigs: UserConfigs,
      dataVersions: () => dataVersions,
      frontend: frontendConfig,
      backend: backendConfig,
      aquaConfig:{} as AquaConfig,
      storeConfig: {} as StoreConfig,
      configureScript: () => {}
    }
    return defaultConfig;
  }

  setCachedConfig(config: LazyLoadScriptConfigImpl): void {
    this.cachedConfig = config;
  }

  // Get the cached configuration
  getCachedConfig(): LazyLoadScriptConfigImpl | null {
    return this.cachedConfig;
  }

  getLazyLoadScriptConfig(): LazyLoadScriptConfigImpl {
    // Example: Default configuration
    const defaultConfig: LazyLoadScriptConfigImpl = {
      timeout: 5000, // 5 seconds timeout for script loading
      onLoad: () => console.log("Script loaded successfully"),
      retryCount: 3, // Retry loading script up to 3 times
      retryDelay: 1000, // 1 second delay between retry attempts
      asyncLoad: true, // Asynchronously load scripts
      deferLoad: false, // Do not defer script execution
      onBeforeLoad: () => console.log("Loading script..."),
      onScriptError: (error) => console.error("Script error:", error),
      thirdPartyLibrary: "example-library",
      thirdPartyAPIKey: "your-api-key",
      nonce: "random-nonce-value",
      configureScript: () => {}
    };

    const aquaConfig: AquaConfig = {
      apiUrl: "https://example.com/aqua-api",
      maxConnections: 10,
      timeout: 0,
      secureConnection: false,
      reconnectAttempts: 0,
      autoReconnect: false,
      appId: "",
      appSecret: "",
      relayUrl: "",
      relayToken: "",
      chatToken: "",
      chatUrl: "",
      chatWebsocketUrl: "",
      chatImageUploadUrl: "",
      chatImageUploadHeaders: {} as Record<string, string>,
      chatImageUploadParams: {} as Record<string, string>,
      chatImageUploadUrlParams: {} as Record<string, string>,
      chatImageDownloadUrl: "",
      chatImageDownloadHeaders: {} as Record<string, string>,
      chatImageDownloadParams: {} as Record<string, string>,
      chatImageDownloadUrlParams: {} as Record<string, string>,
      chatImageCacheUrl: "",
      chatImageCacheHeaders: {} as Record<string, string>,
      chatImageCacheParams: {} as Record<string, string>
    };
    // Additional edge cases and use cases
    // Case 1: Custom configuration based on a condition
    // Determine if custom configuration is needed based on AquaConfig
    const isCustomConfigNeeded = aquaConfig.maxConnections > 5;
    if (isCustomConfigNeeded) {
      const customApiConfig: ApiConfig = {
        name: "customApiConfig",
        baseURL: "https://custom-api.com",
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
        retry: {
          enabled: true,
          maxRetries: 3,
          retryDelay: 0,
        },
        cache: {} as CacheConfig,
        responseType: {
          contentType: "application/json", // Default content type
          encoding: "utf-8", // Default encoding
        },
        withCredentials: false,
        onLoad: function (response: any): void {
          throw new Error("Function not implemented.");
        },
      };

      return {
        // Merge default configuration with custom ApiConfig properties
        ...defaultConfig,
        apiConfig: customApiConfig,
        configureScript: () => { }
        // Add more custom properties for this case
      };
    }

    // Determine if a special scenario requires different configuration
    const specialScenario = isProjectInSpecialPhase({} as Project);
    if (specialScenario) {
      const specialStoreConfig: StoreConfig = {
        name: "Special Store",
        description: "Special store for special scenario",
        // Additional configuration options...
      };

      if (this.cachedConfig) {
        return this.cachedConfig;
      } else {
        return defaultConfig;
      }
    }

    // Added return statement with default config to resolve error
    return defaultConfig;
  }

  // Add more configuration methods as needed


  
async getSystemConfigs(): Promise<typeof SystemConfigs> {
  // Simulate asynchronous fetching, replace with actual async logic
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(SystemConfigs);
    }, 500);
  });
}

  async getUserConfigs(): Promise<typeof UserConfigs>  {
    // Simulate asynchronous fetching, replace with actual async logic
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(UserConfigs);
      }, 500);
    });
  }
  getApiConfig(): ApiConfig {
    // Example API configuration
    // You can modify this based on your application's needs
    return {
      name: "defaultApiConfig",
      baseURL: "https://api.example.com",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer your-access-token",
      },
      retry: {
        enabled: true,
        maxRetries: 3,
        retryDelay: 1000,
      },
      cache: {
        enabled: true,
        maxAge: 300000,
        staleWhileRevalidate: 60000,
        cacheKey: "api_cache_key",
      },
      responseType: {
        contentType: "application/json",
        encoding: "utf-8",
      },
      withCredentials: true,
      onLoad: (response) => console.log("Script loaded successfully", response),
    };
  }

  // Add a method to get the current API config
  getCurrentApiConfig(): ApiConfig {
    return this.apiConfig;
  }

   // Method to retrieve the API version header
   getApiVersionHeader(): string {
    // Define and return the API version header value
    const API_VERSION_HEADER = 'application/vnd.yourapp.v1+json'; // Example API version header
    return API_VERSION_HEADER;
   }
  
  getDataPath(): string { 
    // Return the data path
    const DATA_PATH = './data';
    return DATA_PATH;
  }

  getConfigurationOptions(): ConfigurationOptions {
    return {} as ConfigurationOptions;
  }

  subscribeToApiConfigChanges(callback: (config: ApiConfig) => void): void {
    // Add the callback function to the subscribers array
    this.apiConfigSubscribers.push(callback);
  }

  unsubscribeFromApiConfigChanges(callback: (config: ApiConfig) => void): void {
    // Remove the callback function from the subscribers array
    this.apiConfigSubscribers = this.apiConfigSubscribers.filter(
      (subscriber) => subscriber !== callback
    );
  }

  private triggerApiConfigChange(): void {
    const currentConfig = this.getCurrentApiConfig();
    // Notify all subscribers with the current config
    this.apiConfigSubscribers.forEach((subscriber) =>
      subscriber(currentConfig)
    );
  }

  // Example method that updates the API config and triggers changes
  updateApiConfig(updatedConfig: Partial<ApiConfig>): void {
    this.apiConfig = { ...this.apiConfig, ...updatedConfig };
    // Trigger callbacks to notify subscribers about the change
    this.triggerApiConfigChange();
  }
}
// Create an instance of the configuration service
const configServiceInstance = ConfigurationService.getInstance();

export { configServiceInstance };
export type { BaseCacheConfig, BaseMetadataConfig, BaseRetryConfig, ConfigurationOptions };

