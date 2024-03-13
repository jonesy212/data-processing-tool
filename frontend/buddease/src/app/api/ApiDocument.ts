// ApiDocument.ts

import { NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import { AxiosError } from 'axios';
import dotProp from 'dot-prop';
import { DocumentData } from '../components/documents/DocumentBuilder';
import { WritableDraft } from '../components/state/redux/ReducerGenerator';
import { endpoints } from './ApiEndpoints';
import { handleApiError } from './ApiLogs';
import axiosInstance from './axiosInstance';
import headersConfig from './headers/HeadersConfig';

// Define the API base URL
const API_BASE_URL = endpoints.documents;

// Define the API base URL for downloading documents
const DOWNLOAD_API_BASE_URL = endpoints.documents;


// Define the allowed formats for downloading documents
const allowedFormats = ['pdf', 'docx', 'txt'];

interface DocumentNotificationMessages {
  FETCH_DOCUMENT_SUCCESS: string;
  FETCH_DOCUMENT_ERROR: string;
  ADD_DOCUMENT_SUCCESS: string;
  ADD_DOCUMENT_ERROR: string;
  UPDATE_DOCUMENT_SUCCESS: string;
  UPDATE_DOCUMENT_ERROR: string;
  DELETE_DOCUMENT_SUCCESS: string;
  DELETE_DOCUMENT_ERROR: string;
  // Add more keys as needed
}

// Define API notification messages
const apiNotificationMessages: DocumentNotificationMessages = {
  FETCH_DOCUMENT_SUCCESS: 'Document fetched successfully',
  FETCH_DOCUMENT_ERROR: 'Failed to fetch document',
  ADD_DOCUMENT_SUCCESS: 'Document added successfully',
  ADD_DOCUMENT_ERROR: 'Failed to add document',
  UPDATE_DOCUMENT_SUCCESS: 'Document updated successfully',
  UPDATE_DOCUMENT_ERROR: 'Failed to update document',
  DELETE_DOCUMENT_SUCCESS: 'Document deleted successfully',
  DELETE_DOCUMENT_ERROR: 'Failed to delete document',
  // Add more properties as needed
};

// Function to handle API errors and notify
const handleDocumentApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessage: string,
  errorMessageId: string
) => {
  handleApiError(error, errorMessage);
  if (errorMessageId) {
    const errorMessageText = dotProp.getProperty(apiNotificationMessages, errorMessageId);
    useNotification().notify(
      errorMessageId,
      errorMessageText as unknown as string,
      null,
      new Date(),
      'DocumentError' as NotificationTypeEnum
    );
  }
};

export const fetchDocumentByIdAPI = async (
    documentId: number,
    dataCallback: (data: WritableDraft<DocumentData>) => void
  ): Promise<any> => {
    try {
      const fetchDocumentEndpoint = `${API_BASE_URL}/documents/${documentId}`;
      const response = await axiosInstance.get(fetchDocumentEndpoint, {
        headers: headersConfig,
      });
  
      // Call the provided data callback with the fetched document data
      dataCallback(response.data);
  
      // Return the fetched document data if needed
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      const errorMessage = 'Failed to fetch document';
      handleDocumentApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'FETCH_DOCUMENT_ERROR'
      );
      throw error;
    }
  };
  




export const addDocumentAPI = async (documentData: any): Promise<any> => {
    try {
      const addDocumentEndpoint = `${API_BASE_URL}/documents`;
      const response = await axiosInstance.post(addDocumentEndpoint, documentData, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding document:', error);
      const errorMessage = 'Failed to add document';
      handleDocumentApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'ADD_DOCUMENT_ERROR'
      );
      throw error;
    }
  };
  
  export const updateDocumentAPI = async (documentId: number, updatedData: any): Promise<any> => {
    try {
      const updateDocumentEndpoint = `${API_BASE_URL}/documents/${documentId}`;
      const response = await axiosInstance.put(updateDocumentEndpoint, updatedData, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating document:', error);
      const errorMessage = 'Failed to update document';
      handleDocumentApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'UPDATE_DOCUMENT_ERROR'
      );
      throw error;
    }
  };
  
  export const deleteDocumentAPI = async (documentId: number): Promise<void> => {
    try {
      const deleteDocumentEndpoint = `${API_BASE_URL}/documents/${documentId}`;
      await axiosInstance.delete(deleteDocumentEndpoint, {
        headers: headersConfig,
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      const errorMessage = 'Failed to delete document';
      handleDocumentApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'DELETE_DOCUMENT_ERROR'
      );
      throw error;
    }
  };



  export const fetchAllDocumentsAPI = async (): Promise<any[]> => {
    try {
      const fetchAllDocumentsEndpoint = `${API_BASE_URL}/documents`;
      const response = await axiosInstance.get(fetchAllDocumentsEndpoint, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all documents:', error);
      const errorMessage = 'Failed to fetch all documents';
      handleDocumentApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'FETCH_DOCUMENT_ERROR'
      );
      throw error;
    }
  };

  

  
// Add the searchDocument method
export const searchDocumentAPI = async (searchQuery: string): Promise<any> => {
    try {
      const searchDocumentEndpoint = `${API_BASE_URL}/documents/search?query=${encodeURIComponent(searchQuery)}`;
      const response = await axiosInstance.get(searchDocumentEndpoint, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      console.error('Error searching documents:', error);
      const errorMessage = 'Failed to search documents';
      handleDocumentApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'SEARCH_DOCUMENT_ERROR'
      );
      throw error;
    }
  };
  
  // Add the filterDocuments method
  export const filterDocumentsAPI = async (filters: Record<string, any>): Promise<any> => {
    try {
      // Construct the filter query based on the provided filters
      const filterQuery = Object.entries(filters)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      const filterDocumentEndpoint = `${API_BASE_URL}/documents/filter?${filterQuery}`;
      const response = await axiosInstance.get(filterDocumentEndpoint, {
        headers: headersConfig,
      });
      return response.data;
    } catch (error) {
      console.error('Error filtering documents:', error);
      const errorMessage = 'Failed to filter documents';
      handleDocumentApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'FILTER_DOCUMENTS_ERROR'
      );
      throw error;
    }
  };



// Download Document Method
export const downloadDocument = async (documentId: number, format: string): Promise<Blob> => {
    try {
      // Validate the requested format
      if (!allowedFormats.includes(format.toLowerCase())) {
        throw new Error(`Unsupported format: ${format}`);
      }
  
      // Construct the download URL
      const downloadUrl = `${DOWNLOAD_API_BASE_URL}/documents/${documentId}/download?format=${format.toLowerCase()}`;
  
      // Send a GET request to download the document
      const response = await axiosInstance.get(downloadUrl, {
        responseType: 'blob', // Set response type to blob for binary data
      });
  
      // Return the downloaded document content
      return response.data;
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
};
  

export const listDocuments = async (): Promise<Document[]> => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/api/documents`);
      return response.data;
    } catch (error) {
      console.error('Error listing documents:', error);
      throw error;
    }
  };

  

  export const addDocument = async (newDocument: Document): Promise<Document> => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/api/documents`, newDocument);
      return response.data;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  };

  
  export const removeDocument = async (documentId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_BASE_URL}/api/documents/${documentId}`);
    } catch (error) {
      console.error('Error removing document:', error);
      throw error;
    }
  };

  
  export const updateDocument = async (documentId: string, updatedDocument: Document): Promise<Document> => {
    try {
      const response = await axiosInstance.put(`${API_BASE_URL}/api/documents/${documentId}`, updatedDocument);
      return response.data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  };
  
  
  
  
  
  
// Add more functions for adding, updating, and deleting documents as needed
