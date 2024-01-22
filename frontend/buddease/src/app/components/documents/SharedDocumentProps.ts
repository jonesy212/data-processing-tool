// SharedDocumentProps.ts
import { DocumentOptions } from "./DocumentOptions";



// SharedDocumentProps.ts

export interface DocumentBuilderProps {
  isDynamic: boolean;
  options: DocumentOptions;
  documentPhase: string; // Add document phase property
  version: string; // Add version property
  onOptionsChange: (newOptions: DocumentOptions) => void;
}

export interface DocumentAnimationOptions {
  type: 'slide' | 'fade' | 'show' |  'custom'; // Add more animation types as needed
  duration?: number;
  speed?: number;
  // Add more animation-related properties
}
