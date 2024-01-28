import { useEffect, useState } from 'react';
import { Data } from "../models/data/Data";
import { subscriptionService } from "./SubscriptionService";

const SubscriptionComponent = (initialData: string, updateCallback: (data: Data) => void) => {
  const [subscriptionData, setSubscriptionData] = useState<string | null>(initialData);

  useEffect(() => {
    const callback = (data: any) => {
      setSubscriptionData(data);
      // Additional logic based on the received data
      updateCallback(data);
    };

    // Subscribe to the data service
    subscriptionService.subscribe('yourHookName', callback);

    // Cleanup: Unsubscribe when the component unmounts
    return () => {
      subscriptionService.unsubscribe('yourHookName', callback);
    };
  }, [updateCallback]); // Update dependency array to include 'updateCallback'

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
