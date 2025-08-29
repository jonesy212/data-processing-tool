// createMetadataState.ts
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { Taggable } from '@/app/components/models/CommonData';
import { SharedRelationshipData } from "@/app/components/models/data/Data";
import { K, T } from "@/app/components/models/data/dataStoreMethods";
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { FileMetadata } from "@/app/components/models/file/FileManager";
import { createEventManager, EventManager, InitializedState } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot } from "@/app/components/snapshots";
import { UserConfig } from "@/app/components/snapshots/SnapshotStoreConfig";
import { data } from '@/app/components/snapshots/SnapshotWithCriteria';
import { HistoryEntry } from '@/app/components/state/stores/HistoryStore';
import { Permission } from "@/app/components/users/Permission";
import { UserData } from "@/app/components/users/User";
import { createLatestVersion } from "@/app/components/versions/createLatestVersion";
import Version from "@/app/components/versions/Version";
import { VersionData, VersionHistory } from "@/app/components/versions/VersionData";
import { AppStructureItem, AppStructurePermissions } from "@/app/configs/appStructure/AppStructure";
import { ConfigMetadata, StatusMetadata, UnifiedMetadata, UnifiedMetaDataOptions, VersionMetadata } from "@/app/configs/database/MetaDataOptions";
import { MetadataEntriesType, StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { SchemaField } from '@/server/database/SchemaField';
import { useState } from 'react';
import { BaseConfig, BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '../BaseConfig';
import { SharedIdentifiers } from '@/app/components/documents/RelatedProps';

// 1. First, define a core metadata interface that all others will extend
interface CoreMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SharedIdentifiers<T, K, Meta, ExcludedFields> {
  schema: Record<string, SchemaField>;
  // id and timestamp are now inherited from SharedIdentifiers
}

type MetaBase = {
  id?: string;                 // identifier
  description?: string;         // human-readable annotation
  fileType?: string;            // optional categorization
  keywords?: string[];          // search / tagging
  author?: string;              // attribution
  timestamp?: string | number | Date; // simple tracking
  version?: string | number | null;   // lightweight version ref
};

interface SharedMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends Omit<CoreMetadata<T, K>, "schema">,
    Partial<VersionMetadata<T, K>>,
    Partial<StatusMetadata>,
    Partial<ConfigMetadata>,
    SharedRelationshipData<K> {

  // Versioning
  version?: string | number | Version<T, K> | null;  
  lastUpdated?: Date | VersionHistory<T, K>; 
  latestVersion?: Pick<VersionData<T, K>, "id" | "versionNumber" | "timestamp" | "author" | "schema">;

  // Metadata state
  isActive?: boolean; 
  metadataConfig?: Record<string, any>; 
  permissions?: AppStructurePermissions[]; 
  customFields?: Record<string, any>; 

  // Misc
  baseUrl?: string; 
  category?: Category;

  // Unified metadata tracking
  currentMetadata?: UnifiedMetadata<T, K, DefaultMeta<T, K>, ExcludedFields>;
  previousMetadata?: UnifiedMetadata<T, K, DefaultMeta<T, K>, ExcludedFields>;  
  currentMeta?: StructuredMetadata<T, K>;
  previousMeta?: StructuredMetadata<T, K>;

  // Schema definition
  schema?: Record<string, SchemaField>;
}

function createMetaState<
  T extends BaseDataEntity,
  K extends T = T,
  ExcludedFields extends keyof T = never
>(
  id: string,
  apiEndpoint: string,
  apiKey: string,
  timeout: number,
  retryAttempts: number,
  name: string,
  category: string,
  timestamp: string | number | Date | undefined,
  createdBy: string,
  tags: string[],
  metadata: UnifiedMetadata<T, K, DefaultMeta<T, K>, ExcludedFields>,
  initialState: InitializedState<T, K>,
  mappedSnapshot: Map<string, Snapshot<T, K, DefaultMeta<T, K>, ExcludedFields>>,
  events: EventManager<T, K, StructuredMetadata<T, K, DefaultMeta<T, K>, ExcludedFields>>,
  lastUpdated: VersionHistory<T, K>,
  isActive: boolean,
  config: Record<string, any>,
  permissions: Permission[],
  baseUrl: string,

  customFields?: Record<string, any>,
  version?: string | number | Version<T, K> | null,
  childIds?: K[],
  relatedData?: K[],
): StructuredMetadata<T, K, DefaultMeta<T, K>, ExcludedFields> {   // <-- return type threads ExcludedFields

  // Construct base config with same ExcludedFields
  const baseConfig: BaseConfig<T, K, DefaultMeta<T, K>, ExcludedFields> = {
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
    metadata, // unified metadata has same ExcludedFields
    initialState,
    mappedSnapshot,
    events,
    meta: metadata.structuredMetadata as any, // if structuredMetadata can be undefined you may want conditional
    schema: metadata.schema,
    latestVersion: metadata.latestVersion,
  };

  // createMetadata must be called with same ExcludedFields type param
  const unifiedMetadata = createMetadata<T, K, DefaultMeta<T, K>, ExcludedFields>({
    id,
    category,
    timestamp,
    createdBy,
    tags,
    initialState,
    mappedSnapshot,
    version,
    lastUpdated,
    isActive,
    config,
    permissions,
    customFields,
    baseUrl,
    relatedData,
    childIds,
    events,
    area: "default",
    timeout,
    overrides: {},
  });

  const structured: StructuredMetadata<T, K, DefaultMeta<T, K>, ExcludedFields> = {
    ...unifiedMetadata,
    baseConfig,
    timestamp: new Date(),
    sharedMetadata: unifiedMetadata.sharedMetadata ?? ({} as SharedMetadata<T, K, DefaultMeta<T, K>, ExcludedFields>),
    sharedBaseData: unifiedMetadata.sharedBaseData ?? ({} as SharedRelationshipData<K>),
    taggable: unifiedMetadata.taggable ?? ({} as Taggable<T, K>),
    metadataEntries: unifiedMetadata.metadataEntries ?? ({} as MetadataEntriesType<T, K>),
    keywords: unifiedMetadata.keywords ?? [],
    isActive,
    permissions,
    customFields: unifiedMetadata.customFields || {},
    versionData: unifiedMetadata.versionData ?? null,
    latestVersion: unifiedMetadata.latestVersion ?? createLatestVersion<T, K>(),
    author: unifiedMetadata.author ?? "Unknown",
    config: unifiedMetadata.config,
    baseUrl: unifiedMetadata.baseUrl,
  };

  return structured;
}


const { latestVersion = createLatestVersion(), ...rest } = (data as Record<string, any>) || {};

interface MetaState<T extends BaseDataEntity, K extends T> {
  _structure: Record<string, AppStructureItem[]>;
  transformToStructureItems: (data: any) => AppStructureItem[];
  getStructure: () => Promise<Record<string, AppStructureItem> | undefined>;
  // Include other VersionHistory properties if needed
  versionData?: string | VersionData<T, K> | null;
   latestVersion?: Pick<VersionData<T, K>, "id" | "versionNumber" | "timestamp" | "author" | "schema">;
  history?: HistoryEntry[];
}


// Defining the MyMetaState interface
interface MyMetaState<
  T extends BaseDataEntity,
  K extends T = T
> extends VersionHistory<T, K> {
  _structure: Record<string, AppStructureItem[]>;
  latestVersion?: Pick<VersionData<T, K>, "id" | "versionNumber" | "timestamp" | "author" | "schema">; // A reference to the most recent version
  timestamp: string | number | Date | undefined,
  
}

// Define a simplified base type for cleaner usage
type BaseDataWithAttachment = BaseDataEntity
type BaseType = BaseDataEntity
type ExtendedType = BaseDataEntity &
                   UserConfig<T, K, StructuredMetadata<T, K>> & 
                   UserData<T, K, StructuredMetadata<T, K>>;


const area = `${fetchUserAreaDimensions().width}x${fetchUserAreaDimensions().height}`;

const lastUpdated: VersionHistory<BaseType, ExtendedType> = {
  versionData: {},
  latestVersion: {} as VersionData<BaseType, ExtendedType>,
  history: [],
  timestamp: new Date(),
  versions: [],              
  currentVersionIndex: 0     
};

const events = createEventManager<
  BaseDataRoot,
  ExtendedType,
  StructuredMetadata<BaseDataRoot, ExtendedType, DefaultMeta<BaseDataRoot, ExtendedType>, never>
>();

const metaState = createMetaState<BaseType, ExtendedType>(
  "id123",                      // id
  "https://api.example.com",    // apiEndpoint
  "apiKey123",                  // apiKey
  5000,                         // timeout
  3,                            // retryAttempts
  "Project Alpha",              // name
  "Product Development",        // category
  "2024-01-01T00:00:00Z",      // timestamp
  "creator123",                 // createdBy
  ["planning", "design"],       // tags
  {
    fileMetadata: {} as FileMetadata,
    customMetadata: {},
    schema: {},
    latestVersion: createLatestVersion<T, K>(),
    author: "system",
    timestamp: new Date().toISOString(),
    area: "frontend",
    metadataEntries: {} as MetadataEntriesType<T, K>
  } as UnifiedMetadata<BaseType, ExtendedType>,
  events, 
  lastUpdated,                 
  true,                         // isActive boolean
  { key: "value" },             // config
  [],                           // permissions
  "https://baseurl.example.com",// baseUrl
  { customField1: "value1" },   // customFields
  undefined,                     // version
  [],                            // childIds
  []                             // relatedData
);


// Utility hooks for handling metadata
export const useMeta = <
  T extends BaseDataEntity, 
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

export const useMetadata = <T extends BaseDataEntity, K extends T = T>(
  initialOptions: UnifiedMetadata<T, K>
) => {
  const [options, setOptions] = useState<UnifiedMetaDataOptions<T, K>>(initialOptions);

  const updateOptions = (newOptions: Partial<UnifiedMetaDataOptions<T, K>>) => {
    setOptions((prevOptions) => ({ ...prevOptions, ...newOptions }));
  };

  return { options, setOptions, updateOptions };
};


export const sharedBaseData: SharedRelationshipData<any> = {
  childIds: [],
  relatedData: []
};


export const createMeta = <T extends BaseDataEntity, K extends T = T>(
  meta: Partial<StructuredMetadata<T, K>>
): StructuredMetadata<T, K> => {
  // const id = useSecureUserId()
  // const apiEndpoint = ""
  const version = createLatestVersion<T, K>(); // Create a version of type Version<T, K>

  // Ensure `baseConfig` is defined, even if not provided in `meta`
  const baseConfig = meta.baseConfig || {
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
      versions: [], 
      currentVersionIndex: 0
    }, // Adjust `VersionHistory` fields
    isActive: false,
    config: {},
    permissions: [],
    customFields: {},
    baseUrl: '',
    sharedMetadata: sharedMetadata,
    sharedBaseData,
    keywords: [],
    timestamp: new Date(),
    taggable: {} as Taggable<T, K>,
    versionData: {} as VersionData<T, K>,
    ...meta,
  };
};

export const createMetadata = <
  T extends BaseDataEntity,
  K extends T = T,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  metadata: Partial<UnifiedMetaDataOptions<T, K>>
): UnifiedMetadata<T, K, StructuredMetadata<T, K>, ExcludedFields> => {

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



// Example reusable sharedMetadata object
export const sharedMetadata: SharedMetadata<any> = {
  version: "1.0.0",
  isActive: true,
  baseUrl: "https://baseurl.example.com",
  permissions: [
    { 
      userId: "user1",
      permissions: {       // nested categories
        data: { canView: true, canEdit: true },
        board: { canView: true, canAddItems: true }
      },
      permissionType: "read"
    },
    {
      userId: "user2",
      permissions: { 
        data: { canView: true, canEdit: true },
        documentEditing: { canEdit: true, canComment: true }
      },
      permissionType: "write"
    }
  ],
  customFields: { customField1: "value1" },
  category: "Project",
  currentMeta: {} as StructuredMetadata<any>,
  previousMeta: {} as StructuredMetadata<any>,
  currentMetadata: {} as UnifiedMetadata<any>,
  previousMetadata: {} as UnifiedMetadata<any>,
  schema: {},
};



export { createMetaState };
export type { CoreMetadata, SharedMetadata, MetaBase, MetaState};

