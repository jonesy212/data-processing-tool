import { endpoints } from "@/app/api/ApiEndpoints";
import { handleApiError } from "@/app/api/ApiLogs";
import axiosInstance from "@/app/api/axiosInstance";
import headersConfig from "@/app/api/headers/HeadersConfig";
import { useAuth } from "@/app/components/auth/AuthContext";
import { DocumentId, DocumentStatus } from "@/app/components/documents/types";
import { NotificationType, NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import DatabaseClient from "@/app/components/todos/tasks/DataSetModel";
import { AxiosError, AxiosResponse } from "axios";

const { notify } = useNotification();

const API_BASE_URL = endpoints.documents;

export const fetchDocumentFromArchive = async (documentId: DocumentId): Promise<void> => {
  try {
    const documentUrl = `${API_BASE_URL}/documents/${documentId}`;
    const headers = headersConfig;
    const response = await axiosInstance.get(documentUrl, { headers });
    const document = response.data;
    document.status = 'draft';
  } catch (error: any) {
    handleApiError(error, 'fetchDocumentFromArchive');
    notify(
      'fetchDocumentFromArchiveError',
      'Error fetching document from archive',
      NOTIFICATION_MESSAGES.Document.FETCH_FROM_ARCHIVE_ERROR,
      new Date(),
      'ERROR' as NotificationType
    );
  }
}

async function updateDocumentInDatabase(documentId: DocumentId, status: DocumentStatus): Promise<void> {
  try {
    const documentUpdateUrl = `${API_BASE_URL}/documents/${documentId}`;
    const headers = headersConfig;
    
    // Use the useAuth hook to access authentication state and functions
    const { token } = useAuth();
    
    // Check if the user is authenticated before making the update request
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response: AxiosResponse = await axiosInstance.put(documentUpdateUrl, { status }, { headers });

    if (response.status === 200) {
      console.log(`Document ${documentId} updated successfully in the database.`);
    } else {
      throw new Error(`Failed to update document ${documentId} in the database.`);
    }
  } catch (error: any) {
    const errorMessage = "Failed to update document";
    handleApiError(error as AxiosError<unknown>, errorMessage);
    notify(
      "UpdateDocumentErrorId",
      NOTIFICATION_MESSAGES.Document.UPDATE_DOCUMENT_ERROR,
      { documentId, error: errorMessage },
      new Date(),
      NotificationTypeEnum.Error
    );

    throw error;
  }
}



// Function to save to-do data to the database
export const saveTodoToDatabase = async (todoData: any): Promise<void> => {
  try {
    // Initialize database client
    const dbClient = new DatabaseClient();

    // Connect to the database
    await dbClient.connect();

    // Insert the to-do data into the appropriate collection/table
    await dbClient.insert("todos", todoData);

    // Close the database connection
    await dbClient.close();

    console.log("To-do data saved to the database:", todoData);
  } catch (error) {
    console.error("Error saving to-do data to the database:", error);
    throw error; // Propagate the error to the caller
  }
};

export const saveDocumentToDatabase = async (document: Document, content: string): Promise<void> => { 
  try {

    // Initialize database client
    const dbClient = new DatabaseClient(config);
    // Connect to the database
    await dbClient.connect();
    // Save the document
    await dbClient.insert("documents", document);
    // Close the database connection
    await dbClient.close();
  } catch (error) {
    handleApiError(error as AxiosError<unknown>, "Failed to save document to database");
  }
}


// Function to save trade data to the database
export const saveTradeToDatabase = async (tradeData: any): Promise<void> => {
  try {
    // Initialize database client
    const dbClient = new DatabaseClient();

    // Connect to the database
    await dbClient.connect();

    // Insert the trade data into the trades collection/table
    await dbClient.insert("trades", tradeData);

    // Close the database connection
    await dbClient.close();

    console.log("Trade data saved to the database:", tradeData);
  } catch (error) {
    console.error("Error saving trade data to the database:", error);
    throw error; // Propagate the error to the caller
  }
};

export default updateDocumentInDatabase;
