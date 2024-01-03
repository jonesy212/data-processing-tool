import { action, observable } from 'mobx';
import React, { ReactNode, createContext } from 'react';

export interface NotificationContextProps {
  sendNotification: (type: string, userName?: string | number) => void;
}

class NotificationStore {
  @observable notifications: { id: string; content: string; date: Date }[] = [];

  @action
  addNotification = (notification: { id: string; content: string; date: Date }) => {
    this.notifications.push(notification);
  };

  @action
  removeNotification = (notificationId: string) => {
    this.notifications = this.notifications.filter((notification) => notification.id !== notificationId);
  };

  @action
  clearNotifications = () => {
    this.notifications = [];
  };
}

export const notificationStore = new NotificationStore();

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
  const sendNotification = (type: string, userName?: string | number) => {
    const message = generateNotificationMessage(type, userName);
    // Call the MobX store method to add the notification
    notificationStore.addNotification({
      id: Date.now().toString(),
      content: message,
      date: new Date(),
    });
  };

  return (
    <NotificationContext.Provider value={{ sendNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
