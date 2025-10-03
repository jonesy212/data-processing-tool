import { BaseData } from "@/app/models/data/Data";
import { DataStore } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { LocalStorageSnapshotStore } from "./LocalStorageSnapshotStore";

function convertToLocalStorageSnapshotStore<T extends BaseDataEntity, K extends T = T>(
  dataStore: DataStore<T, K, Meta, ExcludedFields>
): LocalStorageSnapshotStore<T, K, Meta, ExcludedFields> {
  return new LocalStorageSnapshotStore<T, K, Meta, ExcludedFields>({
    localStorage: window.localStorage,
    category: dataStore.category,
    options: dataStore.options,
    config: dataStore.config,
    initialState: dataStore.initialState,
    operation: dataStore.operation,
  });
}
