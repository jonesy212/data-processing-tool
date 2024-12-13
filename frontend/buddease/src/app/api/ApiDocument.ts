// ApiDocument.ts
import { current } from "immer";
import { LanguageEnum } from '@/app/components/communications/LanguageEnum';
import { Tag } from '@/app/components/models/tracker/Tag';
import { K, T } from './../components/models/data/dataStoreMethods';
import {
    NotificationTypeEnum,
    useNotification,
} from "@/app/components/support/NotificationContext";
import { AxiosError } from "axios";
import { DocumentOptions } from "../components/documents/DocumentOptions";
import { Presentation } from "../components/documents/Presentation";

import {
    createAsyncThunk
} from "node_modules/@reduxjs/toolkit/dist/createAsyncThunk";
import {
    DocumentStatusEnum,
    DocumentTypeEnum,
} from "../components/documents/DocumentGenerator";
import { DocumentObject } from "../components/state/redux/slices/DocumentSlice";
import { DatabaseConfig } from "../configs/DatabaseConfig";
import { DocumentActions } from "../tokens/DocumentActions";
// import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import axiosInstance from "./axiosInstance";
import headersConfig from "./headers/HeadersConfig";


import { ClientInformation, CustomMediaSession } from '../components/database/ClientInformation';
import { DocumentData } from '../components/documents/DocumentBuilder';
import { BaseData } from '../components/models/data/Data';
import FileData from '../components/models/data/FileData';
import { WritableDraft } from "../components/state/redux/ReducerGenerator";
import { Document } from '../components/state/stores/DocumentStore';
import { User } from '../components/users/User';
import { endpoints } from './endpointConfigurations';
import { Content } from '../components/models/content/AddContent';
import { StructuredMetadata } from '../configs/StructuredMetadata';
import { Task } from "../components/models/tasks/Task";
// Define the API base URL
const API_BASE_URL = endpoints.data.documents;

// Define the API base URL for downloading documents
const DOWNLOAD_API_BASE_URL = endpoints.documents;

// Define the allowed formats for downloading documents
const allowedFormats = ["pdf", "docx", "txt", "csv"];

interface DocumentNotificationMessages {
  FETCH_DOCUMENT_SUCCESS: string;
  FETCH_DOCUMENT_ERROR: string;
  ADD_DOCUMENT_SUCCESS: string;
  ADD_DOCUMENT_ERROR: string;
  UPDATE_DOCUMENT_SUCCESS: string;
  UPDATE_DOCUMENT_ERROR: string;
  DELETE_DOCUMENT_SUCCESS: string;
  DELETE_DOCUMENT_ERROR: string;
  UPDATE_DOCUMENT_NAME_SUCCESS: string;
  UPDATE_DOCUMENT_NAME_ERROR: string;
  SEARCH_DOCUMENT_ERROR: string;
  FILTER_DOCUMENTS_ERROR: string;
  DOWNLOAD_DOCUMENT_ERROR: string;
  LIST_DOCUMENTS_ERROR: string;
  REMOVE_DOCUMENT_ERROR: string;
  SEARCH_DOCUMENTS_ERROR: string;
  UPLOAD_DOCUMENT_ERROR: string;

  SHARE_DOCUMENT_ERROR: string; 
LOCK_DOCUMENT_ERROR: string;
UNLOCK_DOCUMENT_ERROR: string;
ARCHIVE_DOCUMENT_ERROR: string;
RESTORE_DOCUMENT_ERROR: string;
MOVE_DOCUMENT_ERROR: string;
MERGE_DOCUMENTS_ERROR: string;
SPLIT_DOCUMENT_ERROR: string;
VALIDATE_DOCUMENT_ERROR: string;
ENCRYPT_DOCUMENT_ERROR: string;
DECRYPT_DOCUMENT_ERROR: string;
TRACK_DOCUMENT_CHANGES_ERROR: string;
COMPARE_DOCUMENTS_ERROR: string;
TAG_DOCUMENTS_ERROR: string;
CATEGORIZE_DOCUMENTS_ERROR: string;
CUSTOMIZE_DOCUMENT_VIEW_ERROR: string;
COMMENT_ON_DOCUMENT_ERROR: string;
MENTION_USER_IN_DOCUMENT_ERROR: string;
ASSIGN_TASK_IN_DOCUMENT_ERROR: string;
REQUEST_REVIEW_OF_DOCUMENT_ERROR: string;
APPROVE_DOCUMENT_ERROR: string;
REJECT_DOCUMENT_ERROR: string;
REQUEST_FEEDBACK_ON_DOCUMENT_ERROR: string;
PROVIDE_FEEDBACK_ON_DOCUMENT_ERROR: string;
RESOLVE_FEEDBACK_ON_DOCUMENT_ERROR: string;
COLLABORATIVE_EDITING_ERROR: string;
SMART_TAGGING_ERROR: string;
DOCUMENT_ANNOTATION_ERROR: string;
DOCUMENT_ACTIVITY_LOGGING_ERROR: string;
INTELLIGENT_DOCUMENT_SEARCH_ERROR: string;
GET_DOCUMENT_VERSIONS_ERROR: string;
UPDATE_SNAPSHOT_DETAILS_ERROR: string;
CREATE_DOCUMENT_VERSION_ERROR: string;
REVERT_TO_DOCUMENT_VERSION_ERROR: string;
VIEW_DOCUMENT_HISTORY_ERROR: string;
DOCUMENT_VERSION_COMPARISON_ERROR: string;
GRANT_DOCUMENT_ACCESS_ERROR: string;
REVOKE_DOCUMENT_ACCESS_ERROR: string;
MANAGE_DOCUMENT_PERMISSIONS_ERROR: string;
INITIATE_DOCUMENT_WORKFLOW_ERROR: string;
AUTOMATE_DOCUMENT_TASKS_ERROR: string;
TRIGGER_DOCUMENT_EVENTS_ERROR: string;

DOCUMENT_APPROVAL_WORKFLOW_ERROR: string;
DOCUMENT_LIFECYCLE_MANAGEMENT_ERROR: string;
CONNECT_WITH_EXTERNAL_SYSTEM_ERROR: string;
SYNCHRONIZE_WITH_CLOUD_STORAGE_ERROR: string;
IMPORT_FROM_EXTERNAL_ERROR: string;
EXPORT_TO_EXTERNAL_ERROR: string;
GENERATE_DOCUMENT_ERROR: string;
GENERATE_DOCUMENT_REPORT_ERROR: string;
EXPORT_DOCUMENT_REPORT_ERROR: string;
SCHEDULE_REPORT_GENERATION_ERROR: string;
CUSTOMIZE_REPORT_SETTINGS_ERROR: string;
BACKUP_DOCUMENTS_ERROR: string;
RETRIEVE_BACKUP_ERROR: string;
DOCUMENT_REDACTION_ERROR: string;
DOCUMENT_ACCESS_CONTROLS_ERROR: string;
GET_DOCUMENT_ERROR: string;
DOCUMENT_TEMPLATES_ERROR: string;
  // Add more keys as needed
}

// Define API notification messages
const apiNotificationMessages: DocumentNotificationMessages = {
  FETCH_DOCUMENT_SUCCESS: "Document fetched successfully",
  FETCH_DOCUMENT_ERROR: "Failed to fetch document",
  ADD_DOCUMENT_SUCCESS: "Document added successfully",
  ADD_DOCUMENT_ERROR: "Failed to add document",
  UPDATE_DOCUMENT_SUCCESS: "Document updated successfully",
  UPDATE_DOCUMENT_ERROR: "Failed to update document",
  DELETE_DOCUMENT_SUCCESS: "Document deleted successfully",
  DELETE_DOCUMENT_ERROR: "Failed to delete document",
  UPDATE_DOCUMENT_NAME_SUCCESS: "Document updated name successfully",
  UPDATE_DOCUMENT_NAME_ERROR:  "Failed to update document name",
  SEARCH_DOCUMENT_ERROR: "Failed to search document",
  FILTER_DOCUMENTS_ERROR: "Failed to filter documents",
  DOWNLOAD_DOCUMENT_ERROR: "Failed to download document",
  LIST_DOCUMENTS_ERROR: "Failed to list documents",
  REMOVE_DOCUMENT_ERROR: "Failed to remove document",
  SEARCH_DOCUMENTS_ERROR: "Failed to search documents",
  UPLOAD_DOCUMENT_ERROR: "Failed to upload document",
  SHARE_DOCUMENT_ERROR: "An error occurred while sharing the document. Please check the sharing settings and try again.",

  LOCK_DOCUMENT_ERROR: "Failed to lock the document. Ensure it is not already locked and retry.",
  UNLOCK_DOCUMENT_ERROR: "An error occurred while unlocking the document. Please try again or contact support.",
  ARCHIVE_DOCUMENT_ERROR: "Failed to archive the document. Verify the document status and retry.",
  RESTORE_DOCUMENT_ERROR: "An error occurred while restoring the document. Please ensure the document is eligible for restoration.",
  MOVE_DOCUMENT_ERROR: "An error occurred while moving the document. Please verify the destination and try again.",
  MERGE_DOCUMENTS_ERROR: "Failed to merge the documents. Ensure they are compatible for merging and retry.",
  SPLIT_DOCUMENT_ERROR: "An error occurred while splitting the document. Please verify the split criteria and try again.",
  VALIDATE_DOCUMENT_ERROR: "Document validation failed. Please check the document's content and format.",
  ENCRYPT_DOCUMENT_ERROR: "An error occurred while encrypting the document. Please review the encryption settings and retry.",
  DECRYPT_DOCUMENT_ERROR: "Failed to decrypt the document. Ensure the encryption key is correct and try again.",
  TRACK_DOCUMENT_CHANGES_ERROR: "An error occurred while tracking changes in the document. Please retry or check the document's status.",
  COMPARE_DOCUMENTS_ERROR: "Failed to compare the documents. Ensure they are accessible and retry.",
  TAG_DOCUMENTS_ERROR: "An error occurred while tagging the documents. Please verify the tag settings and try again.",
  CATEGORIZE_DOCUMENTS_ERROR: "Failed to categorize the documents. Please review the categorization criteria and retry.",
  CUSTOMIZE_DOCUMENT_VIEW_ERROR: "An error occurred while customizing the document view. Please check the view settings and try again.",
  COMMENT_ON_DOCUMENT_ERROR: "Failed to add a comment to the document. Please retry and ensure you have permission to comment.",
  MENTION_USER_IN_DOCUMENT_ERROR: "An error occurred while mentioning the user in the document. Please verify the user's details and try again.",
  ASSIGN_TASK_IN_DOCUMENT_ERROR: "Failed to assign a task within the document. Ensure the task details are correct and retry.",
  REQUEST_REVIEW_OF_DOCUMENT_ERROR: "An error occurred while requesting a review of the document. Please verify the review details and try again.",
  APPROVE_DOCUMENT_ERROR: "Failed to approve the document. Please check the approval criteria and retry.",
  REJECT_DOCUMENT_ERROR: "An error occurred while rejecting the document. Please verify the rejection reason and try again.",
  REQUEST_FEEDBACK_ON_DOCUMENT_ERROR: "Failed to request feedback on the document. Please check the feedback request details and retry.",
  PROVIDE_FEEDBACK_ON_DOCUMENT_ERROR: "An error occurred while providing feedback on the document. Please ensure the feedback meets the required format.",
  RESOLVE_FEEDBACK_ON_DOCUMENT_ERROR: "Failed to resolve feedback on the document. Please review the feedback resolution criteria.",
  COLLABORATIVE_EDITING_ERROR: "An error occurred during collaborative editing of the document. Please ensure all participants are connected.",
  SMART_TAGGING_ERROR: "Failed to apply smart tagging to the document. Verify the tagging rules and try again.",
  DOCUMENT_ANNOTATION_ERROR: "An error occurred while annotating the document. Please check the annotation details and retry.",
  DOCUMENT_ACTIVITY_LOGGING_ERROR: "Failed to log the document activity. Please ensure the activity meets logging criteria.",
  INTELLIGENT_DOCUMENT_SEARCH_ERROR: "An error occurred during intelligent document search. Please verify the search parameters and retry.",
  GET_DOCUMENT_VERSIONS_ERROR: "Failed to retrieve the document versions. Please ensure the document has version history.",
  UPDATE_SNAPSHOT_DETAILS_ERROR: "An error occurred while updating the snapshot details. Please check the snapshot settings and retry.",
  CREATE_DOCUMENT_VERSION_ERROR: "Failed to create a new document version. Please verify the document state and retry.",
  REVERT_TO_DOCUMENT_VERSION_ERROR: "An error occurred while reverting to a previous document version. Please verify the version details.",
  VIEW_DOCUMENT_HISTORY_ERROR: "Failed to view the document history. Ensure the document has a history log.",
  DOCUMENT_VERSION_COMPARISON_ERROR: "An error occurred while comparing document versions. Please verify the versions and retry.",
  GRANT_DOCUMENT_ACCESS_ERROR: "Failed to grant access to the document. Verify the access settings and try again.",
  REVOKE_DOCUMENT_ACCESS_ERROR: "An error occurred while revoking document access. Please check the access settings and retry.",
  MANAGE_DOCUMENT_PERMISSIONS_ERROR: "Failed to manage the document permissions. Please review the permission settings.",
  INITIATE_DOCUMENT_WORKFLOW_ERROR: "An error occurred while initiating the document workflow. Verify the workflow parameters and retry.",
  AUTOMATE_DOCUMENT_TASKS_ERROR: "Failed to automate the document tasks. Please review the automation rules.",
  TRIGGER_DOCUMENT_EVENTS_ERROR: "An error occurred while triggering document events. Please ensure the events are correctly configured.",
  DOCUMENT_APPROVAL_WORKFLOW_ERROR: "An error occurred while processing the document approval workflow. Please try again or contact support if the issue persists.",
  DOCUMENT_LIFECYCLE_MANAGEMENT_ERROR: "An error occurred during the document lifecycle management process. Please review the workflow and retry.",
  CONNECT_WITH_EXTERNAL_SYSTEM_ERROR: "Failed to connect with the external system. Ensure the system is available and check your integration settings.",
  SYNCHRONIZE_WITH_CLOUD_STORAGE_ERROR: "An error occurred while synchronizing with cloud storage. Verify the connection settings and try again.",
  IMPORT_FROM_EXTERNAL_ERROR: "An error occurred while importing data from the external source. Please check the source format and retry.",
  EXPORT_TO_EXTERNAL_ERROR: "Failed to export data to the external destination. Ensure the destination is accessible and check the export settings.",
  GENERATE_DOCUMENT_ERROR: "An error occurred while generating the document. Please review the document settings and try again.",
  GENERATE_DOCUMENT_REPORT_ERROR: "An error occurred while generating the document report. Verify the report parameters and retry.",
  EXPORT_DOCUMENT_REPORT_ERROR: "Failed to export the document report. Ensure the export location is available and retry.",
  SCHEDULE_REPORT_GENERATION_ERROR: "An error occurred while scheduling the report generation. Please review the schedule settings and try again.",
  CUSTOMIZE_REPORT_SETTINGS_ERROR: "An error occurred while customizing the report settings. Verify the configuration and try again.",
  BACKUP_DOCUMENTS_ERROR: "Failed to create a backup of the documents. Please check the backup settings and retry.",
  RETRIEVE_BACKUP_ERROR: "An error occurred while retrieving the document backup. Ensure the backup file is available and try again.",
  DOCUMENT_REDACTION_ERROR: "An error occurred during the document redaction process. Please check the document content and retry.",
  DOCUMENT_ACCESS_CONTROLS_ERROR: "Failed to apply the document access controls. Verify the access settings and try again.",
  GET_DOCUMENT_ERROR: "An error occurred while retrieving the document. Please ensure the document is accessible and try again.",
  DOCUMENT_TEMPLATES_ERROR: "An error occurred while processing the document templates. Verify the template settings and try again.",
  // Add more properties as needed
};

// Function to handle API errors and notify
const handleDocumentApiErrorAndNotify = (
  error: AxiosError<unknown>,
  errorMessageId: keyof DocumentNotificationMessages
) => {
  const errorMessage = apiNotificationMessages[errorMessageId]
  handleApiError(error, errorMessage);
  if (errorMessageId) {
    useNotification().notify(
      errorMessageId,
      'Document error',
      null,
      new Date(),
      "DocumentError" as NotificationTypeEnum
    );
  }
};


const fakeApiCall = (documentId: number): Promise<DocumentObject<T, K<T>>> => {
  // Simulate an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: documentId,
        status: DocumentStatusEnum.Draft,
        type: DocumentTypeEnum.Document,
        // Other properties as needed
      } as DocumentObject<T, K<T>>);
    }, 1000);
  });
};

// Define an async thunk action creator to update the document name
const updateDocumentName = createAsyncThunk<
  DocumentObject<T, K<T>>, 
  { documentId: number; newName: string }
>(
  "documents/updateDocumentName",
   ({ documentId, newName }, { dispatch }) => {
    return new Promise<DocumentObject<T, K<T>>>((resolve, reject) => {
      axiosInstance
        .put(
          `${API_BASE_URL}/documents/${documentId}/name`,
          { name: newName },
          {
            headers: headersConfig,
          }
        )
        .then((response) => {
          // Dispatch success notification
          useNotification().notify(
            "UPDATE_DOCUMENT_NAME_SUCCESS",
            apiNotificationMessages.UPDATE_DOCUMENT_NAME_SUCCESS,
            null,
            new Date(),
            "DocumentSuccess" as NotificationTypeEnum
          );
          resolve(response.data as DocumentObject<T, K<T>>);
        })
        .catch((error) => {
          
          console.error("Error updating document name:", error);
          handleDocumentApiErrorAndNotify(
            error as AxiosError<unknown>,
            "UPDATE_DOCUMENT_NAME_ERROR"
          );
          reject(error);
        });
    });
  }
);

// Define an async thunk action creator to fetch a document by ID
const fetchDocumentById = createAsyncThunk<DocumentObject<T, K<T>>, number>(
  "documents/fetchDocumentById",
  (documentId: number, { dispatch }) => {
    return new Promise<DocumentObject<T, K<T>>>((resolve, reject) => {
      axiosInstance
        .get(`${API_BASE_URL}/documents/${documentId}`, {
          headers: headersConfig,
        })
        .then((response) => {
          resolve(response.data as DocumentObject<T, K<T>>);
        })
        .catch((error) => {
          console.error("Error fetching document:", error);
          const errorMessage = "Failed to fetch document";
          handleDocumentApiErrorAndNotify(
            error as AxiosError<unknown>,
      
            "FETCH_DOCUMENT_ERROR"
          );
          reject(error);
        });
    });
  }
);

// Function to convert documentData to WritableDraft<DocumentObject>
const createDraftDocument = <
  T extends  BaseData<any>,
  K extends T = T
  >(
  data: WritableDraft<DocumentObject<T, K>>,
): WritableDraft<DocumentObject<T, K>> => {
  
  const languages: string[] = [...window.navigator.languages];
  const supportedLanguages = languages.filter(lang =>
    Object.values(LanguageEnum).includes(lang as LanguageEnum)
  );

  return {
    ...data,
    artwork: data.artwork ? data.artwork.map(item => ({ ...item })) : [],
    clientInformation: data.clientInformation
      ? {
          ...data.clientInformation,
          mediaSession: data.clientInformation.mediaSession
            ? {
                ...data.clientInformation.mediaSession,
                metadata: data.clientInformation.mediaSession.metadata
                  ? {
                      ...data.clientInformation.mediaSession.metadata,
                      artwork: data.clientInformation.mediaSession.metadata.artwork
                        ? [...data.clientInformation.mediaSession.metadata.artwork]
                        : [],
                    } as WritableDraft<MediaMetadata>
                  : null,
              } as WritableDraft<CustomMediaSession>
            : undefined,
        } as WritableDraft<ClientInformation>
      : undefined,
    supportedLanguages: supportedLanguages.length > 0 ? supportedLanguages : ["en"],
    doctype: data.doctype ? { ...data.doctype } as unknown as WritableDraft<DocumentType> : null,
    ownerDocument: data.ownerDocument ? { ...data.ownerDocument } as unknown as WritableDraft<Document<T, K>> : null,
    scrollingElement: data.scrollingElement ? { ...data.scrollingElement } as unknown as WritableDraft<Element> : null,
    body: data.body as unknown as WritableDraft<HTMLElement> | undefined,
    documentData: {
      ...data.documentData,
      file: data.documentData?.file ? { ...data.documentData.file } as WritableDraft<FileData<T>> : undefined,
      subtasks: data.documentData?.subtasks?.map((subtask) => ({
        ...subtask,
        assignedTo: subtask.assignedTo ? { ...subtask.assignedTo } : null,
        tags: subtask.tags ? Object.values(subtask.tags).map((tag) => ({ ...tag })) : [],
      })) || undefined,
    } as WritableDraft<DocumentData<T, K>>,
    comments: data.comments ? {...data.comments } as WritableDraft<Comment[]> : undefined,
    content: data.content as WritableDraft<Content<T, K>>,
    selectedDocuments: data.selectedDocuments ? data.selectedDocuments.map(doc => ({ ...doc } as WritableDraft<DocumentData<T, K, StructuredMetadata<T, K>>>)) : undefined,
    defaultView: data.defaultView as Window | undefined,
  } as WritableDraft<DocumentObject<T, K>>;

};

const convertToDocumentObject = <
  T extends BaseData<any>, 
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  draft: WritableDraft<DocumentObject<T, K>>
): DocumentObject<T, K, Meta> => {  
  
  return {
    ...draft,
    artwork: draft.artwork ? draft.artwork.map(item => ({ ...item })) : undefined,
    clientInformation: draft.clientInformation
      ? {
          ...draft.clientInformation,
          mediaSession: draft.clientInformation.mediaSession
            ? {
                ...draft.clientInformation.mediaSession,
                metadata: draft.clientInformation.mediaSession.metadata
                  ? {
                      ...draft.clientInformation.mediaSession.metadata,
                      artwork: draft.clientInformation.mediaSession.metadata.artwork
                        ? [...draft.clientInformation.mediaSession.metadata.artwork]
                        : undefined,
                    }
                  : null,
              }
            : undefined,
        }
      : undefined,
      doctype: draft.doctype
      ? { ...draft.doctype } as unknown as DocumentType
      : null,
    ownerDocument: draft.ownerDocument ? { ...draft.ownerDocument } as Document<T, K> : null,
    scrollingElement: draft.scrollingElement
    ? { ...draft.scrollingElement } as unknown as Element
      : null,
    body: draft.body as HTMLElement | undefined,
    documentData: {
      ...draft.documentData,
      file: draft.documentData?.file ? { ...draft.documentData.file } : undefined,
      subtasks: draft.documentData?.subtasks?.map(subtask => ({
        ...subtask,
        assignedTo: subtask.assignedTo ? { ...subtask.assignedTo } : null,
        tags: subtask.tags ? Object.values(subtask.tags).map(tag => ({ ...tag })) : [],
      })) || undefined,
    },
    comments: draft.comments ? [...draft.comments] : undefined,
    content: draft.content as Content<T, K>,
    selectedDocuments: draft.selectedDocuments
      ? draft.selectedDocuments.map(doc => ({ ...doc }))
      : undefined,
    defaultView: draft.defaultView as Window | undefined,
  } as DocumentObject<T, K, Meta>;
};



// Mock API function for fetching a document by ID
const fetchDocumentByIdAPI = <T extends BaseData<any>, K extends T = T>(
  documentId: number,
  updateDocument: (data: WritableDraft<DocumentObject<T, K, StructuredMetadata<T, K>>>) => void
): Promise<DocumentObject<T, K, StructuredMetadata<T, K>>> => {
  return new Promise(async (resolve, reject) => {  // Wrap in a new Promise
    try {
      // Use axios to fetch the document by ID
      const response = await axiosInstance.get(`/api/documents/${documentId}`);
      
      // Parse the document data from the response
      const documentData: DocumentObject<T, K, StructuredMetadata<T, K>> = response.data;

      // Create a draft document for updates
      const draftDocument: WritableDraft<DocumentObject<T, K, StructuredMetadata<T, K>>> = createDraftDocument(documentData as WritableDraft<DocumentObject<T, K, StructuredMetadata<T, K>>>);
      updateDocument(draftDocument);

      // Convert draftDocument back to DocumentObject<T, K> before resolving
      const finalDocument: DocumentObject<T, K, StructuredMetadata<T, K>> = convertToDocumentObject<T, K, StructuredMetadata<T, K>>(
        current(draftDocument) // Convert draft to an immutable state
      );      
      // Resolve the promise with the updated document data
      resolve(finalDocument);
    } catch (error: any) {
      console.error("Error in fetchDocumentByIdAPI:", error);
      const errorMessage = `Failed to fetch document with ID ${documentId}`;
      handleDocumentApiErrorAndNotify(error, "FETCH_DOCUMENT_ERROR");
      
      // Reject the promise with an error
      reject(new Error(errorMessage));
    }
  });
};


const fetchJsonDocumentByIdAPI = async (documentId: string,
  config: DatabaseConfig,
  dataCallback: (data: any) => void
) => {
  try {
    const fetchDocumentEndpoint = `${API_BASE_URL}/documents/${documentId}.json`;
    const response = await axiosInstance.get(fetchDocumentEndpoint, {
      headers: headersConfig,
    });

    dataCallback(response.data);

    return response.data;
  } catch (error: any) {
    const errorMessage = "Failed to fetch JSON document";
    handleDocumentApiErrorAndNotify(
      error.errorMessage,

      "FETCH_DOCUMENT_ERROR"
    );
  }
};

const fetchXmlDocumentByIdAPI = async (
  documentId: string,
  config: DatabaseConfig,
  dataCallback: (data: any) => void
) => {
  try {
    const fetchDocumentEndpoint = `${API_BASE_URL}/documents/${documentId}.xml`;
    const response = await axiosInstance.get(fetchDocumentEndpoint, {
      headers: headersConfig,
    });
    dataCallback(response.data);
    return response.data;
  } catch (error: any) {
    const errorMessage = "Failed to fetch XML document";
    handleDocumentApiErrorAndNotify(
      error.errorMessage,

      "FETCH_DOCUMENT_ERROR"
    );
  }
};


// Example API function to update document name
const updateDocumentNameAPI = async (
  documentId: number,
  newName: string,
  dataCallback: (data: any) => void
) => {
  try {
    // Use dot notation to configure the endpoint URL
    const updateNameEndpoint = `${endpoints.documents}/documents/${documentId}/name`;

    // Perform the API call to update the document name
    const response = await axiosInstance.put(
      updateNameEndpoint,
      { name: newName },  // Payload for the API request
      {
        headers: headersConfig,
      }
    );

    // Pass the response data to the callback function
    dataCallback(response.data);

    // Dispatch success notification
    useNotification().notify(
      "UPDATE_DOCUMENT_NAME_SUCCESS",
      apiNotificationMessages.UPDATE_DOCUMENT_NAME_SUCCESS,
      null,
      new Date(),
      "DocumentSuccess" as NotificationTypeEnum
    );

    // Return the response data
    return response.data;
  } catch (error: any) {
    // Handle and notify about the error
    const errorMessage = "Failed to update document name";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "UPDATE_DOCUMENT_NAME_ERROR"
    );
  }
};


const addDocumentAPI = (
  documentData: DocumentObject<T, K<T>>
): Promise<DocumentObject<T, K<T>>> => {
  const addDocumentEndpoint = `${API_BASE_URL}/documents`;

  return new Promise((resolve, reject) => {
    axiosInstance
      .post(addDocumentEndpoint, documentData, { headers: headersConfig })
      .then((response) => resolve(response.data as DocumentObject<T, K<T>>))
      .catch((error) => {
        console.error("Error adding document:", error);
        handleDocumentApiErrorAndNotify(
          error as AxiosError<unknown>,
          "ADD_DOCUMENT_ERROR"
        );
        reject(error); // Reject the promise with the error
      });
  });
};




const loadPresentationFromDatabase = async (
  presentationId: DocumentObject<T, K<T>>
): Promise<Presentation> => {
  try {
    // Make a GET request to the API endpoint
    const response = await axiosInstance.get<Presentation>(
      `${API_BASE_URL}/presentation/${presentationId}`
    );
    // Extract the data from the response
    const presentation = response.data;
    return presentation;
  } catch (error) {
    console.error("Error loading presentation from database:", error);
    throw error;
  }
};

const updateDocumentAPI = async (
  documentId: number,
  updatedData: any
): Promise<any> => {
  try {
    const updateDocumentEndpoint = `${API_BASE_URL}/documents/${documentId}`;
    const response = await axiosInstance.put(
      updateDocumentEndpoint,
      updatedData,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating document:", error);
    const errorMessage = "Failed to update document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "UPDATE_DOCUMENT_ERROR"
    );
    throw error;
  }
};

const deleteDocumentAPI = async (documentId: string): Promise<void> => {
  try {
    const deleteDocumentEndpoint = `${API_BASE_URL}/documents/${documentId}`;
    await axiosInstance.delete(deleteDocumentEndpoint, {
      headers: headersConfig,
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    const errorMessage = "Failed to delete document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "DELETE_DOCUMENT_ERROR"
    );
    throw error;
  }
};

const fetchAllDocumentsAPI = async (): Promise<any[]> => {
  try {
    const fetchAllDocumentsEndpoint = `${API_BASE_URL}/documents`;
    const response = await axiosInstance.get(fetchAllDocumentsEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all documents:", error);
    const errorMessage = "Failed to fetch all documents";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "FETCH_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Add the searchDocument method
const searchDocumentAPI = async (searchQuery: string): Promise<any> => {
  try {
    const searchDocumentEndpoint = `${API_BASE_URL}/documents/search?query=${encodeURIComponent(
      searchQuery
    )}`;
    const response = await axiosInstance.get(searchDocumentEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error("Error searching documents:", error);
    const errorMessage = "Failed to search documents";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "SEARCH_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Add the filterDocuments method
const filterDocumentsAPI = async (
  filters: Record<string, any>
): Promise<any> => {
  try {
    // Construct the filter query based on the provided filters
    const filterQuery = Object.entries(filters)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");
    const filterDocumentEndpoint = `${API_BASE_URL}/documents/filter?${filterQuery}`;
    const response = await axiosInstance.get(filterDocumentEndpoint, {
      headers: headersConfig,
    });
    return response.data;
  } catch (error) {
    console.error("Error filtering documents:", error);
    const errorMessage = "Failed to filter documents";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "FILTER_DOCUMENTS_ERROR"
    );
    throw error;
  }
};

// Download Document Method
const downloadDocument = async (
  documentId: number,
  format: string
): Promise<Blob> => {
  try {
    // Validate the requested format
    if (!allowedFormats.includes(format.toLowerCase())) {
      throw new Error(`Unsupported format: ${format}`);
    }

    // Construct the download URL
    const downloadUrl = `${DOWNLOAD_API_BASE_URL}/documents/${documentId}/download?format=${format.toLowerCase()}`;

    // Send a GET request to download the document
    const response = await axiosInstance.get(downloadUrl, {
      responseType: "blob", // Set response type to blob for binary data
      headers: headersConfig, // Include headers configuration
    });

    // Return the downloaded document content
    return response.data;
  } catch (error) {
    console.error("Error downloading document:", error);
    const errorMessage = "Failed to download document";
    // Handle document download error and notify
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "DOWNLOAD_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// List documents API
const listDocuments = async <
  T extends  BaseData<any>,
  K extends T = T
>(): Promise<Document<T, K>[]> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/api/documents`);
    return response.data;
  } catch (error) {
    console.error("Error listing documents:", error);
    const errorMessage = "Failed to list documents";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "LIST_DOCUMENTS_ERROR"
    );
    throw error;
  }
};

// Remove document API
const removeDocument = async (documentId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/api/documents/${documentId}`);
  } catch (error) {
    console.error("Error removing document:", error);
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "REMOVE_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Search documents API
const searchDocuments = async (searchQuery: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/documents/search?query=${encodeURIComponent(
        searchQuery
      )}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching documents:", error);
    const errorMessage = "Failed to search documents";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "SEARCH_DOCUMENTS_ERROR"
    );
    throw error;
  }
};

// Filter documents API
const filterDocuments = async (
  filters: Record<string, any>
): Promise<any> => {
  try {
    const filterQuery = Object.entries(filters)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/documents/filter?${filterQuery}`
    );
    return response.data;
  } catch (error) {
    console.error("Error filtering documents:", error);
    const errorMessage = "Failed to filter documents";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "FILTER_DOCUMENTS_ERROR"
    );
    throw error;
  }
};

// Upload document API
const uploadDocument = async (document: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/upload`,
      document
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading document:", error);
    const errorMessage = "Failed to upload document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "UPLOAD_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Share document API
const shareDocument = async (documentId: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/share/${documentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error sharing document:", error);
    const errorMessage = "Failed to share document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "SHARE_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Lock document API
const lockDocument = async (documentId: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/lock/${documentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error locking document:", error);
    const errorMessage = "Failed to lock document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "LOCK_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Unlock document API
const unlockDocument = async (documentId: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/unlock/${documentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error unlocking document:", error);
    const errorMessage = "Failed to unlock document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "UNLOCK_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Add document API
const addDocument = async (newDocument: Document<T, K<T>>): Promise<Document<T, K<T>>> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents`,
      newDocument,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding document:", error);
    const errorMessage = "Failed to add document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "ADD_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Update document API
const updateDocument = async <
  T extends  BaseData<any>,
  K extends T = T>(
  documentId: string,
  updatedDocument: Document<T, K>
): Promise<Document<T, K>> => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/api/documents/${documentId}`,
      updatedDocument,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating document:", error);
    const errorMessage = "Failed to update document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "UPDATE_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Archive document API
const archiveDocument = async (documentId: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/archive/${documentId}`,
      null,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error archiving document:", error);
    const errorMessage = "Failed to archive document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "ARCHIVE_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Restore document API
const restoreDocument = async (documentId: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/restore/${documentId}`,
      null,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error restoring document:", error);
    const errorMessage = "Failed to restore document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "RESTORE_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Move document API
const moveDocument = async (
  documentId: string,
  destination: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/move/${documentId}`,
      { destination },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error moving document:", error);
    const errorMessage = "Failed to move document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "MOVE_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Merge documents API
const mergeDocuments = async (documentIds: string[]): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/merge`,
      { documentIds },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error merging documents:", error);
    const errorMessage = "Failed to merge documents";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "MERGE_DOCUMENTS_ERROR"
    );
    throw error;
  }
};

// Split document API
const splitDocument = async (documentId: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/split`,
      { documentId },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error splitting document:", error);
    const errorMessage = "Failed to split document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "SPLIT_DOCUMENT_ERROR"
    );
    throw error;
  }
};
// Validate document API
const validateDocument = async (documentId: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/validate`,
      { documentId },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error validating document:", error);
    const errorMessage = "Failed to validate document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "VALIDATE_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Encrypt document API
const encryptDocument = async (documentId: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/encrypt`,
      { documentId },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error encrypting document:", error);
    const errorMessage = "Failed to encrypt document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "ENCRYPT_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Decrypt document API
const decryptDocument = async (documentId: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/decrypt`,
      { documentId },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error decrypting document:", error);
    const errorMessage = "Failed to decrypt document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "DECRYPT_DOCUMENT_ERROR"
    );
    throw error;
  }
};

// Track document changes API
const trackDocumentChanges = async (
  documentId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/trackChanges`,
      { documentId },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error tracking document changes:", error);
    const errorMessage = "Failed to track document changes";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "TRACK_DOCUMENT_CHANGES_ERROR"
    );
    throw error;
  }
};

// Compare documents API
const compareDocuments = async (documentIds: string[]): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/compare`,
      { documentIds },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error comparing documents:", error);
    const errorMessage = "Failed to compare documents";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "COMPARE_DOCUMENTS_ERROR"
    );
    throw error;
  }
};

// Tag documents API
const tagDocuments = async (
  documentIds: string[],
  tag: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/tag`,
      { documentIds, tag },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error tagging documents:", error);
    const errorMessage = "Failed to tag documents";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "TAG_DOCUMENTS_ERROR"
    );
    throw error;
  }
};

// Categorize documents API
const categorizeDocuments = async (
  documentIds: string[],
  category: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/categorize`,
      { documentIds, category },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error categorizing documents:", error);
    const errorMessage = "Failed to categorize documents";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "CATEGORIZE_DOCUMENTS_ERROR"
    );
    throw error;
  }
};

const customizeDocumentView = async (viewOptions: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/customizeView`,
      viewOptions,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error customizing document view:", error);
    const errorMessage = "Failed to customize document view";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "CUSTOMIZE_DOCUMENT_VIEW_ERROR"
    );
    throw error;
  }
};

const commentOnDocument = async (
  documentId: string,
  comment: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/comment`,
      { documentId, comment },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error commenting on document:", error);
    const errorMessage = "Failed to comment on document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "COMMENT_ON_DOCUMENT_ERROR"
    );
    throw error;
  }
};

const mentionUserInDocument = async (
  documentId: string,
  userId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/mentionUser`,
      { documentId, userId },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error mentioning user in document:", error);
    const errorMessage = "Failed to mention user in document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "MENTION_USER_IN_DOCUMENT_ERROR"
    );
    throw error;
  }
};

const assignTaskInDocument = async (
  documentId: string,
  taskDetails: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/assignTask`,
      { documentId, ...taskDetails },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error assigning task in document:", error);
    const errorMessage = "Failed to assign task in document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "ASSIGN_TASK_IN_DOCUMENT_ERROR"
    );
    throw error;
  }
};

const requestReviewOfDocument = async (
  documentId: string,
  reviewDetails: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/requestReview`,
      { documentId, ...reviewDetails },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error requesting review of document:", error);
    const errorMessage = "Failed to request review of document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "REQUEST_REVIEW_OF_DOCUMENT_ERROR"
    );
    throw error;
  }
};

const approveDocument = async (
  documentId: string,
  approvalDetails: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/approve`,
      { documentId, ...approvalDetails },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error approving document:", error);
    const errorMessage = "Failed to approve document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "APPROVE_DOCUMENT_ERROR"
    );
    throw error;
  }
};

const rejectDocument = async (
  documentId: string,
  rejectionDetails: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/reject`,
      { documentId, ...rejectionDetails },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error rejecting document:", error);
    const errorMessage = "Failed to reject document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "REJECT_DOCUMENT_ERROR"
    );
    throw error;
  }
};

const requestFeedbackOnDocument = async (
  documentId: string,
  feedbackDetails: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/requestFeedback`,
      { documentId, ...feedbackDetails },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error requesting feedback on document:", error);
    const errorMessage = "Failed to request feedback on document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "REQUEST_FEEDBACK_ON_DOCUMENT_ERROR"
    );
    throw error;
  }
};

const provideFeedbackOnDocument = async (
  documentId: string,
  feedbackDetails: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/provideFeedback`,
      { documentId, ...feedbackDetails },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error providing feedback on document:", error);
    const errorMessage = "Failed to provide feedback on document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "PROVIDE_FEEDBACK_ON_DOCUMENT_ERROR"
    );
    throw error;
  }
};

const resolveFeedbackOnDocument = async (
  documentId: string,
  feedbackId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/resolveFeedback`,
      { documentId, feedbackId },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error resolving feedback on document:", error);
    const errorMessage = "Failed to resolve feedback on document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "RESOLVE_FEEDBACK_ON_DOCUMENT_ERROR"
    );
    throw error;
  }
};

const collaborativeEditing = async (
  documentId: string,
  collaborators: Collaborator[]
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/collaborativeEditing`,
      { documentId, collaborators },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error initiating collaborative editing on document:", error);
    const errorMessage = "Failed to initiate collaborative editing on document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "COLLABORATIVE_EDITING_ERROR"
    );
    throw error;
  }
};
const smartTagging = async (documentId: string): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/smartTagging`,
      { documentId },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error initiating smart tagging on document:", error);
    const errorMessage = "Failed to initiate smart tagging on document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "SMART_TAGGING_ERROR"
    );
    throw error;
  }
};

const documentAnnotation = async (
  documentId: string,
  annotationData: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/annotation`,
      { documentId, ...annotationData },
      {
        headers: headersConfig,
      }
    );
    // Dispatch an action to update the document content or metadata after annotation
    DocumentActions.updateDocumentDetailsSuccess({
      id: documentId,
      ...annotationData,
    });
    return response.data;
  } catch (error) {
    console.error("Error annotating document:", error);
    const errorMessage = "Failed to annotate document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "DOCUMENT_ANNOTATION_ERROR"
    );
    throw error;
  }
};

const documentActivityLogging = async (
  documentId: string,
  activityDetails: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/activityLogging`,
      { documentId, ...activityDetails },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error logging activity on document:", error);
    const errorMessage = "Failed to log activity on document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "DOCUMENT_ACTIVITY_LOGGING_ERROR"
    );
    throw error;
  }
};

const intelligentDocumentSearch = async (
  query: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/intelligentSearch`,
      { query },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error performing intelligent search for documents:", error);
    const errorMessage = "Failed to perform intelligent search for documents";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "INTELLIGENT_DOCUMENT_SEARCH_ERROR"
    );
    throw error;
  }
};


const getDocumentVersions = async (
  documentId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/documents/getVersions`,
      {
        params: { documentId },
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching document versions:", error);
    const errorMessage = "Failed to fetch document versions";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "GET_DOCUMENT_VERSIONS_ERROR"
    );
    throw error;
  }
}



const updateSnapshotDetails = async (
  snapshotId: string,
  newDetails: any // Define a proper type for `newDetails` as needed
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/snapshots/updateDetails`,
      { snapshotId, newDetails },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating snapshot details:", error);
    const errorMessage = "Failed to update snapshot details";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "UPDATE_SNAPSHOT_DETAILS_ERROR"
    );
    throw error;
  }
};


const createDocumentVersion = async (
  documentId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/createVersion`,
      { documentId },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating document version:", error);
    const errorMessage = "Failed to create document version";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "CREATE_DOCUMENT_VERSION_ERROR"
    );
    throw error;
  }
};

const revertToDocumentVersion = async (
  documentId: string,
  versionId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/revertVersion`,
      { documentId, versionId },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error reverting to document version:", error);
    const errorMessage = "Failed to revert to document version";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "REVERT_TO_DOCUMENT_VERSION_ERROR"
    );
    throw error;
  }
};

const viewDocumentHistory = async (documentId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/documents/viewHistory/${documentId}`,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error viewing document history:", error);
    const errorMessage = "Failed to view document history";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "VIEW_DOCUMENT_HISTORY_ERROR"
    );
    throw error;
  }
};

const documentVersionComparison = async (
  versionId1: string,
  versionId2: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/compareVersions`,
      { versionId1, versionId2 },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error comparing document versions:", error);
    const errorMessage = "Failed to compare document versions";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "DOCUMENT_VERSION_COMPARISON_ERROR"
    );
    throw error;
  }
};
const grantDocumentAccess = async (
  documentId: string,
  userId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/grantAccess`,
      { documentId, userId },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error granting document access:", error);
    const errorMessage = "Failed to grant document access";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "GRANT_DOCUMENT_ACCESS_ERROR"
    );
    throw error;
  }
};

const revokeDocumentAccess = async (
  documentId: string,
  userId: string
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/revokeAccess`,
      { documentId, userId },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error revoking document access:", error);
    const errorMessage = "Failed to revoke document access";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "REVOKE_DOCUMENT_ACCESS_ERROR"
    );
    throw error;
  }
};

const manageDocumentPermissions = async (
  documentId: string,
  permissions: string[]
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/managePermissions`,
      { documentId, permissions },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error managing document permissions:", error);
    const errorMessage = "Failed to manage document permissions";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "MANAGE_DOCUMENT_PERMISSIONS_ERROR"
    );
    throw error;
  }
};

const initiateDocumentWorkflow = async (
  documentId: string,
  workflowData: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/initiateWorkflow`,
      { documentId, ...workflowData },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error initiating document workflow:", error);
    const errorMessage = "Failed to initiate document workflow";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "INITIATE_DOCUMENT_WORKFLOW_ERROR"
    );
    throw error;
  }
};

const automateDocumentTasks = async (
  documentId: string,
  tasksData: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/automateTasks`,
      { documentId, ...tasksData },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error automating document tasks:", error);
    const errorMessage = "Failed to automate document tasks";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "AUTOMATE_DOCUMENT_TASKS_ERROR"
    );
    throw error;
  }
};

const triggerDocumentEvents = async (
  documentId: string,
  eventData: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/triggerEvents`,
      { documentId, ...eventData },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error triggering document events:", error);
    const errorMessage = "Failed to trigger document events";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "TRIGGER_DOCUMENT_EVENTS_ERROR"
    );
    throw error;
  }
};

const documentApprovalWorkflow = async (
  documentId: string,
  workflowData: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/approvalWorkflow`,
      { documentId, ...workflowData },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error initiating document approval workflow:", error);
    const errorMessage = "Failed to initiate document approval workflow";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "DOCUMENT_APPROVAL_WORKFLOW_ERROR"
    );
    throw error;
  }
};

const documentLifecycleManagement = async (
  documentId: string,
  lifecycleData: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/lifecycleManagement`,
      { documentId, ...lifecycleData },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error managing document lifecycle:", error);
    const errorMessage = "Failed to manage document lifecycle";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "DOCUMENT_LIFECYCLE_MANAGEMENT_ERROR"
    );
    throw error;
  }
};

const connectWithExternalSystem = async (
  documentId: string,
  systemData: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/connectExternalSystem`,
      { documentId, ...systemData },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error connecting with external system:", error);
    const errorMessage = "Failed to connect with external system";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "CONNECT_WITH_EXTERNAL_SYSTEM_ERROR"
    );
    throw error;
  }
};

const synchronizeWithCloudStorage = async (
  documentId: string,
  storageData: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/synchronizeStorage`,
      { documentId, ...storageData },
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error synchronizing with cloud storage:", error);
    const errorMessage = "Failed to synchronize with cloud storage";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "SYNCHRONIZE_WITH_CLOUD_STORAGE_ERROR"
    );
    throw error;
  }
};

const importFromExternalSource = async (
  importData: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/importFromExternal`,
      importData,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error importing from external source:", error);
    const errorMessage = "Failed to import from external source";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "IMPORT_FROM_EXTERNAL_ERROR"
    );
    throw error;
  }
};

const exportToExternalSystem = async (exportData: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/exportToExternal`,
      exportData,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error exporting to external system:", error);
    const errorMessage = "Failed to export to external system";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "EXPORT_TO_EXTERNAL_ERROR"
    );
    throw error;
  }
};

const generateDocument = <
  T extends  BaseData<any>,
  K extends T = T>(
  documentData: any,
  options: DocumentOptions
): Promise<DocumentObject<T, K>> => {
  return new Promise<DocumentObject<T, K>>(async (resolve, reject) => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE_URL}/api/documents/generate`,
        { documentData, options },
        {
          headers: headersConfig,
        }
      );
      resolve(response.data);
    } catch (error) {
      console.error("Error generating document:", error);
      const errorMessage = "Failed to generate document";
      handleDocumentApiErrorAndNotify(
        error as AxiosError<unknown>,
  
        "GENERATE_DOCUMENT_ERROR"
      );
      reject(error);
    }
  });
};

const generateDocumentReport = async (reportData: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/generateReport`,
      reportData,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error generating document report:", error);
    const errorMessage = "Failed to generate document report";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "GENERATE_DOCUMENT_REPORT_ERROR"
    );
    throw error;
  }
};

const exportDocumentReport = async (reportData: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/exportReport`,
      reportData,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error exporting document report:", error);
    const errorMessage = "Failed to export document report";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "EXPORT_DOCUMENT_REPORT_ERROR"
    );
    throw error;
  }
};

const scheduleReportGeneration = async (
  scheduleData: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/scheduleReport`,
      scheduleData,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error scheduling report generation:", error);
    const errorMessage = "Failed to schedule report generation";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "SCHEDULE_REPORT_GENERATION_ERROR"
    );
    throw error;
  }
};

const customizeReportSettings = async (
  settingsData: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/customizeReport`,
      settingsData,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error customizing report settings:", error);
    const errorMessage = "Failed to customize report settings";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "CUSTOMIZE_REPORT_SETTINGS_ERROR"
    );
    throw error;
  }
};

const backupDocuments = async (): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/backup`,
      null,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error backing up documents:", error);
    const errorMessage = "Failed to backup documents";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "BACKUP_DOCUMENTS_ERROR"
    );
    throw error;
  }
};

const retrieveBackup = async (backupId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/documents/retrieveBackup/${backupId}`,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error retrieving backup:", error);
    const errorMessage = "Failed to retrieve backup";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "RETRIEVE_BACKUP_ERROR"
    );
    throw error;
  }
};
const documentRedaction = async (redactionData: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/redact`,
      redactionData,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error redacting document:", error);
    const errorMessage = "Failed to redact document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "DOCUMENT_REDACTION_ERROR"
    );
    throw error;
  }
};

const documentAccessControls = async (
  controlsData: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/accessControls`,
      controlsData,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error applying document access controls:", error);
    const errorMessage = "Failed to apply document access controls";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "DOCUMENT_ACCESS_CONTROLS_ERROR"
    );
    throw error;
  }
};

const getDocumentUrl = async (url: string): Promise<any> => {
  try {
    // Make a POST request to the provided URL
    const response = await axiosInstance.post(url);

    // Return the response data
    return response.data;
  } catch (error) {
    // Handle any errors that occur during the request
    console.error("Error fetching document URL:", error);
    throw new Error("Failed to fetch document URL");
  }
};

const getDocument = async ({
  data,
}: {
  data: Uint8Array;
}): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents`,
      data,
      {
        headers: {
          ...headersConfig,
          "Content-Type": "application/pdf",
        },
        responseType: "arraybuffer", // Adjust this if needed
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching document:", error);
    const errorMessage = "Failed to fetch document";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "GET_DOCUMENT_ERROR"
    );
    throw error;
  }
};

const documentTemplates = async (templatesData: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/api/documents/templates`,
      templatesData,
      {
        headers: headersConfig,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error managing document templates:", error);
    const errorMessage = "Failed to manage document templates";
    handleDocumentApiErrorAndNotify(
      error as AxiosError<unknown>,

      "DOCUMENT_TEMPLATES_ERROR"
    );
    throw error;
  }
};


export {
    addDocument, addDocumentAPI, approveDocument, archiveDocument, assignTaskInDocument, automateDocumentTasks, backupDocuments, categorizeDocuments, collaborativeEditing, commentOnDocument, compareDocuments, connectWithExternalSystem, createDocumentVersion, customizeDocumentView, customizeReportSettings, decryptDocument, deleteDocumentAPI, documentAccessControls, documentActivityLogging, documentAnnotation, documentApprovalWorkflow,
    documentLifecycleManagement, documentRedaction,
    documentTemplates, documentVersionComparison,
    downloadDocument, encryptDocument, exportDocumentReport,
    exportToExternalSystem, fakeApiCall,
    fetchAllDocumentsAPI, fetchDocumentById, fetchDocumentByIdAPI, fetchJsonDocumentByIdAPI,
    fetchXmlDocumentByIdAPI, filterDocuments,
    filterDocumentsAPI, generateDocument,
    generateDocumentReport, getDocument, getDocumentUrl,
    getDocumentVersions, grantDocumentAccess,
    importFromExternalSource, initiateDocumentWorkflow,
    intelligentDocumentSearch, listDocuments,
    loadPresentationFromDatabase, lockDocument,
    manageDocumentPermissions, mentionUserInDocument,
    mergeDocuments, moveDocument,
    provideFeedbackOnDocument, rejectDocument,
    removeDocument, requestFeedbackOnDocument,
    requestReviewOfDocument, resolveFeedbackOnDocument,
    restoreDocument, retrieveBackup, revertToDocumentVersion,
    revokeDocumentAccess, scheduleReportGeneration,
    searchDocumentAPI, searchDocuments, shareDocument,
    smartTagging, splitDocument, synchronizeWithCloudStorage,
    tagDocuments, trackDocumentChanges, triggerDocumentEvents,
    unlockDocument, updateDocument, updateDocumentAPI,
    updateDocumentNameAPI, updateSnapshotDetails,
    uploadDocument, validateDocument,
    viewDocumentHistory
};

