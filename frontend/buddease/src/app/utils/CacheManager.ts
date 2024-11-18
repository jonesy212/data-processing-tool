// CacheManager.ts
import axios from "axios";
import { promises as fs } from 'fs';
import { create } from "mobx-persist";
import getAppPath from "../../../appPath";
import { LanguageEnum } from '../components/communications/LanguageEnum';
import { AsyncHook } from "../components/hooks/useAsyncHookLinker";
import useErrorHandling from "../components/hooks/useErrorHandling";
import { BaseData, Data } from "../components/models/data/Data";
import { CustomPhaseHooks } from "../components/phases/Phase";
import { Snapshot } from "../components/snapshots";
import { RootState } from "../components/state/redux/slices/RootSlice";
import { NotificationType, useNotification } from "../components/support/NotificationContext";
import { getCurrentAppInfo } from "../components/versions/VersionGenerator";
import { VideoData } from "../components/video/Video";
import { backendConfig } from "../configs/BackendConfig";
import { UserPreferences } from "../configs/UserPreferences";
import { UserSettings } from "../configs/UserSettings";
import BackendStructure from "../configs/appStructure/BackendStructure";
import FrontendStructure from "../configs/appStructure/FrontendStructure";
import { realtimeData } from "../generators/GenerateCache";
import { generateInterfaces } from "../generators/GenerateInterfaces";
import { DataAnalysisDispatch } from "../typings/dataAnalysisTypes";
const backendModelPaths = ["path/to/backend/models"]; // Update this with the actual path

const { notify } = useNotification()
// Generate interfaces
generateInterfaces(backendModelPaths);


interface MainConfigProps {
  frontendStructure: FrontendStructure; // Define frontendStructure in props interface
  backendConfig: any; // Define backendConfig in props interface with appropriate type
}


// Define the interface for writeCache props
interface WriteCacheProps {
  [key: string]: any;
  lastUpdated: string;
  userSettings: UserSettings;
  userPreferences?: UserPreferences;
  cacheDataVersions?: {
    users?: number;
    products?: number;
    authentication?: number;
    company?: number;
    tasks?: number;
    todos?: number;
  };
  authenticationPhaseHook?: CustomPhaseHooks<BaseData>;
  jobSearchPhaseHook?: CustomPhaseHooks<BaseData>;
  recruiterDashboardPhaseHook?: CustomPhaseHooks<BaseData>;
  fileType?: string;
  frontendStructure?: any;
  backendStructure?: any;
  backendConfig?: any;
  realtimeData?: any;
  fetchData?: (userId: string, dispatch: DataAnalysisDispatch) => Promise<void>;
}

type CacheWriteOptions = {
  filePath: string;
  data: Record<string, any>;
  lastUpdated: string;
  writeCacheProps: WriteCacheProps;
  userSettings: UserSettings
};


// Function to write cache data
const writeCache = async <T extends Data>(
  { filePath, data }: CacheWriteOptions
): Promise<void> => {
  // Initialize the useErrorHandling hook
  const { handleError } = useErrorHandling();

  try {
    // Simulate writing data to a cache by delaying execution for a certain period (e.g., 1 second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Here you would write the logic to actually write the data to the cache.
    // For example, interacting with a file system, localStorage, or some database.
    console.log(`Writing data to cache at path: ${filePath}`, data);

    // Notify the user about the successful cache write operation
    await notify(
      'write-cache-success',
      `Cache Write Successful`,
      `Cache was successfully written at ${filePath}`,
      new Date(),
      'success' as NotificationType
    );
  } catch (error: any) {
    // Handle any errors that occur during the write operation
    console.error("Error writing cache:", error);

    // Call the handleError function to handle and log the error
    const errorMessage = "Error writing cache data";
    handleError(errorMessage, { componentStack: error.stack });

    // Notify the user about the failure to write cache
    await notify(
      'write-cache-failure',
      `Cache Write Failed`,
      `Failed to write cache at ${filePath}: ${error.message}`,
      new Date(),
      'CacheError' as NotificationType
    );

    throw error; // Re-throw the error after handling it
  }
};


// Define the keys for your stores
export const STORE_KEYS = {
  USER_PREFERENCES: "userPreferences",
  // Add more store keys as needed
};

// Define the interface for your cache structure
export interface CacheStructure {
  [key: string]: any; // You can adjust this based on your actual structure
}

export const getBackendStructureFilePath = (key: string): string => {
  // Assuming key corresponds to the unique ID in the structure
  const item = backendStructure.getStructureAsArray().find((item) => item.id === key);
  if (item) {
    return item.path;
  } else {
    throw new Error(`File path not found for key: ${key}`);
  }
};


// Read cache data
export const readAndLogCache = async (key: string) => {
  const filePath = getBackendStructureFilePath(key);
  try {
    const cacheData = await fs.readFile(filePath, "utf-8");
    const cache = JSON.parse(cacheData);
    console.log("Current Cache:", cache);
    return cache;
  } catch (error) {
    console.error(`Error reading cache from ${filePath}:`, error);
    throw error;
  }
};


// Define or import projectPath here
const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);
const frontendStructure = new FrontendStructure(projectPath);
const backendStructure = new BackendStructure(projectPath);

// Write cache data
export const writeAndUpdateCache = async (key: string, newCacheData: any) => {
  await writeCache({
    [key]: newCacheData,
    lastUpdated: "",
    // userPreferences: {
    //   modules: {} as ModuleType,
    //   actions: {} as never[],
    //   reducers: {} as never[],
    // },
    userSettings: {
      communicationMode: "",
      enableRealTimeUpdates: false,
      defaultFileType: "",
      allowedFileTypes: [],
      enableGroupManagement: false,
      enableTeamManagement: false,
      realTimeChatEnabled: false,
      todoManagementEnabled: false,
      notificationEmailEnabled: false,
      analyticsEnabled: false,
      twoFactorAuthenticationEnabled: false,
      projectManagementEnabled: false,
      documentationSystemEnabled: false,
      versionControlEnabled: false,
      userProfilesEnabled: false,
      accessControlEnabled: false,
      taskManagementEnabled: false,
      loggingAndNotificationsEnabled: false,
      securityFeaturesEnabled: false,
      collaborationPreference1: undefined,
      collaborationPreference2: undefined,
      theme: undefined,
      language: LanguageEnum.English,
      fontSize: 0,
      darkMode: false,
      enableEmojis: false,
      enableGIFs: false,
      emailNotifications: false,
      pushNotifications: false,
      notificationSound: "",
      timeZone: "",
      dateFormat: "",
      timeFormat: "",
      defaultProjectView: "",
      taskSortOrder: "",
      showCompletedTasks: false,
      projectColorScheme: "",
      showTeamCalendar: false,
      teamViewSettings: [],
      defaultTeamDashboard: "",
      passwordExpirationDays: 0,
      privacySettings: [],
      thirdPartyApiKeys: {} as Record<string, string>,
      externalCalendarSync: false,
      dataExportPreferences: [],
      dashboardWidgets: [],
      customTaskLabels: [],
      customProjectCategories: [],
      customTags: [],
      additionalPreference1: undefined,
      additionalPreference2: undefined,
      formHandlingEnabled: false,
      paginationEnabled: false,
      modalManagementEnabled: false,
      sortingEnabled: false,
      notificationSoundEnabled: false,
      localStorageEnabled: false,
      clipboardInteractionEnabled: false,
      deviceDetectionEnabled: false,
      loadingSpinnerEnabled: false,
      errorHandlingEnabled: false,
      toastNotificationsEnabled: false,
      datePickerEnabled: false,
      themeSwitchingEnabled: false,
      imageUploadingEnabled: false,
      passwordStrengthEnabled: false,
      browserHistoryEnabled: false,
      geolocationEnabled: false,
      webSocketsEnabled: false,
      dragAndDropEnabled: false,
      idleTimeoutEnabled: false,
      enableAudioChat: false,
      enableVideoChat: false,
      enableFileSharing: false,
      enableBlockchainCommunication: false,
      enableDecentralizedStorage: false,
      idleTimeout: {
        isActive: false,
        intervalId: undefined,
        animateIn: function (selector: string): void {
          const element = document.querySelector(selector);
          if (element) {
            element.classList.add('animate-in');
          } else {
            console.error('Element not found');
          }

        },
        idleTimeoutId: function (): void {
          this.isActive = true;
          this.startAnimation();
        },
        startIdleTimeout: function (): void {
          this.intervalId = setInterval(() => {
            this.animateIn('#idle-timeout-container');
          }, this.idleTimeoutDuration);
        },
        toggleActivation: function (): Promise<boolean> {
          this.isActive = !this.isActive;
          if (this.isActive) {
            this.startAnimation();
          } else {
            this.stopAnimation();
          }
          return Promise.resolve(this.isActive);
        },
        startAnimation: function (): void {
        },
        stopAnimation: function (): void {
          this.isActive = false;
          clearInterval(this.intervalId);
        },
        resetIdleTimeout: async () => {}
      },
      idleTimeoutDuration: 0,
      activePhase: ""
    },
    cacheDataVersions: {
      users: 0,
      products: 0,
      authentication: 0,
      company: 0,
      tasks: 0,
      todos: 0,
    },


    authenticationPhaseHook: {} as CustomPhaseHooks<BaseData>,
    jobSearchPhaseHook: {} as CustomPhaseHooks<BaseData>,
    recruiterDashboardPhaseHook: {} as CustomPhaseHooks<BaseData>,

    fileType: "",
    frontendStructure: frontendStructure,
    backendStructure: backendStructure,
    backendConfig: backendConfig,
    realtimeData: realtimeData,
    fetchData: function (userId: string, dispatch: DataAnalysisDispatch): Promise<void> {
      throw new Error("Function not implemented.");
    },
    notificationBarPhaseHook: {} as  AsyncHook<RootState>,
    darkModeTogglePhaseHook: {} as  AsyncHook<RootState>,
    teamBuildingPhaseHook: {} as  AsyncHook<RootState>,
    brainstormingPhaseHook: {} as  AsyncHook<RootState>,
    projectManagementPhaseHook: {} as  AsyncHook<RootState>,
    meetingsPhaseHook: {} as  AsyncHook<RootState>,
    ideationPhaseHook: {} as CustomPhaseHooks<BaseData>,
    teamCreationPhaseHook: {} as CustomPhaseHooks<BaseData>,
    productBrainstormingPhaseHook: {} as CustomPhaseHooks<BaseData>,
    productLaunchPhaseHook: {} as CustomPhaseHooks<BaseData>,
    dataAnalysisPhaseHook: {} as CustomPhaseHooks<BaseData>,
    generalCommunicationFeaturesPhaseHook: {} as CustomPhaseHooks<BaseData>,
    _id: "",
    id: "",
    title: "",
    status: "pending",
    isActive: false,
    tags: [],
    phase: null,
    then: function (callback: (newData: Snapshot<Data, Data>) => void): void {
      throw new Error("Function not implemented.");
    },
    analysisType: "",
    analysisResults: [],
    videoData: {} as VideoData<Data, Data>
  });
};

// Hydrate MobX store
export const hydrateMobXStore = (key: string, cache: any) => {
  create({
    storage: window.localStorage,
    jsonify: true,
  })(key, cache).rehydrate();
};

// Synchronize cache with the server
export const synchronizeCacheWithServer = async (key: string, data: any) => {
  try {
    // Synchronize the cache with the server
    await axios.post(`/api/synchronize_cache/${key}`, { data });
  } catch (error) {
    console.error(`Error synchronizing ${key} cache with the server:`, error);
  }
};

// Example usage
const exampleUsage = async (key: string) => {


  // Read cache data
  const cache = await readAndLogCache(key);

  // Update cache data for the user preferences store
  if (cache) {
    const updatedUserPreferences = {
      ...(cache as any)[STORE_KEYS.USER_PREFERENCES],
      darkMode: true,
    };

    // Write the updated cache data
    await writeAndUpdateCache(
      STORE_KEYS.USER_PREFERENCES,
      updatedUserPreferences
    );

    // Hydrate the user preferences store
    hydrateMobXStore(
      STORE_KEYS.USER_PREFERENCES,
      (cache as any)[STORE_KEYS.USER_PREFERENCES]
    );

    // Synchronize the user preferences cache with the server
    synchronizeCacheWithServer(
      STORE_KEYS.USER_PREFERENCES,
      updatedUserPreferences
    );
  }
  exampleUsage(key);
};


export type { CacheWriteOptions };
