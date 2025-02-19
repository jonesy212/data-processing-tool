// SnapshotContainer.ts
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { endpoints } from "@/app/api/endpointConfigurations";
import { SnapshotCategory } from "@/app/api/getSnapshotEndpoint";
import { SnapshotOperationType } from "../snapshots/SnapshotActions";
import * as snapshotApi from "@/app/api/SnapshotApi";
import { apiCall, handleOtherStatusCodes } from "@/app/api/SnapshotApi";
import { convertStoreId } from '@/app/components/snapshots/convertSnapshot';
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { Callback } from '@/app/components/snapshots/subscribeToSnapshotsImplementation';
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import isSnapshotsArray from '@/app/components/utils/snapshotUtils';
import { AppConfig, getAppConfig } from "@/app/configs/AppConfig";
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { SharedMetadata } from '@/app/configs/metadata/createMetadataState';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { AxiosError } from "axios";
import { ContentItem } from '../cards/DummyCardLoader';
import { SnapshotManager } from "../hooks/useSnapshotManager";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Content } from "../models/content/AddContent";
import { BaseData, Data, DataDetails } from "../models/data/Data";
import { K, T } from '../models/data/dataStoreMethods';
import { NotificationPosition, StatusType } from "../models/data/StatusType";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { Tag } from '../models/tracker/Tag';
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { ExcludedFields } from '../routing/Fields';
import { BaseEntity } from '../routing/FuzzyMatch';
import axiosInstance from "../security/csrfToken";
import { Subscription } from "../subscriptions/Subscription";
import { NotificationType, NotificationTypeEnum } from "../support/NotificationContext";
import { Subscriber } from "../users/Subscriber";
import { isSnapshotDataType } from "../utils/snapshotUtils";
import Version from "../versions/Version";
import { handleApiError } from "./../../api/ApiLogs";
import { AuthenticationHeaders, createAuthenticationHeaders } from "./../../api/headers/authenticationHeaders";
import createCacheHeaders from "./../../api/headers/cacheHeaders";
import createContentHeaders from "./../../api/headers/contentHeaders";
import generateCustomHeaders from "./../../api/headers/customHeaders";
import createRequestHeaders from "./../../api/headers/requestHeaders";
import configData from "./../../configs/configData";
import { CoreSnapshot } from "./CoreSnapshot";
import { createSnapshotInstance } from "./createSnapshotInstance";
import { FetchSnapshotPayload, fetchSnapshotPayload } from './FetchSnapshotPayload';
import { Snapshot, Snapshots, SnapshotsArray, SnapshotsObject, SnapshotUnion } from "./LocalStorageSnapshotStore";
import { SnapshotOperation } from "./SnapshotActions";
import { ConfigureSnapshotStorePayload, createSnapshotConfig, SnapshotConfig } from "./SnapshotConfig";
import { CustomSnapshotData, SnapshotData, SnapshotRelationships } from "./SnapshotData";
import { batchUpdateSnapshots } from './snapshotHandlers';
import { SnapshotInitialization } from './SnapshotInitialization';
import { SnapshotMethods } from "./SnapshotMethods";
import { InitializedConfig, SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { snapshotStoreConfigInstance } from './snapshotStoreConfigInstance';
import { InitializedData, SnapshotStoreOptions } from "./SnapshotStoreOptions";
import { SnapshotSubscriberManagement } from './SnapshotSubscriberManagement';
import { SnapshotWithCriteria, TagsRecord } from './SnapshotWithCriteria';
import { SnapshotStoreProps } from './useSnapshotStore';

const API_BASE_URL = endpoints.snapshots


type SnapshotDataType<
  T extends  BaseData<any>, 
  K extends T = T,
  ExcludedFields extends  BaseData<any> = never
> =
  | Map<string, Snapshot<T, K>>
  | SnapshotData<T, K>
  | SnapshotStore<T, K>
  | Map<string, SnapshotStore<T, K>>
  | Promise<{ snapshot: Snapshot<T, K> }> 
  | undefined;

type ItemUnion = ContentItem | K<T>; // Assuming K extends Data

interface SnapshotBase<
  T extends  BaseData<any>,
  K extends T = T> extends BaseEntity {
  data: InitializedData<T> | null | undefined;
  items: ItemUnion[];
  contentItems?: ContentItem[];
  config: Promise<SnapshotStoreConfig<T, K> | null>;
  timestamp: string | number | Date | undefined;
  currentCategory: Category | undefined;

  snapshotId?: string | number | null;
  title?: string;
  tags?: TagsRecord<T, K> | string[] | undefined;
  key?: string;
  state?: SnapshotsArray<T, K> | null;
  topic?: string;
  find: (id: string) => SnapshotStore<T, K> | undefined;

  // Category-related methods
  setSnapshotCategory: (id: string, newCategory: string | Category) => void;
  getSnapshotCategory: (id: string) => Category | undefined;
}


interface SnapshotContainerData<
  T extends  BaseData<any> = BaseData<any>, 
  K extends T = T, 
  ExcludedFields extends Data<T> = never
  > extends SharedMetadata<K> {
  
  data: InitializedData<T> | undefined;
  items: ItemUnion[];
  config: Promise<SnapshotStoreConfig<T, K> | null>;
  timestamp: string | number | Date | undefined;
  currentCategory: Category | undefined;
  excludedFields?: ExcludedFields;
}

interface SnapshotContainer<
  T extends  BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
  > extends SnapshotBase<T, K>,
  SnapshotData<T, K, Meta, ExcludedFields>,
  SnapshotMethods<T, K, Meta, ExcludedFields>,
  SnapshotRelationships<T, K>,
  SnapshotInitialization<T, K>,
  SnapshotContainerData<T, K> {
  name?: string | undefined;
  mappedSnapshotData: Map<string, Snapshot<T, K>> | undefined;
  subscriberManagement?: SnapshotSubscriberManagement<T, K>;
  criteria: CriteriaType | undefined,
  content?: string | Content<T, K> | undefined;
  snapshotCategory: SnapshotCategory<T, K> | undefined,
  snapshotSubscriberId: string | null | undefined;
  taskIdToAssign?: string;
  initialConfig: InitializedConfig | {};
  removeSubscriber: any;
  onError: (error: any) => void;
  data: InitializedData<T> | null | undefined;
  snapshotsArray?: SnapshotsArray<T, K>;
  snapshotsObject?: SnapshotsObject<T, K>;
  snapshots?: Snapshots<T, K>
  currentCategory: Category | undefined;
  snapshotContent?: string | Content<T, K> | undefined; // Add snapshotContent if needed

  snapshotId?: string | number | null;
  snapshot: (
    id: string | number | undefined,
    snapshotData: SnapshotData<T, K>, // Updated to SnapshotData<T, K>
    category: symbol | string | Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K>) => void,
    dataStore: DataStore<T, K>,
    dataStoreMethods: DataStoreMethods<T, K>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
    metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number,// Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K>,
    snapshotConfigData: SnapshotConfig<T, K>,
    subscription: Subscription<T, K>,
    snapshotId?: string | number | null,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
  ) => Snapshot<T, K> | Promise<{ snapshot: Snapshot<T, K> }>;

  snapshotStore: SnapshotStore<T, K> | null;

  snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null;

  snapshotData: (
    id: string | number | undefined,
    data: Snapshot<T, K, Meta, ExcludedFields>,
    mappedSnapshotData: Map<string, Snapshot<T, K>> | null | undefined,
    snapshotData: SnapshotData<T, K>,
    snapshotStore: SnapshotStore<T, K>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    // dataStore: DataStore<T, K>,
    dataStoreMethods: DataStoreMethods<T, K>,
    storeProps: SnapshotStoreProps<T, K>,
    snapshotId?: string | number | null,
    storeId?: number
  ) => Promise<SnapshotDataType<T, K>>;
  
  // Method to convert and retrieve the appropriate snapshot
  getSnapshot: (
    snapshotId: string | number | null,
    storeId: number,
    additionalHeaders?: Record<string, string>
  ) => Promise<Snapshot<T, K>>
  snapshotSubscriberManagement?: SnapshotSubscriberManagement<T, K>

}

// Utility method to initialize properties of SnapshotContainer
function initializeSnapshotContainer<
  T extends  BaseData<any>,
  K extends T = T>(
  snapshotContainer: Partial<SnapshotContainer<T, K>>,
  initialValues: Partial<SnapshotContainer<T, K>>
): SnapshotContainer<T, K> {
  // Iterate over each key in the initialValues and assign it to snapshotContainer
  for (const key in initialValues) {
    if (initialValues.hasOwnProperty(key)) {
      // Using dot notation to set the value
      snapshotContainer[key as keyof SnapshotContainer<T, K>] = initialValues[key as keyof SnapshotContainer<T, K>];
    }
  }
  // Cast to SnapshotContainer to return the initialized container
  return snapshotContainer as SnapshotContainer<T, K>;
}


// Example of initializing SnapshotContainer within a method
function configureSnapshotContainer<
  T extends  BaseData<any>, 
  K extends T = T>(
    container: Partial<SnapshotContainer<T, K>>,
    config: Partial<SnapshotContainer<T, K>>
): SnapshotContainer<T, K> {
  // Use the initializeSnapshotContainer utility to set the properties
  return initializeSnapshotContainer(container, config);
}

export const snapshotContainer = <
  T extends  BaseData<any>,
  K extends T = T>(
  snapshotId: string,
  storeId: number,
  config: Promise<SnapshotStoreConfig<T, K> | null>,
  snapConfig?: SnapshotConfig<T, K>
): Promise<SnapshotContainer<T, K>> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Step 1: Initialize the snapshotContainer object
      const snapshotContainer: SnapshotContainer<T, K> = {
        name: "",
        initialConfig: {},
        removeSubscriber: () => {},
        onError: (error: any) => {},
        snapshots: [],
        onInitialize: () => {},
        id: "",
        items: [],
        config: Promise.resolve(config), // Assign the promise correctly for config
        storeId,
        isExpired:() => false, // Assuming this is a boolean; adjust as needed
        subscribers: [],
        getSnapshotData: (
          id: string | number | undefined,
          snapshotId: number,
          snapshotData: T,
          category: Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<T, K>
        ): Map<string, Snapshot<T, K>> | null | undefined => {
             // Implement logic to retrieve snapshot data based on the parameters
            if (snapshotData) {
              // Example implementation
              const result = new Map<string, Snapshot<T, K>>();
              // Populate the map based on some logic
              return result; // Ensure a Map or null/undefined is returned
          }
          return null; // Return null if there's no valid snapshot data
        },
        deleteSnapshot: (id: string) => {},
        isCore: false,
        snapConfig: snapConfig, // Directly use the storeConfig

        getSnapshots: (category: string, data: Snapshots<T, K>) => {},
        getAllSnapshots: (
          storeId: number,
          snapshotId: string,
          snapshotData: T,
          timestamp: string,
          type: string,
          event: Event,
          id: number,
          snapshotStore: SnapshotStore<T, K>,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<T, K>,
          data: T,
          filter?: (snapshot: Snapshot<T, K>) => boolean,
          dataCallback?: (
            subscribers: Subscriber<T, K>[],
            snapshots: Snapshots<T, K>
          ) => Promise<SnapshotUnion<T, K, Meta>[]>
        ): Promise<Snapshot<T, K>[]> =>{
          // Implement logic to get all snapshots
          const allSnapshots: Snapshot<T, K>[] = []; // Placeholder for collected snapshots

          // Example implementation, you can add logic based on your needs
          if (filter) {
              // Filter snapshots if the filter function is provided
              return Promise.resolve(allSnapshots.filter(filter));
          }

          return Promise.resolve(allSnapshots); // Ensure you return an array of snapshots
        },
      
        // Provide an implementation for generateId
        generateId: (
          prefix: string,
          name: string,
          type: NotificationTypeEnum,
          id?: string,
          title?: string,
          chatThreadName?: string,
          chatMessageId?: string,
          chatThreadId?: string,
          dataDetails?: DataDetails<T, K>,
          generatorType?: string
        ) => {
            // Implement ID generation logic
            return `${prefix}-${name}-${id || 'default'}`; // Example implementation
        },
        
        compareSnapshots: (snap1: Snapshot<T, K>, snap2: Snapshot<T, K>) => {
          const differences: Partial<Record<keyof Snapshot<T, K>, { snapshot1: any; snapshot2: any }>> = {};
          let hasDifferences = false;

          // Compare each property in the snapshots
          for (const key in snap1) {
            if (Object.prototype.hasOwnProperty.call(snap1, key)) {
              const typedKey = key as keyof Snapshot<T, K>;
              if (snap1[typedKey] !== snap2[typedKey]) {
                differences[typedKey] = {
                  snapshot1: snap1[typedKey],
                  snapshot2: snap2[typedKey],
                };
                hasDifferences = true;
              }
            }
          }

          if (!hasDifferences) {
            return null; // Return null if no differences are found
          }

          return {
            snapshot1: snap1,
            snapshot2: snap2,
            differences,
            versionHistory: {
              snapshot1Version: snap1.version, // Assuming `version` is a property on the snapshot
              snapshot2Version: snap2.version,
            },
          };
        },
        
        // Provide functional or placeholder implementations for these properties
        compareSnapshotItems: (
          snap1: Snapshot<T, K>,
          snap2: Snapshot<T, K>,
          keys: (keyof Snapshot<T, K>)[]
        ) => {
          const itemDifferences: Record<string, {
            snapshot1: any;
            snapshot2: any;
            differences: { [key: string]: { value1: any; value2: any } };
          }> = {};
        
          // Compare each key and check for differences
          keys.forEach((key) => {
            const value1 = snap1[key];
            const value2 = snap2[key];
            if (value1 !== value2) {
              itemDifferences[String(key)] = {
                snapshot1: value1,
                snapshot2: value2,
                differences: {
                  [String(key)]: { value1, value2 },
                },
              };
            }
          });
        
          // Return null if there are no differences
          return Object.keys(itemDifferences).length > 0 ? { itemDifferences } : null;
        },

        batchTakeSnapshot: async (
          id: number,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          snapshotStore: SnapshotStore<T, K>,
          snapshots: Snapshots<T, K>
        ): Promise<{ snapshots: Snapshots<T, K> }> => {
          // Fetch and validate data
          const fetchedData = snapshotApi.getSnapshotData<T, K>(snapshotId);
          if (!isSnapshotDataType(fetchedData)) {
            throw new Error(`Invalid data for snapshot ID: ${snapshotId}`);
          }

          
          const data: SnapshotDataType<T, K> = fetchedData;

          // Define the missing parameters
          const baseData: T = data; // You may need to adapt this depending on your data structure
          const baseMeta: Map<string, Snapshot<T, K>> = new Map(); // Populate this as needed
          const category: symbol | string | Category = 'exampleCategory'; // Replace with your actual category value

          // Conditional logic for snapshots array or object
          let updatedSnapshots: Snapshots<T, K>;
          if (isSnapshotsArray(snapshots)) {
            updatedSnapshots = [
              ...(snapshots as SnapshotsArray<T, K>),
              await createSnapshotInstance(
                baseData, // baseData
                baseMeta, // baseMeta
                snapshotId, // snapshotId
                category, // category
                snapshotStore, // snapshotStore
                snapshotManager, // snapshotManager
                null, // snapshotStoreConfig (or replace with actual value)
              ),
            ];
          } else {
            updatedSnapshots = {
              ...snapshots,
              [snapshotId]: await createSnapshotInstance( // Ensuring we await the promise here
                baseData, // baseData
                baseMeta, // baseMeta
                snapshotId, // snapshotId
                category, // category
                snapshotStore, // snapshotStore
                snapshotManager, // snapshotManager
                snapshotStoreConfigInstance, // snapshotStoreConfig (or replace with actual value)
              ),
            };
          }        

          return { snapshots: updatedSnapshots };
        },
      
      
        batchTakeSnapshotsRequest: async (
          criteria: CriteriaType,
          snapshotData: (snapshotIds: string[], snapshots: Snapshots<T, K>, subscribers: Subscriber<T, K>[]) => Promise<{ subscribers: Subscriber<T, K>[] }>
        ) => {
          // Example: Process criteria and use snapshotData function
          await snapshotData([], [], []);
        
          // No explicit return type is required
        },
        
        batchUpdateSnapshotsRequest: (
          snapshotData: (
            subscribers: SubscriberCollection<T, K>
          ) => Promise<{
            subscribers: SubscriberCollection<T, K>; 
            snapshots: Snapshots<T, K>; }>, 
            snapshotManager: SnapshotManager<T, K>
        ): Promise<void> =>{},
        filterSnapshotsByStatus: (status: StatusType): Snapshots<T, K> => {},
        filterSnapshotsByCategory: (category: Category): Snapshots<T, K> => {},
        filterSnapshotsByTag: (tag: Tag<T, K>): Snapshots<T, K> => {},
       
        batchFetchSnapshotsSuccess: (
          subscribers: SubscriberCollection<T, K>[], 
          snapshots: Snapshots<T, K>) => {},
        batchFetchSnapshotsFailure: (
          date: Date, 
          snapshotManager: SnapshotManager<T, K, StructuredMetadata<T, K>, never>, 
          snapshot: Snapshot<T, K, StructuredMetadata<T, K>, never>, 
          payload: { error: Error; }
        ) => {},
        batchUpdateSnapshotsSuccess: (
          subscribers: SubscriberCollection<T, K>,
          snapshots: Snapshots<T, K>
        ) => {},
        batchUpdateSnapshotsFailure: (
          date: Date,
        snapshotId: string | number | null,
        snapshotManager: SnapshotManager<T, K>,
        snapshot: Snapshot<T, K>,
        payload: { error: Error; }
        ) => {},
       
        handleSnapshotSuccess: (
          message: string,
          snapshot: Snapshot<T, K> | null,
          snapshotId: string
        ) => {},
        handleSnapshotFailure: (error: Error, snapshotId: string) => {},
        getSnapshotId: (key: string | T, snapshot: Snapshot<T, K>): string => {
          return ""
        },
        compareSnapshotState: (snapshot1: Snapshot<T, K> | null, snapshot2: Snapshot<T, K>): boolean => {
          throw new Error("Function not implemented.");
        },
        
        payload: {},
        dataItems: (): RealtimeDataItem[] | null => {},
        newData: null,
        getInitialState: (): Snapshot<T, K> | null => {},
        
        getConfigOption: (optionKey: string) => {},
        getTimestamp: (): Date | undefined => {},
        getStores: (
          storeId: number,
          snapshotId: string,
          snapshotStores?: SnapshotStoreReference<T, K>[],
          snapshotStoreConfigs: SnapshotStoreConfig<T, K>[],
        ): SnapshotStore<T, K>[] =>{},
          
        getData: (
          id: number | string,
          snapshotStore: SnapshotStore<T, K>
        ): BaseData<any> | Map<string, Snapshot<T, K>> | null | undefined => {},
        getDataVersions: (id: number): Promise<Snapshot<T, K>[] | undefined> => {},
        updateDataVersions: (id: number, versions: Snapshot<T, K>[]): void => {},
        setData: (id: string, data: Map<string, Snapshot<T, K>>) => {},
        addData: (id: string, data: Partial<Snapshot<T, K>>) => {},
       
        removeData: (id: number,) => {},
        updateData: (id: number, newData: Snapshot<T, K>) => {},
        stores: (storeProps: SnapshotStoreProps<T, K>): SnapshotStore<T, K>[] => {},
        getStore: (
          storeId: number,
          snapshotStore: SnapshotStore<T, K>,
          snapshotId: string | null,
          snapshot: Snapshot<T, K>,
          snapshotStoreConfig: SnapshotStoreConfig<T, K>,
          type: string,
          event: Event
        ): SnapshotStore<T, K> | null => {},
        addStore: (
          storeId: number,
          snapshotId: string | nul,
          snapshotStore: SnapshotStore<T, K>,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event
        ): SnapshotStore<T, K> | null => {},
        mapSnapshot: (
          id: number,
          storeId: string | number,
          snapshotStore: SnapshotStore<T, K>,
          snapshotContainer: SnapshotContainer<T, K>,
          snapshotId: string,
          criteria: CriteriaType,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event,
          callback: (snapshot: Snapshot<T, K>) => void,
          mapFn: (item: T) => T,
          isAsync?: boolean // Flag to determine behavior
        ): Promise<string | undefined> | Snapshot<T, K> | null => {},
        
        mapSnapshotWithDetails: (
          storeId: number,
          snapshotStore: SnapshotStore<T, K>,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event,
          callback: (snapshot: Snapshot<T, K>) => void,
          details: any
        ): SnapshotWithData<T, K> | null => {},
        
        removeStore: (
          storeId: number,
          store: SnapshotStore<T, K>,
          snapshotId: string,
          snapshot: Snapshot<T, K>,
          type: string,
          event: Event
        ) => {},
       
        unsubscribe: (
          unsubscribeDetails: {
            userId: string; snapshotId: string;
            unsubscribeType: string;
            unsubscribeDate: Date;
            unsubscribeReason: string;
            unsubscribeData: any;
          },
            event: string,
            callback: Callback<Snapshot<T, K>> | null
        ) => {},

        fetchSnapshot: async (
          snapshotId: string,
          callback: (
            snapshotId: string,
            payload: FetchSnapshotPayload<T> | undefined,
            snapshotStore: SnapshotStore<T, K>,
            payloadData: T | BaseData<any>,
            category: Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            timestamp: Date,
            data: T,
            delegate: SnapshotWithCriteria<T, K>[]
          ) => Snapshot<T, K>
        ): Promise<{
          id: string;
          category: Category;
          categoryProperties: CategoryProperties;
          timestamp: Date;
          snapshot: Snapshot<T, K>;
          data: BaseData;
          delegate: SnapshotWithCriteria<T, K>[];
        }> => {
          try {
            // Fetch snapshot payload
            const payload = await fetchSnapshotPayload(snapshotId);
      
            if (!payload) {
              throw new Error(`No payload found for snapshot ID: ${snapshotId}`);
            }
      
            const timestamp = new Date();
            const data = payload.data as T;
            const category = payload.category;
            const categoryProperties = payload.categoryProperties;
            const delegate = payload.delegate as SnapshotWithCriteria<T, K>[];
      
            // Use the callback to create a snapshot
            const snapshotStore = createSnapshotStoreInstance<T, K>(snapshotId);
            const snapshot = callback(
              snapshotId,
              payload,
              snapshotStore,
              data,
              category,
              categoryProperties,
              timestamp,
              data,
              delegate
            );
      
            return {
              id: snapshotId,
              category,
              categoryProperties,
              timestamp,
              snapshot,
              data,
              delegate,
            };
          } catch (error: any) {
            throw new Error(`Failed to fetch snapshot: ${error.message}`);
          }
        },
        fetchSnapshotSuccess: "",
        updateSnapshotFailure: "",
       
        fetchSnapshotFailure: (snapshotId: string, snapshotManager: SnapshotManager<T, K>, snapshot: Snapshot<T, K>, date: Date | undefined, payload: { error: Error; }) =>{},
        addSnapshotFailure: (
          date: Date, 
          snapshotManager: SnapshotManager<T, K>, 
          snapshot: Snapshot<T, K>, 
          payload: { error: Error; }
        ) => { },
        // Example usage within one of the SnapshotMethods
        configureSnapshotStore: (
          snapshotStore: SnapshotStore<T, K>,
          storeId: number,
          snapshotId: string,
          data: Map<string, Snapshot<T, K>>,
          events: Record<string, CalendarManagerStoreClass<T, K>[]>,
          dataItems: () => RealtimeDataItem[] | null,
          newData: Snapshot<T, K>,
          payload: ConfigureSnapshotStorePayload<T, K>,
          store: SnapshotStore<any, K>,
          callback: (snapshotStore: SnapshotStore<T, K>) => void,
          config: SnapshotStoreConfig<T, K>
        ) => {
          // Initialize the SnapshotContainer
          const snapshotContainer = configureSnapshotContainer({}, {
            snapshotStore,
            storeId,
            data,
            events,
            dataItems,
            newData,
            payload,
            store,
            config
          });

          // Proceed with other operations using snapshotContainer
          callback(snapshotStore);
        },
        updateSnapshotSuccess: (
          snapshotId: string, 
          snapshotManager: SnapshotManager<T, K>,
          snapshot: Snapshot<T, K>,
          payload?: { data?: Error | undefined; } | undefined
        ) => { },
       
        createSnapshotFailure: (date: Date,
          snapshotId: string, 
          snapshotManager: SnapshotManager<T, K>, 
          snapshot: Snapshot<T, K>, 
          payload: { error: Error; }) =>{},
        createSnapshotSuccess: (
          snapshotId,
          snapshotManager,
          snapshot,
          payload
        ) => {
          if (payload?.data) {
            snapshotManager.updateSnapshot(snapshotId, payload.data);
          } else {
            snapshotManager.addSnapshot(snapshotId, snapshot);
          }
          console.log(`Snapshot with ID ${snapshotId} created successfully.`);
        },
        createSnapshots: (
          id,
          snapshotId,
          snapshots,
          snapshotManager,
          payload,
          callback,
          snapshotDataConfig,
          category,
          categoryProperties
        ) => {
          const createdSnapshots = snapshots.map((snapshot, index) => {
            const config = snapshotDataConfig ? snapshotDataConfig[index] : undefined;
            snapshotManager.addSnapshot(snapshotId, snapshot);
            if (category) snapshot.setCategory(category, categoryProperties);
            return snapshot;
          });

          if (callback) callback(createdSnapshots);
          return createdSnapshots;
        },
        onSnapshot: (snapshotId, snapshot, type, event, callback) => {
          snapshot.registerEvent(type, event);
          callback(snapshot);
          console.log(`Event of type ${type} handled for snapshot ID ${snapshotId}`);
        },

        onSnapshots: (id, snapshot) => {
          const snapshotId = snapshot.getSnapshotById();
          console.log(`Snapshots updated for parent ID ${id}`);
          return snapshotId ? String(snapshotId) : null;
        },

        getParentId: (id, snapshot) => {
          const parentSnapshot = snapshot.getParentId(id, snapshot);
          return parentSnapshot ? String(parentSnapshot.getId()) : null;
        },

        mappedSnapshotData: "",
        criteria: "",
        snapshotCategory: "",
        snapshotSubscriberId: "",
       
   
        // Corrected getChildIds method
        getChildIds: (id: string, childSnapshot: Snapshot<T, K>): (string | number | undefined)[] => {
          // Logic to retrieve child IDs from the childSnapshot
          return []; // Return an empty array for demonstration
        },
        addChild: (
          parentId: string, 
          childId: string, 
          childSnapshot: CoreSnapshot<T, K>

        ) => {},
        removeChild: (
          childId: string,
          parentId: string, 
          parentSnapshot: CoreSnapshot<T, K>, 
          childSnapshot: CoreSnapshot<T, K>
        ) => {},
        getChildren: (id: string, childSnapshot: Snapshot<T, K>): CoreSnapshot<T, K>[] => {},
        hasChildren: (id: string): boolean => {},
        isDescendantOf: (childId: string, parentId: string, parentSnapshot: Snapshot<T, K>, childSnapshot: Snapshot<T, K>): boolean => {},
        getSnapshotById: (id: string): Snapshot<T, K> | null => {},
       

        timestamp: undefined,
        find: (id: string): SnapshotStore<T, K> | undefined => {
          // Logic for finding a snapshot within the container
          // If snapshots is an array
          return snapshotContainer.snapshots.find(snapshot => snapshot.id === id);
        },
        initialState: {}, // Initial state if needed

        data: new Map(), // Initializing data with a Map or your required data structure
        snapshotStore: null, // This can be set dynamically later
        criteria: {}, // Define criteria if needed, otherwise set to an empty object
        content: undefined, // Placeholder for snapshot content
        snapshotCategory: undefined, // Set dynamically or as needed
        snapshotSubscriberId: undefined, // Initialize or set dynamically
        snapshotContent: undefined, // Snapshot content to be populated later

        currentCategory: undefined, // Assuming this should be initialized
        mappedSnapshotData: new Map<string, Snapshot<T, K>>(),
        // snapshottData: 
        setSnapshotCategory: (id: string, newCategory: string | Category) => {
          // Implementation needed
        },

        getSnapshotCategory: (id: string): Category | undefined => {
          // Implementation needed
          return undefined;
        },

        snapshot: async (
          id: string | number | null | undefined,
          snapshotData: SnapshotData<T, K>,
          category: symbol | string | Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          callback: (snapshotStore: SnapshotStore<T, K>) => void,
          dataStore: DataStore<T, K>,
          dataStoreMethods: DataStoreMethods<T, K>,
          // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
          metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>,
          subscriberId: string, // Add subscriberId here
          endpointCategory: string | number, // Add endpointCategory here
          storeProps: SnapshotStoreProps<T, K>,
          snapshotConfigData: SnapshotConfig<T, K>,
          subscription: Subscription<T, K>,
          snapshotId?: string | number | null,
          snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
          snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
        ): Promise<{ snapshot: Snapshot<T, K> }> => {

          // Logic for generating or retrieving `storeId`
          const storeId = id ? `store-${id}` : "defaultStoreId";

          // Define the base URL, this could be retrieved from a config file or environment variable
          const baseURL = process.env.BASE_URL || "https://api.example.com";

          // Enable or disable features based on conditions (e.g., environment or metadata)
          const enabled = metadata?.enableSnapshot || true;

          // Set retry-related properties based on system configurations
          const maxRetries = metadata?.maxRetries || 5;
          const retryDelay = metadata?.retryDelay || 1000; // in milliseconds

          // Determine the max age and stale while revalidate timeframes based on metadata
          const maxAge = metadata?.maxAge || 3600; // Default to 1 hour
          const staleWhileRevalidate = metadata?.staleWhileRevalidate || 600; // Default to 10 minutes

          // Cache key logic based on category or snapshotId
          const cacheKey = `${typeof category === 'symbol' ? String(category) : category || "default"}-snapshot-${snapshotId}`;

          // Event records could be something like logs or metrics
          const eventRecords = metadata?.eventRecords || [];

          // Date and type logic based on the snapshot or system context
          const date = new Date(); // Current timestamp
          const type = "snapshot"; // Or dynamically determine based on context

          // Callback functions that might be used within the snapshot process
          const callbacks = {
            onSnapshotCreate: (snapshot: Snapshot<T, K>) => {
              console.log("Snapshot created:", snapshot);
            },
            onSnapshotError: (error: Error) => {
              console.error("Snapshot error:", error);
            }
          };


          // Use the properties like timestamp, criteria, etc., as needed
          
          if (snapshotContainer && 'onInitialize' in snapshotContainer) {
            const { timestamp, criteria, snapshotStore, content, snapshotCategory, snapshotSubscriberId, description,
              isCore, initialState, data, onInitialize 
            } = snapshotContainer;
            
            // Use the properties here
          }
          if (criteria === undefined && description === undefined) {
            throw new Error("You must define a criteria")
          }
          // const description: string | undefined = storeProps.description; // Could be optional
          const priority: string | undefined = storeProps.priority; // Optional
          const version: string | VersionData | VersionData[] | null = storeProps.version; // Optional versioning
          const additionalData: CustomSnapshotData<T, K,  StructuredMetadata<T, K>> | undefined = storeProps.additionalData; // Custom additional data

          // Define or retrieve `existingConfigs` from somewhere in your system
          const existingConfigs: Map<string, SnapshotConfig<T, K>> = storeProps.existingConfigs || new Map();


          // Snapshot configuration that could include additional settings
          const snapshotConfig = createSnapshotConfig(
          String(snapshotId),
          "prefix-value",     
          "name-value",       
          NotificationTypeEnum.CreateSnapshotConfig, 
        
          existingConfigs, snapshotData, category, criteria, storeProps.config, isCore,
          onInitialize,
          Number(storeId), description, metadata, priority, version, additionalData)

          // Subscription management logic
          const subscribeToSnapshots = () => {
            console.log("Subscribed to snapshots");
          };

          const subscribeToSnapshot = () => {
            console.log("Subscribed to a specific snapshot");
          };

          const unsubscribeToSnapshots = () => {
            console.log("Unsubscribed from snapshots");
          };

          const unsubscribeToSnapshot = () => {
            console.log("Unsubscribed from a specific snapshot");
          };

          // Delegate logic to handle operations
          const delegate = {
            execute: (operation: string) => {
              console.log(`Executing operation: ${operation}`);
            }
          };

          const getDelegate = () => delegate;

          const getCategory = () => category;

          const getSnapshotConfig = () => snapshotConfig;

          const getDataStoreMethods = () => dataStoreMethods;
          const snapshotMethods = {

            create: (snapshotData: SnapshotData<T, K>): Promise<Snapshot<T, K>> => {
              console.log("Creating snapshot...");

              return apiCall<T, K>(
                `${API_BASE_URL}/snapshot`,
                'POST',
                snapshotData
              )
                .then((createdSnapshot) => {
                  if (!createdSnapshot) {
                    return Promise.reject(new Error("Snapshot creation failed"));
                  }

                  console.log("Snapshot created successfully:", createdSnapshot);
                  return createdSnapshot;
                })
                .catch((error) => {
                  console.error("Error creating snapshot:", error);
                  throw error;
                });
            },

            update: (snapshotId: string | number | null, updatedData: SnapshotDataType<T, K>): Promise<Snapshot<T, K>> => {
              console.log("Updating snapshot...");

              return apiCall<T, K>(
                `${API_BASE_URL}/snapshot/${snapshotId}`,
                'PUT',
                updatedData
              )
                .then((updatedSnapshot) => {
                  if (!updatedSnapshot) {
                    return Promise.reject(new Error("Snapshot update failed"));
                  }

                  console.log("Snapshot updated successfully:", updatedSnapshot);
                  return updatedSnapshot;
                })
                .catch((error) => {
                  console.error("Error updating snapshot:", error);
                  throw error;
                });
            },

            delete: (snapshotId: string | number): Promise<Snapshot<T, K>> => {
              console.log("Deleting snapshot...");

              return apiCall<T, K>(
                `${API_BASE_URL}/snapshot/${snapshotId}`,
                'DELETE'
              )
                .then((deletedSnapshot) => {
                  if (!deletedSnapshot) {
                    return Promise.reject(new Error("Snapshot deletion failed"));
                  }

                  console.log("Snapshot deleted successfully:", deletedSnapshot);
                  return deletedSnapshot;
                })
                .catch((error) => {
                  console.error("Error deleting snapshot:", error);
                  throw error;
                });
            }
          }


          // Handling snapshot operations (e.g., map, sort, categorize)
          const handleOperation = (operationType: SnapshotOperationType, context: string) => {
            switch (operationType) {
              case SnapshotOperationType.MapSnapshot: // Handling Map and MapSnapshot together
              case SnapshotOperationType.Map: // Assuming a string version exists for clarity
                console.log(`Mapping ${context} data...`);
                break;
              case SnapshotOperationType.SortSnapshot: // Assuming a string version exists for clarity
              case SnapshotOperationType.Sort: // Handling Sort and SortSnapshot together
                console.log(`Sorting ${context} data...`);
                break;
              case SnapshotOperationType.CategorizeSnapshot: // Handling Categorize and CategorizeSnapshot together
              case SnapshotOperationType.Categorize: // Handling Categorize and CategorizeSnapshot together
                console.log(`Categorizing ${context} data...`);
                break;
              case SnapshotOperationType.SearchSnapshot: // Handling Search and SearchSnapshot together
              case SnapshotOperationType.Search: // Handling Search and SearchSnapshot together
                console.log(`Searching ${context} data...`);
                break;
              default:
                console.log(`Unhandled ${context} operation: ${operationType}`);
            }
          };


          // Handling snapshot operations
          const handleSnapshotOperation = (operationType: SnapshotOperationType) => {
            handleOperation(operationType, "snapshot");
          };

          // Handling snapshot store operations
          const handleSnapshotStoreOperation = (
            snapshotId: string,
            snapshotStore: SnapshotStore<T, K>,
            snapshot: Snapshot<T, K>,
            operation: SnapshotOperation<T, K>,
            operationType: SnapshotOperationType,
            callback: (snapshotStore: SnapshotStore<T, K>) => void,
          ) => {
            switch (operationType) {
              case SnapshotOperationType.CreateSnapshot:
                console.log("Creating snapshot store...");
                break;
              case SnapshotOperationType.UpdateSnapshot:
                console.log("Updating snapshot store...");
                break;
              case SnapshotOperationType.DeleteSnapshot:
                console.log("Deleting snapshot store...");
                break;
              case SnapshotOperationType.FindSnapshot:
                console.log("Finding snapshot store...");
                break;
              default:
                // Use the common operation handler for the rest
                handleOperation(operationType, "snapshot store");
            }
          };
          // Display toast notifications if needed
          const displayToast = (message: string) => {
            console.log(`Toast: ${message}`);
          };

          // Add to snapshot list logic
          const addToSnapshotList = (snapshot: Snapshot<T, K>) => {
            console.log("Adding to snapshot list:", snapshot);
          };


          const validateSnapshot = (snapshot: Snapshot<T, K>) => {
            console.log("Validating snapshot:", snapshot);
          }

          // Find the subscriber
          const subscriber = await snapshotApi.findSubscriberById(subscriberId, category, endpointCategory);

          // Use the flexible type SubscriberCollection
          const subscribers: SubscriberCollection<BaseData, BaseData> = [subscriber];

          // Fetch snapshots for the subscriber
          const snapshots = await snapshotApi.findSnapshotsBySubscriber(subscriberId, category, endpointCategory, snapshotConfig);

          // Convert snapshots to Snapshot<BaseData, BaseData> type
          const convertedSnapshots: Snapshot<BaseData, BaseData>[] = snapshots.map(
            (snapshot) => snapshot as unknown as Snapshot<BaseData, BaseData>
          );

          // Use the imported `batchUpdateSnapshots` function with proper arguments
          const batchUpdateSnapshotsResult = await batchUpdateSnapshots(
            subscribers,
            convertedSnapshots
          );

          // Simulated data source that might represent a mock or testing data set
          const simulatedDataSource = metadata?.simulatedDataSource || {};




          const {
            name,
            schema,
            config,
            operation,
            expirationDate,
            payload,
          } = storeProps;

          // Configuration settings for the snapshot store
          const snapshotStoreConfig = {
            storeId,
            category,
            cacheKey,
            snapshotId,
            maxAge,
            staleWhileRevalidate,
            enabled,
            delegate,
            subscribeToSnapshots,
            handleSnapshotOperation,
            displayToast,
            batchUpdateSnapshotsResult,
            addToSnapshotList,
            validateSnapshot,
            snapshotMethods,

            id,
            timestamp,
            find,
            initialState,
            data,
            snapshotStore,
            criteria,
            content,
            snapshotCategory,
            snapshotSubscriberId,
            snapshotContent,

            snapshots,
            getParentId,
            getChildIds,
            clearSnapshotFailure,
            mapSnapshots,
            state,
            getSnapshotById,
            handleSnapshot,
            subscribers,
            getSnapshotId,
            snapshot,
            createSnapshot,
            createSnapshotStore,
            updateSnapshotStore,
            configureSnapshot,
            configureSnapshotStore,
            createSnapshotSuccess,
            createSnapshotFailure,
            batchTakeSnapshot,
            onSnapshot,
            onSnapshots,
            onSnapshotStore,
            snapshotData,
            mapSnapshot,
            createSnapshotStores,
            initSnapshot,
            clearSnapshot,
            clearSnapshotSuccess,
            addToSnapshotStoreList,
            fetchInitialSnapshotData,
            updateSnapshot,
            getSnapshots,
            getSnapshotItems,
            takeSnapshot,
            takeSnapshotStore,

            addSnapshot,
            addSnapshotSuccess,
            removeSnapshot,
            getSubscribers,
            addSubscriber,
            getSnapshot,
            getSnapshotContainer,
            getSnapshotVersions,
            fetchData,
            getAllSnapshots,
            getSnapshotStoreData,
            takeSnapshotSuccess,
            updateSnapshotFailure,
            takeSnapshotsSuccess,
            fetchSnapshot,
            addSnapshotToStore,
            getSnapshotSuccess,
            setSnapshotSuccess,
            setSnapshotFailure,
            updateSnapshotSuccess,
            updateSnapshotsSuccess,
            fetchSnapshotSuccess,
            updateSnapshotForSubscriber,
            updateMainSnapshots,
            batchProcessSnapshots,
            batchFetchSnapshotsRequest,
            batchTakeSnapshotsRequest,
            batchUpdateSnapshotsRequest,
            batchFetchSnapshots,
            getData,
            batchFetchSnapshotsSuccess,
            batchFetchSnapshotsFailure,
            batchUpdateSnapshotsFailure,
            notifySubscribers,
            notify,
            getCategory,
            updateSnapshots,
            updateSnapshotsFailure,

            flatMap,
            setData,
            getState,
            setState,
            handleActions,
            setSnapshots,
            mergeSnapshots,

            reduceSnapshots,
            sortSnapshots,
            filterSnapshots,
            findSnapshot,

            subscribe,
            unsubscribe,
            fetchSnapshotFailure,
            generateId,
            useSimulatedDataSource,
            simulatedDataSource,
          }

          const options: SnapshotStoreOptions<T, K> = {
            id: id ? id.toString() : undefined,
            data: snapshotData,
            metadata: metadata,
            criteria: {},
            storeId: convertStoreId(storeId),
            baseURL,
            enabled,
            maxRetries,
            retryDelay,
            maxAge,
            staleWhileRevalidate,
            cacheKey,
            eventRecords,
            category,
            date,
            type,
            snapshotId,
            snapshotStoreConfig,
            callbacks,
            snapshotConfig,
            subscribeToSnapshots,
            subscribeToSnapshot,
            unsubscribeToSnapshots,
            unsubscribeToSnapshot,
            delegate,
            getDelegate,
            getCategory,
            getSnapshotConfig,
            dataStoreMethods,
            getDataStoreMethods,
            snapshotMethods,
            handleSnapshotOperation,
            handleSnapshotStoreOperation,
            displayToast,
            batchUpdateSnapshotsResult,
            addToSnapshotList,
            simulatedDataSource
          };


          // const operation: SnapshotOperation<T, K> = {
          //   operationType: SnapshotOperationType.CreateSnapshot
          // }

          // Check for missing required fields
          if (!name || !version || !operation) {
            throw new Error("Name, operation and version are required for SnapshotStore");
          }

          if (!snapshotStore) {
            const snapshotStore = new SnapshotStore<T, K>({
              storeId,
              name,
              version,
              schema,
              options,
              category,
              config,
              operation,
              expirationDate,
              payload, callback, storeProps, endpointCategory,
            }
            );
            return { snapshot: {} as Snapshot<T, K> }
          }

          return {
            snapshot: await snapshotStore.createSnapshot()
          };
        },


        // Step 2: Update the snapshotData method to use T and K generics
        snapshotData: (
          id: string | number | undefined,
          snapshotId?: string | number | null,
          data: Snapshot<T, K>,
          mappedSnapshotData: Map<string, Snapshot<T, K>> | null | undefined,
          snapshotData: SnapshotData<T, K>,
          snapshotStore: SnapshotStore<T, K>,
          category: Category | undefined,
          categoryProperties: CategoryProperties | undefined,
          dataStoreMethods: DataStore<T, K>,
          storeProps: SnapshotStoreProps<T, K>
        ): Promise<SnapshotDataType<T, K>> => {
          // Destructure storeProps for relevant properties
          const { storeId, name, version, schema, options, config, operation, expirationDate ,
            payload, callback, endpointCategory
          } = storeProps;

          return new Promise<SnapshotDataType<T, K>>(async (resolve, reject) => {
            try {


              // Create new SnapshotStore using constructor
              const snapshotStore = new SnapshotStore<T, K>({
                storeId,
                name,
                version,
                schema,
                options,
                category,
                config,
                operation,
                expirationDate,
                payload, callback, storeProps, endpointCategory,
                initialState
              });




              // Initialize missing properties
              const timestamp = new Date().getTime(); // Example of using current time
              const isCore = true; // Example, could be set dynamically
              const notify = (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition) => {
                // Implement the logic for notifying here
              };


              const items: ContentItem[] = []; // Assuming items is an array of type T
              const configOption = {}; // Example placeholder for config option

              const subscribers: SubscriberCollection<T, K> = []; // Assuming a specific type for your subscribers
              let data = snapshotData; // Example, using passed snapshotData
              const stores: SnapshotStore<T, K>[] = []; // Assuming stores is an array of SnapshotStore with T and K types

              // Helper functions
              const notifySubscribers = (
                message: string,
                subscribers: Subscriber<T, K>[],
                data: Partial<SnapshotStoreConfig<T, K>>
              ): Subscriber<T, K>[] => {
                // Implement notification logic
                return subscribers.map(subscriber => {
                  // Logic to notify each subscriber
                  return subscriber;
                });
              };

              const getSnapshots = () => [snapshotStore]; // Example: returning array with current store
              const getAllSnapshots = async (
                storeId: number,
                snapshotId: string,
                snapshotData: T,
                timestamp: string,
                type: string,
                event: Event,
                id: number,
                snapshotStore: SnapshotStore<T, K>,
                category: Category,
                categoryProperties: CategoryProperties | undefined,
                dataStoreMethods: DataStore<T, K>,
                data: T,
                dataCallback?: (subscribers: Subscriber<T, K>[], snapshots: Snapshots<T, K>) => Promise<SnapshotUnion<T, K, Meta>[]>
              ): Promise<Snapshot<T, K>[]> => {
                // Logic to fetch all snapshots
                const snapshots = await snapshotStore.getAllSnapshots(
                  storeId, snapshotId, snapshotData, timestamp, type, event, id, snapshotStore, category, categoryProperties, dataStoreMethods, data, dataCallback,
                );
                return Promise.resolve(snapshots); // Ensure it returns a promise
              };

              const generateId = () => `${Date.now()}`; // Example: generating an ID based on timestamp

              const compareSnapshots = (
                snapshotA: Snapshot<T, K>,
                snapshotB: Snapshot<T, K>
              ) => {
                const differences: Record<string, { snapshot1: any; snapshot2: any }> = {};
                // Compare snapshots and populate differences

                const versionHistory = {
                  snapshot1Version: snapshotA.version,
                  snapshot2Version: snapshotB.version,
                }

                return {
                  snapshot1: snapshotA,
                  snapshot2: snapshotB,
                  differences,
                  versionHistory,
                };
              };

              const compareSnapshotItems = <
                T extends  BaseData<any>,
                K extends  BaseData<any>,
                Key extends keyof Snapshot<T, K>
              >(
                snap1: Snapshot<T, K>,
                snap2: Snapshot<T, K>,
                keys: Key[]
              ) => {
                const itemDifferences: Record<string, any> = {};

                keys.forEach((key) => {
                  if (snap1[key] !== snap2[key]) {
                    itemDifferences[key] = {
                      snapshot1: snap1[key],
                      snapshot2: snap2[key],
                      differences: {
                        value1: snap1[key],
                        value2: snap2[key],
                      },
                    };
                  }
                });

                if (Object.keys(itemDifferences).length === 0) {
                  return null; // No differences
                }

                return { itemDifferences };
              };

              const getStore = (storeId: string) => stores.find(store => store.storeId === storeId); // Get store by ID
              const addStore = (store: SnapshotStore<T, K>) => stores.push(store); // Add new store

              // Batch functions (placeholder implementations)
              const batchTakeSnapshot = async (
                snapshotId: string,
                snapshotStore: SnapshotStore<T, K>,
                snapshots: Snapshots<T, K>
              ): Promise<{ snapshots: Snapshots<T, K> }> => {
                // Perform snapshot taking logic
                // Assume some logic modifies the snapshots
                const updatedSnapshots = snapshots; // Your logic to update snapshots

                return { snapshots: updatedSnapshots };
              };

              const batchFetchSnapshots = async () => { /* Batch fetch logic */ };
              const batchTakeSnapshotsRequest = async () => { /* Batch take request logic */ };
              const batchUpdateSnapshotsRequest = async () => { /* Batch update request logic */ };
              const batchFetchSnapshotsSuccess = () => { /* Success handler for fetch */ };
              const batchFetchSnapshotsFailure = () => { /* Failure handler for fetch */ };
              const batchUpdateSnapshotsSuccess = () => { /* Success handler for update */ };
              const batchUpdateSnapshotsFailure = () => { /* Failure handler for update */ };

              // Filtering snapshots
              const filterSnapshotsByStatus = (status: string) => stores.filter(store => store.status === status);
              const filterSnapshotsByCategory = (category: Category) => stores.filter(store => store.category === category);
              const filterSnapshotsByTag = (tag: string) => stores.filter(store => store.tags.includes(tag));

              // Snapshot operation handlers
              const handleSnapshotSuccess = () => { /* Handle successful snapshot */ };
              const getSnapshotId = () => snapshotId; // Return current snapshot ID
              const compareSnapshotState = () => { /* Implement state comparison */ };
              const getInitialState = () => { /* Return initial state */ };
              const getConfigOption = () => configOption;
              const getTimestamp = () => timestamp;
              const getStores = () => stores;
              const getData = () => data;
              const setData = (newData: SnapshotData<T, K, never>) => { data = newData; };
              const addData = (newData: T) => { data = { ...data, ...newData }; };
              const mapSnapshot = () => { /* Implement snapshot mapping */ };
              const mapSnapshotWithDetails = () => { /* Implement snapshot mapping with details */ };
              const removeStore = (storeId: number) => stores.filter(store => store.storeId !== storeId);
              const unsubscribe = () => { /* Implement unsubscribe logic */ };
              const fetchSnapshot = async () => { /* Implement fetch logic */ };
              const fetchSnapshotSuccess = () => { /* Success handler for fetch */ };
              const updateSnapshotFailure = () => { /* Failure handler for update */ };
              const fetchSnapshotFailure = () => { /* Failure handler for fetch */ };
              const addSnapshotFailure = () => { /* Failure handler for add */ };
              const configureSnapshotStore = () => { /* Implement configuration logic */ };
              const updateSnapshotSuccess = () => { /* Success handler for update */ };
              const createSnapshotFailure = () => { /* Failure handler for creation */ };
              const createSnapshotSuccess = () => { /* Success handler for creation */ };
              const createSnapshots = () => { /* Implement creation logic */ };

              // Ensure the return value satisfies SnapshotDataType<T, K>
              const snapshotDataResult: SnapshotDataType<T, K> = {
                snapshotStore: snapshotStore,  // Or some other relevant structure,
                setSnapshotCategory: (newCategory: Category) => {
                  snapshotStore.category = newCategory;
                },
                getSnapshotCategory: () => snapshotStore.category,
                getSnapshotData: () => snapshotData,  // or some transformation of snapshotData
                deleteSnapshot: async () => {
                  // Implement logic for deleting snapshot
                },
                id,
                items,
                config,
                subscribers,
                data,
                timestamp,
                isCore,
                notify,

                notifySubscribers,
                getSnapshots,
                getAllSnapshots,
                generateId,

                compareSnapshots,
                compareSnapshotItems,
                batchTakeSnapshot,
                batchFetchSnapshots,

                batchTakeSnapshotsRequest,
                batchUpdateSnapshotsRequest,
                filterSnapshotsByStatus,
                filterSnapshotsByCategory,

                filterSnapshotsByTag,
                batchFetchSnapshotsSuccess,
                batchFetchSnapshotsFailure,
                batchUpdateSnapshotsSuccess,

                batchUpdateSnapshotsFailure,
                snapshot,
                handleSnapshotSuccess,
                getSnapshotId,

                compareSnapshotState,
                payload,
                dataItems,
                newData,
                getInitialState,
                getConfigOption,
                getTimestamp,
                getStores,

                getData,
                setData,
                addData,
                stores,
                getStore,
                addStore,
                mapSnapshot,
                mapSnapshotWithDetails,

                removeStore,
                unsubscribe,
                fetchSnapshot,
                fetchSnapshotSuccess,
                updateSnapshotFailure,
                fetchSnapshotFailure,
                addSnapshotFailure,
                configureSnapshotStore,

                updateSnapshotSuccess,
                createSnapshotFailure,
                createSnapshotSuccess,
                createSnapshots,

                storeId,
                snapConfig,
                onSnapshot,
                onSnapshots,
                events
                // Add other methods or properties that are required by SnapshotDataType<T, K>
              };


              // If you need to resolve with the snapshotStore instead of SnapshotDataType
              resolve(snapshotDataResult);

            } catch (error: any) {
              const errorMessage = `Failed to get specific snapshot data for ${name}`;
              handleApiError(error, errorMessage);
              reject(error);
            }
          });
        },

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

export type { ItemUnion, SnapshotBase, SnapshotCommonProps, SnapshotContainer, SnapshotContainerData, SnapshotDataType };

