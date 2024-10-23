import * as snapshotApi from '@/app/api/SnapshotApi';
import { SubscriptionLevel } from '@/app/components/crypto/SubscriptionLevel';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import React, { useEffect, useState } from "react";
import { ModifiedDate } from "../documents/DocType";
import useRealtimeData, { RealtimeUpdateCallback } from "../hooks/commHooks/useRealtimeData";
import { subscriptionService } from "../hooks/dynamicHooks/dynamicHooks";
import { SubscriberTypeEnum, SubscriptionTypeEnum } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";

import { getSnapshotId } from "@/app/api/SnapshotApi";
import { userId } from "../users/ApiUser";
import { TriggerIncentivesParams } from "../utils/applicationUtils";

import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Data } from "../models/data/Data";
import { Callback, snapshotContainer, SubscriberCollection, useSnapshotStore } from "../snapshots";


type FetchSnapshotByIdCallback<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>  = {
  onSuccess: (snapshot: Snapshot<T, Meta, K>) => void;
  onError: (error: any) => void;
};

type Subscription<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> = {
  name?: string;
  subscriberId?: string;
  subscriptionId?: string;
  subscriberType?: SubscriberTypeEnum;
  subscriptionType?: SubscriptionTypeEnum;
  subscribers: SubscriberCollection<T, Meta, K>;
  data: Snapshot<T, Meta, K>; // Added
  getSubscriptionLevel: () => SubscriptionLevel; // Added
  unsubscribe: (
    snapshotId: number, 
    unsubscribe: UnsubscribeDetails, 
    callback: Callback<Snapshot<T, Meta, K>> | null
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
  portfolioUpdatesLastUpdated: number | ModifiedDate | null;
  getId?: () => string;
  determineCategory: (data: Snapshot<T, Meta, K>) => string | CategoryProperties | null;
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
    callback: FetchSnapshotByIdCallback<T, Meta, K>
  ) => void; // Adjust this type according to the actual implementation

};

const SubscriptionComponent = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  initialData: RealtimeDataItem[],
  updateCallback: RealtimeUpdateCallback<RealtimeDataItem, K>,
  hookName: string
) => {
  const [subscriptionData, setSubscriptionData] = useState<Subscription<T, Meta, K> | null>(
    null
  );
  const [unsubscribeType, setUnsubscribeType] = useState<string>(""); // Initialize with empty string
  const [unsubscribeDate, setUnsubscribeDate] = useState<Date>(new Date()); // Initialize with current date
  const [unsubscribeReason, setUnsubscribeReason] = useState<string>(""); // Initialize with empty string
  const [unsubscribeData, setUnsubscribeData] = useState<any>({}); // Initialize with empty object
  const [snapshot, setSnapshot] = useState<Snapshot<any, any> | null>(null); // Add state for snapshot

  const data = useRealtimeData<T, Meta, K>(initialData, updateCallback);

  useEffect(() => {
    // Subscribe to the data service
    const subscription = subscriptionService;

    const callback: Callback<Snapshot<any, any>> = (snapshot) => {
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
    const subscribeToData = async () => {
  
      const subscriptionUsage: Subscription<T, Meta, K> | undefined = subscription.subscribe(
        hookName,
        async (data: RealtimeDataItem) => {
          if (data.type === "snapshot" && data.data && data.data.subscriberId === hookName) {
            const snapshot = data.data as Snapshot<any, any>;
            const snapshotData = data.data as Snapshot<any, any>;
      
            setSnapshot(snapshotData); // Update snapshot state
         
            const snapshotStore = await useSnapshotStore(addToSnapshotList, storeProps);
            const subscriptionData: Subscription<T, Meta, K> | null = snapshot.data ? {
              ...snapshot.data,
              unsubscribe: () => { },
              portfolioUpdates: () => { },
              tradeExecutions: () => { },
              marketUpdates: () => { },
              triggerIncentives: () => { },
              communityEngagement: () => { },
              determineCategory: snapshotStore.determineCategory,
              portfolioUpdatesLastUpdated: {} as ModifiedDate,
              subscribers: [],
              getSubscriptionLevel: () => ({
                  name: "",
                  description: "",
                  price: 0,
                  features: [],
              } as SubscriptionLevel)
              
              //todo integrate
              // getId: () => snapshot.id,
              // fetchSnapshotById: () => { },
              // // fetchSnapshotByIdCallback: () => { }, // Adjust this type according to the actual implementation
            } : null;
            setSubscriptionData(subscriptionData);
          }
        }
      ) as Subscription<T, Meta, K> | undefined;
      
      
      // Ensure subscriptionUsage is defined before accessing unsubscribe
      if (subscriptionUsage) {
        async function fetchCriteria() {
          const snapshotContainerResult = await snapshotContainer(snapshotId, storeId);
          const criteria: CriteriaType = await snapshotApi.getSnapshotCriteria(
            snapshotContainerResult,
            snapshot
          );
          const snapshotId = getSnapshotId(criteria).toString();
      
          // Cleanup: Unsubscribe when the component unmounts
          return () => {
            // Make sure to pass the correct parameters to unsubscribe
            subscriptionUsage?.unsubscribe(
              snapshotId,
              {
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
        fetchCriteria();
      }
      subscribeToData();
      // If subscriptionUsage is undefined, return a no-op function
      return () => {};
    }
  }, [hookName, unsubscribeType, unsubscribeDate, unsubscribeReason, unsubscribeData]); // Depend on relevant variables

  const addToSnapshotList = async (
    snapshot: Snapshot<T, Meta, K>) => {
    console.log("Snapshot added to snapshot list: ", snapshot);    setSubscriptionData(snapshot.data? {
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
  const transformedData: Subscription<T, Meta, K> | null = data.type === "snapshot" && data.data && data.data.subscriberId === hookName
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
          },
          callback: Callback<Snapshot<T, Meta, K>> | null
        ) => {
          if (data.data?.unsubscribe) {
            data.data.unsubscribe(unsubscribeDetails, callback);
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
export type { FetchSnapshotByIdCallback, Subscription };

