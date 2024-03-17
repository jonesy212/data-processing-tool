import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { DocumentData } from "./DocumentBuilder";
import { DocumentAnimationOptions } from "./SharedDocumentProps";



// documentOptions.ts
export interface DocumentOptions {
  uniqueIdentifier: string;
  documentType: DocumentData; // Add documentType property
  userIdea: string; 
  additionalOptions: string | number | readonly string[] | undefined;
  isDynamic: boolean;
  size: DocumentSize;
  animations: DocumentAnimationOptions; // New property for animations

  visibility: "public" | "private";
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  lineSpacing: number;
  alignment: "left" | "center" | "right" | "justify";
  indentSize: number;
  bulletList: boolean;
  numberedList: boolean;
  headingLevel: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  subscript: boolean;
  superscript: boolean;
  hyperlink: string;
  image: string;
  table: boolean;
  tableRows: number;
  tableColumns: number;
  codeBlock: boolean;
  blockquote: boolean;
  codeInline: boolean;
  quote: string;
  todoList: boolean;
  orderedTodoList: boolean;
  unorderedTodoList: boolean;
  content?: string; 
  css?: string; 
  html?: string; 
  colorCoding: boolean;
  customSettings: Record<string, any>; 
  documents: DocumentData[]; 
  includeType: "all" | "selected" | "none";
  includeTitle: boolean; // New property to include title in the report
  includeContent: boolean; // New property to include content in the report
  includeStatus: boolean; // New property to include status in the report
  includeAdditionalInfo: boolean; // Example: include additional information

  // Properties specific to DocumentGenerator
  title?: string;
}

export type DocumentSize = "letter" | "legal" | "a4" | "custom"; // You can extend this list

export const getDefaultDocumentOptions = (): DocumentOptions => {
  return {
    uniqueIdentifier: "",
    documentType: {} as DocumentData, // Add documentType property,
    userIdea: "", // Add userIdea property
    fontSize: 14,
    textColor: "#000000",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
    lineSpacing: 1.5,
    alignment: "left",
    indentSize: 20,
    bulletList: true,
    numberedList: true,
    headingLevel: 1,
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    subscript: false,
    superscript: false,
    hyperlink: "",
    image: "",
    table: false,
    tableRows: 3,
    tableColumns: 3,
    codeBlock: false,
    blockquote: false,
    codeInline: false,
    quote: "",
    todoList: false,
    orderedTodoList: false,
    unorderedTodoList: false,
    isDynamic: true,
    visibility: "private",
    content: "content", // Property for document content
    css: "css", // Property for document CSS
    html: "html", // Property for document HTML
    size: "0" as DocumentSize, 
    colorCoding: false,
    additionalOptions: [],
    customSettings: {},
    documents: [] as DocumentData[],
    animations: {} as DocumentAnimationOptions, 
  
    // Default values for properties specific to DocumentGenerator
    includeType: "all",
    includeTitle: true, // New property to include title in the report
    includeContent: true, // New property to include content in the report
    includeStatus: true, // New property to include status in the report
    includeAdditionalInfo: true, // Example: include additional information
  
      // Default values for properties specific to DocumentGenerator
      title: "",
  };
};



// Extend DocumentOptions to include additional properties
export interface ExtendedDocumentOptions extends DocumentOptions {
  // Add any additional properties needed for robustness
  additionalOption2: string;
}



export const getDocumentPhase = (document: DocumentData) => { 
  // Get the document phase from the document data
  return document.documentPhase;

}