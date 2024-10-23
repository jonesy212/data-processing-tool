import { NotificationChannels } from '../../components/settings/NotificationChannels';
import { NotificationTypes } from './NotificationTypes';

interface BaseNotificationSettings {
  enabled: boolean; // Common to all notifications
  notificationType: 'all' | 'email' | 'push' | 'sms' | 'chat' | 'calendar' | 'audioCall' | 'videoCall' | 'screenShare'; // Common notification types
}


interface NotificationSettings extends BaseNotificationSettings {
  channels: NotificationChannels; // Grouping channels
  types: NotificationTypes; // Grouping types
}


export type { NotificationSettings, BaseNotificationSettings };
