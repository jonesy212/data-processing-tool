// generateNewApiConfig.ts
import { ApiConfig, CacheConfig, RetryConfig } from "@/app/configs/ConfigurationService";
import { NotificationTypeEnum } from "../components/support/NotificationContext";
import dataLoader from "../configs/database/dataLoader";
import UniqueIDGenerator from "./GenerateUniqueIds";




const generateUniqueApiId = (): string => {
  const apiName = "YourApiName"; // Replace "YourApiName" with your actual API name or use a dynamic value
  const id = UniqueIDGenerator.generateID("api", apiName, NotificationTypeEnum.GeneratedID);
  return id;
};

const generateNewApiConfig = (
  name: string,
  url: string,
  timeout: number
): ApiConfig => {
  // You can generate an ID using a library or some unique logic
  const id = UniqueIDGenerator.generateID("apiConfigs", name, NotificationTypeEnum.GeneratedID);
  
  const newApiConfig: ApiConfig = {
      id,
      name,
      url,
      timeout,
      baseURL: "",
      headers: {},
      retry: {} as RetryConfig,
      cache: {} as CacheConfig,
      responseType: {} as ApiConfig["responseType"],
      withCredentials: false,
      onLoad: function (response: any): void {
        // Use the onLoad function from dataLoader
        dataLoader.onLoad(response);
    }
  };

  return newApiConfig;
};



export { generateNewApiConfig, generateUniqueApiId };

