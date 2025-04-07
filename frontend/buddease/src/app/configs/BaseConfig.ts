import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
// BaseConfig.ts
import { TagsRecord } from '@/app/components/snapshots/SnapshotWithCriteria';
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { useSnapshot } from './../context/SnapshotContext';

import { Taggable } from '@/app/components/models/CommonData';
import { BaseData } from "../components/models/data/Data";
import { K, T } from "../components/models/data/dataStoreMethods";
import { EventManager, InitializedState } from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot } from "../components/snapshots";
import { BaseCacheConfig, BaseMetadataConfig, BaseRetryConfig, } from "./ConfigurationService";
import { BaseMetadata } from './database/MetaDataOptions';
import { StructuredMetadata } from "./StructuredMetadata";
import { useMeta } from "./useMeta";
import { useMetadata } from "./useMetadata";


interface SharedConfig {
  apiKey: string | undefined; // API key (optional)
  apiEndpoint: string; // API endpoint URL
  id: string; // Unique identifier
  maxConnections?: number; // Optional: Maximum connections
  authToken?: string; // Optional: Authentication token
  // Add other shared properties as needed
}

// Combine the base interfaces into a single interface
interface BaseConfig<
  T extends  BaseData<any>, 
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> extends SharedConfig, BaseRetryConfig, 
    BaseCacheConfig, 
    BaseMetadataConfig<T, K>, BaseMetadata<K>, Taggable<T, K> {
  id?: string | number;
  apiEndpoint: string;
  apiKey: string | undefined;
  timeout: number;
  retryAttempts: number;
  isActive: boolean
  name: string;
  description?: string
  category: Category | undefined,  timestamp: string | number | Date | undefined;
  createdBy?: string | undefined;
  tags?: string[] | TagsRecord<BaseMetadata<T>, BaseMetadata<T>> | undefined
  metadata: UnifiedMetadata<T, K, StructuredMetadata<T, K>, never>;
  initialState: InitializedState<T, K>;
  meta: StructuredMetadata<T, K>;
  mappedSnapshot: Map<string, Snapshot<T, K>>;
  events: EventManager<T, K>;
}

// Specific configuration for project management features
interface ProjectManagementConfig<
  T extends  BaseData<any>,
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
  T extends  BaseData<any>,
  K extends T = T> extends BaseConfig<T, K> {
  supportedCurrencies: string[];
  defaultCurrency: string;
  marketDataRefreshInterval: number;
}



const area = fetchUserAreaDimensions().toString()
const metadata: UnifiedMetadata<T, K<T>> = useMetadata<T, K<T>>(area)
const currentMeta: StructuredMetadata<T, K<T>> = useMeta<T, K<T>>(area)

const mappedSnapshot: Map<string, Snapshot<T, K<T>, StructuredMetadata<T, K<T>>, never>> = new Map(
  Array.from(useSnapshot<T, K<T>, StructuredMetadata<T, K<T>>, never>().snapshotMap)
);

const baseConfig: BaseConfig<T, K<T>> = {
  id: "snapshot1",
  category: "example category",
  timestamp: new Date(),
  createdBy: "creator1",
  description: "Sample snapshot description",
  tags: ["sample", "snapshot"],
  isActive: false,
  metadata: {
    area: area, 
    schema: {},
    metadataEntries: {}
  },
  apiEndpoint: "https://api.example.com",
  apiKey: "your_api_key",
  timeout: 5000,
  retryAttempts: 3,
  name: "Base Snapshot",
  initialState: undefined,
  mappedSnapshot: mappedSnapshot,
  meta: {} as StructuredMetadata<T, K<T>>,
  events: {
     eventRecords: {},
  },
}

export { baseConfig, mappedSnapshot };
export type { BaseConfig, CryptoConfig, ProjectManagementConfig, SharedConfig };

