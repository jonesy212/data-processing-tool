// DocumentSlice.tsx
import { fetchDocumentByIdAPI } from "@/app/api/ApiDocument";
import { DocumentData } from "@/app/components/documents/DocumentBuilder";
import { DocumentStatusEnum, DocumentTypeEnum } from "@/app/components/documents/DocumentGenerator";
import { DocumentStatus } from "@/app/components/documents/types";
import useDataExport from "@/app/components/hooks/dataHooks/useDataExport";
import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { AppThunk } from "@/app/configs/appThunk";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { performSearch } from "@/app/pages/searchs/SearchComponent";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { WritableDraft } from "../ReducerGenerator";
import { RootState } from "./RootSlice";
import DocumentBuilder from "@/app/components/documents/DocumentBuilder";
import { DocumentOptions } from "@/app/components/documents/DocumentOptions";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";

const notify = useNotification
// Define the initial state for the document slice
interface DocumentSliceState {
  documents: DocumentData[];
  selectedDocument: DocumentData | null;
  filteredDocuments: DocumentData[];
  searchResults: DocumentData[];
  loading: boolean, // Add this line to include the initial state for loading
  error: Error | null, // Add this line to include the initial state for error
  changes: boolean;
  documentBuilder?:  typeof DocumentBuilder
}

const initialState: DocumentSliceState = {
  documents: [],
  selectedDocument: null,
  filteredDocuments: [],
  loading: false, // Add this line if it's not already present
  error: null,
  changes: false,
  searchResults: [],
  documentBuilder: undefined,
}

// Create an async thunk for deleting a document
export const deleteDocumentAsync = createAsyncThunk(
  'document/deleteDocument',
  async (documentId: number) => {
    try {
      // Implement document deletion functionality
      // Simulate deletion with a delay of 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Document deleted successfully');
      return documentId;
    } catch (error) {
      console.error(`Error deleting document with ID ${documentId}:`, error);
      throw error;
    }
  }
);

// Define an async thunk action creator to fetch document by ID
export const fetchDocumentById = createAsyncThunk(
  'documents/fetchDocumentById',
  async (documentId: number) => {
    try {
      // Perform asynchronous operation to fetch document data by ID
      const response = await fetch(`your-api-endpoint/documents/${documentId}`);
      const data = await response.json();

      // Return the fetched data
      return data;
    } catch (error) {
      // If there's an error, throw it to be caught by the caller
      throw error;
    }
  }
);

// Define async function to fetch documents data by IDs
export const fetchDocumentsByIds = async (documentIds: number[]) => {
  try {
    // Perform asynchronous operation to fetch documents data by IDs
    const promises = documentIds.map(async (documentId) => {
      const response = await fetch(`your-api-endpoint/documents/${documentId}`);
      return response.json();
    });

    // Wait for all promises to resolve
    const documentsData = await Promise.all(promises);

    return documentsData;
  } catch (error) {
    // Handle error
    console.error('Error fetching documents by IDs:', error);
    throw error;
  }
};



export const downloadDocument = createAsyncThunk(
  'document/downloadDocument',
  async (documentId: number) => {
    // Your asynchronous operation logic here (e.g., fetching the document)
    const fetchedDocument = await fetchDocumentByIdAPI(
      documentId,
      (data: WritableDraft<DocumentData>) => {
        data.status = DocumentStatusEnum.Draft;
        data.type = DocumentTypeEnum.Document;
      }
    );
    return fetchedDocument;
  }
);

// Define thunk action creator for downloading document asynchronously
export const downloadDocumentAsync = createAsyncThunk(
  'document/downloadDocumentAsync',
  async (documentId: number, { dispatch }) => {
    try {
      // Fetch document data based on the document ID
      const fetchedDocument = await fetchDocumentByIdAPI(documentId, (data: WritableDraft<DocumentData>) => {
        // Call the dispatch function to update the state with the fetched document data
        dispatch(setDownloadedDocument(data));
      });

      // Dispatch the action to update the state with the fetched document data
      dispatch(setDownloadedDocument(fetchedDocument));

      // Return fetched document as the result
      return fetchedDocument;
    } catch (error) {
      console.error("Error downloading document:", error);
      // Handle error and notify
      useNotification().notify(
        "downloadDocumentError",
        "Error downloading document",
        NOTIFICATION_MESSAGES.Document.DOWNLOAD_DOCUMENT_ERROR,
        new Date(),
        NotificationTypeEnum.Error
      );
      throw error;
    }
  }
);


export const exportDocumentAsync = async (document: number): Promise<AppThunk> => async (dispatch) => { 
  try {
    // Implement document export functionality

    // Simulate export with a delay of 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Dispatch the action to update the state with the exported document
    dispatch(await exportDocument(document));
    
    // Return the exported document as the result
    console.log('Document exported successfully');

    return document;
  } catch (error) {
    console.error("Error exporting document:", error);
    // Handle error and notify
    useNotification().notify(
      "exportDocumentError",
      "Error exporting document",
      NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENT_ERROR,
      new Date(),
      NotificationTypeEnum.Error
    );
    
    throw error;
  }
}




export const exportDocument = async (document: number): Promise<AppThunk> => async (dispatch) => {
  try {
    // Implement document export functionality
    // Simulate export with a delay of 1 second
    await new Promise(async (resolve) => setTimeout(resolve, 1000));
    // Dispatch the action to update the state with the exported document
    dispatch(await exportDocument(document));

  } catch (error) { 
    console.error("Error exporting document:", error);
    // Handle error and notify
    useNotification().notify(
      "exportDocumentError",
      "Error exporting document",
      NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENT_ERROR,
      new Date(),
      NotificationTypeEnum.Error
    );
    throw error; // Rethrow the error to be caught by the caller
  }
}

export const exportDocuments = async (documents: {
  payload: typeof documents,
  type: "exportDocuments",
}): Promise<AppThunk> => async (dispatch) => {
  try {
    // Implement document export functionality
    const { exportedData, exportData } = useDataExport(); // Initialize useDataExport hook

    // Simulate export with a delay of 1 second
    setTimeout(async () => {
      try {
        const exportResult = await exportData(documents); // Export documents using the hook
        console.log('Exported documents:', exportResult);
        dispatch({ type: "exportDocuments", payload: exportedData });
      } catch (error) {
        console.error("Error exporting documents:", error);
        throw error; // Rethrow the error to be caught by the caller
      }
    }, 1000);
  } catch (error) {
    console.error("Error exporting documents:", error);
    // Handle error and notify
    useNotification().notify(
      "exportDocumentsError",
      "Error exporting documents",
      NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_ERROR,
      new Date(),
      NotificationTypeEnum.Error
    );
    throw error; // Rethrow the error to be caught by the caller
  }
};

// Define the async thunk using createAsyncThunk
// Define the async thunk using createAsyncThunk
export const exportDocumentsAsync = createAsyncThunk(
  'document/exportDocumentsAsync',
  async (documentIds: number[], { dispatch }) => {
    try {
      // Fetch multiple documents based on their IDs
      const documents = await fetchDocumentsByIds(documentIds);
      
      // Dispatch the action with the entire array of documents as the payload
      dispatch(exportDocumentsAsync.fulfilled(documents, "exportDocuments", documentIds, undefined));

      return documents; // Return the fetched documents as the result
    } catch (error) {
      console.error("Error exporting documents:", error);
      // Handle error and notify
      useNotification().notify(
        "exportDocumentsError",
        "Error exporting documents",
        NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_ERROR,
        new Date(),
        NotificationTypeEnum.Error
      );
      throw error; // Rethrow the error to be caught by the caller
    }
  }
);



// Define the transformations object and applyTransformation function
const applyTransformation = (
  document: WritableDraft<DocumentData> | undefined,
  transformation: (doc: DocumentData, value: string) => void,
  value: string
) => {
  if (document) {
    transformation(document, value);
  }
};

const transformations = {
  tag: (document: DocumentData, tag: string) => {
    document.content = `${tag} Tagged: ${document.content}`;
  },

  categorize: (document: DocumentData, category: string) => {
    document.content = `${category} Categorized: ${document.content}`;
  },

  customizeView: (document: DocumentData, view: string) => {
    document.content = `${view} Customized: ${document.content}`;
  },

  comment: (document: DocumentData, comment: string) => {
    document.content = `${comment} Commented: ${document.content}`;
  },

  mention: (document: DocumentData, mention: string) => {
    document.content = `${mention} Mentioned: ${document.content}`;
  },

  assignTask: (document: DocumentData, task: string) => {
    document.content = `${task} Assigned: ${document.content}`;
  },

  requestReview: (document: DocumentData, review: string) => {
    document.content = `${review} Requested: ${document.content}`;
  },

  approve: (document: DocumentData, approval: string) => {
    document.content = `${approval} Approved: ${document.content}`;
  },

  reject: (document: DocumentData, rejection: string) => {
    document.content = `${rejection} Rejected: ${document.content}`;
  },

  provideFeedback: (document: DocumentData, feedback: string) => {
    document.content = `${feedback} Provided: ${document.content}`;
  },
  

  requestFeedback: (document: DocumentData, review: string) => {
    document.content = `${review} Requested: ${document.content}`;
  },
  
  resolveFeedback: (document: DocumentData, feedback: string) => {
    document.content = `${feedback} Resolved: ${document.content}`;
  },

  collaborate: (document: DocumentData, collaborator: string) => {
    document.content = `${collaborator} Collaborated: ${document.content}`;
  },

  version: (document: DocumentData, version: string) => {
    document.content = `${version} Versioned: ${document.content}`;
  },

  annotate: (document: DocumentData, annotation: string) => {
    document.content = `${annotation} Annotated: ${document.content}`;
  },

  logActivity: (document: DocumentData, activity: string) => {
    document.content = `${activity} Logged: ${document.content}`;
  },

  revert: (document: DocumentData, revert: string) => {
    document.content = `${revert} Reverted: ${document.content}`;
  },

  search: (document: DocumentData, search: string) => {
    document.content = `${search} Searched: ${document.content}`;
  },

  grantAccess: (document: DocumentData, access: string) => {
    document.content = `${access} Access: ${document.content}`;
  },
  
  viewHistory: (document: DocumentData, view: string) => {
    document.content = `${view} Viewed: ${document.content}`;
  },

  compare: (document: DocumentData, compare: string) => {
    document.content = `${compare} Compared: ${document.content}`;
  },

  revokeAccess: (document: DocumentData, access: string) => {
    document.content = `${access} Access: ${document.content}`;
  },

  managePermissions: (document: DocumentData, permissions: string) => {
    document.content = `${permissions} Permissions: ${document.content}`;
  },





  initiateWorkflow: (document: DocumentData, workflow: string) => {
    document.content = `${workflow} Initiated: ${document.content}`;
  },

  automateTasks: (document: DocumentData, tasks: string) => {
    document.content = `${tasks} Automated: ${document.content}`;
  },

  triggerEvents: (document: DocumentData, events: string) => {
    document.content = `${events} Triggered: ${document.content}`;
  },

  approvalWorkflow: (document: DocumentData, workflow: string) => {
    document.content = `${workflow} Approved: ${document.content}`;
  },

  lifecycleManagement: (document: DocumentData, lifecycle: string) => {
    document.content = `${lifecycle} Lifecycle: ${document.content}`;
  },

  connectWithExternalSystem: (document: DocumentData, externalSystem: string) => {
    document.content = `${externalSystem} Connected: ${document.content}`;
  },

  synchronizeWithCloudStorage: (document: DocumentData, cloudStorage: string) => {
    document.content = `${cloudStorage} Synchronized: ${document.content}`;
  },

  importFromExternalSource: (document: DocumentData, externalSource: string) => {
    document.content = `${externalSource} Imported: ${document.content}`;
  },

  exportToExternalSystem: (document: DocumentData, externalSystem: string) => {
    document.content = `${externalSystem} Exported: ${document.content}`;
  },

  generateReport: (document: DocumentData, report: string) => {
    document.content = `${report} Generated: ${document.content}`;
  },


  exportReport: (document: DocumentData, report: string) => {
    document.content = `${report} Exported: ${document.content}`;
  },



  scheduleReportGeneration: (document: DocumentData, report: string) => {
    document.content = `${report} Scheduled: ${document.content}`;
  },


  customizeReportSettings: (document: DocumentData, report: string) => {
    document.content = `${report} Customized: ${document.content}`;
  },

  backupDocuments: (document: DocumentData, backup: string) => { 
    document.content = `${backup} Backed up: ${document.content}`;
  },

  retrieveBackup: (document: DocumentData, backup: string) => { 
    document.content = `${backup} Retrieved: ${document.content}`;
  },

  redaction: (document: DocumentData, redaction: string) => { 
    document.content = `${redaction} Redacted: ${document.content}`;
  },

  accessControls: (document: DocumentData, access: string) => { 
    document.content = `${access} Access: ${document.content}`;
  },

  templates: (document: DocumentData, template: string) => { 
    document.content = `${template} Templates: ${document.content}`;
  }


};











const documentId: UniqueIDGenerator = new UniqueIDGenerator();
// Define a function to create a new document with default values
const createNewDocument: (documentId: number) => WritableDraft<DocumentData> = () => ({
  id: documentId as number,
  title: "New Document",
  content: "",
  topics: [],
  highlights: [],
  files: [],
  name: "New Document",
  description: "New document description",
  documentType: DocumentTypeEnum.Other,
  documentStatus: DocumentStatusEnum.Draft,
  documentOwner: "",
  documentCreationDate: new Date(),
  documentLastModifiedDate: new Date(),
  documentVersion: 0,
  documentContent: "",
  keywords: [],
  options: {} as WritableDraft<DocumentOptions>,
  folderPath: "",
  previousMetadata: {} as WritableDraft<StructuredMetadata>,
  currentMetadata: {} as WritableDraft<StructuredMetadata>,
  accessHistory: [],
  // documentTags: [],
  // documentAccess: [],
});


// Create a slice for managing document-related data
export const useDocumentManagerSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    createDocument: {
      reducer: (state, action: PayloadAction<WritableDraft<DocumentData>>) => {
        state.selectedDocument = action.payload;
        state.documents.push(action.payload);
      },
      prepare: () => {
        // Generate a new document with default values
        const newDocument: WritableDraft<DocumentData> = {
          id: Math.floor(Math.random() * 1000), // Generate a unique ID
          title: "New Document",
          content: "", // Add default content if needed
          topics: [], // Add default topics if needed
          highlights: [], // Add default highlights if needed
          files: [], // Add default files if needed
          // Add other properties as needed
          


          keywords: [],
          options: {} as WritableDraft<DocumentOptions>,
          folderPath: "",
          previousMetadata: {} as WritableDraft<StructuredMetadata>,
          currentMetadata: {} as WritableDraft<StructuredMetadata>,
          accessHistory: []
        };
        return { payload: newDocument };
      },
    },
    

    setDocuments: (
      state,
      action: PayloadAction<WritableDraft<DocumentData[]>>
    ) => {
      state.documents = action.payload;
    },


    setDownloadedDocument: (
      state,
      action: PayloadAction<WritableDraft<DocumentData>>
    ) => {
      state.selectedDocument = action.payload;
    },
    

    addDocument: (
      state,
      action: PayloadAction<WritableDraft<DocumentData>>
    ) => {
      state.documents.push(action.payload);
    },

    selectDocument: (state, action: PayloadAction<number>) => {
      state.selectedDocument =
        state.documents.find((doc) => doc.id === action.payload) || null;
    },

    clearSelectedDocument: (state) => {
      state.selectedDocument = null;
    },

    setExportedDocuments: (
      state,
      action: PayloadAction<WritableDraft<DocumentData[]>>
    ) => {
      state.documents = action.payload;
    },

    setFilteredDocuments: (
      state,
      action: PayloadAction<WritableDraft<DocumentData[]>>
    ) => {
      state.filteredDocuments = action.payload;
    },

    setDocumentStatus: (
      state,
      action: PayloadAction<{ id: number; status: DocumentStatus }>
    ) => {
      const { id, status } = action.payload;
      const documentIndex = state.documents.findIndex(
        (doc) => doc.id === id
      );
      if (documentIndex !== -1) {
        state.documents[documentIndex].status = status;
      } else {
        console.log("Document not found");
      }
      console.log("Document status update functionality enabled");
      // Additional logic...
    },

    updateDocument: (state, action: PayloadAction<Partial<DocumentData>>) => {
      const { id, ...updates } = action.payload;
      const existingDocument = state.documents.find(doc => doc.id === id);
      if (existingDocument) {
        Object.assign(existingDocument, updates);
      } else {
        console.log("Document not found");
      }
      console.log("Document update functionality enabled");
      // Additional logic...
    },

    deleteDocument: (state, action: PayloadAction<number>) => {
      // Implement document deletion functionality
      const documentIndex = state.documents.findIndex(
        (doc) => doc.id === action.payload
      );
      if (documentIndex !== -1) {
        state.documents.splice(documentIndex, 1);
        useNotification().notify(

          "deleteDocumentSuccess",
          "Document deleted successfully",
          NOTIFICATION_MESSAGES.Document.DELETE_DOCUMENT_SUCCESS,
          new Date,
          NotificationTypeEnum.OperationSuccess
        );
      } else {
        useNotification().notify(
          "deleteDocumentError",
          `There was an error deleting the document with ID ${action.payload}, try again later`,
          NOTIFICATION_MESSAGES.Document.DELETE_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },

    filterDocuments: (state, action: PayloadAction<string>) => {
      try {
        // Implement document filtering functionality
        const filterKeyword = action.payload.toLowerCase();
        state.filteredDocuments = state.documents.filter((doc) =>
          (typeof doc.title === "string" &&
            doc.title.toLowerCase().includes(filterKeyword)) ||
          (typeof doc.description === "string" &&
            doc.description.toLowerCase().includes(filterKeyword))
        );
        useNotification().notify(
          "filterDocumentsSuccess",
          `Filtering documents by keyword: ${filterKeyword} success`,
          NOTIFICATION_MESSAGES.Document.FILTER_DOCUMENTS_SUCCESS,
        );
      } catch (error) {
        console.error("Error filtering documents:", error);
        useNotification().notify(
          "filterDocumentsError",
          "Error filtering documents",
          NOTIFICATION_MESSAGES.Document.FILTER_DOCUMENTS_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },
    

    sortDocuments: (state, action: PayloadAction<string>) => {
      try {
        // Implement document sorting functionality
        const sortKey = action.payload as keyof DocumentData; // Type assertion
        state.documents.sort((a, b) => {
          if (a[sortKey]! < b[sortKey]!) return -1; // Use optional chaining (!) to handle possible null or undefined values
          if (a[sortKey]! > b[sortKey]!) return 1; // Use optional chaining (!) to handle possible null or undefined values
          return 0;
        });
        useNotification().notify(
          "sortDocumentsSuccess",
          `Sorting documents by sort key: ${sortKey} success`,
          NOTIFICATION_MESSAGES.Document.SORT_DOCUMENT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error sorting documents:", error);
        useNotification().notify(
          "sortDocumentsError",
          "Error sorting documents",
          NOTIFICATION_MESSAGES.Document.SORT_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },

    shareDocument: (
      state,
      action: PayloadAction<{ documentId: number; recipients: string[] }>
    ) => {
      try {
        // Implement document sharing functionality
        const { documentId, recipients } = action.payload;
        const documentToShare = state.documents.find((doc) => doc.id === documentId);
        if (documentToShare) {
          useNotification().notify(
            "shareDocumentSuccess",
            NOTIFICATION_MESSAGES.Document.SHARE_DOCUMENT_SUCCESS,
            `Sharing document "${documentToShare.title}" with recipients: ${recipients.join(', ')}`,
            new Date,
            NotificationTypeEnum.DocumentEditID
          );
          // Additional logic for sharing document with recipients...
        } else {
          useNotification().notify(
            "shareDocumentError",
            "Document not found",
            NOTIFICATION_MESSAGES.Document.DOCUMENT_NOT_FOUND,
            new Date(),
            NotificationTypeEnum.Error
          );
        }
      } catch (error) {
        console.error("Error sharing document:", error);
        useNotification().notify(
          "shareDocumentError",
          "Error sharing document",
          NOTIFICATION_MESSAGES.Document.SHARE_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },


    

    downloadDocument: (state, action: PayloadAction<number>) => {
      // Implement document download functionality
      const documentIndex = state.documents.findIndex(
        (doc) => doc.id === action.payload
      );
      if (documentIndex !== -1) {
        useNotification().notify(
          "downloadDocumentSuccess",
          "Document downloaded successfully",
          NOTIFICATION_MESSAGES.Document.DOWNLOAD_DOCUMENT_SUCCESS,
          new Date,
          NotificationTypeEnum.OperationSuccess
        );
        // Additional logic for downloading document...
      } else {
        useNotification().notify(
          "downloadDocumentError",
          `There was an error downloading the document with ID ${action.payload}, try again later`,
          NOTIFICATION_MESSAGES.Document.DOWNLOAD_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
      return state;
    },


    exportDocument: (state, action: PayloadAction<number>) => {
      // Implement document export functionality
      const documentIndex = state.documents.findIndex(
        (doc) => doc.id === action.payload
      );
      if (documentIndex !== -1) {
        useNotification().notify(
          "exportDocumentSuccess",
          "Document exported successfully",
          NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENT_SUCCESS,
          new Date,
          NotificationTypeEnum.OperationSuccess
        );
        // Additional logic for exporting document...
      } else {
        useNotification().notify(
          "exportDocumentError",
          `There was an error exporting the document with ID ${action.payload}, try again later`,
          NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },


    exportDocuments: (
      state: WritableDraft<DocumentSliceState>,
      action: PayloadAction<{ payload: any; type: string }>
    ) => {
      try {
        // Implement document export functionality
        const { documents, selectedDocument } = state;
        const { payload } = action; // Destructure payload from action
    
        if (typeof payload === 'number') {
          const documentIndex = documents.findIndex((doc) => doc.id === payload);

          if (documentIndex !== -1) {
            useNotification().notify(
              "exportDocumentsSuccess",
              "Exporting documents success",
              NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_SUCCESS,
              new Date(),
              NotificationTypeEnum.OperationSuccess
            );
            // Additional logic for exporting documents...
            return;
          } else {
            useNotification().notify(
              "exportDocumentsError",
              `There was an error exporting the document with ID ${payload}, try again later`,
              NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_ERROR,
              new Date(),
              NotificationTypeEnum.Error
            );
          }
        }
        // If selectedDocument is a number, export the document with that ID
        if (typeof selectedDocument === 'number') {
          const documentIndex = documents.findIndex((doc) => doc.id === selectedDocument);
    
          if (documentIndex !== -1) {
            useNotification().notify(
              "exportDocumentsSuccess",
              "Exporting documents success",
              NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_SUCCESS,
              new Date(),
              NotificationTypeEnum.OperationSuccess
            );
            // Additional logic for exporting documents...
            return;
          } else {
            useNotification().notify(
              "exportDocumentsError",
              `There was an error exporting the document with ID ${selectedDocument}, try again later`,
              NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_ERROR,
              new Date(),
              NotificationTypeEnum.Error
            );
          }
          // Additional logic for exporting documents...
        }
      
        // Assuming implementation here...
        useNotification().notify(
          "exportDocumentsSuccess",
          "Exporting documents success",
          NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error exporting documents:", error);
        useNotification().notify(
          "exportDocumentsError",
          "Error exporting documents",
          NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },
    
    
    
    
    importDocuments: (state, action: PayloadAction<File>) => {
      try {
        const importedFile = action.payload;
        // Implement document import functionality
        // Assuming implementation here...
        useNotification().notify(
          "importDocumentsSuccess",
          "Importing documents success",
          NOTIFICATION_MESSAGES.Document.IMPORT_DOCUMENTS_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error importing documents:", error);
        useNotification().notify(
          "importDocumentsError",
          "Error importing documents",
          NOTIFICATION_MESSAGES.Document.IMPORT_DOCUMENTS_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },
    
    archiveDocument: (state, action: PayloadAction<number>) => {
      try {
        const documentId = action.payload;
        // Implement document archiving functionality
        // Assuming implementation here...
        useNotification().notify(
          "archiveDocumentSuccess",
          `Archiving document with ID: ${documentId} success`,
          NOTIFICATION_MESSAGES.Document.ARCHIVE_DOCUMENT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error archiving document:", error);
        useNotification().notify(
          "archiveDocumentError",
          "Error archiving document",
          NOTIFICATION_MESSAGES.Document.ARCHIVE_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },
    


    fetchDocumentFromArchive: (state, action: PayloadAction<number>) => {
      try {
        const documentId = action.payload;
        // Update state with the fetched document
        state.documents.push({
          id: documentId,
          title: "",
          content: "",
          topics: [],
          highlights: [],
          files: [],
          keywords: [],
          options: {} as WritableDraft<DocumentOptions>,
          folderPath: "New Folder", 
          previousMetadata: {} as WritableDraft<StructuredMetadata>,
          currentMetadata: {} as WritableDraft<StructuredMetadata>,
          accessHistory: []
        });
        // Assuming implementation here...
        useNotification().notify(
          "fetchDocumentFromArchiveSuccess",
          `Fetching document with ID: ${documentId} success`,
          NOTIFICATION_MESSAGES.Document.FETCH_DOCUMENT_FROM_ARCHIVE_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error fetching document from archive:", error);
        useNotification().notify(
          "fetchDocumentFromArchiveError",
          "Error fetching document from archive",
          NOTIFICATION_MESSAGES.Document.FETCH_DOCUMENT_FROM_ARCHIVE_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },
    restoreDocument: (state, action: PayloadAction<number>) => {
      try {
        const documentId = action.payload;
        // Implement document restoring functionality
        const newDocument = createNewDocument(documentId); // Create a new document using the provided ID
        state.documents.push(newDocument); // Add the new document to the state array
      
        // Notify success
        useNotification().notify(
          "restoreDocumentSuccess",
          `Restoring document with ID: ${documentId} success`,
          NOTIFICATION_MESSAGES.Document.RESTORE_DOCUMENT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error restoring document:", error);
        // Notify error
        useNotification().notify(
          "restoreDocumentError",
          "Error restoring document",
          NOTIFICATION_MESSAGES.Document.RESTORE_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },

    moveDocument: (state, action: PayloadAction<{ documentId: number; destinationId: number }>) => {
      try {
        const { documentId, destinationId } = action.payload;
        // Implement document moving functionality
        const documentIndex = state.documents.findIndex(doc => doc.id === documentId);
        if (documentIndex !== -1) {
          const movedDocument = state.documents.splice(documentIndex, 1)[0];
          const destinationIndex = state.documents.findIndex(doc => doc.id === destinationId);
          if (destinationIndex !== -1) {
            state.documents.splice(destinationIndex, 0, movedDocument);
            // Notify success
            useNotification().notify(
              "moveDocumentSuccess",
              `Moving document with ID: ${documentId} to destination with ID: ${destinationId} success`,
              NOTIFICATION_MESSAGES.Document.MOVE_DOCUMENT_SUCCESS,
              new Date(),
              NotificationTypeEnum.OperationSuccess
            );
          } else {
            throw new Error(`Destination document with ID ${destinationId} not found.`);
          }
        } else {
          throw new Error(`Document with ID ${documentId} not found.`);
        }
      } catch (error: any) {
        console.error("Error moving document:", error);
        // Notify error
        useNotification().notify(
          "moveDocumentError",
          `Error moving document: ${error.message}`,
          NOTIFICATION_MESSAGES.Document.MOVE_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },
  
    copyDocument: (state, action: PayloadAction<number>) => {
      // Implement document copying functionality
      // Assuming implementation here...
      useNotification().notify(
        "copyDocumentSuccess",
        `Copying document with ID: ${action.payload} success`,
        NOTIFICATION_MESSAGES.Document.COPY_DOCUMENT_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    },


    mergeDocuments: (state, action: PayloadAction<{ sourceId: number; destinationId: number }>) => { 
      try {
        const { sourceId, destinationId } = action.payload;
        
        // Find the source document and destination document in the state
        const sourceDocumentIndex = state.documents.findIndex(doc => doc.id === sourceId);
        const destinationDocumentIndex = state.documents.findIndex(doc => doc.id === destinationId);
    
        if (sourceDocumentIndex === -1 || destinationDocumentIndex === -1) {
          throw new Error("Source document or destination document not found.");
        }
    
        // Merge the content of the source document into the destination document
        state.documents[destinationDocumentIndex].content += state.documents[sourceDocumentIndex].content;
    
        // Remove the source document from the state
        state.documents.splice(sourceDocumentIndex, 1);
    
        // Notify success
        useNotification().notify(
          "mergeDocumentsSuccess",
          `Merging document with ID: ${sourceId} to destination with ID: ${destinationId} success`,
          NOTIFICATION_MESSAGES.Document.MERGE_DOCUMENTS_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error merging documents:", error);
        // Notify error
        useNotification().notify(
          "mergeDocumentsError",
          "Error merging documents",
          NOTIFICATION_MESSAGES.Document.MERGE_DOCUMENTS_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },


    splitDocument: (state, action: PayloadAction<number>) => {
      const documentId = action.payload;
      const documentToSplit = state.documents.find(doc => doc.id === documentId);
      if (documentToSplit) {
        // Example: Split document content into two parts
        const splitContent = documentToSplit.content.split(' ');
        const firstHalf = splitContent.slice(0, Math.ceil(splitContent.length / 2)).join(' ');
        const secondHalf = splitContent.slice(Math.ceil(splitContent.length / 2)).join(' ');
        // Update the original document and add the new document
        documentToSplit.content = firstHalf;
        state.documents.push({
          id: state.documents.length + 1,
          title: `${documentToSplit.title} - Split`,
          content: secondHalf,
          topics: [],
          highlights: [],
          files: [],
          keywords: [],
          options: {} as WritableDraft<DocumentOptions>,
          folderPath: "New Folder", 
          previousMetadata: {} as WritableDraft<StructuredMetadata>,
          currentMetadata: {} as WritableDraft<StructuredMetadata>,
          accessHistory: []
        });
      }
    },


    validateDocument: (state, action: PayloadAction<number>) => {
      const documentId = action.payload;
      const documentToValidate = state.documents.find(doc => doc.id === documentId);
    
      if (documentToValidate) {
        // Example: Perform validation on document content
        let validationErrors: string[] = [];
    
        // Example validation rules
        if (!documentToValidate.title || documentToValidate.title.trim() === '') {
          validationErrors.push('Title is required.');
        }
    
        if (!documentToValidate.content || documentToValidate.content.trim() === '') {
          validationErrors.push('Content is required.');
        }
    
        // Additional validation rules...
    
        if (validationErrors.length === 0) {
          console.log(`Document ${documentId} is valid.`);
        } else {
          console.log(`Document ${documentId} is not valid. Validation errors:`, validationErrors);
        }
      }
    },
    

    encryptDocument: (state, action: PayloadAction<{ documentId: number; encryptionType: string }>) => {
      const { documentId, encryptionType } = action.payload;
      const documentToEncrypt = state.documents.find(doc => doc.id === documentId);
      
      if (documentToEncrypt) {
        // Example: Implement different encryption techniques based on encryptionType
        switch (encryptionType) {
          case 'AES':
            documentToEncrypt.content = `AES Encrypted: ${documentToEncrypt.content}`;
            break;
          case 'RSA':
            documentToEncrypt.content = `RSA Encrypted: ${documentToEncrypt.content}`;
            break;
          default:
            documentToEncrypt.content = `Default Encrypted: ${documentToEncrypt.content}`;
            break;
        }
      }
    },




    decryptDocument: (state, action: PayloadAction<{ documentId: number; encryptionType: string }>) => { 
      const { documentId, encryptionType } = action.payload;
      const documentToDecrypt = state.documents.find(doc => doc.id === documentId);

      if (documentToDecrypt) {
        // Example: Implement different decryption techniques based on encryptionType
        switch (encryptionType) {
          case 'AES':
            documentToDecrypt.content = `AES Decrypted: ${documentToDecrypt.content}`;
            break;
          case 'RSA':
            documentToDecrypt.content = `RSA Decrypted: ${documentToDecrypt.content}`;
            break;
          default:
            documentToDecrypt.content = `Default Decrypted: ${documentToDecrypt.content}`;
            break;
        }
      }
    },

    lockDocument: (state, action: PayloadAction<number>) => { 
      const documentId = action.payload;
      const documentToLock = state.documents.find(doc => doc.id === documentId);
      if (documentToLock) {
        documentToLock.locked = true;
      }
    },

    unlockDocument: (state, action: PayloadAction<number>) => { 
      const documentId = action.payload;
      const documentToUnlock = state.documents.find(doc => doc.id === documentId);
      if (documentToUnlock) {
        documentToUnlock.locked = false;
      }

    },

// Update the reducer to include the changes property in DocumentData
trackDocumentChanges: (state, action: PayloadAction<{ documentId: number; changes: string }>) => { 
  const { documentId, changes } = action.payload;
  const documentToTrack = state.documents.find(doc => doc.id === documentId);
  if (documentToTrack) {
    // Initialize the changes property if it's not already initialized
    if (!documentToTrack.changes) {
      documentToTrack.changes = [];
    }
    // Push the changes to the changes array
    documentToTrack.changes.push(changes);
  }
    },

    compareDocuments: (state, action: PayloadAction<{ documentId1: number; documentId2: number }>) => { 
      const { documentId1, documentId2 } = action.payload;
      const document1 = state.documents.find(doc => doc.id === documentId1);
      const document2 = state.documents.find(doc => doc.id === documentId2);
      if (document1 && document2) {
        // Example: Compare the content of the two documents
        const document1Content = document1.content.split(' ');
        const document2Content = document2.content.split(' ');
        const intersection = document1Content.filter(word => document2Content.includes(word));
        const union = [...new Set([...document1Content, ...document2Content])];
        const difference = [...new Set([...document1Content, ...document2Content])];
        console.log(`Intersection: ${intersection.join(' ')}`);
        console.log(`Union: ${union.join(' ')}`);
        console.log(`Difference: ${difference.join(' ')}`);
      }
    },

    searchDocuments: (state, action: PayloadAction<string>) => { 
      const searchTerm = action.payload;
      const searchResults = state.documents.filter(doc => doc.title.toLowerCase().includes(searchTerm.toLowerCase()));
      console.log(`Search results: ${searchResults.map(doc => doc.title).join(', ')}`);
    },

    searchDocument: (state, action: PayloadAction<{ documentId: number; query: string }>) => {
      const { documentId, query } = action.payload;
      const documentToSearch = state.documents.find(doc => doc.id === documentId);
    
      if (!documentToSearch) {
        // Handle case where document is not found
        console.error(`Document with ID ${documentId} not found.`);
        return;
      }
    
      // Perform search within the document content or any other necessary logic
      const searchResults = state.documents.filter(doc => performSearch(doc.content, query));
      
      // Update the state with the search results
      state.searchResults = searchResults;
    },
    

    // Add reducers for tagging, categorizing, and customizing document views
    tagDocument: (state, action: PayloadAction<{ documentId: number; tag: string }>) => {
      const { documentId, tag } = action.payload;
      const documentToTag = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToTag, transformations.tag, tag);
    },

    tagDocuments: (state, action: PayloadAction<{ documentIds: number[]; tag: string }>) => { 
      const { documentIds, tag } = action.payload;
      documentIds.forEach(documentId => {
        const documentToTag = state.documents.find(doc => doc.id === documentId);
        applyTransformation(documentToTag, transformations.tag, tag);
      });
    },

    categorizeDocument: (state, action: PayloadAction<{ documentId: number; category: string }>) => {
      const { documentId, category } = action.payload;
      const documentToCategorize = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToCategorize, transformations.categorize, category);
    },


    categorizeDocuments: (state, action: PayloadAction<{ documentIds: number[]; category: string }>) => { 
      const { documentIds, category } = action.payload;
      documentIds.forEach(documentId => {
        const documentToCategorize = state.documents.find(doc => doc.id === documentId);
        applyTransformation(documentToCategorize, transformations.categorize, category);
      });
    },

    customizeDocumentView: (state, action: PayloadAction<{ documentId: number; view: string }>) => {
      const { documentId, view } = action.payload;
      const documentToCustomize = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToCustomize, transformations.customizeView, view);
    },

    commentOnDocument: (state, action: PayloadAction<{ documentId: number; comment: string }>) => {
      const { documentId, comment } = action.payload;
      const documentToComment = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToComment, transformations.comment, comment);
    },

    mentionUserInDocument: (state, action: PayloadAction<{ documentId: number; user: string }>) => {
      const { documentId, user } = action.payload;
      const documentToMention = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToMention, transformations.mention, user);
    },

    assignTaskInDocument: (state, action: PayloadAction<{ documentId: number; task: string }>) => {
      const { documentId, task } = action.payload;
      const documentToAssign = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToAssign, transformations.assignTask, task);
    },

    requestReviewOfDocument: (state, action: PayloadAction<{ documentId: number; reviewer: string }>) => {
      const { documentId, reviewer } = action.payload;
      const documentToReview = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToReview, transformations.requestReview, reviewer);
    },

    approveDocument: (state, action: PayloadAction<{ documentId: number; approver: string }>) => {
      const { documentId, approver } = action.payload;
      const documentToApprove = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToApprove, transformations.approve, approver);
    },

    rejectDocument: (state, action: PayloadAction<{ documentId: number; rejector: string }>) => {
      const { documentId, rejector } = action.payload;
      const documentToReject = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToReject, transformations.reject, rejector);
    },


    requestFeedbackOnDocument: (state, action: PayloadAction<{ documentId: number; reviewer: string }>) => {
      const { documentId, reviewer } = action.payload;
      const documentToReview = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToReview, transformations.requestFeedback, reviewer);
    },


    provideFeedbackOnDocument: (state, action: PayloadAction<{ documentId: number; reviewer: string }>) => {
      const { documentId, reviewer } = action.payload;
      const documentToReview = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToReview, transformations.provideFeedback, reviewer);
    },



    resolveFeedbackOnDocument: (state, action: PayloadAction<{ documentId: number; reviewer: string }>) => {
      const { documentId, reviewer } = action.payload;
      const documentToReview = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToReview, transformations.resolveFeedback, reviewer);
    },


    collaborativeEditing: (state, action: PayloadAction<{ documentId: number; collaborator: string }>) => {
      const { documentId, collaborator } = action.payload;
      const documentToCollaborate = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToCollaborate, transformations.collaborate, collaborator);
    },


  smartDocumentTagging: (state, action: PayloadAction<{ documentId: number; tag: string }>) => { 
    const { documentId, tag } = action.payload;
    const documentToTag = state.documents.find(doc => doc.id === documentId);
    applyTransformation(documentToTag, transformations.tag, tag);
  
    },
  
  
    documentAnnotation: (state, action: PayloadAction<{ documentId: number; annotation: string }>) => { 
      const { documentId, annotation } = action.payload;
      const documentToAnnotate = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToAnnotate, transformations.annotate, annotation);
    },


    documentActivityLogging: (state, action: PayloadAction<{ documentId: number; activity: string }>) => {
      const { documentId, activity } = action.payload;
      const documentToLog = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToLog, transformations.logActivity, activity);
    },


    intelligentDocumentSearch: (state, action: PayloadAction<{ documentId: number; search: string }>) => {
      const { documentId, search } = action.payload;
      const documentToSearch = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToSearch, transformations.search, search);
    },


    createDocumentVersion: (state, action: PayloadAction<{ documentId: number; version: string }>) => {
      const { documentId, version } = action.payload;
      const documentToVersion = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToVersion, transformations.version, version);
    },

    revertToDocumentVersion: (state, action: PayloadAction<{ documentId: number; version: string }>) => {
      const { documentId, version } = action.payload;
      const documentToRevert = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToRevert, transformations.revert, version);
    },


    viewDocumentHistory: (state, action: PayloadAction<{ documentId: number; version: string }>) => { 
      const { documentId, version } = action.payload;
      const documentToView = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToView, transformations.viewHistory, version);
    },


    documentVersionComparison: (state, action: PayloadAction<{ documentId: number; version: string }>) => { 
      const { documentId, version } = action.payload;
      const documentToCompare = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToCompare, transformations.compare, version);
    },



  // Access control and permissions actions
    grantDocumentAccess: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
      const { documentId, user } = action.payload;
      const documentToGrant = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToGrant, transformations.grantAccess, user);
    },



    revokeDocumentAccess: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
      const { documentId, user } = action.payload;
      const documentToRevoke = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToRevoke, transformations.revokeAccess, user);
    },


    manageDocumentPermissions: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
      const { documentId, user } = action.payload;
      const documentToManage = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToManage, transformations.managePermissions, user);
    },




    initiateDocumentWorkflow: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
      const { documentId, user } = action.payload;
      const documentToInitiate = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToInitiate, transformations.initiateWorkflow, user);
    },

    automateDocumentTasks: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
      const { documentId, user } = action.payload;
      const documentToAutomate = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToAutomate, transformations.automateTasks, user);
    },

    triggerDocumentEvents: (state, action: PayloadAction<{ documentId: number; user: string }>) => {
      const { documentId, user } = action.payload;
      const documentToTrigger = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToTrigger, transformations.triggerEvents, user);
    },

    documentApprovalWorkflow: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
      const { documentId, user } = action.payload;
      const documentToApprove = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToApprove, transformations.approvalWorkflow, user);
    },

    
  documentLifecycleManagement: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
    const { documentId, user } = action.payload;
    const documentToManage = state.documents.find(doc => doc.id === documentId);
    applyTransformation(documentToManage, transformations.lifecycleManagement, user);
  },




    connectWithExternalSystem: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
      const { documentId, user } = action.payload;
      const documentToConnect = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToConnect, transformations.connectWithExternalSystem, user);
    },
  


    synchronizeWithCloudStorage: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
      const { documentId, user } = action.payload;
      const documentToSynchronize = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToSynchronize, transformations.synchronizeWithCloudStorage, user);
    },



    importFromExternalSource: (state, action: PayloadAction<{ documentId: number; user: string }>) => {
      const { documentId, user } = action.payload;
      const documentToImport = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToImport, transformations.importFromExternalSource, user);
    },

    exportToExternalSystem: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
      const { documentId, user } = action.payload;
      const documentToExport = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToExport, transformations.exportToExternalSystem, user);
    },



  generateDocumentReport: (state, action: PayloadAction<{ documentId: number; user: string }>) => {
      const { documentId, user } = action.payload;
      const documentToGenerate = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToGenerate, transformations.generateReport, user);

  },
  exportDocumentReport: (state, action: PayloadAction<{ documentId: number; user: string }>) => {
      const { documentId, user } = action.payload;
      const documentToExport = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToExport, transformations.exportReport, user);
  },
  

  scheduleReportGeneration: (state, action: PayloadAction<{ documentId: number; user: string }>) => {
      const { documentId, user } = action.payload;
      const documentToSchedule = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToSchedule, transformations.scheduleReportGeneration, user);
  },
  
  customizeReportSettings: (state, action: PayloadAction<{ documentId: number; user: string }>) => {
      const { documentId, user } = action.payload;
      const documentToCustomize = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToCustomize, transformations.customizeReportSettings, user);
  },
  

  backupDocuments: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
    const { documentId, user } = action.payload;
    const documentToBackup = state.documents.find(doc => doc.id === documentId);
    applyTransformation(documentToBackup, transformations.backupDocuments, user);
  },


  retrieveBackup: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
    const { documentId, user } = action.payload;
    const documentToRetrieve = state.documents.find(doc => doc.id === documentId);
    applyTransformation(documentToRetrieve, transformations.retrieveBackup, user);
    },
  
  
  
    documentRedaction: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
      const { documentId, user } = action.payload;
      const documentToRedact = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToRedact, transformations.redaction, user);
    },
    documentAccessControls: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
      const { documentId, user } = action.payload;
      const documentToControl = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToControl, transformations.accessControls, user);
    },


    documentTemplates: (state, action: PayloadAction<{ documentId: number; user: string }>) => { 
      const { documentId, user } = action.payload;
      const documentToTemplate = state.documents.find(doc => doc.id === documentId);
      applyTransformation(documentToTemplate, transformations.templates, user);
    },

  },
    








  
  extraReducers: (builder) => {
    builder.addCase(deleteDocumentAsync.pending, (state) => {
      // Handle pending state if needed
      state.loading = true; // Set loading state to true while the deletion is pending
      state.error = null; // Clear any previous errors
    });
    
    builder.addCase(deleteDocumentAsync.fulfilled, (state, action) => {
      // Handle fulfilled state
      const documentIndex = state.documents.findIndex((doc) => doc.id === action.payload);
      if (documentIndex !== -1) {
        state.documents.splice(documentIndex, 1);
        notify();
      } else {
        notify();
      }
    });

    builder.addCase(deleteDocumentAsync.rejected, (state, action) => {
      // Handle rejected state if needed
      notify();
      console.error("Error deleting document:", action.payload);
      useNotification().notify(
        "deleteDocumentError",
        "Error deleting document",
        NOTIFICATION_MESSAGES.Document.DELETE_DOCUMENT_ERROR,
        new Date(),
        NotificationTypeEnum.Error
      );
    });

    builder
    .addCase(fetchDocumentById.pending, (state) => {
      state.loading = true; // Ensure loading is set to true
      state.error = null;
    })
  
    .addCase(fetchDocumentById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedDocument = action.payload;
    })
    .addCase(fetchDocumentById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as WritableDraft<Error>;
    });

  

    // Add a case to handle the fulfilled action
    builder
    .addCase(fetchDocumentById.fulfilled, (state, action) => {
      // Handle successful document fetch
      state.selectedDocument = action.payload;
    })
    .addCase(deleteDocumentAsync.fulfilled, (state, action) => {
      // Handle successful document deletion
      state.documents = state.documents.filter(doc => doc.id !== action.payload);
    });

    builder.addCase(downloadDocumentAsync.fulfilled, (state, action) => {
      // Update state with downloaded document (action.payload)
      state.selectedDocument = action.payload;
      useNotification().notify(
        "downloadDocumentSuccess",
        `Downloading document with ID: ${action.payload.id} success`,
        NOTIFICATION_MESSAGES.Document.DOWNLOAD_DOCUMENT_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    });

    builder.addCase(exportDocumentsAsync.fulfilled, (state, action) => {
      // Update state with exported documents (action.payload)
      state.filteredDocuments = action.payload;
      useNotification().notify(
        "exportDocumentsSuccess",
        "Exporting documents success",
        NOTIFICATION_MESSAGES.Document.EXPORT_DOCUMENTS_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    });

    builder.addCase(downloadDocument.fulfilled, (state, action) => {
      state.selectedDocument = action.payload;
      useNotification().notify(
        "downloadDocumentSuccess",
        `Downloading document with ID: ${action.payload.id} success`,
        NOTIFICATION_MESSAGES.Document.DOWNLOAD_DOCUMENT_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    });
  },
});

// Export action creators
export const {
  // Basic document management actions
  setDocuments,
  setDownloadedDocument,
  addDocument,
  selectDocument,
  clearSelectedDocument,

  // Advanced document management actions
  updateDocument,
  deleteDocument,
  filterDocuments,
  sortDocuments,
  shareDocument,
  // downloadDocument,

  // exportDocuments,
  importDocuments,
  archiveDocument,
  fetchDocumentFromArchive,
  restoreDocument,
  moveDocument,
  copyDocument,
  mergeDocuments,
  splitDocument,
  validateDocument,
  encryptDocument,
  decryptDocument,
  lockDocument,
  unlockDocument,
  trackDocumentChanges,
  compareDocuments,
  searchDocuments,
  tagDocuments,
  tagDocument,
  categorizeDocuments,
  customizeDocumentView,

  // Collaboration and communication actions
  commentOnDocument,
  mentionUserInDocument,
  assignTaskInDocument,
  requestReviewOfDocument,
  approveDocument,
  rejectDocument,
  requestFeedbackOnDocument,
  provideFeedbackOnDocument,
  resolveFeedbackOnDocument,
  collaborativeEditing,

  smartDocumentTagging,
  documentAnnotation,
  documentActivityLogging,
  intelligentDocumentSearch,

  // Version control actions
  createDocumentVersion,
  revertToDocumentVersion,
  viewDocumentHistory,
  documentVersionComparison,
  // Access control and permissions actions
  grantDocumentAccess,
  revokeDocumentAccess,
  manageDocumentPermissions,

  // Workflow and automation actions
  initiateDocumentWorkflow,
  automateDocumentTasks,
  triggerDocumentEvents,
  documentApprovalWorkflow,
  documentLifecycleManagement,

  // Integration and interoperability action
  connectWithExternalSystem,
  synchronizeWithCloudStorage,
  importFromExternalSource,
  exportToExternalSystem,
   // Reporting actions
  generateDocumentReport,
  exportDocumentReport,
  scheduleReportGeneration,
  customizeReportSettings,

  // Backup actions
  backupDocuments,
  retrieveBackup,

  // Security Actions:

  documentRedaction,
  documentAccessControls,

  // Document Management Actions:
  documentTemplates,

} = useDocumentManagerSlice.actions;
// Define selectors for accessing document-related state
export const selectDocuments = (state: RootState) =>
  state.documentManager.documents;
export const selectSelectedDocument = (state: RootState) =>
  state.documentManager.selectedDocument;

// Export the reducer
export default useDocumentManagerSlice.reducer;

