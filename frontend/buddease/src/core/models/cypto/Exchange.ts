// Exchange.ts
import type { AppEntity } from '@/core/typings/entities/AppEntity';

import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { ExchangeData } from "@/core/models/data/ExchangeData";

export interface Exchange<
  T extends BaseDataEntity = AppEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends ExchangeData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    name: string;
    apiUrl: string;
    // Add any other properties as needed
  }
  