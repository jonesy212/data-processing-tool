import { DataVersions } from "@/app/configs/DataVersionsConfig";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { UserSettings } from "@/app/configs/UserSettings";
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure from "@/app/configs/appStructure/FrontendStructure";
import docx from "docx";
import { IHydrateResult } from "mobx-persist";
import { BorderStyle, DocumentSize, ProjectPhaseTypeEnum } from "../models/data/StatusType";
import { AlignmentOptions } from "../state/redux/slices/toolbarSlice";
import { AllTypes } from "../typings/PropTypes";
import Version from "../versions/Version";
import { DocumentData } from "./DocumentBuilder";
import { DocumentTypeEnum } from "./DocumentGenerator";
import { NoteOptions } from "./NoteData";
import { DocumentAnimationOptions } from "./SharedDocumentProps";

export interface CustomDocument extends docx.Document {
  createSection(): docx.SectionProperties;
  addParagraph(paragraph: docx.Paragraph): void;
}

interface Style {
  name: string;
  style: {
    [key: string]: string;
  };
}

// Define the interface for DocumentBuilderOptions extending DocumentOptions
export interface DocumentBuilderOptions extends DocumentOptions {
  canComment: boolean;
  canView: boolean;
  canEdit: boolean;
}

// Define a function to create default DocumentBuilderOptions
export const getDefaultDocumentBuilderOptions = (): DocumentBuilderOptions => {
  // Get the default DocumentOptions
  const defaultOptions = getDefaultDocumentOptions();

  // Return the extended DocumentBuilderOptions with default values
  return {
    ...defaultOptions,
    canComment: true,
    canView: true,
    canEdit: true,
  };
};

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
  documentType: DocumentTypeEnum; // Add documentType property
  userIdea: string;
  documentSize: DocumentSize;
  limit: number;
  additionalOptions: readonly string[] | string | number | any[] | undefined;
  documentPhase: string | {
    name: string;
    originalPath: string;
    alternatePaths: string[];
    fileType: string; title: "";
    description: "";
    keywords: [];
    authors: [];
    contributors: [];
    publisher: "";
    copyright: "";
    license: "";
    links: [];
    tags: [];
  };
  version: Version; // Update type to Version
  isDynamic: boolean | undefined;
  size: DocumentSize;
  animations: DocumentAnimationOptions; // New property for animations
  layout: BackendStructure | FrontendStructure; // New property for layout
  panels: { [key: string]: any } | undefined; // Allow custom panels
  pageNumbers:
    | boolean
    | {
        enabled: boolean;
        format: string; // Allow custom page number format
      };
  footer: string;
  watermark:  {
    enabled: false,
    text: string,
    color: string,
    opacity: number,
    size: string,
    x: number,
    y: number,
    rotation: 0,
    borderStyle: string
  };


  headerFooterOptions: {

    header?: string;
    footer?: string;
    showHeader: boolean,
    showFooter: boolean,
    dateFormat?: string;

    differentFirstPage: boolean;
    differentOddEven: boolean;
    headerOptions: {
      height: {
        type: string;
        value: number;
        
      }
      fontSize: number;
      fontFamily: string;
      fontColor: string;
      alignment: string,
      font: string,
      bold: boolean,
      italic: boolean,
      underline: boolean,
      strikeThrough: boolean
      margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
    };
    footerOptions: {


      alignment: string,
      font: string,
      fontSize: number,
      fontFamily: string;
      fontColor: string;
      bold: boolean,
      italic: boolean,
      underline: boolean,
      strikeThrough: boolean
      height: {
        type: string;
        value: number
      }
      margin: {
        top: number;
        right: number;
        bottom: number;
        left: number;
      };
    };
  };
  zoom: number | {
    enabled: boolean;
    value: number
    levels: [
      {
        name: "100%",
        value: 1
      },
      {
        name: "125%",
        value: 1.25
      },
      {
        name: "150%",
        value: 3
      }
    ]
  };
  showRuler: boolean;
  showDocumentOutline: boolean;
  showComments: boolean;
  showRevisions: boolean;
  spellCheck: boolean;
  grammarCheck: boolean;
  margin?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  visibility: AllTypes;
  fontSize: number;
  font: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  lineSpacing: number;
  alignment: AlignmentOptions
  indentSize: number;
  bulletList:
    | boolean
    | {
        symbol: string;
        style: string;
      };
  numberedList:
    | boolean
    | {
        style: string;
        format: string;
      };
  headingLevel:
    | number
    | {
        enabled: boolean;
      };
  toc:
    | boolean
    | {
        enabled: boolean;
        format: string; // Add default format for TOC
      };
  bold:
    | boolean
    | {
        enabled: boolean;
      };
  italic:
    | boolean
    | {
        enabled: boolean;
      };
  underline:
    | boolean
    | {
        enabled: boolean;
      };
  strikethrough:
    | boolean
    | {
        enabled: boolean;
      };
  subscript:
    | boolean
    | {
        enabled: boolean;
      };
  superscript:
    | boolean
    | {
        enabled: boolean;
      };
  hyperlink:
    | string
    | {
        enabled: boolean;
      };
  textStyles: { [key: string]: docx.Style };
  image:
    | string
    | {
        enabled: boolean;
      };
  links:
    | boolean
    | {
        enabled: true;
      };
  embeddedContent:
    | boolean
    | {
        enabled: true;
      };
  bookmarks:
    | boolean
    | {
        enabled: true;
      };
  crossReferences:
    | boolean
    | {
        enabled: true;
      };
  footnotes:
    | boolean
    | {
        enabled: true;
      };
  endnotes:
    | boolean
    | {
        enabled: true;
      };
  comments:
    | boolean
    | {
        enabled: true;
      };
  revisions:
    | boolean
    | {
        enabled: true;
      };
  embeddedMedia:
    | boolean
    | {
        enabled: true;
  };
  
  embeddedCode:
    | boolean
    | {
        enabled: true;
        language: string;
      };
  styles: { [key: string]: Style };
  tableCells: {
    enabled: boolean;
    padding: number;
    fontSize: number,
    alignment: "left"
    borders: {
      top: BorderStyle;
      bottom: BorderStyle;
      left: BorderStyle;
      right: BorderStyle;
    };
  };

  table:
    | boolean
    | {
        enabled: boolean;
      };
  tableRows: number | [];
  tableColumns: number | []
  codeBlock: boolean | [] | { enabled: boolean };
  tableStyles: { [key: string]: docx.Style } | [];
  blockquote:
    | boolean
    | {
        enabled: true;
      };
  codeInline:
    | boolean
    | {
        enabled: true;
      };
  quote:
    | string
    | {
        enabled: true;
      };
  todoList: boolean | { enabled: boolean };
  orderedTodoList: boolean | { enabled: boolean };
  unorderedTodoList: boolean | { enabled: boolean };
  content?: string;
  css?: string;
  html?: string;
  colorCoding: boolean | { enabled: boolean };
  highlight:
    | boolean
    | {
        enabled: boolean;
        colors: {
          [key: string]: string;
        };
      };
  highlightColor: string;
  customSettings: Record<string, any>;
  documents: DocumentData[];
  includeType: "all" | "selected" | "none";
  footnote:
    | boolean
    | {
        enabled: boolean;
  };
  
  defaultZoomLevel: number;
  customProperties: Record<string, any> | undefined; // Allow defining custom properties
  value: any; // Allow setting a value
  includeTitle: boolean | { enabled: boolean }; // New property to include title in the report
  includeContent: boolean | { enabled: boolean }; // New property to include content in the report
  includeStatus: boolean | { enabled: boolean }; // New property to include status in the report
  includeAdditionalInfo: boolean | { enabled: boolean }; // Example: include additional information

  // Properties specific to DocumentGenerator
  title?: string;
  enableStemming?: boolean;
  enableStopWords?: boolean;
  enableWildcards?: boolean;
  userSettings: UserSettings;
  enableFuzzy?: boolean;
  dataVersions: DataVersions;
  backendStructure?: BackendStructure;
  frontendStructure?: FrontendStructure;
  metadata: StructuredMetadata | undefined;
}

// export type DocumentSize = "letter" | "legal" | "a4" | "custom"; // You can extend this list

export const getDefaultDocumentOptions = (): DocumentOptions => {
  return {
    documentSize: DocumentSize.Letter,
    uniqueIdentifier: "",
    documentType: DocumentTypeEnum.Default,
    documentPhase: "Draft",
    limit: 0,
    version: Version.create({
      id: 0,
      name: "",
      content: "",
      appVersion: "1.0",
      limit: 10,
      versionNumber: "1.0",
      data: [],
      url: "",
      checksum: "",
      versionHistory: {
        versions: []
      },
      draft: false,
      description: "",
      userId: "",
      documentId: "",
      parentId: "",
      parentType: "",
      parentVersion: "",
      parentTitle: "",
      parentContent: "",
      parentName: "",
      parentUrl: "",
      parentChecksum: "",
      parentMetadata: {},
      parentAppVersion: "",
      parentVersionNumber: "",
      isLatest: false,
      isPublished: false,
      publishedAt: null,
      source: "",
      status: "",
      workspaceId: "",
      workspaceName: "",
      workspaceType: "",
      workspaceUrl: "",
      workspaceViewers: [],
      workspaceAdmins: [],
      workspaceMembers: [],
      createdAt: new Date,
      updatedAt: new Date
    }),
    userIdea: "",
    fontSize: 14,
    textColor: "#000000",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
    font: "normal",
    lineSpacing: 1.5,
    alignment: AlignmentOptions.LEFT,
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
    dataVersions: {
      backend: {} as IHydrateResult<number> | Promise<string>,
      frontend: {} as IHydrateResult<number> | Promise<string>,
    },
    tableStyles: [],
    metadata: {} as StructuredMetadata,
    layout: {} as BackendStructure | FrontendStructure,
    panels: [],
    pageNumbers: true,
    footer: "footer",
    value: 1,
    watermark: {
      enabled: false,
      text: "Confidential",
      color: "#4527A0",
      opacity: 0.2,
      size: "medium",
      x: 0.5,
      y: 0.5,
      rotation: 0,
      borderStyle: "none",
    },
    headerFooterOptions: {
      showHeader: true,
      showFooter: true,
      differentFirstPage: false,
      differentOddEven: false,
      headerOptions: {
        height: {
          type: "string",
          value: 0.5,
        },
        underline: false,
        strikeThrough: false,
        alignment: "center",
        font: "bold",
        bold: true,
        italic: true,
        fontSize: 12,
        fontFamily: "Arial",
        fontColor: "#000000",
        margin: {
          top: 0.2,
          right: 0.2,
          bottom: 0.2,
          left: 0.2,
        },
      },
      footerOptions: {
        underline: false,
        strikeThrough: false,
        height: {
          type: "string;",
          value: 0.5
        },
        alignment: "center",
        font: "normal",
        bold: false,
        italic: false,
        fontSize: 12,
        fontFamily: "Arial",
        fontColor: "#000000",
        margin: {
          top: 0.2,
          right: 0.2,
          bottom: 0.2,
          left: 0.2,
        },
      },
    },
    zoom: 0 || {
      value: 1,
      enabled: true,
      levels: [
        {
          name: "100%",
          value: 1
        },
        {
          name: "125%",
          value: 1.25
        },
        {
          name: "150%",
          value: 3
        }
      ]
    },
    showRuler: true,
    showDocumentOutline: true,
    showComments: true,
    showRevisions: true,
    spellCheck: true,
    grammarCheck: true,
    toc: false,
    textStyles: {},
    links: false || { enabled: true },
    embeddedContent: false || { enabled: true },
    bookmarks: false || { enabled: true },
    crossReferences: false || { enabled: true },
    footnotes: false || { enabled: true },
    endnotes: false || { enabled: true },
    comments: false || { enabled: true },
    revisions: false || { enabled: true },
    embeddedMedia: false || { enabled: true },
    embeddedCode: false || {
      enabled: true,
      language: "js",
    },
    styles: {},
    tableCells: {
      enabled: true,
      borders: {
        top: {} as BorderStyle,
        bottom: {} as BorderStyle,
        left: {} as BorderStyle,
        right: {} as BorderStyle,
      },
      padding: 10,
      fontSize: 12,
      alignment: "left"
    },
    highlight: {
      enabled: false,
      colors: {},
    },
    highlightColor: "",
    footnote: false || { enabled: false },
    customProperties: {},
    defaultZoomLevel: 1,
  };
};

// Extend DocumentOptions to include additional properties
export interface ExtendedDocumentOptions extends DocumentOptions {
  // Add any additional properties needed for robustness
  additionalOption2: string;
}

export const getDocumentPhase = (phase: ProjectPhaseTypeEnum) => {
  switch(phase) {
    case ProjectPhaseTypeEnum.Draft:
      return "Draft";
    case ProjectPhaseTypeEnum.Review:
      return "Review";
    case ProjectPhaseTypeEnum.Final:
      return "Final";
    case ProjectPhaseTypeEnum.ProductBrainstorming:
      return "Product Brainstorming";
    case ProjectPhaseTypeEnum.Launch:
      return "Launch";
    case ProjectPhaseTypeEnum.DataAnalysis:
      return "Data Analysis";
    case ProjectPhaseTypeEnum.TeamFormation:
      return "Team Formation";
    case ProjectPhaseTypeEnum.Ideation:
      return "Ideation";
    default:
      return "Draft";
  }
};
