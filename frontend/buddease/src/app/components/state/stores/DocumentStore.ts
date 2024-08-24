import { endpoints } from "@/app/api/ApiEndpoints";
import { useNotification } from '@/app/components/support/NotificationContext';
import { makeAutoObservable } from "mobx";
import { useMemo, useState } from "react";
import { DocumentData } from "../../documents/DocumentBuilder";
import { DocumentPath } from "../../documents/DocumentGenerator";
import { Comment } from "../../models/data/Data";
import { Tag } from "../../models/tracker/Tag";
import axiosInstance from "../../security/csrfToken";
import { NotificationTypeEnum } from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { AllTypes } from "../../typings/PropTypes";



// Define the type for the document content
interface DocumentContent {
  eventId: string;
  content: string;
  // Add more properties as needed
}

interface DocumentBase {
  id: string | number;
  title: string;
  content: string;
  description?: string | null | undefined;
  tags?: string[] | Tag[];
  createdAt: string | Date | undefined;
  updatedAt?: string | Date;
  createdBy: string;
  updatedBy: string;
  visibility: AllTypes;
  comments?: Comment[];
  selectedDocument: DocumentData | null;
  selectedDocuments?: DocumentData[];
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

interface DocumentAdditionalProps {
  URL: string;
  bgColor: string;
  documentURI: string;
  currentScript: string | null;
  defaultView: Window | null;
  doctype: DocumentType | null;
  ownerDocument: Document | null;
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
  onfullscreenchange?: ((this: Document, ev: Event) => any) | null;
  onfullscreenerror?: ((this: Document, ev: Event) => any) | null;



  onpointerlockerror?: ((this: Document, ev: Event) => any) | null;
  onpointerlockchange?: ((this: Document, ev: Event) => any) | null
  onreadystatechange?: ((this: Document, ev: Event) => any) | null;
  onvisibilitychange?: ((this: Document, ev: Event) => any) | null;
  pictureInPictureEnabled?: boolean;

  plugins?: any;
  referrer: string;
  rootElement: Element | null;
  scripts?: any;
  visibilityState?: string;
  vliinkColor?: string;

}




  interface Document extends DocumentBase, DocumentMetadata, DocumentStatus, DocumentAdditionalProps  {
  // URL: string | undefined;
  bgColor: string;
  documentURI: string;
  currentScript: string | null;
  defaultView: Window | null;
  doctype: DocumentType | null;
  ownerDocument: Document | null;
  scrollingElement: Element | null;
  timeline: DocumentTimeline | undefined;
  filePath?: DocumentPath;
  documentData?: DocumentData;
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

  
export interface DocumentStore {
  documents: Record<string, Document>;
  fetchDocuments: () => void;
  getSnapshotDataKey: (id: string) => string;
  getData: (id: string) => Document | undefined;
  addDocument: (document: Document) => void;
  updateDocument: (id: number, updatedDocument: Document) => void;
  deleteDocument: (id: string) => void;
  updateDocumentTags: (id: number, newTags: string[]) => void;
  selectedDocument: Document | undefined;
  selectedDocuments: Document[] | undefined;
  // Add more methods as needed
}

const useDocumentStore = (): DocumentStore => {
  const [documents, setDocuments] = useState<Record<string, Document>>({});
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

  const addDocument = (document: Document) => {
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

  const deleteDocument = async (id: string) => {
    setDocuments((prevDocuments) => {
      const updatedDocuments = { ...prevDocuments };
      delete updatedDocuments[id];
      return updatedDocuments;
    });
    const documentId = await axiosInstance.delete(endpoints.documents.deleteDocument + id);
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
  

  const updateDocument = (id: number, updatedDocument: Document) => {
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

  const store: DocumentStore = makeAutoObservable({
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
    selectedDocuments
    // Add more methods as needed
  });

  return store;
};

export default useDocumentStore;
export type { Document, DocumentBase };

