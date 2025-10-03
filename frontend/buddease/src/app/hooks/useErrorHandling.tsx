import safeParseData from "@/app/dataIntegration/SafeParseData";
import { ParsedData } from "@/app/dataIntegration/parseData";
import { FileLogger } from "@/app/libraries/logging/Logger";
import ErrorHandler from "@/app/shared/ErrorHandler";
import { YourResponseType } from "@/app/typings/types";
import { ErrorInfo, useState } from "react";

const useErrorHandling = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
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
    data: YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    threshold: number
  ): ParsedData<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[] => {
    try {
      return safeParseData<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(data, threshold);
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
