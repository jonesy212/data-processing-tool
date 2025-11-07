import ApiConfig from '@/app/api/ApiConfig';
import { handleApiError } from '@/app/api/ApiLogs';
import { createSystemConfigs } from '@/app/api/systemConfigs';
import { UserConfigs } from '@/app/api/userConfigs';
import {
    BackendConfig,
    backendConfig,
} from '@/app/config/BackendConfig';
import {
    FrontendConfig,
    frontendConfig,
} from '@/app/config/FrontendConfig';
import { useNotification } from '@/app/context/NotificationContext';
import { Project, isProjectInSpecialPhase } from '@/app/models/projects/Project';
import StoreConfig from '@/app/shoppingCenter/ShoppingCenterConfig';
import { AquaConfig } from '@/app/utils/web3/webConfigs/aqua/AquaConfig';

import { getConfigsData } from '@/api/getConfigsApi';
import LazyLoadScriptConfigImpl from '@/app/components/configs/LazyLoadScriptConfig';
import { API_VERSION_HEADER } from '@/app/config/AppConfig';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import dataVersions from '@/app/configs/DataVersionsConfig';
import { EventRecord } from '@/app/state/stores/DataStore';
import { VersionHistory } from '@/app/versions/VersionData';


import { configConfig } from '@/app/config/endpoints/configConfig';
import { ModuleType, userPreferences } from '@/app/config/UserPreferences';
import userSettings from '@/app/config/UserSettings';
import { Attachment } from '@/app/documents/attachment/Attachment';
import authenticationHeaders from '../api/headers/authenticationHeaders';

interface BaseRetryConfig {
  maxRetries?: number;
  retryDelay?: number;
}



interface BaseMetadataConfig<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  enableSnapshot?: boolean;
  eventRecords?: EventRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | []
}

export interface RetryConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
}



interface ConfigurationOptions<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  namingConventions: any;
  lazyLoadScriptConfig: LazyLoadScriptConfigImpl;
  apiConfig: ApiConfig;
  lastUpdated: VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
    systemConfigs: ReturnType<typeof createSystemConfigs>;
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

const configureScript = () => {
  console.log("Script configured");
};

export class ConfigurationService {
  protected static instance: ConfigurationService
  private apiConfig: ApiConfig;
  private cachedConfig: LazyLoadScriptConfigImpl | null = null;
  private apiConfigSubscribers: ((config: ApiConfig) => void)[] = [];

  private constructor() {
    // Initialize ApiConfig with endpoint configurations
    this.apiConfig = new ApiConfig({ config: configConfig }, { config: configConfig });
  }

 private async readConfigFile(): Promise<any> {
    try {
      const endpoint = this.apiConfig.getEndpoint("config", "getConfigFile");
      const response = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: authenticationHeaders,
      });

      if (!response.ok) {
        throw new Error(`Failed to load config file: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error reading config file:", error);
      // Return fallback/default config
      return {
        apiKey: process.env.REACT_APP_API_KEY || '',
        appId: process.env.REACT_APP_ID || '',
        appDescription: process.env.REACT_APP_DESCRIPTION || '',
        // ... other default values
      };
    }
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

  async getAppDescription(): Promise<string> {
    const config = await this.readConfigFile();
    return config.appDescription;
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
        }).catch((error: Error) => {
          console.error("Error parsing response:", error);
          // You might want to notify here too
          // notify("Parse Error", error.message, "error");
        });
      } else {
        // Handle non-successful response status
        console.error("Request failed with status:", response.status);

        // Use the notify function to display a notification message
        const errorMessage = `Request failed with status: ${response.status}`;
        // You need to define notify or import it
        // notify("Request Failed", errorMessage, "error");
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


  /**
   * Load system configurations from API
   */
  async getSystemConfigs(): Promise<ReturnType<typeof createSystemConfigs>> {
    try {
      const endpoint = this.apiConfig.getEndpoint("config", "getSystemConfigs");
      const response = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: authenticationHeaders,
      });

      if (!response.ok) throw new Error(`Failed to load system configs: ${response.statusText}`);
      return await response.json(); // ✅ Proper response handling
    } catch (error) {
      handleApiError(error, "Failed to load system configurations");
      console.warn("Falling back to local system config defaults.");
      return createSystemConfigs();
    }
  }

  /**
   * Load user configurations from API
   */
  async getUserConfigs(): Promise<typeof UserConfigs> {
    try {
      const endpoint = this.apiConfig.getEndpoint("config", "getUserConfigs");
      const response = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: authenticationHeaders,
      });

      if (!response.ok) throw new Error(`Failed to load user configs: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      handleApiError(error, "Failed to load user configurations");
      console.warn("Falling back to local user config defaults.");
      return UserConfigs;
    }
  }


  /**
   * Load user settings from API
   */
  async getUserSettings(): Promise<Record<string, any>> {
    try {
      const endpoint = this.apiConfig.getEndpoint("config", "getUserSettings");
      const response = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: authenticationHeaders,
      });

      if (!response.ok) throw new Error(`Failed to load user settings: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      handleApiError(error, "Failed to load user settings");
      console.warn("Falling back to default user settings.");
      return {}; // fallback to empty/default settings
    }
  }


  /**
   * Get default snapshot configuration
   */
  getSnapshotConfig(): LazyLoadScriptConfigImpl {
    const defaultConfig: LazyLoadScriptConfigImpl = {
      timeout: 5000,
      onLoad: () => console.log("Script loaded successfully"),
      retryCount: 3,
      retryDelay: 1000,
      asyncLoad: true,
      deferLoad: false,
      onBeforeLoad: () => console.log("Loading script..."),
      onScriptError: (error: ErrorEvent) => console.error("Error loading script", error),
      onTimeout: () => console.warn("Timeout loading script"),
      onCachedLoad: () => console.log("Script loaded from cache"),
      onCachedTimeout: () => console.warn("Timeout loading cached script"),
      onCachedError: (error: Error) => console.error("Cached load error", error),

      // ✅ Dynamic system components
      systemConfigs: createSystemConfigs(),
      userConfigs: UserConfigs,
      dataVersions: () => dataVersions,
      frontend: frontendConfig as FrontendConfig,
      backend: backendConfig as BackendConfig,
      aquaConfig: {} as AquaConfig,
      storeConfig: {} as StoreConfig,
      configureScript: () => {},
    };

    return defaultConfig;
  }


    /**
   * Subscribe to API config changes
   */
  subscribeToApiConfig(callback: (config: ApiConfig) => void): void {
    this.apiConfigSubscribers.push(callback);
  }

    /**
   * Notify subscribers when API config changes
   */
  private notifyApiConfigSubscribers(): void {
    this.apiConfigSubscribers.forEach((callback) => callback(this.apiConfig));
  }

  /** Get cached snapshot config or create new one */
  public async getCachedSnapshotConfig(): Promise<LazyLoadScriptConfigImpl> {
    if (!this.cachedConfig) {
      console.log('[ConfigService] Creating new snapshot config...');
      this.cachedConfig = await this.getSnapshotConfig();
    }
    return this.cachedConfig;
  }

  /** Force refresh of cached configs */
  public async refreshConfigs(): Promise<void> {
    console.log('[ConfigService] Refreshing all cached configs...');
    
    // Clear all caches
    this.cachedConfig = null;

    // Reinitialize
    await this.getSnapshotConfig();
  }

  /** Get lazy load script config with proper caching strategy */
  public async getLazyLoadScriptConfig(): Promise<LazyLoadScriptConfigImpl> {
    const snapshotConfig = await this.getCachedSnapshotConfig();
    
    // Apply conditional modifications based on your business logic
    return this.applyConditionalConfigurations(snapshotConfig);
  }



  /** Apply conditional configurations to base snapshot config */
  private applyConditionalConfigurations(baseConfig: LazyLoadScriptConfigImpl): LazyLoadScriptConfigImpl {
    const aquaConfig: AquaConfig = {
      apiUrl: 'https://example.com/aqua-api',
      maxConnections: 10,
      timeout: 0,
      secureConnection: false,
      reconnectAttempts: 0,
      autoReconnect: false,
      appId: '',
      appSecret: '',
      relayUrl: '',
      relayToken: '',
      chatToken: '',
      chatUrl: '',
      chatWebsocketUrl: '',
      chatImageUploadUrl: '',
      chatImageUploadHeaders: {} as Record<string, string>,
      chatImageUploadParams: {} as Record<string, string>,
      chatImageUploadUrlParams: {} as Record<string, string>,
      chatImageDownloadUrl: '',
      chatImageDownloadHeaders: {} as Record<string, string>,
      chatImageDownloadParams: {} as Record<string, string>,
      chatImageDownloadUrlParams: {} as Record<string, string>,
      chatImageCacheUrl: '',
      chatImageCacheHeaders: {} as Record<string, string>,
      chatImageCacheParams: {} as Record<string, string>,
    };

    // Case 1: Custom configuration based on AquaConfig
    const isCustomConfigNeeded = aquaConfig.maxConnections > 5;
    if (isCustomConfigNeeded) {
      const customApiConfig: ApiConfig = {
        ...this.apiConfig,
        name: 'customApiConfig',
        baseURL: 'https://custom-api.com',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
        retry: {
          enabled: true,
          maxRetries: 3,
          retryDelay: 0,
        },
      };

      return {
        ...baseConfig,
        configureScript,
        apiConfig: customApiConfig,
        aquaConfig,
      };
    }

    // Case 2: Special scenario handling
    const specialScenario = isProjectInSpecialPhase({} as Project);
    if (specialScenario) {
      const specialStoreConfig: StoreConfig = {
        name: 'Special Store',
        description: 'Special store for special scenario',
      };

      return {
        ...baseConfig,
        configureScript,
        storeConfig: specialStoreConfig,
        aquaConfig,
      };
    }

    // Return base config with aquaConfig
    return {
      ...baseConfig,
      configureScript,
      aquaConfig,
    };
  }

   // Cache management methods

  public clearCache(): void {
    this.cachedConfig = null;
    console.log('[ConfigService] All caches cleared');
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
        strategy: 'memory', // ✅ Add missing property
        ttl: 3600000, // ✅ Add missing property (1 hour)
        versioning: { // ✅ Add missing property
          enabled: true,
          key: 'v1'
        },
        invalidation: { // ✅ Add missing property
          onUpdate: true,
          onDelete: true,
          pattern: '.*'
        }
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
    const DATA_PATH = '@/data';
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

