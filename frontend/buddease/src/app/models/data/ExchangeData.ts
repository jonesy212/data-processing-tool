// ExchangeData.ts
import { ExchangeDataTypeEnum } from "@/app/crypto/exchangeIntegration";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SharedIdentifiers } from "@/app/documents/RelatedProps";
import { SharedTimestamps } from "@/app/models/CommonData";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { BaseDataEntity, DefaultExcludedFields } from "@/app/snapshots/ValidationRule";
import { DefaultMeta } from '@/config/BaseConfig';

export interface ExchangeData<
  T extends BaseDataEntity = AppEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedTimestamps, SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: string;
  name: string;
  pair: string;
  price: number;
  volume: number;
  type: ExchangeDataTypeEnum;
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  createdAt: Date;
  updatedAt: Date;
  liquidity: number;
  tokens: string[];
}
