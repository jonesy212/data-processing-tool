// useNotificationManagerServiceProps.tsx
import type { NotificationType, NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
    NotificationType,
    NotificationTypeEnum,
} from "@/core/features/support/UnifiedNotificationTypes";
import useNotificationManagerService from '@/core/services/NotificationService';

export interface NotificationManagerServiceProps {
  notify: (message: string) => void;
  clearNotifications: () => void;
  notifications: Array<
    string | Message<BaseDataRoot, BaseDataRoot, DefaultMeta<T, K>, Attachment, never, keyof BaseDataRoot>
  >;
}

const useNotificationManagerServiceProps =
  (): NotificationManagerServiceProps => {
    const { notify, clearNotifications, notifications } =
      useNotificationManagerService();

    return {
      notify: (message: string) => {
        const id = Math.random().toString(36).substring(2);
        const date = new Date();
        const type: NotificationType = NotificationTypeEnum.PUSH_NOTIFICATION; 
        notify(id, message, {}, date, type);
      },
      clearNotifications,
      notifications: notifications
        .map((notification) => {
          const message = notification.message;
          // Handle both string and Message object cases
          return typeof message === 'string' 
            ? message 
            : (message as any)?.content || String(message);
        })
        .filter((msg): msg is string => typeof msg === 'string'), 
    };
  };

export default useNotificationManagerServiceProps;