// phases/phaseSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Phase, CustomPhaseHooks } from "../../models/phases/Phase";

// Define the initial state for the phases
const initialState: { [key: string]: CustomPhaseHooks } = {};

// Create a slice for managing phases
const phaseSlice = createSlice({
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
export const { addPhase, removePhase } = phaseSlice.actions;

// Export the reducer
export default phaseSlice.reducer;
