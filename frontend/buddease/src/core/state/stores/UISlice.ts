// UISlice.ts
import { UIActions } from "@/core/actions/UIActions";
import { WritableDraft } from "@/core/state/redux/ReducerGenerator";
import { CollaborationState } from "@/core/state/redux/slices/CollaborationSlice";
import { setIsDrawing } from "@/core/state/redux/slices/DrawingSlice";
import { resetMilestones, resetTrackers } from "@/core/state/redux/slices/TrackerSlice";
import {
    CollaboratorAttachment,
    CollaboratorEntity,
    CollaboratorExcludedFields,
    CollaboratorIncludedFields,
    CollaboratorK,
    CollaboratorMeta
} from '@/core/typings/entities/CollaboratorEntity';
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";

// Create a type alias for the collaboration state with concrete types
type ConcreteCollaborationState = CollaborationState<CollaboratorEntity,
  CollaboratorK,
  CollaboratorMeta,
  CollaboratorAttachment,
  CollaboratorExcludedFields,
  CollaboratorIncludedFields>;

// Define interface for UI-related state
interface UIState {
  // Layout
  currentPage: string | null;
  currentLayout: string | null;
  isSidebarOpen: boolean;
  showModal: boolean;
  
  // Loading & Errors
  isLoading: boolean;
  error: string | null;
  
  // Interaction
  pointerPosition: {
    x: number;
    y: number;
  };
  isPointerDown: boolean;
  
  // Phase Management
  currentPhase: string | null;
  previousPhase: string | null;
  
  // Notification
  notification: {
    message: string;
    type: string | null;
  };
  
  // Theme & Language
  selectedTheme: string;
  selectedLanguage: string;
  
  // Collaboration
  collaborationState: ConcreteCollaborationState | null;
}

// Define initial state for UI
const initialState: UIState = {
  isLoading: false,
  error: null,
  showModal: false,
  currentPage: null,
  currentLayout: null,
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

type DraftCollaborationState = WritableDraft<ConcreteCollaborationState>;

// Create UI slice
export const useUIManagerSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Loading & Error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Modal & Notification
    setShowModal: (state, action: PayloadAction<boolean>) => {
      state.showModal = action.payload;
    },
    setNotification: (
      state, 
      action: PayloadAction<{ message: string; type: string | null }>
    ) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification.message = "";
      state.notification.type = null;
    },
    
    // Layout & Navigation
    setCurrentPage: (state, action: PayloadAction<string | null>) => {
      state.currentPage = action.payload;
    },
    setCurrentLayout: (state, action: PayloadAction<string | null>) => {
      state.currentLayout = action.payload;
    },
    setIsSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    
    // Theme & Language
    setSelectedTheme: (state, action: PayloadAction<string>) => {
      state.selectedTheme = action.payload;
    },
    setSelectedLanguage: (state, action: PayloadAction<string>) => {
      state.selectedLanguage = action.payload;
    },
    
    // Interaction
    setPointerPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.pointerPosition = action.payload;
    },
    setIsPointerDown: (state, action: PayloadAction<boolean>) => {
      state.isPointerDown = action.payload;
    },
    getGesturePosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.pointerPosition = action.payload;
    },
    
    // Phase Management
    setCurrentPhase: (state, action: PayloadAction<string | null>) => {
      state.currentPhase = action.payload;
    },
    setPreviousPhase: (state, action: PayloadAction<string | null>) => {
      state.previousPhase = action.payload;
    },
    resetPhases: (state) => {
      state.currentPhase = null;
      state.previousPhase = null;
    },
    
    // Collaboration State
    updateCollaborationState: (state, action: PayloadAction<DraftCollaborationState>) => {
      const newState = action.payload;
      
      // Process documents if they exist
      if (newState.documents) {
        newState.documents.forEach((doc) => {
          const additionalOptions = doc.filePath?.options?.additionalOptions;
          
          if (additionalOptions !== undefined && additionalOptions !== null) {
            // Handle different types of additionalOptions
            if (Array.isArray(additionalOptions)) {
              // It's already an array, spread it
              doc.filePath!.options!.additionalOptions = [...additionalOptions];
            } else if (typeof additionalOptions === 'string') {
              // Convert string to array
              doc.filePath!.options!.additionalOptions = [additionalOptions];
            } else if (typeof additionalOptions === 'number') {
              // Convert number to array
              doc.filePath!.options!.additionalOptions = [additionalOptions];
            } else {
              // For any other type, wrap in array
              doc.filePath!.options!.additionalOptions = [additionalOptions];
            }
          }
        });
      }
      
      state.collaborationState = newState;
    },
    // Reset
    resetUI: (state) => {
      Object.assign(state, initialState);
    },
  },
});

// Export actions from UI slice
export const {
  setLoading,
  setError,
  clearError,
  setShowModal,
  setNotification,
  clearNotification,
  setCurrentPage,
  setCurrentLayout,
  setIsSidebarOpen,
  setSelectedTheme,
  setSelectedLanguage,
  setPointerPosition,
  setIsPointerDown,
  getGesturePosition,
  setCurrentPhase,
  setPreviousPhase,
  resetPhases,
  updateCollaborationState,
  resetUI,
} = useUIManagerSlice.actions;

// Export the reducer for the UI slice
export const uiReducer = useUIManagerSlice.reducer;

// Create a UI manager hook
export const useUIManager = () => {
  const dispatch = useDispatch();

  const updateCollaborationState = (state: DraftCollaborationState) => {
    dispatch(useUIManagerSlice.actions.updateCollaborationState(state));
  };
  
  const setLoading = (isLoading: boolean) => {
    dispatch(useUIManagerSlice.actions.setLoading(isLoading));
  };
  
  const setError = (error: string) => {
    dispatch(useUIManagerSlice.actions.setError(error));
  };
  
  const clearError = () => {
    dispatch(useUIManagerSlice.actions.clearError());
  };
  
  const setCurrentPhase = (phase: string | null) => {
    dispatch(useUIManagerSlice.actions.setCurrentPhase(phase));
  };
  
  const setPreviousPhase = (phase: string | null) => {
    dispatch(useUIManagerSlice.actions.setPreviousPhase(phase));
  };
  
  const resetPhases = () => {
    dispatch(useUIManagerSlice.actions.resetPhases());
  };
  
  // Define UI-related actions
  const stopDrawing = () => {
    // Dispatch actions from DrawingSlice to reset drawing-related state properties
    dispatch(
      UIActions.resetDrawingState({
        drawing: [],
        shapes: [],
        currentShape: null,
        selectedShapes: [],
      })
    );
    dispatch(resetTrackers());
    dispatch(resetMilestones());
    dispatch(setIsDrawing(false));
  };

  // Return UI-related actions
  return { 
    stopDrawing,
    updateCollaborationState,
    setLoading,
    setError,
    clearError,
    setCurrentPhase,
    setPreviousPhase,
    resetPhases,
  };
};

export type { ConcreteCollaborationState, UIState };
