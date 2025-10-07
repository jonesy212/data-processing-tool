// useNotificationSystem.ts
// hooks/useNotificationSystem.ts
import { useCallback, useRef, useMemo } from 'react';
import { Message } from "@/app/generators/GenerateChatInterfaces";
import { displayToast, showErrorMessage, showToast } from '@/utils/notifications';
import ErrorHandler from '@/utils/ErrorHandler';
import { NotificationOptions } from '@/context/NotificationContext'


export interface NotificationData<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  // Core notification properties
  id: string;
  message: string | Message;
  type: NotificationOptions['type'];
  timestamp: Date;
  read: boolean;
  metadata?: any;
  
  // Additional properties from both interfaces
  dataId?: string;
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
  content?: any;
  sendStatus?: SendStatus | boolean;
  completionMessageLog?: LogData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  date?: Date;
  email?: string;
  status?: AllStatus;
  inApp?: boolean;
  notificationType?: NotificationTypeEnum | string;
  
  // Options
  options?: {
    additionalOptions?: readonly string[] | string | number | any[] | undefined;
    additionalDocumentOptions?: DocumentOptions;
    additionalOptionsLabel?: string;
  };

  // CalendarEvent properties that might be needed
  rsvpStatus?: string;
  participants?: Record<string, any>;
  teamMemberId?: string;

  // Data properties that might be needed
  topics?: string[];
  highlights?: string[];
  files?: string[];
  meta?: StructuredMetadata<T, K>;
}


// Main NotificationSystem interface with proper generics
export interface NotificationSystem<
  T extends BaseDataEntity = any,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // Core notification methods
  notify: (
    message: string | Message, 
    options?: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => string;
  
  showSuccess: (
    message: string | Message, 
    options?: Omit<NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'type'>
  ) => string;
  
  showError: (
    message: string | Message, 
    options?: Omit<NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'type'>
  ) => string;
  
  showWarning: (
    message: string | Message, 
    options?: Omit<NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'type'>
  ) => string;
  
  showInfo: (
    message: string | Message, 
    options?: Omit<NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'type'>
  ) => string;
  
  // Batch operations
  showBatchSuccess: (
    messages: (string | Message)[], 
    options?: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => string[];
  
  showBatchErrors: (
    errors: (string | Message)[], 
    options?: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => string[];
  
  // Snapshot-specific notifications
  showSnapshotSuccess: (
    snapshotId: string, 
    operation: string, 
    options?: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => string;
  
  showSnapshotError: (
    snapshotId: string, 
    operation: string, 
    error: Error, 
    options?: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => string;
  
  showRecoveryAttempt: (
    attemptNumber: number, 
    options?: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => string;
  
  // Enhanced notification methods with additional properties
  showEnhancedNotification: (
    content: any, 
    options?: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => string;
  
  showDataNotification: (
    dataId: string, 
    message: string, 
    options?: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => string;
  
  // Style-aware notification methods
  showStyledNotification: (
    message: string | Message,
    style: Style,
    options?: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => string;
  
  // Management methods
  dismiss: (notificationId: string) => void;
  dismissAll: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  
  // State access
  getNotifications: () => NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  getUnreadCount: () => number;
  hasUnread: () => boolean;
  getNotificationsByType: (type: string) => NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  getNotificationsByDataId: (dataId: string) => NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  getNotificationsByStyle: (styleName: string) => NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  
  // Error handling integration
  handleError: (
    error: Error, 
    context?: string, 
    options?: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => string;
  
  logError: (error: Error, errorInfo?: any) => Promise<void>;
  logWarning: (message: string, extraInfo?: any) => Promise<void>;
  
  // Utility methods
  clear: () => void;
  getNotification: (id: string) => NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  updateNotification: (
    id: string, 
    updates: Partial<NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => boolean;
}

export const useNotificationSystem = <
  T extends BaseDataEntity = any,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): NotificationSystem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  const notificationsRef = useRef<NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>([]);
  const nextIdRef = useRef(1);

  const generateId = useCallback((): string => {
    return `notification-${nextIdRef.current++}-${Date.now()}`;
  }, []);

  // Core notification method - enhanced with additional properties
    // Core notification method - enhanced with all properties
  const notify = useCallback((
    message: string | Message, 
    options: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {}
  ): string => {
    const notificationId = generateId();
    const {
      type = 'info',
      duration = 3000,
      position = 'top-right',
      onClose,
      persistent = false,
      dataId,
      error,
      additionalOptions,
      additionalDocumentOptions,
      additionalOptionsLabel,
      notificationType,
      inApp = true,
      sendStatus,
      style,
      metadata
    } = options;

    const now = new Date();
    
    const notificationData: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: notificationId,
      message,
      type,
      timestamp: now,
      read: false,
      metadata,
      
      // Your additional properties
      dataId,
      error,
      createdAt: now,
      updatedAt: now,
      content: typeof message === 'string' ? message : 'content' in message ? message.content : JSON.stringify(message),
      sendStatus,
      date: now,
      inApp,
      notificationType,
      style,
      options: additionalOptions || additionalDocumentOptions || additionalOptionsLabel ? {
        additionalOptions,
        additionalDocumentOptions,
        additionalOptionsLabel
      } : undefined
    };

    // Add to internal tracking
    notificationsRef.current.push(notificationData);

    // Show UI notification based on type (only for in-app notifications)
    if (inApp) {
      switch (type) {
        case 'success':
          showToast(message, duration, 'success').then(() => onClose?.());
          break;
        case 'error':
          showErrorMessage(typeof message === 'string' ? message : 'content' in message ? message.content : JSON.stringify(message))
            .then(() => onClose?.());
          break;
        case 'warning':
          displayToast(typeof message === 'string' ? message : 'content' in message ? message.content : JSON.stringify(message), 'warning', duration, onClose);
          break;
        case 'info':
        default:
          displayToast(typeof message === 'string' ? message : 'content' in message ? message.content : JSON.stringify(message), 'info', duration, onClose);
          break;
      }

      // Auto-dismiss if not persistent
      if (!persistent && duration > 0) {
        setTimeout(() => {
          dismiss(notificationId);
        }, duration);
      }
    }

    return notificationId;
  }, [generateId]);

  // Enhanced notification method for complex content
  const showEnhancedNotification = useCallback((
    content: any, 
    options: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {}
  ): string => {
    const message: Message = {
      content: typeof content === 'string' ? content : JSON.stringify(content),
      type: options.type || 'info'
    };
    
    return notify(message, {
      ...options,
      content // Store the original content
    });
  }, [notify]);

  // Data-specific notification method
  const showDataNotification = useCallback((
    dataId: string, 
    message: string, 
    options: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {}
  ): string => {
    return notify(message, {
      ...options,
      dataId,
      notificationType: 'data-operation'
    });
  }, [notify]);

  // Style-aware notification method
  const showStyledNotification = useCallback((
    message: string | Message,
    style: Style,
    options: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {}
  ): string => {
    return notify(message, {
      ...options,
      style,
      notificationType: options.notificationType || 'styled'
    });
  }, [notify]);

  // Type-specific convenience methods
  const showSuccess = useCallback((
    message: string | Message, 
    options: Omit<NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'type'> = {}
  ): string => {
    return notify(message, { ...options, type: 'success' });
  }, [notify]);

  const showError = useCallback((
    message: string | Message, 
    options: Omit<NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'type'> = {}
  ): string => {
    return notify(message, { ...options, type: 'error' });
  }, [notify]);

  const showWarning = useCallback((
    message: string | Message, 
    options: Omit<NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'type'> = {}
  ): string => {
    return notify(message, { ...options, type: 'warning' });
  }, [notify]);

  const showInfo = useCallback((
    message: string | Message, 
    options: Omit<NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'type'> = {}
  ): string => {
    return notify(message, { ...options, type: 'info' });
  }, [notify]);

  // Batch operations
  const showBatchSuccess = useCallback((
    messages: (string | Message)[], 
    options: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {}
  ): string[] => {
    return messages.map(message => showSuccess(message, options));
  }, [showSuccess]);

  const showBatchErrors = useCallback((
    errors: (string | Message)[], 
    options: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {}
  ): string[] => {
    return errors.map(error => showError(error, options));
  }, [showError]);

  // Snapshot-specific notifications
  const showSnapshotSuccess = useCallback((
    snapshotId: string, 
    operation: string, 
    options: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {}
  ): string => {
    const message: Message = {
      content: `Snapshot ${snapshotId} ${operation} successfully`,
      type: 'success'
    };
    return showSuccess(message, { ...options, dataId: snapshotId });
  }, [showSuccess]);

  const showSnapshotError = useCallback((
    snapshotId: string, 
    operation: string, 
    error: Error, 
    options: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {}
  ): string => {
    const message: Message = {
      content: `Failed to ${operation} snapshot ${snapshotId}: ${error.message}`,
      type: 'error'
    };
    return showError(message, { ...options, dataId: snapshotId, error: error.message });
  }, [showError]);

  const showRecoveryAttempt = useCallback((
    attemptNumber: number, 
    options: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {}
  ): string => {
    const message: Message = {
      content: `Recovery attempt ${attemptNumber} in progress...`,
      type: 'info'
    };
    return showInfo(message, { ...options, persistent: true, notificationType: 'recovery' });
  }, [showInfo]);

  // Management methods
  const dismiss = useCallback((notificationId: string): void => {
    notificationsRef.current = notificationsRef.current.filter(notification => notification.id !== notificationId);
  }, []);

  const dismissAll = useCallback((): void => {
    notificationsRef.current = [];
  }, []);

  const markAsRead = useCallback((notificationId: string): void => {
    const notification = notificationsRef.current.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      notification.updatedAt = new Date();
    }
  }, []);

  const markAllAsRead = useCallback((): void => {
    const now = new Date();
    notificationsRef.current.forEach(notification => {
      notification.read = true;
      notification.updatedAt = now;
    });
  }, []);

  // State access methods
  const getNotifications = useCallback((): NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {
    return [...notificationsRef.current];
  }, []);

  const getUnreadCount = useCallback((): number => {
    return notificationsRef.current.filter(notification => !notification.read).length;
  }, []);

  const hasUnread = useCallback((): boolean => {
    return getUnreadCount() > 0;
  }, [getUnreadCount]);

  const getNotificationsByType = useCallback((type: string): NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {
    return notificationsRef.current.filter(notification => 
      notification.notificationType === type || notification.type === type
    );
  }, []);

  const getNotificationsByDataId = useCallback((dataId: string): NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {
    return notificationsRef.current.filter(notification => notification.dataId === dataId);
  }, []);

  const getNotificationsByStyle = useCallback((styleName: string): NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] => {
    return notificationsRef.current.filter(notification => 
      notification.style?.name === styleName
    );
  }, []);

  // Error handling integration
  const handleError = useCallback((
    error: Error, 
    context?: string, 
    options: NotificationOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {}
  ): string => {
    const errorMessage = context ? `Error in ${context}: ${error.message}` : error.message;
    
    // Log error for monitoring
    ErrorHandler.logError(error, { 
      context, 
      timestamp: new Date().toISOString(),
      ...options 
    });
    
    // Show user-facing notification
    return showError(errorMessage, { ...options, error: error.message });
  }, [showError]);

  const logError = useCallback(async (error: Error, errorInfo?: any): Promise<void> => {
    await ErrorHandler.logError(error, errorInfo);
  }, []);

  const logWarning = useCallback(async (message: string, extraInfo?: any): Promise<void> => {
    await ErrorHandler.logWarning(message, extraInfo);
  }, []);

  // Utility methods
  const clear = useCallback((): void => {
    dismissAll();
  }, [dismissAll]);

  const getNotification = useCallback((id: string): NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined => {
    return notificationsRef.current.find(notification => notification.id === id);
  }, []);

  const updateNotification = useCallback((
    id: string, 
    updates: Partial<NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): boolean => {
    const notification = notificationsRef.current.find(n => n.id === id);
    if (notification) {
      Object.assign(notification, updates);
      notification.updatedAt = new Date();
      return true;
    }
    return false;
  }, []);

  // Return the complete notification system
  return useMemo(() => ({
    // Core methods
    notify,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Enhanced methods
    showEnhancedNotification,
    showDataNotification,
    
    // Batch operations
    showBatchSuccess,
    showBatchErrors,
    
    // Snapshot-specific
    showSnapshotSuccess,
    showSnapshotError,
    showRecoveryAttempt,
    
    // Management
    dismiss,
    dismissAll,
    markAsRead,
    markAllAsRead,
    
    // State access
    getNotifications,
    getUnreadCount,
    hasUnread,
    getNotificationsByType,
    getNotificationsByDataId,
    
    // Error handling
    handleError,
    logError,
    logWarning,
    
    // Utilities
    clear,
    getNotification,
    updateNotification
  }), [
    notify,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showEnhancedNotification,
    showDataNotification,
    showBatchSuccess,
    showBatchErrors,
    showSnapshotSuccess,
    showSnapshotError,
    showRecoveryAttempt,
    dismiss,
    dismissAll,
    markAsRead,
    markAllAsRead,
    getNotifications,
    getUnreadCount,
    hasUnread,
    getNotificationsByType,
    getNotificationsByDataId,
    handleError,
    logError,
    logWarning,
    clear,
    getNotification,
    updateNotification
  ]);
};

// Export for use in category hooks
export default useNotificationSystem;