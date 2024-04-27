import { DataVersions } from "@/app/configs/DataVersionsConfig";
import { UserSettings } from "@/app/configs/UserSettings";
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure from "@/app/configs/appStructure/FrontendStructure";
import docx from "docx";
import { DocumentData } from "./DocumentBuilder";
import { NoteOptions } from "./NoteData";
import { DocumentAnimationOptions } from "./SharedDocumentProps";

export interface CustomDocument extends docx.Document {
  createSection(): docx.SectionProperties;
  addParagraph(paragraph: docx.Paragraph): void;
}

export const getDefaultNoteOptions = (): NoteOptions => {
  const defaultOptions = getDefaultDocumentOptions();
  return {
    ...defaultOptions,
    additionalOption2: "", // Add default value for additional option 2
  };
};

// documentOptions.ts
export interface DocumentOptions {
  uniqueIdentifier: string;
  documentType: DocumentData; // Add documentType property
  userIdea: string;
  additionalOptions: readonly string[] | string | number | any[] | undefined;

  isDynamic: boolean;
  size: DocumentSize;
  animations: DocumentAnimationOptions; // New property for animations
  margin?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  visibility: "public" | "private";
  fontSize: number;
  font: string;
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
  enableStemming?: boolean;
  enableStopWords?: boolean;
  enableWildcards?: boolean;
  userSettings: UserSettings;
  enableFuzzy?: boolean;
  dataVersions: DataVersions
  backendStructure?: BackendStructure;
  frontendStructure?: FrontendStructure
}

export type DocumentSize = "letter" | "legal" | "a4" | "custom"; // You can extend this list


export const getDefaultDocumentOptions = (): DocumentOptions => {
  return {
    uniqueIdentifier: "",
    documentType: {} as DocumentData,
    userIdea: "",
    fontSize: 14,
    textColor: "#000000",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
    font: "normal",
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
    margin: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    content: "content",
    css: "css",
    html: "html",
    size: "0" as DocumentSize,
    colorCoding: false,
    additionalOptions: [],
    customSettings: {},
    documents: [] as DocumentData[],
    animations: {} as DocumentAnimationOptions,
    includeType: "all",
    includeTitle: true,
    includeContent: true,
    includeStatus: true,
    includeAdditionalInfo: true,
    title: "",
    userSettings: {} as UserSettings,
    dataVersions: { backend: 0, frontend: 0 },
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
};
