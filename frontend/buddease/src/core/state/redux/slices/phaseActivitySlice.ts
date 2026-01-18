// phaseActivitySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PhaseActivityState {
  activities: { [phaseName: string]: { lastActivityTime: number; activityCount: number } };
  lastUpdated: number;
}

const initialState: PhaseActivityState = {
  activities: {},
  lastUpdated: Date.now()
};

export const phaseActivitySlice = createSlice({
  name: "phaseActivity",
  initialState,
  reducers: {
    // Sync with MobX store
    syncActivities: (state, action: PayloadAction<Map<string, any>>) => {
      state.activities = Object.fromEntries(action.payload);
      state.lastUpdated = Date.now();
    },
    
    // Update specific phase activity
    updatePhaseActivity: (state, action: PayloadAction<{
      phaseName: string;
      lastActivityTime: number;
      activityCount: number;
    }>) => {
      const { phaseName, lastActivityTime, activityCount } = action.payload;
      state.activities[phaseName] = { lastActivityTime, activityCount };
      state.lastUpdated = Date.now();
    },
    
    // Clear all activities
    clearActivities: (state) => {
      state.activities = {};
      state.lastUpdated = Date.now();
    },
    
    // Remove specific phase activity
    removePhaseActivity: (state, action: PayloadAction<string>) => {
      delete state.activities[action.payload];
      state.lastUpdated = Date.now();
    }
  },
});

export const { 
  syncActivities, 
  updatePhaseActivity, 
  clearActivities, 
  removePhaseActivity 
} = phaseActivitySlice.actions;

export default phaseActivitySlice.reducer;

Selectors
export const selectPhaseActivities = (state: { phaseActivity: PhaseActivityState }) => 
  state.phaseActivity.activities;

export const selectPhaseActivity = (phaseName: string) => 
  (state: { phaseActivity: PhaseActivityState }) => 
    state.phaseActivity.activities[phaseName];

export const selectLastUpdated = (state: { phaseActivity: PhaseActivityState }) => 
  state.phaseActivity.lastUpdated;