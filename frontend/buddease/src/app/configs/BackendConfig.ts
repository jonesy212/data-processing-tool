// BackendConfig.ts
import { ApiConfig, CacheConfig, RetryConfig } from "./ConfigurationService";

export interface BackendConfig {
  appName: string;
  appVersion: string;
  versionNumber: string; 
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
  responseType: { contentType: "json", encoding: "string", },
  withCredentials: true,
  onLoad: (response) => console.log("Script loaded successfully", response),
  name: undefined
};

const backendConfig: BackendConfig = {
  appName: process.env.BACKEND_APP_NAME || "YourBackendAppName", // Use process.env or default value
  appVersion: "1.0.0",
  apiConfig: defaultApiConfig,
  versionNumber: "1",
  retryConfig: {
    enabled: true,
    maxRetries: parseInt(process.env.BACKEND_RETRY_MAX_RETRIES ?? "3"), // Use process.env or default value, convert to number
    retryDelay: parseInt(process.env.BACKEND_RETRY_DELAY ?? "1000"), // Use process.env or default value, convert to number
  },
  cacheConfig: {
    enabled: true,
    maxAge: 300000,
    staleWhileRevalidate: parseInt(process.env.BACKEND_CACHE_STALE_WHILE_REVALIDATE ?? "60000"), // Use process.env or default value, convert to number
    cacheKey: "backend_api_cache_key",
  },
  backendSpecificProperty: "YourBackendSpecificValue",
};


export { backendConfig };
