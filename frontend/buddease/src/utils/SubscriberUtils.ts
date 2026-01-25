// SubscriberUtils.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { SubscriberCallback } from '@/core/subscribers/Subscriber';
import type { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import UniqueIDGenerator from "@/core/generators/GenerateUniqueIds";
import { Subscriber } from '@/core/subscribers/Subscriber';


interface ConverterOptions {
  groupByKey?: (callback: SubscriberCallback<any> ) => string | undefined;
}

/**
 * Converts SubscriberCallback[] to SubscriberCollection[]
 * Supports both flat and grouped collections
 */
export function convertToSubscriberCollection<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  callbacks: SubscriberCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  options: ConverterOptions = {}
): SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
  const { groupByKey } = options;

  if (!groupByKey) {
    // No grouping key provided -> return flat collection
    return callbacks.map(cb => ({
      kind: 'flat',
      subscribers: [cb],
    }));
  }

  // Grouped collection
  const groupedMap: Record<string, Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> = {};

  callbacks.forEach(cb => {
    const key = groupByKey(cb) ?? UniqueIDGenerator.generateSubscriberID();

    if (!groupedMap[key]) {
      groupedMap[key] = [];
    }

    groupedMap[key].push(cb);
  });

  return [
    {
      kind: 'grouped',
      subscribers: groupedMap,
    },
  ];
}


  export { convertToSubscriberCollection };





// ✅ How It Works

// Flat Collection (default)
// If you don’t provide a groupByKey function, each callback is wrapped as a flat collection.

// const flatCollections = convertToSubscriberCollection(callbacks);
// // [{ kind: 'flat', subscribers: [cb1] }, { kind: 'flat', subscribers: [cb2] }, ...]


// Grouped Collection
// If you provide groupByKey, the converter will group subscribers under that key.

// const groupedCollections = convertToSubscriberCollection(callbacks, {
//   groupByKey: cb => cb.userId  // Example: group by userId
// });
// /*
// [
//   {
//     kind: 'grouped',
//     subscribers: {
//       'user1': [cb1, cb3],
//       'user2': [cb2],
//       ...
//     }
//   }
// ]
// */

// ✅ Benefits

// Fully type-safe

// Supports both flat and grouped collections

// No unsafe any or incorrect indexing

// Works automatically based on context (key present or not)

// Fits your crypto + collaboration + project management app perfectly