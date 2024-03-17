// SharedDocumentProps.ts
import { DocumentData } from "./DocumentBuilder";
import { DocumentOptions } from "./DocumentOptions";



// SharedDocumentProps.ts

export interface DocumentBuilderProps {
  isDynamic: boolean;
  documentPhase: string; // Add document phase property
  version: string; // Add version property
  onOptionsChange: (newOptions: DocumentOptions) => void;
  setOptions: (newOptions: any) => void; // Define setOptions prop
  documents: DocumentData[]; // Add documents prop to receive document data
  options: DocumentOptions;
  
}

export interface DocumentAnimationOptions {
  type: 'slide' | 'fade' | 'show' |  'custom'; // Add more animation types as needed
  duration?: number;
  speed?: number;
  // Add more animation-related properties
}
