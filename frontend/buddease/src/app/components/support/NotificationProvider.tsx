import { Message } from '@/app/generators/GenerateChatInterfaces';
import React, { ReactNode, createContext, useState } from 'react';
import { logData } from '../notifications/NotificationService';
import { notificationStoreInstance } from '../state/stores/NotificationStore';
import { NotificationData } from './NofiticationsSlice';
import { NotificationContextProps, NotificationType, NotificationTypeEnum } from './NotificationContext';

export const notificationStore = notificationStoreInstance
export const notificationData: NotificationData[] = [];

export const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

const generateNotificationMessage = (type: string, userName?: string | number): string => {
  switch (type) {
    case 'Welcome':
      return `Welcome, ${userName}!`;
    case 'Error':
      return `Error: ${userName}`;
    case 'Custom':
      return `Custom message: ${userName}`;
    default:
      return 'Unknown Notification Type';
  }
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {

  const [notifications, setNotifications] = useState <NotificationData[]>([]);
  const [duration, setDuration] = useState<number>(3000);  // Default duration

  const sendNotification = (
    type: string,
    userName: string | number | undefined
  ) => {
    const message = generateNotificationMessage(type, userName);
    notificationStore.addNotification({
      id: Date.now().toString(),
      content: message,
      date: new Date(),
      notificationType: NotificationTypeEnum.OperationSuccess,
      message: "",
      type: NotificationTypeEnum.AccountCreated,
      sendStatus: "Sent",
      completionMessageLog: {
        date: new Date(),
        message: `Notification of type ${NotificationTypeEnum.OperationSuccess} sent`,
        createdAt: new Date(),
        content: message,
        timestamp: new Date(),
        level: "info",
      },
      topics: [],
      highlights: [],
      files: [],
      rsvpStatus: "yes",
      host: true, 
      participants: [],
      teamMemberId: "",
    });
  };

  const addNotification = (notification: NotificationData) => {
    notificationStore.addNotification(notification);
  };

  return (
    <NotificationContext.Provider
      value={{
        sendNotification,
        addNotification: (notification: NotificationData) => {
          notificationStore.addNotification(notification);
          },
        notify: (
          id,
          message,
          content,
          date: Date = new Date(),
          type: NotificationType
        ): Promise<void> => {
          notificationStore.addNotification({
            id,
            content,
            date,
            notificationType: type,
            message: "",
            type: NotificationTypeEnum.AccountCreated,
            sendStatus: "Sent",
            completionMessageLog: logData,
            topics: [],
            highlights: [],
            files: [],
            rsvpStatus: 'yes',
            host: undefined,
            participants: [],
            teamMemberId: ''
          });
          console.log(`Notification: ${message}`);
          return Promise.resolve();
        },

        notifications: notificationData,
        showMessage: (message: Message) => {
          sendNotification("Custom", `${message.sender}: ${message.text}`);
          console.log(`Notification: ${message}`);
        },
        setNotifications: (notifications: NotificationData[]) => {
          setNotifications(notifications);
        },
        showMessageWithType: (message: Message, type: NotificationType) => {
          sendNotification("Custom", `${message.sender}: ${message.text}`);
          console.log(`Notification: ${message}`);
        },
        showSuccessNotification: (message: string) => {
          sendNotification("Success", message);
        },
        showErrorNotification: (message: string) => {
          sendNotification("Error", message);
        },
        setDuration: (duration: number) => {
          setDuration(duration);
        },
        showInfoNotification: (message: string) => { 
          sendNotification("Info", message);
        },
        showNotification: (message: string) => {
          sendNotification("Custom", message);
        }
      }}

    >
      {children}
    </NotificationContext.Provider>
  );
};
