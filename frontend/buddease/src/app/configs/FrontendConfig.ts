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
  baseURL: process.env.BACKEND_API_BASE_URL || "https://api.example.com", // Use process.env or default value
  timeout: parseInt(process.env.BACKEND_API_TIMEOUT ?? "10000"), // Use process.env or default value, convert to number
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.BACKEND_API_ACCESS_TOKEN || "your-access-token"}`, // Use process.env or default value
  },
  retry: {
    enabled: true,
    maxRetries: parseInt(process.env.BACKEND_RETRY_MAX_RETRIES ?? "3"), // Use process.env or default value, convert to number
    retryDelay: parseInt(process.env.BACKEND_RETRY_DELAY ?? "1000"), // Use process.env or default value, convert to number
  },
  cache: {
    enabled: true,
    maxAge: 300000,
    staleWhileRevalidate: parseInt(process.env.BACKEND_CACHE_STALE_WHILE_REVALIDATE ?? "60000"), // Use process.env or default value, convert to number
    cacheKey: process.env.BACKEND_API_CACHE_KEY || "api_cache_key", // Use process.env or default value
  },
  responseType: "json",
  withCredentials: true,
  onLoad: (response) => console.log("Script loaded successfully", response),
  name: undefined
};

const backendConfig: BackendConfig = {
  appName: process.env.BACKEND_APP_NAME || "YourBackendAppName", // Use process.env or default value
  appVersion: "1.0.0",
  apiConfig: defaultApiConfig,
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
  backendSpecificProperty: process.env.BACKEND_SPECIFIC_PROPERTY || "YourBackendSpecificValue", // Use process.env or default value
};

export { backendConfig };
