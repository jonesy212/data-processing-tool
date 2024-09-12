// BaseConfig.ts

import { BaseMetadataConfig, BaseRetryConfig, BaseCacheConfig, } from "./ConfigurationService";

// Combine the base interfaces into a single interface
interface BaseConfig extends BaseRetryConfig, BaseCacheConfig, BaseMetadataConfig {
  apiEndpoint: string;
  apiKey: string;
  timeout: number;
  retryAttempts: number;
}
// Specific configuration for project management features
interface ProjectManagementConfig extends BaseConfig {
  taskPhases: string[];
  maxCollaborators: number;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
  };
}

// Specific configuration for the crypto module
interface CryptoConfig extends BaseConfig {
  supportedCurrencies: string[];
  defaultCurrency: string;
  marketDataRefreshInterval: number;
}


export type { BaseConfig, ProjectManagementConfig, CryptoConfig}