import Project, { isProjectInSpecialPhase } from "../components/projects/Project";
import { AquaConfig } from "../components/web3/web_configs/AquaConfig";
import StoreConfig from "../shopping_center/StoreConfig";
import { BackendDocumentConfig, backendDocumentConfig } from "./BackendDocumentConfig";
import dataVersions from "./DataVersionsConfig";
import frontendStructure from "./FrontendStructure";
import { LazyLoadScriptConfig } from "./LazyLoadScriptConfig";
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
  lazyLoadScriptConfig: LazyLoadScriptConfig;
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
    dataVersions: typeof dataVersions,
    userSettings: typeof userSettings,
    userPreferences: typeof userPreferences,
    backendDocumentConfig: typeof backendDocumentConfig; // Add backendDocumentConfig here
    frontendStructure: typeof frontendStructure,
  };
  // other configuration options
}

class ConfigurationService {
  private static instance: ConfigurationService;
  private apiConfig: ApiConfig;
  private cachedConfig: LazyLoadScriptConfig | null = null;

  private constructor() {
    // Initialize apiConfig with default values or load from some external source
    this.apiConfig = this.getApiConfig();
  }

  static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  setCachedConfig(config: LazyLoadScriptConfig): void {
    this.cachedConfig = config;
  }
  
  // Get the cached configuration
  getCachedConfig(): LazyLoadScriptConfig | null {
    return this.cachedConfig;
  }




  getLazyLoadScriptConfig(): LazyLoadScriptConfig {

  
    // Example: Default configuration
    const defaultConfig: LazyLoadScriptConfig = {
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
      apiUrl: 'https://example.com/aqua-api',
      maxConnections: 10,
      // Additional configuration options...
    };
    // Additional edge cases and use cases
    // Case 1: Custom configuration based on a condition
    // Determine if custom configuration is needed based on AquaConfig
    const isCustomConfigNeeded = aquaConfig.maxConnections > 5;
    if (isCustomConfigNeeded) {
      const customApiConfig: ApiConfig = {
        baseURL: 'https://custom-api.com',
        timeout: 10000,
        headers: {
          "Content-Type": "application/json"
        },
        retry: {
          enabled: true,
          maxRetries: 3,
          retryDelay: 0
        },
        cache: {} as CacheConfig,
        responseType: "",
        withCredentials: false,
        onLoad: function (response: any): void {
          throw new Error("Function not implemented.");
        }
      };

      return {
        // Merge default configuration with custom ApiConfig properties
        ...defaultConfig,
        apiConfig: customApiConfig,
        // Add more custom properties for this case
      };

    
    }

  
    // Determine if a special scenario requires different configuration
    const specialScenario = isProjectInSpecialPhase({} as Project)
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

  

  getApiConfig(): ApiConfig {
    // Example API configuration
    // You can modify this based on your application's needs
    return {
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

  // Add a method to update the API config if needed
  updateApiConfig(updatedConfig: Partial<ApiConfig>): void {
    this.apiConfig = { ...this.apiConfig, ...updatedConfig };
  }

  // Add a method to get the current API config
  getCurrentApiConfig(): ApiConfig {
    return this.apiConfig;
  }

  getConfigurationOptions(): ConfigurationOptions {
    return {} as ConfigurationOptions
  }



}
// Create an instance of the configuration service
const configurationService = ConfigurationService.getInstance();

export default configurationService;
