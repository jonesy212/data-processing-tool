// snapshotUtils.tsx
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { ModifiedDate } from "../documents/DocType";
import { BaseData } from "../models/data/Data";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "../snapshots/SnapshotStore";
import { useSnapshotStore } from "../snapshots/useSnapshotStore";
import { Subscription } from "../subscriptions/Subscription";
import { useNotification } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { SnapshotStoreConfig } from "../snapshots/SnapshotConfig";

function isSnapshotStoreBaseData(
  snapshot: any
): snapshot is SnapshotStore<BaseData> {
  return snapshot && typeof snapshot.setSnapshots === "function";
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

export const  addToSnapshotList = async <T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>,
  subscribers: Subscriber<T, K>[]
): Promise<Subscription<T, K> | null> => {
  console.log("Snapshot added to snapshot list: ", snapshot);

  const snapshotStore = await useSnapshotStore(addToSnapshotList); // Ensure addToSnapshotList is passed correctly

  const subscriptionData: Subscription<T, K> | null = snapshot.data
    ? {
        unsubscribe: (): void => {},
        portfolioUpdates: (): void => {},
        tradeExecutions: (): void => {},
        marketUpdates: (): void => {},
        triggerIncentives: (): void => {},
        communityEngagement: (): void => {},
        determineCategory: (
          snapshot: Snapshot<T, K> | null | undefined
        ): string => {
          return snapshotStore.determineCategory(snapshot);
        },
        portfolioUpdatesLastUpdated: {} as ModifiedDate,
        ...snapshot.data,
      }
    : null;

  return subscriptionData;
};

// Type guard function to check if item is SnapshotStoreConfig
function isSnapshotStoreConfig(
  item: any
): item is SnapshotStoreConfig<any, any> {
  // Perform appropriate checks to determine if item is SnapshotStoreConfig
  return item && typeof item === "object" && "snapshotId" in item; // Adjust based on actual properties of SnapshotStoreConfig
}

export { isSnapshot, isSnapshotStoreBaseData, isSnapshotStoreConfig, findCorrectSnapshotStore };
export const generateSnapshotId = UniqueIDGenerator.generateSnapshotID();
export const notify = useNotification();
