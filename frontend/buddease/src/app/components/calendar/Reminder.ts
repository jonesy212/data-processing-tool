interface ReminderSettings {
  // Global defaults
  defaultReminders: Reminder[];
  inheritDefaults: boolean;
  
  // Event-specific overrides
  eventSpecificReminders: EventReminder[];
  
  // Smart reminder features
  smartReminders: SmartReminderSettings;
  
  // Notification channels
  channels: NotificationChannels;
  
  // Escalation rules
  escalationRules: EscalationRule[];
  
  // Business rules
  businessHours: BusinessHours;
  blackoutPeriods: BlackoutPeriod[];
  
  // User preferences
  userPreferences: ReminderPreferences;
}

// Core reminder definition
interface Reminder {
  id: string;
  trigger: ReminderTrigger;
  method: ReminderMethod;
  type?: 'reminder' | 'alert' | 'follow-up'; // Optional categorization
  messageTemplate?: string;
  isActive: boolean;
  sent: boolean;
  customActions?: CustomAction[];
}

// Trigger types
type ReminderTrigger = 
  | { type: 'absolute'; dateTime: Date }
  | { type: 'relative'; minutesBefore: number }
  | { type: 'relative-to-start'; minutesBefore: number }
  | { type: 'relative-to-end'; minutesAfter: number }
  | { type: 'snooze'; originalReminderId: string; snoozeUntil: Date };

// Notification methods
type ReminderMethod = 
  | 'email'
  | 'push-notification'
  | 'in-app-alert'
  | 'sms'
  | 'desktop-notification'
  | 'webhook'
  | 'multiple'; // Combined methods

// Event-specific reminders
interface EventReminder extends Reminder {
  eventTypes: string[]; // 'meeting', 'birthday', 'deadline', etc.
  priorityLevels: ('low' | 'medium' | 'high')[];
  conditions: ReminderCondition[];
}

// Smart reminder features
interface SmartReminderSettings {
  enableTravelTime: boolean;
  travelBufferMinutes: number;
  enableWeatherAlerts: boolean;
  enableConflictDetection: boolean;
  enableFollowUpReminders: boolean;
  learningPreferences: LearningPreferences;
}

// Notification channels configuration
interface NotificationChannels {
  email: EmailSettings;
  push: PushNotificationSettings;
  sms: SmsSettings;
  inApp: InAppSettings;
  webhook: WebhookSettings;
}

// Escalation rules for important events
interface EscalationRule {
  id: string;
  name: string;
  conditions: EscalationCondition[];
  actions: EscalationAction[];
  maxEscalationLevel: number;
}

// Business rules
interface BusinessHours {
  timeZone: string;
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  excludeHolidays: boolean;
  countryCode?: string; // for holiday detection
}

interface BlackoutPeriod {
  name: string;
  start: Date;
  end: Date;
  reason: string;
  suppressAllReminders: boolean;
}


export type { Reminder, ReminderSettings,
ReminderTrigger,
ReminderMethod,
EventReminder,
SmartReminderSettings,
NotificationChannels,
EscalationRule,
BusinessHours,
BlackoutPeriod
 
}