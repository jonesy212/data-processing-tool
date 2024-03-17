import { endpoints } from "@/app/api/ApiEndpoints";
import { useNotification } from '@/app/components/support/NotificationContext';
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { DocumentData } from "../../documents/DocumentBuilder";
import { DocumentTypeEnum } from "../../documents/DocumentGenerator";
import axiosInstance from "../../security/csrfToken";
import { NotificationTypeEnum } from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";


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
  

  
    // Other properties
}
  
export interface DocumentStore {
  documents: Record<string, Document>;
  fetchDocuments: () => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updatedDocument: Document) => void;
  deleteDocument: (id: string) => void;
  updateDocumentTags: (id: string, newTags: string[]) => void;
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

  const updateDocument = (id: string, updatedDocument: Document) => {
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

  const updateDocumentTags = async (id: string, tags: string[]) => {
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
    // Add more methods as needed
  });

  return store;
};

export default useDocumentStore;
export type { Document };

