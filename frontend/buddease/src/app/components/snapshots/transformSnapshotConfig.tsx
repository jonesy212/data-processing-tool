import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
function transformToSnapshotMap<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  map: Map<string, T>
): Map<string, Snapshot<T, K>> {
  return new Map(
    [...map.entries()].map(([key, value]) => [
      key,
      {
        ...value, // Keep the value's properties
        data: value, // Assign value to `data` directly from the map value
        isCore: false, // Example: default to false; adjust based on actual requirements
        initialConfig: {}, // Initialize as an empty object, replace with actual config if needed
        removeSubscriber: () => {
          console.warn("Default removeSubscriber called");
        }, // Placeholder function; update with real logic
        onInitialize: () => {
          console.log("Default onInitialize called");
        }, // Placeholder function; update with real initialization logic
        onError: (error: Error) => {
          console.error("Error:", error.message);
        }, // Placeholder error handler
        taskIdToAssign: null, // Initialize to `null` or another default value
        currentCategory: undefined, // Initialize as `undefined` or a default category if applicable
        mappedSnapshotData: {}, // Initialize as an empty object for mapped data
        snapshot: null, // Initialize to `null` or another default for the snapshot
        setCategory: () => {
          console.warn("Default setCategory called");
        }, // Placeholder function for setting categories
        applyStoreConfig: () => {
          console.log("Default applyStoreConfig called");
        }, // Placeholder for applying store configurations
        generateId: () => Math.random().toString(36).substring(2), // Example ID generator
        snapshotData: {}, // Default empty object for snapshot data
        getSnapshotItems: () => [],
        defaultSubscribeToSnapshots: () => {
          console.log("Default subscribeToSnapshots called");
        }, // Placeholder function
        notify: () => {
          console.log("Default notify called");
        }, // Placeholder notification function
        notifySubscribers: () => {
          console.log("Default notifySubscribers called");
        }, // Placeholder for notifying subscribers
        getAllSnapshots: () => [],
        getSubscribers: () => [],
        versionInfo: { version: 1 }, // Default version info; update with actual version handling
        transformSubscriber: (subscriber: any) => subscriber, // Identity function as placeholder
        transformDelegate: (delegate: any) => delegate, // Identity function as placeholder
        initializedState: false, // Default uninitialized state
        getAllKeys: () => Array.from(map.keys()), // Example function to get all keys
        getAllValues: () => Array.from(map.values()), // Example function to get all values
        getAllItems: () => [...map.entries()], // Example function to get all entries as items
        getSnapshotEntries: () => [...map.entries()], // Similar to getAllItems
        getAllSnapshotEntries: () => [...map.entries()], // Similar to getSnapshotEntries
        addDataStatus: () => {
          console.log("Default addDataStatus called");
        }, // Placeholder for adding data status
      } as Snapshot<T, K>,
    ])
  );
}


function transformSnapshotConfig<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>

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
