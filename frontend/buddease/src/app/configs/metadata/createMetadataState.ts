// createMetadataState.ts

import { useSecureUserId } from ' @/app/components/utils/useSecureUserId';
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { BaseData, SharedBaseData } from "@/app/components/models/data/Data";
import { T, UserConfigData } from "@/app/components/models/data/dataStoreMethods";
import { EventManager, createEventManager } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import SecureFieldManager from "@/app/components/security/SecureFieldManager";
import { Snapshot } from "@/app/components/snapshots";
import { Permission } from "@/app/components/users/Permission";
import { UserData } from "@/app/components/users/User";
import Version from "@/app/components/versions/Version";
import { VersionHistory } from "@/app/components/versions/VersionData";
import { useState } from 'react';
import { AppStructureItem } from "../appStructure/AppStructure";
import { StructuredMetadata } from "../StructuredMetadata";

interface SharedMetadata<K> extends SharedBaseData<K> {
  version?:  string | number | Version<T, K>; 
  lastUpdated?: VersionHistory; 
  isActive?: boolean; 
  config?: Record<string, any>; 
  permissions?: Permission[]; 
  customFields?: Record<string, any>; 
  baseUrl?: string; 
}



function createMetaState<
  T extends BaseData<any, any, StructuredMetadata<any, any>>, 
  K extends UserConfigData<T> = UserConfigData<T>
>(
  id: string, 
  apiEndpoint: string, 
  apiKey: string, 
  timeout: number, 
  retryAttempts: number, 
  name: string, 
  category: string, 
  timestamp: string, 
  createdBy: string, 
  tags: string[], 
  metadata: any, 
  initialState: any, 
  meta: Map<string, Snapshot<UserData<T, K>, Attachment>>,
  events: EventManager<UserData<T, K, Attachment>, UserData<T, K>, StructuredMetadata<UserData<T, K, Attachment>>>,
  version: Version<T, K>,
  lastUpdated: VersionHistory,
  isActive: boolean,
  config: Record<string, any>,
  permissions: string[],
  customFields: Record<string, any>,
  baseUrl: string,
  relatedData?: K[],
  childIds?: K[],
): StructuredMetadata<UserData<T, K>, K> {
  return {  
    id: new SecureFieldManager(id).setSensitive(true),
    apiEndpoint,
    apiKey: new SecureFieldManager(apiKey).setSensitive(true).setUserAccess(false),
    timeout,
    retryAttempts,
    name,
    category,
    timestamp,
    createdBy: new SecureFieldManager(createdBy).setSensitive(true),
    tags,
    initialState,
    meta,
    metadata: new SecureFieldManager(metadata).setSensitive(true).setUserAccess(true),
    events: {eventRecords: {}},
    childIds,
    relatedData,
    version,
    lastUpdated,
    isActive,
    config: new SecureFieldManager(config).setSensitive(true),
    permissions,
    customFields: new SecureFieldManager(customFields).setSensitive(true),
    baseUrl: new SecureFieldManager(baseUrl).setSensitive(true),
  };
};


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
  {}, // metadata (could be additional data or metadata fields)
  {}, // initialState (initial data/state for the metadata)
  {} as Map<string, Snapshot<UserData<BaseData<any, any, StructuredMetadata<any, any>>, any>, any, StructuredMetadata<UserData<BaseData<any, any, StructuredMetadata<any, any>>, any>, any>, never>>, // meta (Map of additional metadata properties)
  createEventManager(), // events (instance of EventManager)
  [], // childIds (array of child IDs, could relate to `UserConfigData` or other entities)
  [], // relatedData (array of related data items, can be linked with `UserConfigData`)
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
    versions: undefined,
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
      versionData: undefined
    },
    getVersionNumber: undefined,
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
    }
  }, // version (object representing version details)
  {
    versionData: {}
  }, // lastUpdated (object with version history or timestamps)
  true, // isActive (boolean flag indicating if the state is active)
  { key: "value" }, // config (config object containing user-specific or system-wide settings)
  ["read", "write"], // permissions (array of permission strings like 'read', 'write')
  { customField1: "value1" }, // customFields (object for any custom user fields)
  "https://baseurl.example.com" // baseUrl (the base URL for API or resource access)
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
  initialOptions: UnifiedMetaDataOptions<T, K>
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
  const id = useSecureUserId()
  const apiEndpoint
  return {
    id: id,
    description: '',
    metadataEntries: {},
    childIds: [],
    relatedData: [],
    version: { id: '', name: '', createdAt: new Date() }, // Adjust `Version` fields
    lastUpdated: { versionData: {} }, // Adjust `VersionHistory` fields
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
): UnifiedMetaDataOptions<T, K> => {
  return {
    area: '',
    tags: [],
    projectMetadata: undefined,
    videoMetadata: undefined,
    mediaMetadata: undefined,
    taskMetadata: undefined,
    meetingMetadata: undefined,
    structuredMetadata: undefined,
    metadataEntries: {},
    childIds: [],
    relatedData: [],
    ...data,
  };
};



export { createMetaState };
export type { SharedMetadata };

