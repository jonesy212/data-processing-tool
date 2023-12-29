import { useEffect, useState } from 'react';
import useRealtimeData from '../hooks/commHooks/useRealtimeData';
import { subscriptionService } from '../hooks/dynamicHooks/dynamicHooks';

const SubscriptionComponent = () => {
  const [subscriptionData, setSubscriptionData] = useState<string | null>(null);
  const data = useRealtimeData("yourHookName");

  useEffect(() => {
    // Subscribe to the data service
    const subscription = subscriptionService.subscribe(
      "yourHookName",
      () => void setSubscriptionData(data)
    );

    // Cleanup: Unsubscribe when the component unmounts
    return () => {
        subscriptionService.unsubscribe("yourHookName");
    };
  }, [data]); // Update dependency array to include 'data'

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






// Create a web3 provider instance
const web3Provider = new Web3Provider('https://example.com/web3', 'your-api-key', 5000);

// Connect the web3 provider
subscriptionService.connectWeb3Provider(web3Provider);

// Subscribe to a web3-related hook
subscriptionService.subscribe("web3Hook", () => {
  console.log("Web3 hook callback");
  // Your callback logic for web3-related events
});

// Unsubscribe from the web3-related hook
subscriptionService.unsubscribe("web3Hook");