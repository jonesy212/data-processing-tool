import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from '@/app/api/endpointConfigurations';
import { SharedIdentifiers, SharedTimestamps } from '@/app/documents/RelatedProps';
import { DocumentPhaseTypeEnum } from "@/app/components/documents/editing/DocumentPhaseType";
import { useNotification } from '@/app/context/NotificationContext';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Version } from '@/versions/Version';
import { DocumentPath } from "@/app/documents/DocumentPath";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { Comment } from "@/app/models/comments/Comments";
import { Content } from "@/app/models/content/AddContent";
import { BaseData } from '@/app/models/data/Data';
import { ProjectPhaseTypeEnum } from "@/app/models/data/StatusType";
import { ProgressPhase } from "@/app/models/tracker/ProgressBar";
import { UserRoleEnum } from '@/app/models/UserRoles';
import { AllTypes } from "@/app/typings/PropTypes";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { useMeta } from "@/app/config/useMeta";
import { useMetadata } from "@/app/config/useMetadata";
import { NotificationTypeEnum } from "@/context/NotificationContext";
import { makeAutoObservable } from "mobx";
import { useMemo, useState } from "react";

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
  metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; 
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
> extends SharedIdentifiers<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SharedTimestamps
{
  // Core identification
  id: string | number;
  _id: string;
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
  lastModifiedByTeam?: Team;
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
  artwork?: any[]; // Should be properly typed based on your usage
  clientInformation?: ClientInformation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  supportedLanguages?: string[];
  body?: WritableDraft<HTMLElement> | HTMLElement;
  comments?: number | (Comment<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | CustomComment)[] | undefined;
  
  // Organization
  topics?: string[];
  highlights?: string[];
  keywords?: string[];
  category?: string;
  
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
  documentPhase?: DocumentPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
  
  // Database specific fields
  _attachments?: Record<string, any>;
  _links?: Record<string, any>;
  _etag?: string;
  _local?: boolean;
  _revs?: string[];
  _source?: Record<string, any>;
  _shards?: Record<string, any>;
  _size?: number;
  _version?: number;
  _version_conflicts?: number;
  _seq_no?: number;
  _primary_term?: number;
  _routing?: string;
  _parent?: string;
  _parent_as_child?: boolean;
  
  // Search/Elasticsearch fields
  _slices?: any[];
  _highlight?: Record<string, any>;
  _highlight_inner_hits?: Record<string, any>;
  _source_as_doc?: boolean;
  _source_includes?: string[];
  _routing_keys?: string[];
  _routing_values?: string[];
  _routing_values_as_array?: string[];
  _routing_values_as_array_of_objects?: Record<string, any>[];
  _routing_values_as_array_of_objects_with_key?: Record<string, any>[];
  _routing_values_as_array_of_objects_with_key_and_value?: Record<string, any>[];
  _routing_values_as_array_of_objects_with_key_and_value_and_value?: Record<string, any>[];
  
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
  IncludedFields extends keyof T = keyof T> {
  URL: string;
  bgColor: string;
  documentURI: string;
  currentScript: string | null;
  defaultView: Window | undefined;
  doctype: DocumentType | null;
  ownerDocument: Document<T, K, Meta> | null;
  scrollingElement: Element | null;
  readyState: string;
  timeline: DocumentTimeline | undefined;
  all?: string | null;
  anchors?: any;
  applets?: any;
  body?: HTMLElement;
  documentElement?: HTMLElement;
  embeds?: any;
  forms?: any;
  head?: HTMLHeadElement;
  images?: any;
  implementation?: DOMImplementation;
  links?: any;
  location?: Location;
  onfullscreenchange?: ((this: Document<T, K, Meta>, ev: Event) => any) | null;
  onfullscreenerror?: ((this: Document<T, K, Meta>, ev: Event) => any) | null;
  onpointerlockerror?: ((this: Document<T, K, Meta>, ev: Event) => any) | null;
  onpointerlockchange?: ((this: Document<T, K, Meta>, ev: Event) => any) | null
  onreadystatechange?: ((this: Document<T, K, Meta>, ev: Event) => any) | null;
  onvisibilitychange?: ((this: Document<T, K, Meta>, ev: Event) => any) | null;
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
  clientInformation?: ClientInformation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
  AttachmentType extends Attachment = Attachment
> {
  documents: Record<string, Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  fetchDocuments: () => void;
  getSnapshotDataKey: (documentId: string, eventId: number, userId: string) => string;
  updateDocumentReleaseStatus: (id: number, eventId: number, status: string, isReleased: boolean) => void;
  getData: (id: string) => Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  addDocument: (document: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, content: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  setDocumentReleaseStatus: (id: number, eventId: number, status: string, isReleased: boolean) => void;
  updateDocument: (id: string, updatedDocument: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  deleteDocument: (id: string) => void;
  updateDocumentTags: (id: string, newTags: string[]) => void;
  selectedDocument?: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  selectedDocuments?: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}


const useDocumentStore = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): DocumentStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields, AttachmentType> => {
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
    notify(
      "addDocumentSuccess",
      "Document added successfully",
      documentNotificationMessages.ADD_DOCUMENT_SUCCESS,
      new Date(),
      NotificationTypeEnum.OPERATION_SUCCESS
    );
  };

  const deleteDocument = async (id: number) => {
    setDocuments((prevDocuments) => {
      const updatedDocuments = { ...prevDocuments };
      delete updatedDocuments[id];
      return updatedDocuments;
    });
    await axiosInstance.delete(`${endpoints.documents.deleteDocument}/${id}`);
    notify(
      "deletedDocumentSuccess",
      `You have successfully deleted the document ${id}`,
      NOTIFICATION_MESSAGES.Document.DELETE_DOCUMENT_SUCCESS,
      new Date(),
      NotificationTypeEnum.OPERATION_SUCCESS
    );
  };

  const loadCalendarEventsDocumentContent = async (
    eventId: string,
    area?: string
  ): Promise<DocumentContent<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> => {
    try {
      const response = await axiosInstance.get(`/api/calendar-events/${eventId}/document-content`);
      const meta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = useMeta<T, K>(area);
      const metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = useMetadata<T, K>(area);

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

  const updateDocument = (id: number, updatedDocument: Document<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
    setDocuments((prevDocuments) => ({
      ...prevDocuments,
      [id]: updatedDocument,
    }));
    notify(
      "updateDocumentSuccess",
      "Document updated successfully",
      NOTIFICATION_MESSAGES.Document.UPDATE_DOCUMENT_SUCCESS,
      new Date(),
      NotificationTypeEnum.OPERATION_SUCCESS
    );
  };

  const handleError = (error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    setError(`Error ${action}: ${error.message || "Unknown error"}`);
    notify(
      `Error ${action}`,
      error.message || "Unknown error",
      NOTIFICATION_MESSAGES.Document.HANDLE_DOCUMENT_ERROR,
      new Date(),
      NotificationTypeEnum.ERROR
    );
  };

  const updateDocumentTags = async (id: number, tags: string[]) => {
    try {
      const response = await fetch(endpoints.documents.updateDocumentTags.toString(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, tags }),
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

  const store: DocumentStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields, AttachmentType> = makeAutoObservable({
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
const convertDocumentToDocumentData = <T extends BaseData<any>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
  document: Document<T, K, Meta>
): Document<T, K, Meta> => {
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
