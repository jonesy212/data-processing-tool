// convertSnapshot.ts
import * as snapshotApi from "@/app/api/SnapshotApi";
import { SnapshotDataType } from '@/app/components/snapshots/SnapshotContainer';
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData } from "../models/data/Data";
import { DataStoreMethods, DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { convertSnapshotData, convertSnapshotStoreToSnapshot } from "../typings/YourSpecificSnapshotType";
import { createSnapshotStoreOptions } from "./createSnapshotStoreOptions";
import { SnapshotConfig, SnapshotStoreConfig, SnapshotStoreMethod, SnapshotStoreProps } from "./index";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import SnapshotStore from "./SnapshotStore";
import { Subscription } from "../subscriptions/Subscription";


function convertBaseDataToK<T extends BaseData, K extends BaseData>(snapshot: Snapshot<T, BaseData>): Snapshot<T, K> {
  // Assuming conversion of properties is safe (you may need more logic depending on the actual structure)
  return {
    ...snapshot,
    properties: snapshot.properties as unknown as K
  } as Snapshot<T, K>;
}


function convertSnapshot<T extends BaseData, K extends BaseData>(
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


      // Your conversion logic...



      // Remove the condition that always fails
      // if (/* some condition that fails */) {
      //   return reject(new Error("Conversion failed"));
      // }

      // Convert dataStoreMethods
      const dataStoreMethods = snapshot.store.getDataStoreMethods() as DataStoreWithSnapshotMethods<T, K>;

      // Convert snapshot methods
      const convertedSnapshotMethods = dataStoreMethods.snapshotMethods?.map(
        (method: SnapshotStoreMethod<T, K>) => ({
          ...method,
          snapshot: (
            id: string | number | undefined,
            snapshotId: string | null,
            snapshotData: SnapshotDataType<T, K>,
            category: symbol | string | Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            callback: (snapshotStore: SnapshotStore<T, K>) => void,
            dataStore: DataStore<T, K>,
            dataStoreMethods: DataStoreMethods<T, K>,
            metadata: UnifiedMetaDataOptions,
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
                  snapshotData: SnapshotDataType<T, K>,
                  category: symbol | string | Category | undefined,
                  categoryProperties: CategoryProperties | undefined,
                  callback: (snapshotStore: SnapshotStore<T, K>) => void,
                  dataStore: DataStore<T, K>,
                  dataStoreMethods: DataStoreMethods<T, K>,
                  metadata: UnifiedMetaDataOptions,
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

      function safeParseId(id: string | undefined): number | undefined {
        if (!id) return undefined;
        const parsedId = Number(id);
        return isNaN(parsedId) ? undefined : parsedId;
      }


      const defaultMetadata: UnifiedMetaDataOptions = {









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
      
      if (snapshot.store.dataStore instanceof Map) {
        const dataStore: Map<string, Snapshot<T, K>> = new Map();
    
        for (const [key, value] of snapshot.store.dataStore) {
          if (value instanceof SnapshotStore) {

            const snapshotConverted = convertSnapshotStoreToSnapshot(value);
            const convertedSnapshot = await convertSnapshot<T, K>(
              snapshotConverted,


              context,
              storeProps
            );
            dataStore.set(key, convertedSnapshot);
          } else {
            const convertedSnapshot = await convertSnapshot<T, K>(
              value as Snapshot<T, BaseData>,


              context,
              storeProps
            );
            dataStore.set(key, convertedSnapshot);
          }
        }


        
        const snapshotConfig = snapshotApi.getSnapshotConfig(
          snapshot.store.id ? Number(snapshot.store.id) : 0,
          snapshot.store.snapshotId ? String(snapshot.store.snapshotId) || null : null,
          snapshot.store.criteria,
          snapshot.store.category,
          snapshot.store.categoryProperties ? snapshot.store.categoryProperties : ({} as CategoryProperties),
          snapshot.store.subscriberId ? String(snapshot.store.subscriberId) : undefined,
          snapshot.store.getDelegate(context),

          snapshot.store.snapshot,
          dataStore,
          snapshot.store.data ? snapshot.store.data : undefined,
          snapshot.store.events,
          snapshot.store.dataItems,
          snapshot.store.newData,
          snapshot.store.getPayload(),
          snapshot.store.store,
          snapshot.store.getCallback(),
          snapshot.store.getStoreProps(),
          snapshot.store.getEndpointCategory()
        );
        const snapshotId = snapshot.store.snapshotId;
        const category = snapshot.store.category;
        try {
          const { storeId, name, version, schema, options, category, config, expirationDate,
            payload, callback, endpointCategory
          } = storeProps;
          const operation: SnapshotOperation = {
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
      } catch (error) {
        reject(error);
      }
  });
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


export default convertSnapshot;
export { convertBaseDataToK, convertStoreId };
