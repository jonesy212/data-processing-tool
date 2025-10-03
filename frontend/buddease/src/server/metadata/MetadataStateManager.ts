// server/metadata/MetadataStateManager.ts
import { SharedIdentifiers } from '@/app/components/documents/RelatedProps';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { Taggable } from '@/app/models/CommonData';
import { SharedRelationshipData } from "@/app/components/models/data/Data";
import { FileMetadata } from "@/app/components/models/file/FileManager";
import { EventManager, InitializedState } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Permission } from "@/app/components/users/Permission";
import { createLatestVersion } from "@/app/versions/createLatestVersion";
import { Version } from "@/app/versions/Version";
import { VersionData, VersionHistory } from "@/app/versions/VersionData";
import { AppStructurePermissions } from "@/configs/appStructure/AppStructure";
import { MetadataEntriesType, StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { Snapshot } from "@/app/snapshots";
import { data } from '@/app/snapshots/SnapshotWithCriteria';
import { BaseDataRoot } from "@/config/BaseConfig";
import { ConfigMetadata, StatusMetadata, UnifiedMetadata, UnifiedMetaDataOptions, VersionMetadata } from "@/server/database/MetaDataOptions";
import { SchemaField } from '@/server/database/SchemaField';
import { BaseConfig, BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '../BaseConfig';

const { latestVersion = createLatestVersion(), ...rest } = (data as Record<string, any>) || {};

// Core server metadata interfaces
interface CoreMetadata<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedIdentifiers<T, K, Meta, ExcludedFields, AttachmentType, ExcludedFields, IncludedFields>{
  schema: Record<string, SchemaField>;
}

type MetaBase = {
  id?: string;
  description?: string;
  fileType?: string;
  keywords?: string[];
  author?: string;
  timestamp?: string | number | Date;
  version?: string | number | null;
};

interface WithValue<T = any> {
  value?: string | number | Snapshot<T> | null;
}

interface SharedMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Omit<CoreMetadata<T, K, Meta, ExcludedFields>, "schema">,
    Partial<VersionMetadata<T, K>>,
    Partial<StatusMetadata>,
    Partial<ConfigMetadata>,
    SharedRelationshipData<K> {
  version?: string | number | Version<T, K> | null;  
  lastUpdated?: Date | VersionHistory<T, K>; 
  latestVersion?: Pick<VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "id" | "versionNumber" | "author" | "schema">;
  isActive?: boolean; 
  metadataConfig?: Record<string, any>; 
  permissions?: AppStructurePermissions[]; 
  customFields?: Record<string, any>; 
  baseUrl?: string; 
  category?: Category;
  currentMetadata?: UnifiedMetadata<T, K, Meta, ExcludedFields, AttachmentType, ExcludedFields, IncludedFields>;
  previousMetadata?: UnifiedMetadata<T, K, Meta, ExcludedFields, AttachmentType, ExcludedFields, IncludedFields>;
  currentMeta?: Meta;
  previousMeta?: Meta;
  schema?: Record<string, SchemaField>;
}

// Server-side metadata state creation
function createMetaState<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
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
  metadata: UnifiedMetadata<T, K, Meta, ExcludedFields, AttachmentType, ExcludedFields, IncludedFields>,
  initialState: InitializedState<T, K>,
  mappedSnapshot: Map<string, Snapshot<T, K, Meta, ExcludedFields, AttachmentType, ExcludedFields, IncludedFields>>,
  events: EventManager<T, K, Meta, ExcludedFields, AttachmentType, ExcludedFields, IncludedFields>,
  lastUpdated: VersionHistory<T, K>,
  isActive: boolean,
  config: Record<string, any>,
  permissions: Permission[],
  baseUrl: string,
  customFields?: Record<string, any>,
  version?: string | number | Version<T, K> | null,
  childIds?: K[],
  relatedData?: K[],
): StructuredMetadata<T, K, Meta, ExcludedFields, AttachmentType, ExcludedFields, IncludedFields> {

  const baseConfig: BaseConfig<T, K, Meta, ExcludedFields, AttachmentType, ExcludedFields, IncludedFields> = {
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
    initialState,
    mappedSnapshot,
    events,
    meta: metadata.structuredMetadata as any,
    schema: metadata.schema,
    latestVersion: metadata.latestVersion,
  };

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
    sharedMetadata: unifiedMetadata.sharedMetadata ?? ({} as SharedMetadata<T, K, ExcludedFields>),
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

// Server metadata creation functions
export const createMeta = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  meta: Partial<StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  const version = createLatestVersion<T, K>();

  const baseConfig = meta.baseConfig || {
    id: '',
    apiEndpoint: '',
    apiKey: '',
    timeout: 0,
    retryAttempts: 0,
    name: '',
    category: '',
    timestamp: new Date(),
    createdBy: '',
    metadata: {} as UnifiedMetadata<T, K>,
    initialState: {} as InitializedState<T, K>,
    meta: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    mappedSnapshot: new Map(),
    events: {} as EventManager<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    latestVersion: {} as VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    },
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
    versionData: {} as VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    ...meta,
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
      permissions: {
        data: { canView: true, canEdit: true },
        board: { canView: true, canAddItems: true }
      },
      permissionType: "read"
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
export type { CoreMetadata, MetaBase, SharedMetadata };