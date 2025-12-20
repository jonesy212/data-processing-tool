// HighlightEvent.ts

import CommonEvent from "@/app/state/stores/CommonEvent";
import { DocumentData } from '@/app/documents/editing/DocumentBuilder';

interface HighlightEvent extends CommonEvent {
    id: string;
    highlightedText: string;
    documentId: DocumentData;
    userId: number;
    userIds: number[];
    taskId: number;
  }
  
  export default HighlightEvent;
  