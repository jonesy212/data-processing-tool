// generateNewApiConfig.ts
import { ApiConfig, CacheConfig, RetryConfig } from "@/app/configs/ConfigurationService";

const generateNewApiConfig = (
  name: string,
  url: string,
  timeout: number
): ApiConfig => {
  // You can generate an ID using a library or some unique logic
  const id = generateUniqueId();
  
  const newApiConfig: ApiConfig = {
      id,
      name,
      url,
      timeout,
      baseURL: "",
      headers: {},
      retry: {} as RetryConfig,
      cache: {} as CacheConfig,
      responseType: "",
      withCredentials: false,
      onLoad: function (response: any): void {
        // Use the onLoad function from dataLoader
        dataLoader.onLoad(response);
    }
  };

  return newApiConfig;
};

// Function to generate a unique ID (You may use a library or a custom implementation)
const generateUniqueId = (): string => {
  // Replace this with your unique ID generation logic
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export { generateNewApiConfig };
