// SnapshotConfig.ts
import { additionalHeaders } from '@/app/api/headers/generateAllHeaders';
import { createLatestVersion } from '@/app/components/versions/createLatestVersion';

import { isSnapshot } from '@/app/components/utils/snapshotUtils';
import apiNotificationsService from '@/app/api/NotificationsService';
import { UpdateSnapshotPayload } from '@/app/components/database/Payload';
import { UnsubscribeDetails } from '@/app/components/event/DynamicEventHandlerExample';
import { Meta } from '@/app/components/models/data/dataStoreMethods';
import { RealtimeDataItem } from "@/app/components/models/realtime/RealtimeData";
import { createSnapshotInstance } from '@/app/components/snapshots/createSnapshotInstance';
import { CoreSnapshot, SnapshotsArray } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { data, SnapshotWithCriteria } from '@/app/components/snapshots/SnapshotWithCriteria';
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { subscriptionLevels } from '@/app/components/subscriptions/SubscriptionLevel';
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { ProjectMetadata, StructuredMetadata } from "@/app/configs/StructuredMetadata";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { IHydrateResult } from "mobx-persist";
import { useParams } from "next/navigation";
import { CreateSnapshotsPayload, Payload } from "../database/Payload";
import { ModifiedDate } from "../documents/DocType";
import { FileCategory } from "../documents/FileType";
import {
  SnapshotManager
} from "../hooks/useSnapshotManager";
import {
  fetchFileSnapshotData,
} from "../libraries/categories/determineFileCategory";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData, Data, DataDetails } from "../models/data/Data";
import {
  StatusType,
  SubscriberTypeEnum,
  SubscriptionTypeEnum
} from "../models/data/StatusType";
import { DataStoreMethods } from '../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { DataStore, InitializedState } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SubscriberCallbackType, Subscription } from "../subscriptions/Subscription";
import { SubscriptionLevel } from "../subscriptions/SubscriptionLevel";
import {
  NotificationType,
  NotificationTypeEnum,
} from "../support/NotificationContext";
import { userId } from "../users/ApiUser";
import { Subscriber, SubscriberCallback } from "../users/Subscriber";
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
import { InitializedData, SnapshotStoreOptions } from "./SnapshotStoreOptions";

import { SubscriberCollection } from '../users/SubscriberCollection';
import {
  Snapshot,
  Snapshots,
  SnapshotUnion,
} from "./LocalStorageSnapshotStore";
import { CustomSnapshotData, SnapshotData } from "./SnapshotData";
import { SnapshotItem } from "./SnapshotList";
import SnapshotStore from "./SnapshotStore";
import { Callback } from "./subscribeToSnapshotsImplementation";
import { SnapshotStoreProps } from "./useSnapshotStore";
import { internalCache } from '@/app/utils/InternalCache';
import { BaseDatabaseService } from '@/app/configs/DatabaseConfig';
import { Attachment } from '../documents/Attachment/attachment';
import { SnapshotCallback } from '../event/EventManager';

interface RetentionPolicy {
  retentionPeriod: number; // in days
  cleanupOnExpiration: boolean;
  retainUntil: Date;
}

type TagsRecord = Record<string, string>;

interface ConfigureSnapshotStorePayload<
  T extends BaseData<any>, 
  K extends T = T
  > 
  extends Payload {
  snapshotStore: SnapshotStore<T, K>;
  snapshotId: string;
  snapshotData: T;
  timestamp: Date;
  snapshotStoreConfig: SnapshotStoreConfig<T, K>;
  title: string;
  description: string;
  newData: T;  
  createdAt: Date;
  updatedAt: Date;
  additionalData?: Record<string, any>;
  status: StatusType | undefined;
  category: string;
  metadata: Meta<T, K>
  mappedMeta: Meta<T, K>
  options: SnapshotStoreOptions<T, K>
}

type MetadataTypes = StructuredMetadata<BaseData<any, any> , BaseData<any, any>> | ProjectMetadata

interface SnapshotConfig<
  T extends  BaseData<any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends Data<T> = never,
>
  extends Snapshot<T, K>
{
  id: string | number;
  description?: string;
  category: Category;
  metadata?: UnifiedMetaDataOptions<T, K>;
  meta?: StructuredMetadata<T, K>;
  mappedSnapshot: Map<string, Snapshot<T, K>> | {}
  mappedMeta: Map<string, StructuredMetadata<T, K>> | Map<string, Snapshot<T, K>> | undefined;
  snapshotCriteria?: SnapshotWithCriteria<T, K>;
  criteria: CriteriaType;
  priority?: string;
  version?: string | number| Version;
  data: InitializedData<T> | null;
  subscribers: SubscriberCollection<T, K>[];
  storeConfig: SnapshotStoreConfig<T, K> | undefined;
  initialState: InitializedState<T, K>
  isCore: boolean;
  additionalData: CustomSnapshotData<T, K, Meta> | undefined
  hasSnapshots: () => Promise<boolean>
}


function createSnapshotConfig<T extends  BaseData<any> = BaseData<any, any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> (
  snapshotId: string,
  prefix: string,
  name: string,
  type: NotificationTypeEnum,

  baseData: T,        // Make sure baseData is passed correctly
  baseMeta: Meta,     // And the same for metadata
  snapshotStore: SnapshotStore<T, K>,
  snapshotManager: SnapshotManager<T, K>,
  snapshotStoreConfig: any,
  
  existingConfigs: Map<string, SnapshotConfig<T, K>>,
  snapshotData: SnapshotData<T, K>,
  category: symbol | string | Category | undefined = 'default-category',
  criteria: CriteriaType | undefined,
  storeConfig: SnapshotStoreConfig<T, K>, // Ensure this is provided and correctly typed
  isCore: boolean,
  onInitialize: () => void,
  storeId: number,
  currentCategory: Category,

  storeProps?: SnapshotStoreProps<T, K>,
  storeOptions?: SnapshotStoreOptions<T, K>,
  description?: string | null | undefined,
  metadata?: UnifiedMetaDataOptions<T, K>,
  title?: string,
  chatThreadName?: string,
  chatMessageId?: string,
  chatThreadId?: string,
  dataDetails?: DataDetails<T, K>,
  generatorType?: string,

  priority?: string,
  version?: string | Version,
  additionalData?: CustomSnapshotData<T, K, Meta>,
  initialState?: any, // Define types as needed
  initialConfig?: any, // Define types as needed

  onError?: (error: Error) => void,
  taskIdToAssign?: string,
  schema?: any, // Define types as needed
  mappedSnapshotData?: Map<string, Snapshot<T, K>>, // Define types as needed
  versionInfo?: any, // Define types as needed
  initializedState?: any, // Define types as needed
  snapshot?: any, // Define types as needed
  setCategory?: ((category: symbol | string | Category | undefined) => void) | undefined,
  applyStoreConfig?: (SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>  | undefined) => void,
  generateId?: (
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
  ) => string,
  // Define types as needed
  snapshotContainer?: any, // Define types as needed
  getSnapshotItems?: (category: symbol | string | Category | undefined, snapshots: SnapshotsArray<T, K>
  ) => (SnapshotStoreConfig<T, K> | SnapshotItem<T, K> | undefined)[], // Define types as needed
  defaultSubscribeToSnapshots?: (
    snapshotId: string, 
    callback: (snapshots: Snapshots<T, K>) => Subscriber<T, K> | null, 
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
      snapshots: Snapshots<T, K>
    ) => Promise<SnapshotUnion<T, K>[]>
  ) => Promise<Snapshot<T, K>[]>, 
  getSubscribers?: (subscribers: SubscriberCollection<T, K>, snapshots: Snapshots<K>) => Promise<{ subscribers: SubscriberCollection<T, K>; snapshots: Snapshots<T, K>; }>, 
  transformDelegate?: (delegate: any) => any, 
  getAllKeys?: () => any, 
  getAllValues?: () => any, 
  getAllItems?: () => any, 
  getSnapshotEntries?: () => any, 
  getAllSnapshotEntries?: () => any, 
  addDataStatus?: (status: any) => void, 
  removeData?: (data: any) => void,
  updateData?: (data: any) => void,
  moveData?: (data: any) => void, 
  upteData?: (data: any) => void, 
  updateDataTitle?: (title: string) => void, 
  updateDataDescription?: (description: string) => void, 
  updateDataStatus?: (status: any) => void, 
  addDataSuccess?: () => void, 
  getDataVersions?: (id: number) => Promise<Snapshot<T, K>[] | undefined>,
  updateDataVersions?: (id: number, versions: Snapshot<T, K>[]) => void,
  getBackendVersion?: () => Promise<string | number | undefined>, 
  getFrontendVersion?: () => Promise<string | number | undefined>, 
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
  addSnapshotSuccess?: (snapshot: T, subscribers: SubscriberCollection<T, K>) => void, 
  deepCompare?: (a: any, b: any) => boolean, 
): Promise<SnapshotConfig<T, K>> {
   // Wrap the creation process in a Promise explicitly
  return new Promise(async (resolve, reject) => {
    try {
      if (existingConfigs.has(snapshotId)) {
        return resolve(existingConfigs.get(snapshotId)!);
      }

      if (!snapshotData || typeof snapshotData !== 'object') {
        throw new Error('Invalid snapshotData');
      }

      if(!description){
        throw new Error("There is no description provided")
      }

      if(!criteria){
        throw new Error("Criteria must be set")
      }
      
      if (!storeProps) {
        // Handle the case when storeProps is undefined
        throw new Error("storeProps is undefined");
      }      
      
      const { storeId, name, version, schema, options, config, expirationDate,
        payload, callback, endpointCategory, category
      } = storeProps
    
      const snapshot = createSnapshotInstance<T, K>(
        baseData,
        new Map(Object.entries(baseMeta as unknown as Record<string, Snapshot<T, K, StructuredMetadata<T, K>, never>>)),
        snapshotId,
        category,
        snapshotStore,
        snapshotManager,
        snapshotStoreConfig,
        storeProps,
        storeOptions
      );


      const snapshotResolved = await (snapshotApi.getSnapshot(snapshotId, Number(storeId)) as Promise<Snapshot<T, K> | null>);
      
      if (snapshotResolved === null && snapshotResolved === undefined) {
        throw new Error("Snapshot not found");
      }

      const newSnapshotStoreConfig: SnapshotStoreConfig<T, K> = {
        id: snapshotId,
        description,
        category,
        metadata,
        criteria,
        priority,
        version,
        
        data: 'data' in snapshotData ? snapshotData.data : {} as InitializedData<T>,
        subscribers: 'subscribers' in snapshotData ? snapshotData.subscribers : {} as SubscriberCollection<T, K>[],
        config: 'storeConfig' in snapshotData ? snapshotResolved.storeConfig as SnapshotStoreConfig<T, K> : null,
        
        initialState,
        isCore,
        initialConfig,
        onInitialize,
        onError,
        taskIdToAssign,
        schema,
        currentCategory,
        mappedSnapshotData,
        Number(storeId),
        versionInfo,
        initializedState,
        snapshotResolved,
        setCategory,
        applyStoreConfig,
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
          const baseId = `${prefix}-${name}-${type}`;
          const additionalId = id ? `-${id}` : '';
          const generatedId = `${baseId}${additionalId}`;

          return generatorType ? `${generatedId}-${generatorType}` : generatedId;
        },

        snapshotContainer,
        getSnapshotItems: 'getSnapshotItems' in snapshotData ? snapshotResolved.getSnapshotItems : undefined,
        defaultSubscribeToSnapshots: 'defaultSubscribeToSnapshots' in snapshotData ? snapshotResolved.defaultSubscribeToSnapshots : undefined,
        getAllSnapshots: 'getAllSnapshots' in snapshotData ? snapshotResolved.getAllSnapshots : undefined,
        getSubscribers: 'getSubscribers' in snapshotData ? snapshotResolved.getSubscribers : [],
        transformDelegate,
        getAllKeys,
        getAllValues,
        getAllItems,
        getSnapshotEntries,
        getAllSnapshotEntries,
        addDataStatus,
        removeData,
        updateData,
        moveData,
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
        getSnapshot: 'getSnapshot' in snapshotData ? snapshotResolved.getSnapshot : {},
        getSnapshotSuccess: 'getSnapshotSuccess' in snapshotData ? snapshotResolved.getSnapshotSuccess : {}, 
        setItem,
        getItem,
        getDataStore,
        getDataStoreMap,
        addSnapshotSuccess: 'addSnapshotSuccess' in snapshotData ? snapshotResolved.addSnapshotSuccess : undefined,
        deepCompare,
      }
 
      const newSnapshotConfig: SnapshotConfig<T, K> = {
        ...snapshot,
        id: snapshotId,
        description,
        category,
        metadata,
        criteria,
        priority,
        version,
        data: (data ?? {}) as InitializedData<T>,
        subscribers: 'subscribers' in snapshotData ? snapshotData.subscribers : {} as SubscriberCollection<T, K>[],
        storeConfig,
        initialState,
        isCore,
        mappedSnapshot, mappedMeta, hasSnapshots, dataObject,

        additionalData,
      };

      // Store the new snapshot configuration in the existingConfigs map
      existingConfigs.set(snapshotId, newSnapshotConfig);

      // Resolve the new snapshot configuration
      resolve(newSnapshotConfig);
    } catch (error) {
      reject(error);
    }


  })}

// Example of asynchronous function using async/await
const updateSubscribersAndSnapshots = async <
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
>(
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
              snapshots: filteredSnapshots as unknown as Snapshots<T, K>,
              compareSnapshotState: snapshot.compareSnapshotState,
              eventRecords: snapshot.eventRecords ? snapshot.eventRecords : null,
              getParentId: snapshot.getParentId,
              getChildIds: (
                id: string,
                childSnapshot: CoreSnapshot<T, K>
              ) => snapshot.getChildIds(id, childSnapshot),
              addChild: (
                parentId: string,
                childId: string,
                childSnapshot: CoreSnapshot<T, K>
              ) => snapshot.addChild(parentId, childId, childSnapshot),
              removeChild: (childId: string,
                parentId: string,
                parentSnapshot: Snapshot<T, K>,
                childSnapshot: CoreSnapshot<T, K>
              ) => snapshot.removeChild(childId,
                parentId,
                parentSnapshot, childSnapshot
              ),
              getChildren: (id: string, childSnapshot: Snapshot<T, K>) => snapshot.getChildren(id, childSnapshot),
              hasChildren: () => false,
              isDescendantOf: (
                childId: string, parentId: string,
                parentSnapshot: Snapshot<T, K>, childSnapshot: Snapshot<T, K>) => snapshot.isDescendantOf(childId, parentId, parentSnapshot, childSnapshot),

              dataItems: snapshot.dataItems,
              newData: snapshot.newData,
              stores: snapshot.stores || null,
              getStore: (
                storeId: number,
                snapshotStore: SnapshotStore<T, K>,
                snapshotId: string | null,
                snapshot: Snapshot<T, K>,
                snapshotStoreConfig: SnapshotStoreConfig<T, K>,
                type: string,
                event: Event
              ) => snapshot.getStore(storeId, snapshotStore, snapshotId, snapshot, snapshotStoreConfig, type, event) ?? null,

              addStore: (
                storeId: number,
                snapshotId: string | null,
                snapshotStore: SnapshotStore<T, K>,
                snapshotInstance: Snapshot<T, K>,
                type: string,
                event: Event
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
                snapshotId: string | number | null,
                snapshots: Snapshot<T, K> | Snapshots<T, K>,
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
                on: () => { },
                off: () => { },
                emit: () => { },
                once: () => { },
                subscribe: (event: string, callback: (snapshot: Snapshot<T, K>) => void) => {
                  throw new Error("Function not implemented.");
                },
                unsubscribe: (
                  snapshotId: number,
                  unsubscribeDetails: UnsubscribeDetails,
                  callback: SubscriberCallbackType<T, K> | null
                ) => { },
                trigger: () => { },
                removeAllListeners: () => { },
                onSnapshotAdded: (event: string, snapshot: Snapshot<T, K>, snapshotId: string, subscribers: SubscriberCollection<T, K>) => {
                  throw new Error("Function not implemented.");
                },
                onSnapshotRemoved: (
                  event: string,
                  snapshot: Snapshot<T, K>,
                  snapshotId: string,
                  subscribers: SubscriberCollection<T, K>,
                  type: string,
                  snapshotStore: SnapshotStore<T, K>,
                  dataItems: RealtimeDataItem[],
                  criteria: SnapshotWithCriteria<T, K>,
                  category: Category,
                  snapshotData: SnapshotData<T, K>) => {
                  throw new Error("Function not implemented.");
                },
                onSnapshotUpdated: (
                  event: string,
                  snapshotId: string,
                  snapshot: Snapshot<T, K>,
                  data: Map<string, Snapshot<T, K>>,
                  events: Record<string, CalendarManagerStoreClass<T, K>[]>,
                  snapshotStore: SnapshotStore<T, K>,
                  dataItems: RealtimeDataItem[],
                  newData: Snapshot<T, K>,
                  payload: UpdateSnapshotPayload<T>,
                  store: SnapshotStore<any, K>
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
              meta: {
                description: undefined,
                fileType: '',
                alternatePaths: [],
                originalPath: '',
                metadataEntries: {},
                keywords: '',
                childIds: undefined,
                relatedData: undefined,
                version: {
                  id: 1,  // Provide a default or dynamic ID
                  versionData: null,  // Provide appropriate data or null
                  buildVersions: undefined,  // Provide appropriate data or undefined
                  isActive: true,  // Example active state
                  releaseDate: new Date(),  // Set to current date or appropriate value
                  major: 1,
                  minor: 0,
                  patch: 0,
                  name: 'Initial Version',  // Example version name
                  url: '',  // Provide the appropriate URL
                  versionNumber: '1.0.0',  // Example version number
                  documentId: '',  // Provide appropriate document ID
                  draft: false,  // Set as appropriate
                  userId: '',  // Provide user ID
                  content: '',  // Add content or empty string
                  description: 'Initial release',  // Example description
                  buildNumber: '',  // Example build number
                  metadata: {},  // Provide appropriate metadata if necessary
                  versions: null,  // Provide version data or null
                  appVersion: '1.0.0',  // Example app version
                  checksum: '',  // Provide appropriate checksum
                  parentId: null,  // Provide parent ID or null
                  parentType: '',  // Provide parent type if necessary
                  parentVersion: '',  // Provide parent version if necessary
                  parentTitle: '',  // Provide parent title if necessary
                  parentContent: '',  // Provide parent content if necessary
                  parentName: '',  // Provide parent name if necessary
                  parentUrl: '',  // Provide parent URL if necessary
                  parentChecksum: '',  // Provide parent checksum if necessary
                  parentAppVersion: '',  // Provide parent app version if necessary
                  parentVersionNumber: '',  // Provide parent version number if necessary
                  parentMetadata: {},  // Provide appropriate parent metadata if necessary
                  createdAt: new Date(),  // Provide creation date or null
                  updatedAt: new Date(),  // Provide update date or null
                  deletedAt: null,  // Provide delete date or null
                  isLatest: true,  // Example flag for latest version
                  isPublished: true,  // Example flag for published status
                  publishedAt: new Date(),  // Set publish date or null
                  source: '',  // Provide source as needed
                  status: 'active',  // Example status
                  workspaceId: '',  // Provide workspace ID
                  workspaceName: '',  // Provide workspace name
                  workspaceType: '',  // Provide workspace type
                  workspaceUrl: '',  // Provide workspace URL
                  workspaceViewers: [],  // Provide viewers array
                  workspaceAdmins: [],  // Provide admins array
                  workspaceMembers: [],  // Provide members array
                  data: undefined,  // Set appropriate data or undefined
                  _structure: {},  // Provide structure data or empty object
                  versionHistory: { versionData: {} },  // Set version history data
                  getVersionNumber: undefined,  // Set function or undefined
                  updateStructureHash: async () => { /* Function implementation */ },
                  setStructureData: (newData: string) => { /* Function implementation */ },
                  hash: (value: string) => { return ''; /* Hashing logic */ },
                  currentHash: '',  // Provide current hash value
                  structureData: '',  // Provide structure data
                  calculateHash: () => { return ''; /* Calculate hash logic */ }
                },
                
                lastUpdated: undefined,
                isActive: true, // Assuming active by default
                config: {},
                permissions: [],
                customFields: {},
                baseUrl: '',
                versionData: [],
                latestVersion: createLatestVersion(),
              },
              snapshot: (
                id: string | number | undefined,
                snapshotData: SnapshotData<T, K>,
                category: symbol | string | Category | undefined,
                categoryProperties: CategoryProperties | undefined,
                callback: (snapshotStore: SnapshotStore<T, K>) => void,
                dataStore: DataStore<T, K>,
                dataStoreMethods: DataStoreMethods<T, K>,
                metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>,
                subscriberId: string, // Add subscriberId here
                endpointCategory: string | number,// Add endpointCategory here
                storeProps: SnapshotStoreProps<T, K>,
                snapshotConfigData: SnapshotConfig<T, K>,
                subscription: Subscription<T, K>,
                snapshotId?: string | null,
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


          // Flatten the record to an array of SnapshotUnion<Data, Meta>
          const updatedSnapshots: SnapshotUnion<Data, Meta>[] = Object.values(categorizedSnapshots).flat();

          // Create a new Subscriber object with updated data
          const id = snapshotApi.fetchSnapshotById(snapshotId).toString();
          const subscriberObj: Subscriber<T, K> = {
            ...subscriber,

            subscribersById: {} as Map<string, Subscriber<T, K>>,
            internalState: {} as Map<string, Snapshot<T, K>>,
            internalCache: {} as Map<string, T>,
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
                if (isSnapshot<T, K>(snapshotData)) {
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
              data: {} as Snapshot<T, K, Meta, never>,
              getSubscriptionLevel: getSubscriptionLevel,
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
              snapshotContent: Map<string, Snapshot<T, K>> | null | undefined,
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
              callback: SubscriberCallback<T, K>
            ): void {
              this.subscribe(callback);
              return;
            },
            unsubscribe: function (
              snapshotId: number,
              unsubscribe: UnsubscribeDetails,
              callback: SubscriberCallback<T, K>
            ): void {
              this.unsubscribe(snapshotId, unsubscribe, callback);
              return;
            },
            getOptionalData: function (): CustomSnapshotData<T, K, Meta> | null {
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
            },

            tags: [],
            sentNotification: async (
              eventType: string,
              eventData: any,
              date: Date,
              type: NotificationTypeEnum
            ): Promise<void> => {
              return apiNotificationsService.sentNotification(
                eventType,
                eventData,
                date,
                type
              );
            },
            // Define `sendNotification` to utilize `ApiNotificationsService.notify`
            sendNotification: async (
              eventType: string,
              eventData: any,
              date: Date,
              type: NotificationTypeEnum
            ): Promise<void> => {
              apiNotificationsService.notify(
                eventType,
                apiNotificationsService.notificationMessages.FETCH_NOTIFICATIONS_SUCCESS,
                eventData,
                date,
                type
              );
            },
            update: (snapshot: Snapshot<T, K>) => { },
            processData: (data: T | Map<string, Snapshot<T, K>> | null | undefined) => { },
            validateData: (data: T | Map<string, Snapshot<T, K>>): boolean => {
              if (data instanceof Map) {
                // Check if all values in the map have properties typical of a Snapshot
                return Array.from(data.values()).every((snapshot) =>
                  snapshot && typeof snapshot === "object" &&
                  "id" in snapshot &&    // Assuming `id` is a required property in Snapshot
                  "data" in snapshot &&  // Assuming `data` is another key property in Snapshot
                  "timestamp" in snapshot // Add any other unique properties for Snapshot<T, K>
                );
              }
            
              // Check if `data` meets the type `T` structure
              return data !== null && typeof data === "object";
            },
            transformData: (data: T): T => data,
            triggerActions: async (data: T): Promise<void> => {
              try {
                console.log('Triggering actions for data:', data);
                
                // Step 1: Validate the incoming data
                if (!data) {
                  throw new Error('Data is required to trigger actions.');
                }
            
                // Step 2: Extract specific properties from the data if needed
                const { id, name } = data as any; // Assuming T might have `id` and `name`
                if (!id) {
                  throw new Error('Data must have an ID to proceed with actions.');
                }
            
                // Step 3: Trigger asynchronous actions
                const actionResults = await Promise.all([
                  this.notifySubscribers(data), // Notify subscribers (if applicable)
                  this.sendToExternalAPI(data),  // Send data to an external API
                  this.logAction(id, name),      // Log the action
                ]);
            
                console.log('All actions triggered successfully:', actionResults);
              } catch (error) {
                console.error('Error triggering actions:', error);
              }
            },
            updateInternalStore: (data: T) => { },
            // `getIsDataType` with a type predicate (data is T)
            getIsDataType: (data: any): data is T => {
              // Logic to confirm if `data` is of type `T`
              return data !== null && typeof data === "object" && "id" in data; // Customize based on `T` structure
            },
          
          getUpdateInternalStore: (data: T) => { },
          getProcessData: (data: T | Map<string, Snapshot<T, K>> | null | undefined) =>{},
          getValidateData: (data: T | Map<string, Snapshot<T, K>>): boolean => {
            if (data instanceof Map) {
              // Check if all values in the map conform to Snapshot<T, K> structure
              return Array.from(data.values()).every((snapshot) =>
                snapshot && typeof snapshot === "object" &&
                "id" in snapshot && "data" in snapshot && "timestamp" in snapshot
              );
            }
            // Basic validation for data of type T
            return data !== null && typeof data === "object";
          },
          getTransformData: (data: Snapshot<T, K>): Snapshot<T, K> => {
            // Example transformation logic: here, we assume a simple identity function
            return data; // Return transformed data
          },
          getTriggerActions: async (eventType: string, eventData: any, date: Date, type: NotificationTypeEnum, data: T): Promise<void> => {
            // Logic to handle trigger actions, e.g., notifying subscribers or processing events
            await apiNotificationsService.notify(eventType, message, eventData, date, type);
          }, 
          // Fetch an item from internal cache based on an ID, returning data of type T or undefined
          getFromInternalCache: (id: string): T | undefined => {
            // Assuming internal cache is a Map<string, T>
            return internalCache.get(id);
          },
          clearInternalCache: () => {},
          
            // Remove an item from internal cache by ID
          removeFromInternalCache: (id: string): void => {
            internalCache.delete(id);
          },
          
          isDataType: (data: any): data is T => {
            // Assuming T has a unique property or structure we can check
            return data !== null && typeof data === "object" && "uniqueProperty" in data;
          },
          newData: (data: Snapshot<T, K>): Snapshot<T, K> => {
            // Here, we assume a direct return but can add transformation logic
            return data;
          },
          getUniqueId: "", 
          setUniqueId: "",
          getEnabled: true, 
          getTags: [], 
          getInternalState: new Map<string, Snapshot<T, K>>(),
          getInternalCache: new Map<string, T>(),
          getCallback: (data: Snapshot<T, K>) => {},
          defaultSubscribeToSnapshots: [],
          subscribeToSnapshots: [],
          getSubscribers: [],
          getTransformSubscriber: (
            event: string,
            snapshotId: string, 
            snapshot: Snapshot<T, K>, 
            snapshotStore: SnapshotStore<T, K>, 
            dataItems: T[], 
            criteria: any, 
            category: CriteriaType
          ): Subscriber<BaseData, BaseData> => {}, 
          transformSubscribers: [],
          setSubscribers: [], 
          getOnSnapshotCallbacks: [] as SubscriberCallback<T, K, StructuredMetadata<T, K>>[],
          setOnSnapshotCallbacks: [] as SubscriberCallback<T, K, StructuredMetadata<T, K>>[],
          getOnErrorCallbacks: [
            (error: Error) => {
              console.error('Error callback triggered:', error);
            }
          ],

          setOnErrorCallbacks: [
            (error: Error) => {
              console.error('Setting error callback for error:', error);
            }
          ],

          getOnUnsubscribeCallbacks: [
            (data: Snapshot<T, K, StructuredMetadata<T, K>, never>) => {
              console.log('Unsubscribe callback triggered for data:', data);
            }
          ],

          setOnUnsubscribeCallbacks: [
            (data: Snapshot<T, K, StructuredMetadata<T, K>, never>) => {
              console.log('Setting unsubscribe callback for data:', data);
            }
          ],
          setNotifyEventSystem: {} as Function, 
          setUpdateProjectState: {} as Function, 
          setLogActivity: {} as Function,
          setTriggerIncentives: {} as Function, 
          setOptionalData: {} as CustomSnapshotData<T, K, StructuredMetadata<T, K>>, 
          setEmail: "", 
          setSnapshotIds: [],
          getPayload: {} as T,
          handleSnapshot: (data: Snapshot<T, K, StructuredMetadata<T, K>, never>) => {
            // Example logic: update the snapshot data
            console.log('Handling snapshot update for:', data);
            // Insert any additional logic here, like updating state, calling another function, etc.
          },

          getInitialData: (): Partial<SnapshotStore<T, K, StructuredMetadata<T, K>>> | null => {
            // Example logic: return partial store data
            const initialData: Partial<SnapshotStore<T, K, StructuredMetadata<T, K>>> = {
              metadata: {} as StructuredMetadata<T, K>, // Assuming metadata is required
            };
            console.log('Returning initial data:', initialData);
            return initialData; 
          },

          getNewData: async (): Promise<Partial<SnapshotStore<T, K, StructuredMetadata<any, any>>> | null> => {
            // Example logic: simulate fetching new data (this could be an API call)
            const newData: Partial<SnapshotStore<T, K, StructuredMetadata<any, any>>> = await new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  metadata: {} as StructuredMetadata<any, any>, // Assuming metadata is required
                });
              }, 1000); // Simulate async call with 1-second delay
            });
            console.log('Returning new data:', newData);
            return newData; 
            },
          
          getDefaultSubscribeToSnapshots: async (): Promise<Partial<SnapshotStore<T, K, StructuredMetadata<T, K>>> | null> => {
            try {
              // Simulate retrieving default subscription data (could be from a cache, config, etc.)
              const defaultSnapshotStore: Partial<SnapshotStore<T, K, StructuredMetadata<T, K>>> = {
                id: 'default-store-id',
                name: 'Default Store',
                data: {} as InitializedData<T> | undefined // Assume this data can be pre-filled
              };
              return defaultSnapshotStore;
            } catch (error) {
              console.error('Error in getDefaultSubscribeToSnapshots:', error);
              return null;
            }
          },

          getSubscribeToSnapshots: async (): Promise<Partial<SnapshotStore<T, K, StructuredMetadata<T, K>>> | null> => {
            try {
              // Simulate an API call to get subscription details for snapshots
              const response = await fetch(`https://api.example.com/snapshot-store/${snapshotId}`);
              if (!response.ok) throw new Error('Failed to fetch subscribe-to-snapshots data');
              
              const snapshotStore: Partial<SnapshotStore<T, K, StructuredMetadata<T, K>>> = await response.json();
              return snapshotStore;
            } catch (error) {
              console.error('Error in getSubscribeToSnapshots:', error);
              return null;
            }
          },

          fetchTransformSubscribers: async (): Promise<BaseDatabaseService | null> => {
            try {
              // Simulate fetching transformation subscribers from an API or service
              const response = await fetch('https://api.example.com/transform-subscribers');
              if (!response.ok) throw new Error('Failed to fetch transform subscribers');
              
              const baseDatabaseService: BaseDatabaseService = await response.json();
              return baseDatabaseService;
            } catch (error) {
              console.error('Error in fetchTransformSubscribers:', error);
              return null;
            }
          },
          /**
         * Retrieves the list of transform subscribers.
         * @returns {SubscriberCallback<T, K, StructuredMetadata<T, K>>[]} List of transform subscribers.
         */
        getTransformSubscribers: (): SubscriberCallback<T, K, StructuredMetadata<T, K>>[] => {
          return transformSubscribers;
        },

        /**
         * Sets the transform subscribers. It can accept either a Promise of `BaseDatabaseService` 
         * or an array of `SubscriberCallback` functions. If a Promise is provided, 
         * it resolves the subscribers from the service and adds them to `transformSubscribers`.
         * @param {Promise<BaseDatabaseService> | SubscriberCallback<T, K, StructuredMetadata<T, K>>[]} subscribers 
         */
        setTransformSubscribers: async (subscribers: Promise<BaseDatabaseService> | SubscriberCallback<T, K, StructuredMetadata<T, K>>[]) => {
          if (subscribers instanceof Promise) {
            try {
              const service = await subscribers;
              if (service && Array.isArray(service.subscribers)) {
                transformSubscribers.push(...service.subscribers as SubscriberCallback<T, K, StructuredMetadata<T, K>>[]);
              }
            } catch (error) {
              console.error('Error while setting transform subscribers from service:', error);
            }
          } else if (Array.isArray(subscribers)) {
            transformSubscribers.length = 0; // Clear existing subscribers
            transformSubscribers.push(...subscribers);
          }
        },

        /**
         * Adds a snapshot callback function. 
         * This method adds a callback to the internal list of snapshot callbacks.
         * @param {SnapshotCallback<T>} callback The callback function to add.
         */
        addSnapshotCallback: (callback: SnapshotCallback<T>) => {
          if (typeof callback === 'function') {
            snapshotCallbacks.push(callback);
          }
        },
 
        fetchSnapshotById: async (userId: string, snapshotId: string): Promise<Snapshot<T, K, StructuredMetadata<T, K>, never>> => {
          try {
            // Example logic for fetching a snapshot by ID (could involve an API call or DB lookup)
            const snapshot = await fetch(`/api/snapshots/${snapshotId}`)
              .then((response) => response.json())
              .then((data) => {
                // Assuming the data is of type Snapshot<T, K>
                return data as Snapshot<T, K, StructuredMetadata<T, K>, never>;
              });

            return snapshot;
          } catch (error) {
            console.error("Error fetching snapshot by ID:", error);
            throw new Error("Failed to fetch snapshot");
          }
        },

        isSnapshotOfType: async (): Promise<SnapshotConfig<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, K, StructuredMetadata<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, K>, never>[]> => {
          try {
            // Example logic to check if snapshot is of a specific type
            const snapshots = await fetch('/api/snapshots')
              .then((response) => response.json())
              .then((data) => {
                // Assuming the data is an array of snapshot configs
                return data as SnapshotConfig<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, K, StructuredMetadata<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, K>, never>[];
              });

            // Returning the filtered snapshot configs based on some internal checks
            return snapshots.filter((snapshotConfig) => {
              // Implement the specific validation based on your logic
              return snapshotConfig.someProperty === 'someValue';
            });
          } catch (error) {
            console.error("Error checking snapshot type:", error);
            throw new Error("Failed to check snapshot type");
          }
        },

        snapshots: async (): Promise<SnapshotConfig<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, K, StructuredMetadata<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, K>, never>[]> => {
          try {
            // Example logic to fetch all snapshots
            const snapshotConfigs = await fetch('/api/snapshots/configs')
              .then((response) => response.json())
              .then((data) => {
                return data as SnapshotConfig<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, K, StructuredMetadata<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, K>, never>[];
              });

            return snapshotConfigs;
          } catch (error) {
            console.error("Error fetching snapshots:", error);
            throw new Error("Failed to fetch snapshots");
          }
        },

        snapshotStores: async (): Promise<SnapshotStoreConfig<T, Data<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>, StructuredMetadata<T, K>>, StructuredMetadata<T, K>, never>[]> => {
          try {
            // Example logic to fetch snapshot store configurations
            const snapshotStoreConfigs = await fetch('/api/snapshot-stores')
              .then((response) => response.json())
              .then((data) => {
                return data as SnapshotStoreConfig<T, Data<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>, StructuredMetadata<T, K>>, StructuredMetadata<T, K>, never>[];
              });

            return snapshotStoreConfigs;
          } catch (error) {
            console.error("Error fetching snapshot store configs:", error);
            throw new Error("Failed to fetch snapshot store configs");
          }
        },
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
  }



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
  
function getSubscriptionLevel(price: number): SubscriptionLevel | undefined {
  return subscriptionLevels.find((level: SubscriptionLevel) => level.price === price);
}