// HighlightEventMetadata.ts
import { Attachment } from "@/app/documents/attachment/Attachment";
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { StructuredMetadata } from "@/app/config/StructuredMetadata";

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
