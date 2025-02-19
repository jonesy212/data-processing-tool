// DocumentSlice.tsx
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { fetchDocumentById, fetchDocumentByIdAPI } from "@/app/api/ApiDocument";
import { ModifiedDate } from "@/app/components/documents/DocType";
import DocumentBuilder, {
    DocumentData, WritableTodoSubtasks
} from "@/app/components/documents/DocumentBuilder";
import {
    DocumentStatusEnum,
    DocumentTypeEnum,
} from "@/app/components/documents/DocumentGenerator";
import { DocumentOptions } from "@/app/components/documents/DocumentOptions";
import { DocumentStatus } from "@/app/components/documents/types";
import useDataExport from "@/app/components/hooks/dataHooks/useDataExport";
import { DocumentSize } from "@/app/components/models/data/StatusType";
import {
    NotificationTypeEnum,
    useNotification,
} from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import Version, { version } from "@/app/components/versions/Version";
import { VersionData } from "@/app/components/versions/VersionData";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { AppStructureItem } from "@/app/configs/appStructure/AppStructure";
import BackendStructure, { backend, backendStructure } from "@/app/configs/appStructure/BackendStructure";
import FrontendStructure, { frontend, frontendStructure } from "@/app/configs/appStructure/FrontendStructure";
import { AppThunk } from "@/app/configs/appThunk";
import { performSearch } from "@/app/pages/searchs/SearchComponent";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Document } from "../../stores/DocumentStore";
import { WritableDraft } from "../ReducerGenerator";
import { RootState } from "./RootSlice";

import DocumentPermissions from "@/app/components/documents/DocumentPermissions";
import { BaseData, Data } from "@/app/components/models/data/Data";
import TodoImpl, { Todo } from "@/app/components/todos/Todo";
import { getCurrentAppInfo } from "@/app/components/versions/VersionGenerator";
import getAppPath from "appPath";
import { ClientInformation } from '@/app/components/database/ClientInformation';
import { K, Meta, T } from '@/app/components/models/data/dataStoreMethods';
import { data } from '@tensorflow/tfjs';
import { globalState } from 'mobx/dist/internal';


const {versionNumber, appVersion} = getCurrentAppInfo()
const API_BASE_URL = getAppPath(versionNumber, appVersion);

interface DocumentSliceState<
  T extends  BaseData<any>, 
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> {
  documentList: DocumentObject<T, K, Meta>[]; // Specify type arguments for DocumentObject
  selectedDocument: DocumentData<T, K, Meta> | null; // Specify type arguments for DocumentData
  filteredDocuments: DocumentData<T, K, Meta>[]; // Specify type arguments for DocumentData
  searchResults: DocumentData<T, K, Meta>[]; // Specify type arguments for DocumentData
  loading: boolean; // Add this line to include the initial state for loading
  error: Error | null; // Add this line to include the initial state for error
  changes?: boolean | string | string[];
  documentBuilder?: typeof DocumentBuilder;
}

const initialDocumentSliceState: DocumentSliceState<BaseData, Meta<T, K<T>>> = {
  documentList: [],
  selectedDocument: null,
  filteredDocuments: [],
  loading: false,
  error: null,
  changes: false,
  searchResults: [],
  documentBuilder: undefined,
};

interface ArtworkItem {
  url: string;
  title: string;
  description?: string;
  creator?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  type?: "image" | "video" | "3D" | "audio";
}


interface DocumentObject<
    T extends  BaseData,
    K extends T = T,
    Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
  >
  extends Document<T, K, Meta>, 
  DocumentData<T, K, Meta>, 
  DocumentSliceState<T, K, Meta> {
  // Optionally add additional fields here if needed
  description?: string | null; // Reintroduce with the original name
  createdBy: string | undefined; // Reintroduce with the original name
  alinkColor: string
  subtasks?: WritableTodoSubtasks;  
  artwork?: ArtworkItem[];
  clientInformation?: ClientInformation; 
  supportedLanguages: string[]
}

interface ViewTransition {
  onStart?: () => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}


function toObject(document: DocumentObject<T, K<T>, StructuredMetadata<T, K<T>>>): object {
  return { ...document };
}


const initialState: DocumentObject<BaseData, BaseData> = {
  // _id: uuidv4(),
  id: "",
  title: "New Document",

  content: {
  id: "",
  title: "",
  description: "",
  subscriberId: "",
  
  category: "",
  categoryProperties: "",
  timestamp: "",
  length: 0,
  
  items: [],
  data: {},
  contentItems: [],
 
  },
  topics: [],
  highlights: [],
  files: [],
  name: "New Document",
  description: "New document description",
  visibility: "Public",
  documentType: DocumentTypeEnum.Other,
  documentStatus: DocumentStatusEnum.Draft,
  documentOwner: "",
  documentCreationDate: new Date(),
  documentLastModifiedDate: new Date(),
  documentVersion: 0,
  documentContent: "",
  keywords: [],
  options: {} as DocumentOptions,
  folderPath: "",
  previousMetadata: {} as StructuredMetadata<T, K<T>>,
  currentMetadata: {} as StructuredMetadata<T, K<T>>,
  accessHistory: [],
  folders: [],
  lastModifiedDate: {} as WritableDraft<ModifiedDate>,
  documentList: [],
  selectedDocument: null,
  filteredDocuments: [],
  loading: false, // Add this line if it's not already present
  error: null,
  changes: false,
  searchResults: [],
  documentBuilder: undefined,
  version: {
    id: 0,
    name: "Initial Version",
    url: "https://example.com/initial_version",
    versionNumber: "1.0",
    appVersion: "v1.0",
    buildNumber: "1",
    description: "Initial version description",
    createdAt: new Date(),
    updatedAt: new Date(),
    content: "Initial version content",
    userId: "user123",
    documentId: "doc123",
    parentId: "",
    parentType: "document",
    parentVersion: "",
    parentTitle: "",
    parentContent: "",
    parentName: "",
    parentUrl: "",
    parentChecksum: "",
    parentMetadata: {},
    parentAppVersion: "",
    parentVersionNumber: "",
    checksum: "abc123",
    isLatest: true,
    isPublished: false,
    publishedAt: null,
    source: "Internal",
    status: "Draft",
    workspaceId: "workspace123",
    workspaceName: "Sample Workspace",
    workspaceType: "Team",
    workspaceUrl: "https://example.com/workspace123",
    workspaceViewers: ["user1", "user2"],
    workspaceAdmins: ["admin1"],
    workspaceMembers: ["user1", "user2", "admin1"],
    frontendStructure: Promise.resolve([]),
    backendStructure: Promise.resolve([]),
    data: [],
    draft: false,
    versions: {
      data: [
        {
        id: 0,
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
          revisionNotes: undefined
        },
        buildVersions: {  // Renamed from 'versions' to 'buildVersions'
          data: undefined,
          backend: undefined,
          frontend: undefined
        },
        checksum: "",
        version: "",
        timestamp: "",
        user: "",
        comments: []
      }
      ],
      
    backend: backendStructure,
    frontend: frontendStructure,
    },
    _structure: {},
    metadata: {
      author: "Author Name",
      timestamp: new Date(),
    },
    getVersion: async () => "1.0",
    versionHistory: {
      versionData: []
    },
    mergeAndHashStructures: async (
      baseStructure, 
      additionalStructure
    ) => {
      return "merged_structure_hash";
    },
    getVersionNumber: () => "1.0",
    updateVersionNumber: (newVersionNumber: string) => {
      console.log(`Updating version number to ${newVersionNumber}`);
    },
    getVersionData: (): VersionData => {
      return {
        id: 0,
        name: "Initial Version",
        url: "https://example.com/initial_version",
        userId: "user123",
        documentId: "doc123",
        draft: false,
        data: [],
        version: version,
        timestamp: new Date(),
        user: "",
        comments: [],
        versionNumber: "1.0",
        parentId: '',
        parentType: '',
        parentVersion: '',
        parentTitle: '',
        parentContent: '',
        parentName: '',
        parentUrl: '',
        parentChecksum: '',
        parentAppVersion: '',
        parentVersionNumber: '',
        isLatest: false,
        isPublished: false,
        publishedAt: null,
        source: '',
        status: '',
        workspaceId: '',
        workspaceName: '',
        workspaceType: '',
        workspaceUrl: '',
        workspaceViewers: [],
        workspaceAdmins: [],
        workspaceMembers: [],
        content: "Initial version content",
        checksum: "abc123",
        metadata: {
          author: "Author Name",
          timestamp: new Date(),
          revisionNotes: undefined,
        },
        versions: {
          data: [],
          backend: {
            traverseDirectory: async () => [],
            getStructure: async () => ({}),
            getStructureAsArray: () => [],
            traverseDirectoryPublic: async () => [],
          },
          frontend: {
            id: "frontend",
            name: "Frontend",
            type: "folder",
            path: "./frontend",
            content: "",
            draft: false,
            permissions: {
              read: true,
              write: true,
              delete: true,
              share: true,
              execute: true,
            },
            items: {},
            getStructureAsArray: async () => [],
            traverseDirectoryPublic: async () => [],
            getStructure: () => ({} as Record<string, AppStructureItem>),
          },
        },
      };
    },
  },
  permissions: new DocumentPermissions(false, false),
  tags: {},
  createdAt: "",
  createdBy: "",
  updatedBy: "",
  documentData: undefined,
  documentPhase: undefined,
  documentSize: DocumentSize.A4,
  lastModifiedBy: "",
  createdDate: undefined,
  document: undefined,
  _rev: "",
  _attachments: undefined,
  _links: undefined,
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
  uploadedBy: "",
  uploadedAt: "",
  tagsOrCategories: "",
  format: "",
  uploadedByTeamId: null,
  uploadedByTeam: null,
  URL: "",
  bgColor: "",
  documentURI: "",
  currentScript: null,
  defaultView: undefined,
  doctype: null,
  ownerDocument: null,
  scrollingElement: null,
  timeline: undefined,
  characterSet: "",
  charset: "",
  compatMode: "",
  contentType: "",
  cookie: "",
  designMode: "",
  dir: "",
  domain: "",
  inputEncoding: "",
  lastModified: "",
  linkColor: "",
  referrer: "",
  vlinkColor: "",
  fullscreen: false,
  fullscreenEnabled: false,
  hidden: false,
  pictureInPictureEnabled: false,
  readyState: "",
  visibilityState: "",
  versionData: undefined,
  rootElement: null
};


function createNewDocument(
  documentId: string
): DocumentObject<T, K, Meta> {
  const newDocument: DocumentObject<T, K, Meta> = {
    // _id: uuidv4(),
    id: documentId,
    title: "New Document",
    content: {
      
      "This is a new document"
    },
    topics: [],
    highlights: [],
    files: [],
    name: "New Document",
    description: "New document description",
    visibility: "Public",
    documentType: DocumentTypeEnum.Other,
    documentStatus: DocumentStatusEnum.Draft,
    documentOwner: "",
    documentCreationDate: new Date(),
    documentLastModifiedDate: new Date(),
    documentVersion: 0,
    documentContent: "",
    keywords: [],
    options: {} as DocumentOptions,
    folderPath: "",
    previousMetadata: {} as WritableDraft<StructuredMetadata>,
    currentMetadata: {} as WritableDraft<StructuredMetadata>,
    accessHistory: [],
    folders: [],
    lastModifiedDate: {} as WritableDraft<ModifiedDate>,
    version: {
      id: 0,
      name: "Initial Version",
      url: "https://example.com/initial_version",
      versionNumber: "1.0",
      appVersion: "v1.0",
      buildNumber: "1",
      description: "Initial version description",
      createdAt: new Date(),
      updatedAt: new Date(),
      content: "Initial version content",
      userId: "user123",
      documentId: "doc123",
      parentId: "",
      parentType: "document",
      parentVersion: "",
      parentTitle: "",
      parentContent: "",
      parentName: "",
      parentUrl: "",
      parentChecksum: "",
      parentMetadata: {},
      parentAppVersion: "",
      parentVersionNumber: "",
      checksum: "abc123",
      isLatest: true,
      isPublished: false,
      publishedAt: null,
      source: "Internal",
      status: "Draft",
      workspaceId: "workspace123",
      workspaceName: "Sample Workspace",
      workspaceType: "Team",
      workspaceUrl: "https://example.com/workspace123",
      workspaceViewers: ["user1", "user2"],
      workspaceAdmins: ["admin1"],
      workspaceMembers: ["user1", "user2", "admin1"],
      frontendStructure: Promise.resolve([]),
      backendStructure: Promise.resolve([]),
      data: [],
      draft: false,
      versions: {
        data: data,
        backend: backend,
        frontend: frontend,
      },
      _structure: {
        // data: [],
        // draft: false,
        // frontendStructure: Promise.resolve([]),
        // backendStructure: Promise.resolve([]),
      },
      metadata: {
        author: "Author Name",
        timestamp: new Date(),
      },
      getVersion: async () => "1.0",
      versionHistory: {
        versionData: []
        // draft: false,
        // frontendStructure: Promise.resolve([]),
        // backendStructure: Promise.resolve([]),
      },
      mergeAndHashStructures: async (baseStructure, additionalStructure) => {
        return "merged_structure_hash";
      },
      getVersionNumber: () => "1.0",
      updateVersionNumber: (newVersionNumber: number) => {
        console.log(`Updating version number to ${newVersionNumber}`);
      },
      getVersionData: (): VersionData => {
        return {
          id: 0,
          name: "Initial Version",
          url: "https://example.com/initial_version",
          userId: "user123",
          documentId: "doc123",
          draft: false,
          data: [],
          versionNumber: "1.0",
          version: version,
          timestamp: new Date(),
          user: "",
          comments: [],
          parentId: '', // Provide appropriate values based on your application logic
          parentType: '', // Provide appropriate values based on your application logic
          parentVersion: '', // Provide appropriate values based on your application logic
          parentTitle: '', // Provide appropriate values based on your application logic
          parentContent: '', // Provide appropriate values based on your application logic
          parentName: '', // Provide appropriate values based on your application logic
          parentUrl: '', // Provide appropriate values based on your application logic
          parentChecksum: '', // Provide appropriate values based on your application logic
          parentAppVersion: '', // Provide appropriate values based on your application logic
          parentVersionNumber: '', // Provide appropriate values based on your application logic
          isLatest: false, // Provide appropriate values based on your application logic
          isPublished: false, // Provide appropriate values based on your application logic
          publishedAt: null, // Provide appropriate values based on your application logic
          source: '', // Provide appropriate values based on your application logic
          status: '', // Provide appropriate values based on your application logic
          workspaceId: '', // Provide appropriate values based on your application logic
          workspaceName: '', // Provide appropriate values based on your application logic
          workspaceType: '', // Provide appropriate values based on your application logic
          workspaceUrl: '', // Provide appropriate values based on your application logic
          workspaceViewers: [], // Provide appropriate values based on your application logic
          workspaceAdmins: [], // Provide appropriate values based on your application logic
          workspaceMembers: [], // Provide appropriate values based on your application logic
          content: "Initial version content",
          checksum: "abc123",
          metadata: {
            author: "Author Name",
            timestamp: new Date(),
            revisionNotes: undefined, // Adjust as per your application logic
          },
          changes: [],
          backend: {}, 
          frontend: {}, 
          versionData: []
        };
      },
    },
    permissions: new DocumentPermissions(true, false),
    versionData: {
      id: 0,
      name: "Initial Version",
      url: "https://example.com/initial_version",
      versionNumber: "1.0",
      version: version,
      timestamp: new Date(),
      user: "",
      comments: [],
      appVersion: "v1.0",
      documentId: "doc123",
      draft: false,
      userId: "user123",
      data: [],
      parentId: '', // Provide appropriate values based on your application logic
      parentType: '', // Provide appropriate values based on your application logic
      parentVersion: '', // Provide appropriate values based on your application logic
      parentTitle: '', // Provide appropriate values based on your application logic
      parentContent: '', // Provide appropriate values based on your application logic
      parentName: '', // Provide appropriate values based on your application logic
      parentUrl: '', // Provide appropriate values based on your application logic
      parentChecksum: '', // Provide appropriate values based on your application logic
      parentAppVersion: '', // Provide appropriate values based on your application logic
      parentVersionNumber: '', // Provide appropriate values based on your application logic
      isLatest: false, // Provide appropriate values based on your application logic
      isPublished: false, // Provide appropriate values based on your application logic
      publishedAt: null, // Provide appropriate values based on your application logic
      source: '', // Provide appropriate values based on your application logic
      status: '', // Provide appropriate values based on your application logic
      workspaceId: '', // Provide appropriate values based on your application logic
      workspaceName: '', // Provide appropriate values based on your application logic
      workspaceType: '', // Provide appropriate values based on your application logic
      workspaceUrl: '', // Provide appropriate values based on your application logic
      workspaceViewers: [], // Provide appropriate values based on your application logic
      workspaceAdmins: [], // Provide appropriate values based on your application logic
      workspaceMembers: [], // Provide appropriate values based on your application logic
      content: "Initial version content",
      checksum: "abc123",
      metadata: {
        author: "Author Name",
        timestamp: new Date(),
        revisionNotes: undefined, // Adjust as per your application logic
      },
      versions: {
        data: {
          frontend: {
            versionNumber: "1.0",
          },
          backend: {
            versionNumber: "1.0",
          },
        },
        backend: {
          id: "backend",
          name: "Backend",
          type: "folder",
          path: "./backend",
          content: "",
          draft: false,
          permissions: {
            read: true,
            write: true,
            delete: true,
            share: true,
            execute: true,
          },
          items: backendStructure.getStructure(),
          getStructureAsArray: backendStructure.getStructureAsArray.bind(backendStructure),
          traverseDirectoryPublic: backendStructure.traverseDirectoryPublic?.bind(backendStructure),
          getStructure: () => backendStructure.getStructure(),
          structureHash, globalState, setDatabaseSchema, getDatabaseSchema,
          setServices, getServices, getStructureHash, setStructureHash,
          updateStructureHash, getStructureHashAndUpdateIfNeeded, backendVersions,
        } as BackendStructure, // Version of the backend
        frontend: {
          id: "frontend",
          name: "Frontend",
          type: "folder",
          path: "./frontend",
          content: "",
          draft: false,
          permissions: {
            read: true,
            write: true,
            delete: true,
            share: true,
            execute: true,
          },
          items: {},
          frontendVersions: [], 
          getStructureAsArray: async () => [],
          traverseDirectoryPublic: async () => [],
          getStructure:  async () => ({} as Record<string, AppStructureItem>),
          getStructureChecksum: async () => ""
        } as FrontendStructure,
      },
    },
    URL: "",
    all: undefined,
    anchors: undefined,
    applets: undefined,
    bgColor: "",
    body: undefined,
    characterSet: "",
    charset: "",
    compatMode: "",
    contentType: "",
    cookie: "",
    currentScript: null,
    defaultView: null,
    designMode: "",
    dir: "",
    doctype: null,
    documentElement: undefined,
    documentURI: "",
    domain: "",
    embeds: undefined,
    forms: undefined,
    fullscreen: false,
    fullscreenEnabled: false,
    head: undefined,
    hidden: false,
    images: undefined,
    implementation: undefined,
    inputEncoding: "",
    lastModified: "",
    linkColor: "",
    links: undefined,
    location: undefined,
    onfullscreenchange: null,
    onfullscreenerror: null,
    onpointerlockchange: null,
    onpointerlockerror: null,
    onreadystatechange: null,
    onvisibilitychange: null,
    ownerDocument: null,
    pictureInPictureEnabled: false,
    plugins: undefined,
    readyState: "loading",
    referrer: "",
    rootElement: null,
    scripts: undefined,
    scrollingElement: null,
    timeline: undefined,
    visibilityState: "hidden",
    vlinkColor: "",
    adoptNode: function <T extends Node>(node: T): T {
      throw new Error("Function not implemented.");
    },
    captureEvents: function (): void {
      throw new Error("Function not implemented.");
    },
    caretRangeFromPoint: function (x: number, y: number): Range | null {
      throw new Error("Function not implemented.");
    },
    clear: function (): void {
      throw new Error("Function not implemented.");
    },
    close: function (): void {
      throw new Error("Function not implemented.");
    },
    createAttribute: function (localName: string): Attr {
      throw new Error("Function not implemented.");
    },
    createAttributeNS: function (namespace: string | null, qualifiedName: string): Attr {
      throw new Error("Function not implemented.");
    },
    createCDATASection: function (data: string): CDATASection {
      throw new Error("Function not implemented.");
    },
    createComment: function (data: string): Comment {
      throw new Error("Function not implemented.");
    },
    createDocumentFragment: function (): DocumentFragment {
      throw new Error("Function not implemented.");
    },
    createElement: function <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions | undefined): HTMLElementTagNameMap[K] {
      throw new Error("Function not implemented.");
    },
    createElementNS: function (namespaceURI: "http://www.w3.org/1999/xhtml", qualifiedName: string): HTMLElement {
      throw new Error("Function not implemented.");
    },
    createEvent: function (eventInterface: "AnimationEvent"): AnimationEvent {
      throw new Error("Function not implemented.");
    },
    createNodeIterator: function (root: Node, whatToShow?: number | undefined, filter?: NodeFilter | null | undefined): NodeIterator {
      throw new Error("Function not implemented.");
    },
    createProcessingInstruction: function (target: string, data: string): ProcessingInstruction {
      throw new Error("Function not implemented.");
    },
    createRange: function (): Range {
      throw new Error("Function not implemented.");
    },
    createTextNode: function (data: string): Text {
      throw new Error("Function not implemented.");
    },
    createTreeWalker: function (root: Node, whatToShow?: number | undefined, filter?: NodeFilter | null | undefined): TreeWalker {
      throw new Error("Function not implemented.");
    },
    execCommand: function (commandId: string, showUI?: boolean | undefined, value?: string | undefined): boolean {
      throw new Error("Function not implemented.");
    },
    exitFullscreen: function (): Promise<void> {
      throw new Error("Function not implemented.");
    },
    exitPictureInPicture: function (): Promise<void> {
      throw new Error("Function not implemented.");
    },
    exitPointerLock: function (): void {
      throw new Error("Function not implemented.");
    },
    getElementById: function (elementId: string): HTMLElement | null {
      throw new Error("Function not implemented.");
    },
    getElementsByClassName: function (classNames: string): HTMLCollectionOf<Element> {
      throw new Error("Function not implemented.");
    },
    getElementsByName: function (elementName: string): NodeListOf<HTMLElement> {
      throw new Error("Function not implemented.");
    },
    getElementsByTagName: function <K extends keyof HTMLElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<HTMLElementTagNameMap[K]> {
      throw new Error("Function not implemented.");
    },
    getElementsByTagNameNS: function (namespaceURI: "http://www.w3.org/1999/xhtml", localName: string): HTMLCollectionOf<HTMLElement> {
      throw new Error("Function not implemented.");
    },
    getSelection: function (): Selection | null {
      throw new Error("Function not implemented.");
    },
    hasFocus: function (): boolean {
      throw new Error("Function not implemented.");
    },
    hasStorageAccess: function (): Promise<boolean> {
      throw new Error("Function not implemented.");
    },
    importNode: function <T extends Node>(node: T, deep?: boolean | undefined): T {
      throw new Error("Function not implemented.");
    },
    open: function (unused1?: string | undefined, unused2?: string | undefined): Document {
      throw new Error("Function not implemented.");
    },
    queryCommandEnabled: function (commandId: string): boolean {
      throw new Error("Function not implemented.");
    },
    queryCommandIndeterm: function (commandId: string): boolean {
      throw new Error("Function not implemented.");
    },
    queryCommandState: function (commandId: string): boolean {
      throw new Error("Function not implemented.");
    },
    queryCommandSupported: function (commandId: string): boolean {
      throw new Error("Function not implemented.");
    },
    queryCommandValue: function (commandId: string): string {
      throw new Error("Function not implemented.");
    },
    releaseEvents: function (): void {
      throw new Error("Function not implemented.");
    },
    requestStorageAccess: function (): Promise<void> {
      throw new Error("Function not implemented.");
    },
    write: function (...text: string[]): void {
      throw new Error("Function not implemented.");
    },
    writeln: function (...text: string[]): void {
      throw new Error("Function not implemented.");
    },
    addEventListener: function <K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void {
      throw new Error("Function not implemented.");
    },
    removeEventListener: function <K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions | undefined): void {
      throw new Error("Function not implemented.");
    },
    startViewTransition: function (cb: () => void | Promise<void>): ViewTransition {
      throw new Error("Function not implemented.");
    },
    baseURI: "",
    childNodes: undefined,
    firstChild: null,
    isConnected: false,
    lastChild: null,
    nextSibling: null,
    nodeName: "",
    nodeType: 0,
    nodeValue: null,
    parentElement: null,
    parentNode: null,
    previousSibling: null,
    textContent: null,
    appendChild: function <T extends Node>(node: T): T {
      throw new Error("Function not implemented.");
    },
    cloneNode: function (deep?: boolean | undefined): Node {
      throw new Error("Function not implemented.");
    },
    compareDocumentPosition: function (other: Node): number {
      throw new Error("Function not implemented.");
    },
    contains: function (other: Node | null): boolean {
      throw new Error("Function not implemented.");
    },
    getRootNode: function (options?: GetRootNodeOptions | undefined): Node {
      throw new Error("Function not implemented.");
    },
    hasChildNodes: function (): boolean {
      throw new Error("Function not implemented.");
    },
    insertBefore: function <T extends Node>(node: T, child: Node | null): T {
      throw new Error("Function not implemented.");
    },
    isDefaultNamespace: function (namespace: string | null): boolean {
      throw new Error("Function not implemented.");
    },
    isEqualNode: function (otherNode: Node | null): boolean {
      throw new Error("Function not implemented.");
    },
    isSameNode: function (otherNode: Node | null): boolean {
      throw new Error("Function not implemented.");
    },
    lookupNamespaceURI: function (prefix: string | null): string | null {
      throw new Error("Function not implemented.");
    },
    lookupPrefix: function (namespace: string | null): string | null {
      throw new Error("Function not implemented.");
    },
    normalize: function (): void {
      throw new Error("Function not implemented.");
    },
    removeChild: function <T extends Node>(child: T): T {
      throw new Error("Function not implemented.");
    },
    replaceChild: function <T extends Node>(node: Node, child: T): T {
      throw new Error("Function not implemented.");
    },
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12,
    DOCUMENT_POSITION_DISCONNECTED: 1,
    DOCUMENT_POSITION_PRECEDING: 2,
    DOCUMENT_POSITION_FOLLOWING: 4,
    DOCUMENT_POSITION_CONTAINS: 8,
    DOCUMENT_POSITION_CONTAINED_BY: 16,
    DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32,
    dispatchEvent: function (event: Event): boolean {
      throw new Error("Function not implemented.");
    },
    activeElement: null,
    adoptedStyleSheets: [],
    fullscreenElement: null,
    pictureInPictureElement: null,
    pointerLockElement: null,
    styleSheets: undefined,
    elementFromPoint: function (x: number, y: number): Element | null {
      throw new Error("Function not implemented.");
    },
    elementsFromPoint: function (x: number, y: number): Element[] {
      throw new Error("Function not implemented.");
    },
    getAnimations: function (): Animation[] {
      throw new Error("Function not implemented.");
    },
    fonts: undefined,
    onabort: null,
    onanimationcancel: null,
    onanimationend: null,
    onanimationiteration: null,
    onanimationstart: null,
    onauxclick: null,
    onbeforeinput: null,
    onbeforetoggle: null,
    onblur: null,
    oncancel: null,
    oncanplay: null,
    oncanplaythrough: null,
    onchange: null,
    onclick: null,
    onclose: null,
    oncontextmenu: null,
    oncopy: null,
    oncuechange: null,
    oncut: null,
    ondblclick: null,
    ondrag: null,
    ondragend: null,
    ondragenter: null,
    ondragleave: null,
    ondragover: null,
    ondragstart: null,
    ondrop: null,
    ondurationchange: null,
    onemptied: null,
    onended: null,
    onerror: null,
    onfocus: null,
    onformdata: null,
    ongotpointercapture: null,
    oninput: null,
    oninvalid: null,
    onkeydown: null,
    onkeypress: null,
    onkeyup: null,
    onload: null,
    onloadeddata: null,
    onloadedmetadata: null,
    onloadstart: null,
    onlostpointercapture: null,
    onmousedown: null,
    onmouseenter: null,
    onmouseleave: null,
    onmousemove: null,
    onmouseout: null,
    onmouseover: null,
    onmouseup: null,
    onpaste: null,
    onpause: null,
    onplay: null,
    onplaying: null,
    onpointercancel: null,
    onpointerdown: null,
    onpointerenter: null,
    onpointerleave: null,
    onpointermove: null,
    onpointerout: null,
    onpointerover: null,
    onpointerup: null,
    onprogress: null,
    onratechange: null,
    onreset: null,
    onresize: null,
    onscroll: null,
    onscrollend: null,
    onsecuritypolicyviolation: null,
    onseeked: null,
    onseeking: null,
    onselect: null,
    onselectionchange: null,
    onselectstart: null,
    onslotchange: null,
    onstalled: null,
    onsubmit: null,
    onsuspend: null,
    ontimeupdate: null,
    ontoggle: null,
    ontransitioncancel: null,
    ontransitionend: null,
    ontransitionrun: null,
    ontransitionstart: null,
    onvolumechange: null,
    onwaiting: null,
    onwebkitanimationend: null,
    onwebkitanimationiteration: null,
    onwebkitanimationstart: null,
    onwebkittransitionend: null,
    onwheel: null,
    childElementCount: 0,
    children: undefined,
    firstElementChild: null,
    lastElementChild: null,
    append: function (...nodes: (string | Node)[]): void {
      throw new Error("Function not implemented.");
    },
    prepend: function (...nodes: (string | Node)[]): void {
      throw new Error("Function not implemented.");
    },
    querySelector: function <K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null {
      throw new Error("Function not implemented.");
    },
    querySelectorAll: function <K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]> {
      throw new Error("Function not implemented.");
    },
    replaceChildren: function (...nodes: (string | Node)[]): void {
      throw new Error("Function not implemented.");
    },
    createExpression: function (expression: string, resolver?: XPathNSResolver | null | undefined): XPathExpression {
      throw new Error("Function not implemented.");
    },
    createNSResolver: function (nodeResolver: Node): Node {
      throw new Error("Function not implemented.");
    },
    evaluate: function (expression: string, contextNode: Node, resolver?: XPathNSResolver | null | undefined, type?: number | undefined, result?: XPathResult | null | undefined): XPathResult {
      throw new Error("Function not implemented.");
    },
    documentSize: DocumentSize.A4,
    lastModifiedBy: "",
    createdBy: "",
    createdDate: undefined,
    _rev: "",
    _attachments: undefined,
    _links: undefined,
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
    uploadedBy: 0,
    uploadedAt: "",
    tagsOrCategories: "",
    format: "",
    uploadedByTeamId: null,
    uploadedByTeam: null,
    documentList: [],
    selectedDocument: null,
    filteredDocuments: [],
    searchResults: [],
    loading: false,
    error: null
  };

  return newDocument;
}



export const restoreDocument = (state: WritableDraft<DocumentSliceState>, action: PayloadAction<number>) => {
  try {
    const documentId = action.payload;
    const newDocument = createNewDocument(String(documentId));
    const newDocumentObject = toObject(newDocument as DocumentObject);
    state.documentList?.push(newDocumentObject as WritableDraft<DocumentObject<T, K, Meta>>);
    
    state.loading = false;  // Update loading state
    state.error = null;  // Clear error state

    useNotification().notify(
      "restoreDocumentSuccess",
      `Restoring document with ID: ${documentId} success`,
      NOTIFICATION_MESSAGES.Document.RESTORE_DOCUMENT_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    );
  } catch (error) {
    console.error("Error restoring document:", error);
    state.loading = false;  // Update loading state
    state.error = error as Error;  // Set error state

    useNotification().notify(
      "restoreDocumentError",
      "Error restoring document",
      NOTIFICATION_MESSAGES.Document.RESTORE_DOCUMENT_ERROR,
      new Date(),
      NotificationTypeEnum.Error
    );
  }
};

interface ExtendedDocumentData extends DocumentData {
  mergeStructures?: (
    baseStructure: StructuredMetadata,
    additionalStructure: StructuredMetadata
  ) => StructuredMetadata;
}

// Define mergeStructures function
const mergeStructures = (
  baseStructure: StructuredMetadata,
  additionalStructure: StructuredMetadata
): StructuredMetadata => {
  // Implement mergeStructures logic here
  // Return the merged structure
  const mergedStructure: StructuredMetadata = {
    ...baseStructure,
    ...additionalStructure,
  };
  return mergedStructure;
};
// Create an async thunk for deleting a document
export const deleteDocumentAsync = createAsyncThunk(
  "document/deleteDocument",
  async (documentId: number) => {
    try {
      // Implement document deletion functionality
      // Simulate deletion with a delay of 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Document deleted successfully");
      return documentId;
    } catch (error) {
      console.error(`Error deleting document with ID ${documentId}:`, error);
      throw error;
    }
  }
);


// Define async function to fetch documents data by IDs
export const fetchDocumentsByIds = async (documentIds: number[]) => {
  try {
    // Perform asynchronous operation to fetch documents data by IDs
    const promises = documentIds.map(async (documentId) => {
      const response = await fetch(`your-api-endpoint/documents/${documentId}`);
      return response.json();
    });

    // Wait for all promises to resolve
    const documentsData = await Promise.all(promises);

    return documentsData;
  } catch (error) {
    // Handle error
    console.error("Error fetching documents by IDs:", error);
    throw error;
  }
};

 
export const downloadDocument = createAsyncThunk(
  "document/downloadDocument",
  async (documentId: number, { rejectWithValue }) => {
    
    try {
      const fetchedDocument = await fetchDocumentByIdAPI(
        documentId,
        (data: WritableDraft<DocumentObject<T, K, Meta>>) => {
          data.status = DocumentStatusEnum.Draft;
          data.type = DocumentTypeEnum.Document;
        }
      );
      return fetchedDocument;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);


// Define thunk action creator for downloading document asynchronously
export const downloadDocumentAsync = createAsyncThunk(
  "document/downloadDocumentAsync",
  async (documentId: number, { dispatch }) => {
    try {
      // Fetch document data based on the document ID
      const fetchedDocument = await fetchDocumentByIdAPI(
        documentId,
        (data: WritableDraft<DocumentObject<T, K, Meta>>) => {
          // Call the dispatch function to update the state with the fetched document data
          dispatch(setDownloadedDocument(data));
        }
      );

      // Dispatch the action to update the state with the fetched document data
      dispatch(setDownloadedDocument(fetchedDocument));

      // Return fetched document as the result
      return fetchedDocument;
    } catch (error) {
      console.error("Error downloading document:", error);
      // Handle error and notify
      useNotification().notify(
        "downloadDocumentError",
        "Error downloading document",
        NOTIFICATION_MESSAGES.Document.DOWNLOAD_DOCUMENT_ERROR,
        new Date(),
        NotificationTypeEnum.Error
      );
      throw error;
    }
  }
);

export const exportDocumentAsync =
  async (document: number): Promise<AppThunk> =>
  async (dispatch) => {
    try {
      // Implement document export functionality

      // Simulate export with a delay of 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Dispatch the action to update the state with the exported document
      dispatch(await exportDocument(document));

      // Return the exported document as the result
      console.log("Document exported successfully");

      return document;
    } catch (error) {
      console.error("Error exporting document:", error);
      // Handle error and notify
      useNotification().notify(
        "exportDocumentError",
        "Error exporting document",
        NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENT_ERROR,
        new Date(),
        NotificationTypeEnum.Error
      );

      throw error;
    }
  };

export const exportDocument =
  async (document: number): Promise<AppThunk> =>
  async (dispatch) => {
    try {
      // Implement document export functionality
      // Simulate export with a delay of 1 second
      await new Promise(async (resolve) => setTimeout(resolve, 1000));
      // Dispatch the action to update the state with the exported document
      dispatch(await exportDocument(document));
    } catch (error) {
      console.error("Error exporting document:", error);
      // Handle error and notify
      useNotification().notify(
        "exportDocumentError",
        "Error exporting document",
        NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENT_ERROR,
        new Date(),
        NotificationTypeEnum.Error
      );
      throw error; // Rethrow the error to be caught by the caller
    }
  };

export const exportDocuments =
  async (documents: {
    payload: typeof documents;
    type: "exportDocuments";
  }): Promise<AppThunk> =>
  async (dispatch) => {
    try {
      // Implement document export functionality
      const { exportedData, exportData } = useDataExport(); // Initialize useDataExport hook

      // Simulate export with a delay of 1 second
      setTimeout(async () => {
        try {
          const exportResult = await exportData(documents); // Export documents using the hook
          console.log("Exported documents:", exportResult);
          dispatch({ type: "exportDocuments", payload: exportedData });
        } catch (error) {
          console.error("Error exporting documents:", error);
          throw error; // Rethrow the error to be caught by the caller
        }
      }, 1000);
    } catch (error) {
      console.error("Error exporting documents:", error);
      // Handle error and notify
      useNotification().notify(
        "exportDocumentsError",
        "Error exporting documents",
        NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_ERROR,
        new Date(),
        NotificationTypeEnum.Error
      );
      throw error; // Rethrow the error to be caught by the caller
    }
  };

// Define the async thunk using createAsyncThunk
// Define the async thunk using createAsyncThunk
export const exportDocumentsAsync = createAsyncThunk(
  "document/exportDocumentsAsync",
  async (documentIds: number[], { dispatch }) => {
    try {
      // Fetch multiple documents based on their IDs
      const documents = await fetchDocumentsByIds(documentIds);

      // Dispatch the action with the entire array of documents as the payload
      dispatch(
        exportDocumentsAsync.fulfilled(
          documents,
          "exportDocuments",
          documentIds,
          undefined
        )
      );

      return documents; // Return the fetched documents as the result
    } catch (error) {
      console.error("Error exporting documents:", error);
      // Handle error and notify
      useNotification().notify(
        "exportDocumentsError",
        "Error exporting documents",
        NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_ERROR,
        new Date(),
        NotificationTypeEnum.Error
      );
      throw error; // Rethrow the error to be caught by the caller
    }
  }
);

// Define the transformations object and applyTransformation function
const applyTransformation = <T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K>>(
  document: WritableDraft<DocumentObject<T, K, Meta>>,
  documentTag: string,
  transformation: (doc: WritableDraft<DocumentObject<T, K, Meta>>, value: string) => void,
  value: string
) => {
  transformation(document, value);
};

const transformations = {
  tag: (document: WritableDraft<DocumentObject<T, K, Meta>>, tag: string) => {
    document.content = `${tag} Tagged: ${document.content}`;
  },

  categorize: (document: WritableDraft<DocumentObject<T, K, Meta>>, category: string) => {
    document.content = `${category} Categorized: ${document.content}`;
  },

  customizeView: (document: WritableDraft<DocumentObject<T, K, Meta>>, view: string) => {
    document.content = `${view} Customized: ${document.content}`;
  },

  comment: (document: WritableDraft<DocumentObject<T, K, Meta>>, comment: string) => {
    document.content = `${comment} Commented: ${document.content}`;
  },

  mention: (document: WritableDraft<DocumentObject<T, K, Meta>>, mention: string) => {
    document.content = `${mention} Mentioned: ${document.content}`;
  },

  assignTask: (document: WritableDraft<DocumentObject<T, K, Meta>>, task: string) => {
    document.content = `${task} Assigned: ${document.content}`;
  },

  requestReview: (document: WritableDraft<DocumentObject<T, K, Meta>>, review: string) => {
    document.content = `${review} Requested: ${document.content}`;
  },

  approve: (document: WritableDraft<DocumentObject<T, K, Meta>>, approval: string) => {
    document.content = `${approval} Approved: ${document.content}`;
  },

  reject: (document: WritableDraft<DocumentObject<T, K, Meta>>, rejection: string) => {
    document.content = `${rejection} Rejected: ${document.content}`;
  },

  provideFeedback: (
    document: WritableDraft<DocumentObject<T, K, Meta>>,
    feedback: string
  ) => {
    document.content = `${feedback} Provided: ${document.content}`;
    // Add any additional customizations here
    
  },

  requestFeedback: (document: WritableDraft<DocumentObject<T, K, Meta>>, review: string) => {
    document.content = `${review} Requested: ${document.content}`;
  },

  resolveFeedback: (
    document: WritableDraft<DocumentObject<T, K, Meta>>,
    feedback: string
  ) => {
    document.content = `${feedback} Resolved: ${document.content}`;
  },

  collaborate: (
    document: WritableDraft<DocumentObject<T, K, Meta>>,
    collaborator: string
  ) => {
    document.content = `${collaborator} Collaborated: ${document.content}`;
  },

  version: (document: WritableDraft<DocumentObject<T, K, Meta>>, version: string) => {
    document.content = `${version} Versioned: ${document.content}`;
  },

  annotate: (document: WritableDraft<DocumentObject<T, K, Meta>>, annotation: string) => {
    document.content = `${annotation} Annotated: ${document.content}`;
  },

  logActivity: (document: WritableDraft<DocumentObject<T, K, Meta>>, activity: string) => {
    document.content = `${activity} Logged: ${document.content}`;
  },

  revert: (document: WritableDraft<DocumentObject<T, K, Meta>>, revert: string) => {
    document.content = `${revert} Reverted: ${document.content}`;
  },

  search: (document: WritableDraft<DocumentObject<T, K, Meta>>, search: string) => {
    document.content = `${search} Searched: ${document.content}`;
  },

  grantAccess: (document: WritableDraft<DocumentObject<T, K, Meta>>, access: string) => {
    document.content = `${access} Access: ${document.content}`;
  },

  viewHistory: (document: WritableDraft<DocumentObject<T, K, Meta>>, view: string) => {
    document.content = `${view} Viewed: ${document.content}`;
  },

  compare: (document: WritableDraft<DocumentObject<T, K, Meta>>, compare: string) => {
    document.content = `${compare} Compared: ${document.content}`;
  },

  revokeAccess: (document: WritableDraft<DocumentObject<T, K, Meta>>, access: string) => {
    document.content = `${access} Access: ${document.content}`;
  },

  managePermissions: (
    document: WritableDraft<DocumentObject<T, K, Meta>>,
    permissions: string
  ) => {
    // Add permission transformation logic
    document.content = `${permissions} Permissions Managed: ${document.content}`;
  },

  initiateWorkflow: (
    document: WritableDraft<DocumentObject<T, K, Meta>>,
    workflow: string
  ) => {
    document.content = `${workflow} Initiated: ${document.content}`;
  },

  automateTasks: (document: WritableDraft<DocumentObject<T, K, Meta>>, tasks: string) => {
    document.content = `${tasks} Automated: ${document.content}`;
  },

  triggerEvents: (document: WritableDraft<DocumentObject<T, K, Meta>>, events: string) => {
    document.content = `${events} Triggered: ${document.content}`;
  },

  approvalWorkflow: (
    document: WritableDraft<DocumentObject<T, K, Meta>>,
    workflow: string
  ) => {
    document.content = `${workflow} Approved: ${document.content}`;
  },

  lifecycleManagement: (
    document: WritableDraft<DocumentObject<T, K, Meta>>,
    lifecycle: string
  ) => {
    document.content = `${lifecycle} Lifecycle: ${document.content}`;
  },

  connectWithExternalSystem: (
    document: WritableDraft<DocumentObject<T, K, Meta>>,
    externalSystem: string
  ) => {
    document.content = `${externalSystem} Connected: ${document.content}`;
  },

  synchronizeWithCloudStorage: (
    document: WritableDraft<DocumentObject<T, K, Meta>>,
    cloudStorage: string
  ) => {
    document.content = `${cloudStorage} Synchronized: ${document.content}`;
  },

  importFromExternalSource: (
    document: WritableDraft<DocumentObject<T, K, Meta>>,
    externalSource: string
  ) => {
    document.content = `${externalSource} Imported: ${document.content}`;
  },

  exportToExternalSystem: (
    document: WritableDraft<DocumentObject<T, K, Meta>>,
    externalSystem: string
  ) => {
    document.content = `${externalSystem} Exported: ${document.content}`;
  },

  generateReport: (document: WritableDraft<DocumentObject<T, K, Meta>>, report: string) => {
    document.content = `${report} Generated: ${document.content}`;
  },

  exportReport: (document: WritableDraft<DocumentObject<T, K, Meta>>, report: string) => {
    document.content = `${report} Exported: ${document.content}`;
  },

  scheduleReportGeneration: (
    document: WritableDraft<DocumentObject<T, K, Meta>>,
    report: string
  ) => {
    document.content = `${report} Scheduled: ${document.content}`;
  },

  customizeReportSettings: (
    document: WritableDraft<DocumentObject<T, K, Meta>>,
    report: string
  ) => {
    document.content = `${report} Customized: ${document.content}`;
  },

  backupDocuments: (document: WritableDraft<DocumentObject<T, K, Meta>>, backup: string) => {
    document.content = `${backup} Backed up: ${document.content}`;
  },

  retrieveBackup: (document: WritableDraft<DocumentObject<T, K, Meta>>, backup: string) => {
    document.content = `${backup} Retrieved: ${document.content}`;
  },

  redaction: (document: WritableDraft<DocumentObject<T, K, Meta>>, redaction: string) => {
    document.content = `${redaction} Redacted: ${document.content}`;
  },

  accessControls: (document: WritableDraft<DocumentObject<T, K, Meta>>, access: string) => {
    document.content = `${access} Access: ${document.content}`;
  },

  templates: (document: WritableDraft<DocumentObject<T, K, Meta>>, template: string) => {
    document.content = `${template} Templates: ${document.content}`;
  },

  updateDocumentVersion: (
    document: WritableDraft<DocumentObject<T, K, Meta>>,
    version: string
  ) => {
    document.content = `${version} Version updated: ${document.content}`;
  },

  getDocumentVersion: (
    document: WritableDraft<DocumentData>,
    version: string
  ) => {
    document.content = `${version} Version retrieved: ${document.content}`;
  },
};

// function createNewDocument(documentId: string): DocumentObject {
//   return {
//     _id: uuidv4(),
//     id: documentId,
//     title: "New Document",
//     content: "",
//     topics: [],
//     highlights: [],
//     files: [],
//     name: "New Document",
//     description: "New document description",
//     visibility: "Public",
//     documentType: DocumentTypeEnum.Other,
//     documentStatus: DocumentStatusEnum.Draft,
//     documentOwner: "",
//     documentCreationDate: new Date(),
//     documentLastModifiedDate: new Date(),
//     documentVersion: 0,
//     documentContent: "",
//     keywords: [],
//     options: {} as DocumentOptions,
//     folderPath: "",
//     previousMetadata: {} as WritableDraft<StructuredMetadata>,
//     currentMetadata: {} as WritableDraft<StructuredMetadata>,
//     accessHistory: [],
//     folders: [],
//     lastModifiedDate: {} as WritableDraft<ModifiedDate>,
//     version: {
//       id: 0,
//       name: "Initial Version",
//       url: "https://example.com/initial_version",
//       versionNumber: "1.0",
//       appVersion: "v1.0",
//       buildNumber: "1",
//       description: "Initial version description",
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       content: "Initial version content",
//       userId: "user123",
//       documentId: "doc123",
//       parentId: "",
//       parentType: "document",
//       parentVersion: "",
//       parentTitle: "",
//       parentContent: "",
//       parentName: "",
//       parentUrl: "",
//       parentChecksum: "",
//       parentMetadata: {},
//       parentAppVersion: "",
//       parentVersionNumber: "",
//       checksum: "abc123",
//       isLatest: true,
//       isPublished: false,
//       publishedAt: null,
//       source: "Internal",
//       status: "Draft",
//       workspaceId: "workspace123",
//       workspaceName: "Sample Workspace",
//       workspaceType: "Team",
//       workspaceUrl: "https://example.com/workspace123",
//       workspaceViewers: ["user1", "user2"],
//       workspaceAdmins: ["admin1"],
//       workspaceMembers: ["user1", "user2", "admin1"],
//       frontendStructure: Promise.resolve([]),
//       backendStructure: Promise.resolve([]),
//       data: [],
//       draft: false,
//       versions: {
//         data: data,
//         backend: backend,
//         frontend: frontend,
//       },
//       _structure: {
//         // data: [],
//         // draft: false,
//         // frontendStructure: Promise.resolve([]),
//         // backendStructure: Promise.resolve([]),
//       },
//       metadata: {
//         author: "Author Name",
//         timestamp: new Date(),
//       },
//       getVersion: async () => "1.0",
//       versionHistory: {
//         versions: [],
//       },
//       mergeAndHashStructures: async (baseStructure, additionalStructure) => {
//         return "merged_structure_hash";
//       },
//       getVersionNumber: () => "1.0",
//       updateVersionNumber: (newVersionNumber) => {
//         console.log(`Updating version number to ${newVersionNumber}`);
//       },
      
//       getVersionData: (): VersionData => {
//         return {
//           id: 0,
//           name: "Initial Version",
//           url: "https://example.com/initial_version",
//           userId: "user123",
//           documentId: "doc123",
//           draft: false,
//           data: [],
//           versionNumber: "1.0",
//           parentId: '', // Provide appropriate values based on your application logic
//           parentType: '', // Provide appropriate values based on your application logic
//           parentVersion: '', // Provide appropriate values based on your application logic
//           parentTitle: '', // Provide appropriate values based on your application logic
//           parentContent: '', // Provide appropriate values based on your application logic
//           parentName: '', // Provide appropriate values based on your application logic
//           parentUrl: '', // Provide appropriate values based on your application logic
//           parentChecksum: '', // Provide appropriate values based on your application logic
//           parentAppVersion: '', // Provide appropriate values based on your application logic
//           parentVersionNumber: '', // Provide appropriate values based on your application logic
//           isLatest: false, // Provide appropriate values based on your application logic
//           isPublished: false, // Provide appropriate values based on your application logic
//           publishedAt: null, // Provide appropriate values based on your application logic
//           source: '', // Provide appropriate values based on your application logic
//           status: '', // Provide appropriate values based on your application logic
//           workspaceId: '', // Provide appropriate values based on your application logic
//           workspaceName: '', // Provide appropriate values based on your application logic
//           workspaceType: '', // Provide appropriate values based on your application logic
//           workspaceUrl: '', // Provide appropriate values based on your application logic
//           workspaceViewers: [], // Provide appropriate values based on your application logic
//           workspaceAdmins: [], // Provide appropriate values based on your application logic
//           workspaceMembers: [], // Provide appropriate values based on your application logic
//           content: "Initial version content",
//           checksum: "abc123",
//           metadata: {
//             author: "Author Name",
//             timestamp: new Date(),
//             revisionNotes: undefined, // Adjust as per your application logic
//           },
//           versions: {
//             data: {
//               frontend: {
//                 versionNumber: "1.0",
//               },
//               backend: {
//                 versionNumber: "1.0",
//               },
//             },
//             backend: {
//               structure: {},
//               traverseDirectory: traverseBackendDirectory,
//               getStructure: () => {
//                 return (
//                   options?.backendStructure?.getStructure() ||
//                   Promise.resolve({})
//                 );
//               },
//               getStructureAsArray: getStructureAsArray,
//             }, // Version of the backend
//             frontend: {
//               id: "frontend",
//               name: "Frontend",
//               type: "folder",
//               path: "./frontend",
//               content: "",
//               draft: false,
//               permissions: {
//                 read: true,
//                 write: true,
//                 delete: true,
//                 share: true,
//                 execute: true,
//               },
//               items: {},
//             } as FrontendStructure, // Version of the frontend
//           },
//         };
//       },
//     },
//     // updateVersionHistory: () => {
//     //   console.log("Updating version history");
//     // },
//     // generateChecksum: () => {
//     //   return "abc123";
//     // },
//     // compare: () => 0,
//     // parse: () => [],
//     // isValid: () => true,
//     // generateHash: (appVersion: AppVersion) => {
//     //   return "hash_value";
//     // },
//     // isNewer: () => false,
//     // hashStructure: () => {
//     //   return "structure_hash";
//     // },
//     // getStructureHash: async () => {
//     //   return "structure_hash";
//     // },
//     // getContent: () => "Initial version content",
//     // setContent: (content: Content) => {
//     //   console.log(`Setting content to: ${content}`);
//     // },

   

//     // generateStructureHash: async () => {
//     //   // Implement generateStructureHash logic here
//     //   // Return the generated structure hash
//     //   return "generated_structure_hash"; // Example: returning a mock hash
//     // },

//     permissions: new DocumentPermissions(true, false),
//     versionData: {
//       id: 0,
//       name: "Initial Version",
//       url: "https://example.com/initial_version",
//       versionNumber: "1.0",
//       // appVersion: "v1.0",
//       documentId: "doc123",
//       draft: false,
//       userId: "user123",
//       data: [],
//       parentId: '', // Provide appropriate values based on your application logic
//       parentType: '', // Provide appropriate values based on your application logic
//       parentVersion: '', // Provide appropriate values based on your application logic
//       parentTitle: '', // Provide appropriate values based on your application logic
//       parentContent: '', // Provide appropriate values based on your application logic
//       parentName: '', // Provide appropriate values based on your application logic
//       parentUrl: '', // Provide appropriate values based on your application logic
//       parentChecksum: '', // Provide appropriate values based on your application logic
//       parentAppVersion: '', // Provide appropriate values based on your application logic
//       parentVersionNumber: '', // Provide appropriate values based on your application logic
//       isLatest: false, // Provide appropriate values based on your application logic
//       isPublished: false, // Provide appropriate values based on your application logic
//       publishedAt: null, // Provide appropriate values based on your application logic
//       source: '', // Provide appropriate values based on your application logic
//       status: '', // Provide appropriate values based on your application logic
//       workspaceId: '', // Provide appropriate values based on your application logic
//       workspaceName: '', // Provide appropriate values based on your application logic
//       workspaceType: '', // Provide appropriate values based on your application logic
//       workspaceUrl: '', // Provide appropriate values based on your application logic
//       workspaceViewers: [], // Provide appropriate values based on your application logic
//       workspaceAdmins: [], // Provide appropriate values based on your application logic
//       workspaceMembers: [], // Provide appropriate values based on your application logic
//       content: "Initial version content",
//       checksum: "abc123",
//       metadata: {
//         author: "Author Name",
//         timestamp: new Date(),
//         revisionNotes: undefined, // Adjust as per your application logic
//       },
//       versions: {
//         data: {
//           frontend: {
//             versionNumber: "1.0",
//           },
//           backend: {
//             versionNumber: "1.0",
//           },
//         },
//         backend: {
//           structure: {
//             traverseDirectory: {
//               id: "traverseDirectory",
//               name: "Traverse Directory",
//               type: "folder",
//               path: "./",
//               content: "",
//               draft: false,
//               permissions: {
//                 read: true,
//                 write: true,
//                 delete: true,
//                 share: true,
//                 execute: true,
//               },
//               items: {
//                 "1": {
//                   id: "1",
//                   name: "Item 1",
//                   type: "file",
//                   path: "./item1.txt",
//                   content: "Item 1 content",
//                   draft: false,
//                   permissions: {
//                     read: true,
//                     write: true,
//                     delete: true,
//                     share: true,
//                     execute: true,
//                   },
//                 },
//               },
//             },
//           },
//           getStructure: () => {
//             return (
//               options?.backendStructure?.getStructure() || Promise.resolve({})
//             );
//           },
//           traverseDirectory: traverseBackendDirectory,
//           getStructureAsArray: getStructureAsArray
//         }, // Version of the backend
//         frontend: {
//           id: "frontend",
//           name: "Frontend",
//           type: "folder",
//           path: "./frontend",
//           content: "",
//           draft: false,
//           permissions: {
//             read: true,
//             write: true,
//             delete: true,
//             share: true,
//             execute: true,
//           },
//           items: await frontendStructure.getStructure(),
//           getStructureAsArray: frontendStructure.getStructureAsArray.bind(frontendStructure),
//           traverseDirectoryPublic: frontendStructure.traverseDirectoryPublic?.bind(frontendStructure),
//           getStructure: () => frontendStructure.getStructure(),
//         }, // Version of the frontend
//       },
//     },
//   } as DocumentObject;;
//   return produce(initialDocumentSliceState, (draftState) => {
//     return { ...draftState };
//   });
// };

// Create a slice for managing document-related data
export const useDocumentManagerSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    createDocument: {
      reducer: (state, action: PayloadAction<WritableDraft<DocumentObject<T, K, Meta>>>) => {
        state.selectedDocument = action.payload;
        state.documentList?.push(action.payload);
      },
      prepare: () => {
        // Generate a new document with default values
        const newDocument: WritableDraft<DocumentObject<T, K, Meta>> = {
          _id: "i989adn8dd",
          id: Math.floor(Math.random() * 1000).toString(), // Generate a unique ID
          title: "New Document",
          content: "", // Add default content if needed
          topics: [], // Add default topics if needed
          highlights: [], // Add default highlights if needed
          files: [], // Add default files if needed
          createdAt: new Date(), 
          updatedBy: "Mattt Smooth", 
          documentPhase: "",
          createdByRenamed: "",
          document: {} as WritableDraft<DocumentObject<T, K, Meta>>,
          documentList: [],

          // Add other properties as needed
          keywords: [],
          options: {} as WritableDraft<DocumentOptions>,
          folderPath: "",
          previousMetadata: {} as WritableDraft<StructuredMetadata>,
          currentMetadata: {} as WritableDraft<StructuredMetadata>,
          accessHistory: [],
          folders: [],
          lastModifiedDate: {} as WritableDraft<ModifiedDate>,
          version: undefined,
          versionData: undefined,
          permissions: undefined,
          visibility: undefined,
          documentSize: DocumentSize.A4,
          lastModifiedBy: "",
          name: "",
          description: "",
          createdBy: "",
          createdDate: undefined,
          documentType: "",
          _rev: "",
          _attachments: undefined,
          _links: undefined,
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
          uploadedBy: 0,
          uploadedAt: "",
          tagsOrCategories: "",
          format: "",
          uploadedByTeamId: null,
          uploadedByTeam: null,
          URL: "",
          alinkColor: "",
          all: undefined,
          anchors: undefined,
          applets: undefined,
          bgColor: "",
          body: undefined,
          characterSet: "",
          charset: "",
          compatMode: "",
          contentType: "",
          cookie: "",
          currentScript: null,
          defaultView: null,
          designMode: "",
          dir: "",
          doctype: null,
          documentElement: undefined,
          documentURI: "",
          domain: "",
          embeds: undefined,
          // fgColor: "",
          forms: undefined,
          fullscreen: false,
          fullscreenEnabled: false,
          head: undefined,
          hidden: false,
          images: undefined,
          implementation: undefined,
          inputEncoding: "",
          lastModified: "",
          linkColor: "",
          links: undefined,
          location: undefined,
          onfullscreenchange: null,
          onfullscreenerror: null,
          onpointerlockchange: null,
          onpointerlockerror: null,
          onreadystatechange: null,
          onvisibilitychange: null,
          ownerDocument: null,
          pictureInPictureEnabled: false,
          plugins: undefined,
          readyState: "loading",
          referrer: "",
          rootElement: null,
          scripts: undefined,
          scrollingElement: null,
          timeline: undefined,
          visibilityState: "hidden",
          vlinkColor: "",
          // adoptNode: function <T extends Node>(node: T): T {
          //   throw new Error("Function not implemented.");
          // },
          // captureEvents: function (): void {
          //   throw new Error("Function not implemented.");
          // },
          // caretRangeFromPoint: function (x: number, y: number): Range | null {
          //   throw new Error("Function not implemented.");
          // },
          // clear: function (): void {
          //   throw new Error("Function not implemented.");
          // },
          // close: function (): void {
          //   throw new Error("Function not implemented.");
          // },
          // createAttribute: function (localName: string): Attr {
          //   throw new Error("Function not implemented.");
          // },
          // createAttributeNS: function (namespace: string | null, qualifiedName: string): Attr {
          //   throw new Error("Function not implemented.");
          // },
          // createCDATASection: function (data: string): CDATASection {
          //   throw new Error("Function not implemented.");
          // },
          // createComment: function (data: string): Comment {
          //   throw new Error("Function not implemented.");
          // },
          // createDocumentFragment: function (): DocumentFragment {
          //   throw new Error("Function not implemented.");
          // },
          // createElement: function <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions | undefined): HTMLElementTagNameMap[K] {
          //   throw new Error("Function not implemented.");
          // },
          // createElementNS: function (namespaceURI: "http://www.w3.org/1999/xhtml", qualifiedName: string): HTMLElement {
          //   throw new Error("Function not implemented.");
          // },
          // createEvent: function (eventInterface: "AnimationEvent"): AnimationEvent {
          //   throw new Error("Function not implemented.");
          // },
          // createNodeIterator: function (root: Node, whatToShow?: number | undefined, filter?: NodeFilter | null | undefined): NodeIterator {
          //   throw new Error("Function not implemented.");
          // },
          // createProcessingInstruction: function (target: string, data: string): ProcessingInstruction {
          //   throw new Error("Function not implemented.");
          // },
          // createRange: function (): Range {
          //   throw new Error("Function not implemented.");
          // },
          // createTextNode: function (data: string): Text {
          //   throw new Error("Function not implemented.");
          // },
          // createTreeWalker: function (root: Node, whatToShow?: number | undefined, filter?: NodeFilter | null | undefined): TreeWalker {
          //   throw new Error("Function not implemented.");
          // },
          // execCommand: function (commandId: string, showUI?: boolean | undefined, value?: string | undefined): boolean {
          //   throw new Error("Function not implemented.");
          // },
          // exitFullscreen: function (): Promise<void> {
          //   throw new Error("Function not implemented.");
          // },
          // exitPictureInPicture: function (): Promise<void> {
          //   throw new Error("Function not implemented.");
          // },
          // exitPointerLock: function (): void {
          //   throw new Error("Function not implemented.");
          // },
          // getElementById: function (elementId: string): HTMLElement | null {
          //   throw new Error("Function not implemented.");
          // },
          // getElementsByClassName: function (classNames: string): HTMLCollectionOf<Element> {
          //   throw new Error("Function not implemented.");
          // },
          // getElementsByName: function (elementName: string): NodeListOf<HTMLElement> {
          //   throw new Error("Function not implemented.");
          // },
          // getElementsByTagName: function <K extends keyof HTMLElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<HTMLElementTagNameMap[K]> {
          //   throw new Error("Function not implemented.");
          // },
          // getElementsByTagNameNS: function (namespaceURI: "http://www.w3.org/1999/xhtml", localName: string): HTMLCollectionOf<HTMLElement> {
          //   throw new Error("Function not implemented.");
          // },
          // getSelection: function (): Selection | null {
          //   throw new Error("Function not implemented.");
          // },
          // hasFocus: function (): boolean {
          //   throw new Error("Function not implemented.");
          // },
          // hasStorageAccess: function (): Promise<boolean> {
          //   throw new Error("Function not implemented.");
          // },
          // importNode: function <T extends Node>(node: T, deep?: boolean | undefined): T {
          //   throw new Error("Function not implemented.");
          // },
          // open: function (unused1?: string | undefined, unused2?: string | undefined): Document {
          //   throw new Error("Function not implemented.");
          // },
          // queryCommandEnabled: function (commandId: string): boolean {
          //   throw new Error("Function not implemented.");
          // },
          // queryCommandIndeterm: function (commandId: string): boolean {
          //   throw new Error("Function not implemented.");
          // },
          // queryCommandState: function (commandId: string): boolean {
          //   throw new Error("Function not implemented.");
          // },
          // queryCommandSupported: function (commandId: string): boolean {
          //   throw new Error("Function not implemented.");
          // },
          // queryCommandValue: function (commandId: string): string {
          //   throw new Error("Function not implemented.");
          // },
          // releaseEvents: function (): void {
          //   throw new Error("Function not implemented.");
          // },
          // requestStorageAccess: function (): Promise<void> {
          //   throw new Error("Function not implemented.");
          // },
          // write: function (...text: string[]): void {
          //   throw new Error("Function not implemented.");
          // },
          // writeln: function (...text: string[]): void {
          //   throw new Error("Function not implemented.");
          // },
          // addEventListener: function <K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void {
          //   throw new Error("Function not implemented.");
          // },
          // removeEventListener: function <K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions | undefined): void {
          //   throw new Error("Function not implemented.");
          // },
          // startViewTransition: function (cb: () => void | Promise<void>): ViewTransition {
          //   throw new Error("Function not implemented.");
          // },
          // baseURI: "",
          // childNodes: undefined,
          // firstChild: null,
          // isConnected: false,
          // lastChild: null,
          // nextSibling: null,
          // nodeName: "",
          // nodeType: 0,
          // nodeValue: null,
          // parentElement: null,
          // parentNode: null,
          // previousSibling: null,
          // textContent: null,
          // appendChild: function <T extends Node>(node: T): T {
          //   throw new Error("Function not implemented.");
          // },
          // cloneNode: function (deep?: boolean | undefined): Node {
          //   throw new Error("Function not implemented.");
          // },
          // compareDocumentPosition: function (other: Node): number {
          //   throw new Error("Function not implemented.");
          // },
          // contains: function (other: Node | null): boolean {
          //   throw new Error("Function not implemented.");
          // },
          // getRootNode: function (options?: GetRootNodeOptions | undefined): Node {
          //   throw new Error("Function not implemented.");
          // },
          // hasChildNodes: function (): boolean {
          //   throw new Error("Function not implemented.");
          // },
          // insertBefore: function <T extends Node>(node: T, child: Node | null): T {
          //   throw new Error("Function not implemented.");
          // },
          // isDefaultNamespace: function (namespace: string | null): boolean {
          //   throw new Error("Function not implemented.");
          // },
          // isEqualNode: function (otherNode: Node | null): boolean {
          //   throw new Error("Function not implemented.");
          // },
          // isSameNode: function (otherNode: Node | null): boolean {
          //   throw new Error("Function not implemented.");
          // },
          // lookupNamespaceURI: function (prefix: string | null): string | null {
          //   throw new Error("Function not implemented.");
          // },
          // lookupPrefix: function (namespace: string | null): string | null {
          //   throw new Error("Function not implemented.");
          // },
          // normalize: function (): void {
          //   throw new Error("Function not implemented.");
          // },
          // removeChild: function <T extends Node>(child: T): T {
          //   throw new Error("Function not implemented.");
          // },
          // replaceChild: function <T extends Node>(node: Node, child: T): T {
          //   throw new Error("Function not implemented.");
          // },
          // ELEMENT_NODE: 1,
          // ATTRIBUTE_NODE: 2,
          // TEXT_NODE: 3,
          // CDATA_SECTION_NODE: 4,
          // ENTITY_REFERENCE_NODE: 5,
          // ENTITY_NODE: 6,
          // PROCESSING_INSTRUCTION_NODE: 7,
          // COMMENT_NODE: 8,
          // DOCUMENT_NODE: 9,
          // DOCUMENT_TYPE_NODE: 10,
          // DOCUMENT_FRAGMENT_NODE: 11,
          // NOTATION_NODE: 12,
          // DOCUMENT_POSITION_DISCONNECTED: 1,
          // DOCUMENT_POSITION_PRECEDING: 2,
          // DOCUMENT_POSITION_FOLLOWING: 4,
          // DOCUMENT_POSITION_CONTAINS: 8,
          // DOCUMENT_POSITION_CONTAINED_BY: 16,
          // DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32,
          // dispatchEvent: function (event: Event): boolean {
          //   throw new Error("Function not implemented.");
          // },
          // activeElement: null,
          // adoptedStyleSheets: [],
          // fullscreenElement: null,
          // pictureInPictureElement: null,
          // pointerLockElement: null,
          // styleSheets: undefined,
          // elementFromPoint: function (x: number, y: number): Element | null {
          //   throw new Error("Function not implemented.");
          // },
          // elementsFromPoint: function (x: number, y: number): Element[] {
          //   throw new Error("Function not implemented.");
          // },
          // getAnimations: function (): Animation[] {
          //   throw new Error("Function not implemented.");
          // },
          // fonts: undefined,
          // onabort: null,
          // onanimationcancel: null,
          // onanimationend: null,
          // onanimationiteration: null,
          // onanimationstart: null,
          // onauxclick: null,
          // onbeforeinput: null,
          // onbeforetoggle: null,
          // onblur: null,
          // oncancel: null,
          // oncanplay: null,
          // oncanplaythrough: null,
          // onchange: null,
          // onclick: null,
          // onclose: null,
          // oncontextmenu: null,
          // oncopy: null,
          // oncuechange: null,
          // oncut: null,
          // ondblclick: null,
          // ondrag: null,
          // ondragend: null,
          // ondragenter: null,
          // ondragleave: null,
          // ondragover: null,
          // ondragstart: null,
          // ondrop: null,
          // ondurationchange: null,
          // onemptied: null,
          // onended: null,
          // onerror: null,
          // onfocus: null,
          // onformdata: null,
          // ongotpointercapture: null,
          // oninput: null,
          // oninvalid: null,
          // onkeydown: null,
          // onkeypress: null,
          // onkeyup: null,
          // onload: null,
          // onloadeddata: null,
          // onloadedmetadata: null,
          // onloadstart: null,
          // onlostpointercapture: null,
          // onmousedown: null,
          // onmouseenter: null,
          // onmouseleave: null,
          // onmousemove: null,
          // onmouseout: null,
          // onmouseover: null,
          // onmouseup: null,
          // onpaste: null,
          // onpause: null,
          // onplay: null,
          // onplaying: null,
          // onpointercancel: null,
          // onpointerdown: null,
          // onpointerenter: null,
          // onpointerleave: null,
          // onpointermove: null,
          // onpointerout: null,
          // onpointerover: null,
          // onpointerup: null,
          // onprogress: null,
          // onratechange: null,
          // onreset: null,
          // onresize: null,
          // onscroll: null,
          // onscrollend: null,
          // onsecuritypolicyviolation: null,
          // onseeked: null,
          // onseeking: null,
          // onselect: null,
          // onselectionchange: null,
          // onselectstart: null,
          // onslotchange: null,
          // onstalled: null,
          // onsubmit: null,
          // onsuspend: null,
          // ontimeupdate: null,
          // ontoggle: null,
          // ontransitioncancel: null,
          // ontransitionend: null,
          // ontransitionrun: null,
          // ontransitionstart: null,
          // onvolumechange: null,
          // onwaiting: null,
          // onwebkitanimationend: null,
          // onwebkitanimationiteration: null,
          // onwebkitanimationstart: null,
          // onwebkittransitionend: null,
          // onwheel: null,
          // childElementCount: 0,
          // children: undefined,
          // firstElementChild: null,
          // lastElementChild: null,
          // append: function (...nodes: (string | Node)[]): void {
          //   throw new Error("Function not implemented.");
          // },
          // prepend: function (...nodes: (string | Node)[]): void {
          //   throw new Error("Function not implemented.");
          // },
          // querySelector: function <K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null {
          //   throw new Error("Function not implemented.");
          // },
          // querySelectorAll: function <K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]> {
          //   throw new Error("Function not implemented.");
          // },
          // replaceChildren: function (...nodes: (string | Node)[]): void {
          //   throw new Error("Function not implemented.");
          // },
          // createExpression: function (expression: string, resolver?: XPathNSResolver | null | undefined): XPathExpression {
          //   throw new Error("Function not implemented.");
          // },
          // createNSResolver: function (nodeResolver: Node): Node {
          //   throw new Error("Function not implemented.");
          // },
          // evaluate: function (expression: string, contextNode: Node, resolver?: XPathNSResolver | null | undefined, type?: number | undefined, result?: XPathResult | null | undefined): XPathResult {
          //   throw new Error("Function not implemented.");
          // },
          documents: [],
          selectedDocument: null,
          filteredDocuments: [],
          searchResults: [],
          loading: false,
          error: null
        };
        return { payload: newDocument };
      },
    },

    setDocuments: (
      state,
      action: PayloadAction<WritableDraft<DocumentObject[]>>
    ) => {
      state.documentList = action.payload;
      // TODO: Add logic to filter documents
      state.filteredDocuments = state.documentList;
      state.loading = false;
      state.error = null;
      return { payload: state };
      
    },

    setDownloadedDocument: (
      state,
      action: PayloadAction<WritableDraft<DocumentData>>
    ) => {
      state.selectedDocument = action.payload;
    },

    addDocument: (
      state,
      action: PayloadAction<WritableDraft<DocumentObject<T, K, Meta>>>
    ) => {
      state.documentList?.push(action.payload);
    },

    addDocumentSuccess: (state, action: PayloadAction<{ id: string; title: string; documentList: WritableDraft<DocumentObject<T, K, Meta>>[]  }>) => {
      const documentIndex = state.documentList?.findIndex(doc => doc.id === action.payload.id);
      if (documentIndex !== -1) {
        state.documentList![documentIndex!].title = action.payload.title;
      } else {
        // Optionally handle case where document is not found
        state.documentList?.push({
          id: action.payload.id,
          title: action.payload.title,
          _id: action.payload._id,
          documentList: action.payload.documentList,
          createdBy, _rev, createdAt,

          content: action.payload.content,
          permissions: action.payload.permissions,
          folders: action.payload.folders,
          options: action.payload.options,
          folderPath: action.payload.folderPath,
          previousMetadata: action.payload.previousMetadata,
          currentMetadata: action.payload.currentMetadata,
          accessHistory: action.payload.accessHistory,
          createdAt: action.payload.createdAt,
          updatedBy: action.payload.updatedBy,
          documentPhase: action.payload.documentPhase,
          createdByRenamed: action.payload.createdByRenamed,
          lastModifiedDate: action.payload.lastModifiedDate,
          versionData: action.payload.versionData,
          version: action.payload.version,
          document: action.payload.document,
          // documentList: action.payload.documentList,
          visibility: action.payload.visibility,
          documentSize: action.payload.documentListize,
          lastModifiedBy: action.payload.lastModifiedBy,
          name: action.payload.name,
          // description: action.payload.description,
          // createdBy: action.payload.createdBy,
          createdDate: action.payload.createdDate,
          documentType: action.payload.documentType,
          // _rev: action.payload._rev,
          // _attachments: action.payload._attachments,
          // _links: action.payload._links,
          // _etag: action.payload._etag,
          // _local: action.payload._local,
          // _revs: action.payload._revs,
          // _source: action.payload._source,
          // _shards: action.payload._shards,
          // _size: action.payload._size,
          // _version: action.payload._version,
          // _version_conflicts: action.payload._version_conflicts,
          // _seq_no: action.payload._seq_no,
          // _primary_term: action.payload._primary_term,
          // _routing: action.payload._routing,
          // _parent: action.payload._parent,
          // _parent_as_child: action.payload._parent_as_child,
          // _slices: action.payload._slices,
          // _highlight: action.payload._highlight,
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
          uploadedBy: 0,
          uploadedAt: "",
          tagsOrCategories: "",
          format: "",
          uploadedByTeamId: null,
          uploadedByTeam: null,
          URL: "",
          alinkColor: "",
          all: undefined,
          anchors: undefined,
          applets: undefined,
          bgColor: "",
          body: undefined,
          characterSet: "",
          charset: "",
          compatMode: "",
          contentType: "",
          cookie: "",
          currentScript: null,
          defaultView: null,
          designMode: "",
          dir: "",
          doctype: null,
          documentElement: undefined,
          documentURI: "",
          domain: "",
          embeds: undefined,
          // fgColor: "",
          forms: undefined,
          fullscreen: false,
          fullscreenEnabled: false,
          head: undefined,
          hidden: false,
          images: undefined,
          implementation: undefined,
          inputEncoding: "",
          lastModified: "",
          linkColor: "",
          links: undefined,
          location: undefined,
          onfullscreenchange: null,
          onfullscreenerror: null,
          onpointerlockchange: null,
          onpointerlockerror: null,
          onreadystatechange: null,
          onvisibilitychange: null,
          ownerDocument: null,
          pictureInPictureEnabled: false,
          plugins: undefined,
          readyState: "loading",
          referrer: "",
          rootElement: null,
          scripts: undefined,
          scrollingElement: null,
          timeline: undefined,
          visibilityState: "hidden",
          vlinkColor: "",
        
          documents: [],
          selectedDocument: null,
          filteredDocuments: [],
          searchResults: [],
          loading: false,
          error: null
        });
      }
    },

    selectDocument: (state, action: PayloadAction<number>) => {
      state.selectedDocument =
        state.documentList?.find((doc) => doc.id === action.payload.toString()) ||
        null;
    },

    clearSelectedDocument: (state) => {
      state.selectedDocument = null;
    },

    setExportedDocuments: (
      state,
      action: PayloadAction<WritableDraft<DocumentObject[]>>
    ) => {
      state.documentList = action.payload;
    },

    setFilteredDocuments: (
      state,
      action: PayloadAction<WritableDraft<DocumentData[]>>
    ) => {
      state.filteredDocuments = action.payload;
    },

    setDocumentStatus: (
      state,
      action: PayloadAction<{ id: string; status: DocumentStatus }>
    ) => {
      const { id, status } = action.payload;
      const documentIndex = state.documentList?.findIndex((doc) => doc.id === id);
      if (documentIndex !== -1) {
        state.documentList?[documentIndex].status = status : null;
      } else {
        console.log("Document not found");
      }
      console.log("Document status update functionality enabled");
      // Additional logic...
    },

    updateDocument: (state, action: PayloadAction<Partial<DocumentData>>) => {
      const { id, ...updates } = action.payload;
      const existingDocument = state.documentList?.find((doc) => doc.id === id);
      if (existingDocument) {
        Object.assign(existingDocument, updates);
      } else {
        console.log("Document not found");
      }
      console.log("Document update functionality enabled");
      // Additional logic...
    },

    deleteDocument: (state, action: PayloadAction<string>) => {
      const documentIndex = state.documentList?.findIndex(
        (doc) => doc.id === action.payload
      );
      if (documentIndex !== -1) {
        state.documentList?.splice(documentIndex!, 1);
        useNotification().notify(
          "deleteDocumentSuccess",
          "Document deleted successfully",
          NOTIFICATION_MESSAGES.Document.DELETE_DOCUMENT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } else {
        useNotification().notify(
          "deleteDocumentError",
          `There was an error deleting the document with ID ${action.payload}, try again later`,
          NOTIFICATION_MESSAGES.Document.DELETE_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },

    filterDocuments: (state, action: PayloadAction<string>) => {
      try {
        // Implement document filtering functionality
        const filterKeyword = action.payload.toLowerCase();
        state.filteredDocuments = state.documentList?.filter(
          (doc) =>
            (typeof doc.title === "string" &&
              doc.title.toLowerCase().includes(filterKeyword)) ||
            (typeof doc.description === "string" &&
              doc.description.toLowerCase().includes(filterKeyword))
        );
        useNotification().notify(
          "filterDocumentsSuccess",
          `Filtering documents by keyword: ${filterKeyword} success`,
          NOTIFICATION_MESSAGES.Document.FILTER_DOCUMENTS_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error filtering documents:", error);
        useNotification().notify(
          "filterDocumentsError",
          "Error filtering documents",
          NOTIFICATION_MESSAGES.Document.FILTER_DOCUMENTS_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },

    sortDocuments: (state, action: PayloadAction<string>) => {
      try {
        // Implement document sorting functionality
        const sortKey = action.payload as keyof DocumentData; // Type assertion
        state.documentList?.sort((a, b) => {
          if (a[sortKey]! < b[sortKey]!) return -1; // Use optional chaining (!) to handle possible null or undefined values
          if (a[sortKey]! > b[sortKey]!) return 1; // Use optional chaining (!) to handle possible null or undefined values
          return 0;
        });
        useNotification().notify(
          "sortDocumentsSuccess",
          `Sorting documents by sort key: ${String(sortKey)} success`,
          NOTIFICATION_MESSAGES.Document.SORT_DOCUMENT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error sorting documents:", error);
        useNotification().notify(
          "sortDocumentsError",
          "Error sorting documents",
          NOTIFICATION_MESSAGES.Document.SORT_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },

    shareDocument: (
      state,
      action: PayloadAction<{ documentId: number; recipients: string[] }>
    ) => {
      try {
        // Implement document sharing functionality
        const { documentId, recipients } = action.payload;
        const documentToShare = state.documentList?.find(
          (doc) => doc.id === documentId.toString()
        );
        if (documentToShare) {
          useNotification().notify(
            "shareDocumentSuccess",
            NOTIFICATION_MESSAGES.Document.SHARE_DOCUMENT_SUCCESS,
            `Sharing document "${
              documentToShare.title
            }" with recipients: ${recipients.join(", ")}`,
            new Date(),
            NotificationTypeEnum.DocumentEditID
          );
          // Additional logic for sharing document with recipients...
        } else {
          useNotification().notify(
            "shareDocumentError",
            "Document not found",
            NOTIFICATION_MESSAGES.Document.DOCUMENT_NOT_FOUND,
            new Date(),
            NotificationTypeEnum.Error
          );
        }
      } catch (error) {
        console.error("Error sharing document:", error);
        useNotification().notify(
          "shareDocumentError",
          "Error sharing document",
          NOTIFICATION_MESSAGES.Document.SHARE_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },

    downloadDocument: (state, action: PayloadAction<number>) => {
      // Implement document download functionality
      const documentIndex = state.documentList?.findIndex(
        (doc) => doc.id === action.payload.toString()
      );
      if (documentIndex !== -1) {
        useNotification().notify(
          "downloadDocumentSuccess",
          "Document downloaded successfully",
          NOTIFICATION_MESSAGES.Document.DOWNLOAD_DOCUMENT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
        // Additional logic for downloading document...
      } else {
        useNotification().notify(
          "downloadDocumentError",
          `There was an error downloading the document with ID ${action.payload}, try again later`,
          NOTIFICATION_MESSAGES.Document.DOWNLOAD_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
      return state;
    },

    exportDocument: (state, action: PayloadAction<number>) => {
      // Implement document export functionality
      const documentIndex = state.documentList?.findIndex(
        (doc) => doc.id === action.payload.toString()
      );
      if (documentIndex !== -1) {
        useNotification().notify(
          "exportDocumentSuccess",
          "Document exported successfully",
          NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
        // Additional logic for exporting document...
      } else {
        useNotification().notify(
          "exportDocumentError",
          `There was an error exporting the document with ID ${action.payload}, try again later`,
          NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },

    exportDocuments: (
      state: WritableDraft<DocumentSliceState>,
      action: PayloadAction<{ payload: any; type: string }>
    ) => {
      try {
        // Implement document export functionality
        const { documentList, selectedDocument } = state;
        const { payload } = action; // Destructure payload from action

        if (typeof payload === "number") {
          const documentIndex = documentList.findIndex(
            (doc) => doc.id === payload
          );

          if (documentIndex !== -1) {
            useNotification().notify(
              "exportDocumentsSuccess",
              "Exporting documents success",
              NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_SUCCESS,
              new Date(),
              NotificationTypeEnum.OperationSuccess
            );
            // Additional logic for exporting documentList...
            return;
          } else {
            useNotification().notify(
              "exportDocumentsError",
              `There was an error exporting the document with ID ${payload}, try again later`,
              NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_ERROR,
              new Date(),
              NotificationTypeEnum.Error
            );
          }
        }
        // If selectedDocument is a number, export the document with that ID
        if (typeof selectedDocument === "number") {
          const documentIndex = documentList.findIndex(
            (doc) => doc.id === selectedDocument
          );

          if (documentIndex !== -1) {
            useNotification().notify(
              "exportDocumentsSuccess",
              "Exporting documents success",
              NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_SUCCESS,
              new Date(),
              NotificationTypeEnum.OperationSuccess
            );
            // Additional logic for exporting documentList...
            return;
          } else {
            useNotification().notify(
              "exportDocumentsError",
              `There was an error exporting the document with ID ${selectedDocument}, try again later`,
              NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_ERROR,
              new Date(),
              NotificationTypeEnum.Error
            );
          }
          // Additional logic for exporting documentList...
        }

        // Assuming implementation here...
        useNotification().notify(
          "exportDocumentsSuccess",
          "Exporting documents success",
          NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error exporting documents:", error);
        useNotification().notify(
          "exportDocumentsError",
          "Error exporting documents",
          NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },

    importDocuments: (state, action: PayloadAction<File>) => {
      try {
        const importedFile = action.payload;
        // Implement document import functionality
        // Assuming implementation here...
        useNotification().notify(
          "importDocumentsSuccess",
          "Importing documents success",
          NOTIFICATION_MESSAGES.Document.IMPORT_DOCUMENTS_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error importing documents:", error);
        useNotification().notify(
          "importDocumentsError",
          "Error importing documents",
          NOTIFICATION_MESSAGES.Document.IMPORT_DOCUMENTS_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },

    archiveDocument: (state, action: PayloadAction<number>) => {
      try {
        const documentId = action.payload;
        // Implement document archiving functionality
        // Assuming implementation here...
        useNotification().notify(
          "archiveDocumentSuccess",
          `Archiving document with ID: ${documentId} success`,
          NOTIFICATION_MESSAGES.Document.ARCHIVE_DOCUMENT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error archiving document:", error);
        useNotification().notify(
          "archiveDocumentError",
          "Error archiving document",
          NOTIFICATION_MESSAGES.Document.ARCHIVE_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },

    fetchDocumentFromArchive: (state, action: PayloadAction<number>) => {
      try {
        const documentId = action.payload;
        // Update state with the fetched document
        state.documentList?.push({
          _id: "fetchedArchive",
          id: documentId.toString(),
          title: "",
          content: "",
          topics: [],
          highlights: [],
          files: [],
          keywords: [],
          options: {} as WritableDraft<DocumentOptions>,
          folderPath: "New Folder",
          previousMetadata: {} as WritableDraft<StructuredMetadata>,
          currentMetadata: {} as WritableDraft<StructuredMetadata>,
          accessHistory: [],
          folders: [],
          lastModifiedDate: {} as ModifiedDate, // Updated type
          version: {} as WritableDraft<Version>,
          versionData: {} as WritableDraft<VersionData>,
          permissions: {
            getReadAccess: () => true,
            setReadAccess: () => true,
            getWriteAccess: () => false,
            setWriteAccess: () => false,
            getReadWriteAccess: () => false,
            setReadWriteAccess: () => false,
            _readAccess: true,
          },
          visibility: undefined,
          documentSize: DocumentSize.A4,
          lastModifiedBy: "",
          name: "",
          description: "",
          createdBy: "",
          createdDate: undefined,
          documentType: "",
          _rev: "",
          _attachments: undefined,
          _links: undefined,
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
          uploadedBy: 0,
          uploadedAt: "",
          tagsOrCategories: "",
          format: "",
          uploadedByTeamId: null,
          uploadedByTeam: null,
          all: null,
          anchors: undefined,
          applets: undefined,
          bgColor: "",
          body: undefined,
          characterSet: "",
          charset: "",
          compatMode: "",
          contentType: "",
          cookie: "",
          currentScript: null,
          defaultView: null,
          designMode: "",
          dir: "",
          doctype: null,
          documentElement: undefined,
          documentURI: "",
          domain: "",
          embeds: undefined,
          fgColor: "",
          forms: undefined,
          fullscreen: false,
          fullscreenEnabled: false,
          head: undefined,
          hidden: false,
          images: undefined,
          implementation: undefined,
          inputEncoding: "",
          lastModified: "",
          linkColor: "",
          links: undefined,
          location: undefined,
          onfullscreenchange: null,
          onfullscreenerror: null,
          onpointerlockchange: null,
          onpointerlockerror: null,
          onreadystatechange: null,
          onvisibilitychange: null,
          ownerDocument: null,
          pictureInPictureEnabled: false,
          plugins: undefined,
          readyState: "loading",
          referrer: "",
          rootElement: null,
          scripts: undefined,
          scrollingElement: null,
          timeline: undefined,
          visibilityState: "hidden",
          vlinkColor: "",
          adoptNode: function <T extends Node>(node: T): T {
            throw new Error("Function not implemented.");
          },
          captureEvents: function (): void {
            throw new Error("Function not implemented.");
          },
          caretRangeFromPoint: function (x: number, y: number): Range | null {
            throw new Error("Function not implemented.");
          },
          clear: function (): void {
            throw new Error("Function not implemented.");
          },
          close: function (): void {
            throw new Error("Function not implemented.");
          },
          createAttribute: function (localName: string): Attr {
            throw new Error("Function not implemented.");
          },
          createAttributeNS: function (namespace: string | null, qualifiedName: string): Attr {
            throw new Error("Function not implemented.");
          },
          createCDATASection: function (data: string): CDATASection {
            throw new Error("Function not implemented.");
          },
          createComment: function (data: string): Comment {
            throw new Error("Function not implemented.");
          },
          createDocumentFragment: function (): DocumentFragment {
            throw new Error("Function not implemented.");
          },
          createElement: function <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions | undefined): HTMLElementTagNameMap[K] {
            throw new Error("Function not implemented.");
          },
          createElementNS: function (namespaceURI: "http://www.w3.org/1999/xhtml", qualifiedName: string): HTMLElement {
            throw new Error("Function not implemented.");
          },
          createEvent: function (eventInterface: "AnimationEvent"): AnimationEvent {
            throw new Error("Function not implemented.");
          },
          createNodeIterator: function (root: Node, whatToShow?: number | undefined, filter?: NodeFilter | null | undefined): NodeIterator {
            throw new Error("Function not implemented.");
          },
          createProcessingInstruction: function (target: string, data: string): ProcessingInstruction {
            throw new Error("Function not implemented.");
          },
          createRange: function (): Range {
            throw new Error("Function not implemented.");
          },
          createTextNode: function (data: string): Text {
            throw new Error("Function not implemented.");
          },
          createTreeWalker: function (root: Node, whatToShow?: number | undefined, filter?: NodeFilter | null | undefined): TreeWalker {
            throw new Error("Function not implemented.");
          },
          execCommand: function (commandId: string, showUI?: boolean | undefined, value?: string | undefined): boolean {
            throw new Error("Function not implemented.");
          },
          exitFullscreen: function (): Promise<void> {
            throw new Error("Function not implemented.");
          },
          exitPictureInPicture: function (): Promise<void> {
            throw new Error("Function not implemented.");
          },
          exitPointerLock: function (): void {
            throw new Error("Function not implemented.");
          },
          getElementById: function (elementId: string): HTMLElement | null {
            throw new Error("Function not implemented.");
          },
          getElementsByClassName: function (classNames: string): HTMLCollectionOf<Element> {
            throw new Error("Function not implemented.");
          },
          getElementsByName: function (elementName: string): NodeListOf<HTMLElement> {
            throw new Error("Function not implemented.");
          },
          getElementsByTagName: function <K extends keyof HTMLElementTagNameMap>(qualifiedName: K): HTMLCollectionOf<HTMLElementTagNameMap[K]> {
            throw new Error("Function not implemented.");
          },
          getElementsByTagNameNS: function (namespaceURI: "http://www.w3.org/1999/xhtml", localName: string): HTMLCollectionOf<HTMLElement> {
            throw new Error("Function not implemented.");
          },
          getSelection: function (): Selection | null {
            throw new Error("Function not implemented.");
          },
          hasFocus: function (): boolean {
            throw new Error("Function not implemented.");
          },
          hasStorageAccess: function (): Promise<boolean> {
            throw new Error("Function not implemented.");
          },
          importNode: function <T extends Node>(node: T, deep?: boolean | undefined): T {
            throw new Error("Function not implemented.");
          },
          open: function (unused1?: string | undefined, unused2?: string | undefined): Document {
            throw new Error("Function not implemented.");
          },
          queryCommandEnabled: function (commandId: string): boolean {
            throw new Error("Function not implemented.");
          },
          queryCommandIndeterm: function (commandId: string): boolean {
            throw new Error("Function not implemented.");
          },
          queryCommandState: function (commandId: string): boolean {
            throw new Error("Function not implemented.");
          },
          queryCommandSupported: function (commandId: string): boolean {
            throw new Error("Function not implemented.");
          },
          queryCommandValue: function (commandId: string): string {
            throw new Error("Function not implemented.");
          },
          releaseEvents: function (): void {
            throw new Error("Function not implemented.");
          },
          requestStorageAccess: function (): Promise<void> {
            throw new Error("Function not implemented.");
          },
          write: function (...text: string[]): void {
            throw new Error("Function not implemented.");
          },
          writeln: function (...text: string[]): void {
            throw new Error("Function not implemented.");
          },
          addEventListener: function <K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void {
            throw new Error("Function not implemented.");
          },
          removeEventListener: function <K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions | undefined): void {
            throw new Error("Function not implemented.");
          },
          startViewTransition: function (cb: () => void | Promise<void>): ViewTransition {
            throw new Error("Function not implemented.");
          },
          baseURI: "",
          childNodes: undefined,
          firstChild: null,
          isConnected: false,
          lastChild: null,
          nextSibling: null,
          nodeName: "",
          nodeType: 0,
          nodeValue: null,
          parentElement: null,
          parentNode: null,
          previousSibling: null,
          textContent: null,
          appendChild: function <T extends Node>(node: T): T {
            throw new Error("Function not implemented.");
          },
          cloneNode: function (deep?: boolean | undefined): Node {
            throw new Error("Function not implemented.");
          },
          compareDocumentPosition: function (other: Node): number {
            throw new Error("Function not implemented.");
          },
          contains: function (other: Node | null): boolean {
            throw new Error("Function not implemented.");
          },
          getRootNode: function (options?: GetRootNodeOptions | undefined): Node {
            throw new Error("Function not implemented.");
          },
          hasChildNodes: function (): boolean {
            throw new Error("Function not implemented.");
          },
          insertBefore: function <T extends Node>(node: T, child: Node | null): T {
            throw new Error("Function not implemented.");
          },
          isDefaultNamespace: function (namespace: string | null): boolean {
            throw new Error("Function not implemented.");
          },
          isEqualNode: function (otherNode: Node | null): boolean {
            throw new Error("Function not implemented.");
          },
          isSameNode: function (otherNode: Node | null): boolean {
            throw new Error("Function not implemented.");
          },
          lookupNamespaceURI: function (prefix: string | null): string | null {
            throw new Error("Function not implemented.");
          },
          lookupPrefix: function (namespace: string | null): string | null {
            throw new Error("Function not implemented.");
          },
          normalize: function (): void {
            throw new Error("Function not implemented.");
          },
          removeChild: function <T extends Node>(child: T): T {
            throw new Error("Function not implemented.");
          },
          replaceChild: function <T extends Node>(node: Node, child: T): T {
            throw new Error("Function not implemented.");
          },
          ELEMENT_NODE: 1,
          ATTRIBUTE_NODE: 2,
          TEXT_NODE: 3,
          CDATA_SECTION_NODE: 4,
          ENTITY_REFERENCE_NODE: 5,
          ENTITY_NODE: 6,
          PROCESSING_INSTRUCTION_NODE: 7,
          COMMENT_NODE: 8,
          DOCUMENT_NODE: 9,
          DOCUMENT_TYPE_NODE: 10,
          DOCUMENT_FRAGMENT_NODE: 11,
          NOTATION_NODE: 12,
          DOCUMENT_POSITION_DISCONNECTED: 1,
          DOCUMENT_POSITION_PRECEDING: 2,
          DOCUMENT_POSITION_FOLLOWING: 4,
          DOCUMENT_POSITION_CONTAINS: 8,
          DOCUMENT_POSITION_CONTAINED_BY: 16,
          DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32,
          dispatchEvent: function (event: Event): boolean {
            throw new Error("Function not implemented.");
          },
          activeElement: null,
          adoptedStyleSheets: [],
          fullscreenElement: null,
          pictureInPictureElement: null,
          pointerLockElement: null,
          styleSheets: undefined,
          elementFromPoint: function (x: number, y: number): Element | null {
            throw new Error("Function not implemented.");
          },
          elementsFromPoint: function (x: number, y: number): Element[] {
            throw new Error("Function not implemented.");
          },
          getAnimations: function (): Animation[] {
            throw new Error("Function not implemented.");
          },
          fonts: undefined,
          onabort: null,
          onanimationcancel: null,
          onanimationend: null,
          onanimationiteration: null,
          onanimationstart: null,
          onauxclick: null,
          onbeforeinput: null,
          onbeforetoggle: null,
          onblur: null,
          oncancel: null,
          oncanplay: null,
          oncanplaythrough: null,
          onchange: null,
          onclick: null,
          onclose: null,
          oncontextmenu: null,
          oncopy: null,
          oncuechange: null,
          oncut: null,
          ondblclick: null,
          ondrag: null,
          ondragend: null,
          ondragenter: null,
          ondragleave: null,
          ondragover: null,
          ondragstart: null,
          ondrop: null,
          ondurationchange: null,
          onemptied: null,
          onended: null,
          onerror: null,
          onfocus: null,
          onformdata: null,
          ongotpointercapture: null,
          oninput: null,
          oninvalid: null,
          onkeydown: null,
          onkeypress: null,
          onkeyup: null,
          onload: null,
          onloadeddata: null,
          onloadedmetadata: null,
          onloadstart: null,
          onlostpointercapture: null,
          onmousedown: null,
          onmouseenter: null,
          onmouseleave: null,
          onmousemove: null,
          onmouseout: null,
          onmouseover: null,
          onmouseup: null,
          onpaste: null,
          onpause: null,
          onplay: null,
          onplaying: null,
          onpointercancel: null,
          onpointerdown: null,
          onpointerenter: null,
          onpointerleave: null,
          onpointermove: null,
          onpointerout: null,
          onpointerover: null,
          onpointerup: null,
          onprogress: null,
          onratechange: null,
          onreset: null,
          onresize: null,
          onscroll: null,
          onscrollend: null,
          onsecuritypolicyviolation: null,
          onseeked: null,
          onseeking: null,
          onselect: null,
          onselectionchange: null,
          onselectstart: null,
          onslotchange: null,
          onstalled: null,
          onsubmit: null,
          onsuspend: null,
          ontimeupdate: null,
          ontoggle: null,
          ontransitioncancel: null,
          ontransitionend: null,
          ontransitionrun: null,
          ontransitionstart: null,
          onvolumechange: null,
          onwaiting: null,
          onwebkitanimationend: null,
          onwebkitanimationiteration: null,
          onwebkitanimationstart: null,
          onwebkittransitionend: null,
          onwheel: null,
          childElementCount: 0,
          children: undefined,
          firstElementChild: null,
          lastElementChild: null,
          append: function (...nodes: (string | Node)[]): void {
            throw new Error("Function not implemented.");
          },
          prepend: function (...nodes: (string | Node)[]): void {
            throw new Error("Function not implemented.");
          },
          querySelector: function <K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null {
            throw new Error("Function not implemented.");
          },
          querySelectorAll: function <K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]> {
            throw new Error("Function not implemented.");
          },
          replaceChildren: function (...nodes: (string | Node)[]): void {
            throw new Error("Function not implemented.");
          },
          createExpression: function (expression: string, resolver?: XPathNSResolver | null | undefined): XPathExpression {
            throw new Error("Function not implemented.");
          },
          createNSResolver: function (nodeResolver: Node): Node {
            throw new Error("Function not implemented.");
          },
          evaluate: function (expression: string, contextNode: Node, resolver?: XPathNSResolver | null | undefined, type?: number | undefined, result?: XPathResult | null | undefined): XPathResult {
            throw new Error("Function not implemented.");
          },
          documents: [],
          selectedDocument: null,
          filteredDocuments: [],
          searchResults: [],
          loading: false,
          error: null
        });
        // Assuming implementation here...
        useNotification().notify(
          "fetchDocumentFromArchiveSuccess",
          `Fetching document with ID: ${documentId} success`,
          NOTIFICATION_MESSAGES.Document.FETCH_DOCUMENT_FROM_ARCHIVE_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error fetching document from archive:", error);
        useNotification().notify(
          "fetchDocumentFromArchiveError",
          "Error fetching document from archive",
          NOTIFICATION_MESSAGES.Document.FETCH_DOCUMENT_FROM_ARCHIVE_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },
    
//  restoreDocument:( state, action: PayloadAction<number>) => {
//   try {
//     const documentId = action.payload;
//     // Implement document restoring functionality
//     const newDocument = createNewDocument(String(documentId));
//     const newDocumentObject = toObject(newDocument as DocumentObject); // Convert the new document to a plain object
//     state.documentList?.push(newDocumentObject as WritableDraft<DocumentObject<T, K, Meta>>); // Add the new document object to the state array

//     // Notify success
//     useNotification().notify(
//       "restoreDocumentSuccess",
//       `Restoring document with ID: ${documentId} success`,
//       NOTIFICATION_MESSAGES.Document.RESTORE_DOCUMENT_SUCCESS,
//       new Date(),
//       NotificationTypeEnum.OperationSuccess
//     );
//   } catch (error) {
//     console.error("Error restoring document:", error);
//     // Notify error
//     useNotification().notify(
//       "restoreDocumentError",
//       "Error restoring document",
//       NOTIFICATION_MESSAGES.Document.RESTORE_DOCUMENT_ERROR,
//       new Date(),
//       NotificationTypeEnum.Error
//     );
//   }
//     },

    moveDocument: (
      state,
      action: PayloadAction<{ documentId: number; destinationId: number }>
    ) => {
      try {
        const { documentId, destinationId } = action.payload;
        // Implement document moving functionality
        const documentIndex = state.documentList?.findIndex(
          (doc) => doc.id === documentId.toString()
        );
        if (documentIndex !== -1) {
          const movedDocument = state.documentList?.splice(documentIndex!, 1)[0];
          const destinationIndex = state.documentList?.findIndex(
            (doc) => doc.id === destinationId.toString()
          );
          if (destinationIndex !== -1) {
            state.documentList?.splice(destinationIndex!, 0, movedDocument!);
            // Notify success
            useNotification().notify(
              "moveDocumentSuccess",
              `Moving document with ID: ${documentId} to destination with ID: ${destinationId} success`,
              NOTIFICATION_MESSAGES.Document.MOVE_DOCUMENT_SUCCESS,
              new Date(),
              NotificationTypeEnum.OperationSuccess
            );
          } else {
            throw new Error(
              `Destination document with ID ${destinationId} not found.`
            );
          }
        } else {
          throw new Error(`Document with ID ${documentId} not found.`);
        }
      } catch (error: any) {
        console.error("Error moving document:", error);
        // Notify error
        useNotification().notify(
          "moveDocumentError",
          `Error moving document: ${error.message}`,
          NOTIFICATION_MESSAGES.Document.MOVE_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },

    copyDocument: (state, action: PayloadAction<number>) => {
      // Implement document copying functionality
      // Assuming implementation here...
      useNotification().notify(
        "copyDocumentSuccess",
        `Copying document with ID: ${action.payload} success`,
        NOTIFICATION_MESSAGES.Document.COPY_DOCUMENT_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    },

    mergeDocuments: (
      state,
      action: PayloadAction<{ sourceId: number; destinationId: number }>
    ) => {
      try {
        const { sourceId, destinationId } = action.payload;

        // Find the source document and destination document in the state
        const sourceDocumentIndex = state.documentList?.findIndex(
          (doc) => doc.id === sourceId
        );
        const destinationDocumentIndex = state.documentList?.findIndex(
          (doc) => doc.id === destinationId
        );

        if (sourceDocumentIndex === -1 || destinationDocumentIndex === -1) {
          throw new Error("Source document or destination document not found.");
        }

        // Merge the content of the source document into the destination document
        state.documentList![destinationDocumentIndex!].content +=
          state.documentList![sourceDocumentIndex!].content;

        // Remove the source document from the state
        state.documentList?.splice(sourceDocumentIndex!, 1);

        // Notify success
        useNotification().notify(
          "mergeDocumentsSuccess",
          `Merging document with ID: ${sourceId} to destination with ID: ${destinationId} success`,
          NOTIFICATION_MESSAGES.Document.MERGE_DOCUMENTS_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error merging documents:", error);
        // Notify error
        useNotification().notify(
          "mergeDocumentsError",
          "Error merging documents",
          NOTIFICATION_MESSAGES.Document.MERGE_DOCUMENTS_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },

    splitDocument: (state, action: PayloadAction<number>) => {
      const documentId = action.payload;
      const documentToSplit = state.documentList?.find(
        (doc) => doc.id === documentId.toString()
      );
      if (documentToSplit) {
        // Example: Split document content into two parts
        const splitContent = documentToSplit.content.split(" ");
        const firstHalf = splitContent
          .slice(0, Math.ceil(splitContent.length / 2))
          .join(" ");
        const secondHalf = splitContent
          .slice(Math.ceil(splitContent.length / 2))
          .join(" ");
        // Update the original document and add the new document
        documentToSplit.content = firstHalf;
        state.documentList?.push({
          id: state.documentList?.length + 1,
          title: `${documentToSplit.title} - Split`,
          content: secondHalf,
          topics: [],
          highlights: [],
          files: [],
          keywords: [],
          options: {} as WritableDraft<DocumentOptions>,
          folderPath: "New Folder",
          previousMetadata: {} as WritableDraft<StructuredMetadata>,
          currentMetadata: {} as WritableDraft<StructuredMetadata>,
          accessHistory: [],
          folders: [],
          lastModifiedDate: {
            value: new Date(),
            isModified: false,
          } as ModifiedDate,
          version: {} as WritableDraft<Version>,
          permissions: undefined,
          versionData: undefined,
          _id: "",
          visibility: undefined,
          documentSize: DocumentSize.A4,
          lastModifiedBy: "",
          name: "",
          description: "",
          createdBy: "",
          createdDate: undefined,
          documentType: "",
          _rev: "",
          _attachments: undefined,
          _links: undefined,
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
          uploadedBy: 0,
          uploadedAt: "",
          tagsOrCategories: "",
          format: "",
          uploadedByTeamId: null,
          uploadedByTeam: null,
          URL: "",
          all: undefined,
          anchors: undefined,
          applets: undefined,
          bgColor: "",
          body: undefined,
          characterSet: "",
          charset: "",
          compatMode: "",
          contentType: "",
          cookie: "",
          currentScript: null,
          defaultView: null,
          designMode: "",
          dir: "",
          doctype: null,
          documentElement: undefined,
          documentURI: "",
          domain: "",
          embeds: undefined,
          fgColor: "",
          forms: undefined,
          fullscreen: false,
          fullscreenEnabled: false,
          head: undefined,
          hidden: false,
          images: undefined,
          implementation: undefined,
          inputEncoding: "",
          lastModified: "",
          linkColor: "",
          links: undefined,
          location: undefined,
          onfullscreenchange: null,
          onfullscreenerror: null,
          onpointerlockchange: null,
          onpointerlockerror: null,
          onreadystatechange: null,
          onvisibilitychange: null,
          ownerDocument: null,
          pictureInPictureEnabled: false,
          plugins: undefined,
          readyState: "loading",
          referrer: "",
          rootElement: null,
          scripts: undefined,
          scrollingElement: null,
          timeline: undefined,
          visibilityState: "hidden",
          vlinkColor: "",
          
          documents: [],
          selectedDocument: null,
          filteredDocuments: [],
          searchResults: [],
          loading: false,
          error: null
        });
      }
    },

    validateDocument: (state, action: PayloadAction<number>) => {
      const documentId = action.payload;
      const documentToValidate = state.documentList?.find(
        (doc) => doc.id === documentId.toString()
      );

      if (documentToValidate) {
        // Example: Perform validation on document content
        let validationErrors: string[] = [];

        // Example validation rules
        if (
          !documentToValidate.title ||
          documentToValidate.title.trim() === ""
        ) {
          validationErrors.push("Title is required.");
        }

        if (
          !documentToValidate.content ||
          documentToValidate.content.trim() === ""
        ) {
          validationErrors.push("Content is required.");
        }

        // Additional validation rules...

        if (validationErrors.length === 0) {
          console.log(`Document ${documentId} is valid.`);
        } else {
          console.log(
            `Document ${documentId} is not valid. Validation errors:`,
            validationErrors
          );
        }
      }
    },

    encryptDocument: (
      state,
      action: PayloadAction<{ documentId: number; encryptionType: string }>
    ) => {
      const { documentId, encryptionType } = action.payload;
      const documentToEncrypt = state.documentList?.find(
        (doc) => doc.id === documentId.toString()
      );

      if (documentToEncrypt) {
        // Example: Implement different encryption techniques based on encryptionType
        switch (encryptionType) {
          case "AES":
            documentToEncrypt.content = `AES Encrypted: ${documentToEncrypt.content}`;
            break;
          case "RSA":
            documentToEncrypt.content = `RSA Encrypted: ${documentToEncrypt.content}`;
            break;
          default:
            documentToEncrypt.content = `Default Encrypted: ${documentToEncrypt.content}`;
            break;
        }
      }
    },

    decryptDocument: (
      state,
      action: PayloadAction<{ documentId: number; encryptionType: string }>
    ) => {
      const { documentId, encryptionType } = action.payload;
      const documentToDecrypt = state.documentList?.find(
        (doc) => doc.id === documentId.toString()
      );

      if (documentToDecrypt) {
        // Example: Implement different decryption techniques based on encryptionType
        switch (encryptionType) {
          case "AES":
            documentToDecrypt.content = `AES Decrypted: ${documentToDecrypt.content}`;
            break;
          case "RSA":
            documentToDecrypt.content = `RSA Decrypted: ${documentToDecrypt.content}`;
            break;
          default:
            documentToDecrypt.content = `Default Decrypted: ${documentToDecrypt.content}`;
            break;
        }
      }
    },

    lockDocument: (state, action: PayloadAction<number>) => {
      const documentId = action.payload;
      const documentToLock = state.documentList?.find(
        (doc) => doc.id === documentId.toString()
      );
      if (documentToLock) {
        documentToLock.locked = true;
      }
    },

    unlockDocument: (state, action: PayloadAction<number>) => {
      const documentId = action.payload;
      const documentToUnlock = state.documentList?.find(
        (doc) => doc.id === documentId.toString()
      );
      if (documentToUnlock) {
        documentToUnlock.locked = false;
      }
    },

    // Update the reducer to include the changes property in DocumentData
    trackDocumentChanges: (
      state,
      action: PayloadAction<{ documentId: number; changes: string }>
    ) => {
      const { documentId, changes } = action.payload;
      const documentToTrack = state.documentList?.find(
        (doc) => doc.id === documentId.toString()
      );
      if (documentToTrack) {
        // Ensure changes property is initialized as an array
        if (!Array.isArray(documentToTrack.changes)) {
          documentToTrack.changes = [];
        }
        // Push the changes to the changes array
        documentToTrack.changes.push(changes);
      }
    },
  
    compareDocuments: (
      state,
      action: PayloadAction<{ documentId1: number; documentId2: number }>
    ) => {
      const { documentId1, documentId2 } = action.payload;
      const document1 = state.documentList?.find((doc) => doc.id === documentId1);
      const document2 = state.documentList?.find((doc) => doc.id === documentId2);
      if (document1 && document2) {
        // Example: Compare the content of the two documents
        const document1Content = document1.content.split(" ");
        const document2Content = document2.content.split(" ");
        const intersection = document1Content.filter((word) =>
          document2Content.includes(word)
        );
        const union = [...new Set([...document1Content, ...document2Content])];
        const difference = [
          ...new Set([...document1Content, ...document2Content]),
        ];
        console.log(`Intersection: ${intersection.join(" ")}`);
        console.log(`Union: ${union.join(" ")}`);
        console.log(`Difference: ${difference.join(" ")}`);
      }
    },

    searchDocuments: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload;
      const searchResults = state.documentList?.filter((doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log(
        `Search results: ${searchResults.map((doc) => doc.title).join(", ")}`
      );
    },

    searchDocument: (
      state,
      action: PayloadAction<{ documentId: number; query: string }>
    ) => {
      const { documentId, query } = action.payload;
      const documentToSearch = state.documentList?.find(
        (doc) => doc.id === documentId
      );

      if (!documentToSearch) {
        // Handle case where document is not found
        console.error(`Document with ID ${documentId} not found.`);
        return;
      }

      // Perform search within the document content or any other necessary logic
      const searchResults = state.documentList?.filter((doc) =>
        performSearch(doc.content, query)
      );

      // Update the state with the search results
      state.searchResults = searchResults;
    },

    // Add reducers for tagging, categorizing, and customizing document views
    tagDocument: (
      state,
      action: PayloadAction<{
        document: WritableDraft<DocumentObject<T, K, Meta>>;
        documentId: number;
        tag: string;
      }>
    ) => {
      const { document, documentId, tag } = action.payload;
      const documentToTag = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToTag) {
        applyTransformation(documentToTag, tag, transformations.tag, "tag");
      }
    },

    tagDocuments: (
      state,
      action: PayloadAction<{
        documentIds: number[];
        tag: string;
      }>
    ) => {
      const { documentIds, tag } = action.payload;
      documentIds.forEach((documentId) => {
        const documentToTag = state.documentList?.find(
          (doc) => doc.id === documentId
        );
        if (documentToTag) {
          applyTransformation(documentToTag, tag, transformations.tag, "tags");
        }
      });
    },

    categorizeDocument: (
      state,
      action: PayloadAction<{ documentId: number; category: string }>
    ) => {
      const { documentId, category } = action.payload;
      const documentToCategorize = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToCategorize) {
        applyTransformation(
          documentToCategorize,
          category,
          transformations.categorize,
          "categorize" + category
        );
      }
    },

    categorizeDocuments: (
      state,
      action: PayloadAction<{ documentIds: number[]; category: string }>
    ) => {
      const { documentIds, category } = action.payload;
      documentIds.forEach((documentId) => {
        const documentToCategorize = state.documentList?.find(
          (doc) => doc.id === documentId
        );
        if (documentToCategorize) {
          applyTransformation(
            documentToCategorize,
            category,
            transformations.categorize,
            "category " + category
          );
        }
      });
    },

    customizeDocumentView: (
      state,
      action: PayloadAction<{ documentId: number; view: string }>
    ) => {
      const { documentId, view } = action.payload;
      const documentToCustomize = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToCustomize) {
        applyTransformation(
          documentToCustomize,
          view,
          transformations.customizeView,
          "customize view to " + view
        );
      }
    },

    commentOnDocument: (
      state,
      action: PayloadAction<{ documentId: number; comment: string }>
    ) => {
      const { documentId, comment } = action.payload;
      const documentToComment = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToComment) {
        applyTransformation(
          documentToComment,
          comment,
          transformations.comment,
          "add comment: " + comment
        );
      }
    },

    mentionUserInDocument: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToMention = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToMention) {
        applyTransformation(
          documentToMention,
          user,
          transformations.mention,
          "mention user " + user
        );
      }
    },

    assignTaskInDocument: (
      state,
      action: PayloadAction<{ documentId: number; task: string }>
    ) => {
      const { documentId, task } = action.payload;
      const documentToAssign = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToAssign) {
        applyTransformation(
          documentToAssign,
          task,
          transformations.assignTask,
          "Assigned task: " + task
        );
      }
    },

    requestReviewOfDocument: (
      state,
      action: PayloadAction<{ documentId: number; reviewer: string }>
    ) => {
      const { documentId, reviewer } = action.payload;
      const documentToReview = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToReview) {
        applyTransformation(
          documentToReview,
          reviewer,
          transformations.requestReview,
          "Requested review by " + reviewer
        );
      }
    },

    approveDocument: (
      state,
      action: PayloadAction<{ documentId: number; approver: string }>
    ) => {
      const { documentId, approver } = action.payload;
      const documentToApprove = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToApprove) {
        applyTransformation(
          documentToApprove,
          approver,
          transformations.approve,
          "Approved by " + approver
        );
      }
    },

    rejectDocument: (
      state,
      action: PayloadAction<{ documentId: number; rejector: string }>
    ) => {
      const { documentId, rejector } = action.payload;
      const documentToReject = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToReject) {
        applyTransformation(
          documentToReject,
          rejector,
          transformations.reject,
          "Rejected by " + rejector
        );
      }
    },

    requestFeedbackOnDocument: (
      state,
      action: PayloadAction<{ documentId: number; reviewer: string }>
    ) => {
      const { documentId, reviewer } = action.payload;
      const documentToReview = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToReview) {
        applyTransformation(
          documentToReview,
          reviewer,
          transformations.requestFeedback,
          "Requested feedback from " + reviewer
        );
      }
    },

    provideFeedbackOnDocument: (
      state,
      action: PayloadAction<{ documentId: number; reviewer: string }>
    ) => {
      const { documentId, reviewer } = action.payload;
      const documentToReview = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToReview) {
        applyTransformation(
          documentToReview,
          reviewer,
          transformations.provideFeedback,
          "Feedback provided by " + reviewer
        );
      }
    },

    resolveFeedbackOnDocument: (
      state,
      action: PayloadAction<{ documentId: number; reviewer: string }>
    ) => {
      const { documentId, reviewer } = action.payload;
      const documentToReview = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToReview) {
        applyTransformation(
          documentToReview,
          reviewer,
          transformations.resolveFeedback,
          "Feedback resolved by " + reviewer
        );
      }
    },

    collaborativeEditing: (
      state,
      action: PayloadAction<{ documentId: number; collaborator: string }>
    ) => {
      const { documentId, collaborator } = action.payload;
      const documentToCollaborate = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToCollaborate) {
        applyTransformation(
          documentToCollaborate,
          collaborator,
          transformations.collaborate,
          "Collaborative editing with " + collaborator
        );
      }
    },

    smartDocumentTagging: (
      state,
      action: PayloadAction<{ documentId: number; tag: string }>
    ) => {
      const { documentId, tag } = action.payload;
      const documentToTag = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToTag) {
        applyTransformation(
          documentToTag,
          tag,
          transformations.tag,
          "Document tagged with " + tag
        );
      }
    },

    documentAnnotation: (
      state,
      action: PayloadAction<{ documentId: number; annotation: string }>
    ) => {
      const { documentId, annotation } = action.payload;
      const documentToAnnotate = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToAnnotate) {
        applyTransformation(
          documentToAnnotate,
          annotation,
          transformations.annotate,
          "Document annotated with " + annotation
        );
      }
    },

    documentActivityLogging: (
      state,
      action: PayloadAction<{ documentId: number; activity: string }>
    ) => {
      const { documentId, activity } = action.payload;
      const documentToLog = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToLog) {
        applyTransformation(
          documentToLog,
          activity,
          transformations.logActivity,
          "Activity logged: " + activity
        );
      }
    },

    intelligentDocumentSearch: (
      state,
      action: PayloadAction<{ searchTerm: string; options?: any }>
    ) => {
      const { searchTerm, options } = action.payload;
      const initialSearchTerm = searchTerm.toLowerCase();
      const searchResults = state.documentList?.filter((doc) =>
        doc.content.toLowerCase().includes(initialSearchTerm)
      );
    
      if (searchResults && searchResults.length > 0) {
        // Automatically tag matched documents
        searchResults.forEach((doc) => {
          applyTransformation(
            doc,
            "Matched by intelligent search",
            transformations.tag,
            "Search match: " + searchTerm
          );
        });
    
        // Log the search activity
        searchResults.forEach((doc) => {
          applyTransformation(
            doc,
            "Search action performed",
            transformations.logActivity,
            "Document found during search: " + searchTerm
          );
        });
    
        // Optionally trigger collaborative editing if specified
        if (options?.triggerCollaboration) {
          searchResults.forEach((doc) => {
            applyTransformation(
              doc,
              "Collaborator",
              transformations.collaborate,
              "Collaborative search editing initiated"
            );
          });
        }
    
        // Update the state with search results
        state.searchResults = searchResults;
      } else {
        console.error("No documents matched the search criteria.");
      }
    },
    ,

    createDocumentVersion: (
      state,
      action: PayloadAction<{ documentId: number; version: string }>
    ) => {
      const { documentId, version } = action.payload;
      const documentToVersion = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToVersion) {
        applyTransformation(
          documentToVersion,
          version,
          transformations.version,
          "Document versioned to " + version
        );
      }
    },

    revertToDocumentVersion: (
      state,
      action: PayloadAction<{ documentId: number; version: string }>
    ) => {
      const { documentId, version } = action.payload;
      const documentToRevert = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToRevert) {
        applyTransformation(
          documentToRevert,
          version,
          transformations.revert,
          "Document reverted to version " + version
        );
      }
    },

    viewDocumentHistory: (
      state,
      action: PayloadAction<{ documentId: number; version: string }>
    ) => {
      const { documentId, version } = action.payload;
      const documentToView = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToView) {
        applyTransformation(
          documentToView,
          version,
          transformations.viewHistory,
          "Document history viewed"
        );
      }
    },

    documentVersionComparison: (
      state,
      action: PayloadAction<{ documentId: number; version: string }>
    ) => {
      const { documentId, version } = action.payload;
      const documentToCompare = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToCompare) {
        applyTransformation(
          documentToCompare,
          version,
          transformations.compare,
          "Document versions compared"
        );
      }
    },

    grantDocumentAccess: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToGrant = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToGrant) {
        applyTransformation(
          documentToGrant,
          user,
          transformations.grantAccess,
          "Document access granted to " + user
        );
      }
    },

    revokeDocumentAccess: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToRevoke = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToRevoke) {
        applyTransformation(
          documentToRevoke,
          user,
          transformations.revokeAccess,
          "Document access revoked from " + user
        );
      }
    },

    manageDocumentPermissions: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToManage = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToManage) {
        applyTransformation(
          documentToManage,
          user,
          transformations.managePermissions,
          "Document permissions managed"
        );
      }
    },

    initiateDocumentWorkflow: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToInitiate = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToInitiate) {
        applyTransformation(
          documentToInitiate,
          user,
          transformations.initiateWorkflow,
          "Document workflow initiated"
        );
      }
    },

    automateDocumentTasks: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToAutomate = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToAutomate) {
        applyTransformation(
          documentToAutomate,
          user,
          transformations.automateTasks,
          "Document tasks automated"
        );
      }
    },

    triggerDocumentEvents: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToTrigger = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToTrigger) {
        applyTransformation(
          documentToTrigger,
          user,
          transformations.triggerEvents,
          "Document events triggered"
        );
      }
    },

    documentApprovalWorkflow: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToApprove = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToApprove) {
        applyTransformation(
          documentToApprove,
          user,
          transformations.approvalWorkflow,
          "Document approval workflow initiated"
        );
      }
    },

    documentLifecycleManagement: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToManage = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToManage) {
        applyTransformation(
          documentToManage,
          user,
          transformations.lifecycleManagement,
          "Document lifecycle managed"
        );
      }
    },

    connectWithExternalSystem: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToConnect = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToConnect) {
        applyTransformation(
          documentToConnect,
          user,
          transformations.connectWithExternalSystem,
          "Document connected to external system"
        );
      }
    },

    synchronizeWithCloudStorage: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToSynchronize = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToSynchronize) {
        applyTransformation(
          documentToSynchronize,
          user,
          transformations.synchronizeWithCloudStorage,
          "Document synchronized with cloud storage"
        );
      }
    },

    importFromExternalSource: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToImport = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToImport) {
        applyTransformation(
          documentToImport,
          user,
          transformations.importFromExternalSource,
          "Document imported from external source"
        );
      }
    },

    exportToExternalSystem: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToExport = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToExport) {
        applyTransformation(
          documentToExport,
          user,
          transformations.exportToExternalSystem,
          "Document exported to external system"
        );
      }
    },

    generateDocumentReport: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToGenerate = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToGenerate) {
        applyTransformation(
          documentToGenerate,
          user,
          transformations.generateReport,
          "Document report generated"
        );
      }
    },

    exportDocumentReport: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToExport = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToExport) {
        applyTransformation(
          documentToExport,
          user,
          transformations.exportReport,
          "Document report exported"
        );
      }
    },

    scheduleReportGeneration: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToSchedule = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToSchedule) {
        applyTransformation(
          documentToSchedule,
          user,
          transformations.scheduleReportGeneration,
          "Document report scheduled"
        );
      }
    },

    customizeReportSettings: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToCustomize = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToCustomize) {
        applyTransformation(
          documentToCustomize,
          user,
          transformations.customizeReportSettings,
          "Document report customization initiated"
        );
      }
    },

    backupDocuments: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToBackup = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToBackup) {
        applyTransformation(
          documentToBackup,
          user,
          transformations.backupDocuments,
          "Document backed up"
        );
      }
    },

    retrieveBackup: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToRetrieve = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToRetrieve) {
        applyTransformation(
          documentToRetrieve,
          user,
          transformations.retrieveBackup,
          "Document backup retrieved"
        );
      }
    },

    documentRedaction: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToRedact = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToRedact) {
        applyTransformation(
          documentToRedact,
          user,
          transformations.redaction,
          "Document redacted"
        );
      }
    },

    documentAccessControls: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToControl = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToControl) {
        applyTransformation(
          documentToControl,
          user,
          transformations.accessControls,
          "Document access controls updated"
        );
      }
    },

    documentTemplates: (
      state,
      action: PayloadAction<{ documentId: number; user: string }>
    ) => {
      const { documentId, user } = action.payload;
      const documentToTemplate = state.documentList?.find(
        (doc) => doc.id === documentId
      );
      if (documentToTemplate) {
        applyTransformation(
          documentToTemplate,
          user,
          transformations.templates,
          "Document templates updated"
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteDocumentAsync.pending, (state) => {
      // Handle pending state if needed
      state.loading = true; // Set loading state to true while the deletion is pending
      state.error = null; // Clear any previous errors
    });

    builder.addCase(deleteDocumentAsync.fulfilled, (state, action) => {
      // Handle fulfilled state
      const documentIndex = state.documentList?.findIndex(
        (doc) => doc.id === action.payload
      );
      if (documentIndex !== -1) {
        state.documentList?.splice(documentIndex, 1);
        useNotification().notify(
          "deleteDocumentSuccess",
          "Document deleted",
          NOTIFICATION_MESSAGES.Document.DELETE_DOCUMENT_SUCCESS,
          new Date(),
          NotificationTypeEnum.Success
        );
      } else {
        useNotification().notify(
          "deleteDocumentError",
          "Document not found",
          NOTIFICATION_MESSAGES.Document.DELETE_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    });

    builder.addCase(deleteDocumentAsync.rejected, (state, action) => {
      // Handle rejected state if needed
      state.loading = false; // Set loading state to false if the deletion failed
      console.error("Error deleting document:", action.payload);
      useNotification().notify(
        "deleteDocumentError",
        "Error deleting document",
        NOTIFICATION_MESSAGES.Document.DELETE_DOCUMENT_ERROR,
        new Date(),
        NotificationTypeEnum.Error
      );
    });

    builder
      .addCase(fetchDocumentById.pending, (state) => {
        state.loading = true; // Ensure loading is set to true
        state.error = null;
      })

      builder.addCase(fetchDocumentById.fulfilled, (
        state,
        action
      ) => {
        state.loading = false;
        state.selectedDocument = action.payload as WritableDraft<DocumentData>;
      })

      builder.addCase(fetchDocumentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as WritableDraft<Error>;
      });

    // Add a case to handle the fulfilled action
    builder.addCase(fetchDocumentById.fulfilled, (
        state, 
        action
      ) => {
        // Handle successful document fetch
        state.selectedDocument = action.payload as WritableDraft<DocumentData>;
      })

    
    builder.addCase(deleteDocumentAsync.fulfilled, (state, action) => {
        // Handle successful document deletion
        state.documentList = state.documentList?.filter(
          (doc) => doc.id !== action.payload
        );
      });

    builder.addCase(downloadDocumentAsync.fulfilled, (state, action) => {
      // Update state with downloaded document (action.payload)
      state.selectedDocument = action.payload;
      useNotification().notify(
        "downloadDocumentSuccess",
        `Downloading document with ID: ${action.payload.id} success`,
        NOTIFICATION_MESSAGES.Document.DOWNLOAD_DOCUMENT_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    });

    builder.addCase(exportDocumentsAsync.fulfilled, (state, action) => {
      // Update state with exported documents (action.payload)
      state.filteredDocuments = action.payload;
      useNotification().notify(
        "exportDocumentsSuccess",
        "Exporting documents success",
        NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    });

    builder.addCase(downloadDocument.fulfilled, (state, action) => {
      state.selectedDocument = action.payload;
      useNotification().notify(
        "downloadDocumentSuccess",
        `Downloading document with ID: ${action.payload.id} success`,
        NOTIFICATION_MESSAGES.Document.DOWNLOAD_DOCUMENT_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    });
  },
});

// Export action creators
export const {
  // Basic document management actions
  setDocuments,
  setDownloadedDocument,
  addDocument,
  addDocumentSuccess,
  selectDocument,
  clearSelectedDocument,

  // Advanced document management actions
  updateDocument,
  deleteDocument,
  filterDocuments,
  sortDocuments,
  shareDocument,
  // downloadDocument,

  // exportDocuments,
  importDocuments,
  archiveDocument,
  fetchDocumentFromArchive,
  moveDocument,
  copyDocument,
  mergeDocuments,
  splitDocument,
  validateDocument,
  encryptDocument,
  decryptDocument,
  lockDocument,
  unlockDocument,
  trackDocumentChanges,
  compareDocuments,
  searchDocuments,
  tagDocuments,
  tagDocument,
  categorizeDocuments,
  customizeDocumentView,

  // Collaboration and communication actions
  commentOnDocument,
  mentionUserInDocument,
  assignTaskInDocument,
  requestReviewOfDocument,
  approveDocument,
  rejectDocument,
  requestFeedbackOnDocument,
  provideFeedbackOnDocument,
  resolveFeedbackOnDocument,
  collaborativeEditing,

  smartDocumentTagging,
  documentAnnotation,
  documentActivityLogging,
  intelligentDocumentSearch,

  // Version control actions
  createDocumentVersion,
  revertToDocumentVersion,
  viewDocumentHistory,
  documentVersionComparison,
  // Access control and permissions actions
  grantDocumentAccess,
  revokeDocumentAccess,
  manageDocumentPermissions,

  // Workflow and automation actions
  initiateDocumentWorkflow,
  automateDocumentTasks,
  triggerDocumentEvents,
  documentApprovalWorkflow,
  documentLifecycleManagement,

  // Integration and interoperability action
  connectWithExternalSystem,
  synchronizeWithCloudStorage,
  importFromExternalSource,
  exportToExternalSystem,
  // Reporting actions
  generateDocumentReport,
  exportDocumentReport,
  scheduleReportGeneration,
  customizeReportSettings,

  // Backup actions
  backupDocuments,
  retrieveBackup,

  // Security Actions:

  documentRedaction,
  documentAccessControls,

  // Document Management Actions:
  documentTemplates,
} = useDocumentManagerSlice.actions;
// Define selectors for accessing document-related state
export const selectDocuments = (state: RootState) =>
  state.documentManager.documentList;
export const selectSelectedDocument = (state: RootState) =>
  state.documentManager.selectedDocument;

// Export the reducer
export default useDocumentManagerSlice.reducer;

export type { DocumentObject, DocumentSliceState };




// Example usage
  
const baseStructure: StructuredMetadata = {
  metadataEntries: {
    document1: {
      author: 'Author 1',
      timestamp: new Date(),
      originalPath: '/path/to/document1',
      alternatePaths: [],
      fileType: 'txt',
      title: 'Document 1',
      description: 'Description of Document 1',
      keywords: ['keyword1', 'keyword2'],
      authors: ['Author 1', 'Author 2'],
      contributors: [],
      publisher: 'Publisher',
      copyright: 'Copyright',
      license: 'License',
      links: [],
      tags: [],
    },
  }  
};

const additionalStructure: StructuredMetadata = {
  metadataEntries: {
    document2: {
      author: 'Author 2',
      timestamp: new Date(),
      originalPath: '/path/to/document2',
      alternatePaths: [],
      fileType: 'pdf',
      title: 'Document 2',
      description: 'Description of Document 2',
      keywords: ['keyword3', 'keyword4'],
      authors: [],
      contributors: ['Contributor 1'],
      publisher: 'Publisher 2',
      copyright: 'Copyright 2',
      license: 'License 2',
      links: [],
      tags: [],
    },
  }
};

const merged = mergeStructures(baseStructure, additionalStructure);
console.log(merged);

// Output:
// {
//   document1: { originalPath: '/path/to/document1', ... },
//   document2: { originalPath: '/path/to/document2', ... }
// }