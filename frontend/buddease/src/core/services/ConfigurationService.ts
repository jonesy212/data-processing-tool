// ConfigurationService.ts
import type { ApiConfig } from '@/core/api/ApiConfigService';
import ApiConfigService from '@/core/api/ApiConfigService';
import { getConfigsData } from '@/core/api/getConfigsApi';

import { createSystemConfigs } from '@/core/api/systemConfigs';
import { UserConfigs } from '@/core/api/userConfigs';
import {
    BackendConfig
} from '@/core/config/BackendConfig';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { CacheConfig } from "@/core/config/CacheConfig";
import { EndpointCategory, EndpointConfigurations, EndpointKey } from '@/core/config/EndpointConfig';
import {
    FrontendConfig,
    frontendConfig,
} from '@/core/config/FrontendConfig';
import LazyLoadScriptConfigImpl from '@/core/config/LazyLoadScriptConfig';
import type { UnifiedMetadata } from '@/core/config/MetaDataOptions';
import { ModuleType, userPreferences } from '@/core/config/UserPreferences';
import userSettings from '@/core/config/UserSettings';
import dataVersions from '@/core/configs/DataVersionsConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Project, isProjectInSpecialPhase } from '@/core/models/projects/Project';
import StoreConfig from '@/core/shoppingCenter/ShoppingCenterConfig';
import { useNotification } from '@/core/state/context/NotificationContext';
import type { EventRecord } from '@/core/state/stores/DataStore';
import { VersionHistory } from '@/core/versions/VersionData';
import { AquaConfig } from '@/utils/web3/webConfigs/aqua/AquaConfig';

interface BaseRetryConfig {
  // Original properties (for compatibility)
  maxRetries?: number;
  retryDelay?: number;
  
  // New properties (what your code actually uses)
  attempts?: number;
  delay?: number;
}

interface BaseMetadataConfig<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  enableSnapshot?: boolean;
  eventRecords?: EventRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | [];
  metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
}

export interface RetryConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
}



interface ConfigurationOptions<
  T extends BaseDataEntity = BaseDataEntity,
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

const notify = useNotification()

const configureScript = () => {
  console.log("Script configured");
};

export class ConfigurationService {
  protected static instance: ConfigurationService;
  private apiConfigService: ApiConfigService;
  private configurations: EndpointConfigurations;
  // private endpoints: typeof mergedEndpoints; // Use the type of merged endpoints
   private endpoints: EndpointConfigurations;
  
  private apiConfig: ApiConfig; // Added missing property
  private apiConfigSubscribers: Array<(config: ApiConfig) => void> = []; // Added missing property
  private cachedConfig: LazyLoadScriptConfigImpl | null = null; // Added missing property
  private authenticationHeaders: Record<string, string> = {}; // Added for consistency
  private backendConfig: BackendConfig;
  private frontendConfig: FrontendConfig;
  private storeConfig: StoreConfig;
  private aquaConfig: AquaConfig;

  // Fixed constructor - removed duplicate constructor
  constructor(configurations: EndpointConfigurations, endpoints: Endpoints) {
    this.configurations = configurations;
    // this.endpoints = endpoints;
    this.endpoints = endpoints as EndpointConfigurations;

    this.apiConfigService = new ApiConfigService(configurations, endpoints);
    this.apiConfig = this.getDefaultApiConfig();
    this.backendConfig = {} as BackendConfig; // Initialize properly
    this.frontendConfig = {} as FrontendConfig;
    this.storeConfig = {} as StoreConfig;
    this.aquaConfig = {} as AquaConfig;
  }




  private async readConfigFile(): Promise<any> {
    try {
      // Need to get endpoint from apiConfigService, not apiConfig
      const endpoint = this.apiConfigService.getEndpoint("config", "getConfigFile");
      const response = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: this.authenticationHeaders, // Fixed reference
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

    getApiEndpoint<T extends keyof EndpointConfigurations>(
    category: T,
    endpointKey: keyof EndpointConfigurations[T],
    params?: Record<string, any>
  ) {
    const endpoint = this.endpoints[category]?.[endpointKey];
    if (!endpoint) {
      throw new Error(`Endpoint ${String(endpointKey)} not found in category ${String(category)}`);
    }
    return endpoint;
  }

  async getUsername(): Promise<string | null> {
    try {
      // If you have access to auth context in this service
      const { userId } = useSecureUserId();
      if (!userId) return null;
      
      // Or fetch username from your API/database
      const response = await yourApiService.getUserProfile(userId);
      return response.data.username;
    } catch (error) {
      console.error('Error fetching username:', error);
      return null;
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
    // Helper functions that use the ApiConfigService instance
    const getEndpoint = <T extends EndpointCategory>(
      category: T,
      endpointKey: EndpointKey<T>
    ) => {
      return this.apiConfigService.getEndpoint(category, endpointKey);
    };

    const getUrl = <T extends EndpointCategory, K extends EndpointKey<T>>(
      category: T,
      endpointKey: K,
      ...params: any[]
    ): string => {
      return this.apiConfigService.getUrl(category, endpointKey, ...params);
    };

    const getMethod = <T extends EndpointCategory, K extends EndpointKey<T>>(
      category: T,
      endpointKey: K,
      ...params: any[]
    ): string => {
      return this.apiConfigService.getMethod(category, endpointKey, ...params);
    };

    return {
      name: "defaultName",
      timeout: 5000,
      headers: {},
      retry: {} as RetryConfig,
      cache: {} as CacheConfig,
      responseType: {
        contentType: this.getApiVersionHeader(), // Use method to get header
        encoding: "utf-8",
      },
      withCredentials: false,
      baseURL: process.env.REACT_APP_API_BASE_URL || "",
      onLoad: function (response: Response) {
        if (response.status >= 200 && response.status < 300) {
          response.json().then((data) => {
            console.log("Response data:", data);
          }).catch((error: Error) => {
            console.error("Error parsing response:", error);
          });
        } else {
          console.error("Request failed with status:", response.status);
          const errorMessage = `Request failed with status: ${response.status}`;
        }
      },
      getEndpoint,
      getUrl,
      getMethod,
      apiConfigService: this.apiConfigService,
      configurations: this.configurations,
      endpoints: this.endpoints
    };
  }

  // Provide separate methods for endpoint operations
  public getEndpoint<T extends EndpointCategory>(
    category: T,
    endpointKey: EndpointKey<T>
  ) {
    return this.apiConfigService.getEndpoint(category, endpointKey);
  }

  public getUrl<T extends EndpointCategory, K extends EndpointKey<T>>(
    category: T,
    endpointKey: K,
    ...params: any[]
  ): string {
    return this.apiConfigService.getUrl(category, endpointKey, ...params);
  }

  public getMethod<T extends EndpointCategory, K extends EndpointKey<T>>(
    category: T,
    endpointKey: K,
    ...params: any[]
  ): string {
    return this.apiConfigService.getMethod(category, endpointKey, ...params);
  }

  // Get the ApiConfigService instance
  public getApiConfigService(): ApiConfigService {
    return this.apiConfigService;
  }

  static getSimpleInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      throw new Error("ConfigurationService not initialized. Call getInstance() first.");
    }
    return ConfigurationService.instance;
  }

  // Static instance management - Fixed duplicate method
  public static getInstance(configurations?: EndpointConfigurations, endpoints?: Endpoints): ConfigurationService {
    if (!ConfigurationService.instance) {
      if (!configurations || !endpoints) {
        throw new Error("Configurations and endpoints must be provided for first initialization");
      }
      ConfigurationService.instance = new ConfigurationService(configurations, endpoints);
    }
    return ConfigurationService.instance;
  }

  getAppName(currentAppName: string): string {
    return currentAppName || this.apiConfig.name || "defaultApp";
  }

  // New public method to expose getDefaultApiConfig
  getPublicDefaultApiConfig(): ApiConfig {
    return this.apiConfig;
  }

  /**
   * Load system configurations from API
   */
  async getSystemConfigs(): Promise < ReturnType < typeof createSystemConfigs >> {
  try {
    const endpoint = this.apiConfigService.getEndpoint("config", "getSystemConfigs");
    const response = await fetch(endpoint.path, {
      method: endpoint.method,
      headers: this.authenticationHeaders,
    });

    if(!response.ok) throw new Error(`Failed to load system configs: ${response.statusText}`);
    return await response.json();
  } catch(error) {
    this.handleApiError(error, "Failed to load system configurations");
    console.warn("Falling back to local system config defaults.");
    return createSystemConfigs();
  }
}

  /**
   * Load user configurations from API
   */
  async getUserConfigs(): Promise < typeof UserConfigs > {
  try {
    const endpoint = this.apiConfigService.getEndpoint("config", "getUserConfigs");
    const response = await fetch(endpoint.path, {
      method: endpoint.method,
      headers: this.authenticationHeaders,
    });

    if(!response.ok) throw new Error(`Failed to load user configs: ${response.statusText}`);
    return await response.json();
  } catch(error) {
    this.handleApiError(error, "Failed to load user configurations");
    console.warn("Falling back to local user config defaults.");
    return UserConfigs;
  }
}

  /**
   * Load user settings from API
   */
  async getUserSettings(): Promise < Record < string, any >> {
  try {
    const endpoint = this.apiConfigService.getEndpoint("config", "getUserSettings");
    const response = await fetch(endpoint.path, {
      method: endpoint.method,
      headers: this.authenticationHeaders,
    });

    if(!response.ok) throw new Error(`Failed to load user settings: ${response.statusText}`);
    return await response.json();
  } catch(error) {
    this.handleApiError(error, "Failed to load user settings");
    console.warn("Falling back to default user settings.");
    return {};
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
    frontend: this.frontendConfig,
    backend: this.backendConfig,
    aquaConfig: this.aquaConfig,
    storeConfig: this.storeConfig,
    configureScript: configureScript,
  };

  return defaultConfig;
}

getFullApiConfig(): ApiConfig {
  const getEndpoint = <T extends EndpointCategory>(
    category: T,
    endpointKey: EndpointKey<T>
  ) => this.apiConfigService.getEndpoint(category, endpointKey);

  const getUrl = <T extends EndpointCategory, K extends EndpointKey<T>>(
    category: T,
    endpointKey: K,
    ...params: any[]
  ) => this.apiConfigService.getUrl(category, endpointKey, ...params);

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
      strategy: 'memory',
      ttl: 3600000,
      versioning: {
        enabled: true,
        key: 'v1'
      },
      invalidation: {
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
    configurations: this.configurations,
    endpoints: this.endpoints,
    getEndpoint,
    getUrl,
    getMethod: this.getMethod.bind(this),
    onLoad: (response) => console.log("Script loaded successfully", response),
  };
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
  public async getCachedSnapshotConfig(): Promise < LazyLoadScriptConfigImpl > {
  if(!this.cachedConfig) {
  console.log('[ConfigService] Creating new snapshot config...');
  this.cachedConfig = this.getSnapshotConfig(); // Not async
}
return this.cachedConfig;
  }

  /** Force refresh of cached configs */
  public async refreshConfigs(): Promise < void> {
  console.log('[ConfigService] Refreshing all cached configs...');

  // Clear all caches
  this.cachedConfig = null;

  // Reinitialize
  this.cachedConfig = this.getSnapshotConfig();
}

  /** Get lazy load script config with proper caching strategy */
  public async getLazyLoadScriptConfig(): Promise < LazyLoadScriptConfigImpl > {
  const snapshotConfig = await this.getCachedSnapshotConfig();

  // Apply conditional modifications based on your business logic
  return this.applyConditionalConfigurations(snapshotConfig);
}

 
  // Cache management methods
  public clearCache(): void {
  this.cachedConfig = null;
  console.log('[ConfigService] All caches cleared');
}

  // This should be the primary method to get API config
  public getApiConfig(): ApiConfig {
  return this.apiConfig;
}

// Add a method to get the current API config
getCurrentApiConfig(): ApiConfig {
  return this.apiConfig;
}

// Method to retrieve the API version header
getApiVersionHeader(): string {
  return 'application/vnd.yourapp.v1+json';
}

getDataPath(): string {
  return '@/data';
}

getConfigurationOptions(): ConfigurationOptions {
  return {} as ConfigurationOptions;
}

// Fixed duplicate method with correct name
subscribeToApiConfigChanges(callback: (config: ApiConfig) => void): void {
  this.apiConfigSubscribers.push(callback);
}

unsubscribeFromApiConfigChanges(callback: (config: ApiConfig) => void): void {
  this.apiConfigSubscribers = this.apiConfigSubscribers.filter(
    (subscriber) => subscriber !== callback
  );
}

  private triggerApiConfigChange(): void {
  const currentConfig = this.getCurrentApiConfig();
  this.apiConfigSubscribers.forEach((subscriber) =>
    subscriber(currentConfig)
  );
}

// Example method that updates the API config and triggers changes
updateApiConfig(updatedConfig: Partial<ApiConfig>): void {
  this.apiConfig = { ...this.apiConfig, ...updatedConfig };
  this.triggerApiConfigChange();
}

  // Helper method for error handling
  private handleApiError(error: any, message: string): void {
    console.error(message, error);
    // You could add notification logic here
    notify({ id: 'api_error', message, type: 'error' });
  }

  /** Apply conditional configurations to base snapshot config */
  private applyConditionalConfigurations(baseConfig: LazyLoadScriptConfigImpl): LazyLoadScriptConfigImpl {
    // Define aquaConfig with all properties
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

    const configureScript = () => { }; // Define this function

    // Get configurations from the service
    const configurations = this.configurations;
    const endpoints = this.endpoints;

    // Helper functions
    const getEndpoint = <T extends EndpointCategory>(
      category: T,
      endpointKey: EndpointKey<T>
    ) => {
      return this.apiConfigService.getEndpoint(category, endpointKey);
    };

    const getUrl = <T extends EndpointCategory, K extends EndpointKey<T>>(
      category: T,
      endpointKey: K,
      ...params: any[]
    ): string => {
      return this.apiConfigService.getUrl(category, endpointKey, ...params);
    };

    // Case 1: Check for special scenario first
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

    // Case 2: Custom configuration based on AquaConfig
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
        } as RetryConfig,
        cache: {
          enabled: true,
          maxAge: 300000,
          staleWhileRevalidate: 60000,
          cacheKey: "api_cache_key",
          strategy: 'memory',
          ttl: 3600000,
          versioning: {
            enabled: true,
            key: 'v1'
          },
          invalidation: {
            onUpdate: true,
            onDelete: true,
            pattern: '.*'
          }
        } as CacheConfig,
        responseType: {
          contentType: this.getApiVersionHeader(),
          encoding: "utf-8",
        },
        withCredentials: true,
        configurations,
        endpoints,
        getEndpoint,
        getUrl,
        getMethod: this.getMethod.bind(this),
        apiConfigService: this.apiConfigService,
        onLoad: (response) => console.log("Script loaded successfully", response),
      };

      return {
        ...baseConfig,
        configureScript,
        apiConfig: customApiConfig,
        aquaConfig,
      };
    }

    // Default case: Return base config with aquaConfig
    return {
      ...baseConfig,
      configureScript,
      aquaConfig,
    };
  }
}


// Create an instance of the configuration service
const configServiceInstance = ConfigurationService.getInstance();

export { configServiceInstance };
export type { BaseMetadataConfig, BaseRetryConfig, ConfigurationOptions };

