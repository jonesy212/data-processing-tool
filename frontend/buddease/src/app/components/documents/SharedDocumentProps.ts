// SharedDocumentProps.ts
import { DocumentOptions } from "./DocumentOptions";

export interface DocumentBuilderProps {
  isDynamic: boolean;
  options: DocumentOptions;
  onOptionsChange: (newOptions: DocumentOptions) => void;
}

export interface DocumentAnimationOptions {
  type: 'slide' | 'fade' | 'custom'; // Add more animation types as needed
  duration?: number;
  speed?: number;
  // Add more animation-related properties
}
