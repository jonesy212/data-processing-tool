// HighlightEvent.ts

interface HighlightEvent {
    id: number;
    highlightedText: string;
    documentId: number;
    userId: number;
    metadata: Record<string, any>; // Additional metadata can be stored in a key-value format
  }
  
  export default HighlightEvent;
  