// ExchangeData.ts
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from "@/app/config/BaseConfig";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SharedIdentifiers } from "@/app/documents/RelatedProps";
import { SharedTimestamps } from "@/app/models/CommonData";
import { ExchangeDataTypeEnum } from "@/app/models/cypto/exchangeIntegration";
import { Snapshot } from '@/app/snapshots/Snapshot';

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
