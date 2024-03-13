import { action, observable } from 'mobx';
import React, { ReactNode, createContext } from 'react';
import { NotificationContextProps, NotificationTypeEnum } from './NotificationContext';
import { NotificationData } from './NofiticationsSlice';




class NotificationStore {
  @observable notifications: { id: string; content: string; date: Date, notificationType: NotificationTypeEnum }[] = [];

  @action
  addNotification = (notification: { id: string; content: string; date: Date,  notificationType: NotificationTypeEnum  }) => {
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

  @action
  notify = (id: string, content: string, date: Date, notificationType: NotificationTypeEnum) => {
    this.addNotification({ id, content, date, notificationType });
  };
}

export const notificationStore = new NotificationStore();
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
  const sendNotification = (type: string, userName?: string | number) => {
    const message = generateNotificationMessage(type, userName);
    // Call the MobX store method to add the notification
    notificationStore.addNotification({
      id: Date.now().toString(),
      content: message,
      date: new Date(),
      notificationType: NotificationTypeEnum.OperationSuccess
    });
  };


    const addNotification = (notification: NotificationData)  => { 
      notificationStore.addNotification(notification);
    }
    

  return (
    <NotificationContext.Provider value={{
      sendNotification,
      addNotification,
      notify: (id, message, content, date, type) => { 
        notificationStore.addNotification({ id, content, date });
        console.log(`Notification: ${message}`);
      },
      notifications: notificationData,
      showMessage: (message) => { 
        console.log(`Notification: ${message}`);
      }
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
