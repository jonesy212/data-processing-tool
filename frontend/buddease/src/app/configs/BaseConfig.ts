// BaseConfig.ts

import { Data } from "../components/models/data/Data";
import { EventManager } from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot } from "../components/snapshots";
import { BaseCacheConfig, BaseMetadataConfig, BaseRetryConfig, } from "./ConfigurationService";
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';


// Combine the base interfaces into a single interface
interface BaseConfig<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> extends BaseRetryConfig, BaseCacheConfig, BaseMetadataConfig {
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
  initialState: any;
  meta: Map<string, Snapshot<T, Meta, K>>;
  events: EventManager<T, Meta, K>;
}
// Specific configuration for project management features
interface ProjectManagementConfig<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> extends BaseConfig<T, Meta, K> {
  taskPhases: string[];
  maxCollaborators: number;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
  };
}

// Specific configuration for the crypto module
interface CryptoConfig <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> extends BaseConfig<T, Meta, K> {
  supportedCurrencies: string[];
  defaultCurrency: string;
  marketDataRefreshInterval: number;
}


export type { BaseConfig, CryptoConfig, ProjectManagementConfig };
