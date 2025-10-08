// snapshotContainerUtils.ts
import { additionalHeaders } from '@/app/api/headers/generateAllHeaders';
import * as snapshotApi from '@/app/api/SnapshotApi';
import { createSnapshot } from "@/app/api/SnapshotApi";
import { Category, generateCategoryProperties, isCategoryProperties } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/s/BaseConfig";
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { dataStoreMethods } from "@/app/models/data/dataStoreMethods";
import { CategoryProperties, convertToCategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { criteria } from '@/app/pages/searchs/FilterCriteria';
import { DataStore } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { ConfigureSnapshotStorePayload, data, Snapshot, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotStoreProps } from '@/app/snapshots';
import { createSnapshotStoreConfig } from '@/app/snapshots/snapshotStoreConfigInstance';
import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { store } from '@/app/state/stores/useAppDispatch';
import { SnapshotEvent } from '@/app/typings/eventTypes';
import { category, snapshotId } from '@/app/utils/snapshotUtils';
import { RealtimeDataItem } from '@/models/realtime/RealtimeData';
import SnapshotStore from '@/app/snapshots/SnapshpshotStore';
import { storeProps } from '@/app/snapshots/SnapshpshotStoreProps';
import { payload } from '@/users/Subscriber';
import { callback } from 'chart.js/helpers';
import { id } from 'ethers';
import { snapshot } from '.';
import { handleSnapshotOperation } from "./handleSnapshotOperation";
import { snapshotStoreConfigInstance } from "./snapshotStoreConfigInstance";

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
const initializeSnapshotConfig = <
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>  
>(
  id: string | number,
  snapshotId: string,
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  criteria: CriteriaType,
  category: Category | undefined,
  categoryProperties: CategoryProperties | undefined,
  subscriberId: string | undefined,
  delegate: Promise<DataStore<T, K, StructuredMetadata<T, K>>[]>,
  snapshot: (
    // ... snapshot parameters
  ) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>,
  data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
  dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  payload: ConfigureSnapshotStorePayload<T, K, Meta, ExcludedFields>,
  store: SnapshotStore<T, K, Meta, ExcludedFields>,
  callback: (snapshot: SnapshotStore<T, K, Meta, ExcludedFields>) => void,
  storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
  endpointCategory: string | number,
  snapshotContainer: SnapshotContainer<T, K, Meta, ExcludedFields>
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
  snapshotContainer
);

const currentCategory = <
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>  
>(
  type: string, event: SnapshotEvent<T, K, Meta, ExcludedFields>,
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
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>  
>(
  snapshotId: string,
  storeId: number,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  type: string,
  event: SnapshotEvent<T, K, Meta, ExcludedFields>,
  snapshotConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  additionalHeaders?: Record<string, string>
): Promise<{ categoryProperties?: CategoryProperties; snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }> => {
  try {
    let categoryProps: CategoryProperties | undefined = undefined;
    let snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];

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
        // Pass all required arguments to handleSnapshotOperation
        handleSnapshotOperation(
          event.operationType,
          snapshotId,
          storeId,
          snapshot,
          snapshotConfig
        );
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
const snapshotMethods = <T, K, Meta, ExcludedFields>() => ({
  // Step 1️���: Handle snapshot creation
  /**
   * Create a new snapshot
   * @returns {Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>}
   */
  create: async (data: T, metadata: K): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
    console.log("Creating snapshot...");
    const snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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
   * @returns {Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>}
   */
  update: async (
    id: string,
    updatedData: Partial<T>,
    updatedMetadata: Partial<K>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
    console.log(`Updating snapshot with id ${id}...`);

    // Simulate the process of updating a snapshot
    const existingSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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
                                                                                                                                                                       

