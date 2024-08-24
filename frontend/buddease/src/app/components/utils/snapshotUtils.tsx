// snapshotUtils.tsx
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { ModifiedDate } from "../documents/DocType";
import { BaseData, Data } from "../models/data/Data";
import { Snapshot, SnapshotStoreObject, SnapshotUnion } from "../snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "../snapshots/SnapshotStore";
import { useSnapshotStore } from "../snapshots/useSnapshotStore";
import { Subscription } from "../subscriptions/Subscription";
import { useNotification } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { SnapshotStoreConfig } from "../snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from "../snapshots";
 


function isHydrateResult<T>(result: any): result is IHydrateResult<T> {
  return (result as IHydrateResult<T>).then !== undefined;
}

// Type guard function to check if a snapshot is a SnapshotStoreObject<BaseData, any>
const isSnapshotStoreBaseData = (snapshot: any): snapshot is SnapshotStoreObject<BaseData, any> => {
  // Ensure snapshot is an object and has at least one key
  if (typeof snapshot === 'object' && snapshot !== null) {
    const keys = Object.keys(snapshot);
    // Check if the object has at least one property and each property value is a SnapshotUnion<BaseData>
    return keys.length > 0 && keys.every(key => {
      const value = snapshot[key];
      // Check if the value is a valid SnapshotUnion<BaseData>
      return isSnapshotUnionBaseData(value);
    });
  }
  return false;
};

// Type guard function to check if a value is a SnapshotUnion<BaseData>
const isSnapshotUnionBaseData = (value: any): value is SnapshotUnion<BaseData> => {
  return isSnapshotBaseData(value) || isSnapshotWithCriteriaBaseData(value);
};

// Implement the logic to verify SnapshotBaseData
const isSnapshotBaseData = (value: any): value is Snapshot<BaseData, any> => {
  // Implement checks for properties that are specific to Snapshot<BaseData, any>
  return value && typeof value.snapshot === 'function' && typeof value.setCategory === 'function';
};

// Implement the logic to verify SnapshotWithCriteriaBaseData
const isSnapshotWithCriteriaBaseData = (value: any): value is SnapshotWithCriteria<BaseData, BaseData> => {
  // Implement checks for properties that are specific to SnapshotWithCriteria<BaseData, BaseData>
  return value && typeof value.snapshot === 'function' && typeof value.setCategory === 'function' && value.hasOwnProperty('criteria');
};



function convertToSnapshotWithCriteria(
  snapshot: Snapshot<Data, Data>
): SnapshotWithCriteria<any, BaseData> | null {
  const { id, snapshotData, category, categoryProperties, dataStoreMethods } = snapshot;

  // Use category as the criteria for conversion
  if (category) {
    const criteriaSnapshot: SnapshotWithCriteria<any, BaseData> = {
      ...snapshot, // Spread the existing snapshot properties
      criteria: {
        categoryCriteria: category, // Use category as a specific field in the criteria
        // Add more criteria fields if needed
      },
      // Modify or extend other properties if necessary
    };

    return criteriaSnapshot;
  }

  // If category is undefined or does not meet criteria, return null
  return null;
}






function isSnapshotOfType<T extends Data, K extends Data>(
  snapshot: Snapshot<any, any>
): snapshot is Snapshot<T, K> {
  // Perform checks here if necessary, or assume it is correct
  return true;
}

function findCorrectSnapshotStore(
  snapshot: Snapshot<BaseData, BaseData>,
  snapshotStores: SnapshotStore<BaseData, BaseData>[]
): SnapshotStore<BaseData, BaseData> | undefined {
  return snapshotStores.find(store => store.category === snapshot.category);
}

function isSnapshot<T extends BaseData, K extends BaseData>(
  obj: any
): obj is Snapshot<T, K> {
  return obj && typeof obj.id === "string" && obj.data instanceof Map;
}

// Type guard to check if data is SnapshotWithCriteria<T, BaseData>
function isSnapshotWithCriteria<T extends BaseData, K extends BaseData>(
  data: any
): data is SnapshotWithCriteria<T, BaseData> {
  return data && typeof data === 'object' && 'timestamp' in data && 'criteria' in data;
}




// Type guard function to check if item is SnapshotStoreConfig
function isSnapshotStoreConfig<T extends Data, K extends Data>(
  item: any
): item is SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[] {
  return Array.isArray(item) && item.every(config => config && typeof config === "object" && "snapshotId" in config);
}


export const addToSnapshotList = async <T extends BaseData, K extends BaseData>(
    snapshot: Snapshot<T, K>,
    subscribers: Subscriber<T, K>[]
): Promise<Subscription<T, K> | null> => {
    console.log("Snapshot added to snapshot list: ", snapshot);

    const snapshotStore = await useSnapshotStore(addToSnapshotList);

    const subscriptionData: Subscription<T, K> | null = snapshot.data
      ? {
          unsubscribe: (): void => {},
          portfolioUpdates: (): void => {},
          tradeExecutions: (): void => {},
          marketUpdates: (): void => {},
          triggerIncentives: (): void => {},
          communityEngagement: (): void => {},
          determineCategory: (
            data: string | Snapshot<T, K> | null | undefined
          ): string | Snapshot<Data, any> | null | undefined => {
            if (data === undefined || data === null) {
              return undefined;
            }
            if (typeof data === 'string') {
              return data;
            }
            return snapshotStore.determineCategory(data);
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
        const currentSnapshots: SnapshotUnion<SnapshotWithCriteria<any, BaseData>>[] = config.snapshots
          ? config.snapshots.filter(isSnapshotStoreBaseData)
          : [];

        if (isSnapshotStoreBaseData(snapshot)) {
          // Ensure that the snapshot is of the correct type before adding
          const convertedSnapshot = convertToSnapshotWithCriteria(snapshot);
          if (convertedSnapshot) {
            config.setSnapshots([...currentSnapshots, convertedSnapshot]);
          } else {
            console.error("Failed to convert snapshot to SnapshotWithCriteria", snapshot);
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




  
export { isSnapshot, isSnapshotStoreBaseData, isSnapshotStoreConfig, findCorrectSnapshotStore , isSnapshotWithCriteria, isSnapshotOfType, isHydrateResult};
export const generateSnapshotId = UniqueIDGenerator.generateSnapshotID();
export const notify = useNotification();
