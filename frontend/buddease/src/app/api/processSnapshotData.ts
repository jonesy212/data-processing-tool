import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { SnapshotDataType } from "../components/snapshots";
import { getLatestSnapshot } from '@/app/components/snapshots/snapshotOperations';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { CustomSnapshotData } from "@/app/components/snapshots/SnapshotData";
import { DataWithPriority } from "@/app/components/utils/versionUtils";
import SnapshotStore  from '@/app/components/snapshots/SnapshotStore';
import { Snapshot, SnapshotData } from '@/app/components/snapshots';

interface EnhancedSnapshotData<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
> extends SnapshotData<T, K, Meta, ExcludedFields> {
  getLatestSnapshot: () => Snapshot<T, K, Meta, ExcludedFields>;
}

// Enhanced type that includes both regular and store-like snapshots
type EnhancedSnapshotDataType<T extends BaseData<any>, K extends T = T> =
  | SnapshotData<T, K>
  | EnhancedSnapshotData<T, K>
  | Map<string, Snapshot<T, K>>
  | Promise<{ snapshot: Snapshot<T, K> }>
  | undefined;

/**
 * Type guard for EnhancedSnapshotData
 */
function isEnhancedSnapshotData<T extends BaseData<any>, K extends T = T>(
  input: unknown
): input is EnhancedSnapshotData<T, K> {
  return (
    typeof input === 'object' && 
    input !== null &&
    'getLatestSnapshot' in input &&
    typeof input.getLatestSnapshot === 'function'
  );
}

/**
 * Converts various snapshot-like objects to standardized SnapshotData format
 */
const toSnapshotData = <T extends BaseData<any>, K extends T = T>(
  input: EnhancedSnapshotDataType<T, K>
): SnapshotData<T, K> | undefined => {
  // Handle null/undefined cases first
  if (!input) return undefined;
  
  // Handle Map inputs
  if (input instanceof Map) {
    const firstEntry = input.values().next().value;
    return firstEntry ? { ...firstEntry } : undefined;
  }
  
  // Handle Promise inputs (caller should await separately)
  if (input instanceof Promise) {
    return undefined;
  }
  
  // Handle EnhancedSnapshotData objects
  if (isEnhancedSnapshotData<T, K>(input)) {
    return input.getLatestSnapshot();
  }
  
  // Handle plain SnapshotData or Snapshot objects
  return input;
};


// Define generic types T and K for the function
const findSnapshotStoresById = async <
  T extends BaseData<any>,
  K extends T = T
>(
  id: number
): Promise<SnapshotStore<T, K>[] | undefined> => {
  // Simulate an asynchronous operation to retrieve SnapshotStores by ID
  // Assume `snapshotStoresDatabase` is a Map or database you’re querying from
  const snapshotStoresDatabase: Map<number, SnapshotStore<T, K>[]> = new Map(); // Replace with actual data source

  // Fetch snapshot stores for the given ID
  const stores = snapshotStoresDatabase.get(id);
  return stores ? stores : undefined;
};

// Example helper to check if input is CustomSnapshotData

// 2. Type guard with proper constraints
const isCustomSnapshotData = <
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  input: unknown
): input is CustomSnapshotData<T, K, Meta> => {
  // More robust type checking
  return (
    typeof input === 'object' && 
    input !== null &&
    'timestamp' in input &&  // Required property
    'orders' in input       // Required property
    // Add other required property checks
  );
};

// 3. Transformation function with proper typing
const transformCustomSnapshotToSnapshot = <
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  input: CustomSnapshotData<T, K, Meta>
): Snapshot<T, K, Meta> => {
  return {
    ...input,
    // Explicitly map properties to match Snapshot<T, K> structure
    dataObject: input as unknown as K, // Or proper transformation
    // Include other required Snapshot properties
    deleted: input.deleted ?? false,
    isCore: input.isCore ?? true,
    // Map custom properties as needed
    customProperties: input.customProperty,
    initialConfig: input.initialConfig,
    onInitialize: input.onInitialize,
    onError: input.onError,
    taskIdToAssign: input.taskIdToAssign,
   
    schema: input.schema? JSON.stringify(input.schema) : "",
    currentCategory: input.currentCategory ?? "",
    mappedSnapshotData: new Map(),
    storeId: input.storeId?? 0,
    versionInfo: input.versionInfo ?? { version: 0, timestamp: new Date() },
    // Include other required Snapshot properties
    initializedState: {},
    criteria: {},
    relationships: new Map(),
    storeConfig: {} as SnapshotStoreConfig<T, K, Meta>,
    additionalData: {},
    timestamp: input.timestamp?? new Date(),
    orders: input.orders?? [],

  };
};

// Process snapshot data
function processSnapshotData<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  snapshotDataType: SnapshotDataType<T, K> | SnapshotData<T, K> | undefined
): void {
  if (!snapshotDataType) {
    console.log("No snapshot data available.");
    return;
  }

  // Check if `snapshotDataType` is a Map
  if (snapshotDataType instanceof Map) {
    snapshotDataType.forEach((snapshot, key) => {
      console.log(`Processing snapshot with key: ${key}`, snapshot);
      // Further processing of each `Snapshot<T, K>` if necessary
      processPriorityData(snapshot);
    });
  } else {
    // Assume `snapshotDataType` is `SnapshotData<T, K>`
    console.log("Processing SnapshotData", snapshotDataType);
    processPriorityData(snapshotDataType);
  }
}

// Updated processor function
const processPriorityData = <T extends BaseData<any>, K extends T = T>(
  snapshotInput: SnapshotDataType<T, K>
): void => {
  const snapshotData = toSnapshotData(snapshotInput);
  if (!snapshotData) return;

  const dataWithPriority: Partial<DataWithPriority> = {
    priority: (snapshotData.data as T & { priority?: string })?.priority,
  };

  if (hasPriority(dataWithPriority)) {
    console.log('Data has priority:', dataWithPriority.priority);
  } else {
    console.log('No priority data found.');
  }
};

// Type guard to check if an object has the 'priority' property
function hasPriority<T extends Partial<DataWithPriority>>(
  data: T
): data is T & DataWithPriority {
  return (data as DataWithPriority).priority !== undefined;
}

export type { EnhancedSnapshotData }
export {
  hasPriority,
  findSnapshotStoresById,
  isCustomSnapshotData,
  processSnapshotData,
  processPriorityData,
  transformCustomSnapshotToSnapshot,
};