// getConfigPromise.ts
import type { BaseData } from '@/core/models/data/Data';
import { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { createSnapshotStoreConfig } from '@/core/snapshots/snapshotStoreConfigInstance';
import type { createDataStore } from '@/core/state/stores/DataStore';

import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { createBaseDataEntity } from '@/core/config/createBaseDataEntity';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { createSnapshotStoreMap } from '@/core/snapshots/createSnapshotStoreMap';
import { InitializedData } from '@/core/snapshots/SnapshotStoreOptions';
import { SnapshotContextType } from '@/core/state/context/SnapshotContext';

export function getConfigPromise<
  T extends BaseData<any>, 
  K extends T = T, 
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
  return new Promise((resolve, reject) => {
    try {
      // Create conditional initialized data based on the union type
      const initializedData: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = 
        createInitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();

      const simulatedData: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [
        {
          initialState: "",
          id: "config-1",
          data: initializedData, // Use properly initialized data instead of empty object
          timestamp: new Date().toISOString(), 
          category: 'Category1',
          clearSnapshotSuccess: (context: SnapshotContextType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
            console.log('Cleared snapshot for Category1');
            // You can now use context safely
            context.clearSnapshot?.("some-snapshot-id");
          },
        },
        {
          initialState: "",
          id: "config-2", 
          data: initializedData,
          timestamp: new Date().toISOString(),
          category: 'Category2',
          clearSnapshotSuccess: (context: SnapshotContextType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
            console.log('Cleared snapshot for Category2');
            context.clearSnapshot?.("another-snapshot-id");
          },
        },
        // Add more configurations as needed...
      ];

      resolve(simulatedData);
    } catch (error) {
      reject(error);
    }
  });
}



function createInitializedData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  type: 'entity' | 'snapshot-map' | 'store-config' | 'data-store' | 'store-map' | 'initialized-snapshot' | 'null' = 'entity'
): InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  switch (type) {
    case 'entity':
      return createBaseDataEntity<T>() as T;
    
    case 'snapshot-map':
      return createSnapshotMap<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
    
    case 'store-config':
      return createSnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
    
    case 'data-store':
      return createDataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>() as DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    
    case 'store-map':
      return createSnapshotStoreMap<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
    
    case 'initialized-snapshot':
      return createInitializedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
    
    case 'null':
      return null;
    
    default:
      return null;
  }
}