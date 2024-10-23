import { subscriptionService } from "../hooks/dynamicHooks/dynamicHooks";
import { Data } from "../models/data/Data";
import { Subscription } from "./Subscription";

 // Helper function to generate a unique event name based on user and snapshot
const getEventName = (userId: string, snapshotId: string) => `${userId}:${snapshotId}`;

function getSubscription<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(userId: string, snapshotId: string): Subscription<T, Meta, K> | null {
  const eventName = getEventName(userId, snapshotId);
  
  // Retrieve the subscribers using the subscriptionService's subscribers method
  const subscribers = subscriptionService.subscribers(eventName, snapshotId);

  
  
  if (subscribers && Object.keys(subscribers).length > 0) {
    // Get the first subscriber
    const subscriber = Object.values(subscribers)[0];

   return {
      name: subscriber.name,
      subscriberId: subscriber.subscriberId,
      subscriptionId: subscriber.subscriptionId,
      subscriberType: determineSubscriberType(subscriber.getSubscriptionLevel()),
      subscriptionType: subscriber.subscriptionType,
      subscribers: subscriber.subscribers,
      data: subscriber.getSubscription().data,
      getSubscriptionLevel: subscriber.getSubscriptionLevel,
      unsubscribe: subscriber.unsubscribe,
      portfolioUpdates: subscriber.portfolioUpdates,
      tradeExecutions: subscriber.tradeExecutions,
      marketUpdates: subscriber.marketUpdates,
      triggerIncentives: subscriber.triggerIncentives,
      communityEngagement: subscriber.communityEngagement,
      getPlanName: subscriber.getPlanName,
      portfolioUpdatesLastUpdated: subscriber.portfolioUpdatesLastUpdated,
      getId: subscriber.getId,
      determineCategory: subscriber.determineCategory,
      category: subscriber.category,
      categoryProperties: subscriber.categoryProperties,
      fetchSnapshotById: subscriber.fetchSnapshotById,
      fetchSnapshotByIdCallback: subscriber.fetchSnapshotByIdCallback
    };
  }

  return null;
}

function removeSubscription(userId: string, snapshotId: string, subscriptionUsage: string,  callback: (data: any) => void) {
  const eventName = getEventName(userId, snapshotId);

  // Use the existing unsubscribe method from subscriptionService
  subscriptionService.unsubscribe(eventName, subscriptionUsage, callback);
}




export { getSubscription, removeSubscription };


// Example usage
const userId = "user123";
const snapshotId = "snapshot456";
const subscription = getSubscription<Data, Data>(userId, snapshotId);

if (subscription) {
  console.log(`Subscriber type: ${subscription.subscriberType}`);
  console.log(`Subscription level: ${subscription.getSubscriptionLevel().name}`);
  console.log(`Subscription data:`, subscription.data);
} else {
  console.log("No subscription found for the given user and snapshot.");
}

function determineSubscriberType(arg0: any) {
  throw new Error("Function not implemented.");
}
