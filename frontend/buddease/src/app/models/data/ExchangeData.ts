// ExchangeData.ts
import { SharedTimestamps } from "@/app/models/CommonData";
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { SharedIdentifiers } from "@/app/components/documents/RelatedProps";
import { ExchangeDataTypeEnum } from "@/app/crypto/exchangeIntegration";
import { Snapshot } from "@/app/snapshots";
import { BaseDataEntity, DefaultExcludedFields } from "@/app/snapshots/ValidationRule";
import { DefaultMeta } from "@/config/BaseConfig";

export interface ExchangeData<
  T extends BaseDataEntity = AppEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SharedTimestamps, SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: string;
  name: string;
  pair: string;
  price: number;
  volume: number;
  type: ExchangeDataTypeEnum;
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields>;
  createdAt: Date;
  updatedAt: Date;
  liquidity: number;
  tokens: string[];
}
