import { BaseData } from '@/app/components/models/data/Data';
import { LiveEvent } from "@refinedev/core";
import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import {
    SubscriptionActions
} from "../actions/SubscriptionActions";
import { ModifiedDate } from "../documents/DocType";
import { CustomSnapshotData, Snapshot, SnapshotContainerData } from "../snapshots";
import { Callback } from "@/app/components/snapshots/subscribeToSnapshotsImplementation";

import { fetchPortfolioUpdatesLastUpdated } from "../trading/TradingUtils";
import { Subscriber } from "../users/Subscriber";
import { T, K } from "../models/data/dataStoreMethods";
import { ExcludedFields } from "../routing/Fields";
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


const useSubscription = ({
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
    callback: Callback<Snapshot<SnapshotContainerData<T, K<T>,
      ExcludedFields<T, keyof T>>, SnapshotContainerData<T, K<T>,
      ExcludedFields<T, keyof T>>>> | null
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
      const snapshot: Snapshot<SnapshotContainerData<T, K<T>, ExcludedFields<T, keyof T>>> = {
        // Populate the Snapshot with the relevant data
        snapshotId: unsubscribeDetails.snapshotId,
        snapshotData: unsubscribeDetails.unsubscribeData,
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
