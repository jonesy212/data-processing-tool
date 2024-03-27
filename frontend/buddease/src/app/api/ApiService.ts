import { handleApiError } from "@/app/api/ApiLogs";
import { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import dotProp from "dot-prop";
import { SupportedData } from "../components/models/CommonData";
import axiosInstance from "./axiosInstance";
import { headersConfig } from "../components/shared/SharedHeaders";
import { handleApiErrorAndNotify } from "./ApiData";
import { endpoints } from "./ApiEndpoints";
import useErrorHandling from "../components/hooks/useErrorHandling";
import { CacheData } from "../generators/GenerateCache";
import userSettings from "../configs/UserSettings";
import FrontendStructure, { frontendStructure } from "../configs/appStructure/FrontendStructure";
import { backendConfig } from "../configs/BackendConfig";
import useRealtimeData  from '@/app/components/hooks/commHooks/useRealtimeData';
import { darkModeTogglePhaseHook, notificationBarPhaseHook } from "../components/hooks/userInterface/UIPhaseHooks";
import { authenticationPhaseHook, dataAnalysisPhaseHook, generalCommunicationFeaturesPhaseHook, ideationPhaseHook, jobSearchPhaseHook, productBrainstormingPhaseHook, productLaunchPhaseHook, recruiterDashboardPhaseHook, teamCreationPhaseHook } from "../components/hooks/phaseHooks/PhaseHooks";
import { useBrainstormingPhase, useMeetingsPhase, useProjectManagementPhase, useTeamBuildingPhase } from "../components/hooks/phaseHooks/CollaborationPhaseHooks";
import { CalendarEvent, calendarEvent, events } from '@/app/components/state/stores/CalendarEvent';
import RealtimeData from "../../../models/realtime/RealtimeData";
import { dataVersions } from "../configs/DataVersionsConfig";
import { backendStructure } from "../configs/appStructure/BackendStructure";
import { frontendConfig } from "../configs/FrontendConfig";
import { implementThen } from "../components/state/stores/CommonEvent";
import VersionGenerator from "../components/versions/VersionGenerator";

const API_BASE_URL = dotProp.getProperty(endpoints, "data");

// Define the structure of the response data
interface CacheResponse {
  // Define the structure of CacheResponse
}

export const readCache = async (): Promise<SupportedData> => {
  try {
    // Fetch cache data
    const cacheResponse: CacheResponse = await fetchCacheData();

    // Populate data from cacheResponse
    const supportedData: SupportedData = {} as never;

    return supportedData;
  } catch (error) {
    console.error("Error reading cache:", error);
    throw error;
  }
};

 // Function to write cache data to the server
export const writeCache = async (data: CacheResponse): Promise<void> => {
  try {
    // Implement logic to write data to the cache
    // For example, make a POST request to an endpoint to store the data




    // Generate version and versionInfo using VersionGenerator
    const { version, info } = await VersionGenerator.generateVersion({
      getData: () => Promise.resolve(data), // Use mock data as the source for version generation
      determineChanges: (data: any) => ({}), // Provide a placeholder function for determining changes
      additionalProperties: {}, // Provide any additional properties if needed
      file: 'exampleFile', // Example file name
      folder: 'exampleFolder', // Example folder name
      componentName: 'exampleComponent', // Example component name
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
  } catch (error) {
    // Handle any errors that occur during the request
    console.error("Error writing to cache:", error);
    handleApiErrorAndNotify(
      error as AxiosError<unknown>,
      "Error writing to cache",
      "WriteCacheErrorId"
    );
    throw error;
  }
};

// Function to fetch cache data (mock implementation)
const fetchCacheData = async (): Promise<CacheResponse> => {
  // Initialize the useErrorHandling hook
  const { handleError } = useErrorHandling();

  try {
    // Simulate fetching data from a server by delaying execution for a certain period (e.g., 1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock cache data object using the CacheData interface
    const mockCacheData: CacheData = {
      _id: "",
      id: "",
      lastUpdated: "2024-03-22T12:00:00", // Example last updated timestamp
      userSettings: userSettings, // Example user settings object
      dataVersions: dataVersions, // Example data versions object
      frontendStructure: frontendStructure, // Example frontend structure object
      backendStructure: backendStructure, // Example backend structure object
      backendConfig: backendConfig, // Example backend configuration object
      frontendConfig: frontendConfig, // Example frontend configuration object
      realtimeData: {
        id: "realtime-data-id", // Add missing id property
        name: "Realtime Data",
        ...RealtimeData,
      }, // Example realtime data object
      notificationBarPhaseHook: notificationBarPhaseHook, // Example notification bar phase hook
      darkModeTogglePhaseHook: darkModeTogglePhaseHook, // Example dark mode toggle phase hook
      authenticationPhaseHook: authenticationPhaseHook, // Example authentication phase hook
      jobSearchPhaseHook: jobSearchPhaseHook, // Example job search phase hook
      recruiterDashboardPhaseHook: recruiterDashboardPhaseHook, // Example recruiter dashboard phase hook
      teamBuildingPhaseHook: useTeamBuildingPhase, // Example team building phase hook
      brainstormingPhaseHook: useBrainstormingPhase, // Example brainstorming phase hook
      projectManagementPhaseHook: useProjectManagementPhase, // Example project management phase hook
      meetingsPhaseHook: useMeetingsPhase, // Example meetings phase hook
      ideationPhaseHook: ideationPhaseHook, // Example ideation phase hook
      teamCreationPhaseHook: teamCreationPhaseHook, // Example team creation phase hook
      productBrainstormingPhaseHook: productBrainstormingPhaseHook, // Example product brainstorming phase hook
      productLaunchPhaseHook: productLaunchPhaseHook, // Example product launch phase hook
      dataAnalysisPhaseHook: dataAnalysisPhaseHook, // Example data analysis phase hook
      generalCommunicationFeaturesPhaseHook: generalCommunicationFeaturesPhaseHook, // Example general communication features phase hook
      fileType: "csv", // Example file type
      calendarEvent: calendarEvent,
      analysisResults: [],
    };

    // Return a Promise that resolves to the mock cache data
    return Promise.resolve(mockCacheData);
  } catch (error: any) {
    // Handle any errors that occur during the mock fetch
    console.error("Error fetching cache data:", error);

    // Call the handleError function to handle and log the error
    handleError("Error fetching cache data", error);

    throw error;
  }
};

// Class to manage API calls and cache data
class ApiService {
  private API_BASE_URL: string;

  constructor(API_BASE_URL: string) {
    this.API_BASE_URL = API_BASE_URL;
  }

  public async post(endpointPath: string, requestData: any, config?: AxiosRequestConfig): Promise<any> {
    try {
      const endpoint = dotProp.getProperty(this.API_BASE_URL, endpointPath) as unknown as string;
    } catch (error) {
      handleApiError(
        error as AxiosError<unknown>,
        `Failed to call ${endpointPath}`
      );
      throw error;
    }
    // Function to call API with GET method
  }
  public async get(endpointPath: string, config?: AxiosRequestConfig): Promise<any> {
    try {
      const endpoint = dotProp.getProperty(this.API_BASE_URL, endpointPath) as unknown as string;
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (err) {
      handleApiError(err as AxiosError<unknown>, `Failed to get ${endpointPath}`);
    }

  }
  // Function to call API
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
