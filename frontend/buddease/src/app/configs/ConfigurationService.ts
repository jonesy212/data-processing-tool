import { SystemConfigs } from "../api/systemConfigs";
import { UserConfigs } from "../api/userConfigs";
import Project, { isProjectInSpecialPhase } from "../components/projects/Project";
import { AquaConfig } from "../components/web3/web_configs/AquaConfig";
import StoreConfig from "../shopping_center/ShoppingCenterConfig";
import {
  BackendDocumentConfig,
  backendDocumentConfig,
} from "./BackendDocumentConfig";

import dataVersions from "./DataVersionsConfig";
import { frontendDocumentConfig } from "./FrontendDocumentConfig";
import LazyLoadScriptConfigImpl from "./LazyLoadScriptConfig";
import userPreferences, { ModuleType } from "./UserPreferences";
import userSettings from "./UserSettings";


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
  responseType: string;
  withCredentials: boolean;
  onLoad: (response: any) => void;
}

interface ConfigurationOptions {
  namingConventions: any;
  lazyLoadScriptConfig: LazyLoadScriptConfigImpl;
  apiConfig: ApiConfig;
  lastUpdated: string;
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

  backendDocumentConfig: BackendDocumentConfig; // Add backendDocumentConfig here

  configStructure: {
    systemConfigs: typeof SystemConfigs;
    userConfigs: typeof UserConfigs;
    aquaConfig: AquaConfig;
    storeConfig: StoreConfig;
    dataVersions: typeof dataVersions;
    frontendDocumentConfig: typeof frontendDocumentConfig;
    lazyLoadScriptConfig: LazyLoadScriptConfigImpl;
    userPreferences: typeof userPreferences;
    userSettings: typeof userSettings;
  }
  // other configuration options
}

class ConfigurationService {
  private static instance: ConfigurationService;
  private apiConfig: ApiConfig;
  private cachedConfig: LazyLoadScriptConfigImpl | null = null;
  private apiConfigSubscribers: ((config: ApiConfig) => void)[] = [];

  private constructor() {
    // Initialize apiConfig with default values
    this.apiConfig = {
      name: "apiConfigName",
      baseURL: "",
      timeout: 0,
      headers: {},
      retry: {} as RetryConfig,
      cache: {} as CacheConfig,
      responseType: "",
      withCredentials: false,
      onLoad: () => {},
    };
  }

  private getDefaultApiConfig() {
    return {
      // default config values
      baseURL: process.env.REACT_APP_API_BASE_URL || "",
      backendDocumentConfig: backendDocumentConfig,
      frontendDocumentConfig: frontendDocumentConfig // Add frontendDocumentConfig
    };
  }

  static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
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
    };

    const aquaConfig: AquaConfig = {
      apiUrl: "https://example.com/aqua-api",
      maxConnections: 10,
      timeout: 0,
      secureConnection: false,
      reconnectAttempts: 0,
      autoReconnect: false
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
        responseType: "",
        withCredentials: false,
        onLoad: function (response: any): void {
          throw new Error("Function not implemented.");
        },
      };

      return {
        // Merge default configuration with custom ApiConfig properties
        ...defaultConfig,
        apiConfig: customApiConfig,
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
      responseType: "json",
      withCredentials: true,
      onLoad: (response) => console.log("Script loaded successfully", response),
    };
  }

  // Add a method to get the current API config
  getCurrentApiConfig(): ApiConfig {
    return this.apiConfig;
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
const configurationService = ConfigurationService.getInstance();

export default configurationService;
