import { EventActions } from '@/app/actions/EventActions';
import { NotificationActions } from "@/app/actions/NotificationActions";
import { K, T } from '@/app/models/data/dataStoreMethods';
import { LogData } from "@/app/components/models/LogData";
import {
    NotificationType,
    useNotification
} from "@/app/context/NotificationContext";
import AnnouncementManager from "@/app/features/support/AnnouncementManager";
import PushNotificationManager from "@/app/features/support/PushNotificationManager";
import {
    NotificationData,
    selectNotifications,
} from "@/app/state/redux/slices/NofiticationsSlice";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import React from 'react';
import { useDispatch, useSelector } from "react-redux";

const dispatch = useDispatch();

interface NotificationContainer<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  notifications: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  setNotifications: React.Dispatch<
    React.SetStateAction<
      NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
    >
  >;
  notify: (
    id: string,
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => Promise<void>;
  sendPushNotification: (message: string, sender: string) => void;
  sendAnnouncement: (message: string, sender: string) => void;
  handleButtonClick: () => Promise<void>;
  dismissNotification: (
    notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;
  addNotification: (
    notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

  export const eventHandler = (eventName: string, eventData: any) => {
    switch (eventName) {
      case 'userLoggedIn':
        // Dispatch an action for user logged in event
        EventActions.userLoggedIn(eventData);
        console.log('User logged in:', eventData);
        break;
      case 'userLoggedOut':
        // Dispatch an action for user logged out event
        EventActions.userLoggedOut(eventData);
        console.log('User logged out:', eventData);
        break;
      case 'notificationReceived':
        // Dispatch an action for notification received event
        EventActions.notificationReceived(eventData);
        console.log('Notification received:', eventData);
        break;
      default:
        // Default case if event is not recognized
        console.log('Unhandled event:', eventName);
        break;
    }
  };

export const logData: LogData<T, K, Meta> = {
  id: "",
  message: "",
  createdAt: new Date(),
  type: "PushNotification" as NotificationType,
  content: "",
  completionMessageLog: "",
  timestamp: new Date(),
  level: "",
};

export interface NotificationManagerServiceProps {
  notify: (message: string) => void;
  clearNotifications: () => void;
  notifications: string[];
}

const useNotificationManagerService = (): NotificationContainer => {
  const { notify } = useNotification();
  const notifications = useSelector(selectNotifications);
  const dispatch = useDispatch();

  const setNotifications: React.Dispatch<
    React.SetStateAction<NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>[]
  > = (value) => {
    // Dispatch action to set notifications in the store or update local state
    dispatch(NotificationActions.setNotifications(value));
  };

  const sendPushNotification = (message: string, sender: string): void => {
    // Dispatch action to send push notification
    dispatch(
      NotificationActions.addNotification({
        id: "", // Generate unique ID for notification
        date: new Date(),
        message: message,
        createdAt: new Date(),
        type: "PushNotification" as NotificationType,
        content: sender,
        completionMessageLog: logData,
        sendStatus: "confirmed" as "Sent" | "Delivered" | "Read" | "Error",
        status: "confirmed",
        notificationtype: AuthNotificationTypes.ACCOUNT_CREATED,
      })
    );
    // Use the PushNotificationManager to send push notifications
    PushNotificationManager.sendPushNotification(message, sender);
  };
  const sendAnnouncement = async (
    message: string,
    sender: string
  ): Promise<void> => {
    // Dispatch action to send announcement
    dispatch(
      NotificationActions.addNotification({
        id: "", // Generate unique ID for notification
        date: new Date(),
        message: message,
        createdAt: new Date(),
        type: "Announcement" as NotificationType,
        content: sender,
        completionMessageLog: logData,
        sendStatus: "confirmed" as "Sent" | "Delivered" | "Read" | "Error",
        notificationtype: AuthNotificationTypes.ACCOUNT_CREATED,
      })
    );
    // Use the AnnouncementManager to send announcements
    await Promise.resolve(
      AnnouncementManager.sendAnnouncement(message, sender)
    );
  };

  const handleButtonClick = async (): Promise<void> => {
    // Dispatch action to handle button click
    dispatch(
      NotificationActions.addNotification({
        id: "", // Generate unique ID for notification
        date: new Date(),
        message: "New message!",
        createdAt: new Date(),
        type: "ButtonClick" as NotificationType,
        content: "App",
        completionMessageLog: logData,
        sendStatus: "confirmed" as "Sent" | "Delivered" | "Read" | "Error",
        notificationType:
          "/data_analysis/frontend/buddease/src/app/components/context/NotificationContext" as NotificationType,
      })
    );
    // Send push notification on button click
    await Promise.resolve(sendPushNotification("New message!", "App"));
  };

  const dismissNotification = (notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void => {
    // Dispatch action to dismiss notification
    dispatch(NotificationActions.removeNotification(notification.id as string));
    // Implement dismissal logic here
    console.log("Notification dismissed:", notification);
  };

  const addNotification = (notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>): void => {
    dispatch(NotificationActions.addNotification(notification));
  };

  const removeNotification = (id: string): void => {
    // Dispatch action to remove notification
    dispatch(NotificationActions.removeNotification(id));
  };

  const clearNotifications = (): void => {
    // Dispatch action to clear all notifications
    dispatch(NotificationActions.clearNotifications());
  };

  return {
    notifications,
    setNotifications,
    notify,
    sendAnnouncement,
    handleButtonClick,
    dismissNotification,
    sendPushNotification,
    addNotification,
    removeNotification,
    clearNotifications,
  };
};

export default useNotificationManagerService;
export type { NotificationContainer };
