// TrackerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Tracker } from '../../../models/tracker/Tracker';

export interface TrackerManagerState {
  trackers: Tracker[];
}

export const initialState: TrackerManagerState = {
  trackers: [],
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
        (tracker) => tracker.id === action.payload.id.toString()
      );
      if (index !== -1) {
        state.trackers[index] = action.payload;
      }
    },

    // Example: Remove tracker
    removeTracker: (state, action: PayloadAction<number>) => {
      state.trackers = state.trackers.filter(
        (tracker) => tracker.id.toString() !== action.payload.toString()
      );
    },
  },
});

// Export actions
export const { addTracker, updateTracker, removeTracker } = trackerManagerSlice.actions;
 
// Export selector for accessing the trackers from the state
export const selectTrackers = (state: { trackers: TrackerManagerState }) => state.trackers.trackers;

// Export reducer for the tracker entity slice
export default trackerManagerSlice.reducer;
