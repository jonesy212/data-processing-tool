// useSecurityAudit.ts
import { useSecureUserId as fetchSecureUserId } from './useSecureUserId';

export const useSecurityAudit = () => {
    // Reuse the secure user ID logic from useSecureUserId.ts
    const { userId, error } = fetchSecureUserId();

    const sanitizeMetadata = <T>(metadata: Partial<T>): Partial<T> => {
        return Object.keys(metadata).reduce<Partial<T>>((sanitized, key) => {
            const field = metadata[key as keyof T];

            if (field && typeof field === "object" && "isSensitive" in field) {
                // Type assertion to ensure TypeScript recognizes `field` as an object with `isSensitive`
                const sensitiveField = field as { isSensitive: boolean };

                // Redact the field if sensitive, otherwise keep it unchanged
                sanitized[key as keyof T] = sensitiveField.isSensitive
                    ? "REDACTED" as unknown as T[keyof T] // Explicit cast to ensure type compatibility
                    : field as T[keyof T]; // Ensure `field` is of type `T[keyof T]`
            } else {
                sanitized[key as keyof T] = field as T[keyof T];
            }

            return sanitized;
        }, {});
    };
    return { sanitizeMetadata, userId, error }
}
