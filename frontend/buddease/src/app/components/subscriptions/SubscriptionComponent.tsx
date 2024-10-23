import { getSubscriberId } from "@/app/api/subscriberApi";
import { useUser } from "@/app/context/UserContext";
import React, { useEffect, useState } from "react";
import useRealtimeData, {
    RealtimeUpdateCallback,
} from "../hooks/commHooks/useRealtimeData";
import { useSnapshotManager } from "../hooks/useSnapshotManager";
import { Data } from "../models/data/Data";
import {
    SubscriberTypeEnum,
    SubscriptionTypeEnum,
} from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import { K, T } from "../snapshots/SnapshotConfig";
import SnapshotStore from "../snapshots/SnapshotStore";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { Subscriber } from "../users/Subscriber";
import {
    logActivity,
    notifyEventSystem,
    triggerIncentives,
    updateProjectState,
} from "../utils/applicationUtils";
import { Subscription } from "./Subscription";
import { subscriptionService } from "./SubscriptionService";

interface Props {
  initialData: RealtimeDataItem[];
  updateCallback: RealtimeUpdateCallback<RealtimeDataItem>;
  hookName: string;
}

const SubscriptionComponent: React.FC<Props> = async ({
  initialData,
  updateCallback,
  hookName,
}) => {
  const { user } = useUser(); // Use the useUser hook to get the user data
  const [subscriptionData, setSubscriptionData] = useState<Data | null>(
    initialData as unknown as Data
  );
  const data = useRealtimeData(initialData, updateCallback);
  const snapshotStore = useSnapshotManager();
  const events = {} as Record<string, CalendarEvent<T, Meta, K>[]>;
  useEffect(() => {
    if (user) {
      // Create a subscription object
      const subscription: Subscription<T, Meta, K> = {
        unsubscribe: () => {},
        portfolioUpdates: () => {},
        tradeExecutions: () => {},
        marketUpdates: () => {},
        triggerIncentives: () => {},
        communityEngagement: () => {},
        portfolioUpdatesLastUpdated: null,
        determineCategory: (data: Snapshot<T, Meta, K> | null | undefined) => "",
        subscriberId: user._id,
        subscriptionId: "sub-123-id",
        subscriberType: SubscriberTypeEnum.Individual,
        subscriptionType: SubscriptionTypeEnum.STANDARD,
        getPlanName: () => SubscriberTypeEnum.Individual,
        getId: () => user._id || "id-123",
        category: "category-123",
        // notifyEventSystem: () => {} // Added an empty function to satisfy the argument requirement
      };

      // Create a subscriber instance with dynamic _id from user context
      const subscriber = new Subscriber(
        user._id!, // Dynamic _id from user data
        user.username, // name from user data
        subscription, // subscription object
        getSubscriberId.toString(),
        notifyEventSystem,
        updateProjectState,
        logActivity,
        triggerIncentives
      );

      setSubscriptionData(subscription as unknown as Data);

      // Subscribe to the data service
      const callback = (data: SnapshotStore<T, Meta, K>) => {
        // Transform data from SnapshotStore<Snapshot<Data, Meta, Data>> to Data
        const extractedData =
          Array.isArray(data.snapshots) && data.snapshots.length > 0 && Array.isArray(data.snapshots[0].snapshots)
            ? data.snapshots[0].snapshots[0]
            : null;
        if (extractedData) {
          setSubscriptionData(extractedData as unknown as Data);
        }
        // Additional logic based on the received data
        if (extractedData) {
          updateCallback(
            extractedData,
            events,
            snapshotStore,
            Array.isArray(data.snapshots) ? data.snapshots : [] // Assuming dataItems refers to snapshots
          );
        }
      };
      subscriptionService.subscribe(hookName, callback);

      // Create a web3 provider instance and connect it
      const web3Provider = new Web3Provider(
        "https://example.com/web3",
        "your-api-key",
        5000
      );
      subscriptionService.connectWeb3Provider(web3Provider);

      // Subscribe to a web3-related hook
      subscriptionService.subscribe("web3Hook", () => {
        console.log("Web3 hook callback");
        // Your callback logic for web3-related events
      });

      // Cleanup: Unsubscribe when the component unmounts
      return () => {
        subscriptionService.unsubscribe(hookName, callback);
        subscriptionService.unsubscribe("web3Hook", callback);
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [user, data, hookName, updateCallback]); // Include user, data, and hookName in the dependencies array

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
const web3Provider = new Web3Provider(
  "https://example.com/web3",
  "your-api-key",
  5000
);
// Connect the web3 provider
subscriptionService.connectWeb3Provider(web3Provider);
// Subscribe to a web3-related hook
subscriptionService.subscribe("web3Hook", () => {
  console.log("Web3 hook callback");
  // Your callback logic for web3-related events
});

// Unsubscribe from the web3-related hook
subscriptionService.unsubscribe("web3Hook", updateCallback); // You might want to unsubscribe based on a certain condition or component unmount
