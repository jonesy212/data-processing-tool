// SubscriberCollection.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { Subscriber } from "@/app/users/Subscriber";

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
