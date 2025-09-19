// useSnapshotManager.ts
import { SnapshotContext } from '@/app/components/snapshots/SnapshotSubscriberManagement';
import { SnapshotStoreMap } from './SnapshotMethods'
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { getStoreId } from '@/app/api/ApiData';
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { SnapshotStoreReference } from "./SnapshotStoreReference";
import { fetchEventId } from '@/app/api/ApiEvent';
import * as snapshotApi from '@/app/api/SnapshotApi';
import { getCategoryProperties } from '@/app/components/libraries/categories/CategoryManager';
import { BaseData } from '@/app/components/models/data/Data';
import { ConfigurableSnapshotStore } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { processSnapshot, SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotStoreProps } from '@/app/components/snapshots';
import { Snapshots } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { ConfigureSnapshotStorePayload } from "@/app/components/snapshots/SnapshotConfig";
import { CustomSnapshotData } from "@/app/components/snapshots/SnapshotData";
import { storeProps } from '@/app/components/snapshots/SnapshotStoreProps';
import { SnapshotWithCriteria } from '@/app/components/snapshots/SnapshotWithCriteria';
import { createSnapshotInstance } from '@/app/components/snapshots/createSnapshotInstance';
import { SimulatedDataSource } from "@/app/components/snapshots/createSnapshotOptions";
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import {
    useNotification
} from "@/app/context/NotificationContext";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { UpdateSnapshotPayload } from "@/server/database/Payload";
import { useEffect, useState } from "react";
import { createMetadata } from '../../configs/metadata/createMetadata';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import { Category, generateOrVerifySnapshotId } from '../libraries/categories/generateCategoryProperties';
import { Content } from "../models/content/AddContent";
import { displayToast } from '../models/display/ShowToast';
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore, useDataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import {
    Snapshot,
    SnapshotsArray
} from "../snapshots/LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "../snapshots/SnapshotActions";
import { SnapshotEvents } from '../snapshots/SnapshotEvents';
import SnapshotStore from "../snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "../snapshots/SnapshotStoreConfig";
import { InitializedDelegate, SnapshotStoreOptions } from '../snapshots/SnapshotStoreOptions';
import { handleSnapshotOperation } from '../snapshots/handleSnapshotOperation';
import handleSnapshotStoreOperation from '../snapshots/handleSnapshotStoreOperation';
import { subscribeToSnapshot, subscribeToSnapshots } from "../snapshots/snapshotHandlers";
import CalendarManagerStoreClass from "../state/stores/CalendarManagerStore";
import { SubscriberCallbackType, Subscription } from '../subscriptions/Subscription';
import { addToSnapshotList, isSnapshotStoreConfig, isSnapshotWithCriteria } from '../utils/snapshotUtils';
import { LibraryAsyncHook } from "./useAsyncHookLinker";

const { notify } = useNotification();

interface CombinedEvents<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>
  extends SnapshotEvents<T, K, Meta, ExcludedFields> {
  subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>[],
  event: string | CombinedEvents<T, K, Meta, ExcludedFields> | SnapshotEvents<T, K, Meta, ExcludedFields>,
  trigger: (
    event: string | CombinedEvents<T, K, Meta, ExcludedFields> | SnapshotEvents<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    eventDate: Date,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
    type: string,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>
  ) => void;

  onSnapshotAdded: (event: string, snapshot: Snapshot<T, K, Meta, ExcludedFields>, snapshotId: string, subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>) => void;
  onSnapshotRemoved: (
    event: string,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>,
    type: string,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    criteria: SnapshotWithCriteria<T, K, Meta, ExcludedFields>,
    category: Category,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>
  ) => void;
  onSnapshotUpdated: (
    event: string,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    data: Map<string, Snapshot<T, K, Meta, ExcludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]>,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    newData: Snapshot<T, K, Meta, ExcludedFields>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, K>
  ) => void;
  removeSubscriber: (event: string, snapshotId: string) => void;
  onError: (
    event: string,
    error: Error,
    snapshot: Snapshot<T, K, Meta, ExcludedFields>,
    snapshotId: string,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    criteria: SnapshotWithCriteria<T, K, Meta, ExcludedFields>,
    category: Category
  ) => void;
  once: (event: string, callback: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => void) => void;
  
  addRecord: (
    event: string, 
    record: CalendarManagerStoreClass<T, K, Meta, ExcludedFields>, 
    callback: (snapshot: CalendarManagerStoreClass<T, K, Meta, ExcludedFields>) => void
  ) => void;

  unsubscribe: (
    snapshotId: string,
    unsubscribeDetails: UnsubscribeDetails,
    callback: SubscriberCallbackType<T, K, Meta, ExcludedFields> | null,
    ctx?: SnapshotContext<T, K, Meta, ExcludedFields>
  ) => void;
}

interface SnapshotManager<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
> extends Snapshot<T, K, Meta> {
  initSnapshot: (
    snapshotConfig: SnapshotStoreConfig<T, K, Meta, ExcludedFields>[],
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>
  ) => Promise<void>;
  
  storeIds: number[],
  snapshotId: string,
  category: Category | undefined,  
  
  snapshot: (
    id: string | number | undefined,
    snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
    category: Category | undefined,    
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void,
    dataStore: DataStore<T, K, Meta, ExcludedFields>,
    dataStoreMethods: DataStoreMethods<T, K, Meta, ExcludedFields>,
    metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number, // Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
    snapshotConfigData: SnapshotConfig<T, K, Meta, ExcludedFields>,
    subscription: Subscription<T, K, Meta, ExcludedFields>,
    snapshotId?: string | number | null,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, ExcludedFields>,
    snapshotContainer?: SnapshotStore<T, K, Meta, ExcludedFields> | Snapshot<T, K, Meta, ExcludedFields> | null
  ) => Promise<{ snapshot: Snapshot<T, K, Meta, ExcludedFields>; }>,
  
  timestamp: string | number | Date | undefined,
  type: string,
  event: Event,
  id: number,
  snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
  data:  BaseData<any>
  state: SnapshotStore<T, K, Meta, ExcludedFields>[];
  getSnapshots: () => Promise<Snapshot<T, K, Meta, ExcludedFields>[]>;
  updateSnapshots: (snapshots: Snapshots<T, K, Meta, ExcludedFields>) => void;
  // Add the `callbacks` property
  callbacks: (snapshot: Snapshot<T, K, Meta, ExcludedFields>) => { snapshots: Snapshot<T, K, Meta, ExcludedFields>[] };
  
  getStores: (   
    storeId: number,
    snapshotId: string,
    snapshotStoreConfigs: SnapshotStoreConfig<T, K, Meta, ExcludedFields>[],
    snapshotStores?: SnapshotStoreReference<T, K, Meta, ExcludedFields>[] | Map<number, SnapshotStore<T, K, Meta, ExcludedFields>>
  ) => SnapshotStoreMap

  initializeStores: (stores: DataStore<T, K, Meta, ExcludedFields>[]) => Promise<SnapshotStore<T, K, Meta, ExcludedFields>[]>
}

// Define the async hook configuration
const asyncHook: LibraryAsyncHook = {
  enable: () => { },
  disable: () => { },
  condition: () => Promise.resolve(true),
  asyncEffect: async () => {
    // Implementation logic for async effect
    console.log("Async effect ran!");

    // Return a cleanup function
    return () => {
      console.log("Async effect cleaned up!");
    };
  },
  idleTimeoutId: null, // Initialize idleTimeoutId
  startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
    // Implementation logic for starting idle timeout
    const timeoutId = setTimeout(onTimeout, timeoutDuration);
    if (timeoutId !== null) {
      asyncHook.idleTimeoutId = timeoutId;
    }
  },
  isActive: false,
};

const snapshotMethods = useDataStore().snapshotMethods

const snapshotStoreConfig = useDataStore().snapshotStoreConfig



export const createBaseData = (overrides: Partial<BaseData> = {}): BaseData => ({
  id: 'default-id',
  name: 'Default Name',
  metadata: {},
  ...overrides,
});

const completeDataStoreMethods: <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, ExcludedFields>[],
  dataStoreMethods: Partial<DataStoreWithSnapshotMethods<T, K, Meta, ExcludedFields>>
) => Partial<DataStoreWithSnapshotMethods<T, K, Meta, ExcludedFields>> = (
  snapshotStoreConfig,
  dataStoreMethods
) => {
    // Implementation goes here
    return {}
  }

// Function to convert Snapshot<T, K, Meta, ExcludedFields> to Content
// Updated function to convert Snapshot<T, K, Meta, ExcludedFields> to Content
const convertSnapshotToContent = < 
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  snapshot: Snapshot<T, K, Meta, ExcludedFields>
): Content<T, K, Meta, ExcludedFields> => {
  // Convert snapshot.data to match SnapshotWithCriteria<T, BaseData>
  let data: SnapshotWithCriteria<T, K, Meta, ExcludedFields> | CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields> | null | undefined;

  if (snapshot.data instanceof Map) {
    data = convertMapToCustomSnapshotData(snapshot.data);
  } else if (isSnapshotWithCriteria(snapshot.data)) {
    // Ensure snapshot.data is of type SnapshotWithCriteria<T, BaseData>
    data = snapshot.data as unknown as SnapshotWithCriteria<T, K, Meta, ExcludedFields>;
  } else {
    // Fallback: Handle other cases or convert data if necessary
    data = snapshot.data as CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields> | null | undefined;
  }

  return {
    id: snapshot.id ?? "default-id",
    title: snapshot.title ?? "default-title",
    description: snapshot.description ?? "default-description",
    subscriberId: snapshot.subscriberId ?? "default-subscriber-id",
    category: snapshot.category,
    timestamp: snapshot.timestamp ?? new Date(),
    categoryProperties: snapshot.categoryProperties ?? "default-category-properties",
    length: 0,
    data: snapshot.data,
    latestVersion: snapshot.latestVersion ?? {},
    items: snapshot.items ?? [],
    contentItems: snapshot.contentItems ?? []
  };
};
// Example conversion function from Map to CustomSnapshotData
const convertMapToCustomSnapshotData =  <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(map: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields>>

): CustomSnapshotData<T> => {
  // Implement the logic to convert a Map to CustomSnapshotData
  // For example:
  const customData: CustomSnapshotData<T> = {
    id: "custom_map-id", // or some appropriate value
    timestamp: new Date().getTime()
    // other required properties
  };
  return customData;
};



const createSnapshotStore =  <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  snapshotConfig: SnapshotStoreConfig<T, K>,
  snapshotData: SnapshotData<T, K>
): ConfigurableSnapshotStore<T, K> => {
  // Step 1: Validate input parameters
  if (!snapshotConfig || !snapshotData) {
    throw new Error("Invalid snapshotConfig or snapshotData provided");
  }

  // Step 2: Initialize the Snapshot Store
  const initializedStore: SnapshotStore<T, K, Meta, ExcludedFields> = {
    ...snapshotData, // Copy the existing snapshot data
    id: snapshotConfig.id || snapshotData.id, // Use provided ID or default to the data's ID
    criteria: snapshotConfig.criteria || snapshotData.criteria, // Apply criteria from config if available
    data: snapshotConfig.data || snapshotData.data, // Use the provided data or default to existing data
    createdAt: snapshotConfig.createdAt || new Date(), // Set the creation date
    updatedAt: snapshotConfig.updatedAt || new Date(), // Set the update date
    category: snapshotConfig.category || snapshotData.category, // Use category from config if provided
    config: snapshotStoreConfig, // Store the full config in the snapshot store
    restoreSnapshot: snapshotConfig.restoreSnapshot || snapshotData.restoreSnapshot,
    configs: snapshotConfig.configs || snapshotData.configs,
    snapshotStores: snapshotConfig.snapshotStores || snapshotData.snapshotStores,
    name: snapshotConfig.name || snapshotData.name,
    schema: snapshotConfig.schema || snapshotData.schema,
    snapshotItems: snapshotConfig.snapshotItems || snapshotData.snapshotItems,
    nestedStores: snapshotConfig.nestedStores || snapshotData.nestedStores,
    snapshotIds: snapshotConfig.snapshotIds || snapshotData.snapshotIds,
    dataStoreMethods: snapshotConfig.dataStoreMethods || snapshotData.dataStoreMethods,
    delegate: snapshotConfig.delegate || snapshotData.delegate,
    getConfig: snapshotConfig.getConfig || snapshotData.getConfig,
    setConfig: snapshotConfig.setConfig || snapshotData.setConfig,
  };

  // Step 3: Apply any necessary configurations or transformations
  if (snapshotConfig.transform) {
    initializedStore.data = snapshotConfig.transform(snapshotData.data);
  }

  if (snapshotConfig.filter) {
    initializedStore.data = initializedStore.data.filter(snapshotConfig.filter);
  }

  if (snapshotConfig.sort) {
    initializedStore.data = initializedStore.data.sort(snapshotConfig.sort);
  }

  // Step 4: Return the initialized snapshot store
  return initializedStore;
};



const createSnapshotConfig = <
  T extends BaseData<any>,
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
  snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
  snapshotContent?: Snapshot<T, K, Meta, ExcludedFields>,
  storeOptions?: SnapshotStoreOptions<T, K>
): SnapshotStoreConfig<T, K> => {
  const content = snapshotContent ? convertSnapshotToContent(snapshotContent) : undefined;

  if(storeOptions === undefined) {
    throw new Error("storeProps is undefined");
  }
  const { store, snapshotId, data, events, dataItems, newData, payload, storeRef, callback } = storeOptions
  return {

    snapshotStore: (
      store: "",
      snapshotId: "",
      data: "",
      events: "",
      dataItems: "",
      newData: "",
      payload: "",
      storeRef: "",
      callback: ""
    ) => {
      // Validate inputs
      if (!store || !snapshotId) {
        throw new Error("Store or snapshotId is missing.");
      }

      // Log incoming parameters for debugging
      console.log("snapshotId:", snapshotId);
      console.log("data:", data);
      console.log("events:", events);
      console.log("dataItems:", dataItems);
      console.log("newData:", newData);
      console.log("payload:", payload);

      // If a new snapshot is being added, you may want to check if it already exists
      if (data.has(snapshotId)) {
        // If it exists, update the existing snapshot
        const existingSnapshot = data.get(snapshotId);
        if (existingSnapshot) {
          // Merge new data into the existing snapshot
          const updatedSnapshot = {
            ...existingSnapshot,
            ...newData,
            // You can also include any other merging logic here
          };

          // Store the updated snapshot back into the data map
          data.set(snapshotId, updatedSnapshot);
          console.log(`Updated snapshot with ID ${snapshotId}:`, updatedSnapshot);
        }
      } else {
        // If the snapshot does not exist, create a new snapshot
        const newSnapshot = {
          ...newData,
          id: snapshotId,
          // Include any additional properties necessary for the new snapshot
        };

        // Add the new snapshot to the data map
        data.set(snapshotId, newSnapshot);
        console.log(`Created new snapshot with ID ${snapshotId}:`, newSnapshot);
      }

      // If events are provided, you can process them accordingly
      if (events) {
        const eventId = fetchEventId(events);
        // Process each event
        for (const eventKey in events) {
          const eventHandlers = events[eventKey];
          // Call each event handler with the snapshot
          eventHandlers.forEach(handler => {
            if (typeof handler === 'function') {
              handler(eventId, newData);
            } else if (typeof handler.handleEvent === 'function') {
              handler.handleEvent(eventId, newData); // Use the appropriate method
            }
          });
        }
      }

      // If dataItems are provided, you can update the store based on those items
      if (dataItems) {
        dataItems.forEach(item => {
          // Implement your logic for handling each RealtimeDataItem
          console.log("Processing data item:", item);
          // For example, you might want to update the snapshot based on the item
        });
      }

      // Call the callback function with the store
      if (callback) {
        callback(store);
      }
    },
    snapshotId: "initial-id",
    snapshotCategory: "initial-category",
    snapshotSubscriberId: "initial-subscriber",
    timestamp: new Date(),
    snapshotContent: content,
    id: null,
    data: {} as T,
    initialState: null,
    handleSnapshot: (
      id: string | number,
      snapshotId: string  | null,
      snapshot: Snapshot<T, K, Meta, ExcludedFields> | null,
      snapshotData: T,
      category: Category | undefined,      callback: (snapshot: T) => void,
      snapshots: SnapshotsArray<any>,
      type: string,
      event: Event,
      snapshotContainer?: T,
      snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | null, // Change here
    ): Promise<Snapshot<T, K, Meta, ExcludedFields> | null> => {

      let processedSnapshot: T | null = null;

      // Dynamically create metadata for the current area
      const metaData = createMetadata<T, K, Meta, ExcludeKeys<T, K>>({
        area: type === 'create' ? 'dashboard' : 'profile',
        tags: [],
        overrides: {
          updatedAt: new Date(),
          updatedBy: 'event-handler',
        },
      });
    
      if (!snapshotStoreConfig) {
        throw new Error('Snapshot store configuration is missing.');
      }
    
      try {
        if (snapshot) {
          const transformedSnapshot = processSnapshot<T, K>({ ...snapshot, ...snapshotData });
    
          callback(transformedSnapshot);
    
          return Promise.resolve(
            createSnapshotInstance(
              snapshotData,
              metaData, // Use dynamic metadata
              snapshotId,
              transformedSnapshot,
              category,
              snapshotStore,
              snapshotStoreConfig
            )
          );
        } else {
          // Handle snapshotContainer or other logic here
        }
      } catch (error) {
        console.error(`Error handling snapshot: ${error}`);
        return Promise.reject(null);
      }
      return Promise.resolve(null);
    },

    state: null,
    snapshots: [],
    subscribers: [],
    category: "default-category",
    getSnapshotId: async () => "default-id",
    snapshot: async (
      id: string | number | undefined,
      snapshotId: string | null,
      snapshotData: SnapshotData<T, K> | null, // Change here
      category: Category | undefined,      categoryProperties: CategoryProperties | undefined,
      callback: (snapshot: Snapshot<T, K, Meta, ExcludedFields> | null) => void,
      dataStore: DataStore<T, K>,
      dataStoreMethods: DataStoreMethods<T, K>,
      // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
      metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
      subscriberId: string, // Add subscriberId here
      endpointCategory: string | number,// Add endpointCategory here
      storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
      snapshotConfigData: SnapshotConfig<T, K>,
      snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
      snapshotContainer?: SnapshotContainer<T, K>,
    ): Promise<{ snapshot: Snapshot<T, K, Meta, ExcludedFields> | null, snapshotData: SnapshotData<T, K>; }> => {
      const { storeId, name, version, options, snapshots, expirationDate, schema,
        payload, 
      } = storeProps
      
      // Check if snapshotData is not null
      if (snapshotData !== null) {
        
        // Generate or verify the snapshot ID
        id = generateOrVerifySnapshotId<T, K>(id, snapshotData, category);

        // Initialize or reuse the snapshot container
        const snapshot: Snapshot<T, K, Meta, ExcludedFields> | null = snapshotStoreConfigData?.createSnapshot?.(
          id,
          snapshotData,
          category,
          categoryProperties,
          callback
        ) ?? null;
    
        if (snapshot) {

          
          // Callback with the created snapshot
          callback(snapshot);
    
          // Extract the snapshot ID and fetch the store ID
          const snapshotId: string | number | undefined = snapshot?.store?.snapshotId ?? undefined;
          // /const storeId = await snapshotApi.getSnapshotStoreId(String(snapshotId));
    
          // Handle default config
          const defaultConfig: SnapshotStoreConfig<T, K> = {} as SnapshotStoreConfig<T, K>;
          const config: SnapshotStoreConfig<T, K> = snapshotStoreConfigData || defaultConfig;
    
          // Define the snapshot operation
          const operation: SnapshotOperation<T, K> = {
            operationType: SnapshotOperationType.FindSnapshot
          };
    
          // Initialize the SnapshotStore
          const newSnapshotStore = new SnapshotStore<T, K, Meta, ExcludedFields>({storeId, name, version, schema, options, category, config, operation,snapshots, expirationDate, payload, callback, storeProps, endpointCategory});
    
          // Callback again with the snapshot
          callback(snapshot);
    
          return {
            snapshot: snapshot,
            snapshotData: snapshotData
          };
        } else {
          console.error('Failed to create snapshot');
          return { snapshot: null, snapshotData: snapshotData };
        }
      }
    
      return { snapshot: null, snapshotData: {} as SnapshotData<T, K> };
    },    
    
    createSnapshot: () => ({
      id: "default-id",
      data: new Map<string, Snapshot<T, K, Meta, ExcludedFields>>(),
      timestamp: new Date(),
      category: "default-category",
      subscriberId: "default-subscriber-id",
      meta: {} as Map<string, Snapshot<T, K, Meta, ExcludedFields>>,
      events: {} as CombinedEvents<T, K>
    })
  }
};

interface SnapshotStoreConfigWithMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends SnapshotStoreConfig<T, K, Meta, ExcludedFields> {
  getAllSnapshots: (ref: SnapshotStore<T, K, Meta, ExcludedFields> | null) => Promise<Snapshot<T, K, Meta, ExcludedFields>[]>;
}



export const useSnapshotManager = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  initialStoreId: number,
  storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields> // ✅ explicitly passed in
) => {
  const [snapshotManager, setSnapshotManager] = useState<SnapshotStoreConfigWithMethods<T, K> | null>(null);
  const [snapshotStore, setSnapshotStore] = useState<SnapshotStore<T, K, Meta, ExcludedFields> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Destructure storeProps for convenience
  const { 
    storeId: providedStoreId, 
    name, 
    version, 
    options, 
    snapshots, 
    expirationDate, 
    schema,
    payload, 
    category, 
    config, 
    callback, 
    endpointCategory 
  } = storeProps;

  // ✅ useCallback so initSnapshotManager is stable across renders
  const initSnapshotManager = useCallback(async () => {
    setIsLoading(true);
    try {
      const operation: SnapshotOperation<T, K> = {
        operationType: SnapshotOperationType.FindSnapshot
      };

      // Prevent shadowing: prefer provided storeId if available
      const resolvedStoreId = providedStoreId ?? (await getStoreId(initialStoreId));

      // ✅ Create SnapshotStore
      const newSnapshotStore = new SnapshotStore<T, K, Meta, ExcludedFields>({
        storeId: resolvedStoreId,
        name,
        version,
        schema,
        options,
        category,
        config,
        operation,
        expirationDate,
        payload,
        callback,
        storeProps,
        endpointCategory
      });

      // ✅ Build config
      const snapshotConfig = createSnapshotConfig(newSnapshotStore) as SnapshotStoreConfigWithMethods<T, K>;

      // Extend with getAllSnapshots
      snapshotConfig.getAllSnapshots = async (ref: SnapshotStore<T, K, Meta, ExcludedFields> | null) => {
        const snapshots = await fetchSnapshotsFromAPI(ref);
        return snapshots as Snapshot<T, K, Meta, ExcludedFields>[];
      };

      // ✅ Update state
      setSnapshotManager(snapshotConfig);
      setSnapshotStore(newSnapshotStore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to initialize snapshot manager"));
    } finally {
      setIsLoading(false);
    }
  }, [initialStoreId, providedStoreId, name, version, schema, options, category, config, expirationDate, payload, callback, endpointCategory, storeProps]);

  // ✅ Run init on mount / when deps change
  useEffect(() => {
    initSnapshotManager();
  }, [initSnapshotManager]);

  return { 
    snapshotManager, 
    snapshotStore,
    isLoading,
    error,
    refresh: initSnapshotManager
  };
};


export { completeDataStoreMethods, convertMapToCustomSnapshotData, convertSnapshotToContent, createSnapshotStore };
export type { CombinedEvents, SnapshotManager, SnapshotStoreOptions };





// //  access state with useSnapshotManager
// // Example of accessing state with useSnapshotManager
// const ExampleComponent: React.FC = () => {
  // const { metadata, updateMetadata } = useMeta(createMeta({ description: 'Example structured metadata' }));
  // const { options, updateOptions } = useMetadata(createMetadata({ area: 'Example unified metadata' }));

  // // Example updates
  // const handleMetadataUpdate = () => updateMetadata({ isActive: true });
  // const handleOptionsUpdate = () => updateOptions({ tags: ['example', 'metadata'] });

//   const snapshotManager =  useSnapshotManager()

//   // Access specific properties from snapshotManager
//   const { delegate, snapshotStore,  } =  snapshotManager

//   // Use delegate methods
//   const handleSomeAction = () => {
//     delegate.someMethod()
//   }

//   // Access snapshot store methods
//   const getCurrentSnapshot = () => {
//     return snapshotStore.getCurrentSnapshot()
//   }

//   // Render component using the accessed state
//   return (
//     <div>
//       {/* Use the accessed state in your component */}
      // <p>Structured Metadata: {JSON.stringify(metadata)}</p>
      // <p>Unified Metadata Options: {JSON.stringify(options)}</p>
      // <button onClick={handleMetadataUpdate}>Update Metadata</button>
      // <button onClick={handleOptionsUpdate}>Update Options</button>
//     </div>
//   )
// }

// export default ExampleComponent



