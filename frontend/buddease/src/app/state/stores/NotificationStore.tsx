// NotificationStore.tsx
import { apiNotificationMessages } from "@/app/api/ApiData";
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { DocumentOptions } from "@/app/documents/DocumentOptions";
import { AuthNotificationTypes } from '@/app/features/support/NotificationTypes';
import { Message } from "@/app/generators/GenerateChatInterfaces";
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { NotificationPosition } from '@/app/models/data/StatusType';
import { LogData } from '@/app/models/LogData';
import { NotificationChannelHelper } from '@/app/notifications/NotificationChannelHelper';
import { BasicNotificationChannels, NotificationChannels } from '@/app/notifications/NotificationChannels';
import { NotificationContextProps } from '@/app/state/context/NotificationContext';
import { 
  NotificationTypeEnum, 
  NotificationType 
} from '@/app/features/support/UnifiedNotificationTypes'
import { MetaAttachment, MetaEntity, MetaExcludedFields, MetaIncludedFields, MetaK, MetaMeta } from "@/app/typings/entities/MetaEntity";

import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';

import { useMeta } from "@/app/config/useMeta";
import { useMetadata } from "@/app/config/useMetadata";
import NotificationData from '@/app/state/redux/slices/NofiticationsSlice';
import { AppStructuredMetadata, AppUnifiedMetadata } from "@/app/typings/entities/AppMetadataEntity";
import {
    NotificationAttachment,
    NotificationEntity,
    NotificationExcludedFields, NotificationIncludedFields,
    NotificationK, NotificationMeta
} from '@/app/typings/entities/NotificationEntity';
import { action, observable } from 'mobx';
import { createContext } from 'react';

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
const currentMetadata: AppUnifiedMetadata = useMetadata<MetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>('notification-area');
const currentMeta: AppStructuredMetadata = useMeta(area);

type NotificationMessageKey = string | keyof typeof apiNotificationMessages; // adjust to your messages type

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
  @observable showMessageWithType: NotificationContextProps['showMessageWithType'] = () => {};
  
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

  channelHelper: NotificationChannelHelper | undefined = undefined;

  private channels: NotificationChannels;

  constructor(channels: NotificationChannels | BasicNotificationChannels) {
    this.channels = this.normalizeChannels(channels);
  }

  /**
   * Normalize input to a full NotificationChannels structure.
   * This allows passing either BasicNotificationChannels (flat booleans)
   * or the full NotificationChannels object.
   */
  private normalizeChannels(
    input: NotificationChannels | BasicNotificationChannels
  ): NotificationChannels {
    // Case 1: Already a complex NotificationChannels object
    if (typeof (input as NotificationChannels).email === "object") {
      return input as NotificationChannels;
    }

    // Case 2: It's a BasicNotificationChannels (flat booleans)
    const basic = input as BasicNotificationChannels;

    return {
      email: { enabled: !!basic.email },
      push: { enabled: !!basic.push },
      sms: { enabled: !!basic.sms },
      inApp: { enabled: !!basic.inApp },
      webhook: { enabled: !!basic.webhook },

      advanced: {
        chat: { enabled: !!basic.chat },
        calendar: { enabled: !!basic.calendar, syncDirection, updateExisting, addAs, visibility },
        audioCall: { enabled: !!basic.audioCall, provider, voice, language, retryAttempts },
        videoCall: { enabled: !!basic.videoCall, autoJoin, enableVideo, enableAudio, recording },
        screenShare: { enabled: !!basic.screenShare,  autoJoin, enableVideo, enableAudio, recording }
      },

      deliveryStrategy: "all",
      retryPolicy: {
        maxRetries: 3,
        retryInterval: 5000
      },
      quietHours: {
        enabled: false,
        startTime: "22:00",
        endTime: "07:00",
        timeZone: "UTC",
        days: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday"
        ]
      }
    };
  }

  /**
   * Returns the normalized channel configuration
   */
  public getChannels(): NotificationChannels {
    return this.channels;
  }

  /**
   * Check if a given channel (basic or advanced) is enabled
   */
  public isChannelEnabled(channel: keyof NotificationChannels["advanced"] | keyof NotificationChannels): boolean {
    const ch = (this.channels as any)[channel];
    if (ch?.enabled !== undefined) return ch.enabled;

    const advancedCh = (this.channels.advanced as any)[channel];
    return advancedCh?.enabled ?? false;
  }

  /**
   * Return only active channels
   */
  public getEnabledChannels(): string[] {
    const enabled: string[] = [];

    for (const key of Object.keys(this.channels)) {
      const ch = (this.channels as any)[key];
      if (ch?.enabled) enabled.push(key);
    }

    for (const key of Object.keys(this.channels.advanced)) {
      const ch = (this.channels.advanced as any)[key];
      if (ch?.enabled) enabled.push(`advanced:${key}`);
    }

    return enabled;
  }

  /**
   * Update a channel’s enabled state dynamically
   */
  public setChannelEnabled(channel: string, enabled: boolean): void {
    if ((this.channels as any)[channel]) {
      (this.channels as any)[channel].enabled = enabled;
    } else if ((this.channels.advanced as any)[channel]) {
      (this.channels.advanced as any)[channel].enabled = enabled;
    } else {
      console.warn(`Channel "${channel}" not found`);
    }
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
    date: Date,
    type: NotificationType,
    messageKey?: keyof typeof NOTIFICATION_MESSAGES,
    position?: NotificationPosition,
    notificationType?: NotificationType,
    options?: {
      additionalOptions?: readonly string[] | string | number | any[] | undefined;
      additionalDocumentOptions?: DocumentOptions;
      additionalOptionsLabel?: string;
    },
    userName?: string
  ) => {
    // 1️⃣ Generate or reuse notification ID
    const notificationId = id ?? UniqueIDGenerator.generateNotificationIDFromMessage(content);

    // 2️⃣ Normalize other properties
    const actualNotificationType = notificationType ?? type;
    const actualPosition = position ?? NotificationPosition.TopRight;

    // 3️⃣ Calculate area (if needed by logs or visuals)
    const area = `${fetchUserAreaDimensions().width}x${fetchUserAreaDimensions().height}`;

    // 4️⃣ Resolve message text based on priority:
    // messageKey → content → generated fallback
    let resolvedMessage: string;
    if (messageKey && NOTIFICATION_MESSAGES[messageKey]) {
      const candidate = NOTIFICATION_MESSAGES[messageKey];
      resolvedMessage = typeof candidate === "function"
        ? candidate(userName || "User")
        : String(candidate);
    } else if (typeof content === "string" && content.trim().length > 0) {
      resolvedMessage = content;
    } else {
      resolvedMessage = this.generateNotificationMessage(type, userName);
    }

    // 5️⃣ Create the new notification object
    this.addNotification({
      id: notificationId,
      content: resolvedMessage,
      date,
      notificationType: actualNotificationType,
      message: resolvedMessage,
      createdAt: new Date(),
      type: AuthNotificationTypes.ACCOUNT_CREATED,
      sendStatus: "Sent",
      completionMessageLog: {
        timestamp: new Date(),
        level: "info",
        message: `Notification of type ${String(actualNotificationType)} sent to ${resolvedMessage}`,
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
      meta: currentMetadata,
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
        NotificationMeta,
        NotificationAttachment,
        NotificationExcludedFields,
        NotificationIncludedFields
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
        NotificationMeta,
        NotificationAttachment,
        NotificationExcludedFields,
        NotificationIncludedFields
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
        NotificationMeta,
        NotificationAttachment,
        NotificationExcludedFields,
        NotificationIncludedFields
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
        NotificationMeta,
        NotificationAttachment,
        NotificationExcludedFields,
        NotificationIncludedFields
        
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
const notificationStoreInstance = new NotificationStore(NOTIFICATION_MESSAGES);


export { notificationStoreInstance };
export default NotificationStore;
