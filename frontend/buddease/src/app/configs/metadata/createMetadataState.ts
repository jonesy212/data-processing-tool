// createMetadataState.ts
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { BaseData, SharedRelationshipData } from "@/app/components/models/data/Data";
import { K, T } from "@/app/components/models/data/dataStoreMethods";
import { createEventManager, EventManager, InitializedState } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot } from "@/app/components/snapshots";
import { UserConfig } from "@/app/components/snapshots/SnapshotStoreConfig";
import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import { UnifiedMetadata, UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { SchemaField } from '@/server/database/SchemaField';
import { useState } from 'react';

import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { Taggable } from '@/app/components/models/CommonData';
import { data } from '@/app/components/snapshots/SnapshotWithCriteria';
import { HistoryEntry } from '@/app/components/state/stores/HistoryStore';
import { Permission } from "@/app/components/users/Permission";
import { UserData } from "@/app/components/users/User";
import { createLatestVersion } from "@/app/components/versions/createLatestVersion";
import Version from "@/app/components/versions/Version";
import { VersionData, VersionHistory } from "@/app/components/versions/VersionData";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';

// 1. First, define a core metadata interface that all others will extend
interface CoreMetadata<T extends BaseData, K extends T> {
  id?: string | number;
  timestamp?: string | number | Date | undefined;
  schema: Record<string, SchemaField>;
}


interface SharedMetadata<T extends BaseData<any>, K extends T = T> 
  extends SharedRelationshipData<K> {
  version?: string | number | Version<T, K> | null;  
  lastUpdated?: Date | VersionHistory; 
  isActive?: boolean; 
  config?: Record<string, any>; 
  permissions?: Permission[]; 
  customFields?: Record<string, any>; 
  baseUrl?: string; 
  latestVersion: VersionData<T, K>;
  category?:  Category,
  currentMetadata?: UnifiedMetadata<T, K, StructuredMetadata<T, K>, keyof T>;
  previousMetadata?: UnifiedMetadata<T, K, StructuredMetadata<T, K>, keyof T>;  
  currentMeta?: StructuredMetadata<T, K>;
  previousMeta?: StructuredMetadata<T, K>;
  schema: Record<string, SchemaField>
}




function createMetaState<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
>(
  id: string,
  apiEndpoint: string,
  apiKey: string,
  timeout: number,
  retryAttempts: number,
  name: string,
  category: string,
  timestamp: string | Date,
  createdBy: string,
  tags: string[],
  metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
  initialState: any,
  mappedMeta: Map<string, Snapshot<T, K, Meta>>,
  events: EventManager<T, K, Meta>,
  lastUpdated: VersionHistory,
  isActive: boolean,
  config: Record<string, any>,
  permissions: Permission[],
  customFields: Record<string, any>,
  baseUrl: string,
  version?: string | number | Version<T, K>, // Ensure version matches the expected type
  relatedData?: K[],
  childIds?: K[]
): StructuredMetadata<T, K> {

  // Construct base config separately
  const baseConfig: BaseConfig<T, K, Meta> = {
    id,
    apiEndpoint,
    apiKey,
    timeout,
    retryAttempts,
    name,
    description: '',
    category,
    timestamp,
    createdBy,
    tags,
    isActive,
    metadata,
    initialState,
    mappedSnapshot: mappedMeta,
    events,
    meta: metadata.structuredMetadata!,
    schema: metadata.schema,
    latestVersion: metadata.latestVersion,
  };
  // Create UnifiedMetadata using createMetadata
  const unifiedMetadata = createMetadata({
    id,
    timeout,
    category,
    timestamp,
    createdBy,
    tags,
    metadata,
    initialState,
    mappedSnapshot: mappedMeta,
    events,
    version,
    lastUpdated,
    isActive,
    config,
    permissions,
    customFields,
    baseUrl,
    relatedData,
    childIds,
    area: "default", // Default area, can be overridden
    overrides: {}, // No overrides by default
  });

  // Create StructuredMetadata from UnifiedMetadata
  return {
    ...unifiedMetadata,
    baseConfig,
    timestamp: new Date(),
    sharedMetadata: {} as SharedMetadata<T, K>,
    sharedBaseData: {} as SharedRelationshipData<K>,
    taggable: {} as Taggable<T, K>,
    metadataEntries: {},
    keywords: [],
    isActive,
    permissions,
    customFields: unifiedMetadata.customFields || {}, // Ensure customFields is always defined
    versionData: "",
    latestVersion: createLatestVersion<T, K>(),
    author: "Unknown",
    config: unifiedMetadata.config,
    baseUrl: unifiedMetadata.baseUrl,
  };
}
const { latestVersion = createLatestVersion(), ...rest } = (data as Record<string, any>) || {};


interface MetaState<T extends BaseData, K extends T> {
  _structure: Record<string, AppStructureItem[]>;
  transformToStructureItems: (data: any) => AppStructureItem[];
  getStructure: () => Promise<Record<string, AppStructureItem> | undefined>;
  // Include other VersionHistory properties if needed
  versionData?: string | VersionData<T, K> | null;
  latestVersion?: VersionData<T, K>;
  history?: HistoryEntry[];
}


const metaState = createMetaState<
  BaseData<any, any, StructuredMetadata<any, any>>,
  BaseData<any, any, StructuredMetadata<any, any>, Attachment>
  & BaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<T, K<T>>, StructuredMetadata<T, K<T>>, Attachment>
  & UserConfig<T, K> & UserData<T, K>
>(
  "id123", // id
  "https://api.example.com", // apiEndpoint
  "apiKey123", // apiKey
  5000, // timeout (in milliseconds)
  3, // retryAttempts
  "Example Name", // name
  "Example Category", // category
  "2024-01-01T00:00:00Z", // timestamp (ISO string)
  "creator123", // createdBy
  ["tag1", "tag2"], // tags
  {} as UnifiedMetaDataOptions<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, any, StructuredMetadata<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, any>, never>, // metadata (could be additional data or metadata fields)
  {}, // initialState (initial data/state for the metadata)
  {} as Map<string, Snapshot<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, any, StructuredMetadata<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, any>, never>>, // meta (Map of additional metadata properties)
  {} as StructuredMetadata<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, any>,
  createEventManager(), // events (instance of EventManager)
  {
    id: 0,
    isActive: false,
    releaseDate: undefined,
    major: 0,
    minor: 0,
    patch: 0,
    name: "",
    url: "",
    versionNumber: "",
    documentId: "",
    draft: false,
    userId: "",
    content: "",
    description: "",
    buildNumber: "",
    versions: null,
    appVersion: "",
    checksum: "",
    parentId: null,
    parentType: "",
    parentVersion: "",
    parentTitle: "",
    parentContent: "",
    parentName: "",
    parentUrl: "",
    parentChecksum: "",
    parentAppVersion: "",
    parentVersionNumber: "",
    isLatest: false,
    isPublished: false,
    publishedAt: null,
    source: "",
    status: "",
    workspaceId: "",
    workspaceName: "",
    workspaceType: "",
    workspaceUrl: "",
    workspaceViewers: [],
    workspaceAdmins: [],
    workspaceMembers: [],
    data: [],
    _structure: {} as Record<string, AppStructureItem[]>,
    versionHistory: {
      versionData: {},
      history: [],
      timestamp: new Date(),
      latestVersion
    },
    getVersionNumber: function (): string {
      throw new Error("Function not implemented.");
    },
    updateStructureHash: function (): Promise<void> {
      throw new Error("Function not implemented.");
    },
    setStructureData: function (newData: string): void {
      throw new Error("Function not implemented.");
    },
    hash: function (value: string): string {
      throw new Error("Function not implemented.");
    },
    currentHash: "",
    structureData: "",
    calculateHash: function (): string {
      throw new Error("Function not implemented.");
    },
    transformToStructureItems: function (data: any): AppStructureItem[] {
      const transform = (items: any[]): AppStructureItem[] => 
        items.map((item) => ({
          id: item.id,
          name: item.name,
          children: item.children ? transform(item.children) : undefined,
        }));
      
      return transform(data);
    },
    getStructure: function (): Promise<Record<string, AppStructureItem> | undefined> {
      return Promise.resolve(
        Object.fromEntries(
          Object.entries(this._structure).map(([key, value]) => [key, value[0]]
          )
        )
      );
    },
  },

  // version (object representing version details)
  {
    versionData: {},
    latestVersion: {} as VersionData<T, K<T>>,
    history: [],
    timestamp: new Date(),
  }, // lastUpdated (object with version history or timestamps)
  true, // isActive (boolean flag indicating if the state is active)
  { key: "value" }, // config (config object containing user-specific or system-wide settings)
  [], // permissions (array of permission strings like 'read', 'write')
  { customField1: "value1" }, // customFields (object for any custom user fields)
  "https://baseurl.example.com", // baseUrl (the base URL for API or resource access)
  [], // childIds (array of child IDs, could relate to `UserConfigData` or other entities)
  [], // relatedData (array of related data items, can be linked with `UserConfigData`)
);



// Utility hooks for handling metadata
export const useMeta = <
  T extends BaseData<any, any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  initialMetadata: Meta
) => {
  const [metadata, setMetadata] = useState<Meta>(initialMetadata);

  const updateMetadata = (newMetadata: Partial<Meta>) => {
    setMetadata((prevMetadata) => ({ ...prevMetadata, ...newMetadata }));
  };

  return { metadata, setMetadata, updateMetadata };
};

export const useMetadata = <T extends BaseData<any>, K extends T = T>(
  initialOptions: UnifiedMetadata<T, K>
) => {
  const [options, setOptions] = useState<UnifiedMetaDataOptions<T, K>>(initialOptions);

  const updateOptions = (newOptions: Partial<UnifiedMetaDataOptions<T, K>>) => {
    setOptions((prevOptions) => ({ ...prevOptions, ...newOptions }));
  };

  return { options, setOptions, updateOptions };
};

// Sample `createMeta` and `createMetadata` functions
export const createMeta = <T extends BaseData<any>, K extends T = T>(
  data: Partial<StructuredMetadata<T, K>>
): StructuredMetadata<T, K> => {
  // const id = useSecureUserId()
  // const apiEndpoint = ""
  const version = createLatestVersion<T, K>(); // Create a version of type Version<T, K>

  // Ensure `baseConfig` is defined, even if not provided in `data`
  const baseConfig = data.baseConfig || {
    id: '', // Default empty string
    apiEndpoint: '', // Default empty string
    apiKey: '', // Default empty string
    timeout: 0, // Default 0
    retryAttempts: 0, // Default 0
    name: '', // Default empty string
    category: '', // Default empty string
    timestamp: new Date(), // Default current date
    createdBy: '', // Default empty string
    metadata: {} as UnifiedMetadata<T, K>, // Default empty JSON string
    initialState: {} as InitializedState<T, K>, // Default empty object
    meta: {} as StructuredMetadata<T, K>, // Default empty object
    mappedSnapshot: new Map(), // Default empty Map
    events: {} as EventManager<T, K, StructuredMetadata<T, K>>, // Default empty object
    latestVersion: {} as VersionData<T, K>,
    schema: {},
    isActive: true
  };

  return {
    baseConfig,
    description: '',
    metadataEntries: {},
    childIds: [],
    relatedData: [],
    version: version,
    lastUpdated: { 
      versionData: {},
      latestVersion: createLatestVersion<T, K>(),
      history: [], 
      timestamp: new Date(),
    }, // Adjust `VersionHistory` fields
    isActive: false,
    config: {},
    permissions: [],
    customFields: {},
    baseUrl: '',
    ...data,
  };
};

export const createMetadata = <T extends BaseData<any>, K extends T = T>(
  data: Partial<UnifiedMetaDataOptions<T, K>>
): UnifiedMetadata<T, K> => {

  // Destructure `latestVersion` with a default value
  const { latestVersion = createLatestVersion<T, K>(), ...rest } = data;

  return {
    area: '',
    tags: [],
    id: '',
    schema: {},
    isActive: true,
    projectMetadata: undefined,
    videoMetadata: undefined,
    mediaMetadata: undefined,
    taskMetadata: undefined,
    meetingMetadata: undefined,
    metadataEntries: {},
    childIds: [],
    relatedData: [],
    currentMeta: {} as StructuredMetadata<T, K>, 
    structuredMetadata: {} as StructuredMetadata<T, K>, 
    latestVersion, 
    ...rest, 
  };
};


export { createMetaState };
export type { CoreMetadata, SharedMetadata };

