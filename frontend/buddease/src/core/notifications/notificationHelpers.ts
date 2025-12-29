// notificationHelpers.ts
import { NotificationData } from '@/core/hooks/useNotificationSystem';
import { createErrorNotification, createSuccessNotification, createWarningNotification } from '@/core/libraries/ui/components/Component';
import { NotificationChannelHelper } from '@/core/notifications/NotificationChannelHelper';
import { NotificationChannels } from '@/core/notifications/NotificationChannels';

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

  const channelData: any = {};

  // Handle advanced channels separately
  if (channels.advanced) {
    const advancedChannels = Object.keys(channels.advanced) as AdvancedChannelKeys[];
    
    advancedChannels.forEach(advancedChannel => {
      if (NotificationChannelHelper.isAdvancedEnabled(channels, advancedChannel)) {
        const settings = NotificationChannelHelper.getAdvancedSettings(channels, advancedChannel);
        channelData[`${advancedChannel}Settings`] = settings;
      }
    });
  }

  // Handle basic channels (non-advanced)
  const basicChannels = ['email', 'push', 'sms', 'inApp', 'webhook'] as const;
  
  basicChannels.forEach(basicChannel => {
    if (channels[basicChannel]) {
      channelData[basicChannel] = channels[basicChannel];
    }
  });

  return {
    ...baseNotification,
    ...channelData,
    ...additionalData,
    channels: Object.keys(channelData),
  };
};