// NotificationChannels.ts
import { BaseNotificationSettings } from "@/app/features/support/NotificationSettings";
import {
  EmailSettings,
  PushNotificationSettings,
  SmsSettings,
  InAppSettings,
  WebhookSettings 
} from '@/app/settings/Reminder'

interface NotificationChannels {
  email: EmailSettings;
  push: PushNotificationSettings;
  sms: SmsSettings;
  inApp: InAppSettings;
  webhook: WebhookSettings;
  
  chat: boolean;
  calendar: boolean;
  audioCall: boolean;
  videoCall: boolean;
  screenShare: boolean;

  // Advanced configurations (optional enhancement)
  advanced?: {
    email?: EmailSettings;
    push?: PushNotificationSettings;
    sms?: SmsSettings;
    chat?: ChatSettings;
    calendar?: CalendarIntegrationSettings;
    audioCall?: VoiceSettings;
    videoCall?: VideoSettings;
    screenShare?: ScreenShareSettings;
  };

  // Global advanced settings
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




export type { EventNotificationsSettings, GeneralNotificationTypes, CryptoNotificationTypes, NotificationChannels};
