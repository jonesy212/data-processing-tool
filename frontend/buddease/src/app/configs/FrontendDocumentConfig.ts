// FrontendDocumentConfig.ts
import { ApiConfig, CacheConfig, RetryConfig } from "./ConfigurationService";
interface FrontendDocumentConfig {
  // Common properties for frontend document configuration
  appName: string;
  appVersion: string;
  // Add more common properties as needed

  // Optional configurations for specific features
  apiConfig: ApiConfig;
  retryConfig: RetryConfig;
  cacheConfig: CacheConfig;
  // Add more feature-specific configurations as needed

  // Additional properties specific to frontend
  frontendSpecificProperty: string;
}

// Example usage:
const frontendDocumentConfig: FrontendDocumentConfig = {
  appName: "YourFrontendAppName",
  appVersion: "1.0.0",
  apiConfig: {
    baseURL: "https://api.example.com",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer your-access-token",
    },
    retry: {
      maxRetries: 3,
      retryDelay: 1000,
    } as RetryConfig,
    cache: {} as CacheConfig,
    responseType: "",
    withCredentials: false,
    onLoad: function (response: any): void {
      throw new Error("Function not implemented.");
    },
  },
  retryConfig: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
  },
  cacheConfig: {
    enabled: true,
    maxAge: 300000,
    staleWhileRevalidate: 60000,
    cacheKey: "frontend_api_cache_key",
  },
  frontendSpecificProperty: "YourFrontendSpecificValue",
};


// Use frontendDocumentConfig as needed in your frontend application
