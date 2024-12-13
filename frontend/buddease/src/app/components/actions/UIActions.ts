// UIActions.tsx
import { createAction } from "@reduxjs/toolkit";
import React from "react";
import { Progress } from "../models/tracker/ProgressBar";
import { SearchResultWithQuery } from "../routing/SearchResult";
import { CollaborationState } from "../state/redux/slices/CollaborationSlice";
import { CollaborationData } from "../pages/commuunityCollaborationDate";
import { K } from "@/app/components/models/data/dataStoreMethods";


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
  updateCollaborationState: createAction<CollaborationState<CollaborationData, K>>("updateCollaborationState"),
  setIsGestureInProgress: createAction<boolean>("setIsGestureInProgress"),
  setGestureStartPosition: createAction<{ x: number; y: number }>("setGestureStartPosition"),
  setGestureCurrentPosition: createAction<{ x: number; y: number }>("setGestureCurrentPosition"),
  updateSearchResults: createAction<SearchResultWithQuery<any>[]>("updateSearchResults"),
  updateUIProgressBar: createAction<Progress>("updateUIProgressBar"),
  disableFeatures: createAction<{features: string[]}>("disableFeatures"),
  showDeactivationMessage: createAction<FetchUserDataPayload>("showDeactivationMessage"),
  showActivationMessage: createAction<FetchUserDataPayload>("showActivationMessage"),
  enableFeatures: createAction<{features: string[]}>("enableFeatures"),
  setIsPointerDown: createAction<boolean>("setIsPointerDown"),
  setPointerPosition: createAction<{ x: number; y: number }>(
    "setPointerPosition"
  ),
  performUIActions: createAction<FetchUserDataPayload | null>("performUIActions"),
  setGesturePosition: createAction<{gesturePosition: {
    payload: GesterEvent;
    type: string;
} }>("setGesturePosition"),
  setIsPointerInside: createAction<boolean>("setIsPointerInside"),
  setIsPointerHovering: createAction<boolean>("setIsPointerHovering"),
  setIsAuxClicked: createAction<boolean>("setIsAuxClicked"),
  setIsGestureActive: createAction<boolean>("setIsGestureActive"),
  updateContextMenuUI: createAction<{ 
    isOpen: boolean;
    x: number;
    y: number;
  }>("updateContextMenuUI"),
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
  updateUIWithTodoDetails: createAction<{ 
    todoId: string;
    todoDetails: {
      title: string;
      description: string;
    };
  }>("updateUIWithTodoDetails"),
  mouseDown: createAction < {
      position: {
      x: number;
      y: number;
    }
  }>("mouseDown"),
  updateUI: createAction<{ 
    state: {
      // UI state

    }
  }>("updateUI"),
  resetDrawingState: createAction<{
    drawing: string[]; // Example: Array of drawings
    shapes: string[]; // Example: Array of shapes
    currentShape: null; // Example: Current selected shape
    selectedShapes: string[]; // Example: Array of selected shapes
  }>("resetDrawingState"),
  fetchUserDataAndDisplayNotification: createAction<FetchUserDataPayload>(
    "fetchUserDataAndDisplayNotification"
  ),


  toggleSettingsPanel: createAction<boolean>("toggleSettingsPanel"),
  updateSettingsPanelState: createAction<{
    settings: {
      isOpen: boolean;
      // settings state
    }
  }>("updateSettingsPanelState"),
  
  toggleHelpFAQPanel: createAction<boolean>("toggleHelpFAQPanel"),
  // Add more actions as needed
  setRealtimeData: createAction<{ data: any; type: string }>("setRealtimeData"),
  updateHelpFAQPanelState: createAction<{ 
    helpFAQ: {
      isOpen: boolean;
      // helpFAQ state

    }
  }>("updateHelpFAQPanelState"),
  getGesturePosition: createAction<GesterEvent>("getGesturePosition"),


  updateScrollingState: createAction<number>("updateScrollingState"),

  setProgress: createAction<number>('setProgress'),
  calculateProgressPercentage: createAction,
  fetchAndDisplayNotifications: createAction<{ addNotification: Function, clearNotifications: Function }>("fetchAndDisplayNotifications"),

}


export type { FetchUserDataPayload };

