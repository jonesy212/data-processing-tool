// SubscriberCollection.ts
import { Subscriber } from "@/app/subscribers/Subscriber";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

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
