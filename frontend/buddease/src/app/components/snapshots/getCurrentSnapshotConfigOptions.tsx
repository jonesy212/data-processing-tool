// getCurrentSnapshotConfigOptions.ts

import { DataStoreMethods } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods';
import { createSnapshotStoreConfig } from '@/app/components/snapshots/snapshotStoreConfigInstance';
import CalendarManagerStoreClass from "@/app/components/state/stores/CalendarManagerStore";
import { Subscription } from '@/app/components/subscriptions/Subscription';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { CriteriaType } from "@/app/pages/searchs/CriteriaType";
import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
import { Category } from '../libraries/categories/generateCategoryProperties';
import { BaseData } from "../models/data/Data";
import { RealtimeDataItem } from '../models/realtime/RealtimeData';
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { DataWithPriority, DataWithTimestamp, DataWithVersion } from "../utils/versionUtils";
import SnapshotStore from "./SnapshotStore";
import { ExcludedFields } from '@/app/components/routing/Fields';
import { SnapshotStoreConfig } from "./SnapshotStoreConfig";
import { SnapshotsArray } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { InitializedDelegate, SnapshotStoreOptions } from '../snapshots/SnapshotStoreOptions';
import { getSnapshotContainer } from "./snapshotOperations";

import {
  ConfigureSnapshotStorePayload,
  Snapshot, SnapshotConfig, SnapshotContainer, SnapshotData,
  Snapshots,
  SnapshotStoreProps,
  SnapshotWithCriteria
} from './index';


class InitializedDelegateClass<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> implements InitializedDelegate<T, K, Meta> {
  private delegates: SnapshotWithCriteria<T, K, Meta>[];

  constructor(delegates: SnapshotWithCriteria<T, K, Meta>[]) {
    this.delegates = delegates;
  }

  public toConfigArray(): SnapshotStoreConfig<T, K, Meta>[] {
    return this.delegates.map((snap) => ({
      snapshotId: snap.id,
      snapshotContainer: snap.snapshots ?? [],
      criteria: snap.criteria,
      category: snap.category,
      categoryProperties: snap.categoryProperties,
      delegate: null,
      snapshotData: (store) => ({ snapshots: snap.snapshots ?? [] }),
      createdAt: snap.timestamp ? new Date(snap.timestamp) : new Date(),
      updatedAt: new Date(),
      metadata: snap.meta,
      snapshots: snap.snapshots ?? [],
      subscribers: snap.subscribers ?? [],
    }));
  }
  public async toConfigArrayAsync(): Promise<SnapshotStoreConfig<T, K, Meta>[]> {
    return this.toConfigArray();
  }
}


export const getCurrentSnapshotConfigOptions = <
  T extends BaseDataEntity, 
  K extends T = T,
 Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
  id: string | number,
  snapshotId: string | null,
  criteria: CriteriaType,
  category: Category | undefined,  
  categoryProperties: CategoryProperties | undefined,
  subscriberId: string | undefined,
  delegate: SnapshotWithCriteria<T, K, Meta>[] | null,
  snapshotData: SnapshotData<T, K, Meta>,
  snapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K>,
    category: Category | undefined,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K> | null) => void,
    dataStore: DataStore<T, K>,
    dataStoreMethods: DataStoreMethods<T, K>,
    // dataStoreSnapshotMethods: DataStoreWithSnapshotMethods<T, K>,
    metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number,// Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K>,
    snapshotConfigData: SnapshotConfig<T, K>,
    subscription: Subscription<T, K>,

    snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
    snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null,
  ) => Promise<Snapshot<T, K>>,
  data: Map<string, Snapshot<T, K>>,
  events: Record<string, CalendarManagerStoreClass<T, K>[]>, // Added prop
  dataItems: RealtimeDataItem[], // Added prop
  newData: Snapshot<T, K>, // Added prop
  payload: ConfigureSnapshotStorePayload<T, K>, // Added prop
  store: SnapshotStore<T, K>, // Added prop
  callback: (snapshot: SnapshotStore<T, K>) => void, // Added prop
  storeProps: SnapshotStoreProps<T, K>,
  endpointCategory: string | number,
  snapshotContainer: Promise<SnapshotContainer<T, K>>
): SnapshotStoreConfig<T, K> => {

  if (!snapshotId) {
    throw new Error('Snapshot ID is required');
  }

  const delegateInstance: InitializedDelegate<T, K, Meta> | null = delegate
    ? new InitializedDelegateClass<T, K, Meta>(delegate)
    : null;

  // Use createSnapshotStoreConfig to initialize the base configuration
  const baseConfig = createSnapshotStoreConfig<T, K, Meta>({
    snapshotId,
    getSnapshotContainer: () => snapshotContainer, // wrap your promise
    criteria,
    category,
    categoryProperties,
    delegate: delegateInstance,
    snapshotData: (snapshotStore: SnapshotStore<T, K, Meta>) => {
      const snapshotsArray: SnapshotsArray<T, K> = [];
      if (snapshotData && Array.isArray(snapshotData)) {
        snapshotsArray.push(...snapshotData);
      }
      return { snapshots: snapshotsArray };
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {} as Meta,
    snapshots: [],      // Correct type: SnapshotsArray<T, K, Meta>
    subscribers: [],    // Correct type: SubscriberCollection<T, K>[]  
  });

  // Type guards for conditional properties in the configuration
  const isDataWithPriority = (data: any): data is Partial<DataWithPriority> => 
    data && typeof data === 'object' && 'priority' in data;

  const isDataWithVersion = (data: any): data is Partial<DataWithVersion> => 
    data && typeof data === 'object' && 'version' in data;

  const isDataWithTimestamp = (data: any): data is Partial<DataWithTimestamp> => 
    data && typeof data === 'object' && 'timestamp' in data;

  // Conditional logic for configuring based on data properties
  if (isDataWithPriority(snapshotData)) {
    console.log(`Priority level: ${snapshotData.priority}`);
    // Extend baseConfig if needed based on priority
  }

  if (isDataWithVersion(snapshotData)) {
    console.log(`Version: ${snapshotData.version}`);
    // Extend baseConfig if needed based on version
  }

  if (isDataWithTimestamp(snapshotData)) {
    console.log(`Timestamp: ${snapshotData.timestamp}`);
    // Extend baseConfig if needed based on timestamp
  }

  // Return the final configuration, integrating configureSnapshot method and ensuring tempData is accessible
  return {
    ...baseConfig,
    configureSnapshot: (
      id: string,
      storeId: number,
      snapshotId: string,
      snapshotData: SnapshotData<T, K>,
      dataStoreMethods: DataStore<T, K>,
      category?: Category,
      categoryProperties?: CategoryProperties | undefined,
      callback?: (snapshot: Snapshot<T, K>) => void,
      snapshotStore?: SnapshotStore<T, K>,
      snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never> 
    ): { snapshot: Snapshot<T, K>, config: SnapshotConfig<T, K> } | null => {
      // Ensure snapshotStore exists within snapshotData
      if (!snapshotData.snapshotStore) {
        throw new Error("snapshotStore cannot be null");
      }

      // Link baseConfig to snapshotStore
      snapshotData.snapshotStore.snapshotStoreConfig = baseConfig;

      // Return configured snapshot and config
      return snapshotData.snapshotStore;
    },
    // Ensure tempData access is part of the configuration
    tempData: baseConfig.tempData
  };
};
