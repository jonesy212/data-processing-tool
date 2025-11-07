import { LocalStorageSnapshotStore } from '@/app/snapshots/LocalStorageSnapshotStore';
import { DataStore } from "@/app/state/stores/DataStore";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { Attachment } from '@/app/documents/attachment/Attachment';

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
