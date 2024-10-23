import { sanitizeData } from "../security/SanitizationFunctions";
import { Subscriber } from "../users/Subscriber";

// getSecureSubscriberId.ts
export const getSecureSubscriberId =  <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  subscriber: Subscriber<T, Meta, K>
): string | undefined => {
  // Perform additional checks or sanitization if necessary
  if (!subscriber.id) {
    return undefined;
  }

  // Sanitize subscriber ID if needed
  return sanitizeData(subscriber.id);
}