// BaseConfig.ts

import { BaseData } from "../components/models/data/Data";
import { EventManager, InitializedState } from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot } from "../components/snapshots";
import { BaseCacheConfig, BaseMetadataConfig, BaseRetryConfig, } from "./ConfigurationService";


// Combine the base interfaces into a single interface
interface BaseConfig<
  T extends  BaseData<T>, 
  K extends T = T
  > extends BaseRetryConfig, 
    BaseCacheConfig, 
    BaseMetadataConfig<T, K> {
  id: string;
  apiEndpoint: string;
  apiKey: string | undefined;
  timeout: number;
  retryAttempts: number;
  name: string;
  description?: string
  category: string;
  timestamp: string | number | Date | undefined;
  createdBy: string;
  tags: string[];
  metadata: Record<string, any>;
  initialState: InitializedState<T, K>;
  meta: Map<string, Snapshot<T, K>>;
  events: EventManager<T, K>;
}
// Specific configuration for project management features
interface ProjectManagementConfig<
  T extends  BaseData<T>,
  K extends T = T
> extends BaseConfig<T, K> {
  taskPhases: string[];
  maxCollaborators: number;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
  };
}

// Specific configuration for the crypto module
interface CryptoConfig<
  T extends  BaseData<T>,
  K extends T = T> extends BaseConfig<T, K> {
  supportedCurrencies: string[];
  defaultCurrency: string;
  marketDataRefreshInterval: number;
}




const baseConfig: BaseConfig<BaseData, BaseData> = {
  id: "snapshot1",
  category: "example category",
  timestamp: new Date(),
  createdBy: "creator1",
  description: "Sample snapshot description",
  tags: ["sample", "snapshot"],
  metadata: {},
   // Ensure these properties are correctly initialized based on your requirements
   apiEndpoint: "https://api.example.com", // Initialize with your actual API endpoint
   apiKey: "your_api_key", // Your API key
   timeout: 5000, // Timeout in milliseconds
   retryAttempts: 3, // Number of retry attempts
   name: "Base Snapshot", // Initialize name as needed
   initialState: undefined, // If there's no initial state, you can leave it as undefined
   meta: new Map<string, Snapshot<BaseData, BaseData>>(), // Initialize meta as a new Map
  events: {
     eventRecords: {},
  },
}


export { baseConfig };
export type { BaseConfig, CryptoConfig, ProjectManagementConfig };
