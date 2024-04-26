import UserSettings from "@/app/configs/UserSettings";
import { RealtimeData } from "../../../models/realtime/RealtimeData";
import { AsyncHook } from "../components/hooks/useAsyncHookLinker";
import { CustomPhaseHooks } from "../components/phases/Phase";
import { CalendarEvent } from "../components/state/stores/CalendarEvent";
import { VideoData } from "../components/video/Video";
import { BackendConfig } from "../configs/BackendConfig";
import { DataVersions } from "../configs/DataVersionsConfig";
import { FrontendConfig } from "../configs/FrontendConfig";
import BackendStructure from "../configs/appStructure/BackendStructure";
import FrontendStructure from "../configs/appStructure/FrontendStructure";
import { CacheData } from "../generators/GenerateCache";
import { AnalysisTypeEnum } from "../components/projects/DataAnalysisPhase/AnalysisType";
import { userService } from "../components/users/ApiUser";

// Define the structure of the response data
interface CacheResponse {
  lastUpdated: string;
  userSettings: typeof UserSettings; // Define the type of userSettings
  dataVersions: DataVersions; // Define the type of dataVersions
  frontendStructure: FrontendStructure; // Define the type of frontendStructure
  backendStructure: BackendStructure; // Define the type of backendStructure
  backendConfig: BackendConfig;
  frontendConfig: FrontendConfig;
  realtimeData: RealtimeData;
  // Add other properties as needed
}

// Function to construct the CacheData object
const constructCacheData = (data: CacheResponse): CacheData => {
  return {
    lastUpdated: data.lastUpdated,
    userSettings: data.userSettings,
    dataVersions: data.dataVersions,
    frontendStructure: data.frontendStructure,
    backendStructure: data.backendStructure,
    frontendConfig: data.frontendConfig,
    backendConfig: data.backendConfig,
    realtimeData: data.realtimeData,
    notificationBarPhaseHook: {} as AsyncHook,
    darkModeTogglePhaseHook: {} as AsyncHook,
    authenticationPhaseHook: {} as CustomPhaseHooks,
    jobSearchPhaseHook: {} as CustomPhaseHooks,
    recruiterDashboardPhaseHook: {} as CustomPhaseHooks,
    teamBuildingPhaseHook: {} as AsyncHook,
    brainstormingPhaseHook: {} as AsyncHook,
    projectManagementPhaseHook: {} as AsyncHook,
    meetingsPhaseHook: {} as AsyncHook,
    ideationPhaseHook: {} as CustomPhaseHooks,
    teamCreationPhaseHook: {} as CustomPhaseHooks,
    productBrainstormingPhaseHook: {} as CustomPhaseHooks,
    productLaunchPhaseHook: {} as CustomPhaseHooks,
    dataAnalysisPhaseHook: {} as CustomPhaseHooks,
    generalCommunicationFeaturesPhaseHook: {} as CustomPhaseHooks,
    fileType: "",
    calendarEvent: {} as CalendarEvent,
    _id: "",
    id: "",
    title: "",
    status: "pending",
    isActive: false,
    tags: [],
    phase: null,
    analysisResults: [],
    analysisType: {} as AnalysisTypeEnum,
    videoData: {} as VideoData,
    // Construct other properties here
  };
};



// Function to read cache data
async function readCache(userId: string): Promise<CacheData | null> {
  return new Promise<CacheData | null>((resolve, reject) => {
    try {
      const cachedData = localStorage.getItem("cached" + userId);
      if (cachedData) {
        // If cached data exists, parse it and construct CacheData using constructCacheData
        const data = JSON.parse(cachedData);
        const constructedData = constructCacheData(data as CacheResponse);
        resolve(constructedData);
      } else {
        // If no cached data found, resolve with null
        resolve(null);
      }
    } catch (err) {
      // If an error occurs during data retrieval, reject the promise with the error
      reject(err);
    }
  });
}

 


// Assuming userService.fetchUser and userService.fetchUserById return promises
const writeCache = async (userId: string, userData: Promise<CacheData>) => {
  try {
    // Fetch user data
    const user = await userService.fetchUser("");

    // Fetch user ID
    const userId = await userService.fetchUserById(user);

    // Write cache
    await writeCache(userId, userData); // Assuming userData is defined elsewhere
    console.log('Cached data successfully written.');
  } catch (error) {
    // If an error occurs during cache writing, log the error
    console.error('Error writing cache:', error);
  }
};


// Usage with .then()
// Assuming userService.fetchUser and userService.fetchUserById return promises
userService.fetchUser("").then(user => {
  userService.fetchUserById(user).then((userId) => {
    const userData = readCache(userId) || {
      lastUpdated: null,
      userSettings: null,
      dataVersions: null,
      frontendStructure: null,
      backendStructure: null,
    };
    writeCache(userId, userData)
      .then(() => {
        console.log("Cached data successfully written.");
      })
      .catch((error) => {
        console.error("Error writing cache:", error);
      });
  });
});




