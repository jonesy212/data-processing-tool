import {EventNotificationsSettings} from './NotificationChannels'
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
  eventNotifications: EventNotificationsSettings; // Assuming NotificationSettings is a defined interface
  showCompletedEvents: boolean;
}

interface ReminderSettings {
  enabled: boolean;
  timeBeforeEvent: number; // Time in minutes
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
    channels: {
      email: true,
      push: true,
      sms: false,
      chat: false,
      calendar: true,
      audioCall: false,
      videoCall: false,
      screenShare: false
    },
    types: {
      mention: true,
      reaction: false,
      follow: true,
      poke: false,
      activity: true,
      thread: false,
      inviteAccepted: true,
      task: false,
      file: true,
      meeting: false,
      directMessage: true,
      announcement: true,
      reminder: true,
      project: false,
      inApp: true,
    },
  },
  showCompletedEvents: true,
}

export {userCalendarSettings}