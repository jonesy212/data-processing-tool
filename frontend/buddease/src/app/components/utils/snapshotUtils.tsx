// snapshotUtils.tsx
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { ModifiedDate } from "../documents/DocType";
import { BaseData, Data } from "../models/data/Data";
import {
  Snapshot,
  Snapshots,
  SnapshotsArray,
  SnapshotStoreObject,
  SnapshotUnion,
} from "../snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "../snapshots/SnapshotStore";
import { SnapshotStoreProps, useSnapshotStore } from "../snapshots/useSnapshotStore";
import { Subscription } from "../subscriptions/Subscription";
import { useNotification } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { SnapshotStoreConfig } from "../snapshots/SnapshotStoreConfig";
import { SnapshotConfig, SnapshotWithCriteria } from "../snapshots";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { IHydrateResult } from "mobx-persist";
import { Category } from "../libraries/categories/generateCategoryProperties";

function isHydrateResult<T>(result: any): result is IHydrateResult<T> {
  return (result as IHydrateResult<T>).then !== undefined;
}

function isSnapshotConfig<T extends Data, K extends Data>(config: any): config is SnapshotConfig<T, K> {
  return config && 'storeConfig' in config && 'additionalData' in config;
}

// Type guard function to check if a snapshot is a SnapshotStoreObject<BaseData, any>
const isSnapshotStoreBaseData = (
  snapshot: any
): snapshot is SnapshotStoreObject<BaseData, any> => {
  // Ensure snapshot is an object and has at least one key
  if (typeof snapshot === "object" && snapshot !== null) {
    const keys = Object.keys(snapshot);
    // Check if the object has at least one property and each property value is a SnapshotUnion<BaseData>
    return (
      keys.length > 0 &&
      keys.every((key) => {
        const value = snapshot[key];
        // Check if the value is a valid SnapshotUnion<BaseData>
        return isSnapshotUnionBaseData(value);
      })
    );
  }
  return false;
};

// Type guard function to check if a value is a SnapshotUnion<BaseData>
const isSnapshotUnionBaseData = (
  value: any
): value is SnapshotUnion<BaseData> => {
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
function convertToSnapshotArray<T extends BaseData>(
  data: Snapshots<T>
): SnapshotsArray<T> {
  // Implement conversion logic here
  return Array.isArray(data) ? data : Object.values(data);
}

function convertToSnapshotWithCriteria<T extends Data, K extends BaseData>(
  snapshot: Snapshot<T, K>
): SnapshotWithCriteria<T, K> | null {
  const { id, snapshotData, category, description, categoryProperties, dataStoreMethods } = snapshot;

  if (category) {
    const criteriaSnapshot: SnapshotWithCriteria<T, K> = {
      ...snapshot,
      criteria: {
        categoryCriteria: category,
        description: description || null
      },
      handleSnapshot: (
        id: string,
        snapshotId: string | number,
        snapshot: Snapshot<T, K> | null,
        snapshotData: T,
        category: Category,
        categoryProperties: CategoryProperties | undefined,
        callback: (snapshotData: T) => void,
        snapshots: SnapshotsArray<T>,
        type: string,
        event: Event,
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
            snapshots.push(newSnapshot as unknown as Snapshot<T, BaseData>);  
           
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
                snapshot.properties = { ...snapshot.properties, ...categoryProperties };
              }
      
              // Call the callback with updated snapshot data
              callback(snapshot.data);
      
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
function isSnapshotOfType<T extends Data, K extends BaseData>(
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
function isSnapshotWithCriteria<T extends BaseData, K extends BaseData>(
  data: any
): data is SnapshotWithCriteria<T, BaseData> {
  return (
    data &&
    typeof data === "object" &&
    "timestamp" in data &&
    "criteria" in data
  );
}



function isSnapshotStoreConfig<T extends Data, K extends Data>(
  item: any
): item is SnapshotStoreConfig<T, K>[] {
  return (
    Array.isArray(item) &&
    item.every(
      (config) => config && typeof config === "object" && "snapshotId" in config
    )
  );
}


export const addToSnapshotList = async <T extends BaseData, K extends BaseData>(
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
          ? config.snapshots.filter(isSnapshotStoreBaseData)
          : [];

        if (isSnapshotStoreBaseData(snapshot)) {
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

export {
  isSnapshotStoreBaseData,
  isSnapshotStoreConfig,
  findCorrectSnapshotStore,
  convertToSnapshotArray,
  isSnapshotWithCriteria,
  isSnapshotOfType,
  isHydrateResult,
  isSnapshotConfig,
  isSnapshotUnionBaseData
};
export const generateSnapshotId = UniqueIDGenerator.generateSnapshotID();
export const notify = useNotification();
