// snapshotTrigger.ts
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes';

import { Snapshot } from '@/app/snapshots/Snapshot';

import { archiveSnapshot } from '@/app/api/service/ArchiveService';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { validateSnapshot } from '@/app/snapshots/snapshotOperations';
import {
  handleDataUpdateSnapshot,
  handleDefaultSnapshot,
  handleSystemEventSnapshot,
  handleUserActionSnapshot,
  processSnapshotData,
  updateSnapshotMetrics
} from '@/app/snapshots/snapshotValidationUtils';
import { useNotification } from '@/app/state/context/NotificationContext';

const { notify } = useNotification()

export const triggerOnSnapshot = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): void => {
  try {
    // 1. Log the snapshot trigger event
    console.log('Snapshot triggered:', {
      id: snapshot.id,
      timestamp: snapshot.timestamp,
      type: snapshot.type || 'unknown',
      version: snapshot.version
    });

    // 2. Validate the snapshot
    if (!validateSnapshot(snapshot)) {
      console.warn('Invalid snapshot detected:', snapshot.id);
      notify({
        id: `invalid-snapshot-${snapshot.id}`,
        message: 'Invalid Snapshot Detected',
        content: {
          snapshotId: snapshot.id,
          reason: 'Validation failed',
          timestamp: new Date()
        },
        date: new Date(),
        type: 'warning' as NotificationType
      });
      return;
    }

    // 3. Process snapshot data based on type/category
    if (snapshot.dataObject) {
      processSnapshotData(snapshot.dataObject, snapshot.category);
    }

    // 4. Handle different snapshot types
    switch (snapshot.type) {
      case 'data-update':
        handleDataUpdateSnapshot(snapshot);
        break;
      case 'system-event':
        handleSystemEventSnapshot(snapshot);
        break;
      case 'user-action':
        handleUserActionSnapshot(snapshot);
        break;
      default:
        handleDefaultSnapshot(snapshot);
    }

    // 5. Send notification
    notify({
      id: snapshot.id || `snapshot-${Date.now()}`,
      message: 'Snapshot Processed Successfully',
      content: {
        snapshot: {
          id: snapshot.id,
          type: snapshot.type,
          category: snapshot.category,
          timestamp: snapshot.timestamp
        },
        processedAt: new Date()
      },
      date: new Date(),
      type: 'info' as NotificationType
    });

    // 6. Archive the snapshot if needed
    if (snapshot.shouldArchive) {
      archiveSnapshot(snapshot);
    }

    // 7. Trigger subscriber callbacks if they exist
    if (snapshot.subscribers && Array.isArray(snapshot.subscribers)) {
      snapshot.subscribers.forEach(subscriber => {
        if (subscriber.onSnapshotTriggered) {
          subscriber.onSnapshotTriggered(snapshot);
        }
      });
    }

    // 8. Update metrics and analytics
    updateSnapshotMetrics(snapshot);

  } catch (error) {
    console.error('Error in triggerOnSnapshot:', error);
    
    // Error notification
    notify({
      id: `error-${snapshot.id || 'unknown'}`,
      message: 'Snapshot Processing Failed',
      content: {
        snapshotId: snapshot.id,
        error: error.message,
        timestamp: new Date()
      },
      date: new Date(),
      type: 'error' as NotificationType
    });
  }
};
