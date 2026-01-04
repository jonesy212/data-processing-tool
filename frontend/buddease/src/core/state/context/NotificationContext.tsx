// NotificationContext.tsx

import {
    BaseDataEntity,
    DefaultExcludedFields,
    DefaultMeta,
} from "@/core/config/BaseConfig";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { DocumentOptions } from '@/core/documents/DocumentOptions';
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NOTIFICATION_TYPES } from "@/core/features/support/NotificationTypes";
import { NotificationType } from "@/core/features/support/UnifiedNotificationTypes";
import { Message } from "@/core/generators/GenerateChatInterfaces";
import { LogEntry } from "@/core/hooks/useLogManagement";
import { NotificationData } from "@/core/hooks/useNotificationSystem";
import {
    NotificationPosition
} from "@/core/models/data/StatusType";
import { LogData } from "@/core/models/LogData";
import { NotificationChannels } from "@/core/notifications/NotificationChannels";
import NotificationStore from "@/core/state/stores/NotificationStore";
import { FileMetadata } from '@/utils/fileCategoryUtils';
import { createContext, ReactNode, useContext } from "react";


// Define missing Notification type
interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  // Add other properties as needed
}

type NotificationContextType<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = NotificationContextProps<
  T,
  K,
  Meta,
  AttachmentType,
  ExcludedFields,
  IncludedFields
> &
  NotificationStore;

export const NotificationContext = createContext<NotificationStore | null>(
  null
);


interface CommunicationContext<
  T extends BaseDataEntity = BaseDataEntity
> {
  // Core identifiers
  communicationId?: string;
  conversationId?: string;
  messageId?: string;
  channelId?: string;
  threadId?: string;
  
  // Participants
  senderId?: string;
  senderName?: string;
  recipientIds?: string[];
  
  // Content
  messageContent?: string;
  messageType?: 'text' | 'file' | 'system' | 'notification';
  
  // Metadata
  timestamp?: string;
  isRead?: boolean;
  isArchived?: boolean;
  
  // Related entities
  relatedEntities?: {
    type: string;
    id: string;
    name?: string;
  }[];
  
  // Additional context from your communication system
  channelType?: 'direct' | 'group' | 'public';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  tags?: string[];
  
  // Your specific communication data
  communicationData?: {
    type: string;
    content: string;
    attachments?: any[];
    metadata?: Record<string, any>;
  };
  
  // System context
  systemContext?: {
    appVersion?: string;
    platform?: string;
    userId?: string;
    sessionId?: string;
  };
}

interface NotificationDataPayload<T = unknown> {
  originalError?: string | Error;
  entityId?: string | number;
  action?: string;
  entityType?: string;
  errorType?: string;
  userId?: string;
  extra?: T;
  count?: number;
  fileName?: string;
  statusCode?: number;
  timestamp?: string;
  status?: string;
  category?: string;
  communicationContext?: CommunicationContext<T>;
  logEntry?: LogEntry; // Add this
  entry?: any; // Or this if you want it generic
  metadata?: T;
  url?: string;
  method?: string;
  updatedFields?: Record<string, any>;
  responseData?: any;
  fileInfo?: FileMetadata;
  details?: string | Record<string, any>;
  directoryInfo?: {
    name: string;
    path: string;
    itemCount?: number;
    isRoot?: boolean;
    hasSubdirectories?: boolean;
    createdDate?: Date | string;
    lastModified?: Date | string;
  };
}


interface NotificationOptions {
  id?: string;
  message?: string;
  dataId?: string;
  data?: NotificationDataPayload;
  error?: string;
  duration?: number;
  position?: NotificationPosition;
  type?: NotificationType;
  onClose?: () => void;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp?: Date;
  channels?: NotificationChannels;
  user?: string;
  metadata?: Record<string, any>;
  component?: string;
  completionMessageLog?: LogData<any, any, any, any, any, any>;
  level?: "info" | "success" | "warning" | "error";
  sendStatus?: "pending" | "sent" | "delivered" | "failed";
  topics?: string[];
  content?: any;
}

interface NotificationContextProps<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  notify: (options: NotificationOptions) => void;
  setDuration: (duration: number) => void;
  setNotifications: (notifications: Notification[]) => void;
  showNotification: (
    title: string,
    message:
      | string
      | Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    content?: any
  ) => void;
  showSuccessNotification: (
    title: string,
    message:
      | string
      | Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    content?: any
  ) => void;
  showErrorNotification: (
    title: string,
    message:
      | string
      | Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    content?: any
  ) => void;
  showInfoNotification: (
    title: string,
    message:
      | string
      | Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    content?: any
  ) => void;
  addNotification: (
    notification: NotificationData<
      T,
      K,
      Meta,
      AttachmentType,
      ExcludedFields,
      IncludedFields
    >
  ) => void;
  sendNotification: (
    notification:
      | NotificationData<
          T,
          K,
          Meta,
          AttachmentType,
          ExcludedFields,
          IncludedFields
        >
      | string,
    options?: {
      type?: NotificationType;
      duration?: number;
      position?: NotificationPosition;
      action?: () => void;
      dismissible?: boolean;
      priority?: "low" | "normal" | "high";
      category?: string;
      metadata?: Record<string, any>;
    }
  ) => string;
  showMessageWithType: (
    message:
      | string
      | Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: NotificationType,
    options?: {
      duration?: number;
      position?: NotificationPosition;
      action?: () => void;
    }
  ) => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  dismissNotification: (notificationId: string) => void;
}

type CustomNotificationType = "RandomDismiss";

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
  store: NotificationStore;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  store,
}) => {
  return (
    <NotificationContext.Provider value={store}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Helper function to convert notification type strings
 * Handles cases where value strings (like "APIError") are used
 * but the type system expects keys (like "API_ERROR")
 */
const getNotificationType = (
  inputType: string | NotificationType
): NotificationType => {
  if (!inputType || typeof inputType !== "string") {
    return "INFO" as NotificationType;
  }

  // First, check if input is already a valid NotificationType
  if (inputType in NOTIFICATION_TYPES) {
    return inputType as NotificationType;
  }

  // Check if input matches any value in NOTIFICATION_TYPES
  const entries = Object.entries(NOTIFICATION_TYPES);

  // Look for matching value
  for (const [key, value] of entries) {
    if (value === inputType) {
      return key as NotificationType;
    }
  }

  // Check common conversions for OperationNotificationTypes values
  const operationTypeConversions: Record<string, NotificationType> = {
    APIError: "API_ERROR" as NotificationType,
    APISuccess: "API_SUCCESS" as NotificationType,
    OperationSuccess: "OPERATION_SUCCESS" as NotificationType,
    OperationError: "OPERATION_ERROR" as NotificationType,
    OperationStart: "OPERATION_START" as NotificationType,
    OperationUpdate: "OPERATION_UPDATE" as NotificationType,
    AssignmentOperation: "ASSIGNMENT_OPERATION" as NotificationType,
    AssignmentOperationSuccess:
      "ASSIGNMENT_OPERATION_SUCCESS" as NotificationType,
    CreationSuccess: "CREATION_SUCCESS" as NotificationType,
    GetStoreSuccess: "GET_STORE_SUCCESS" as NotificationType,
    DisplaySuccess: "DISPLAY_SUCCESS" as NotificationType,
  };

  if (operationTypeConversions[inputType]) {
    return operationTypeConversions[inputType];
  }

  // Check if it's a basic type
  const basicTypes = ["SUCCESS", "ERROR", "WARNING", "INFO"];
  if (basicTypes.includes(inputType.toUpperCase())) {
    return inputType.toUpperCase() as NotificationType;
  }

  // Default fallback
  return "INFO" as NotificationType;
};

const useNotification = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>() => {
  const store = useNotificationStore();

  type ConcreteType = NotificationContextProps<
    T,
    K,
    Meta,
    AttachmentType,
    ExcludedFields,
    IncludedFields
  >;

  // Define cleaner interface for store.notify parameters
  interface StoreNotifyParams {
    id?: string | null;
    content: string;
    date?: Date;
    type?: NotificationType | string;
    messageKey?: keyof typeof NOTIFICATION_MESSAGES;
    position?: NotificationPosition;
    options?: {
      additionalOptions?: readonly string[] | string | number | any[] | undefined;
      additionalDocumentOptions?: DocumentOptions;
      additionalOptionsLabel?: string;
      dataTypeEnum?: string;
      data?: NotificationDataPayload;
      error?: string;
      duration?: number;
      onClose?: () => void;
      channels?: NotificationChannels;
      metadata?: Record<string, any>;
      component?: string;
      completionMessageLog?: any;
      level?: "info" | "success" | "warning" | "error";
      sendStatus?: "pending" | "sent" | "delivered" | "failed";
      topics?: string[];
      dataId?: string;
      // Add any other options that might come from NotificationOptions
      [key: string]: any;
    };
    userName?: string;
  }

  // Create a clean wrapper for store.notify
  const storeNotify = (params: StoreNotifyParams) => {
    const {
      id = null,
      content,
      date = new Date(),
      type = "INFO",
      messageKey,
      position = NotificationPosition.TopRight,
      options = {},
      userName,
    } = params;

    store.notify(
      id,
      content,
      date,
      type,
      messageKey,
      position,
      type, // Pass the same type for both type and notificationType parameters
      options,
      userName
    );
  };

  return {
    notify: (options: NotificationOptions) => {
      const {
        id = null,
        message = "",
        timestamp = new Date(),
        type = "INFO" as NotificationType,
        position = NotificationPosition.TopRight,
        action,
        persistent,
        data,
        error,
        duration,
        onClose,
        channels,
        user,
        metadata,
        component,
        completionMessageLog,
        level,
        sendStatus,
        topics,
        dataId,
        messageKey, // Add this if NotificationOptions has it
      } = options;

      const notificationType = getNotificationType(type);
      
      store.notify(
        id,
        message,           // content
        timestamp,         // date
        notificationType,  // type (4th param)
        messageKey,        // messageKey (5th param) - use when available
        position,          // position (6th param)
        notificationType,  // notificationType (7th param)
        {
          additionalOptions: action ? [action.label] : undefined,
          additionalOptionsLabel: persistent ? "persistent" : undefined,
          data,
          error,
          duration,
          onClose,
          channels,
          metadata,
          component,
          completionMessageLog,
          level,
          sendStatus,
          topics,
          dataId,
        },
        user               // userName (9th param)
      );
    },
    
    // Store methods with proper typing
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    addNotification: store.addNotification as ConcreteType["addNotification"],
    sendNotification:
      store.sendNotification as ConcreteType["sendNotification"],
    showNotification:
      store.showNotification as ConcreteType["showNotification"],
    showSuccessNotification:
      store.showSuccessNotification as ConcreteType["showSuccessNotification"],
    showErrorNotification:
      store.showErrorNotification as ConcreteType["showErrorNotification"],
    showInfoNotification:
      store.showInfoNotification as ConcreteType["showInfoNotification"],
    showMessageWithType:
      store.showMessageWithType as ConcreteType["showMessageWithType"],
    setDuration: store.setDuration as ConcreteType["setDuration"],
    setNotifications:
      store.setNotifications as ConcreteType["setNotifications"],
    dismissNotification:
      store.dismissNotification as ConcreteType["dismissNotification"],

    // Convenience methods
    success: (message: string, id?: string) => {
      store.notify(
        id || null,
        message,
        new Date(),
        "SUCCESS" as NotificationType,
        undefined,
        NotificationPosition.TopRight,
        "SUCCESS" as NotificationType,
        {}
      );
    },

    error: (message: string, id?: string) => {
      store.notify(
        id || null,
        message,
        new Date(),
        "ERROR" as NotificationType,
        undefined,
        NotificationPosition.TopRight,
        "ERROR" as NotificationType,
        {}
      );
    },

    info: (message: string, id?: string) => {
      store.notify(
        id || null,
        message,
        new Date(),
        "INFO" as NotificationType,
        undefined,
        NotificationPosition.TopRight,
        "INFO" as NotificationType,
        {}
      );
    },

    warning: (message: string, id?: string) => {
      store.notify(
        id || null,
        message,
        new Date(),
        "WARNING" as NotificationType,
        undefined,
        NotificationPosition.TopRight,
        "WARNING" as NotificationType,
        {}
      );
    },

    // Type-safe notification creators
    notifySuccess: (options: Omit<NotificationOptions, "type">) => {
      return {
        notify: (overrides?: Partial<NotificationOptions>) => {
          const finalOptions: NotificationOptions = {
            ...options,
            type: "SUCCESS" as NotificationType,
            ...overrides,
          };
          return finalOptions;
        },
      };
    },

    notifyError: (options: Omit<NotificationOptions, "type">) => {
      return {
        notify: (overrides?: Partial<NotificationOptions>) => {
          const finalOptions: NotificationOptions = {
            ...options,
            type: "ERROR" as NotificationType,
            ...overrides,
          };
          return finalOptions;
        },
      };
    },

    notifyInfo: (options: Omit<NotificationOptions, "type">) => {
      return {
        notify: (overrides?: Partial<NotificationOptions>) => {
          const finalOptions: NotificationOptions = {
            ...options,
            type: "INFO" as NotificationType,
            ...overrides,
          };
          return finalOptions;
        },
      };
    },

    notifyWarning: (options: Omit<NotificationOptions, "type">) => {
      return {
        notify: (overrides?: Partial<NotificationOptions>) => {
          const finalOptions: NotificationOptions = {
            ...options,
            type: "WARNING" as NotificationType,
            ...overrides,
          };
          return finalOptions;
        },
      };
    },

    // Batch operations
    batchNotify: (notifications: NotificationOptions[]) => {
      notifications.forEach((notification) => {
        const {
          id = null,
          message = "",
          timestamp = new Date(),
          type = "INFO" as NotificationType,
        } = notification;
        const notificationType = getNotificationType(type);
        store.notify(
          id,
          message,
          timestamp,
          notificationType,
          undefined,
          NotificationPosition.TopRight,
          notificationType,
          {}
        );
      });
    },

    // Utility to check if type is valid
    isValidNotificationType: (type: string): boolean => {
      try {
        const converted = getNotificationType(type);
        return converted !== "INFO" || type === "INFO";
      } catch {
        return false;
      }
    },
  };
};

export const useNotificationStore = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotificationStore must be used within a NotificationProvider"
    );
  return context as NotificationContextType;
};

// Export the helper function for external use
export { getNotificationType, useNotification };
export type {
    CustomNotificationType, Notification, NotificationContextProps,
    NotificationContextType, NotificationDataPayload, NotificationOptions
};

