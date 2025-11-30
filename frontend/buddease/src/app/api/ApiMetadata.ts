// ApiMetadata.ts
// External API calls for metadata operations

import internalApiService from "@/app/api/ApiClient";
import { handleApiError } from '@/app/api/ApiLogs';
import { endpoints } from "@/app/api/endpointConfigurations";
import HeadersConfig from "@/app/api/headers/HeadersConfig";
import { headersConfig } from '@/app/components/shared/SharedHeaders';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { UnifiedMetadata, UnifiedMetaDataOptions } from "@/app/config/MetaDataOptions";
import { Attachment } from '@/app/documents/attachment/Attachment';
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { NotificationType } from '@/app/features/support/UnifiedNotificationTypes';
import { useNotification } from '@/app/state/context/NotificationContext';
import { VersionData } from '@/app/versions/VersionData';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const API_BASE_URL = endpoints.metadata;

// Define a function to create headers using the provided configuration
export const createMetadataHeaders = (): typeof HeadersConfig => {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "Bearer " + localStorage.getItem("accessToken"),
    "X-Metadata-Version": "1.0",
    // Add more metadata-specific headers as needed
  };
};

// Metadata Notification Messages
interface MetadataNotificationMessages {
  [key: string]: string;
  
  // Core metadata operations
  CREATE_METADATA_SUCCESS: string;
  CREATE_METADATA_ERROR: string;
  GET_METADATA_SUCCESS: string;
  GET_METADATA_ERROR: string;
  UPDATE_METADATA_SUCCESS: string;
  UPDATE_METADATA_ERROR: string;
  DELETE_METADATA_SUCCESS: string;
  DELETE_METADATA_ERROR: string;
  
  // Batch operations
  BATCH_CREATE_METADATA_SUCCESS: string;
  BATCH_CREATE_METADATA_ERROR: string;
  BATCH_UPDATE_METADATA_SUCCESS: string;
  BATCH_UPDATE_METADATA_ERROR: string;
  BATCH_DELETE_METADATA_SUCCESS: string;
  BATCH_DELETE_METADATA_ERROR: string;
  
  // Search and query operations
  SEARCH_METADATA_SUCCESS: string;
  SEARCH_METADATA_ERROR: string;
  QUERY_METADATA_SUCCESS: string;
  QUERY_METADATA_ERROR: string;
  
  // Version operations
  CREATE_METADATA_VERSION_SUCCESS: string;
  CREATE_METADATA_VERSION_ERROR: string;
  GET_METADATA_VERSIONS_SUCCESS: string;
  GET_METADATA_VERSIONS_ERROR: string;
  ROLLBACK_METADATA_SUCCESS: string;
  ROLLBACK_METADATA_ERROR: string;
  
  // Validation operations
  VALIDATE_METADATA_SUCCESS: string;
  VALIDATE_METADATA_ERROR: string;
  
  // Import/Export operations
  IMPORT_METADATA_SUCCESS: string;
  IMPORT_METADATA_ERROR: string;
  EXPORT_METADATA_SUCCESS: string;
  EXPORT_METADATA_ERROR: string;
  
  // Generic messages
  GENERIC_METADATA_ERROR: string;
}

// Helper function to get message with fallback
const getMetadataNotificationMessage = (key: keyof MetadataNotificationMessages): string => {
  const message = NOTIFICATION_MESSAGES.Metadata?.[key as keyof typeof NOTIFICATION_MESSAGES.Metadata];
  if (message) return message;
  
  // Fallback messages for any missing ones
  const fallbackMessages: Partial<MetadataNotificationMessages> = {
    // Core metadata operations
    CREATE_METADATA_SUCCESS: "Metadata created successfully",
    CREATE_METADATA_ERROR: "Failed to create metadata",
    GET_METADATA_SUCCESS: "Metadata retrieved successfully",
    GET_METADATA_ERROR: "Failed to retrieve metadata",
    UPDATE_METADATA_SUCCESS: "Metadata updated successfully",
    UPDATE_METADATA_ERROR: "Failed to update metadata",
    DELETE_METADATA_SUCCESS: "Metadata deleted successfully",
    DELETE_METADATA_ERROR: "Failed to delete metadata",
    
    // Batch operations
    BATCH_CREATE_METADATA_SUCCESS: "Batch metadata created successfully",
    BATCH_CREATE_METADATA_ERROR: "Failed to create batch metadata",
    BATCH_UPDATE_METADATA_SUCCESS: "Batch metadata updated successfully",
    BATCH_UPDATE_METADATA_ERROR: "Failed to update batch metadata",
    BATCH_DELETE_METADATA_SUCCESS: "Batch metadata deleted successfully",
    BATCH_DELETE_METADATA_ERROR: "Failed to delete batch metadata",
    
    // Search and query operations
    SEARCH_METADATA_SUCCESS: "Metadata search completed successfully",
    SEARCH_METADATA_ERROR: "Failed to search metadata",
    QUERY_METADATA_SUCCESS: "Metadata query completed successfully",
    QUERY_METADATA_ERROR: "Failed to query metadata",
    
    // Version operations
    CREATE_METADATA_VERSION_SUCCESS: "Metadata version created successfully",
    CREATE_METADATA_VERSION_ERROR: "Failed to create metadata version",
    GET_METADATA_VERSIONS_SUCCESS: "Metadata versions retrieved successfully",
    GET_METADATA_VERSIONS_ERROR: "Failed to retrieve metadata versions",
    ROLLBACK_METADATA_SUCCESS: "Metadata rollback completed successfully",
    ROLLBACK_METADATA_ERROR: "Failed to rollback metadata",
    
    // Validation operations
    VALIDATE_METADATA_SUCCESS: "Metadata validated successfully",
    VALIDATE_METADATA_ERROR: "Failed to validate metadata",
    
    // Import/Export operations
    IMPORT_METADATA_SUCCESS: "Metadata imported successfully",
    IMPORT_METADATA_ERROR: "Failed to import metadata",
    EXPORT_METADATA_SUCCESS: "Metadata exported successfully",
    EXPORT_METADATA_ERROR: "Failed to export metadata",
    
    // Generic messages
    GENERIC_METADATA_ERROR: "Metadata operation failed",
  };
  
  return fallbackMessages[key] || `${key} message not configured`;
};

const metadataNotificationMessages: MetadataNotificationMessages = {
  // Core metadata operations
  CREATE_METADATA_SUCCESS: getMetadataNotificationMessage('CREATE_METADATA_SUCCESS'),
  CREATE_METADATA_ERROR: getMetadataNotificationMessage('CREATE_METADATA_ERROR'),
  GET_METADATA_SUCCESS: getMetadataNotificationMessage('GET_METADATA_SUCCESS'),
  GET_METADATA_ERROR: getMetadataNotificationMessage('GET_METADATA_ERROR'),
  UPDATE_METADATA_SUCCESS: getMetadataNotificationMessage('UPDATE_METADATA_SUCCESS'),
  UPDATE_METADATA_ERROR: getMetadataNotificationMessage('UPDATE_METADATA_ERROR'),
  DELETE_METADATA_SUCCESS: getMetadataNotificationMessage('DELETE_METADATA_SUCCESS'),
  DELETE_METADATA_ERROR: getMetadataNotificationMessage('DELETE_METADATA_ERROR'),
  
  // Batch operations
  BATCH_CREATE_METADATA_SUCCESS: getMetadataNotificationMessage('BATCH_CREATE_METADATA_SUCCESS'),
  BATCH_CREATE_METADATA_ERROR: getMetadataNotificationMessage('BATCH_CREATE_METADATA_ERROR'),
  BATCH_UPDATE_METADATA_SUCCESS: getMetadataNotificationMessage('BATCH_UPDATE_METADATA_SUCCESS'),
  BATCH_UPDATE_METADATA_ERROR: getMetadataNotificationMessage('BATCH_UPDATE_METADATA_ERROR'),
  BATCH_DELETE_METADATA_SUCCESS: getMetadataNotificationMessage('BATCH_DELETE_METADATA_SUCCESS'),
  BATCH_DELETE_METADATA_ERROR: getMetadataNotificationMessage('BATCH_DELETE_METADATA_ERROR'),
  
  // Search and query operations
  SEARCH_METADATA_SUCCESS: getMetadataNotificationMessage('SEARCH_METADATA_SUCCESS'),
  SEARCH_METADATA_ERROR: getMetadataNotificationMessage('SEARCH_METADATA_ERROR'),
  QUERY_METADATA_SUCCESS: getMetadataNotificationMessage('QUERY_METADATA_SUCCESS'),
  QUERY_METADATA_ERROR: getMetadataNotificationMessage('QUERY_METADATA_ERROR'),
  
  // Version operations
  CREATE_METADATA_VERSION_SUCCESS: getMetadataNotificationMessage('CREATE_METADATA_VERSION_SUCCESS'),
  CREATE_METADATA_VERSION_ERROR: getMetadataNotificationMessage('CREATE_METADATA_VERSION_ERROR'),
  GET_METADATA_VERSIONS_SUCCESS: getMetadataNotificationMessage('GET_METADATA_VERSIONS_SUCCESS'),
  GET_METADATA_VERSIONS_ERROR: getMetadataNotificationMessage('GET_METADATA_VERSIONS_ERROR'),
  ROLLBACK_METADATA_SUCCESS: getMetadataNotificationMessage('ROLLBACK_METADATA_SUCCESS'),
  ROLLBACK_METADATA_ERROR: getMetadataNotificationMessage('ROLLBACK_METADATA_ERROR'),
  
  // Validation operations
  VALIDATE_METADATA_SUCCESS: getMetadataNotificationMessage('VALIDATE_METADATA_SUCCESS'),
  VALIDATE_METADATA_ERROR: getMetadataNotificationMessage('VALIDATE_METADATA_ERROR'),
  
  // Import/Export operations
  IMPORT_METADATA_SUCCESS: getMetadataNotificationMessage('IMPORT_METADATA_SUCCESS'),
  IMPORT_METADATA_ERROR: getMetadataNotificationMessage('IMPORT_METADATA_ERROR'),
  EXPORT_METADATA_SUCCESS: getMetadataNotificationMessage('EXPORT_METADATA_SUCCESS'),
  EXPORT_METADATA_ERROR: getMetadataNotificationMessage('EXPORT_METADATA_ERROR'),
  
  // Generic messages
  GENERIC_METADATA_ERROR: getMetadataNotificationMessage('GENERIC_METADATA_ERROR'),
};

class MetadataApiService<TMessages extends Record<string, string>> {
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
    ) => void,
    private notificationMessages: TMessages
  ) {
    this.notify = notify;
  }

  private async requestHandler(
    request: () => Promise<AxiosResponse>,
    errorMessage: string,
    successMessageId: keyof TMessages,
    errorMessageId: keyof TMessages,
    notificationData: any = null
  ): Promise<AxiosResponse> {
    try {
      const response: AxiosResponse = await request();
      
      if (successMessageId) {
        const successMessage = this.notificationMessages[successMessageId];
        this.notify(String(successMessageId), successMessage, notificationData, new Date(), "success");
      }
      
      return response;
    } catch (error: any) {
      handleApiError(error as AxiosError<unknown>, errorMessage);

      if (errorMessageId) {
        const errorMessageText = this.notificationMessages[errorMessageId];
        this.notify(String(errorMessageId), errorMessageText, notificationData, new Date(), "error");
      }
      throw error;
    }
  }

  // Generic HTTP methods
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
    successMessageId?: keyof TMessages,
    errorMessageId?: keyof TMessages
  ): Promise<AxiosResponse<T>> {
    return this.requestHandler(
      () => internalApiService.get<T>(url, config),
      "GET metadata request failed",
      successMessageId || "GENERIC_METADATA_ERROR" as keyof TMessages,
      errorMessageId || "GENERIC_METADATA_ERROR" as keyof TMessages
    );
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    successMessageId?: keyof TMessages,
    errorMessageId?: keyof TMessages
  ): Promise<AxiosResponse<T>> {
    return this.requestHandler(
      () => internalApiService.post<T>(url, data, config),
      "POST metadata request failed",
      successMessageId || "GENERIC_METADATA_ERROR" as keyof TMessages,
      errorMessageId || "GENERIC_METADATA_ERROR" as keyof TMessages
    );
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    successMessageId?: keyof TMessages,
    errorMessageId?: keyof TMessages
  ): Promise<AxiosResponse<T>> {
    return this.requestHandler(
      () => internalApiService.put<T>(url, data, config),
      "PUT metadata request failed",
      successMessageId || "GENERIC_METADATA_ERROR" as keyof TMessages,
      errorMessageId || "GENERIC_METADATA_ERROR" as keyof TMessages
    );
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
    successMessageId?: keyof TMessages,
    errorMessageId?: keyof TMessages
  ): Promise<AxiosResponse<T>> {
    return this.requestHandler(
      () => internalApiService.delete<T>(url, config),
      "DELETE metadata request failed",
      successMessageId || "GENERIC_METADATA_ERROR" as keyof TMessages,
      errorMessageId || "GENERIC_METADATA_ERROR" as keyof TMessages
    );
  }

  // Core Metadata Operations
  async createMetadata<
    T extends BaseDataEntity,
    K extends T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends DefaultExcludedFields<T> = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<AxiosResponse<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    return await this.requestHandler(
      () => internalApiService.post(
        `${API_BASE_URL}/metadata`,
        metadata,
        { headers: headersConfig }
      ),
      "Failed to create metadata",
      "CREATE_METADATA_SUCCESS" as keyof TMessages,
      "CREATE_METADATA_ERROR" as keyof TMessages,
      { metadataId: metadata.id }
    );
  }

  async getMetadata<
    T extends BaseDataEntity,
    K extends T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends DefaultExcludedFields<T> = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    metadataId: string
  ): Promise<AxiosResponse<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    return await this.requestHandler(
      () => internalApiService.get(
        `${API_BASE_URL}/metadata/${metadataId}`,
        { headers: headersConfig }
      ),
      "Failed to get metadata",
      "GET_METADATA_SUCCESS" as keyof TMessages,
      "GET_METADATA_ERROR" as keyof TMessages,
      { metadataId }
    );
  }

  async updateMetadata<
    T extends BaseDataEntity,
    K extends T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends DefaultExcludedFields<T> = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    metadataId: string,
    updates: Partial<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): Promise<AxiosResponse<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>> {
    return await this.requestHandler(
      () => internalApiService.put(
        `${API_BASE_URL}/metadata/${metadataId}`,
        updates,
        { headers: headersConfig }
      ),
      "Failed to update metadata",
      "UPDATE_METADATA_SUCCESS" as keyof TMessages,
      "UPDATE_METADATA_ERROR" as keyof TMessages,
      { metadataId }
    );
  }

  async deleteMetadata(metadataId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => internalApiService.delete(
        `${API_BASE_URL}/metadata/${metadataId}`,
        { headers: headersConfig }
      ),
      "Failed to delete metadata",
      "DELETE_METADATA_SUCCESS" as keyof TMessages,
      "DELETE_METADATA_ERROR" as keyof TMessages,
      { metadataId }
    );
  }

  // Batch Operations
  async batchCreateMetadata<
    T extends BaseDataEntity,
    K extends T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends DefaultExcludedFields<T> = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    metadataArray: UnifiedMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): Promise<AxiosResponse<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>> {
    return await this.requestHandler(
      () => internalApiService.post(
        `${API_BASE_URL}/metadata/batch`,
        metadataArray,
        { headers: headersConfig }
      ),
      "Failed to create batch metadata",
      "BATCH_CREATE_METADATA_SUCCESS" as keyof TMessages,
      "BATCH_CREATE_METADATA_ERROR" as keyof TMessages,
      { count: metadataArray.length }
    );
  }

  async batchUpdateMetadata<
    T extends BaseDataEntity,
    K extends T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends DefaultExcludedFields<T> = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    updates: Array<{
      id: string;
      updates: Partial<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
    }>
  ): Promise<AxiosResponse<UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>> {
    return await this.requestHandler(
      () => internalApiService.put(
        `${API_BASE_URL}/metadata/batch`,
        updates,
        { headers: headersConfig }
      ),
      "Failed to update batch metadata",
      "BATCH_UPDATE_METADATA_SUCCESS" as keyof TMessages,
      "BATCH_UPDATE_METADATA_ERROR" as keyof TMessages,
      { count: updates.length }
    );
  }

  async batchDeleteMetadata(metadataIds: string[]): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => internalApiService.delete(
        `${API_BASE_URL}/metadata/batch`,
        { 
          data: { ids: metadataIds },
          headers: headersConfig 
        }
      ),
      "Failed to delete batch metadata",
      "BATCH_DELETE_METADATA_SUCCESS" as keyof TMessages,
      "BATCH_DELETE_METADATA_ERROR" as keyof TMessages,
      { count: metadataIds.length }
    );
  }

  // Search and Query Operations
  async searchMetadata(
    query: string,
    filters?: Record<string, any>
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => internalApiService.post(
        `${API_BASE_URL}/metadata/search`,
        { query, filters },
        { headers: headersConfig }
      ),
      "Failed to search metadata",
      "SEARCH_METADATA_SUCCESS" as keyof TMessages,
      "SEARCH_METADATA_ERROR" as keyof TMessages,
      { query }
    );
  }

  async queryMetadata(
    criteria: Record<string, any>
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => internalApiService.post(
        `${API_BASE_URL}/metadata/query`,
        criteria,
        { headers: headersConfig }
      ),
      "Failed to query metadata",
      "QUERY_METADATA_SUCCESS" as keyof TMessages,
      "QUERY_METADATA_ERROR" as keyof TMessages,
      { criteria }
    );
  }

  // Version Operations
  async createMetadataVersion<
    T extends BaseDataEntity,
    K extends T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends DefaultExcludedFields<T> = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    metadataId: string,
    versionData: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => internalApiService.post(
        `${API_BASE_URL}/metadata/${metadataId}/versions`,
        versionData,
        { headers: headersConfig }
      ),
      "Failed to create metadata version",
      "CREATE_METADATA_VERSION_SUCCESS" as keyof TMessages,
      "CREATE_METADATA_VERSION_ERROR" as keyof TMessages,
      { metadataId }
    );
  }

  async getMetadataVersions(metadataId: string): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => internalApiService.get(
        `${API_BASE_URL}/metadata/${metadataId}/versions`,
        { headers: headersConfig }
      ),
      "Failed to get metadata versions",
      "GET_METADATA_VERSIONS_SUCCESS" as keyof TMessages,
      "GET_METADATA_VERSIONS_ERROR" as keyof TMessages,
      { metadataId }
    );
  }

  async rollbackMetadata(
    metadataId: string,
    versionNumber: string
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => internalApiService.post(
        `${API_BASE_URL}/metadata/${metadataId}/rollback`,
        { version: versionNumber },
        { headers: headersConfig }
      ),
      "Failed to rollback metadata",
      "ROLLBACK_METADATA_SUCCESS" as keyof TMessages,
      "ROLLBACK_METADATA_ERROR" as keyof TMessages,
      { metadataId, versionNumber }
    );
  }

  // Validation Operations
  async validateMetadata<
    T extends BaseDataEntity,
    K extends T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends DefaultExcludedFields<T> = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => internalApiService.post(
        `${API_BASE_URL}/metadata/validate`,
        metadata,
        { headers: headersConfig }
      ),
      "Failed to validate metadata",
      "VALIDATE_METADATA_SUCCESS" as keyof TMessages,
      "VALIDATE_METADATA_ERROR" as keyof TMessages,
      { metadataId: metadata.id }
    );
  }

  // Import/Export Operations
  async importMetadata(importData: any): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => internalApiService.post(
        `${API_BASE_URL}/metadata/import`,
        importData,
        { headers: headersConfig }
      ),
      "Failed to import metadata",
      "IMPORT_METADATA_SUCCESS" as keyof TMessages,
      "IMPORT_METADATA_ERROR" as keyof TMessages,
      { importType: importData.type }
    );
  }

  async exportMetadata(
    criteria?: Record<string, any>
  ): Promise<AxiosResponse> {
    return await this.requestHandler(
      () => internalApiService.post(
        `${API_BASE_URL}/metadata/export`,
        criteria,
        { headers: headersConfig }
      ),
      "Failed to export metadata",
      "EXPORT_METADATA_SUCCESS" as keyof TMessages,
      "EXPORT_METADATA_ERROR" as keyof TMessages,
      { criteria }
    );
  }
}

// Create the internal API service instance
const internalMetadataApiService = new MetadataApiService(useNotification, metadataNotificationMessages);

export default internalMetadataApiService;
export { metadataNotificationMessages };
export type { MetadataNotificationMessages };

