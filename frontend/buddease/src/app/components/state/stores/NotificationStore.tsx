import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { DocumentOptions } from "@/app/components/documents/DocumentOptions";
import { BaseData } from '@/app/components/models/data/Data';
import { K, T } from '@/app/components/models/data/dataStoreMethods';
import { Snapshot } from "@/app/components/snapshots";
import { CustomSnapshotData } from "@/app/components/snapshots/SnapshotData";
import Version from "@/app/components/versions/Version";
import { VersionHistory } from "@/app/components/versions/VersionData";
import { UnifiedMetadata, UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { createMetaState } from '@/app/configs/metadata/createMetadataState';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { useMeta } from "@/app/configs/useMeta";
import { useMetadata } from "@/app/configs/useMetadata";
import { NotificationContextProps, NotificationType, NotificationTypeEnum } from "@/app/context/NotificationContext";
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { action, makeObservable, observable } from 'mobx';
import { createContext } from 'react';
import { NotificationData } from '../../support/NofiticationsSlice';

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

const area = fetchUserAreaDimensions().toString()
const metadata: UnifiedMetadata<T, K> = useMetadata<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>(area);
const currentMeta: StructuredMetadata<T, K> = useMeta<T, K>(area)

class NotificationStore {
  @observable notifications: NotificationData<T, K>[] = [];
  @observable setNotifications: NotificationContextProps['setNotifications'] = () => {};
  constructor() {
    makeObservable(this);
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
    notificationMessage: string | null,
    date: Date,
    type: NotificationTypeEnum,
    notificationType?: NotificationType,
    options?: {
      additionalOptions?: readonly string[] | string | number | any[] | undefined;
      additionalDocumentOptions?: DocumentOptions;
      additionalOptionsLabel?: string;
    },
    userName?: string
  ) => {

    // If no ID is passed, generate one from the notificationMessage string
    const id = _id ?? UniqueIDGenerator.generateNotificationIDFromMessage(notificationMessage);

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
      
      currentMeta: currentMeta,
      currentMetadata: createMetaState(
        "", // id: unique identifier for the metadata
        "", // apiEndpoint: endpoint for the API to fetch metadata
        "", // apiKey: authentication key for API requests
        0, // timeout: request timeout in milliseconds
        0, // retryAttempts: number of retry attempts in case of failure
        "", // name: name of the metadata entity
        "", // category: category for metadata
        "", // timestamp: timestamp when the metadata was last modified
        "", // createdBy: user who created the metadata
        [], // tags: tags associated with the metadata
        {} as UnifiedMetaDataOptions<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>, StructuredMetadata<T, K>, never>, // metadata: metadata object, can be undefined initially
        undefined, // initialState: initial state of the metadata, can be undefined
        {} as Map<string, Snapshot<BaseData<any, any, StructuredMetadata<any, any>, Attachment>>>, // meta: additional metadata, can be an empty array if not needed
        { eventRecords: {} }, // events: event manager data, initializing with an empty event record
        {} as Version<T, K>, // version: version information, can be undefined if not applicable
        {} as VersionHistory<T, K>, // lastUpdated: last updated version history, it should be provided
        true, // isActive: boolean flag indicating whether metadata is active or not
        {}, // config: configuration settings for the metadata, using an empty object
        [], // permissions: permissions associated with the metadata, empty for now
        {}, // customFields: any custom fields you might have for metadata, empty object
        "", // baseUrl: the base URL for API requests, can be an empty string if not used
        [], // relatedData: related data associated with metadata, empty array for now
        [], 

      ),
      topics: [],
      highlights: [],
      files: [],
      meta: {},
    });
  };


  @action
  showNotification = (title: string, message: string | Message, content?: any) => {
    const notification: NotificationData<T, K> = {
      id: uuid(), // or some unique ID generator
      title,
      message,
      content,
      date: new Date(),
      type: 'default' as NotificationTypeEnum, // adjust as needed
    };
    this.addNotification(notification);
  };


  @action
  showSuccessNotification = (title: string, message: string | Message, content?: any) => {
    const notification: NotificationData<T, K> = {
      id: uuid(),
      title,
      message,
      content,
      date: new Date(),
      type: 'success' as NotificationTypeEnum,
    };
    this.addNotification(notification);
  };

  @action
  showErrorNotification = (title: string, message: string | Message, content?: any) => {
    const notification: NotificationData<T, K> = {
      id: uuid(),
      title,
      message,
      content,
      date: new Date(),
      type: 'error' as NotificationTypeEnum,
    };
    this.addNotification(notification);
  };

  @action
  showInfoNotification = (title: string, message: string | Message, content?: any) => {
    const notification: NotificationData<T, K> = {
      id: uuid(),
      title,
      message,
      content,
      date: new Date(),
      type: 'info' as NotificationTypeEnum,
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

export { NotificationContext, notificationStoreInstance };
export default NotificationStore;
