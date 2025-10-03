import { endpoints } from "@/app/api/ApiEndpoints";
import axiosInstance from '@/app/api/csrfToken';
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { DocumentPhaseTypeEnum } from "@/app/components/documents/DocumentPhaseType";
import { BaseData } from '@/app/components/models/data/Data';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { useNotification } from "@/app/context/NotificationContext";
import { Content } from "@/app/models/content/AddContent";
import { Comment } from "@/app/models/data/Comments";
import { ProjectPhaseTypeEnum } from "@/app/models/data/StatusType";
import { ProgressPhase } from "@/app/models/tracker/ProgressBar";
import { CustomComment } from "@/app/redux/slices/BlogSlice";
import { TagsRecord } from "@/app/snapshots";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { AllTypes } from "@/app/typings/PropTypes";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { useMeta } from "@/config/useMeta";
import { useMetadata } from "@/config/useMetadata";
import { NotificationTypeEnum } from "@/context/NotificationContext";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { DocumentPath } from "@/server/DocumentPath";
import { UserRoleEnum } from "@/users/UserRoles";
import { makeAutoObservable } from "mobx";
import { useMemo, useState } from "react";
;

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
  T extends  BaseData<any>, 
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  eventId: string;
  content: Content<T, K, Meta>,
  meta: Meta; 
  metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>; 
  // Add more properties as needed
}

interface DocumentBase<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  > {
  id?: string | number | undefined;
  title: string;
  content: Content<T, K, Meta>;
  description?: string | null | undefined;
  tags?: TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string[] | undefined; 
  createdAt: string | Date | undefined;
  updatedAt?: string | Date;
  createdBy: string | undefined;
  updatedBy: string;
  visibility: AllTypes;
  phaseType: PhaseTypeEnums;
  documentData?: Document<T, K, Meta>;
  comments?: number | (Comment<T, K, Meta> | CustomComment)[] | undefined;
  // selectedDocument: DocumentData<T> | null;
  selectedDocuments?: Document<T, K, Meta>[];
  
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

interface DocumentAdditionalProps <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
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




interface Document<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends DocumentBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          DocumentMetadata,
          DocumentStatus,
          DocumentAdditionalProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
{
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
  _rev?: string;
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
}


  
export interface DocumentStore<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
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
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): DocumentStore<T, K, Meta, ExcludedFields, IncludedFields, AttachmentType> => {
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
      NotificationTypeEnum.OperationSuccess
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
      NotificationTypeEnum.OperationSuccess
    );
  };

  const loadCalendarEventsDocumentContent = async (
    eventId: string,
    area?: string
  ): Promise<DocumentContent<T, K, StructuredMetadata<T, K>>> => {
    try {
      const response = await axiosInstance.get(`/api/calendar-events/${eventId}/document-content`);
      const meta: StructuredMetadata<T, K> = useMeta<T, K>(area);
      const metadata: UnifiedMetadata<T, K> = useMetadata<T, K>(area);

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
      NotificationTypeEnum.OperationSuccess
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

  const store: DocumentStore<T, K, Meta, ExcludedFields, IncludedFields, AttachmentType> = makeAutoObservable({
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
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
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
