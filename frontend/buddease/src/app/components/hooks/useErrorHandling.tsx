import { FileLogger } from "@/app/components/logging/Logger";
import ErrorHandler from "@/app/shared/ErrorHandler";
import { ErrorInfo, useState } from "react";
import safeParseData from "../crypto/SafeParseData";
import { ParsedData } from "../crypto/parseData";
import { YourResponseType } from "../typings/types";

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

  // Function to safely parse data with error handling

  const parseDataWithErrorHandling = (
    data: YourResponseType[],
    threshold: number
  ): ParsedData<YourResponseType>[] => {
    try {
      // Call safeParseData function with YourResponseType as the type argument
      return safeParseData<YourResponseType>(data, threshold);
    } catch (error: any) {
      const errorMessage = "Error parsing data";
      const errorInfo: ErrorInfo = { componentStack: error.stack };
      ErrorHandler.logError(new Error(errorMessage), errorInfo);
      return [];
    }
  };
  return { error, handleError, clearError, parseDataWithErrorHandling };
};

export default useErrorHandling;
