// SafeParseData.ts
import { BaseData } from '@/app/models/data/Data';
import useErrorHandling from "@/app/hooks/useErrorHandling";
import { sanitizeComments } from "@/app/components/crypto/SanitizationFunctions";
import { ParsedData, parseData } from "./parseData";

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