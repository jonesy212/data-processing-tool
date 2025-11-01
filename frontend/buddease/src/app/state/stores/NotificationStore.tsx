import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { NotificationPosition } from '@/app/models/data/StatusType';
import { LogData } from '@/app/models/LogData';
import { NotificationChannels } from '@/app/notifications/NotificationChannels'
import { NotificationChannelHelper } from '@/app/notifications/NotificationChannelHelper'
import { NotificationContextProps, NotificationType, NotificationTypeEnum } from "@/app/context/NotificationContext";
import { DocumentOptions } from "@/app/documents/DocumentOptions";
import { AuthNotificationTypes } from '@/app/features/support/NotificationTypes';
import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';

import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';

import NotificationData from '@/app/state/redux/slices/NofiticationsSlice';
import { AppStructuredMetadata, AppUnifiedMetadata } from "@/app/typings/entities/AppMetadataEntity";
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { useMeta } from "@/app/config/useMeta";
import { useMetadata } from "@/app/config/useMetadata";
import { action, makeObservable, observable } from 'mobx';
import { createContext } from 'react';
import { NotificationChannelHelperImpl } from '@/app/notifications/NotificationChannelHelperImpl'
import { NotificationEntity, NotificationK, NotificationMeta, NotificationAttachment, NotificationExcludedFields, NotificationIncludedFields
} from '@/app/typings/entities/NotificationEntity'

// Define the type for notification messages
interface NotificationMessages {
  [key: string]: string | ((userName: string) => string);
}

// Define the messages for different notification types
const NOTIFICATION_MESSAGES: NotificationMessages = {
  [NotificationTypeEnum.ACCOUNT_CREATED]: (userName: string) => `Account created for ${userName}`,
  [NotificationTypeEnum.ANALYTICS_ID]: "Analytics ID notification message",
  [NotificationTypeEnum.ANNOUNCEMENT]: "Announcement notification message",
  [NotificationTypeEnum.ASSIGNMENT_OPERATION]: "Assignment operation notification message",
  [NotificationTypeEnum.BRAINSTORMING_SESSION_ID]: "Brainstorming session ID notification message",
  [NotificationTypeEnum.BUTTON_CLICK]: "Button click notification message",
  [NotificationTypeEnum.CALENDAR_EVENT]: "Calendar event notification message",
  [NotificationTypeEnum.CUSTOM_ID]: "Custom ID notification message",
  [NotificationTypeEnum.CALENDAR_ID]: "Calendar ID notification message",
  [NotificationTypeEnum.CHAT_ID]: "Chat ID notification message",
  [NotificationTypeEnum.CALENDAR_NOTIFICATION]: "Calendar notification message",
  [NotificationTypeEnum.CHAT_MENTION]: "Chat mention notification message",
  [NotificationTypeEnum.COMMENT_ID]: "Comment ID notification message",
  [NotificationTypeEnum.CONTRIBUTION_ID]: "Contribution ID notification message",
  [NotificationTypeEnum.CONTENT_ITEM]: "Content item notification message",
  [NotificationTypeEnum.COUPON_CODE]: "Coupon code notification message",
  [NotificationTypeEnum.CREATION_SUCCESS]: "Creation success notification message",
  [NotificationTypeEnum.CUSTOM_NOTIFICATION_1]: (userName: string) => `Custom message 1 for ${userName}`,
  [NotificationTypeEnum.CUSTOM_NOTIFICATION_2]: (userName: string) => `Custom message 2 for ${userName}`,
  [NotificationTypeEnum.DATA_LIMIT_APPROACHING]: "Data limit approaching notification message",
  [NotificationTypeEnum.DATA_LOADING]: "Data loading notification message",
  [NotificationTypeEnum.DISMISS]: "Dismiss notification message",
  [NotificationTypeEnum.DOCUMENT_EDIT_ID]: "Document edit ID notification message",
  [NotificationTypeEnum.APP_VERSION]: "App version notification message",
  [NotificationTypeEnum.ERROR]: (userName: string) => `Error: ${userName}`,
  // Continue with UPPER_CASE for all keys
};

const area = fetchUserAreaDimensions().toString()
const currentMetadata: AppUnifiedMetadata = useMetadata('notification-area');
const currentMeta: AppStructuredMetadata = useMeta(area);

class NotificationStore {
  @observable notifications: NotificationData<
    NotificationEntity,
    NotificationK,
    NotificationMeta,
    NotificationAttachment,
    NotificationExcludedFields,
    NotificationIncludedFields
  >[] = [];
  
  @observable setNotifications: NotificationContextProps['setNotifications'] = () => {};
  
  @observable sendNotification: NotificationContextProps['sendNotification'] = (
    notification: string | NotificationData<
      NotificationEntity, 
      NotificationK, 
      NotificationMeta, 
      NotificationAttachment, 
      NotificationIncludedFields, 
      NotificationExcludedFields
    >,
    options?: { /* options type */ }
  ) => {
    console.log('Sending notification:', notification);
    return `Notification sent: ${typeof notification === 'string' ? notification : notification.id}`;
  };

  channelHelper: NotificationChannelHelper;

  constructor() {
    makeObservable(this);

    const channels: NotificationChannels = {
      email: true,
      push: true,
      sms: false,
      chat: true,
      calendar: true,
      audioCall: true,
      videoCall: true,
      screenShare: true
    };
    
    this.channelHelper = new NotificationChannelHelperImpl(channels);
  }

  @action
  getState = () => {
    return this.notifications;
  };

  @action
  addNotification = (notification: NotificationData<
    NotificationEntity,
    NotificationK,
    NotificationMeta,
    NotificationAttachment,
    NotificationExcludedFields,
    NotificationIncludedFields
  >) => {
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
    id: string | null,
    content: string,
    notificationMessage: string | object | null,
    date: Date,
    type: NotificationType,
    position?: NotificationPosition,
    notificationType?: NotificationType,
    options?: {
      additionalOptions?: readonly string[] | string | number | any[] | undefined;
      additionalDocumentOptions?: DocumentOptions;
      additionalOptionsLabel?: string;
    },
    userName?: string
  ) => {
    const notificationId = id ?? UniqueIDGenerator.generateNotificationIDFromMessage(notificationMessage);
    const actualNotificationType = notificationType ?? type;
    const actualPosition = position ?? NotificationPosition.TopRight;

    const message = this.generateNotificationMessage(type, userName);
    const area = `${fetchUserAreaDimensions().width}x${fetchUserAreaDimensions().height}`;

    this.addNotification({
      id,
      content: message,
      date,
      notificationType: actualNotificationType,
      message: "",
      createdAt: new Date(),
      type: AuthNotificationTypes.ACCOUNT_CREATED,
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
        isSent: false,
        isDelivered: false,
        responseTime: new Date(),
        eventData: {} as CalendarEvent<
          NotificationEntity,
          NotificationK,
          NotificationMeta,
          NotificationAttachment,
          NotificationExcludedFields,
          NotificationIncludedFields
        >,
        topics: [],
        highlights: [],
        files: [],
        meta: new Map(),
      },
      rsvpStatus: "notResponded",
      participants: [],
      teamMemberId: "",
      topics: [],
      highlights: [],
      files: [],
      currentMeta: currentMeta,
      meta: currentMetadata
    });
  };

  @action
  showNotification = (
    title: string,
    message: string | Message<
      NotificationEntity,
      NotificationK,
      NotificationMeta,
      NotificationAttachment,
      NotificationExcludedFields,
      NotificationIncludedFields
    >,
    content?: any
  ) => {
    const notification: NotificationData<
      NotificationEntity,
      NotificationK,
      NotificationMeta,
      NotificationAttachment,
      NotificationExcludedFields,
      NotificationIncludedFields
    > = {
      id: UniqueIDGenerator.generateSnapshoItemID('notification'),
      title,
      message,
      content,
      date: new Date(),
      type: 'default' as string,
      completionMessageLog: { 
        date: new Date(), 
        timestamp: new Date(), 
        level: "default"
      } as LogData<
        NotificationEntity,
        NotificationK,
        StructuredMetadata<
          NotificationEntity,
          NotificationK,
          NotificationMeta,
          NotificationAttachment,
          NotificationExcludedFields,
          NotificationIncludedFields
        >
      >
    };
    this.addNotification(notification);
  };

  @action
  showSuccessNotification = (
    title: string, 
    message: string | Message<
      NotificationEntity,
      NotificationK,
      NotificationMeta,
      NotificationAttachment,
      NotificationExcludedFields,
      NotificationIncludedFields
    >, 
    content?: any
  ) => {
    const notification: NotificationData<
      NotificationEntity,
      NotificationK,
      NotificationMeta,
      NotificationAttachment,
      NotificationExcludedFields,
      NotificationIncludedFields
    > = {
      id: UniqueIDGenerator.generateSnapshoItemID('success_notification'),
      title,
      message,
      content,
      date: new Date(),
      type: 'success' as string,
      completionMessageLog: { 
        date: new Date(), 
        timestamp: new Date(), 
        level: "success"
      } as LogData<
        NotificationEntity,
        NotificationK,
        StructuredMetadata<
          NotificationEntity,
          NotificationK,
          NotificationMeta,
          NotificationAttachment,
          NotificationExcludedFields,
          NotificationIncludedFields
        >
      >
    };
    this.addNotification(notification);
  };

  @action
  showErrorNotification = (
    title: string, 
    message: string | Message<
      NotificationEntity,
      NotificationK,
      NotificationMeta,
      NotificationAttachment,
      NotificationExcludedFields,
      NotificationIncludedFields
    >, 
    content?: any
  ) => {
    const notification: NotificationData<
      NotificationEntity,
      NotificationK,
      NotificationMeta,
      NotificationAttachment,
      NotificationExcludedFields,
      NotificationIncludedFields
    > = {
      id: UniqueIDGenerator.generateSnapshoItemID('error_notification'),
      title,
      message,
      content,
      date: new Date(),
      type: 'error' as string,
      completionMessageLog: { 
        date: new Date(), 
        timestamp: new Date(), 
        level: "error"
      } as LogData<
        NotificationEntity,
        NotificationK,
        StructuredMetadata<
          NotificationEntity,
          NotificationK,
          NotificationMeta,
          NotificationAttachment,
          NotificationExcludedFields,
          NotificationIncludedFields
        >
      >
    };
    this.addNotification(notification);
  };

  @action
  showInfoNotification = (
    title: string, 
    message: string | Message<
      NotificationEntity,
      NotificationK,
      NotificationMeta,
      NotificationAttachment,
      NotificationExcludedFields,
      NotificationIncludedFields
    >, 
    content?: any
  ) => {
    const notification: NotificationData<
      NotificationEntity,
      NotificationK,
      NotificationMeta,
      NotificationAttachment,
      NotificationExcludedFields,
      NotificationIncludedFields
    > = {
      id: UniqueIDGenerator.generateSnapshoItemID('info_notification'),
      title,
      message,
      content,
      date: new Date(),
      type: 'info' as string,
      completionMessageLog: { 
        date: new Date(), 
        timestamp: new Date(), 
        level: "info"
      } as LogData<
        NotificationEntity,
        NotificationK,
        StructuredMetadata<
          NotificationEntity,
          NotificationK,
          NotificationMeta,
          NotificationAttachment,
          NotificationExcludedFields,
          NotificationIncludedFields
        >
      >
    };
    this.addNotification(notification);
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

  private generateNotificationMessage = (
    type: NotificationType,
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

export { NotificationContext, notificationStoreInstance };
export default NotificationStore;
