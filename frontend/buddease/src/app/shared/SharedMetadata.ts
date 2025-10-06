// SharedMetadata.ts
import { Attachment } from '@/app/documents/Attachment/attachment';
import { ConfigMetadata, StatusMetadata, UnifiedMetadata, VersionMetadata } from "@/server/database/MetaDataOptions";
import { CoreMetadata } from "@/server/database/MetadataStateManager";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { SharedRelationshipData } from '@/app/models/data/Data';
import { AppStructurePermissions } from "@/config/appStructure/AppStructure";
import { SchemaField } from '@/server/database/SchemaField';
import { Category } from '@/app/libraries/categories/generateCategoryProperties'

interface SharedMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Omit<CoreMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "schema">,
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


export type { SharedMetadata }