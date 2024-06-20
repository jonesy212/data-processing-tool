import React, { useEffect, useState } from 'react';
import { Data } from '../models/data/Data';
import SnapshotStore from '../snapshots/SnapshotStore';
import { Subscription } from '../subscriptions/Subscription';
import { NotificationType, useNotification } from '../support/NotificationContext';
import { Subscriber } from '../users/Subscriber';
import { logActivity, notifyEventSystem, triggerIncentives, updateProjectState } from '../utils/applicationUtils';
import * as snapshotApi from './../../api/SnapshotApi';
import * as subscriberApi from './../../api/subscriberApi';
import { snapshotConfig } from '../snapshots/SnapshotConfig';
import { CustomSnapshotData, Snapshot } from '../snapshots/LocalStorageSnapshotStore';

interface BlogProps {
  title: string;
  content: string;
  subscriberId: string;
  // Add more properties as needed (date, author, etc.)
}

const BlogComponent: React.FC<BlogProps> = ({
  title,
  content,
  subscriberId,
}) => {
  const [subscriptionData, setSubscriptionData] = useState<Subscription | undefined>(); // Adjusted state type
  const { sendNotification } = useNotification(); // Hook for sending notifications
  const optionalData: CustomSnapshotData | null = null;
  const name = "Blog"; // Name of the subscriber

  // Create a snapshot from optionalData if it exists
  let snapshotData: Snapshot<Data> | null = null;
  let id: string | number | undefined = undefined;

  if (optionalData !== null) {
    snapshotData = {
      id: id,
      data: optionalData,
      timestamp: new Date(),
      subscriberId: subscriberId,
      category: "Blog",
      content: {
        title: title,
        content: content,
        subscriberId: subscriberId,
        category: "Blog",
        timestamp: new Date(),
        length: 0,
        data: optionalData,
      },
      store: undefined,
    };
  }
  const subscribedId = subscriberApi.getSubscriberById(subscriberId).toString();

  // Create a new Subscriber instance
  const subscriber = new Subscriber<Data>(
    String(id || ""), // id: string
    name, // name: string
    subscriptionData || ({} as Subscription), // subscription: Subscription (assuming you have a Subscription object)
    subscribedId, // subscriberId: string
    notifyEventSystem, // notifyEventSystem: Function (replace with actual function)
    updateProjectState, // updateProjectState: Function (replace with actual function)
    logActivity, // logActivity: Function (replace with actual function)
    triggerIncentives, // triggerIncentives: Function (replace with actual function)
    optionalData // optional data: string | null (optional parameter)
  );

  // Subscribe to updates
  useEffect(() => {
    subscriber.subscribe((data: Snapshot<Data>) => {
      // Assuming data can be converted to Subscription
      setSubscriptionData(data.data as Subscription);
      // Send notification when blog content is updated
      sendNotification(
        "BlogUpdated" as NotificationType,
        `Blog "${title}" has been updated.`
      );
    });

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      if (subscriber) {
        const data = {} as Snapshot<Data>;
        subscriber.notify!(data);
      }
    };
  }, []);

  return (
    <div>
      <h2>{title}</h2>
      <p>{content}</p>
      {/* Additional blog styling and features can be added */}
    </div>
  );
};

export default BlogComponent;
