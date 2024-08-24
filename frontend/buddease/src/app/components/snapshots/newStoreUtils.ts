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


// newStoreUtils.ts
export const createSnapshotStores = async <T extends Data, K extends Data>(
  snapshot: Snapshot<T, K>,
  snapshotStore: SnapshotStore<T, K>,
  snapshotManager: SnapshotManager<T, K>,
  payload: CreateSnapshotStoresPayload<T, K>,
  callback: (snapshotStore: SnapshotStore<T, K>[]) => void | null,
  snapshotStoreData?: SnapshotStore<T, K>[],
  category?: string | CategoryProperties,
  snapshotDataConfig?: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K>[]
) => {
  const snapshotStoreConfigData = snapshotDataConfig && snapshotDataConfig.length > 0 ? snapshotDataConfig[0] : undefined;
  const snapshotId = snapshot?.store?.snapshotId ?? undefined;
  const storeId = await snapshotApi.getSnapshotStoreId(Number(snapshotId));
  const config: SnapshotStoreConfig<SnapshotWithCriteria<any, BaseData>, K> | undefined = snapshotStoreConfigData;
  const options = await useSnapshotManager(storeId)
    ? new SnapshotManagerOptions().get()
    : {
      eventRecords: [],
      category: '',
      date: new Date(),
      type: '',
      // Add other required properties here
    };
  const operation: SnapshotOperation = {
    operationType: SnapshotOperationType.FindSnapshot
  };
  const newStore = new SnapshotStore<T, K>(storeId, options, category, config, operation)
    ;
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

const category = 
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