// SubscriberCollection.ts
import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Subscriber } from "../users/Subscriber";
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/app/configs/BaseConfig';

type SubscriberCollection<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> =
  | {
      kind: "flat";
      subscribers: Subscriber<T, K, Meta, ExcludedFields>[];
    }
  | {
      kind: "grouped";
      subscribers: Record<string, Subscriber<T, K, Meta, ExcludedFields>[]>;
    };

export type { SubscriberCollection };
