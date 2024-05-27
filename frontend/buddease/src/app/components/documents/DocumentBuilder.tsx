// DocumentBuilder.tsx
import { endpoints } from "@/app/api/ApiEndpoints";
import { DocumentBuilderConfig } from "@/app/configs/DocumentBuilderConfig";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import FrontendStructure from "@/app/configs/appStructure/FrontendStructure";
import { traverseBackendDirectory } from "@/app/configs/declarations/traverseBackend";
import { usePanelContents } from "@/app/generators/usePanelContents";
import Clipboard from "@/app/ts/clipboard";
import crypto from 'crypto';
import {
  ContentState,
  Editor,
  EditorState,
  Modifier,
  RichUtils,
} from "draft-js";
import "draft-js/dist/Draft.css";
import React, { useState } from "react";
import getAppPath from "../../../../appPath";
import { CodingLanguageEnum, LanguageEnum } from "../communications/LanguageEnum";
import ResizablePanels from "../hooks/userInterface/ResizablePanels";
import useResizablePanels from "../hooks/userInterface/useResizablePanels";
import { useMovementAnimations } from "../libraries/animations/movementAnimations/MovementAnimationActions";
import { CommonData } from "../models/CommonData";
import { Data } from "../models/data/Data";
import FileData from "../models/data/FileData";
import FolderData from "../models/data/FolderData";
import {
  DocumentSize,
  IncludeType,
  Layout,
  Orientation,
  ProjectPhaseTypeEnum,
  Visibility,
} from "../models/data/StatusType";
import { Phase } from "../phases/Phase";
import PromptViewer from "../prompts/PromptViewer";
import axiosInstance from "../security/csrfToken";
import SharingOptions from "../shared/SharingOptions";
import { AlignmentOptions } from "../state/redux/slices/toolbarSlice";
import { AllStatus } from "../state/stores/DetailsListStore";
import { AllTypes } from "../typings/PropTypes";
import AppVersionImpl from "../versions/AppVersion";
import Version from "../versions/Version";
import { VersionData } from "../versions/VersionData";
import { getCurrentAppInfo } from "../versions/VersionGenerator";
import {
  createPdfDocument,
  getFormattedOptions,
} from "./DocumentCreationUtils";
import { DocumentPath, DocumentTypeEnum } from "./DocumentGenerator";
import { DocumentOptions } from "./DocumentOptions";
import {
  DocumentAnimationOptions,
  DocumentBuilderProps,
} from "./SharedDocumentProps";
import { ToolbarOptions, ToolbarOptionsProps } from "./ToolbarOptions";
import { getTextBetweenOffsets } from "./getTextBetweenOffsets";
import { ModifiedDate } from "./DocType";

const API_BASE_URL = endpoints.apiBaseUrl;



// Example function to compute checksum
function computeChecksum(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}
// todo update dynamic conent version
const versionData = "content of version 1.0.0";
const checksum = computeChecksum(versionData);

// DocumentData.tsx
export interface DocumentData extends CommonData<Data> {
  id: number;
  title: string;
  content: string;
  topics: string[];
  highlights: string[];
  keywords: string[];
  load?(content: any): void;
  permissions: DocumentPermissions | undefined;
  file?: FileData;
  files?: FileData[]; // Array of FileData associated with the document
  folder?: FolderData;
  folders: FolderData[]; // Array of FolderData associated with the document
  filePath?: DocumentPath;
  status?: AllStatus;
  type?: DocumentTypeEnum;
  locked?: boolean;
  changes?: string[];
  options: DocumentOptions | undefined;
  documentPhase?: Phase;
  folderPath: string;
  previousContent?: string;
  currentContent?: string;
  previousMetadata: StructuredMetadata | undefined;
  currentMetadata: StructuredMetadata | undefined;
  accessHistory: AccessHistory[];
  lastModifiedDate: { value: Date; isModified: boolean } | undefined; // Initialize as not modified
  versionData: VersionData | undefined;
  version: Version | undefined | null; // Update the type to accept null values
  visibility: AllTypes
  updatedDocument?: DocumentData; // Add property to track updated document data
  // Add more properties if needed
}


interface RevisionOptions {
  enabled: boolean;
  author: string;
  dataFormat: string;
}


// Now, we can use RevisionOptions as the type for revisions
const defaultRevisionOptions: RevisionOptions = {
  enabled: true,
  author: "default-author",
  dataFormat: "DD-MM-YYYY",
};


// Define a custom type/interface that extends ProjectPhaseTypeEnum and includes additional properties
export interface CustomProjectPhaseType {
  customProp1: string;
  customProp2: number;
  // Add more custom properties as needed
}
const [options, setOptions] =
  useState<DocumentOptions>(/* initial options value */);
const editorState = EditorState.createEmpty();

// Get the current content from the EditorState
const contentState: ContentState = editorState.getCurrentContent();

const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);

// Use the custom type/interface for the documentPhase option
// Use the custom type/interface for the documentPhase option
const documentBuilderProps: DocumentBuilderProps = {
  documentPhase: {
    phaseType: ProjectPhaseTypeEnum.Draft,
    customProp1: "value1", // Custom property values
    customProp2: 123,
    onChange: (phase: ProjectPhaseTypeEnum): void => {
      // Implementation of onChange function
      console.log("New phase selected:", phase);
    },
  },
  isDynamic: true, 
  version: new AppVersionImpl({
    id: 0,
    content: contentState.toString(),
    versionNumber: versionNumber,
    appVersion: appVersion,
    data: [] as Data[],
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
    userId: '0', 
    documentId: '0',
    parentId: '0',
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

  onOptionsChange: (options: DocumentOptions) => {
    setOptions(options);
  },

  onConfigChange: (newConfig: DocumentBuilderConfig) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      page: 0,
      levels: newConfig.levels,
      limit: newConfig.limit || 0,
      metadata:
        newConfig.metadata ||
        {
          /* default metadata */
        },
      uniqueIdentifier: newConfig.uniqueIdentifier || "",
      documentType:
        newConfig.documentType ||
        {
          /* default document type */
        },
      userIdea: newConfig.userIdea || "",
      additionalOptions: newConfig.additionalOptions || "",
      frontendStructure:
        newConfig.frontendStructure || new FrontendStructure(projectPath),
      documentPhase: newConfig.documentPhase || "",
      visibility: newConfig.visibility || Visibility.Private,
      version:
        newConfig.version ||
        Version.create({
          versionNumber: "1.0",
          name: "Test Document",
          appVersion: "1.0",
          id: 0,
          content: "",
          data: {} as Data[],
          url: `${API_BASE_URL}`,
          versionHistory: {
            versions: [],
          },
          checksum: "",
          draft: false,
          limit: 0,
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
          parentMetadata: undefined,
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
          updatedAt: undefined,
        }),

      backendStructure: newConfig.backendStructure || {
        structure: {} as Record<string, AppStructureItem>,
        traverseDirectory: traverseBackendDirectory,
        getStructure: () => {
          return (
            options?.backendStructure?.getStructure() || Promise.resolve({})
          );
        },
      },
      structure: newConfig.structure || {
        sections: [],
      },
      backgroundColor: newConfig.backgroundColor || "#FFFFFF",
      fontSize: newConfig.fontSize || 12,
      textColor: newConfig.textColor || "#000000",
      fontFamily: newConfig.fontFamily || "Arial",
      lineSpacing: newConfig.lineSpacing || 1.5,
      enableSpellCheck: newConfig.enableSpellCheck || false,
      enableAutoSave: newConfig.enableAutoSave || false,
      autoSaveInterval: newConfig.autoSaveInterval || 0,
      showWordCount: newConfig.showWordCount || false,
      maxWordCount: newConfig.maxWordCount || 0,
      enableSyncWithExternalCalendars:
        newConfig.enableSyncWithExternalCalendars || false,
      enableThirdPartyIntegration:
        newConfig.enableThirdPartyIntegration || false,
      thirdPartyAPIKey: newConfig.thirdPartyAPIKey || "",
      thirdPartyEndpoint: newConfig.thirdPartyEndpoint || "",
      enableAccessibilityMode: newConfig.enableAccessibilityMode || false,
      highContrastMode: newConfig.highContrastMode || false,
      screenReaderSupport: newConfig.screenReaderSupport || false,
      isDynamic: newConfig.isDynamic || false,
      size: newConfig.size || DocumentSize.A4,
      documentSize: newConfig.documentSize || {
        width: 595.28,
        height: 841.89,
      },
      orientation: newConfig.orientation || Orientation.Portrait,
      animations: newConfig.animations || {
        slideDuration: 300,
        dragElasticity: 0.1,
        showDuration: 300,
      },
      font: newConfig.font,
      layout: newConfig.layout || Layout.SingleColumn,
      panels: newConfig.panels || {
        contents: [],
        numColumns: 1,
      },
      alignment: newConfig.alignment || AlignmentOptions.LEFT,
      pageNumbers: newConfig.pageNumbers || false,
      footer: newConfig.footer || "",
      indentSize: newConfig.indentSize || 2,
      bulletList: newConfig.bulletList || {
        symbol: "-",
        style: "unordered",
      },
      numberedList: newConfig.numberedList || {
        style: "ordered",
        format: "%1.",
      },
      headingLevel: newConfig.headingLevel || 1,
      toc: newConfig.toc || {
        enabled: false,
        headingLevels: [1, 2, 3],
        format: "%1. %2",
        levels: 0,
      },

      bold: newConfig.bold || {
        enabled: true,
      },
      italic: newConfig.italic || {
        enabled: true,
      },
      underline: newConfig.underline || {
        enabled: true,
      },
      strikethrough: newConfig.strikethrough || {
        enabled: true,
      },
      subscript: newConfig.subscript || {
        enabled: true,
      },
      superscript: newConfig.superscript || {
        enabled: true,
      },
      hyperlink: newConfig.hyperlink || {
        enabled: true,
      },
      sections: newConfig.sections || [],
      textStyles: newConfig.textStyles || [],

      links: newConfig.links || {
        enabled: true,
        color: newConfig.color,
        underline: newConfig.underline,
        internal: {
          enabled: true,
        },
        external: {
          enabled: true,
        },
        },

      embeddedContent: newConfig.embeddedContent || {
        enabled: true,
        allow: true,
        language: LanguageEnum.English,
      },

      comments: newConfig.comments || {
        enabled: true,
        author: "string",
        dateFormat: "string",
      },

      embeddedMedia: newConfig.embeddedMedia || {
        enabled: true,
        allow: true
      },
      embeddedCode: newConfig.embeddedCode || {
        enabled: true,
        language: CodingLanguageEnum.JavaScript,
        theme: "monokai",
        allow: true
      },
      styles: newConfig.styles || [],
      image: newConfig.image || {
        enabled: true,
      },
      table: newConfig.table || {
        enabled: true,
      },
      tableRows: newConfig.tableRows || [],
      tableColumns: newConfig.tableColumns || [],
      watermark: newConfig.watermark || {
        enabled: false,
        text: "",
        color: "#00000033",
        opacity: 0.2,
      },
      tableCells: newConfig.tableCells || [],
      codeBlock: newConfig.codeBlock || {
        enabled: true,
      },
      blockquote: newConfig.blockquote || {
        enabled: true,
      },
      codeInline: newConfig.codeInline || {
        enabled: true,
      },
      quote: newConfig.quote || {
        enabled: true,
      },
      todoList: newConfig.todoList || {
        enabled: true,
      },
      orderedTodoList: newConfig.orderedTodoList || {
        enabled: true,
      },
      unorderedTodoList: newConfig.unorderedTodoList || {
        enabled: true,
      },
      color: newConfig.color,
      colorCoding: newConfig.colorCoding || {
        enabled: true,
      },
      highlight: newConfig.highlight || {
        enabled: true,
        colors: {
          color1: "#FFFF00",
          color2: "#FF00FF",
          color3: "#0000FF",
          color4: "#00FFFF",
          color5: "#FFA500",
          color6: "#008000",
          color7: "#FF0000",
          color8: "#800000",
        },
      },
      highlightColor: newConfig.highlightColor || "#FFFF00",

      customSettings: newConfig.customSettings || {},
      documents: newConfig.documents || [],
      includeType: newConfig.includeType || IncludeType.Embed,
    
      includeTitle: newConfig.includeTitle || {
        enabled: true,
      },
      includeContent: newConfig.includeContent || {
        enabled: true,
      },
      includeStatus: newConfig.includeStatus || {
        enabled: true,
      },
      includeAdditionalInfo: newConfig.includeAdditionalInfo || {
        enabled: true,
      },
      headerFooterOptions: newConfig.headerFooterOptions || {
        enabled: true,
        header: {
          enabled: true,
        },
        footer: {
          enabled: true,
        },
      },
      value: newConfig.value || 0,
      userSettings: newConfig.userSettings || {},
      dataVersions: newConfig.dataVersions || [],
      customProperties: newConfig.customProperties || {},
      zoom: newConfig.zoom || {
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
      showRuler: newConfig.showRuler !== undefined ? newConfig.showRuler : true,
      showDocumentOutline:
        newConfig.showDocumentOutline !== undefined
          ? newConfig.showDocumentOutline
          : true,
      showComments:
        newConfig.showComments !== undefined ? newConfig.showComments : true,
      showRevisions:
        newConfig.showRevisions !== undefined ? newConfig.showRevisions : true,
      spellCheck:
        newConfig.spellCheck !== undefined ? newConfig.spellCheck : true,
      grammarCheck:
        newConfig.grammarCheck !== undefined ? newConfig.grammarCheck : true,
      language: newConfig.language || {
        enabled: true,
      },
      bookmarks: newConfig.bookmarks || { enabled: true },
      crossReferences: newConfig.crossReferences || { enabled: true, format: "" },
      footnotes: newConfig.footnotes || { enabled: true, author: "string", format: "" },
      endnotes: newConfig.endnotes || { enabled: true, author: "string",  format: "" },
      revisions: newConfig.revisions || { enabled: true, author: "string", dateFormat: "string" },
      defaultZoomLevel: newConfig.defaultZoomLevel || 100,
      previousMetadata: newConfig.previousMetadata !== undefined ? newConfig.previousMetadata : {},
      currentMetadata: newConfig.currentMetadata !== undefined ? newConfig.currentMetadata : {},
      accessHistory: newConfig.accessHistory !== undefined ? newConfig.accessHistory : [],
      lastModifiedDate: newConfig.lastModifiedDate !== undefined ? newConfig.lastModifiedDate: {} as ModifiedDate,
      tableStyles: newConfig.tableStyles !== undefined ? newConfig.tableStyles : {},
      footnote: newConfig.footnote !== undefined ? newConfig.footnote : { enabled: true, format: "" }
    }));
  },
  setOptions: {} as React.Dispatch<React.SetStateAction<DocumentOptions>>,
  documents: [],
  options: {} as DocumentOptions,
};

const DocumentBuilder: React.FC<DocumentBuilderProps> = ({
  isDynamic,
  options,
  onOptionsChange,
  setOptions,
  documents,
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

  const handleCreateDocument = (userOptions: any) => {
    const documentContent = editorState.getCurrentContent().getPlainText();
    const formattedOptions = getFormattedOptions(userOptions);

    // Call a utility function to create a document (PDF or other formats)
    createPdfDocument(documentContent, formattedOptions);
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
      fontSize: true,
      bold: true,
      italic: true,
      underline: true,
      strike: true,
      code: true,
      link: true,
      image: true,
      audio: true,
      type: {} as DocumentTypeEnum,
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
            onChange={(newState: any) => setEditorState(newState)}
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
              <p>Type: {document.type}</p>
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
        <ToolbarOptions
          isDocumentEditor={true}
          fontSize={true}
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
          Document Visibility:
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
            value={options.animations.type}
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
            value={options.animations.type}
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
        {options.animations.type === "custom" && (
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
      {isDynamic && options.animations.type === "slide" && (
        <button onClick={() => slide(100, "left")}>Slide Left</button>
      )}
      {isDynamic && options.animations.type === "slide" && (
        <button onClick={() => slide(100, "right")}>Slide Right</button>
      )}
      {isDynamic && options.animations.type === "slide" && (
        <button onClick={() => slide(100, "up")}>Slide Up</button>
      )}
      {isDynamic && options.animations.type === "slide" && (
        <button onClick={() => slide(100, "down")}>Slide Down</button>
      )}
      {isDynamic && options.animations.type === "show" && (
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
export type { RevisionOptions };
