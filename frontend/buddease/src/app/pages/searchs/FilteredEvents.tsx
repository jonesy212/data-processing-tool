// FilteredEvents.ts
import { WritableDraft } from '@/app/components/state/redux/ReducerGenerator';
import { CalendarEvent } from '@/app/components/state/stores/CalendarEvent';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilteredEventsState {
  filteredEvents: CalendarEvent[];
}

const initialState: FilteredEventsState = {
  filteredEvents: [],
};

const filteredEventsSlice = createSlice({
  name: 'filteredEvents',
  initialState,
  reducers: {
    addFilteredEvent: (state, action: PayloadAction<WritableDraft<CalendarEvent>>) => {
      state.filteredEvents.push(action.payload);
    },
    removeFilteredEvent: (state, action: PayloadAction<string>) => {
      state.filteredEvents = state.filteredEvents.filter(event => event.id !== action.payload);
    },
    clearFilteredEvents: (state) => {
      state.filteredEvents = [];
    },
    // Add more reducers as needed
  },
});

export const { addFilteredEvent, removeFilteredEvent, clearFilteredEvents } = filteredEventsSlice.actions;
export default filteredEventsSlice.reducer;
