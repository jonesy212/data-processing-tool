// newStoreUtils.ts
import * as snapshotApi from '@/app/api/SnapshotApi';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import { SnapshotManager, useSnapshotManager } from "@/app/hooks/useSnapshotManager";
import { BaseData, Data } from '@/app/models/data/Data';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { DataStoreWithSnapshotMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods";
import { CreateSnapshotStoresPayload } from "@/app/server/database/Payload";
import { SnapshotConfig, SnapshotData } from '@/app/snapshots';
import { EventRecord } from '@/app/state/stores/DataStore';
import { ExcludedFields } from '@/routing/Fields';
import { K, Snapshot, snapshot, snapshotContainer, SnapshotOperation, SnapshotOperationType, snapshotStoreConfig, SnapshotStoreConfig, SnapshotWithCriteria, subscribeToSnapshot, subscribeToSnapshots, T } from ".";
import SnapshotManagerOptions from "./SnapshotManagerOptions";
import SnapshotStore from "./SnapshotStore";

const snapConfig: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined = {/* your snapshot configuration logic here */}

export const createSnapshotStores = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  payload: CreateSnapshotStoresPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => void | null,
  snapshotStoreData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  category?:  Category,
  snapshotStoreDataConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
) => {
  const snapshotStoreConfigData = snapshotStoreDataConfig || undefined;
  const snapshotId = snapshot?.store?.snapshotId ?? undefined;
  const storeId = await snapshotApi.getSnapshotStoreId(snapshotId);
  const config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStoreConfig<any, any>[] | undefined = snapshotStoreConfigData;
  // Use dynamic properties with SnapshotManagerOptions
  // Use dynamic properties with SnapshotManagerOptions
  const options = await useSnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(storeId)
  ? new SnapshotManagerOptions<T, K, Meta, ExcludedFields<T>>({
      handleSnapshotStoreOperation: async (
        snapshotId: string, 
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        operationType: SnapshotOperationType, 
        callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void
      ): Promise<void> => { /* custom store operation handling */ },
      displayToast: async (message) => console.log("Toast message:", message),
      addToSnapshotList: async (snapshot) => { /* custom logic to add snapshot */ },
      simulatedDataSource: (
        entityType: string, 
        storeId: number, 
        config?: SnapshotStoreConfig<T, K, ExcludedFieldE>,
        excludedFields?: DefaultExcludedFields<T>
      ) => ({
        // Required properties from SnapshotInstanceProps
        id: 'mock-simulated-data-source',
        createdAt: new Date(),
        updatedAt: new Date(),
        meta: new Map() as DefaultMeta<T, K>,
        
        // Required properties from SimulatedDataSource interface
        data: {
          initialized: true,
          entities: new Map().set("mock-entity", {
            id: "mock-entity",
            title: "Mock Entity",
            description: "Mock description",
            timestamp: new Date(),
            category: "mock-category"
          } as T),
          metadata: new Map(),
          lastUpdated: new Date()
        } as InitializedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        
        fetchData: async (): Promise<SnapshotStoreConfig<T, K, Meta>> => ({
          baseURL: "mock-base-url",
          enabled: true,
          maxRetries: 3,
          retryDelay: 1000,
          maxAge: 300000,
          staleWhileRevalidate: 60000,
          cacheKey: "mock-cache-key",
          eventRecords: {} as Record<string, EventRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
          category: 'mock-category',
          date: new Date(),
          type: 'mock-type',
          data: new Map(),
          initialState: null,
          snapshotId: 'mock-snapshot-id',
          snapshotConfig: [],
          subscribeToSnapshots: async (
            snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            snapshotId: string,
            snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            category?: Category,
            snapshotConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            callback: (
              snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
              snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
            ) => Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
            snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            unsubscribe?: UnsubscribeDetails,
          ): Promise<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
            // Your subscription logic here
            console.log('Subscribing to snapshots:', snapshotId);
            
            // Simulate fetching snapshots
            const mockSnapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = [
              {
                id: snapshotId,
                data: new Map().set('mock-key', {
                  data: {
                    id: 'mock-data',
                    title: 'Mock Title',
                    description: 'Mock Description',
                    timestamp: new Date(),
                    category: 'mock-category'
                  } as T,
                  meta: new Map() as Meta,
                  events: {
                    eventRecords: new Map()
                  }
                }),
                meta: new Map() as Meta,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ];
            
            // Call the callback with the snapshots
            callback(snapshotStore, mockSnapshots);
            
            // Return the snapshots array
            return mockSnapshots;
          },
          subscribeToSnapshot: async () => {},
          delegate: [],
          dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          getDelegate: async () => [],
          getDataStoreMethods: function (): DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
            return {} as DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          },
          snapshotMethods: []
        }),
        
        // Optional: Additional data methods
        get: async (id: string) => ({
          id,
          data: {
            id: "mock-data",
            title: "Mock Title",
            description: "Mock Description",
            timestamp: new Date(),
            category: "Mock Category"
          } as T,
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        create: async (data: Partial<T>) => ({
          id: `mock-${Date.now()}`,
          data: {
            ...data,
            id: `mock-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date()
          } as T,
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        update: async (id: string, data: Partial<T>) => ({
          id,
          data: {
            ...data,
            id,
            updatedAt: new Date()
          } as T,
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        delete: async (id: string) => true,
        list: async () => [{
          id: "mock-item-1",
          data: {
            id: "mock-item-1",
            title: "Mock Item 1",
            description: "Description 1",
            timestamp: new Date(),
            category: "Category 1"
          } as T,
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      }),
    }).get()
  : {
      // ... rest of your alternative configuration
    };

  const operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    operationType: SnapshotOperationType.FindSnapshot,
  };

  const newStore = new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(storeId, options, category, config, operation);
  callback([newStore]);
  // Simulate a delay before receiving the update
  setTimeout(() => {
    const data: BaseData = {
      id: "data1", // Ensure this matches the expected structure of BaseData
      title: "Sample Data",
      description: "Sample description",
      timestamp: new Date(),
      category: "Sample category",
      tags: { "1": { id: "1", name: "Important", color: "red", relatedTags: [] } },
      status: "Pending",
      isActive: true,
    }
  })
}

const category = process.argv[3] as keyof CategoryProperties;
const snapshotId: string | number | undefined = snapshot?.store?.snapshotId ?? undefined;
const storeId = await snapshotApi.getSnapshotStoreId(Number(snapshotId));
const criteria = await snapshotApi.getSnapshotCriteria(snapshotContainer, snapshot)
const config: SnapshotStoreConfig<SnapshotWithCriteria<Data, any>, any> = snapshotStoreConfig;
const snapshotStoreDataConfig = snapshotApi.getSnapshotStoreConfigData(Number(snapshotId), snapshotContainer, criteria, storeId, config)
// Correctly handle the snapshotManager instance
const data = await snapshotApi.getSnapshotData(snapshotContainer, snapshot, criteria, storeId, config)
const snapshotManagerResponse = await useSnapshotManager(storeId);
const options = snapshotManagerResponse && snapshotManagerResponse.snapshotManager
  ? snapshotManagerResponse.snapshotManager.getData(data)
  : {
    data: new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(),
    initialState: null,
    snapshotId: "",
    category: { /* Default category values */ },
    date: new Date(),
    type: "initial-type",
    snapshotConfig: [],
    subscribeToSnapshots: subscribeToSnapshots,
    subscribeToSnapshot: subscribeToSnapshot,
    delegate: [],
    dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    getDelegate: [],
    getDataStoreMethods: function (): DataStoreWithSnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
      throw new Error("Function not implemented.");
    },
    snapshotMethods: [],
    eventRecords: null,
  };

const operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
  operationType: SnapshotOperationType.FindSnapshot,
};

export const newStore = new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(storeId, options, category, config, operation);