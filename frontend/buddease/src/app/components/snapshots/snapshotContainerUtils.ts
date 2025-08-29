// snapshotContainerUtils.ts
import { additionalHeaders } from '@/app/api/headers/generateAllHeaders';
import * as snapshotApi from '@/app/api/SnapshotApi';
import { createSnapshot } from "@/app/api/SnapshotApi";
import { Category, generateCategoryProperties, isCategoryProperties } from '@/app/components/libraries/categories/generateCategoryProperties';
import { DataStore } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { ConfigureSnapshotStorePayload, data, Snapshot, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotStoreProps } from '@/app/components/snapshots';
import { createSnapshotStoreConfig } from '@/app/components/snapshots/snapshotStoreConfigInstance';
import { category } from '@/app/components/utils/snapshotUtils';
import { CategoryProperties, convertToCategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { SnapshotEvent } from '@/app/typings/eventTypes';
import { snapshot } from '.';
import { BaseData } from '../models/data/Data';
import { dataStoreMethods, K, T } from "../models/data/dataStoreMethods";
import { snapshotId } from './../utils/snapshotUtils';
import { handleSnapshotOperation } from "./handleSnapshotOperation";
import { snapshotStoreConfigInstance } from "./snapshotStoreConfigInstance";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { criteria } from '@/app/pages/searchs/FilterCriteria';
import { callback } from 'chart.js/helpers';
import { id } from 'ethers';
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import CalendarManagerStoreClass from '../state/stores/CalendarManagerStore';
import { store } from '../state/stores/useAppDispatch';
import { payload } from '../users/Subscriber';
import SnapshotStore from './SnapshotStore';
import { storeProps } from './SnapshotStoreProps';
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

// Then use it like this:
const initializeSnapshotConfig = <T extends BaseDataEntity, K extends T = T>(
  id: string | number,
  snapshotId: string,
  snapshotData: SnapshotData<T, K>,
  criteria: CriteriaType,
  category: Category | undefined,
  categoryProperties: CategoryProperties | undefined,
  subscriberId: string | undefined,
  delegate: Promise<DataStore<T, K, StructuredMetadata<T, K>>[]>,
  snapshot: (
    // ... snapshot parameters
  ) => Promise<{ snapshot: Snapshot<T, K> }>,
  data: Map<string, Snapshot<T, K>>,
  events: Record<string, CalendarManagerStoreClass<T, K>[]>,
  dataItems: RealtimeDataItem[],
  newData: Snapshot<T, K>,
  payload: ConfigureSnapshotStorePayload<T, K>,
  store: SnapshotStore<T, K>,
  callback: (snapshot: SnapshotStore<T, K>) => void,
  storeProps: SnapshotStoreProps<T, K>,
  endpointCategory: string | number,
  snapshotContainer: SnapshotContainer<T, K>
) => {
  const config = snapshotApi.getSnapshotConfig<T, K, StructuredMetadata<T, K>>(
    id,
    snapshotId,
    {
      ...snapshotData,
      value: snapshotData.value != null ? String(snapshotData.value) : undefined
    },
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
    snapshotContainer
  );

  return config;
};


const snapshotConfig = await initializeSnapshotConfig(
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
  snapshotApi.snapshotContainer
);

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
const getCategory = async <
  T extends BaseDataEntity,
  K extends T = T,
>(
  snapshotId: string,
  storeId: number,
  snapshot: Snapshot<T, K>,
  type: string,
  event: SnapshotEvent<T, K>,
  snapshotConfig: SnapshotConfig<T, K>,
  additionalHeaders?: Record<string, string>
): Promise<{ categoryProperties?: CategoryProperties; snapshots: Snapshot<T, K>[] }> => {
  try {
    let categoryProps: CategoryProperties | undefined = undefined;
    let snapshots: Snapshot<T, K>[] = [];

    // Check if the category is already a CategoryProperties object
    if (isCategoryProperties(snapshot.category)) {
      categoryProps = snapshot.category;
    } else {
      // Convert string/symbol to CategoryProperties
      categoryProps = convertToCategoryProperties(snapshot.category);
      
      if (snapshot.category) {
        const generatedProps = generateCategoryProperties(snapshot.category.toString());
        categoryProps = {
          ...categoryProps,
          ...generatedProps,
        };
      }
    }

    // Fallback to default properties
    const defaultCategoryProps = generateCategoryProperties(type);
    categoryProps = categoryProps 
      ? { ...defaultCategoryProps, ...categoryProps }
      : { ...defaultCategoryProps };

    // Handle event logic
    if (event) {
      if (event.operationType) {
        handleSnapshotOperation(event.operationType);
      }
      if (event.categoryId) {
        console.log(`Using category ID from event: ${event.categoryId}`);
        categoryProps = generateCategoryProperties(event.categoryId);
      }
    }

    // Retrieve snapshots with all required arguments
    snapshots = await snapshotApi.retrieveSnapshots(
      snapshotId,
      storeId,
      snapshot,
      type,
      event,
      snapshotConfig,
      additionalHeaders
    );

    return { categoryProperties: categoryProps, snapshots };
  } catch (error) {
    console.error('Error in getCategory:', error);
    throw error;
  }
};


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


export { getCategory, snapshotConfig };
                                                                                                                                                                       

