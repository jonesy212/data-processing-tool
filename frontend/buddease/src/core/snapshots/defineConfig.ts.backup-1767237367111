// defineConfig.ts

import { ModifiedDate } from "@/core/documents/DocType";
import { K, Meta, T } from '@/core/models/data/dataStoreMethods';
import { SubscriberTypeEnum, SubscriptionTypeEnum } from "@/core/models/data/StatusType";
import { snapshotConfig } from '@/core/snapshots/snapshotContainerUtils';
import { CustomSnapshotData } from "@/core/snapshots/SnapshotData";
import { payload, Subscriber } from "@/core/subscribers/Subscriber";
import { logActivity, notifyEventSystem, triggerIncentives, updateProjectState } from "@/utils/web3/applicationUtils";
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, UserConfigExport } from 'vite';

// Function to get the project ID from an environment variable or use a default value
function getProjectId() {
  return process.env.PROJECT_ID || "defaultProject";
}

const projectId = getProjectId();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '@/src'),
    },
  },
  define: {
    'process.env.PROJECT_ID': JSON.stringify(projectId)
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  },
  // Custom configuration
  data: snapshotConfig,
  payload: {
    projectId,
    userId: "1234567890",
  },
} as UserConfigExport);

// Example usage
const johnSubscriber = new Subscriber<T, CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
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
    getSubscriptionLevel: (price: number): any => {
      // You'll need to implement this or define SubscriptionLevel type
      return undefined;
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