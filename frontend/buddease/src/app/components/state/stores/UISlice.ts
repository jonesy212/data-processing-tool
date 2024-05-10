import { WritableDraft } from '@/app/components/state/redux/ReducerGenerator';
// UISlice.ts
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { UIActions } from "../../actions/UIActions";
import { PhaseHookConfig } from "../../hooks/phaseHooks/PhaseHooks";
import { setIsDrawing } from "../redux/slices/DrawingSlice";
import { resetMilestones, resetTrackers } from "../redux/slices/TrackerSlice";
import { CollaborationState } from "../redux/slices/CollaborationSlice";
import { produce } from 'immer';

// Define interface for UI-related state
interface UIState {
  isLoading: boolean;
  error: string | null;
  showModal: boolean;
  notification: {
    message: string;
    type: "success" | "error" | "warning" | "info" | null;
  };
  currentPhase: PhaseHookConfig | null;
  previousPhase: PhaseHookConfig | null;
  isSidebarOpen: false,
  selectedTheme: 'light',
  selectedLanguage: 'en'
  pointerPosition: {
    x: 0,
    y: 0
  },
  isPointerDown: false,
  collaborationState: CollaborationState | null
  // Define UI-related state properties here
}




// Define initial state for UI
const initialState: UIState = {
  isLoading: false,
  error: null,
  showModal: false,
  notification: {
    message: "",
    type: null,
  },
  currentPhase: null,
  previousPhase: null,
  isSidebarOpen: false,
  selectedTheme: "light",
  selectedLanguage: "en",
  pointerPosition: {
    x: 0,
    y: 0
  },
  isPointerDown: false,
  collaborationState: null
};

// Create UI slice
export const useUIManagerSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Define reducers for UI actions here
    setLoading: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.isLoading = action.payload
      const { payload } = action;
      return {
        ...state,
        isLoading: payload
      };
    },
    setError: (
      state,
      action: PayloadAction<string>
    ) => {
      state.error = action.payload;
    },
    setShowModal: (state, action) => {
      state.showModal = action.payload;
    },
    setNotification: (state, action) => {
      state.notification = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearNotification: (state) => {
      state.notification.message = "";
      state.notification.type = null;
    },
    setCurrentPhase: (state, action) => {
      state.currentPhase = action.payload;
    },
    setPreviousPhase: (state, action) => {
      state.previousPhase = state.currentPhase;
      state.currentPhase = action.payload;
    },
    resetPhases: (state) => {
      state.currentPhase = null;
      state.previousPhase = null;
    },
    


    updateCollaborationState: (
      state,
      action: PayloadAction<WritableDraft<CollaborationState>>
    ) => {
      state.collaborationState = action.payload;

      state.collaborationState.documents =
        state.collaborationState.documents.map((doc) => {
          if (doc.filePath) {
            return {
              ...doc,
              filePath: produce(doc.filePath, (draftPath: any) => {
                if (draftPath.options.additionalOptions) {
                  draftPath.options.additionalOptions = [
                    ...draftPath.options.additionalOptions,
                  ];
                }
              }),
            };
          }
          return doc;
        });
    },

    resetUI: (state) => {
      Object.assign(state, initialState);
    },
    getGesterPosition: (
      state,
      action: PayloadAction<{ x: 0; y: 0 }>
    ) => {
      const { payload } = action;
      // Update the pointer position
      state.pointerPosition = { x: payload.x, y: payload.y };
      return state;
    },

    // You can also include additional UI-related actions as needed
  },
});

// Export actions from UI slice
export const {
  setLoading,
  setError,
  setShowModal,
  setNotification,
  clearError,
  clearNotification,
  setCurrentPhase,
  setPreviousPhase,
  resetPhases,
  updateCollaborationState
} = useUIManagerSlice.actions;

// Export the reducer for the UI slice
export const uiReducer = useUIManagerSlice.reducer;

// Create a UI manager hook
export const useUIManager = () => {
  const dispatch = useDispatch();


  const updateCollaborationState = (state: CollaborationState) => {
    dispatch(UIActions.updateCollaborationState(state));
  }
  // Define UI-related actions
  const stopDrawing = () => {
    // Dispatch actions from DrawingSlice to reset drawing-related state properties
    dispatch(
      UIActions.resetDrawingState({
        drawing: [], // Example: Array of drawings
        shapes: [], // Example: Array of shapes
        currentShape: null, // Example: Current selected shape
        selectedShapes: [], // Example: Array of selected shapes
      })
    );
    dispatch(resetTrackers()); // Reset trackers if needed
    dispatch(resetMilestones()); // Reset milestones if needed

    // Dispatch action from DrawingSlice to set isDrawing to false
    dispatch(setIsDrawing(false));

    // Perform any other necessary actions specific to your UI
  };

  // Return UI-related actions
  return { stopDrawing };
};
export type { UIState, produce };
