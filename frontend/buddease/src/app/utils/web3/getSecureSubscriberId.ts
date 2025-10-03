import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { sanitizeData } from "@/app/security/SanitizationFunctions";
import { Subscriber } from "@/app/users/Subscriber";

// getSecureSubscriberId.ts
export const getSecureSubscriberId = <T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  subscriber: Subscriber<T, K>
): string | undefined => {
  // Perform additional checks or sanitization if necessary
  if (!subscriber.id) {
    return undefined;
  }

  // Sanitize subscriber ID if needed
  return sanitizeData(subscriber.id);
}