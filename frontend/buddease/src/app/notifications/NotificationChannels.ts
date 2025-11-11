// NotificationChannels.ts
import { CalendarIntegrationSettings, VoiceSettings, VideoSettings, ScreenShareSettings } from '@/app/components/communications/chat/CalendarIntegrationSettings'
import ChatSettings from '@/app/hooks/userInterface/ChatSettingsPanel';
import { BaseNotificationSettings } from "@/app/features/support/NotificationSettings";
import {
  EmailSettings,
  PushNotificationSettings,
  SmsSettings,
  InAppSettings,
  WebhookSettings 
} from '@/app/settings/Reminder'





interface RetryPolicy {
  // Core retry configuration
  maxRetries: number;
  retryInterval: number; // in milliseconds
  backoffMultiplier?: number; // exponential backoff multiplier (e.g., 2 for doubling)
  maxRetryInterval?: number; // maximum wait between retries in ms
  
  // Retry conditions
  retryableStatusCodes?: number[]; // HTTP status codes that should trigger retry
  retryableErrors?: string[]; // Specific error messages that should trigger retry
  
  // Advanced behavior
  jitter?: boolean; // Add random delay to avoid thundering herd
  timeout?: number; // Overall timeout for all retry attempts
  
  // Monitoring
  onRetry?: (attempt: number, error: Error) => void;
  onGiveUp?: (finalError: Error, totalAttempts: number) => void;
}

interface QuietHours {
  // Basic quiet hours
  enabled: boolean;
  startTime: string; // Format: "HH:MM" in 24-hour format, e.g., "22:00"
  endTime: string;   // Format: "HH:MM" in 24-hour format, e.g., "07:00"
  timeZone: string;  // IANA timezone, e.g., "America/New_York"
  
  // Days of week
  days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  
  // Override rules
  overrides?: {
    criticalAlerts?: boolean; // Allow critical alerts during quiet hours
    specificUsers?: string[]; // User IDs that can bypass quiet hours
    emergencyContacts?: boolean; // Allow emergency contact notifications
  };
  
  // Custom schedules
  customSchedules?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    days: string[];
    appliesTo?: string[]; // Specific notification types or channels
  }[];
  
  // Behavior during quiet hours
  behavior?: 'silent' | 'delayed' | 'batched';
  delayedDeliveryTime?: string; // When to deliver delayed notifications
  
  // Vacation/away mode
  vacationMode?: {
    enabled: boolean;
    startDate: Date;
    endDate: Date;
    autoReply?: string;
    emergencyContact?: string;
  };
}



interface BasicNotificationChannels {
  email: boolean;
  push: boolean;
  sms: boolean;
  chat: boolean;
  calendar: boolean;
  audioCall: boolean;
  videoCall: boolean;
  screenShare: boolean;
}


interface NotificationChannels {
  // Basic channel settings (can be boolean or full settings)
  email: boolean | EmailSettings;
  push: boolean | PushNotificationSettings;
  sms: boolean | SmsSettings;
  inApp: boolean | InAppSettings;
  webhook: boolean | WebhookSettings;
  
  // Advanced configurations (separate channels)
  advanced?: {
    chat?: { enabled: boolean } & ChatSettings;
    calendar?: { enabled: boolean } & CalendarIntegrationSettings;
    audioCall?: { enabled: boolean } & VoiceSettings;
    videoCall?: { enabled: boolean } & VideoSettings;
    screenShare?: { enabled: boolean } & ScreenShareSettings;
    // Note: Don't duplicate email, push, sms here unless they're different from top-level
  };

  // Global settings
  deliveryStrategy?: 'all' | 'sequential' | 'priority-based';
  retryPolicy?: RetryPolicy;
  quietHours?: QuietHours;
}

interface GeneralNotificationTypes {
  mention: boolean;
  reaction: boolean;
  follow: boolean;
  poke: boolean;
  activity: boolean;
  thread: boolean;
  inviteAccepted: boolean;
  task: boolean;
  file: boolean;
  meeting: boolean;
  directMessage: boolean;


  audioCall: boolean,
  videoCall: boolean,
  screenShare: boolean,
  chat: boolean,
  calendar: boolean,

  announcement: boolean;
  reminder: boolean;
  project: boolean;
  inApp: boolean;
}

interface CryptoNotificationTypes {
  priceAlerts: boolean;
  tradeConfirmation: boolean;
  marketNews: boolean;
}

interface EventNotificationsSettings extends BaseNotificationSettings {
  channels: NotificationChannels;
  types: GeneralNotificationTypes;
}



// RetryPolicy examples
const aggressiveRetry: RetryPolicy = {
  maxRetries: 5,
  retryInterval: 1000,
  backoffMultiplier: 2,
  maxRetryInterval: 30000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  jitter: true,
  timeout: 120000
};

const conservativeRetry: RetryPolicy = {
  maxRetries: 3,
  retryInterval: 5000,
  retryableStatusCodes: [429, 500, 503]
};

// QuietHours examples
const standardQuietHours: QuietHours = {
  enabled: true,
  startTime: "22:00",
  endTime: "07:00", 
  timeZone: "America/New_York",
  days: ['monday', 'tuesday', 'wednesday', 'thursday', 'sunday'],
  overrides: {
    criticalAlerts: true,
    emergencyContacts: true
  },
  behavior: 'delayed',
  delayedDeliveryTime: "07:00"
};

const weekendQuietHours: QuietHours = {
  enabled: true,
  startTime: "23:00",
  endTime: "09:00",
  timeZone: "UTC",
  days: ['friday', 'saturday'],
  overrides: {
    criticalAlerts: true
  }
};


export type { EventNotificationsSettings, GeneralNotificationTypes, CryptoNotificationTypes, BasicNotificationChannels, NotificationChannels};
