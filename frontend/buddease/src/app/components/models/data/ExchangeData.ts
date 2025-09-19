// ExchangeData.ts
import { Snapshot } from "@/app/components/snapshots";
import { ExchangeDataTypeEnum } from "../../crypto/exchangeIntegration";
import { Attachment } from '@/components/documents/Attachment/attachment';
import { SharedTimestamps } from "../CommonData";
import { SharedIdentifiers } from "../../documents/RelatedProps";
import { DefaultMeta } from "@/app/configs/BaseConfig";
import { BaseDataEntity, DefaultExcludedFields} from "../../snapshots/ValidationRule";

export interface ExchangeData<
  T extends BaseDataEntity = AppEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SharedTimestamps, SharedIdentifiers<T, K> {
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
