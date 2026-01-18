// NotificationServiceClass.ts
import type { NotificationTypeEnum, UnifiedNotificationOptions } from '@/core/features/support/UnifiedNotificationTypes';
import { NotificationPosition } from '@/core/models/data/StatusType';
import { NotificationChannels } from '@/core/notifications/NotificationChannels';

class NotificationServiceClass {
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Add missing dispatch method
  private dispatch(action: any) {
    try {
      // Try to access Redux store
      const { store } = require('@/core/state/store');
      if (store && store.dispatch) {
        store.dispatch(action);
      }
    } catch (error) {
      console.warn('Redux store not available for notification dispatch');
    }
  }

  // Store integration helper
  private getStore() {
    try {
      const { store } = require('@/core/state/store');
      return store;
    } catch (error) {
      return null;
    }
  }

  // PRIMARY NOTIFICATION METHOD
  notify(options: UnifiedNotificationOptions) {
    const fullOptions: UnifiedNotificationOptions = {
      id: options.id || this.generateId(),
      timestamp: options.timestamp || new Date(),
      position: options.position || NotificationPosition.TopRight,
      duration: options.duration ?? 5000,
      ...options
    };

    console.log(`[Notification] ${fullOptions.type}: ${fullOptions.message}`, {
      id: fullOptions.id,
      data: fullOptions.data,
      channels: fullOptions.channels,
      user: fullOptions.user
    });

    // Store integration
    try {
      const { NotificationActions } = require('@/core/actions/NotificationActions');
      const notificationData = {
        id: fullOptions.id!,
        message: fullOptions.message || '',
        type: fullOptions.type || NotificationTypeEnum.INFO,
        data: fullOptions.data,
        timestamp: fullOptions.timestamp || new Date(),
        createdAt: fullOptions.timestamp || new Date(),
        content: fullOptions.data,
        completionMessageLog: fullOptions.completionMessageLog,
        sendStatus: fullOptions.sendStatus || 'sent',
        status: 'active',
        ...fullOptions
      };
      this.dispatch(NotificationActions.addNotification(notificationData));
    } catch (error) {
      console.warn('Could not dispatch notification to store:', error);
    }

    // Context integration
    try {
      const { useNotification } = require('@/core/state/context/NotificationContext');
      const notificationContext = useNotification();
      notificationContext.notify(fullOptions);
    } catch (error) {
      console.warn('Notification context not available');
    }
  }

  // ... ALL YOUR EXISTING METHODS REMAIN THE SAME (success, error, warning, info, etc.)
  success(message: string, additionalData?: Partial<UnifiedNotificationOptions>) {
    const notification: UnifiedNotificationOptions = {
      id: this.generateId(),
      message,
      type: 'Success' as NotificationType,
      level: 'success',
      timestamp: new Date(),
      ...additionalData
    };
    this.notify(notification);
  }

  error(message: string, error?: Error, additionalData?: Partial<UnifiedNotificationOptions>) {
    const notification: UnifiedNotificationOptions = {
      id: this.generateId(),
      message: error ? `${message}: ${error.message}` : message,
      type: 'Error' as NotificationType,
      level: 'error',
      timestamp: new Date(),
      error: error?.message,
      ...additionalData
    };
    this.notify(notification);
  }

  warning(message: string, additionalData?: Partial<UnifiedNotificationOptions>) {
    const notification: UnifiedNotificationOptions = {
      id: this.generateId(),
      message,
      type: 'Warning' as NotificationType,
      level: 'warning',
      timestamp: new Date(),
      ...additionalData
    };
    this.notify(notification);
  }

  info(message: string, additionalData?: Partial<UnifiedNotificationOptions>) {
    const notification: UnifiedNotificationOptions = {
      id: this.generateId(),
      message,
      type: 'Info' as NotificationType,
      level: 'info',
      timestamp: new Date(),
      ...additionalData
    };
    this.notify(notification);
  }

  channelAware(
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info',
    channels: NotificationChannels,
    additionalData?: Partial<UnifiedNotificationOptions>
  ) {
    const notification: UnifiedNotificationOptions = {
      id: this.generateId(),
      message,
      type: type as NotificationType,
      channels,
      timestamp: new Date(),
      level: type,
      ...additionalData
    };
    this.notify(notification);
  }

  operationSuccess(operation: string, data?: any) {
    this.success(`${operation} completed successfully`, { data });
  }

  operationError(operation: string, error: Error, data?: any) {
    this.error(`Failed to ${operation.toLowerCase()}`, error, { data });
  }

  legacyNotify(id: string, message: string, data: any, date: Date, type: NotificationType) {
    this.notify({
      id,
      message,
      data,
      timestamp: date,
      type
    });
  }

  apiSuccess(message: string, data?: any) {
    this.notify({
      id: this.generateId(),
      message,
      type: NotificationTypeEnum.API_SUCCESS,
      timestamp: new Date(),
      data,
      level: 'success'
    });
  }

  apiError(message: string, error?: Error, data?: any) {
    this.notify({
      id: this.generateId(),
      message: error ? `${message}: ${error.message}` : message,
      type: NotificationTypeEnum.API_ERROR,
      timestamp: new Date(),
      data: { ...data, originalError: error },
      level: 'error'
    });
  }

  systemUpdate(message: string, data?: any) {
    this.notify({
      id: this.generateId(),
      message,
      type: NotificationTypeEnum.SYSTEM_UPDATE_IN_PROGRESS,
      timestamp: new Date(),
      data,
      level: 'info'
    });
  }

  dataLoading(message: string, data?: any) {
    this.notify({
      id: this.generateId(),
      message,
      type: NotificationTypeEnum.DATA_LOADING,
      timestamp: new Date(),
      data,
      level: 'info'
    });
  }

  welcome(user: string) {
    this.notify({
      id: this.generateId(),
      message: `Welcome ${user}!`,
      type: NotificationTypeEnum.WELCOME,
      timestamp: new Date(),
      user,
      level: 'success'
    });
  }

  accountCreated(user: string) {
    this.notify({
      id: this.generateId(),
      message: 'Account created successfully',
      type: NotificationTypeEnum.ACCOUNT_CREATED,
      timestamp: new Date(),
      user,
      level: 'success'
    });
  }

  teamJoinRequest(teamName: string, userName: string) {
    this.notify({
      id: this.generateId(),
      message: `${userName} requested to join ${teamName}`,
      type: NotificationTypeEnum.TEAM_JOIN_REQUEST,
      timestamp: new Date(),
      data: { teamName, userName },
      level: 'info'
    });
  }

  newChatMessage(chatName: string, sender: string) {
    this.notify({
      id: this.generateId(),
      message: `New message in ${chatName} from ${sender}`,
      type: NotificationTypeEnum.NEW_CHAT_MESSAGE,
      timestamp: new Date(),
      data: { chatName, sender },
      level: 'info'
    });
  }

  contentUpdated(contentType: string, contentId: string) {
    this.notify({
      id: this.generateId(),
      message: `${contentType} updated successfully`,
      type: NotificationTypeEnum.ARTICLE_UPDATED,
      timestamp: new Date(),
      data: { contentType, contentId },
      level: 'success'
    });
  }

  phaseStart(phaseName: string, data?: any) {
    this.notify({
      id: this.generateId(),
      message: `${phaseName} phase started`,
      type: `${phaseName.replace(/\s+/g, '')}Start` as NotificationType,
      timestamp: new Date(),
      data,
      level: 'info'
    });
  }

  phaseComplete(phaseName: string, data?: any) {
    this.notify({
      id: this.generateId(),
      message: `${phaseName} phase completed`,
      type: `${phaseName.replace(/\s+/g, '')}Complete` as NotificationType,
      timestamp: new Date(),
      data,
      level: 'success'
    });
  }

  batchNotify(notifications: UnifiedNotificationOptions[]) {
    notifications.forEach(notification => {
      this.notify(notification);
    });
  }

  // DISMISS METHODS (now with proper store integration)
  dismiss(notificationId: string) {
    console.log(`[Notification] Dismissing: ${notificationId}`);
    try {
      const { NotificationActions } = require('@/core/actions/NotificationActions');
      this.dispatch(NotificationActions.removeNotification(notificationId));
      try {
        const { useNotification } = require('@/core/state/context/NotificationContext');
        const notificationContext = useNotification();
        notificationContext.removeNotification(notificationId);
      } catch (contextError) {
        // Context might not be available
      }
    } catch (error) {
      console.warn('Could not dispatch dismiss action to store:', error);
    }
  }

  clearAll() {
    console.log('[Notification] Clearing all notifications');
    try {
      const { NotificationActions } = require('@/core/actions/NotificationActions');
      this.dispatch(NotificationActions.clearNotifications());
      try {
        const { useNotification } = require('@/core/state/context/NotificationContext');
        const notificationContext = useNotification();
        notificationContext.clearNotifications();
      } catch (contextError) {
        // Context might not be available
      }
    } catch (error) {
      console.warn('Could not dispatch clear action to store:', error);
    }
  }

  dismissMultiple(notificationIds: string[]) {
    console.log(`[Notification] Dismissing ${notificationIds.length} notifications`);
    try {
      const { NotificationActions } = require('@/core/actions/NotificationActions');
      notificationIds.forEach(notificationId => {
        this.dispatch(NotificationActions.removeNotification(notificationId));
      });
    } catch (error) {
      console.warn('Could not dispatch batch dismiss actions to store:', error);
    }
  }

  dismissByType(notificationType: NotificationType) {
    console.log(`[Notification] Dismissing all notifications of type: ${notificationType}`);
    try {
      const store = this.getStore();
      const state = store.getState();
      const notifications = state.notifications?.items || [];
      const idsToDismiss = notifications
        .filter((notification: any) => notification.type === notificationType)
        .map((notification: any) => notification.id);
      this.dismissMultiple(idsToDismiss);
    } catch (error) {
      console.warn('Could not dismiss notifications by type:', error);
    }
  }

  dismissByUser(userId: string) {
    console.log(`[Notification] Dismissing all notifications for user: ${userId}`);
    try {
      const store = this.getStore();
      const state = store.getState();
      const notifications = state.notifications?.items || [];
      const idsToDismiss = notifications
        .filter((notification: any) => notification.user === userId)
        .map((notification: any) => notification.id);
      this.dismissMultiple(idsToDismiss);
    } catch (error) {
      console.warn('Could not dismiss notifications by user:', error);
    }
  }
}

export const NotificationService = new NotificationServiceClass();