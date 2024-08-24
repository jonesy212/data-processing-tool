import { LiveEvent } from "@refinedev/core";
import { useEffect, useState } from "react";
import {
  SubscriptionActions
} from "../actions/SubscriptionActions";
import { Data } from "../models/data/Data";
import { Subscriber } from "../users/Subscriber";
import { CustomSnapshotData } from "../snapshots/LocalStorageSnapshotStore";
import { ModifiedDate } from "../documents/DocType";
import { fetchPortfolioUpdatesLastUpdated } from "../trading/TradingUtils";
import { useDispatch } from 'react-redux';

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
  const [subscribers, setSubscribers] = useState<
    Subscriber<Data, CustomSnapshotData>[]
  >([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const dispatch = useDispatch()
  const subscribe = () => {
    // Add the new subscriber to the subscribers array
    setIsSubscribed(true);
    // Dispatch an action to handle subscription on the backend
  };

  const unsubscribe = (subscriberId: string) => {
    // Filter out the subscriber with the given subscriberId
    const updatedSubscribers = subscribers.filter(
      (subscriber) => subscriber.getSubscriberId() !== subscriberId
    );

    // Update the subscribers state with the filtered list
    setIsSubscribed(false);
     
    updatedSubscribers && setSubscribers(updatedSubscribers);
    // Dispatch an action to handle unsubscription on the backend
  
    dispatch(SubscriptionActions().unsubscribe(subscriberId));
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
