import { FileLogger } from "@/app/components/logging/Logger";
import ErrorHandler from "@/app/shared/ErrorHandler";
import { ErrorInfo, useState } from "react";
import safeParseData from "../crypto/SafeParseData";
import { ParsedData } from "../crypto/parseData";
import { YourResponseType } from "../typings/types";
import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";

const useErrorHandling = <
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>() => {
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
    data: YourResponseType<T, K, Meta>[],
    threshold: number
  ): ParsedData<YourResponseType<T, K, Meta>>[] => {
    try {
      return safeParseData<YourResponseType<T, K, Meta>>(data, threshold);
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
