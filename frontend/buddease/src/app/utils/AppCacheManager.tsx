import { Data } from "../components/models/data/Data";
import { AnalysisTypeEnum } from "../components/projects/DataAnalysisPhase/AnalysisType";
import { Snapshot } from "../components/snapshots/LocalStorageSnapshotStore";
import { useNotification } from "../components/support/NotificationContext";
import { VideoData } from "../components/video/Video";
import FrontendStructure from "../configs/appStructure/FrontendStructureComponent";
import AppCacheManagerExtended from "./AppCacheManagerExtended";
import BackendCacheManager from "./BackendCacheManager";
import FrontendCacheManager from "./FrontendCacheManager";

const { notify } = useNotification();
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

      const existingCache: Record<string, FrontendStructure> =
        this.frontendCacheManager.getCacheData();
      const uniqueConstraints = {
        path: `/src/${key}.tsx`, // Example path, adjust as needed
        content: JSON.stringify(data),
      };
      // Update cache with new data for the specified key

      existingCache[key] = new FrontendStructure(uniqueConstraints);

      // Save the updated cache

      this.frontendCacheManager.updateCache(existingCache);

      return "Frontend Cache updated successfully";
    } catch (error) {
      console.error("Error updating frontend cache:", error);
      return "Error updating frontend cache";
    }
  }

  // Retrieve data from backend cache for a specific key
  getBackendCache(key: string): Promise<Data | null> {
    return new Promise(async (resolve, reject) => {
      try {
        // Fetch data from the backend cache
        const cachedData = await this.backendCacheManager.getCache(key);

        // Check if cachedData is not null and contains the 'data' property
        if (cachedData && "data" in cachedData) {
          resolve(cachedData.data as Data);
        } else {
          resolve(null);
        }
      } catch (error) {
        // Handle errors appropriately
        console.error("Error retrieving backend cache:", error);
        reject(error); // Reject the promise with the error
      }
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
const appCacheManager = new AppCacheManagerExtended(
  "http://localhost:5000",
  notify
);

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
    timestamp: 0,
    tags: [],
    data: {
      then: function <T extends Data>(
        callback: (newData: Snapshot<Snapshot<T, K>>) => void
      ): void {
        // Fetch existing data from backend cache
        appCacheManager.getBackendCache("backendCache").then((cachedData) => {
          if (cachedData !== null) {
            callback(cachedData as Snapshot<Snapshot<T, K>>);
          }
        });
      },
    },
    analysisType: AnalysisTypeEnum.CAUSAL,
    analysisResults: [],
    phase: null,
    videoUrl: "",
    videoThumbnail: "",
    videoDuration: 0,
    videoData: {} as VideoData,
    ideas: [],
  },
};

const frontendData = {
  key: "frontendKey",
  data: "frontendData",
};

await appCacheManager.updateBackendCache(
  backendData.key,
  backendData.data as Data
);
console.log(
  await appCacheManager.updateFrontendCache(
    frontendData.key,
    frontendData.data as unknown as ExtendedData
  )
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
