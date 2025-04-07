// defineConfig.ts

import { defineConfig, UserConfigExport } from "vite";
import { ModifiedDate } from "../documents/DocType";
import { SubscriberTypeEnum, SubscriptionTypeEnum } from "../models/data/StatusType";
import { Subscriber, payload } from "../users/Subscriber";
import { notifyEventSystem, updateProjectState, logActivity, triggerIncentives } from "../utils/applicationUtils";
import { T , K, Meta } from "@/app/components/models/data/dataStoreMethods";
import { snapshotConfig } from "./snapshotStoreConfigInstance";
import { CustomSnapshotData } from "@/app/components/snapshots/SnapshotData";


// Function to get the project ID from an environment variable or use a default value
function getProjectId() {
    return process.env.PROJECT_ID || "defaultProject";
  }
  
  const projectId = getProjectId();
  
  export default defineConfig({
    data: snapshotConfig,
    payload: {
      projectId,
      userId: "1234567890",
    },
  } as UserConfigExport);
  



// Example usage
const johnSubscriber = new Subscriber<T, CustomSnapshotData<T, K, Meta>>(
  payload.meta?.id ?? 'default-id', // Fallback to 'default-id' if meta or id is undefined
  payload.meta?.name ?? 'default-name', // Fallback to 'default-name'
  {
    subscriberId: "1",
    subscriberType: SubscriberTypeEnum.STANDARD,
    subscriptionType: SubscriptionTypeEnum.PortfolioUpdates,
    getPlanName: () => SubscriberTypeEnum.STANDARD,
    portfolioUpdates: () => { },
    tradeExecutions: () => { },
    marketUpdates: () => { },
    communityEngagement: () => { },
    unsubscribe: () => { },
    portfolioUpdatesLastUpdated: {} as ModifiedDate,
    getId: () => "1",
    triggerIncentives: () => { },
    determineCategory: (data: any) => data.category,
    subscribers: [],
    getSubscriptionLevel: (price: number): SubscriptionLevel | undefined => {

    }
  },
  "subscriberId",
  notifyEventSystem,
  updateProjectState,
  logActivity,
  triggerIncentives,
  payload.meta?.optionalData,
  payload.meta?.data 
);
  