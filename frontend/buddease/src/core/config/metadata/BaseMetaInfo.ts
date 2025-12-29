// BaseMetaInfo.ts
import { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { AppVersionImpl } from '@/core/pages/_app';
import { VersionAttachment, VersionEntity, VersionExcludedFields, VersionIncludedFields, VersionK, VersionMeta } from '@/core/typings/entities/VersionEntity';
import { AppVersion } from '@/core/versions/AppVersion';

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