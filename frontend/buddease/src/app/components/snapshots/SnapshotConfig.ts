
// SnapshotConfig.ts
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import ProjectMetadata, { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { IHydrateResult } from "mobx-persist";
import { useParams } from "next/navigation";
import { CreateSnapshotsPayload } from "../database/Payload";
import { ModifiedDate } from "../documents/DocType";
import { FileCategory } from "../documents/FileType";
import { InitializedData } from "../hooks/SnapshotStoreOptions";
import {
    SnapshotManager
} from "../hooks/useSnapshotManager";
import {
    fetchFileSnapshotData,
} from "../libraries/categories/determineFileCategory";
import { Category, CategoryIdentifier } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data, DataDetails } from "../models/data/Data";
import { K, T } from "../models/data/dataStoreMethods";
import {
    StatusType,
    SubscriberTypeEnum,
    SubscriptionTypeEnum
} from "../models/data/StatusType";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import CalendarManagerStoreClass from "../state/stores/CalendarEvent";
import { Subscription } from "../subscriptions/Subscription";
import {
    NotificationType,
    NotificationTypeEnum,
} from "../support/NotificationContext";
import { userId } from "../users/ApiUser";
import { Subscriber } from "../users/Subscriber";
import {
    triggerIncentives
} from "../utils/applicationUtils";
import Version from "../versions/Version";
import * as snapshotApi from "./../../api/SnapshotApi";
import {
    getCommunityEngagement,
    getMarketUpdates,
    getTradeExecutions,
} from "./../../components/trading/TradingUtils";
import { isSnapshot } from "./createSnapshotStoreOptions";
import {
    Snapshot,
    SnapshotUnion,
    Snapshots,
    UpdateSnapshotPayload
} from "./LocalStorageSnapshotStore";
import { SnapshotDataType } from "./SnapshotContainer";
import { CustomSnapshotData } from "./SnapshotData";
import { SnapshotItem } from "./SnapshotList";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { SnapshotStoreProps } from "./useSnapshotStore";

interface RetentionPolicy {
  retentionPeriod: number; // in days
  cleanupOnExpiration: boolean;
  retainUntil: Date;
}


interface ConfigureSnapshotStorePayload<T extends Data, K extends Data> {
  snapshotStore: SnapshotStore<T, K>;
  snapshotId: string;
  snapshotData: T;
  timestamp: Date;
  snapshotStoreConfig: SnapshotStoreConfig<T, K>;

  title: string;
  description: string;
  newData: T;  // Ensure this aligns with `newData` in UpdateSnapshotPayload
  createdAt: Date;
  updatedAt: Date;
  additionalData?: Record<string, any>;
  status: StatusType | undefined;
  category: string;
}


type TagsRecord = Record<string, string>;




interface SnapshotConfig<T extends Data, K extends Data> extends Snapshot<T, K> {
  id: string | number;
  description?: string;
  category: CategoryIdentifier | CategoryProperties;
  metadata?: StructuredMetadata | ProjectMetadata
  
  criteria: CriteriaType;
  priority?: string;
  version?: Version;
  data: InitializedData | undefined;
  subscribers: SubscriberCollection<T, K>;
  storeConfig: SnapshotStoreConfig<T, K> | undefined;
  additionalData: CustomSnapshotData | undefined
}





function createSnapshotConfig<T extends Data, K extends Data> (
  snapshotId: string,
  existingConfigs: Map<string, SnapshotConfig<T, K>>,
  snapshotData: SnapshotDataType<T, K>,
  category: symbol | string | Category | undefined = 'default-category',
  criteria: CriteriaType | undefined,
  storeConfig: SnapshotStoreConfig<T, K>, // Ensure this is provided and correctly typed
  isCore: boolean,
  onInitialize: () => void,
  storeId: number,
  description?: string | null | undefined,
  metadata?: StructuredMetadata | ProjectMetadata,
  priority?: string,
  version?: Version,
  additionalData?: CustomSnapshotData,
  initialState?: any, // Define types as needed
  initialConfig?: any, // Define types as needed

  onError?: (error: Error) => void,
  taskIdToAssign?: string,
  schema?: any, // Define types as needed
  currentCategory?: string,
  mappedSnapshotData?: Map<string, Snapshot<T, K>>, // Define types as needed
  versionInfo?: any, // Define types as needed
  initializedState?: any, // Define types as needed
  snapshot?: any, // Define types as needed
  setCategory?: ((category: Category) => void) | undefined,
  applyStoreConfig?: (snapshotStoreConfig?: SnapshotStoreConfig<SnapshotUnion<BaseData>, T> | undefined) => void,
  generateId?: (
    prefix: string,
    name: string,
    type: NotificationTypeEnum,
    id?: string,
    title?: string,
    chatThreadName?: string,
    chatMessageId?: string,
    chatThreadId?: string,
    dataDetails?: DataDetails,
    generatorType?: string
  ) => string,
  // Define types as needed
  snapshotContainer?: any, // Define types as needed
  getSnapshotItems?: () => (SnapshotStoreConfig<T, K> | SnapshotItem<T, K> | undefined)[], // Define types as needed
  defaultSubscribeToSnapshots?: (
    snapshotId: string, 
    callback: (snapshots: Snapshots<T>) => Subscriber<T, K> | null, 
    snapshot: Snapshot<T, K> | null
  ) => void,
  getAllSnapshots?: (
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
    dataCallback?: (
      subscribers: Subscriber<T, K>[],
      snapshots: Snapshots<T>
    ) => Promise<SnapshotUnion<T>[]>
  ) => Promise<Snapshot<T, K>[]>, 
  getSubscribers?: () => any, 
  transformDelegate?: (delegate: any) => any, 
  getAllKeys?: () => any, 
  getAllValues?: () => any, 
  getAllItems?: () => any, 
  getSnapshotEntries?: () => any, 
  getAllSnapshotEntries?: () => any, 
  addDataStatus?: (status: any) => void, 
  moveData?: (data: any) => void, 
  upteData?: (data: any) => void, 
  updateDataTitle?: (title: string) => void, 
  updateDataDescription?: (description: string) => void, 
  updateDataStatus?: (status: any) => void, 
  addDataSuccess?: () => void, 
  getDataVersions?: (id: number) => Promise<Snapshot<T, K>[] | undefined>,
  updateDataVersions?: (id: number, versions: Snapshot<T, K>[]) => void,
  getBackendVersion?: () => IHydrateResult<number> | Promise<string> | undefined, 
  getFrontendVersion?: () => IHydrateResult<number> | Promise<string> | undefined, 
  fetchStoreData?: (id: number) => Promise<SnapshotStore<T, K>[]>, 
  defaultSubscribeToSnapshot?: (snapshotId: string, callback: Callback<Snapshot<T, K>>, snapshot: Snapshot<T, K>) => string,
  handleSubscribeToSnapshot?: (snapshotId: string, callback: Callback<Snapshot<T, K>>, snapshot: Snapshot<T, K>) => void,
  removeItem?: (id: string | number) => void, 
  getSnapshot?: (id: string | number) => Snapshot<T, K>, 
  getSnapshotSuccess?: (snapshot: Snapshot<T, K>) => void, 
  setItem?: (item: any) => void, 
  getItem?: (id: string | number) => any, 
  getDataStore?: () => any, 
  getDataStoreMap?: () => any, 
  addSnapshotSuccess?: () => void, 
  deepCompare?: (a: any, b: any) => boolean, 
): SnapshotConfig<T, K> {
  if (existingConfigs.has(snapshotId)) {
    return existingConfigs.get(snapshotId)!;
  }

  if (!snapshotData || typeof snapshotData !== 'object') {
    throw new Error('Invalid snapshotData');
  }

  if(!description){
    throw new Error("There is no description provided")
  }
  const newSnapshotConfig: SnapshotConfig<T, K> = {
    id: snapshotId,
    description,
    category,
    metadata,
    criteria,
    priority,
    version,
    data: 'data' in snapshotData ? snapshotData.data : {},
    subscribers: 'subscribers' in snapshotData ? snapshotData.subscribers : {} as SubscriberCollection<T, K>,
    // config: 'storeConfig' in snapshotData ? snapshotData.storeConfig as SnapshotStoreConfig<T, K> : null, // Use null if not present
    // fetchData: 'fetchData' in snapshotData ? snapshotData.fetchData : null, // Use null if not present

    storeConfig,
    initialState,
    isCore,
    initialConfig,
    onInitialize,
    onError,
    taskIdToAssign,
    schema,
    currentCategory,
    mappedSnapshotData,
    storeId,
    versionInfo,
    initializedState,
    snapshot,
    setCategory,
    applyStoreConfig,
    generateId,
    snapshotContainer,
    getSnapshotItems,
    defaultSubscribeToSnapshots,
    getAllSnapshots,
    getSubscribers,
    transformDelegate,
    getAllKeys,
    getAllValues,
    getAllItems,
    getSnapshotEntries,
    getAllSnapshotEntries,
    addDataStatus,
    removeData,
    updateData,
    updateDataTitle,
    updateDataDescription,
    updateDataStatus,
    addDataSuccess,
    getDataVersions,
    updateDataVersions,
    getBackendVersion,
    getFrontendVersion,
    fetchStoreData,
    defaultSubscribeToSnapshot,
    handleSubscribeToSnapshot,
    removeItem,
    getSnapshot,
    getSnapshotSuccess,
    setItem,
    getItem,
    getDataStore,
    getDataStoreMap,
    addSnapshotSuccess,
    deepCompare,
    additionalData,
  };

  existingConfigs.set(snapshotId, newSnapshotConfig);

  return newSnapshotConfig;
}




// Example of asynchronous function using async/await
const updateSubscribersAndSnapshots = async (
  snapshotId: string,
  subscribers: Subscriber<T, K>[],
  snapshots: Snapshot<T, K>[]
): Promise<{
  subscribers: Subscriber<T, K>[];
  snapshots: Snapshot<T, K>[];
}> => {
  // Generate a subscription ID using a utility function
  const generateSubscriptionId = UniqueIDGenerator.generateID(
    "snap",
    "subscription",
    NotificationTypeEnum.Snapshot
  );

  try {
    const snapshotId = UniqueIDGenerator.generateSnapshotID();
    const category = process.argv[3] as keyof typeof FileCategory;
    const data = await fetchFileSnapshotData(FileCategory[category], snapshotId);    // Update each subscriber asynchronously
    const updatedSubscribers = await Promise.all(
      subscribers.map(async (subscriber: Subscriber<T, K>) => {
        // Ensure snapshots is an array and get the data from the method if necessary
        const snapshotsArray = await subscriber.snapshots()// Call the function if it's a method

        // Function to get snapshots based on category and filter them
        const filterSnapshotsByCategory = (
          snapshots: Snapshot<T, K>[],
          targetCategory: string
        ): Snapshot<T, K>[] => {
          const determineCategory = (snapshot: Snapshot<T, K>): string => {
            const category = snapshot.category;
            return typeof category === 'string' ? category : 'defaultCategory';
          };
          return snapshots.filter(snapshot => {
            const category = determineCategory(snapshot);
            return category === targetCategory;
          });
      
        }
        // Filter snapshots by the determined category
        const filteredSnapshots = filterSnapshotsByCategory(snapshotsArray, FileCategory[category]);

        // Define the base snapshot with default or placeholder implementations
        const createDefaultSnapshot = (snapshot: SnapshotStore<T, K>): Snapshot<T, K> => {
          return {
            ...snapshot as unknown as Snapshot<T, K>,
            data: snapshot.data,
            snapshots: filteredSnapshots as unknown as Snapshots<BaseData>,
            compareSnapshotState: snapshot.compareSnapshotState,
            eventRecords: snapshot.eventRecords ? snapshot.eventRecords : null,
            getParentId: snapshot.getParentId,
            getChildIds: (id: string,
              childSnapshot: Snapshot<BaseData, Data>
            ) => snapshot.getChildIds(id, childSnapshot),
            addChild: (
              parentId: string,
              childId: string, 
              childSnapshot: Snapshot<Data, Data>) => snapshot.addChild(parentId, childId, childSnapshot),
            removeChild: (childId: string,
              parentId: string, parentSnapshot: Snapshot<Data, Data>,
              childSnapshot: Snapshot<Data, Data>
            ) => snapshot.removeChild(childId,
              parentId,
              parentSnapshot, childSnapshot),
            getChildren: (id: string, childSnapshot: Snapshot<T, K>) => snapshot.getChildren(id, childSnapshot),
            hasChildren: () => false,
            isDescendantOf: (
              childId: string, parentId: string, 
              parentSnapshot: Snapshot<T, K>, childSnapshot: Snapshot<T, K>) => snapshot.isDescendantOf(childId, parentId, parentSnapshot, childSnapshot),

            dataItems: snapshot.dataItems,
            newData: snapshot.newData,
            stores: snapshot.stores,
            getStore: (
              storeId: number,
              snapshotId: string | null,
              snapshot: Snapshot<T, K>,
              snapshotStoreConfig: SnapshotStoreConfig<T, K>,
              type: string,
              event: Event
            ) => snapshot.getStore(storeId, snapshotId, snapshot, snapshotStoreConfig, type, event ) ?? null,

            addStore: (
              storeId: number, 
              snapshotId: string,
              snapshotStore: SnapshotStore<T, K>,
              snapshotInstance: Snapshot<T, K>, 
              type: string, event: Event
            ) => snapshot.addStore(storeId, snapshotId, snapshotStore, snapshotInstance, type, event),
            
            removeStore: (
              storeId: number,
              store: SnapshotStore<T, K>,
              snapshotId: string,
              snapshot: Snapshot<T, K>,
              type: string,
              event: Event
            ) => snapshot.removeStore(storeId, store, snapshotId, snapshot, type, event),
            createSnapshots: (
              id: string,
              snapshotId: string,
              snapshots: Snapshot<T, K> | Snapshot<T, K>[],
              snapshotManager: SnapshotManager<T, K>,
              payload: CreateSnapshotsPayload<T, K>,
              callback: (snapshots: Snapshot<T, K>[]) => void | null,
              snapshotDataConfig?: SnapshotConfig<T, K>[],
              category?: Category
            ) => snapshot.createSnapshots(id, snapshotId, snapshots, snapshotManager, payload, callback, snapshotDataConfig, category),
            events: {
              eventRecords: null,
              callbacks: {},
              subscribers: [],
              eventIds: [],
              on: () => {},
              off: () => {},
              emit: () => {},
              once: () => { },
              subscribe: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
                throw new Error("Function not implemented.");
              },
              unsubscribe: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
                throw new Error("Function not implemented.");
              },
              trigger: () => { },
              removeAllListeners: () => {},
              onSnapshotAdded: (snapshot: Snapshot<T, K>) => {
                throw new Error("Function not implemented.");
              },
              onSnapshotRemoved: (snapshot: Snapshot<T, K>) => {
                throw new Error("Function not implemented.");
              },
              onSnapshotUpdated: (
                snapshotId: string,
                snapshot: Snapshot<T, K>,
                data: Map<string, Snapshot<T, K>>,
                events: Record<string, CalendarManagerStoreClass<T, K>[]>,
                snapshotStore: SnapshotStore<T, K>,
                dataItems: RealtimeDataItem[],
                newData: Snapshot<T, K>,
                payload: UpdateSnapshotPayload<BaseData>,
                store: SnapshotStore<T, K>
              ) => {
                throw new Error("Function not implemented.");
              },
              addRecord: (
                event: string,
                record: CalendarManagerStoreClass<T, K>,
                callback: (snapshot: CalendarManagerStoreClass<T, K>) => void
              ) => { 
                throw new Error("Function not implemented.");
              },
            },
            meta: {},
            snapshot: (
              id: string | number | undefined,
              snapshotId: string | null,  
              snapshotData: SnapshotDataType<T, K>,
              category: symbol | string | Category | undefined,
              categoryProperties: CategoryProperties | undefined,
              callback: (snapshotStore: SnapshotStore<T, K>) => void,
              dataStore: DataStore<T, K>,
dataStoreMethods: DataStoreMethods<T, K>,
              metadata: UnifiedMetaDataOptions,
              subscriberId: string, // Add subscriberId here
              endpointCategory: string | number,// Add endpointCategory here
              storeProps: SnapshotStoreProps<T, K>,
              snapshotConfigData: SnapshotConfig<T, K>,
              snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
              snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
            ): Promise<{ snapshot: SnapshotStore<T, K> }> => {
              return new Promise((resolve) => {
                // Implement the function logic here
                resolve({ snapshot: snapshot });
              });
            },
          };
        };

        // Use reduce to construct updatedSnapshots with default snapshot objects
        const categorizedSnapshots = snapshotsArray.reduce<Record<string, Snapshot<T, K>[]>>((acc, snapshot) => {
          const category = (snapshot.category as string) ?? 'defaultCategory';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(createDefaultSnapshot(snapshot));
          return acc;
        }, {});


        // Flatten the record to an array of SnapshotUnion<Data>
        const updatedSnapshots: SnapshotUnion<Data>[] = Object.values(categorizedSnapshots).flat();  

        // Create a new Subscriber object with updated data
        const id = snapshotApi.fetchSnapshotById(snapshotId).toString();
        const subscriberObj: Subscriber<T, K> = {     
          ...subscriber,


          subscribersById: {} as Map<string, Subscriber<T, K>>,
          internalState: {} as Map<string, Snapshot<T, K>>,
          internalCache: {} as Map<string, Snapshot<T, K>>,
          enabled: true,
          id: undefined,
          _id: undefined,
          name: "",
          subscriberId: "",
          subscribers: [],
          onSnapshotCallbacks: [],
          onErrorCallbacks: [],
          onUnsubscribeCallbacks: [],
          notifyEventSystem: undefined,
          updateProjectState: undefined,
          logActivity: undefined,
          triggerIncentives: undefined,
          optionalData: null,
          email: "",
          snapshotIds: [],
          payload: undefined,
          data: {
            ...subscriber.data,
            snapshots: updatedSnapshots,
          },
          subscription: {
            subscriberId: subscriber.getSubscriberId() ??
              SubscriberTypeEnum.PortfolioUpdates,
            subscriberType: subscriber.getSubscriberType!(String(userId), id) ??
              SubscriberTypeEnum.PortfolioUpdates,
            subscriptionId: generateSubscriptionId,
            subscriptionType: SubscriptionTypeEnum.CommunityEngagement,
            portfolioUpdates: () => subscriber,
            tradeExecutions: () => getTradeExecutions(),
            marketUpdates: () => getMarketUpdates(),
            communityEngagement: () => getCommunityEngagement(),
            triggerIncentives: () => triggerIncentives({
              userId: subscriber.getSubscriberId(),
              incentiveType: SubscriberTypeEnum.PortfolioUpdates,
              params: useParams(),
            }),
            determineCategory: () => {
              const snapshotData = subscriber.data; // Ensure this is the correct type
              // You might need to check if snapshotData is null or undefined and handle it appropriately
              if (isSnapshot<Data, Data>(snapshotData)) {
                return subscriber.getDetermineCategory(snapshotData);
              }
              // Handle the case where snapshotData is not valid
              return null; // or any default behavior
            },
            subscribers: [],
            unsubscribe: () => {
              /* Unsubscribe logic */
            },
            portfolioUpdatesLastUpdated: {} as ModifiedDate,
          },
          toSnapshotStore: (
            initialState: Snapshot<T, K>,
            snapshotConfig: SnapshotStoreConfig<T, K>[]
          ): SnapshotStore<T, K>[] | undefined => {
            // Implement logic to convert subscriber data to SnapshotStore instance
            return undefined; // Replace with actual implementation
          },
          processNotification: async (
            id: string,
            message: string,
            snapshotContent: Map<string, Snapshot<BaseData, any>> | null | undefined,
            date: Date,
            type: NotificationType
          ): Promise<void> => {
            // Process notification logic
          },
          getState: () => null,
          onError: () => {
            /* Error handling logic */
          },
          getId: function (): string | undefined {
            return this.getId();
          },
          fetchSnapshotIds: function (): Promise<string[]> {
            return new Promise<string[]>((resolve, reject) => {
              if (this.getSnapshotIds()) {
                resolve([]);
              } else {
                reject(new Error("Function not implemented."));
              }
            });
          },
          getEmail: function (): string {
            return this.getEmail();
          },
          subscribe: function (
            callback: (data: Snapshot<T, K>) => void
          ): void {
            this.subscribe(callback);
            return;
          },
          unsubscribe: function (
            callback: (data: Snapshot<T, K>) => void
          ): void {
            this.unsubscribe(callback);
            return;
          },
          getOptionalData: function (): CustomSnapshotData | null {
            return this.getOptionalData();
          },
          getFetchSnapshotIds: function (): Promise<string[]> {
            return new Promise((resolve, reject) => {
              if (this.getSnapshotIds()) {
                resolve([]);
              } else {
                reject(new Error("Function not implemented."));
              }
            });
          },
          getSnapshotIds: function (): string[] {
            return this.getSnapshotIds();
          },
          getData: function (): Partial<Snapshot<T, K>> | null {
            return this.getData();
          },
          getNotifyEventSystem: function (): Function | undefined {
            return this.getNotifyEventSystem();
          },
          getUpdateProjectState: function (): Function | undefined {
            return this.getUpdateProjectState();
          },
          getLogActivity: function (): Function | undefined {
            throw new Error("Function not implemented.");
          },
          getTriggerIncentives: function (): Function | undefined {
            return this.getTriggerIncentives();
          },
          initialData: function (data: Snapshot<T, K>): void {
            return this.initialData(data);
          },
          getName: function (): string {
            throw new Error("Function not implemented.");
          },
          getDetermineCategory: function (
            data: Snapshot<T, K>
          ): string {
            throw new Error("Function not implemented.");
          },
          getDeterminedCategory: function (
            data: Snapshot<T, K>
          ): string | CategoryProperties {
            throw new Error("Function not implemented.");
          },
          receiveSnapshot: function (snapshot: BaseData): void {
            throw new Error("Function not implemented.");
          },
          getSubscriberId: function (): string {
            throw new Error("Function not implemented.");
          },
          getSubscription: function (): Subscription<T, K> {
            throw new Error("Function not implemented.");
          },
          onUnsubscribe: function (
            callback: (data: Snapshot<T, K>) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          onSnapshot: function (
            callback: (snapshot: Snapshot<T, K>) => void | Promise<void>
          ): void {
            throw new Error("Function not implemented.");
          },
          onSnapshotError: function (
            callback: (error: Error

            ) => void): void {
            throw new Error("Function not implemented.");
          },
          onSnapshotUnsubscribe: function (
            callback: (data: Snapshot<T, K>) => void
          ): void {
            throw new Error("Function not implemented.");
          },
          triggerOnSnapshot: function (
            snapshot: Snapshot<T, K>
          ): void {
            throw new Error("Function not implemented.");
          },
          handleCallback: function (data: Snapshot<T, K>): void {
            throw new Error("Function not implemented.");
          },
          snapshotCallback: function (data: Snapshot<T, K>): void {
            throw new Error("Function not implemented.");
          }
        };

        return subscriberObj; // Return updated subscriber object
      })
    );

    const updatedSnapshots: Snapshot<T, K>[] = []; 
    // Return updated subscribers and snapshots
    return {
      subscribers: updatedSubscribers.length > 0 ? updatedSubscribers : subscribers, // Use original if no updates
      snapshots: updatedSnapshots.length > 0 ? updatedSnapshots : snapshots, // Use original if no updates
    };
  } catch (error) {
    console.error("Error occurred:", error); // Handle or log errors as needed
    throw error; // Rethrow the error for further handling
  }
};



// Example 
const johnSubscriber = {
  getSubscriberId: () => "johnSubscriberId",
  getSubscription: () => ({
    getSubscriptionId: () => "johnSubscriptionId",
  }),
};

// Accessing subscriberId and subscriptionId
console.log("Subscriber ID:", johnSubscriber.getSubscriberId());
console.log("Subscription ID:", johnSubscriber.getSubscriberId());



export type { ConfigureSnapshotStorePayload, RetentionPolicy, SnapshotConfig };

  export { createSnapshotConfig };
