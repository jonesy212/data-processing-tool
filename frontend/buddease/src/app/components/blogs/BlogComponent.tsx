// BlogComponent.tsx
import React, { useEffect, useState } from 'react';
import { Snapshot } from '../snapshots/SnapshotStore';
import { NotificationType, useNotification } from '../support/NotificationContext';
import { Subscriber } from '../users/Subscriber';

interface BlogProps {
  title: string;
  content: string;
  // You can add more properties as needed (date, author, etc.)
}

const BlogComponent: React.FC<BlogProps> = ({ title, content }) => {

  const [subscriptionData, setSubscriptionData] = useState<string | null>(null);
  const { sendNotification } = useNotification(); // Hook for sending notifications

  // Create a new Subscriber instance
  const subscriber = new Subscriber<string>();

  // Subscribe to updates
  useEffect(() => {
    subscriber.subscribe((data: Snapshot<string>) => {
      setSubscriptionData(data);
      // Send notification when blog content is updated
      sendNotification("BlogUpdated" as NotificationType, `Blog "${title}" has been updated.`);
    });

    // Cleanup function to unsubscribe when component unmounts
    return () => {
      const data = {} as Snapshot<string>
      subscriber.notify(data)
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
