import {
  SubscriptionActions
} from "@/app/actions/SubscriptionActions";
import { BaseData } from '@/app/components/models/data/Data';
import { ModifiedDate } from "@/app/documents/DocType";
import { CustomSnapshotData, Snapshot, SnapshotContainerData } from "@/app/snapshots";
import { Callback } from "@/app/snapshots/subscribeToSnapshotsImplementation";
import { LiveEvent } from "@refinedev/core";
import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';

import { Subscriber } from "@/app/users/Subscriber";
import { fetchPortfolioUpdatesLastUpdated } from "@/app/utils/trading/TradingUtils";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { createAction } from "@reduxjs/toolkit";

interface UseSubscriptionOptions {
  channel: string;
  onLiveEvent: (event: LiveEvent) => void;
  enabled?: boolean;
}

const portfolioUpdatesLastUpdated = async (): Promise<number | ModifiedDate | null> => {
  try {
    const portfolioUpdatesLastUpdated = await fetchPortfolioUpdatesLastUpdated();
    return portfolioUpdatesLastUpdated;
  } catch (error) {
    console.error("Error fetching portfolio updates last updated timestamp:", error);
    return null;
  }
}; 


const useSubscription = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>({
  channel,
  onLiveEvent,
  enabled = true,
}: UseSubscriptionOptions) => {
  const [subscribers, setSubscribers] = useState<Subscriber<BaseData<any>, CustomSnapshotData<any>>[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const dispatch = useDispatch()
  const subscribe = () => {
    // Add the new subscriber to the subscribers array
    setIsSubscribed(true);
    // Dispatch an action to handle subscription on the backend
  };

  const unsubscribe = (
    subscriberId: string,
    unsubscribeDetails: {
      userId: string;
      snapshotId: string;
      unsubscribeType: string;
      unsubscribeDate: Date;
      unsubscribeReason: string;
      unsubscribeData: any;
    },
    callback: Callback<Snapshot<SnapshotContainerData<T, K, Meta, ExcludedFields>,
      SnapshotContainerData<T, K, Meta, ExcludedFields>>> | null
  ) => {
    // Filter out the subscriber with the given subscriberId
    const updatedSubscribers = subscribers.filter(
      (subscriber) => subscriber.getSubscriberId() !== subscriberId
    );
  
    // Update the subscribers state with the filtered list
    setIsSubscribed(false);
    updatedSubscribers && setSubscribers(updatedSubscribers);
  
    // In SubscriptionActions or a similar file
    const unsubscribe = createAction<{
      subscriberId: string;
      unsubscribeDetails: {
        userId: string;
        snapshotId: string;
        unsubscribeType: string;
        unsubscribeDate: Date;
        unsubscribeReason: string;
        unsubscribeData: any;
      };
    }>('unsubscribe');

    // Dispatch an action to handle unsubscription on the backend, including unsubscribe details
    dispatch(SubscriptionActions().unsubscribe({
      subscriberId,
      unsubscribeDetails
    }));
  
    // If a callback is provided, invoke it with the unsubscribe details
    if (callback) {
      // Here, assuming you want to pass a Snapshot object to the callback.
      // You may need to adjust the structure of the Snapshot data accordingly.
      const snapshot: Snapshot<SnapshotContainerData<T, K, Meta, ExcludedFields>> = {
        // Populate the Snapshot with the relevant data
        snapshotId: unsubscribeDetails.snapshotId,
        snapshotData: unsubscribeDetails.unsubscribeData,
        dataObject: unsubscribeDetails.dataObject,
        deleted: unsubscribeDetails.deleted,
        initialState: unsubscribeDetails.initialState,
        isCore: unsubscribeDetails.isCore,
        initialConfig: unsubscribeDetails.initialConfig,
        onInitialize: unsubscribeDetails.onInitialize,
        onError: unsubscribeDetails.onError,
        taskIdToAssign: unsubscribeDetails.taskIdToAssign,
       
        
        // Include other relevant data here as needed
      };
      
      callback(snapshot); // Invoke the callback with the Snapshot data
    }
  };
  useEffect(() => {
    // Fetch initial subscriptions on component mount
    dispatch(SubscriptionActions().fetchInitialSubscriptions());
  }, []);

  return {
    subscribers,
    subscribe,
    unsubscribe,
    isSubscribed,
    portfolioUpdatesLastUpdated
  };
};

export default useSubscription;
