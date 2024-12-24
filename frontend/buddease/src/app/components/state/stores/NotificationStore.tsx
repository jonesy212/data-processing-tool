import { action, makeObservable, observable } from 'mobx';
import { createContext } from 'react';
import { NotificationData } from '../../support/NofiticationsSlice';
import { NotificationContextProps, NotificationTypeEnum } from '../../support/NotificationContext';

// Define the type for notification messages
interface NotificationMessages {
  [key: string]: string | ((userName: string) => string);
}

// Define the messages for different notification types
const NOTIFICATION_MESSAGES: NotificationMessages = {
  [NotificationTypeEnum.AccountCreated]: (userName: string) => `Account created for ${userName}`,
  [NotificationTypeEnum.AnalyticsID]: "Analytics ID notification message",
  [NotificationTypeEnum.Announcement]: "Announcement notification message",
  [NotificationTypeEnum.AssignmentOperation]: "Assignment operation notification message",
  [NotificationTypeEnum.BrainstormingSessionID]: "Brainstorming session ID notification message",
  [NotificationTypeEnum.ButtonClick]: "Button click notification message",
  [NotificationTypeEnum.CalendarEvent]: "Calendar event notification message",
  [NotificationTypeEnum.CustomID]: "Custom ID notification message",
  [NotificationTypeEnum.CalendarID]: "Calendar ID notification message",
  [NotificationTypeEnum.ChatID]: "Chat ID notification message",
  [NotificationTypeEnum.CalendarNotification]: "Calendar notification message",
  [NotificationTypeEnum.ChatMention]: "Chat mention notification message",
  [NotificationTypeEnum.CommentID]: "Comment ID notification message",
  [NotificationTypeEnum.ContributionID]: "Contribution ID notification message",
  [NotificationTypeEnum.ContentItem]: "Content item notification message",
  [NotificationTypeEnum.CouponCode]: "Coupon code notification message",
  [NotificationTypeEnum.CreationSuccess]: "Creation success notification message",
  [NotificationTypeEnum.CustomNotification1]: (userName: string) => `Custom message 1 for ${userName}`,
  [NotificationTypeEnum.CustomNotification2]: (userName: string) => `Custom message 2 for ${userName}`,
  [NotificationTypeEnum.DataLimitApproaching]: "Data limit approaching notification message",
  [NotificationTypeEnum.DataLoading]: "Data loading notification message",
  [NotificationTypeEnum.Dismiss]: "Dismiss notification message",
  [NotificationTypeEnum.DocumentEditID]: "Document edit ID notification message",
  [NotificationTypeEnum.AppVersion]: "App version notification message",
  [NotificationTypeEnum.Error]: (userName: string) => `Error: ${userName}`,
  // Add more notification types as needed
};

class NotificationStore {
  @observable notifications: NotificationData[] = [];
  @observable setNotifications: NotificationContextProps['setNotifications'] = () => {};
  constructor() {
    makeObservable(this);
  }

  @action
  getState = () => {
    return this.notifications;
  };

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
  notify = (
    id: string,
    content: string,
    date: Date,
    notificationType: NotificationTypeEnum,
    userName?: string
  ) => {
    const message = this.generateNotificationMessage(
      notificationType,
      userName
    );
    this.addNotification({
      id,
      content: message,
      date,
      notificationType,
      message: "",
      createdAt: new Date(),
      type: NotificationTypeEnum.AccountCreated,
      sendStatus: "Sent",
      completionMessageLog: {
        timestamp: new Date(Date.now()),
        level: "info",
        message: `Notification of type ${notificationType} sent to ${content}`,
        sent: new Date(),
        delivered: null,
        opened: null,
        clicked: null,
        responded: null,
        date: new Date(),
      },
    });
  };

  @action
  dismissNotification = (notificationId: string) => {
    this.removeNotification(notificationId);
  };

  @action
  useContainer = (container: React.Context<NotificationContextProps>) => {
    return createContext(container);
  };

  @action
  useSetState = (state: any) => {
    return createContext(state);
  };

  // Generate the notification message based on the notification type
  private generateNotificationMessage = (
    type: NotificationTypeEnum,
    userName?: string
  ): string => {
    const message = NOTIFICATION_MESSAGES[type];
    if (typeof message === 'string') {
      return message;
    } else if (typeof message === 'function') {
      return message(userName || '');
    } else {
      return 'Unknown Notification Type';
    }
  };
}

// Create an instance of the NotificationStore
const notificationStoreInstance = new NotificationStore();

// Create a context for accessing the notification store
const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export { notificationStoreInstance, NotificationContext };
export default NotificationStore;
