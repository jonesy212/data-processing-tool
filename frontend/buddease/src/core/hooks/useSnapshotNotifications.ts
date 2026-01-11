// useSnapshotNotifications.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import UniqueIDGenerator from '@/core/generators/GenerateUniqueIds';
import { NotificationData } from '@/core/hooks/useNotificationSystem';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import snapshotStoreInstance from '@/core/snapshots/SnapshotStore';
import { useSnapshot } from "@/core/state/context/SnapshotContext";
import { notificationStoreInstance } from '@/core/state/stores/NotificationStore';
import { useCallback } from 'react';

// Snapshot notification types
interface SnapshotNotificationOptions {
  includeMetadata?: boolean;
  showVersionChanges?: boolean;
  trackUserActions?: boolean;
  autoDismiss?: boolean;
  dismissAfter?: number; // milliseconds
}

/**
 * Hook for managing notifications related to snapshot operations
 */
export function useSnapshotNotifications<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(options: SnapshotNotificationOptions = {}) {
  const {
    includeMetadata = true,
    showVersionChanges = true,
    trackUserActions = true,
    autoDismiss = false,
    dismissAfter = 5000
  } = options;

  const snapshotState = useSnapshot(snapshotStoreInstance.state);
  const notificationStore = notificationStoreInstance;

  const notifySnapshotCreated = useCallback((
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => {
    const notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: UniqueIDGenerator.generateSnapshoItemID('snapshot_created'),
      title: 'Snapshot Created',
      message: `Snapshot "${snapshot.id}" was successfully created`,
      content: includeMetadata ? {
        snapshotId: snapshot.id,
        version: snapshot.version,
        timestamp: snapshot.timestamp,
        author: snapshot.author,
        metadata: snapshot.metadata
      } : undefined,
      date: new Date(),
      type: NotificationTypeEnum.CreationSuccess,
      completionMessageLog: {
        date: new Date(),
        timestamp: new Date(),
        level: "info",
        message: `Snapshot ${snapshot.id} created successfully`,
        snapshotData: snapshot,
        // Add other required LogData properties
        sent: new Date(),
        isSent: true,
        isDelivered: false,
        delivered: null,
        opened: null,
        clicked: null,
        responded: null,
        responseTime: null,
        eventData: null,
        topics: [],
        highlights: [],
        files: [],
        meta: null
      } as LogData<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, AttachmentType, ExcludedFields, IncludedFields>
    };

    notificationStore.addNotification(notification);

    if (autoDismiss) {
      setTimeout(() => {
        notificationStore.removeNotification(notification.id!);
      }, dismissAfter);
    }
  }, [includeMetadata, autoDismiss, dismissAfter, notificationStore]);

  const notifySnapshotError = useCallback((
    error: Error, 
    operation: string, 
    snapshotId?: string
  ) => {
    const notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: UniqueIDGenerator.generateSnapshoItemID('snapshot_error'),
      title: 'Snapshot Error',
      message: `Failed to ${operation}${snapshotId ? ` snapshot "${snapshotId}"` : ''}: ${error.message}`,
      content: includeMetadata ? {
        operation,
        snapshotId,
        error: error.message,
        stack: error.stack
      } : undefined,
      date: new Date(),
      type: NotificationTypeEnum.ERROR,
      completionMessageLog: {
        date: new Date(),
        timestamp: new Date(),
        level: "error",
        message: `Snapshot operation failed: ${operation}`,
        error: error.message,
        // Add other required LogData properties
        sent: new Date(),
        isSent: true,
        isDelivered: false,
        delivered: null,
        opened: null,
        clicked: null,
        responded: null,
        responseTime: null,
        eventData: null,
        topics: [],
        highlights: [],
        files: [],
        meta: null
      } as LogData<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, AttachmentType, ExcludedFields, IncludedFields>
    };

    notificationStore.addNotification(notification);

    if (autoDismiss) {
      setTimeout(() => {
        notificationStore.removeNotification(notification.id!);
      }, dismissAfter);
    }
  }, [includeMetadata, autoDismiss, dismissAfter, notificationStore]);

  // ... other notification methods with updated types

  return {
    // Notification creators
    notifySnapshotCreated,
    notifySnapshotRestored,
    notifySnapshotError,
    notifyVersionChange,
    notifyUserAction,
    
    // Management functions
    clearSnapshotNotifications,
    
    // State
    snapshotNotifications,
    allNotifications: notificationStore.notifications,
    
    // Original store methods
    addNotification: notificationStore.addNotification,
    removeNotification: notificationStore.removeNotification,
    clearNotifications: notificationStore.clearNotifications
  };
}
// Export the hook
export default useSnapshotNotifications;