import { action, makeObservable, observable } from 'mobx';
import { createContext } from 'react';
import { NotificationData } from '../../support/NofiticationsSlice';
import { DocumentOptions } from "@/app/components/documents/DocumentOptions";
import { CustomSnapshotData } from "@/app/components/snapshots/SnapshotData";
import Version from "@/app/components/versions/Version";
import { createMetaState } from '@/app/configs/metadata/createMetadataState';
import { NotificationContextProps, NotificationTypeEnum } from '@/app/context/NotificationContext';
import { T, K } from '@/app/components/models/data/dataStoreMethods';
import { useMeta } from "@/app/configs/useMeta";
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { useMetadata } from "@/app/configs/useMetadata";
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { BaseData } from '@/app/components/models/data/Data';
import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { VersionHistory } from "@/app/components/versions/VersionData";

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
const metadata: UnifiedMetadata<T, K<T>> = useMetadata<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>(area);
const currentMeta: StructuredMetadata<T, K<T>> = useMeta<T, K<T>>(area)

class NotificationStore {
  @observable notifications: NotificationData<T, K<T>>[] = [];
  @observable setNotifications: NotificationContextProps['setNotifications'] = () => {};
  constructor() {
    makeObservable(this);
  }

  
  @action
  getState = () => {
    return this.notifications;
  };

  @action
  addNotification = (notification: NotificationData<T, K<T>>) => {
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
    notificationMessage: typeof NOTIFICATION_MESSAGES,
    notificationType: NotificationTypeEnum,
    options?: {
      additionalOptions?: readonly string[] | string | number | any[] | undefined;
      additionalDocumentOptions?: DocumentOptions;
      additionalOptionsLabel?: string;
    },
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
        {} as UnifiedMetaDataOptions<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, never, StructuredMetadata<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, never>, never>, // metadata: metadata object, can be undefined initially
        undefined, // initialState: initial state of the metadata, can be undefined
        {} as Map<string, Snapshot<BaseData<any, any, StructuredMetadata<any, any>, never, Attachment>>>, // meta: additional metadata, can be an empty array if not needed
        { eventRecords: {} }, // events: event manager data, initializing with an empty event record
        {} as Version<T, K<T>>, // version: version information, can be undefined if not applicable
        {} as VersionHistory, // lastUpdated: last updated version history, it should be provided
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
