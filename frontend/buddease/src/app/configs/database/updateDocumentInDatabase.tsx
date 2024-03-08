import { endpoints } from "@/app/api/ApiEndpoints";
import { handleApiError } from "@/app/api/ApiLogs";
import axiosInstance from "@/app/api/axiosInstance";
import { headersConfig } from "@/app/api/headers/HeadersConfig";
import { DocumentData } from "@/app/components/documents/DocumentBuilder";
import { DocumentId } from "@/app/components/documents/types";
import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { AxiosError, AxiosResponse } from "axios";

type DocumentStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';
const { notify } = useNotification()

const API_BASE_URL = endpoints.documents;
/**
 * Updates the status of a document in the database.
 * @param {DocumentData} documentId - The ID of the document to update.
 * @param {DocumentStatus} status - The new status of the document.
 * @returns {Promise<void>} - A Promise that resolves when the update is complete.
 */
async function updateDocumentInDatabase(documentId: DocumentId, status: DocumentStatus): Promise<void> {
  try {
    const documentUpdateUrl = `${API_BASE_URL}/documents/${documentId}`; // Assuming the endpoint structure follows this pattern

    // Integrate header management if needed
    const headers = headersConfig; // Assuming headersConfig is defined and contains the necessary headers

    // Perform the update request using axiosInstance.put
    const response: AxiosResponse = await axiosInstance.put(documentUpdateUrl, { status }, { headers });

    if (response.status === 200) {
      console.log(`Document ${documentId} updated successfully in the database.`);
    } else {
      throw new Error(`Failed to update document ${documentId} in the database.`);
    }
  } catch (error: any) {
    // Handle error and notify failure message
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

export default updateDocumentInDatabase;
