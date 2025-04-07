import { Taggable } from '@/app/components/models/CommonData';
import { BaseData } from "@/app/components/models/data/Data";
import { EventManager, InitializedState } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { MetadataEntriesType, StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { createLatestVersion } from "../versions/createLatestVersion";
import { versionData } from "../versions/Version";
import { VersionData } from "../versions/VersionData";
import { BaseConfig } from '@/app/configs/BaseConfig';
import { U } from '@/app/components/snapshots/SnapshotStore'
import { category } from '../utils/snapshotUtils';


function convertBaseConfig<
  U extends BaseData<any>,
  T extends U,
  K extends T
>(
  baseConfig: BaseConfig<T, K, StructuredMetadata<T, K>> | undefined,
  defaultBaseConfig: BaseConfig<U, K, StructuredMetadata<U, K>>
): BaseConfig<U, K, StructuredMetadata<U, K>> {
  // If baseConfig is undefined, return the default
  if (!baseConfig) {
    return defaultBaseConfig;
  }

  // Perform any necessary transformations here
  return baseConfig as unknown as BaseConfig<U, K, StructuredMetadata<U, K>>;
}

function convertMetadata<U extends BaseData, K extends U = U>(
  metadata: UnifiedMetadata<U, K> | undefined
): StructuredMetadata<U, K> {
   // Define default values for all required properties
   const defaultStructuredMetadata: StructuredMetadata<U, K> = {
    author: "", // Default value for author
    timestamp: new Date().toISOString(), // Default value for timestamp
    baseConfig: {
      id: "",
      apiEndpoint: "",
      apiKey: "",
      timeout: 0,
      initialState: {} as InitializedState<U, K>,
      retryAttempts: 0,
      name: "",
      category: "",
      timestamp: "",
      author: "",
      metadata: {} as UnifiedMetadata<U, K, StructuredMetadata<U, K>, never>,
      meta: {} as StructuredMetadata<U, K>,
      mappedSnapshot: {} as Map<string, Snapshot<U, K, StructuredMetadata<U, K>, never>>,
      events: {} as EventManager<U, K, StructuredMetadata<U, K>>,
      latestVersion: createLatestVersion<U, K>(),
      schema: {},
    },
    sharedMetadata: {
      latestVersion: createLatestVersion<U, K>(),
      schema: {},
    },
    sharedBaseData: {},
    taggable: {} as Taggable<U, K>, // Default value for taggable
    metadataEntries: {} as MetadataEntriesType<U, K>, // Default value for metadataEntries
    keywords: [], // Default value for keywords
    permissions: [], // Default value for permissions
    customFields: {}, // Default value for customFields
    versionData: null, // Default value for versionData
    latestVersion: createLatestVersion<U, K>(), // Default value for latestVersion
  };

  // If metadata is undefined, return the default object
  if (!metadata) {
    return defaultStructuredMetadata;
  }

  // Transform UnifiedMetadata to StructuredMetadata
  return {
    author: metadata.currentMeta?.author || defaultStructuredMetadata.author,
    timestamp: metadata.currentMeta?.timestamp || defaultStructuredMetadata.timestamp,
    baseConfig: convertBaseConfig(
      metadata.currentMeta?.baseConfig as BaseConfig<U, K, StructuredMetadata<U, K>> | undefined, 
      defaultStructuredMetadata.baseConfig
    ),
    sharedMetadata: metadata.currentMeta?.sharedMetadata || defaultStructuredMetadata.sharedMetadata,
    sharedBaseData: metadata.currentMeta?.sharedBaseData || defaultStructuredMetadata.sharedBaseData,
    taggable: metadata.currentMeta?.taggable || defaultStructuredMetadata.taggable,
    metadataEntries: metadata.currentMeta?.metadataEntries || defaultStructuredMetadata.metadataEntries,
    keywords: metadata.currentMeta?.keywords || defaultStructuredMetadata.keywords,
    permissions: metadata.currentMeta?.permissions || defaultStructuredMetadata.permissions,
    customFields: metadata.currentMeta?.customFields || defaultStructuredMetadata.customFields,
    versionData: metadata.currentMeta?.versionData || defaultStructuredMetadata.versionData,
    latestVersion: metadata.currentMeta?.latestVersion || defaultStructuredMetadata.latestVersion,
  };
}

export { convertMetadata };
