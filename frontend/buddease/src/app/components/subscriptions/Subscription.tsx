import { SubscriberTypeEnum, SubscriptionTypeEnum } from "../models/data/StatusType";
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { SubscriberCallback } from '@/app/components/users/Subscriber';
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { TriggerIncentivesParams } from "@/app/components/utils/applicationUtils";
import { SubscriptionLevel } from "@/app/components/subscriptions/SubscriptionLevel";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { Attachment } from '@/app/components/documents/Attachment/attachment'

import { UnsubscribeDetails } from '@/app/components/event/DynamicEventHandlerExample';
import { Callback } from '@/app/components/snapshots/subscribeToSnapshotsImplementation';
import { BaseData } from '@/app/components/models/data/Data';
import { ModifiedDate } from '@/app/components/documents/DocType';

type FetchSnapshotByIdCallback<
  T extends BaseData<any, any, any, Attachment>,
  K extends T = T
> = {
  onSuccess: (snapshot: Snapshot<T, K>) => void;
  onError: (error: any) => void;
};

// Define the union type for Callback or SubscriberCallback
type SubscriberCallbackType<
  T extends BaseData<any, any, any, Attachment>,
  K extends T = T
> =
  | Callback<Snapshot<T, K>>
  | SubscriberCallback<T, K>;

// Type guard to check if a given callback is a SubscriberCallback
function isSubscriberCallback<
  T extends BaseData<any, any, any, Attachment>,
  K extends T = T
>(
  callback: SubscriberCallbackType<T, K>
): callback is SubscriberCallback<T, K> {
  return (
    (callback as SubscriberCallback<T, K>).handleCallback !== undefined &&
    (callback as SubscriberCallback<T, K>).snapshotCallback !== undefined
  );
}

// Define the type for the context (this) in the unsubscribe method
interface SubscriptionContext {
  subscribers: SubscriberCallbackType<any, any>[];
  onUnsubscribeCallbacks: Callback<any>[];
}

// Updated unsubscribe method with explicit type annotations
function unsubscribe<T extends BaseData<any, any, any, any>, K extends T = T>(
  this: SubscriptionContext,
  snapshotId: number,
  unsubscribe: UnsubscribeDetails,
  callback: SubscriberCallbackType<T, K>
) {
  // Check if callback is of type SubscriberCallback using the type guard
  if (isSubscriberCallback<T, K>(callback)) {
    // If it's a SubscriberCallback, handle accordingly
    const index = this.subscribers.indexOf(callback);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
      this.onUnsubscribeCallbacks.forEach((cb: Callback<any>) => cb(callback));
    }
  } else {
    // If it's a simple Callback<Snapshot<T, K>>, handle accordingly
    const index = this.subscribers.findIndex(
      (sub: SubscriberCallbackType<any, any>) => sub === callback
    );
    if (index !== -1) {
      this.subscribers.splice(index, 1);
      this.onUnsubscribeCallbacks.forEach((cb: Callback<any>) => cb(callback));
    }
  }
}


type Subscription<
  T extends BaseData<any, any, any, Attachment>,
  K extends T = T
> = {
    name?: string;
    subscriberId?: string;
    subscriptionId?: string;
    subscriberType?: SubscriberTypeEnum;
    subscriptionType?: SubscriptionTypeEnum;
    subscribers: SubscriberCollection<T, K>;
    data?: Snapshot<T, K>;
    triggerIncentives: ({ userId, incentiveType, params }: TriggerIncentivesParams) => void;
    getSubscriptionLevel: (price: number) => SubscriptionLevel | undefined;
    unsubscribe: (
      snapshotId: number, 
      unsubscribe: UnsubscribeDetails, 
      callback: SubscriberCallbackType<T, K> | null
    ) => void;
    portfolioUpdates: (
      { userId, snapshotId }: { userId: string; snapshotId: string }
    ) => void;
    tradeExecutions: (
      { userId, snapshotId, tradeExecutionType, tradeExecutionData }: {
        userId: string;
        snapshotId: string;
        tradeExecutionType: string;
        tradeExecutionData: any;
      }
    ) => void;
    marketUpdates: (
      { userId, snapshotId }: { userId: string; snapshotId: string }
    ) => void;
    communityEngagement: (
      { userId, snapshotId }: { userId: string; snapshotId: string }
    ) => void;
    getPlanName?: (
      { userId, snapshotId }: { userId: string; snapshotId: string }
    ) => SubscriberTypeEnum;
    portfolioUpdatesLastUpdated: number | ModifiedDate | null;
    getId?: () => string;
    determineCategory: (data: Snapshot<T, K>) => string | CategoryProperties | null;
    category?: Category | null;
    categoryProperties?: CategoryProperties | null;
    fetchSnapshotById?: (
      { userId, snapshotId }: { userId: string; snapshotId: string }
    ) => void;
    fetchSnapshotByIdCallback?: (
      { userId, snapshotId }: { userId: string; snapshotId: string },
      callback: FetchSnapshotByIdCallback<T, K>
    ) => void;
  };
  

  export type { Subscription, SubscriberCallbackType }