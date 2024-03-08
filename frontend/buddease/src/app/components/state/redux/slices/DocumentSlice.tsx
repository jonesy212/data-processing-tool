import { DocumentData } from "@/app/components/documents/DocumentBuilder";
import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { WritableDraft } from "../ReducerGenerator";
import { RootState } from "./RootSlice";
import updateDocumentInDatabase from "@/app/configs/database/updateDocumentInDatabase";


const notify = useNotification
// Define the initial state for the document slice
interface DocumentSliceState {
  documents: DocumentData[];
  selectedDocument: DocumentData | null;
  filteredDocuments: DocumentData[];
}

const initialState: DocumentSliceState = {
  documents: [],
  selectedDocument: null,
  filteredDocuments: [],
};

// Create a slice for managing document-related data
export const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    setDocuments: (
      state,
      action: PayloadAction<WritableDraft<DocumentData[]>>
    ) => {
      state.documents = action.payload;
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
    updateDocument: (
      state,
      action: PayloadAction<WritableDraft<DocumentData>>
    ) => {
      // TODO: Implement document update functionality
      const document =
        state.documents.find((doc) => doc.id === action.payload.id) || null;
      if (document) {
        document.title = action.payload.title;
        document.description = action.payload.description;
        document.tags = action.payload.tags;
        document.categories = action.payload.categories;
        document.documentType = action.payload.documentType;
        document.documentStatus = action.payload.documentStatus;
        document.documentOwner = action.payload.documentOwner;
        document.documentAccess = action.payload.documentAccess;
        document.documentSharing = action.payload.documentSharing;
        document.documentSecurity = action.payload.documentSecurity;
        document.documentRetention = action.payload.documentRetention;
        document.documentLifecycle = action.payload.documentLifecycle;
        document.documentWorkflow = action.payload.documentWorkflow;
        document.documentIntegration = action.payload.documentIntegration;
        document.documentReporting = action.payload.documentReporting;
        document.documentBackup = action.payload.documentBackup;
        document.documentSecurity = action.payload.documentSecurity;
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
      try {
        const documentId = action.payload;
        // Implement document download functionality
        // Assuming implementation here...
        useNotification().notify(
          "downloadDocumentSuccess",
          `Downloading document with ID: ${documentId} success`,
          NOTIFICATION_MESSAGES.Document.DOWNLOAD_DOCUMENT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error downloading document:", error);
        useNotification().notify(
          "downloadDocumentError",
          "Error downloading document",
          NOTIFICATION_MESSAGES.Document.DOWNLOAD_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },
    
    exportDocuments: (state, action: PayloadAction<number[]>) => {
      try {
        const documentIds = action.payload;
        // Implement document export functionality
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
    


    fetchDocumentFromArchive: async(state, action: PayloadAction<WritableDraft<DocumentData>>) => { 
      try {
        const documentId = action.payload;

        // Assume there is a function called fetchDocumentFromArchive
        // This function fetches the document data from the archive based on the document ID
        const restoredDocument = await fetchDocumentFromArchive(documentId);

        // Assume there is a function called updateDocumentInDatabase
        // This function updates the document status in the database to "restored"
        updateDocumentInDatabase(documentId, "restored");

        // Update the state with the restored document
        state.documents.push(restoredDocument);

        useNotification().notify(
          "restoreDocumentSuccess",
          `Restoring document with ID: ${documentId} success`,
          NOTIFICATION_MESSAGES.Document.RESTORE_DOCUMENT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error restoring document:", error);
        useNotification().notify(
          "restoreDocumentError",
          "Error restoring document",
          NOTIFICATION_MESSAGES.Document.RESTORE_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },





    restoreDocument: (state, action: PayloadAction<number>) => {
      try {
        const documentId = action.payload;
    
        // Assume there is a function called fetchDocumentFromArchive
        // This function fetches the document data from the archive based on the document ID
        const restoredDocument = fetchDocumentFromArchive(documentId);
    
        // Assume there is a function called updateDocumentInDatabase
        // This function updates the document status in the database to "restored"
        updateDocumentInDatabase(documentId, "restored");
    
        // Update the state with the restored document
        state.documents.push(restoredDocument);
    
        useNotification().notify(
          "restoreDocumentSuccess",
          `Restoring document with ID: ${documentId} success`,
          NOTIFICATION_MESSAGES.Document.RESTORE_DOCUMENT_SUCCESS,
          new Date(),
          NotificationTypeEnum.OperationSuccess
        );
      } catch (error) {
        console.error("Error restoring document:", error);
        useNotification().notify(
          "restoreDocumentError",
          "Error restoring document",
          NOTIFICATION_MESSAGES.Document.RESTORE_DOCUMENT_ERROR,
          new Date(),
          NotificationTypeEnum.Error
        );
      }
    },
  
  },
});

// Export action creators
export const {
  // Basic document management actions
  setDocuments,
  addDocument,
  selectDocument,
  clearSelectedDocument,

  // Advanced document management actions
  updateDocument,
  deleteDocument,
  filterDocuments,
  sortDocuments,
  shareDocument,
  downloadDocument,
  exportDocuments,
  importDocuments,
  archiveDocument,
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

  encryptDocument,
  decryptDocument,
  lockDocument,
  unlockDocument,

  // Workflow actions
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
} = documentSlice.actions;
// Define selectors for accessing document-related state
export const selectDocuments = (state: RootState) =>
  state.documentManager.documents;
export const selectSelectedDocument = (state: RootState) =>
  state.documentManager.selectedDocument;

// Export the reducer
export default documentSlice.reducer;
