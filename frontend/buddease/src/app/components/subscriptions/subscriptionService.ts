import { subscriptionService } from '../../app/components/subscriptions/SubscriptionService';
 // Helper function to generate a unique event name based on user and snapshot
const getEventName = (userId: string, snapshotId: string) => `${userId}:${snapshotId}`;

function getSubscription(userId: string, snapshotId: string) {
  const eventName = getEventName(userId, snapshotId);
  
  // Retrieve the subscriptions for the given event
  const subscribers = subscriptionService.subscribers[eventName];
  
  if (subscribers && subscribers.length > 0) {
    // Return the first subscriber for simplicity; modify as needed
    return subscribers[0];
  }
  
  return null;
}

function removeSubscription(userId: string, snapshotId: string, callback: (data: any) => void) {
  const eventName = getEventName(userId, snapshotId);
  
  // Use the existing unsubscribe method from SubscriptionService
  subscriptionService.unsubscribe(eventName, callback);
}