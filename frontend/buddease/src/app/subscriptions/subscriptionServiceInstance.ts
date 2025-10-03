import { BaseData } from '@/app/components/models/data/Data';
import { determineSubscriberType } from "@/app/subscriptions/SubscriptionLevel";
import { getSubscriptionLevel } from "@/app/subscriptions/SubscriptionLevel";
import { subscriptionServiceInstance } from "@/app/hooks/dynamicHooks/dynamicHooks";
import { Data } from "@/app/models/data/Data";
import { Subscriber } from "@/app/users/Subscriber";
import { Subscription } from "./Subscription";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { SubscriberCollection } from '@/app/users/SubscriberCollection'
 // Helper function to generate a unique event name based on user and snapshot
const getEventName = (userId: string, snapshotId: string) => `${userId}:${snapshotId}`;


function getSubscription<T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  userId: string,
  snapshotId: string
): { subscription: Subscription<T, K> | null; subscriber: Subscriber<T, K> | null } {
  const eventName = getEventName(userId, snapshotId);
  const subscribers = subscriptionServiceInstance.subscribers<T, K>(userId, snapshotId);

  if (subscribers && Object.keys(subscribers).length > 0) {
    const subscriber = Object.values(subscribers)[0] as Subscriber<T, K>;

    // Create safe accessors for potentially undefined properties
    const subscription: Subscription<T, K> = {
      name: subscriber.getName?.(),
      subscriberId: subscriber.getSubscriberId?.(),
      subscriptionId: subscriber.getSubscriptionId?.(),
      subscriberType: subscriber.getSubscriptionLevel 
        ? determineSubscriberType(subscriber.getSubscriptionLevel())
        : undefined,
      subscriptionType: subscriber.subscriptionType,
      subscribers: subscriber.getSubscribers ?? [],
      data: subscriber.getSubscription?.().data,
      getSubscriptionLevel: subscriber.getSubscriptionLevel?.bind(subscriber),
      unsubscribe: subscriber.unsubscribe?.bind(subscriber),
      portfolioUpdates: subscriber.portfolioUpdates?.bind(subscriber),
      tradeExecutions: subscriber.tradeExecutions?.bind(subscriber),
      marketUpdates: subscriber.marketUpdates?.bind(subscriber),
      triggerIncentives: subscriber.triggerIncentives?.bind(subscriber),
      communityEngagement: subscriber.communityEngagement?.bind(subscriber),
      getPlanName: subscriber.getPlanName?.bind(subscriber),
      portfolioUpdatesLastUpdated: subscriber.portfolioUpdatesLastUpdated,
      getId: subscriber.getId?.bind(subscriber),
      determineCategory: subscriber.determineCategory?.bind(subscriber),
      category: subscriber.category,
      categoryProperties: subscriber.categoryProperties,
      fetchSnapshotById: subscriber.fetchSnapshotById?.bind(subscriber),
      fetchSnapshotByIdCallback: subscriber.fetchSnapshotByIdCallback?.bind(subscriber),
    };

    return {
      subscription,
      subscriber: {
        ...subscriber,
        snapshotId
      },
    };
  }

  return { subscription: null, subscriber: null };
}

function removeSubscription(userId: string, snapshotId: string, subscriptionUsage: string,  callback: (data: any) => void) {
  const eventName = getEventName(userId, snapshotId);

  // Use the existing unsubscribe method from subscriptionServiceInstance
  subscriptionServiceInstance.unsubscribe(eventName, subscriptionUsage, callback);
}


export { getSubscription, removeSubscription };


// Example usage
const userId = "user123";
const snapshotId = "snapshot456";
const subscription = getSubscription<BaseData<any>, BaseData<any>>(userId, snapshotId);

if (subscription && subscription.getSubscriptionLevel().name !== undefined ) {
  const price: any = subscription.getSubscriptionPrice(); // Ensure price is assigned a value

  console.log(`Subscriber type: ${subscription.subscriberType}`);
  console.log(`Subscription level: ${subscription.getSubscriptionLevel(price).name}`);
  console.log(`Subscription data:`, subscription.data);
} else {
  console.log("No subscription found for the given user and snapshot.");
}
