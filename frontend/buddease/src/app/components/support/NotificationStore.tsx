import { action, observable } from 'mobx';
import React, { ReactNode, createContext } from 'react';
import NotificationMessagesFactory from './NotificationMessagesFactory';

export interface NotificationContextProps {
  sendNotification: (type: string, userName?: string | number) => void;
}

class NotificationStore {
  @observable notifications: { id: string; message: string }[] = [];

  @action
  addNotification = (notification: { id: string; message: string }) => {
    this.notifications.push(notification);
  };
}

export const notificationStore = new NotificationStore();

export const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const sendNotification = (type: string, userName?: string | number) => {
    const message = generateNotificationMessage(type, userName);
    // Dispatch an action to add the notification to the store
    notificationStore.addNotification({ id: Date.now().toString(), message });
  };

  const generateNotificationMessage = (type: string, userName?: string | number): string => {
      // Your existing switch statement for generating messages
      switch (type) {
        case 'Welcome':
          return NotificationMessagesFactory.createWelcomeMessage(userName as string);
        case 'Error':
          return NotificationMessagesFactory.createErrorMessage(userName as string);
        case 'Custom':
          return NotificationMessagesFactory.createCustomMessage(userName as string);
        default:
          return 'Unknown Notification Type';
      }
  };

  return (
    <NotificationContext.Provider value={{ sendNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
