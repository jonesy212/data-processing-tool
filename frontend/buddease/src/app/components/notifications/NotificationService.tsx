import { Notification } from '@/app/components/support/NofiticationsSlice';
import { useNotification } from '@/app/components/support/NotificationContext';
import { BytesLike } from 'ethers';
import { useSelector } from "react-redux";
import AnnouncementManager from "../support/AnnouncementManager";
import { selectNotifications } from '../support/NofiticationsSlice';
import { NotificationType } from "../support/NotificationContext";
import PushNotificationManager from "../support/PushNotificationManager";

interface NotificationManagerServiceProps {
  notifications: Notification[];
notify: (
    message: string,
    content: any,
    date: Date | undefined,
    type: NotificationType,
    randomBytes: BytesLike
  ) => Promise<void>;
  sendPushNotification: (message: string, sender: string) => void;
  sendAnnouncement: (message: string, sender: string) => void;
  handleButtonClick: () => Promise<void>;
  dismissNotification: (notification: Notification) => void; // New notification action
}

const useNotificationManagerService = (): NotificationManagerServiceProps => {
  const { notify } = useNotification();
  const notifications = useSelector(selectNotifications);

  const sendPushNotification = (message: string, sender: string): void => {
    // Use the PushNotificationManager to send push notifications
    PushNotificationManager.sendPushNotification(message, sender);
  };

  const sendAnnouncement = (message: string, sender: string): void => {
    // Use the AnnouncementManager to send announcements
    AnnouncementManager.sendAnnouncement(message, sender);
  };

  const handleButtonClick = async (): Promise<void> => {
    sendPushNotification("New message!", "App");
  };

  const dismissNotification = (notification: Notification): void => {
    // Implement dismissal logic here
    console.log("Notification dismissed:", notification);
  };

  return {
    notify,
    notifications,
    sendAnnouncement,
    handleButtonClick,
    dismissNotification, // Include the new action in the returned object
    sendPushNotification,
  };
};

export default useNotificationManagerService;
export type { NotificationManagerServiceProps };
