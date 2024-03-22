import { FileLogger } from '@/app/pages/logging/Logger';
import ErrorHandler from '@/app/shared/ErrorHandler';
import { useState } from 'react';

const useErrorHandling = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    // Log the error using the FileLogger
    FileLogger.logFileError(errorMessage);
    // Log the error using the ErrorHandler class
    ErrorHandler.logError(new Error(errorMessage), null);
    // Optionally, you can log the error or perform other actions here
  };

  const clearError = () => {
    setError(null);
  };

  return { error, handleError, clearError };
};

export default useErrorHandling;
