import { handleApiError, handleSnapshotApiError } from '@/app/api/SnapshotApi'
import axiosInstance from '@/app/api/csrfToken';
import { headersConfig } from '@/app/components/shared/SharedHeaders';
import { useNotification } from '@/app/context/NotificationContext';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { ApiConfig } from '@/app/api/ApiConfig';
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { NotificationTypeEnum } from "@/context/NotificationContext";
import { AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';


export class ApiCommunicationService<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  private config: ApiConfig;

  constructor(config: ApiConfig = {}) {
    this.config = {
      baseURL: API_BASE_URL,
      timeout: 10000,
      retryAttempts: 3,
      enableCaching: false,
      ...config,
    };
  }

  // === SNAPSHOT API OPERATIONS ===

  async saveSnapshotToDatabase(snapshotData: any): Promise<boolean> {
    try {
      const saveSnapshotEndpoint = `${this.config.baseURL}/save`;
      await axiosInstance.post(saveSnapshotEndpoint, snapshotData, {
        headers: headersConfig,
        timeout: this.config.timeout,
      });

      useNotification().notify(
        "SaveSnapshotSuccessId",
        "Snapshot saved successfully",
        null,
        new Date(),
        NotificationTypeEnum.SUCCESS
      );

      return true;
    } catch (error: any) {
      console.error("Error saving snapshot to database:", error);
      handleSnapshotApiError(error, "Failed to save snapshot to database");
      return false;
    }
  }

  async fetchSnapshotById(
    snapshotId: string
  ): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const appVersion = "1.0.0"; // You might want to make this configurable

      const headers = this.createHeaders(token, userId, appVersion);
      
      const response = await axiosInstance.get(`/snapshots/${snapshotId}`, {
        headers: headers as Record<string, string>,
        timeout: this.config.timeout,
      });

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to fetch snapshot by ID");
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch snapshot by ID");
      throw error;
    }
  }

  async takeSnapshot(
    content: any,
    date: Date,
    projectType: any,
    projectId: string,
    projectState: any,
    projectPriority: any,
    projectMembers: any[]
  ): Promise<any> {
    try {
      const snapshotData = {
        content,
        date,
        projectType,
        projectId,
        projectState,
        projectPriority,
        projectMembers,
      };

      const response = await axiosInstance.post(`${this.config.baseURL}/snapshots`, snapshotData, {
        headers: headersConfig,
        timeout: this.config.timeout,
      });

      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to take snapshot");
      throw error;
    }
  }

  async batchSaveSnapshots(snapshots: any[]): Promise<boolean> {
    try {
      const response = await axiosInstance.post(`${this.config.baseURL}/snapshots/batch`, {
        snapshots,
      }, {
        headers: headersConfig,
        timeout: this.config.timeout,
      });

      return response.status === 200;
    } catch (error) {
      handleApiError(error, "Failed to batch save snapshots");
      return false;
    }
  }

  // === DATASET OPERATIONS ===

  async uploadDataset(formData: FormData): Promise<any> {
    try {
      const response: AxiosResponse<any> = await axiosInstance.post(
        `${this.config.baseURL}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: this.config.timeout,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading dataset:", error);
      return null;
    }
  }

  async runHypothesisTest(datasetId: number, testType: string): Promise<void> {
    try {
      const response: AxiosResponse<void> = await axiosInstance.post(
        `${this.config.baseURL}/hypothesis-test`,
        { datasetId, testType },
        {
          headers: headersConfig,
          timeout: this.config.timeout,
        }
      );
      console.log("Hypothesis test executed successfully:", response.data);
    } catch (error) {
      console.error("Error running hypothesis test:", error);
    }
  }

  // === UTILITY METHODS ===

  private createHeaders(token: string | null, userId: string | null, appVersion: string): Record<string, string> {
    const headersArray = [
      this.createAuthenticationHeaders(token, userId, appVersion),
      this.createCacheHeaders(),
      this.createContentHeaders(),
      this.generateCustomHeaders({}),
      this.createRequestHeaders(token || ""),
    ];

    return Object.assign({}, ...headersArray);
  }

  private createAuthenticationHeaders(token: string | null, userId: string | null, appVersion: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'X-User-Id': userId || '',
      'X-App-Version': appVersion,
    };
  }

  private createCacheHeaders() {
    return this.config.enableCaching ? {
      'Cache-Control': 'public, max-age=300',
    } : {};
  }

  private createContentHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  private generateCustomHeaders(customHeaders: Record<string, string>) {
    return customHeaders;
  }

  private createRequestHeaders(token: string) {
    return {
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-Token': token,
    };
  }

  // === RETRY LOGIC ===

  private async withRetry<T>(operation: () => Promise<T>, attempt = 1): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt < (this.config.retryAttempts || 3)) {
        console.log(`Retrying operation, attempt ${attempt + 1}`);
        await this.delay(1000 * attempt); // Exponential backoff
        return this.withRetry(operation, attempt + 1);
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Hook for using the API service
export const useApiCommunication = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(config?: ApiConfig) => {
  const apiService = new ApiCommunicationService<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(config);

  return {
    // Snapshot operations
    saveSnapshotToDatabase: (snapshotData: any) => apiService.saveSnapshotToDatabase(snapshotData),
    fetchSnapshotById: (snapshotId: string) => apiService.fetchSnapshotById(snapshotId),
    takeSnapshot: (content: any, date: Date, projectType: any, projectId: string, projectState: any, projectPriority: any, projectMembers: any[]) => 
      apiService.takeSnapshot(content, date, projectType, projectId, projectState, projectPriority, projectMembers),
    batchSaveSnapshots: (snapshots: any[]) => apiService.batchSaveSnapshots(snapshots),

    // Dataset operations
    uploadDataset: (formData: FormData) => apiService.uploadDataset(formData),
    runHypothesisTest: (datasetId: number, testType: string) => apiService.runHypothesisTest(datasetId, testType),

    // Direct service access
    apiService,
  };
};

export type ApiCommunicationHook = ReturnType<typeof useApiCommunication>;