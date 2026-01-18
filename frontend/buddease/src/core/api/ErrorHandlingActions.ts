// ErrorHandlingActions.ts
import { createAction } from "@reduxjs/toolkit";

export const ErrorHandlingActions = {
  // Standard actions
  setError: createAction<string>("setError"),
  clearError: createAction("clearError"),
  logError: createAction<string>("logError"),

  // Error-specific actions
  triggerAction: createAction("triggerAction"), // You can adjust the payload type as needed
  handleNotificationError: createAction("HANDLE_NOTIFICATION_ERROR"), // New action for handling notification errors
  handleOtherError: createAction("HANDLE_OTHER_ERROR"), // New action for handling other errors

  // Add more actions as needed
};
