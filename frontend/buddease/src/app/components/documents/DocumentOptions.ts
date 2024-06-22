import { DataVersions } from "@/app/configs/DataVersionsConfig";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { UserSettings } from "@/app/configs/UserSettings";
import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import BackendStructure, { backend } from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure, { frontend } from "@/app/configs/appStructure/FrontendStructure";
import docx from "docx";
import { IHydrateResult } from "mobx-persist";
import {
  CodingLanguageEnum,
  LanguageEnum,
} from "../communications/LanguageEnum";
import {
  BorderStyle,
  DocumentSize,
  Layout,
  ProjectPhaseTypeEnum,
} from "../models/data/StatusType";
import { AlignmentOptions } from "../state/redux/slices/toolbarSlice";
import { CustomProperties, HighlightColor } from "../styling/Palette";
import { AllTypes } from "../typings/PropTypes";
import { UserIdea } from "../users/Ideas";
import Version from "../versions/Version";
import { ModifiedDate } from "./DocType";
import { DocumentData, RevisionOptions } from "./DocumentBuilder";
import { DocumentTypeEnum } from "./DocumentGenerator";
import { NoteOptions } from "./NoteData";
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

type LinksType =
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
  userIdea?: string | UserIdea | undefined;
  documentSize: DocumentSize;
  limit: number;
  page: number;
  additionalOptions: readonly string[] | string | number | any[] | undefined;

  language: LanguageEnum;
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
  
  version: Version;
  isDynamic: boolean | undefined;
  size: DocumentSize;
  animations: DocumentAnimationOptions;
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
  revisions: RevisionOptions;
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
  previousMetadata: StructuredMetadata;
  currentMetadata: StructuredMetadata;
  accessHistory: AccessRecord[];
  lastModifiedDate: ModifiedDate;
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
  colorCoding: Record<string, string>; // Object representing color coding system
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
        format: string;
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
    lastModifiedDate: {
      value: undefined,
      isModified: false,
    } as ModifiedDate,
    documentSize: DocumentSize.Letter,
    uniqueIdentifier: "",
    documentType: DocumentTypeEnum.Default,
    language: LanguageEnum.English,
    documentPhase: "Draft",
    color: "#FFFFFF",
    limit: 0,
    page: 1,
    version: Version.create({
      id: 0,
      name: "",
      content: "",
      appVersion: "1.0",
      limit: 10,
      versionNumber: "1.0",
      buildNumber: "1",
      versions: {
        data: {
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
          versionNumber: "",
          documentId: "",
          draft: false,
          userId: "",
          content: "",
          metadata: {
            author: "",
            timestamp: undefined,
            revisionNotes: undefined,
          },
          versions: {
            data: undefined,
            backend: undefined,
            frontend: undefined,
          },
          checksum: "",
        },
        backend: backend,
        frontend: frontend,
      },
      metadata: {
        author: "",
        timestamp: undefined,
      },

      data: [],
      url: "",
      checksum: "",
      versionHistory: {
        versions: [],
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
      createdAt: new Date(),
      updatedAt: new Date(),
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
    colorCoding: {} as Record<string, string>,
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
    tableStyles: {},
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
      fontSize: 0,
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
          type: "string",
          value: 0.5,
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
      enabled: false,
    },
    zoom: 0 || {
      value: 1,
      enabled: true,
      levels: [
        {
          name: "100%",
          value: 1,
        },
        {
          name: "125%",
          value: 1.25,
        },
        {
          name: "150%",
          value: 3,
        },
      ],
    },
    showRuler: true,
    showDocumentOutline: true,
    showComments: true,
    showRevisions: true,
    spellCheck: true,
    grammarCheck: true,
    toc: false,
    textStyles: {},
    links: { enabled: true, color: "#0000FF", underline: false },
    embeddedContent: {
      enabled: true,
      allow: false,
      language: LanguageEnum.English,
    },
    bookmarks: { enabled: true },
    crossReferences: { enabled: true, format: "Page Number" },
    footnotes: { enabled: true, format: "numeric" },
    endnotes: { enabled: true, format: "numeric" },
    comments: {
      enabled: true,
      author: "default-author",
      dateFormat: "DD-MM-YYYY",
    },
    revisions: {
      enabled: true,
      author: "default-author",
      dataFormat: "DD-MM-YYYY",
    },
    embeddedMedia: { enabled: true, allow: false },
    embeddedCode: {
      enabled: true,
      language: CodingLanguageEnum.JavaScript,
      allow: false,
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
      alignment: "left",
    },
    highlight: {
      enabled: false,
      colors: {},
    },
    highlightColor: "",
    footnote: { enabled: false, format: "" },
    customProperties: {},
    defaultZoomLevel: 1,
    previousMetadata: {},
    currentMetadata: {},
    accessHistory: [],
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
export type { Style };
