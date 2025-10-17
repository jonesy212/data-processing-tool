import { Taggable } from '@/app/models/CommonData';
import { EventManager, InitializedState } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { createLatestVersion } from "@/app/versions/createLatestVersion";
import { BaseConfig } from '@/config/BaseConfig';
import { UnifiedMetadata } from "@/config/MetaDataOptions";
import { MetadataEntriesType, StructuredMetadata } from "@/config/StructuredMetadata";

function convertBaseConfig<
  U extends BaseDataEntity,
  T extends U,
  K extends T,
  Meta extends DefaultMeta<T, K>,
  AttachmentType extends Attachment,
  ExcludedFields extends keyof T,
  IncludedFields extends keyof T
>(
  baseConfig: BaseConfig<T, K,  Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
  defaultBaseConfig: BaseConfig<U, K, StructuredMetadata<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): BaseConfig<U, K, StructuredMetadata<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  if (!baseConfig) {
    return defaultBaseConfig;
  }

  return baseConfig as unknown as BaseConfig<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}


function convertMetadata<
  U extends BaseDataEntity,
  K extends U = U,
  Meta extends DefaultMeta<U, K> = DefaultMeta<U, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof U = DefaultExcludedFields<U>,
  IncludedFields extends keyof U = DefaultIncludedFields<U>
>(
  metadata: UnifiedMetadata<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined
): StructuredMetadata<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  const defaultStructuredMetadata: StructuredMetadata<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    author: "",
    timestamp: new Date().toISOString(),
    baseConfig: {
      id: "",
      apiEndpoint: "",
      apiKey: "",
      timeout: 0,
      initialState: {} as InitializedState<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      retryAttempts: 0,
      name: "",
      category: "",
      timestamp: "",
      author: "",
      metadata: {} as UnifiedMetadata<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      meta: {} as StructuredMetadata<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      mappedSnapshot: {} as Map<string, Snapshot<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
      events: {} as EventManager<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      latestVersion: createLatestVersion<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
      schema: {},
    },
    sharedMetadata: {
      latestVersion: createLatestVersion<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
      schema: {},
    },
    sharedBaseData: {},
    taggable: {} as Taggable<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    metadataEntries: {} as MetadataEntriesType<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    keywords: [],
    permissions: [],
    customFields: {},
    versionData: null,
    latestVersion: createLatestVersion<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
  };

  if (!metadata) {
    return defaultStructuredMetadata;
  }

  return {
    author: metadata.currentMeta?.author || defaultStructuredMetadata.author,
    timestamp: metadata.currentMeta?.timestamp || defaultStructuredMetadata.timestamp,
    baseConfig: convertBaseConfig(
      metadata.currentMeta?.baseConfig as BaseConfig<U, K, StructuredMetadata<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ExcludedFields> | undefined,
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
