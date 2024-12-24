// snapshotUtils.tsx
import { SnapshotEvents } from '@/app/components/snapshots/SnapshotEvents';
import * as snapshotApi from '@/app/api/SnapshotApi';
import { additionalHeaders } from '@/app/api/headers/generateAllHeaders';
import { SnapshotContainer, SnapshotData } from '@/app/components/snapshots';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { getSubscriptionLevel } from "../subscriptions/SubscriptionLevel";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { IHydrateResult } from "mobx-persist";
import { ModifiedDate } from "../documents/DocType";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { Meta } from '../models/data/dataStoreMethods';
import { SnapshotConfig, SnapshotDataType, SnapshotWithCriteria } from "../snapshots";
import {
    Snapshot,
    Snapshots,
    SnapshotsArray,
    SnapshotStoreObject,
    SnapshotUnion,
} from "../snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "../snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "../snapshots/SnapshotStoreConfig";
import { SnapshotStoreProps, useSnapshotStore } from "../snapshots/useSnapshotStore";
import { Subscription } from "../subscriptions/Subscription";
import { useNotification } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import useSecureSnapshotId from './useSecureSnapshotId';

function isHydrateResult<T>(result: any): result is IHydrateResult<T> {
  return (result as IHydrateResult<T>).then !== undefined;
}

function isSnapshotConfig<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(config: any): config is SnapshotConfig<T, K> {
  return config && 'storeConfig' in config && 'additionalData' in config;
}

// Type guard function to check if a snapshot is a SnapshotStoreObject<BaseData, any>
const isSnapshotStoreCoreData = (
  snapshot: any
): snapshot is SnapshotStoreObject<BaseData, any> => {
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
const isSnapshotUnionBaseData = <T extends BaseData<any>, K extends T = T>(
  value: any
): value is SnapshotUnion<BaseData, Meta<T, K>> => {
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
const isSnapshotWithCriteriaBaseData = (
  value: any
): value is SnapshotWithCriteria<BaseData, BaseData> => {
  // Implement checks for properties that are specific to SnapshotWithCriteria<BaseData, BaseData>
  return (
    value &&
    typeof value.snapshot === "function" &&
    typeof value.setCategory === "function" &&
    value.hasOwnProperty("criteria")
  );
};

// Example conversion function
function convertToSnapshotArray<T extends BaseData, K extends T = T>(
  data: Snapshots<T, K>
): SnapshotsArray<T, K> {
  // Implement conversion logic here
  return Array.isArray(data) ? data : Object.values(data);
}

function convertToSnapshotWithCriteria <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K>
): SnapshotWithCriteria<T, K> | null {
  const { id, snapshotData, category, description, categoryProperties, dataStoreMethods } = snapshot;
 

  function isOfType<T>(obj: any): obj is T {
    // Custom logic to check if `obj` fits type `T`
    return obj && typeof obj.id === 'string' && typeof obj.type === 'string';
  }

  if (category) {
    const criteriaSnapshot: SnapshotWithCriteria<T, K> = {
      ...snapshot,
      get, #snapshotStores, initializeOptions, setConfig,
      autoSyncData, ensureDelegate, getConfig,
      getSnapshotStores, getItems, initializeStores, 
      initializeDefaultConfigs, handleDelegate, notifySuccess,
      notifyFailure, findSnapshotStoreById, defaultSaveSnapshotStore, 
      saveSnapshotStore, _saveSnapshotStores, consolidateMetadata,
      _saveSnapshotStore, defaultSaveSnapshotStores, safeCastSnapshotStore,
      getFirstDelegate, getInitialDelegate, transformInitialState, 
      transformSnapshot, transformMappedSnapshotData, transformSnapshotStore,
      transformSnapshotMethod, getName, getVersion, 
      updateVersion, getSchema, getSnapshotStoreConfig, 
      defaultConfigs, callback, storeProps, endpointCategory, findIndex, splice,
      


      criteria: {
        categoryCriteria: category,
        description: description || null,
        date: new Date()
      },

      handleSnapshot: (
        id: string,
        snapshotId: string | number | null,
        snapshot: Snapshot<T, K> | null,
        snapshotData: T,
        category: Category,
        categoryProperties: CategoryProperties | undefined,
        callback: (snapshotData: T) => void,
        snapshots: SnapshotsArray<T, K>,
        type: string,
        event: SnapshotEvents<T, K>,
        snapshotContainer?: T,
        snapshotStoreConfig?: SnapshotStoreConfig<T, any> | null
      ): Promise<Snapshot<T, K> | null> => {
        // Step 1: Check if snapshot already exists
        if (!snapshot) {
          // If there's no snapshot, create one if the type suggests a creation action
          if (type === 'create') {
            const newSnapshot: Snapshot<T, K> = {
              id: snapshotId,
              data: snapshotData,
              category: category,
              properties: categoryProperties || {},
              storeConfig: undefined 
              // Add other necessary properties/methods for the snapshot
            } as Snapshot<T, K>;
      
            // Call the callback with the new snapshot data
            callback(snapshotData);
      
            // Add the new snapshot to the snapshots array
            snapshots.push(newSnapshot);  
           
            return new Promise((resolve) => resolve(newSnapshot));
          } else {
            // If no snapshot exists and the type is not 'create', return null
            return new Promise((resolve) => resolve(null));
          }
        } else {
          // Step 2: Update or handle the snapshot if it exists
      
          // Handle updates based on the type of event or action
          switch (type) {
            case 'update':
              // Update snapshot data if needed
              snapshot.data = { ...snapshot.data, ...snapshotData };
      
              // Update category properties if provided
              if (categoryProperties) {
                const merged = { ...snapshot.properties, ...categoryProperties };
                if (isOfType<T>(merged)) {
                  snapshot.properties = merged;
                }
              }
      
              // Call the callback with updated snapshot data
              callback(snapshot.data as T);
      
              // If a snapshot container is provided, update or associate the snapshot with it
              if (snapshotContainer) {
                // Handle the snapshot container logic (e.g., associating snapshots)
                // For example, add the snapshot to the container's list of snapshots
              }
      
              return new Promise((resolve) => resolve(snapshot));
      
            case 'delete':
              // Find the snapshot in the snapshots array and remove it
              const snapshotIndex = snapshots.findIndex(s => s.id === snapshotId);
              if (snapshotIndex > -1) {
                snapshots.splice(snapshotIndex, 1);
              }
      
              // Optionally trigger other delete actions here
              return new Promise((resolve) => resolve(null));
      
            case 'event':
              // If an event is provided, handle it (e.g., triggering custom snapshot logic)
              if (event) {
                // Implement event-based logic for snapshots (if necessary)
                // For example, categorize the snapshot or trigger a custom action
              }
      
              return new Promise((resolve) => resolve(snapshot));
      
            default:
              return new Promise((resolve) => resolve(snapshot));
          }
        }
      }      
    };

    return criteriaSnapshot;
  }

  return null;
}


function isSnapshotOfType <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K>,
  typeCheck: (snapshot: Snapshot<T, K>) => snapshot is Snapshot<T, K>
): snapshot is Snapshot<T, K> {
  // Add validation logic here to ensure snapshot is of type Snapshot<T, K>
  return typeCheck(snapshot);
}


function findCorrectSnapshotStore(
  snapshot: Snapshot<BaseData, BaseData>,
  snapshotStores: SnapshotStore<BaseData, BaseData>[]
): SnapshotStore<BaseData, BaseData> | undefined {
  return snapshotStores.find((store) => store.category === snapshot.category);
}


// Type guard to check if data is SnapshotWithCriteria<T, BaseData>
function isSnapshotWithCriteria <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  data: any
): data is SnapshotWithCriteria<T, BaseData> {
  return (
    data &&
    typeof data === "object" &&
    "timestamp" in data &&
    "criteria" in data
  );
}



function isSnapshotStoreConfig<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  item: any
): item is SnapshotStoreConfig<T, K>[] {
  return (
    Array.isArray(item) &&
    item.every(
      (config) => config && typeof config === "object" && "snapshotId" in config
    )
  );
}


export const addToSnapshotList = async  <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K>,
  subscribers: Subscriber<T, K>[],
  storeProps?: SnapshotStoreProps<T, K>
): Promise<Subscription<T, K> | null> => {
  console.log("Snapshot added to snapshot list: ", snapshot);
  if (!storeProps) {
    throw new Error("Snapshot properties not available")
  }
  const snapshotStore = await useSnapshotStore(addToSnapshotList, storeProps);

  const subscriptionData: Subscription<T, K> | null = snapshot.data
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
          data: string | Snapshot<T, K> | null | undefined
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
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
>(
  subscriber: Snapshot<T, K, Meta, ExcludedFields>,
  storeProps?: SnapshotStoreProps<T, K>
): Promise<BaseData[]> => {
  if (!storeProps) {
    throw new Error("Snapshot properties not available");
  }

  const snapshotStore = await useSnapshotStore(getSnapshotsBySubscriber, storeProps);

  if (!snapshotStore) {
    throw new Error("Failed to retrieve the snapshot store");
  }


  const {     storeId,
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
    data,} = storeProps
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
    data,
  ).filter(snapshot => {
    if (snapshot && snapshot.subscribers && Array.isArray(snapshot.subscribers)) {
      return snapshot.subscribers.includes(subscriber);
    }
    return false;
  });

  return snapshots.map(snapshot => snapshot.data);
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


function isSnapshotDataType<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  data: any
): data is SnapshotDataType<T, K> {
  // Check if the data is a Map
  if (data instanceof Map) {
    // Verify the structure of each entry in the Map
    for (const [key, value] of data.entries()) {
      if (!isSnapshot(value)) { // Assuming you have an isSnapshot function to check Snapshot<T, K>
        return false; // Entry does not match Snapshot<T, K>
      }
    }
    return true; // All entries are valid Snapshots
  }

  // Check if data is an object with the required properties for SnapshotDataType
  if (data && typeof data === 'object') {
    return 'structuredMetadata' in data || 'keys' in data;
  }

  return false; // Not a valid SnapshotDataType<T, K>
}



function isSnapshot<T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  obj: any
): obj is Snapshot<T, K, Meta> {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    obj.data instanceof Map &&
    'type' in obj &&
    'timestamp' in obj &&
    'state' in obj &&
    'dataObject' in obj
  );
}



function isSnapshotData<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(data: any): data is SnapshotData<T, K> {
  return data && typeof data === 'object' && 'storeId' in data && 'config' in data && (data as SnapshotData<T, K>).storeId !== undefined;
}

const isArrayOfTypeT = <T extends  BaseData<any>>(array: any[]): array is T[] => {
  return array.every(item => {
    // Add your type-checking logic here. For example:
    return typeof item === 'object' && item !== null && 'category' in item; // Adjust accordingly
  });
};

// Type guard to check if a given callback is a SubscriberCallback
function isSubscriberCallback<T extends  BaseData<any>, K extends T>(
  callback: SubscriberCallbackType<T, K>
): callback is SubscriberCallback<T, K> {
  return (
    (callback as SubscriberCallback<T, K>).handleCallback !== undefined &&
    (callback as SubscriberCallback<T, K>).snapshotCallback !== undefined
  );
}


type BaseType<T> = T extends BaseData<infer U> ? U : never;


function castToSnapshot<T extends BaseData<any>, K extends BaseType<T> = BaseType<T>>(
  snapshot: SnapshotUnion<T, K> | null
): Snapshot<T, K> | null {
  return snapshot as Snapshot<T, K> | null;
}


function isSnapshotContainer<T extends  BaseData<any>, K extends T>(
  data: any
): data is SnapshotContainer<T, K> {
  return data && typeof data.category !== "undefined" && typeof data.data !== "undefined";
}



function isBaseData<T>(data: any): data is BaseData<T> {
  return data && typeof data.id === "string" && typeof data.category === "string";
}


export {
    castToSnapshot, convertToSnapshotArray, findCorrectSnapshotStore, isArrayOfTypeT, isBaseData, isHydrateResult, isSnapshot, isSnapshotConfig, isSnapshotContainer, isSnapshotData, isSnapshotDataType, isSnapshotOfType, isSnapshotStoreConfig, isSnapshotStoreCoreData, isSnapshotUnionBaseData, isSnapshotWithCriteria, isSubscriberCallback
};

export const generateSnapshotId = UniqueIDGenerator.generateSnapshotID();
export const notify = useNotification();
export const snapshotId = useSecureSnapshotId()
export const storeId = useSecureStoreId()
export const category = snapshotApi.getSnapshotCategory()
export const snapshot = snapshotApi.getSnapshot(String(snapshotId), Number(storeId), additionalHeaders);
export const snapshots = snapshotApi.getSnapshots(category)