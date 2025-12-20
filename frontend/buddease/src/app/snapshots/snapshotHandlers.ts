// snapshotHandlers.ts
import axiosInstance from '@/app/api/csrfToken';
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';

import { endpoints } from "@/app/api/endpointConfigurations";
import { Attachment } from '@/app/documents/attachment/Attachment';
import updateUI from '@/app/documents/editing/updateUI';
import { useErrorHandling } from '@/app/hooks/useErrorHandling';
import { useSecureStoreId } from '@/app/hooks/useSecureStoreId';
import { SnapshotManager, useSnapshotManager } from '@/app/hooks/useSnapshotManager';
import { UpdateSnapshotPayload } from '@/app/interfaces/payload/payloadTypes';
import { BaseData, Data } from '@/app/models/data/Data';
import { allCategories } from '@/app/models/data/DataStructureCategories';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { storeProps } from '@/app/snapshots/SnapshotStoreProps';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { isSnapshotStore } from "@/app/typings/YourSpecificSnapshotType";
import { RealtimeDataItem } from "@/app/typings/realtimeTypes";
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import * as snapshotApi from '@/app/api/SnapshotApi';
import { getSubscribersAPI } from "@/app/api/subscriberApi";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import useSecureSnapshotId from '@/app/hooks/useSecureSnapshotId';
import { Payload } from '@/app/interfaces/payload/payloadTypes';
import { getCategoryProperties } from '@/app/libraries/categories/CategoryManager';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { T } from '@/app/models/data/dataStoreMethods';
import { CriteriaType } from '@/app/pages/searches/CriteriaType';
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { FetchSnapshotPayload } from '@/app/snapshots/FetchSnapshotPayload';
import { Snapshots } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import SnapshotManagerOptions from '@/app/snapshots/SnapshotManagerOptions';
import { useNotification } from '@/app/state/context/NotificationContext';
import useSnapshotSlice from '@/app/state/redux/slices/SnapshotSlice';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { Subscriber } from "@/app/subscribers/Subscriber";
import { createSnapshotStoreOptions } from "@/app/typings/YourSpecificSnapshotType";
import { SubscriberAttachment, SubscriberEntity, SubscriberExcludedFields, SubscriberIncludedFields, SubscriberK, SubscriberMeta } from '@/app/typings/entities/SubscriberEntity';
import { UnsubscribeDetails } from '@/app/typings/eventHandlers/eventTypes';
import { SnapshotEvent } from '@/app/typings/snapshotTypes';
import { snapshotCache } from '@/utils/cache/InternalCache';
import { addToSnapshotList, generateSnapshotId } from "@/utils/snapshotUtils";
import { SnapshotOperation, SnapshotOperationType } from "@/app/snapshots/index";
import { createSnapshotItem, SnapshotItem } from "@/app/snapshots/SnapshotList";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { data, SnapshotWithCriteria } from "@/app/snapshots/SnapshotWithCriteria";
import { useSnapshotStore } from "@/app/snapshots/useSnapshotStore";

const { notify } = useNotification();
const dispatch = useDispatch()

const API_BASE_URL = endpoints
// Handler for creating a snapshot
export const createInitSnapshot = (additionalData: any): void => {
  const newSnapshot = {
    id: generateSnapshotId,
    data: {},
    timestamp: new Date(),
  };

  newSnapshot.data = {
    ...newSnapshot.data,
    ...additionalData,
  };
};

export const initSnapshot: T = {
  length: 0,
  id: "initial-id",
  category: "initial-category",
  subscriberId: 'initial-subscriber',
  timestamp: new Date(),
  content: undefined,
  data: undefined
};

class SnapshotFetchError extends Error {
  constructor(public snapshotId: string, public originalError: unknown) {
    super(`Failed to fetch snapshot ${snapshotId}`);
    this.name = 'SnapshotFetchError';
  }
}


const snapshotSubscribers: Map<string, Set<Subscriber<SubscriberEntity, SubscriberK, SubscriberMeta, SubscriberAttachment, SubscriberExcludedFields, SubscriberIncludedFields>>> = new Map();

export const subscribeToSnapshots = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotId: string,
  snapshotData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  callback: (
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  category?: Category,  
  unsubscribe?: UnsubscribeDetails, 
): SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, new Set<Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>());
  }

  if (callback !== null) {
    const subscriber = callback(snapshotStore, snapshots);
    if (subscriber !== null) {
      const subscribersSet = snapshotSubscribers.get(snapshotId) as Set<Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
      subscribersSet.add(subscriber);
    }
  }

  console.log(`Subscribed to snapshots with ID: ${snapshotId}`);
  return snapshots;
};



export const subscribeToSnapshot = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null => {
  if (!snapshotSubscribers.has(snapshotId)) {
    snapshotSubscribers.set(snapshotId, new Set<Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>());
  }

  const subscriber = callback(snapshot);

  if (subscriber !== null) {
    const subscribersSet = snapshotSubscribers.get(snapshotId);
    subscribersSet?.add(subscriber);
    console.log(`Subscribed to snapshot with ID: ${snapshotId}`);
  }

  return subscriber;
};



// Create a function to initialize the snapshot store
const initializeSnapshotStore = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  id: string,
  snapshotStoreData: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  // category: symbol | string | Category | undefined,
  categoryProperties: CategoryProperties | undefined,
  dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  // Initialize snapshotManager and snapshotStore
  const category = "New Category";
  const storeId = useSecureStoreId()
  if(!storeId){
    throw new Error("Invalid store identifier provided");
  }

  const snapshotManager = await useSnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(storeId, storeProps);
  const snapshotStore = await createSnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
    id,
    snapshotStoreData,
    category,
    categoryProperties,
    dataStoreMethods,
   );

  // Ensure snapshotStore and snapshotManager are not null before using them
  if (!snapshotStore || !snapshotManager) {
    throw new Error("SnapshotStore or SnapshotManager is not initialized");
  }

  const timestamp = new Date();

  // Example newData object
  const newData: Data<BaseData<any>> = {
    id: "new-id",
    name: "New Name",
    value: "New Value",
    timestamp: new Date(),
    category: "New Category",
  };

  const criteria = await getCriteria();
  const snapshotId = await snapshotApi.getSnapshotId(criteria);
  
  // Convert newData to a Map<string, Data>
  const newDataMap = new Map<string, Data<BaseData<any>>>();
  newDataMap.set(newData.id!.toString(), newData);

  // Example usage:
  const newSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id: "123",
    data: newDataMap,
    timestamp: new Date(),
    category: "New Category",
    type: "",
    initialState: {},
    isCore: true,
    initialConfig: {},
   
    deleted: false,
    onInitialize: (callback: () => void) => {},
    taskIdToAssign: "task Id assignment",
    schema: {},
    
    currentCategory: {} as Category,
    mappedSnapshotData: new Map(),
    storeId: 0,
    versionInfo: {} as ExtendedVersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    
    initializedState: {},
    criteria: {},
    snapshotContainer: {} as SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    config: {} as Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
   
    createdBy: 'creator',
    events: {},
    restoreSnapshot: {},
   
    meta: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
    // mappedMeta: new Map<string, Snapshot< BaseData<any>, any>>(),
    snapshotStoreConfig: {} as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined,
    getSnapshotItems: function(): (SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotItem< BaseData<any>, any>)[] {
      const items: (SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotItem< BaseData<any>, any>)[] = [];
  
      // Add the snapshot store configuration to the array if it exists
      this.snapshotStoreConfig && items.push(this.snapshotStoreConfig);
  

      // Iterate over the snapshot data and add each item to the array
      this.data?.forEach((item: any, key: any) => {
        const snapshotItem = createSnapshotItem(
          String(snapshotId) ?? null,
          data,
          key,
          item,
          this.category, 
          this.snapshotStore,  
          this.snapshotStoreConfig ?? null
          );
        items.push(snapshotItem);
      });
  
      return items;
    }
    
    // ... rest of the code remains unchanged
  };
  return snapshotStore;
};

async function createSnapshotStore<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  id: string,
  snapshotStoreData: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  category?: Category,  categoryProperties: CategoryProperties | undefined,
  dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  
  // Logic to set up the storeId, options, and operation
  const storeId = await snapshotApi.getSnapshotStoreId(id);
  
  const options = await useSnapshotManager(storeId) 
    ? new SnapshotManagerOptions().get() 
    : {};

  // Option 1: Use the first item in the array
  const config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| null> = Promise.resolve(
    snapshotStoreData.length > 0 ? snapshotStoreData[0] : null
  );

  const operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    operationType: SnapshotOperationType.CreateSnapshot, // Example operation type
    // Add any additional properties as needed
  };

  const snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    // === ADD THESE DEFAULTS ===
    id: storeId || `store-${Date.now()}`,
    name: "Snapshot Store", // Default name
    description: "Automatically created snapshot store", // Default description
    createdAt: new Date(), // Default creation time
    updatedAt: new Date(), // Default update time
    version: "1.0.0", // Default version
    metadata: {} as Meta, // Default metadata
    
    // === YOUR EXISTING PROPERTIES ===
    snapshots: [], // Keep your existing snapshots array
    taskIdToAssign: "",
    config,
    snapshotId: "",
    initialState: null,
    category: category ? category.toString() : undefined,
    timestamp: new Date(),
    state: [],

    addSnapshot: async (
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshotId: string,
      subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ) => {
      // Implement addSnapshot logic here
    },
    updateSnapshot(
      snapshotId: string,
      data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
      events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      payload: UpdateSnapshotPayload<T>,
      store: SnapshotStore<any, K>
    ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> {
      return new Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }>(async (resolve, reject) => {
        const snapshotPromise = snapshotStore.getSnapshot(async (id: string) => {
          const foundSnapshot = data.get(id);
          if (foundSnapshot) {
            return {
              category: foundSnapshot.category,
              timestamp: foundSnapshot.timestamp,
              id: foundSnapshot.id,
              snapshot: foundSnapshot,
              snapshotStore: snapshotStore,
              data: foundSnapshot.data as T,
            };
          } else {
            return undefined;
          }
        });

        const snapshot = await snapshotPromise;

        if (!snapshot) {
          return reject(new Error(`Snapshot with ID ${snapshotId} not found`));
        }

        console.log(`Snapshot with ID ${snapshotId} found`);
        resolve({ snapshot: snapshotStore });
      });
    },    
    // Rest of the properties
    removeSnapshot: () => { },
    clearSnapshots: () => { },
    initialState: null,
    category: category ? category.toString() : undefined ,
    timestamp: new Date(),


    
    handleSnapshot: (id: string,
      snapshotId: string,
      snapshot: T | null,
      snapshotData: T,
      category?: Category,
      categoryProperties: CategoryProperties | undefined,
      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<T,
        K
      >
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
      const result = handleDelegate(
        (
          delegate: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,

        ) => delegate.handleSnapshot,
        id,
        snapshotId,
        snapshot,
        snapshotData,
        category,
        callback,
        snapshots,
        type,
        event,
        snapshotContainer,
        snapshotStoreConfig
      );
  
      return result !== undefined ? result : Promise.resolve(null);
    },
    state: [],
    subscribers: [],
    createSnapshot: () => ({} as Snapshot< BaseData<any>, Data>),
    configureSnapshotStore: () => { },
    createSnapshotSuccess: () => { },
    snapshotConfig: config,
    delegate: [],
    getDelegate: (context: {
      useSimulatedDataSource: boolean;
      simulatedDataSource: SnapshotStoreConfig<
        SnapshotWithCriteria<any, BaseData>,
        K
      >[];
    })=> {

    },
    determinePrefix: () => "",
    handleSnapshotSuccess: () => { },
    async createSnapshotFailure(
      snapshotId: string,
      snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      payload: { error: Error }
    ): Promise<void> {
      console.error(`Snapshot creation failed for ID: ${snapshotId}`, payload.error);
      // Notify or log the error within the snapshot manager context
      await snapshotManager.handleFailure(snapshotId, snapshot, payload.error);
    },
    
    async batchTakeSnapshot(
      snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Promise<{ snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
      const snapshotResults: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = new Map();

      for (const [id, snapshotData] of snapshots) {
        try {
          const snapshot = await dataStoreMethods.createSnapshot(id, snapshotData);
          snapshotResults.set(id, snapshot);
        } catch (error) {
          console.error(`Failed to take snapshot for ID: ${id}`, error);
          if (snapshotStore.createSnapshotFailure) {
            await snapshotStore.createSnapshotFailure(id, snapshotManager, snapshotData, { error });
          }
        }
      }

      return { snapshots: snapshotResults };
    },
 
    onSnapshot: (
      snapshotId: string,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      type: string,
      event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
    ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
      try {
        // Execute the callback with the provided snapshot
        callback(snapshot);
  
        // Optionally log or perform other actions based on type and event
        console.log(`Snapshot with ID ${snapshotId} updated. Type: ${type}, Event: ${event.type}`);
        
        // Return the snapshot after processing
        return snapshot;
      } catch (error) {
        console.error("Error handling snapshot:", error);
        throw error; // Propagate the error if necessary
      }
    },    
  onSnapshots: (
    snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    type: string,
    event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {
    try {
      // Execute the callback with the collection of snapshots
      callback(snapshots);

      // Optionally log or perform other actions based on type and event
      console.log(`Processed ${snapshots.length} snapshots. Type: ${type}, Event: ${event.type}`);
      
      // Return the collection of snapshots after processing
      return snapshots;
    } catch (error) {
      console.error("Error handling snapshots:", error);
      throw error; // Propagate the error if necessary
    }
  },
    snapshotData: {},
    initSnapshot: () => { },
    clearSnapshot: () => { },
    getSnapshots: () => [],
    takeSnapshot: (
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      subscribers?: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
    ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }> => {
      return new Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; }>(async (resolve, reject) => {
        resolve({ snapshot: snapshot });
      });
    },
    addSnapshotSuccess: () => { },
    getSubscribers: (
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], 
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Promise<{
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    }> => {
      return new Promise<{
        subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      }>(async (resolve, reject) => {
        resolve({
          subscribers: subscribers,
          snapshots: snapshots
        });
      });
    },
    addSubscriber: () => { },
    validateSnapshot: () => true,
    getSnapshot: (
      snapshot: (id: string) =>
        | Promise<{
          category?: Category;
          categoryProperties: CategoryProperties;
          timestamp: string | number | Date | undefined;
          id: string | number | undefined;
          snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          data: T;
          }>
        | undefined
    ) => Promise.resolve({} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    getAllSnapshots: () => [],
    takeSnapshotSuccess: () => { },
    updateSnapshotFailure: () => { },
    takeSnapshotsSuccess: () => { },
    fetchSnapshot(
      callback: (
        snapshotId: string,
        payload: FetchSnapshotPayload<K>,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        payloadData: T | BaseData<any>,
        category?: Category,
        categoryProperties: CategoryProperties | undefined,
        timestamp: Date,
        data: T,
        delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
      ) => void
    ): Promise<{
      id: any;
      category?: Category;
      categoryProperties: CategoryProperties;
      timestamp: any;
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      data: T;
      getItem?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
    }> {
      return new Promise(async (resolve, reject) => {
        try {
          const snapshotId = useSecureSnapshotId();
          
          // Wrap the API call in Promise.resolve to ensure it's treated as a Promise
          const dataPromise = Promise.resolve(
            snapshotApi.getSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotId, additionalHeaders)
          );
          const data: T = await dataPromise;
    
          const timestamp = new Date();
          
          // Get delegates
          const delegates = await delegate<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
          if (!delegates || delegates.length === 0) {
            throw new Error("No delegates available");
          }
    
          // Fetch the snapshot using the first delegate
          const fetchedSnapshot = await delegates[0].fetchSnapshot(
            snapshotId,
            undefined, // category
            timestamp,
            callback,
            data
          );
    
          resolve({
            id: fetchedSnapshot.id,
            category: fetchedSnapshot.category,
            categoryProperties: fetchedSnapshot.categoryProperties || {},
            timestamp: fetchedSnapshot.timestamp,
            snapshot: fetchedSnapshot.snapshot,
            data: fetchedSnapshot.data as T,
            getItem: fetchedSnapshot.getItem
          });
        } catch (error) {
          console.error("Error fetching snapshot:", error);
          reject(error);
        }
      });
    },
    
    updateSnapshotSuccess: () => { },
    updateSnapshotsSuccess: () => { },
    fetchSnapshotSuccess: () => { },
    updateSnapshotForSubscriber: () => { },
    updateMainSnapshots: () => { },
    batchUpdateSnapshots: () => { },
    batchFetchSnapshotsRequest: () => { },
    batchTakeSnapshotsRequest: () => { },
    batchUpdateSnapshotsRequest: () => { },
    batchFetchSnapshots: () => { },
    getData: () => ({} as Promise<SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined>),
    batchFetchSnapshotsSuccess: () => { },
    batchFetchSnapshotsFailure: () => { },
    batchUpdateSnapshotsFailure: () => { },
    notifySubscribers: (
      message: string,
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      data: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
    ): Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {
      return subscribers;
    },
    notify: () => { },
    updateSnapshots: () => { },
    updateSnapshotsFailure: () => { },
    flatMap<U extends Iterable<any>>(
      callback: (
        value: SnapshotStoreConfig<U, K>, 
        index: number, array: SnapshotStoreConfig<U, K>[]
      ) => U): U extends (infer I)[] ? I[] : U[] {

      const results: U[] = [];
      for (let i = 0; i < config.length; i++) {
        const result = callback(config[i], i, config);
        results.push(result);
      }
      return results.flat() as U extends (infer I)[] ? I[] : U[];
    },

    setData: () => { },
    getState: () => ({} as any),
    setState: () => { },
    handleActions: () => { },
    setSnapshots: () => { },
    mergeSnapshots: () => [],
    reduceSnapshots<U>(
      callback: (acc: U, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => U,
      initialValue: U
    ): U | undefined {
      return this.snapshots.reduce(callback, initialValue);
    },
    sortSnapshots: () => [],
    filterSnapshots: () => [],
    mapSnapshots: async () => [],
    findSnapshot: () => ({} as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    subscribe: () => ({} as SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>),
    unsubscribe: () => { },
    fetchSnapshotFailure: (
      snapshotId: string,
      snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      date: Date | undefined,
      payload: { error: Error }
    ) => { },
    generateId: () => "",
    [Symbol.iterator]: () => ({} as IterableIterator<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>),
    [Symbol.asyncIterator]: () => ({} as AsyncIterableIterator<T>),
  };

  return snapshotStore;
}

export const createSnapshotSuccess = async  <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  storeId: number,
  storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  try {
    // Get the snapshot manager for the provided storeId
    const snapshotManager = await useSnapshotManager(storeId, storeProps);

    // Ensure the snapshotManager and its state are available
    if (snapshotManager && snapshotManager.state) {
      const snapshotStore = snapshotManager.state;
      
      // Find the specific snapshot store configuration using storeId
      const snapshotStoreConfig = snapshotStore.find(
        (store) => store.id === storeId
      );

      // If the store configuration is found, proceed with the update
      if (snapshotStoreConfig) {
        const updatedSnapshotData = {
          ...snapshot,
          timestamp: new Date(),
        };

        // Update the snapshot store by adding the new snapshot data
        const updatedSnapshotStore = snapshotStore.map((store) => {
          if (store.id === storeId) {
            return {
              ...store,
              snapshots: [...store.snapshots, updatedSnapshotData],
            };
          }
          return store;
        });

        // Update the state of the snapshot manager with the new snapshot store data
        snapshotManager.setState(updatedSnapshotStore);
      }
    }

    // Additional handling for the snapshot store if it exists and has data
    const snapshotStore = snapshotManager.snapshotManager?.state;
    if (snapshotStore && snapshotStore.length > 0) {
      const updatedSnapshotData = {
        id: generateSnapshotId, // Ensure the ID is generated correctly
        data: {
          ...snapshot.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        timestamp: new Date(),
        category: "update",
        length: 0, // Add logic for determining length if needed
        content: undefined, // Modify if content is to be set
      };

      // Find the store to update with the new snapshot data
      const updatedSnapshotStore = snapshotStore.map((store) => {
        if (store.id === storeId) {
          return {
            ...store,
            snapshots: [...store.snapshots, updatedSnapshotData],
          };
        }
        return store;
      });

      // Set the updated store in the snapshot manager
      snapshotManager.setState(updatedSnapshotStore);
    }
  } catch (error) {
    // Handle any errors that may occur during the process
    console.error("Error creating snapshot success:", error);
  }
};


export const onSnapshot = async  <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: number,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  type: string,
  event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  callback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
): Promise<void> => {
  const initialStoreId = useSecureStoreId()
  if(!initialStoreId){
    throw new Error("")
  }  
  
  const snapshotManager = await useSnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(initialStoreId);
  const snapshotStore = snapshotManager?.state;

  if (snapshotStore && snapshotStore.length > 0) {
    const updatedSnapshotData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      ...snapshot,
      id: generateSnapshotId,
      data: {
        ...(snapshot.data as T),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as T,
      timestamp: new Date(),
      category: "update",
      length: 0,
      content: undefined,
    };

    snapshotStore.push(updatedSnapshotData);

    // Call the callback with the updated snapshot
    callback(updatedSnapshotData);
  } else {
    // Call the callback with the original snapshot if no updates were made
    callback(snapshot);
  }
}


export const onSnapshots = async  <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  type: string,
  event: SnapshotEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  callback: (snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
): Promise<void> => {
  const snapshotManager = await useSnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(initialStoreId);
  const snapshotStore = snapshotManager?.state;

  if (snapshotStore && snapshotStore.length > 0) {
    const updatedSnapshotData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = snapshots.map((snapshot) => ({
      ...snapshot,
      id: generateSnapshotId,
      data: {
        ...(snapshot.data as T),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as T,
      timestamp: new Date(),
      category: "update",
      length: 0,
      content: undefined,
    }));

    snapshotStore.push(...updatedSnapshotData);

    // Call the callback with the updated snapshots
    callback(updatedSnapshotData);
  } else {
    // Call the callback with the original snapshots if no updates were made
    callback(snapshots);
  }
}

const defaultGetDelegate = (snapshotStoreConfig: SnapshotStoreConfig<any, any, any, any, any, any>[] | undefined): SnapshotStoreConfig<any, any, any, any, any, any>[] => {
  return []; // Default implementation, adjust as needed
};


export const delegate = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  try {
    const initialStoreId = useSecureStoreId()
    const snapshotManager = await useSnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(initialStoreId, storeProps);

    if (!snapshotManager || !snapshotManager.delegate) {
      console.error("snapshotManager or delegate is undefined");
      return [];
    }
    return snapshotManager?.delegate || [];
  } catch (error) {
    console.error("Failed to retrieve delegate:", error);
    return [];
  }
};



export const getDelegate = async<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined,
  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  try {
    // Assuming useSnapshotManager is a function that returns a Promise with a snapshot manager object
    const snapshotManager = await useSnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(initialStoreId);

    // Check if snapshotManager and delegate exist
    if (snapshotManager && snapshotManager.delegate) {
      // Delegate should match the expected type
      return snapshotManager.delegate;
    } else {
      // Return an empty array if delegate is not available
      return [];
    }
  } catch (err: unknown) {
    // Handle errors by rejecting the promise
    if (err instanceof Error) {
      throw new Error(`Failed to get delegate: ${err.message}`);
    } else {
      throw new Error('Failed to get delegate: Unknown error');
    }
  }
};



export const determinePrefix = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>() => {
  const storeId = useSecureStoreId()
  const snapshotManager = await useSnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(storeId);
  if (!snapshotManager) {
    throw new Error("SnapshotManager is null");
  }
  const snapshotId = snapshotManager.snapshotId;
  if (typeof snapshotId === 'string') {
    const prefix = snapshotId.substring(0, 2);
    return prefix;
  } else {
    throw new Error("SnapshotId is not a string");
  }
};


export const handleSnapshotSuccess = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(message: string, snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  return new Promise(async (resolve, reject) => {
    try {
      const initialStoreId = useSecureStoreId()
      if (!initialStoreId) {
        throw new Error("Invalid store Id")
      }
      const snapshotManager = (await useSnapshotManager(initialStoreId)).snapshotManager; // Assuming useSnapshotManager returns the correct type
      const snapshotStore = snapshotManager!.state;
      const subscribers = snapshotStoreConfig.subscriberManagement!.subscribers;
      if (snapshotStore && snapshotStore.length > 0) {
        const updatedSnapshotData = {
          id: generateSnapshotId,
          data: {
            ...snapshot.data,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          timestamp: new Date(),
          category: "update",
          length: 0,
          content: undefined,
        };

        // Check if snapshotStore[0] is defined before invoking setSnapshotData
        if (snapshotStore.length > 0 && snapshotStore[0]) {
          const firstSnapshot = snapshotStore[0];
          const updatedSnapshot = {
            ...firstSnapshot,
            data: updatedSnapshotData,
          };
          await snapshotManager!.setSnapshotData(updatedSnapshot, subscribers);
        }
      }

      resolve(snapshot);
    } catch (error) {
      reject(error);
    }
  });
};


export const updateSnapshots = async<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  const snapshotStore = await useSnapshotManager(initialStoreId);

  if (snapshotStore && snapshotStore.length > 0) {
    const updatedSnapshotData = {
      id: generateSnapshotId,
      data: {
        ...snapshot.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      timestamp: new Date(),
      category: "update",
      length: 0,
      content: undefined,
    };

    if (snapshotStore.length > 0 && snapshotStore[0]) {
      const firstSnapshot = snapshotStore[0];
      const updatedSnapshot = {
        ...firstSnapshot,
        data: updatedSnapshotData,
      };

      try {
        const subscribers = await getSubscribersAPI<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(); // Await to get the actual data

        await snapshotStore?.setSnapshotData(updatedSnapshot, subscribers);
      } catch (error) {
        console.error("Error updating snapshots:", error);
        throw error;
      }
    }

    return Promise.resolve(updatedSnapshotData);
  }

  return Promise.resolve(undefined);
};



export const updateSnapshotSuccess = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  snapshotData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  const snapshotStore = await useSnapshotStore(addToSnapshotList);
  if (!snapshotStore || !snapshotStore.state) {
    throw new Error("SnapshotManager or state is null");
  }

  if (snapshotStore.state.length > 0) {
    const updatedSnapshotData: Partial<SnapshotStoreConfig<T, T>> = {
      id: generateSnapshotId,
      data: {
        ...snapshot.data,
        createdAt: new Date(),
        updatedAt: new Date(),
        timestamp: new Date().getTime(),
      },
      timestamp: new Date().toISOString(),
      category: "update",
      length: 0,
      content: undefined,
    };

    const firstSnapshot = snapshotStore.state[0];
    const updatedSnapshot = {
      ...firstSnapshot,
      data: updatedSnapshotData,
    };

    snapshotStore.setSnapshotData(new Map([[updatedSnapshot.id, updatedSnapshot]]), subscribers, updatedSnapshotData);
    return Promise.resolve(updatedSnapshotData);
  }

  return Promise.resolve(undefined);
};


export const updateSnapshotFailure = async<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  payload: { error: Payload },
) => {
  const snapshotManager = await useSnapshotManager();
  if (!snapshotManager) {
    return Promise.resolve(undefined);
  }
  const snapshotStore = snapshotManager.state;
  if (snapshotStore && snapshotStore.length > 0) {
    const updatedSnapshotData = {
      id: generateSnapshotId,
      data: {
        ...payload.error,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      timestamp: new Date(),
      category: "update",
      length: 0,
      content: undefined,
    };
    if (snapshotStore[0]) {
      const firstSnapshot = snapshotStore[0];
      const updatedSnapshot = {
        ...firstSnapshot,
        data: updatedSnapshotData,
      };
      snapshotManager.setSnapshotData(updatedSnapshot, subscribers);
    }
    return Promise.resolve(updatedSnapshotData);
  }
  return Promise.resolve(undefined);
};


export const setSnapshotManager = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
  const snapshotManagerStore = (await useSnapshotManager(initialStoreId));
  snapshotManagerStore.delegate = snapshotManager;
  return snapshotManagerStore;
}



export const createSnapshotFailure = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Assuming T is your data type
  error: any,
) => {
  const snapshotManager = useSnapshotManager()

  if (!snapshotManager?.state && !setSnapshotManager) {
    return Promise.resolve(undefined);
  }

  const state = useSnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().state;
  useEffect(() => {
    if (state.length > 0) {
      const generatedSnapshotId = generateSnapshotId; // Example function to generate ID
      const updatedSnapshotData = {
        id: generatedSnapshotId,
        data: {
          ...snapshot.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        timestamp: new Date(),
        category: 'update',
        length: 0, // Adjust as needed
        content: undefined, // Adjust as needed
      };

      // Assuming your setSnapshotData function mutates the snapshot object in the state
      state[0].setSnapshotData(updatedSnapshotData);

      // Create a new snapshot manager state and update using setSnapshotManager
      const newState = [...state, updatedSnapshotData]; // Example of creating new state with updated data
      setSnapshotManager(newState);
    }
  }, [state, setSnapshotManager]);

  // Other logic related to handling the error or additional actions
};

export const addSnapshotSuccess = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  const snapshotStore = await useSnapshotStore(addToSnapshotList, storeProps);

  if (!snapshotStore || !snapshotStore.state) {
    throw new Error("SnapshotManager or state is null");
  }

  if (snapshotStore.state.length > 0) {
    const updatedSnapshotData = {
      id: generateSnapshotId,
      data: {
        ...snapshot.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      timestamp: new Date(),
      category: "update",
      length: 0,
      content: undefined,
    };

    // Ensure firstSnapshotId is a string before passing it to getSnapshot
    const firstSnapshotId = snapshotStore.state[0]?.id;

    if (firstSnapshotId !== undefined && firstSnapshotId !== null) {
      const firstSnapshot = new Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>((resolve, reject) => {
        // Convert firstSnapshotId to a string if it's a number
        const idAsString = firstSnapshotId.toString();

        const snapshot = snapshotStore.getSnapshot(idAsString); // Pass idAsString to getSnapshot
        if (snapshot) {
          resolve(snapshot);
        } else {
          reject(new Error("firstSnapshot is undefined"));
        }
      });

      if (firstSnapshot) {
        if (typeof firstSnapshot.setSnapshotData === 'function') {
          firstSnapshot.setSnapshotData(updatedSnapshotData as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
        } else {
          console.error('setSnapshotData method is not defined on firstSnapshot');
        }

      notify({
        id: `snapshot_update_success_${firstSnapshotId}_${Date.now()}`,
        message: "Snapshot updated successfully",
        data: {
          entityType: 'snapshot',
          entityId: firstSnapshotId.toString(),
          action: 'update',
          // ... other data
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const,
        metadata: {
          operation: 'snapshot_update',
          // ... other metadata
        }
      });

        return {
          snapshot: [snapshot],
        };
      }
    }
  }

  // Add this line to close the if (snapshotStore.state.length > 0) block
  return { snapshot: [] };
};

const updateSnapshot = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T

>(
  snapshotId: string,
  snapshotOrStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  options?: {
    data?: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    events?: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>;
    dataItems?: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    newData?: Partial<T> | BaseData<any>;
    payload?: UpdateSnapshotPayload<T>;
  }
): Promise<{ snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }> => {
  try {
    // Handle both Snapshot and SnapshotStore cases
    if (isSnapshotStore(snapshotOrStore)) {
      // SnapshotStore case - full update flow
      const {
        data = snapshotOrStore,
        events = {},
        dataItems = [],
        newData = {},
        payload
      } = options || {};

      // Update the snapshot data
      const updatedSnapshotData: T = {
        ...data.data,
        ...(newData as Partial<T>),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update the snapshot store
      data.data = updatedSnapshotData;

      // Process events
      if (events[snapshotId]) {
        events[snapshotId].forEach(event => {
          // Process each event
        });
      }

      // Process data items
      dataItems.forEach(item => {
        // Process each data item
      });

      // Handle payload
      if (payload) {
        // Process payload updates
      }

      const subscribers = getSubscribersAPI()
      // Notify subscribers
      notifySubscribers(snapshotId, subscribers, data);
      
      return {
        snapshot: [data],
      };
    } else {
      const subscribers = getSubscribersAPI()
      // Simple Snapshot case - just notification
      notifySubscribers(snapshotId,  subscribers, snapshotOrStore);
      return {
        snapshot: [snapshotOrStore as unknown as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>],
      };
    }
  } catch (error) {
    console.error('Error updating snapshot:', error);
    throw error;
  }
};


export const updateSnapshotsSuccess = (): void => {
  try {
    // Implement logic to handle a successful snapshot update
    // For example, you might want to update the UI, show a notification, or log the event

    console.log("Snapshots updated successfully.");

    // If you have a notification system, you can notify the user
    useNotification().notify({
      id: "updateSnapshotsSuccess",
      message: "Snapshots have been updated successfully.",
      data: {
        extra: {
          operation: "Update snapshots",
          timestamp: new Date().toISOString(),
          success: true
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.SUCCESS,
      level: 'success'
    });

    // If you need to perform other actions, such as updating state or triggering other processes, do that here
    
  } catch (error) {
    console.error("Error in updateSnapshotsSuccess:", error);
    
    // If notification system is available, notify about the error
    useNotification()?.notify({
      id: "updateSnapshotsSuccessError",
      message: "Error showing snapshot update success notification",
      data: {
        originalError: error instanceof Error ? error.message : 'Unknown error',
        extra: {
          errorMessage: "Failed to process snapshot update success",
          operation: "Update snapshots error handling"
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.ERROR,
      level: 'error'
    });
  }
};

// Alternative version if you want to pass data about what was updated
export const updateSnapshotsSuccessWithData = (snapshotCount?: number, data?: any): void => {
  try {
    console.log("Snapshots updated successfully.", { snapshotCount, data });

    useNotification().notify({
      id: `updateSnapshotsSuccess-${Date.now()}`,
      message: snapshotCount 
        ? `${snapshotCount} snapshots have been updated successfully.`
        : "Snapshots have been updated successfully.",
      data: {
        extra: {
          operation: "Update snapshots",
          snapshotCount,
          timestamp: new Date().toISOString(),
          ...(data && { metadata: data })
        }
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.SUCCESS,
      level: 'success'
    });

  } catch (error) {
    console.error("Error in updateSnapshotsSuccessWithData:", error);
    
    // Fallback to console if notification fails
    console.error("Snapshots update completed but notification failed:", error);
  }
};

/**
 * Deletes a snapshot based on the provided snapshotId.
 * @param snapshotId The ID of the snapshot to delete.
 * @param snapshotData Optional snapshot data needed for the deletion process.
 * @param category Category information related to the snapshot.
 * @returns A promise that resolves to void when the snapshot is successfully deleted.
 */


const deleteSnapshot = async (
  snapshotId: string,
  snapshotData?: SnapshotStoreConfig<any, any>,
  category?: string
): Promise<void> => {
  try {
    // Example: Constructing the API endpoint URL
    const apiUrl = `${API_BASE_URL}/snapshots/${snapshotId}`;

    // Example: Constructing headers if needed
    const headers = {
      'Content-Type': 'application/json',
      // Add authentication headers if required
    };

    // Example: Constructing the request body if needed
    const requestBody = {
      snapshotData, // Include any data needed for deletion
      category, // Include category information if needed
    };

    // Example: Sending a DELETE request using axios
    const response = await axiosInstance.delete(apiUrl, {
      headers,
      data: requestBody, // Use `data` for DELETE requests in axios
    });

    // Example: Handle response if necessary
    console.log('Snapshot deleted successfully:', response.data);

    // Optionally return any specific data upon successful deletion
    return Promise.resolve();
  } catch (error) {
    // Example: Handle error cases
    console.error('Error deleting snapshot:', error);
    throw error; // Propagate the error further if needed
  }
};


export const getAllSnapshots = async <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  try {
    const snapshotPromises = snapshotConfig.snapshots.map(
      async (snapshotUnion: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        // Check if it's SnapshotData
        if (isSnapshotData(snapshotUnion)) {
          const snapshotData = snapshotUnion;
          
          // Safely cast the category from the command line argument
          const categoryArg = process.argv[3];
          // Ensure that the category is a valid key of `CategoryKeys`
          const category = categoryArg as keyof typeof allCategories;
          
          // get current snapshotStoreState from snapshotConfig
          const snapshotStoreState = snapshotConfig.snapshots.find(
            (value) => 'snapshotId' in value && value.snapshotId === snapshotData.snapshotId
          );
          
          const initialState = snapshotStoreState && 'data' in snapshotStoreState 
            ? snapshotStoreState.data 
            : null;
          
          // Access name, version, and schema from snapshotData
          const { name, version, schema } = snapshotData;

          const options = createSnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
            initialState,
            snapshotId: snapshotData.snapshotId,
            category: category as unknown as Category,
            categoryProperties: snapshotData.categoryProperties,
            dataStoreMethods: {
              // Provide appropriate dataStoreMethods
            },
          });

          const categoryProperties = getCategoryProperties(category);
          const snapshotId = snapshotData.snapshotId;
          const storeId = await snapshotApi.getSnapshotStoreId(String(snapshotId));
          const config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = snapshotConfig;

          const operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
            operationType: SnapshotOperationType.FindSnapshot
          };

          if (!name) {
            // Handle missing name
            throw new Error(`Snapshot ${snapshotId} is missing name property`);
          }
          
          const snapshotStore = new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
            storeId, 
            name, 
            version, 
            schema, 
            category, 
            options, 
            config, 
            operation
          });

          return snapshotStore;
        } else {
          // Handle Snapshot or SnapshotWithCriteria types
          console.warn(`Skipping non-SnapshotData type: ${snapshotUnion.category || 'unknown'}`);
          // Return null or throw based on your needs
          throw new Error(`Expected SnapshotData but got ${snapshotUnion.category || 'other type'}`);
        }
      }
    );

    // Filter out null values if needed
    const results = await Promise.all(snapshotPromises);
    return results.filter(Boolean) as SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  } catch (error) {
    console.error('Error in getAllSnapshots:', error);
    throw error;
  }
};


const batchFetchSnapshots = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  criteria: CriteriaType,
  snapshotData: (
    snapshotIds: string[],
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<{
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }>,
  options?: {
    batchSize?: number;
    concurrency?: number;
    timeout?: number;
  }
): Promise<{
  subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}> => {
  try {
    // Initialize collections
    const allSubscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = new Map();
    const allSnapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = [];
    const processedIds = new Set<string>();

    // Default options
    const { batchSize = 50, concurrency = 5, timeout = 30000 } = options || {};

    // Process in batches
    let currentBatch: string[] = [];
    const processBatch = async (batch: string[]) => {
      const { subscribers, snapshots } = await snapshotData(
        batch,
        allSubscribers,
        new Map(allSnapshots.map(s => [s.snapshotId, s]))
      );

      // Merge results
      subscribers.forEach((sub, id) => allSubscribers.set(id, sub));
      snapshots.forEach(snapshot => {
        if (!processedIds.has(snapshot.snapshotId)) {
          allSnapshots.push(snapshot);
          processedIds.add(snapshot.snapshotId);
        }
      });
    };

    // Fetch snapshots based on criteria
    const snapshotIds = await snapshotApi.fetchSnapshotIdsByCriteria(criteria);
    
    // Process with concurrency control
    const batchPromises: Promise<void>[] = [];
    for (const snapshotId of snapshotIds) {
      currentBatch.push(snapshotId);
      
      if (currentBatch.length >= batchSize) {
        batchPromises.push(processBatch([...currentBatch]));
        currentBatch = [];
        
        if (batchPromises.length >= concurrency) {
          await Promise.all(batchPromises);
          batchPromises.length = 0;
        }
      }
    }

    // Process remaining snapshots
    if (currentBatch.length > 0) {
      await processBatch(currentBatch);
    }

    // Wait for all batches to complete
    await Promise.all(batchPromises);

    return {
      subscribers: allSubscribers,
      snapshots: allSnapshots
    };
  } catch (error) {
    console.error('Error in batchFetchSnapshots:', error);
    throw error;
  }
};

export const batchTakeSnapshot = async  <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T

>(
  snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Use both type arguments for SnapshotStore
  snapshots:  SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> // Use both type arguments for SnapshotStore
): Promise<{ snapshots:  SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> => {
  try {
    const result:  SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = [...snapshots];
    return { snapshots: result };
  } catch (error) {
    throw error;
  }
};

// Handler for batch updating snapshots
const batchUpdateSnapshots = async  <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<{ snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }[]> => {
  try {
    return [{ snapshots: [] }];
  } catch (error) {
    throw error;
  }
};

export const batchUpdateSnapshotsSuccess =  <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  snapshots: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
): { snapshots: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }[] => {
  return [{ snapshots }];
};

// Handler for batch taking snapshots request
export const batchTakeSnapshotsRequest = async  <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotData: (
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshots: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>
): Promise<{ snapshots: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] }> => {
  const snapshots = await snapshotData([], []);
  return { snapshots };
};

export const batchUpdateSnapshotsRequest = async  <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotData: (
    subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): Promise<{ snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> => {
  const snapshots = await snapshotData([], []);
  return { snapshots };
};

// Define batchFetchSnapshotsRequest function
export async function batchFetchSnapshotsRequest <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<{
  subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}> {
  console.log("Batch snapshot fetching requested.");

  try {
    const target = {
      endpoint: "https://example.com/api/snapshots/batch",
      params: {
        limit: 100,
        sortBy: "createdAt",
      },
    };

    const response = await fetch(target.endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(target.params),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch snapshots. Status: ${response.status}`);
    }

    const fetchedSnapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = await response.json();

    console.log("Fetched snapshots:", fetchedSnapshots);
    return {
      subscribers,
      snapshots: fetchedSnapshots,
    };
  } catch (error) {
    console.error("Error fetching snapshots in batch:", error);
    throw error;
  }
}

// Handler for batch fetching snapshots success
const batchFetchSnapshotsSuccess = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  subscribers: Subscriber<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[],
  snapshots: SnapshotStore<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, K>[]
): SnapshotStore<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, K>[] => {
  return [...snapshots];
}

// Handler for batch fetching snapshots failure
const batchFetchSnapshotsFailure = (payload: { error: Error }) => {
  // Log the error for debugging
  console.error("Batch fetch snapshots failed:", payload.error);

  // Create a standardized error response object
  const errorResponse = {
    success: false,
    message: payload.error.message || "An unknown error occurred while fetching snapshots.",
    stack: payload.error.stack,
    timestamp: new Date().toISOString(),
  };

  // Optional: Could integrate with your error handling system or Redux
  // Example if you're dispatching an error action:
  dispatch({ type: "BATCH_FETCH_SNAPSHOTS_FAILURE", payload: errorResponse });

  // Return error response so it can be consumed by calling code
  return errorResponse;
};

// Handler for batch updating snapshots failure
const batchUpdateSnapshotsFailure = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  payload: { 
    error: Error;
    failedSnapshots?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  }
) => {
  const { error, failedSnapshots = [] } = payload;

  // 1. Log the error for debugging
  console.error("[Snapshot Batch Update Failure]:", error);

  // 2. Optionally notify the user (replace with your notification system)
  if (typeof window !== "undefined") {
    alert(`Snapshot update failed: ${error.message}`);
  }

  // 3. Optionally update application state to mark snapshots as failed
  dispatch({
    type: 'SNAPSHOT_BATCH_UPDATE_FAILED',
    payload: { error, failedSnapshots }
  });

  // 4. Additional recovery logic: rollback, retry, or mark specific snapshots as failed
  failedSnapshots.forEach(snapshot => {
    // You'll need to implement markAsFailed or use your existing method
    console.warn(`Snapshot ${snapshot.id} failed to update: ${error.message}`);
    // Example: snapshot.markAsFailed?.(error.message);
  });
};

function adaptSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  const adaptedSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id: snapshot.id,
    timestamp: snapshot.timestamp,
    category: snapshot.category,
    data: snapshot.data as T,
    getSnapshotId: snapshot.getSnapshotId,
    compareSnapshotState: snapshot.compareSnapshotState,
    eventRecords: null,
    snapshotStore: null,
    getParentId: snapshot.getParentId,
    getChildIds: snapshot.getChildIds,
    addChild: snapshot.addChild,
    removeChild: snapshot.removeChild,
    getChildren: snapshot.getChildren,
    hasChildren: snapshot.hasChildren,
    isDescendantOf: snapshot.isDescendantOf,
    dataItems: () => null,
    newData: null,
    stores: snapshot.stores,
    getStore: snapshot.getStore,
    addStore: snapshot.addStore,
    mapSnapshot: snapshot.mapSnapshot,
    removeStore: snapshot.removeStore,
    unsubscribe: snapshot.unsubscribe,
    fetchSnapshot: snapshot.fetchSnapshot,
    addSnapshotFailure: snapshot.addSnapshotFailure,
    configureSnapshotStore: snapshot.configureSnapshotStore,
    updateSnapshotSuccess: snapshot.updateSnapshotSuccess,
    createSnapshotFailure: snapshot.createSnapshotFailure,
    createSnapshotSuccess: snapshot.createSnapshotSuccess,
    createSnapshots: snapshot.createSnapshots,
    onSnapshot: snapshot.onSnapshot,
    onSnapshots: snapshot.onSnapshots,
    events: undefined,
    handleSnapshot: snapshot.handleSnapshot,
    meta: undefined
  };

  return adaptedSnapshot;
}

const fetchSnapshot = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  options: {
    storeId?: number;
    category?: Category;
    timestamp?: Date;
    additionalHeaders?: Record<string, string>;
    subscriberCallback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  } = {}
): Promise<{
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}> => {
  try {

        const storeId = options.storeId !== undefined 
      ? await getStoreId(options.storeId)
      : await getDefaultStoreId();
    const {
      category,
      timestamp = new Date(),
      additionalHeaders,
      subscriberCallback
    } = options;

    // 1. Get the snapshot data from API
    const snapshotData = await snapshotApi.getSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
      snapshotId,
      additionalHeaders
    );

    // 2. Create or retrieve the snapshot store
    const snapshotStore = await getOrCreateSnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
      snapshotId,
      storeId,
      initialData: snapshotData,
      category
    });

    // 3. Apply any transformations based on category
    const processedSnapshot = processSnapshotByCategory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
      snapshotStore,
      category
    );

    // 4. Handle subscribers
    const subscribers = new Map<string, Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
    
    if (subscriberCallback) {
      const subscriberId = generateSubscriberId();
      subscribers.set(subscriberId, {
        id: subscriberId,
        callback: subscriberCallback,
        createdAt: new Date()
      });
      snapshotSubscribers.set(snapshotId, subscribers);
    }

    // 5. Update snapshot metadata
    const updatedSnapshot = {
      ...processedSnapshot,
      timestamp,
      lastAccessed: new Date(),
      accessCount: (processedSnapshot.accessCount || 0) + 1
    };

    // 6. Cache the snapshot
    snapshotCache.set(snapshotId, updatedSnapshot);

    return {
      snapshot: updatedSnapshot,
      subscribers
    };

  } catch (error) {
    console.error(`Error fetching snapshot ${snapshotId}:`, error);
    throw new SnapshotFetchError(snapshotId, error);
  }
};

// Helper functions
async function getOrCreateSnapshotStore<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(params: {
  snapshotId: string;
  storeId: number;
  initialData: T;
  category?: Category;
}): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  // Implementation logic
}

function processSnapshotByCategory<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  category?: Category
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Category-specific processing logic
}


const notifySubscribers = async <
  T extends BaseDataEntity,
  K extends T,
  Meta = DefaultMeta<T, K>,
  AttachmentType = Attachment,
  ExcludedFields = DefaultExcludedFields<T>,
  IncludedFields = keyof T
>(
  snapshotId: string,
  subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  callback: (data: any) => void
): Promise<Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
  const snapshotManager = useSnapshotManager(initialStoreId, storeProps)
  const { handleError } = useErrorHandling(); // Access handleError function from useErrorHandling

  if (!snapshotManager || !snapshotManager.onSnapshot) {
    handleError("Snapshot Manager not initialized.");
    return [];
  }

  await Promise.all(
    subscribers.map(async (subscriber) => {
      await snapshotManager.onSnapshot(
        snapshotId,
        callback,
        async (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
          const adaptedSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = adaptSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshot);

          // 1. Send Notifications
          dispatch(
            useSnapshotSlice.actions.sendNotification({
              snapshot: adaptedSnapshot,
              subscriber,
            })
          );

          // 2. Update UI
          await updateUI(adaptedSnapshot, subscriber); // Implement updateUI function

          // 3. Execute Subscribers' Callbacks
          await executeCallback(adaptedSnapshot, subscriber); // Implement executeCallback function

          // 4. Broadcast Changes
          await broadcastChanges(adaptedSnapshot, subscriber); // Implement broadcastChanges function

          // 5. Update Database
          await updateDatabase(adaptedSnapshot); // Implement updateDatabase function

          // 6. Trigger Actions
          await triggerActions(adaptedSnapshot); // Implement triggerActions function

          // 7. Log Changes
          logChanges(adaptedSnapshot); // Implement logChanges function

          // 8. Handle Errors
          try {
            handleError(adaptedSnapshot.toString()); // Implement handleErrors function
          } catch (error) {
            console.error("Error occurred while handling errors:", error);
          }
        }
      );
    })
  );

  return subscribers;
};

export { adaptSnapshot, batchFetchSnapshots, batchFetchSnapshotsFailure, batchFetchSnapshotsSuccess, batchUpdateSnapshots, batchUpdateSnapshotsFailure, createSnapshotStore, deleteSnapshot, fetchSnapshot, initializeSnapshotStore, notifySubscribers, updateSnapshot };

