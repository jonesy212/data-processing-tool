import { NotificationChannels, NotificationTypes } from '../../components/settings/NotificationChannels';

interface BaseNotificationSettings {
  enabled: boolean; // Common to all notifications
  notificationType: 'email' | 'push' | 'sms' | 'chat' | 'calendar' | 'audioCall' | 'videoCall' | 'screenShare'; // Common notification types
}


interface NotificationSettings extends BaseNotificationSettings {
  channels: NotificationChannels; // Grouping channels
  types: NotificationTypes; // Grouping types
}


export type { NotificationSettings, BaseNotificationSettings };
