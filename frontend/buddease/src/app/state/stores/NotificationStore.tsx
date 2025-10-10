import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { LogData } from '@/app/components/models/LogData';
import { NotificationContextProps, NotificationType, NotificationTypeEnum } from "@/app/context/NotificationContext";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { DocumentOptions } from "@/app/documents/DocumentOptions";
import { AuthNotificationTypes } from '@/app/features/support/NotificationTypes';
import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { BaseData } from '@/app/models/data/Data';
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { CustomSnapshotData } from "@/app/snapshots/SnapshotData";
import { NotificationData } from '@/app/support/NofiticationsSlice';
import { AppStructuredMetadata, AppUnifiedMetadata } from "@/app/utils/web3/dAppAdapter/AppEntity";
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { useMeta } from "@/config/useMeta";
import { useMetadata } from "@/config/useMetadata";
import { action, makeObservable, observable } from 'mobx';
import { createContext } from 'react';
;


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
  @observable notifications: NotificationData<T, K>[] = [];
  @observable setNotifications: NotificationContextProps['setNotifications'] = () => {};
  constructor() {
    makeObservable(this);

    const channels: NotificationChannels = {
      email: true,
      push: true,
      sms: false, // SMS disabled by default
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
  addNotification = (notification: NotificationData<T, K>) => {
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
    notificationMessage: string  | object | null,
    date: Date,
    type: NotificationType,
    notificationType?: NotificationType,
    options?: {
      additionalOptions?: readonly string[] | string | number | any[] | undefined;
      additionalDocumentOptions?: DocumentOptions;
      additionalOptionsLabel?: string;
    },
    userName?: string
  ) => {

    // If no ID is passed, generate one from the notificationMessage string
    const notificationId = id ?? UniqueIDGenerator.generateNotificationIDFromMessage(notificationMessage);
    const actualNotificationType = notificationType ?? type;
    
    const message = this.generateNotificationMessage(
      type,
      userName
    );
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
        eventData: {} as CalendarEvent<BaseData<any, any, any, Attachment>, CustomSnapshotData<T, T, StructuredMetadata<T, T>>>,
       
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
  showNotification = (title: string, message: string | Message, content?: any) => {
    const notification: NotificationData<T, K> = {
      id: UniqueIDGenerator.generateSnapshoItemID('notification'), // ✅ Fixed
      title,
      message,
      content,
      date: new Date(),
      type: 'default' as string,
      completionMessageLog: { date: new Date(), timestamp: new Date(), level: "default"} as LogData<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
    };
    this.addNotification(notification);
  };

  @action
  showSuccessNotification = (title: string, message: string | Message, content?: any) => {
    const notification: NotificationData<T, K> = {
      id: UniqueIDGenerator.generateSnapshoItemID('success_notification'), // ✅ Fixed
      title,
      message,
      content,
      date: new Date(),
      type: 'success' as string,
      completionMessageLog: { date: new Date(), timestamp: new Date(), level: "success"} as LogData<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
    };
    this.addNotification(notification);
  };

  @action
  showErrorNotification = (title: string, message: string | Message, content?: any) => {
    const notification: NotificationData<T, K> = {
      id: UniqueIDGenerator.generateSnapshoItemID('error_notification'), // ✅ Fixed
      title,
      message,
      content,
      date: new Date(),
      type: 'error' as string,
      completionMessageLog: { date: new Date(), timestamp: new Date(), level: "error"} as LogData<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
    };
    this.addNotification(notification);
  };

  @action
  showInfoNotification = (title: string, message: string | Message, content?: any) => {
    const notification: NotificationData<T, K> = {
      id: UniqueIDGenerator.generateSnapshoItemID('info_notification'), // ✅ Fixed
      title,
      message,
      content,
      date: new Date(),
      type: 'info' as string,
      completionMessageLog: { date: new Date(), timestamp: new Date(), level: "info"} as LogData<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
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

  // Generate the notification message based on the notification type
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
