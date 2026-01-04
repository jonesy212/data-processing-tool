NotificationSettings.ts
import { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';

interface BaseNotificationSettings {
  enabled: boolean;
  notificationType: NotificationType; // From our modular system
}

Channels should be separate
interface NotificationChannelsSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  chat: boolean;
  calendar: boolean;
  audioCall: boolean;
  videoCall: boolean;
  screenShare: boolean;
  inApp: boolean;
}

interface NotificationSettings extends BaseNotificationSettings {
  channels: NotificationChannelsSettings;
  types: NotificationType; 
}


export type { BaseNotificationSettings, NotificationChannelsSettings, NotificationSettings };

