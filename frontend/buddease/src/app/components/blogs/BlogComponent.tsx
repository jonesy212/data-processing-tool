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
import { K, T } from '../snapshots/SnapshotConfig';

interface BlogProps {
  title: string;
  content: string | Content<T> | undefined;
  subscriberId: string;
  // Add more properties as needed (date, author, etc.)
}

const BlogComponent: React.FC<BlogProps> = ({
  title,
  content,
  subscriberId,
}) => {
  const [subscriptionData, setSubscriptionData] = useState<Subscription<T,K> | undefined>(); 
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
      snapshot: {},
      getSnapshotId: () => String(id || ""),
      compareSnapshotState: () => false,
      eventRecords: [],
      // Add other required properties here
      snapshotStore: {} as any,
      getParentId: () => "",
      getChildIds: () => [],
      addChild: () => {},
      removeChild: () => {},
      updateChild: () => {},
      getChild: () => null,
      hasChild: () => false,
      getChildren: () => [],
      getDescendants: () => [],
      getAncestors: () => [],
      getRootSnapshot: () => null,
      isRootSnapshot: () => false,
      getDepth: () => 0,
      getPath: () => [],
      traverse: () => {},
      find: () => null,
      filter: () => [],
      map: () => [],
      reduce: () => null,
      toJSON: () => ({}),
      fromJSON: () => null,
      clone: () => null,
      merge: () => {},
      diff: () => ({}),
      patch: () => {},
      revert: () => {},
      commit: () => {},
      checkpoint: () => "",
      restore: () => {},
      getHistory: () => [],
      clearHistory: () => {},
    } as unknown as Snapshot<Data>;
  }
  const subscribedId = subscriberApi.getSubscriberById(subscriberId).toString();

  const subscriber = new Subscriber<T, K>(
    String(id || ""), 
    name, 
    subscriptionData || ({} as Subscription<T, K>), 
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
      const subscription = data.data as unknown as Subscription<T, K>;
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
