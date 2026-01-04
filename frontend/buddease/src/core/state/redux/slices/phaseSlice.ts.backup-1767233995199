// PhaseSlice.ts
import { PhaseHookConfig } from '@/core/hooks/phaseHooks/PhaseHooks';
import { WritableDraft } from './../ReducerGenerator';
// phases/usePhaseSlice.ts
import { CustomPhaseHooks, Phase } from '@/core/models/phases/Phase';
import { PhaseAttachment, PhaseEntity, PhaseExcludedFields, PhaseIncludedFields, PhaseK, PhaseMeta } from '@/core/typings/entities/PhaseEntity';
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Updated PhaseState to use your entity pattern
interface PhaseState {
  currentPhase: PhaseHookConfig | null;
  previousPhase: PhaseHookConfig | null;
  phases: { [key: string]: CustomPhaseHooks<PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields> };
  phaseRegistry: { [key: string]: Phase<PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields> };
}

// Define the initial state for the phases
const initialState: PhaseState = {
  currentPhase: null,
  previousPhase: null,
  phases: {},
  phaseRegistry: {}
};

// Create a slice for managing phases
export const usePhaseManagerSlice = createSlice({
  name: "phase",
  initialState,
  reducers: {
    // Add an action to add a phase
    addPhase: (state, action: PayloadAction<{ 
      phaseName: string; 
      phaseHooks: CustomPhaseHooks<PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;
      phaseData?: WritableDraft<Phase<PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>>;
    }>) => {
      const { phaseName, phaseHooks, phaseData } = action.payload;
      const phaseKey = phaseName.replace(/\s/g, "") + "PhaseHook";
      
      state.phases[phaseKey] = phaseHooks;
      
      if (phaseData) {
        state.phaseRegistry[phaseKey] = phaseData;
      }
    },
    
    // Add an action to remove a phase
    removePhase: (state, action: PayloadAction<string>) => {
      const phaseKey = action.payload;
      delete state.phases[phaseKey];
      delete state.phaseRegistry[phaseKey];
    },
    
    // Set current phase using your Phase type
    setCurrentPhase: (state, action: PayloadAction<PhaseHookConfig | null>) => {
      if (state.currentPhase) {
        state.previousPhase = state.currentPhase;
      }
      state.currentPhase = action.payload;
    },
    
    // Set previous phase
    setPreviousPhase: (state, action: PayloadAction<PhaseHookConfig | null>) => {
      state.previousPhase = action.payload;
    },
    
    // Clear all phases
    clearPhases: (state) => {
      state.phases = {};
      state.phaseRegistry = {};
      state.currentPhase = null;
      state.previousPhase = null;
    },
    
    // Update phase configuration
    updatePhaseConfig: (state, action: PayloadAction<{ 
      phaseKey: string; 
      updates: Partial<CustomPhaseHooks<PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>> 
    }>) => {
      const { phaseKey, updates } = action.payload;
      if (state.phases[phaseKey]) {
        state.phases[phaseKey] = { ...state.phases[phaseKey], ...updates };
      }
    },
    
    // Update phase data in registry
    updatePhaseData: (state, action: PayloadAction<{
      phaseKey: string;
      phaseData: Partial<Phase<PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>>;
    }>) => {
      const { phaseKey, phaseData } = action.payload;
      if (state.phaseRegistry[phaseKey]) {
        state.phaseRegistry[phaseKey] = { 
          ...state.phaseRegistry[phaseKey], 
          ...phaseData 
        };
      }
    },
    
    // Navigate to next phase using your custom hooks
    navigateToNextPhase: (state, action: PayloadAction<{
      nextPhaseKey: string;
      transitionData?: any;
    }>) => {
      const { nextPhaseKey, transitionData } = action.payload;
      
      if (state.currentPhase && state.phases[nextPhaseKey]) {
        // Store current phase as previous
        state.previousPhase = state.currentPhase;
        
        // Set new current phase
        state.currentPhase = {
          phaseKey: nextPhaseKey,
          phaseHooks: state.phases[nextPhaseKey],
          phaseData: state.phaseRegistry[nextPhaseKey],
          transitionData
        };
      }
    },
    
    // Go back to previous phase
    navigateToPreviousPhase: (state) => {
      if (state.previousPhase) {
        const temp = state.currentPhase;
        state.currentPhase = state.previousPhase;
        state.previousPhase = temp;
      }
    },
    
    // Validate phase transition using your custom hooks
    validatePhaseTransition: (state, action: PayloadAction<{
      currentPhaseKey: string;
      nextPhaseKey: string;
    }>) => {
      const { currentPhaseKey, nextPhaseKey } = action.payload;
      
      const currentHooks = state.phases[currentPhaseKey];
      const nextHooks = state.phases[nextPhaseKey];
      
      if (currentHooks?.canTransitionTo && nextHooks) {
        const currentPhaseData = state.phaseRegistry[currentPhaseKey];
        const nextPhaseData = state.phaseRegistry[nextPhaseKey];
        
        return currentHooks.canTransitionTo(currentPhaseData, nextPhaseData);
      }
      
      return false;
    }
  },
});

// Export the actions
export const { 
  addPhase, 
  removePhase, 
  setCurrentPhase, 
  setPreviousPhase, 
  clearPhases, 
  updatePhaseConfig,
  updatePhaseData,
  navigateToNextPhase,
  navigateToPreviousPhase,
  validatePhaseTransition
} = usePhaseManagerSlice.actions;


// Export the reducer
export default usePhaseManagerSlice.reducer;

// Selectors
export const selectCurrentPhase = (state: { phase: PhaseState }) => state.phase.currentPhase;
export const selectPreviousPhase = (state: { phase: PhaseState }) => state.phase.previousPhase;
export const selectAllPhases = (state: { phase: PhaseState }) => state.phase.phases;
export const selectPhaseRegistry = (state: { phase: PhaseState }) => state.phase.phaseRegistry;
export const selectPhaseByKey = (phaseKey: string) => (state: { phase: PhaseState }) => state.phase.phases[phaseKey];
export const selectPhaseDataByKey = (phaseKey: string) => (state: { phase: PhaseState }) => state.phase.phaseRegistry[phaseKey];
export const selectPhaseKeys = (state: { phase: PhaseState }) => Object.keys(state.phase.phases);

// Helper selector to get current phase hooks
export const selectCurrentPhaseHooks = (state: { phase: PhaseState }) => 
  state.phase.currentPhase?.phaseHooks;

// Helper selector to get current phase data
export const selectCurrentPhaseData = (state: { phase: PhaseState }) =>
  state.phase.currentPhase?.phaseData;