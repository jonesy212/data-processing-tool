// CacheManager.ts
import axios from "axios";
import { create } from "mobx-persist";
import cacheData from "../configs/MainConfig";
import { ModuleType } from "../configs/UserPreferences";
import { generateInterfaces } from "../generators/GenerateInterfaces";
import { readCache, writeCache } from "./ReadAndWriteCache";

const backendModelPaths = ["path/to/backend/models"]; // Update this with the actual path

// Generate interfaces
generateInterfaces(backendModelPaths);

// Define the keys for your stores
export const STORE_KEYS = {
  USER_PREFERENCES: "userPreferences",
  // Add more store keys as needed
};

// Define the interface for your cache structure
export interface CacheStructure {
  [key: string]: any; // You can adjust this based on your actual structure
}

// Read cache data
export const readAndLogCache = async () => {
  const cache = await readCache();
  console.log("Current Cache:", cache);
  return cache;
};

// Write cache data
export const writeAndUpdateCache = async (key: string, newCacheData: any) => {
  await writeCache({
    [key]: newCacheData,
    lastUpdated: "",
    userPreferences: {
      modules: {} as ModuleType,
      actions: {} as never[],
      reducers: {} as never[],
    },
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
      theme: "",
      language: "",
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
        animateIn: function (selector: string): void {
          const element = document.querySelector(selector);
          if (element) { 
            element.classList.add('animate-in');

          } else {
            console.error('Element not found');
          }

        },
        toggleActivation: function (): void {
          this.isActive = !this.isActive;
          if(this.isActive) {
            this.startAnimation();
          } else {
            this.stopAnimation();
          }

        },
        startAnimation: function (): void {

        },
        stopAnimation: function (): void {
          this.isActive = false;
          clearInterval(this.intervalId);
        },
        resetIdleTimeout: undefined
      },
      idleTimeoutDuration: 0,
      activePhase: ""
    },
    dataVersions: {
      users: 0,
      products: 0,
      authentication: 0,
      company: 0,
      tasks: 0,
      todos: 0,
    },
    frontendStructure: cacheData.frontendStructure,
    backendDocumentConfig: cacheData.backendDocumentConfig,
    notificationBarPhaseHook: () => {
      return {
        isActive: false,
        toggleActivation: () => {},
        startAnimation: () => {},
        stopAnimation: () => {},
        animateIn: () => {},
      };
    },
    darkModeTogglePhaseHook: () => {
      return {
        isActive: false,
        toggleActivation: () => {},
        startAnimation: () => {},
        stopAnimation: () => {},
        animateIn: () => {},
      };
    },
    authenticationPhaseHook: () => {
      return {
        isActive: false,
        toggleActivation: () => {},
        startAnimation: () => {},
        stopAnimation: () => {},
        animateIn: () => {},
      };
    },
    jobSearchPhaseHook: () => {
      return {
        isActive: false,
        toggleActivation: () => {},
        startAnimation: () => {},
        stopAnimation: () => {},
        animateIn: () => {},
      };
    },
    recruiterDashboardPhaseHook: () => {
      return {
        isActive: false,
        toggleActivation: () => {},
        startAnimation: () => {},
        stopAnimation: () => {},
        animateIn: () => {},
      };
    },
    teamBuildingPhaseHook: () => {
      return {
        isActive: false,
        toggleActivation: () => {},
        startAnimation: () => {},
        stopAnimation: () => {},
        animateIn: () => {},
      };
    },
    brainstormingPhaseHook: () => {
      return {
        isActive: false,
        toggleActivation: () => {},
        startAnimation: () => {},
        stopAnimation: () => {},
        animateIn: () => {},
      };
    },
    projectManagementPhaseHook: () => {
      return {
        isActive: false,
        toggleActivation: () => {},
        startAnimation: () => {},
        stopAnimation: () => {},
        animateIn: () => {},
      };
    },
    meetingsPhaseHook: () => {
      return {
        isActive: false,
        toggleActivation: () => {},
        startAnimation: () => {},
        stopAnimation: () => {},
        animateIn: () => {},
      };
    },
    fileType: "",
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
const exampleUsage = async () => {
  // Read cache data
  const cache = await readAndLogCache();

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
  exampleUsage();
};

// Run the example usage
