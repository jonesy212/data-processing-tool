import { BaseData } from '@/app/components/models/data/Data';
import { SubscriberCollection } from "@/app/components/snapshots/SnapshotStore";
import { determineSubscriberType } from "@/app/components/subscriptions/SubscriptionLevel";
import { subscriptionServiceInstance } from "../hooks/dynamicHooks/dynamicHooks";
import { Data } from "../models/data/Data";
import { Subscriber } from "../users/Subscriber";
import { Subscription } from "./Subscription";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';

 // Helper function to generate a unique event name based on user and snapshot
const getEventName = (userId: string, snapshotId: string) => `${userId}:${snapshotId}`;


function getSubscription<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  userId: string,
  snapshotId: string
): { subscription: Subscription<T, K> | null; subscriber: Subscriber<T, K> | null } {
  const eventName = getEventName(userId, snapshotId);
  // Retrieve the subscribers using the subscriptionServiceInstance's subscribers method
  const subscribers: SubscriberCollection<T, K> | null = subscriptionServiceInstance.subscribers<T, K>(userId, snapshotId);

  if (subscribers && Object.keys(subscribers).length > 0) {
    // Get the first subscriber
    const subscriber = Object.values(subscribers)[0];

    // Ensure the subscriber has a valid type
    const validSubscriber = subscriber as Subscriber<T, K>; // Replace Subscriber with the actual type of the subscriber

    const subscription: Subscription<T, K> = {
      name: validSubscriber.getName(),
      subscriberId: validSubscriber.getSubscriberId(),
      subscriptionId: validSubscriber.getSubscriptionId(),
      subscriberType: determineSubscriberType(validSubscriber.getSubscriptionLevel()),
      subscriptionType: validSubscriber.subscriptionType,
      subscribers: validSubscriber.getSubscribers(),
      data: validSubscriber.getSubscription().data,
      getSubscriptionLevel: validSubscriber.getSubscriptionLevel,
      unsubscribe: validSubscriber.unsubscribe,
      portfolioUpdates: validSubscriber.portfolioUpdates,
      tradeExecutions: validSubscriber.tradeExecutions,
      marketUpdates: validSubscriber.marketUpdates,
      triggerIncentives: validSubscriber.triggerIncentives,
      communityEngagement: validSubscriber.communityEngagement,
      getPlanName: validSubscriber.getPlanName,
      portfolioUpdatesLastUpdated: validSubscriber.portfolioUpdatesLastUpdated,
      getId: validSubscriber.getId,
      determineCategory: validSubscriber.determineCategory,
      category: validSubscriber.category,
      categoryProperties: validSubscriber.categoryProperties,
      fetchSnapshotById: validSubscriber.fetchSnapshotById,
      fetchSnapshotByIdCallback: validSubscriber.fetchSnapshotByIdCallback,
    };

    return {
      subscription, // Return the subscription object
      subscriber: {
        ...validSubscriber,
        snapshotId: snapshotId, // Include the snapshotId in the subscriber return
      },
    }; // Return both subscription and subscriber
  }

  return { subscription: null, subscriber: null }; // Return nulls if no subscribers found
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
const subscription = getSubscription<Data, Data>(userId, snapshotId);

if (subscription && subscription.getSubscriptionLevel().name !== undefined ) {
  const price
  console.log(`Subscriber type: ${subscription.subscriberType}`);
  console.log(`Subscription level: ${subscription.getSubscriptionLevel(price).name}`);
  console.log(`Subscription data:`, subscription.data);
} else {
  console.log("No subscription found for the given user and snapshot.");
}
