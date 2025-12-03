// getCurrentSnapshotConfigOptions.tsx

import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { SnapshotConfig } from '@/app/snapshots/SnapshotConfig';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from "@/app/pages/searches/CriteriaType";
import { DataStore } from "@/app/state/stores/DataStore";
import { DataStoreMethods } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStoreMethods';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { SnapshotContainerType } from '@/app/snapshots/SnapshotContainer';
import { createSnapshotStoreConfig } from '@/app/snapshots/snapshotStoreConfigInstance';
import { InitializedDelegate } from '@/app/snapshots/SnapshotStoreOptions';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { Subscription } from '@/app/subscriptions/Subscription';
import { DataWithPriority, DataWithTimestamp, DataWithVersion } from "@/utils/versionUtils";
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { Attachment } from '@/app/documents/attachment/Attachment';

import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { ConfigureSnapshotStorePayload } from '@/app/snapshots/SnapshotConfig';

import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshotWithCriteria';
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import { SnapshotStoreProps } from '@/app/snapshots/SnapshotStoreProps';

class InitializedDelegateClass<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> implements InitializedDelegate<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  private delegates: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  constructor(delegates: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) {
    this.delegates = delegates;
  }

  async getDelegates(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    return this.delegates as unknown as SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  }

  public toConfigArray(): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
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
  public async toConfigArrayAsync(): Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    return this.toConfigArray();
  }
}


export const getCurrentSnapshotConfigOptions = <
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  >(
  id: string | number,
  snapshotId: string | null,
  criteria: CriteriaType,
  categoryProperties: CategoryProperties | undefined,
  subscriberId: string | undefined,
  delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null,
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshot: (
    id: string | number | undefined,
    snapshotId: string | null,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    categoryProperties: CategoryProperties | undefined,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null) => void,
    dataStore: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscriberId: string, // Add subscriberId here
    endpointCategory: string | number,// Add endpointCategory here
    storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotConfigData: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscription: Subscription<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  ) => Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>, // Added prop
  dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[], // Added prop
  newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Added prop
  payload: ConfigureSnapshotStorePayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Added prop
  store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // Added prop
  callback: (snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void, // Added prop
  storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  endpointCategory: string | number,
  snapshotContainer: Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  category?: Category,  
): SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {

  if (!snapshotId) {
    throw new Error('Snapshot ID is required');
  }

  const delegateInstance: InitializedDelegate<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = delegate
    ? new InitializedDelegateClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(delegate)
    : null;

  const snapshotsArray: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = [];
    if (snapshotData && Array.isArray(snapshotData)) {
      snapshotsArray.push(...snapshotData);
    }

  // Use createSnapshotStoreConfig to initialize the base configuration
  const baseConfig = createSnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
    snapshotId,
    getSnapshotContainer: () => snapshotContainer, // wrap your promise
    criteria,
    category,
    categoryProperties,
    delegate: delegateInstance,
    snapshotData,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {} as Meta,
    snapshots: snapshotsArray,      // Correct type: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    subscribers: [],    // Correct type: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]  
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

  // Fixed: Correct syntax for the configureSnapshot method
  const configureSnapshot = (
    id: string,
    storeId: number,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataStoreMethods: DataStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category?: Category,
    categoryProperties?: CategoryProperties | undefined,
    callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
    snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null => {
    // Ensure snapshotStore exists within snapshotData
    if (!snapshotData.snapshotStore) {
      throw new Error("snapshotStore cannot be null");
    }

    // Link baseConfig to snapshotStore
    snapshotData.snapshotStore.snapshotStoreConfig = baseConfig;

    // Return configured snapshot and config
    return snapshotData.snapshotStore;
  };

  // Return the final configuration
  return {
    ...baseConfig,
    configureSnapshot,
    // Ensure tempData access is part of the configuration
    tempData: baseConfig.tempData
  };
};