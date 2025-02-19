// BaseConfig.ts
import { TagsRecord } from '@/app/components/snapshots/SnapshotWithCriteria';
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { useSnapshot } from './../context/SnapshotContext';

import { BaseData } from "../components/models/data/Data";
import { K, T } from "../components/models/data/dataStoreMethods";
import { EventManager, InitializedState } from "../components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot } from "../components/snapshots";
import { createLastUpdatedWithVersion, createLatestVersion } from "../components/versions/createLatestVersion";
import { version } from "../components/versions/Version";
import { BaseCacheConfig, BaseMetadataConfig, BaseRetryConfig, } from "./ConfigurationService";
import { BaseMetadata, UnifiedMetaDataOptions } from './database/MetaDataOptions';
import { StructuredMetadata } from "./StructuredMetadata";
import { useMeta } from "./useMeta";
import { useMetadata } from "./useMetadata";

// Combine the base interfaces into a single interface
interface BaseConfig<
  T extends  BaseData<any>, 
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> extends BaseRetryConfig, 
    BaseCacheConfig, 
    BaseMetadataConfig<T, K>, BaseMetadata<K> {
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
  tags: string[] | TagsRecord<BaseMetadata<T>, BaseMetadata<T>> | undefined
  metadata: UnifiedMetaDataOptions<T, K>;
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
const metadata: UnifiedMetaDataOptions<T, K<T>> = useMetadata<T, K<T>>(area)
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
  metadata: {
    area: area, 
    currentMeta: {
      metadataEntries: {},
      version: version,
      lastUpdated: createLastUpdatedWithVersion(),
      isActive: false,
      config: {},
      permissions: [],
      customFields: {},
      versionData: null,
      latestVersion: createLatestVersion(),
      id: "",
      apiEndpoint: "",
      apiKey: undefined,
      timeout: 0,
      retryAttempts: 0,
      name: "",
      category: "",
      timestamp: undefined,
      createdBy: "",
      tags: [],
      metadata: metadata,
      initialState: undefined,
      meta: currentMeta,
      mappedSnapshot: mappedSnapshot,
      events: {
        eventRecords: {}
      }
    }, 
    metadataEntries: {}
  },









  apiEndpoint: "https://api.example.com",
  apiKey: "your_api_key",
  timeout: 5000,
  retryAttempts: 3,
  name: "Base Snapshot",
  initialState: undefined,
  mappedSnapshot: new Map<string, Snapshot<T, K<T>, StructuredMetadata<T, K<T>>>>(),
  meta: {} as StructuredMetadata<T, K<T>>,
  events: {
     eventRecords: {},
  },

}

export { baseConfig };
export type { BaseConfig, CryptoConfig, ProjectManagementConfig };

