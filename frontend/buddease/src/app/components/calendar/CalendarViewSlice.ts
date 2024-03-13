import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import fs from "fs";
import React from "react";
import { SupportedData } from "../models/CommonData";
import { SetCustomEventNotificationsPayload } from "../notifications/SetEventNotification";
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { DetailsItem } from "../state/stores/DetailsListStore";
import { SendStatus } from "../support/NofiticationsSlice";
import { NotificationTypeEnum } from "../support/NotificationContext";
import { CalendarEvent } from "./CalendarContext";
import { formatCalendarAsCSV } from "./formatCalendarAsCSV";
// Define the slice state interface
interface CalendarViewManagerState {
  currentView: "day" | "week" | "month" | "quarter" | "year";
  showAllDayEvents: boolean;
  showWeekends: boolean;
  calendarDisplaySettings: CalendarDisplaySettings;
  events: CalendarEvent[]; // Use CalendarEvent interface here
  bulkEdit: boolean;
  customSettings: {
    // Define any custom settings here
  };
  highlightColor: string;
  highlightOpacity: number;
  details: DetailsItem<SupportedData>;
}

// Define the action payload interface
interface SetEventReminderPayload {
  eventId: string;
  reminder: string; // Update the type to string if reminder is expected to be a string
  options:
    | {
        recurring: boolean;
        frequency?: string;
        interval?: number;
      }
    | undefined;
}


interface AddEventCommentPayload {
  eventId: string;
  comment: string;
}


interface AttachEventFilePayload {
  eventId: string;
  attachment: string;
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
  highlightOpacity: 0.5,
  events: [],
  details: {} as DetailsItem<SupportedData>,
  bulkEdit: false,
};

const generateCalendarId = UniqueIDGenerator.generateID(
  "string",
  "string",
  NotificationTypeEnum.CalendarEvent
);
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

    toggleEventVisibility: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.events.find((e) => e.id === eventId);
      if (event) {
        event.isVisible = !event.isVisible;
      }
    },
    copyEvent: (state, action: PayloadAction<WritableDraft<CalendarEvent>>) => {
      const eventToCopy = action.payload;
      const copiedEvent: WritableDraft<CalendarEvent> = {
        ...eventToCopy,
        id: generateCalendarId,
      };
      state.events.push(copiedEvent);
    },
    moveEvent: (
      state,
      action: PayloadAction<{ eventId: string; newDate: Date }>
    ) => {
      const { eventId, newDate } = action.payload;
      const eventToMove = state.events.find((e) => e.id === eventId);
      if (eventToMove) {
        eventToMove.date = newDate;
      }
    },
    duplicateEvent: (
      state,
      action: PayloadAction<WritableDraft<CalendarEvent>>
    ) => {
      const eventToDuplicate = action.payload;
      const duplicatedEvent: WritableDraft<CalendarEvent> = {
        ...eventToDuplicate,
        id: generateCalendarId,
      };
      state.events.push(duplicatedEvent);
    },

    setEventReminder: (
      state,
      action: PayloadAction<{ eventId: string; reminder: React.ReactNode }>
    ) => {
      const { eventId, reminder } = action.payload;
      const eventToSetReminder = state.events.find((e) => e.id === eventId);
      if (eventToSetReminder) {
        eventToSetReminder.reminder = reminder;
      }
    },

    // Update the action handler
    setEventReminderWithOptions: (
      state,
      action: PayloadAction<SetEventReminderPayload>
    ) => {
      const { eventId, reminder, options } = action.payload;
      const eventToSetReminder = state.events.find((e) => e.id === eventId);
      if (eventToSetReminder) {
        eventToSetReminder.reminder = reminder;
        eventToSetReminder.reminderOptions = options;
      }
    },

    setDocumentReleaseStatus: (
      state,
      action: PayloadAction<{ eventId: string; released: boolean }>
    ) => {
      const { eventId, released } = action.payload;
      const event = state.events.find((e) => e.id === eventId);
      if (event) {
        event.documentReleased = released;
      }
    },
    
    setEventCategory: (
      state,
      action: PayloadAction<{ eventId: string; category: string }>
    ) => {
      const { eventId, category } = action.payload;
      const event = state.events.find((e) => e.id === eventId);
      if (event) {
        event.category = category;
      }
    },

    deleteEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const eventToDelete = state.events.find((e) => e.id === eventId);
      if (eventToDelete) {
        state.events.splice(state.events.indexOf(eventToDelete), 1);
      }
    },


    filterEventsByCategory: (state, action: PayloadAction<string>) => {
      const category = action.payload;
      state.events = state.events.filter((e) => e.category === category);
    },

    
    searchEvents: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload;
      state.events = state.events.filter((e) => e.title.includes(searchTerm));
    },


    exportCalendar: (state, action: PayloadAction<{ fileName: string; sendStatus: SendStatus }>) => {
      const { fileName, sendStatus } = action.payload;
      const { events, calendarDisplaySettings } = state;
    
      // Format calendar data as CSV string
      const csvData = formatCalendarAsCSV(events, calendarDisplaySettings);
    
      // Write CSV data to file
      fs.writeFile(fileName, csvData, (err: any) => {
        if (err) {
          console.error("Error exporting calendar:", err);
          return;
        }
        console.log("Calendar exported successfully to", fileName);
      });
    },
    
    importCalendar: (state, action: PayloadAction<{ fileName: string; sendStatus: SendStatus }>) => {
      const { fileName, sendStatus } = action.payload;
      const { events, calendarDisplaySettings } = state;
      // Format calendar data as CSV string
      const csvData = formatCalendarAsCSV(events, calendarDisplaySettings);
      // Write CSV data to file
      fs.writeFile(fileName, csvData, (err: any) => {
        if (err) {
          console.error("Error exporting calendar:", err);
          return;
        }
        console.log("Calendar exported successfully to", fileName);
      });
    },
    
    setEventPriority: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.events.find((e) => e.id === eventId);
      if (event) {
        // Assuming you want to toggle between "low", "medium", and "high"
        switch (event.priority) {
          case "low":
            event.priority = "medium";
            break;
          case "medium":
            event.priority = "high";
            break;
          case "high":
            event.priority = undefined; // Toggle back to undefined if already "high"
            break;
          default:
            event.priority = "low"; // Set to "low" if priority is currently undefined
        }
      }
    },
    

    shareEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.events.find((e) => e.id === eventId);
      if (event) {
        event.shared = !event.shared;
      }
    },
    undoAction: (state) => {
      state.events.pop();
    },
    redoAction: (state) => {
      state.events.push();
    },

    viewEventDetails: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.events.find((e) => e.id === eventId);
      if (event) {
        // Toggle the visibility of event details
        event.details.isVisible = !event.details.isVisible;
      }
    },
    
    
        

    bulkEditEvents: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.events.find((e) => e.id === eventId);
      if (event) {
        event.bulkEdit = !event.bulkEdit;
      }
    },

    createRecurringEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      const event = state.events.find((e) => e.id === eventId);
      if (event) {
        event.recurring = !event.recurring;
      }
    },

    // Update the payload type in your PayloadAction
    setCustomEventNotifications: (state, action: PayloadAction<SetCustomEventNotificationsPayload>) => {
      const { eventId, customEventNotifications } = action.payload;
      const event = state.events.find((e) => e.id === eventId);
      if (event) {
        const customEventNotifications: string= '';

        // Toggle between two string values (example: "on" and "off")
        event.customEventNotifications = customEventNotifications === "on" ? "off" : "on";
      }
    },


    addEventComment: (state, action: PayloadAction<AddEventCommentPayload>) => {
      const { eventId, comment } = action.payload;
      const event = state.events.find((e) => e.id === eventId);
      if (event) {
        // Toggle between two string values for comments
        event.comment = comment === "add" ? "remove" : "add";
      }
    },
    
    attachEventFile: (state, action: PayloadAction<AttachEventFilePayload>) => {
      const { eventId, attachment } = action.payload;
      const event = state.events.find((e) => e.id === eventId);
      if (event) {
        // Toggle between two string values for attachment
        event.attachment = attachment === "attach" ? "detach" : "attach";
      }
    },
    

    toggleShowTasks: (state) => { 
      state.calendarDisplaySettings.showTasks = !state.calendarDisplaySettings.showTasks;
    },
    toggleShowEvents: (state) => { 
      state.calendarDisplaySettings.showEvents = !state.calendarDisplaySettings.showEvents;
    },

    toggleShowHolidays: (state) => { 
      state.calendarDisplaySettings.showHolidays = !state.calendarDisplaySettings.showHolidays;
    },


    toggleShowBirthdays: (state) => { 
      state.calendarDisplaySettings.showBirthdays = !state.calendarDisplaySettings.showBirthdays;
    },

    toggleShowMeetings: (state) => { 
      state.calendarDisplaySettings.showMeetings = !state.calendarDisplaySettings.showMeetings;
    },


    toggleShowReminders: (state) => { 
      state.calendarDisplaySettings.showReminders = !state.calendarDisplaySettings.showReminders;
    },

    toggleShowWeather: (state) => { 
      state.calendarDisplaySettings.showWeather = !state.calendarDisplaySettings.showWeather;
    },

    setCalendarHighlightColor: (state, action: PayloadAction<string>) => {
      const color = action.payload;
      state.calendarDisplaySettings.highlightColor = color;
    },

    toggleShowNotes: (state) => { 
      state.calendarDisplaySettings.showNotes = !state.calendarDisplaySettings.showNotes;
    },

    toggleShowCustomEvents: (state) => { 
      state.calendarDisplaySettings.showCustomEvents = !state.calendarDisplaySettings.showCustomEvents;
    },

    toggleShowCustomSettingsPanel: (state) => { 
      state.calendarDisplaySettings.showCustomSettingsPanel = !state.calendarDisplaySettings.showCustomSettingsPanel;
    },

    toggleShowNotifications: (state) => { 
      state.calendarDisplaySettings.showNotifications = !state.calendarDisplaySettings.showNotifications;
    },

    toggleShowTimezone: (state) => { 
      state.calendarDisplaySettings.showTimezone = !state.calendarDisplaySettings.showTimezone;
    },

    toggleShowDateRange: (state) => { 
      state.calendarDisplaySettings.showDateRange = !state.calendarDisplaySettings.showDateRange;
    },


    toggleShowWeekNumbers: (state) => { 
      state.calendarDisplaySettings.showWeekNumbers = !state.calendarDisplaySettings.showWeekNumbers;
    },

    toggleShowSidebar: (state) => { 
      state.calendarDisplaySettings.showSidebar = !state.calendarDisplaySettings.showSidebar;
    },

    toggleShowToolbar: (state) => { 
      state.calendarDisplaySettings.showToolbar = !state.calendarDisplaySettings.showToolbar;
    },

    toggleShowContextMenu: (state) => { 
      state.calendarDisplaySettings.showContextMenu = !state.calendarDisplaySettings.showContextMenu;
    },

    toggleShowEventCategories: (state) => { 
      state.calendarDisplaySettings.showEventCategories = !state.calendarDisplaySettings.showEventCategories;
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

  // Event Reminder
  setEventReminder,

  // New Parameters for setEventReminder
  setEventReminderWithOptions, // Updated method with additional options

  // Delete Event
  deleteEvent,

  // Filter Events
  filterEventsByCategory,

  // Search Events
  searchEvents,

  // Export Calendar
  exportCalendar,

  // Import Calendar
  importCalendar,

  // Set Event Priority
  setEventPriority,

  // Share Event
  shareEvent,

  // Undo/Redo Actions
  undoAction,
  redoAction,

  // View Event Details
  viewEventDetails,

  // Bulk Edit Events
  bulkEditEvents,

  // Recurring Events
  createRecurringEvent,

  // Custom Event Notifications
  setCustomEventNotifications,

  // Event Comments/Notes
  addEventComment,

  // Event Attachments
  attachEventFile,

  // Task Visibility
  toggleShowTasks,

  // Event Visibility
  toggleShowEvents,

  // Holiday Visibility
  toggleShowHolidays,

  // Birthday Visibility
  toggleShowBirthdays,

  // Meeting Visibility
  toggleShowMeetings,

  // Reminder Visibility
  toggleShowReminders,

  // Weather Visibility
  toggleShowWeather,

  // Note Visibility
  toggleShowNotes,

  // Custom Event Visibility
  toggleShowCustomEvents,

  // Custom Settings Panel Visibility
  toggleShowCustomSettingsPanel,

  // Notification Visibility
  toggleShowNotifications,

  // Timezone Visibility
  toggleShowTimezone,

  // Date Range Visibility
  toggleShowDateRange,

  // Week Numbers Visibility
  toggleShowWeekNumbers,

  // Sidebar Visibility
  toggleShowSidebar,

  // Toolbar Visibility
  toggleShowToolbar,

  // Context Menu Visibility
  toggleShowContextMenu,


  // Event Categories Visibility
  toggleShowEventCategories,
  // Set Calendar Highlight Color
  setCalendarHighlightColor,
 
} = calendarViewManagerSlice.actions;
