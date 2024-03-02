import { Data } from "../components/models/data/Data";
import { Snapshot } from "../components/state/stores/SnapshotStore";
import { VideoData } from "../components/video/Video";
import  FrontendStructure  from "../configs/appStructure/FrontendStructureComponent";
import AppCacheManagerExtended from "./AppCacheManagerExtended";
import BackendCacheManager from "./BackendCacheManager";
import FrontendCacheManager from "./FrontendCacheManager";
// Assuming Data has properties like 'property1' and 'property2'
interface ExtendedData extends Data {
  property1: string;
  property2: string;
}

abstract class AppCacheManagerBase<T extends Data> {
  private backendCacheManager: BackendCacheManager;
  private frontendCacheManager: FrontendCacheManager;

  abstract updateCache(key: string, data: T): Promise<void>;

  constructor(baseUrl: string) {
    this.backendCacheManager = new BackendCacheManager(baseUrl);
    this.frontendCacheManager = new FrontendCacheManager();
  }

  // Update frontend cache with data and return a message
  async updateFrontendCache(key: string, data: ExtendedData): Promise<string> {
    try {
      // Fetch existing frontend cache
      const existingCache = this.frontendCacheManager.getCacheData();

      // Update cache with new data for the specified key
      existingCache[key] = {
        path: `/src/${key}.tsx`, // Example path, adjust as needed
        content: JSON.stringify(data),
      };

      // Save the updated cache
      this.frontendCacheManager.updateCache(existingCache);

      return "Frontend Cache updated successfully";
    } catch (error) {
      console.error("Error updating frontend cache:", error);
      return "Error updating frontend cache";
    }
  }

  // Retrieve data from backend cache for a specific key
   async getBackendCache(key: string): Promise<Data | null> {
    return this.backendCacheManager.getCache(key).then((cachedData) => {
      if (cachedData) {
        return cachedData.data;
      }
      return null;
    });
  }

  // Fixing the error in getFrontendCache method
  getFrontendCache(key: string): FrontendStructure | null {
    const frontendCacheData = this.frontendCacheManager.getCacheData();
    const cacheEntry = frontendCacheData[key];
    return cacheEntry ? new FrontendStructure(cacheEntry) : null; // Create a new FrontendStructure object if cacheEntry exists
  }

  // Handling the type error in updateBackendCache method
  async updateBackendCache(key: string, data: Data): Promise<void> {
    await this.backendCacheManager.updateCache(key, { data }); // Assuming data should be wrapped in an object
  }
}

// Example usage
const appCacheManager = new AppCacheManagerExtended("http://localhost:5000");


const backendData: {
  key: string;
  data: ExtendedData;
} = {
  key: "backendKey",
  data: {
    property1: "value1",
    property2: "value2",
    _id: "",
    id: "",
    title: "",
    status: "inProgress",
    isActive: false,
    tags: [],
    then: async function (callback: (newData: Snapshot<Data>) => void): Promise<void> {
      // Fetch existing data from backend cache
      const cachedData = await appCacheManager.getBackendCache('backendCache');
      // Call callback with cached data if available
      if (cachedData !== null) {
        callback(cachedData);
      }
    },
    analysisType: "",
    analysisResults: [],
    phase: null,
    videoUrl: "",
    videoThumbnail: "",
    videoDuration: 0,
    videoData: {} as VideoData,
    ideas: []
  }
}

const frontendData = {
  key: "frontendKey",
  data: "frontendData"
};

await appCacheManager.updateBackendCache(backendData.key, backendData.data as Data);
console.log(
  await appCacheManager.updateFrontendCache(frontendData.key, frontendData.data as unknown as ExtendedData)
);

const retrievedBackendData = await appCacheManager.getBackendCache(
  backendData.key
);
const retrievedFrontendData = appCacheManager.getFrontendCache(
  frontendData.key
);

console.log("Retrieved Backend Data:", retrievedBackendData);
console.log("Retrieved Frontend Data:", retrievedFrontendData);
export default AppCacheManagerBase;
export type { ExtendedData };
