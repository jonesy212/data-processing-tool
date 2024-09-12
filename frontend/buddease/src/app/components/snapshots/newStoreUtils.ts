import { SnapshotConfig } from '@/app/components/snapshots';
import { SnapshotUnion } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { K, Snapshot, snapshot, snapshotContainer, SnapshotOperation, SnapshotOperationType, snapshotStoreConfig, SnapshotStoreConfig, SnapshotWithCriteria, subscribeToSnapshot, subscribeToSnapshots, T } from ".";
import * as snapshotApi from '@/app/api/SnapshotApi'
import SnapshotStore from "./SnapshotStore";
import { SnapshotManager, useSnapshotManager } from "../hooks/useSnapshotManager";
import SnapshotManagerOptions from "./SnapshotManagerOptions";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CreateSnapshotStoresPayload } from "../database/Payload";
import { BaseData, Data } from "../models/data/Data";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { snapshotStoreConfigInstance } from "./snapshotStoreConfigInstance";



const snapConfig: SnapshotConfig<T, K> | undefined = /* your snapshot configuration logic here */;


// newStoreUtils.ts
export const createSnapshotStores = async <T extends Data, K extends Data>(
  snapshot: Snapshot<T, K>,
  snapshotStore: SnapshotStore<T, K>,
  snapshotManager: SnapshotManager<T, K>,
  payload: CreateSnapshotStoresPayload<T, K>,
  callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
  snapshotStoreData?: SnapshotStore<T, K>[],
  category?: string | CategoryProperties,
  snapshotStoreDataConfig?: SnapshotStoreConfig<T, K> | undefined,
) => {
  const snapshotStoreConfigData = snapshotStoreDataConfig || undefined;
  const snapshotId = snapshot?.store?.snapshotId ?? undefined;
  const storeId = await snapshotApi.getSnapshotStoreId(Number(snapshotId));
  const config: SnapshotStoreConfig<T, K> | SnapshotStoreConfig<any, any>[] | undefined = snapshotStoreConfigData;
  // Use dynamic properties with SnapshotManagerOptions
  const options = await useSnapshotManager<T, K>(storeId)
    ? new SnapshotManagerOptions<T, K>({
        baseURL: "custom-base-url",
        enabled: true,
        maxRetries: 5,
        retryDelay: 2000,
        maxAge: 500,
        staleWhileRevalidate: 1000,
        cacheKey: "custom-cache-key",
        snapshotStoreConfig: snapshotStoreConfigData,
        unsubscribeToSnapshots: () => { /* custom unsubscribe logic */ },
        unsubscribeToSnapshot: () => { /* custom unsubscribe logic */ },
        getCategory: category ? { name: category as string } : undefined,
        getSnapshotConfig: () => {
          // Return the snapConfig or undefined if not set
          return snapConfig ? snapConfig : undefined;
        },
        // handleSnapshotOperation: (
        //   snapshot: Snapshot<T, K>, 
        //   data: Map<string, Snapshot<T, K>>, 
        //   operation: SnapshotOperation,
        //   operationType: SnapshotOperationType
        // )
        //   // : Promise<Snapshot<T, K>>
        //   => 
        //     {
        //   // Custom operation handling logic
          
        //   // Make sure to return a valid Promise<Snapshot<T, K>>
        //   return Promise.resolve(snapshot); // Example return, adjust to your logic
        // },
    
        handleSnapshotStoreOperation: async (
          snapshotId: string, 
          snapshotStore: SnapshotStore<T, K>, 
          snapshot: Snapshot<T, K>,
          operation: SnapshotOperation,
          operationType: SnapshotOperationType, 
          callback: (snapshotStore: SnapshotStore<T, K>) => void
        ): Promise<void> => { /* custom store operation handling */ },
        displayToast: (message) => console.log("Toast message:", message),
        addToSnapshotList: (snapshot) => { /* custom logic to add snapshot */ },
        simulatedDataSource: () => ({ /* simulated data */ }),
      }).get()
    : {
      baseURL: "custom-base-url",
        enabled: true,
        maxRetries: 5,
        retryDelay: 2000,
        maxAge: 500,
        staleWhileRevalidate: 1000,
        cacheKey: "custom-cache-key",
        eventRecords: {},
        category: '',
        date: new Date(),
        type: '',
        data: new Map<string, Snapshot<T, K>>(),
        initialState: null,
        snapshotId: '',
        snapshotConfig: [],
        subscribeToSnapshots: subscribeToSnapshots,
        subscribeToSnapshot: subscribeToSnapshot,
        delegate: [],
        dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, K>,
        getDelegate: [],
        getDataStoreMethods: function (): DataStoreWithSnapshotMethods<T, K> {
          throw new Error('Function not implemented.');
        },
        snapshotMethods: [],
      };

  const operation: SnapshotOperation = {
    operationType: SnapshotOperationType.FindSnapshot,
  };

  const newStore = new SnapshotStore<T, K>(storeId, options, category, config, operation);
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
    data: new Map<string, Snapshot<T, K>>(),
    initialState: null,
    snapshotId: "",
    category: { /* Default category values */ },
    date: new Date(),
    type: "initial-type",
    snapshotConfig: [],
    subscribeToSnapshots: subscribeToSnapshots,
    subscribeToSnapshot: subscribeToSnapshot,
    delegate: [],
    dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, K>,
    getDelegate: [],
    getDataStoreMethods: function (): DataStoreWithSnapshotMethods<T, K> {
      throw new Error("Function not implemented.");
    },
    snapshotMethods: [],
    eventRecords: null,
  };

const operation: SnapshotOperation = {
  operationType: SnapshotOperationType.FindSnapshot,
};

export const newStore = new SnapshotStore<T, K>(storeId, options, category, config, operation);