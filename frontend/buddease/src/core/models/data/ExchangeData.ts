// ExchangeData.ts
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from "@/core/config/BaseConfig";
import { Attachment } from '@/core/documents/attachment/Attachment';
import { SharedIdentifiers } from "@/core/documents/RelatedProps";
import { SharedTimestamps } from "@/core/models/CommonData";
import { ExchangeDataTypeEnum } from "@/core/models/cypto/exchangeIntegration";
import type { Snapshot } from '@/core/snapshots/Snapshot';

export interface ExchangeData<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedTimestamps, SharedIdentifiers<T, K> {
  id: string;
  name: string;
  pair: string;
  price: number;
  volume: number;
  type: ExchangeDataTypeEnum;
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  liquidity: number;
  tokens: string[];
}
