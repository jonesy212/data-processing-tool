import { endpoints } from "@/app/api/ApiEndpoints";
import { handleApiError } from "@/app/api/ApiLogs";
import axiosInstance from "@/app/api/axiosInstance";
import headersConfig from "@/app/api/headers/HeadersConfig";
import { useAuth } from "@/app/components/auth/AuthContext";
import { DocumentData } from "@/app/components/documents/DocumentBuilder";
import { DocumentId, DocumentStatus } from "@/app/components/documents/types";
import { Drawing } from "@/app/components/libraries/drawing/generateDrawingJSON";
import { BaseData } from '@/app/components/models/data/Data';
import { NotificationType, NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import DatabaseClient from "@/app/components/todos/tasks/DatabaseClient";
import { DatasetModel } from "@/app/components/todos/tasks/DataSetModel";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { AxiosError, AxiosResponse } from "axios";
import { PoolConfig } from 'pg';
import configData from "../configData";

const { notify } = useNotification();

const API_BASE_URL = endpoints.documents;


const config: PoolConfig = {
  host: configData.database.host,
  port: configData.database.port,
  database: configData.database.database,
  user: configData.database.username,
  password: configData.database.password
}




// Unified persistSnapshot function to handle both types (Snapshot, SnapshotData) and database operations
async function persistSnapshot<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  snapshotData: SnapshotDataType<T, K>,
  config: DatabaseConfig,
  snapshotId: string,
  operationType: "insert" | "upsert" = "upsert"
): Promise<void> {
  const dbClient = new DatabaseClient(config); // Initialize DatabaseClient with config

  // Step 1: Sanitize input
  const sanitizedData = sanitizeInput(snapshotData);

  try {
    // Step 2: Connect to the database
    await dbClient.connect();

    // Step 3: Choose operation based on operationType
    if (operationType === "upsert") {
      await dbClient.upsertData("snapshots", sanitizedData); // Upsert data
    } else {
      await dbClient.insertData("snapshots", sanitizedData); // Insert data
    }

    // Step 4: Notify success
    notify("snapshotSaveSuccess", "Snapshot saved successfully", `Snapshot ID ${snapshotId} saved`, new Date(), "SUCCESS");
  } catch (error) {
    // Step 5: Handle errors and notify failure
    handleApiError(error, "persistSnapshot");
    notify("snapshotSaveError", "Error saving snapshot", `Failed to save Snapshot ID ${snapshotId}`, new Date(), "ERROR");
    throw error; // Re-throw to propagate error
  } finally {
    // Step 6: Close the database connection
    await dbClient.close();
  }
}


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
      NotificationTypeEnum.Error
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


// Combined function to load drawing from the database
async function loadDrawingFromDatabase(
  documentId: DocumentData | DocumentId
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
      const dbClient = new DatabaseClient(config);

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
    const dbClient = new DatabaseClient(config);

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

 const saveDocumentToDatabase = async (document: DatasetModel, content: string): Promise<void> => { 
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

// Function to save trade data to the database
 const saveTradeToDatabase = async (tradeData: any): Promise<void> => {
  try {
    // Initialize database client
    const dbClient = new DatabaseClient(config);

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
    loadDrawingFromDatabase, persistSnapshot, saveDocumentToDatabase,
    saveTodoToDatabase,
    saveTradeToDatabase,
    updateDocumentInDatabase
};

