import { BaseData } from '@/app/models/data/Data';
import { DataStore } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { LocalStorageSnapshotStore } from "./LocalStorageSnapshotStore";

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
  });
}
