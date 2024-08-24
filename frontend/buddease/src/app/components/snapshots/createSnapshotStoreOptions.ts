// createSnapshotStoreOptions.ts

import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
import { SnapshotStoreOptions } from "../hooks/useSnapshotManager";
import { BaseData } from "../models/data/Data";
import { displayToast } from "../models/display/ShowToast";
 import { addToSnapshotList } from "../utils/snapshotUtils";
import { Snapshot, Snapshots, SnapshotsArray } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";
import { snapshotStoreConfig, SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { subscribeToSnapshotsImpl, Callback, subscribeToSnapshotImpl } from "./subscribeToSnapshotsImplementation";
import { Subscriber } from "../users/Subscriber";
import { snapshotConfig } from "./SnapshotConfig";
import { handleSnapshotOperation } from "./handleSnapshotOperation";
import handleSnapshotStoreOperation from "./handleSnapshotStoreOperation";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { Category } from "../libraries/categories/generateCategoryProperties";

const createSnapshotStoreOptions = <T extends BaseData, K extends BaseData>({
  initialState,
  snapshotId,
  category,
  dataStoreMethods,
}: {
  initialState: SnapshotStore<T, K> | Snapshot<T, K> | null;
  snapshotId: string | number | undefined;
  category: Category | undefined;
  categoryProperties: CategoryProperties | undefined;
  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K>>;
}): SnapshotStoreOptions<T, K> => {

  // Ensure initialState is correctly typed before proceeding
  let validatedInitialState: SnapshotStore<T, K> | Snapshot<T, K> | null = null;

  if (initialState instanceof SnapshotStore) {
    validatedInitialState = initialState;
  } else if (initialState && typeof initialState === 'object' && 'snapshotId' in initialState) {
    validatedInitialState = initialState as Snapshot<T, K>;
  } else if (initialState === null) {
    validatedInitialState = null;
  } else {
    // Handle the case where initialState is of an unexpected type
    throw new Error('initialState is not of type SnapshotStore<T, K> or Snapshot<T, K>');
  }

  return {
    data: {} as Map<string, Snapshot<T, K>>, // Adjust as per your actual data requirement
    initialState: validatedInitialState,
    snapshotId,
    category,
    date: new Date(),
    type: "default-type",
    snapshotConfig: [], // Adjust as needed
    subscribeToSnapshots: (
      snapshotId: string,
      callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null,
      snapshots: SnapshotsArray<T>
    ): SnapshotsArray<T> => {
      const convertedSnapshots = convertToArray(snapshots);
      subscribeToSnapshotsImpl(snapshotId, callback, convertedSnapshots);
      return convertedSnapshots;
    },

    subscribeToSnapshot: (
      snapshotId: string,
      callback: (snapshot: Snapshot<T, K>) => Subscriber<T, K> | null,
      snapshot: Snapshot<T, K>
    ): Subscriber<T, K> | null => {
      const convertedSnapshot = convertToArray(snapshot)[0]; // Convert single snapshot to array and take the first element
      return subscribeToSnapshotImpl(snapshotId, callback, convertedSnapshot);
    },

    getDelegate: ({ useSimulatedDataSource, simulatedDataSource }: {
      useSimulatedDataSource: boolean,
      simulatedDataSource: SnapshotStoreConfig<T, K>[]
    }) => {
      return useSimulatedDataSource ? simulatedDataSource : [];
    },
    getCategory: getCategory,
    getSnapshotConfig: () => snapshotConfig,
    getDataStoreMethods: () => dataStoreMethods as DataStoreWithSnapshotMethods<T, K>,
    snapshotMethods: [],
    delegate: async () => [], // Adjust as needed
    dataStoreMethods: dataStoreMethods as DataStoreWithSnapshotMethods<T, K>,
    handleSnapshotOperation: handleSnapshotOperation,
    displayToast: displayToast,
    addToSnapshotList: addToSnapshotList,
    eventRecords: {},
    snapshotStoreConfig: snapshotStoreConfig,
    unsubscribeToSnapshots: (
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      type: string,
      event: Event,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => {},
    unsubscribeToSnapshot: (
      snapshotId: string,
      snapshot: Snapshot<T, K>,
      type: string,
      event: Event,
      callback: (snapshot: Snapshot<T, K>) => void
    ) => {},
    handleSnapshotStoreOperation: handleSnapshotStoreOperation,
    simulatedDataSource: [],
  };
};

const isSnapshotStoreOptions = <T extends BaseData, K extends BaseData>(
  obj: any
): obj is SnapshotStoreOptions<T, K> => {
  return obj && typeof obj === 'object' && 'data' in obj && 'initialState' in obj;
};

const getCurrentSnapshotStoreOptions = <T extends BaseData, K extends BaseData>(
  snapshotStoreOptions: any
): SnapshotStoreOptions<T, K> | null => {
  return isSnapshotStoreOptions<T, K>(snapshotStoreOptions) ? snapshotStoreOptions : null;
};

const convertToArray = <T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K> | Snapshots<T> | SnapshotsArray<T>
): SnapshotsArray<T> => {
  return Array.isArray(snapshot) ? snapshot as SnapshotsArray<T> : [snapshot] as SnapshotsArray<T>;
};

export { createSnapshotStoreOptions };

const handleSingleSnapshot = <T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>,
  callback: Callback<Snapshot<T, K>>
) => {
  if (snapshot.type !== null && snapshot.type !== undefined && snapshot.timestamp !== undefined) {
    callback({
      ...snapshot,
      type: snapshot.type as string,
      timestamp: typeof snapshot.timestamp === 'number' ? new Date(snapshot.timestamp) : snapshot.timestamp,
      store: snapshot.store,
      dataStore: snapshot.dataStore,
      events: snapshot.events ?? undefined,
      meta: snapshot.meta ?? {},
      data: snapshot.data ?? ({} as T),
    });
  } else {
    callback(snapshot);
  }
};

const handleSnapshotsArray = <T extends BaseData, K extends BaseData>(
  snapshots: SnapshotsArray<T>,
  callback: Callback<Snapshot<T, K>>
) => {
  snapshots.forEach((snap) => {
    if (snap.type !== null && snap.type !== undefined && snap.timestamp !== undefined) {
      callback({
        ...snap,
        type: snap.type as string,
        timestamp: typeof snap.timestamp === 'number' ? new Date(snap.timestamp) : snap.timestamp,
        store: snap.store,
        dataStore: snap.dataStore,
        events: snap.events ?? undefined,
        meta: snap.meta ?? {},
        data: snap.data ?? ({} as T),
      });
    } else {
      callback(snap as Snapshot<T, K>);
    }
  });
};

function isSnapshot<T extends BaseData, K extends BaseData>(
  obj: any
): obj is Snapshot<T, K> {
  return obj && typeof obj === 'object' && 'type' in obj && 'timestamp' in obj;
}

function isSnapshotsArray<T extends BaseData>(
  obj: any
): obj is SnapshotsArray<T> {
  return Array.isArray(obj) && obj.every(item => isSnapshot(item));
}


export {
  isSnapshot,
  isSnapshotsArray,
  handleSingleSnapshot,
  handleSnapshotsArray,
  getCurrentSnapshotStoreOptions,
  convertToArray,
}