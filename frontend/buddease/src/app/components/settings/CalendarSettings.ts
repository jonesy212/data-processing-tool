// Define the CalendarSettingsEnum to represent various calendar settings
export enum CalendarSettingsEnum {
  ShowWeekends = 'ShowWeekends',
  FirstDayOfWeek = 'FirstDayOfWeek',
  ShowHolidays = 'ShowHolidays',
  TimeZone = 'TimeZone',
  DateFormat = 'DateFormat',
  TimeFormat = 'TimeFormat',
  DefaultView = 'DefaultView',
  EventColorScheme = 'EventColorScheme',
  ReminderSettings = 'ReminderSettings',
  DisplayWeekNumbers = 'DisplayWeekNumbers',
  EnableEventOverlap = 'EnableEventOverlap',
  EventNotifications = 'EventNotifications',
  ShowCompletedEvents = 'ShowCompletedEvents'
}



interface CalendarSettings {
  [key: string]: any; // General type for various settings
  showWeekends: boolean;
  firstDayOfWeek: string; // E.g., 'Monday', 'Sunday'
  showHolidays: boolean;
  timeZone: string; // E.g., 'GMT', 'PST'
  dateFormat: string; // E.g., 'MM/DD/YYYY'
  timeFormat: string; // E.g., 'HH:mm'
  defaultView: string; // E.g., 'month', 'week', 'day'
  eventColorScheme: string; // E.g., 'blue', 'red'
  reminderSettings: ReminderSettings; // Assuming ReminderSettings is a defined interface
  displayWeekNumbers: boolean;
  enableEventOverlap: boolean;
  eventNotifications: NotificationSettings; // Assuming NotificationSettings is a defined interface
  showCompletedEvents: boolean;
}

interface ReminderSettings {
  enabled: boolean;
  timeBeforeEvent: number; // Time in minutes
}

interface NotificationSettings {
  enabled: boolean;
  notificationType: 'email' | 'sms' | 'push'; // Example types of notifications
}

// Example usage
const userCalendarSettings: CalendarSettings = {
  showWeekends: true,
  firstDayOfWeek: 'Monday',
  showHolidays: true,
  timeZone: 'GMT',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: 'HH:mm',
  defaultView: 'month',
  eventColorScheme: 'blue',
  reminderSettings: {
    enabled: true,
    timeBeforeEvent: 30,
  },
  displayWeekNumbers: true,
  enableEventOverlap: false,
  eventNotifications: {
    enabled: true,
    notificationType: 'email',
  },
  showCompletedEvents: true,
};


