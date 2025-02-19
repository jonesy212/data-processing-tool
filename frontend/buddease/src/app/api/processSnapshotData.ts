import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { SnapshotDataType } from "../components/snapshots";
import { DataWithPriority } from "../utils/versionUtils";



const findSnapshotStoresById = async (id: number): Promise<SnapshotStore<T, K>[] | undefined> => {
  // Simulate an asynchronous operation to retrieve SnapshotStores by ID
  // Assume `snapshotStoresDatabase` is a Map or database you’re querying from
  const snapshotStoresDatabase: Map<number, SnapshotStore<T, K>[]> = new Map(); // Replace with actual data source

  // Fetch snapshot stores for the given ID
  const stores = snapshotStoresDatabase.get(id);
  return stores ? stores : undefined;
};



// Example helper to check if input is CustomSnapshotData
const isCustomSnapshotData = (input: any): input is Snapshot<T, CustomSnapshotData> => {
  // Define custom criteria for identifying `CustomSnapshotData`
  return 'customProperty' in input;
};

// Transform `CustomSnapshotData` to `Snapshot<T, K>`
const transformCustomSnapshotToSnapshot = (input: Snapshot<T, CustomSnapshotData>): Snapshot<T, K> => {
  // Convert CustomSnapshotData fields to match `Snapshot<T, K>`
  const convertedData = {
    ...input, // Copy existing data
    properties: input.customProperties as K // Adjust `customProperties` if needed to fit `K`
  };
  return convertedData as Snapshot<T, K>;
};


// processSnapshotData.ts// processSnapshotData.ts
function processSnapshotData<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
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

// Helper function to handle priority data within the snapshot
const processPriorityData = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotData: Snapshot<T, K> | SnapshotData<T, K>
): void => {
  const dataWithPriority: Partial<DataWithPriority> = {
    priority: (snapshotData.data as T & { priority?: string })?.priority,
  };

  if (hasPriority(dataWithPriority)) {
    console.log('Data has priority:', dataWithPriority.priority);
    // Additional processing logic for priority data if needed
  } else {
    console.log('No priority data found.');
  }
};

// Type guard to check if an object has the 'priority' property
function hasPriority<T extends Partial<DataWithPriority>>(data: T): data is T & DataWithPriority {
  return (data as DataWithPriority).priority !== undefined;
}


export { findSnapshotStoresById, hasPriority, isCustomSnapshotData, processSnapshotData, transformCustomSnapshotToSnapshot };

