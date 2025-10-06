import { NotificationChannels } from '@/app/components/settings/NotificationChannels';
import { NotificationTypes } from '@/NotificationTypes';

interface BaseNotificationSettings {
  enabled: boolean;
  // FIXED: notificationType should use our notification types, not channels
  notificationType: NotificationType; // From our modular system
}

// Channels should be separate
interface NotificationChannelsSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  chat: boolean;
  calendar: boolean;
  audioCall: boolean;
  videoCall: boolean;
  screenShare: boolean;
}

interface NotificationSettings extends BaseNotificationSettings {
  channels: NotificationChannelsSettings;
  types: NotificationTypes; // This should reference your specific type categories
}


export type { NotificationSettings, NotificationChannelsSettings, BaseNotificationSettings };
