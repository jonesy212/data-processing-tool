import { Subscription } from 'react-redux';
// snapshotStoreConfigInstance.ts
import { fetchCategoryByName } from "@/app/api/CategoryApi";
import { endpoints } from "@/app/api/endpointConfigurations";
import * as snapshotApi from '@/app/api/SnapshotApi';
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { NotificationType, NotificationTypeEnum } from "@/context/NotificationContext";
import { Payload, UpdateSnapshotPayload } from "@/server/database/Payload";
import { CustomSnapshotData, SnapshotData, SnapshotStoreProps, SnapshotWithCriteria } from ".";
import { CreateSnapshotStoresPayload } from "../../../server/database/Payload";
import { CalendarEvent } from "../calendar/CalendarEvent";
import { ModifiedDate } from "../documents/DocType";
import { FileCategory } from "../documents/FileType";
import { SnapshotManager, useSnapshotManager } from "../hooks/useSnapshotManager";
import determineFileCategory, { fetchFileSnapshotData } from "../libraries/categories/determineFileCategory";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data } from "../models/data/Data";
import { K, T } from "../models/data/dataStoreMethods";
import { NotificationPosition, StatusType } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { getCommunityEngagement, getMarketUpdates, getTradeExecutions } from "../trading/TradingUtils";
import { AuditRecord, Subscriber } from "../users/Subscriber";
import { portfolioUpdates, triggerIncentives } from "../utils/applicationUtils";
import { generateSnapshotId } from "../utils/snapshotUtils";
import { ExtendedVersionData } from "../versions/VersionData";
import { FetchSnapshotPayload } from "./FetchSnapshotPayload";
import { Snapshots, SnapshotsArray, SnapshotUnion, } from "./LocalStorageSnapshotStore";
import { transformDelegate, transformSubscriber } from "./methods/transformMethods";
import { Snapshot, snapshotConfig } from "./Snapshot";
import { SnapshotContainer } from "./SnapshotContainer";
import { SnapshotStoreReference } from "./SnapshotStoreReference";

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { fetchData } from "../../../data_analysis/frontend/buddease/src/app/api/ApiData";
import { Meta } from "../../../data_analysis/frontend/buddease/src/app/components/models/data/dataStoreMethods";
import { DataStoreMethods } from "../../../data_analysis/frontend/buddease/src/app/components/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { ExcludedFields } from '../../../data_analysis/frontend/buddease/src/app/components/routing/Fields';
import { storeId } from "../../../data_analysis/frontend/buddease/src/app/components/utils/snapshotUtils";
import { SnapshotEvent } from '../../../data_analysis/frontend/buddease/src/app/typings/eventTypes';
import { ConfigureSnapshotStorePayload, SnapshotConfig } from "./SnapshotConfig";
import { SnapshotConfigParams } from "./SnapshotConfigBuilder";
import { batchFetchSnapshotsFailure, batchFetchSnapshotsSuccess, batchTakeSnapshot, batchTakeSnapshotsRequest, batchUpdateSnapshotsFailure, batchUpdateSnapshotsRequest, batchUpdateSnapshotsSuccess, handleSnapshotSuccess } from "./snapshotHandlers";
import SnapshotList, { SnapshotItem } from "./SnapshotList";
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { storeProps } from "./SnapshotStoreProps";
import SnapshotStoreSubset from "./SnapshotStoreSubset";
import { subscribeToSnapshotImpl } from "./subscribeToSnapshotsImplementation";


function createSnapshotStoreConfig<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  options: Omit<SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>, 'tempData'>
): SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> {
  return {
    ...options,
    tempData: undefined, // Default value for tempData, which can be set dynamically
    // Ensure all required properties are set
    createdAt: options.createdAt || new Date(),
    updatedAt: options.updatedAt || new Date(),
    metadata: options.metadata || {} as Meta,
    snapshots: options.snapshots || [] as SnapshotsArray<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>, // Use array, not Map
    subscribers: options.subscribers || [] as SubscriberCollection<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[] // Use array, not Map
  };
}


// When calling the function, provide all required type parameters
// Helper types for consistency
// Create consistent helper types
type AppEntity = BaseDataEntity;
type AppK = AppEntity;
type AppMeta = DefaultMeta<AppEntity, AppK>;
type AppExcludedFields = DefaultExcludedFields<AppEntity>;

// Core snapshot types
type AppSnapshot = Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;
type AppSnapshotData = SnapshotData<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;
type AppSnapshotStore = SnapshotStore<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;
type AppSnapshotWithCriteria = SnapshotWithCriteria<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;
type AppSubscriberCollection = SubscriberCollection<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;
type AppRealtimeDataItem = RealtimeDataItem<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;

// Configuration types
type AppSnapshotStoreConfig = SnapshotStoreConfig<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;
type AppSnapshotsArray = SnapshotsArray<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;

// PARAMS
type AppParams = SnapshotConfigParams<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;

type SnapshotFromParams<Params extends SnapshotConfigParams<any, any, any, any>> =
  Snapshot<Params[0], Params[1], Params[2], Params[3]>;

type SnapshotUnionFromParams<Params extends SnapshotConfigParams<any, any, any, any>> =
  SnapshotUnion<Params[0], Params[1], Params[2], Params[3]>;


// Consistent usage throughout
const snapshotStoreConfigInstance = createSnapshotStoreConfig<
  AppEntity,
  AppEntity,
  AppMeta,
  AppExcludedFields
>({
  id: null,
  snapshotId: "snapshot1",
  key: "key1",
  priority: "active",
  topic: "topic1",
  status: StatusType.Inactive,
  category: "category1",
  timestamp: new Date(),
  state: null,
  snapshots: [],
  subscribers: [],
  subscription: null,
  initialState: null,
  clearSnapshots: null,
  isCompressed: false,
  expirationDate: new Date(),
  //
  tags: [
    //   tagName: "tag1",
    //   attribs: {},
    //   id: '',
    //   name: '',
    //   color: '',
    //   relatedTags: []
    // 
  ],
  metadata: {
    creator: "admin",
    environment: "production",
  },
  configOption: {
    id: null,
    snapshotId: "snapshot1",
    subscribers: [],
    onSnapshots: null,
    clearSnapshots: null,
    key: "",
    configOption: null,
    subscription: null,
    initialState: null,
    category: "",
    timestamp: new Date(),
    set: (data: any, type: string, event: Event) => {
      console.log(`Event type: ${type}`);
      console.log("Event:", event);
      return null;
    },
    data: null,
    store: null,
    state: null,
    snapshots: [],

    // Your configuration with consistent types
    handleSnapshot: (
      id: string | number,
      snapshotId: string | null,
      snapshot: AppSnapshot | null,
      snapshotData: SnapshotData<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
      category: Category | undefined,
      callback: (snapshot: AppEntity) => void,
      snapshots: AppSnapshotsArray,
      type: string,
      event: SnapshotEvent<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
      snapshotContainer?: AppEntity,
      snapshotStoreConfig?: AppSnapshotStoreConfig | null
    ): Promise<AppSnapshot | null> => {

      return new Promise((resolve, reject) => {
        try {
          // Log event type and details
          console.log(`Event type: ${type}`);
          console.log("Event:", event);

          // Check if the snapshot already exists
          if (snapshot) {
            console.log(`Handling existing snapshot with ID: ${snapshotId}`, snapshot);

            // Optionally, process or update the existing snapshot
            if (snapshotContainer) {
              // Assuming snapshotContainer might be used to update or merge with the existing snapshot
              console.log("Merging snapshot with container", snapshotContainer);
              Object.assign(snapshot, snapshotContainer);
            }

            // Callback with the existing snapshot
            callback(snapshot);

            // Resolve with the updated snapshot
            resolve({
              ...snapshot,
              snapshotStoreConfig: snapshotStoreConfig || snapshot.snapshotStoreConfig,
            } as Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>);
          } else {
            console.log(`Creating a new snapshot with ID: ${snapshotId}`);


            if (!snapshot) {
              throw new Error("Invalid snapshot provided");
            }

            // Create a new snapshot based on the provided snapshotData
            const newSnapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> = {
              id: id,
              data: snapshotData,
              category: category || "default",
              createdAt: new Date().toISOString(),
              snapshotStoreConfig: snapshotStoreConfig,
              versionInfo: {} as ExtendedVersionData,

              getSnapshotItems: () => [],
              defaultSubscribeToSnapshots: () => {
                // Implement the logic for defaultSubscribeToSnapshots
              },
              transformSubscriber: (subscriberId: string, sub: Subscriber<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => {
                // Implement the logic for transformSubscriber
                return sub
              },
              transformDelegate: snapshot.transformDelegate
              // Add any other properties needed for your Snapshot
            };

            // If there's a snapshot store config, we may need to save the snapshot to the store
            if (snapshotStoreConfig) {
              console.log("Using snapshot store config", snapshotStoreConfig);

              // Optionally, add the new snapshot to the snapshot store
              snapshots.push(newSnapshot);
            }

            // Callback with the new snapshot
            callback(snapshotData);

            // Resolve with the new snapshot
            resolve(newSnapshot);
          }
        } catch (error) {
          console.error("Error handling snapshot:", error);
          reject(error);
        }
      });
    },

    onInitialize: () => {
      console.log("Snapshot store initialized.");
      return null;
    },
    onError: (error: any) => {
      console.error("Error in snapshot store:", error);
    },

    createSnapshot: (
      id: string | number | undefined,
      snapshotData: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
      category?: Category,
      categoryProperties?: CategoryProperties,
      callback?: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => void,
      dataStore?: DataStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
      dataStoreMethods?: DataStoreMethods<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
      metadata?: UnifiedMetadata<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
      subscriberId?: string,
      endpointCategory?: string | number,
      storeProps?: SnapshotStoreProps<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
      snapshotConfigData?: SnapshotConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
      subscription?: Subscription<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
      snapshotId?: string | number | null,
      snapshotStoreConfig?: SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null,
      snapshotContainer?: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null,
      snapshotStoreConfigSearch?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, any>
    ): Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null => {

      // Log the creation process
      console.log(`🔄 Creating snapshot with ID: ${id}`);
      console.log(`📁 Category: ${category ? String(category) : 'undefined'}`);
      console.log(`📊 Category Properties:`, categoryProperties);

      // Log additional details if available
      if (snapshotData) {
        console.log(`💾 Snapshot data provided:`, {
          storeId: snapshotData.storeId,
          name: snapshotData.name,
          snapshotCount: snapshotData.snapshots?.length || 0
        });
      }

      if (snapshotStoreConfig) {
        console.log(`⚙️  Snapshot store config provided`);
      }

      // Start performance tracking
      const startTime = performance.now();

      try {
        // Your snapshot creation logic here
        const newSnapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> = {
          id,
          category,
          timestamp: new Date(),
          // ... other snapshot properties
        } as unknown as Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>;

        // Log successful creation
        const endTime = performance.now();
        console.log(`✅ Successfully created snapshot: ${id}`);
        console.log(`⏱️  Creation time: ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`📦 Snapshot details:`, {
          id: newSnapshot.id,
          category: newSnapshot.category,
          timestamp: newSnapshot.timestamp
        });

        // Execute callback if provided
        if (callback) {
          console.log(`📞 Executing callback for snapshot: ${id}`);
          callback(newSnapshot);
        }

        return newSnapshot;

      } catch (error) {
        // Log error details
        console.error(`❌ Failed to create snapshot: ${id}`);
        console.error(`📛 Error:`, error);
        console.error(`🔍 Error details:`, {
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined
        });

        return null;
      }
    },
  },

  async createSnapshotStores(
    id: string,
    snapshotId: string,
    snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>, // ✅ FIXED
    snapshotManager: SnapshotManager<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    payload: CreateSnapshotStoresPayload<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    callback: (snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]) => void | null,
    snapshotStoreData?: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[], // ✅ FIXED
    category?: Category,
    snapshotDataConfig?: SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]
  ): Promise<{
    snapshotStores?: SnapshotStoreReference<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[] | Map<number, SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>,
    storeConfigs: SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[],
    category?: string | symbol | Category
  }> {
    console.log(`Creating snapshot stores with ID: ${id} in category: ${String(category)}`, snapshotDataConfig);

    // Example logic to create snapshot stores
    const newSnapshotStores: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[] =
      snapshotStoreData ?? [];

    // Perform additional operations as required

    // Invoke callback if provided
    if (callback) {
      callback(newSnapshotStores);
    }

    return {
      snapshotStores: new Map<number, SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>(),
      storeConfigs: snapshotDataConfig ?? [],
      category
    };
  },
  
  // Alternate createSnapshotStores definition
  createSnapshotStoresAlternate: (
    id: string,
    snapshotStoresData: SnapshotStore<any, any>[], // Use Snapshot instead of Map
    category: Category | undefined, callback: (snapshotStores: SnapshotStore<any, any>[]) => void,
    snapshotDataConfig?: SnapshotStoreConfig<any, any>[] // Adjust as per your definition
  ): SnapshotStore<any, any>[] | null => {
    console.log(`Creating snapshot with ID: ${id} in category: ${category}`, snapshotDataConfig);

    // Call the callback function with the snapshotStoresData
    callback(snapshotStoresData);

    // Return the array of SnapshotStore objects
    return snapshotStoresData;
  },



  createSnapshotStore: async (
    id: string,
    storeId: number,
    snapshotStoreData: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[], // Array of Snapshotstore objects
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback?: (snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => void,
    snapshotDataConfig?: SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[] // Array of SnapshotStoreConfig objects
  ): Promise<SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null> => {
    console.log(
      `Creating snapshot with ID: ${id} in category: ${String(category)}`,
      snapshotDataConfig
    );

    // fetch snapshotId
    const snapshotId = snapshotDataConfig?.[0]?.snapshotId ?? "defaultSnapshotId";

    // ✅ Construct a new SnapshotStore
    const snapshotStore = new SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>({
      storeId,
      name: "defaultName", // 🔹 required if your constructor enforces it
      version: "1.0.0",    // 🔹 same here
      schema: {},          // 🔹 must match SnapshotStoreProps
      options: {},         // 🔹 must match SnapshotStoreProps
      category,
      config: snapshotDataConfig?.[0],
      snapshots: snapshotStoreData,
      snapshotId,
      storeProps: snapshotStoreData, // only if `storeProps` is part of SnapshotStoreProps
    });

    if (callback) callback(snapshotStore);

    return snapshotStore;
  },

  configureSnapshotStore: async (
    currentSnapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>, // Snapshot here
    snapshotId: string,
    data: Map<string, Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>,
    events: Record<string, CalendarManagerStoreClass<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    newSnapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    payload: ConfigureSnapshotStorePayload<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    store: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,  // just one
    callback?: (store: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => void
  ): Promise<{
    currentSnapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>;
    storeConfig: SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>;
    updatedSnapshot?: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>;
  }> => {
    console.log("Configuring snapshot store:", currentSnapshotStore, "with ID:", snapshotId);

    // Do your logic: update store or apply new snapshot
    const updatedSnapshot = newSnapshot; // placeholder logic

    const storeConfig: SnapshotStoreConfig<
      AppParams[0],
      AppParams[1],
      AppParams[2],
      AppParams[3]
    > = {
      // provide required fields
    } as any;

    if (callback) callback(currentSnapshotStore);

    return {
      currentSnapshotStore, // ✅ now returning the actual store, matches type
      storeConfig,
      updatedSnapshot, // optional new snapshot
    };
  },

  batchTakeSnapshot: async (
    snapshotId: string,
    snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
  ) => {
    console.log("Batch taking snapshots:", snapshotId, snapshotStore, snapshots);
    return { snapshots };
  },

  onSnapshot: (
    snapshotId: string,
    snapshot: Snapshot<any, any>,
    type: string, 
    event: SnapshotEvent<T, K, Meta, ExcludedFields>,
    callback: (snapshot: Snapshot<any, any>

    ) => void) => {
    console.log("id:", snapshotId, "Snapshot taken:", snapshot, "Type:", type, "Event:", event);
  },

  initSnapshot: (
    snapshot: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null,
    snapshotId: string | number | null,
    snapshotData: SnapshotData<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    snapshotConfig: SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    callback: (snapshotStore: SnapshotStore<any, any>) => void,
    snapshotStoreConfig: SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    snapshotStoreConfigSearch: SnapshotStoreConfig<
      SnapshotWithCriteria<any, K>,
      K
    >
  ) => {
    console.log(
      `Initializing snapshot with ID: ${snapshotId} in category: ${category}`,
      snapshotDataConfig
    );
    return { snapshot };
  },

  clearSnapshot: () => {
    console.log("Clearing snapshot.");
  },

  updateSnapshot: async (
    snapshotId: string,
    data: Map<string, Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>,
    events: Record<string, CalendarManagerStoreClass<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]>,
    snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    newData: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, any>
  ) => {
    console.log(
      `Updating snapshot with ID: ${snapshotId}`,
      newData,
      payload
    );
    return { snapshot: newData };
  },
  getSnapshots: async (
    category: symbol | string | Category | undefined,
    snapshots: SnapshotsArray<T, K, Meta>
  ) => {
    console.log(`Getting snapshots in category: ${String(category)}`, snapshots);
    return { snapshots };
  },

  takeSnapshot: async (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => {
    console.log("Taking snapshot:", snapshot);
    return { snapshot: snapshot }; // Adjust according to your snapshot logic
  },

  addSnapshot: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => {
    console.log("Adding snapshot:", snapshot);
  },

  getSubscribers: async (
    subscribers: Record<string, Subscriber<any, any>[]>,
    snapshots: Snapshots<AppEntity>
  ) => {
    console.log("Getting subscribers:", subscribers, snapshots);
    return { subscribers, snapshots };
  },

  // Implementing the snapshot function
  snapshot: async (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null) => void,
    dataStore: DataStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    dataStoreMethods: DataStoreMethods<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    metadata: UnifiedMetadata<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number,// Add endpointCategory here
    storeProps: SnapshotStoreProps<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    snapshotConfigData: SnapshotConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    snapshotStoreConfigData?: SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    snapshotContainer?: SnapshotContainer<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null,

  ) => {
    try {
      let resolvedCategory: CategoryProperties | undefined;

      if (typeof category === "string") {
        resolvedCategory = await fetchCategoryByName(category);
      } else {
        resolvedCategory = category;
      }

      if (!resolvedCategory || !snapshotConfigData) {
        // Always return a correctly typed object, even if null
        return { 
          snapshot: null, 
          snapshotData: snapshotData || {} as SnapshotData<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
        };
      }

      // Call createSnapshot on the config
      await snapshotConfigData.createSnapshot(
         id,
        snapshotData,
        resolvedCategory,
        categoryProperties,
        callback,
        dataStore,
        dataStoreMethods,
        metadata,
        subscriberId,
        endpointCategory,
        storeProps,
        snapshotConfigData,
        subscription,
        snapshotId,
        snapshotStoreConfigData,
        snapshotContainer
      );

      // Get snapshot from config
      const { snapshotStore: newSnapshot } = await snapshotConfigData.snapshot(
        id,
        snapshotId,
        snapshotData,
        resolvedCategory,
        categoryProperties,
        callback
      );

      return {
        snapshot: newSnapshot || null,
        snapshotData: snapshotData!
      };

    } catch (error) {
      console.error("Error creating snapshot:", error);
      return { snapshot: null, snapshotData: snapshotData! };
    }
  },

  setSnapshot: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => {
    return Promise.resolve({ snapshot });
  },

  createSnapshot: (
    id: string,
    snapshotData: SnapshotData<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
          callback?: (snapshot: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>) => void,
          snapshotStore?: SnapshotStore<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>,
          snapshotStoreConfig?: SnapshotStoreConfig<Data, K> | null,
          snapshotStoreConfigSearch?: SnapshotStoreConfig<
            SnapshotWithCriteria<any, BaseData>, K>
  ): Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null => {
    console.log(
      `Creating snapshot with ID: ${id} in category: ${category}`,
      snapshotData
    );

    // Return a Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> object
    return {
      id,
      data: snapshotData, // Ensure snapshotData is of type Data
      category,
      timestamp: new Date(),
      dataItems: [],
      newData: snapshotData,
      // store: snapshotStore,
      // // unsubscribe: unsubscribe,
      // getSnapshotId: getSnapshotId,
      // compareSnapshotState: compareSnapshotState,
      // snapshot: snapshot,
      // snapshotStore: snapshotStore,
      // handleSnapshot: handleSnapshot,
      // unsubscribe: unsubscribe,
      // events: {
      //   eventRecords,
      //   callbacks: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => {
      //     return {
      //       snapshot: snapshot,
      //       events: snapshot.meta.events,
      //       callbacks: snapshot.meta.callbacks,
      //       subscribers: snapshot.store.subscribers,
      //       eventIds: snapshot.meta.eventIds
      //     };
      //   },
      //   subscribers: [],
      //   eventIds: []
      // },
      // meta: meta,
      // fetchSnapshot: () => Promise.resolve(snapshotData),
      // other properties if any
    };
  },

  createSnapshotSuccess: (): Promise<void> => {
    return Promise.resolve();
  },

  createSnapshotFailure: async (
    snapshotId: string,
    snapshotManager: SnapshotManager<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    payload: { error: Error; }
  ) => {
    // const snapshotManager = await useSnapshotManager();
    const snapshotStore: SnapshotStore<BaseData, K>[] =
      snapshotManager.state as SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[];

    if (snapshotStore && snapshotStore.length > 0) {
      const generatedSnapshotId = generateSnapshotId; // Assuming generateSnapshotId returns a string

      const config = {} as SnapshotStoreConfig<T, K, Meta, ExcludedFields>[]; // Placeholder for config
      const configOption = {} as SnapshotStoreConfig<T, K, Meta, ExcludedFields>; // Placeholder for configOption

      // Example: Transforming snapshot.data (Map<string, Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>) to initialState (SnapshotStore<BaseData, K> | Snapshot<BaseData>)
      const initialState: SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> = {

        id: generatedSnapshotId,
        key: "key",
        topic: "topic",
        date: new Date(),
        timestamp: new Date().getTime(),
        message: "message",
        category: "category",
        data: snapshot.data,
        configOption: configOption,
        config: config,
        subscription: {
          unsubscribe: (unsubscribeDetails:
            {
              userId: string;
              snapshotId: string;
              unsubscribeType: string;
              unsubscribeDate: Date;
              unsubscribeReason: string;
              unsubscribeData: any;
            }
          ) => {
            // 1. Validate the unsubscribeDetails
            if (
              !unsubscribeDetails.userId ||
              !unsubscribeDetails.snapshotId ||
              !unsubscribeDetails.unsubscribeType ||
              !unsubscribeDetails.unsubscribeDate ||
              !unsubscribeDetails.unsubscribeReason
            ) {
              throw new Error("Invalid unsubscribe details: missing required fields.");
            }

            // 2. Check if the unsubscribeDetails match some existing subscription
            // Example: Let's assume you have a method to get the subscription based on snapshotId and userId
            const existingSubscription = getSubscription(
              unsubscribeDetails.userId,
              unsubscribeDetails.snapshotId
            );

            if (!existingSubscription) {
              throw new Error("No matching subscription found.");
            }

            // 3. Perform the unsubscribe action
            // Example: Let's assume you have a method to remove the subscription
            removeSubscription(
              unsubscribeDetails.userId,
              unsubscribeDetails.snapshotId
            );

            // 4. Log the unsubscribe action (optional)
            console.log(`Unsubscribed user ${unsubscribeDetails.userId} from snapshot ${unsubscribeDetails.snapshotId} on ${unsubscribeDetails.unsubscribeDate}. Reason: ${unsubscribeDetails.unsubscribeReason}`);

            // 5. Return a success message or result
            return {
              success: true,
              message: `Successfully unsubscribed user ${unsubscribeDetails.userId}.`,
            };
          },
          portfolioUpdates: portfolioUpdates,
          tradeExecutions: getTradeExecutions,
          marketUpdates: getMarketUpdates,
          triggerIncentives: triggerIncentives,
          communityEngagement: getCommunityEngagement,
          portfolioUpdatesLastUpdated: {
            value: new Date(),
            isModified: false,
          } as ModifiedDate,
          determineCategory: determineFileCategory,
        },

        setSnapshotData(
          data: Map<string, Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>,
          subscribers: Subscriber<any, any>[],
          snapshotData: Partial<SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>
        ) {
          const self = this as SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>;

          if (data) {
            if (data.id) {
              self.id = data.id as string; // Ensure data.id is of type string
            }
            if (data.timestamp) {
              self.timestamp = data.timestamp;
            }
            if (data.data) {
              self.data = { ...self.data, ...data.data };
            }
            // Notify subscribers or trigger updates if necessary
            self.notifySubscribers(subscribers, data);
          }
        },
        title: "defaultTitle", // Example placeholder
        type: "defaultType", // Example placeholder
        subscribeToSnapshots: (
          snapshotId: string,
          callback: (snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null,
          snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null = null
        ) => { },
        snapshotId: "",
        createdBy: "",
        subscribers: [],
        set: undefined,
        state: null,
        store: null,
        snapshots: [],
        snapshotConfig: [],
        initialState: undefined,
        dataStore: undefined,
        dataStoreMethods: {} as DataStoreWithSnapshotMethods<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>,
        delegate: [],
        subscriberId: "",
        length: 0,
        content: "",
        value: 0,
        todoSnapshotId: "",
        events: undefined,
        snapshotStore: null,
        dataItems: [],
        newData: undefined,
        subscribeToSnapshot: subscribeToSnapshotImpl,
        transformSubscriber: transformSubscriber,
        transformDelegate: transformDelegate,
        initializedState: undefined,
        getAllKeys: function (): Promise<string[]> {
          throw new Error("Function not implemented.");
        },
        getAllItems: function (): Promise<BaseData[]> {
          throw new Error("Function not implemented.");
        },
        addData: function (data: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>): void {
          throw new Error("Function not implemented.");
        },
        addDataStatus: function (
          id: number,
          status: "completed" | "pending" | "inProgress"
        ): void {
          throw new Error("Function not implemented.");
        },
        removeData: function (id: number): void {
          throw new Error("Function not implemented.");
        },
        updateData: function (id: number, newData: BaseData): void {
          throw new Error("Function not implemented.");
        },
        updateDataTitle: function (id: number, title: string): void {
          throw new Error("Function not implemented.");
        },
        updateDataDescription: function (
          id: number,
          description: string
        ): void {
          throw new Error("Function not implemented.");
        },
        updateDataStatus: function (
          id: number,
          status: "completed" | "pending" | "inProgress"
        ): void {
          throw new Error("Function not implemented.");
        },
        addDataSuccess: function (payload: { data: BaseData[] }): void {
          throw new Error("Function not implemented.");
        },
        getDataVersions: function (
          id: number
        ): Promise<BaseData[] | undefined> {
          throw new Error("Function not implemented.");
        },
        updateDataVersions: function (
          id: number,
          versions: BaseData[]
        ): void {
          throw new Error("Function not implemented.");
        },
        getBackendVersion: function (): Promise<string | undefined> {
          throw new Error("Function not implemented.");
        },
        getFrontendVersion: function (): Promise<string | undefined> {
          throw new Error("Function not implemented.");
        },
        fetchData: function (
          id: number
        ): Promise<SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]> {
          throw new Error("Function not implemented.");
        },
        snapshot: undefined,
        removeItem: function (key: string): Promise<void> {
          throw new Error("Function not implemented.");
        },
        getSnapshot: function (
          snapshot: (id: string) =>
            | Promise<{
              category: any;
              timestamp: any;
              id: any;
              snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>;
              snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>;
              data: BaseData;
            }>
            | undefined
        ): Promise<SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>> {
          throw new Error("Function not implemented.");
        },
        getSnapshotSuccess: this.getSnapshotSuccess,

        getSnapshotId: async function (
          key: SnapshotData<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
        ): Promise<string> {
          return initialState.getSnapshot(key).then((snapshot) => {
            // Check if snapshot.data is not null and is of type T
            if (snapshot.data && typeof snapshot.data !== 'object' && !Array.isArray(snapshot.data)) {
              return snapshot.data.id; // Assuming T has an id property
            }

            // Handle the case where data is a Map
            if (snapshot.data instanceof Map) {
              // Assuming you want to extract the id from the first Snapshot in the Map
              const firstSnapshot = Array.from(snapshot.data.values())[0];
              if (firstSnapshot) {
                return firstSnapshot.id; // Assuming Snapshot has an id property
              }
            }

            throw new Error("Snapshot data is invalid or does not contain an id.");
          });
        },

        getItem: function (key: string): Promise<BaseData | undefined> {
          throw new Error("Function not implemented.");
        },
        setItem: function (key: string, value: BaseData): Promise<void> {
          throw new Error("Function not implemented.");
        },
        addSnapshotFailure: function (date: Date, error: Error): void {
          throw new Error("Function not implemented.");
        },
        getDataStore: function (): Map<string, Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>> {
          throw new Error("Function not implemented.");
        },
        addSnapshotSuccess: function (
          snapshot: T,
          subscribers: SubscriberCollection<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
        ): void {
          throw new Error("Function not implemented.");
        },
        compareSnapshotState: function (
          stateA:
            | Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
            | Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]
            | null
            | undefined,
          stateB: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null | undefined
        ): boolean {
          throw new Error("Function not implemented.");
        },
        deepCompare: function (objA: any, objB: any): boolean {
          throw new Error("Function not implemented.");
        },
        shallowCompare: function (objA: any, objB: any): boolean {
          throw new Error("Function not implemented.");
        },
        getDataStoreMethods: function () {
          throw new Error("Function not implemented.");
        },
        getDelegate: function (
          context: {
            useSimulatedDataSource: boolean;
            simulatedDataSource: SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[];
          }
        ): SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[] {
          throw new Error("Function not implemented.");
        },
        determineCategory: function (
          snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null | undefined
        ): string {
          throw new Error("Function not implemented.");
        },
        determinePrefix: function <T extends BaseDataEntity>(
          snapshot: T | null | undefined,
          category: string
        ): string {
          throw new Error("Function not implemented.");
        },
        updateSnapshot: function (
          snapshotId: string,
          data: Map<string, Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>,
          events: Record<string, CalendarManagerStoreClass<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]>,
          snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
          dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
          newData: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
          payload: UpdateSnapshotPayload<BaseData>,
          store: any
        ): Promise<{ snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> }> {
          throw new Error("Function not implemented.");
        },
        updateSnapshotSuccess: function (): void {
          throw new Error("Function not implemented.");
        },
        updateSnapshotFailure: function (payload: { error: string }): void {
          throw new Error("Function not implemented.");
        },
        removeSnapshot: function (snapshotToRemove: any): void {
          throw new Error("Function not implemented.");
        },
        clearSnapshots: function (): void {
          throw new Error("Function not implemented.");
        },
        addSnapshot: function (
          snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
          snapshotId: string,
          subscribers: Subscriber<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>[]
        ): Promise<void> {
          throw new Error("Function not implemented.");
        },
        createSnapshot: function (
          id: string,
          snapshotData: SnapshotData<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
          snapshoConfigtData: SnapshotStoreConfig<any, BaseData>,
          category: string
        ): Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> {
          throw new Error("Function not implemented.");
        },
        createSnapshotSuccess: function (
          snapshotId: string,
          snapshotManager: SnapshotManager<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
          snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
          payload: { error: Error; }
        ): void {
          throw new Error("Function not implemented.");
        },
        setSnapshotSuccess: function (
          snapshotData: any,
          subscribers: ((data: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => void)[]
        ): void {
          throw new Error("Function not implemented.");
        },
        setSnapshotFailure: function (error: Error): void {
          throw new Error("Function not implemented.");
        },
        createSnapshotFailure: function (
          snapshotId: string,
          snapshotManager: SnapshotManager<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
          snapshot: Snapshot<any, any>,
        ): void {
          throw new Error("Function not implemented.");
        },
        updateSnapshots: function (): void {
          throw new Error("Function not implemented.");
        },
        updateSnapshotsSuccess: function (
          snapshotData: (
            subscribers: Subscriber<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>[],
            snapshot: Snapshots<AppEntity>
          ) => void
        ): void {
          throw new Error("Function not implemented.");
        },
        updateSnapshotsFailure: function (error: Payload): void {
          throw new Error("Function not implemented.");
        },
        initSnapshot: function (
          snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null,
          snapshotId: string | null,
          snapshotData: SnapshotData<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
          category: Category | undefined,
          snapshotConfig: SnapshotStoreConfig<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>,
          callback: (snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => void
        ): void {
          throw new Error("Function not implemented.");
        },
        takeSnapshot: function (
          snapshot: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>, // ← Updated
          subscribers: Subscriber<AppParams[0], AppParams[1]>[] // ← Added proper type
        ): Promise<{ snapshot: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> }> {
          throw new Error("Function not implemented.");
        },
        takeSnapshotSuccess: function (
          snapshot: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
        ): void {
          throw new Error("Function not implemented.");
        },
        takeSnapshotsSuccess: function (snapshots: BaseData[]): void {
          throw new Error("Function not implemented.");
        },
        configureSnapshotStore: function (
          snapshot: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
        ): Promise<{
          snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>;
          storeConfig: SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>;
          updatedStore?: any;
        }> {
          throw new Error("Function not implemented.");
        },
        getData: function (
          data: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
            | SnapshotStore<CustomSnapshotData<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>, AppEntity, AppMeta, AppExcludedFields>
        ): Promise<{
          data: Snapshot<CustomSnapshotData<AppEntity, AppMeta, AppExcludedFields>, AppEntity, AppMeta, AppExcludedFields> | Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]; // ← Updated
          getDelegate: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>; // ← Updated
        }> {
          throw new Error("Function not implemented.");
        },
        flatMap: function <U>(
          callback: (
            snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
            index: number,
            array: (Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>)[]
          ) => U
        ): U[] | void {
          // Sample implementation: applying callback over an array of snapshots
          const snapshotsArray: (Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>)[] = [
            // Populate with actual Snapshot and SnapshotStoreConfig instances
          ];
          return snapshotsArray.map((snapshot, index) => callback(snapshot, index, snapshotsArray));
        },
        setData: function (
          data: AppParams[0],
          dataMap: Map<string, Snapshot<SnapshotUnion<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>, AppParams[1], AppParams[2], AppParams[3]>>
        ): void {
          throw new Error("Function not implemented.");
        },
        getState: function () {
          throw new Error("Function not implemented.");
        },
        setState: function (state: any): void {
          throw new Error("Function not implemented.");
        },
        validateSnapshot: function (
          snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
        ): boolean {
          throw new Error("Function not implemented.");
        },
        handleSnapshot: function (
          id: string,
          snapshotId: string,
          snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null,
          snapshotData: SnapshotData<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
          category: Category | undefined,
          callback: (snapshot: AppEntity) => void,
          snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
          type: string,
          event: SnapshotEvent<T, K, Meta, ExcludedFields>,
          snapshotContainer?: AppEntity,
          snapshotStoreConfig?: SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,

        ): Promise<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>> {
          throw new Error("Function not implemented.");
        },
        handleActions: function (): void {
          throw new Error("Function not implemented.");
        },
        setSnapshot: function (
          snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
        ): void {
          throw new Error("Function not implemented.");
        },
        transformSnapshotConfig: function <T extends BaseDataEntity>(
          config: SnapshotStoreConfig<BaseData, T>
        ): SnapshotStoreConfig<BaseData, T> {
          throw new Error("Function not implemented.");
        },
        setSnapshots: function (
          snapshots: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]
        ): void {
          throw new Error("Function not implemented.");
        },
        clearSnapshot: function (): void {
          throw new Error("Function not implemented.");
        },
        mergeSnapshots: function (snapshots: BaseData[]): void {
          throw new Error("Function not implemented.");
        },
        reduceSnapshots: <U>(callback: (
          acc: U,
          snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
        ) => U): U => {
          throw new Error("Function not implemented.");
        },
        sortSnapshots: function (): void {
          throw new Error("Function not implemented.");
        },
        filterSnapshots: function (predicate: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => boolean): Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> {
          throw new Error("Function not implemented.");
        },
        mapSnapshots: function (
          storeIds: number[],
          snapshotId: string,
          category: Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
          timestamp: string | number | Date | undefined,
          type: string,
          event: SnapshotEvent<T, K, Meta, ExcludedFields>,
          id: number,
          snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
          data: AppEntity
        ): Promise<SnapshotsArray<AppEntity>> {
          throw new Error("Function not implemented.");
        },
        findSnapshot: function (predicate: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => boolean): Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> {
          throw new Error("Function not implemented.");
        },
        getSubscribers: function (
          subscribers: Subscriber<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>[],
          snapshots: Snapshots<AppEntity>
        ): Promise<{
          subscribers: Subscriber<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>[];
          snapshots: Snapshots<AppEntity>;
        }> {
          throw new Error("Function not implemented.");
        },
        notify: function (
          id: string,
          message: string,
          content: any,
          date: Date,
          type: NotificationType,
          notificationPosition?: NotificationPosition | undefined
        ): void {
          throw new Error("Function not implemented.");
        },
        notifySubscribers: function (
          subscribers: Subscriber<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>[],
          data: Partial<SnapshotStoreConfig<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>>
        ): Subscriber<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>[] {
          throw new Error("Function not implemented.");
        },
        subscribe: function (): void {
          throw new Error("Function not implemented.");
        },
        unsubscribe: function (): void {
          throw new Error("Function not implemented.");
        },
        fetchSnapshot: function (
          callback: (
            snapshotId: string,
            payload: FetchSnapshotPayload<K>,
            snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
            payloadData: T | Data<T>,
            category: Category | undefined, timestamp: Date,
            data: T,
            delegate: SnapshotWithCriteria<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]
          ) => void
        ): Promise<{
          id: any;
          category: symbol | string | Category | undefined;
          timestamp: any;
          snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>;
          data: BaseData;
          getItem?:
          | ((
            snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
          ) => Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | undefined)
          | undefined;
        }> {
          throw new Error("Function not implemented.");
        },
        fetchSnapshotSuccess: function (
          snapshotData: (
            subscribers: Subscriber<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>[],
            snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
          ) => void
        ): void {
          throw new Error("Function not implemented.");
        },
        c: function (payload: { error: Error }): void {
          throw new Error("Function not implemented.");
        },
        getSnapshots: function (
          category: string,
          data: Snapshots<AppEntity>
        ): void {
          throw new Error("Function not implemented.");
        },
        getAllSnapshots: function (
          data: (
            subscribers: Subscriber<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>[],
            snapshots: Snapshots<AppEntity>
          ) => Promise<Snapshots<AppEntity>>
        ): void {
          throw new Error("Function not implemented.");
        },
        generateId: function (): string {
          throw new Error("Function not implemented.");
        },
        batchFetchSnapshots: function (
          subscribers: Subscriber<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>[],
          snapshots: Snapshots<AppEntity>
        ): void {
          throw new Error("Function not implemented.");
        },
        batchTakeSnapshotsRequest: batchTakeSnapshotsRequest,
        batchUpdateSnapshotsRequest: batchUpdateSnapshotsRequest,
        batchFetchSnapshotsSuccess: batchFetchSnapshotsSuccess,
        batchFetchSnapshotsFailure: batchFetchSnapshotsFailure,
        batchUpdateSnapshotsSuccess: batchUpdateSnapshotsSuccess,
        batchUpdateSnapshotsFailure: batchUpdateSnapshotsFailure,
        batchTakeSnapshot: batchTakeSnapshot,
        handleSnapshotSuccess: handleSnapshotSuccess,
        [Symbol.iterator]: function (): IterableIterator<
          Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
        > {
          throw new Error("Function not implemented.");
        },
      }

      const updatedSnapshotData: Partial<
        SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
      > = {
        id: generatedSnapshotId.toString(),
        data: snapshot.data ?? undefined,
        timestamp: new Date(),
        snapshotId: generatedSnapshotId.toString(),
        category: "update" as any, // Adjust according to your actual category type
        // Ensure other required properties are included
      };

      const subscribers: Subscriber<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>[] = [];

      // Check if snapshotStore[0] is defined and has the method setSnapshotData
      if (
        snapshotStore[0] &&
        typeof snapshotStore[0].setSnapshotData === "function"
      ) {
        snapshotStore[0].setSnapshotData(subscribers, updatedSnapshotData);
      }

      // Check if snapshotStore is an array
      if (Array.isArray(snapshotStore)) {
        snapshotStore.unshift(initialState); // Add the initial snapshot to the beginning of the snapshot store
      }

      const snapshotManager = await useSnapshotManager();
      // Update the snapshot store through a setter method if available
      await snapshotManager.setSnapshotManager(newState); // Ensure this method exists and correctly updates state
    }
  }, // Change 'any' to 'Error' if you handle specific error types

  batchTakeSnapshot: async (
    snapshotStore: SnapshotStore<BaseData, K>,
    snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
  ) => {
    return { snapshots: [] };
  },
  onSnapshot: (snapshotStore: SnapshotStore<BaseData, K>) => { },
  snapshotData: (snapshot: SnapshotStore<any, any>) => {
    return { snapshots: [] };
  },
  initSnapshot: () => { },
  // Implementation of fetchSnapshot function

  fetchSnapshot: async (
    id: string,
    category: Category | undefined,
    timestamp: Date,
    snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    data: T,
    delegate: SnapshotStoreConfig<T, K, Meta, ExcludedFields>[]
  ): Promise<{
    id: any;
    category: symbol | string | Category | undefined;
    timestamp: any;
    snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>;
    data: T;
    delegate: SnapshotStoreConfig<T, K, Meta, ExcludedFields>[];
  }> => {
    try {
      // Example implementation fetching snapshot data
      const snapshotData = await fetchFileSnapshotData(
        category as FileCategory,
        id  // Changed from snapshotId to id (parameter)
      ) as SnapshotData<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>;

      // Check if snapshotData is defined
      if (!snapshotData) {
        throw new Error("Snapshot data is undefined.");
      }

      const {store, options, category, config, operation} = storeProps
      // Create a new SnapshotStore instance
      const snapshotStore = new SnapshotStore<BaseData, K>({storeId, options, category, config, operation});

      return {
        id: snapshotData.id,
        category: snapshotData.category,
        timestamp: snapshotData.timestamp,
        snapshot: snapshotData.snapshot,
        data: snapshotData.data,
        delegate: snapshotData.delegate,
      };
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      throw error;
    }
  },


  clearSnapshot: () => { },

  updateSnapshot: async (
    snapshotId: string,
    data: Map<string, Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>,
    events: Record<string, CalendarEvent<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]>,
    snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    newData: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    payload: UpdateSnapshotPayload<T>,
    store: SnapshotStore<any, any>
  ): Promise<{ snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> }> => {
    // Example implementation logic (adjust as per your actual implementation)

    // Assuming you update some data in snapshotStore
    snapshotStore.addData(newData);

    // Convert snapshotStore to Snapshot<BaseData>
    const snapshotData: SnapshotData<BaseData> = {
      id: snapshotStore.id, // Ensure id is correctly assigned
      // Assign other properties as needed
      createdAt: new Date(),
      updatedAt: new Date(),
      title: "Snapshot Title", // Example: Replace with actual title
      description: "Snapshot Description", // Example: Replace with actual description
      status: "active", // Example: Replace with actual status
      category: "Snapshot Category", // Example: Replace with actual category
      // Ensure all required properties are assigned correctly
    };

    // Return the updated snapshot
    return { snapshot: snapshotData };
  },

  getSnapshots: async (category: string, snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => {
    return { snapshots };
  },
  takeSnapshot: async (snapshot: SnapshotStore<BaseData, K>) => {
    return { snapshot: snapshot };
  },

  getAllSnapshots: async (
    data: (
      subscribers: Subscriber<BaseData, K>[],
      snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
    ) => Promise<Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>
  ) => {
    // Implement your logic here
    const subscribers: Subscriber<BaseData, K>[] = []; // Example
    const snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> = []; // Example
    return data(subscribers, snapshots);
  },

  takeSnapshotSuccess: () => { },
  updateSnapshotFailure: (payload: { error: string }) => {
    console.log("Error updating snapshot:", payload);
  },
  takeSnapshotsSuccess: () => { },
  fetchSnapshotSuccess: () => { },
  updateSnapshotsSuccess: () => { },
  notify: () => { },

  updateMainSnapshots: async <T extends BaseDataEntity>(
    snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
  ): Promise<Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>> => {
    try {
      const updatedSnapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> = snapshots.map((snapshot) => ({
        ...snapshot,
        message: "Main snapshot updated",
        content: "Updated main content",
        description: snapshot.description || undefined,
      }));
      return Promise.resolve(updatedSnapshots);
    } catch (error) {
      console.error("Error updating main snapshots:", error);
      throw error;
    }
  },

  batchFetchSnapshots: async (
    subscribers: Subscriber<BaseData, K>[],
    snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
  ) => {
    return {
      subscribers: [],
      snapshots: [],
    };
  },

  batchUpdateSnapshots: async (
    subscribers: Subscriber<BaseData, K>[],
    snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
  ) => {
    // Perform batch update logic
    return [
      { snapshots: [] }, // Example empty array, adjust as per your logic
    ];
  },
  batchFetchSnapshotsRequest: async (snapshotData: {
    subscribers: Subscriber<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[];
    snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>;
  }) => {
    console.log("Batch snapshot fetching requested.");

    try {
      const target = {
        endpoint: "https://example.com/api/snapshots/batch",
        params: {
          limit: 100,
          sortBy: "createdAt",
        },
      };

      const fetchedSnapshots: SnapshotList<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> =
        await snapshotApi
          .getSortedList(target)
          .then((sortedList) => snapshotApi.fetchAllSnapshots(sortedList));

      let snapshots: Snapshots<CustomSnapshotData>;

      if (Array.isArray(fetchedSnapshots)) {
        snapshots = fetchedSnapshots.map((snapshot) => ({
          id: snapshot.id,
          snapshotId: snapshot.snapshotId,
          timestamp: snapshot.timestamp,
          category: snapshot.category,
          message: snapshot.message,
          content: snapshot.content,
          data: snapshot.data, // Ensure data is directly assigned if it's already in the correct format
          store: snapshot.store,
          metadata: snapshot.metadata,
          key: snapshot.key,
          topic: snapshot.topic,
          date: snapshot.date,
          configOption: snapshot.configOption,
          config: snapshot.config,
          title: snapshot.title,
          type: snapshot.type,
          subscribers: snapshot.subscribers,
          set: snapshot.set,
          state: snapshot.state,
          snapshots: snapshot.snapshots,
          snapshotConfig: snapshot.snapshotConfig,
          dataStore: snapshot.dataStore,
          dataStoreMethods: snapshot.dataStoreMethods,
          delegate: snapshot.delegate,
          subscriberId: snapshot.subscriberId,
          length: snapshot.length,
          events: snapshot.events,
          meta: snapshot.meta,
          initialState: snapshot.initialState,
          snapshot: snapshot.snapshot,
          getSnapshotId: snapshot.getSnapshotId,
          compareSnapshotState: snapshot.compareSnapshotStat,
          eventRecords: snapshot.eventRecord,
          snapshotStore: snapshot.snapshotStore,
          getParentId: snapshot.getParentI,
          getChildIds: snapshot.getChildId,
          addChild: snapshot.addChild,
          removeChild: snapshot.removeChild,
          getChildren: snapshot.getChildren,
          hasChildren: snapshot.hasChildren,
          isDescendantOf: snapshot.isDescendantOf,
          dataItems: snapshot.dataItem,
          newData: snapshot.newDate,
          getInitialState: snapshot.getInitialState,
          getConfigOption: snapshot.getConfigOption,
          stores: snapshot.stores,
          getStore: snapshot.getStore,
          addStore: snapshot.addStore,
          mapSnapshot: snapshot.mapSnapshot,
          removeStore: snapshot.removeStore,
          unsubscribe: snapshot.unsubscribe,
          fetchSnapshot: snapshot.fetchSnapshot,
          addSnapshotFailure: snapshot.addSnapshotFailure,
          configureSnapshotStore: snapshot.configureSnapshotStore,
          updateSnapshotSuccess: snapshot.updateSnapshotSuccess,
          createSnapshotFailure: snapshot.createSnapshotFailure,
          createSnapshotSuccess: snapshot.createSnapshotSuccess,
          createSnapshots: snapshot.createSnapshots,
          onSnapshot: snapshot.onSnapshot,
          onSnapshots: snapshot.onSnapshots,
          handleSnapshot: snapshot.handleSnapshot,
          // Adjust this based on your actual data structure
        }));
      } else {
        snapshots = fetchedSnapshots
          .getSnapshots()
          .map((snapshot: SnapshotItem<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => ({
            id: snapshot.id,
            timestamp: snapshot.timestamp,
            category: snapshot.category,
            message: snapshot.message,
            content: snapshot.content,
            data: snapshot.data,
            store: snapshot.store,
            metadata: snapshot.metadata,
            events: snapshot.events,
            meta: snapshot.meta,
            initialState: new Map(), // Adjust this based on your actual data structure
          }));
      }

      return {
        subscribers: snapshotData.subscribers,
        snapshots: snapshots,
      };
    } catch (error) {
      console.error("Error fetching snapshots in batch:", error);
      throw error;
    }
  },

  updateSnapshotForSubscriber: async (
    subscriber: Subscriber<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
    snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
  ): Promise<{
    subscribers: Subscriber<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[];
    snapshots: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[];
  }> => {
    try {
      const subscriberId = subscriber.id;
      const snapshotData = snapshots[Number(subscriberId)];

      if (!snapshotData) {
        throw new Error(
          `No snapshot data found for subscriber ID: ${subscriberId}`
        );
      }

      // Logic to update the snapshot for a specific subscriber
      const updatedSnapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> = {
        ...snapshotData,
        message: "Updated for subscriber",
      };

      // Find the index of the snapshot in the array
      const snapshotIndex = snapshots.findIndex(
        (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => snapshot.id === subscriberId
      );

      // Create a new array with the updated snapshot
      const updatedSnapshots: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[] = [...snapshots];
      updatedSnapshots[snapshotIndex] = updatedSnapshot;

      // Return the updated snapshot wrapped in the expected structure
      return {
        subscribers: [subscriber],
        snapshots: updatedSnapshots,
      };
    } catch (error) {
      console.error("Error updating snapshot for subscriber:", error);
      throw error;
    }
  },

  batchFetchSnapshotsSuccess: () => {
    return [];
  },
  batchFetchSnapshotsFailure: (payload: { error: Error }) => { },

  batchUpdateSnapshotsFailure: (payload: { error: Error }) => { },

  notifySubscribers: (
    subscribers: Subscriber<BaseData, K>[],
    data: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
  ) => {
    return subscribers;
  },

  removeSnapshot: (snapshotToRemove) => {
    if (snapshotToRemove && snapshotToRemove.id !== undefined) {
      const currentConfig = snapshotConfig.find(
        (config) => config.snapshotId === "snapshot1" // Adjust the condition to match your use case
      );
      if (currentConfig && currentConfig.snapshots) {
        const filteredSnapshots = currentConfig.snapshots.filter(
          (snapshot) => snapshot.id !== snapshotToRemove.id
        );
        currentConfig.snapshots = filteredSnapshots;
      } else {
        console.warn("Snapshots not found in snapshotConfig.");
      }
    } else {
      console.warn(
        `${snapshotToRemove} or ${snapshotToRemove?.id} is undefined, no snapshot removed`
      );
    }
  },

  // Implementing the removeSubscriber method
  removeSubscriber: (subscriber) => {
    const subscriberId = subscriber.id;
    if (subscriberId !== undefined) {
      const currentConfig = snapshotConfig.find(
        (config) => config.snapshotId === "snapshot1" // Adjust the condition to match your use case
      );
      if (currentConfig && currentConfig.subscribers) {
        const filteredSubscribers = currentConfig.subscribers.filter(
          (sub) => sub.id !== subscriberId
        );
        currentConfig.subscribers = filteredSubscribers;
      } else {
        console.warn("Subscribers not found in snapshotConfig.");
      }
    } else {
      console.warn(`${subscriberId} is undefined, subscriber not removed`);
    }
  },

  // Implementing the addSubscriber method
  addSnapshot: function (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) {
    if (
      "data" in snapshot &&
      "timestamp" in snapshot &&
      "category" in snapshot &&
      typeof snapshot.category === "string"
    ) {
      const snapshotWithValidTimestamp: SnapshotStore<BaseData, K> = {
        ...snapshot,
        timestamp: new Date(snapshot.timestamp as unknown as string),
        // Ensure all required properties of SnapshotStore<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>> are included
        id: snapshot.id!.toString(),
        snapshotId: snapshot.snapshotId!.toString(),
        taskIdToAssign: snapshot.taskIdToAssign,
        clearSnapshots: snapshot.clearSnapshots,
        key: snapshot.key!,
        topic: snapshot.topic!,
        initialState: snapshot.initialState as SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
          | Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null | undefined,
        initialConfig: snapshot.initialConfig,
        configOption: snapshot.configOption ? snapshot.configOption : null,
        subscription: snapshot.subscription ? snapshot.subscription : null,
        config: snapshot.config,
        category: snapshot.category,
        set: snapshot.set,
        data: snapshot.data || undefined,
        store: snapshot.store!,
        removeSubscriber: snapshot.removeSubscriber,
        handleSnapshot: snapshot.handleSnapshot,
        state: snapshot.state,
        snapshots: snapshot.snapshots,
        onInitialize: snapshot.onInitialize,
        subscribers: snapshot.subscribers,
        onError: snapshot.onError,
        snapshot: snapshot.snapshot,
        setSnapshot: snapshot.setSnapshot!,
        createSnapshot: snapshot.createSnapshot,
        configureSnapshotStore: snapshot.configureSnapshotStore,
        createSnapshotSuccess: snapshot.createSnapshotSuccess,
        createSnapshotFailure: snapshot.createSnapshotFailure,
        batchTakeSnapshot: snapshot.batchTakeSnapshot,
        onSnapshot: snapshot.onSnapshot,
        snapshotData: snapshot.snapshotData,
        initSnapshot: snapshot.initSnapshot,
        clearSnapshot: snapshot.clearSnapshot,
        updateSnapshot: snapshot.updateSnapshot,
        getSnapshots: snapshot.getSnapshots,
        takeSnapshot: snapshot.takeSnapshot,
        getAllSnapshots: this.getAllSnapshots,
        takeSnapshotSuccess: this.takeSnapshotSuccess,
        updateSnapshotFailure: this.updateSnapshotFailure,
        takeSnapshotsSuccess: this.takeSnapshotsSuccess,
        fetchSnapshotSuccess: this.fetchSnapshotSuccess,
        updateSnapshotsSuccess: this.updateSnapshotsSuccess,
        notify: this.notify,
        updateMainSnapshots: this.updateMainSnapshots,
        batchFetchSnapshots: this.batchFetchSnapshots,
        batchUpdateSnapshots: this.batchUpdateSnapshots,
        batchFetchSnapshotsRequest: this.batchFetchSnapshotsRequest,
        updateSnapshotForSubscriber: this.updateSnapshotForSubscriber,
        batchFetchSnapshotsSuccess: this.batchFetchSnapshotsSuccess,
        batchFetchSnapshotsFailure: this.batchFetchSnapshotsFailure,
        batchUpdateSnapshotsFailure: this.batchUpdateSnapshotsFailure,
        notifySubscribers: this.notifySubscribers,
        removeSnapshot: this.removeSnapshot,
        expirationDate: this.expirationDate,
        isExpired: this.isExpired,
        priority: this.priority,
        tags: this.tags,
        metadata: this.metadata,
        status: this.status,
        isCompressed: this.isCompressed,
        compress: this.compress,
        isEncrypted: this.isEncrypted,
        encrypt: this.encrypt,
        decrypt: this.decrypt,
        ownerId: this.ownerId,
        getOwner: this.getOwner,
        version: this.version,
        previousVersionId: this.previousVersionId,
        nextVersionId: this.nextVersionId,
        auditTrail: this.auditTrail,
        addAuditRecord: this.addAuditRecord,
        retentionPolicy: this.retentionPolicy,
        dependencies: this.dependencies,
        updateSnapshots: this.updateSnapshots,
        updateSnapshotsFailure: this.updateSnapshotsFailure,
        flatMap: this.flatMap,
        setData: this.setData,
        getState: this.getState,
        setState: this.setState,
        handleActions: this.handleActions,
        setSnapshots: this.setSnapshots,
        mergeSnapshots: this.mergeSnapshots,
        reduceSnapshots: this.reduceSnapshots,
        sortSnapshots: this.sortSnapshots,
        filterSnapshots: this.filterSnapshots,
        mapSnapshots: this.mapSnapshots,
        findSnapshot: this.findSnapshot,
        subscribe: this.subscribe,
        unsubscribe: this.unsubscribe,
        fetchSnapshotFailure: this.fetchSnapshotFailure,
        generateId: this.generateId,
      };

      const currentConfig = snapshotConfig.find(
        (config) => config.snapshotId === this.snapshotId
      );
      if (currentConfig && currentConfig.snapshots) {
        currentConfig.snapshots.push(snapshotWithValidTimestamp);
      } else {
        console.error("Snapshots not found in snapshotConfig.");
      }
    } else {
      console.error("Invalid snapshot format");
    }
  },

  getSubscribers: async (
    subscribers: Subscriber<BaseData, K>[],
    snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
  ): Promise<{
    subscribers: Subscriber<BaseData, K>[];
    snapshots: Snapshots<AppEntity>[];
  }> => {
    const data = Object.entries(snapshots)
      .map(([category, categorySnapshots]) => {
        const subscribersForCategory = subscribers.filter(
          (subscriber) => subscriber.getData()?.category === category
        );
        if (Array.isArray(categorySnapshots)) {
          const snapshotsForCategory = categorySnapshots.map(
            (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => {
              const updatedSnapshot = {
                ...snapshot,
                subscribers: subscribersForCategory.map((subscriber) => {
                  const subscriberData = subscriber.getData();
                  if (subscriberData) {
                    return {
                      ...subscriberData,
                      id: subscriber.getId(),
                    };
                  } else {
                    return {
                      id: subscriber.getId(),
                    };
                  }
                }),
              };
              return updatedSnapshot;
            }
          );
          return snapshotsForCategory;
        }
      })
      .flat();

    return {
      subscribers,
      snapshots: data,
    };
  },

  addSubscriber: function <T extends BaseDataEntity | CustomSnapshotData<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>(
    subscriber: Subscriber<BaseData, K>,
    data: T,
    snapshotConfig: SnapshotStoreConfig<BaseData, T>[],
    delegate: SnapshotStoreSubset<BaseData>,
    sendNotification: (type: NotificationTypeEnum) => void
  ): void { },

  validateSnapshot: function (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>): boolean {
    if (!snapshot.id || typeof snapshot.id !== "string") {
      console.error("Invalid snapshot ID");
      return false;
    }
    if (!(snapshot.timestamp instanceof Date)) {
      console.error("Invalid timestamp");
      return false;
    }
    if (!snapshot.data) {
      console.error("Data is required");
      return false;
    }
    return true;
  },

  getSnapshot: async function (
    snapshot: (
      id: string
    ) =>
      | Promise<{
        category: any;
        timestamp: any;
        id: any;
        snapshot: SnapshotStore<BaseData, K>;
        data: Data<T>;
      }>
      | undefined
  ): Promise<SnapshotStore<BaseData, K>> {
    try {
      const result = await snapshot();
      if (!result) {
        throw new Error("Snapshot not found");
      }
      const {
        category,
        timestamp,
        id,
        snapshot: storeSnapshot,
        data,
      } = result;
      return storeSnapshot;
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      throw error;
    }
  },

  getSnapshotById: async function (
    snapshotId: string,
    snapshotConfig: SnapshotStoreConfig<Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>[] // Adjust the type for Data as per your needs
  ): Promise<SnapshotStore<BaseData, K> | undefined> {
    try {
      const config = snapshotConfig.find(
        (config) => config.snapshotId === snapshotId
      );

      if (!config) {
        throw new Error("Snapshot configuration not found");
      }

      // Here, assuming `config` is of type `SnapshotStoreConfig<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>`
      // and you need to create or access a `SnapshotStore<BaseData, K>` instance
      const snapshotStore: SnapshotStore<BaseData, K> = {
        id: config.id, // Ensure `id` is accessible from `SnapshotStoreConfig`
        key: config.key ? config.key : config.snapshotId.toString(), // Ensure `key` is accessible from `SnapshotStoreConfig`
        topic: config.topic ? config.topic : "defaultTopic",
        date: new Date(), // Adjust as per your logic
        title: "Snapshot Title", // Example, adjust as per your logic
        type: "snapshot_type", // Example, adjust as per your logic
        subscription: null, // Example, adjust as per your logic
        category: config.category,
        timestamp: new Date(), // Example, adjust as per your logic

        // Ensure to include other necessary properties
      };

      return snapshotStore;
    } catch (error) {
      console.error("Error fetching snapshot:", error);
      throw error;
    }
  },
  batchTakeSnapshotsRequest: (snapshotData: any) => {
    console.log("Batch snapshot taking requested.");
    return Promise.resolve({ snapshots: [] });
  },
  updateSnapshotSuccess: () => {
    console.log("Snapshot updated successfully.");
  },
  setSnapshotFailure: (error: Error) => {
    console.error("Error in snapshot update:", error);
  },
  batchUpdateSnapshotsSuccess: (
    subscribers: Subscriber<BaseData, K>[],
    snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
  ) => {
    try {
      console.log("Batch snapshots updated successfully.");
      return [{ snapshots }];
    } catch (error) {
      console.error("Error in batch snapshots update:", error);
      throw error;
    }
  },
  getData: async () => {
    try {
      const data = await fetchData(String(endpoints));
      if (data && data.data) {
        return data.data.map((snapshot: any) => ({
          ...snapshot,
          data: snapshot.data,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  },
  isExpired: function () {
    return !!this.expirationDate && this.expirationDate < new Date();
  },

  compress: function () {
    this.isCompressed = true;
  },
  isEncrypted: false,
  encrypt: function () {
    this.isEncrypted = true;
  },
  decrypt: function () {
    this.isEncrypted = false;
  },
  ownerId: "owner-id",
  getOwner: function () {
    return this.ownerId ?? "defaultOwner"; // Replace "defaultOwner" with your desired default value
  },
  version: "1.0.0",
  previousVersionId: "0.9.0",
  nextVersionId: "1.1.0",
  auditTrail: [],
  getSnapshotManager: () => new SnapshotManager(),
  addAuditRecord: function (record: AuditRecord) {
    if (this.auditTrail) {
      this.auditTrail.push(record);
    }
  },
  retentionPolicy: {
    retentionPeriod: 0, // in days
    cleanupOnExpiration: false,
    retainUntil: new Date(),
  },
  dependencies: [],
  [Symbol.iterator]: function* () { },
  [Symbol.asyncIterator]: async function* () { },
  [Symbol.toStringTag]: "SnapshotStore",

});


export { createSnapshotStoreConfig, snapshotStoreConfigInstance };

  export type {
        AppEntity, AppExcludedFields, AppK,
        AppMeta, AppSnapshot, AppSnapshotsArray, AppSnapshotStoreConfig
    };








// // Return a Snapshot object
//           return {
//             id,
//             data: snapshotData, // Ensure snapshotData is of type Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
//             category,
//             snapshotItems: [],
//             meta: {} as Map<string, Snapshot<T, K, Meta, ExcludedFields>>,
//             configOption: snapshotStoreConfig?.configOption, // Ensure snapshotDataConfig is of type SnapshotStoreConfig<any, any>
//             dataItems: [],
//             newData: null,
//             stores: (
//               storeProps: SnapshotStoreProps<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>

//             ): SnapshotStore<T, T, StructuredMetadata<AppEntity, AppEntity, AppMeta, AppExcludedFields>, never>[] => {

//             },
//             timestamp: new Date(),
//             handleSnapshot: (
//                 id: string,
//                 snapshotId: string | number | null,
//                 snapshot: T | null,
//                 snapshotData: T,
//                 category: Category | undefined,                categoryProperties: CategoryProperties | undefined,
//                 callback: (snapshot: T) => void,
//                 snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//                 type: string,
//                 event: SnapshotEvent<T, K, Meta, ExcludedFields>,
//                 snapshotContainer?: T,
//                 snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, ExcludedFields> | null,
//               ): Promise<Snapshot<T, K, Meta, ExcludedFields> | null> => {
//                 return new Promise((resolve, reject) => {
//                   // Ensure SnapshotData is defined before accessing getSnapshot
//                   if (!SnapshotData) {
//                     reject(new Error("SnapshotData is not defined"));
//                     return;
//                   }
              
//                   // Use the snapshotApi to fetch the snapshot by ID
//                   snapshotApi.fetchSnapshotById(id)
//                     .then(snapshotResult => {

//                       if (!snapshotResult) {
//                         // Handle the case where snapshotResult is undefined
//                         console.error('Snapshot not found for ID:', id);
//                         return; // or handle the error as appropriate
//                       }
                      
//                       // Separate the logic for retrieving the snapshot
//                       const getSnapshotResult = {
//                         category: snapshotResult.category,
//                         timestamp: snapshotResult.timestamp,
//                         id: snapshotResult.id,
//                         snapshot: snapshotResult.snapshot,
//                         snapshotStore: snapshotResult.snapshotStore,
//                         data: snapshotResult.data,
//                         snapshotId: snapshotResult.snapshotId,
//                         snapshotData: snapshotResult.snapshotData,
//                         categoryProperties: snapshotResult.categoryProperties,
//                         dataStoreMethods: snapshotResult.dataStoreMethods as DataStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null, 
//                       };
              
//                       // Now, call the getSnapshot method and pass the result
//                       return SnapshotData.getSnapshot(async () => getSnapshotResult);
//                     })
//                     .then(snapshot => {
//                       if (snapshot) {
//                         // Handle the snapshot
//                         return snapshot.handleSnapshot(snapshotId, snapshot, snapshots, type, event)
//                           .then(() => resolve(snapshot));
//                       } else {
//                         reject(new Error(`Snapshot with ID '${snapshotId}' not found.`));
//                       }
//                     })
//                     .catch(error => {
//                       reject(error);
//                     });
//                 });
//               },
              
              
//             events: {
//               eventRecords: {
//                 add: [],
//                 remove: [],
//                 update: [],
//               },
//               callbacks: {},
//               subscribers: [],
//               eventIds: [],
//               on: (event: string, callback: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => void) => {
//                 if (!eventHandlers[event]) {
//                   eventHandlers[event] = [];
//                 }
//                 eventHandlers[event].push(callback);
//                 console.log(`Event '${event}' registered.`);
//               },
//               off: (event: string, callback: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => void) => {
//                 if (eventHandlers[event]) {
//                   eventHandlers[event] = eventHandlers[event].filter(cb => cb !== callback);
//                   console.log(`Event '${event}' unregistered.`);
//                 }
//               }
//             },
//             getSnapshotId: (
//               snapshotData: SnapshotData<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//             ) => {
//               console.log("Getting snapshot ID");
  
//               console.log("Snapshot data:", snapshotData);
//               return null;
//             },
//             compareSnapshotState: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => {
//               console.log("Comparing snapshot state:", snapshot);
//               return null;
//             },
//             eventRecords: {
//               add: [],
//               remove: [],
//               update: [],
//             },
//             snapshotStore: null,
//             subscribe: (
//               snapshotId: string | number | null,
//               unsubscribe: UnsubscribeDetails,
//               subscriber: Subscriber<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> | null,
//               data: AppEntity,
//               event: SnapshotEvent<T, K, Meta, ExcludedFields>,
//               callback: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => void) => {
//               console.log("Subscribed to snapshot:", callback);
//             },
//             unsubscribe: (
//               unsubscribeDetails: {
//                 userId: string; snapshotId: string;
//                 unsubscribeType: string;
//                 unsubscribeDate: Date;
//                 unsubscribeReason: string;
//                 unsubscribeData: any;
//               },
//               event: string,
//               callback: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => void) => {
//               console.log("Unsubscribed from snapshot:", callback);
//             },
//             fetchSnapshotFailure: (
//               snapshotId: string,
//               snapshotManager: SnapshotManager<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//               snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//               date: Date | undefined,
//               payload: { error: Error }
//               snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//             ) => {
//               console.log("Fetching snapshot:", snapshot);
//               console.error("Error fetching snapshot:", payload.error);
//             },
//             fetchSnapshotSuccess: (
//               snapshotManager: SnapshotManager<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//               snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//             ) => {
//               console.log("Fetching snapshot:", snapshot);
//             },
  
//             fetchSnapshot: (
//               snapshotId: string,
//                 callback: (
//                   snapshotId: string,
//                   payload: FetchSnapshotPayload<AppEntity>,
//                   snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//                   payloadData: AppEntity |  BaseData<any>,
//                   category: symbol | string | Category | undefined,
//                   categoryProperties: CategoryProperties | undefined,
//                   timestamp: Date,
//                   data: AppEntity,
//                   delegate: SnapshotWithCriteria<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]            
//                 ) => Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
//             ) => {
//               console.log("Fetching snapshot with ID:", snapshotId);
//               if (snapshotId === "snapshot1") {
//                 callback({
//                   id: "snapshot1",
//                   data: {
//                     name: "John Doe",
//                     age: 30,
//                     timestamp: new Date().getTime(),
//                   },
//                   category: "user",
//                   snapshotItems: [],
//                   meta: new Map(),
//                   configOption: null,
//                   dataItems: [],
//                   newData: null,
//                   stores: [],
//                   timestamp: new Date(),
//                   handleSnapshot: (
//                     snapshotId: string,
//                     snapshot: Snapshot<T, K, Meta, ExcludedFields> | null,
//                     snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//                     type: string,
//                     event: Event
//                   ): Promise<Snapshot<T, K, Meta, ExcludedFields> | null> => {
//                     return new Promise((resolve, reject) => {
//                       try{
//                         console.log(`Handling snapshot with ID: ${snapshotId}`, snapshot);
//                       if (snapshot) {
//                         console.log("Snapshot:", snapshot);
//                       }
//                       resolve(snapshot);
//                       } catch (error) {
//                         reject(error);
//                       }
//                      })
  
//                   },
//                   events: {
//                     eventRecords: {
//                       add: [],
//                       remove: [],
//                       update: [],
//                     },
//                     callbacks: (snapshots: Snapshots<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => {
//                       console.log("Fetching snapshot:", snapshots);
//                       return snapshots;
//                     },
//                   },
//                   eventIds: [],
//                   on: (event: string, callback: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => void) => {
//                     if (!eventHandlers[event]) {
//                       eventHandlers[event] = [];
//                     }
//                     eventHandlers[event].push(callback);
//                     console.log(`Event '${event}' registered.`);
//                   },
//                   getSnapshotId: () => { },
//                   compareSnapshotState: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => {
//                     console.log("Comparing snapshot state:", snapshot);
//                     return null;
//                   },
//                   eventRecords: {
//                     add: [],
//                     remove: [],
//                     update: [],
//                   },
//                   snapshotStore: null,
//                   unsubscribe: (callback: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => void) => {
//                     console.log("Unsubscribed from snapshot:", callback);
//                   },
  
//                   configureSnapshotStore: (
//                     snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//                     snapshotId: string,
//                     data: Map<string, Snapshot<T, K, Meta, ExcludedFields>>,
//                     events: Record<string, CalendarEvent<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]>,
//                     dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
//                     newData: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//                     payload: ConfigureSnapshotStorePayload<T>,
//                     store: SnapshotStore<any, K>
//                   ) => {
//                     console.log("Configuring snapshot store:", snapshotStore);
//                     snapshotStore.configureSnapshotStore(snapshotStore, snapshotId, data, events, dataItems, newData, payload, store, callback);
//                   },
  
//                   updateSnapshotSuccess: (
//                     snapshotId: string,
//                     snapshotManager: SnapshotManager<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//                     snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => {
//                     console.log("Updating snapshot:", snapshotId, snapshot);
//                   },
//                   createSnapshotFailure: (
//                     snapshotId: string,
//                     snapshotManager: SnapshotManager<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//                     snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>
//                   ): Promise<void> => {
//                     console.log("Creating snapshot failure:", snapshotId, snapshotManager, snapshot);
//                     return Promise.resolve();
//                   },
//                   getParentId: () => "",
//                   getChildIds: () => [],
//                   addChild: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => {
//                     console.log("Adding snapshot:", snapshot);
//                   },
//                   removeChild: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => {
//                     console.log("Removing snapshot:", snapshot);
//                   },
//                   getChildren: () => [],
//                   hasChildren: () => false,
//                   isDescendantOf: (snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => false,
//                   getStore: (
//                     storeId: number,
//                     snapshotId: string,
//                     snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//                     type: string,
//                     event: Event
//                   ) => null,
//                   addStore: (
//                     storeId: number,
//                     snapshotId: string,
//                     store: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//                     snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//                     type: string,
//                     event: Event
//                   ) => {
//                     console.log("Adding store:", storeId, store, snapshotId, snapshot, type, event);
//                     return store;
//                   },
//                   mapSnapshot(
//                     snapshotId: string,
//                     snapshot: Snapshot<T, K, Meta, ExcludedFields>,
//                     type: string, event: Event
//                   ): Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> {
//                     console.log("Mapping snapshot:", snapshot);
//                     return snapshot;
//                   },
//                   removeStore(
//                     storeId: number,
//                     store: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//                     snapshotId: string,
//                     snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//                     type: string,
//                     event: Event
//                   ): Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]> {
//                     console.log("Removing store:", storeId, store, snapshotId, snapshot, type, event);
//                     return snapshot;
//                   },
//                 })
//               }
//             },
//             configureSnapshotStore: (
//               snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//               storeId: number,
//               snapshotId: string,
//               data: Map<string, Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>,
//               events: Record<string, CalendarEvent<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]>,
//               dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
//               newData: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//               payload: ConfigureSnapshotStorePayload<T>,
//               store: SnapshotStore<any, K>
//             ) => {
//               console.log("Configuring snapshot store:", snapshotStore);
//             },
//             updateSnapshot: (
//               snapshotId: string,
//               // oldSnapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//               data: Map<string, Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>>,
//               events: Record<string, CalendarEvent<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>[]>,
//               snapshotStore: SnapshotStore<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//               dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
//               newData: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//               payload: UpdateSnapshotPayload<T>,
//               store: SnapshotStore<any, K>
//             ) => {
//               console.log("Updating snapshot:", newData);
//             },
//             updateSnapshotFailure: (
//               snapshotManager: SnapshotManager<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//               snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//               payload: { error: Error }
//             ) => {
//               console.log("Error in updating snapshot:", payload);
//             },
//             updateSnapshotSuccess: (
//               snapshotId: string,
//               snapshotManager: SnapshotManager<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//               snapshot: Snapshot<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>,
//                payload?: { data?: any; } | undefined
//             ) => {
//               console.log("Updated snapshot:", snapshot);
//             },
//             updateSnapshotItem: (snapshotItem: SnapshotItem<AppParams[0], AppParams[1], AppParams[2], AppParams[3]>) => {
//               console.log("Updating snapshot item:", snapshotItem);
//             },
//             // other properties if any
//           };