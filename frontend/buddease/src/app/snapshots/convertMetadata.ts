// convertMetadata.ts
import { BaseConfig, BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { MetadataEntriesType, StructuredMetadata } from "@/app/config/StructuredMetadata";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Taggable } from '@/app/models/tracker/Tag';
import type {  Snapshot } from '@/app/snapshots/Snapshot';
import { EventManager, InitializedState } from "@/app/state/stores/DataStore";
import { createLatestVersion } from "@/app/versions/createLatestVersion";

function convertBaseConfig<
  U extends BaseDataEntity,
  T extends U,
  K extends T,
  Meta extends DefaultMeta<T, K>,
  AttachmentType extends Attachment,
  ExcludedFields extends keyof U,
  IncludedFields extends keyof U
>(
  baseConfig: BaseConfig<T, K,  Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
  defaultBaseConfig: BaseConfig<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): BaseConfig<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
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
      isActive: true, 
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
    taggable: {} as Taggable<U>,
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
      metadata.currentMeta?.baseConfig as BaseConfig<U, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
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
