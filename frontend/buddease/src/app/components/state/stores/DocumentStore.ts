import { endpoints } from "@/app/api/ApiEndpoints";
import { BaseData } from '@/app/components/models/data/Data';
import { useNotification } from '@/app/components/support/NotificationContext';
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { useMeta } from "@/app/configs/useMeta";
import { useMetadata } from "@/app/configs/useMetadata";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { AxiosError } from "axios";
import { makeAutoObservable } from "mobx";
import { useMemo, useState } from "react";
import { DocumentData } from "../../documents/DocumentBuilder";
import { DocumentPath } from "../../documents/DocumentGenerator";
import { DocumentPhaseTypeEnum } from "../../documents/DocumentPhaseType";
import { Content } from "../../models/content/AddContent";
import { Comment } from "../../models/data/Comments";
import { ProjectPhaseTypeEnum } from "../../models/data/StatusType";
import { ProgressPhase } from "../../models/tracker/ProgressBar";
import axiosInstance from "../../security/csrfToken";
import { TagsRecord } from "../../snapshots";
import { NotificationTypeEnum } from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { AllTypes } from "../../typings/PropTypes";
import { userService } from "../../users/ApiUser";
import { UserRoleEnum } from "../../users/UserRoles";
import { CustomComment } from "../redux/slices/BlogSlice";


type PhaseTypeEnums = ProgressPhase | ProjectPhaseTypeEnum | DocumentPhaseTypeEnum | undefined;
// Define the type for the document content
interface DocumentContent<
  T extends  BaseData<any>, 
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
> {
  eventId: string;
  content: Content<T, K>,
  meta: Meta; 
  metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>; 
  // Add more properties as needed
}

interface DocumentBase<
  T extends  BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
  > {
  id: string | number;
  title: string;
  content: Content<T, K>;
  description?: string | null | undefined;
  tags?: TagsRecord<T, K> | string[] | undefined; 
  createdAt: string | Date | undefined;
  updatedAt?: string | Date;
  createdBy: string | undefined;
  updatedBy: string;
  visibility: AllTypes;
  phaseType: PhaseTypeEnums;
  documentData?: DocumentData<T, K>;
  comments?: number | (Comment<T, K, Meta> | CustomComment)[] | undefined;
  // selectedDocument: DocumentData<T> | null;
  selectedDocuments?: DocumentData<T, K>[];
  
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
  ownerDocument: Document<T, K> | null;
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
  onfullscreenchange?: ((this: Document<T, K>, ev: Event) => any) | null;
  onfullscreenerror?: ((this: Document<T, K>, ev: Event) => any) | null;

  onpointerlockerror?: ((this: Document<T, K>, ev: Event) => any) | null;
  onpointerlockchange?: ((this: Document<T, K>, ev: Event) => any) | null
  onreadystatechange?: ((this: Document<T, K>, ev: Event) => any) | null;
  onvisibilitychange?: ((this: Document<T, K>, ev: Event) => any) | null;
  pictureInPictureEnabled?: boolean;

  plugins?: any;
  referrer: string;
  rootElement: Element | null;
  scripts?: any;
  visibilityState?: string;
  vliinkColor?: string;
}




interface Document<
  T extends  BaseData<any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> extends DocumentBase<T, K>, DocumentMetadata, DocumentStatus, DocumentAdditionalProps<T, K>  {
  // name: string | undefined;
  bgColor: string;
  documentURI: string;
  currentScript: string | null;
  defaultView: Window | undefined;
  phaseType: PhaseTypeEnums;
  doctype: DocumentType | null;
  ownerDocument: Document<T, K> | null;
  scrollingElement: Element | null;
  requiredRole?: UserRoleEnum;
  timeline: DocumentTimeline | undefined;
  filePath?: DocumentPath<T, K, Meta>;
  documentData?: DocumentData<T, K>;
  isPrivate?: boolean;
  _rev: string | undefined;
  _attachments?: Record<string, any> | undefined;
  _links?: Record<string, any> | undefined;
  _etag?: string;
  _local?: boolean;
  _revs?: string[];
  _source?: Record<string, any> | undefined;
  _shards?: Record<string, any> | undefined;
  _size?: number;
  _version?: number;
    _version_conflicts?: number;
  _seq_no?: number;
  _primary_term?: number;
  _routing?: string;
  _parent?: string;
  _parent_as_child?: boolean;
  _slices?: any[];
  _highlight?: Record<string, any> | undefined;
  _highlight_inner_hits?: Record<string, any> | undefined;
  _source_as_doc?: boolean;
  _source_includes?: string[];
  _routing_keys?: string[];
  _routing_values?: string[];
  _routing_values_as_array?: string[];
  _routing_values_as_array_of_objects?: Record<string, any>[];
  _routing_values_as_array_of_objects_with_key?: Record<string, any>[];
  _routing_values_as_array_of_objects_with_key_and_value?: Record<string, any>[];
  _routing_values_as_array_of_objects_with_key_and_value_and_value?: Record<
    string,
    any
  >[];
}

  
export interface DocumentStore <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  documents: Record<string, Document<T, K>>;
  fetchDocuments: () => void;
  getSnapshotDataKey: (documentId: string, eventId: number, userId: string) => string;
  updateDocumentReleaseStatus: (id: number, eventId: number, status: string, isReleased: boolean) => void;
  getData: (id: string) => Document<T, K> | undefined;
  addDocument: (document: Document<T, K>, content: Content<T, K>) => void;
  setDocumentReleaseStatus: (id: number, eventId: number, status: string, isReleased: boolean) => void;
  updateDocument: (id: number, updatedDocument: Document<T, K>) => void;
  deleteDocument: (id: number) => void;
  updateDocumentTags: (id: number, newTags: string[]) => void;
  selectedDocument: DocumentData<T, K, Meta> | null; // Specify type arguments for DocumentData
  selectedDocuments: Document<T, K>[] | undefined;
  // Add more methods as needed
}

const useDocumentStore = <
  T extends  BaseData<any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(): DocumentStore<T, K> => {
  const [documents, setDocuments] = useState<Record<string, Document<T, K>>>({});
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

  const addDocument = (document: Document<T, K>) => {
    setDocuments((prevDocuments) => ({
      ...prevDocuments,
      [document.id]: document,
    }));
    notify(
      "addDocumentSuccess",
      "Document added successfully",
      NOTIFICATION_MESSAGES.Document.ADD_DOCUMENT_SUCCESS,
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
    const documentId = await axiosInstance.delete(`${endpoints.documents.deleteDocument}/${id}`);
    notify(
      "deletedDocumentSuccess",
      `You have successfully deleted the document ${documentId}`,
      NOTIFICATION_MESSAGES.Document.DELETE_DOCUMENT_SUCCESS,
      new Date(),
      NotificationTypeEnum.OperationSuccess
    ); // Notify success
  };

  // Function to load document content for calendar events
  const loadCalendarEventsDocumentContent = async (eventId: string, area: string | undefined): Promise<DocumentContent<T, K, StructuredMetadata<T, K>>> => {
    try {
      // Fetch document content from the backend based on the event ID
      const response = await axiosInstance.get(`/api/calendar-events/${eventId}/document-content`);
      const meta: StructuredMetadata<T, K> = useMeta<T, K>(area)
      const metadata: UnifiedMetaDataOptions<T, K> = useMetadata<T, K>(area)
    // Extract the content from the response data
    const content = response.data.content;
    
    // Return the document content along with the event ID
    return {
      eventId: eventId,
      content: content,
      meta: meta, 
      metadata: metadata
    };
  } catch (error) {
    // Handle errors
    console.error("Error loading document content for calendar event:", error);
    throw error;
  }
};


  const selectedDocument = useMemo(() => {
    return Object.values(documents).find((document) => document.id === selectedDocumentId);
  }, [documents, selectedDocumentId]);
  
  const selectedDocuments = useMemo(() => {
    return Object.values(documents).filter((document) => document.id === selectedDocumentId);
  }, [documents, selectedDocumentId]);

  const getSnapshotDataKey = (documentId: string, eventId: number, userId: string): string => {
    // Generate a unique key for snapshot data using documentId, eventId, and userId
    return `documents.${userId}.${documentId}.event.${eventId}`;
  };
  
  const getUserIdAndSnapshotDataKey = async (userId: string, documentId: string) => {
    try {
      const fetchedUserId = await userService.fetchUserById(userId);
      if (!fetchedUserId) {
        throw new Error('User ID not found');
      }
      const snapshotDataKey = UniqueIDGenerator.generateSnapshotDataKey(documentId, userId);
      return { fetchedUserId, snapshotDataKey };
    } catch (error) {
      handleError(error as AxiosError, 'Failed to fetch user');
      throw error;
    }
  };

  const updateDocument = (id: number, updatedDocument: Document<T, K>) => {
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
    ); // Notify success
  };


  const getData = (id: string) => {
    return documents[id];
  }


  const handleError = (error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    setError(`Error ${action}: ${error.message || "Unknown error"}`);
    notify(
      `Error ${action}`,
      error.message || "Unknown error",
      "Failed to perform action",
      new Date(),
      NotificationTypeEnum.Error
    );
  };

  const updateDocumentTags = async (id: number, tags: string[]) => {
    try {
      const response = await fetch(endpoints.documents.updateDocumentTags.toString(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          tags,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update document tags");
      }
      const data = await response.json();
      updateDocument(id, data);
    } catch (error) {
      handleError(error, "updating document tags");
    } finally {
      setIsLoading(false);
    }
  };



  const updateDocumentReleaseStatus = async (
    id: number, 
    eventId: number,
    status: string, 
    isReleased: boolean
  ) => {
    try {
      const response = await fetch(endpoints.documents.updateDocumentReleaseStatus.toString(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
          isReleased,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update document release status");
      }
  
      const data = await response.json();
      updateDocument(id, data); // Assuming updateDocument is a function that handles the updated data
    } catch (error) {
      handleError(error, "updating document release status");
    } finally {
      setIsLoading(false); // Assuming setIsLoading is a state setter to indicate loading status
    }
  };
  
  const setDocumentReleaseStatus = async (id: number, eventId: number, releaseStatus: string) => {
    try {
      const response = await fetch(endpoints.documents.updateDocumentReleaseStatus.toString(), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          releaseStatus,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update document release status");
      }
      const data = await response.json();
      updateDocument(id, data);
    } catch (error) {
      handleError(error, "updating document release status");
    } finally {
      setIsLoading(false);
    }
  };

  const store: DocumentStore<T, K> = makeAutoObservable({
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
    setDocumentReleaseStatus
    // Add more methods as needed
  });

  return store;
};

export default useDocumentStore;
export type { Document, DocumentBase, DocumentMetadata, PhaseTypeEnums };

