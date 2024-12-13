// Subuscription.tsx
import { dataStoreMethods } from "../models/data/dataStoreMethods";
import * as snapshotApi from '@/app/api/SnapshotApi';
import { determineUsage, getSubscriptionLevel, SubscriptionLevel, subscriptionLevels } from '@/app/components/subscriptions/SubscriptionLevel';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import React, { useEffect, useState } from "react";
import { ModifiedDate } from "../documents/DocType";
import useRealtimeData, { RealtimeUpdateCallback } from "../hooks/commHooks/useRealtimeData";
import  subscriptionService from "../hooks/dynamicHooks/dynamicHooks";
import { SubscriberTypeEnum, SubscriptionTypeEnum } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";

import { getSnapshotId } from "@/app/api/SnapshotApi";
import { userId } from "../users/ApiUser";

import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { UnsubscribeDetails } from '../event/DynamicEventHandlerExample';
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { Callback, SnapshotContainer, snapshotContainer, useSnapshotStore } from "../snapshots";
import { getSubscribersAPI } from '@/app/api/subscriberApi';
import { addToSnapshotList } from '../utils/snapshotUtils';
import useSecureStoreId from '../utils/useSecureStoreId';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { SubscriberCallback } from "../users/Subscriber";
import { TriggerIncentivesParams } from '@/app/components/utils/applicationUtils';
import { SubscriberCollection } from "../users/SubscriberCollection";

type FetchSnapshotByIdCallback<T extends Data<T>, K extends T = T>  = {
  onSuccess: (snapshot: Snapshot<T, K>) => void;
  onError: (error: any) => void;
};

type SubscriberCallbackType<T extends Data<T>, K extends T = T> =
  | Callback<Snapshot<T, K>>
  | SubscriberCallback<T, K>;


type Subscription<T extends BaseData<any, any> = BaseData<any, any>, K extends T = T> = {
  name?: string;
  subscriberId?: string;
  subscriptionId?: string;
  subscriberType?: SubscriberTypeEnum;
  subscriptionType?: SubscriptionTypeEnum;
  subscribers: SubscriberCollection<T, K>;
  data?: Snapshot<T, K>; // Added
  triggerIncentives: ({ userId, incentiveType, params }: TriggerIncentivesParams) => void;
  
  getSubscriptionLevel: (price: number) => SubscriptionLevel | undefined; // Added
  unsubscribe: (
    snapshotId: number, 
    unsubscribe: UnsubscribeDetails, 
    callback: SubscriberCallbackType<T, K> | null
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
  determineCategory: (data: Snapshot<T, K>) => string | CategoryProperties | null;
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
    callback: FetchSnapshotByIdCallback<T, K>
  ) => void; // Adjust this type according to the actual implementation

};

const SubscriptionComponent = <T extends RealtimeDataItem, K extends T = T>(
  initialData: RealtimeDataItem[],
  updateCallback: RealtimeUpdateCallback<RealtimeDataItem, K>,
  hookName: string
) => {
  const [subscriptionData, setSubscriptionData] = useState<Subscription<T, K> | null>(
    null
  );
  const [unsubscribeType, setUnsubscribeType] = useState<string>(""); // Initialize with empty string
  const [unsubscribeDate, setUnsubscribeDate] = useState<Date>(new Date()); // Initialize with current date
  const [unsubscribeReason, setUnsubscribeReason] = useState<string>(""); // Initialize with empty string
  const [unsubscribeData, setUnsubscribeData] = useState<any>({}); // Initialize with empty object
  const [snapshot, setSnapshot] = useState<Snapshot<any, any> | null>(null); // Add state for snapshot

  const data = useRealtimeData<T>(initialData, updateCallback);
  const subscriptionLevelsConfig: SubscriptionLevel[] = subscriptionLevels;

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
  
      const subscribers = await getSubscribersAPI(); // Assuming this fetches a list of subscribers
      const currentSubscriber = subscribers.find(sub => sub.id === hookName); // Example: find the matching subscriber by `hookName`
      // Set `usage` based on a property from the `currentSubscriber`
      const usage = currentSubscriber ? determineUsage(currentSubscriber.getSubscriptionLevel()) : undefined;

      if(usage === undefined){
        throw new Error("Usage is undefined");  
      }

      const subscriptionUsage: Subscription<T, K> | undefined = subscription.subscribe(
        hookName,
        async (data: RealtimeDataItem) => {
          if (data.type === "snapshot" && data.data && data.data.subscriberId === hookName) {
            const snapshot = data.data as Snapshot<any, any>;
            const snapshotData = data.data as Snapshot<any, any>;
      
            setSnapshot(snapshotData); // Update snapshot state
         
            const snapshotStore = await useSnapshotStore(addToSnapshotList, storeProps);
            const subscriptionData: Subscription<T, K> | null = snapshot.data ? {
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
        },
        usage
      ) as Subscription<T, K> | undefined;
      
      
      // Ensure subscriptionUsage is defined before accessing unsubscribe
      if (subscriptionUsage) {
        async function fetchCriteria() {

          const storeId = useSecureStoreId()
          const storeConfig = dataStoreMethods?.config                                                                    

              // Ensure snapshot is not null before accessing its properties
          if (!snapshot) {
            throw new Error("Snapshot is null");
          }

          const snapshotId = snapshot.id; // Ensure this is a string
          if (typeof snapshotId !== "string") {
              throw new Error("Snapshot ID must be a string");
          }

          // Check if storeId is null and handle accordingly
          if (storeId === null) {
              throw new Error("Store ID cannot be null");
          }

          const snapshotContainerResult: SnapshotContainer<T, K> = snapshotContainer<T, K>(String(snapshotId), storeId, storeConfig);
          const criteria: CriteriaType = await snapshotApi.getSnapshotCriteria<T, K>(
            snapshotContainerResult,
            snapshot
          );

          // const snapshotId = getSnapshotId(criteria).toString();
      
          // Cleanup: Unsubscribe when the component unmounts
          return () => {
            // Make sure to pass the correct parameters to unsubscribe
            subscriptionUsage?.unsubscribe(
              Number(snapshotId),
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
    }
    
    subscribeToData();
    // If subscriptionUsage is undefined, return a no-op function
    return () => {};
  }, [hookName, unsubscribeType, unsubscribeDate, unsubscribeReason, unsubscribeData]) // Depend on relevant variables  const addToSnapshotList = async (



  const addToSnapshotList = async <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshot: Snapshot<T, K>
  ): Promise<Subscription<T, K> | null> => {
    console.log("Snapshot added to snapshot list: ", snapshot);
    setSubscriptionData(snapshot.data ? {
      unsubscribe: () => {},
      subscribers: {} as SubscriberCollection<T, K>, 
      getSubscriptionLevel: (price: number): SubscriptionLevel | undefined => {
        return subscriptionLevelsConfig.find(level => level.price === price);
      },
      portfolioUpdates: () => {},
      tradeExecutions: () => {},
      marketUpdates: () => {},
      triggerIncentives: () => {},
      communityEngagement: () => {},
      determineCategory: (await useSnapshotStore(addToSnapshotList, storeProps)).determineCategory,
      portfolioUpdatesLastUpdated: {} as ModifiedDate,
          ...snapshot.data
    } : null);


    // Set the subscription data
    setSubscriptionData(subscriptionData);
    
    // Return the subscription data or null
    return subscriptionData as Subscription<T, K> | null;
  };

  const handleUnsubscribe = () => {
    // Example: Set unsubscribe parameters dynamically
    setUnsubscribeType("actualType");
    setUnsubscribeDate(new Date('2024-07-06')); // Replace with actual date
    setUnsubscribeReason("actualReason");
    setUnsubscribeData({ key: 'value' }); // Replace with actual data structure
  };

  
  // Function to handle subscribe action
  const handleSubscribe = async () => {

    const subscribers = await getSubscribersAPI(); // Assuming this fetches a list of subscribers
    const currentSubscriber = subscribers.find(sub => sub.id === hookName); // Example: find the matching subscriber by `hookName`

    const usage = currentSubscriber ? determineUsage(currentSubscriber.getSubscriptionLevel()) : undefined;

    subscriptionService.subscribe(hookName, handleSubscriptionCallback, usage);
  };

   // Callback function for subscription update
  const handleSubscriptionCallback = async <
    T extends BaseData<any>,
    K extends T = T,
    Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
  >(data: RealtimeDataItem) => {
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
          snapshotId: number,
          unsubscribeDetails: UnsubscribeDetails,
          callback: Callback<Snapshot<T, K>> | null
        ) => {
          if (data.data?.unsubscribe) {
            data.data.unsubscribe(unsubscribeDetails, callback);
          }
        },
      determineCategory: (await useSnapshotStore(addToSnapshotList, storeProps)).determineCategory,
      getSubscriptionLevel: getSubscriptionLevel
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
export type { FetchSnapshotByIdCallback, Subscription, SubscriberCallbackType };

