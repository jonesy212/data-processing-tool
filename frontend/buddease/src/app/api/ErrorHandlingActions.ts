// ErrorHandlingActions.ts
import { createAction } from "@reduxjs/toolkit";

export const ErrorHandlingActions = {
  // Standard actions
  setError: createAction<string>("setError"),
  clearError: createAction("clearError"),
  logError: createAction<string>("logError"),

  // Error-specific actions
  triggerAction: createAction("triggerAction"), // You can adjust the payload type as needed

  // Add more actions as needed
};
