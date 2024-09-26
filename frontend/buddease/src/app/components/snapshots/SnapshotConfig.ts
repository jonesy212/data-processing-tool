
// SnapshotConfig.ts
import { fetchData } from "@/app/api/ApiData";
import { endpoints } from "@/app/api/ApiEndpoints";
import { fetchCategoryByName } from "@/app/api/CategoryApi";
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { useParams } from "next/navigation";
import {
  UserConfigExport,
  defineConfig,
} from "vite";
import { ModifiedDate } from "../documents/DocType";
import { FileCategory } from "../documents/FileType";
import {
  SnapshotManager,
  useSnapshotManager,
} from "../hooks/useSnapshotManager";
import determineFileCategory, {
  fetchFileSnapshotData,
} from "../libraries/categories/determineFileCategory";
import { Content } from "../models/content/AddContent";
import { BaseData, Data } from "../models/data/Data";
import {
  NotificationPosition,
  StatusType,
  SubscriberTypeEnum,
  SubscriptionTypeEnum,
} from "../models/data/StatusType";
import { Tag } from "../models/tracker/Tag";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import CalendarManagerStoreClass, { CalendarEvent } from "../state/stores/CalendarEvent";
import { AllStatus } from "../state/stores/DetailsListStore";
import { Subscription } from "../subscriptions/Subscription";
import {
  NotificationType,
  NotificationTypeEnum,
} from "../support/NotificationContext";
import { userId } from "../users/ApiUser";
import { Subscriber, payload } from "../users/Subscriber";
import {
  logActivity,
  notifyEventSystem,
  portfolioUpdates,
  triggerIncentives,
  unsubscribe,
  updateProjectState,
} from "../utils/applicationUtils";
import { generateSnapshotId } from "../utils/snapshotUtils";
import * as snapshotApi from "./../../api/SnapshotApi";
import {
  getCommunityEngagement,
  getMarketUpdates,
  getTradeExecutions,
} from "./../../components/trading/TradingUtils";
import {
  Payload,
  Snapshot,
  Snapshots,
  SnapshotsArray,
  SnapshotUnion,
  UpdateSnapshotPayload
} from "./LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import { SnapshotContainer, SnapshotDataType } from "./SnapshotContainer";
import {
  batchFetchSnapshotsFailure,
  batchFetchSnapshotsSuccess,
  batchTakeSnapshot,
  batchUpdateSnapshotsFailure,
  batchUpdateSnapshotsRequest,
  batchUpdateSnapshotsSuccess,
  handleSnapshotSuccess,
} from "./snapshotHandlers";
import SnapshotList, { SnapshotItem } from "./SnapshotList";
import SnapshotStore, { SubscriberCollection } from "./SnapshotStore";
import { subscribeToSnapshotImpl } from "./subscribeToSnapshotsImplementation";
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";
import { CreateSnapshotsPayload } from "../database/Payload";
import { Category, CategoryIdentifier } from "../libraries/categories/generateCategoryProperties";
import { CustomSnapshotData } from "./SnapshotData";
import Version from "../versions/Version";
import ProjectMetadata, { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { K, T } from "../models/data/dataStoreMethods";

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
  data: T;
  subscribers: SubscriberCollection<T, K>;
  storeConfig: SnapshotStoreConfig<T, K> | undefined;
  additionalData: CustomSnapshotData | undefined
}

function createSnapshotConfig<T extends Data, K extends Data>(
  snapshotId: string,
  existingConfigs: Map<string, SnapshotConfig<T, K>>,
  snapshotData: SnapshotDataType<T, K>,
  category: string = 'default-category',
  criteria: CriteriaType,
  description?: string,
  metadata?: StructuredMetadata | ProjectMetadata,
  priority?: string,
  version?: Version,
  additionalData?: CustomSnapshotData
): SnapshotConfig<T, K> {
  if (existingConfigs.has(snapshotId)) {
    return existingConfigs.get(snapshotId)!;
  }

  if (!snapshotData || typeof snapshotData !== 'object') {
    throw new Error('Invalid snapshotData');
  }

  const newSnapshotConfig: SnapshotConfig<T, K> = {
    id: snapshotId,
    description,
    category,
    metadata,
    criteria,
    priority,
    version,
    data: 'data' in snapshotData ? snapshotData.data : {} as T,
    subscribers: 'subscribers' in snapshotData ? snapshotData.subscribers : {} as SubscriberCollection<T, K>,
    config: 'storeConfig' in snapshotData ? snapshotData.storeConfig: undefined,
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
            ) => snapshot.getChildIds(childSnapshot),
            addChild: (
              parentId: string,
              childId: string, 
              childSnapshot: Snapshot<Data, Data>) => snapshot.addChild(childSnapshot),
            removeChild: (childId: string,
              parentId: string, parentSnapshot: Snapshot<Data, Data>,
              childSnapshot: Snapshot<Data, Data>
            ) => snapshot.removeChild(childId,
              parentId,
              parentSnapshot, childSnapshot),
            getChildren: () => { },
            hasChildren: () => false,
            isDescendantOf: (parentSnapshot: Snapshot<T, K>, childSnapshot: Snapshot<T, K>) => snapshot.isDescendantOf(parentSnapshot, childSnapshot),

            dataItems: snapshot.dataItems,
            newData: snapshot.newData,
            stores: snapshot.stores,
            getStore: (storeId: number) => snapshot.getStore(storeId) ?? null,
            addStore: (storeId: number, snapshotStore: SnapshotStore<T, K>, snapshotId: string, snapshotInstance: Snapshot<T, K>, type: string, event: Event) => 
              snapshot.addStore(storeId, snapshotStore, snapshotId, snapshotInstance, type, event),
            removeStore: (
              storeId: number,
              store: SnapshotStore<T, K>,
              snapshotId: string,
              snapshot: Snapshot<T, K>,
              type: string,
              event: Event
            ) => {
              throw new Error("Function not implemented.");
            },
            createSnapshots: (
              id: string,
              snapshotId: string,
              snapshot: Snapshot<T, K>,
              snapshotManager: SnapshotManager<T, K>,
              payload: CreateSnapshotsPayload<T, K>,
              callback: (snapshots: Snapshot<T, K>[]) => void | null,
              snapshotDataConfig?: SnapshotConfig<SnapshotWithCriteria<any, BaseData>, K>[],
              category?: string | CategoryProperties
            ) => {
              // Implement the function logic here
              return null;
            },
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
              id: string,
              snapshotData: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[],
              category: Category | undefined,
              categoryProperties: CategoryProperties | undefined,
              dataStoreMethods: DataStore<T, K>
            ): Promise<{ snapshot: SnapshotStore<T, K> }> => {
              return new Promise((resolve) => {
                // Implement the function logic here
                resolve({ snapshot: snapshot });
              });
            },
          };
        };

        // Use reduce to construct updatedSnapshots with default snapshot objects
        const updatedSnapshots = snapshotsArray.reduce<Record<string, Snapshot<T, K>[]>>((acc, snapshot) => {
          const category = (snapshot.category as string) ?? 'defaultCategory';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(createDefaultSnapshot(snapshot));
          return acc;
        }, {});

        // Create a new Subscriber object with updated data
        const id = snapshotApi.fetchSnapshotById(snapshotId).toString();
        const subscriberObj: Subscriber<T, K> = {


          subscribersById, enabled, tags, callback,
          
          ...subscriber,
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
            determineCategory: () => subscriber.getDetermineCategory(subscriber.data as Snapshot<T, K>),
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
          getData: function (): Partial<SnapshotStore<T, K>> | null {
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

    // Return updated subscribers and snapshots
    return {
      subscribers: updatedSubscribers,
      snapshots: snapshots, // Return the original snapshots or updated snapshots if applicable
    };

  } catch (error) {    console.error("Error occurred:", error); // Handle or log errors as needed    throw error; 
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

export {createSnapshotConfig}