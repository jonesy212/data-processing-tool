// FilteredEvents.tsx
import type { CalendarEvent } from '@/core/calendar/CalendarEvent';
import type { initialState } from "@/core/state/redux/slices/FilteredEventsSlice";
import type { FilterState } from "@/core/state/redux/slices/FilterSlice";
import type { RootState } from "@/core/state/redux/slices/RootSlice";
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

// Define a selector function to get filtered events from the state
// Define your selector to get the filtered events from the state
export const selectFilteredEvents = (state: RootState): FilteredEventsState<T, K> => {
  return state.filteredEvents; // Adjust this according to your state shape
};

// Create a slice for filtered events
const filteredEventsSlice = createSlice({
  name: "filteredEvents",
  initialState,
  reducers: {
    addFilteredEvent: (
      state,
      action: PayloadAction<CalendarEvent>
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
    // Action to combine different filters
    combineFilters: (
      state: FilterState,
      action: PayloadAction<{ filterType: string; filterValue: any }>
    ) => {
      switch (action.payload.filterType) {
        case "date":
          state.filteredEvents = state.filteredEvents.filter((event) => {
            // Example date filter logic
            return (
              event.date >= action.payload.filterValue.startDate &&
              event.date <= action.payload.filterValue.endDate
            );
          });
          break;
        case "category":
          state.filteredEvents = state.filteredEvents.filter((event) => {
            // Example category filter logic
            return event.category === action.payload.filterValue;
          });
          break;
        // Add more cases for additional filter types as needed
        // case 'filterType':
        //   // Apply filterType filter logic
        //   break;
        default:
          // Handle unknown filter types
          break;
      }
    },

    // Action to update a specific filter
    updateFilter: (
      state: FilterState,
      action: PayloadAction<{ filterType: string; filterValue: any }>
    ) => {
      switch (action.payload.filterType) {
        case "date":
          // Update state.filteredEvents based on the updated date filter value
          break;
        case "category":
          // Update state.filteredEvents based on the updated category filter value
          break;
        // Add more cases for additional filter types as needed
        // case 'filterType':
        //   // Update state.filteredEvents based on the updated filter value
        //   break;
        default:
          // Handle unknown filter types
          break;
      }
    },

    // Action to reset all filters
    resetFilters: (state: FilterState) => {
      // Reset all filters to their initial state
      // Update state.filteredEvents accordingly
    },
  },
});

// Export actions from the slice
export const {
  addFilteredEvent,
  removeFilteredEvent,
  clearFilteredEvents,
  combineFilters,
  updateFilter,
  resetFilters,
} = filteredEventsSlice.actions;

// Export the reducer
export default filteredEventsSlice.reducer;
