// ApiClient.ts
import  FileImportData  from '../components/documents/FileImportData';
import axiosInstance from "@/app/api/axiosInstance";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import { AxiosError, AxiosResponse } from "axios";
import { headersConfig } from '../components/shared/SharedHeaders';
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
import { endpoints } from "./ApiEndpoints";
import { handleApiError } from "./ApiLogs";
import HeadersConfig from "./headers/HeadersConfig";
import { VersionData } from '../components/versions/VersionData';


const API_BASE_URL = endpoints.client;
// Define a function to create headers using the provided configuration
export const createHeaders = (): typeof HeadersConfig => {
  // Access and return the header configurations from HeadersConfig.tsx
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Bearer " + localStorage.getItem("accessToken"),
    // Add more headers as needed
  };
};


interface ClientNotificationMessages {
  FETCH_CLIENT_DETAILS_SUCCESS: string;
  FETCH_CLIENT_DETAILS_ERROR: string;
  UPDATE_CLIENT_DETAILS_SUCCESS: string;
  UPDATE_CLIENT_DETAILS_ERROR: string;
  // Add more keys as needed
}

const clientNotificationMessages: ClientNotificationMessages = {
  FETCH_CLIENT_DETAILS_SUCCESS: NOTIFICATION_MESSAGES.Client.FETCH_CLIENT_DETAILS_SUCCESS,
  FETCH_CLIENT_DETAILS_ERROR: NOTIFICATION_MESSAGES.Client.FETCH_CLIENT_DETAILS_ERROR,
  UPDATE_CLIENT_DETAILS_SUCCESS: NOTIFICATION_MESSAGES.Client.UPDATE_CLIENT_DETAILS_SUCCESS,
  UPDATE_CLIENT_DETAILS_ERROR: NOTIFICATION_MESSAGES.Client.UPDATE_CLIENT_DETAILS_ERROR,
  // Add more properties as needed
};

class ClientApiService {
  notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: NotificationType
  ) => void;
  updateCalendarEvent: (
    eventId: number,
    updatedEvent: any,
  ) => Promise<AxiosResponse>

  constructor(
    notify: (
      id: string,
      message: string,
      data: any,
      date: Date,
      type: NotificationType
    ) => void,
    updateCalendarEvent: (
      eventId: number,
      updatedEvent: any
    ) => Promise<AxiosResponse>,
    getFileContent: (fileId: string) => Promise<AxiosResponse>
  ) {
    this.notify = notify;
    this.updateCalendarEvent = updateCalendarEvent;
  }

  private async requestHandler(
    request: () => Promise<AxiosResponse>,
    errorMessage: string,
    successMessageId: keyof ClientNotificationMessages, // Specify the type as keyof ClientNotificationMessages
    errorMessageId: string,
    notificationData: any = null
  ): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await request();

      // Manage headers in response
      if (response.headers) {
        // Access and manage response headers here using headersConfig
        headersConfig['Authorization'] = response.headers['authorization'];
      }

      if (successMessageId) {
        const successMessage = clientNotificationMessages[successMessageId];
        this.notify(
          successMessageId,
          successMessage,
          notificationData,
          new Date(),
          "ClientSuccess" as NotificationType
        );
      }

      return response;
    } catch (error: any) {
      handleApiError(error as AxiosError<unknown, any>, errorMessage);

      if (errorMessageId) {
        const errorMessage = {} as ClientNotificationMessages[keyof ClientNotificationMessages];
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

  async getRequestHandeler() {
    return async (
      request: () => Promise<AxiosResponse>,
      errorMessage: string,
    ): Promise<AxiosResponse<any, any> | undefined> => {

      try {
        const response: AxiosResponse = await request();
        return response;
      } catch (error) {
        handleApiError(error as AxiosError<unknown, any>, errorMessage);
      }
      return undefined;
    }
  }

  
  async fetchClientDetails(clientId: number): Promise<any> {
    try {
      const clientDetailsUrl = (API_BASE_URL as any).client.fetchClientDetails(
        clientId
      );

      // Use axiosInstance with the headers configuration
      const response: AxiosResponse = await axiosInstance.get(
        clientDetailsUrl,
        {
          headers: headersConfig, // Pass headers configuration in the request
        }
      );
      const clientDetails = response.data;

      // Notify success message
      this.notify(
        "FetchClientDetailsSuccessId",
        NOTIFICATION_MESSAGES.Client.FETCH_CLIENT_DETAILS_SUCCESS,
        { clientId },
        new Date(),
        NotificationTypeEnum.Success
      );

      return clientDetails;
    } catch (error) {
      // Handle error and notify failure message
      const errorMessage = "Failed to fetch client details";
      handleApiError(error as AxiosError<unknown>, errorMessage);
      this.notify(
        "FetchClientDetailsErrorId",
        NOTIFICATION_MESSAGES.Client.FETCH_CLIENT_DETAILS_ERROR,
        { clientId, error: errorMessage },
        new Date(),
        NotificationTypeEnum.Error
      );

      throw error;
    }
  }
  async updateClientDetails(
    clientId: number,
    updatedDetails: any
  ): Promise<any> {
    try {
      const clientDetailsUrl = `${API_BASE_URL}/clients/${clientId}`;
  
      // Integrate header management
      const headers = headersConfig; // Assuming headersConfig is defined and contains the necessary headers
      const response: AxiosResponse = await axiosInstance.put(
        clientDetailsUrl,
        updatedDetails,
        { headers }
      );
  
      const updatedClientDetails = response.data;
  
      // Notify success message
      this.notify(
        "UpdateClientDetailsSuccessId",
        NOTIFICATION_MESSAGES.Client.UPDATE_CLIENT_DETAILS_SUCCESS,
        { clientId },
        new Date(),
        NotificationTypeEnum.Success
      );
  
      return updatedClientDetails;
    } catch (error) {
      // Handle error and notify failure message
      const errorMessage = "Failed to update client details";
      handleApiError(error as AxiosError<unknown>, errorMessage);
      this.notify(
        "UpdateClientDetailsErrorId",
        NOTIFICATION_MESSAGES.Client.UPDATE_CLIENT_DETAILS_ERROR,
        { clientId, error: errorMessage },
        new Date(),
        NotificationTypeEnum.Error
      );
  
      throw error;
    }
  }
  

  async connectWithTenant(tenantId: number): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`${API_BASE_URL}/connect/${tenantId}`), // Using client endpoint
      "Failed to connect with tenant",
      "ConnectWithTenantError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.CONNECT_WITH_TENANT_ERROR,
      { tenantId }
    );
  }

  async sendMessageToTenant(
    tenantId: number,
    message: string
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () =>
        axiosInstance.post(`${API_BASE_URL}/message/${tenantId}`, { message }), // Using client endpoint
      "Failed to send message to tenant",
      "SendMessageToTenantError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.SEND_MESSAGE_TO_TENANT_ERROR,
      { tenantId, message }
    );
  }

  async listConnectedTenants(): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get(`${API_BASE_URL}/connected-tenants`), // Using client endpoint
      "Failed to list connected tenants",
      "ListConnectedTenantsError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.LIST_CONNECTED_TENANTS_ERROR
    );
  }

  async listClientCMessages(): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get("/api/client/messages"),
      "Failed to list messages",
      "ListMessagesError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.LIST_MESSAGES_ERROR
    );
  }

  async createClientTask(taskData: any): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post("/api/client/tasks/create", taskData),
      "Failed to create task",
      "CreateTaskError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.CREATE_TASK_ERROR
    );
  }

  async removeCalendarEvent(eventId: number): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.delete(`/api/client/calendar/${eventId}`),
      "Failed to remove calendar event",
      "RemoveCalendarEventError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.REMOVE_CALENDAR_EVENT_ERROR
    );
  }

  async listClientTasks(): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get("/api/client/tasks"),
      "Failed to list tasks",
      "ListTasksError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.LIST_TASKS_ERROR
    );
  }

  async submitProjectProposal(proposalData: any): Promise<AxiosResponse> {
    return await this.requestHandler(
      () =>
        axiosInstance.post(
          "/api/client/projects/submit-proposal",
          proposalData
        ),
      "Failed to submit project proposal",
      "SubmitProjectProposalError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.SUBMIT_PROJECT_PROPOSAL_ERROR
    );
  }

  async participateInCommunityChallenges(
    challengeData: any
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () =>
        axiosInstance.post(
          "/api/client/community/challenges/participate",
          challengeData
        ),
      "Failed to participate in community challenges",
      "ParticipateInCommunityChallengesError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.PARTICIPATE_IN_COMMUNITY_CHALLENGES_ERROR
    );
  }

  async listClientRewards(): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get("/api/client/rewards"),
      "Failed to list rewards",
      "ListRewardsError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.LIST_REWARDS_ERROR
    );
  }

  async listFiles(dir: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get(`/api/files/${dir}`),
      "Failed to list files",
      "ListFilesError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.LIST_FILES_ERROR
    );
  }

  async getFileContent(filePath: string): Promise<AxiosResponse> {
    // Check if this.requestHandler is defined before calling it
    if (typeof this.requestHandler === 'function') {
      return await this.requestHandler(
        () => axiosInstance.get(`/api/files/${filePath}`),
        "Failed to get file content",
        "GetFileContentError" as keyof ClientNotificationMessages,
        NOTIFICATION_MESSAGES.Client.GET_FILE_CONTENT_
      );
    } else {
      // Handle the case where this.requestHandler is undefined
      throw new Error('requestHandler is not defined');
    }
  };
  

  async startCollaborativeEdit(
    fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`/api/files/${fileId}/collaborative-edit`),
      "Failed to start collaborative edit",
      "StartCollaborativeEditError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.START_COLLABORATIVE_EDIT_ERROR,
    )
  }

  async createFileVersion(
    fileId: string,
    versionData: VersionData
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`/api/files/${fileId}/versions`, versionData),
      "Failed to create file version",
      "CreateFileVersionError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.CREATE_FILE_VERSION_ERROR,
    )
  }

  async receiveFileUpdate(
    fileId: string,
    updateData: any
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`/api/files/${fileId}/updates`, updateData),
      "Failed to receive file update",
      "ReceiveFileUpdateError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.RECEIVE_FILE_UPDATE_ERROR,
    )
  }



  async fetchFileVersions(
    fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get(`/api/files/${fileId}/versions`),
      "Failed to fetch file versions",
      "FetchFileVersionsError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.FETCH_FILE_VERSIONS_ERROR
    )
  }
  
  async shareFile(fileId: string, shareData: any): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`/api/files/${fileId}/share`, shareData),
      "Failed to share file",
      "ShareFileError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.SHARE_FILE_ERROR
    );
  }


  async requestAccessToFile(
    fileId: string,
    accessData: any
  ): Promise<AxiosResponse> { 
    return await this.requestHandler(
      () => axiosInstance.post(`/api/files/${fileId}/access`, accessData),
      "Failed to request access to file",
      "RequestAccessToFileError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.REQUEST_ACCESS_TO_FILE_ERROR
    )
  }


  async exportFile(
    fileId: string,

  ): Promise<AxiosResponse> { 
    return await this.requestHandler(
      () => axiosInstance.get(`/api/files/${fileId}/export`),
      "Failed to export file",
      "ExportFileError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.EXPORT_FILE_ERROR,
    )
  }

  
  async archiveFile(
    fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.delete(`/api/files/${fileId}`),
      "Failed to archive file",
      "ArchiveFileError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.ARCHIVE_FILE_ERROR
    )
  }

  async determineFileType(fileId: string): Promise<AxiosResponse> { 
    return await this.requestHandler(
      () => axiosInstance.get(`/api/files/${fileId}/type`),
      "Failed to determine file type",
      "DetermineFileTypeError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.DETERMINE_FILE_TYPE_ERROR
    )
  }


  async importFile(
    fileData: typeof FileImportData
  ): Promise<AxiosResponse> { 
    return await this.requestHandler(
      () => axiosInstance.post(`/api/files/import`, fileData),
      "Failed to import file",
      "ImportFileError" as keyof ClientNotificationMessages,
      NOTIFICATION_MESSAGES.Client.IMPORT_FILE_ERROR
    )
  }


  
  
  // Additional client API methods can be added here...

}


// Ensure that useNotification returns a function that returns a Promise<string>
const getFileContent: (fileId: string) => Promise<AxiosResponse> = async (fileUrl: string) => {
  // Check if this.requestHandler is defined before calling it
  try {
    const response = await axiosInstance.get(`/api/files/${fileUrl}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};



const updateCalendarEvent = async (
  eventId: number,
  updatedEvent: any
): Promise<AxiosResponse> => {
  return await clientApiService.updateCalendarEvent(eventId, updatedEvent);
};




const clientApiService = new ClientApiService(useNotification, updateCalendarEvent, getFileContent);

export default clientApiService;
export { clientNotificationMessages };
export type { ClientNotificationMessages };

