import React, { ReactNode, createContext } from 'react';
import { NotificationContextProps, NotificationType, NotificationTypeEnum } from './NotificationContext';
import { NotificationData } from './NofiticationsSlice';
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { notificationStoreInstance } from '../state/stores/NotificationStore';
import { logData } from '../notifications/NotificationService';
import { LogData } from '@/app/components/models/LogData';


 

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
      message: '',
      type: NotificationTypeEnum.AccountCreated,
      sendStatus: 'Sent',
      completionMessageLog: {
        id: Date.now().toString(), // Example: You can assign a unique ID for the completion log
        message: `Notification of type ${NotificationTypeEnum.OperationSuccess} sent`, // Example: Log message
        createdAt: new Date(), // Example: Timestamp of when the log is created
        type: NotificationTypeEnum.OperationSuccess, // Example: Type of notification
        content: message, // Example: Content of the notification
        completionMessageLog: '', // Example: Additional details specific to completion logging
        timestamp: new Date(), // Example: Timestamp of when the notification was sent
        level: 'info', // Example: Log level
      }
    });
  };

  const addNotification = (notification: {
    id: string;
    content: string;
    date: Date;
    notificationType: NotificationTypeEnum;
  }) => {
    notificationStore.addNotification(notification);
  };

  return (
    <NotificationContext.Provider
      value={{
        sendNotification,
        addNotification: (
          notification: NotificationData
        ) => {
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
            message: '',
            type: NotificationTypeEnum.AccountCreated,
            sendStatus: 'Sent',
            completionMessageLog: logData
          });
          console.log(`Notification: ${message}`);
          return Promise.resolve();
        },

        notifications: notificationData,
        showMessage: (message: Message, type: NotificationType) => {
          sendNotification("Custom", `${message.sender}: ${message.text}`);
          console.log(`Notification: ${message}`);
        },
      }
    }
    >
      {children}
    </NotificationContext.Provider>
  )
};
