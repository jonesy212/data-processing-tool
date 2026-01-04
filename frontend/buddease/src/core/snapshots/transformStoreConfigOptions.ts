transformStoreConfigOptions.ts
transformStoreConfig.ts
import type { BaseDataEntity } from '@/core/config/BaseConfig';


Helper function to transform storeConfig from SnapshotStoreConfig<T, K, Meta> to SnapshotStoreConfig<WrappedU, WrappedU, Meta, ExcludedFields>
function transformStoreConfig<
  T extends BaseDataEntity, 
  U extends T = T>(
  storeConfig: SnapshotStoreConfig<T>
): SnapshotStoreConfig<U> {
  return {
    ...storeConfig,
    data: storeConfig.data.map((item) => transformData<T, U>(item)),
  } as SnapshotStoreConfig<WrappedU, WrappedU, Meta, ExcludedFields>;
}



Helper function to transform data from T to U
function transformData<
  T extends  BaseDataEntity,   
  U extends T = T
>(
  data: T
): U {
  // Create an empty object of type U
  const transformedData: U = {} as U;

  // Iterate over the properties of data and assign them to transformedData
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      // Example transformation logic
      if (key === 'id') {
        (transformedData as any)[key] = transformField((data as any)[key]);
      } else {
        // Copy other properties as they are
        (transformedData as any)[key] = (data as any)[key];
      }
    }
  }
  // Set default values for fields that are in U but not in T
  if (!('title' in data)) {
    (transformedData as any).additionalField = getDefaultValueForField(defaultType);
  }

  // Remove properties that are in T but not relevant for U
  delete (transformedData as any).unnecessaryField;

  // Ensure transformedData is of type U
  return transformedData;
}

Example transformation function for a specific field
function transformField(value: any): any {
  // Check if the value is a string
  if (typeof value === 'string') {
    // Return the value transformed, e.g., changing its case or appending a prefix
    return value.trim().toUpperCase(); // Example: converting to uppercase and trimming whitespace
  }
  // Check if the value is a number
  else if (typeof value === 'number') {
    // Transform the number, e.g., adding 10 to it
    return value + 10; // Example: incrementing the number
  }
  // If the value is an object, you might want to do something else
  else if (typeof value === 'object' && value !== null) {
    // Example: returning a new object with a specific property transformed
    return { ...value, transformed: true }; // Adding a 'transformed' property
  }
  // If the value is of an unexpected type, you can return it as-is or handle it
  return value; // Default: return the original value
}



Helper function to transform the initial state if necessary
function transformInitialState<
  U extends BaseDataEntity,
  K extends U = U, // Use U instead of T
  Meta extends StructuredMetadata<U, K> = StructuredMetadata<U, K>, // Use U instead of T
  ExcludedFields extends keyof U = never // Use U instead of T
>(initialState: InitializedState<U, any>): InitializedState<WrappedU, WrappedU, Meta, ExcludedFields> {
  // Assuming transformation logic is available here
  return initialState as InitializedState<WrappedU, WrappedU, Meta, ExcludedFields>;
}

function transformConfigOption<
  U extends Data<U>, 
  K extends U = U
>(
  configOption: string | SnapshotConfig<U, K> | SnapshotStoreConfig<U, K> | null
): string | SnapshotConfig<U, K> | SnapshotStoreConfig<U, K> | null {
  
  type WrappedU = U extends BaseDataEntity ? U : BaseData<U, U, StructuredMetadata<U, U>, any>;
  
  if (typeof configOption === "string") {
    return configOption;
  } else if (configOption && typeof configOption === "object") {
    // Use a type guard to properly distinguish between the two types
    const isSnapshotStoreConfig = (config: any): config is SnapshotStoreConfig<U, K> => {
      return 'getSnapshotManager' in config || 'autoSave' in config || 'syncInterval' in config;
    };

    if (isSnapshotStoreConfig(configOption)) {
      // This is definitely a SnapshotStoreConfig
      const originalConfig = configOption;
      
      // Create a properly typed getSnapshotManager function
      const getSnapshotManager = (): SnapshotManager<WrappedU, WrappedU, any, any> => {
        const originalManager = originalConfig.getSnapshotManager?.();
        if (originalManager) {
          return originalManager as unknown as SnapshotManager<WrappedU, WrappedU, any, any>;
        }
        
        // Return default implementation
        return {
          storeIds: [],
          snapshotId: "",
          category: undefined,
          timestamp: undefined,
          type: "",
          event: {} as Event,
          id: 0,
          snapshotStore: {} as SnapshotStore<WrappedU, WrappedU, Meta, ExcludedFields>,
          data: {} as BaseDataEntity,
          state: [],
          callbacks: (snapshot: Snapshot<WrappedU, WrappedU, Meta, ExcludedFields>) => ({ snapshots: [] }),
          
          initSnapshot: async (snapshotConfig, snapshotData) => {},
          snapshot: async (id, snapshotData, category, categoryProperties, callback, dataStore, dataStoreMethods, metadata, subscriberId, endpointCategory, storeProps, snapshotConfigData, subscription, snapshotId, snapshotStoreConfigData, snapshotContainer) => {
            return { snapshot: {} as Snapshot<WrappedU, WrappedU, Meta, ExcludedFields> };
          },
          getSnapshots: async () => [],
          updateSnapshots: (snapshots) => {},
          ...getDefaultSnapshot<WrappedU, WrappedU, Meta, ExcludedFields>()
        };
      };
      
      return {
        ...originalConfig,
        storeConfig: originalConfig.storeConfig ? 
          transformStoreConfig<WrappedU, WrappedU, Meta, ExcludedFields>(originalConfig.storeConfig) : 
          undefined,
        
        autoSave: originalConfig.autoSave ?? true,
        syncInterval: originalConfig.syncInterval ?? 300000,
        snapshotLimit: originalConfig.snapshotLimit ?? 100,
        getSnapshotManager,
        
        // Add all required SnapshotStoreConfig properties with defaults
        configId: originalConfig.configId || "",
        additionalSetting: originalConfig.additionalSetting || "",
        
        // Continue with all other SnapshotStoreConfig-specific properties...
        find: originalConfig.find?.bind(originalConfig) || 
          ((predicate: any) => undefined as WrappedU | undefined),
        
        callback: originalConfig.callback?.bind(originalConfig) || 
          ((...args: any[]) => {}),
        
        // ... rest of SnapshotStoreConfig properties
        
      } as unknown as SnapshotStoreConfig<WrappedU, WrappedU, Meta, ExcludedFields>;
    } else {
      // This is a SnapshotConfig
      const originalConfig = configOption as SnapshotConfig<U, K>;
      
      return {
        ...originalConfig,
        data: transformData<U, K>(originalConfig.data),
        storeConfig: originalConfig.storeConfig ? 
          transformStoreConfig<WrappedU, WrappedU, Meta, ExcludedFields>(originalConfig.storeConfig) : 
          undefined,
        additionalData: originalConfig.additionalData,
        isCore: originalConfig.isCore ?? false,
        currentCategory: originalConfig.currentCategory
      } as unknown as SnapshotConfig<WrappedU, WrappedU, Meta, ExcludedFields>;
    }
  }
  return null;
}
