// useErrorHandling.tsx

import { BaseDataEntity } from '@/app/config/BaseConfig';
import safeParseData from "@/app/dataIntegration/SafeParseData";
import { ParsedData } from "@/app/dataIntegration/parseData";
import { FileLogger } from "@/app/logging/Logger";
import ErrorHandler from "@/app/shared/ErrorHandler";
import { AppEntity } from "@/app/typings/entities/AppEntity";
import { YourResponseType } from '@/app/typings/responseTypes';
import { ErrorInfo, useState } from "react";

// Most practical solution
// Create a factory function that returns configured hooks
const createErrorHandlingHook = <T extends BaseDataEntity>() => {
  return () => {
    const [error, setError] = useState<string | null>(null);

    const handleError = (errorMessage: string, errorInfo?: ErrorInfo) => {
      setError(errorMessage);
      FileLogger.logFileError(errorMessage);
      if (errorInfo) {
        ErrorHandler.logError(new Error(errorMessage), errorInfo);
      }
    };

    const clearError = () => {
      setError(null);
    };

    const parseDataWithErrorHandling = (
      data: YourResponseType<T>[],
      threshold: number
    ): ParsedData<YourResponseType<T>>[] => {
      try {
        return safeParseData<YourResponseType<T>>(data, threshold);
      } catch (error: any) {
        const errorMessage = "Error parsing data";
        const errorInfo: ErrorInfo = { componentStack: error.stack };
        ErrorHandler.logError(new Error(errorMessage), errorInfo);
        return [];
      }
    };

    return { error, handleError, clearError, parseDataWithErrorHandling };
  };
};

// Usage
export const useErrorHandling = createErrorHandlingHook<AppEntity>();