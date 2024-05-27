import useErrorHandling from "../hooks/useErrorHandling";
import { sanitizeComments } from "../security/SanitizationFunctions";
import { ParsedData, parseData } from "./parseData";
import { Data } from "../models/data/Data"; // Import the Data type

// Define a specific type that extends T to include the comment property
interface DataWithComment extends Data {
  comment: string;
}

const safeParseData = <T extends DataWithComment>(
  data: T[],
  threshold: number
): ParsedData<T>[] => {
  const { handleError } = useErrorHandling();

  try {
    const sanitizedData = data.map((item) => ({
      ...item,
      // Sanitize comments before parsing data
      comment: sanitizeComments(item.comment),
    })) 

    return parseData<T>(sanitizedData, threshold);
  } catch (error: any) {
    const errorMessage = "Error parsing data";
    handleError(errorMessage, { componentStack: error.stack });
    return [];
  }
};

export default safeParseData;
export type {DataWithComment}