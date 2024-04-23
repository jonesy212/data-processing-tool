// UIActions.tsx
import { createAction } from "@reduxjs/toolkit";

export const UIActions = {
  setLoading: createAction<boolean>("setLoading"),
  setError: createAction<string>("setError"),
  setShowModal: createAction<boolean>("setShowModal"),
  setNotification: createAction<{ message: string; type: "success" | "error" | "warning" | "info" | null }>("setNotification"),
  clearError: createAction("clearError"),
  clearNotification: createAction("clearNotification"),
  setCurrentPhase: createAction<any>("setCurrentPhase"),
  setPreviousPhase: createAction<any>("setPreviousPhase"),
  resetPhases: createAction("resetPhases"),
  resetUI: createAction("resetUI"),
  // Add more actions as needed
};
