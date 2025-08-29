// BaseConfig.ts
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { TagsRecord } from '@/app/components/snapshots/SnapshotWithCriteria';
import { UnifiedMetadata, UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { useSnapshot } from './../context/SnapshotContext';

import { Taggable } from '@/app/components/models/CommonData';
import { Snapshot } from "@/app/components/snapshots";
import { K, T, Meta } from "../components/models/data/dataStoreMethods";
import { EventManager, InitializedState } from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { BaseCacheConfig, BaseMetadataConfig, BaseRetryConfig, } from "./ConfigurationService";
import { BaseMetadata } from './database/MetaDataOptions';
import { StructuredMetadata } from "./StructuredMetadata";
import { useMeta } from "./useMeta";
import { useMetadata } from "./useMetadata";
import { SharedIdentifiers } from '../components/documents/RelatedProps';

interface BaseDataRoot extends SharedIdentifiers<BaseDataRoot> {
  [key: string]: any;
}

type BaseDataEntity = BaseDataRoot;
type DefaultMeta<T extends BaseDataEntity, K extends T = T> = StructuredMetadata<T, K, Meta<T, K>, ExcludedFields<T, K>>;
type DefaultExcludedFields<T extends BaseDataEntity> = never;

// Utility type for excluding fields
type WithoutExcluded<T, ExcludedFields extends keyof T> = Omit<T, ExcludedFields>;

interface SharedConfig {
  apiKey: string | undefined; // API key (optional)
  apiEndpoint: string; // API endpoint URL
  id?: string | number; // Unique identifier
  maxConnections?: number; // Optional: Maximum connections
  authToken?: string; // Optional: Authentication token
  // Add other shared properties as needed
}

// Combine the base interfaces into a single interface
interface BaseConfig<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SharedConfig, 
  BaseRetryConfig, 
  BaseCacheConfig, 
  BaseMetadataConfig<T, K, Meta>,
  BaseMetadata<K>,
  Taggable<T, K> {
  id?: string | number;
  apiEndpoint: string;
  apiKey: string | undefined;
  timeout: number;
  retryAttempts: number;
  isActive: boolean
  name: string;
  description?: string
  category: Category | undefined,
  timestamp: string | number | Date | undefined;
  createdBy?: string | undefined;
  tags?: string[] | TagsRecord<T, K> | undefined
  metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>;
  initialState: InitializedState<T, K>;
  meta: StructuredMetadata<T, K, Meta>;
  mappedSnapshot: Map<string, Snapshot<T, K, Meta, ExcludedFields>>;
  events: EventManager<T, K>;
}

// Specific configuration for project management features
interface ProjectManagementConfig<
  T extends  BaseDataEntity,
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
  T extends  BaseDataEntity,
  K extends T = T> extends BaseConfig<T, K> {
  supportedCurrencies: string[];
  defaultCurrency: string;
  marketDataRefreshInterval: number;
}



const area = fetchUserAreaDimensions().toString()
const metadata: UnifiedMetaDataOptions<T, K> = useMetadata<T, K>(area)
const currentMeta: StructuredMetadata<T, K> = useMeta<T, K>(area)

const mappedSnapshot: Map<string, Snapshot<T, K, DefaultMeta<T, K>, never>> = new Map(
  Array.from(useSnapshot<T, K, StructuredMetadata<T, K>, never>().snapshotMap)
);

const baseConfig: BaseConfig<T, K> = {
  id: "snapshot1",
  category: "example category",
  timestamp: new Date(),
  createdBy: "creator1",
  description: "Sample snapshot description",
  tags: ["sample", "snapshot"],
  schema: {},
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
  meta: {} as StructuredMetadata<T, K>,
  events: {
     eventRecords: {},
  },
}

export { baseConfig, mappedSnapshot };
export type {
  BaseConfig, CryptoConfig, ProjectManagementConfig, SharedConfig,
  BaseDataEntity,
  DefaultMeta,
  DefaultExcludedFields,
  BaseDataRoot
 };

