import { SubscriptionPayload } from "../actions/SubscriptionActions";
import { BaseDataEntity, DefaultMeta } from './BaseConfig';
import { Payload, UpdateSnapshotPayload } from "@/server/database/Payload";
import { CustomSnapshotData } from "./SnapshotData";
import { Subscriber } from '@/app/components/users/Subscriber';
import { notifyEventSystem, updateProjectState, logActivity, triggerIncentives } from "../utils/applicationUtils";
import { SubscriberTypeEnum, SubscriptionTypeEnum } from "../models/data/StatusType";
import { getSubscriptionLevel } from '@/app/components/subscriptions/SubscriptionLevel';
import { ModifiedDate } from "../documents/DocType";
import { determineCategory } from "../libraries/categories/determineCategory";

type SubscriptionPayloadActions = SubscriptionPayload<any, any> & Payload

const convertSubscriptionPayloadToSubscriber = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>(
  payload: SubscriptionPayload<T, K, Meta, ExcludedFields>
): Subscriber<CustomSnapshotData<T, K, Meta>, CustomPayload<T, K, Meta>> => {
  const subscriber = new Subscriber<CustomSnapshotData<T, K, Meta>, CustomPayload<T, K, Meta>>(
    payload.id,
    // Assuming payload.name is a string, replace with your actual data structure
    payload.name,
    {
      subscribers: payload.subscribers,
      getSubscriptionLevel: getSubscriptionLevel,
      subscriberId: payload.subscriberId,
      subscriberType: SubscriberTypeEnum.FREE, // or appropriate value
      subscriptionType: SubscriptionTypeEnum.Snapshot, // or appropriate value
      getPlanName: () => SubscriberTypeEnum.FREE, // or appropriate function
      portfolioUpdates: () => {},
      tradeExecutions: () => {},
      marketUpdates: () => {},
      communityEngagement: () => {},
      triggerIncentives: () => {},
      unsubscribe: () => { },
      determineCategory: determineCategory,
      portfolioUpdatesLastUpdated: {
        value: new Date(),
        isModified: false,

      } as ModifiedDate,
    },
    payload.subscriberId,
    notifyEventSystem, // Replace with your actual function
    updateProjectState, // Replace with your actual function
    logActivity, // Replace with your actual function
    triggerIncentives, // Replace with your actual function
    {
      email: payload.email,
      timestamp: new Date(),
      value: payload.value,
      category: payload.category || "",
    }
  );

  return subscriber;
};


export type { SubscriptionPayloadActions }
export { convertSubscriptionPayloadToSubscriber }