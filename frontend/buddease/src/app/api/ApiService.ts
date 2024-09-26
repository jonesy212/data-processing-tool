import { handleApiError } from "@/app/api/ApiLogs";
import { calendarEvent } from '@/app/components/state/stores/CalendarEvent';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { useBrainstormingPhase, useMeetingsPhase, useProjectManagementPhase, useTeamBuildingPhase } from "../components/hooks/phaseHooks/CollaborationPhaseHooks";
import { authenticationPhaseHook, dataAnalysisPhaseHook, generalCommunicationFeaturesPhaseHook, ideationPhaseHook, jobSearchPhaseHook, productBrainstormingPhaseHook, productLaunchPhaseHook, recruiterDashboardPhaseHook, teamCreationPhaseHook } from "../components/hooks/phaseHooks/PhaseHooks";
import useErrorHandling from "../components/hooks/useErrorHandling";
import { darkModeTogglePhaseHook, notificationBarPhaseHook } from "../components/hooks/userInterface/UIPhaseHooks";
import { SupportedData } from "../components/models/CommonData";
import { headersConfig } from "../components/shared/SharedHeaders";
import { useNotification } from '../components/support/NotificationContext';
import { versionHistory } from "../components/versions/VersionData";
import VersionGenerator from "../components/versions/VersionGenerator";
import { backendConfig } from "../configs/BackendConfig";
import { dataVersions } from '../configs/DataVersionsConfig';
import { determineFileType } from '../configs/DetermineFileType';
import { frontendConfig } from "../configs/FrontendConfig";
import userSettings from "../configs/UserSettings";
import { backendStructure } from "../configs/appStructure/BackendStructure";
import { frontendStructure } from "../configs/appStructure/FrontendStructure";
import { CacheData, realtimeData } from "../generators/GenerateCache";
import { handleApiErrorAndNotify } from "./ApiData";
import { endpoints } from "./ApiEndpoints";
import axiosInstance from "./axiosInstance";
import FileData from "../components/models/data/FileData";

// Define the API base URL
const API_BASE_URL = endpoints.data; // Assuming 'endpoints' has a property 'data' for the base URL
const { notify } = useNotification();

// Define the structure of the response data
interface CacheResponse {
  id?: string | number | undefined;
  data: SupportedData;
}

// Function to read cache data
export const readCache = async (filePath: string): Promise<SupportedData | undefined> => {
  try {
    // Fetch cache data using the file path
    const cacheResponse: CacheResponse | undefined = await fetchCacheData(filePath);

    if (cacheResponse) {
      // Example: Extract relevant data from cacheResponse
      const data: SupportedData = cacheResponse.data;
      return data;
    }
  } catch (error) {
    console.error("Error reading cache:", error);
    throw error;
  }
};

// Usage example:
const filePath = './path/to/cache/data'; // Replace with actual file path
readCache(filePath)
  .then((data) => {
    console.log("Cache data:", data);
  })
  .catch((error) => {
    console.error("Failed to read cache:", error);
  });

// Function to fetch cache data (mock implementation)
const fetchCacheData = async (filePath: string): Promise<CacheResponse> => {
  // Initialize the useErrorHandling hook
  const { handleError } = useErrorHandling();

  try {
    // Simulate fetching data from a server by delaying execution for a certain period (e.g., 1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const fileType = determineFileType(filePath); // Assuming determineFileType takes filePath

    // Mock cache data object using the CacheResponse interface
    const mockCacheData: CacheData = {
      _id: "", // Example data for CacheData
      id: "",
      lastUpdated: versionHistory,
      userSettings: userSettings,
      dataVersions: dataVersions ?? [],
      frontendStructure: frontendStructure,
      backendStructure: backendStructure,
      backendConfig: backendConfig,
      frontendConfig: frontendConfig,
      realtimeData: realtimeData,
      notificationBarPhaseHook: notificationBarPhaseHook,
      darkModeTogglePhaseHook: darkModeTogglePhaseHook,
      authenticationPhaseHook: authenticationPhaseHook,
      jobSearchPhaseHook: jobSearchPhaseHook,
      recruiterDashboardPhaseHook: recruiterDashboardPhaseHook,
      teamBuildingPhaseHook: useTeamBuildingPhase,
      brainstormingPhaseHook: useBrainstormingPhase,
      projectManagementPhaseHook: useProjectManagementPhase,
      meetingsPhaseHook: useMeetingsPhase,
      ideationPhaseHook: ideationPhaseHook,
      teamCreationPhaseHook: teamCreationPhaseHook,
      productBrainstormingPhaseHook: productBrainstormingPhaseHook,
      productLaunchPhaseHook: productLaunchPhaseHook,
      dataAnalysisPhaseHook: dataAnalysisPhaseHook,
      generalCommunicationFeaturesPhaseHook: generalCommunicationFeaturesPhaseHook,
      calendarEvent: calendarEvent,
      fileType: fileType,
      analysisResults: [],
      data: {}, // Adjust based on your SupportedData structure
    };

    const cacheResponse: CacheResponse = {
      id: "exampleId",
      data: mockCacheData as SupportedData
    };

    // Return a Promise that resolves to the mock cache data
    return Promise.resolve<CacheResponse>(
      {
        id: "exampleId",
        data: cacheResponse as SupportedData
      });
  } catch (error: any) {
    // Handle any errors that occur during the mock fetch
    console.error("Error fetching cache data:", error);

    // Call the handleError function to handle and log the error
    const errorMessage = "Error fetching cache data";
    handleError(errorMessage, { componentStack: error.stack });

    throw error;
  }
};

// Class to manage API calls and cache data
class ApiService {
  private API_BASE_URL: string;

  constructor(API_BASE_URL: string) {
    this.API_BASE_URL = API_BASE_URL;
  }

  // Define the post method
  public async post(endpointPath: string, requestData: any, config?: AxiosRequestConfig): Promise<any> {
    try {
      const endpoint = `${this.API_BASE_URL}${endpointPath}`;
      const response = await axiosInstance.post(endpoint, requestData, config);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to call ${endpointPath}`);
      throw error;
    }
  }

  // Define the get method
  public async get(endpointPath: string, config?: AxiosRequestConfig): Promise<any> {
    try {
      const endpoint = `${this.API_BASE_URL}${endpointPath}`;
      const response = await axiosInstance.get(endpoint, config);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to get ${endpointPath}`);
      throw error;
    }
  }

  // Define the callApi method
  public async callApi(endpointPath: string, requestData: any): Promise<any> {
    try {
      const endpoint = `${this.API_BASE_URL}${endpointPath}`;
      const response = await axiosInstance.post(endpoint, requestData);
      return response.data;
    } catch (error) {
      handleApiError(error as AxiosError<unknown>, `Failed to call ${endpointPath}`);
      throw error;
    }
  }

   // Define sendFileChangeEvent method to send file change data
   public async sendFileChangeEvent(file: FileData): Promise<void> {
    try {
      const endpointPath = '/file/change-event';  // Define your endpoint path
      const requestData = {
        fileName: file.fileName,
        fileSize: file.fileSize,
        fileType: file.fileType,
        filePath: file.filePath,
        uploader: file.uploader,
        uploadDate: file.uploadDate,
        attachments: file.attachments,
        imageData: file.imageData,
      };

      // Call the post method to send file change event
      await this.post(endpointPath, requestData);
    } catch (error) {
      console.error('Error in sendFileChangeEvent:', error);
      throw error;
    }
  }
}

export default ApiService;
