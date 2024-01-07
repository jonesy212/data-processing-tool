// DocumentBuilderConfig.ts
import { DocumentOptions } from "../components/documents/DocumentOptions";
import { DocumentAnimationOptions } from "../components/documents/SharedDocumentProps";

export interface DocumentBuilderConfig {
  isDynamic: boolean;
  defaultOptions: DocumentOptions;
 // Additional options for customization
  fontFamily: string;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  lineSpacing: number;
  // More styling options as needed
  
  // Advanced options
  enableSpellCheck: boolean;
  enableAutoSave: boolean;
  autoSaveInterval: number; // in seconds
  showWordCount: boolean;
  maxWordCount: number;
  // More advanced features
  
  // Integration options
  enableSyncWithExternalCalendars: boolean;
  enableThirdPartyIntegration: boolean;
  thirdPartyAPIKey: string;
  thirdPartyEndpoint: string;
  // More integration options
  
  // Accessibility options
  enableAccessibilityMode: boolean;
  highContrastMode: boolean;
  screenReaderSupport: boolean;
}

export const getDefaultDocumentBuilderConfig = (): DocumentBuilderConfig => {
  return {
    isDynamic: true,
    defaultOptions: {
      size: "letter",
      additionalOptions: "",
      documents: {} as Document[],
      isDynamic: false,
      visibility: "private",
      fontSize: 12,
      textColor: "#000000",
      backgroundColor: "#FFFFFF",
      fontFamily: "Arial",
      lineSpacing: 1.5,
      alignment: "left",
      indentSize: 0,
      bulletList: false,
      numberedList: false,
      headingLevel: 0,
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      subscript: false,
      superscript: false,
      hyperlink: "",
      image: "",
      table: false,
      tableRows: 0,
      tableColumns: 0,
      codeBlock: false,
      blockquote: false,
      codeInline: false,
      quote: "",
      todoList: false,
      orderedTodoList: false,
      unorderedTodoList: false,
      customSettings: {},
      animations: {} as DocumentAnimationOptions,
      documentType: "",
      userIdea: "",
      colorCoding: false
    },
    fontFamily: "Arial",
    fontSize: 12,
    textColor: "#000000",
    backgroundColor: "#FFFFFF",
    lineSpacing: 1.5,
    enableSpellCheck: false,
    enableAutoSave: false,
    autoSaveInterval: 0,
    showWordCount: false,
    maxWordCount: 0,
    thirdPartyAPIKey: "",
    thirdPartyEndpoint: "",
    highContrastMode: false,
    screenReaderSupport: false,
    enableAccessibilityMode: false,
    enableThirdPartyIntegration: false,
    enableSyncWithExternalCalendars: false,
  };
};
