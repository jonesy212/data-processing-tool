import UserSettings from "@/app/configs/UserSettings";
import RealtimeData from "../../../models/realtime/RealtimeData";
import { AsyncHook } from "../components/hooks/useAsyncHookLinker";
import { CustomPhaseHooks } from "../components/phases/Phase";
import { CalendarEvent } from "../components/state/stores/CalendarEvent";
import userService from "../components/users/ApiUser";
import { VideoData } from "../components/video/Video";
import { BackendConfig } from "../configs/BackendConfig";
import { DataVersions } from "../configs/DataVersionsConfig";
import { FrontendConfig } from "../configs/FrontendConfig";
import BackendStructure from "../configs/appStructure/BackendStructure";
import FrontendStructure from "../configs/appStructure/FrontendStructure";
import { CacheData } from "../generators/GenerateCache";

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


// Usage
// Usage with async/await
// Assuming userService.fetchUser and userService.fetchUserById return promises
const user = await userService.fetchUser("");
const userId = await userService.fetchUserById(user);

try {
  // Attempt to read cached data for the user
  const cachedData = await readCache(userId);
  if (cachedData) {
    // If cached data exists, log it
    console.log('Cached data:', cachedData);
  } else {
    // If no cached data found, log a message
    console.log('No cached data found.');
  }
} catch (error) {
  // If an error occurs during cache reading, log the error
  console.error('Error reading cache:', error);
}

// Usage with .then()
// Assuming userService.fetchUser and userService.fetchUserById return promises
userService.fetchUser("").then(user => {
  userService.fetchUserById(user).then(userId => {
    // Read cached data for the user
    readCache(userId).then(cachedData => {
      if (cachedData) {
        // If cached data exists, log it
        console.log('Cached data:', cachedData);
      } else {
        // If no cached data found, log a message
        console.log('No cached data found.');
      }
    }).catch(error => {
      // If an error occurs during cache reading, log the error
      console.error('Error reading cache:', error);
    });
  });
});


