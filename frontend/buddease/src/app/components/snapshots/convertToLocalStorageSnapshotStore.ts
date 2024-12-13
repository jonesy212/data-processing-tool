import { BaseData } from "../models/data/Data";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { LocalStorageSnapshotStore } from "./LocalStorageSnapshotStore";

function convertToLocalStorageSnapshotStore<T extends BaseData<any>, K extends T = T>(
  dataStore: DataStore<T, K>
): LocalStorageSnapshotStore<T, K> {
  return new LocalStorageSnapshotStore<T, K>({
    localStorage: window.localStorage,
    category: dataStore.category,
    options: dataStore.options,
    config: dataStore.config,
    initialState: dataStore.initialState,
    operation: dataStore.operation,
  });
}
