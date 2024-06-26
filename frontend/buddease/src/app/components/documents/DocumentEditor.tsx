import {
  BorderStyle,
  DocumentSize,
  ProjectPhaseTypeEnum,
} from "@/app/components/models/data/StatusType";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { UserSettings } from "@/app/configs/UserSettings";
import BackendStructure from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure from "@/app/configs/appStructure/FrontendStructure";
import { DocumentActions } from "@/app/tokens/DocumentActions";
import { Editor } from "draft-js";
import { IHydrateResult } from "mobx-persist";
import React, { SetStateAction, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { options } from "sanitize-html";
import { CodingLanguageEnum, LanguageEnum } from "../communications/LanguageEnum";
import { setCurrentPhase } from "../hooks/phaseHooks/EnhancePhase";
import useErrorHandling from "../hooks/useErrorHandling";
import { ComponentActions } from "../libraries/ui/components/ComponentActions";
import axiosInstance from "../security/csrfToken";
import { AlignmentOptions } from "../state/redux/slices/toolbarSlice";
import useEditorState from "../state/useEditorState";
import AppVersionImpl, {
  AppVersion,
  selectAppVersion,
  selectDatabaseVersion,
} from "../versions/AppVersion";
import Version from "../versions/Version";
import DocumentBuilder, { DocumentData } from "./DocumentBuilder"; // Import the DocumentBuilder component
import { DocumentTypeEnum } from "./DocumentGenerator";
import { DocumentOptions, getDocumentPhase } from "./DocumentOptions";
import { ModifiedDate } from "./DocType";

const DocumentEditor = ({ documentId }: { documentId: DocumentData["id"] }) => {
  const dispatch = useDispatch();
  const [componentName, setComponentName] = useState("");
  const { editorState, handleEditorStateChange } = useEditorState(); // Use the useEditorState hook
  const { handleError } = useErrorHandling(); // Access handleError function from useErrorHandling
  const appVersion = useSelector(selectAppVersion);
  const databaseVersion = useSelector(selectDatabaseVersion);
  const [appVersionObject, setAppVersionObject] = useState<AppVersion | null>(
    null
  ); // Initialize appVersionObject as null

  // Use useEffect to fetch appVersion data when the component mounts
  useEffect(() => {
    const fetchAppVersion = async () => {
      try {
        const response = await axiosInstance.get("/api/appVersion");
        const appVersionData = response.data;

        // Create an instance of AppVersionImpl using the retrieved data
        const newAppVersionObject = new AppVersionImpl(appVersionData);

        // Set the newAppVersionObject in state
        setAppVersionObject(newAppVersionObject);
      } catch (error: any) {
        handleError("Error fetching appVersion data", error);
      }
    };

    fetchAppVersion();
  }, [handleError, setAppVersionObject]); // Add setAppVersionObject to the dependency array
  // Add handleError to the dependency array to ensure it's up to date

  const handleUpdateComponent = () => {
    try {
      // Dispatch an action to update the component
      dispatch(
        ComponentActions.updateComponent({
          id: documentId,
          updatedComponent: { name: componentName },
        })
      );
      // Reset the form after updating the component
      setComponentName("");
    } catch (error: any) {
      // Handle the error using the useErrorHandling hook
      handleError("Error updating component", error);
    }
  };

  return (
    <div>
      <h3>Document Editor</h3>
      <label>
        New Component Name:
        <input
          type="text"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
        />
      </label>
      <button onClick={handleUpdateComponent}>Update Component</button>

      {/* Integrate DocumentBuilder component */}
      <DocumentBuilder
        isDynamic={true}
        version={appVersionObject ? appVersionObject : undefined}
        documentPhase={{
          phaseType: ProjectPhaseTypeEnum.Draft,
          onChange: (phase: ProjectPhaseTypeEnum) => {},
          customProp1: "",
          customProp2: 0,
        }}
        buildDocument={async (
          documentData: DocumentData,
          document: DocumentTypeEnum
        ) => {
          try {
            // Dispatch an action to create a new document
            dispatch(
              DocumentActions.createDocument({
                documentData: documentData,
                document: document,
              })
            );
          } catch (error: any) {
            // Handle the error using the useErrorHandling hook
            handleError("Error creating document", error);
          }
        }}
        onOptionsChange={(options: DocumentOptions) => {
          if (typeof options.documentPhase === "string") {
            setCurrentPhase({
              phaseType: ProjectPhaseTypeEnum[options.documentPhase as keyof typeof ProjectPhaseTypeEnum],
              name: "",
              condition: () => Promise.resolve(true),
              duration: "",
              asyncEffect: async ({
                idleTimeoutId, startIdleTimeout,
              }: {
                idleTimeoutId: NodeJS.Timeout | null;
                startIdleTimeout: (
                  timeoutDuration: number,
                  onTimeout: () => void
                ) => void;
              }) => {
                return () => { };
              },
              customProp1: "",
              customProp2: 0,
              startIdleTimeout: function (timeoutDuration: number, onTimeout: () => void | undefined): void | undefined {
                throw new Error("Function not implemented.");
              }
            });
          } else {
            setCurrentPhase({
              phaseType: ProjectPhaseTypeEnum.Draft,
              name: options.documentPhase.name,
              condition: async () => true, // Example condition
              duration: '0', // Example duration
              asyncEffect: async ({ idleTimeoutId, startIdleTimeout }: { idleTimeoutId: NodeJS.Timeout | null; startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void; }) => {
                return () => { };
              },
              customProp1: "",
              customProp2: 0,
              startIdleTimeout: function (timeoutDuration: number, onTimeout: () => void | undefined): void | undefined {
                throw new Error("Function not implemented.");
              }
            });          }

          options.documentSize = DocumentSize.A4;
          DocumentActions.setOptions({ options });
        }}
        onConfigChange={(config: any) => {
          setCurrentPhase(config.documentPhase);
        }}
        setOptions={options as React.Dispatch<SetStateAction<DocumentOptions>>} // Assuming setOptions is correctly defined elsewhere
        documents={[]}
        options={{
          showRuler: false,
          showDocumentOutline: false,
          showComments: false,
          showRevisions: false,
          spellCheck: false,
          grammarCheck: false,
          bookmarks: false,
          color: "#1a1a1a",
          documentSize: DocumentSize.A4,
          crossReferences: false,
          footnotes: false,
          endnotes: false,
          levels: {
            enabled: false,
            startLevel: 1,
            endLevel: 1,
            format: "{level}",
            separator: ".",
            style: {
              main: "none",
              styles: [
                {
                  format: [],
                  separator: [],
                  style: [
                    {
                      format: [],
                      separator: [],
                      style: [],
                    },
                  ],
                },
              ],
            },
          },
          revisions: {
            enabled: false,
            author: "",
            dataFormat: ""
          },
          previousMetadata: {
            tags: {
              author: "",
              timestamp: new Date(),
              originalPath: "/path/to/file.txt",
              alternatePaths: ["/alternate/path1.txt", "/alternate/path2.txt"],
              fileType: "txt",
              title: "",
              description: "",
              keywords: [],
              authors: [],
              contributors: [],
              publisher: "",
              copyright: "",
              license: "",
              links: [],
              tags: []
            },
          },
          currentMetadata: {
            tags: {
              author: "",
              timestamp: new Date(),
              originalPath: "/path/to/file.txt",
              alternatePaths: ["/alternate/path1.txt", "/alternate/path2.txt"],
              fileType: "txt",
              title: "",
              description: "",
              keywords: [],
              authors: [],
              contributors: [],
              publisher: "",
              copyright: "",
              license: "",
              links: [],
              tags: []
            },
          },
           accessHistory: [],
          lastModifiedDate: {
            value: new Date(),
            isModified: false,
           } as ModifiedDate,

          tableStyles: {},
          highlightColor: "",
          defaultZoomLevel: 100,
          uniqueIdentifier: "",
          language:LanguageEnum.English,
          limit: 0,
          page: 0,
          documentPhase: getDocumentPhase(ProjectPhaseTypeEnum.Draft) || "",
          documentType: DocumentTypeEnum.Document,
          additionalOptions: [],
          isDynamic: true,
          watermark: {
            text: "Confidential",
            color: "#4527A0",
            size: "70",
            x: 0.5,
            y: 0.5,
            rotation: 0,
            enabled: false,
            opacity: 0.2,
            borderStyle: BorderStyle.None,
            fontSize: 0
          },
          headerFooterOptions: {
            showHeader: false,
            showFooter: false,
            headerContent: "",
            footerContent: "",
            differentFirstPage: false,
            differentOddEven: false,
            enabled: false,
            headerOptions: {
              height: {
                type: "custom",
                value: 50,
              },
              margin: {
                top: 30,
                bottom: 30,
                left: 30,
                right: 30,
              },
              alignment: "center",
              font: "Arial",
              fontSize: 16,
              fontFamily: "Arial",
              fontColor: "#000000",

              bold: true,
              italic: false,
              underline: false,
              strikeThrough: false,
            },
            footerOptions: {
              alignment: "center",
              font: "Arial",
              fontSize: 16,
              bold: false,
              italic: false,
              underline: false,

              strikeThrough: false,
              fontFamily: "Arial",
              fontColor: "#000000",
              height: {
                type: "custom",
                value: 50,
              },
              margin: {
                top: 30,
                bottom: 30,
                right: 30,
                left: 30,
              },
            },
          },
          zoom: 100,
          version: Version.create({
            id: 0,
            name: 'Draft Version',
            content: "",
            appVersion: appVersion,
            versionNumber: `${appVersion} (${databaseVersion})`, // Combine app and database versions
            data: [],
            url: "",
            versionHistory: {
              versions: []
            },
            limit: 0,
            description: "",
            checksum: "",
            draft: false,
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
            buildNumber: "",
          }),
          metadata: {} as StructuredMetadata, // Pass metadata
          userIdea: "",
          size: DocumentSize.Letter,
          animations: { type: "slide", duration: 500 },
          margin: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          },
          visibility: "private",
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
          content: "content",
          css: "css",
          html: "html",
          colorCoding: {} as Record<string, string> ,
          customSettings: {},
          documents: [] as DocumentData[],
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
          layout: {} as BackendStructure | FrontendStructure,
          panels: [],
          pageNumbers: true,
          footer: "footer",
          toc: false,
          textStyles: {},
          links: { enabled: true, color: "#0000FF", underline: false },
          embeddedContent: false || { enabled: true, allow: false, language: LanguageEnum.English }, 
          comments: false || { enabled: true, author:"", dateFormat: "" },
          embeddedMedia: false || { enabled: true, allow: true },
          embeddedCode: false || {
            enabled: true,
            allow: true,
            language: CodingLanguageEnum.JavaScript,
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
          footnote: false || { enabled: false, format: "numeric" },
          customProperties: {},
          value: 1,
        }}
      />

      {/* Add Draft.js Editor */}
      <Editor editorState={editorState} onChange={handleEditorStateChange} />
    </div>
  );
};

export default DocumentEditor;
