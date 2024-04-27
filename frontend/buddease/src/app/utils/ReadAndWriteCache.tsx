import { RealtimeData } from "../../../models/realtime/RealtimeData";
import { AsyncHook } from "../components/hooks/useAsyncHookLinker";
import { CustomPhaseHooks } from "../components/phases/Phase";
import { AnalysisTypeEnum } from "../components/projects/DataAnalysisPhase/AnalysisType";
import { CalendarEvent } from "../components/state/stores/CalendarEvent";
import { userService } from "../components/users/ApiUser";
import { VersionHistory, versionHistory } from "../components/versions/VersionData";
import { VideoData } from "../components/video/Video";
import { BackendConfig, backendConfig } from "../configs/BackendConfig";
import { DataVersions, dataVersions } from "../configs/DataVersionsConfig";
import { FrontendConfig, frontendConfig } from "../configs/FrontendConfig";
import userSettings, { UserSettings } from "../configs/UserSettings";
import BackendStructure, {
  backendStructure,
} from "../configs/appStructure/BackendStructure";
import {
  frontendStructure,
} from "../configs/appStructure/FrontendStructure";
import { CacheData, realtimeData } from "../generators/GenerateCache";

// Define the structure of the response data
interface CacheResponse {
  lastUpdated: VersionHistory; // Define the type of userSettings
  dataVersions: DataVersions; // Define the type of dataVersions
  frontendStructure: typeof frontendStructure; // Define the type of frontendStructure
  backendStructure: BackendStructure; // Define the type of backendStructure
  backendConfig: BackendConfig;
  frontendConfig: FrontendConfig;
  realtimeData: RealtimeData;
  userSettings: UserSettings;
  notificationBarPhaseHook: CustomPhaseHooks
  teamBuildingPhaseHook: AsyncHook
  brainstormingPhaseHook: AsyncHook
  projectManagementPhaseHook: AsyncHook
  meetingsPhaseHook: AsyncHook
  darkModeTogglePhaseHook: AsyncHook; // Define the type of darkModeTogglePhaseHook
  authenticationPhaseHook: AsyncHook
  // notificationBarPhaseHook: 
  // Add other properties as needed
}

// Function to construct the CacheData object
const constructCacheData = (
  data: CacheResponse,
): CacheData => {
  if (!data) {
    throw new Error("Data is required");
  }

  const constructedData: CacheData = {
    userSettings: data.userSettings,
    dataVersions: data.dataVersions,
    frontendStructure: data.frontendStructure,
    backendStructure: data.backendStructure,
    lastUpdated: data.lastUpdated,
    frontendConfig: data.frontendConfig,
    backendConfig: data.backendConfig,
    realtimeData: data.realtimeData,
    notificationBarPhaseHook: data.notificationBarPhaseHook,
    darkModeTogglePhaseHook: data.darkModeTogglePhaseHook,
    authenticationPhaseHook: data.authenticationPhaseHook,
    jobSearchPhaseHook: data.notificationBarPhaseHook,
    recruiterDashboardPhaseHook: data.notificationBarPhaseHook,
    teamBuildingPhaseHook: data.teamBuildingPhaseHook,
    brainstormingPhaseHook: data.brainstormingPhaseHook,
    projectManagementPhaseHook: data.projectManagementPhaseHook,
    meetingsPhaseHook: data.meetingsPhaseHook,
    ideationPhaseHook: data.notificationBarPhaseHook,
    teamCreationPhaseHook: data.notificationBarPhaseHook,
    productBrainstormingPhaseHook: data.notificationBarPhaseHook,
    productLaunchPhaseHook: data.notificationBarPhaseHook,
    dataAnalysisPhaseHook: data.notificationBarPhaseHook,
    generalCommunicationFeaturesPhaseHook: data.notificationBarPhaseHook,
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
  return constructedData;
};

// Function to read cache data
function readCache(userId: string): CacheData | null {
  try {
    const cachedData = localStorage.getItem("cached" + userId);
    if (cachedData) {
      const data = JSON.parse(cachedData);
      const constructedData = constructCacheData(data as CacheResponse);
      return constructedData;
    } else {
      return null;
    }
  } catch (err) {
    throw err;
  }
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
    console.log("Cached data successfully written.");
  } catch (error) {
    // If an error occurs during cache writing, log the error
    console.error("Error writing cache:", error);
  }
};

// Usage with .then()
// Assuming userService.fetchUser and userService.fetchUserById return promises
// Usage with .then()
// Assuming userService.fetchUser and userService.fetchUserById return promises
userService.fetchUser("").then((user) => {
  userService.fetchUserById(user)?.then((userId) => {
    const userDataPromise = Promise.resolve(
      readCache(userId) || {
        lastUpdated: versionHistory,
        userSettings: userSettings,
        dataVersions: dataVersions,
        frontendStructure: frontendStructure,
        backendStructure: backendStructure,
        backendConfig: backendConfig,
        frontendConfig: frontendConfig,
        realtimeData: realtimeData,
        notificationBarPhaseHook: {} as AsyncHook,
        darkModeTogglePhaseHook: {} as AsyncHook,
        authenticationPhaseHook: {} as CustomPhaseHooks,
        jobSearchPhaseHook: {} as AsyncHook,
        recruiterDashboardPhaseHook: {} as CustomPhaseHooks,
        teamBuildingPhaseHook: {} as AsyncHook,
        brainstormingPhaseHook:  {} as AsyncHook,
        projectManagementPhaseHook: {} as AsyncHook,
        meetingsPhaseHook:  {} as AsyncHook,
        ideationPhaseHook: {} as CustomPhaseHooks,
        teamCreationPhaseHook: {} as CustomPhaseHooks,
        productBrainstormingPhaseHook: {} as CustomPhaseHooks,
        productLaunchPhase: {} as CustomPhaseHooks,
        productLaunchPhaseHook: {} as CustomPhaseHooks,
        dataAnalysisPhaseHook: {} as CustomPhaseHooks,
        generalCommunicationFeaturesPhaseHook: {} as CustomPhaseHooks,
        fileType: "json",
        calendarEvent: { } as CalendarEvent,
      }
    );
    writeCache(userId, userDataPromise);
  });
});
