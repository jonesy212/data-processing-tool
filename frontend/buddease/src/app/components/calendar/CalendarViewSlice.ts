import { createSlice } from "@reduxjs/toolkit";

// Define the slice state interface
interface CalendarViewManagerState {
  currentView: "day" | "week" | "month" | "quarter" | "year";
  showAllDayEvents: boolean;
  showWeekends: boolean;
  calendarDisplaySettings: CalendarDisplaySettings;
  customSettings: {
    // Define any custom settings here
  };
  highlightColor: string;
  highlightOpacity: number;
}

// Define your initial state
const initialState: CalendarViewManagerState = {
  currentView: "day",
  showAllDayEvents: false,
  showWeekends: false,
  calendarDisplaySettings: {} as CalendarDisplaySettings,
  customSettings: {
    // Initialize custom settings if any
  },
  // Initial values for highlighting properties
  highlightColor: "#FFFF00", // Default to yellow
  highlightOpacity: 0.5, // Default opacity
};

// Create the slice
export const calendarViewManagerSlice = createSlice({
  name: "calendarViewManager",
  initialState,
  reducers: {
    // Action to switch to Day View
    switchToDayView: (state) => {
      state.currentView = "day";
    },

    // Action to switch to Week View
    switchToWeekView: (state) => {
      state.currentView = "week";
    },

    // Action to switch to Month View
    switchToMonthView: (state) => {
      state.currentView = "month";
    },

    // Action to switch to Year View
    switchToYearView: (state) => {
      state.currentView = "year";
    },

    // Action to toggle All-Day Events Visibility
    toggleAllDayEventsVisibility: (state) => {
      state.showAllDayEvents = !state.showAllDayEvents;
    },

    // Action to toggle Weekends Visibility
    toggleWeekendsVisibility: (state) => {
      state.showWeekends = !state.showWeekends;
    },

    // Action to customize Calendar Display Settings
    customizeCalendarDisplaySettings: (state, action) => {
      // Implement customize calendar display settings logic here
      state.calendarDisplaySettings = action.payload;
    },

    // Action to switch to Quarter View
    switchToQuarterView: (state) => {
      state.currentView = "quarter";
    },
  },
});

// Export the reducer
export default calendarViewManagerSlice.reducer;

// Export actions
export const {
  // Calendar Views

  switchToDayView,
  switchToWeekView,
  switchToMonthView,
  switchToQuarterView, // Switch to Quarter View

  switchToYearView, // Switch to Year View
  toggleAllDayEventsVisibility, // Toggle All-Day Events Visibility
  toggleWeekendsVisibility, // Toggle Weekends Visibility
  customizeCalendarDisplaySettings, // Customize Calendar Display Settings

  // Event Visibility and Manipulation
  toggleEventVisibility,
  copyEvent,
  moveEvent,
  duplicateEvent,
} = calendarViewManagerSlice.actions;
