// defineConfig.ts

import { defineConfig, UserConfigExport } from "vite";
import { ModifiedDate } from "../documents/DocType";
import { SubscriberTypeEnum, SubscriptionTypeEnum } from "../models/data/StatusType";
import { Subscriber, payload } from "../users/Subscriber";
import { notifyEventSystem, updateProjectState, logActivity, triggerIncentives } from "../utils/applicationUtils";
import { CustomSnapshotData } from "./LocalStorageSnapshotStore";
import { T } from "./SnapshotConfig";
import { snapshotConfig } from "./snapshotStoreConfigInstance";

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
  const johnSubscriber = new Subscriber<T, CustomSnapshotData>(
    payload.meta.id,
    // Assuming payload.name is a string, replace with your actual data structure
    payload.meta.name,
  
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
    },
    "subscriberId",
    notifyEventSystem,
    updateProjectState,
    logActivity,
    triggerIncentives,
    payload.meta.optionalData,
    payload.meta.data
  );
  