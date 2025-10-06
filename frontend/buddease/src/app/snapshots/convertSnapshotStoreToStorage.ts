// // convertSnapshotStoreToStorage.ts
// import SnapshotStoreOptions from "@/app/hooks/SnapshotStoreOptions";
// import { Category } from "@/app/libraries/categories/generateCategoryProperties";
// import { Data } from '@/app/models/data/Data';
// import { Snapshot } from '@/app/snapshots/Snapshot';
// import { SnapshotOperation } from "./SnapshotActions";
// import SnapshotStore from "./SnapshotStore";
// import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

// function convertSnapshotStoreToStorage<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>): Storage {
//     const storage: Storage = window.localStorage;
  
//     // Store the snapshot data in the Storage object (e.g., localStorage)
//     snapshotStore.keys.forEach((key) => {
//       const item = (snapshotStore.data as Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>).get(key);
//       if (item) {
//         storage.setItem(key, JSON.stringify(item));
//       }
//     });
  
//     return storage;
//   }
  


// function convertStorageToSnapshotStore<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
//     storage: Storage,
//     snapshotStoreId: number,
//     topic: string, 
//     date: Date, 
//     options: SnapshotStoreOptions<T, K, Meta, ExcludedFields>, 
//     category: symbol | string | Category | undefined, 
//     config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
//     operation: SnapshotOperation<T, K, Meta, ExcludedFields>
// ): SnapshotStore<T, K, Meta, ExcludedFields> {
//     const keys = Object.keys(storage);
//     const data = new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
//     const snapshotStore = new SnapshotStore<T, K, Meta, ExcludedFields>(
//         Number(snapshotStoreId), 
//         options, 
//         category, 
//         config, 
//         operation
//       );
    
//       // Retrieve data from Storage and populate the SnapshotStore
//     keys.forEach((key) => {
//       const item = storage.getItem(key);
//       if (item) {
//         data.set(key, JSON.parse(item));
//       }
//     });
  
//     snapshotStore.data = data;

//     return snapshotStore;
//   }


//   export {
//     convertSnapshotStoreToStorage,
//     convertStorageToSnapshotStore
// };

