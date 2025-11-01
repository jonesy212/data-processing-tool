import { Attachment } from '@/app/documents/attachment/Attachment';
import useErrorHandling from '@/app/hooks/useErrorHandling';
import { createErrorNotificationContent, errorLogger } from "@/app/libraries/logging/Logger";
import { YourResponseType } from '@/app/typings/responseTypes';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { NotificationTypeEnum, useNotification } from '@/context/NotificationContext';
import { Payload } from '@/app/server/database/Payload';
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

        // Optionally notify users
        notify("Snapshot Error", error.message, {}, new Date(), NotificationTypeEnum.ERROR);
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
    const parseSnapshotData = (data: YourResponseType[], threshold: number) => {
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
