// SecurityActions.ts
import { createAction } from "@reduxjs/toolkit";
import { SecurityEvent } from "../state/redux/slices/SecurityEventSlice";

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
