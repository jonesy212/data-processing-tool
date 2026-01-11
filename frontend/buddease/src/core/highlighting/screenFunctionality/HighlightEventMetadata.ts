// HighlightEventMetadata.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { StructuredMetadata } from "@/core/config/StructuredMetadata";
import type { Attachment } from "@/core/documents/attachment/Attachment";

interface HighlightEventMetadata<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  structureMetadata: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  highlightId: string;
  documentVersion: string;
  selectionContext: {
    startOffset: number;
    endOffset: number;
    xPath: string;
    surroundingText: string;
  };
  annotationData?: {
    tags: string[];
    notes: string;
    color: string;
    priority: 'low' | 'medium' | 'high';
  };
  // Add more properties as needed
}


export default HighlightEventMetadata;
