// convertToLocalStorageSnapshotStore.ts
import { BaseDataEntity } from '@/core/config/BaseConfig';
import { LocalStorageSnapshotStore } from '@/core/snapshots/LocalStorageSnapshotStore';
import { DataStore } from "@/core/state/stores/DataStore";


function convertToLocalStorageSnapshotStore<T extends BaseDataEntity, K extends T = T>(
  dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): LocalStorageSnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return new LocalStorageSnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
    localStorage: window.localStorage,
    category: dataStore.category,
    options: dataStore.options,
    config: dataStore.config,
    initialState: dataStore.initialState,
    operation: dataStore.operation,
     storeId, name, endpointCategory, expirationDate, 
  });
}
