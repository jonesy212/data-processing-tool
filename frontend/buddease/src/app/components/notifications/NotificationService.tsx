import { LogData } from '@/app/components/models/LogData';
import { useNotification } from "@/app/components/support/NotificationContext";
import { useDispatch, useSelector } from "react-redux";
import DynamicEventHandlerExample from "../documents/screenFunctionality/ShortcutKeys";
import AnnouncementManager from "../support/AnnouncementManager";
import { NotificationData, selectNotifications } from "../support/NofiticationsSlice";
import { NotificationActions } from "../support/NotificationActions";
import { NotificationType } from "../support/NotificationContext";
import PushNotificationManager from "../support/PushNotificationManager";



interface NotificationManagerServiceProps {
  notifications: NotificationData[];
  notify: (id: string,
    message: string,
    content: any,
    date?: Date | undefined,
    type?: NotificationType | undefined
  ) => Promise<void>
  sendPushNotification: (message: string, sender: string) => void;
  sendAnnouncement: (message: string, sender: string) => void;
  handleButtonClick: () => Promise<void>;
  dismissNotification: (notification: NotificationData) => void;
  addNotification: (notification: NotificationData) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const eventHandler = typeof DynamicEventHandlerExample




const useNotificationManagerService = (): NotificationManagerServiceProps => {
  const { notify } = useNotification();
  const notifications = useSelector(selectNotifications);
  const dispatch = useDispatch();

  const logData: LogData = {
    id: "",
    message: "",
    createdAt: new Date(),
    type: "PushNotification" as NotificationType,
    content: "",
    completionMessageLog: "",
    timestamp: new Date,
    level: ""
  }

  const sendPushNotification = (message: string, sender: string): void => {
    // Dispatch action to send push notification
    dispatch(NotificationActions.addNotification({
      id: "", // Generate unique ID for notification
      date: new Date(),
      message: message,
      createdAt: new Date(),
      type: "PushNotification" as NotificationType,
      content: sender,
      completionMessageLog: logData,
      sendStatus: "confirmed" as "Sent" | "Delivered" | "Read" | "Error",
      status: "confirmed",

    }));
    // Use the PushNotificationManager to send push notifications
    PushNotificationManager.sendPushNotification(message, sender);
  };
  const sendAnnouncement = async (message: string, sender: string): Promise<void> => {
    // Dispatch action to send announcement
    dispatch(NotificationActions.addNotification({
      id: "", // Generate unique ID for notification
      date: new Date(),
      message: message,
      createdAt: new Date(),
      type: "Announcement" as NotificationType,
      content: sender,
      completionMessageLog: logData,
      status: "confirmed",
      sendStatus: "confirmed" as "Sent" | "Delivered" | "Read" | "Error"
    }));
    // Use the AnnouncementManager to send announcements
    await Promise.resolve(AnnouncementManager.sendAnnouncement(message, sender));
  };
  
  const handleButtonClick = async (): Promise<void> => {
    // Dispatch action to handle button click
    dispatch(NotificationActions.addNotification({
      id: "", // Generate unique ID for notification
      date: new Date(),
      message: "New message!",
      createdAt: new Date(),
      type: "ButtonClick" as NotificationType,
      content: "App",
      completionMessageLog: logData,
      status: "confirmed",
      sendStatus: "confirmed" as "Sent" | "Delivered" | "Read" | "Error"
    }));
    // Send push notification on button click
    await Promise.resolve(sendPushNotification("New message!", "App"));
  };
  

  const dismissNotification = (notification: NotificationData): void => {
    // Dispatch action to dismiss notification
    dispatch(NotificationActions.removeNotification(notification.id as string));
    // Implement dismissal logic here
    console.log("Notification dismissed:", notification);
  };

  const addNotification = (notification: NotificationData): void => { 
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
