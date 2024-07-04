import React, { useEffect, useState } from "react";
import { ModifiedDate } from "../documents/DocType";
import useRealtimeData, { RealtimeUpdateCallback } from "../hooks/commHooks/useRealtimeData";
import { subscriptionService } from "../hooks/dynamicHooks/dynamicHooks";
import { SubscriberTypeEnum, SubscriptionTypeEnum } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import { TriggerIncentivesParams, triggerIncentives } from "../utils/applicationUtils";
import { useSnapshotStore } from "../snapshots/useSnapshotStore";

type Subscription = {
  unsubscribe: () => void;
  portfolioUpdates: (
    { userId, snapshotId }: {
      userId: string;
      snapshotId: string;
    }
  ) => void;
  tradeExecutions: () => void;
  marketUpdates: () => void;
  triggerIncentives: ({ userId, incentiveType, params }: TriggerIncentivesParams) => void;
  communityEngagement: () => void;
  subscriberId?: string;
  subscriptionId?: string;
  subscriberType?: SubscriberTypeEnum;
  subscriptionType?: SubscriptionTypeEnum;
  getPlanName?: () => SubscriberTypeEnum;
  portfolioUpdatesLastUpdated: ModifiedDate | null;
  getId?: () => string;
  determineCategory: (data: any) => Snapshot<any>; // Ensure determineCategory returns Snapshot<any>
  category?: string;
};

const SubscriptionComponent = (
  initialData: RealtimeDataItem[],
  updateCallback: RealtimeUpdateCallback<RealtimeDataItem>,
  hookName: string
) => {
  const [subscriptionData, setSubscriptionData] = useState<Subscription | null>(
    null
  );
  const data = useRealtimeData(initialData, updateCallback);

  useEffect(() => {
    // Subscribe to the data service
    const subscription = subscriptionService;

    // Your subscription usage
    const subscriptionUsage: Subscription | undefined = subscription.subscribe(
      hookName,
      async (data: RealtimeDataItem) => {
        if (data.type === "snapshot" && data.data && data.data.subscriberId === hookName) {
          const snapshot = data.data as Snapshot<any>;
          const snapshotStore = await useSnapshotStore(addToSnapshotList);
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
          setSubscriptionData(subscriptionData)
        }
      }
    ) as Subscription | undefined;

    // Ensure subscriptionUsage is defined before accessing unsubscribe
    if (subscriptionUsage) {
      // Cleanup: Unsubscribe when the component unmounts
      return () => {
        subscriptionUsage.unsubscribe();
      };
    }

    // If subscriptionUsage is undefined, return a no-op function
    return () => {};

  }, [hookName]); // Depend only on hookName

  return (
    <div>
      <h2>Subscription Component</h2>
      {subscriptionData ? (
        <div>
          <p>Data Received:</p>
          <pre>{JSON.stringify(subscriptionData, null, 2)}</pre>
        </div>
      ) : (
        <p>No data received yet.</p>
      )}
    </div>
  );
};

export default SubscriptionComponent;
export type { Subscription };
