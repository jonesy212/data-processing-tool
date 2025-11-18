// NotificationContext.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { DocumentTypeEnum } from "@/app/typings/documentTypes";
import { NOTIFICATION_TYPES } from '@/app/features/support/NotificationTypes';
import { NotificationChannels } from '@/app/notifications/NotificationChannels';
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { NotificationData } from '@/app/hooks/useNotificationSystem';
import { NotificationPosition, PriorityTypeEnum } from '@/app/models/data/StatusType';
import NotificationStore from '@/app/state/stores/NotificationStore';
import { NotificationAttachment, NotificationEntity, NotificationExcludedFields, NotificationIncludedFields, NotificationK, NotificationMeta } from '@/app/typings/entities/NotificationEntity';
import { LogData } from '@/app/models/LogData'
import { createContext, useContext } from 'react';

type NotificationContextType<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = NotificationContextProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & NotificationStore;

// 3️⃣ Use it in your context
export const NotificationContext = createContext<NotificationStore | null>(null);


interface NotificationDataPayload<T = unknown> {
  originalError?: string | Error; // For errors
  entityId?: string | number;     // ID of the affected item (e.g., snapshot, content)
  entityType?: string;            // e.g., "Snapshot", "Content"
  userId?: string;                // Optional user reference
  extra?: T;                      // Any additional structured data
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
  
  // Also add completionMessageLog from your previous usage
  completionMessageLog?: LogData<any, any, any, any, any, any>; // Use your actual LogData type
  
  // You might also want these from the enhanced system:
  level?: 'info' | 'success' | 'warning' | 'error'; // For consistency with LogData
  sendStatus?: 'pending' | 'sent' | 'delivered' | 'failed';
  topics?: string[];
}

// Make the interface fully generic
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
  
  showNotification: (title: string, message: string | Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, content?: any) => void;
  showSuccessNotification: (title: string, message: string | Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, content?: any) => void;
  showErrorNotification: (title: string, message: string | Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, content?: any) => void;
  showInfoNotification: (title: string, message: string | Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, content?: any) => void;
  addNotification: (notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  sendNotification: (
    notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string,
    options?: {
      type?: NotificationType;
      duration?: number;
      position?: NotificationPosition;
      action?: () => void;
      dismissible?: boolean;
      priority?: 'low' | 'normal' | 'high';
      category?: string;
      metadata?: Record<string, any>;
    }
  ) => string; 
    showMessageWithType: (
    message: string | Message<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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

const NotificationTypeEnum = NOTIFICATION_TYPES;

type NotificationType = DocumentTypeEnum 
  | PriorityTypeEnum 
  | CustomNotificationType
  | typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

type MainNotificationType = NotificationType;


const useNotification = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): Pick<
  NotificationContextProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  | "notify"
  | "addNotification"
  | "removeNotification"
  | "clearNotifications"
  | "showNotification"
  | "showSuccessNotification"
  | "showErrorNotification"
  | "showInfoNotification"
  | "sendNotification"
  | "showMessageWithType"
> => {
  const store = useNotificationStore();

  return {
    // ✅ Wrap multi-argument notify into NotificationOptions form
    notify: (options: NotificationOptions) => {
      const {
        id = null,
        message = "",
        timestamp = new Date(),
        type = NotificationTypeEnum.INFO,
        position = NotificationPosition.TopRight,
        action,
        persistent,
      } = options;

      const additionalOptions = {
        additionalOptions: action ? [action.label] : undefined,
        additionalDocumentOptions: undefined,
        additionalOptionsLabel: persistent ? "persistent" : undefined,
      };

      store.notify(id, message, timestamp, type, undefined, position, type, additionalOptions);
    },
    
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,

    addNotification: store.addNotification as NotificationContextProps<
      T,
      K,
      Meta,
      AttachmentType,
      ExcludedFields,
      IncludedFields
    >["addNotification"],

    showNotification:
      store.showNotification as NotificationContextProps<
        T,
        K,
        Meta,
        AttachmentType,
        ExcludedFields,
        IncludedFields
      >["showNotification"],

    showSuccessNotification:
      store.showSuccessNotification as NotificationContextProps<
        T,
        K,
        Meta,
        AttachmentType,
        ExcludedFields,
        IncludedFields
      >["showSuccessNotification"],

    showErrorNotification:
      store.showErrorNotification as NotificationContextProps<
        T,
        K,
        Meta,
        AttachmentType,
        ExcludedFields,
        IncludedFields
      >["showErrorNotification"],

    showInfoNotification:
      store.showInfoNotification as NotificationContextProps<
        T,
        K,
        Meta,
        AttachmentType,
        ExcludedFields,
        IncludedFields
      >["showInfoNotification"],

    sendNotification:
      store.sendNotification as NotificationContextProps<
        T,
        K,
        Meta,
        AttachmentType,
        ExcludedFields,
        IncludedFields
      >["sendNotification"],

    showMessageWithType:
      store.showMessageWithType as NotificationContextProps<
        T,
        K,
        Meta,
        AttachmentType,
        ExcludedFields,
        IncludedFields
      >["showMessageWithType"],
  };
};


// Also make the store hook generic if needed
export const useNotificationStore = (): NotificationContextType => {
  const context = useContext(NotificationContext as React.Context<NotificationContextType | null>);
  if (!context) throw new Error('useNotificationStore must be used within a NotificationProvider');
  return context;
};


export { NotificationTypeEnum, useNotification };
export type { MainNotificationType, NotificationContextProps, NotificationContextType, NotificationOptions, NotificationType };
