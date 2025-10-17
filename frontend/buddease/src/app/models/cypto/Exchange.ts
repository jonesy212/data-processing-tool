// Exchange.ts

import { ExchangeData } from "@/app/models/data/ExchangeData";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

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
  