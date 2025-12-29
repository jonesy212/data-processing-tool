// ApiClient.ts
//  External API calls (HTTP/REST APIs, external services)
import { handleApiError } from '@/core/api/ApiLogs';
import axiosInstance from '@/core/api/csrfToken';
import { endpoints } from "@/core/api/endpointConfigurations";
import HeadersConfig from "@/core/api/headers/HeadersConfig";
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import { headersConfig } from '@/core/components/shared/SharedHeaders';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import FileImportData from '@/core/documents/FileImportData';
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from '@/core/state/context/NotificationContext';
import { VersionData } from '@/core/versions/VersionData';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";


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



// Then use it in your clientNotificationMessages
interface ClientNotificationMessages {
  // Existing messages
  [key: string]: string;

  GENERIC_POST_ERROR: string;
  GENERIC_PUT_ERROR: string;
  GENERIC_DELETE_ERROR: string;
  
  FETCH_CLIENT_DETAILS_SUCCESS: string;
  FETCH_CLIENT_DETAILS_ERROR: string;
  UPDATE_CLIENT_DETAILS_SUCCESS: string;
  UPDATE_CLIENT_DETAILS_ERROR: string;
  REMOVE_CALENDAR_EVENT_SUCCESS: string;
  REMOVE_CALENDAR_EVENT_ERROR: string;
  GENERIC_GET_ERROR: string;

  // Tenant and communication messages
  CONNECT_WITH_TENANT_SUCCESS: string;
  CONNECT_WITH_TENANT_ERROR: string;
  SEND_MESSAGE_TO_TENANT_SUCCESS: string;
  SEND_MESSAGE_TO_TENANT_ERROR: string;
  LIST_CONNECTED_TENANTS_SUCCESS: string;
  LIST_CONNECTED_TENANTS_ERROR: string;

  // Task and project messages
  LIST_MESSAGES_SUCCESS: string;
  LIST_MESSAGES_ERROR: string;
  CREATE_TASK_SUCCESS: string;
  CREATE_TASK_ERROR: string;
  LIST_TASKS_SUCCESS: string;
  LIST_TASKS_ERROR: string;
  SUBMIT_PROJECT_PROPOSAL_SUCCESS: string;
  SUBMIT_PROJECT_PROPOSAL_ERROR: string;
  PARTICIPATE_IN_COMMUNITY_CHALLENGES_SUCCESS: string;
  PARTICIPATE_IN_COMMUNITY_CHALLENGES_ERROR: string;

  // Rewards and files
  LIST_REWARDS_SUCCESS: string;
  LIST_REWARDS_ERROR: string;
  LIST_FILES_SUCCESS: string;
  LIST_FILES_ERROR: string;
  GET_FILE_CONTENT_SUCCESS: string;
  GET_FILE_CONTENT_ERROR: string;
  START_COLLABORATIVE_EDIT_SUCCESS: string;
  START_COLLABORATIVE_EDIT_ERROR: string;

  // File operations
  CREATE_FILE_VERSION_SUCCESS: string;
  CREATE_FILE_VERSION_ERROR: string;
  RECEIVE_FILE_UPDATE_SUCCESS: string;
  RECEIVE_FILE_UPDATE_ERROR: string;
  FETCH_FILE_VERSIONS_SUCCESS: string;
  FETCH_FILE_VERSIONS_ERROR: string;
  SHARE_FILE_SUCCESS: string;
  SHARE_FILE_ERROR: string;
  REQUEST_ACCESS_TO_FILE_SUCCESS: string;
  REQUEST_ACCESS_TO_FILE_ERROR: string;
  EXPORT_FILE_SUCCESS: string;
  EXPORT_FILE_ERROR: string;
  ARCHIVE_FILE_SUCCESS: string;
  ARCHIVE_FILE_ERROR: string;
  DETERMINE_FILE_TYPE_SUCCESS: string;
  DETERMINE_FILE_TYPE_ERROR: string;
  IMPORT_FILE_SUCCESS: string;
  IMPORT_FILE_ERROR: string;
}

// Helper function to get message with fallback
const getNotificationMessage = (key: keyof ClientNotificationMessages): string => {
  const message = NOTIFICATION_MESSAGES.Client[key as keyof typeof NOTIFICATION_MESSAGES.Client];
  if (message) return message;

  // Fallback messages for any missing ones
  const fallbackMessages: Partial<ClientNotificationMessages> = {
    // Existing client messages
    FETCH_CLIENT_DETAILS_SUCCESS: "Client details fetched successfully",
    FETCH_CLIENT_DETAILS_ERROR: "Failed to fetch client details",
    UPDATE_CLIENT_DETAILS_SUCCESS: "Client details updated successfully",
    UPDATE_CLIENT_DETAILS_ERROR: "Failed to update client details",
    REMOVE_CALENDAR_EVENT_ERROR: "Failed to remove calendar event",
    GENERIC_GET_ERROR: "Failed to fetch data",

    // Tenant and communication messages
    CONNECT_WITH_TENANT_SUCCESS: "Successfully connected with tenant",
    CONNECT_WITH_TENANT_ERROR: "Failed to connect with tenant",
    SEND_MESSAGE_TO_TENANT_SUCCESS: "Message sent to tenant successfully",
    SEND_MESSAGE_TO_TENANT_ERROR: "Failed to send message to tenant",
    LIST_CONNECTED_TENANTS_SUCCESS: "Connected tenants listed successfully",
    LIST_CONNECTED_TENANTS_ERROR: "Failed to list connected tenants",

    // Task and project messages
    LIST_MESSAGES_SUCCESS: "Messages listed successfully",
    LIST_MESSAGES_ERROR: "Failed to list messages",
    CREATE_TASK_SUCCESS: "Task created successfully",
    CREATE_TASK_ERROR: "Failed to create task",
    REMOVE_CALENDAR_EVENT_SUCCESS: "Calendar event removed successfully",
    LIST_TASKS_SUCCESS: "Tasks listed successfully",
    LIST_TASKS_ERROR: "Failed to list tasks",
    SUBMIT_PROJECT_PROPOSAL_SUCCESS: "Project proposal submitted successfully",
    SUBMIT_PROJECT_PROPOSAL_ERROR: "Failed to submit project proposal",
    PARTICIPATE_IN_COMMUNITY_CHALLENGES_SUCCESS: "Successfully participated in community challenges",
    PARTICIPATE_IN_COMMUNITY_CHALLENGES_ERROR: "Failed to participate in community challenges",

    // Rewards and files
    LIST_REWARDS_SUCCESS: "Rewards listed successfully",
    LIST_REWARDS_ERROR: "Failed to list rewards",
    LIST_FILES_SUCCESS: "Files listed successfully",
    LIST_FILES_ERROR: "Failed to list files",
    GET_FILE_CONTENT_SUCCESS: "File content retrieved successfully",
    GET_FILE_CONTENT_ERROR: "Failed to get file content",
    START_COLLABORATIVE_EDIT_SUCCESS: "Collaborative edit started successfully",
    START_COLLABORATIVE_EDIT_ERROR: "Failed to start collaborative edit",

    // File operations
    CREATE_FILE_VERSION_SUCCESS: "File version created successfully",
    CREATE_FILE_VERSION_ERROR: "Failed to create file version",
    RECEIVE_FILE_UPDATE_SUCCESS: "File update received successfully",
    RECEIVE_FILE_UPDATE_ERROR: "Failed to receive file update",
    FETCH_FILE_VERSIONS_SUCCESS: "File versions fetched successfully",
    FETCH_FILE_VERSIONS_ERROR: "Failed to fetch file versions",
    SHARE_FILE_SUCCESS: "File shared successfully",
    SHARE_FILE_ERROR: "Failed to share file",
    REQUEST_ACCESS_TO_FILE_SUCCESS: "File access requested successfully",
    REQUEST_ACCESS_TO_FILE_ERROR: "Failed to request file access",
    EXPORT_FILE_SUCCESS: "File exported successfully",
    EXPORT_FILE_ERROR: "Failed to export file",
    ARCHIVE_FILE_SUCCESS: "File archived successfully",
    ARCHIVE_FILE_ERROR: "Failed to archive file",
    DETERMINE_FILE_TYPE_SUCCESS: "File type determined successfully",
    DETERMINE_FILE_TYPE_ERROR: "Failed to determine file type",
    IMPORT_FILE_SUCCESS: "File imported successfully",
    IMPORT_FILE_ERROR: "Failed to import file",
  };

  return fallbackMessages[key] || `${key} message not configured`;
};

const clientNotificationMessages: ClientNotificationMessages & {
  GENERIC_POST_ERROR: string;
  GENERIC_PUT_ERROR: string;
  GENERIC_DELETE_ERROR: string;
} = {

  // Generic messages:
  GENERIC_GET_ERROR: "GENERIC_GET_ERROR" as const,
  GENERIC_POST_ERROR: "GENERIC_POST_ERROR" as const,
  GENERIC_PUT_ERROR: "GENERIC_PUT_ERROR" as const,
  GENERIC_DELETE_ERROR: "GENERIC_DELETE_ERROR" as const,
  
  // client messages
  FETCH_CLIENT_DETAILS_SUCCESS: getNotificationMessage('FETCH_CLIENT_DETAILS_SUCCESS'),
  FETCH_CLIENT_DETAILS_ERROR: getNotificationMessage('FETCH_CLIENT_DETAILS_ERROR'),
  UPDATE_CLIENT_DETAILS_SUCCESS: getNotificationMessage('UPDATE_CLIENT_DETAILS_SUCCESS'),
  UPDATE_CLIENT_DETAILS_ERROR: getNotificationMessage('UPDATE_CLIENT_DETAILS_ERROR'),
  REMOVE_CALENDAR_EVENT_ERROR: getNotificationMessage('REMOVE_CALENDAR_EVENT_ERROR'),
  GENERIC_GET_ERROR: getNotificationMessage('GENERIC_GET_ERROR'),

  // Tenant and communication messages
  CONNECT_WITH_TENANT_SUCCESS: getNotificationMessage('CONNECT_WITH_TENANT_SUCCESS'),
  CONNECT_WITH_TENANT_ERROR: getNotificationMessage('CONNECT_WITH_TENANT_ERROR'),
  SEND_MESSAGE_TO_TENANT_SUCCESS: getNotificationMessage('SEND_MESSAGE_TO_TENANT_SUCCESS'),
  SEND_MESSAGE_TO_TENANT_ERROR: getNotificationMessage('SEND_MESSAGE_TO_TENANT_ERROR'),
  LIST_CONNECTED_TENANTS_SUCCESS: getNotificationMessage('LIST_CONNECTED_TENANTS_SUCCESS'),
  LIST_CONNECTED_TENANTS_ERROR: getNotificationMessage('LIST_CONNECTED_TENANTS_ERROR'),

  // Task and project messages
  LIST_MESSAGES_SUCCESS: getNotificationMessage('LIST_MESSAGES_SUCCESS'),
  LIST_MESSAGES_ERROR: getNotificationMessage('LIST_MESSAGES_ERROR'),
  CREATE_TASK_SUCCESS: getNotificationMessage('CREATE_TASK_SUCCESS'),
  CREATE_TASK_ERROR: getNotificationMessage('CREATE_TASK_ERROR'),
  REMOVE_CALENDAR_EVENT_SUCCESS: getNotificationMessage('REMOVE_CALENDAR_EVENT_SUCCESS'),
  LIST_TASKS_SUCCESS: getNotificationMessage('LIST_TASKS_SUCCESS'),
  LIST_TASKS_ERROR: getNotificationMessage('LIST_TASKS_ERROR'),
  SUBMIT_PROJECT_PROPOSAL_SUCCESS: getNotificationMessage('SUBMIT_PROJECT_PROPOSAL_SUCCESS'),
  SUBMIT_PROJECT_PROPOSAL_ERROR: getNotificationMessage('SUBMIT_PROJECT_PROPOSAL_ERROR'),
  PARTICIPATE_IN_COMMUNITY_CHALLENGES_SUCCESS: getNotificationMessage('PARTICIPATE_IN_COMMUNITY_CHALLENGES_SUCCESS'),
  PARTICIPATE_IN_COMMUNITY_CHALLENGES_ERROR: getNotificationMessage('PARTICIPATE_IN_COMMUNITY_CHALLENGES_ERROR'),

  // Rewards and files
  LIST_REWARDS_SUCCESS: getNotificationMessage('LIST_REWARDS_SUCCESS'),
  LIST_REWARDS_ERROR: getNotificationMessage('LIST_REWARDS_ERROR'),
  LIST_FILES_SUCCESS: getNotificationMessage('LIST_FILES_SUCCESS'),
  LIST_FILES_ERROR: getNotificationMessage('LIST_FILES_ERROR'),
  GET_FILE_CONTENT_SUCCESS: getNotificationMessage('GET_FILE_CONTENT_SUCCESS'),
  GET_FILE_CONTENT_ERROR: getNotificationMessage('GET_FILE_CONTENT_ERROR'),
  START_COLLABORATIVE_EDIT_SUCCESS: getNotificationMessage('START_COLLABORATIVE_EDIT_SUCCESS'),
  START_COLLABORATIVE_EDIT_ERROR: getNotificationMessage('START_COLLABORATIVE_EDIT_ERROR'),

  // File operations
  CREATE_FILE_VERSION_SUCCESS: getNotificationMessage('CREATE_FILE_VERSION_SUCCESS'),
  CREATE_FILE_VERSION_ERROR: getNotificationMessage('CREATE_FILE_VERSION_ERROR'),
  RECEIVE_FILE_UPDATE_SUCCESS: getNotificationMessage('RECEIVE_FILE_UPDATE_SUCCESS'),
  RECEIVE_FILE_UPDATE_ERROR: getNotificationMessage('RECEIVE_FILE_UPDATE_ERROR'),
  FETCH_FILE_VERSIONS_SUCCESS: getNotificationMessage('FETCH_FILE_VERSIONS_SUCCESS'),
  FETCH_FILE_VERSIONS_ERROR: getNotificationMessage('FETCH_FILE_VERSIONS_ERROR'),
  SHARE_FILE_SUCCESS: getNotificationMessage('SHARE_FILE_SUCCESS'),
  SHARE_FILE_ERROR: getNotificationMessage('SHARE_FILE_ERROR'),
  REQUEST_ACCESS_TO_FILE_SUCCESS: getNotificationMessage('REQUEST_ACCESS_TO_FILE_SUCCESS'),
  REQUEST_ACCESS_TO_FILE_ERROR: getNotificationMessage('REQUEST_ACCESS_TO_FILE_ERROR'),
  EXPORT_FILE_SUCCESS: getNotificationMessage('EXPORT_FILE_SUCCESS'),
  EXPORT_FILE_ERROR: getNotificationMessage('EXPORT_FILE_ERROR'),
  ARCHIVE_FILE_SUCCESS: getNotificationMessage('ARCHIVE_FILE_SUCCESS'),
  ARCHIVE_FILE_ERROR: getNotificationMessage('ARCHIVE_FILE_ERROR'),
  DETERMINE_FILE_TYPE_SUCCESS: getNotificationMessage('DETERMINE_FILE_TYPE_SUCCESS'),
  DETERMINE_FILE_TYPE_ERROR: getNotificationMessage('DETERMINE_FILE_TYPE_ERROR'),
  IMPORT_FILE_SUCCESS: getNotificationMessage('IMPORT_FILE_SUCCESS'),
  IMPORT_FILE_ERROR: getNotificationMessage('IMPORT_FILE_ERROR'),
};

interface ApiRequestOptions<TMessages extends Record<string, string>> {
  successMessageId?: keyof TMessages;
  errorMessageId?: keyof TMessages;
  notificationData?: any;
  config?: AxiosRequestConfig;
}

export class ClientApiService<TMessages extends Record<string, string>> {
  notify: (
    id: string,
    message: string,
    data: any,
    date: Date,
    type: NotificationType
  ) => void;

  private readonly defaultErrorKeys = {
    GENERIC_GET_ERROR: "GENERIC_GET_ERROR",
    GENERIC_POST_ERROR: "GENERIC_POST_ERROR", 
    GENERIC_PUT_ERROR: "GENERIC_PUT_ERROR",
    GENERIC_DELETE_ERROR: "GENERIC_DELETE_ERROR",
  } as const;

  constructor(
    notify: (
      id: string,
      message: string,
      data: any,
      date: Date,
      type: NotificationType
    ) => void,
    private notificationMessages: TMessages & typeof this.defaultErrorKeys 
  ) {
    this.notify = notify;
  }

  private async requestHandler(
    request: () => Promise<AxiosResponse>,
    errorMessage: string,
    successMessageId: keyof TMessages | undefined, 
    errorMessageId: keyof TMessages,
    notificationData: any = null
  ): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await request();

      if (successMessageId) {
        const successMessage = this.notificationMessages[successMessageId];
        this.notify(String(successMessageId), successMessage, notificationData, new Date(), "success" as NotificationType);
      }

      return response;
    } catch (error: any) {
      handleApiError(error as AxiosError<unknown>, errorMessage);

      if (errorMessageId) {
        const errorMessageText = this.notificationMessages[errorMessageId];
        this.notify(String(errorMessageId), errorMessageText, notificationData, new Date(), "error" as NotificationType);
      }
      throw error;
    }
  }
  async get<T = any>(
    url: string,
    options: ApiRequestOptions<TMessages> = {}
  ): Promise<AxiosResponse<T>> {
    return this.requestHandler(
      () => axiosInstance.get<T>(url, options.config),
      "GET request failed",
      options.successMessageId,
      options.errorMessageId || this.defaultErrorKeys.GENERIC_GET_ERROR as keyof TMessages,
      options.notificationData
    );
  }

  async post<T = any>(
    url: string,
    data?: any,
    options: ApiRequestOptions<TMessages> = {}
  ): Promise<AxiosResponse<T>> {

    // Auto-set headers for FormData
    const config: AxiosRequestConfig = {
      ...options.config,
      headers: {
        ...(options.config?.headers || {}),
        ...(data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}),
      },
    };

    return this.requestHandler(
      () => axiosInstance.post<T>(url, data, config),
      "POST request failed",
      options.successMessageId,
      options.errorMessageId || this.defaultErrorKeys.GENERIC_POST_ERROR as keyof TMessages,
      options.notificationData
    );
  }

  async put<T = any>(
    url: string,
    data?: any,
    options: ApiRequestOptions<TMessages> = {}
  ): Promise<AxiosResponse<T>> {
    return this.requestHandler(
      () => axiosInstance.put<T>(url, data, options.config),
      "PUT request failed",
      options.successMessageId,
      options.errorMessageId || this.defaultErrorKeys.GENERIC_PUT_ERROR as keyof TMessages,
      options.notificationData
    );
  }

  async delete<T = any>(
    url: string,
    options: ApiRequestOptions<TMessages> = {}
  ): Promise<AxiosResponse<T>> {
    return this.requestHandler(
      () => axiosInstance.delete<T>(url, options.config),
      "DELETE request failed",
      options.successMessageId,
      options.errorMessageId || this.defaultErrorKeys.GENERIC_DELETE_ERROR as keyof TMessages,
      options.notificationData
    );
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
    return await this.requestHandler(
      () => axiosInstance.get(
        `${API_BASE_URL}/clients/${clientId}`,
        { config: { headers: headersConfig } }
      ),
      "Failed to fetch client details", // For handleApiError logging
      "FETCH_CLIENT_DETAILS_SUCCESS" as keyof TMessages, // Success notification key
      "FETCH_CLIENT_DETAILS_ERROR" as keyof TMessages, // Error notification key  
      { clientId } // Data passed to notifications
    ).then(response => response.data);
  }

  async updateClientDetails(
    clientId: number,
    updatedDetails: any
  ): Promise<any> {
    return await this.requestHandler(
      () => axiosInstance.put(
        `${API_BASE_URL}/clients/${clientId}`,
        updatedDetails,
        { config: { headers: headersConfig } }
      ),
      "Failed to update client details",
      "UPDATE_CLIENT_DETAILS_SUCCESS" as keyof TMessages,
      "UPDATE_CLIENT_DETAILS_ERROR" as keyof TMessages,
      { clientId }
    ).then(response => response.data);
  }

  async connectWithTenant(tenantId: number): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`${API_BASE_URL}/connect/${tenantId}`),
      "Failed to connect with tenant",
      "CONNECT_WITH_TENANT_SUCCESS" as keyof TMessages,
      "CONNECT_WITH_TENANT_ERROR" as keyof TMessages,
      { tenantId }
    );
  }

  async sendMessageToTenant(
    tenantId: number,
    message: string
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`${API_BASE_URL}/message/${tenantId}`, { message }),
      "Failed to send message to tenant",
      "SEND_MESSAGE_TO_TENANT_SUCCESS" as keyof TMessages,
      "SEND_MESSAGE_TO_TENANT_ERROR" as keyof TMessages,
      { tenantId, message }
    );
  }

  async listConnectedTenants(): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get(`${API_BASE_URL}/connected-tenants`),
      "Failed to list connected tenants",
      "LIST_CONNECTED_TENANTS_SUCCESS" as keyof TMessages,
      "LIST_CONNECTED_TENANTS_ERROR" as keyof TMessages
    );
  }

  async listClientCMessages(): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get("/api/client/messages"),
      "Failed to list messages",
      "LIST_MESSAGES_SUCCESS" as keyof TMessages,
      "LIST_MESSAGES_ERROR" as keyof TMessages
    );
  }

  async createClientTask(taskData: any): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post("/api/client/tasks/create", taskData),
      "Failed to create task",
      "CREATE_TASK_SUCCESS" as keyof TMessages,
      "CREATE_TASK_ERROR" as keyof TMessages
    );
  }

  async removeCalendarEvent(eventId: number): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.delete(`/api/client/calendar/${eventId}`),
      "Failed to remove calendar event",
      "REMOVE_CALENDAR_EVENT_SUCCESS" as keyof TMessages,
      "REMOVE_CALENDAR_EVENT_ERROR" as keyof TMessages
    );
  }

  async listClientTasks(): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get("/api/client/tasks"),
      "Failed to list tasks",
      "LIST_TASKS_SUCCESS" as keyof TMessages,
      "LIST_TASKS_ERROR" as keyof TMessages
    );
  }

  async submitProjectProposal(proposalData: any): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post("/api/client/projects/submit-proposal", proposalData),
      "Failed to submit project proposal",
      "SUBMIT_PROJECT_PROPOSAL_SUCCESS" as keyof TMessages,
      "SUBMIT_PROJECT_PROPOSAL_ERROR" as keyof TMessages
    );
  }

  async participateInCommunityChallenges(
    challengeData: any
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post("/api/client/community/challenges/participate", challengeData),
      "Failed to participate in community challenges",
      "PARTICIPATE_IN_COMMUNITY_CHALLENGES_SUCCESS" as keyof TMessages,
      "PARTICIPATE_IN_COMMUNITY_CHALLENGES_ERROR" as keyof TMessages
    );
  }

  async listClientRewards(): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get("/api/client/rewards"),
      "Failed to list rewards",
      "LIST_REWARDS_SUCCESS" as keyof TMessages,
      "LIST_REWARDS_ERROR" as keyof TMessages
    );
  }

  async listFiles(dir: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get(`/api/files/${dir}`),
      "Failed to list files",
      "LIST_FILES_SUCCESS" as keyof TMessages,
      "LIST_FILES_ERROR" as keyof TMessages
    );
  }

  async getFileContent(filePath: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get(`/api/files/${filePath}`),
      "Failed to get file content",
      "GET_FILE_CONTENT_SUCCESS" as keyof TMessages,
      "GET_FILE_CONTENT_ERROR" as keyof TMessages
    );
  }

  async updateCalendarEvent<
    T extends BaseDataEntity = BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T,
  >(eventId: number, updatedEvent: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.put(`/api/calendar/events/${eventId}`, updatedEvent),
      "Failed to update calendar event",
      "UPDATE_CALENDAR_EVENT_SUCCESS" as keyof TMessages,
      "UPDATE_CALENDAR_EVENT_ERROR" as keyof TMessages,
      { eventId }
    );
  }

  async startCollaborativeEdit(fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`/api/files/${fileId}/collaborative-edit`),
      "Failed to start collaborative edit",
      "START_COLLABORATIVE_EDIT_SUCCESS" as keyof TMessages,
      "START_COLLABORATIVE_EDIT_ERROR" as keyof TMessages
    );
  }

  async createFileVersion<
    T extends BaseDataEntity,
    K extends T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends DefaultExcludedFields<T> = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    fileId: string,
    versionData: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`/api/files/${fileId}/versions`, versionData),
      "Failed to create file version",
      "CREATE_FILE_VERSION_SUCCESS" as keyof TMessages,
      "CREATE_FILE_VERSION_ERROR" as keyof TMessages,
      { fileId }
    );
  }

  async receiveFileUpdate(
    fileId: string,
    updateData: any
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`/api/files/${fileId}/updates`, updateData),
      "Failed to receive file update",
      "RECEIVE_FILE_UPDATE_SUCCESS" as keyof TMessages,
      "RECEIVE_FILE_UPDATE_ERROR" as keyof TMessages,
      { fileId }
    );
  }

  async fetchFileVersions(fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get(`/api/files/${fileId}/versions`),
      "Failed to fetch file versions",
      "FETCH_FILE_VERSIONS_SUCCESS" as keyof TMessages,
      "FETCH_FILE_VERSIONS_ERROR" as keyof TMessages,
      { fileId }
    );
  }

  async shareFile(fileId: string, shareData: any): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`/api/files/${fileId}/share`, shareData),
      "Failed to share file",
      "SHARE_FILE_SUCCESS" as keyof TMessages,
      "SHARE_FILE_ERROR" as keyof TMessages,
      { fileId, shareData }
    );
  }

  async requestAccessToFile(
    fileId: string,
    accessData: any
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`/api/files/${fileId}/access`, accessData),
      "Failed to request access to file",
      "REQUEST_ACCESS_TO_FILE_SUCCESS" as keyof TMessages,
      "REQUEST_ACCESS_TO_FILE_ERROR" as keyof TMessages,
      { fileId, accessData }
    );
  }

  async exportFile(fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get(`/api/files/${fileId}/export`),
      "Failed to export file",
      "EXPORT_FILE_SUCCESS" as keyof TMessages,
      "EXPORT_FILE_ERROR" as keyof TMessages,
      { fileId }
    );
  }

  async archiveFile(fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.delete(`/api/files/${fileId}`),
      "Failed to archive file",
      "ARCHIVE_FILE_SUCCESS" as keyof TMessages,
      "ARCHIVE_FILE_ERROR" as keyof TMessages,
      { fileId }
    );
  }

  async determineFileType(fileId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.get(`/api/files/${fileId}/type`),
      "Failed to determine file type",
      "DETERMINE_FILE_TYPE_SUCCESS" as keyof TMessages,
      "DETERMINE_FILE_TYPE_ERROR" as keyof TMessages,
      { fileId }
    );
  }

  async importFile(fileData: typeof FileImportData): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => axiosInstance.post(`/api/files/import`, fileData),
      "Failed to import file",
      "IMPORT_FILE_SUCCESS" as keyof TMessages,
      "IMPORT_FILE_ERROR" as keyof TMessages,
      { fileData }
    );
  }

  // Additional client API methods can be added here...
}


const internalApiService = new ClientApiService(useNotification, clientNotificationMessages);

export default internalApiService;
export { clientNotificationMessages };
export type { ClientNotificationMessages };

