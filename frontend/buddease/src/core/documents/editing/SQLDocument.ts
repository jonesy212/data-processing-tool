// SQLDocument.ts

import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { CommonDocumentPropertiesAndMethods } from '@/core/documents/CommonDocumentPropertiesAndMethods';

export interface SQLDocument<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends CommonDocumentPropertiesAndMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  query: string;
  execute(): Promise<void>;
}
