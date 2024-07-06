// snapshotUtils.tsx
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { ModifiedDate } from "../documents/DocType";
import SnapshotStore from "../snapshots/SnapshotStore";
import { useSnapshotStore } from "../snapshots/useSnapshotStore";
import { Subscription } from "../subscriptions/Subscription";
import { useNotification } from "../support/NotificationContext";


export const addToSnapshotList = async (snapshot: SnapshotStore<any>) => {
    console.log("Snapshot added to snapshot list: ", snapshot);
  
    const snapshotStore = await useSnapshotStore(addToSnapshotList); // Ensure addToSnapshotList is passed correctly
    const subscriptionData: Subscription | null = snapshot.data ? {
      unsubscribe: () => {},
      portfolioUpdates: () => {},
      tradeExecutions: () => {},
      marketUpdates: () => {},
      triggerIncentives: () => {},
      communityEngagement: () => {},
      determineCategory: snapshotStore.determineCategory,
      portfolioUpdatesLastUpdated: {} as ModifiedDate,
      ...snapshot.data
    } : null;
  
    return subscriptionData;
};
  
export const generateSnapshotId = UniqueIDGenerator.generateSnapshotID();
export const notify = useNotification();
