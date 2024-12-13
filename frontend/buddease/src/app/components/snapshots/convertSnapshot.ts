// convertSnapshot.ts
import * as snapshotApi from "@/app/api/SnapshotApi";
import { SnapshotDataType } from '@/app/components/snapshots';
import { PriorityTypeEnum } from "../components/models/data/StatusType";
import { SnapshotData } from '@/app/components/snapshots/SnapshotData';
import { SubscriberCollection } from '@/app/components/users/SubscriberCollection';
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData } from "../models/data/Data";
import { T } from '../models/data/dataStoreMethods';
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Subscription } from "../subscriptions/Subscription";
import { convertSnapshotData, convertSnapshotMap } from "../typings/YourSpecificSnapshotType";
import { Subscriber } from '../users/Subscriber';
import { createSnapshotStoreOptions } from "./createSnapshotStoreOptions";
import { SnapshotConfig, SnapshotStoreConfig, SnapshotStoreMethod, SnapshotStoreProps } from "./index";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import SnapshotStore from "./SnapshotStore";


function convertBaseDataToK<
  T extends  BaseData<any>, 
  K extends T = T,
>(snapshot: Snapshot<T, K>): Snapshot<T, K> {
  // Convert the properties field to match type K
  const convertedProperties = snapshot.properties as unknown as K;

  // Convert the subscribers field to SubscriberCollection<T, K>[]
  const convertedSubscribers: SubscriberCollection<T, K>[] = snapshot.subscribers.map(subscriber => {
    if (Array.isArray(subscriber)) {
      // If subscriber is an array, map each element
      return subscriber.map(sub => sub as unknown as Subscriber<T, K>);
    } else {
      // If subscriber is a Record<string, Subscriber[]>
      const convertedRecord: Record<string, Subscriber<T, K>[]> = {};
      for (const key in subscriber) {
        convertedRecord[key] = subscriber[key].map((
          sub: Subscriber<T, K>
        ) => sub as unknown as Subscriber<T, K>);
      }
      return convertedRecord;
    }
  });

  // Convert the snapshotData field
  const convertedSnapshotData = snapshot.snapshotData as unknown as SnapshotData<T, K> & {
    snapshotData: (
      id: string | number | undefined,
      snapshotId: string | number | null,
      data: Snapshot<T, K>,
      mappedSnapshotData: Map<string, Snapshot<T, K>> | null | undefined,
      snapshotData: SnapshotData<T, K>,
      snapshotStore: SnapshotStore<T, K>,
      category: Category | undefined,
      categoryProperties: CategoryProperties | undefined,
      dataStoreMethods: DataStoreMethods<T, K>,
      storeProps: SnapshotStoreProps<T, K>
    ) => Promise<SnapshotDataType<T, K>>;
  };

  // Construct the new Snapshot<T, K>
  const convertedSnapshot: Snapshot<T, K> = {
    ...snapshot,
    properties: convertedProperties,
    subscribers: convertedSubscribers,
    snapshotData: convertedSnapshotData,
  };

  return convertedSnapshot;
}



function convertSnapshot<
    T extends BaseData<any>, 
    K extends T = T, 
    Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
    ExcludedFields extends keyof T = never
>(
  snapshot: Snapshot<T, K>,
  context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K>[];
  },
  storeProps: SnapshotStoreProps<T, K>
): Promise<Snapshot<T, K>> {
  return new Promise((resolve, reject) => {
    try {
      if (!snapshot.store) {
        throw new Error("Snapshot store is undefined");
      }

       // Convert dataStoreMethods
      const dataStoreMethods = snapshot.store.getDataStoreMethods() as DataStoreWithSnapshotMethods<T, K>;

      // Convert snapshot methods
      const convertedSnapshotMethods = dataStoreMethods.snapshotMethods?.map(
        (method: SnapshotStoreMethod<T, K>) => ({
          ...method,
          snapshot: (
            id: string | number | undefined,
            snapshotId: string | null,
            snapshotData: SnapshotData<T, K>,
            category: symbol | string | Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            callback: (snapshotStore: SnapshotStore<T, K>) => void,
            dataStore: DataStore<T, K>,
            dataStoreMethods: DataStoreMethods<T, K>,
            metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>,
            subscriberId: string,
            endpointCategory: string | number,
            storeProps: SnapshotStoreProps<T, K>,
            snapshotConfigData: SnapshotConfig<T, K>,
            subscription: Subscription<T, K>,
            snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
            snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
          ) =>
            method.snapshot(
              id,
              snapshotId,
              convertSnapshotData<T, K>(snapshotData),
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
        (config: SnapshotConfig<T, K>) => ({
          ...config,
          dataStoreMethods: {
            ...config.dataStoreMethods,
            snapshotMethods: config.dataStoreMethods?.snapshotMethods?.map(
              (method: SnapshotStoreMethod<T, K>) => ({
                ...method,
                snapshot: (
                  id: string | number | undefined,
                  snapshotId: string | null,
                  snapshotData: SnapshotData<T, K>,
                  category: symbol | string | Category | undefined,
                  categoryProperties: CategoryProperties | undefined,
                  callback: (snapshotStore: SnapshotStore<T, K>) => void,
                  dataStore: DataStore<T, K>,
                  dataStoreMethods: DataStoreMethods<T, K>,
                  metadata: UnifiedMetaDataOptions<T, K, Meta, ExcludedFields>,
                  subscriberId: string,
                  endpointCategory: string | number,
                  storeProps: SnapshotStoreProps<T, K>,
                  snapshotConfigData: SnapshotConfig<T, K>,
                  subscription: Subscription<T, K>,
                  snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
                  snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
                ) =>
                  method.snapshot(
                    id,
                    snapshotId,
                    convertSnapshotData<T, K>(snapshotData),
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
            ) as SnapshotStoreMethod<T, K>[],
          },
        })
      );

      // Convert dataStoreMethods to ensure compatibility with DataStoreWithSnapshotMethods<T, K>
      const convertedDataStoreMethods: DataStoreWithSnapshotMethods<T, K> = {
        ...dataStoreMethods,
        snapshotMethods: convertedSnapshotMethods,
        getDelegate: dataStoreMethods.getDelegate as (context: {
          useSimulatedDataSource: boolean;
          simulatedDataSource: SnapshotStoreConfig<T, K>[]
        }) => Promise<SnapshotStoreConfig<T, K>[]>,
      };

      const options = createSnapshotStoreOptions<T, K>({
        initialState: snapshot.store.initialState ?? null,
        snapshotId: snapshot.store.snapshotId,
        category: snapshot.store.category ?? ({} as Category),
        categoryProperties: snapshot.store.categoryProperties ?? ({} as CategoryProperties),
        dataStoreMethods: convertedDataStoreMethods,
      });

      
      const defaultMetadata: UnifiedMetaDataOptions<T, K> = {
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
          ? convertSnapshotMap<T, K>(snapshot.store.data) 
            : new Map<string, Snapshot<T, K>>(),
          snapshot.store.events ? snapshot.store.events : {} as Record<string, CalendarManagerStoreClass<T, K>[]>,
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
          const operation: SnapshotOperation<T, K> = {
            operationType: SnapshotOperationType.FindSnapshot,
          };

          const newStore = new SnapshotStore<T, K>({
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

function deepConvert<T, K>(source: T): K {
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

