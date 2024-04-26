// phases/usePhaseSlice.ts
import { CustomPhaseHooks } from "@/app/components/phases/Phase";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state for the phases
const initialState: { [key: string]: CustomPhaseHooks } = {};

// Create a slice for managing phases
export const usePhaseManagerSlice = createSlice({
  name: "phase",
  initialState,
  reducers: {
    // Add an action to add a phase
    addPhase: (state, action: PayloadAction<{ phaseName: string; phaseHooks: CustomPhaseHooks }>) => {
      const { phaseName, phaseHooks } = action.payload;
      state[phaseName.replace(/\s/g, "") + "PhaseHook"] = phaseHooks;
    },
    // Add an action to remove a phase
    removePhase: (state, action: PayloadAction<string>) => {
      const phaseKey = action.payload;
      delete state[phaseKey];
    },
  },
});

// Export the actions
export const { addPhase, removePhase } = usePhaseManagerSlice.actions;

// Export the reducer
export default usePhaseManagerSlice.reducer;
