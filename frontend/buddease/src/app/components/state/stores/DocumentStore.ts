import { endpoints } from "@/app/api/ApiEndpoints";
import { useNotification } from '@/app/components/support/NotificationContext';
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { DocumentData } from "../../documents/DocumentBuilder";
import { DocumentPath, DocumentTypeEnum } from "../../documents/DocumentGenerator";
import { Comment } from "../../models/data/Data";
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

interface Document extends DocumentData {
  id: number;
  title: string;
  type: DocumentTypeEnum;
  content: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  updatedBy: string;
  documentData: any;
  filePath?: DocumentPath;
  visibility: AllTypes
  comments?: Comment[]

    // Other properties
}
  
export interface DocumentStore {
  documents: Record<string, Document>;
  fetchDocuments: () => void;
  
  addDocument: (document: Document) => void;
  updateDocument: (id: number, updatedDocument: Document) => void;
  deleteDocument: (id: string) => void;
  updateDocumentTags: (id: number, newTags: string[]) => void;
  // Add more methods as needed
}

const useDocumentStore = (): DocumentStore => {
  const [documents, setDocuments] = useState<Record<string, Document>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotification();



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
    loadCalendarEventsDocumentContent
    // Add more methods as needed
  });

  return store;
};

export default useDocumentStore;
export type { Document };

