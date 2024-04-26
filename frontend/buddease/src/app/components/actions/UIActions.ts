// UIActions.tsx
import { createAction } from "@reduxjs/toolkit";
import React from "react";




interface FetchUserDataPayload {
  message: string;
  userData?: any;
  notificationType?: string;
  notificationMessage?: string;
  type?: "info" | "success" | "error" | "warning";
  onCancel?: () => void;
}

export type GesterEvent = React.TouchEvent<HTMLDivElement> & React.PointerEvent<HTMLDivElement>


export const UIActions = {
  setIsPointerDown: createAction<boolean>("setIsPointerDown"),
  setPointerPosition: createAction<{ x: number; y: number }>(
    "setPointerPosition"
  ),
  setGesturePosition: createAction<{gesturePosition: {
    payload: GesterEvent;
    type: string;
} }>("setGesturePosition"),
  setIsPointerInside: createAction<boolean>("setIsPointerInside"),
  setIsPointerHovering: createAction<boolean>("setIsPointerHovering"),
  setIsAuxClicked: createAction<boolean>("setIsAuxClicked"),
  setIsGestureActive: createAction<boolean>("setIsGestureActive"),

  setLoading: createAction<boolean>("setLoading"),
  setError: createAction<string>("setError"),
  setShowModal: createAction<boolean>("setShowModal"),
  setNotification: createAction<{
    message: string;
    type: "success" | "error" | "warning" | "info" | null;
  }>("setNotification"),
  clearError: createAction("clearError"),
  clearNotification: createAction("clearNotification"),
  setCurrentPhase: createAction<any>("setCurrentPhase"),
  setPreviousPhase: createAction<any>("setPreviousPhase"),
  resetPhases: createAction("resetPhases"),
  resetUI: createAction("resetUI"),
  addUINotification: createAction<{
    message: string;
    type: string;
    isDarkMode: boolean;
  }>("addUINotification"),
  resetDrawingState: createAction<{
    drawing: string[]; // Example: Array of drawings
    shapes: string[]; // Example: Array of shapes
    currentShape: null; // Example: Current selected shape
    selectedShapes: string[]; // Example: Array of selected shapes
  }>("resetDrawingState"),
  fetchUserDataAndDisplayNotification: createAction<FetchUserDataPayload>(
    "fetchUserDataAndDisplayNotification"
  ),
  // Add more actions as needed
  setRealtimeData: createAction<{ data: any; type: string }>("setRealtimeData"),

  getGesturePosition: createAction<GesterEvent>("getGesturePosition"),
}


export type { FetchUserDataPayload };

