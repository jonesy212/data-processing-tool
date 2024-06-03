import { useEffect, useState } from "react";
import useRealtimeData from "../hooks/commHooks/useRealtimeData";
import { subscriptionService } from "../hooks/dynamicHooks/dynamicHooks";
import { Data } from "../models/data/Data";
import SnapshotStore, { Snapshot } from "../snapshots/SnapshotStore";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { RealtimeDataItem } from "../../../../models/realtime/RealtimeData";

type Subscription = {
  unsubscribe: () => void;
  portfolioUpdates: () => void;
  tradeExecutions: () => void;
  marketUpdates: () => void;
  communityEngagement: () => void;
};

const SubscriptionComponent = (
  initialData: RealtimeDataItem[],
  updateCallback: (data: RealtimeDataItem[]) => void
) => {
  const [subscriptionData, setSubscriptionData] = useState<Subscription | null>(
    null
  );
  const data = useRealtimeData(initialData, updateCallback);

  useEffect(() => {
    // Subscribe to the data service
    const subscription = subscriptionService;
    const subscriptionUsage: Subscription = subscription.subscribe(
      "yourHookName",
      () => {
        // Construct and return the Subscription object
        return {
          unsubscribe: () => {}, // Placeholder function
          portfolioUpdates: () => {}, // Placeholder function
          tradeExecutions: () => {}, // Placeholder function
          marketUpdates: () => {}, // Placeholder function
          communityEngagement: () => {}, // Placeholder function
        };
      }
    ) as Subscription;

    // Cleanup: Unsubscribe when the component unmounts
    return () => {
      if (typeof subscriptionUsage !== "string") {
        subscriptionUsage.unsubscribe();
      }
    };
  }, [data]);

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
export type { Subscription };
