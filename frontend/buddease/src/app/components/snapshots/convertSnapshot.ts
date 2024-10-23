import { SnapshotData, SubscriberCollection } from '@/app/components/snapshots';
// convertSnapshot.ts
import * as snapshotApi from "@/app/api/SnapshotApi";
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { Data } from "../models/data/Data";
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


function convertBaseDataToK<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(snapshot: Snapshot<T, Meta, Data>): Snapshot<T, Meta, K> {
  // Convert the properties field to match type K
  const convertedProperties = snapshot.properties as unknown as K;

  // Convert the subscribers field to SubscriberCollection<T, Meta, K>[]
  const convertedSubscribers: SubscriberCollection<T, Meta, K>[] = snapshot.subscribers.map(subscriber => {
    if (Array.isArray(subscriber)) {
      // If subscriber is an array, map each element
      return subscriber.map(sub => sub as unknown as Subscriber<T, Meta, K>);
    } else {
      // If subscriber is a Record<string, Subscriber[]>
      const convertedRecord: Record<string, Subscriber<T, Meta, K>[]> = {};
      for (const key in subscriber) {
        convertedRecord[key] = subscriber[key].map(sub => sub as unknown as Subscriber<T, Meta, K>);
      }
      return convertedRecord;
    }
  });

  // Convert the snapshotData field
  const convertedSnapshotData = snapshot.snapshotData as unknown as SnapshotData<T, Meta, K>;

  // Construct the new Snapshot<T, Meta, K>
  const convertedSnapshot: Snapshot<T, Meta, K> = {
    ...snapshot,
    properties: convertedProperties,
    subscribers: convertedSubscribers,
    snapshotData: convertedSnapshotData,
  };

  return convertedSnapshot;
}



function convertSnapshot<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(
  snapshot: Snapshot<T, Meta, K>,
  context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[];
  },
  storeProps: SnapshotStoreProps<T, Meta, K>
): Promise<Snapshot<T, Meta, K>> {
  return new Promise((resolve, reject) => {
    try {
      if (!snapshot.store) {
        throw new Error("Snapshot store is undefined");
      }

       // Convert dataStoreMethods
      const dataStoreMethods = snapshot.store.getDataStoreMethods() as DataStoreWithSnapshotMethods<T, Meta, K>;

      // Convert snapshot methods
      const convertedSnapshotMethods = dataStoreMethods.snapshotMethods?.map(
        (method: SnapshotStoreMethod<T, Meta, K>) => ({
          ...method,
          snapshot: (
            id: string | number | undefined,
            snapshotId: string | null,
            snapshotData: SnapshotData<T, Meta, K>,
            category: symbol | string | Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
            dataStore: DataStore<T, Meta, K>,
            dataStoreMethods: DataStoreMethods<T, Meta, K>,
            metadata: UnifiedMetaDataOptions,
            subscriberId: string,
            endpointCategory: string | number,
            storeProps: SnapshotStoreProps<T, Meta, K>,
            snapshotConfigData: SnapshotConfig<T, Meta, K>,
            subscription: Subscription<T, Meta, K>,
            snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
            snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null
          ) =>
            method.snapshot(
              id,
              snapshotId,
              convertSnapshotData<T, Meta, K>(snapshotData),
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
        (config: SnapshotConfig<T, Meta, K>) => ({
          ...config,
          dataStoreMethods: {
            ...config.dataStoreMethods,
            snapshotMethods: config.dataStoreMethods?.snapshotMethods?.map(
              (method: SnapshotStoreMethod<T, Meta, K>) => ({
                ...method,
                snapshot: (
                  id: string | number | undefined,
                  snapshotId: string | null,
                  snapshotData: SnapshotData<T, Meta, K>,
                  category: symbol | string | Category | undefined,
                  categoryProperties: CategoryProperties | undefined,
                  callback: (snapshotStore: SnapshotStore<T, Meta, K>) => void,
                  dataStore: DataStore<T, Meta, K>,
                  dataStoreMethods: DataStoreMethods<T, Meta, K>,
                  metadata: UnifiedMetaDataOptions,
                  subscriberId: string,
                  endpointCategory: string | number,
                  storeProps: SnapshotStoreProps<T, Meta, K>,
                  snapshotConfigData: SnapshotConfig<T, Meta, K>,
                  subscription: Subscription<T, Meta, K>,
                  snapshotStoreConfigData?: SnapshotStoreConfig<T, Meta, K>,
                  snapshotContainer?: SnapshotStore<T, Meta, K> | Snapshot<T, Meta, K> | null
                ) =>
                  method.snapshot(
                    id,
                    snapshotId,
                    convertSnapshotData<T, Meta, K>(snapshotData),
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
            ) as SnapshotStoreMethod<T, Meta, K>[],
          },
        })
      );

      // Convert dataStoreMethods to ensure compatibility with DataStoreWithSnapshotMethods<T, Meta, K>
      const convertedDataStoreMethods: DataStoreWithSnapshotMethods<T, Meta, K> = {
        ...dataStoreMethods,
        snapshotMethods: convertedSnapshotMethods,
        getDelegate: dataStoreMethods.getDelegate as (context: {
          useSimulatedDataSource: boolean;
          simulatedDataSource: SnapshotStoreConfig<T, Meta, K>[]
        }) => Promise<SnapshotStoreConfig<T, Meta, K>[]>,
      };

      const options = createSnapshotStoreOptions<T, Meta, K>({
        initialState: snapshot.store.initialState ?? null,
        snapshotId: snapshot.store.snapshotId,
        category: snapshot.store.category ?? ({} as Category),
        categoryProperties: snapshot.store.categoryProperties ?? ({} as CategoryProperties),
        dataStoreMethods: convertedDataStoreMethods,
      });

      function safeParseId(id: string | undefined): number | undefined {
        if (!id) return undefined;
        const parsedId = Number(id);
        return isNaN(parsedId) ? undefined : parsedId;
      }

      const defaultMetadata: UnifiedMetaDataOptions = {
        startDate: snapshot.store.startDate || undefined,
        endDate: snapshot.store.endDate || undefined,
        budget: snapshot.store.budget || undefined,
        status: snapshot.store.status || "",
        teamMembers: snapshot.store.teamMembers || undefined,
        tasks: snapshot.store.tasks || undefined,
        milestones: snapshot.store.milestones || undefined,
        videos: snapshot.store.videos || undefined,      
       
        id: snapshot.store.id !== undefined ? String(snapshot.store.id) : undefined,
        title: snapshot.store.title || undefined,
        description: snapshot.store.description || undefined,
        createdBy: snapshot.store.createdBy || undefined,
        createdAt: snapshot.store.createdAt || undefined,
        updatedBy: snapshot.store.updatedBy || undefined,
        updatedAt: snapshot.store.updatedAt || undefined,
        maxAge: snapshot.store.maxAge || undefined,
        timestamp: snapshot.store.timestamp || undefined,
        structuredMetadata: snapshot.store.structuredMetadata,
      };

      const metadataObject = {
        ...defaultMetadata,
        ...snapshot.store.metadata,
      };
      
        const snapshotConfig = snapshotApi.getSnapshotConfig(
          snapshot.store.id ? Number(snapshot.store.id) : 0,
          snapshot.store.snapshotId ? String(snapshot.store.snapshotId) || null : null,
          snapshot.store.criteria,
          snapshot.store.category,
          snapshot.store.categoryProperties ? snapshot.store.categoryProperties : ({} as CategoryProperties),
          snapshot.store.subscriberId ? String(snapshot.store.subscriberId) : undefined,
          snapshot.store.getDelegate(context),
          snapshot.store.snapshot,
          snapshot.store.data instanceof Map 
          ? convertSnapshotMap<T, Meta, K>(snapshot.store.data) 
            : new Map<string, Snapshot<T, Meta, K>>(),
          snapshot.store.events ? snapshot.store.events : {},
          snapshot.store.dataItems,
          snapshot.store.newData,
          snapshot.store.getPayload(),
          snapshot.store.store,
          snapshot.store.getCallback(),
          snapshot.store.getStoreProps(),
          snapshot.store.getEndpointCategory()
        )
      
        const snapshotId = snapshot.store.snapshotId;
        const category = snapshot.store.category;
        try {
          const { storeId, name, version, schema, options, category, config, expirationDate,
            payload, callback, endpointCategory
          } = storeProps;
          const operation: SnapshotOperation = {
            operationType: SnapshotOperationType.FindSnapshot,
          };

          const newStore = new SnapshotStore<T, Meta, K>({
            storeId,
            name,
            version,
            schema,
            options,
            category,
            config,
            operation,
            expirationDate,
            payload, callback, storeProps, endpointCategory
          });

          resolve({
              ...snapshot,
              store: newStore,
              initialState: snapshot.initialState,
            });
          } catch (error) {
            reject(error);
          }
        }
        catch (error) {
         reject(error);
       }
      })
  }


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

function deepConvert<T, Meta, K>(source: T): K {
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

