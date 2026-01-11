// getSecureSubscriberId.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Subscriber } from '@/core/subscribers/Subscriber';

// For sanitizing strings specifically
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return String(input);
  }
  return input
    .trim()
    .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 255); // Limit length for safety
};

export const getSecureSubscriberId = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
>(
  subscriber: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): string | undefined => {
  if (!subscriber.id) {
    return undefined;
  }

  // Convert to string if it's not already
  const id = typeof subscriber.id === 'string' 
    ? subscriber.id 
    : String(subscriber.id);

  // Use string-specific sanitizer
  return sanitizeString(id);
}