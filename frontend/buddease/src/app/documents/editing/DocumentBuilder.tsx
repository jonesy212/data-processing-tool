// DocumentBuilder.tsx

import {
  createContentStateFromText,
  fetchContentIdFromAPI
} from "@/app/api/ApiContent";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { createLatestVersion } from "@/app/versions/createLatestVersion";
import { UnifiedMetadata, UnifiedMetaDataOptions } from "@/config/MetaDataOptions";

import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from "@/app/api/endpointConfigurations";
import { LanguageEnum } from "@/app/communications/LanguageEnum";
import { ToolbarOptionsComponent, ToolbarOptionsProps } from "@/app/components/documents/ToolbarOptions";
import { getTextBetweenOffsets } from "@/app/documents/getTextBetweenOffsets";
import { selectedmetadata } from "@/app/components/routing/MetadataComponent";
import SharingOptions from "@/app/components/shared/SharingOptions";
import {
  getFormattedOptions
} from "@/app/documents/DocumentCreationUtils";
import { usePanelContents } from "@/app/generators/usePanelContents";
import useErrorHandling from "@/app/hooks/useErrorHandling";
import ResizablePanels from "@/app/hooks/userInterface/ResizablePanels";
import useResizablePanels from "@/app/hooks/userInterface/useResizablePanels";
import { useMovementAnimations } from "@/app/libraries/animations/movementAnimations/MovementAnimationActions";
import { determineDocumentType } from "@/app/libraries/categories/determineDocumentType";
import { CustomContentState } from "@/app/libraries/ui/CustomContentState";
import { CommonData } from "@/app/models/CommonData";
import { Content } from "@/app/models/content/AddContent";
import { BaseData, Data, TodoSubtasks } from '@/app/models/data/Data';
import FileData from "@/app/models/data/FileData";
import FolderData from "@/app/models/data/FolderData";
import { DocumentSize, ProjectPhaseTypeEnum } from "@/app/models/data/StatusType";
import { K, Meta, T, } from "@/app/models/data/dataStoreMethods";
import { Team } from "@/app/models/teams/Team";
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { Phase } from '@/app/models/phases/Phase';
import PromptViewer from "@/app/prompts/PromptViewer";
import { WritableDraft } from "@/app/state/redux/ReducerGenerator";
import {
  addDocumentSuccess,
  DocumentObject
} from "@/app/state/redux/slices/DocumentSlice";
import { AlignmentOptions } from "@/app/state/redux/slices/toolbarSlice";
import { AllStatus } from "@/app/state/stores/DetailsListStore";
import { DocumentBase } from "@/app/state/stores/DocumentStore";
import { useAppDispatch } from "@/app/state/stores/useAppDispatch";
import { DatasetModel } from "@/app/todos/tasks/DataSetModel";
import Clipboard from "@/app/ts/clipboard";
import { AllTypes } from "@/app/typings/PropTypes";
import { DocumentPath, DocumentTypeEnum } from "@/app/typings/documentTypes";
import { getMetadataFromPlainText } from "@/app/utils/metadataUtils";
import AccessHistory, {
  convertAccessRecordToHistory,
} from "@/app/versions/AccessHistory";
import AppVersionImpl from "@/app/versions/AppVersion";
import { Version } from "@/app/versions/Version";
import { VersionData } from "@/app/versions/VersionData";
import { getCurrentAppInfo } from "@/app/versions/VersionGenerator";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta, DefaultIncludedFields  } from '@/config/BaseConfig';
import { DocumentBuilderConfig } from "@/config/DocumentBuilderConfig";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { AppStructureItem } from "@/config/appStructure/AppStructure";
import { frontendStructure } from "@/config/appStructure/FrontendStructure";
import getAppPath from "@/config/appStructure/appPath";
import { saveDocumentToDatabase } from "@/config/database/updateDocumentInDatabase";
import { useMetadata } from "@/config/useMetadata";
import { FinancialReport } from "@/documents/documentation/report/Report";
import BackendStructure, { backendStructure } from '@/server/database/BackendStructure';
import { createAsyncThunk } from "@reduxjs/toolkit";
import crypto from "crypto";
import {
  ContentState,
  Editor,
  EditorState,
  Modifier,
  RichUtils,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { versions } from "process";
import React, { useState, version } from "react";
import { DocumentFormattingOptions } from "./ DocumentFormattingOptionsComponent";
import { ModifiedDate } from "./DocType";
import { DocumentOptions } from "./DocumentOptions";
import DocumentPermissions from "./DocumentPermissions";
import { DocumentPhaseTypeEnum } from "./DocumentPhaseType";
import {
  DocumentAnimationOptions,
  DocumentBuilderProps,
} from "./SharedDocumentProps";
import { ResearchReport, TechnicalReport } from "./documentation/report/Report";

const API_BASE_URL = endpoints.apiBaseUrl;

// Example function to compute checksum
function computeChecksum(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}
// todo update dynamic conent version
const versionData = "content of version 1.0.0";
const checksum = computeChecksum(versionData);

type ContentStructuredMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  > = StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & ContentState;

// Define a mapped type to convert TodoSubtasks to WritableDraft equivalent
type WritableTodoSubtasks = WritableDraft<TodoSubtasks>;

// ---------------------------
// Specialized Document Interfaces
// ---------------------------

// Main DocumentData interface
interface DocumentData<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends DocumentBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    DatasetModel<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  // DocumentData specific properties
  id: string | number;
  _id: string;
  title: string;
  content: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  documents: WritableDraft<DocumentObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[];
  permissions?: DocumentPermissions;
  topics?: string[];
  highlights?: string[];
  keywords?: string[];
  load?(content: any): void;
  subtasks?: TodoSubtasks;
  file?: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  files?: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  folder?: FolderData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  folders: FolderData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  filePath?: DocumentPath<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  status?: AllStatus;
  type?: AllTypes;
  locked?: boolean;
  category?: string;
  changes?: boolean | string | string[];
  timestamp?: Date;
  source?: string;
  report?: FinancialReport | TechnicalReport | ResearchReport;
  options?: DocumentOptions;
  folderPath: string;
  previousContent?: string | ContentState;
  currentContent?: ContentState;
  currentMeta: Meta;
  previousMeta?: Meta;
  previousMetadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  currentMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  accessHistory: AccessHistory[];
  documentPhase?: DocumentPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  version?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  versionData?: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  visibility: AllTypes;
  url?: string;
  updatedDocument?: DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  documentSize: DocumentSize;
  lastModifiedDate?: ModifiedDate;
  lastModifiedBy: string;
  lastModifiedByTeamId?: number | null;
  lastModifiedByTeam?: Team;
  name?: string;
  descriptionRenamed?: string | null;
  createdByRenamed?: string;
  createdDate?: string | Date;
  documentType: string | DocumentTypeEnum;
  documentData?: DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  document?: DocumentObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

interface RevisionOptions {
  enabled: boolean;
  author: string;
  dataFormat: string;
  allow: boolean;
}

// Now, we can use RevisionOptions as the type for revisions
const defaultRevisionOptions: RevisionOptions = {
  enabled: true,
  author: "default-author",
  dataFormat: "DD-MM-YYYY",
  allow: false,
};

// Define a custom type/interface that extends ProjectPhaseTypeEnum and includes additional properties
export interface CustomProjectPhaseType {
  phaseType: ProjectPhaseTypeEnum;
  customProp1: string;
  customProp2: number;
  onChange: (phase: ProjectPhaseTypeEnum) => void;
  // Add more custom properties as needed
}

const initialOptions: DocumentOptions = {
  previousMeta: {
    metadataEntries: [],
    keywords: [],
    version: {},
    isActive: true,
  },
  currentMeta: undefined,
  uniqueIdentifier: "",
  documentType: typeof DocumentTypeEnum,
  documentSize: DocumentSize.A4,
  limit: 0,
  page: 0,
  createdBy: "",
  additionalOptions: undefined,
  language: LanguageEnum.English,
  documentPhase: "",
  version: undefined,
  isDynamic: undefined,
  size: DocumentSize.A4,
  animations: undefined,
  layout: undefined,
  panels: undefined,
  pageNumbers: false,
  footer: "",
  watermark: {
    enabled: false,
    text: "",
    color: "",
    opacity: 0,
    fontSize: 0,
    size: "",
    x: 0,
    y: 0,
    rotation: 0,
    borderStyle: "",
  },
  headerFooterOptions: {
    enabled: false,
    headerContent: undefined,
    footerContent: undefined,
    showHeader: false,
    showFooter: false,
    dateFormat: undefined,
    differentFirstPage: false,
    differentOddEven: false,
    headerOptions: undefined,
    footerOptions: undefined,
  },
  zoom: 0,
  showRuler: false,
  showDocumentOutline: false,
  showComments: false,
  showRevisions: false,
  spellCheck: false,
  grammarCheck: false,
  visibility: undefined,
  fontSize: 0,
  font: "",
  textColor: "",
  backgroundColor: "",
  fontFamily: "",
  lineSpacing: 0,
  alignment: AlignmentOptions.LEFT,
  indentSize: 0,
  bulletList: false,
  numberedList: false,
  headingLevel: 0,
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
  links: false,
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
  previousMetadata: undefined,
  currentMetadata: undefined,
  accessHistory: [],
  lastModifiedDate: undefined,
  tableCells: {
    enabled: false,
    padding: 0,
    fontSize: 0,
    alignment: "left",
    borders: undefined,
  },
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
  color: "",
  colorCoding: undefined,
  highlight: false,
  highlightColor: "",
  customSettings: undefined,
  documents: [],
  includeType: { enabled: false,  format: "all" },
  footnote: false,
  defaultZoomLevel: 0,
  customProperties: undefined,
  value: undefined,
  includeTitle: false,
  includeContent: false,
  includeStatus: false,
  includeAdditionalInfo: false,
  metadata: undefined,
  userSettings: undefined,
  dataVersions: undefined,
  levels: {
    enabled: true,
    startLevel: 0,
    endLevel: undefined, // Adjust according to your actual logic or type
    format: "", // Adjust according to your actual data type
    separator: "", // Adjust according to your actual data type
    style: {
      main: "", // Adjust according to your actual data type
      styles: [
        {
          format: [], // Adjust according to your actual data type
          separator: [], // Adjust according to your actual data type
          style: {
            format: [""],
            separator: [""],
            style: ["", ""],
          },
        },
      ],
    },
  },
  setDocumentPhase: (
    phase: string | Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| undefined,
    phaseType: DocumentPhaseTypeEnum
  ) => {
    return { phase, phaseType };
  },
  lastModifiedBy: "",
  versionData: {
    version: "",
    timestamp: "",
    user: "",
    id: "",
    parentId: "",
    parentType: "",
    parentVersion: "",
    createdAt: "",
    updatedAt: "",
    deletedAt: "",
    createdBy: "",
    updatedBy: "",
    deletedBy: "",
    status: "",
    type: "",
    name: "",
    description: "",
    content: "",
    fileType: "",
    fileSize: 0,
    filePath: "",
    fileUrl: "",
    fileHash: "",
    fileMetadata: {},
    customMetadata: {},
    tags: [],
    collaborators: [],
    permissions: [],
    revisions: [],
    activities: [],
    comments: [],
    attachments: [],
    links: [],
    references: [],
    relatedItems: [],
    externalLinks: [],
    externalReferences: [],
    externalRelatedItems: [],
  } as unknown as VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  currentContent: new ContentState(),
  previousContent: undefined,
  additionalOptionsLabel: "additionalOptionsLabel",
};

export const [options, setOptions] = useState<Options>(initialOptions);

// Initialize editorState using useState or useRef
const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
// Combine types
type Options = DocumentOptions & { revisionOptions?: RevisionOptions };













// Example function to reset editor content
const resetEditorContent = () => {
  const newEditorState = EditorState.push(
    editorState,
    ContentState.createFromText(""), // Create new empty content state
    "remove-range" // Example change type
  );
  setEditorState(newEditorState); // Update editor state
};

// Assuming you have some way to retrieve or maintain your metadata
const getMetadataForContentState = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  contentState: CustomContentState
): StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  // Replace this with your actual logic to extract or retrieve metadata based on contentState
  return {
    description: "",
    apiEndpoint: "",
    apiKey: "",
    timeout: 0,
   
    id: "", 
    
    retryAttempts: 0,
    name: "",
    category: "", 
    timestamp: "",
    createdBy: "",
    tags: "",
    metadata: "",
    
    initialState: "",
    meta: "",
    events: "",
   
    metadataEntries: {
      fileOrFolderId1: {
        originalPath: "path1",
        alternatePaths: ["altPath1", "altPath2"],
        author: "author1",
        timestamp: new Date(),
        fileType: "fileType1",
        title: "title1",
        description: "description2",
        keywords: ["keyword1", "keyword2"],
        authors: ["author1", "author2"],
        contributors: [{

        }],
        publisher: "publisher1",
        copyright: "copyright1",
        license: "license1",
        links: ["link1", "link2"],
        tags: ["tag1", "tag2"],
      },
      fileOrFolderId2: {
        originalPath: "path2",
        alternatePaths: ["altPath3", "altPath4"],
        author: "author2",
        timestamp: new Date(),
        fileType: "fileType2",
        title: "title2",
        description: "description2",
        keywords: ["keyword3", "keyword4"],
        authors: ["author3", "author4"],
        contributors: [{
          
        }],
        publisher: "publisher2",
        copyright: "copyright2",
        license: "license2",
        links: ["link3", "link4"],
        tags: ["tag3", "tag4"],
      },
    }
    // Add more entries as needed
  };
};

// Extracting the current content and metadata
const contentState: ContentState = editorState.getCurrentContent();
const previousContent: string = contentState.getPlainText(); // Or use any other method to get required data


  // Define the types for the `thunkAPI` argument
interface ThunkAPI {
  rejectWithValue: (value: any) => any;
  dispatch: Function    ;
  getState: Function;
} 

export const saveDocument = createAsyncThunk(
  'document/saveDocument',
  async (
    { documentData, content, }: { documentData: DocumentData<T, K>; content: string }, 
    { rejectWithValue }: ThunkAPI
  ) => {
    try {
      // API call to save the document
      const response = await saveDocumentToDatabase(documentData, content);
      return { success: true, data: response };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


// Extracting metadata
// Convert ContentState to string for metadata extraction
const extractMetadata = async (
  contentId: string,
  contentState: ContentState
): Promise<UnifiedMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  const contentString = contentState.getPlainText();
  return await getMetadataFromPlainText(contentId, contentString);
};

// Initial state or default values for metadata
 const [currentMetadata, setCurrentMetadata] = useState<UnifiedMetaDataOptions(selectedmetadata);
 const [previousMetadata, setPreviousMetadata] = useState<UnifiedMetaDataOptions(selectedmetadata);



 const updateMetadata = (newMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
  // Save current metadata as previous before updating
  setPreviousMetadata(currentMetadata);
  // Update the current metadata
  setCurrentMetadata(newMetadata);
};


// Using async function to handle metadata extraction
const handleMetadataExtraction = async (
  contentState: ContentState,
  previousContentState: ContentState,
  setCurrentMetadata: React.Dispatch<React.SetStateAction<UnifiedMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>,
  setPreviousMetadata: React.Dispatch<React.SetStateAction<UnifiedMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>,
  contentId?: string 
) => {

  if (!contentId) {
    // Logic to retrieve or generate contentId if it's required
    contentId = await fetchContentIdFromAPI(contentState); // Example function to fetch contentId based on contentState
  }

  const currentMetadataResult = await extractMetadata(contentId, contentState);
  setCurrentMetadata(currentMetadataResult);

  const previousMetadataResult = await extractMetadata(contentId, previousContentState);
  setPreviousMetadata(previousMetadataResult);
};
// Assuming you have a way to determine the previous content state
// For example, using a saved snapshot or version history
const previousContentState: ContentState =
  createContentStateFromText(previousContent); // Replace with your custom function

//

handleMetadataExtraction(
  // contentId,
  contentState,
  previousContentState,
  setCurrentMetadata,
  setPreviousMetadata
);

const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);
const convertedAccessHistory = options.accessHistory.map(
  convertAccessRecordToHistory
);



// Now you can use these values in DocumentBuilderProps
const documentBuilderProps: DocumentBuilderProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
  isDynamic: true,
  documents: [],
  projectPath: projectPath,
  editorState: editorState,
  options: options,
  setOptions: setOptions,
  documentPhase: options?.documentPhase,
  setDocumentPhase: options?.setDocumentPhase,
  currentContent: contentState,
  previousContent: previousContent,
  createdByRenamed: options.createdByRenamed,
  currentMetadata: currentMetadata,
  previousMetadata: previousMetadata,
  accessHistory: convertedAccessHistory,
  lastModifiedDate: options.lastModifiedDate,
  versionData: options.versionData,
  // version: options.version,
  visibility: options.visibility,
  updatedDocument: options.updatedDocument,
  documentSize: options.documentSize,
  lastModifiedBy: options.lastModifiedBy,
  name: options.name,
  description: options.description,
  createdBy: options.createdBy,
  createdDate: options.createdDate,
  documentType: options.documentType,
  _rev: options._rev,
  _attachments: options._attachments,
  _links: options._links,

  version: new AppVersionImpl({
    id: 0,
    content: contentState.toString(),
    versionNumber: versionNumber,
    appVersion: appVersion,
    data: [] as Data<T>[],
    appName: "Buddease",
    releaseDate: new Date().toISOString(),
    releaseNotes: [],
    creator: {
      id: 0,
      name: "Test User",
    },
    checksum: checksum,
    name: "Version 1.0.0",
    url: "https://example.com/version/1.0.0",
    versionHistory: [
      { version: "0.9.0", releaseDate: "2023-12-01", notes: ["Beta release"] },
      {
        version: "0.9.1",
        releaseDate: "2023-12-15",
        notes: ["Minor bug fixes"],
      },
    ],
    draft: true,
    userId: "0",
    documentId: "0",
    metadata: {
      author: "Test User",
      timestamp: new Date(),
    },
    versions: {
      frontend: frontendStructure, 
      backend: backendStructure,
      data: {
        id: 0,
        user: "0",
        version: "0.9.0",
        timestamp: new Date(),
        comments: [],
        parentId: "",
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
        // versions: [],
        checksum: "",
        
        frontend: {
          versions, versionData, structureHash, getStructureHash,
          id: "",
          name: "",
          type: "",
          path: "",
          content: "",
          draft: false,
          permissions: {
            read: false,
            write: false,
            delete: false,
            share: false,
            execute: false,
          },
          getStructure: function (): Promise<Record<string, AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
            // Implement the getStructure method here if needed
            return new Promise((resolve, reject) => {
              try {
                //check if structure is most up to date, if not, update it
                const structure = this.getStructure();
                const structureArray = this.getStructureAsArray();
                const structureString = JSON.stringify(structure);
                const structureArrayString = JSON.stringify(structureArray);
                const structureChecksum = this.getStructureChecksum();
              
                resolve({});
              } catch (error: any) {
                reject(error);
              }
            })
          },
          getStructureAsArray: function (): Promise<AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
            throw new Error("Function not implemented.");
          },
          frontendVersions: async () => [],
          getStructureChecksum: () => Promise.resolve("")
        },
       
        backend: new BackendStructure(projectPath),
       
        changes: [],
        versionData: []
      },
    },
    buildNumber: "1",
    parentId: "0",
    parentType: "document",
    parentVersionNumber: "0.0.0",
    documentType: DocumentTypeEnum.Document,
    documentName: "Test Document",
    documentDescription: "This is a test document",
    documentTags: [],
    documentStatus: "draft",
    documentVisibility: "private",
    documentCreatedAt: new Date(),
    documentUpdatedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isLatest: true,
    isPublished: false,
    publishedAt: null,
    source: "GitHub",
    status: "Active",
    workspaceName: "Development Workspace",
    workspaceUrl: "https://example.com/workspace",
    workspaceViewers: ["User1", "User2", "User3"],
    workspaceAdmins: ["Admin1", "Admin2"],
    parentVersion: "1.2.3",
    parentTitle: "Parent Title",
    parentContent: "Parent Content",
    parentName: "Parent Name",
    parentUrl: "https://example.com/parent",
    parentChecksum: "abc123",
    parentMetadata: { key: "value" },
    parentAppVersion: "1.2.3",
    description: "This is a description.",
    workspaceId: "123456",
    workspaceType: "Development",
    workspaceMembers: ["Member1", "Member2", "Member3"],
    workspaceRoles: ["Developer", "Designer", "Manager"],
    workspacePermissions: ["Read", "Write", "Delete"],
    workspaceSettings: { theme: "dark", notifications: true },
    workspaceMetadata: { key: "value" },
    workspaceCreator: {
      id: 1,
      name: "Workspace Admin",
    },
    workspaceCreatedAt: "2023-01-01",
    workspaceUpdatedAt: "2023-01-02",
    workspaceArchivedAt: "",
    workspaceDeletedAt: "",
    workspaceVersion: "1.0.0",
    workspaceVersionHistory: ["1.0.0", "1.1.0"],
  }),
    buildDocument: async (documentData: DocumentData<T, K>): Promise<void> => {
      // Implementation of buildDocument function
      const dispatch = useAppDispatch(); // Assuming you're using useDispatch from react-redux
      const { handleError } = useErrorHandling();
      try {
        console.log("Building document with data:", documentData);

        // Save the document data to the database
        await saveDocumentToDatabase(
          {
            id: documentData.id,
            name: documentData.name,
            description: documentData.description,
            filePathOrUrl: documentData.filePathOrUrl,
            uploadedBy: documentData.uploadedBy,
            uploadedAt: documentData.uploadedAt,
            createdAt: documentData.createdAt,
            updatedBy: documentData.updatedBy,
            createdBy: documentData.createdBy,
            documents: documentData.documents,
            selectedDocument: documentData.selectedDocument,
            tagsOrCategories: documentData.tagsOrCategories,

            format: documentData.format,
            visibility: documentData.visibility,
            type: documentData.type,
            uploadedByTeamId: documentData.uploadedByTeamId,
            uploadedByTeam: documentData.uploadedByTeam,
            lastModifiedDate: documentData.lastModifiedDate,
            lastModifiedBy: documentData.lastModifiedBy,
            lastModifiedByTeamId: documentData.lastModifiedByTeamId,
            lastModifiedByTeam: documentData.lastModifiedByTeam,
            url: documentData.url,
            all: documentData.all,
            title: "",
            content: ""
          },
          documentData.content
        );

        // Reset the editor state (assuming editorState is a state or ref from your editor library)
        resetEditorContent();
        // Set document options
        // Reset the editor state (assuming you're using EditorState from 'draft-js')
        const editorState = EditorState.createWithContent(
          ContentState.createFromText("")
        );
        // Assuming setEditorState is a state setter for editor state
        setEditorState(editorState);

        // Set document options including revision options
        setOptions((prevOptions) => ({
          ...prevOptions,
          revisionOptions: {
            enabled: true,
            author: "default-author",
            dataFormat: "DD-MM-YYYY",
            allow: true
          },
        }));

        // Dispatch the saveDocument thunk with proper arguments
        await dispatch(saveDocument({
          documentData, // DocumentData object
          content: documentData.content, // Content of the document
        }))

        // Dispatch success action
        dispatch(addDocumentSuccess({
          id: documentData.id.toString(),
          title: documentData.title
        }));
        
    
        // Optionally, perform additional operations or dispatch more actions
        console.log("Document built successfully.");
      } catch (error: any) {
        // Handle errors
        const errorMessage = "Error building document: " + error.message;
        handleError(errorMessage, error.stack);
        dispatch({
          type: "ADD_DOCUMENT_FAILURE",

          payload: error.message,
        });
      }
      return Promise.resolve();
    },

  onConfigChange: (newConfig: DocumentBuilderConfig) => {
    setOptions((prevOptions: any) => ({
      ...prevOptions,
      page: newConfig.page ?? prevOptions.page,
      levels: newConfig.levels ?? prevOptions.levels,
      limit: newConfig.limit ?? prevOptions.limit,
      metadata: newConfig.metadata ?? prevOptions.metadata,
      uniqueIdentifier: newConfig.uniqueIdentifier ?? prevOptions.uniqueIdentifier,
      documentType: newConfig.documentType ?? prevOptions.documentType,
      userIdea: newConfig.userIdea ?? prevOptions.userIdea,
      documentSize: newConfig.documentSize ?? prevOptions.documentSize,
      documentPhase: newConfig.documentPhase ?? prevOptions.documentPhase,
      version: newConfig.version ?? prevOptions.version,
      isDynamic: newConfig.isDynamic ?? prevOptions.isDynamic,
      size: newConfig.size ?? prevOptions.size,
      animations: newConfig.animations ?? prevOptions.animations,
      layout: newConfig.layout ?? prevOptions.layout,
      panels: newConfig.panels ?? prevOptions.panels,
      pageNumbers: newConfig.pageNumbers ?? prevOptions.pageNumbers,
      footer: newConfig.footer ?? prevOptions.footer,
      watermark: newConfig.watermark ?? prevOptions.watermark,
      additionalOptions: newConfig.additionalOptions || prevOptions.additionalOptions,
      frontendStructure: newConfig.frontendStructure || prevOptions.frontendStructure,
      visibility: newConfig.visibility || prevOptions.visibility,
      backendStructure: newConfig.backendStructure ?? prevOptions.backendStructure,
      structure: newConfig.structure || prevOptions.structure,
      backgroundColor: newConfig.backgroundColor || prevOptions.backgroundColor,
      fontSize: newConfig.fontSize || prevOptions.fontSize,
      textColor: newConfig.textColor || prevOptions.textColor,
      fontFamily: newConfig.fontFamily || prevOptions.fontFamily,
      lineSpacing: newConfig.lineSpacing || prevOptions.lineSpacing,
      enableSpellCheck: newConfig.enableSpellCheck || prevOptions.enableSpellCheck,
      enableAutoSave: newConfig.enableAutoSave || prevOptions.enableAutoSave,
      autoSaveInterval: newConfig.autoSaveInterval || prevOptions.autoSaveInterval,
      showWordCount: newConfig.showWordCount || prevOptions.showWordCount,
      maxWordCount: newConfig.maxWordCount || prevOptions.maxWordCount,
      enableSyncWithExternalCalendars: newConfig.enableSyncWithExternalCalendars ??
        prevOptions.enableSyncWithExternalCalendars,
      enableThirdPartyIntegration: newConfig.enableThirdPartyIntegration ??
        prevOptions.enableThirdPartyIntegration,
      thirdPartyAPIKey: newConfig.thirdPartyAPIKey || prevOptions.thirdPartyAPIKey,
      thirdPartyEndpoint: newConfig.thirdPartyEndpoint || prevOptions.thirdPartyEndpoint,
      enableAccessibilityMode: newConfig.enableAccessibilityMode ||
        prevOptions.enableAccessibilityMode,
      highContrastMode: newConfig.highContrastMode || prevOptions.highContrastMode,
      screenReaderSupport: newConfig.screenReaderSupport || prevOptions.screenReaderSupport,
      orientation: newConfig.orientation ?? prevOptions.orientation,
      font: newConfig.font || prevOptions.font,
      alignment: newConfig.alignment || prevOptions.alignment,
      indentSize: newConfig.indentSize || prevOptions.indentSize,
      bulletList: newConfig.bulletList || prevOptions.bulletList,
      numberedList: newConfig.numberedList || prevOptions.numberedList,
      headingLevel: newConfig.headingLevel || prevOptions.headingLevel,
      toc: newConfig.toc || prevOptions.toc,
      bold: newConfig.bold || prevOptions.bold,
      italic: newConfig.italic || prevOptions.italic,
      underline: newConfig.underline || prevOptions.underline,
      strikethrough: newConfig.strikethrough || prevOptions.strikethrough,
      subscript: newConfig.subscript || prevOptions.subscript,
      superscript: newConfig.superscript || prevOptions.superscript,
      hyperlink: newConfig.hyperlink || prevOptions.hyperlink,
      sections: newConfig.sections || prevOptions.sections,
      textStyles: newConfig.textStyles || prevOptions.textStyles,
      links: typeof prevOptions.links === "object" &&
        typeof newConfig.links === "object"
        ? { ...prevOptions.links, ...newConfig.links }
        : newConfig.links || prevOptions.links,
      embeddedContent: typeof prevOptions.embeddedContent === "object" &&
        typeof newConfig.embeddedContent == "object"
        ? { ...(newConfig.embeddedCode || prevOptions.embeddedCode) }
        : newConfig.embeddedContent || prevOptions.embeddedContent,
      comments: typeof prevOptions.comments === "object" &&
        typeof newConfig.comments === "object"
        ? {
          ...prevOptions.comments,
          ...newConfig.comments,
        }
        : newConfig.comments || prevOptions.comments,
      embeddedMedia: typeof prevOptions.embeddedMedia === "object" &&
        typeof newConfig.embeddedMedia === "object"
        ? { ...prevOptions.embeddedMedia, ...newConfig.embeddedMedia }
        : newConfig.embeddedMedia || prevOptions.embeddedMedia,

      embeddedCode: typeof prevOptions.embeddedCode === "object" &&
        typeof newConfig.embeddedCode === "object"
        ? { ...prevOptions.embeddedCode, ...newConfig.embeddedCode }
        : newConfig.embeddedCode || prevOptions.embeddedCode,

      styles: newConfig.styles || prevOptions.styles,

      image: typeof prevOptions.image === "object" &&
        typeof newConfig.image === "object"
        ? { ...prevOptions.image, ...newConfig.image }
        : newConfig.image || prevOptions.image,

      table: typeof prevOptions.table === "object" &&
        typeof newConfig.table === "object"
        ? { ...prevOptions.table, ...newConfig.table }
        : newConfig.table || prevOptions.table,
      tableRows: newConfig.tableRows || prevOptions.tableRows,
      tableColumns: newConfig.tableColumns || prevOptions.tableColumns,
      tableCells: newConfig.tableCells || prevOptions.tableCells,
      codeBlock: newConfig.codeBlock || prevOptions.codeBlock,
      blockquote: newConfig.blockquote || prevOptions.blockquote,
      codeInline: newConfig.codeInline || prevOptions.codeInline,
      quote: newConfig.quote || prevOptions.quote,
      todoList: newConfig.todoList || prevOptions.todoList,
      orderedTodoList: newConfig.orderedTodoList || prevOptions.orderedTodoList,
      unorderedTodoList: newConfig.unorderedTodoList || prevOptions.unorderedTodoList,
      color: newConfig.color || prevOptions.color,
      colorCoding: newConfig.colorCoding ?? prevOptions.colorCoding,
      highlight: newConfig.highlight || prevOptions.highlight,
      highlightColor: newConfig.highlightColor || prevOptions.highlightColor,
      customSettings: newConfig.customSettings || prevOptions.customSettings,
      documents: newConfig.documents || prevOptions.documents,
      includeType: newConfig.includeType || prevOptions.includeType,
      includeTitle: newConfig.includeTitle || prevOptions.includeTitle,
      includeContent: newConfig.includeContent || prevOptions.includeContent,
      includeStatus: newConfig.includeStatus || prevOptions.includeStatus,
      includeAdditionalInfo: newConfig.includeAdditionalInfo || prevOptions.includeAdditionalInfo,
      headerFooterOptions: {
        ...prevOptions.headerFooterOptions,
        ...newConfig.headerFooterOptions,
      },
      value: newConfig.value || prevOptions.value,
      userSettings: newConfig.userSettings ?? prevOptions.userSettings,
      dataVersions: newConfig.dataVersions ?? prevOptions.dataVersions,
      customProperties: newConfig.customProperties || prevOptions.customProperties,
      zoom: typeof prevOptions.zoom === "object" &&
        typeof newConfig.zoom === "object"
        ? { ...prevOptions.zoom, ...newConfig.zoom }
        : newConfig.zoom || prevOptions.zoom,
      showRuler: newConfig.showRuler !== undefined
        ? newConfig.showRuler
        : prevOptions.showRuler,
      showDocumentOutline: newConfig.showDocumentOutline !== undefined
        ? newConfig.showDocumentOutline
        : prevOptions.showDocumentOutline,
      showComments: newConfig.showComments !== undefined
        ? newConfig.showComments
        : prevOptions.showComments,
      showRevisions: newConfig.showRevisions !== undefined
        ? newConfig.showRevisions
        : prevOptions.showRevisions,
      spellCheck: newConfig.spellCheck !== undefined
        ? newConfig.spellCheck
        : prevOptions.spellCheck,
      grammarCheck: newConfig.grammarCheck !== undefined
        ? newConfig.grammarCheck
        : prevOptions.grammarCheck,

      language: newConfig.language || prevOptions.language,

      bookmarks: typeof prevOptions.bookmarks === "object" &&
        typeof newConfig.bookmarks === "object"
        ? { ...prevOptions.bookmarks, ...newConfig.bookmarks }
        : newConfig.bookmarks || prevOptions.bookmarks,

      crossReferences: typeof prevOptions.crossReferences === "object" &&
        typeof newConfig.crossReferences === "object"
        ? { ...prevOptions.crossReferences, ...newConfig.crossReferences }
        : newConfig.crossReferences || prevOptions.crossReferences,

      footnotes: typeof prevOptions.footnotes === "object" &&
        typeof newConfig.footnotes === "object"
        ? { ...prevOptions.footnotes, ...newConfig.footnotes }
        : newConfig.footnotes || prevOptions.footnotes,

      endnotes: typeof prevOptions.endnotes === "object" &&
        typeof newConfig.endnotes === "object"
        ? { ...prevOptions.endnotes, ...newConfig.endnotes }
        : newConfig.endnotes || prevOptions.endnotes,

      revisions: newConfig.revisions ?? prevOptions.revisions,
      defaultZoomLevel: newConfig.defaultZoomLevel ?? prevOptions.defaultZoomLevel,
      previousMetadata: newConfig.previousMetadata !== undefined
        ? newConfig.previousMetadata
        : prevOptions.previousMetadata,
      currentMetadata: newConfig.currentMetadata !== undefined
        ? newConfig.currentMetadata
        : prevOptions.currentMetadata,
      accessHistory: newConfig.accessHistory !== undefined
        ? newConfig.accessHistory
        : prevOptions.accessHistory,
      tableStyles: newConfig.tableStyles !== undefined
        ? newConfig.tableStyles
        : prevOptions.tableStyles,
      footnote: newConfig.footnote !== undefined
        ? newConfig.footnote
        : prevOptions.footnote,
    }));
  },
  onOptionsChange: function (newOptions: DocumentOptions): void {
    throw new Error("Function not implemented.");
  },
  id: "",
  _id: "",
  title: "",
  content: {},
  permissions: undefined,
  folders: [],
  folderPath: "",
  document: undefined,
  _etag: "",
  _local: false,
  _revs: [],
  _source: undefined,
  _shards: undefined,
  _size: 0,
  _version: 0,
  _version_conflicts: 0,
  _seq_no: 0,
  _primary_term: 0,
  _routing: "",
  _parent: "",
  _parent_as_child: false,
  _slices: [],
  _highlight: undefined,
  _highlight_inner_hits: undefined,
  _source_as_doc: false,
  _source_includes: [],
  _routing_keys: [],
  _routing_values: [],
  _routing_values_as_array: [],
  _routing_values_as_array_of_objects: [],
  _routing_values_as_array_of_objects_with_key: [],
  _routing_values_as_array_of_objects_with_key_and_value: [],
  _routing_values_as_array_of_objects_with_key_and_value_and_value: [],
  filePathOrUrl: "",
  uploadedBy: '',
  uploadedAt: "",
  tagsOrCategories: "",
  format: "",
  uploadedByTeamId: null,
  uploadedByTeam: null,
  url: undefined,
  updatedBy: "",
  selectedDocument: null,
  all: null,
  createdAt: undefined
};

const DocumentBuilder: React.FC<DocumentBuilderProps> = ({
  isDynamic,
  options,
  onOptionsChange,
  setOptions,
  documents,
  buildDocument,
}) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [isPublic, setIsPublic] = useState(false);
  const { panelSizes, handleResize } = useResizablePanels();
  const { slide, drag, show } = useMovementAnimations();
  const { numPanels, handleNumPanelsChange, panelContents } =
    usePanelContents();

  const toggleVisibility = () => {
    setIsPublic((prevIsPublic) => !prevIsPublic);
  };

  const handleSizeChange = (newSize: DocumentSize) => {
    onOptionsChange({ ...options, size: newSize });
  };

  const handleAnimationChange = (
    animationOptions: DocumentAnimationOptions
  ) => {
    onOptionsChange({ ...options, animations: animationOptions });
  };
  
  
  const handleOptionsChange = (newOptions: any) => {
    // Call setOptions prop to update options state
    setOptions(newOptions);
  };
  
  const handleCopy = () => {
    // Get the current selected content from the editor
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const selectedText = getTextBetweenOffsets(
      currentContent.getPlainText(),
      selection.getStartOffset(),
      selection.getEndOffset()
    );

    // Log the copied content
    console.log("Copied to DocumentBuilder:", selectedText);
  };

  const handlePaste = () => {
    // Simulate pasting content (replace with actual logic)
    const pastedContent = "Pasted Content";

    // Log the pasted content
    console.log("Pasted in DocumentBuilder:", pastedContent);
    
    // You can update the editor state with the pasted content if needed
    const newContentState = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      pastedContent
    );

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "insert-characters"
    );

    setEditorState(newEditorState);
  };

  const handleKeyCommand = (command: any, state: any) => {
    const newState = RichUtils.handleKeyCommand(state, command);

    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };
  
  const handleCreateDocument = async (
  options: DocumentFormattingOptions
  ) => {
    const documentContent = editorState.getCurrentContent().getPlainText();
    const formattedOptions = getFormattedOptions(options);

    
    const documentType = determineDocumentType({
      content: documentContent,
      filePathOrUrl: "", // Set your file path or URL here
      format: "" // Optionally, provide format if necessary
    });
    


    const area = `${fetchUserAreaDimensions().width}x${fetchUserAreaDimensions().height}`;
    const currentMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = useMetadata<T, K>(area)

    const documentData: DocumentData<T, K, Meta<T, K>, ExcludedFields<T, K>> = {}
    // Create a document object
    const documentObject: DocumentObject<BaseData<string, string, StructuredMetadata<any, any>>> = {
      // Document Identification & Versioning
      id: "", // Document unique identifier
      _id: "", // Internal document identifier
      _rev: undefined, // Document revision identifier
      version: undefined, // Document version
      versionData: undefined, // Additional version data
      name: undefined, // Document name or title (possibly renamed)
      title: "", // Document title
       documentType: documentType, // Use the determined document type
      documentSize: DocumentSize.A4, // Size of the document
      documentPhase: undefined, // Current phase of the document in its lifecycle

      createdBy: "created_by", // Creator of the document
      alinkColor: "#000000", // Color of the alink
      // Metadata
      createdAt: undefined, // Date when the document was created
      createdDate: undefined, // Date when the document was created (possibly renamed)
      createdByRenamed: undefined, // Creator of the document (possibly renamed)
      updatedBy: "", // Last person to update the document
      lastModified: "", // Last modification date as a string
      lastModifiedDate: undefined, // Last modification date as a Date object
      lastModifiedBy: "", // Last person who modified the document
      ownerDocument: null, // Owning document for nested structures (if any)
      previousMetadata: undefined, // Metadata from previous versions
      currentMetadata: currentMetadata, // Current metadata information
      tagsOrCategories: "", // Tags or categories associated with the document
      accessHistory: [], // Access history logs
      visibility: undefined, // Document visibility settings (public/private)


      // Content & Structure
      content: {
        id: "",
        title: "",
        items: [],
        data: {},
        latestVersion: createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
        description: "",
        subscriberId: "",
       
        category: "",
        categoryProperties: "",
        timestamp: "",
        length: 0,
       

      }, // Main content of the document
      documents: [], // Array of sub-documents or sections
      folders: [], // Folder hierarchy related to the document
      rootElement: null, // Root HTML or XML element (if applicable)
      scrollingElement: null, // The element being scrolled (if any)
      currentScript: null, // Currently executing script (if any)
      selectedDocument: null, // Currently selected document in a list or view
      documentList: [], // List of associated documents
      filteredDocuments: [], // Documents filtered based on criteria
      searchResults: [], // Search results within the document or related documents


      // Document Properties & Attributes
      bgColor: "", // Background color of the document
      charset: "", // Character set of the document
      characterSet: "", // Character set (possibly renamed)
      contentType: "", // MIME type of the document
      cookie: "", // Cookies associated with the document
      compatMode: "", // Compatibility mode (e.g., quirks mode)
      designMode: "", // Design mode for editing (on/off)
      dir: "", // Text direction (e.g., ltr, rtl)
      domain: "", // Domain of the document
      inputEncoding: "", // Input encoding (e.g., UTF-8)
      linkColor: "", // Color of hyperlinks
      referrer: "", // Referrer URL
      vlinkColor: "", // Visited link color
      URL: "", // URL of the document


      // Document State
      fullscreen: false, // Is the document in fullscreen mode
      fullscreenEnabled: false, // Is fullscreen mode allowed
      hidden: false, // Is the document hidden
      readyState: "", // Document readiness state (e.g., loading, complete)
      loading: false, // Is the document currently loading
      error: null, // Error information if any issues occur


      // File & Path Information
      documentURI: "", // Document URI
      filePathOrUrl: "", // Path or URL to the document file
      folderPath: "", // Path to the folder containing the document


      // Permissions & Access Control
      permissions: undefined, // Permissions related to the document
      uploadedBy: '', // ID of the user who uploaded the document
      uploadedByTeamId: null, // ID of the team that uploaded the document
      uploadedByTeam: null, // Team that uploaded the document


      // Options & Settings
      options: undefined, // Additional document-related options or settings
      timeline: undefined, // Timeline for versioning or history
      format: "",
      defaultView: undefined,
      doctype: null,
      document: undefined,
      childIds: []
    };

    
    // Call the buildDocument function passed as a prop
    await buildDocument({
      ...formattedOptions,
      id: '',
      content: documentContent,
      _id: "",
      title: "",
      documents: [],
      permissions: undefined,
      folders: [],
      options: undefined,
      folderPath: "",
      previousMetadata: undefined,
      currentMetadata: undefined,
      accessHistory: [],
      documentPhase: undefined,
      version: undefined,
      versionData: undefined,
      visibility: undefined,
      documentSize: DocumentSize.A4,
      lastModifiedDate: undefined,
      lastModifiedBy: "",
      name: undefined,
      createdByRenamed: undefined,
      createdDate: undefined,
      documentType: "",
      document: undefined,
      _rev: undefined,
      createdAt: undefined,
      createdBy: "",
      updatedBy: "",
      selectedDocument: null,
      filePathOrUrl: "",
      uploadedBy: '',
      tagsOrCategories: "",
      format: "",
      uploadedByTeamId: null,
      uploadedByTeam: null
    },
      documentData,
      documentObject,
      documentType
    );
  };  
  const handleEditorStateChange = async (
    newEditorState: EditorState
  ): Promise<void> => {
    // Update the editor state in DocumentBuilder
    setEditorState(newEditorState);

    // Accessing the content from the new editor state
    const content = newEditorState.getCurrentContent();
    console.log("New Editor State Content:", content.getPlainText());

    try {
      // Example: Perform a POST request to add data
      await axiosInstance.post(`${API_BASE_URL}/addData`, {
        data: content.getPlainText(),
      });

      // Example: Perform a GET request to fetch data
      const response = await axiosInstance.get(`${API_BASE_URL}/list`);
      console.log("Fetched data:", response.data);

      // You can perform other HTTP requests using Axios as needed
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCreateButtonClick = async () => {
    // Call handleCreateDocument with userOptions
    const userOptions: ToolbarOptionsProps = {
      isDocumentEditor: true,
      fontSize: "16px",
      bold: true,
      italic: true,
      underline: true,
      strike: true,
      code: true,
      link: true,
      image: true,
      audio: true,
      type: {} as DocumentTypeEnum,
      margin: {
        top: 10,
        right: 15,
        bottom: 10,
        left: 15,
      },
      textColor: "#000000",
      handleEditorStateChange: handleEditorStateChange, // Corrected assignment here
      onEditorStateChange: handleEditorStateChange,
    };

    // Call handleCreateDocument with userOptions
    handleCreateDocument(userOptions);
  };

  const handleDrag = () => {
    // Use the drag function here
    drag();
  };

  const renderDocument = () => {
    if (isDynamic) {
      return (
        <div style={{ border: "1px solid #ccc", padding: "10px" }}>
          <Editor
            editorState={editorState}
            onChange={(newState: EditorState) => setEditorState(newState)}
            handleKeyCommand={handleKeyCommand}
          />
        </div>
      );
    } else {
      return (
        <div>
          <p>This is a static document.</p>
          <p>Content goes here.</p>

          {documents.map((document) => (
            <div key={document.id}>
              <h2>{document.title}</h2>
              <p>Status: {document.status}</p>
              <p>Type: {document.type as React.ReactNode}</p>
              <p>Locked: {document.locked ? "Yes" : "No"}</p>
              {/* Additional document properties */}
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div>
      <div>
        {/* Sharing Options */}

        <SharingOptions
          onShareEmail={() => console.log("Share via Email")}
          onShareLink={() => console.log("Generate Shareable Link")}
          onShareSocialMedia={() => console.log("Share on Social Media")}
        />
        {/* Toolbar Options */}
        <ToolbarOptionsComponent
          isDocumentEditor={true}
          fontSize="16px"
          bold={true}
          italic={true}
          underline={true}
          strike={true}
          code={true}
          link={true}
          image={true}
          type={{} as DocumentTypeEnum}
          audio={true}
          onEditorStateChange={(newEditorState: any) => {
            setEditorState(newEditorState);
            const content = newEditorState.getCurrentContent();
            console.log("New Editor State Content:", content.getPlainText());
          }}
          handleEditorStateChange={(newEditorState: EditorState) => {
            // Handle editor state change
            // You can perform any custom logic here
            // For example, update state or trigger additional actions
          }}
        />
        <h1>Document Builder</h1>
        <Clipboard onCopy={handleCopy} onPaste={handlePaste} />

        {/* Other DocumentBuilder components go here */}
        <label>
          Document PrivacySettings:
          <input
            type="checkbox"
            checked={isPublic}
            onChange={toggleVisibility}
          />
          {isPublic ? "Public" : "Private"}
        </label>
      </div>
      <div>
        <label>
          Document Size:
          <select
            value={options.size}
            onChange={(e) => handleSizeChange(e.target.value as DocumentSize)}
          >
            <option value="letter">Letter</option>
            <option value="legal">Legal</option>
            <option value="a4">A4</option>
            <option value="custom">Custom</option>
          </select>
        </label>
      </div>
      <div>
        {/* Additional options UI */}
        <label>
          Animation Type:
          <select
            value={options.animations?.type}
            onChange={(e) =>
              handleOptionsChange({
                ...options,
                animations: {
                  ...options.animations,
                  type: e.target.value as "slide" | "fade" | "custom",
                },
              })
            }
          >
            <option value="slide">Slide</option>
            <option value="fade">Fade</option>
            <option value="custom">Custom</option>
          </select>
        </label>
      </div>
      <div>
        {/* Additional options UI */}
        <label>
          Animation Type:
          <select
            value={options.animations?.type}
            onChange={(e) =>
              handleOptionsChange({
                ...options,
                animations: {
                  ...options.animations,
                  type: e.target.value as "slide" | "fade" | "custom",
                },
              })
            }
          >
            <option value="slide">Slide</option>
            <option value="fade">Fade</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        {options.animations?.type === "custom" && (
          <div>
            {/* Add custom animation options UI */}
            <label>
              Animation Duration:
              <input
                type="number"
                value={options.animations.duration}
                onChange={(e) =>
                  handleOptionsChange({
                    ...options,
                    animations: {
                      ...options.animations,
                      duration: parseInt(e.target.value, 10),
                    },
                  })
                }
              />
            </label>
            {/* Add more custom animation options as needed */}
          </div>
        )}
      </div>
      {/* Separate Prompt Viewer component */}
      <PromptViewer prompts={[]} children={null} />
      {isDynamic && (
        <div>
          <h3>Resizable Panels</h3>
          <ResizablePanels
            sizes={panelSizes} // Pass panelSizes directly
            onResize={handleResize}
            onResizeStop={handleResize}
          >
            {panelContents.map((content, index) => (
              <div key={index}>{content}</div>
            ))}
          </ResizablePanels>
        </div>
      )}
      {isDynamic && options.animations?.type === "slide" && (
        <button onClick={() => slide(100, "left")}>Slide Left</button>
      )}
      {isDynamic && options.animations?.type === "slide" && (
        <button onClick={() => slide(100, "right")}>Slide Right</button>
      )}
      {isDynamic && options.animations?.type === "slide" && (
        <button onClick={() => slide(100, "up")}>Slide Up</button>
      )}
      {isDynamic && options.animations?.type === "slide" && (
        <button onClick={() => slide(100, "down")}>Slide Down</button>
      )}
      {isDynamic && options.animations?.type === "show" && (
        <button onClick={() => show()}>Show</button>
      )}
      {isDynamic && <button onClick={handleDrag}>Drag</button>}
      {isDynamic && (
        <button onClick={handleCreateButtonClick}>Create Document</button>
      )}
      {renderDocument()}
    </div>
  );
};

export default DocumentBuilder;
export { computeChecksum };
export type { DocumentData, RevisionOptions, WritableTodoSubtasks };

