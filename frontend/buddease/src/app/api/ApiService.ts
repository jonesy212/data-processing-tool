import { handleApiError } from "@/app/api/ApiLogs";
import { calendarEvent } from '@/app/components/state/stores/CalendarEvent';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import dotProp from "dot-prop";
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
 
const API_BASE_URL = dotProp.getProperty(endpoints, "data");
const { notify} = useNotification()
// Define the structure of the response data
interface CacheResponse {
  // Define the structure of CacheResponse
  id?: string | number | undefined
  data: SupportedData
}

// Function to read cache data
export const readCache = async (
  filePath: string
): Promise<SupportedData | undefined> => {
  try {
    // Fetch cache data using the file path
    const cacheResponse: CacheResponse | undefined = await fetchCacheData(
      filePath
    );

    if (cacheResponse) {
      // Example: Extract relevant data from cacheResponse
      const supportedData: SupportedData = {
        id: cacheResponse.id,
        data: cacheResponse.data,
        // Populate other properties as needed
      };

      return supportedData;
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

 // Function to write cache data to the server
export const writeCache = async (data: CacheResponse): Promise<void> => {
  try {
    // Implement logic to write data to the cache
    await axiosInstance.post(`${API_BASE_URL}`, data);
    // For example, make a POST request to an endpoint to store the data
    // Generate version and versionInfo using VersionGenerator
    const { version, info } = await VersionGenerator.generateVersion({
      getData: () => Promise.resolve(data), // Use mock data as the source for version generation
      determineChanges: (data: any) => ({}), // Provide a placeholder function for determining changes
      additionalProperties: {}, // Provide any additional properties if needed
      file: "exampleFile", // Example file name
      folder: "exampleFolder", // Example folder name
      componentName: "exampleComponent", // Example component name
      properties: {}, // Example properties
    });

    // Log the version and versionInfo
    console.log("Generated version:", version);
    console.log("Version info:", info);

    // Write the cache data using the ApiService
    const writeCacheEndpoint = `${API_BASE_URL}.writeCache`; // Replace with the actual endpoint for writing cache data
    const response = await ApiService.post(writeCacheEndpoint, version, {
      headers: headersConfig, // Include headersConfig in the request
    });

    // Check if the request was successful
    if (response.status === 200) {
      console.log("Cache data has been successfully written.");
    } else {
      // Handle the case where the server returns an error status
      console.error(
        "Failed to write cache data. Server returned status:",
        response.status
      );
      throw new Error("Failed to write cache data.");
    }
  } catch (error: any) {
    // Handle any errors that occur during the request
    console.error("Error writing to cache:", error);
    handleApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Failed to write to cache",
       "ERROR_WRITING_TO_CACHE"
    );
    throw error;
  }
};

// Function to fetch cache data (mock implementation)
const fetchCacheData = async (notify: string): Promise<CacheResponse> => {
  // Initialize the useErrorHandling hook
  const { handleError } = useErrorHandling();

  try {
    // Simulate fetching data from a server by delaying execution for a certain period (e.g., 1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const fileType = determineFileType(notify);

    // Mock cache data object using the CacheData interface
    const mockCacheData: CacheData = {
      _id: "",
      id: "",
      lastUpdated: versionHistory,
      userSettings: userSettings,
      dataVersions: dataVersions,
      frontendStructure: frontendStructure?.[0],
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
      generalCommunicationFeaturesPhaseHook:
        generalCommunicationFeaturesPhaseHook,
      calendarEvent: calendarEvent,
      fileType: fileType,
      analysisResults: [],
      data: [],
    };

    // Return a Promise that resolves to the mock cache data
    return Promise.resolve<CacheResponse>(mockCacheData);
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
  static post: any;

  constructor(API_BASE_URL: string) {
    this.API_BASE_URL = API_BASE_URL;
  }

  // Define the post method
  public async post(endpointPath: string, requestData: any, config?: AxiosRequestConfig): Promise<any> {
    try {
      const endpoint = dotProp.getProperty(this.API_BASE_URL, endpointPath) as unknown as string;
      // Implement the logic to make a POST request to the endpoint
      
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        `Failed to call ${endpointPath}`
      );
      throw error;
    }
  }

  // Define the get method
  public async get(endpointPath: string, config?: AxiosRequestConfig): Promise<any> {
    try {
      const endpoint = dotProp.getProperty(this.API_BASE_URL, endpointPath) as unknown as string;
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (err) {
      handleApiError(err as AxiosError<unknown>, `Failed to get ${endpointPath}`);
    }
  }

  // Define the callApi method
  public async callApi(endpointPath: string, requestData: any): Promise<any> {
    try {
      const endpoint = dotProp.getProperty(this.API_BASE_URL, endpointPath) as
        | string
        | undefined;
      if (!endpoint) {
        throw new Error(`${endpointPath} endpoint not found`);
      }
      const response: AxiosResponse = await axiosInstance.post(
        endpoint,
        requestData
      );
      return response.data;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        `Failed to call ${endpointPath}`
      );
      throw error;
    }
  }
}

export default ApiService;