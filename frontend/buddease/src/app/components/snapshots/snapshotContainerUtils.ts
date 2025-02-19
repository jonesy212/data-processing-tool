// snapshotContainerUtils.ts
import { snapshot } from '.';
import { createSnapshot, getSnapshotContainer, getSnapshotId } from "@/app/api/SnapshotApi";
import { additionalHeaders } from '@/app/api/headers/generateAllHeaders';
import { snapshotId } from './../utils/snapshotUtils';
import { category } from '@/app/components/utils/snapshotUtils';
import * as snapshotApi from '@/app/api/SnapshotApi';
import { generateCategoryProperties, isCategoryProperties } from '@/app/components/libraries/categories/generateCategoryProperties';
import { createSnapshotStoreConfig } from '@/app/components/snapshots/snapshotStorageOptionsInstance';
import { SnapshotConfig } from '@/app/components/snapshots';
import { snapshotConfigOptions } from '@/app/components/snapshots/snapshotConfigOptions';
import { CategoryProperties, convertToCategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { BaseData } from '../models/data/Data';
import { dataStoreMethods } from "../models/data/dataStoreMethods";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { snapshotStoreConfigInstance } from "./snapshotStoreConfigInstance";
import { SnapshotEvent } from '@/app/typings/eventTypes'
// Subscription management logic

const subscribeToSnapshots = () => {
  console.log("Subscribed to snapshots");
};

const subscribeToSnapshot = () => {
  console.log("Subscribed to a specific snapshot");
};

const unsubscribeToSnapshots = () => {
  console.log("Unsubscribed from snapshots");
};

const unsubscribeToSnapshot = () => {
  console.log("Unsubscribed from a specific snapshot");
};

// Delegate logic to handle operations
const delegate = {
  execute: (operation: string) => {
    console.log(`Executing operation: ${operation}`);
  }
};


const snapshotIdObject = { 
  snapshotId: 'snapshot_456', 
  handleAddSnapshot: async (newSnapshotData: any) => {
    console.log('Creating new snapshot:', newSnapshotData);
    await createSnapshot(newSnapshotData); // Call your add API
  }
};



const snapshotConfig = getSnapshotConfig(
  id,
  String(snapshotId),
  snapshotData,
  criteria,
  category,
  categoryProperties,
  subscriberId,
  delegate,
  snapshot,
  data,
  events,
  dataItems,
  newData,
  payload,
  store,
  callback,
  storeProps,
  endpointCategory,
  snapshotContainer as unknown as SnapshotContainer<Data, Data>, 
)

const currentCategory = (type: string, event: SnapshotEvent<T, K>,
) => snapshotApi.getSnapshotsAndCategory(
  category,
  snapshotIdObject.snapshotId,
  snapshot,
  type,
  event,
  snapshotConfig,
  additionalHeaders,
);

const snapshotManager = snapshotStoreConfigInstance.getSnapshotManager()
const snapshotStore = snapshotManager?.state
const createdSnapshotConfig = createSnapshotStoreConfig(snapshotStore)
const getDelegate = () => delegate;

  const getCategory = <
  T extends  BaseData<any>,
  K extends T = T,
>(
  snapshotId: string,
  storeId: number,
  snapshot: Snapshot<any>, // Use the appropriate type for T
  type: string,
  event: SnapshotEvent<T, K>,
  snapshotConfig: SnapshotConfig<any>, // Use the appropriate type for K
  additionalHeaders?: Record<string, string>
): Promise<{ categoryProperties?: CategoryProperties; snapshots: Snapshot<BaseData, BaseData>[] }> => {
  let categoryProps: CategoryProperties | undefined = undefined;
  let snapshots: Snapshot<T, K>[] = [];

  // Check if the category is already a CategoryProperties object
  if (isCategoryProperties(snapshot.category)) {
    categoryProps = snapshot.category; // Return the category properties directly
  } else {
    // If category is a string or symbol, convert it to CategoryProperties
    categoryProps = convertToCategoryProperties(snapshot.category);
    
    // If there is specific category logic based on the snapshot or type, implement it here
    if (snapshot.category) {
      // Assuming snapshot.category could be a string or symbol, we fetch its properties
      const generatedProps = generateCategoryProperties(snapshot.category.toString());
      categoryProps = {
        ...categoryProps,
        ...generatedProps, // Combine the properties from conversion and generation
      };
    }
  }

  // Fallback: generate default category properties based on the provided type
  if (!categoryProps) {
    const defaultCategoryProps = generateCategoryProperties(type);
    categoryProps = { ...defaultCategoryProps }; // Initialize with default properties if categoryProps is undefined
  } else {
    const defaultCategoryProps = generateCategoryProperties(type);
    categoryProps = { ...categoryProps, ...defaultCategoryProps };
  }


    // Step 3️⃣: Handle event logic
    if (event) {
      if (event.operationType) {
        handleSnapshotOperation(event.operationType); // Call the operation
      }
      if (event.categoryId) {
        console.log(`Using category ID from event: ${event.categoryId}`);
        categoryProps = generateCategoryProperties(event.categoryId);
      }
    }
    // Step 4️⃣: Retrieve snapshots
    snapshots = await snapshotApi.retrieveSnapshots(snapshotId, event, snapshotConfig, additionalHeaders);
  
    return { categoryProperties: categoryProps, snapshots };
};


const getSnapshotConfig = () => snapshotConfigOptions.getSnapshotConfig;

const getDataStoreMethods = () => dataStoreMethods;

// Snapshot methods that define how the snapshot operations are handled

// Snapshot methods that define how the snapshot operations are handled
const snapshotMethods = <T, K>() => ({
  // Step 1️���: Handle snapshot creation
  /**
   * Create a new snapshot
   * @returns {Promise<Snapshot<T, K>>}
   */
  create: async (data: T, metadata: K): Promise<Snapshot<T, K>> => {
    console.log("Creating snapshot...");
    const snapshot: Snapshot<T, K> = {
      id: generateUniqueId(), // Custom ID generator function
      data,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return snapshot;
  },

  /**
   * Update an existing snapshot
   * @param id The ID of the snapshot to update
   * @param updatedData The updated data
   * @param updatedMetadata The updated metadata
   * @returns {Promise<Snapshot<T, K>>}
   */
  update: async (
    id: string,
    updatedData: Partial<T>,
    updatedMetadata: Partial<K>
  ): Promise<Snapshot<T, K>> => {
    console.log(`Updating snapshot with id ${id}...`);

    // Simulate the process of updating a snapshot
    const existingSnapshot: Snapshot<T, K> = {
      id,
      data: { ...updatedData } as T,
      metadata: { ...updatedMetadata } as K,
      createdAt: new Date(), // Assume this was already present
      updatedAt: new Date(), // The updated timestamp
    };

    // Simulate an API call or DB update
    return existingSnapshot;
  },

  /**
   * Delete an existing snapshot
   * @param id The ID of the snapshot to delete
   * @returns {Promise<{ id: string, success: boolean }>}
   */
  delete: async (id: string): Promise<{ id: string; success: boolean }> => {
    console.log(`Deleting snapshot with id ${id}...`);
    
    // Simulate an API call to delete the snapshot
    const result = { id, success: true };
    
    return result;
  },
});


export { getCategory };
                                                                                                                                                                       

