// NotificationService.ts
import { NotificationChannels } from '@/app/notifications/NotificationChannels';
import { NotificationType } from '@/state/context/NotificationContext';
import { NotificationTypeEnum, NotificationOptions } from '@/app/state/context/NotificationContext'

class NotificationServiceClass {
  notify(options: NotificationOptions) {
    // Implement actual dispatch or console log
    console.log(`[Notification] ${options.type}: ${options.message}`);
    
    // Access the new properties
    if (options.channels) {
      console.log(`Channels: ${Object.keys(options.channels).join(', ')}`);
    }
    if (options.user) {
      console.log(`User: ${options.user}`);
    }
    if (options.metadata) {
      console.log(`Metadata:`, options.metadata);
    }
    if (options.component) {
      console.log(`Component: ${options.component}`);
    }
    
    // Here you could integrate with Redux, Zustand, or any other store
  }

  // Enhanced methods with proper typing
  success(message: string, additionalData?: Partial<NotificationOptions>) {
    const notification: NotificationOptions = {
      message,
      type: 'success' as NotificationType, // Cast to your NotificationType if needed
      level: 'success',
      timestamp: new Date(),
      ...additionalData
    };
    this.notify(notification);
  }

  error(message: string, error?: Error, additionalData?: Partial<NotificationOptions>) {
    const notification: NotificationOptions = {
      message: error ? `${message}: ${error.message}` : message,
      type: 'error' as NotificationType,
      level: 'error',
      timestamp: new Date(),
      error: error?.message,
      ...additionalData
    };
    this.notify(notification);
  }

  warning(message: string, additionalData?: Partial<NotificationOptions>) {
    const notification: NotificationOptions = {
      message,
      type: 'warning' as NotificationType,
      level: 'warning',
      timestamp: new Date(),
      ...additionalData
    };
    this.notify(notification);
  }

  // Channel-aware notification
  channelAware(
    message: string, 
    type: 'success' | 'error' | 'warning',
    channels: NotificationChannels,
    additionalData?: Partial<NotificationOptions>
  ) {
    const notification: NotificationOptions = {
      message,
      type: type as NotificationType,
      channels,
      timestamp: new Date(),
      level: type,
      ...additionalData
    };
    this.notify(notification);
  }
}

export const NotificationService = new NotificationServiceClass();
