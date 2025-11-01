// CacheManager.ts
import { BaseData } from '@/app/models/data/Data';
import { CustomPhaseHooks } from "@/app/components/phases/Phase";
import { DataAnalysisDispatch } from "@/app/typings/dataAnalysisTypes";
import { getCurrentAppInfo } from "@/app/versions/VersionGenerator";
import getAppPath from "@/app/config/appStructure/appPath";
import FrontendStructure from "@/app/config/appStructure/FrontendStructure";
import { UserPreferences } from "@/app/config/UserPreferences";
import { UserSettings } from "@/app/config/UserSettings";
import BackendStructure from "@/configs/appStructure/BackendStructure";
import { useNotification } from "@/context/NotificationContext";

const { notify } = useNotification()

interface MainConfigProps {
  frontendStructure: FrontendStructure;
  backendConfig: BackendStructure;
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



// Define the interface for your cache structure
export interface CacheStructure {
  [key: string]: any;
}

export const getBackendStructureFilePath = (key: string): string => {
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

export type { CacheWriteOptions };
