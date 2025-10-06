// SnapshotConfigBuilder.ts

import { EventStore } from "@/app/components/event/EventStore";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from "@/config//BaseConfig";
import { SnapshotManager } from "@/app/hooks/useSnapshotManager";
import baseMeta from "@/app/data_analysis/frontend/buddease/src/server/database/baseMeta";
import { SnapshotStoreConfig } from ".";
import { SnapshotUnion } from "./LocalStorageSnapshotStore";
import { SnapshotConfig } from "./SnapshotConfig";
import { SnapshotContainer } from "./SnapshotContainer";
import { SnapshotEvents } from "./SnapshotEvents";
import { InitializedData, SnapshotInstanceProps } from "./SnapshotStoreOptions";
import { storeProps } from "./SnapshotStoreProps";
import { SnapshotSubscriberManagement } from "./SnapshotSubscriberManagement";
import { SnapshotWithCriteria } from "./SnapshotWithCriteria";


interface SnapshotLifecycle {
  initializeWithData<T>(data: SnapshotUnion<T, any>[]): void;
  clear(): void;
}

type SnapshotConfigParams<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  Excluded extends keyof T = DefaultExcludedFields<T>,
  Extras extends unknown[] = []
> = [T, K, Meta, Excluded, ...Extras];

interface SimulatedDataSourceFromParams<
  Params extends SnapshotConfigParams<any, any, any, any, any[]> = SnapshotConfigParams
> extends SnapshotInstanceProps<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]> {
  data: InitializedData<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>;
  fetchData: () => Promise<SnapshotStoreConfig<Params[0], Params[1], Params[2], Params[3], Params[4], Params[5]>>;
}

// Master builder (factory companion)
export interface SnapshotConfigBuilder<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  Excluded extends keyof T = DefaultExcludedFields<T>
> {
  getType(): T;
  getKey(): K;
  getMeta(): Meta;
  getExcluded(): Excluded[];
//   build(): any; 
  // Core
  buildBaseConfig(): Promise<SnapshotConfig<T, K, Meta, Excluded>>;
  buildStoreMethods(): Promise<StoreMethods<T, K, Meta, Excluded>>;
  buildEventHandlers(): Promise<EventHandlers<T, K, Meta, Excluded>>;
  buildSnapshotStore(): Promise<EventStore<T, K, Meta, Excluded>>;
  buildSnapshotUnion(data: T, related?: K[]): Promise<SnapshotUnion<T, K, Meta, Excluded>>;
  buildLifecycle(): Promise<SnapshotLifecycle<T, K, Meta, Excluded>>;
  buildMeta(): Promise<SnapshotMeta<T, K, Meta, Excluded>>;

  // Extended
  buildStoreConfig(): Promise<SnapshotStoreConfig<T, K, Meta, Excluded>>;
  buildSnapshotEvents(): Promise<SnapshotEvents<T, K, Meta, Excluded>>;
  buildContainer(): Promise<SnapshotContainer<T, K, Meta, Excluded>>;
  buildSubscribers(): Promise<SnapshotSubscriberManagement<T, K, Meta, Excluded>>;
  buildWithCriteria(): Promise<SnapshotWithCriteria<T, K, Meta, Excluded>>;
  buildManager(): Promise<SnapshotManager<T, K, Meta, Excluded>>;
}


export type { SnapshotConfigParams };


// Initialize builder
const builder: SnapshotConfigBuilder<SnapshotConfigParams> = {
  buildBaseConfig: async (params) => ({
        id: generateId?.('prefix', 'name', NotificationTypeEnum.Default) || 'default-id',
      description: 'Snapshot description',
      category: currentCategory,
      metadata: unifiedMetadata, // Optional
      meta: structuredMetadata, // Optional
      mappedSnapshot: new Map(),
      mappedMeta: new Map(),
      snapshotCriteria: undefined,
      criteria: criteria || 'default-criteria',
      priority: priority || 'normal',
      data: baseData as InitializedData<T, K, Meta, ExcludedFields>,
      subscribers: [],
      storeConfig: snapshotStoreConfig,
      initialState: initialState || {},
      isCore: true,
      additionalData: additionalData,
      hasSnapshots: async () => false, // Provide a default implementation

      // If you need, include baseData / baseMeta props as well
      baseData,
      baseMeta,
      props: storeProps!,
  }),
  buildStoreMethods: async () => ({} as any),
  buildEventHandlers: async () => ({} as any),
  buildSnapshotStore: async () => ({} as any),
  buildSnapshotUnion: async () => ({} as any),
  buildLifecycle: async () => ({} as any),
  buildMeta: async () => ({} as any),
  buildStoreConfig: async () => ({} as any),
  buildSnapshotEvents: async () => ({} as any),
  buildContainer: async () => ({} as any),
  buildSubscribers: async () => ({} as any),
  buildWithCriteria: async () => ({} as any),
  buildManager: async () => ({} as any),
};

const { data: baseSnapshot } = await builder.buildBaseConfig();
