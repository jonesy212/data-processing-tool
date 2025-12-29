// HighlightEvent.ts

import { DocumentData } from '@/core/documents/editing/DocumentBuilder';
import CommonEvent from "@/core/state/stores/CommonEvent";

interface HighlightEvent extends CommonEvent {
    id: string;
    highlightedText: string;
    documentId: DocumentData;
    userId: number;
    userIds: number[];
    taskId: number;
  }
  
  export default HighlightEvent;
  