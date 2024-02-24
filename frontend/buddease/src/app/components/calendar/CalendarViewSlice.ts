import { createSlice } from '@reduxjs/toolkit';

// Define the slice state interface
interface CalendarViewManagerState {
  currentView: 'day' | 'week' | 'month';
}

// Define your initial state
const initialState: CalendarViewManagerState = {
  currentView: 'day',
};

// Create the slice
export const calendarViewManagerSlice = createSlice({
  name: 'calendarViewManager',
  initialState,
  reducers: {
    // Action to switch to Day View
    switchToDayView: state => {
      state.currentView = 'day';
    },

    // Action to switch to Week View
    switchToWeekView: state => {
      state.currentView = 'week';
    },

    // Action to switch to Month View
    switchToMonthView: state => {
      state.currentView = 'month';
    },
  },
});


// Export the reducer
export default calendarViewManagerSlice.reducer;

// Export actions
export const {
    switchToDayView,
    switchToWeekView,
    switchToMonthView
} =
  calendarViewManagerSlice.actions;
