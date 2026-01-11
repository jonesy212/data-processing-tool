// Reminder.ts
import type { NotificationChannels, RetryPolicy } from '@/core/notifications/NotificationChannels';
import { ReminderTypes, createReminderTypeFromEnum } from '@/core/typings/ReminderTypes';
import type { CustomAction } from '@/core/settings/CustomAction';
import type { EscalationAction } from "@/core/settings/EscalationAction";
import type { ReminderCondition } from '@/core/settings/ReminderConditionEngine';
import type { SharedTimestamps, SharedStatusFlags, BaseEntityProperties, SharedIdentifiers } from '@/core/documents/RelatedProps';
import type { ReminderTemplate } from '@/core/settings/ReminderTemplate'

// With dedicated ReminderType if you need more complexity
export interface ReminderType {
  id: string;
  category: 'reminder' | 'alert' | 'follow-up' | 'notification' | 'action';
  severity: 'info' | 'warning' | 'error' | 'critical';
  defaultSettings: {
    method: 'email' | 'push' | 'sms' | 'in-app';
    timing: number; // minutes before
    template: string;
  };
}

interface Reminder extends 
  BaseEntityProperties,
  SharedTimestamps,
  SharedStatusFlags {
  
  id: string;
  trigger: ReminderTrigger;
  method: 'email' | 'push' | 'sms' | 'in-app' | 'desktop';
  reminderType: ReminderType;
  customMessage?: string;
  isActive: boolean;
  sent: boolean;
  minutes?: number;
  customActions?: CustomAction[];
  
  
  // Your suggested additions (mapped to existing types where possible)
  description?: string;
  acknowledged?: boolean;
  acknowledgedAt?: Date;
  snoozeCount?: number;
  maxSnoozeCount?: number;
  relatedEventId?: string;
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    endDate?: Date;
    exceptions?: Date[];
  };
  metadata?: Record<string, any>;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  expirationDate?: Date;
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

  //new not used
  maxDailyReminders?: number;        // Limit reminders per day
  reminderGrouping?: boolean;        // Group similar reminders
  earlyReminders?: boolean;          // Send reminders earlier than scheduled
  lateReminders?: boolean;           // Send reminders if missed
  reminderThemes?: {                  // Visual customization
    colorScheme?: 'light' | 'dark' | 'auto';
    accentColor?: string;
    fontSize?: 'small' | 'medium' | 'large';
  };
  notificationBadges?: boolean;      // Show badge counts
  readReceipts?: boolean;            // Confirm when reminders are read
  deliveryReports?: boolean;         // Get reports on delivery status
  reminderArchive?: {                // Auto-archive settings
    enabled: boolean;
    afterDays: number;               // Archive after X days
    autoDelete: boolean;             // Delete after archive
  };
  crossDeviceSync?: boolean;         // Sync across all user devices
  backupReminders?: boolean;         // Backup reminders to cloud
  accessibility?: {                  // Accessibility features
    highContrast: boolean;
    screenReaderSupport: boolean;
    largerText: boolean;
  };
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
  smartReminders?: SmartReminderSettings;
  
  // Notification channels
  channels?: NotificationChannels;
  
  // Escalation rules
  escalationRules: EscalationRule[];
  
  // Business rules
  businessHours?: BusinessHours;
  blackoutPeriods: BlackoutPeriod[];
  
  // User preferences
  userPreferences?: ReminderPreferences;



   // Suggested additions:
  version?: string;                  // Settings version for migrations
  templateLibrary?: {                // Pre-defined reminder templates
    [key: string]: ReminderTemplate;
  };
  analytics?: {                      // Usage analytics settings
    trackOpens: boolean;
    trackClicks: boolean;
    trackDismissals: boolean;
    anonymizeData: boolean;
  };
  integrations?: {                   // Third-party integrations
    calendarSync: boolean;
    taskManagerSync: boolean;
    crmIntegration: boolean;
    chatIntegration: boolean;
  };
  security?: {                       // Security settings
    requireAuthForChanges: boolean;
    twoFactorForCritical: boolean;
    auditLog: boolean;
    ipWhitelist?: string[];
  };
  compliance?: {                     // Regulatory compliance
    gdprCompliant: boolean;
    dataRetentionDays: number;
    dataEncryption: boolean;
    exportFormat: 'json' | 'csv' | 'pdf';
  };
  backup?: {                         // Backup settings
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    backupLocation: 'local' | 'cloud' | 'both';
    encryptionKey?: string;
  };
}


interface EscalationRule {
  id: string;
  name: string;
  conditions: EscalationCondition[];
  actions: EscalationAction[];
  maxEscalationLevel: number;
  
  // Suggested additions:
  description?: string;              // Rule description
  enabled?: boolean;                 // Whether rule is active
  priority?: number;                 // Rule execution priority
  applicableReminderTypes?: string[]; // Which reminder types this applies to
  applicableChannels?: string[];     // Which channels this applies to
  timeZone?: string;                 // Timezone for time-based conditions
  escalationDelay?: number;          // Minutes between escalation levels
  stopOnAcknowledgment?: boolean;    // Stop escalation if acknowledged
  stopOnCompletion?: boolean;        // Stop escalation if completed
  notificationOnEscalate?: boolean;  // Notify when escalation occurs
  auditTrail?: {                     // Change tracking
    createdBy: string;
    createdDate: Date;
    lastModifiedBy?: string;
    lastModifiedDate?: Date;
  };
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
  subjectTemplate?: string;
  bodyTemplate?: string;
  cc?: string[];
  bcc?: string[];
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
  title?: string;
  badgeCount?: number;
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
  url: string;
  authToken?: string; // Optional authentication token
  retryPolicy?: RetryPolicy; 
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
    BlackoutPeriod, BusinessHours,
    // Optional extended integrations (if you define them elsewhere)
    EmailSettings,
    // Escalation and scheduling rules
    EscalationRule, EventReminder, InAppSettings, NotificationChannels, PushNotificationSettings,
    // Core reminder types
    Reminder, ReminderCondition, ReminderMethod,
    // ✅ Newly added / missing exports
    ReminderPreferences, ReminderSettings,
    ReminderTrigger,
    // Smart and notification logic
    SmartReminderSettings, SmsSettings, WebhookSettings
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
      retryInterval: 60,
       backoffFactor: 0
    },
    payloadFormat: 'json',
    events: ['user.updated', 'payment.failed'],
  },

  advanced: {
    chat: {
      enabled: false,
      realTimeChatEnabled: false,
      notificationEmailEnabled: false,
      enableEmojis: false,
      enableAudioChat: false,
      enableVideoChat: false,
      enableFileSharing: false,
      enableBlockchainCommunication: false,
      enableDecentralizedStorage: false,
      collaborationPreference1: '',
      collaborationPreference2: '',
      platforms: [],
      messageFormat: 'text',
      mentionUsers: false
    },
    calendar: {
      enabled: false,
      syncDirection: 'one-way',
      updateExisting: false,
      addAs: 'event',
      visibility: 'default'
    },
    audioCall: {
      enabled: false,
      provider: 'custom',
      voice: 'custom',
      language: '',
      retryAttempts: 0
    },
    videoCall: {
      enabled: false,
      autoJoin: false,
      enableVideo: false,
      enableAudio: false,
      recording: {enabled: false, requireConsent: true }
    },
    screenShare: {
      enabled: false,
      quality: 'original',
      frameRate: 0,
      includeAudio: false,
      requireApproval: false
    }
  }
};


// Updated example with ReminderTypes enum
const reminderExample: Reminder = {
  id: "rem-001",
  trigger: { type: "time_before_event", minutesBefore: 30 },
  method: "push",
  reminderType: createReminderTypeFromEnum(ReminderTypes.ALERT), // Using enum
  isActive: true,
  sent: false,
  title: "Upcoming Event",
  description: "Team meeting in 30 minutes",
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
  // Added properties
  createdAt: new Date(),
  priority: "high",
  tags: ["meeting", "team"],
  metadata: {
    eventId: "evt-123",
    organizer: "john@example.com"
  }
};