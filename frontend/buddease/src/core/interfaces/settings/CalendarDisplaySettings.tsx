// CalendarDisplaySettings.tsx
// Define interface for CalendarDisplaySettings
interface CalendarDisplaySettings {
  showAllDayEvents: boolean;
  showWeekends: boolean;
  customSettings: {
    // Define any custom settings here
  };

  // Task Display Settings
  showTasks: boolean;
  showTasksPriority: boolean;
  showTasksDueDate: boolean;

  showTasksCompleted: boolean;
  showTasksAssignedToMe: boolean;
  showTasksAssignedByMe: boolean;
  showTasksInProgress: boolean;
  showTasksCompletedByDate: boolean;
  showTasksByPriority: boolean;
  showTasksByCategory: boolean;

  // Event Display Settings
  showEvents: boolean;
  showEventsLocation: boolean;
  showEventsAttendees: boolean;
  showEventsDuration: boolean;
  showEventsReminder: boolean;
  highlightColor: string;
  highlightColors: string[]

  showEventsByCategory: boolean;
  showEventsByPriority: boolean;
  showEventsByDuration: boolean;
  showEventsByAttendees: boolean;
  showEventsByLocation: boolean;

  // Holiday Display Settings
  showHolidaysByRegion: boolean;

  // Holiday Display Settings
  showHolidays: boolean;

  // Birthday Display Settings
  showBirthdays: boolean;

  // Meeting Display Settings
  showMeetings: boolean;

  // Reminder Display Settings
  showReminders: boolean;

  // Weather Display Settings
  showWeather: boolean;

  // Note Display Settings
  showNotes: boolean;

  // Custom Event Display Settings
  showCustomEvents: boolean;

  // Birthday Display Settings
  showBirthdaysByMonth: boolean;

  // Meeting Display Settings
  showMeetingsByParticipant: boolean;

  // Reminder Display Settings
  showRemindersByDate: boolean;

  // Weather Display Settings
  showWeatherByLocation: boolean;

  // Note Display Settings
  showNotesByCategory: boolean;
  showNotesByTag: boolean;

  // Custom Event Display Settings
  showCustomEventsByType: boolean;
  showCustomEventsByCategory: boolean;
  showCustomEventsByTag: boolean;

  // User Interface Settings
  showCustomSettingsPanel: boolean;
  showNotifications: boolean;
  showTimezone: boolean;
  showDateRange: boolean;
  showWeekNumbers: boolean;
  showEventCategories: boolean;
  showSidebar: boolean;
  showToolbar: boolean;
  showContextMenu: boolean;
}

// Define default settings
const defaultSettings: CalendarDisplaySettings = {
  showAllDayEvents: true,
  showWeekends: true,
  customSettings: {
    // Initialize custom settings if any
  },
  // Set default values for other properties
  showTasks: true,
  showTasksPriority: true,
  showTasksDueDate: true,
  showTasksCompleted: false,
  showTasksAssignedToMe: false,
  showTasksAssignedByMe: false,
  showTasksInProgress: false,
  showTasksCompletedByDate: false,
  showTasksByPriority: false,
  showTasksByCategory: false,
  showEvents: false,
  showEventsLocation: false,
  showEventsAttendees: false,
  showEventsDuration: false,
  showEventsReminder: false,
  showEventsByCategory: false,
  showEventsByPriority: false,
  showEventsByDuration: false,
  showEventsByAttendees: false,
  showEventsByLocation: false,
  showHolidaysByRegion: false,
  showHolidays: false,
  showBirthdays: false,
  showMeetings: false,
  showReminders: false,
  showWeather: false,
  showNotes: false,
  showCustomEvents: false,
  showBirthdaysByMonth: false,
  showMeetingsByParticipant: false,
  showRemindersByDate: false,
  showWeatherByLocation: false,
  showNotesByCategory: false,
  showNotesByTag: false,
  showCustomEventsByType: false,
  showCustomEventsByCategory: false,
  showCustomEventsByTag: false,
  showCustomSettingsPanel: false,
  showNotifications: false,
  showTimezone: false,
  showDateRange: false,
  showWeekNumbers: false,
  showSidebar: false,
  showToolbar: false,
  showContextMenu: false,
  highlightColor: "",
  highlightColors: [],
  showEventCategories: false
};

// Define initial settings by spreading defaultSettings
const initialDisplaySettings: CalendarDisplaySettings = {
  ...defaultSettings,
};

// Define function to validate settings
const validateDisplaySettings = (
  settings: CalendarDisplaySettings
): CalendarDisplaySettings => {
  // Ensure boolean values for showAllDayEvents and showWeekends
  const validatedSettings: CalendarDisplaySettings = {
    showAllDayEvents: typeof settings.showAllDayEvents === "boolean"
      ? settings.showAllDayEvents
      : defaultSettings.showAllDayEvents,
    showWeekends: typeof settings.showWeekends === "boolean"
      ? settings.showWeekends
      : defaultSettings.showWeekends,
    customSettings: {
      // Validate custom settings here if needed
    },
    showTasks: false,
    showTasksPriority: false,
    showTasksDueDate: false,
    showTasksCompleted: false,
    showTasksAssignedToMe: false,
    showTasksAssignedByMe: false,
    showTasksInProgress: false,
    showTasksCompletedByDate: false,
    showTasksByPriority: false,
    showTasksByCategory: false,
    showEvents: false,
    showEventsLocation: false,
    showEventsAttendees: false,
    showEventsDuration: false,
    showEventsReminder: false,
    showEventsByCategory: false,
    showEventsByPriority: false,
    showEventsByDuration: false,
    showEventsByAttendees: false,
    showEventsByLocation: false,
    showHolidaysByRegion: false,
    showHolidays: false,
    showBirthdays: false,
    showMeetings: false,
    showReminders: false,
    showWeather: false,
    showNotes: false,
    showCustomEvents: false,
    showBirthdaysByMonth: false,
    showMeetingsByParticipant: false,
    showRemindersByDate: false,
    showWeatherByLocation: false,
    showNotesByCategory: false,
    showNotesByTag: false,
    showCustomEventsByType: false,
    showCustomEventsByCategory: false,
    showCustomEventsByTag: false,
    showCustomSettingsPanel: false,
    showNotifications: false,
    showTimezone: false,
    showDateRange: false,
    showWeekNumbers: false,
    showSidebar: false,
    showToolbar: false,
    showContextMenu: false,
    highlightColor: "",
    highlightColors: [],
    showEventCategories: false
  };

  // Additional validation logic can be added as needed

  return validatedSettings;
};

// Usage example:
let displaySettings: CalendarDisplaySettings = initialDisplaySettings;

// Update display settings
displaySettings = {
  ...displaySettings,
  showAllDayEvents: false,
};

// Validate display settings
displaySettings = validateDisplaySettings(displaySettings);
