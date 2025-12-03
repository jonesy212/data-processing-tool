// BaseMetaInfo.ts
import { AppVersion } from '@/app/versions/AppVersion';
import { default as Version, default as VersionImpl } from "./Version";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

// VersionEntity.ts (updated BaseMetaInfo section)

export interface BaseMetaInfo<
  T extends BaseDataEntity = VersionEntity,
  K extends T = VersionK,
  Meta extends DefaultMeta<T, K> = VersionMeta,
  AttachmentType extends Attachment = VersionAttachment,
  ExcludedFields extends keyof T = VersionExcludedFields,
  IncludedFields extends keyof T = VersionIncludedFields
> {
  createdAt?: string | Date;
  updatedAt?: string | Date;
  authorId?: string;
  version?: number | string | AppVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  appVersion?: AppVersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;

  // any extra generic payload you want stored without forcing TS expansion
  [key: string]: any;
}