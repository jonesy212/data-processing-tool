// NotificationManagerService.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import { NotificationContainer } from '@/core/services/NotificationService';

/**
 * Global notification manager that provides a central registry
 * for notification handlers across the application.
 */
export class NotificationManagerService<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  // Singleton instance for default type parameters
  private static defaultInstance: NotificationManagerService<any, any, any, any, any, any> | null = null;
  
  // Registry for multiple notification handlers
  private static handlers: Map<string, Function> = new Map();
  
  // Fallback handler when no specific handler is registered
  private static fallbackHandler: Function | null = null;
  
  // Global notification handler (compatible with NotificationContainer['notify'])
  public static notify: NotificationContainer<any, any, any, any, any, any>['notify'] | null = null;
  
  // Store the last notification for debugging/replay
  private static lastNotification: any = null;
  
  /**
   * Register a global notification handler
   * This is typically called during app initialization
   */
  public static registerHandler<
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    handler: NotificationContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>['notify']
  ): void {
    this.notify = handler as any;
    console.log('Notification handler registered globally');
  }
  
  /**
   * Register a named handler for specific notification types
   */
  public static registerNamedHandler(
    name: string,
    handler: Function
  ): void {
    this.handlers.set(name, handler);
    console.log(`Notification handler "${name}" registered`);
  }
  
  /**
   * Set a fallback handler for unhandled notifications
   */
  public static setFallbackHandler(handler: Function): void {
    this.fallbackHandler = handler;
  }
  
  /**
   * Trigger a notification using the registered handler
   * This is the main entry point for notifications
   */
  public static trigger<
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    id: string,
    message: string,
    data: any,
    timestamp: Date,
    type: NotificationType
  ): boolean {
    try {
      // Store for debugging
      this.lastNotification = { id, message, data, timestamp, type };
      
      // Try to use the global handler first
      if (this.notify) {
        this.notify(id, message, data, timestamp, type);
        return true;
      }
      
      // Try named handler based on notification type or ID
      const handlerName = `handler_${type}`;
      const namedHandler = this.handlers.get(handlerName);
      if (namedHandler) {
        namedHandler(id, message, data, timestamp, type);
        return true;
      }
      
      // Try fallback handler
      if (this.fallbackHandler) {
        this.fallbackHandler(id, message, data, timestamp, type);
        return true;
      }
      
      // Log warning if no handler found
      console.warn(`No notification handler found for: ${id} (${type})`);
      return false;
      
    } catch (error) {
      console.error('Error triggering notification:', error);
      return false;
    }
  }
  
  /**
   * Get the singleton instance with default type parameters
   */
  public static getInstance<
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(): NotificationManagerService<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    if (!this.defaultInstance) {
      this.defaultInstance = new NotificationManagerService();
    }
    return this.defaultInstance as NotificationManagerService<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }
  
  /**
   * Get last triggered notification (for debugging)
   */
  public static getLastNotification(): any {
    return this.lastNotification;
  }
  
  /**
   * Clear all registered handlers
   */
  public static clearHandlers(): void {
    this.notify = null;
    this.handlers.clear();
    this.fallbackHandler = null;
    console.log('All notification handlers cleared');
  }
  
  /**
   * Check if a handler is registered
   */
  public static hasHandler(): boolean {
    return this.notify !== null || this.handlers.size > 0 || this.fallbackHandler !== null;
  }
  
  /**
   * Get statistics about registered handlers
   */
  public static getStats(): {
    hasGlobalHandler: boolean;
    namedHandlers: number;
    hasFallback: boolean;
  } {
    return {
      hasGlobalHandler: this.notify !== null,
      namedHandlers: this.handlers.size,
      hasFallback: this.fallbackHandler !== null,
    };
  }
}

/**
 * Convenience function for quick notification triggering
 */
export function notifyGlobal<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  id: string,
  message: string,
  data: any = {},
  type: NotificationType,
  timestamp: Date = new Date()
): boolean {
  return NotificationManagerService.trigger(id, message, data, timestamp, type);
}

/**
 * Pre-configured notification helpers for common scenarios
 */
export const NotificationHelpers = {
  success: (id: string, message: string, data?: any) => 
    notifyGlobal(id, message, data, 'SUCCESS' as NotificationType),
  
  error: (id: string, message: string, error?: any) => 
    notifyGlobal(id, message, { error }, 'ERROR' as NotificationType),
  
  warning: (id: string, message: string, data?: any) => 
    notifyGlobal(id, message, data, 'WARNING' as NotificationType),
  
  info: (id: string, message: string, data?: any) => 
    notifyGlobal(id, message, data, 'INFO' as NotificationType),
  
  snapshotSaved: (snapshotData: any) =>
    notifyGlobal(
      'SaveSnapshotSuccessId',
      'Snapshot saved successfully',
      snapshotData,
      'SUCCESS' as NotificationType
    ),
  
  snapshotError: (error: any) =>
    notifyGlobal(
      'SaveSnapshotErrorId',
      'Failed to save snapshot to database',
      { error: String(error) },
      'ERROR' as NotificationType
    ),
};