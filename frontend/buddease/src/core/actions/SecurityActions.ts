SecurityActions.ts
import { SecurityEvent } from "@/core/state/redux/slices/SecurityEventSlice";
import { createAction } from "@reduxjs/toolkit";

interface FetchSecurityEventDataPayload {
  message: string;
  securityEvents?: SecurityEvent[];
  notificationType?: string;
  notificationMessage?: string;
  type?: "info" | "success" | "error" | "warning";
  onCancel?: () => void;
}

export const SecurityActions = {
  fetchSecurityEvents: createAction("fetchSecurityEvents"),
  analyzeSecurityEvents: createAction<SecurityEvent[]>("analyzeSecurityEvents"),
  showSecurityEventMessage: createAction<FetchSecurityEventDataPayload>("showSecurityEventMessage"),
  // Add more actions as needed
};

export type { FetchSecurityEventDataPayload };
