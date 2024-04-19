import { observable, action } from 'mobx';
// import NOTIFICATION_MESSAGES from './NotificationMessages';
import { NotificationData } from '../../support/NofiticationsSlice';
import { NotificationContextProps, NotificationTypeEnum } from '../../support/NotificationContext';
import { createContext } from 'react';

export interface NotificationTypeDefinition {
  type: string;
  subtype?: string; // Add subtype for more modular messages
}



// const NOTIFICATION_MESSAGES: { [key in NotificationTypeEnum]: string | { [key: string]: string | Function } } = {
//   [NotificationTypeEnum.Welcome]: (userName: string) => `Welcome, ${userName}!`,
//   [NotificationTypeEnum.Error]: (userName: string) => `Error: ${userName}`,
// };

const NOTIFICATION_MESSAGES: { [key: string]: string | ((userName: string) => string) } = {
  [NotificationTypeEnum.Welcome]: (userName: string) => `Welcome, ${userName}!`,
  [NotificationTypeEnum.Error]: (userName: string) => `Error: ${userName}`,
[NotificationTypeEnum.CustomNotification1]: (userName: string) => `Custom message: ${userName}`,
};

class NotificationStore {
  @observable notifications: NotificationData[] = [];

  @action
  addNotification = (notification: NotificationData) => {
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
  notify = (id: string, content: string, date: Date, notificationType: NotificationTypeEnum.__FILE_PATH__) => {
    const message = this.generateNotificationMessage(notificationType, content);
    this.addNotification({
      id, content: message, date, notificationType,
      message: '',
      createdAt: new Date,
      type: NotificationTypeEnum.AccountCreated,
      sendStatus: 'Sent',
      completionMessageLog: {
        timestamp,
        level: 'info',
        message: `Notification of type ${notificationType} sent to ${content}`,
        sent: new Date(),
        delivered: null,
        opened: null,
        clicked: null,
        responded: null
      }
    });
  };

  private generateNotificationMessage = (
    type: NotificationTypeEnum,
    userName?: string | number
  ): string => {
    const message = NOTIFICATION_MESSAGES[type];
    if (typeof message === 'string') {
      return message;
    } else if (typeof message === 'function') {
      return message(userName?.toString() || '');
    } else {
      return 'Unknown Notification Type';
    }
  };
}

export const notificationStore = new NotificationStore();
export const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);