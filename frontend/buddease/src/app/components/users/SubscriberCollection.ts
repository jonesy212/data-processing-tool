// SubscriberCollection.ts
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData } from '@/app/components/models/data/Data';
import { Subscriber } from "../users/Subscriber";

type SubscriberCollection<T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> =
  | Subscriber<T, K>[]
  | Record<string, Subscriber<T, K>[]>;


  export type {
  SubscriberCollection
};

