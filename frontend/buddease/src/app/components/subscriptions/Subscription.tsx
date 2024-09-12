import * as snapshotApi from '@/app/api/SnapshotApi'
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import React, { useEffect, useState } from "react";
import { ModifiedDate } from "../documents/DocType";
import useRealtimeData, { RealtimeUpdateCallback } from "../hooks/commHooks/useRealtimeData";
import { subscriptionService } from "../hooks/dynamicHooks/dynamicHooks";
import { SubscriberTypeEnum, SubscriptionTypeEnum } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import { K, T } from "../snapshots/SnapshotConfig";

import { useSnapshotStore } from "@/app/snapshots/useSnapshotStore";
import { TriggerIncentivesParams } from "../utils/applicationUtils";
import { userId } from "../users/ApiUser";
import { getSnapshotId } from "@/app/api/SnapshotApi";

import { Data } from "../models/data/Data";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Callback, snapshotContainer } from "../snapshots";


type FetchSnapshotByIdCallback = {
  onSuccess: (snapshot: Snapshot<T, K>) => void;
  onError: (error: any) => void;
};

type Subscription<T extends Data, K extends Data> = {
  name?: string;
  subscriberId?: string;
  subscriptionId?: string;
  subscriberType?: SubscriberTypeEnum;
  subscriptionType?: SubscriptionTypeEnum;
  unsubscribe: (
    unsubscribeDetails: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
  ) => void;
  portfolioUpdates: (
    { userId, snapshotId }: {
      userId: string;
      snapshotId: string;
    }
  ) => void;
  tradeExecutions: (
    { userId, snapshotId, tradeExecutionType, tradeExecutionData }: {
      userId: string;
      snapshotId: string;
      tradeExecutionType: string,
      tradeExecutionData: any
    },

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

  getPlanName?: (
    { userId, snapshotId }: {
      userId: string;
      snapshotId: string;
    }
  ) => SubscriberTypeEnum;
  portfolioUpdatesLastUpdated:number | ModifiedDate | null;
  getId?: () => string;
  determineCategory: (data: Snapshot<T, K>) => string | CategoryProperties;
  category?: Category | null;
  categoryProperties?: CategoryProperties | null;
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
  const [subscriptionData, setSubscriptionData] = useState<Subscription<T, K> | null>(
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

    const callback: Callback<Snapshot<any>> = (snapshot) => {
      // Perform actions based on the snapshot provided to the callback
      console.log("Unsubscribed successfully");
      console.log("Snapshot ID:", snapshot.id);
      console.log("Snapshot Data:", snapshot.data);
      console.log("Snapshot Timestamp:", snapshot.timestamp);
    
      // Additional logic after unsubscribing
      if (snapshot.data) {
        // Example: Perform some cleanup or state updates
        console.log("Performing cleanup based on snapshot data...");
        // Add your custom logic here based on the snapshot data
      }
    
      // Further actions can be added here if needed
    };
    // Your subscription usage
    const subscriptionUsage: Subscription<T, K> | undefined = subscription.subscribe(
      hookName,
      async (data: RealtimeDataItem) => {
        if (data.type === "snapshot" && data.data && data.data.subscriberId === hookName) {
          const snapshot = data.data as Snapshot<any>;
          const snapshotStore = await useSnapshotStore(addToSnapshotList);
          const subscriptionData: Subscription<T, K> | null = snapshot.data ? {
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
    ) as Subscription<T, K> | undefined;

    // Ensure subscriptionUsage is defined before accessing unsubscribe
    if (subscriptionUsage) {
      const criteria = snapshotApi.getSnapshotCriteria(
        await snapshotContainer(snapshotId, storeId), snapshot
      );
      const snapshotId = getSnapshotId(criteria).toString()
      // Cleanup: Unsubscribe when the component unmounts
      return () => {
        // Make sure to pass the correct parameters to unsubscribe
        subscriptionUsage.unsubscribe({
          userId: String(userId),
          snapshotId,
          unsubscribeType,
          unsubscribeDate,
          unsubscribeReason,
          unsubscribeData
        },
          callback
        );
      };
    }

    // If subscriptionUsage is undefined, return a no-op function
    return () => {};

  }, [hookName, unsubscribeType, unsubscribeDate, unsubscribeReason, unsubscribeData]); // Depend on relevant variables

  const addToSnapshotList = async (
    snapshot: Snapshot<T, K>) => {
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
  const transformedData: Subscription<T, K> | null = data.type === "snapshot" && data.data && data.data.subscriberId === hookName
    ? {
        portfolioUpdates: () => {},
        tradeExecutions: () => {},
        marketUpdates: () => {},
        triggerIncentives: () => {},
        communityEngagement: () => {},
        portfolioUpdatesLastUpdated: {} as ModifiedDate,
        ...data.data,
        unsubscribe: (
          unsubscribeDetails: {
            userId: string;
            snapshotId: string;
            unsubscribeType: string;
            unsubscribeDate: Date;
            unsubscribeReason: string;
            unsubscribeData: any;
          }
        ) => {
          if (data.data?.unsubscribe) {
            data.data.unsubscribe(unsubscribeDetails);
          }
        },
        determineCategory: (await useSnapshotStore(addToSnapshotList)).determineCategory
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
