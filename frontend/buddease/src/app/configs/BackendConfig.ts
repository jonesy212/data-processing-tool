// BackendConfig.ts
import { ApiConfig, CacheConfig, RetryConfig } from "./ConfigurationService";

export interface BackendConfig {
  appName: string;
  appVersion: string;
  apiConfig: ApiConfig;
  retryConfig: RetryConfig;
  cacheConfig: CacheConfig;
  backendSpecificProperty: string;
}

const defaultApiConfig: ApiConfig = {
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
  name: undefined
};

const backendConfig: BackendConfig = {
  appName: "YourBackendAppName",
  appVersion: "1.0.0",
  apiConfig: defaultApiConfig,
  retryConfig: {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000,
  },
  cacheConfig: {
    enabled: true,
    maxAge: 300000,
    staleWhileRevalidate: 60000,
    cacheKey: "backend_api_cache_key",
  },
  backendSpecificProperty: "YourBackendSpecificValue",
};

export { backendConfig };
