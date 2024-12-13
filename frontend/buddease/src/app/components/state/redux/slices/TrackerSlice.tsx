// TrackerSlice.ts
import Milestone from "@/app/components/calendar/CalendarSlice";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Tracker } from "../../../models/tracker/Tracker";

export interface TrackerManagerState {
  trackers: Tracker[];
  milestones: Milestone[];
}

export const initialState: TrackerManagerState = {
  trackers: [],
  milestones: [],
};

export const trackerManagerSlice = createSlice({
  name: "trackers",
  initialState,
  reducers: {
    addTracker: (state, action: PayloadAction<Tracker>) => {
      state.trackers.push(action.payload);
    },
    // Add more actions as needed

    // Example: Update tracker
    updateTracker: (state, action: PayloadAction<Tracker>) => {
      const index = state.trackers.findIndex(
        (tracker: Tracker) => tracker.id === action.payload.id.toString()
      );
      if (index !== -1) {
        state.trackers[index] = action.payload;
      }
    },

    // Example: Remove tracker
    removeTracker: (state, action: PayloadAction<number>) => {
      state.trackers = state.trackers.filter(
        (tracker: Tracker) => tracker.id.toString() !== action.payload.toString()      );
    },

    // Implement logic to create a milestone for tracking project progress
    createMilestone: (state, action: PayloadAction<Milestone>) => {
      state.milestones.push(action.payload);
    },

    resetTrackers(state) {
      state.trackers = [];
    },
    resetMiilestone(state, action: PayloadAction<number>) {
      state.milestones = state.milestones.filter(
        (milestone) => milestone.id.toString() !== action.payload.toString()
      );
    },
    resetMilestones(state) {
      state.milestones = [];
    },
  },
});

// Export actions
export const {
  addTracker,
  updateTracker,
  removeTracker,
  resetTrackers,
  
  createMilestone,
  resetMiilestone,
  resetMilestones,
  
} = trackerManagerSlice.actions;

// Export selector for accessing the trackers from the state
export const selectTrackers = (state: { trackers: TrackerManagerState }) =>
  state.trackers.trackers;

// Export selector for accessing the milestones from the state
export const selectMilestones = (state: { trackers: TrackerManagerState }) =>
  state.trackers.milestones;

// Export reducer for the tracker entity slice
export default trackerManagerSlice.reducer;
