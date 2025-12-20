// useNotifier.ts
import { useNotification } from '@/app/state/context/NotificationContext';
import { NotificationType, NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';

type NotificationMessageMap = Record<string, string>;

interface NotifyOptions<TMessages extends NotificationMessageMap> {
  id: string;
  messageKey: keyof TMessages;
  data?: any;
  type?: NotificationType;
}

export function createNotifier<TMessages extends NotificationMessageMap>(
  messagesMap: TMessages
) {
  return {
    success: ({ id, messageKey, data }: NotifyOptions<TMessages>) => {
      const messageText = messagesMap[messageKey];
      useNotification().notify({
        id,
        message: messageText,
        data,
        timestamp: new Date(),
        type: NotificationTypeEnum.SUCCESS
      });
    },

    error: (
      error: unknown,
      errorMessage: string,
      { id, messageKey, data }: NotifyOptions<TMessages>
    ) => {
      console.error(errorMessage, error);
      const messageText = messagesMap[messageKey];
      useNotification().notify({
        id,
        message: messageText,
        data: { ...data, originalError: errorMessage },
        timestamp: new Date(),
        type: NotificationTypeEnum.ERROR
      });
    }
  };
}
