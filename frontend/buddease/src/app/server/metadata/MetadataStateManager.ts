// server/metadata/MetadataStateManager.ts
import { BaseConfig, BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { createMetadata } from '@/app/config/metadata/createMetadata';
import { SchemaField } from '@/app/config/metadata/SchemaField';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { MetadataEntriesType, StructuredMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SharedIdentifiers } from '@/app/documents/RelatedProps';
import { Taggable } from '@/app/models/CommonData';
import { SharedRelationshipData } from '@/app/models/data/Data';
import { Permission } from "@/app/permissions/Permission";
import { EventManager, InitializedState } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SharedMetadata } from '@/app/shared/SharedMetadata';
import { Snapshot } from "@/app/snapshots/Snapshot";
import { data } from '@/app/snapshots/SnapshotWithCriteria';
import { createLatestVersion } from "@/app/versions/createLatestVersion";
import { Version } from "@/app/versions/Version";
import { TagsRecord } from "@/app/snapshots/SnapshotWithCriteria";
import { VersionData, VersionHistory } from "@/app/versions/VersionData";

const { latestVersion = createLatestVersion(), ...rest } = (data as Record<string, any>) || {};

// Core server metadata interfaces
interface CoreMetadata<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>{
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

interface WithValue<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  value?: string | number | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
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
  tags?: TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| string[],
  metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  initialState: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  mappedSnapshot: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  events: EventManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  lastUpdated: VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  isActive: boolean,
  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>,
  permissions: Permission[],
  baseUrl: string,
  customFields?: Record<string, any>,
  version?: string | number | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  childIds?: K[],
  relatedData?: K[],
): StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {

  const baseConfig: BaseConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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

  const unifiedMetadata = createMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
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

  const structured: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    ...unifiedMetadata,
    baseConfig,
    timestamp: new Date(),
    sharedMetadata: unifiedMetadata.sharedMetadata ?? ({} as SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    sharedBaseData: unifiedMetadata.sharedBaseData ?? ({} as SharedRelationshipData<K>),
    taggable: unifiedMetadata.taggable ?? ({} as Taggable<T, K>),
    metadataEntries: unifiedMetadata.metadataEntries ?? ({} as MetadataEntriesType<T, K>),
    keywords: unifiedMetadata.keywords ?? [],
    isActive,
    permissions,
    customFields: unifiedMetadata.customFields || {},
    versionData: unifiedMetadata.versionData ?? null,
    latestVersion: unifiedMetadata.latestVersion ?? createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
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
  const version = createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();

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
    metadata: {} as UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    initialState: {} as InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    meta: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    mappedSnapshot: new Map(),
    events: {} as EventManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
      latestVersion: createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
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
export type { CoreMetadata, MetaBase };

