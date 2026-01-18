// persistSnapshot.ts
import { handleApiError } from '@/core/api/ApiLogs';
import DatabaseClient from "@/core/api/DatabaseClient";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/core/config/BaseConfig";
import { DatabaseConfig } from "@/core/config/DatabaseConfig";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { sanitizeInput } from '@/core/models/cypto/SanitizationFunctions';
import { SnapshotDataType } from '@/core/snapshots/SnapshotContainer';
import { useNotification } from '@/core/state/context/NotificationContext';

const { notify } = useNotification(); 

export async function persistSnapshotDB<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotData: SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  config: DatabaseConfig,
  snapshotId: string,
  operationType: "insert" | "upsert" = "upsert"
): Promise<void> {
  const dbClient = new DatabaseClient(config);
  const sanitizedData = sanitizeInput(snapshotData);

  try {
    await dbClient.connect();
    
    if (operationType === "upsert") {
      await dbClient.upsertData("snapshots", sanitizedData);
    } else {
      await dbClient.insertData("snapshots", sanitizedData);
    }

    // Success notification using object format
    notify({
      id: `snapshot_save_success_${snapshotId}_${Date.now()}`,
      message: "Snapshot saved successfully",
      data: {
        entityType: 'snapshot',
        entityId: snapshotId,
        action: operationType,
        snapshotInfo: {
          id: snapshotId,
          operationType: operationType,
          dataType: typeof snapshotData,
          hasMetadata: !!snapshotData.metadata,
          hasAttachments: !!(snapshotData.attachments && snapshotData.attachments.length > 0)
        },
        config: {
          databaseType: config.type,
          host: config.host,
          // Don't include sensitive info like passwords
        },
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const,
      metadata: {
        operation: 'snapshot_persist',
        databaseOperation: operationType,
        isGeneric: true,
        genericTypes: {
          T: 'BaseDataEntity',
          K: 'T',
          Meta: 'DefaultMeta',
          AttachmentType: 'Attachment'
        }
      }
    });
    
  } catch (error: unknown) {
    // Enhanced error handling with better error message
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = determineDatabaseErrorType(error);
    
    if (error instanceof Error) {
      handleApiError(error, "persistSnapshotDB");
    } else {
      handleApiError(new Error(String(error)), "persistSnapshotDB");
    }

    // Error notification using object format
    notify({
      id: `snapshot_save_error_${snapshotId}_${Date.now()}`,
      message: "Error saving snapshot",
      data: {
        entityType: 'snapshot',
        entityId: snapshotId,
        action: operationType,
        snapshotInfo: {
          id: snapshotId,
          operationType: operationType
        },
        errorDetails: {
          originalError: errorMessage,
          errorType: errorType,
          operation: 'persistSnapshotDB',
          stack: error instanceof Error ? error.stack : undefined
        },
        config: {
          databaseType: config.type,
          host: config.host
        },
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const,
      metadata: {
        operation: 'snapshot_persist',
        databaseOperation: operationType,
        isCritical: errorType === 'CONNECTION_ERROR' || errorType === 'TIMEOUT_ERROR',
        retryable: isRetryableDatabaseError(errorType)
      },
      action: errorType === 'CONNECTION_ERROR' ? {
        label: "Retry Connection",
        onClick: () => persistSnapshotDB(snapshotData, config, snapshotId, operationType)
      } : undefined
    });
    
    throw error;
  } finally {
    try {
      await dbClient.close();
    } catch (closeError) {
      // Log but don't throw - we don't want to mask the original error
      console.error("Error closing database connection:", closeError);
    }
  }
}

// Helper functions for better error handling
const determineDatabaseErrorType = (error: unknown): string => {
  const errorStr = String(error).toLowerCase();
  
  if (errorStr.includes('connection') || errorStr.includes('connect')) {
    return 'CONNECTION_ERROR';
  } else if (errorStr.includes('timeout') || errorStr.includes('timed out')) {
    return 'TIMEOUT_ERROR';
  } else if (errorStr.includes('duplicate') || errorStr.includes('unique constraint')) {
    return 'DUPLICATE_ERROR';
  } else if (errorStr.includes('permission') || errorStr.includes('access denied')) {
    return 'PERMISSION_ERROR';
  } else if (errorStr.includes('syntax') || errorStr.includes('query')) {
    return 'QUERY_ERROR';
  } else if (errorStr.includes('full') || errorStr.includes('space')) {
    return 'STORAGE_ERROR';
  }
  
  return 'DATABASE_ERROR';
};

const isRetryableDatabaseError = (errorType: string): boolean => {
  const retryableErrors = ['CONNECTION_ERROR', 'TIMEOUT_ERROR', 'TEMPORARY_ERROR'];
  return retryableErrors.includes(errorType);
};