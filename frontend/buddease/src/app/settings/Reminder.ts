import { EscalationAction } from "./EscalationAction";


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

interface ReminderCondition {
  id: string;
  name?: string;
  description?: string;

  // Type of condition logic
  conditionType:
    | 'time_based'
    | 'event_property'
    | 'user_property'
    | 'custom_expression'
    | 'location_based'
    | 'priority_based'
    | 'status_check';

  // Core condition logic
  field?: string; // e.g., 'event.startTime', 'user.role', 'priority'
  operator?:
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'includes'
    | 'excludes'
    | 'exists'
    | 'not_exists'
    | 'matches';
  value?: any;

  // Optional advanced logic
  expression?: string; // e.g., "event.priority === 'high' && user.isActive"

  // Time and recurrence filters
  validDuring?: {
    start?: string | Date;
    end?: string | Date;
    recurrence?: string; // iCal-style recurrence rule
  };

  // Nested subconditions
  subConditions?: ReminderCondition[];
  logicOperator?: 'AND' | 'OR'; // How to combine subconditions

  // Contextual conditions
  appliesTo?: {
    eventType?: string;
    userRole?: string;
    location?: string;
    priorityLevel?: 'low' | 'medium' | 'high';
  };

  active: boolean;
}


interface CustomAction {
  id: string;
  name: string;
  description?: string;
  
  // The type of action to perform
  actionType: 'api_call' | 'open_url' | 'run_script' | 'send_message' | 'update_status' | 'log_entry';
  
  // When this action should trigger
  triggerEvent: 'on_send' | 'on_dismiss' | 'on_complete' | 'on_expire' | 'manual';
  
  // Configuration for dynamic execution
  config?: {
    endpoint?: string; // For API calls
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: Record<string, any>;
    url?: string; // For open_url
    script?: string; // For custom script execution
    targetUserId?: string;
    messageTemplate?: string;
  };

  // Optional conditions for executing this action
  conditions?: ReminderCondition[];

  // Whether this action can be retried automatically if it fails
  retryPolicy?: {
    maxRetries: number;
    retryIntervalSeconds: number;
  };

  enabled: boolean;
}

interface ReminderPreferences {
  // General behavior
  snoozeDurations?: number[]; // e.g. [5, 10, 30] minutes
  defaultSnooze?: number; // Default snooze time in minutes
  autoSnooze?: boolean;
  autoDismissCompletedEvents?: boolean;
  showPreviews?: boolean;

  // Sound and visual feedback
  soundEnabled?: boolean;
  soundType?: 'chime' | 'bell' | 'vibration' | 'custom';
  vibrationPattern?: 'short' | 'long' | 'pulse' | 'none';
  desktopPopups?: boolean;

  // Channel-specific preferences
  preferredChannel?: keyof NotificationChannels; // 'email', 'push', 'sms', etc.
  fallbackChannels?: (keyof NotificationChannels)[];

  // Quiet hours or Do-Not-Disturb periods
  quietHours?: {
    enabled: boolean;
    startTime?: string; // e.g., "22:00"
    endTime?: string;   // e.g., "07:00"
    overrideForCritical?: boolean;
  };

  // Localization and personalization
  language?: string;
  timeZone?: string;
  dateFormat?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  useNaturalLanguageTime?: boolean; // “Remind me in 2 hours” parsing
}


interface ReminderSettings {
  // Global defaults
  defaultReminders: Reminder[];
  inheritDefaults: boolean;
  
    enabled: boolean;
  timeBeforeEvent: number; // Time in minutes
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


// Trigger types
type ReminderTrigger = 
  | { type: 'absolute'; dateTime: Date }
  | { type: 'relative'; minutesBefore: number }
  | { type: 'relative-to-start'; minutesBefore: number }
  | { type: 'relative-to-end'; minutesAfter: number }
  | { type: 'snooze'; originalReminderId: string; snoozeUntil: Date }
  | { type: 'time_before_event'; minutesBefore: number };
  
// Notification methods
type ReminderMethod = 
  | 'email'
  | 'push'
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


// Email notifications
interface EmailSettings {
  enabled: boolean;
  frequency?: 'instant' | 'hourly' | 'daily' | 'weekly';
  digestMode?: boolean; // Whether to group multiple alerts into one email
  includeSummary?: boolean; // Include a summary at the end of the email
  preferredFormat?: 'html' | 'text'; // Email content format
  backupEmail?: string; // Optional backup email address
  categories?: ('system' | 'security' | 'marketing' | 'updates' | 'reminders')[];
}

// Push notifications (desktop/mobile)
interface PushNotificationSettings {
  enabled: boolean;
  sound?: boolean;
  vibration?: boolean;
  showPreviews?: boolean; // Whether to show message previews
  priority?: 'low' | 'normal' | 'high' | 'critical';
  doNotDisturb?: {
    enabled: boolean;
    startTime?: string; // e.g., "22:00"
    endTime?: string; // e.g., "07:00"
  };
  categories?: ('alerts' | 'messages' | 'reminders' | 'tasks')[];
}

// SMS notifications
interface SmsSettings {
  enabled: boolean;
  phoneNumber?: string;
  countryCode?: string; // e.g., "+1"
  frequencyLimit?: number; // Max messages per day
  alertsOnly?: boolean; // Only send critical alerts
  allowMarketing?: boolean; // Receive promotional messages
  categories?: ('alerts' | 'reminders' | 'security')[];
}

// In-app notifications (inside dashboard or app)
interface InAppSettings {
  enabled: boolean;
  sound?: boolean;
  popupAlerts?: boolean; // Whether to show popup modals
  persistent?: boolean; // Keep notifications visible until read
  autoMarkAsRead?: boolean;
  categories?: ('activity' | 'mentions' | 'comments' | 'system')[];
  retentionDays?: number; // How long to keep notifications
}

// Webhook notifications (for integrations and automation)
interface WebhookSettings {
  enabled: boolean;
  url?: string;
  authToken?: string; // Optional authentication token
  retryPolicy?: {
    maxRetries: number;
    retryIntervalSeconds: number;
  };
  payloadFormat?: 'json' | 'xml';
  events?: string[]; // List of event types to send (e.g., "user.created", "task.updated")
  headers?: Record<string, string>; // Custom headers
}



// EscalationCondition.ts
export interface EscalationCondition {
  id: string;
  type:
    | "timeSinceTrigger"
    | "priorityLevel"
    | "unacknowledged"
    | "unresolved"
    | "custom";
  threshold?: number; // e.g., minutes since trigger, priority level, etc.
  operator?: ">" | ">=" | "<" | "<=" | "==" | "!=";
  field?: string; // optional custom field name
  value?: string | number | boolean;
  description?: string;
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


export type {
  // Core reminder types
  Reminder,
  ReminderSettings,
  ReminderTrigger,
  ReminderMethod,
  EventReminder,

  // Smart and notification logic
  SmartReminderSettings,
  NotificationChannels,

  // Escalation and scheduling rules
  EscalationRule,
  BusinessHours,
  BlackoutPeriod,

  // ✅ Newly added / missing exports
  CustomAction,
  ReminderPreferences,
  ReminderCondition,

  // Optional extended integrations (if you define them elsewhere)
  EmailSettings,
  PushNotificationSettings,
  SmsSettings,
  InAppSettings,
  WebhookSettings
};




const userNotificationChannels: NotificationChannels = {
  email: {
    enabled: true,
    frequency: 'daily',
    digestMode: true,
    includeSummary: true,
    preferredFormat: 'html',
    categories: ['system', 'updates', 'reminders'],
  },
  push: {
    enabled: true,
    sound: true,
    vibration: true,
    priority: 'high',
    doNotDisturb: {
      enabled: true,
      startTime: '22:00',
      endTime: '07:00',
    },
    categories: ['alerts', 'tasks'],
  },
  sms: {
    enabled: false,
    phoneNumber: '+15551234567',
    countryCode: '+1',
    frequencyLimit: 5,
    alertsOnly: true,
  },
  inApp: {
    enabled: true,
    sound: false,
    popupAlerts: true,
    persistent: true,
    autoMarkAsRead: false,
    retentionDays: 30,
  },
  webhook: {
    enabled: true,
    url: 'https://example.com/webhook',
    authToken: 'my-secret-token',
    retryPolicy: {
      maxRetries: 3,
      retryIntervalSeconds: 60,
    },
    payloadFormat: 'json',
    events: ['user.updated', 'payment.failed'],
  },
};


const reminderExample: Reminder = {
  id: "rem-001",
  trigger: { type: "time_before_event", minutesBefore: 30 },
  method: "push",
  type: "alert",
  isActive: true,
  sent: false,
  customActions: [
    {
      id: "act-001",
      name: "Notify Team Chat",
      actionType: "send_message",
      triggerEvent: "on_send",
      config: {
        endpoint: "https://chat.example.com/api/notify",
        method: "POST",
        body: { message: "Upcoming meeting in 30 minutes!" },
      },
      enabled: true,
    },
  ],
};
