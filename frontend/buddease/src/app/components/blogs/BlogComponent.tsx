import React, { useEffect, useState } from 'react';
import { Content } from '../models/content/AddContent';
import { Data } from '../models/data/Data';
import { CustomSnapshotData, Snapshot } from '../snapshots/LocalStorageSnapshotStore';
import SnapshotStore from '../snapshots/SnapshotStore';
import { Subscription } from '../subscriptions/Subscription';
import { NotificationType, useNotification } from '../support/NotificationContext';
import { Subscriber } from '../users/Subscriber';
import { logActivity, notifyEventSystem, triggerIncentives, updateProjectState } from '../utils/applicationUtils';
import * as subscriberApi from './../../api/subscriberApi';

interface BlogProps {
  title: string;
  content: string | Content | undefined;
  subscriberId: string;
  // Add more properties as needed (date, author, etc.)
}

const BlogComponent: React.FC<BlogProps> = ({
  title,
  content,
  subscriberId,
}) => {
  const [subscriptionData, setSubscriptionData] = useState<Subscription | undefined>(); 
  const { sendNotification } = useNotification(); 
  const optionalData: CustomSnapshotData | null = null;
  const name = "Blog"; 

  let snapshotData: Snapshot<Data> | null = null;
  let id: string | number | undefined = undefined;
  let data: Partial<SnapshotStore<Data>> = {
    id: String(id || ""),
    // Add other properties as needed
  };
  
  if (optionalData !== null) {
    snapshotData = {
      id: id,
      data: optionalData,
      timestamp: new Date(),
      subscriberId: subscriberId,
      category: "Blog",
      content: {
        id: id,
        title: title,
        description: content?.toString() || '', 
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

  const subscriber = new Subscriber<Data>(
    String(id || ""), 
    name, 
    subscriptionData || ({} as Subscription), 
    subscribedId, 
    notifyEventSystem, 
    updateProjectState, 
    logActivity, 
    triggerIncentives, 
    optionalData, 
    data,
  );

  useEffect(() => {
    subscriber.subscribe((data: Snapshot<Data>) => {
      const subscription = data.data as unknown as Subscription;
      setSubscriptionData(subscription);

      sendNotification(
        "BlogUpdated" as NotificationType,
        `Blog "${title}" has been updated.`
      );
    });

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
      <p>{typeof content === 'string' ? content : ''}</p>
    </div>
  );
};

export default BlogComponent;
