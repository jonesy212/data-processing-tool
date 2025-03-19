// createMetadataState.ts
import { version } from "@/app/components/versions/Version";
import crypto from 'crypto';

import { useState } from 'react';
import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { InitializedData } from '@/app/components/snapshots/SnapshotStoreOptions';
import { UnifiedMetadata, UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { BaseData, SharedBaseData } from "@/app/components/models/data/Data";
import { UserConfigData } from "@/app/components/models/data/dataStoreMethods";
import { EventManager, createEventManager } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import SecureFieldManager from "@/app/components/security/SecureFieldManager";
import { Snapshot } from "@/app/components/snapshots";
import { InitializedState } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { T, K } from "@/app/components/models/data/dataStoreMethods";

import { Permission } from "@/app/components/users/Permission";
import { UserData } from "@/app/components/users/User";
import { useSecureUserId } from '@/app/components/utils/useSecureUserId';
import { createLatestVersion } from "@/app/components/versions/createLatestVersion";
import Version from "@/app/components/versions/Version";
import { VersionHistory } from "@/app/components/versions/VersionData";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { VersionData } from "@/app/components/versions/VersionData";
import { Taggable } from '@/app/components/models/CommonData';
import { data } from '@/app/components/snapshots/SnapshotWithCriteria';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';


interface SharedMetadata<K extends T> extends SharedBaseData<K> {
  version?: string | number | Version<T, K>; 
  lastUpdated?: Date | VersionHistory; 
  isActive?: boolean; 
  config?: Record<string, any>; 
  permissions?: Permission[]; 
  customFields?: Record<string, any>; 
  baseUrl?: string; 
  latestVersion: VersionData<T, K>;
  category?: string | symbol | Category,

  currentMetadata: UnifiedMetadata<T, K>; // Add currentMetadata
  currentMeta: StructuredMetadata<T, K> | undefined; // Add currentMeta
}



// Helper function to encrypt data
const encrypt = (data: string, key: string): string => {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

// Helper function to mask sensitive data
const maskSensitiveData = (data: string): string => {
  return data.replace(/./g, '*');
};


function createMetaState<
  T extends BaseData<any, any, StructuredMetadata<any, any>>, 
  K extends T & UserConfigData<T>, // Ensure K extends both T and UserConfigData<T>
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  AttachmentType extends Attachment = Attachment
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
  metadata: UnifiedMetaDataOptions<T, K, StructuredMetadata<T, K>, never>, 
  initialState: any, 
  mappedMeta: Map<string, Snapshot<T, K, Meta>>,
  meta: StructuredMetadata<T, K>,
  events: EventManager<T, K, Meta>, // Use T and K directly instead of UserData
  version: Version<T, K>,
  lastUpdated: VersionHistory,
  isActive: boolean,
  config: Record<string, any>,
  permissions: Permission[],
  customFields: Record<string, any>,
  baseUrl: string,
  relatedData?: K[],
  childIds?: K[],
): StructuredMetadata<T, K> { // Fix the return type

  // Fetch encryption key from environment variables
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('Encryption key is missing in environment variables.');
  }

  // Encrypt sensitive fields
  const encryptedApiKey = encrypt(apiKey, encryptionKey);
  const encryptedCreatedBy = encrypt(createdBy, encryptionKey);
  const encryptedMetadata = encrypt(JSON.stringify(metadata), encryptionKey);
  const encryptedConfig = encrypt(JSON.stringify(config), encryptionKey);
  const encryptedBaseUrl = encrypt(baseUrl, encryptionKey);

  // Initialize SecureFieldManager with encrypted API key
  const secureFields = new SecureFieldManager(encryptedApiKey, encryptionKey);

  // Mark custom fields as sensitive and restrict user access
  Object.entries(customFields).forEach(([key, value]) => {
    secureFields.setSensitive(true).setUserAccess(false); 
  });

  return {  
    baseConfig: {
      id: new SecureFieldManager(id, encryptionKey).setSensitive(true).toString(), // Ensure it returns a string
      apiEndpoint,
      apiKey: new SecureFieldManager(encryptedApiKey, encryptionKey).setSensitive(true).setUserAccess(false).toString(), // Use encrypted API key
      timeout,
      retryAttempts,
      name,
      category,
      timestamp,
      createdBy: new SecureFieldManager(encryptedCreatedBy, encryptionKey).setSensitive(true).toString(), // Use encrypted createdBy
      metadata: new SecureFieldManager(encryptedMetadata, encryptionKey).setSensitive(true).setUserAccess(true), // Use encrypted metadata
      initialState,
      meta,
      mappedSnapshot: new Map<string, Snapshot<T, K, StructuredMetadata<T, K>, never>>(),
      events, // Use the passed events parameter
      latestVersion: createLatestVersion(),
    },
    timestamp: new Date(),
    sharedMetadata: {} as SharedMetadata<K>,
    sharedBaseData: {} as SharedBaseData<K>,
    taggable: {} as Taggable<T, K>,
    metadataEntries: {},
    keywords: [],
    isActive,
    permissions,
    customFields: secureFields,
    versionData: "",
    latestVersion: createLatestVersion<T, K>(),
    author: "Unknown",
    config: new SecureFieldManager(encryptedConfig, encryptionKey).setSensitive(true), // Use encrypted config
    baseUrl: new SecureFieldManager(encryptedBaseUrl, encryptionKey).setSensitive(true).toString(), // Use encrypted baseUrl
  };
}

const { latestVersion = createLatestVersion(), ...rest } = (data as Record<string, any>) || {};

const metaState = createMetaState<
  BaseData<any, any, StructuredMetadata<any, any>>,
  UserConfigData<BaseData<any, any, StructuredMetadata<any, any>>>
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
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        children: item.children ? this.transformToStructureItems(item.children) : undefined,
      }));
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
    latestVersion: {} as VersionData<T, K>,
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
    metadata: '{}', // Default empty JSON string
    initialState: {} as InitializedState<T, K>, // Default empty object
    meta: {} as StructuredMetadata<T, K>, // Default empty object
    mappedSnapshot: new Map(), // Default empty Map
    events: {} as EventManager<T, K, StructuredMetadata<T, K>>, // Default empty object
    latestVersion: {} as VersionData<T, K>
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
      latestVersion: createLatestVersion(),
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
  const { latestVersion = createLatestVersion(), ...rest } = data;

  return {
    area: '',
    tags: [],
    projectMetadata: undefined,
    videoMetadata: undefined,
    mediaMetadata: undefined,
    taskMetadata: undefined,
    meetingMetadata: undefined,
    structuredMetadata: {} as StructuredMetadata<T, K>, 
    metadataEntries: {},
    childIds: [],
    relatedData: [],
    currentMeta: {} as StructuredMetadata<T, K>, 
    latestVersion, 
    ...rest, 
  };
};




export { createMetaState };
export type { SharedMetadata };

