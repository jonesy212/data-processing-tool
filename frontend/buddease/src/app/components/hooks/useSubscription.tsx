import { LiveEvent } from "@refinedev/core";
import { useEffect, useState } from "react";
import {
  SubscriptionActions
} from "../actions/SubscriptionActions";
import { Data } from "../models/data/Data";
import { Subscriber } from "../users/Subscriber";
import { CustomSnapshotData } from "../snapshots/LocalStorageSnapshotStore";

interface UseSubscriptionOptions {
  channel: string;
  onLiveEvent: (event: LiveEvent) => void;
  enabled?: boolean;
}

const useSubscription = ({
  channel,
  onLiveEvent,
  enabled = true,
}: UseSubscriptionOptions) => {
  const [subscribers, setSubscribers] = useState<
    Subscriber<Data | CustomSnapshotData>[]
  >([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

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
    SubscriptionActions.unsubscribe(subscriberId);
  };

  useEffect(() => {
    // Fetch initial subscriptions on component mount
    SubscriptionActions.fetchInitialSubscriptions();
  }, []);

  return {
    subscribers,
    subscribe,
    unsubscribe,
    isSubscribed,
  };
};

export default useSubscription;
