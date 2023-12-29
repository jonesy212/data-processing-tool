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
      actions: {},
      reducers: {
        // Fix error by changing reducers to type object instead of never[]
        setModules: (state: any, modules: ModuleType) => ({
          ...state,
          modules,
        }),
      },
    },
    userSettings: {
      communicationMode: "",
      enableRealTimeUpdates: false,
      defaultFileType: "",
      allowedFileTypes: [],
      enableGroupManagement: false,
      enableTeamManagement: false,
      realTimeChatEnabled: false,
      // Add properties from CacheData interface
      version: cacheData.version,
      modules: cacheData.modules,
      reducers: cacheData.reducers,
      actions: cacheData.actions,
    },
    dataVersions: undefined,
    frontendStructure: undefined,
    backendDocumentConfig: undefined,
    notificationBarPhaseHook: undefined,
    darkModeTogglePhaseHook: undefined,
    authenticationPhaseHook: undefined,
    jobSearchPhaseHook: undefined,
    recruiterDashboardPhaseHook: undefined,
    teamBuildingPhaseHook: () => {},
    brainstormingPhaseHook: () => {
      return {
        isActive: false,
        toggleActivation: () => {},
        startAnimation: () => {},
        stopAnimation: () => {},
      };
    },

    meetingsPhaseHook: () => {
      return {
        isActive: false,
        toggleActivation: () => {},
        startAnimation: () => {},
        stopAnimation: () => {},
      };
    },
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
