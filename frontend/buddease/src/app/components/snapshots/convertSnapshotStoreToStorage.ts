// convertSnapshotStoreToStorage.ts

import SnapshotStoreOptions from "../hooks/SnapshotStoreOptions";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Data } from "../models/data/Data";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotOperation } from "./SnapshotActions";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

function convertSnapshotStoreToStorage<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(snapshotStore: SnapshotStore<T, Meta, K>): Storage {
    const storage: Storage = window.localStorage;
  
    // Store the snapshot data in the Storage object (e.g., localStorage)
    snapshotStore.keys.forEach((key) => {
      const item = (snapshotStore.data as Map<string, Snapshot<T, Meta, K>>).get(key);
      if (item) {
        storage.setItem(key, JSON.stringify(item));
      }
    });
  
    return storage;
  }
  


function convertStorageToSnapshotStore<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
    storage: Storage,
    snapshotStoreId: number,
    topic: string, 
    date: Date, 
    options: SnapshotStoreOptions<T, Meta, K>, 
    category: symbol | string | Category | undefined, 
    config: SnapshotStoreConfig<T, Meta, K>, 
    operation: SnapshotOperation
): SnapshotStore<T, Meta, K> {
    const keys = Object.keys(storage);
    const data = new Map<string, Snapshot<T, Meta, K>>();
    const snapshotStore = new SnapshotStore<T, Meta, K>(
        Number(snapshotStoreId), 
        options, 
        category, 
        config, 
        operation
      );
    
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
