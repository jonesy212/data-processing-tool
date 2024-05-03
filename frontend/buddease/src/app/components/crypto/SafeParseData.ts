import useErrorHandling from "../hooks/useErrorHandling";
import { sanitizeComments } from "../security/SanitizationFunctions";
import { ParsedData, parseData } from "./parseData";
import { Data } from "../models/data/Data"; // Import the Data type

// Wrap parseData function with error handling
const safeParseData = (
  data: { comment: string }[],
  threshold: number
): ParsedData<Data>[] => {
  const { handleError } = useErrorHandling();

  try {
    const sanitizedData = data.map((item) => ({
      ...item,
      // Sanitize comments before parsing data
      comment: sanitizeComments(item.comment),
    })) 

    // Ensure that the return type of parseData matches ParsedData<T>
    return parseData<Data>(sanitizedData, threshold);
  } catch (error: any) {
    const errorMessage = "Error parsing data";
    handleError(errorMessage, { componentStack: error.stack });
    return [];
  }
};

export default safeParseData;
