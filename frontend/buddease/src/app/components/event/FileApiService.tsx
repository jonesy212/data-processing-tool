import { AxiosError, AxiosResponse } from "axios";
import { FileType } from "../documents/Attachment/attachment";
import axiosInstance from "../security/csrfToken";
import { NotificationType } from "../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { sendNotification } from "../users/UserSlice";
import { VersionData } from "../versions/VersionData";
import clientApiService, { ClientNotificationMessages, clientNotificationMessages } from "./../../api/ApiClient";
import { endpoints } from "./../../api/ApiEndpoints";
import { handleApiError } from "./../../api/ApiLogs";


const API_BASE_URL = endpoints.client;
class FileApiService {
  notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: NotificationType
  ) => void;

  constructor(
    notify: (
      id: string,
      message: string,
      data: any,
      date: Date,
      type: NotificationType
    ) => void
  ) {
    this.notify = notify;
  }

  private async requestHandler(
    request: () => Promise<AxiosResponse>,
    errorMessage: string,
    successMessageId: keyof ClientNotificationMessages,
    errorMessageId: string,
    notificationData: any = null
  ): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await request();

      // Handle headers if needed
      // Example: const authToken = response.headers['Authorization'];

      if (successMessageId) {
        const successMessage = clientNotificationMessages[successMessageId];
        this.notify(
          String(successMessageId),
          successMessage,
          notificationData,
          new Date(),
          "ClientSuccess" as NotificationType
        );
      }

      return response;
    } catch (error: any) {
      handleApiError(error as AxiosError<unknown>, errorMessage);

      if (errorMessageId) {
        const errorMessage =
          {} as ClientNotificationMessages[keyof ClientNotificationMessages];
        this.notify(
          errorMessageId,
          errorMessage,
          notificationData,
          new Date(),
          "ClientError" as NotificationType
        );
      }
      throw error;
    }
  }

  async fetchFiles(): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get(`${API_BASE_URL}/files`),
      "FetchFilesError",
      "Failed to fetch files" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.FETCH_FILES_ERROR
    );
  }

  async fetchFile(): Promise<AxiosResponse> { 
    return await this.requestHandler(
      () => axiosInstance.get(`${API_BASE_URL}/files`),
      "FetchFileError",
      "Failed to fetch file" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.FETCH_FILE_ERROR
    )
  }


  async fetchFileFromDatabase(id: string): Promise<AxiosResponse> {
    try {
      const response = await this.fetchFile();
      // Handle the response data here if needed

      return response;
    } catch (error) {
      // Handle errors here
      console.error("Error fetching file:", error);
      throw error;
    }
  }



  async fetchFliDetails(fileId: string): Promise<AxiosResponse> {
    return this.requestHandler(
      () => axiosInstance.get(`${API_BASE_URL}/files/${fileId}`),
      "FetchFileDetailsError",
      "Failed to fetch file details" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.FETCH_FILE_DETAILS_ERROR
    );
  }

  async uploadFile(file: any): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`${API_BASE_URL}/upload`, file),
      "UploadFileError",
      "Failed to upload file" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.UPLOAD_FILE_ERROR
    );
  }

  async batchRemoveFiles(fileIds: string[]): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`${API_BASE_URL}/files/batch-remove`, { fileIds }),
      "BatchRemoveFilesError",
      "Failed to remove files" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.BATCH_REMOVE_FILES_ERROR,
      { fileIds }
    );
  }

  async markFileAsComplete(fileId: string): Promise<AxiosResponse> { 
    return await this.requestHandler(
      () => axiosInstance.patch(`/api/files/${fileId}/complete`),
      "Failed to mark file as complete",
      "MarkFileAsCompleteError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.MARK_FILE_AS_COMPLETE_ERROR,
      { fileId }
      );
  }
    
    
  async startCollaborativeEdit(fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => clientApiService.startCollaborativeEdit(fileId),
      "Failed to start collaborative edit",
      "StartCollaborativeEditError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.START_COLLABORATIVE_EDIT_ERROR
    );
  }

  async createFileVersion(fileId: string, versionData: VersionData): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => clientApiService.createFileVersion(fileId, versionData),
      "Failed to create file version",
      "CreateFileVersionError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.CREATE_FILE_VERSION_ERROR
    );
  }

  async fetchFileVersions(fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => clientApiService.fetchFileVersions(fileId),
      "Failed to fetch file versions",
      "FetchFileVersionsError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.FETCH_FILE_VERSIONS_ERROR
    );
  }

  async shareFile(fileId: string, recipient: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => clientApiService.shareFile(fileId, recipient),
      "Failed to share file",
      "ShareFileError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.SHARE_FILE_ERROR
    );
  }

  async requestAccessToFile(fileId: string, accessData: any): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => clientApiService.requestAccessToFile(fileId, accessData),
      "Failed to request access to file",
      "RequestAccessToFileError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.REQUEST_ACCESS_TO_FILE_ERROR
    );
  }

  async receiveFileUpdate(fileId: string, updatedData: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => clientApiService.receiveFileUpdate(fileId, updatedData),
      "Failed to receive file update",
      "ReceiveFileUpdateError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.RECEIVE_FILE_UPDATE_ERROR
    );
  }

  async exportFile(fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => clientApiService.exportFile(fileId),
      "Failed to export file",
      "ExportFileError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.EXPORT_FILE_ERROR
    );
  }

  async archiveFile(fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => clientApiService.archiveFile(fileId),
      "Failed to archive file",
      "ArchiveFileError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.ARCHIVE_FILE_ERROR
    );
  }

  async determineFileType(file: any): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => clientApiService.determineFileType(file),
      "Failed to determine file type",
      "DetermineFileTypeError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.DETERMINE_FILE_TYPE_ERROR
    );
  }

  async importFile(file: any): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => clientApiService.importFile(file),
      "Failed to import file",
      "ImportFile Error" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.IMPORT_FILE_ERROR
    );
  }

  async initiateCollaborationSession(fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`${API_BASE_URL}/collaboration/initiate`, {
          fileId,
        }),
      "InitiateCollaborationSessionError",
      "Failed to initiate collaboration session" as keyof ClientNotificationMessages, 
      NOTIFICATION_MESSAGES.File.INITIATE_COLLABORATION_SESSION_ERROR
    );
  }

  async inviteUserToCollaborate(
    fileId: string,
    userId: string
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`${API_BASE_URL}/collaboration/invite`, {
          fileId,
          userId,
        }),
      "InviteUserToCollaborateError",
      "Failed to invite user to collaborate" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.INVITE_USER_TO_COLLABORATE_ERROR
    );
  }

  async performDataAnalysis(fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`${API_BASE_URL}/data-analysis/perform`, { fileId }),
      "PerformDataAnalysisError",
      "Failed to perform data analysis" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.PERFORM_DATA_ANALYSIS_ERROR
    );
  }

  async generateReports(fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`${API_BASE_URL}/reports/generate`, { fileId }),
      "GenerateReportsError",
      "Failed to generate reports" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.GENERATE_REPORTS_ERROR
    );
  }

  async facilitateDiscussions(fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`${API_BASE_URL}/discussions/facilitate`, {
          fileId,
        }),
      "FacilitateDiscussionsError",
      "Failed to facilitate discussions" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.FACILITATE_DISCUSSIONS_ERROR
    );
  }

  async rewardUser(userId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`${API_BASE_URL}/users/reward`, { userId }),
      "RewardUserError",
      "Failed to reward user" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.REWARD_USER_ERROR
    );
  }

  async handleTransactions(transactionData: any): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(
          `${API_BASE_URL}/transactions/handle`,
          transactionData
        ),
      "HandleTransactionsError",
      "Failed to handle transactions" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.HANDLE_TRANSACTIONS_ERROR
    );
  }

  async trackRevenue(projectId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`${API_BASE_URL}/revenue/track`, { projectId }),
      "TrackRevenueError",
      "Failed to track revenue" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.TRACK_REVENUE_ERROR
    );
  }

  async supportMultilingualCommunication(): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(
          `${API_BASE_URL}/communication/multilingual-support`
        ),
      "SupportMultilingualCommunicationError",
      "Failed to support multilingual communication" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.SUPPORT_MULTILINGUAL_COMMUNICATION_ERROR
    );
  }

  async enforceSecurityMeasures(): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`${API_BASE_URL}/security/enforce-measures`),
      "EnforceSecurityMeasuresError",
      "Failed to enforce security measures" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.File.ENFORCE_SECURITY_MEASURES_ERROR
    );
  }






// Define the function to determine the file type
async getFileType(file: string): Promise<FileType> {
  try {
    // Call the API to get the file type
    const response: AxiosResponse<{ fileType?: FileType }> = await axiosInstance.get(`/api/files/${file}/type`);
    // Extract the file type from the response data
    const fileType: FileType | undefined = response?.data?.fileType;
    // Check if fileType is undefined or null, and handle accordingly
    if (!fileType) {
      throw new Error("File type not provided in response.");
    }
    // Convert fileType to the appropriate enum value
    switch (fileType) {
      case "image":
      case "document":
      case "link":
        
      // Add more cases for other file types if needed
        return fileType as FileType;
      default:
        return "other"; // Or any other default type as needed
    }
  } catch (error) {
    // Handle errors if necessary
    console.error("Error determining file type:", error);
    throw error;
  }
}
}

export default FileApiService;
export const fileApiService = new FileApiService(
  (id, message, data, date, type) => {
    // Implement the logic to send notifications here
    
    sendNotification(`Notification sent: ${message}`)

  }
);


