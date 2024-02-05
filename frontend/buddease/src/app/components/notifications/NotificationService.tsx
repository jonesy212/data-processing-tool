import { useNotification } from "@/app/components/support/NotificationContext";
import { BytesLike } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import AnnouncementManager from "../support/AnnouncementManager";
import { Notification, selectNotifications } from "../support/NofiticationsSlice";
import { NotificationActions } from "../support/NotificationActions";
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
  dismissNotification: (notification: Notification) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const useNotificationManagerService = (): NotificationManagerServiceProps => {
  const { notify } = useNotification();
  const notifications = useSelector(selectNotifications);
  const dispatch = useDispatch();


  const sendPushNotification = (message: string, sender: string): void => {
    // Dispatch action to send push notification
    dispatch(NotificationActions.addNotification({
      id: "", // Generate unique ID for notification
      date: new Date(),
      message: message,
      createdAt: new Date(),
      type: "PushNotification",
      content: sender
    }));
    // Use the PushNotificationManager to send push notifications
    PushNotificationManager.sendPushNotification(message, sender);
  };

  const sendAnnouncement = (message: string, sender: string): void => {
    // Dispatch action to send announcement
    dispatch(NotificationActions.addNotification({
      id: "", // Generate unique ID for notification
      date: new Date(),
      message: message,
      createdAt: new Date(),
      type: "Announcement",
      content: sender
    }));
    // Use the AnnouncementManager to send announcements
    AnnouncementManager.sendAnnouncement(message, sender);
  };

  const handleButtonClick = async (): Promise<void> => {
    // Dispatch action to handle button click
    dispatch(NotificationActions.addNotification({
      id: "", // Generate unique ID for notification
      date: new Date(),
      message: "New message!",
      createdAt: new Date(),
      type: "ButtonClick",
      content: "App"
    }));
    // Send push notification on button click
    sendPushNotification("New message!", "App");
  };

  const dismissNotification = (notification: Notification): void => {
    // Dispatch action to dismiss notification
    dispatch(NotificationActions.removeNotification(notification.id));
    // Implement dismissal logic here
    console.log("Notification dismissed:", notification);
  };

  const addNotification = (notification: Notification): void => { 
    dispatch(NotificationActions.addNotification(notification));
  }

  const removeNotification = (id: string): void => { 
    // Dispatch action to remove notification
    dispatch(NotificationActions.removeNotification(id));
  }

  const clearNotifications = (): void => {  
    // Dispatch action to clear all notifications
    dispatch(NotificationActions.clearNotifications());
  }

  return {
    notifications,
    notify,
    sendAnnouncement,
    handleButtonClick,
    dismissNotification,
    sendPushNotification,
    addNotification,
    removeNotification,
    clearNotifications
  };
};

export default useNotificationManagerService;
export type { NotificationManagerServiceProps };
