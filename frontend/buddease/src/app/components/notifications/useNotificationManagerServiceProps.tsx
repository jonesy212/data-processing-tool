import { NotificationType, NotificationTypeEnum } from "@/state/context/NotificationContext";
import useNotificationManagerService from "@/app/service/NotificationService";

// useNotificationManagerServiceProps.tsx
export interface NotificationManagerServiceProps {
    notify: (message: string) => void;
    clearNotifications: () => void;
    notifications: string[];
  }
  
  const useNotificationManagerServiceProps = (): NotificationManagerServiceProps => {
    const { notify, clearNotifications, notifications } = useNotificationManagerService();
  
    return {
      notify: (message: string) => {
        const id = Math.random().toString(36).substring(2);
        const date = new Date();
        const type: NotificationType = NotificationTypeEnum.PUSH_NOTIFICATION; // or any other type
        notify(id, message, {}, date, type);
      },
      clearNotifications,
      notifications: notifications.map(notification => notification.message),
    };
  };
  

  export default useNotificationManagerServiceProps