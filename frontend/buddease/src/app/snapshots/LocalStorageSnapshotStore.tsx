// LocalStorageSnapshotStore.tsx
import * as snapshotApi from '@/app/api/SnapshotApi';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotManager } from '@/app/hooks/useSnapshotManager';
import { isCategoryProperties } from '@/app/libraries/categories/generateCategoryProperties';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { AppEntity, AppExcludedFields, AppK, AppMeta, snapshotStoreConfigInstance } from '@/snapshotStoreConfigInstance';

import { Task, TaskData } from '@/app/components/models/tasks/Task';
import { Data } from '@/app/models/data/Data';
import {
  PriorityTypeEnum,
  ProjectPhaseTypeEnum,
  StatusType,
  SubscriberTypeEnum
} from '@/app/models/data/StatusType';
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { EventManager } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import {
  UpdateSnapshotPayload
} from '@/app/server/database/Payload';
import createSnapshotOptions from '@/app/snapshots/createSnapshotOptions';
import {
  CustomSnapshotData,
  SnapshotData
} from '@/app/snapshots/SnapshotData';
import { SnapshotEvents } from '@/app/snapshots/SnapshotEvents';
import { useSnapshotStore } from '@/app/snapshots/useSnapshotStore';
import { Subscriber } from '@/app/subscribers/Subscriber';
import { createLatestVersion } from '@/app/versions/createLatestVersion';
import {
  NotificationType
} from '@/context/NotificationContext';

import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { CoreSnapshot } from '@/app/snapshots/CoreSnapshot';

import CalendarManagerStoreClass from '@/app/state/stores/CalendarManagerStore';
import { SubscriberCollection } from '@/app/users/SubscriberCollection';

import { RealtimeDataItem } from '@/app/models/realtime/RealtimeData';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshotWithCriteria';

import { AddReport, AddReportType } from '@/app/api/ApiReport';
import { endpoints } from '@/app/api/endpointConfigurations';
import { ChatRoom } from '@/app/calendar/CalendarSlice';
import { Sender } from '@/app/communications/chat/Communication';
import { SharedSnapshotProperties } from '@/app/components/documents/RelatedProps';
import { Meta } from '@/app/components/models/data/dataStoreMethods';
import { BaseEntity } from '@/app/components/routing/FuzzyMatch';
import { ModifiedDate } from '@/app/documents/DocType';
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { BaseData } from '@/app/models/data/Data';
import { K, T } from '@/app/models/data/dataStoreMethods';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { PhaseData } from '@/app/phases/Phase';
import { ExcludedFields } from '@/app/routing/Fields';
import { createCompleteSnapshot } from '@/app/snapshots/createSnapshot';
import { createSnapshot } from '@/app/snapshots/defaultSnapshotBuilder';
import { Snapshot } from '@/app/snapshots/Snapshot';
import {
  snapshotContainer,
  SnapshotContainer
} from '@/app/snapshots/SnapshotContainer';
import { SnapshotDataParams } from '@/app/snapshots/SnapshotDataParams';
import { SnapshotOperations } from '@/app/snapshots/snapshotOperations';
import { SnapshotSecurity } from '@/app/snapshots/SnapshotSecurity';
import { InitializedSnapshot } from '@/app/snapshots/SnapshotStoreOptions';
import { SnapshotStoreProps } from '@/app/snapshots/useSnapshotStore';
import { getSubscriptionLevel } from '@/app/subscriptions/SubscriptionLevel';
import { isSnapshotData } from '@/app/utils/snapshotUtils';
import {
  getCommunityEngagement,
  getMarketUpdates,
  getTradeExecutions,
} from '@/app/utils/trading/TradingUtils';
import {
  logActivity,
  notifyEventSystem,
  portfolioUpdates,
  triggerIncentives,
  unsubscribe,
  updateProjectState,
} from '@/app/utils/web3/applicationUtils';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { SharedMetadata } from '@/app/shared/SharedMetadata';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import baseMeta from '@/server/database/baseMeta';
import { FC } from 'react';

const SNAPSHOT_URL = endpoints.snapshots;

// Define SnapshotUnion without needing K
type SnapshotUnion<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = (Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | InitializedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) & BaseDataEntity;

type Snapshots<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  > = | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

// Update SnapshotStoreUnion to use K
type SnapshotStoreUnion<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> =
  | SnapshotStoreObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;



// Update SnapshotsObject to use K

type SnapshotsObject<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
  [key: string]: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
};

type SnapshotsArray<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = Array<SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;


type SnapshotStoreObject<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
  [key: string]: SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
};

type Result<T> = { success: true; data: T } | { success: false; error: Error };

// Define the snapshot function correctly

// Also update the snapshot function
const snapshotFunction = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  id: string | number | undefined,
  snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  category: Category | undefined,
  callback: (snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
  criteria: CriteriaType,
  snapshotId?: string | number | null,
  snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotStoreConfigSearch?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotContainerData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
): Promise<SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  // Your logic for handling the snapshot goes here

  // If snapshotData is already a Promise or has a then method, return it directly
  if (typeof (snapshotData as any)?.then === "function") {
    return Promise.resolve(snapshotData); // snapshotData might already be a promise-like object
  }

  // Otherwise, return a resolved Promise with snapshotData
  return Promise.resolve(snapshotData);
};

// Type Guard for SnapshotWithCriteria
function isSnapshotWithCriteria<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(obj: unknown): obj is SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "criteria" in obj &&
    "category" in obj &&
    "id" in obj &&
    "properties" in obj &&
    // Additional checks specific to SnapshotWithCriteria
    "delegate" in obj &&
    "timestamp" in obj &&
    // Ensure it has Snapshot properties
    "data" in obj &&
    "meta" in obj
  );
}

// First, ensure snapshotApi is properly typed
interface ISnapshotApi {
  getSnapshotCriteria<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    container: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    callback: (
      id: string | number | undefined,
      snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      category: Category | undefined,
      callback: (snapshot: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
      criteria: CriteriaType,
      snapshotId?: string | number | null,
      snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapshotContainerData?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
    ) => Promise<SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    snapshotObj?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<CriteriaType>;
}

  // First, define a type that bridges between the two snapshot data types
  type CompatibleSnapshotData<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  > = 
    SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
      state?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
      properties?: T | K;
    };

  const getCriteria = async (): Promise<CriteriaType> => {
    try {
      type CustomData = CustomSnapshotData<BaseDataEntity> & BaseDataEntity;
      type CustomK = K<CustomData>;
  
      // Type for the snapshot handler callback
      type SnapshotHandler = (
        id: string | number | undefined,
        snapshotData: CompatibleSnapshotData<CustomData>,
        category: Category | undefined,
        callback: (snapshot: SnapshotStore<CustomData, CustomK>) => void,
        criteria: CriteriaType,
        snapshotId?: string | number | null,
        snapshotStoreConfigData?: SnapshotStoreConfig<CustomData, CustomK>,
        snapshotContainerData?: SnapshotStore<CustomData, CustomK> | Snapshot<CustomData, CustomK> | null
      ) => Promise<SnapshotData<CustomData, CustomK>>;
      
      // Define the handler as a function that explicitly returns a Promise
      const handleSnapshot: SnapshotHandler = (
        id: string | number | undefined,
        snapshotData: CompatibleSnapshotData<CustomData>,
        category: Category | undefined,
        callback: (snapshot: SnapshotStore<CustomData, CustomK>) => void,
        criteria: CriteriaType,
        snapshotId?: string | number | null,
        snapshotStoreConfigData?: SnapshotStoreConfig<CustomData, CustomK>,
        snapshotContainerData?: SnapshotStore<CustomData, CustomK> | Snapshot<CustomData, CustomK> | null
      ): Promise<SnapshotData<CustomData, CustomK>> => {
        return Promise.resolve().then(async () => {
          if (isSnapshotWithCriteria(snapshotData)) {
            const config = snapshotData.config ? await snapshotData.config : undefined;
            const compatibleData = snapshotData as SnapshotData<CustomData, CustomK>;
            
            const result = await snapshotFunction(
              id,
              compatibleData,
              category,
              callback,
              criteria,
              snapshotId,
              snapshotStoreConfigData,
              config
            );

            // ✅ Use the proper type guard
            if (isSnapshotData<CustomData, CustomK>(result)) {
              return result;
            }

            // ✅ Convert if it's a Snapshot
            if (isSnapshot<CustomData, CustomK>(result)) {
              return convertSnapshotToSnapshotData<CustomData, CustomK>(result);
            }

            throw new Error(`Invalid result type: ${typeof result}`);
          }
          throw new Error("Invalid snapshot type");
        });
      };

      // Add conversion function
      const convertSnapshotToSnapshotData = (
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      ): SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {

        const hasExistingMethods = snapshot.serialize && snapshot.validate && snapshot.get;
  
        return {

          core: {
            // Preserve core methods if they exist, otherwise provide defaults
            ...snapshot.core
          } as CoreSnapshot<T, K, any>,
          shared: { ...snapshot.shared } as SharedSnapshotProperties<T, K, any>,
          identity: { ...snapshot.identity } as SnapshotIdentity,
          security: { ...snapshot.security } as SnapshotSecurity,
          versioning: { ...snapshot.versioning } as SnapshotVersioning<T, K, any>,
          storage: { ...snapshot.storage } as SnapshotStorage<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          operations: {
            // Operations methods if they exist in snapshot.operations
            ...snapshot.operations
          } as SnapshotOperations<T, K, Meta, AttachmentType, ExcludedFields>,
          
          base: { ...snapshot.base } as BaseEntity<T, K, any, any>,
          sharedMetadata: { ...snapshot.sharedMetadata } as SharedMetadata<T, K, any, any>,
          snapshotStore: snapshot.snapshotStore ?? null,
          
          // REQUIRED METHODS AT ROOT LEVEL
          serialize: snapshot.serialize ?? (() => "serialize"),
          validate: snapshot.validate ?? (() => true),
          get: snapshot.get ?? ((key: string) => ({})),
          
          // Copy all properties from the snapshot
          ...snapshot,
          
          // Ensure required properties exist
          storeId: snapshot.storeId ?? 0,
          set: snapshot.set ?? ((key: string, value: any) => {}),
          timestamp: snapshot.timestamp ?? new Date(),
          isExpired: snapshot.isExpired ?? (() => false),
          setSnapshotCategory: snapshot.setSnapshotCategory ?? (() => {}),
          getSnapshotCategory: snapshot.getSnapshotCategory ?? (() => undefined),
          getSnapshotData: snapshot.getSnapshotData ?? (() => undefined),
          deleteSnapshot: snapshot.deleteSnapshot ?? (() => {}),
          processEvent: snapshot.processEvent ?? ((data: any, type: string, event: Event) => {}),
          // Default empty arrays for collection properties
          subscribers: snapshot.subscribers ?? [],
          auditTrail: snapshot.auditTrail ?? [],
          snapshotIds: snapshot.snapshotIds ?? [],
          methods: snapshot.methods ?? [],
        } as SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      };

      // Type guard for Snapshot
      const isSnapshot = <T extends BaseDataEntity, K extends T = T>(
        input: any
      ): input is Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
        return input && typeof input.storeId === 'number';
      };
  
      return snapshotApi.getSnapshotCriteria<CustomData, CustomK>(
        snapshotContainer as unknown as SnapshotContainer<CustomData, CustomK>,
        handleSnapshot
      );
    } catch (error) {
      console.error("Error getting criteria:", error);
      throw error;
    }
  };


// Usage

const criteria = await getCriteria();

const snapshotObj = {} as Snapshot<Data<BaseDataEntity>, K>;
const options = createSnapshotOptions(snapshotObj, snapshotFunction);
const snapshotId = await snapshotApi.getSnapshotId(criteria);
const storeId = await snapshotApi.getSnapshotStoreId(String(snapshotId));
if (snapshotId !== null && snapshotId !== undefined) {
  const snapshotStore = snapshotApi.getSnapshotStore(
    snapshotId,
    snapshotContainer as unknown as SnapshotContainer<
      Data<BaseDataEntity>,
      K
    >,
    storeId,
    criteria,
    snapshotFunction
  );

  const snapshotStoreConfig = snapshotApi.getSnapshotStoreConfig(
    String(snapshotId),
    snapshotContainer as unknown as SnapshotContainer<
      T,
      K
    >,
    criteria,
    storeId,
    snapshotFunction
  );

  const SNAPSHOT_STORE_CONFIG: SnapshotStoreConfig<T, K
  > = snapshotStoreConfig;
}

// const snapshotStoreConfig = snapshotApi.getSnapshotStoreConfig(null, {} as SnapshotContainer<BaseDataEntity, BaseData>, {}, storeId)
const SNAPSHOT_STORE_CONFIG: SnapshotStoreConfig<T, K
> = snapshotStoreConfigInstance as SnapshotStoreConfig<Data<BaseDataEntity>, K>;


interface SnapshotEquality<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  equals(
    otherStore: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<boolean>;
}

const snapshotManager = useSnapshotStore<T, K, StructuredMetadata<T, K>, ExcludedFields>(storeId);


export class LocalStorageSnapshotStore<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T // Add this
> extends SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  private static validateManager(manager: any): void {
    if (!manager) {
      throw new Error("SnapshotManager is not defined");
    }
  }

  constructor(props: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
    super(props);
    LocalStorageSnapshotStore.validateManager(this);
    // Additional setup for LocalStorageSnapshotStore, if needed

  }

  // Override store method to add localStorage functionality
  override getStore(storeId: number): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    const parentStore = super.getStore(storeId);
    if (parentStore) {
      this.syncToLocalStorage(parentStore);
    }
    return parentStore;
  }

  // Override addStore method
  override addStore(
    storeId: number,
    snapshotId: string | null,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: Event
  ): SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null {
    const addedStore = super.addStore(storeId, snapshotId, snapshotStore, snapshot, type, event);
    if (addedStore) {
      this.persistToLocalStorage(addedStore);
    }
    return addedStore;
  }

  private syncToLocalStorage(store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
    // Sync parent store data to localStorage
    localStorage.setItem(`snapshot-store-${store.storeId}`, JSON.stringify(store));
  }

  private persistToLocalStorage(store: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
    // Persist new store to localStorage
    localStorage.setItem(`snapshot-store-${store.storeId}`, JSON.stringify(store));
  }


   private createSnapshotObject(
    id: string,
    baseData?: Partial<T>,
    baseMeta?: Partial<Meta>,
    store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    manager?: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    config?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return createSnapshot(id, baseData, baseMeta, store, manager, config);
  }


  fetchStoreData(id: number): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    
    const snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: id.toString(),
      data: new Map<string, any>(), // Placeholder; replace with fetched data
      category: "default-category", // Replace with actual category if needed
      getSnapshotId: async () => id.toString(),
      compareSnapshotState: () => false, // Implement comparison logic as needed
      snapshot: async (): Promise<{
        snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      }> => {
        const snapshot = this.createSnapshotObject(
          id.toString(),
          baseData,
          baseMeta,
          snapshotStore,
          snapshotManager,
          this.snapshotStoreConfig
        );

        const snapshotData = this.createSnapshotData(snapshot); // You need to implement this
        
        return {
          snapshot,
          snapshotData
        };
      },
       getSnapshotData: (params: SnapshotDataParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        // Implement the actual logic to return SnapshotData
        return {
          id: params.id?.toString() || 'default-id',
          // Add other required SnapshotData properties
          validate: () => true,
          serialize: () => JSON.stringify({}),
          get: (key: string) => undefined,
          set: (key: string, value: any) => {},
          // ... other SnapshotData properties
        } as SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      },
      getSnapshotCategory: () => "default-category",
      setSnapshotData: this.setSnapshotData,
      setSnapshotCategory: (newCategory: any) => {
        // Implement logic to set snapshot category
      },
      deleteSnapshot: () => {
        // Implement logic to delete snapshot
      },
      restoreSnapshot: this.restoreSnapshot,
      createSnapshot: () =>
        this.createSnapshotObject(
          id.toString(),
          baseData,
          baseMeta,
          snapshotStore,
          snapshotManager,
          snapshotStoreConfig
        ),
      updateSnapshot: this.updateSnapshot,
    };
    return Promise.resolve([snapshotStore]);
  }

  private async fetchOrCreateSnapshot(
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    store: SnapshotStore<any, K>,
    snapshotId?: string | number | null
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    // Check if the snapshot already exists in the data map
    if (snapshotId && data.has(snapshotId.toString())) {
      const existingSnapshot = data.get(snapshotId.toString());
      if (existingSnapshot) {
        return existingSnapshot; // Return the existing snapshot
      }
    }

    // If the snapshot doesn't exist, create a new one
    return await createSnapshot(
      snapshotId,
      data,
      "default-category",
      snapshotStore,
      store.config
    );
  }

  private getSnapshotData(
    params: SnapshotDataParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    // Extract parameters from the params object
    const { snapshotStore, data, subscribers, snapshotData } = params;
    
    snapshotStore.data = new Map(data);

    if (snapshotData?.initialState) {
      snapshotStore.data = new Map(snapshotData.initialState);
    }

    if (subscribers && subscribers.length > 0) {
      subscribers.forEach((subscriber) => {
        subscriber.notify(snapshotStore.data!, params.callback, subscribers);
      });
    }
    
    // Return SnapshotData type as expected by the interface
    return {
      // Return appropriate SnapshotData properties
      getSnapshot: async () => snapshotStore.data.values().next().value,
      validate: () => true,
      // ... other required SnapshotData properties
    } as SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  }

  private restoreSnapshot(
    id: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    savedState: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: Category | undefined,
    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: string | SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>,
  ): void {
    // Implement logic to restore snapshot
  }

  private async updateSnapshot(
    snapshotId: string | number | null,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: Date,
    payload: UpdateSnapshotPayload<T>,
    category: Category | undefined,
    payloadData: T | K,
    mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    store: SnapshotStore<any, K>
  ): Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> {
    try {
      // Fetch or create the snapshot
      const snapshot = await this.fetchOrCreateSnapshot(
        data,
        snapshotStore,
        store,
        snapshotId
      );
  
      // Optionally, update fields in snapshot with the latest data
      snapshot.data = payloadData;
      snapshot.timestamp = timestamp.toISOString();
  
       // Use the type guard to check if category is of type CategoryProperties
      const categoryProperties = isCategoryProperties(category) ? category : undefined;

      // Call snapshotData to update snapshot with additional data
      const snapshotData = await snapshot.snapshotData(
        snapshotId ?? snapshot.id,                      // id: string | number | undefined
        snapshot,                                       // data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        mappedSnapshotData,                             // mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined
        newData,                                        // snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        snapshotStore,                                  // snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        category,                                       // category: Category | undefined
        categoryProperties?.properties,                 // categoryProperties: CategoryProperties | undefined
        snapshotStore.getDataStoreMethods?.() ?? {},    // dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        snapshotStore.getStoreProps?.() ?? {},          // storeProps: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        snapshotId                                      // snapshotId?: string | number | null
      );
  
      // Update the snapshot manager with the new snapshot
      snapshotManager.update(snapshotId?.toString() ?? snapshot.id, snapshot);
  
      // Optionally handle events and data items (business logic can be extended)
      this.handleEventsAndDataItems(
        snapshotId,
        snapshot,
        events,
        dataItems
      );
  
      // Store the updated snapshot in the data map
      data.set(snapshotId?.toString() || "", snapshot);
  
      return { snapshot };
    } catch (error) {
      console.error("Error updating snapshot:", error);
      return Promise.reject(error);  // Ensure errors are rejected properly
    }
  }


  private mergeSnapshotData(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return {
      ...snapshot,
      ...newData,
      lastUpdated: new Date(),
    };
  }

  private handleEventsAndDataItems(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshotId?: string | number | null
  ): void {
    const snapshotIdStr = snapshotId?.toString() || "default";

    if (events[snapshotIdStr]) {
      events[snapshotIdStr].forEach((manager) =>
        manager.updateCalendarEvent(snapshot)
      );
    }

    dataItems.forEach((item) => {
      if (item.relatedSnapshotId === snapshotId) {
        item.updateWithSnapshot(snapshot);
      }
    });
  }

  // Public method that uses the private restoreSnapshot
  public restoreSnapshotPublicly(
    id: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    savedState: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: Category | undefined,    callback: (snapshot: T) => void,
    snapshots: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: string | SnapshotEvents<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotContainer?: T,
    snapshotStoreConfig?: SnapshotStoreConfig<T, K, StructuredMetadata<T, K>, never>,
  ): void {
    this.restoreSnapshot(
      id,
      snapshot,
      snapshotId,
      snapshotData,
      savedState,
      category,
      callback,
      snapshots,
      type,
      event,
      subscribers,
      snapshotContainer,
      snapshotStoreConfig
    );
  }
}

const area = fetchUserAreaDimensions().toString();


type AppTask = Task<AppEntity, AppK, StructuredMetadata<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>>;

// Example usage in a Redux slice or elsewhere
const newTask: AppTask = {
  _id: "newTaskId2",
  id: "randomTaskId", // generate unique id
  title: "",
  description: "",
  assignedTo: [],
  dueDate: new Date(),
  status: "Pending",
  priority: PriorityTypeEnum.Medium,
  estimatedHours: 0,
  actualHours: 0,
  startDate: new Date(),
  completionDate: new Date(),
  endDate: new Date(),
  isActive: false,
  assigneeId: "",
  payload: {},
  previouslyAssignedTo: [],
  done: false,
  data: {} as TaskData,
  source: "user",
  tags: {},
  dependencies: [],
  storeProps: {} as SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  then: async function ( // ADDED async
    onFulfill: (newData: Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>) => void
    ): Promise<Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>> {// CHANGED return type to Promise
    const {
      storeId,
      name,
      version,
      schema,
      options,
      category,
      config,
      operation,
      expirationDate,
      localStorage: localStorageProp,
      snapshot: snapshotProp,
      payload,
      callback,
      endpointCategory,
    } = this.storeProps;
    
    const store = new LocalStorageSnapshotStore<
    AppEntity, 
    AppK, 
    AppMeta, 
    AppExcludedFields>({
      storeId: storeId,
      name: name,
      version: version,
      schema: schema,
      options: options,
      category: category,
      config: config,
      operation: operation,
      expirationDate: expirationDate,
      storeProps: this.storeProps,
      localStorage: window.localStorage,
      payload: payload,
      callback: callback,
      endpointCategory: endpointCategory,
      initialState: this.storeProps.initialState
    });

    // Now await is allowed
    const createdSnapshot = await createCompleteSnapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>(
      {} as AppEntity,
      new Map(),
      'snapshot-id',
      undefined,
      store,
      null,
      null,
      false,
      this.storeProps,
      {}
    );

    setTimeout(() => {
      onFulfill(createdSnapshot);
    }, 0);

    return createdSnapshot;
  }
};

export { snapshotFunction, snapshots };
export type {
  CompatibleSnapshotData, CoreSnapshot, Result,
  Snapshots,
  SnapshotsArray, SnapshotsObject,
  SnapshotStoreObject, SnapshotStoreUnion, SnapshotUnion
};

  
  
  


const subscriber = new Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
  "_id",
  "John Doe",
  subscription,
  subscriberId,
  notifyEventSystem,
  updateProjectState,
  logActivity,
  triggerIncentives,
  undefined,
  {},
  subscriptionLevel,
);

subscriber.id = subscriberId;

// Example snapshot object with correct type alignment
const snapshots: CoreSnapshot<BaseData<AddReport>, AddReportType>[] = [
  {
    id: "1",
    data: new Map<string, Data<T>>([
      [
        "key",
        {
          /* your data */
        },
      ],
    ]),
    name: "Snapshot 1",
    timestamp: new Date(),
    createdBy: "User123",
    subscriberId: "Sub123",
    length: 100,
    category: "update",
    status: StatusType.Active,
    description: "Detailed description",
    content: "Snapshot content" || {},
    message: (
      type: NotificationType,
      content: string,
      additionalData?: string,
      userId?: number,
      sender?: Sender,
      channel?: ChatRoom
    ) => {
      // Implement the message function here
      return {} as Message; // Replace with actual implementation
    },
    type: "type1",
    phases: ProjectPhaseTypeEnum.Development,
    phase: {
      id: "1",
      name: "Phase 1",
      startDate: new Date(),
      endDate: new Date(),
      label: {
        text: "Phase 1",
        color: "#000000",
      },
      description: "",
      subPhases: [],
      currentMeta: {
        metadataEntries: {},
        version: undefined,
        lastUpdated: undefined,
        isActive: false,
        config: undefined,
        permissions: [],
        customFields: {},
        versionData: null,
        latestVersion: createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(),
        id: "",
        apiEndpoint: "",
        apiKey: undefined,
        timeout: 0,
        retryAttempts: 0,
        name: "",
        category: "",
        timestamp: undefined,
        createdBy: "",
        tags: [],
        metadata: undefined,
        initialState: undefined,
        meta: {} as StructuredMetadata<PhaseData<any, any>, PhaseData<any, any>>,
        mappedMeta: {} as Map<
          string,
          Snapshot<
            BaseData<
              AddReport,
              AddReport,
              StructuredMetadata<AddReport, AddReport>
            >,
            K,
            StructuredMetadata<T, K>,
            never
          >
        >,
        events: {} as EventManager<BaseData<any, any>>,
      },
      currentMetadata: {
        area: area,
        currentMeta: undefined,
        metadataEntries: {
          area: "",
          currentMeta: {},
          metadataEntries: {},
        },
      },

      date: new Date(),
      createdBy: "",
    },
    date: new Date(),
    // progress: 0,
    // Additional metadata
    _id: "abc123",
    title: "Snapshot Title",
    subPhases: [
      {
        id: "1",
        name: "Subphase 1",
        label: {},
        date: new Date(),
        createdBy: "",
        startDate: new Date(),
        endDate: new Date(),
        status: "In Progress",
        type: "type1",
        description: "",
        duration: 0,
        subPhases: [],
        component: {} as FC<{}>,
      },
    ],
    tags: {
      "1": {
        id: "1",
        name: "Tag 1",
        color: "red",
        description: "Tag 1 description",
        relatedTags: [],
        isActive: true,
      },
    },

    ownerId: "Owner123",
    store: null,
    state: null,
    initialState: null,

    setSnapshotData(
      snapshotStore: SnapshotStore<BaseDataEntity, BaseData>,
      data: Map<string, Snapshot<Data<T>, any>>,
      subscribers: Subscriber<any, any>[],
      snapshotData: Partial<SnapshotStoreConfig<BaseDataEntity, BaseData>>,
      id?: string
    ): Map<string, Snapshot<BaseDataEntity, BaseData>> {
      // If the config array already exists, update it with the new snapshotData
      if (this.configs) {
        this.configs.forEach((config) => {
          Object.assign(config, snapshotData);
        });
      } else {
        // If no config array exists, create a new one with the provided snapshotData
        this.configs = [
          {
            ...snapshotData,
            id: snapshotData.id,
            subscribers: subscribers as Subscriber<BaseDataEntity, BaseData>[], // Ensure correct type
          } as SnapshotStoreConfig<BaseDataEntity, BaseData>,
        ];
      }

      // Return the updated data
      return data;
    },

    // Additional metadata
    _id: "abc123",
    title: "Snapshot Title",

    tags: {
      tag1: {
        id: "1",
        name: "Tag 1",
        color: "red",
        description: "Tag 1 description",
        relatedTags: [],
        isActive: true,
      },
    },
    topic: "Topic",
    priority: PriorityTypeEnum.High,
    key: "unique-key",
    subscription: {
      unsubscribe: unsubscribe,
      portfolioUpdates: portfolioUpdates,
      tradeExecutions: getTradeExecutions,
      marketUpdates: getMarketUpdates,
      triggerIncentives: triggerIncentives,
      communityEngagement: getCommunityEngagement,
      subscribers: subscribers,
      getSubscriptionLevel: getSubscriptionLevel,
      portfolioUpdatesLastUpdated: {
        value: new Date(),
        isModified: false,
      } as ModifiedDate,
      determineCategory: (snapshotCategory: any) => {
        return snapshotCategory;
      },
      // id: "sub123",
      name: "Subscriber 1",
      subscriberId: "sub123",
      subscriberType: SubscriberTypeEnum.FREE,
      // subscriberName: "User 1",
      // subscriberEmail: "user1@example.com",
      // subscriberPhone: "123-456-7890",
      // subscriberStatus: "active",
      // subscriberRole: "admin",
      // subscriberCreatedAt: new Date(),
      // subscriberUpdatedAt: new Date(),
      // subscriberLastSeenAt: new Date(),
      // subscriberLastActivityAt: new Date(),
      // subscriberLastLoginAt: new Date(),
      // subscriberLastLogoutAt: new Date(),
      // subscriberLastPasswordChangeAt: new Date(),
      // subscriberLastPasswordResetAt: new Date(),
      // subscriberLastPasswordResetToken: "random-token",
      // subscriberLastPasswordResetTokenExpiresAt: new Date(),
      // subscriberLastPasswordResetTokenCreatedAt: new Date(),
      // subscriberLastPasswordResetTokenCreatedBy: "user123",
    },
    config: Promise.resolve(null),
    metadata: {
      /* additional metadata */
    },
    isCompressed: true,
    isEncrypted: false,
    isSigned: true,
    expirationDate: new Date(),
    auditTrail: [
      {
        userId: "user123",
        timestamp: new Date(),
        action: "update",
        details: "Snapshot updated",
      },
    ],
    subscribers: [subscriber],
    value: 50,
    todoSnapshotId: "todo123",
    // then: (callback: (newData: Snapshot<BaseDataEntity, BaseData>) => void) => {
    //   /* implementation */
    // },
  },
];




export { SnapshotEquality };
