import { NotificationService } from '@/app/state/stores/NotificationService';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import { NotificationContainer } from '@/app/services/NotificationService'
import ApiConfig from '@/app/api/ApiConfig';
import handleApiError from '@/app/api/SnapshotApi';
import handleSnapshotApiError from '@/app/api/SnapshotApi';
import internalApiService from '@/app/api/ApiClient';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { NotificationTypeEnum } from "@/state/context/NotificationContext";
import { AxiosResponse } from 'axios';
import { NotificationManagerService } from "@/app/state/notifications/NotificationManagerService";

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
  private notify: NotificationContainer['notify'];

  constructor(
    config: Partial<ApiConfig> = {},
    notifyFn?: NotificationContainer<
      T,
      K,
      Meta,
      AttachmentType,
      ExcludedFields,
      IncludedFields
    >["notify"]
  ) {
    // Provide default values that satisfy ApiConfig
    this.config = {
      name: "DefaultApi",
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
      retry: { attempts: 3, delay: 1000 },
      cache: {
        enabled: false,
        maxAge: 0,
        staleWhileRevalidate: 0,
        cacheKey: "",
        strategy: "memory",
        ttl: 0,
        versioning: { enabled: false, key: 'api-versioning' },
      },
      responseType: { contentType: "application/json", encoding: "utf-8" },
      withCredentials: false,
      ...config,
    }

    this.notify = notifyFn ?? NotificationManagerService.notify;
    
  }


  // === SNAPSHOT API OPERATIONS ===

  async saveSnapshotToDatabase<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    snapshotData: SnapshotData<
      T,
      K,
      Meta,
      AttachmentType,
      ExcludedFields,
      IncludedFields
    >
  ): Promise<boolean> {
    try {
      const saveSnapshotEndpoint = `${this.config.baseURL}/save`;

      // Build headers from instance helper
      const token =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const userId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      const appVersion = "1.0.0";

      const headers = (this.createHeaders
        ? this.createHeaders(token, userId, appVersion)
        : this.config.headers) as Record<string, string>;

      // Send snapshot
      await internalApiService.post(saveSnapshotEndpoint, snapshotData, {
        headers,
        timeout: this.config.timeout,
      });

      // ✅ Notify on success
      this.notify?.(
        "SaveSnapshotSuccessId",
        "Snapshot saved successfully",
        snapshotData,
        new Date(),
        NotificationTypeEnum.SUCCESS
      );

      return true;
    } catch (error: any) {
      console.error("Error saving snapshot to database:", error);

      // ✅ Notify on failure (via injected notify function)
      this.notify?.(
        "SaveSnapshotErrorId",
        "Failed to save snapshot to database",
        error,
        new Date(),
        NotificationTypeEnum.ERROR
      );

      // ✅ Also use the global NotificationService (fallback)
      NotificationService.notify({
        id: "SaveSnapshotError",
        message: "Failed to save snapshot to database",
        timestamp: new Date(),
        type: NotificationTypeEnum.ERROR,
        data: { error: String(error) },
      });

      return false;
    }
  }

  
async fetchSnapshotById(
  snapshotId: string
): Promise<
  SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined
> {
  try {
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId");
    const appVersion = "1.0.0";

    const headers = this.createHeaders(token, userId, appVersion);

    const response = await internalApiService.get<
      SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    >(`/snapshots/${snapshotId}`, {
      headers: headers as Record<string, string>,
      timeout: this.config.timeout,
    });

    if (response.status === 200) {
      // ✅ Clarify type to avoid “thenable” confusion
      return Promise.resolve(response.data);
    } else {
      throw new Error("Failed to fetch snapshot by ID");
    }
  } catch (error) {
    handleApiError(error as AxiosError<unknown>, "Failed to fetch snapshot by ID");
    return undefined;
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

    const response = await internalApiService.post(`${this.config.baseURL}/snapshots`, snapshotData, {
      headers: headersConfig,
      timeout: this.config.timeout,
    });

    // ✅ Ensure correct return type
    return Promise.resolve(response.data);
  } catch (error) {
    handleApiError(error as AxiosError<unknown>, "Failed to take snapshot");
    throw error;
  }
}

async batchSaveSnapshots(snapshots: any[]): Promise<boolean> {
  try {
    const response = await internalApiService.post(
      `${this.config.baseURL}/snapshots/batch`,
      { snapshots },
      {
        headers: headersConfig,
        timeout: this.config.timeout,
      }
    );

    // ✅ return boolean safely
    return response.status === 200;
  } catch (error) {
    handleApiError(error as AxiosError<unknown>, "Failed to batch save snapshots");
    return false;
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

      const response = await internalApiService.post(`${this.config.baseURL}/snapshots`, snapshotData, {
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
      const response = await internalApiService.post(`${this.config.baseURL}/snapshots/batch`, {
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
      const response: AxiosResponse<any> = await internalApiService.post(
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
      const response: AxiosResponse<void> = await internalApiService.post(
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