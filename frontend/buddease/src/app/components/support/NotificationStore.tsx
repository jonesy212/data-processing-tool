import { observable, action } from 'mobx';
import NOTIFICATION_MESSAGES from './NotificationMessages';
import { Data } from '../models/data/Data';
import { NotificationData } from './NofiticationsSlice';

export interface NotificationTypeDefinition {
  type: string;
  subtype?: string; // Add subtype for more modular messages
}



class NotificationStore {
  @observable notifications: NotificationData[] = [];

  @action
  addNotification = (notification: NotificationData) => {
    this.notifications.push(notification);
  };

  private generateNotificationMessage = (type: string, subtype?: string, userName?: string | number): string => {
    if (NOTIFICATION_MESSAGES[type]) {
      if (subtype && NOTIFICATION_MESSAGES[type][subtype]) {
        if (typeof NOTIFICATION_MESSAGES[type][subtype] === 'function') {
          return NOTIFICATION_MESSAGES[type][subtype](userName as string);
        } else {
          return NOTIFICATION_MESSAGES[type][subtype];
        }
      } else if (typeof NOTIFICATION_MESSAGES[type] === 'function') {
        return NOTIFICATION_MESSAGES[type](userName as string);
      } else {
        return NOTIFICATION_MESSAGES[type];
      }
    } else {
      return 'Unknown Notification Type';
    }
  };

  sendNotification = (type: string, subtype?: string, userName?: string | number) => {
    const message = this.generateNotificationMessage(type, subtype, userName);
    this.addNotification({ id: Date.now().toString(), message, type: { type, subtype } });
  };
}

export default NotificationStore;