// CacheManager.ts
import getAppPath from "@/core/config/appStructure/appPath";
import FrontendStructure from "@/core/config/appStructure/FrontendStructure";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { UserPreferences } from "@/core/config/UserPreferences";
import { UserSettings } from "@/core/config/UserSettings";
import { Attachment } from '@/core/documents/attachment/Attachment';
import { BaseData } from '@/core/models/data/Data';
import { CustomPhaseHooks } from "@/core/models/phases/Phase";
import BackendStructure from "@/core/server/database/BackendStructure";
import { useNotification } from '@/core/state/context/NotificationContext';
import { DataAnalysisDispatch } from "@/core/typings/phases/dataAnalysisTypes";
import { getCurrentAppInfo } from "@/core/versions/VersionGenerator";
import fs from 'fs';

const { notify } = useNotification();

// Define or import projectPath here
const { versionNumber, appVersion } = getCurrentAppInfo();
const projectPath = getAppPath(versionNumber, appVersion);
const frontendStructure = new FrontendStructure(projectPath);
const backendStructure = new BackendStructure(projectPath);

interface MainConfigProps<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
> {
  frontendStructure: FrontendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
// note: the async approach is recommended since file system operations are inherently asynchronous.
export const getBackendStructureFilePath = async (key: string): Promise<string> => {
  const structureArray = await backendStructure.getStructureAsArray();
  const item = structureArray.find((item: any) => item.id === key);
  if (item) {
    return item.path;
  } else {
    throw new Error(`File path not found for key: ${key}`);
  }
};


export const getFrontendStructureFilePath = async (key: string): Promise<string> => {
  const structureArray = await frontendStructure.getStructureAsArray();
  const item = structureArray.find((item: any) => item.id === key);
  if (item) {
    return item.path;
  } else {
    throw new Error(`Frontend file path not found for key: ${key}`);
  }
};


// Read cache data from backend
export const readAndLogCache = async (key: string) => {
  const filePath = await getBackendStructureFilePath(key); // Add await
  try {
    const cacheData = await fs.promises.readFile(filePath, "utf-8");
    const cache = JSON.parse(cacheData);
    console.log("Current Cache:", cache);
    return cache;
  } catch (error) {
    console.error(`Error reading cache from ${filePath}:`, error);
    throw error;
  }
};

// Read frontend configuration data
export const readFrontendConfig = async (key: string) => {
  const filePath = await getFrontendStructureFilePath(key);
  try {
    const configData = await fs.promises.readFile(filePath, "utf-8");
    const config = JSON.parse(configData);
    console.log("Frontend Config:", config);
    return config;
  } catch (error) {
    console.error(`Error reading frontend config from ${filePath}:`, error);
    throw error;
  }
};

// Write cache data with both structures
export const writeCacheWithStructures = async (
  key: string, 
  data: Record<string, any>, 
  options: {
    useFrontendStructure?: boolean;
    useBackendStructure?: boolean;
  } = {}
) => {
 const filePath = options.useFrontendStructure 
    ? await getFrontendStructureFilePath(key) 
    : await getBackendStructureFilePath(key); 


  try {
    const cacheData = {
      ...data,
      lastUpdated: new Date().toISOString(),
      frontendStructure: options.useFrontendStructure ? frontendStructure.getStructure() : undefined,
      backendStructure: options.useBackendStructure ? backendStructure.getStructure() : undefined
    };

    await fs.promises.writeFile(filePath, JSON.stringify(cacheData, null, 2), "utf-8");
    console.log(`Cache written successfully to: ${filePath}`);
    return cacheData;
  } catch (error) {
    console.error(`Error writing cache to ${filePath}:`, error);
    throw error;
  }
};

export type { CacheWriteOptions };
