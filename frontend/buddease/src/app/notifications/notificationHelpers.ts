// notificationHelpers.ts
import { NotificationChannelHelper } from '@/app/notifications/NotificationChannels';
import { NotificationChannels } from '@/app/notifications/NotificationChannels';

export const createChannelAwareNotification = (
  message: string,
  type: 'success' | 'error' | 'warning',
  channels: NotificationChannels,
  additionalData?: Partial<NotificationData>
): NotificationData => {
  const baseNotification = type === 'success' 
    ? createSuccessNotification(message)
    : type === 'error' 
    ? createErrorNotification(message)
    : createWarningNotification(message);
  
  // Enhance with channel information
  const channelData: any = {};
  
  // Check which channels are enabled and add their settings
  (Object.keys(channels) as Array<keyof NotificationChannels>).forEach(channel => {
    if (NotificationChannelHelper.isAdvancedEnabled(channels, channel)) {
      const settings = NotificationChannelHelper.getAdvancedSettings(channels, channel);
      channelData[`${channel}Settings`] = settings;
    }
  });
  
  return {
    ...baseNotification,
    ...channelData,
    ...additionalData,
    channels: Object.keys(channelData), // List of active channels
  };
};