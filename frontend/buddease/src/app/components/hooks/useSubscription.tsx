// useSubscription.tsx
import { useEffect, useState } from 'react';
import { SubscriptionActions, SubscriptionPayload } from '../actions/SubscriptionActions';

const useSubscription = () => {
  const [subscribers, setSubscribers] = useState<SubscriptionPayload[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribe = (subscriber: SubscriptionPayload) => {
    // Add the new subscriber to the subscribers array
    setSubscribers([...subscribers, subscriber]);
    // Dispatch an action to handle subscription on the backend
    SubscriptionActions.subscribe(subscriber);
  };

  const unsubscribe = (subscriberId: string) => {
    // Filter out the subscriber with the given subscriberId
    const updatedSubscribers = subscribers.filter(
      (subscriber) => subscriber.subscriberId !== subscriberId
    );
    // Update the subscribers state with the filtered list
    setSubscribers(updatedSubscribers);
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
    isSubscribed
  };
};

export default useSubscription;
