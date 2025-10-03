// convertSnapshot.ts
import * as snapshotApi from "@/app/api/SnapshotApi";
import { Snapshot, SnapshotDataType } from '@/app/snapshots';
import { SnapshotData } from '@/app/snapshots/SnapshotData';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";
import { SubscriberCollection } from '@/app/users/SubscriberCollection';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta, ExcludedFields } from '@/config/BaseConfig';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { CategoryProperties } from "@/app/app/pages/personas/ScenarioBuilder";
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { T } from '@/app/models/data/dataStoreMethods';
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore, useDataStore } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Subscription } from "@/app/subscriptions/Subscription";
import { convertSnapshotData, convertSnapshotMap } from "@/app/typings/YourSpecificSnapshotType";
import { Subscriber } from '../users/Subscriber';
import { createSnapshotStoreOptions } from "./createSnapshotStoreOptions";
import { SnapshotConfig, SnapshotStoreConfig, SnapshotStoreMethod, SnapshotStoreProps } from "./index";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import { SnapshotContainerType } from './SnapshotContainer';
import SnapshotStore from "./SnapshotStore";

function convertBaseDataToK<
  T extends BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Convert the properties field to match type K
  const convertedProperties = snapshot.properties as unknown as K;

  // Convert the subscribers field to SubscriberCollection<T, K, Meta, ExcludedFields>[]
  const convertedSubscribers: SubscriberCollection<T, K, Meta, ExcludedFields>[] = snapshot.subscribers.map(subscriber => {
    if (Array.isArray(subscriber)) {
      // If subscriber is an array, map each element
      return subscriber.map(sub => sub as unknown as Subscriber<T, K, Meta, ExcludedFields>);
    } else {
      // If subscriber is a Record<string, Subscriber[]>
      const convertedRecord: Record<string, Subscriber<T, K, Meta, ExcludedFields>[]> = {};
      for (const key in subscriber) {
        convertedRecord[key] = subscriber[key].map((
          sub: Subscriber<T, K, Meta, ExcludedFields>
        ) => sub as unknown as Subscriber<T, K, Meta, ExcludedFields>);
      }
      return convertedRecord;
    }
  });

  // Convert the snapshotData field
  const convertedSnapshotData = snapshot.snapshotData as unknown as SnapshotData<T, K, Meta, ExcludedFields> & {
    snapshotData: (
      id: string | number | undefined,
      snapshotId: string | number | null,
      data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | null | undefined,
      snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
      snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStoreMethods<T, K, Meta, ExcludedFields>,
      storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>
    ) => Promise<SnapshotDataType<T, K, Meta, ExcludedFields>>;
  };

  // Construct the new Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  const convertedSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    ...snapshot,
    properties: convertedProperties,
    subscribers: convertedSubscribers,
    snapshotData: convertedSnapshotData,
  };

  return convertedSnapshot;
}

function convertSnapshot<
  T extends BaseDataEntity, 
  K extends T = T, 
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  },
  storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>
): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  return new Promise((resolve, reject) => {
    try {
      if (!snapshot.store) {
        throw new Error("Snapshot store is undefined");
      }

       // Convert dataStoreMethods
      const dataStoreMethods = snapshot.store.getDataStoreMethods() as DataStoreWithSnapshotMethods<T, K, Meta, ExcludedFields>;

      // Convert snapshot methods
      const convertedSnapshotMethods = dataStoreMethods.snapshotMethods?.map(
        (method: SnapshotStoreMethod<T, K, Meta, ExcludedFields>) => ({
          ...method,
          snapshot: (
            id: string | number | undefined,
            snapshotId: string | null,
            snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
            category: Category | undefined,            categoryProperties: CategoryProperties | undefined,
            callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void,
            dataStore: DataStore<T, K, Meta, ExcludedFields>,
            dataStoreMethods: DataStoreMethods<T, K, Meta, ExcludedFields>,
            metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
            subscriberId: string,
            endpointCategory: string | number,
            storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
            snapshotConfigData: SnapshotConfig<T, K, Meta, ExcludedFields>,
            subscription: Subscription<T, K, Meta, ExcludedFields>,
            snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            snapshotContainer?: SnapshotContainerType<T, K, Meta, ExcludedFields>
          ) =>
            method.snapshot(
              id,
              snapshotId,
              convertSnapshotData<T, K, Meta, ExcludedFields>(snapshotData),
              category,
              categoryProperties,
              callback,
              dataStore,
              dataStoreMethods,
              metadata,
              subscriberId,
              endpointCategory,
              storeProps,
              snapshotConfigData,
              subscription,
              snapshotStoreConfigData,
              snapshotContainer
            ),
        })
      ) || [];

      // Convert snapshotConfig
      const convertedSnapshotConfig = snapshot.store.snapshotConfig.map(
        (config: SnapshotConfig<T, K, Meta, ExcludedFields>) => ({
          ...config,
          dataStoreMethods: {
            ...config.dataStoreMethods,
            snapshotMethods: config.dataStoreMethods?.snapshotMethods?.map(
              (method: SnapshotStoreMethod<T, K, Meta, ExcludedFields>) => ({
                ...method,
                snapshot: (
                  id: string | number | undefined,
                  snapshotId: string | null,
                  snapshotData: SnapshotData<T, K, Meta, ExcludedFields>,
                  category: Category | undefined,                  categoryProperties: CategoryProperties | undefined,
                  callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void,
                  dataStore: DataStore<T, K, Meta, ExcludedFields>,
                  dataStoreMethods: DataStoreMethods<T, K, Meta, ExcludedFields>,
                  metadata: UnifiedMetadata<T, K, Meta, ExcludedFields>,
                  subscriberId: string,
                  endpointCategory: string | number,
                  storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
                  snapshotConfigData: SnapshotConfig<T, K, Meta, ExcludedFields>,
                  subscription: Subscription<T, K, Meta, ExcludedFields>,
                  snapshotStoreConfigData?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
                  snapshotContainer?: SnapshotContainerType<T, K, Meta, ExcludedFields>
                ) =>
                  method.snapshot(
                    id,
                    snapshotId,
                    convertSnapshotData<T, K, Meta, ExcludedFields>(snapshotData),
                    category,
                    categoryProperties,
                    callback,
                    dataStore,
                    dataStoreMethods,
                    metadata,
                    subscriberId,
                    endpointCategory,
                    storeProps,
                    snapshotConfigData,
                    subscription,
                    snapshotStoreConfigData,
                    snapshotContainer
                  ),
              })
            ) as SnapshotStoreMethod<T, K, Meta, ExcludedFields>[],
          },
        })
      );

      // Convert dataStoreMethods to ensure compatibility with DataStoreWithSnapshotMethods<T, K, Meta, ExcludedFields>
      const convertedDataStoreMethods: DataStoreWithSnapshotMethods<T, K, Meta, ExcludedFields> = {
        ...dataStoreMethods,
        snapshotMethods: convertedSnapshotMethods,
        getDelegate: dataStoreMethods.getDelegate as (context: {
          useSimulatedDataSource: boolean;
          simulatedDataSource: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
        }) => Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
      };

      const options = createSnapshotStoreOptions<T, K, Meta, ExcludedFields>({
        initialState: snapshot.store.initialState ?? null,
        snapshotId: snapshot.store.snapshotId,
        category: snapshot.store.category ?? ({} as Category),
        categoryProperties: snapshot.store.categoryProperties ?? ({} as CategoryProperties),
        dataStoreMethods: convertedDataStoreMethods,
      });

      const defaultMetadata: UnifiedMetadata<T, K, Meta, ExcludedFields> = {
        // Assigning project-related properties to `projectMetadata`
        projectMetadata: {
          startDate: snapshot.store.startDate || undefined,
          endDate: snapshot.store.endDate || undefined,
          budget: snapshot.store.budget || undefined,
          status: snapshot.store.status || "",
          teamMembers: snapshot.store.teamMembers || undefined,
          tasks: snapshot.store.tasks || undefined,
          milestones: snapshot.store.milestones || undefined,
          projectId: snapshot.store.id !== undefined ? String(snapshot.store.id) : undefined,
          title: snapshot.store.title || undefined,
          description: snapshot.store.description || undefined,
          createdBy: snapshot.store.createdBy || undefined,
          createdAt: snapshot.store.createdAt || undefined,
          updatedBy: snapshot.store.updatedBy || undefined,
          updatedAt: snapshot.store.updatedAt || undefined,
        },
      
        // Assigning video-related properties to `videoMetadata`
        videoMetadata: {
          videos: snapshot.store.videos || undefined,  // Adjust this if `videos` has a more complex structure
        },
      
        // Assigning generic media-related properties if needed
        mediaMetadata: {
          maxAge: snapshot.store.maxAge || undefined,
          timestamp: snapshot.store.timestamp || undefined,
        },
      

        // Directly assign structured metadata if it doesn't belong to a sub-group
        structuredMetadata: snapshot.store.structuredMetadata,
      };
      

      const metadataObject = {
        ...defaultMetadata,
        ...snapshot.store.metadata,
      };
      
      const snapshotConfig = snapshotApi.getSnapshotConfig(
          snapshot.store.id ? Number(snapshot.store.id) : 0,
          // snapshot.store.baseData,
          // snapshot.store.baseMeta,
          snapshot.store.snapshotId ? String(snapshot.store.snapshotId) || null : null,
          snapshot.store.criteria,
          snapshot.store.category,
          snapshot.store.categoryProperties ? snapshot.store.categoryProperties : ({} as CategoryProperties),
          snapshot.store.subscriberId ? String(snapshot.store.subscriberId) : undefined,
          snapshot.store.getDelegate(context),
          snapshot.store.getSnapshotData(),
          snapshot.store.snapshot,
          snapshot.store.data instanceof Map 
          ? convertSnapshotMap<T, K, Meta, ExcludedFields>(snapshot.store.data) 
            : new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(),
          snapshot.store.events ? snapshot.store.events : {} as Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]>,
          snapshot.store.dataItems,
          snapshot.store.newData,
          snapshot.store.getPayload(),
          snapshot.store.store,
          snapshot.store.getCallback(),
          snapshot.store.getStoreProps(),
          snapshot.store.getEndpointCategory(),
          snapshot.store.getSnapshotContainer()
        )
      
        const snapshotId = snapshot.store.snapshotId;
        const category = snapshot.store.category;
        try {
          const { storeId, name, version, schema, options, config, expirationDate,
            payload, callback, endpointCategory, initialState
          } = storeProps;
          const operation: SnapshotOperation<T, K, Meta, ExcludedFields> = {
            operationType: SnapshotOperationType.FindSnapshot,
          };

          const snapshotStoreConfig = useDataStore().snapshotStoreConfig

          const newStore = new SnapshotStore<T, K, Meta, ExcludedFields>({
            storeId,
            name,
            version,
            schema,
            options,
            category,
            config,
            operation,
            expirationDate,
            payload, callback, storeProps, endpointCategory, initialState
          });

          resolve({
              ...snapshot,
              store: newStore,
              initialState: snapshot.initialState,
              snapshotStores: snapshotStoreConfig
            });
          } catch (error) {
            reject(error);
          }
        }
        catch (error) {
         reject(error);
       }

      })  }


function convertStoreId(storeId: string | number): number {
  if (typeof storeId === "number") {
    return storeId;
  } else {
    // Simple hash function for converting string to a number
    let hash = 0;
    for (let i = 0; i < storeId.length; i++) {
      const char = storeId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32-bit integer
    }
    return hash;
  }
}

function deepConvert<T, K, Meta, ExcludedFields>(source: T): K {
  // Recursively map properties from T to K
  if (Array.isArray(source)) {
    return source.map(item => deepConvert(item)) as unknown as K;
  } else if (typeof source === 'object' && source !== null) {
    const result: any = {};
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        result[key] = deepConvert((source as any)[key]);
      }
    }
    return result as K;
  }
  return source as unknown as K;
}


// Implementation of convertKeyToT within DataStore
const convertKeyToT = (key: string): T => {
  const parts = key.split('-'); // Example: '1-John'
  return {
    id: parseInt(parts[0], 10),
    title: parts[1],
  } as unknown as T; // Adjust to match actual structure of T
};

export default convertSnapshot;
export { convertBaseDataToK, convertKeyToT, convertStoreId, deepConvert };

