import { FileLogger } from '@/app/pages/logging/Logger';
import ErrorHandler from '@/app/shared/ErrorHandler';
import { ErrorInfo, useState } from 'react';

const useErrorHandling = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = (errorMessage: string, errorInfo?: ErrorInfo) => {
    setError(errorMessage);
    // Log the error using the FileLogger
    FileLogger.logFileError(errorMessage);
    // Log the error using the ErrorHandler class
    if (errorInfo) {
      ErrorHandler.logError(new Error(errorMessage), errorInfo);
    }
    // Optionally, you can log the error or perform other actions here
  };

  const clearError = () => {
    setError(null);
  };

  return { error, handleError, clearError };
};

export default useErrorHandling;
