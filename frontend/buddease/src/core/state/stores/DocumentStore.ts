// DocumentStore.ts
import axiosInstance from '@/core/api/csrfToken';
import { endpoints } from '@/core/api/endpointConfigurations';
import { ClientInformation } from '@/core/client/ClientInformation';
import { Team } from '@/core/components/teams/Team';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta, Entity } from '@/core/config/BaseConfig';
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import { useMeta } from "@/core/config/useMeta";
import type { useMetadata } from "@/core/config/useMetadata";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { ModifiedDate } from '@/core/documents/DocType';
import type { DocumentOptions, DocumentSize } from '@/core/documents/DocumentOptions';
import { DocumentPath } from "@/core/documents/DocumentPath";
import DocumentPermissions from '@/core/documents/DocumentPermissions';
import { DocumentData } from '@/core/documents/editing/DocumentBuilder';
import { DocumentPhaseTypeEnum } from "@/core/documents/editing/DocumentPhaseType";
import { SharedIdentifiers, SharedTimestamps } from '@/core/documents/RelatedProps';
import { FinancialReport, ResearchReport, TechnicalReport } from '@/core/documents/Report';
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import type { DocumentWithBuilderProps } from '@/core/hooks/userScenarioCreation';
import { Category } from '@/core/libraries/categories/generateCategoryProperties';
import { Comment } from "@/core/models/comments/Comments";
import { Content } from "@/core/models/content/AddContent";
import type { TodoSubtasks } from '@/core/models/data/Data';
import FileData from '@/core/models/data/FileData';
import FolderData from '@/core/models/data/FolderData';
import { ProgressPhase } from "@/core/models/tracker/ProgressBar";
import { UserRoleEnum } from '@/core/models/UserRoles';
import { useNotification } from '@/core/state/context/NotificationContext';
import { CustomComment } from "@/core/state/redux/slices/BlogSlice";
import { DocumentObject } from '@/core/state/redux/slices/DocumentSlice';
import { DocumentTypeEnum } from "@/core/typings/documentTypes";
import { AllTypes } from "@/core/typings/PropTypes";
import AccessHistory from '@/core/versions/AccessHistory';
import { Version } from '@/core/versions/Version';
import { VersionData } from '@/core/versions/VersionData';
import { ContentState } from 'draft-js';
import { makeAutoObservable } from "mobx";
import { useMemo, useState } from "react";
import { WritableDraft } from './../redux/ReducerGenerator';
import { AllStatus } from './DetailsListStore';

type PhaseTypeEnums = ProgressPhase | ProjectPhaseTypeEnum | DocumentPhaseTypeEnum | undefined;

interface DocumentNotificationMessages {
  ADD_DOCUMENT_SUCCESS: string;
  DELETE_DOCUMENT_SUCCESS: string;
  UPDATE_DOCUMENT_SUCCESS: string;
  HANDLE_DOCUMENT_ERROR: string;
  // Add more keys as needed
}

// Then create the actual object with the messages
const documentNotificationMessages: DocumentNotificationMessages = {
  ADD_DOCUMENT_SUCCESS: NOTIFICATION_MESSAGES.Document.ADD_DOCUMENT_SUCCESS,
  DELETE_DOCUMENT_SUCCESS: NOTIFICATION_MESSAGES.Document.DELETE_DOCUMENT_SUCCESS,
  UPDATE_DOCUMENT_SUCCESS: NOTIFICATION_MESSAGES.Document.UPDATE_DOCUMENT_SUCCESS,
  HANDLE_DOCUMENT_ERROR: NOTIFICATION_MESSAGES.Document.HANDLE_DOCUMENT_ERROR,
  // Add more properties as needed
};


// Define the type for the document content
interface DocumentContent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  eventId: string;
  content: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  meta: Meta; 
  metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null; 
  // Add more properties as needed
}

// ---------------------------
// Base Document Interfaces
// ---------------------------
interface DocumentBase<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedIdentifiers<T, K>,
          SharedTimestamps,
          Entity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {

  // Core identification
  id: string | number;
  _id?: string; // optional here for domain-only
  _rev?: string;
  
  // Document metadata
  name?: string;
  title: string;
  description?: string;

  // Versioning
  version?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  versionData?: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Status and type
  status?: AllStatus;
  type?: AllTypes;
  documentType: string | DocumentTypeEnum;
  visibility: AllTypes;
  phaseType: PhaseTypeEnums;

  // Timestamps
  createdDate?: string | Date;
  createdByRenamed?: string;
  lastModifiedDate?: ModifiedDate;
  lastModifiedBy: string;
  lastModifiedByTeamId?: number | null;
  lastModifiedByTeam?: Team | null;
  timestamp?: Date;

  // Content
  content: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  previousContent?: string | ContentState;
  currentContent?: ContentState;

  // Metadata
  currentMeta: Meta;
  previousMeta?: Meta;
  currentMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  previousMetadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // File handling
  file?: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  files?: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  filePath?: DocumentPath<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  folder?: FolderData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  folders: FolderData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  // Document structure
  document?: DocumentObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  documents: WritableDraft<DocumentObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[];
  documentData?: DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  updatedDocument?: DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  selectedDocuments?: WritableDraft<DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[];

  // Optional additional content
  artwork?: any[];
  clientInformation?: ClientInformation;
  supportedLanguages?: string[];
  body?: WritableDraft<HTMLElement> | HTMLElement;
  comments?: number | (Comment<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | CustomComment)[];

  // Organization
  topics?: string[];
  highlights?: string[];
  keywords?: string[];
  category?: Category;

  // Permissions and access
  permissions?: DocumentPermissions;
  accessHistory: AccessHistory[];
  requiredRole?: UserRoleEnum;
  isPrivate?: boolean;

  // Document properties
  locked?: boolean;
  changes?: boolean | string | string[];
  documentSize: DocumentSize;
  url?: string;
  source?: string;

  // Reports
  report?: FinancialReport | TechnicalReport | ResearchReport;

  // Options and configuration
  options?: DocumentOptions;
  folderPath: string;
  documentOptions?: DocumentWithBuilderProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  // Workflow
  documentPhase?: DocumentPhaseEnum;
  subtasks?: TodoSubtasks;

  // Browser/document properties
  bgColor?: string;
  documentURI?: string;
  currentScript?: string | null;
  defaultView?: Window;
  doctype?: DocumentType | null;
  ownerDocument?: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  scrollingElement?: Element | null;
  timeline?: DocumentTimeline;

  // Methods
  load?(content: any): void;
}


interface DocumentMetadata {
  characterSet: string;
  charset: string;
  compatMode: string;
  contentType: string;
  cookie: string;
  designMode: string;
  dir: string;
  domain: string;
  inputEncoding: string;
  lastModified: string;
  linkColor: string;
  referrer: string;
  vlinkColor: string;
}

interface DocumentStatus {
  fullscreen: boolean;
  fullscreenEnabled: boolean;
  hidden: boolean;
  pictureInPictureEnabled?: boolean;
  readyState: string;
  visibilityState?: string;
}

interface DocumentAdditionalProps <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  > {
  URL: string;
  bgColor: string;
  documentURI: string;
  currentScript: string | null;
  defaultView: Window | undefined;
  doctype: DocumentType | null;
  ownerDocument: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  scrollingElement: Element | null;
  readyState: string;
  timeline: DocumentTimeline | undefined;
  all?: string | null;
  anchors?: any;
  applets?: any;
  body?: WritableDraft<HTMLElement> | HTMLElement;
  documentElement?: HTMLElement;
  embeds?: any;
  forms?: any;
  head?: HTMLHeadElement;
  images?: any;
  implementation?: DOMImplementation;
  links?: any;
  location?: Location;
  onfullscreenchange?: ((this: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ev: Event) => any) | null;
  onfullscreenerror?: ((this: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ev: Event) => any) | null;
  onpointerlockerror?: ((this: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ev: Event) => any) | null;
  onpointerlockchange?: ((this: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ev: Event) => any) | null
  onreadystatechange?: ((this: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ev: Event) => any) | null;
  onvisibilitychange?: ((this: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ev: Event) => any) | null;
  pictureInPictureEnabled?: boolean;

  plugins?: any;
  referrer: string;
  rootElement: Element | null;
  scripts?: any;
  visibilityState?: string;
  vliinkColor?: string;
}


// Document interface (extends DocumentBase)
interface Document<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends DocumentBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    DocumentMetadata,
    DocumentStatus,
    DocumentAdditionalProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  artwork?: any[];
  clientInformation?: ClientInformation;
  supportedLanguages?: string[];
  body?: WritableDraft<HTMLElement> | HTMLElement;
  comments?: Comment[] | Comment;
  selectedDocuments?: WritableDraft<DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[];

  // Document specific properties
  bgColor: string;
  documentURI: string;
  currentScript: string | null;
  defaultView: Window | undefined;
  phaseType: PhaseTypeEnums;
  doctype: DocumentType | null;
  ownerDocument: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  scrollingElement: Element | null;
  requiredRole?: UserRoleEnum;
  timeline: DocumentTimeline | undefined;
  filePath?: DocumentPath<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  documentData?: DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  isPrivate?: boolean;
}


  
export interface DocumentStore<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
> {
  documents: Record<string, Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  fetchDocuments: () => void;
  getSnapshotDataKey: (documentId: string, eventId: number, userId: string) => string;
  updateDocumentReleaseStatus: (id: number, eventId: number, status: string, isReleased: boolean) => void;
  getData: (id: string) => Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  addDocument: (document: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, content: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  setDocumentReleaseStatus: (id: number, eventId: number, status: string, isReleased: boolean) => void;
  updateDocument: (id: number, updatedDocument: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  deleteDocument: (id: string) => Promise<void>;
  updateDocumentTags: (id: string, newTags: string[]) => void;
  selectedDocument?: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  selectedDocuments?: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}

const { error, handleError, clearError, parseDataWithErrorHandling } = useErrorHandling();

const useDocumentStore = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): DocumentStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  const [documents, setDocuments] = useState<Record<string, Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotification();
  const selectedDocumentId = useMemo(() => "", []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoints.documents.list.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      handleError(error, "fetching documents");
    } finally {
      setIsLoading(false);
    }
  };

  const addDocument = (document: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    const documentId = String(document.id);
    setDocuments((prevDocuments) => ({
      ...prevDocuments,
      [documentId]: document,
    }));
    notify({
      id: "addDocumentSuccess",
      message: "Document added successfully",
      data: {
        documentId,
        documentTitle: document.title || document.name || 'Untitled Document'
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success'
    });
  };
    
  const deleteDocument = async (id: string) => {
    // Store the document being deleted for potential restoration
    const documentToDelete = documents[id];
    
    // Update local state first (optimistic update)
    setDocuments((prevDocuments) => {
      const updatedDocuments = { ...prevDocuments };
      delete updatedDocuments[id];
      return updatedDocuments;
    });

    try {
      // Pass string ID directly to API
      await axiosInstance.delete(`${endpoints.documents.deleteDocument}/${id}`);
      
      notify({
        id: "deletedDocumentSuccess",
        message: `You have successfully deleted document ${id}`,
        data: {
          documentId: id,
          documentTitle: documentToDelete?.title || documentToDelete?.name || 'Document'
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      // Error handling - restore the document
      setDocuments((prevDocuments) => ({
        ...prevDocuments,
        [id]: documentToDelete,
      }));
      
      // Use handleApiError for consistent error handling
      handleApiError(
        error as AxiosError<unknown> | Error,
        `Failed to delete document ${id}`
      );
      
      throw error;
    }
  };

  const loadCalendarEventsDocumentContent = async (
    eventId: string,
    area?: string
  ): Promise<DocumentContent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
    try {
      const response = await axiosInstance.get(`/api/calendar-events/${eventId}/document-content`);
      const meta: Meta = useMeta<T, K>(area);
      const metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = useMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(area);

      return {
        eventId,
        content: response.data.content,
        meta,
        metadata
      };
    } catch (error) {
      console.error("Error loading document content for calendar event:", error);
      throw error;
    }
  };

  const selectedDocument = useMemo(() => {
    const doc = Object.values(documents).find((document) => document.id === selectedDocumentId);
    return doc ? convertDocumentToDocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(doc) : undefined;
  }, [documents, selectedDocumentId]);

  const selectedDocuments = useMemo(() => {
    return Object.values(documents).filter((document) => document.id === selectedDocumentId) as Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  }, [documents, selectedDocumentId]);

  const getSnapshotDataKey = (documentId: string, eventId: number, userId: string): string =>
    `documents.${userId}.${documentId}.event.${eventId}`;

  const getData = (id: string) => documents[id];

  const updateDocument = async (
    id: string, 
    updates: Partial<Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => {
    // Store previous state for rollback
    const previousDocument = documents[id];
    
    // Optimistic update
    setDocuments((prevDocuments) => ({
      ...prevDocuments,
      [id]: {
        ...previousDocument,
        ...updates,
      }
    }));

    try {
      await axiosInstance.put(
        `${endpoints.documents.updateDocument}/${id}`,
        updates
      );
      
      notify({
        id: "updateDocumentSuccess",
        message: "Document successfully updated",
        data: {
          documentId: id,
          documentTitle: updates.title || previousDocument?.title || 'Document',
          changes: Object.keys(updates)
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      // Rollback on error
      setDocuments((prevDocuments) => ({
        ...prevDocuments,
        [id]: previousDocument,
      }));
      
      handleApiError(
        error as AxiosError<unknown> | Error,
        `Failed to update document ${id}`
      );
      
      throw error;
    }
  };

  const handleError = (error: any, action: string) => {
    const errorMessage = `Error ${action}: ${error.message || "Unknown error"}`;
    console.error(`Error ${action}:`, error);
    
    // Use the hook's handleError
    handleErrorHook(errorMessage, { componentStack: error.stack });
    
    // Keep your existing notification logic
    handleApiError(error, action); // Use your existing handleApiError
  };

  const updateDocumentTags = async (id: number, newTags: string[]) => {
    try {
      const response = await fetch(endpoints.documents.updateDocumentTags.toString(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, newTags }),
      });
      if (!response.ok) throw new Error("Failed to update document tags");
      const data = await response.json();
      updateDocument(id, data);
    } catch (error) {
      handleError(error, "updating document tags");
    } finally {
      setIsLoading(false);
    }
  };

  const updateDocumentReleaseStatus = async (id: number, eventId: number, status: string, isReleased: boolean) => {
    try {
      const response = await fetch(endpoints.documents.updateDocumentReleaseStatus.toString(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, isReleased }),
      });
      if (!response.ok) throw new Error("Failed to update document release status");
      const data = await response.json();
      updateDocument(id, data);
    } catch (error) {
      handleError(error, "updating document release status");
    } finally {
      setIsLoading(false);
    }
  };

  const setDocumentReleaseStatus = async (id: number, eventId: number, releaseStatus: string) => {
    try {
      const response = await fetch(endpoints.documents.updateDocumentReleaseStatus.toString(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, releaseStatus }),
      });
      if (!response.ok) throw new Error("Failed to update document release status");
      const data = await response.json();
      updateDocument(id, data);
    } catch (error) {
      handleError(error, "updating document release status");
    } finally {
      setIsLoading(false);
    }
  };

  const store: DocumentStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = makeAutoObservable({
    documents,
    isLoading,
    error,
    fetchDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    updateDocumentTags,
    loadCalendarEventsDocumentContent,
    selectedDocument,
    selectedDocuments,
    getSnapshotDataKey,
    getData,
    updateDocumentReleaseStatus,
    setDocumentReleaseStatus,
  });

  return store;
};


// Helper function to convert Document to DocumentData
const convertDocumentToDocumentData = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  document: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  // Implement conversion logic here
  return {
    // Map properties from Document to DocumentData
    id: document.id,
    title: document.title,
    // ... other properties
  } as Document<T, K, Meta>;
};


export default useDocumentStore;
export type { Document, DocumentBase, DocumentMetadata, PhaseTypeEnums };
