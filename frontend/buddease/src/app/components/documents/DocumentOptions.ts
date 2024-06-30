import { AllTypes } from '@/app/components/typings/PropTypes';
import { DataVersions } from "@/app/configs/DataVersionsConfig";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { UserSettings } from "@/app/configs/UserSettings";
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure from "@/app/configs/appStructure/FrontendStructure";
import docx from "docx";
import { ContentState } from "draft-js";
import {
  CodingLanguageEnum,
  LanguageEnum,
} from "../communications/LanguageEnum";
import {
  BorderStyle,
  DocumentSize,
  Layout,
  PrivacySettingEnum,
  ProjectPhaseTypeEnum,
} from "../models/data/StatusType";
import { Phase } from "../phases/Phase";
import { AlignmentOptions } from "../state/redux/slices/toolbarSlice";
import { CustomProperties, HighlightColor } from "../styling/Palette";
import { UserIdea } from "../users/Ideas";
import Version from "../versions/Version";
import { VersionData } from "../versions/VersionData";
import { ModifiedDate } from "./DocType";
import { DocumentData, RevisionOptions } from "./DocumentBuilder";
import { DocumentTypeEnum } from "./DocumentGenerator";
import { DocumentPhaseTypeEnum } from "./DocumentPhaseType";
import { NoteAnimationOptions, NoteOptions } from "./NoteData";
import { DocumentAnimationOptions } from "./SharedDocumentProps";

export interface CustomDocument extends docx.Document {
  createSection(): docx.SectionProperties;
  addParagraph(paragraph: docx.Paragraph): void;
}

interface AccessRecord {
  userId: string;
  timestamp: string;
  action: string; // e.g., 'viewed', 'edited', 'shared', etc.
}

export type LinksType =
  | "None"
  | boolean
  | {
      enabled: boolean;
      color: string;
      underline: boolean | { enabled: boolean };
      internal?: {
        enabled: boolean;
      };
      external?: {
        enabled: boolean;
      };
    };

interface Style {
  name: string;

  style:
    | {
        [key: string]: string | AllTypes;
      }
    | undefined;

  custom:
    | {
        name: string;
        style: {
          [key: string]: string | AllTypes;
        };
      }
    | undefined;
  tableCells:
    | {
        enabled: boolean;
        padding: number;
        fontSize: number;
        alignment: "left";
        borders: undefined;
      }
    | undefined;

  highlight:
    | {
        enabled: boolean;
        color: string;
      }
    | undefined;
  footnote:
    | {
        enabled: boolean;
        format: string;
      }
    | undefined;
  highlightColor: HighlightColor | undefined;
  defaultZoomLevel: number;
  customProperties: CustomProperties | undefined;
  value: string;
  metadata: StructuredMetadata | undefined;
  tableStyles?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: string;
    borderStyle?: string;
    fontFamily?: string;
    fontSize?: string;
    color?: string;
    border?: string; // Added border property
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

// Function to get default note options
export const getDefaultNoteOptions = (): NoteOptions => {
  const defaultOptions = getDefaultDocumentOptions();
  return {
    ...defaultOptions,
    animations: {
      ...defaultOptions.animations,
      duration: defaultOptions.animations?.duration ?? 0,
    } as NoteAnimationOptions & { duration?: number },
    additionalOption2: "", // Add default value for additional option 2
  };
};

// documentOptions.ts
export interface DocumentOptions {
  uniqueIdentifier: string;
  documentType: string | DocumentTypeEnum; // Add documentType property
  userIdea?: string | UserIdea | undefined;
  documentSize: DocumentSize;
  name?: string,
  description?: string | null | undefined,
  createdBy?: string,
  createdDate?:string |  Date,
  _rev?: string;
  _attachments?: { [key: string]: string }
  _links?: { [key: string]: string;  }
  lastModifiedBy: string;
 
  limit: number;
  page: number;
  levels: {
    enabled: boolean;
    startLevel: number;
    endLevel: number | string | undefined;
    format: string;
    separator: string;
    style: {
      main: string;
      styles: {
        format: string[];
        separator: string[];
        style: {
          format: string[];
          separator: string[];
          style: string[];
        };
      }[];
    };
  };
  additionalOptions: readonly string[] | string | number | any[] | undefined;

  language: LanguageEnum;
  setDocumentPhase?: (
    phase:
      | string
      | Phase
      | undefined,
    phaseType: DocumentPhaseTypeEnum
  ) => {
    phase: string | Phase | undefined;
    phaseType: DocumentPhaseTypeEnum;
  };
  documentPhase:
    | string  
    | {
        name: string;
        originalPath: string;
        alternatePaths: string[];
        fileType: string;
        title: string;
        description: string;
        keywords: string[];
        authors: string[];
        contributors: string[];
        publisher: string;
        copyright: string;
        license: string;
        links: string[];
        tags: string[];
        phaseType: ProjectPhaseTypeEnum;
        customProp1: string;
        customProp2: number;
        onChange: (phase: ProjectPhaseTypeEnum) => void;
      };

  versionData: VersionData | undefined;
  version?: Version | undefined;
  isDynamic: boolean | undefined;
  size: DocumentSize;
  animations: DocumentAnimationOptions | undefined;
  layout: Layout | BackendStructure | FrontendStructure | undefined;
  panels: { [key: string]: any } | undefined;
  pageNumbers:
    | boolean
    | {
        enabled: boolean;
        format: string;
      };
  footer: string;
  watermark: {
    enabled: false;
    text: string;
    color: string;
    opacity: number;
    fontSize: number;
    size: string;
    x: number;
    y: number;
    rotation: 0;
    borderStyle: string;
  };

  headerFooterOptions: {
    enabled: boolean;
    headerContent?: string;
    footerContent?: string;
    showHeader: boolean;
    showFooter: boolean;
    dateFormat?: string;

    differentFirstPage: boolean;
    differentOddEven: boolean;
    headerOptions:
      | {
          height: {
            type: string;
            value: number;
          };
          fontSize: number;
          fontFamily: string;
          fontColor: string;
          alignment: string;
          font: string;
          bold: boolean;
          italic: boolean;
          underline: boolean;
          strikeThrough: boolean;
          margin: {
            top: number;
            right: number;
            bottom: number;
            left: number;
          };
        }
      | undefined;
    footerOptions:
      | {
          alignment: string;
          font: string;
          fontSize: number;
          fontFamily: string;
          fontColor: string;
          bold: boolean;
          italic: boolean;
          underline: boolean;
          strikeThrough: boolean;
          height: {
            type: string;
            value: number;
          };
          margin: {
            top: number;
            right: number;
            bottom: number;
            left: number;
          };
        }
      | undefined;
  };
  zoom:
    | number
    | {
        enabled: boolean;
        value: number;
        levels: [
          {
            name: "100%";
            value: 1;
          },
          {
            name: "125%";
            value: 1.25;
          },
          {
            name: "150%";
            value: 3;
          }
        ];
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
  updatedDocument?: DocumentData;
  fontSize: number;
  font: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  lineSpacing: number;
  alignment: AlignmentOptions;
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
        levels: number;
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
  links: LinksType;
  embeddedContent:
    | boolean
    | {
        enabled: boolean;
        allow: boolean;
        language: LanguageEnum | CodingLanguageEnum;
      };
  bookmarks:
    | boolean
    | {
        enabled: boolean;
        // format: string;
      };
  crossReferences:
    | boolean
    | {
        enabled: boolean;
        format: string;
      };
  footnotes:
    | boolean
    | {
        enabled: boolean;
        format: string;
      };
  endnotes:
    | boolean
    | {
        enabled: boolean;
        format: string;
      };
  comments:
    | boolean
    | {
        enabled: boolean;
        author: string;
        dateFormat: string;
      };
  revisions: RevisionOptions | undefined;
  embeddedMedia:
    | boolean
    | {
        enabled: boolean;
        allow: boolean;
      };

  embeddedCode:
    | boolean
    | {
        enabled: boolean;
        language: CodingLanguageEnum;
        allow: boolean;
      };
  styles: {
    [key: string]: Style;
  };
  previousMetadata: StructuredMetadata | undefined;
  currentMetadata: StructuredMetadata | undefined;
  currentContent: ContentState
  previousContent: ContentState | undefined
  lastModifiedDate: ModifiedDate | undefined;
  accessHistory: AccessRecord[];
  tableCells: {
    enabled: boolean;
    padding: number;
    fontSize: number;
    alignment: "left";
    borders:
      | {
          top: BorderStyle;
          bottom: BorderStyle;
          left: BorderStyle;
          right: BorderStyle;
        }
      | undefined;
  };

  table:
    | boolean
    | {
        enabled: boolean;
      };
  tableRows: number | [];
  tableColumns: number | [];
  codeBlock: boolean | [] | { enabled: boolean };
  tableStyles?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: string;
    borderStyle?: string;
    fontFamily?: string;
    fontSize?: string;
    color?: string;
    border?: string; // Added border property
  };
  blockquote:
    | boolean
    | {
        enabled: boolean;
      };
  codeInline:
    | boolean
    | {
        enabled: boolean;
      };
  quote:
    | string
    | {
        enabled: boolean;
      };
  todoList: boolean | { enabled: boolean };
  orderedTodoList: boolean | { enabled: boolean };
  unorderedTodoList: boolean | { enabled: boolean };
  content?: string;
  css?: string;
  html?: string;
  color: string;
  colorCoding: Record<string, string> | undefined; // Object representing color coding system
  highlight:
    | boolean
    | {
        enabled: boolean;
        colors: {
          [key: string]: string;
        };
      };
  highlightColor: string;
  customSettings: Record<string, any> | undefined;
  documents: DocumentData[];
  includeType: "all" | "selected" | "none";
  footnote:
    | boolean
    | {
        enabled: boolean;
        format: string;
      };

  defaultZoomLevel: number;
  customProperties: Record<string, any> | undefined; // Allow defining custom properties
  value: any; // Allow setting a value
  includeTitle: boolean | { enabled: boolean }; // New property to include title in the report
  includeContent: boolean | { enabled: boolean }; // New property to include content in the report
  includeStatus: boolean | { enabled: boolean }; // New property to include status in the report
  includeAdditionalInfo: boolean | { enabled: boolean }; // Example: include additional information
  metadata: StructuredMetadata | undefined;

  // Properties specific to DocumentGenerator
  title?: string;
  enableStemming?: boolean;
  enableStopWords?: boolean;
  enableWildcards?: boolean;
  userSettings: UserSettings | undefined;
  enableFuzzy?: boolean;
  dataVersions: DataVersions | undefined;
  backendStructure?: BackendStructure;
  frontendStructure?: FrontendStructure;
  revisionOptions?: RevisionOptions;
}

// export type DocumentSize = "letter" | "legal" | "a4" | "custom"; // You can extend this list
export const getDefaultDocumentOptions = (): DocumentOptions => {
  return {
    uniqueIdentifier: "",
    documentType: "default",
    userIdea: undefined,
    documentSize: DocumentSize.Letter,
    name: "Document",
    description: "Default Document",
    createdBy: "Buddease",
    createdDate: new Date().toISOString(),
    lastModifiedBy: "Buddease",
    _rev: "1-1234567890",
    _attachments: {},
    _links: {},
    limit: 0,
    page: 1,
    levels: {
      enabled: true,
      startLevel: 2,
      endLevel: 4,
      format: "PDF",
      separator: ",",
      style: {
        main: "bold",
        styles: [
          {
            format: ["bold", "italic"],
            separator: [",", ";"],
            style: {
              format: ["underline", "strikethrough"],
              separator: [",", ";"],
              style: ["underline", "strikethrough"]
            },
          },
        ],
      },
    },
    accessHistory: [],
    versionData: {
      id: 0,
      parentId: "0",
      parentType: "",
      parentVersion: "",
      parentTitle: "",
      parentContent: "",
      parentName: "",
      parentUrl: "",
      parentChecksum: "",
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
      data: [],
      name: "",
      url: "",
      versionNumber: "1.0.0",
      documentId: "",
      draft: false,
      userId: "",
      content: "",
      metadata: {
        author: "",
        timestamp: new Date().toISOString(),
        revisionNotes: undefined,
      },
      versions: {
        data: undefined,
        backend: undefined,
        frontend: undefined,
      },
      checksum: "",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      user: "Buddease",
      comments: [],
    },
    lastModifiedDate: {
      value: undefined,
      isModified: false,
    } as ModifiedDate,
    isDynamic: true,
    currentMetadata: undefined,
    previousMetadata: undefined,
    currentContent: ContentState.createFromText(""),
    previousContent: undefined,
    documentPhase: "Draft",
    additionalOptions: undefined,
    language: LanguageEnum.English,
    setDocumentPhase: (phase, phaseType) => ({ phase, phaseType }),
    version: undefined,
    size: "0" as DocumentSize,
    animations: undefined,
    layout: undefined,
    panels: [],

    // Add missing properties
    pageNumbers: false,
    footer: "",
    watermark: {
      enabled: false,
      text: "",
      color: "",
      opacity: 0,
      fontSize: 12,
      size: "medium",
      x: 0,
      y: 0,
      rotation: 0,
      borderStyle: "solid",
    },
    headerFooterOptions: {
      enabled: false,
      headerContent: "",
      footerContent: "",
      showHeader: false,
      showFooter: false,
      dateFormat: "MM/DD/YYYY",
      differentFirstPage: false,
      differentOddEven: false,
      headerOptions: undefined,
      footerOptions: undefined,
    },
    zoom: 100,
    showRuler: false,
    showDocumentOutline: false,
    showComments: false,
    showRevisions: false,
    spellCheck: false,
    grammarCheck: false,
    margin: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    visibility: PrivacySettingEnum.Private,
    updatedDocument: undefined,
    fontSize: 12,
    font: "Arial",
    textColor: "#000000",
    backgroundColor: "#ffffff",
    fontFamily: "Arial",
    lineSpacing: 1.15,
    alignment: AlignmentOptions.LEFT,
    indentSize: 0,
    bulletList: false,
    numberedList: false,
    headingLevel: 1,
    toc: false,
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    subscript: false,
    superscript: false,
    hyperlink: "",
    textStyles: {},
    image: "",
    links: "None",
    embeddedContent: false,
    bookmarks: false,
    crossReferences: false,
    footnotes: false,
    endnotes: false,
    comments: false,
    revisions: undefined,
    embeddedMedia: false,
    embeddedCode: false,
    styles: {},
    tableCells: {
      enabled: false,
      padding: 5,
      fontSize: 12,
      alignment: "left",
      borders: undefined,
    },
    table: false,
    tableRows: 0,
    tableColumns: 0,
    codeBlock: false,
    tableStyles: undefined,
    blockquote: false,
    codeInline: false,
    quote: "",
    todoList: false,
    orderedTodoList: false,
    unorderedTodoList: false,
    content: "",
    css: "",
    html: "",
    color: "#000000",
    colorCoding: undefined,
    highlight: false,
    highlightColor: "#FFFF00",
    customSettings: undefined,
    documents: [],
    includeType: "all",
    footnote: false,
    defaultZoomLevel: 100,
    customProperties: undefined,
    value: undefined,
    includeTitle: false,
    includeContent: false,
    includeStatus: false,
    includeAdditionalInfo: false,
    metadata: undefined,
    title: undefined,
    enableStemming: false,
    enableStopWords: false,
    enableWildcards: false,
    userSettings: undefined,
    enableFuzzy: false,
    dataVersions: undefined,
    backendStructure: undefined,
    frontendStructure: undefined,
    revisionOptions: undefined,
  };
};
// Extend DocumentOptions to include additional properties
export interface ExtendedDocumentOptions extends DocumentOptions {
  // Add any additional properties needed for robustness
  additionalOption2: string;
}

export const getDocumentPhase = (phase: ProjectPhaseTypeEnum) => {
  switch (phase) {
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
export type { AccessRecord, Style };

