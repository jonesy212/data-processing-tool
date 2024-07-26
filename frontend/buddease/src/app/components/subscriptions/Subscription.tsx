import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import React, { useEffect, useState } from "react";
import { ModifiedDate } from "../documents/DocType";
import useRealtimeData, { RealtimeUpdateCallback } from "../hooks/commHooks/useRealtimeData";
import { subscriptionService } from "../hooks/dynamicHooks/dynamicHooks";
import { SubscriberTypeEnum, SubscriptionTypeEnum } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import { K, T } from "../snapshots/SnapshotConfig";
import SnapshotStore from "../snapshots/SnapshotStore";
import { useSnapshotStore } from "../snapshots/useSnapshotStore";
import { TriggerIncentivesParams } from "../utils/applicationUtils";
import { userId } from "../users/ApiUser";
import { getSnapshotId } from "@/app/api/SnapshotApi";
import { snapshot } from "../snapshots/snapshot";


type FetchSnapshotByIdCallback = {
  onSuccess: (snapshot: Snapshot<T, T>) => void;
  onError: (error: any) => void;
};

type Subscription<T> = {
  unsubscribe: (
    userId: string,
    snapshotId: string,
    unsubscribeType: string,
    unsubscribeDate: Date,
    unsubscribeReason: string,
    unsubscribeData: any) => void;
  portfolioUpdates: (
    { userId, snapshotId }: {
      userId: string;
      snapshotId: string;
    }
  ) => void;
  tradeExecutions: (
    { userId, snapshotId }: {
      userId: string;
      snapshotId: string;
    }

  ) => void;
  marketUpdates: (
    { userId, snapshotId }: {
      userId: string;
      snapshotId: string;
    }
  ) => void;
  triggerIncentives: ({ userId, incentiveType, params }: TriggerIncentivesParams) => void;
  communityEngagement: (
    { userId, snapshotId }: {
      userId: string;
      snapshotId: string;
    }
  ) => void;
  subscriberId?: string;
  subscriptionId?: string;
  subscriberType?: SubscriberTypeEnum;
  subscriptionType?: SubscriptionTypeEnum;
  getPlanName?: (
    { userId, snapshotId }: {
      userId: string;
      snapshotId: string;
    }
  ) => SubscriberTypeEnum;
  portfolioUpdatesLastUpdated:number | ModifiedDate | null;
  getId?: () => string;
  determineCategory: (data: any) => Snapshot<any> ; // Ensure determineCategory returns Snapshot<any>
  category?: string | CategoryProperties | null;
  fetchSnapshotById?: (
    { userId, snapshotId }: {
      userId: string;
      snapshotId: string;
    }) => void;

    
  fetchSnapshotByIdCallback?: (
    { userId, snapshotId }: {
      userId: string;
      snapshotId: string;
    },
    callback: FetchSnapshotByIdCallback
  ) => void; // Adjust this type according to the actual implementation

};

const SubscriptionComponent = (
  initialData: RealtimeDataItem[],
  updateCallback: RealtimeUpdateCallback<RealtimeDataItem>,
  hookName: string
) => {
  const [subscriptionData, setSubscriptionData] = useState<Subscription<T> | null>(
    null
  );
  const [unsubscribeType, setUnsubscribeType] = useState<string>(""); // Initialize with empty string
  const [unsubscribeDate, setUnsubscribeDate] = useState<Date>(new Date()); // Initialize with current date
  const [unsubscribeReason, setUnsubscribeReason] = useState<string>(""); // Initialize with empty string
  const [unsubscribeData, setUnsubscribeData] = useState<any>({}); // Initialize with empty object

  const data = useRealtimeData(initialData, updateCallback);

  useEffect(() => {
    // Subscribe to the data service
    const subscription = subscriptionService;

    // Your subscription usage
    const subscriptionUsage: Subscription<T> | undefined = subscription.subscribe(
      hookName,
      async (data: RealtimeDataItem) => {
        if (data.type === "snapshot" && data.data && data.data.subscriberId === hookName) {
          const snapshot = data.data as Snapshot<any>;
          const snapshotStore = await useSnapshotStore(addToSnapshotList);
          const subscriptionData: Subscription<T> | null = snapshot.data ? {
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
          setSubscriptionData(subscriptionData);
        }
      }
    ) as Subscription<T> | undefined;

    // Ensure subscriptionUsage is defined before accessing unsubscribe
    if (subscriptionUsage) {
      const snapshotId = getSnapshotId(snapshot)
      // Cleanup: Unsubscribe when the component unmounts
      return () => {
        // Make sure to pass the correct parameters to unsubscribe
        subscriptionUsage.unsubscribe(
          String(userId),
          snapshotId,
          unsubscribeType,
          unsubscribeDate,
          unsubscribeReason,
          unsubscribeData
        );
      };
    }

    // If subscriptionUsage is undefined, return a no-op function
    return () => {};

  }, [hookName, unsubscribeType, unsubscribeDate, unsubscribeReason, unsubscribeData]); // Depend on relevant variables

  const addToSnapshotList = async (snapshot: SnapshotStore<T, K>) => {
    console.log("Snapshot added to snapshot list: ", snapshot);
    setSubscriptionData(snapshot.data? {
      unsubscribe: () => {},
      portfolioUpdates: () => {},
      tradeExecutions: () => {},
      marketUpdates: () => {},
      triggerIncentives: () => {},
      communityEngagement: () => {},
      determineCategory: (await useSnapshotStore(addToSnapshotList)).determineCategory,
      portfolioUpdatesLastUpdated: {} as ModifiedDate,
     ...snapshot.data
    } : null);
  };
  const handleUnsubscribe = () => {
    // Example: Set unsubscribe parameters dynamically
    setUnsubscribeType("actualType");
    setUnsubscribeDate(new Date('2024-07-06')); // Replace with actual date
    setUnsubscribeReason("actualReason");
    setUnsubscribeData({ key: 'value' }); // Replace with actual data structure
  };

  
  // Function to handle subscribe action
  const handleSubscribe = () => {
    // Implement subscription logic here
    // For example:
    subscriptionService.subscribe(hookName, handleSubscriptionCallback);
  };

  // Callback function for subscription update
   // Callback function for subscription update
   const handleSubscriptionCallback = async (data: RealtimeDataItem) => {
    // Handle incoming subscription data here
    // Transform RealtimeDataItem to Subscription or null
    const transformedData: Subscription<T> | null = data.type === "snapshot" && data.data && data.data.subscriberId === hookName
      ? {
          unsubscribe: () => {},
          portfolioUpdates: () => {},
          tradeExecutions: () => {},
          marketUpdates: () => {},
          triggerIncentives: () => {},
          communityEngagement: () => {},
          determineCategory: (await useSnapshotStore(addToSnapshotList)).determineCategory,
          portfolioUpdatesLastUpdated: {} as ModifiedDate,
          ...data.data
        }
      : null;

    // Update state with transformed data
    setSubscriptionData(transformedData);
  };

  // Render your component JSX with subscribe/unsubscribe actions
  return (
    <div>
      <h2>Subscription Component</h2>
      {subscriptionData ? (
        <div>
          <p>Data Received:</p>
          <pre>{JSON.stringify(subscriptionData, null, 2)}</pre>
          <button onClick={handleUnsubscribe}>Unsubscribe</button>
        </div>
      ) : (
        <div>
          <p>No data received yet.</p>
          <button onClick={handleSubscribe}>Subscribe</button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionComponent;
export type { Subscription, FetchSnapshotByIdCallback };
