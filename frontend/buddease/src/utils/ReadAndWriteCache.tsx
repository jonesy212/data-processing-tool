import { transformYourResponseToExchangeData } from '@/core/api/ApiExchange';
import UserService, { userId, userService } from "@/core/api/ApiUser";
import extractCriteria from '@/core/api/SnapshotApi';
import { CalendarEvent } from '@/core/calendar/CalendarEvent';
import {
    frontendStructure,
} from "@/core/config/appStructure/FrontendStructure";
import { BackendConfig, backendConfig } from "@/core/config/BackendConfig";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { FrontendConfig, frontendConfig } from "@/core/config/FrontendConfig";
import userSettings, { UserSettings } from "@/core/config/UserSettings";
import { DataVersions, dataVersions } from "@/core/configs/DataVersionsConfig";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { CacheData, realtimeData } from "@/core/generators/GenerateCache";
import { AsyncHook } from "@/core/hooks/useAsyncHookLinker";
import { useErrorHandling } from "@/core/hooks/useErrorHandling";
import { K, T } from '@/core/models/data/dataStoreMethods';
import { CustomPhaseHooks } from '@/core/models/phases/Phase';
import { authToken } from "@/core/server/auth/authToken";
import BackendStructure, { backendStructure } from '@/core/server/database/BackendStructure';
import { AnalysisTypeEnum } from "@/core/typings/AnalysisType";
import { RealtimeData } from '@/core/typings/realtimeTypes';
import { VideoData } from '@/core/typings/videoTypes/Video';
import { VersionHistory, versionHistory } from "@/core/versions/VersionData";

// Define the structure of the response data
interface CacheResponse<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  frontendStructure: typeof frontendStructure; // Define the type of frontendStructure
  backendStructure: BackendStructure; // Define the type of backendStructure
  backendConfig: BackendConfig;
  frontendConfig: FrontendConfig;
  realtimeData: RealtimeData;
  userSettings: UserSettings;
  teamBuildingPhaseHook: AsyncHook<T>;
  brainstormingPhaseHook: AsyncHook<T>;
  projectManagementPhaseHook: AsyncHook<T>;
  meetingsPhaseHook: AsyncHook<T>;
  darkModeTogglePhaseHook: AsyncHook<T>;
  authenticationPhaseHook: AsyncHook<T>;
  notificationBarPhaseHook: CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  lastUpdated: VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dataVersions: DataVersions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  // Add other properties as needed
}

// Function to construct the CacheData object
const constructCacheData = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  data: CacheResponse<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    videoData: {} as VideoData<T, K>,
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
        authenticationPhaseHook: {} as CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        jobSearchPhaseHook: {} as AsyncHook<T>,
        recruiterDashboardPhaseHook: {} as CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        teamBuildingPhaseHook: {} as AsyncHook<T>,
        brainstormingPhaseHook: {} as AsyncHook<T>,
        projectManagementPhaseHook: {} as AsyncHook<T>,
        meetingsPhaseHook: {} as AsyncHook<T>,
        ideationPhaseHook: {} as CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        teamCreationPhaseHook: {} as CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        productBrainstormingPhaseHook: {} as CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        productLaunchPhase: {} as CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        productLaunchPhaseHook: {} as CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        dataAnalysisPhaseHook: {} as CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        generalCommunicationFeaturesPhaseHook: {} as CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        fileType: "json",
        calendarEvent: {} as CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      }
    );
    writeCache(userId, userDataPromise);
  });
});


