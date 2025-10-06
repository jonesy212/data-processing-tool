import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { TriggerIncentivesParams } from "@/app/components/utils/applicationUtils";
import { Attachment } from '@/app/documents/Attachment/attachment';
import { SubscriberTypeEnum, SubscriptionTypeEnum } from "@/app/models/data/StatusType";
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SubscriberCallback } from '@/app/subscribers/Subscriber';
import { SubscriptionLevel } from "@/app/subscriptions/SubscriptionLevel";
import { SubscriberCollection } from '@/app/users/SubscriberCollection';

import { UnsubscribeDetails } from '@/app/components/event/DynamicEventHandlerExample';
import { BaseData } from '@/app/models/data/Data';
import { ModifiedDate } from '@/app/documents/DocType';
import { InitializedData } from '@/app/snapshots/SnapshotStoreOptions';
import { Callback } from '@/app/snapshots/subscribeToSnapshotsImplementation';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

type FetchSnapshotByIdCallback<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = never
> = {
  onSuccess: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onError: (error: any) => void;
};

// Define the union type for Callback or SubscriberCallback
type SubscriberCallbackType<
  T extends BaseData<any, any, any, Attachment>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = never
> =
  | Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  | SubscriberCallback<T, K, Meta, ExcludedFields>;


interface SubscriberCallback<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = never
> {
  handleCallback: () => void;
  snapshotCallback: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
}


// Type guard to check if a given callback is a SubscriberCallback
function isSubscriberCallback<
  T extends BaseData<any, any, any, Attachment>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = never
>(
  callback: SubscriberCallbackType<T, K, Meta, ExcludedFields>
): callback is SubscriberCallback<T, K, Meta, ExcludedFields> {
  return (
    (callback as SubscriberCallback<T, K, Meta, ExcludedFields>).handleCallback !== undefined &&
    (callback as SubscriberCallback<T, K, Meta, ExcludedFields>).snapshotCallback !== undefined
  );
}

// Define the type for the context (this) in the unsubscribe method
interface SubscriptionContext {
  subscribers: SubscriberCallbackType<any, any, any, any>[];
  onUnsubscribeCallbacks: Callback<any>[];
} 

// Updated unsubscribe method with explicit type annotations
function unsubscribe<
  T extends BaseData<any, any, any, any>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = never
>(
  this: SubscriptionContext,
  snapshotId: number,
  unsubscribe: UnsubscribeDetails,
  callback: SubscriberCallbackType<T, K, Meta, ExcludedFields>
) {
  // Check if callback is of type SubscriberCallback using the type guard
  if (isSubscriberCallback<T, K, Meta, ExcludedFields>(callback)) {
    // If it's a SubscriberCallback, handle accordingly
    const index = this.subscribers.indexOf(callback);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
      this.onUnsubscribeCallbacks.forEach((cb: Callback<any>) => cb(callback));
    }
  } else {
    // If it's a simple Callback<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>, handle accordingly
    const index = this.subscribers.findIndex(
      (sub: SubscriberCallbackType<any, any, any, any>) => sub === callback
    );
    if (index !== -1) {
      this.subscribers.splice(index, 1);
      this.onUnsubscribeCallbacks.forEach((cb: Callback<any>) => cb(callback));
    }
  }
}


type Subscription<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
    name?: string;
    subscriberId?: string;
    subscriptionId?: string;
    subscriberType?: SubscriberTypeEnum;
    subscriptionType?: SubscriptionTypeEnum;
    subscribers: SubscriberCollection<T, K, Meta, ExcludedFields>;
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data?: InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;
    triggerIncentives: ({ userId, incentiveType, params }: TriggerIncentivesParams) => void;
    getSubscriptionLevel: (price: number) => SubscriptionLevel | undefined;
    unsubscribe: (
      snapshotId: number, 
      unsubscribe: UnsubscribeDetails, 
      callback: SubscriberCallbackType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
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
    determineCategory: (data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => string | CategoryProperties | null;
    category?: string | symbol | Category | null;
    categoryProperties?: CategoryProperties | null;
    fetchSnapshotById?: (
      { userId, snapshotId }: { userId: string; snapshotId: string }
    ) => void;
    fetchSnapshotByIdCallback?: (
      { userId, snapshotId }: { userId: string; snapshotId: string },
      callback: FetchSnapshotByIdCallback<T, K>
    ) => void;
  };
  

  export type { SubscriberCallbackType, Subscription };
