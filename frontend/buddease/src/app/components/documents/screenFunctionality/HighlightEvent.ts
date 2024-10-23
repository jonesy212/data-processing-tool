// HighlightEvent.ts

import CommonEvent from "../../state/stores/CommonEvent";
import { DocumentData } from '../DocumentBuilder';

interface HighlightEvent extends CommonEvent {
    id: string;
    highlightedText: string;
    documentId: DocumentData;
    userId: number;
  }
  
  export default HighlightEvent;
  