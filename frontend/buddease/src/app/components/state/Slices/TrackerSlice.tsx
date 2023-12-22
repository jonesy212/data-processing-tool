// TrackerSlice.tsx
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TrackerState {
  trackers: Tracker[];
}

const initialState: TrackerState = {
  trackers: [],
};

const trackerSlice = createSlice({
  name: 'trackers',
  initialState,
  reducers: {
    addTracker: (state, action: PayloadAction<Tracker>) => {
      state.trackers.push(action.payload);
    },
    // Add more actions as needed
  },
});

export const { addTracker } = trackerSlice.actions;
export const selectTrackers = (state: { trackers: TrackerState }) => state.trackers.trackers;

export default trackerSlice.reducer;
