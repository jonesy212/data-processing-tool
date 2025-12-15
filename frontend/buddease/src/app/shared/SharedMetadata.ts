// SharedMetadata.ts
import { CoreMetadata } from '@/app/confg/MetadataStateManager';
import { AppStructurePermissions } from '@/app/config/appStructure/AppStructure';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { SchemaField } from '@/app/config/metadata/SchemaField';
import { ConfigMetadata, StatusMetadata, UnifiedMetadata, VersionMetadata } from '@/app/config/MetaDataOptions';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { SharedRelationshipData } from '@/app/models/data/Data';
import { Permission } from '@/app/permissions/Permission';
import { RolePermissions } from '@/app/server/security/getPermission';
import { Version } from '../versions/Version';
import { VersionHistory } from '../versions/VersionData';

interface SharedMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Omit<CoreMetadata<T, K>, 'schema'>,
    Partial<VersionMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    Partial<ConfigMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    Partial<StatusMetadata>,
    SharedRelationshipData<K> {
  version?: string | number | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;  
  lastUpdated?: Date | VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; 
  latestVersion?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  isActive?: boolean; 
  metadataConfig?: Record<string, any>; 
  appPermissions?: AppStructurePermissions[]; 
  permissions?: string[] | Permission[]; 
  rolePermissions?: RolePermissions;
  customFields?: Record<string, any>; 
  baseUrl?: string; 
  category?: Category;
  currentMetadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  previousMetadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  currentMeta?: Meta;
  previousMeta?: Meta;
  schema?: Record<string, SchemaField>;
}


export type { SharedMetadata };
