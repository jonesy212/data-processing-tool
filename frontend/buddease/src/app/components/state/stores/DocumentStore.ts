import { endpoints } from "@/app/api/ApiEndpoints";
import { useNotification } from '@/app/components/support/NotificationContext';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { AxiosError } from "axios";
import { makeAutoObservable } from "mobx";
import { useMemo, useState } from "react";
import { DocumentData } from "../../documents/DocumentBuilder";
import { DocumentPath } from "../../documents/DocumentGenerator";
import { Comment, Data } from "../../models/data/Data";
import axiosInstance from "../../security/csrfToken";
import { TagsRecord } from "../../snapshots";
import { NotificationTypeEnum } from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { AllTypes } from "../../typings/PropTypes";
import { userService } from "../../users/ApiUser";
import { UserRoleEnum } from "../../users/UserRoles";
import { Content } from "../../models/content/AddContent";
import { K, T } from "../../models/data/dataStoreMethods";



// Define the type for the document content
interface DocumentContent {
  eventId: string;
  content: string;
  // Add more properties as needed
}

interface DocumentBase<T extends Data> {
  id: string | number;
  title: string;
  content: string;
  description?: string | null | undefined;
  tags?: TagsRecord | string[] | undefined; 
  createdAt: string | Date | undefined;
  updatedAt?: string | Date;
  createdBy: string | undefined;
  updatedBy: string;
  visibility: AllTypes;

  documentData?: DocumentData<T>;
  comments?: Comment[];
  // selectedDocument: DocumentData<T> | null;
  selectedDocuments?: DocumentData<T>[];
  
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

interface DocumentAdditionalProps <T extends Data> {
  URL: string;
  bgColor: string;
  documentURI: string;
  currentScript: string | null;
  defaultView: Window | null;
  doctype: DocumentType | null;
  ownerDocument: Document<T> | null;
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
  onfullscreenchange?: ((this: Document<T>, ev: Event) => any) | null;
  onfullscreenerror?: ((this: Document<T>, ev: Event) => any) | null;

  onpointerlockerror?: ((this: Document<T>, ev: Event) => any) | null;
  onpointerlockchange?: ((this: Document<T>, ev: Event) => any) | null
  onreadystatechange?: ((this: Document<T>, ev: Event) => any) | null;
  onvisibilitychange?: ((this: Document<T>, ev: Event) => any) | null;
  pictureInPictureEnabled?: boolean;

  plugins?: any;
  referrer: string;
  rootElement: Element | null;
  scripts?: any;
  visibilityState?: string;
  vliinkColor?: string;
}




  interface Document<T extends Data> extends DocumentBase<T>, DocumentMetadata, DocumentStatus, DocumentAdditionalProps<T>  {
  // name: string | undefined;
  bgColor: string;
  documentURI: string;
  currentScript: string | null;
  defaultView: Window | null;
  doctype: DocumentType | null;
  ownerDocument: Document<T> | null;
  scrollingElement: Element | null;
  requiredRole?: UserRoleEnum;
  timeline: DocumentTimeline | undefined;
  filePath?: DocumentPath;
  documentData?: DocumentData<T>;
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

  
export interface DocumentStore <T extends Data> {
  documents: Record<string, Document<T>>;
  fetchDocuments: () => void;
  getSnapshotDataKey: (documentId: string, eventId: number, userId: string) => string;
  updateDocumentReleaseStatus: (id: number, eventId: number, status: string, isReleased: boolean) => void;
  getData: (id: string) => Document<T> | undefined;
  addDocument: (document: Document<T>, content: Content<T, K>) => void;
  setDocumentReleaseStatus: (id: number, eventId: number, status: string, isReleased: boolean) => void;
  updateDocument: (id: number, updatedDocument: Document<T>) => void;
  deleteDocument: (id: number) => void;
  updateDocumentTags: (id: number, newTags: string[]) => void;
  selectedDocument: Document<T> | undefined;
  selectedDocuments: Document<T>[] | undefined;
  // Add more methods as needed
}

const useDocumentStore = <T extends Data>(): DocumentStore<T> => {
  const [documents, setDocuments] = useState<Record<string, Document<T>>>({});
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

  const addDocument = (document: Document<T>) => {
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
 const loadCalendarEventsDocumentContent = async (eventId: string): Promise<DocumentContent> => {
  try {
    // Fetch document content from the backend based on the event ID
    const response = await axiosInstance.get(`/api/calendar-events/${eventId}/document-content`);
    
    // Extract the content from the response data
    const content = response.data.content;
    
    // Return the document content along with the event ID
    return {
      eventId: eventId,
      content: content
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

  const updateDocument = (id: number, updatedDocument: Document<T>) => {
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
export type { Document, DocumentBase};

