import UserService, { userId, userService } from "@/app/api/ApiUser";
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { K, T } from "@/app/components/models/data/dataStoreMethods";
import { RealtimeData } from "@/app/components/models/realtime/RealtimeData";
import { CustomPhaseHooks } from "@/app/components/phases/Phase";
import { AnalysisTypeEnum } from "@/app/typings/AnalysisType";
import { VideoData } from "@/app/components/video/Video";
import { CacheData, realtimeData } from "@/app/generators/GenerateCache";
import { AsyncHook } from "@/app/hooks/useAsyncHookLinker";
import { authToken } from "@/app/server/authToken";
import { VersionHistory, versionHistory } from "@/app/versions/VersionData";
import {
    frontendStructure,
} from "@/config/appStructure/FrontendStructure";
import { BackendConfig, backendConfig } from "@/config/BackendConfig";
import { FrontendConfig, frontendConfig } from "@/config/FrontendConfig";
import userSettings, { UserSettings } from "@/config/UserSettings";
import BackendStructure, {
    backendStructure,
} from "@/configs/appStructure/BackendStructure";
import { DataVersions, dataVersions } from "@/configs/DataVersionsConfig";

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
  teamBuildingPhaseHook: AsyncHook<T>
  brainstormingPhaseHook: AsyncHook<T>
  projectManagementPhaseHook: AsyncHook<T>
  meetingsPhaseHook: AsyncHook<T>
  darkModeTogglePhaseHook: AsyncHook<T>; // Define the type of darkModeTogglePhaseHook
  authenticationPhaseHook: AsyncHook<T>
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
    fileType: data.fileType,
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
    videoData: {} as VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    // Construct other properties here
  };
  return constructedData;
};

// Function to read cache data
export function readCache(userId: string): CacheData | null {
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


// Combined writeCache function
export const writeCache = async <T extends Data>(
  userId: string,
  userDataPromise: Promise<CacheData>,
  options: {
    filePath?: string;
    notifyOnSuccess?: boolean;
    notifyOnError?: boolean;
    delay?: number;
  } = {}
): Promise<void> => {
  const { handleError } = useErrorHandling();
  const {
    filePath = `cache/user_${userId}.json`,
    notifyOnSuccess = true,
    notifyOnError = true,
    delay = 1000
  } = options;

  try {
    // Fetch user data if it's a promise
    const userData = await userDataPromise;
    
    // Optional delay for simulation
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Transform data if needed (using your existing transformation function)
    const exchangeData = transformYourResponseToExchangeData(userData as any);
    
    // Extract criteria if needed
    const criteria = extractCriteria(userData?.snapshot, ['someProperty'] as Array<keyof FilterState>);

    // Here you would write the actual cache logic
    // For example: localStorage, IndexedDB, or server-side file system
    console.log(`Writing data to cache at path: ${filePath}`, {
      userId,
      userData,
      exchangeData,
      criteria
    });

    // Success notification
    if (notifyOnSuccess) {
      await notify(
        'write-cache-success',
        `Cache Write Successful`,
        `Cache was successfully written for user ${userId} at ${filePath}`,
        new Date(),
        'success' as NotificationType
      );
    }

    console.log("Cached data successfully written.");

  } catch (error: any) {
    console.error("Error writing cache:", error);
    
    // Error handling
    const errorMessage = `Error writing cache data for user ${userId}`;
    handleError(errorMessage, { componentStack: error.stack });

    // Error notification
    if (notifyOnError) {
      await notify(
        'write-cache-failure',
        `Cache Write Failed`,
        `Failed to write cache for user ${userId}: ${error.message}`,
        new Date(),
        'CacheError' as NotificationType
      );
    }

    throw error;
  }
};

// Usage with .then()
// Assuming userService.fetchUser and userService.fetchUserById return promises
// Usage with .then()
// Assuming userService.fetchUser and userService.fetchUserById return promises
UserService.fetchUser(userId,authToken).then((user) => {
  userService.fetchUserById(user).then((userId) => {
    const userDataPromise = Promise.resolve(
      readCache(userId) || {
        _id,
        data: {},
        lastUpdated: versionHistory,
        userSettings: userSettings,
        dataVersions: dataVersions,
        frontendStructure: frontendStructure,
        backendStructure: backendStructure,
        backendConfig: backendConfig,
        frontendConfig: frontendConfig,
        realtimeData: realtimeData,
        notificationBarPhaseHook: {} as AsyncHook<T>,
        darkModeTogglePhaseHook: {} as AsyncHook<T>,
        authenticationPhaseHook: {} as CustomPhaseHooks,
        jobSearchPhaseHook: {} as AsyncHook<T>,
        recruiterDashboardPhaseHook: {} as CustomPhaseHooks,
        teamBuildingPhaseHook: {} as AsyncHook<T>,
        brainstormingPhaseHook: {} as AsyncHook<T>,
        projectManagementPhaseHook: {} as AsyncHook<T>,
        meetingsPhaseHook: {} as AsyncHook<T>,
        ideationPhaseHook: {} as CustomPhaseHooks,
        teamCreationPhaseHook: {} as CustomPhaseHooks,
        productBrainstormingPhaseHook: {} as CustomPhaseHooks,
        productLaunchPhase: {} as CustomPhaseHooks,
        productLaunchPhaseHook: {} as CustomPhaseHooks,
        dataAnalysisPhaseHook: {} as CustomPhaseHooks,
        generalCommunicationFeaturesPhaseHook: {} as CustomPhaseHooks,
        fileType: "json",
        calendarEvent: {} as CalendarEvent,
      }
    );
    writeCache(userId, userDataPromise);
  });
});


