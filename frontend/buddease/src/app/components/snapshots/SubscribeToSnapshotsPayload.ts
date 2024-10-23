// SubscribeToSnapshotsPayload.ts
import { CategoryProperties } from "../../pages/personas/ScenarioBuilder";
import { BaseData } from "../models/data/Data";
import { Snapshot } from "./LocalStorageSnapshotStore";

interface SubscribeToSnapshotsPayload<T extends BaseData = any> {
    snapshotIds: string[]; // List of snapshot IDs to subscribe to
    subscriptionContext: string; // Context or purpose of the subscription
    filters?: Partial<T>; // Optional filters to apply to the snapshots during subscription
    includeMetaData?: boolean; // Flag to include/exclude metadata in the subscription updates
    categoryProperties?: CategoryProperties;;// Optional category properties related to the snapshots
    priority?: 'high' | 'normal' | 'low'; // Priority level for the subscription
    subscriptionType?: 'real-time' | 'on-demand'; // Type of subscription, e.g., real-time or on-demand
    callback: (snapshot: Snapshot<T, T>) => void; // Callback function to handle updates to subscribed snapshots
    customPayload?: Record<string, any>; // Custom data for special cases
  }
  
 
  export type { SubscribeToSnapshotsPayload };
