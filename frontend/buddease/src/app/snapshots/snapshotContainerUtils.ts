// snapshotContainerUtils.ts
import { additionalHeaders } from '@/app/api/headers/generateAllHeaders';
import * as snapshotApi from '@/app/api/SnapshotApi';
import createSnapshot from '@/app/api/SnapshotApi';
import { Attachment } from '@/app/documents/attachment/Attachment'
import { Category, generateCategoryProperties, isCategoryProperties } from '@/app/components/libraries/categories/generateCategoryProperties';
import { dataStoreMethods } from "@/app/models/data/dataStoreMethods";
import { CategoryProperties, convertToCategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searches/CriteriaType';
import { criteria } from '@/app/pages/searches/FilterCriteria';
import { DataStore } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { ConfigureSnapshotStorePayload, data, Snapshot, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotStoreProps } from '@/app/snapshots';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { createSnapshotStoreConfig } from '@/app/snapshots/snapshotStoreConfigInstance';
import { storeProps } from '@/app/snapshots/SnapshotStoreProps';
import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { store } from '@/app/state/stores/useAppDispatch';
import { SnapshotEvent } from '@/app/typings/eventTypes';
import { category, snapshotId } from '@/app/utils/snapshotUtils';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { RealtimeDataItem } from '@/typings/realtimeTypes';
import { payload } from '@/app/subscribers/Subscriber';
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
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  id: string | number,
  snapshotId: string,
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  criteria: CriteriaType,
  categoryProperties: CategoryProperties | undefined,
  subscriberId: string | undefined,
  delegate: Promise<DataStore<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[]>,
  snapshot: (
    // ... snapshot parameters
  ) => Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }>,
  data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
  dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  callback: (snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
  storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  endpointCategory: string | number,
  snapshotContainer: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  category?: Category,
) => {
  const config = snapshotApi.getSnapshotConfig<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
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
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  type: string, event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  storeId: number,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  type: string,
  event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
const snapshotMethods = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>() => ({
  /**
   * Create a new snapshot
   */
  create: async (
    data: T,
    metadata: K
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
    console.log("Creating snapshot...");

    const now = new Date();

    const snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: generateUniqueId(),
      data,
      metadata,
      createdAt: now,
      updatedAt: now,

      // ✅ Required properties with defaults
      deleted: false,
      isCore: false,
      initialState: { ...data } as T,
      initialConfig: {} as any,
      meta: {} as Meta,
      attachments: [] as AttachmentType[],
      excludedFields: [] as ExcludedFields[],
      includedFields: Object.keys(data) as IncludedFields[],
      version: 1,
      parentId: null,
      type: "default",
      changes: {},
      history: [],
    };

    return snapshot;
  },

  /**
   * Update an existing snapshot
   */
  update: async (
    id: string,
    updatedData: Partial<T>,
    updatedMetadata: Partial<K>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
    console.log(`Updating snapshot with id ${id}...`);

    const now = new Date();

    const existingSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id,
      data: { ...updatedData } as T,
      metadata: { ...updatedMetadata } as K,
      createdAt: now,
      updatedAt: now,

      // ✅ Include all required fields with consistent defaults
      deleted: false,
      isCore: false,
      initialState: { ...updatedData } as T,
      initialConfig: {} as any,
      meta: {} as Meta,
      attachments: [] as AttachmentType[],
      excludedFields: [] as ExcludedFields[],
      includedFields: Object.keys(updatedData ?? {}) as IncludedFields[],
      version: 2,
      parentId: null,
      type: "update",
      changes: updatedData,
      history: [],
    };

    return existingSnapshot;
  },

  /**
   * Delete an existing snapshot
   */
  delete: async (id: string): Promise<{ id: string; success: boolean }> => {
    console.log(`Deleting snapshot with id ${id}...`);
    return { id, success: true };
  },
});



export { getCategory, snapshotConfig };
                                                                                                                                                                       

