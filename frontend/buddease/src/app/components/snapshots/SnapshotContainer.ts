import { handleApiError } from "./../../api/ApiLogs";
import { AuthenticationHeaders, createAuthenticationHeaders } from "./../../api/headers/authenticationHeaders";
import createCacheHeaders from "./../../api/headers/cacheHeaders";
import createContentHeaders from "./../../api/headers/contentHeaders";
import generateCustomHeaders from "./../../api/headers/customHeaders";
import createRequestHeaders from "./../../api/headers/requestHeaders";
import configData from "./../../configs/configData";
import { AxiosError } from "axios";
import axiosInstance from "../security/csrfToken";
import { Snapshot, SnapshotsArray, SnapshotsObject, SnapshotUnion } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";
import { endpoints } from "@/app/api/endpointConfigurations";
import { Data, BaseData } from "../models/data/Data";
import { handleOtherStatusCodes } from "@/app/api/SnapshotApi";
import { AppConfig, getAppConfig } from "@/app/configs/AppConfig";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SnapshotData, SnapshotRelationships } from "./SnapshotData";
import SnapshotStoreOptions from "../hooks/SnapshotStoreOptions";
import { SnapshotMethods } from "./SnapshotMethods";
import SnapshotComponent from "../libraries/ui/components/SnapshotComponent";


const API_BASE_URL = endpoints.snapshots
// SnapshotContainer.ts
interface SnapshotContainer<T extends Data, K extends Data> extends SnapshotData<T, K>,
SnapshotMethods<T, K>, SnapshotRelationships<T, K>
 {
  id?: string | number | undefined;
  // category: Category
  timestamp: string | number | Date | undefined;
  snapshot: (
    id: string | number | undefined,
    snapshotId: number,
    snapshotData: Map<string, Snapshot<T, K>> | undefined,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<T, K>
  ) => Promise<{
    snapshot: Snapshot<T, K>;
  }>  | Snapshot<T, K>; // Primary or detailed snapshot
  snapshotStore: SnapshotStore<T, K> | null;
  snapshotData: (
    id: string | number | undefined,
    snapshotId: number,
    snapshotData: T,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    dataStoreMethods: DataStore<T, K>
  ) => Promise<SnapshotStore<T, K>>;
  data: T | Map<string, Snapshot<T, K>> | null | undefined;
  snapshotsArray?: SnapshotsArray<T>;
  snapshotsObject?: SnapshotsObject<T>
  
  // New property added for currentCategory
  currentCategory: Category | undefined;
  
  // Updated method to set the current category
  setSnapshotCategory: (newCategory: string | CategoryPropertie) => void;

  // Method to get the current category
  getSnapshotCategory: () => Category | undefined;

  // Add other fields as necessary
}

export const snapshotContainer = <T extends BaseData, K extends BaseData>(
  snapshotId: string,
  storeId: number 
): Promise<SnapshotContainer<T, K>> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Step 1: Initialize the snapshotContainer object
      const snapshotContainer: SnapshotContainer<T, K> = {
        timestamp: undefined,
        currentCategory: undefined, // Assuming this should be initialized
        snapshotData: new Map<string, Snapshot<T, K>>(),
  
        setSnapshotCategory: (category: Category) => {
          snapshotContainer.currentCategory = category;
        },

        getSnapshotCategory: (): Category | undefined => {
          return snapshotContainer.currentCategory;
        },

        getSnapshotData: (): Map<string, Snapshot<T, K>> | null | undefined => {
          return snapshotContainer.snapshotData;
        },

        snapshot: async (
          id: string | number | undefined,
          snapshotId: number,
          snapshotData: Map<string, Snapshot<T, K>> | undefined,
          category: Category,
          categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<T, K>
        ) => {
          // Implement the snapshot logic here
          // This is a placeholder implementation

          const options: SnapshotStoreOptions<T, K> = {
            id: id,
            data: snapshotData,
            metadata: {},
            criteria: {}
          };

          const snapshotStoreConfig: SnapshotStoreConfig<T, K> = {
            snapshots: [], // Assuming you need to initialize it like this
            // Add other necessary properties here
          };

          return {
            snapshot: SnapshotComponent(
              Number(storeId), // Use storeId passed to the function
              options,
              category,
              snapshotStoreConfig, // Pass your constructed config here
              'create'
            )
          }
        },
        snapshotStore: null,
        snapshotData: async (
          id: string,
          storeId: number,
          snapshotData: Map<string, Snapshot<T, K>> | undefined,
          category: Category,
          categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<T, K>
        ) => {
          const options: SnapshotStoreOptions<T, K> = {
            storeId: storeId,
            data: snapshotData ? snapshotData : undefined,
            metadata: {},
            criteria: {}
          };
          return new SnapshotStore<T, K>(storeId, options, category, snapshotStoreConfig, 'create');
        },
        data: null,
        snapshotsArray: undefined,
        snapshotsObject: undefined,
      };

      // Step 2: Prepare headers
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const currentAppVersion = configData.currentAppVersion;

      const authenticationHeaders: AuthenticationHeaders =
        createAuthenticationHeaders(accessToken, userId, currentAppVersion);
      const headersArray = [
        authenticationHeaders,
        createCacheHeaders(),
        createContentHeaders(),
        generateCustomHeaders({}),
        createRequestHeaders(accessToken || ""),
        // Add other header objects as needed
      ];
      const headers = Object.assign({}, ...headersArray);

      // Step 3: Make the API request
      const response = await axiosInstance.get<SnapshotContainer<T, K>>(
        `${API_BASE_URL}/${snapshotId}/container`,
        {
          headers: headers as Record<string, string>,
        }
      );

      if (response.status === 200) {
        // Step 4: Merge the response data into snapshotContainer
        Object.assign(snapshotContainer, response.data);
      } else {
        const appConfig: AppConfig = getAppConfig();
        handleOtherStatusCodes(appConfig, response.status);
        reject(new Error(`Unhandled response status: ${response.status}`));
        return;
      }

      // Step 5: Resolve the Promise with the updated snapshotContainer
      resolve(snapshotContainer);
    } catch (error) {
      const errorMessage = "Failed to get snapshot container";
      handleApiError(error as AxiosError<unknown>, errorMessage);
      reject(error);
    }
  });
};

export type { SnapshotContainer }