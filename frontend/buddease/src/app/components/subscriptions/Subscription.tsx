import { useEffect, useState } from 'react';
import { subscriptionService } from '../dynamicHooks/DynamicHooks';

const SubscriptionComponent = () => {
  const [subscriptionData, setSubscriptionData] = useState(null);

  useEffect(() => {
    // Subscribe to the data service
    const subscription = subscriptionService.subscribe(
      (data) => { 
        setSubscriptionData(data);

      },

    );

    // Cleanup: Unsubscribe when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to run the effect only once on mount

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
