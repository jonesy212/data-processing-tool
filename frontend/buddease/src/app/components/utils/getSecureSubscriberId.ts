import { BaseData } from "../models/data/Data";
import { sanitizeData } from "../security/SanitizationFunctions";
import { Subscriber } from "../users/Subscriber";

// getSecureSubscriberId.ts
export const getSecureSubscriberId = <T extends BaseData, K extends BaseData>(
  subscriber: Subscriber<T, K>
): string | undefined => {
  // Perform additional checks or sanitization if necessary
  if (!subscriber.id) {
    return undefined;
  }

  // Sanitize subscriber ID if needed
  return sanitizeData(subscriber.id);
}