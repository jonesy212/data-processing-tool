import { Data } from "./../../components/models/data/Data";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

function transformToSnapshotMap<T extends Data, K extends Data>(
  map: Map<string, T>
): Map<string, Snapshot<T, K>> {
  return new Map(
    [...map.entries()].map(([key, value]) => [
      key,
      {
        ...value, // Keep the value's properties
        data: value, // Assign value to data if `T` fits into `data`
        // If `Snapshot<T, K>` has additional required properties, initialize them here
        isCore: false, // Example: defaulting some snapshot properties, adjust as needed
        initialConfig: {}, // Default initialConfig
        removeSubscriber: () => {}, // Default function for removeSubscriber
        onInitialize: () => {}, // Default onInitialize
        onError: () => {}, // Default onError
        taskIdToAssign,
        currentCategory,
        mappedSnapshotData,
        snapshot,
        setCategory, applyStoreConfig, generateId, snapshotData,
        getSnapshotItems, defaultSubscribeToSnapshots, notify, notifySubscribers,
        getAllSnapshots, getSubscribers, versionInfo, transformSubscriber, 
          transformDelegate, initializedState, getAllKeys, getAllValues, 
          getAllItems, getSnapshotEntries, getAllSnapshotEntries, addDataStatus,
          
      } as Snapshot<T, K>,
    ])
  );
}

function transformSnapshotConfig<
  BaseData extends Data,
  T extends BaseData,
  K extends BaseData
>(config: SnapshotStoreConfig<T, K>): SnapshotStoreConfig<T, K> {
  const { initialState, configOption, ...rest } = config;

  const transformedConfigOption =
    typeof configOption === "object" && configOption !== null
      ? {
          ...configOption,
          initialState:
            configOption.initialState instanceof Map
              ? transformToSnapshotMap(configOption.initialState) // Transform the map
              : null,
        }
      : undefined;

  return {
    ...rest,
    initialState:
      initialState instanceof Map
        ? transformToSnapshotMap(initialState) // Transform the map here as well
        : null,
    configOption: transformedConfigOption,
  };
}

export { transformSnapshotConfig };
