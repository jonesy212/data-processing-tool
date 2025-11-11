// snapshotUtils.tsx
import * as snapshotApi from '@/app/api/SnapshotApi';
import { additionalHeaders } from '@/app/api/headers/generateAllHeaders';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { ModifiedDate } from "@/app/documents/DocType";
import { Attachment } from '@/app/documents/attachment/Attachment';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import useSecureSnapshotId from '@/app/hooks/useSecureSnapshotId';
import useSecureStoreId from '@/app/hooks/useSecureStoreId';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { BaseData, Data } from '@/app/models/data/Data';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { SnapshotConfig, SnapshotContainer, SnapshotData, SnapshotDataType, SnapshotWithCriteria } from '@/app/snapshots';
import {
    Snapshots,
    SnapshotsArray,
    SnapshotStoreObject,
    SnapshotUnion,
} from "@/app/snapshots/LocalStorageSnapshotStore";
import { Snapshot } from "@/app/snapshots/Snapshot";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotStoreProps, useSnapshotStore } from "@/app/snapshots/useSnapshotStore";
import { Subscriber, SubscriberCallback } from "@/app/subscribers/Subscriber";
import { SubscriberCallbackType, Subscription } from "@/app/subscriptions/Subscription";
import { getSubscriptionLevel } from "@/app/subscriptions/SubscriptionLevel";
import { SnapshotEvents } from '@/app/typings/snapshotTypes';
import { useNotification } from "@/state/context/NotificationContext";
import { IHydrateResult } from "mobx-persist";

function isHydrateResult<T>(result: any): result is IHydrateResult<T> {
  return (result as IHydrateResult<T>).then !== undefined;
}

function isSnapshotConfig<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(config: any): config is SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return config && 'storeConfig' in config && 'additionalData' in config;
}

// Type guard function to check if a snapshot is a SnapshotStoreObject<BaseData, any>
const isSnapshotStoreCoreData = <  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: any
): snapshot is SnapshotStoreObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  // Ensure snapshot is an object and has at least one key
  if (typeof snapshot === "object" && snapshot !== null) {
    const keys = Object.keys(snapshot);
    // Check if the object has at least one property and each property value is a SnapshotUnion<BaseData, Meta>
    return (
      keys.length > 0 &&
      keys.every((key) => {
        const value = snapshot[key];
        // Check if the value is a valid SnapshotUnion<BaseData, Meta>
        return isSnapshotUnionBaseData(value);
      })
    );
  }
  return false;
};

// Type guard function to check if a value is a SnapshotUnion<BaseData, Meta>
const isSnapshotUnionBaseData = <  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  value: any
): value is SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return isSnapshotBaseData(value) || isSnapshotWithCriteriaBaseData(value);
};

// Type guard to check if a value is a Snapshot<BaseData, any>
const isSnapshotBaseData = (value: any): value is Snapshot<BaseData, any> => {
  return (
    value &&
    typeof value.data !== "undefined" && // Check if the snapshot has `data`
    typeof value.snapshot === "function" && // Ensures the presence of the `snapshot` method
    typeof value.setCategory === "function" && // Ensures the presence of `setCategory`
    typeof value.getSnapshotData === "function" // Ensures the presence of `getSnapshotData`
  );
};


// Implement the logic to verify SnapshotWithCriteriaBaseData
const isSnapshotWithCriteriaBaseData = <  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  value: any
): value is SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  // Implement checks for properties that are specific to SnapshotWithCriteria<BaseData, BaseData>
  return (
    value &&
    typeof value.snapshot === "function" &&
    typeof value.setCategory === "function" &&
    value.hasOwnProperty("criteria")
  );
};

// Example conversion function
function convertToSnapshotArray<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  data: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Implement conversion logic here
  return Array.isArray(data) ? data : Object.values(data);
}

function convertToSnapshotWithCriteria<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotWithCriteria<T, K> | null {
  const { id, snapshotData, category, description, categoryProperties } = snapshot;

  function isOfType<T>(obj: any): obj is T {
    return obj && typeof obj.id === 'string' && typeof obj.type === 'string';
  }

  if (category) {
    const criteriaSnapshot: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      ...snapshot,
      // Public methods from SnapshotStore
      get: snapshotStore?.get.bind(snapshotStore),
      initializeOptions: snapshotStore?.initializeOptions.bind(snapshotStore),
      setConfig: snapshotStore?.setConfig.bind(snapshotStore),
      autoSyncData: snapshotStore?.autoSyncData.bind(snapshotStore),
      ensureDelegate: snapshotStore?.ensureDelegate.bind(snapshotStore),
      getConfig: snapshotStore?.getConfig.bind(snapshotStore),
      getSnapshotStores: () => snapshotStore?.snapshotStores || new Map(),
      getItems: snapshotStore?.getItems.bind(snapshotStore),
      initializeDefaultConfigs: snapshotStore?.initializeDefaultConfigs.bind(snapshotStore),
      handleDelegate: snapshotStore?.handleDelegate.bind(snapshotStore),
      notifySuccess: snapshotStore?.notifySuccess.bind(snapshotStore),
      notifyFailure: snapshotStore?.notifyFailure.bind(snapshotStore),
      findSnapshotStoreById: snapshotStore?.findSnapshotStoreById.bind(snapshotStore),
      defaultSaveSnapshotStore: snapshotStore?.defaultSaveSnapshotStore.bind(snapshotStore),
      saveSnapshotStore: snapshotStore?.saveSnapshotStore.bind(snapshotStore),
      consolidateMetadata: snapshotStore?.consolidateMetadata.bind(snapshotStore),
      getFirstDelegate: snapshotStore?.getFirstDelegate.bind(snapshotStore),
      getInitialDelegate: snapshotStore?.getInitialDelegate.bind(snapshotStore),
      transformInitialState: snapshotStore?.transformInitialState.bind(snapshotStore),
      transformSnapshot: snapshotStore?.transformSnapshot.bind(snapshotStore),
      transformSnapshotStore: snapshotStore?.transformSnapshotStore.bind(snapshotStore),
      transformSnapshotMethod: snapshotStore?.transformSnapshotMethod.bind(snapshotStore),
      getName: snapshotStore?.getName.bind(snapshotStore),
      getVersion: snapshotStore?.getVersion.bind(snapshotStore),
      updateVersion: snapshotStore?.updateVersion.bind(snapshotStore),
      getSchema: snapshotStore?.getSchema.bind(snapshotStore),
      getSnapshotStoreConfig: snapshotStore?.getSnapshotStoreConfig.bind(snapshotStore),
      // Other properties
      defaultConfigs: snapshotStore?.defaultConfigs || {},
      callback: snapshotStore?.callback || (() => {}),
      storeProps: snapshotStore?.storeProps || {},
      endpointCategory: snapshotStore?.endpointCategory || 'default',
      findIndex: snapshotStore?.findIndex.bind(snapshotStore),
      splice: snapshotStore?.splice.bind(snapshotStore),

      criteria: {
        categoryCriteria: category,
        description: description || null,
        date: new Date(),
         filters: [], 
         sort: sort
      },

      handleSnapshot: async (
        id: string,
        snapshotId: string | number | null,
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
        snapshotData: T,
        category: Category,
        categoryProperties: CategoryProperties | undefined,
        callback: (snapshotData: T) => void,
        snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        type: string,
        event: SnapshotEvents<T, K>,
        snapshotContainer?: T,
        snapshotStoreConfig?: SnapshotStoreConfig<T, K> | null
      ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
        try {
          // Validate required parameters
          if (!snapshotId) {
            throw new Error('Snapshot ID is required');
          }
      
          // Handle different operation types
          switch (type) {
            case 'create': {
              if (snapshot) {
                console.warn('Snapshot already exists, returning existing');
                return snapshot;
              }
      
              // Create new snapshot with metadata
              const newSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
                id: String(snapshotId),
                data: snapshotData,
                category,
                properties: categoryProperties || {},
                metadata: {} as Meta,
                createdAt: new Date(),
                updatedAt: new Date(),
                version: '1.0.0',
                // Include any other required snapshot properties
                getSnapshotItems: () => [],
                validate: () => true,
                // ... other snapshot methods
              };
      
              // Add to snapshots collection
              snapshots.push(newSnapshot);
              
              // Execute callback with new data
              callback(snapshotData);
              
              // Handle snapshot container if provided
              if (snapshotContainer) {
                await this.handleSnapshotContainer(
                  newSnapshot,
                  snapshotContainer,
                  snapshotStoreConfig
                );
              }
      
              return newSnapshot;
            }
      
            case 'update': {
              if (!snapshot) {
                throw new Error('Cannot update non-existent snapshot');
              }
      
              // Merge existing data with updates
              const updatedData = {
                ...snapshot.data,
                ...snapshotData
              };
      
              // Update snapshot properties
              const updatedSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
                ...snapshot,
                data: updatedData,
                properties: {
                  ...snapshot.properties,
                  ...categoryProperties
                },
                updatedAt: new Date()
              };
      
              // Update in snapshots array
              const index = snapshots.findIndex(s => s.id === snapshotId);
              if (index > -1) {
                snapshots[index] = updatedSnapshot;
              }
      
              callback(updatedData);
      
              // Handle container update if needed
              if (snapshotContainer) {
                await this.handleSnapshotContainer(
                  updatedSnapshot,
                  snapshotContainer,
                  snapshotStoreConfig
                );
              }
      
              return updatedSnapshot;
            }
      
            case 'delete': {
              if (!snapshot) {
                console.warn('Snapshot not found for deletion');
                return null;
              }
      
              // Remove from snapshots array
              const index = snapshots.findIndex(s => s.id === snapshotId);
              if (index > -1) {
                snapshots.splice(index, 1);
              }
      
              // Execute any cleanup in container
              if (snapshotContainer) {
                await this.cleanupSnapshotContainer(
                  snapshotId,
                  snapshotContainer,
                  snapshotStoreConfig
                );
              }
      
              callback(snapshotData);
              return null;
            }
      
            case 'event': {
              if (!snapshot) {
                throw new Error('Cannot process event for non-existent snapshot');
              }
      
              // Handle specific event types
              switch (event?.type) {
                case 'snapshotUpdated':
                  // Custom update logic for event
                  return this.handleEventUpdate(
                    snapshot,
                    event,
                    snapshots,
                    callback
                  );
      
                case 'metadataChanged':
                  return this.handleMetadataChange(
                    snapshot,
                    event.metadata,
                    callback
                  );
      
                default:
                  // Default event handling
                  return snapshot;
              }
            }
      
            default:
              throw new Error(`Unsupported operation type: ${type}`);
          }
        } catch (error) {
          console.error('Error handling snapshot:', error);
          
          // Execute error callback if available
          if (typeof callback === 'function') {
            try {
              callback(snapshotData);
            } catch (callbackError) {
              console.error('Error in snapshot callback:', callbackError);
            }
          }
          
          throw error; // Re-throw for upstream handling
        }
      },
      
      
    };

    return criteriaSnapshot;
  }

  return null;
}


function isSnapshotOfType <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  typeCheck: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => snapshot is Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): snapshot is Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Add validation logic here to ensure snapshot is of type Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  return typeCheck(snapshot);
}


function findCorrectSnapshotStore(
  snapshot: Snapshot<BaseData, BaseData>,
  snapshotStores: SnapshotStore<BaseData, BaseData>[]
): SnapshotStore<BaseData, BaseData> | undefined {
  return snapshotStores.find((store) => store.category === snapshot.category);
}


// Type guard to check if data is SnapshotWithCriteria<T, BaseData>
function isSnapshotWithCriteria <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  data: any
): data is SnapshotWithCriteria<T, BaseData> {
  return (
    data &&
    typeof data === "object" &&
    "timestamp" in data &&
    "criteria" in data
  );
}



function isSnapshotStoreConfig<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  item: any
): item is SnapshotStoreConfig<T, K>[] {
  return (
    Array.isArray(item) &&
    item.every(
      (config) => config && typeof config === "object" && "snapshotId" in config
    )
  );
}


export const addToSnapshotList = async  <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
  >(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> => {
  console.log("Snapshot added to snapshot list: ", snapshot);
  if (!storeProps) {
    throw new Error("Snapshot properties not available")
  }
  const snapshotStore = await useSnapshotStore(addToSnapshotList, storeProps);

  const subscriptionData: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = snapshot.data
    ? {
        name: snapshot.name ? snapshot.name : undefined,
        subscribers: [],
        getSubscriptionLevel: getSubscriptionLevel,
        unsubscribe: (): void => {},
        portfolioUpdates: (): void => {},
        tradeExecutions: (): void => {},
        marketUpdates: (): void => {},
        triggerIncentives: (): void => {},
        communityEngagement: (): void => {},
        determineCategory: (
          data: string | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined
        ): string | CategoryProperties => {
          // Adjusted return type
          if (data === undefined || data === null) {
            return ""; // Provide a default or handle appropriately
          }
          if (typeof data === "string") {
            return data;
          }
          // Ensure snapshotStore.determineCategory returns CategoryProperties
          return snapshotStore.determineCategory(data)
        },
        portfolioUpdatesLastUpdated: {} as ModifiedDate,
        ...snapshot.data,
      }
    : null;

  return subscriptionData;
};



export const getSnapshotsBySubscriber = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  storeProps?: SnapshotStoreProps<T, K>
): Promise<T[]> => {
  if (!storeProps) {
    throw new Error("Snapshot properties not available");
  }

  const snapshotStore = await useSnapshotStore(getSnapshotsBySubscriber, storeProps);

  if (!snapshotStore) {
    throw new Error("Failed to retrieve the snapshot store");
  }

  const { 
    storeId,
    snapshotId,
    snapshotData,
    timestamp,
    type,
    event,
    id,
    category,
    categoryProperties,
    dataStoreMethods,
    data
  } = storeProps;

  // Filter snapshots in the store by the given subscriber
  const snapshots = snapshotStore.getAllSnapshots(
    storeId,
    snapshotId,
    snapshotData,
    timestamp,
    type,
    event,
    id,
    snapshotStore,
    category,
    categoryProperties,
    dataStoreMethods,
    data
  ).filter(snapshot => {
    if (!snapshot?.subscribers) return false;
    
    // Handle both array and Set subscribers
    if (Array.isArray(snapshot.subscribers)) {
      return snapshot.subscribers.some(sub => sub.id === subscriber.id);
    }
    if (snapshot.subscribers instanceof Set) {
      return Array.from(snapshot.subscribers).some(sub => sub.id === subscriber.id);
    }
    return false;
  });

  return snapshots.map(snapshot => snapshot.data as T);
};


export const addSnapshotHandler = (
  snapshot: Snapshot<Data, Data>,
  subscribers: (snapshot: Snapshot<Data, Data>) => void,
  delegate: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, BaseData>[]
) => {
  if (delegate && delegate.length > 0) {
    delegate.forEach((config) => {
      if (typeof config.setSnapshots === "function") {
        const currentSnapshots: SnapshotUnion<
          SnapshotWithCriteria<any, BaseData>
        >[] = config.snapshots
          ? config.snapshots.filter(isSnapshotStoreCoreData)
          : [];

        if (isSnapshotStoreCoreData(snapshot)) {
          // Ensure that the snapshot is of the correct type before adding
          const convertedSnapshot = convertToSnapshotWithCriteria(snapshot);
          if (convertedSnapshot) {
            config.setSnapshots([...currentSnapshots, convertedSnapshot]);
          } else {
            console.error(
              "Failed to convert snapshot to SnapshotWithCriteria",
              snapshot
            );
          }
        } else {
          console.error(
            "Snapshot is not of type SnapshotStore<BaseData>",
            snapshot
          );
        }
      }
    });
  } else {
    console.error("Delegate array is empty or not provided");
  }
};


function isSnapshotDataType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  data: any
): data is SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  {
  // Check if the data is a Map
  if (data instanceof Map) {
    // Verify the structure of each entry in the Map
    for (const [key, value] of data.entries()) {
      if (!isSnapshot(value)) { // Assuming you have an isSnapshot function to check Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        return false; // Entry does not match Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      }
    }
    return true; // All entries are valid Snapshots
  }

  // Check if data is an object with the required properties for SnapshotDataType
  if (data && typeof data === 'object') {
    return 'structuredMetadata' in data || 'keys' in data;
  }

  return false; // Not a valid SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
}

function isSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  obj: any
): obj is Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  if (obj == null || typeof obj !== "object") {
    return false;
  }

  // Required core properties
  const hasRequiredProperties = 
    typeof obj.id === "string" &&
    "data" in obj &&
    "deleted" in obj &&
    "initializedState" in obj;

  if (!hasRequiredProperties) {
    return false;
  }

  // Check data type
  const hasCorrectDataStructure = obj.data instanceof Map;

  // Check for common snapshot properties
  const hasCommonProperties = 
    'type' in obj &&
    'timestamp' in obj &&
    'state' in obj &&
    'dataObject' in obj &&
    'isCore' in obj;

  // Check for methods (optional but good practice)
  const hasMethods = 
    typeof obj.getSnapshotItems === "function" &&
    typeof obj.validate === "function";

  return hasCorrectDataStructure && hasCommonProperties && hasMethods;
}

function isSnapshotData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(data: any): data is SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  if (!data || typeof data !== 'object') {
    return false;
  }
  // Check required methods
  const hasRequiredMethods = 
    typeof data.validate === 'function' &&
    typeof data.serialize === 'function' &&
    typeof data.get === 'function' &&
    typeof data.set === 'function';

  // Check required properties
  const hasRequiredProperties = 
    'storeId' in data &&
    'config' in data &&
    'timestamp' in data;

  return hasRequiredMethods && hasRequiredProperties;
}

const isArrayOfTypeT = <T extends  BaseDataEntity>(array: any[]): array is T[] => {
  return array.every(item => {
    // Add your type-checking logic here. For example:
    return typeof item === 'object' && item !== null && 'category' in item; // Adjust accordingly
  });
};

// Type guard to check if a given callback is a SubscriberCallback
function isSubscriberCallback<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  callback: SubscriberCallbackType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): callback is SubscriberCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return (
    (callback as SubscriberCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>).handleCallback !== undefined &&
    (callback as SubscriberCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>).snapshotCallback !== undefined
  );
}


type BaseType<T> = T extends BaseData<infer U> ? U : never;


function castToSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
  return snapshot as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
}

function isSnapshotContainer<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  data: any
): data is SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return data && typeof data.category !== "undefined" && typeof data.data !== "undefined";
}



function isBaseData<T extends BaseDataRoot>(data: any): data is BaseData<T> {
  return data && typeof data.id === "string" && typeof data.category === "string";
}


// Default values for props
const defaultCategory: Category = {
  id: 'default-category',
  name: 'Default Category',
  description: 'Default category description',
  type: 'default',
  properties: {}
};

const defaultSnapshotConfig: SnapshotConfig<any, any> = {
  storeConfig: {
    storeId: 'default-store',
    name: 'Default Store',
    version: '1.0.0'
  },
  additionalData: {},
  autoSync: true,
  validationRules: []
};

const defaultSnapshotEvent: SnapshotEvent<any, any> = {
  type: 'snapshotCreated',
  metadata: { timestamp: new Date().toISOString() }
};

const defaultSnapshotValue: Snapshot<any, any> = {
  id: 'default-snapshot',
  data: new Map(),
  category: defaultCategory,
  properties: {},
  metadata: {} as any,
  createdAt: new Date(),
  updatedAt: new Date(),
  version: '1.0.0',
  getSnapshotItems: () => [],
  validate: () => true
};

// Get values from hooks and context
const notification = useNotification();
const snapshotIdValue = useSecureSnapshotId();

type SnapshotEvent<T extends BaseDataEntity = BaseDataRoot, K extends T = T> = SnapshotEvents<T, K>;

// Get current values from context or state
const categoryValue: Category | undefined = defaultCategory; // Replace with actual category from your state/context
const snapshotValue: Snapshot<any, any> = defaultSnapshotValue; // Replace with actual snapshot
const typeValue = 'snapshotOperation'; // Replace with actual type
const eventValue: SnapshotEvent<any, any> = defaultSnapshotEvent; // Replace with actual event
const snapshotConfigValue: SnapshotConfig<any, any> = defaultSnapshotConfig; // Replace with actual config
 
// Get current snapshot from store or context
const currentSnapshot = snapshotValue; // Replace with actual current snapshot

// Helper functions to get actual values
function getCategoryValue(): Category | undefined {
  // Implement logic to get current category from your application state
  return categoryValue;
}

function getSnapshotValue(): Snapshot<any, any> {
  // Implement logic to get current snapshot from your application state
  return snapshotValue;
}

function getTypeValue(): string {
  // Implement logic to get operation type
  return typeValue;
}

function getEventValue(): SnapshotEvents<any, any> {
  // Implement logic to get current event
  return eventValue;
}

function getSnapshotConfigValue(): SnapshotConfig<any, any> {
  // Implement logic to get snapshot config
  return snapshotConfigValue;
}

export const generateSnapshotId = UniqueIDGenerator.generateSnapshotID();
export const notify = useNotification();
export const snapshotId = useSecureSnapshotId()
export const storeId = useSecureStoreId()


export const category = snapshotApi.getSnapshotsAndCategory(
  getCategoryValue(),          // Category | undefined
  snapshotIdValue,             // string
  storeId,                // number (added missing parameter)
  getSnapshotValue(),          // Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  getTypeValue(),              // string
  getEventValue(),             // SnapshotEvent<T, K>
  getSnapshotConfigValue(),    // SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  additionalHeaders      // Record<string, string> (optional)
);

export const snapshot = snapshotApi.getSnapshot(
  String(snapshotId), 
  Number(storeId), 
  currentSnapshot, // You need to provide the snapshot object
  "your-type-here", // You need to provide the type string
  snapshotEvent, // You need to provide the SnapshotEvent
  snapshotConfig, // You need to provide the SnapshotConfig
  additionalHeaders // This is optional
);

export {
    castToSnapshot, convertToSnapshotArray, findCorrectSnapshotStore,
    isArrayOfTypeT, isBaseData, isHydrateResult, isSnapshot,
    isSnapshotConfig, isSnapshotContainer, isSnapshotData,
    isSnapshotDataType, isSnapshotOfType, isSnapshotStoreConfig,
    isSnapshotStoreCoreData, isSnapshotUnionBaseData,
    isSnapshotWithCriteria, isSubscriberCallback
};

export const snapshots = snapshotApi.getSnapshots(category)