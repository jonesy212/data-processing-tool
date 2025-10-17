// SubscriberCollection.ts
import { Attachment } from "@/app/documents/attachment/Attachment";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/config/BaseConfig';

type SubscriberCollection<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> =
  | {
      kind: "flat";
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    }
  | {
      kind: "grouped";
      subscribers: Record<string, Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
    };

export type { SubscriberCollection };
