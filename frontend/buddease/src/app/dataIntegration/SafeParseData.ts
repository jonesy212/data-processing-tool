// SafeParseData.ts
import { parseData, ParsedData } from '@/app/dataIntegration/parseData';
import { useErrorHandling } from "@/app/hooks/useErrorHandling";
import { sanitizeComments } from '@/app/models/cypto/SanitizationFunctions';
import { BaseData } from '@/app/models/data/Data';

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
