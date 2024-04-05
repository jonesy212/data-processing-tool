// SafeParseData.ts
import useErrorHandling from "../hooks/useErrorHandling";
import { sanitizeComments } from "../security/SanitizationFunctions";
import { YourResponseType } from "../typings/types";
import { ParsedData, parseData } from "./parseData";
 
// Wrap parseData function with error handling
const safeParseData = (data: YourResponseType[], threshold: number): ParsedData[] => {
    const { handleError } = useErrorHandling();

    try {
      const sanitizedData = data.map(item => ({
        ...item,
        // Sanitize comments before parsing data
        comment: sanitizeComments(item.comment)
      }));
      return parseData(sanitizedData, threshold);
    } catch (error: any) {
      const errorMessage = 'Error parsing data';
      handleError(errorMessage, { componentStack: error.stack });
      return [];
    }
};

export default safeParseData;
