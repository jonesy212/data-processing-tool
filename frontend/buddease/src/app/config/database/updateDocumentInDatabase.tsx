// updateDocumentInDatabase.tsx
import DatabaseClient from "@/api/DatabaseClient";
import { handleApiError } from "@/app/api/ApiLogs";
import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from '@/app/api/endpointConfigurations';
import headersConfig from "@/app/api/headers/HeadersConfig";
import { DocumentId, DocumentStatus } from "@/app/components/documents/types";
import { Drawing } from "@/app/libraries/drawing/generateDrawingJSON";
import { DatasetModel } from "@/app/todos/tasks/DataSetModel";
import { NotificationType, NotificationTypeEnum, useNotification } from "@/app/state/context/NotificationContext";
import { DocumentData } from "@/app/documents/editing/DocumentBuilder";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { useAuth } from "@/state/context/AuthContext";
import { AxiosError, AxiosResponse } from "axios";
import { databaseConfig } from '@/app/server/database/config'
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

const { notify } = useNotification();

const API_BASE_URL = endpoints.documents;



const fetchDocumentFromArchive = async (documentId: DocumentId): Promise<void> => {
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
      NotificationTypeEnum.ERROR
    );

    throw error;
  }
}


let documentId: DocumentData | undefined;

if (typeof documentId === "string" || typeof documentId === "object") {
  // No need to reassign documentId here
} else {
  // Handle case where documentId is undefined or not a string/object
  // Handle non-string/object case if needed
}


 const addDocumentFailure = async (error: AxiosError<unknown>) => {
  try {
    const { data } = error.response as AxiosResponse;
    const { message, status } = data;
    console.log(`Error fetching document from archive: ${message}`);
    console.log(`Status code: ${status}`);
  } catch (error) {
    console.error(`Error fetching document from archive: ${error}`);
  }
}






// Combined function to load drawing from the database
async function loadDrawingFromDatabase<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  documentId: DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | DocumentId
): Promise<Drawing | string> {
  try {
    // Check if the documentId is of type DocumentData
    if ("id" in documentId) {
      // Mock implementation to simulate loading drawing from database
      // Replace this with actual database query or API call
      const drawing: Drawing = {
        id: String(documentId.id),
        name: "Mock Drawing",
        // Add other properties of the drawing
      };
      return drawing;
    } else if (typeof documentId === "string") {
      // Initialize database client
      const dbClient = new DatabaseClient(databaseConfig);

      // Connect to the database
      await dbClient.connect();

      // Query the database for the drawing content
      const result = await dbClient.query(
        "SELECT content FROM drawings WHERE document_id = $1",
        [documentId as string]
      );

      // Check if the query result has any rows
      if (result.rows.length > 0) {
        // Get the drawing content from the query result
        const drawingContent = result.rows[0].content;
        return drawingContent;
      } else {
        throw new Error("No drawing found for the given document ID");
      }
    } else {
      throw new Error("Invalid documentId");
    }
  } catch (error: any) {
    handleApiError(error, "loadDrawingFromDatabase");
    throw error;
  }
}




// Function to save to-do data to the database
const saveTodoToDatabase = async (todoData: any): Promise<void> => {
  try {
    // Initialize database client
    const dbClient = new DatabaseClient(databaseConfig);

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

 const saveDocumentToDatabase = async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T>(document: DatasetModel<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, content: string): Promise<void> => { 
  try {

    // Initialize database client
    const dbClient = new DatabaseClient(databaseConfig);
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
 const saveTradeToDatabase = async (tradeData: any): Promise<void> => {
  try {
    // Initialize database client
    const dbClient = new DatabaseClient(databaseConfig);

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

export {
    addDocumentFailure, fetchDocumentFromArchive,
    loadDrawingFromDatabase, saveDocumentToDatabase,
    saveTodoToDatabase,
    saveTradeToDatabase,
    updateDocumentInDatabase
};

