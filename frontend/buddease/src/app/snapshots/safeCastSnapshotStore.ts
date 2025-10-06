import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { BaseData, Data } from '@/app/models/data/Data';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from "@/config//BaseConfig";
import { StructuredMetadata } from "@/config/s/StructuredMetadata";
import { InitializedState } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SubscriberCollection } from "@/app/users/SubscriberCollection";
import { SchemaField } from "@/server/database/SchemaField";
import { Attachment } from "@/app/documents/Attachment/attachment";
import { SnapshotUnion, SnapshotsArray } from "./LocalStorageSnapshotStore";
import { Snapshot } from "./Snapshot";
import { SnapshotData } from "./SnapshotData";
import { SnapshotEvents } from "./SnapshotEvents";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";

// A safe casting function to ensure type compatibility
function safeCastSnapshotStore<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T, 
 Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  snapshotStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  }
): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Destructure and get delegates from the context
  const { simulatedDataSource } = context;

  return {
    ...snapshotStore,
    getFirstDelegate: () => {
      // Access the delegate from simulatedDataSource (or context)
      const delegates = simulatedDataSource;
      // Ensure delegates are available
      if (!delegates || delegates.length === 0) {
        throw new Error("No delegates available.");
      }
      // Convert to 'unknown' first, then cast to the desired type to ensure type compatibility
      return delegates[0] as unknown as SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K>;
    },

    // Function to get the initial delegate, based on the simulatedDataSource
    getInitialDelegate: () => {
      if (!simulatedDataSource || simulatedDataSource.length === 0) {
        throw new Error("No delegates available.");
      }
      return simulatedDataSource as unknown as SnapshotStoreConfig<SnapshotUnion<BaseData<any, any, StructuredMetadata<any, any>>, Meta>, K, StructuredMetadata<SnapshotUnion<BaseData<any, any, StructuredMetadata<any, any>>, Meta>, K>, never>
    },

    // Transformation function for initializing the state of the snapshot store
    
    transformInitialState: <U extends Data<U>, T extends BaseDataEntity>(
      initialState: InitializedState<U, T>
    ): InitializedState<U, T> | null => {
      if (initialState instanceof Map) {
        const transformed = new Map<string, Snapshot<U, T>>();
        initialState.forEach((value, key) => {
          transformed.set(key, {
            ...value,
            id: key,
            data: value.data as U,
          });
        });
        return transformed as InitializedState<U, U>;
      } else if (Array.isArray(initialState)) {
        return initialState.map((snapshot) => ({
          ...snapshot,
          id: snapshot.id || "default-id",
          data: snapshot.data as U, // Explicitly cast data to type U
        })) as InitializedState<U, U>;
      }
      return initialState as InitializedState<U, U>; // Ensure the return type is compatible
    },


    // Transformation function for a specific snapshot within the store
    transformSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
      // Example transformation logic for a single snapshot
      return {
      ...snapshot,
      data: snapshot.data ? snapshot.data : new Map(), // Defaulting data to an empty map if missing
      timestamp: snapshot.timestamp ? snapshot.timestamp : Date.now(), // Assign a timestamp if not provided
      dataStores: snapshot.dataStores,
      properties: snapshot.properties as K,
      };
    },

    // Method to get the name of the snapshot store
    getName: (): string => {
      // Example implementation that returns a name based on simulated data or a default name
      return snapshotStore.getName() || "DefaultSnapshotStoreName";
    },

    // Method to get the version of the snapshot store
    getVersion: (): string | VersionImpl<
      SnapshotUnion<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, Meta
    >, K> => {
      // Example versioning scheme based on context
      return context.useSimulatedDataSource ? "SimulatedVersion_1.0" : snapshotStore.getVersion() || "1.0";
    },

    // Method to get the schema of the snapshot store
    getSchema: (): string | Record<string, SchemaField> => {
      const schema = snapshotStore.getSchema();
      if (typeof schema === "object") {
        return JSON.stringify(schema); // Convert to string if it's an object
      }
      // returning a JSON schema or a placeholder schema
      return snapshotStore.getSchema() || JSON.stringify({ type: "object", properties: {} });
    },

    // Function to restore the snapshot from a saved state
    restoreSnapshot: (
      id: string,
      snapshot: Snapshot<SnapshotUnion<BaseData, Meta>, K>,
      snapshotId: string,
      snapshotData: SnapshotData<SnapshotUnion<BaseData, Meta>, K>,
      savedState: SnapshotStore<SnapshotUnion<BaseData, Meta>, K>,
      category: Category | undefined,
      callback: (snapshot: SnapshotUnion<BaseData, Meta>) => void,
      snapshots: SnapshotsArray<SnapshotUnion<BaseData, Meta>>,
      type: string,
      event: string | SnapshotEvents<SnapshotUnion<BaseData, Meta>, K>,
      subscribers: SubscriberCollection<SnapshotUnion<BaseData, Meta>, K>,
      snapshotContainer?: SnapshotUnion<BaseData, Meta> | undefined,
      snapshotStoreConfig?:
        | SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K>
        | undefined,

      ): void => {
      // Example restoration logic, modifying the store in place based on a saved state
      
      if (savedState) {
        snapshotStore.data = savedState.data; // Restore the stored data
        snapshotStore.updateVersion(savedState.getVersion()); // Restore the version using the updateVersion method
      }
    },

    // Configuration getter that returns the store's configuration
    config: (): Promise<SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K> | null>  => {
      // Return the configuration from the simulated data source if available
      return simulatedDataSource.length > 0 ? simulatedDataSource[0] : snapshotStore.getConfig();
    },
    // Configuration options for the snapshot store
    configs: context.useSimulatedDataSource
      ? simulatedDataSource.map((config) => ({
          ...config,
          name: `Simulated_${config.name}`,
        }))
      : snapshotStore.configs as SnapshotStoreConfig<SnapshotUnion<BaseData, Meta>, K>[], // Casting to match the expected type

    // Items managed by the snapshot store
    items: snapshotStore.getItems() ? snapshotStore.items as Snapshot<SnapshotUnion<BaseData, Meta>, K>[] : [],

    // Additional nested snapshot stores
    snapshotStores: snapshotStore.snapshotStores
      ? snapshotStore.getSnapshotStores().get.map((store) =>
          safeCastSnapshotStore(store, context)
        )
      : [],

    // Name of the snapshot store
    name: snapshotStore.getName() ? `SafeCast_${snapshotStore.getName()}` : "DefaultSafeCastStore",

    // Version of the snapshot store
    version: snapshotStore.getVersion() ? `SafeCast_${snapshotStore.getVersion()}` : "1.0",

    // Schema definition for the snapshot store
    schema: snapshotStore.getSchema() 
    ? { [`${snapshotStore.getSchema()}_SafeCast`]: {} as SchemaField } 
      : { SafeCastSchema: {} as SchemaField },
    
    // Snapshot items managed by the store
    snapshotItems: snapshotStore.getSnapshotItems
      ? snapshotStore.snapshotItems.map((item) => ({
          ...item,
          id: item.id || "default-id",
        }))
      : [],

    // Subscribers of the snapshot store
    subscribers: snapshotStore.subscribers
      ? snapshotStore.subscribers as unknown as SubscriberCollection<SnapshotUnion<BaseData, Meta>, K> // Casting to match the expected type
      : {} as SubscriberCollection<SnapshotUnion<BaseData, Meta>, K>,

    // Value property
    value: snapshotStore.value !== null
      ? snapshotStore.value as unknown as string | number | Snapshot<SnapshotUnion<BaseData, Meta>, K> | undefined
      : undefined,
  };
}

export { safeCastSnapshotStore };
