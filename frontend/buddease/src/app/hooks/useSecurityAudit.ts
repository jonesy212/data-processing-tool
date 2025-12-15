// useSecurityAudit.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetaDataOptions } from "@/app/config/MetaDataOptions";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { useSecureUserId as fetchSecureUserId } from '@/app/hooks/useSecureUserId';

// Type guard for sensitive fields
const isSensitiveField = (field: any): field is { isSensitive: boolean; value?: any } => {
    return field && typeof field === "object" && "isSensitive" in field;
};

export const useSecurityAudit = () => {
    const { userId, error } = fetchSecureUserId();

    const sanitizeMetadata = <
      T extends BaseDataEntity,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T
    >(
      metadata: Partial<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
    ): Partial<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
        const sanitized: Partial<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};

        for (const key in metadata) {
            if (metadata.hasOwnProperty(key)) {
                const metadataKey = key as keyof UnifiedMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
                const field = metadata[metadataKey];

                if (isSensitiveField(field)) {
                    // Handle sensitive fields
                    sanitized[metadataKey] = field.isSensitive 
                        ? ("REDACTED" as any) 
                        : (field.value as any);
                } else {
                    // Handle regular fields
                    sanitized[metadataKey] = field as any;
                }
            }
        }

        return sanitized;
    };

    return { sanitizeMetadata, userId, error };
};