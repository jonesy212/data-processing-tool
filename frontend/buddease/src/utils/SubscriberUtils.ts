// SubscriberUtils.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { Subscriber, SubscriberCallback } from '@/app/subscribers/Subscriber';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';

// Example converter function to map SubscriberCallback<T, K>[] to SubscriberCollection<T, K>[]
function convertToSubscriberCollection<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(callbacks: SubscriberCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): SubscriberCollectiont<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    // Implement your conversion logic here
    // Assuming you need to wrap each SubscriberCallback into a structure matching SubscriberCollection
    return callbacks.map(callback => {
      // Placeholder transformation logic - adapt as needed based on actual types
      const collection: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {}; // Create an empty collection
      // Here you would define how callback should be transformed into a SubscriberCollection item
      // For example, if `callback` has metadata or an ID you can use as a key:
      const key = UniqueIDGenerator.generateSubscriberID(); 
      collection[key] = [callback as unknown as Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>]; // Type casting example
      return collection;
    });
  }

  export { convertToSubscriberCollection };
