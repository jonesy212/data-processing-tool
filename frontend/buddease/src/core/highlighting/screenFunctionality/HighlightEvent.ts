// HighlightEvent.ts

import type { DocumentData } from '@/core/documents/editing/DocumentBuilder';
import type { CommonEvent } from "@/core/state/stores/CommonEvent";

export interface HighlightEvent
  extends CommonEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  id: string;
  highlightedText: string;
  documentId: DocumentData;
  userId: number;
  userIds: number[];
  taskId: number;
}
    