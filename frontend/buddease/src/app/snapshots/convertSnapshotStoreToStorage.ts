// convertSnapshotStoreToStorage.ts
import { SnapshotOperation } from '@/app/actions/SnapshotActions';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { Snapshot } from '@/app/snapshots/Snapshot';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { SnapshotStoreOptions } from '@/app/snapshots/SnapshotStoreOptions';

function convertSnapshotStoreToStorage<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Storage {
    const storage: Storage = window.localStorage;
  
    // Store the snapshot data in the Storage object (e.g., localStorage)
    snapshotStore.keys.forEach((key) => {
      const item = (snapshotStore.data as Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>).get(key);
      if (item) {
        storage.setItem(key, JSON.stringify(item));
      }
    });
  
    return storage;
  }
  


function convertStorageToSnapshotStore<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
    storage: Storage,
    snapshotStoreId: number,
    topic: string, 
    date: Date, 
    options: SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    category: symbol | string | Category | undefined, 
    config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    const keys = Object.keys(storage);
    const data = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
    const snapshotStore = new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({ storeId, name, version, schema, options, category, config, operation, expirationDate, payload, callback, storeProps, endpointCategory})
    
      // Retrieve data from Storage and populate the SnapshotStore
    keys.forEach((key) => {
      const item = storage.getItem(key);
      if (item) {
        data.set(key, JSON.parse(item));
      }
    });
  
    snapshotStore.data = data;

    return snapshotStore;
  }


  export {
  convertSnapshotStoreToStorage,
  convertStorageToSnapshotStore
};

