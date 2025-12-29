// SnapshotErrorHandling.tsx
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useErrorHandling } from '@/core/hooks/useErrorHandling';
import { Payload } from '@/core/interfaces/payload/payloadTypes';
import { createErrorNotificationContent, errorLogger } from '@/core/logging/Logger';
import { useNotification } from '@/core/state/context/NotificationContext';
import { YourResponseType } from '@/core/typings/responseTypes';
import React, { useState } from 'react';



interface SnapshotErrorHandling<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  onError?: (error: Payload) => void;
  clearSnapshotFailure(): unknown;
  logError: (error: Error, extraInfo?: any) => void;
  addSnapshotFailure?: (date: Date, error: Error) => void;
  handleSnapshotError: (error: Error) => void;
  resetErrorState: () => void;
}


const {notify} = useNotification()

const SnapshotHandler: React.FC<{ 
    onError?: (error: Payload) => void; 
}> = ({ onError }) => {
    const { error, handleError, clearError, parseDataWithErrorHandling } = useErrorHandling();
    const [errorState, setErrorState] = useState<string | null>(null);

    const clearSnapshotFailure = () => {
        // Logic to clear snapshot failures
        console.log("Clearing snapshot failure...");
    };

    const logError = (error: Error, extraInfo?: any) => {
        const errorDetails = createErrorNotificationContent(error);

        // Log the error using the errorLogger
        errorLogger.error(error.message, {
            ...errorDetails,
            extraInfo
        });

        // Optionally call onError callback if defined
        if (onError) {
            onError({ error: error.message, meta: errorDetails });
        }

        // Use the handleError from useErrorHandling to log the error
        handleError(error.message);
    };

    const addSnapshotFailure = (date: Date, error: Error) => {
        // Logic to handle snapshot failures
        console.log(`Snapshot failure on ${date.toISOString()}:`, error.message);
        
        // Log more detailed information if needed
        console.error("Detailed error stack:", error.stack);

        // Store the failure info
        storeSnapshotFailure({ date, error });
    };

    const handleSnapshotError = (error: Error) => {
    setErrorState(error.message); // Store the error message
    console.error("Handling snapshot error:", error);

    // Log the error
    logError(error);

    // Enhanced error notification using object format
    notify({
        id: `snapshot_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: "Snapshot operation failed",
        data: {
        entityType: 'snapshot',
        action: 'error_handling',
        errorDetails: {
            originalError: error.message,
            errorName: error.name,
            stack: error.stack,
            errorType: getSnapshotErrorType(error)
        },
        timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const,
        metadata: {
        operation: 'snapshot_error_handling',
        severity: getErrorSeverity(error),
        requiresManualReview: isCriticalSnapshotError(error),
        retryable: isRetryableSnapshotError(error)
        },
        action: isRetryableSnapshotError(error) ? {
        label: "Retry Operation",
        onClick: () => {
            console.log("Retrying snapshot operation...");
            // Implement retry logic here
            // retrySnapshotOperation();
        }
        } : undefined
    });
    };

    const resetErrorState = () => {
        clearError(); // Clear the error using the hook
        setErrorState(null); // Reset local error state
        console.log("Error state has been reset.");
    };

    const storeSnapshotFailure = (failureInfo: { date: Date; error: Error }) => {
        // Logic to store snapshot failure information
        console.log("Storing snapshot failure:", failureInfo);
    };

    // Example of how to parse data with error handling
    const parseSnapshotData = (data: YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], threshold: number) => {
        return parseDataWithErrorHandling(data, threshold);
    };

    return (
        <div>
            <h3>Snapshot Error Handler</h3>
            {errorState && <div className="error-message">{errorState}</div>}
            <button onClick={resetErrorState}>Reset Error State</button>
            <button onClick={clearSnapshotFailure}>Clear Snapshot Failure</button>
            {/* More UI elements as needed */}
        </div>
    );
};

export default SnapshotHandler;

export type { SnapshotErrorHandling };
