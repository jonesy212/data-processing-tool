// SharedDocumentProps.ts
import { DocumentOptions } from "./DocumentOptions";

export interface DocumentBuilderProps {
  isDynamic: boolean;
  options: DocumentOptions;
  onOptionsChange: (newOptions: DocumentOptions) => void;
}