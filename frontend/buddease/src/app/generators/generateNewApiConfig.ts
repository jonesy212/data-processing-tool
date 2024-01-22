// generateNewApiConfig.ts
import { ApiConfig, CacheConfig, RetryConfig } from "@/app/configs/ConfigurationService";
import UniqueIDGenerator from "./GenerateUniqueIds";
const generateNewApiConfig = (
  name: string,
  url: string,
  timeout: number
): ApiConfig => {
  // You can generate an ID using a library or some unique logic
  const id = UniqueIDGenerator.generateID("apiConfigs", name);
  
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



export { generateNewApiConfig };
