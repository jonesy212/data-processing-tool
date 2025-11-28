// NotificationService.tsx
import { SendStatus } from '@/app/state/redux/slices/NofiticationsSlice';
import { NotificationManagerServiceProps } from '@/app/components/notifications/useNotificationManagerServiceProps'
import { EventActions } from '@/app/actions/EventActions';
import { BaseDataRoot } from '@/app/config/BaseConfig';
import { AuthNotificationTypes } from '@/app/features/support/NotificationTypes';
import { NotificationActions } from "@/app/actions/NotificationActions";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields, DefaultIncludedFields} from '@/app/config/BaseConfig';
import { LogData } from "@/app/models/LogData";
import { NotificationType, useNotification } from "@/app/state/context/NotificationContext";
import AnnouncementManager from "@/app/features/support/AnnouncementManager";
import PushNotificationManager from "@/app/features/support/PushNotificationManager";
import { selectNotifications } from "@/app/state/redux/slices/NofiticationsSlice";
import { NotificationData } from '@/app/hooks/useNotificationSystem'
import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { LogEntity, LogK, LogMeta, LogAttachment, LogExcludedFields, LogIncludedFields } from '@/app/typings/entities/LogEntity'


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
  // Use require to avoid module-level hooks
  try {
    const { store } = require('@/app/state/store');
    const dispatch = store.dispatch;
    
    switch (eventName) {
      case 'userLoggedIn':
        EventActions.userLoggedIn(eventData);
        console.log('User logged in:', eventData);
        break;
      case 'userLoggedOut':
        EventActions.userLoggedOut(eventData);
        console.log('User logged out:', eventData);
        break;
      case 'notificationReceived':
        EventActions.notificationReceived(eventData);
        console.log('Notification received:', eventData);
        break;
      default:
        console.log('Unhandled event:', eventName);
        break;
    }
  } catch (error) {
    console.warn('Could not handle event - store not available:', error);
  }
};

export const logData: LogData<LogEntity, LogK, LogMeta, LogAttachment, LogExcludedFields, LogIncludedFields> = {
  id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9),
  createdAt: new Date(),
  updatedAt: new Date(),
  date: new Date(),
  timestamp: new Date(),
  level: "info",
  message: "Notification system log entry created",
  user: "system",
  content: "Initial log entry for notification system",
  endpoint: "/api/logs",
  method: "POST", 
  status: "200",
  response: { success: true, logId: "log-" + Date.now() },
  sent: new Date(),
  isSent: true,
  isDelivered: false,
  delivered: null,
  opened: null,
  clicked: null,
  responded: null,
  responseTime: null,
  topics: ["system", "notifications"],
  highlights: [],
  eventData: null,
  files: [],
  meta: null,
  type: "SystemLog" as NotificationType,
  completionMessageLog: "Log entry successfully created and stored",
};

export const useNotificationManagerService = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): NotificationContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  const { notify } = useNotification();
  const notifications = useSelector(selectNotifications);
  const dispatch = useDispatch();

  const setNotifications = (
    value: React.SetStateAction<NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => {
    dispatch(NotificationActions.setNotifications(value));
  };

  const sendPushNotification = (message: string, sender: string): void => {
    dispatch(
      NotificationActions.addNotification({
        id: crypto.randomUUID(),
        date: new Date(),
        message,
        createdAt: new Date(),
        type: 'PushNotification' as NotificationType,
        content: sender,
        completionMessageLog: logData,
        sendStatus: SendStatus.Confirmed,
        status: SendStatus.Confirmed,
        notificationtype: AuthNotificationTypes.ACCOUNT_CREATED, // Fixed inconsistent naming
      })
    );
    PushNotificationManager.sendPushNotification(message, sender);
  };

  const sendAnnouncement = async (message: string, sender: string): Promise<void> => {
    dispatch(
      NotificationActions.addNotification({
        id: crypto.randomUUID(), // Generate proper ID
        date: new Date(),
        message: message,
        createdAt: new Date(),
        type: "Announcement" as NotificationType,
        content: sender,
        completionMessageLog: logData,
        sendStatus: "confirmed" as "Sent" | "Delivered" | "Read" | "Error",
        notificationtype: AuthNotificationTypes.ACCOUNT_CREATED, // Fixed inconsistent naming
      })
    );
    await Promise.resolve(AnnouncementManager.sendAnnouncement(message, sender));
  };

  const handleButtonClick = async (): Promise<void> => {
    dispatch(
      NotificationActions.addNotification({
        id: crypto.randomUUID(), // Generate proper ID
        date: new Date(),
        message: "New message!",
        createdAt: new Date(),
        type: "ButtonClick" as NotificationType,
        content: "App",
        completionMessageLog: logData,
        sendStatus: "confirmed" as "Sent" | "Delivered" | "Read" | "Error",
        notificationType: "ButtonClick" as NotificationType, // Fixed inconsistent naming
      })
    );
    await Promise.resolve(sendPushNotification("New message!", "App"));
  };

  const dismissNotification = (notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void => {
    dispatch(NotificationActions.removeNotification(notification.id as string));
    console.log("Notification dismissed:", notification);
  };

  const addNotification = (notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void => {
    dispatch(NotificationActions.addNotification(notification));
  };

  const removeNotification = (id: string): void => {
    dispatch(NotificationActions.removeNotification(id));
  };

  const clearNotifications = (): void => {
    dispatch(NotificationActions.clearNotifications());
  };

  // Implement the notify function
  const notifyFunction = async (
    id: string,
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ): Promise<void> => {
    try {
      // Use the context notify
      notify({
        id,
        message,
        data: content,
        timestamp: date,
        type
      });
      
      // Also use NotificationService for consistency
      const { NotificationService } = require('./NotificationServiceClass');
      NotificationService.legacyNotify(id, message, content, date, type);
    } catch (error) {
      console.error('Error in notify function:', error);
    }
  };

  return {
    notifications,
    setNotifications,
    notify: notifyFunction,
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
export type { NotificationContainer };