// SafeParseData.ts
import type { ParsedData } from '@/core/dataIntegration/parseData';
import { parseData } from '@/core/dataIntegration/parseData';
import { useErrorHandling } from "@/core/hooks/useErrorHandling";
import { sanitizeComments } from '@/core/models/cypto/SanitizationFunctions';
import type { BaseData } from '@/core/models/data/Data';

// Define a specific type that extends T to include the comment property
interface DataWithComment<T extends BaseData<any>> {
  comment: string;
}

const safeParseData = <T extends DataWithComment<BaseData<any>>>(
  data: T[],
  threshold: number
): ParsedData<T>[] => {
  const { handleError } = useErrorHandling();

  try {
    const sanitizedData = data.map((item) => ({
      ...item,
      comment: sanitizeComments(String(item.comment ?? ''))
    }));

    return parseData<T>(sanitizedData, threshold);
  } catch (error) {
    handleError("Error parsing data", { 
      error,
      originalData: data 
    });
    return [];
  }
};

export default safeParseData;
export type { DataWithComment };
