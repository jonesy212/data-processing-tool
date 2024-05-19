import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WritableDraft } from '@/app/components/state/redux/ReducerGenerator';
import { initialState } from '@/app/components/state/redux/slices/FilteredEventsSlice';
import { CalendarEvent } from '@/app/components/state/stores/CalendarEvent';
import { RootState } from '@/app/components/state/redux/slices/RootSlice';

// Define a selector function to get filtered events from the state
export const selectFilteredEvents = (state: RootState) => state.filterManager.filteredEvents;

// Create a slice for filtered events
const filteredEventsSlice = createSlice({
  name: 'filteredEvents',
  initialState,
  reducers: {
    addFilteredEvent: (
      state,
      action: PayloadAction<WritableDraft<CalendarEvent>>
    ) => {
      state.filteredEvents.push(action.payload);
    },
    removeFilteredEvent: (state, action: PayloadAction<string>) => {
      state.filteredEvents = state.filteredEvents.filter(
        (event) => event.id !== action.payload
      );
    },
    clearFilteredEvents: (state) => {
      state.filteredEvents = [];
    },
  },
});

// Export actions from the slice
export const { addFilteredEvent, removeFilteredEvent, clearFilteredEvents } = filteredEventsSlice.actions;

// Export the reducer
export default filteredEventsSlice.reducer;
