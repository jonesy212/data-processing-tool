// convertSnapshot.ts

import * as snapshotApi from "@/app/api/SnapshotApi";
import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
import { Category } from "../libraries/categories/generateCategoryProperties";
import { BaseData } from "../models/data/Data";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { DataStore } from "../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { convertSnapshotData } from "../typings/YourSpecificSnapshotType";
import { createSnapshotStoreOptions } from "./createSnapshotStoreOptions";
import { SnapshotStoreConfig, SnapshotStoreMethod } from "./index";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import SnapshotStore from "./SnapshotStore";

function convertBaseDataToK<T, K>(snapshot: Snapshot<T, BaseData>): Snapshot<T, K> {
  // Assuming you can safely convert properties
  return snapshot as unknown as Snapshot<T, K>;
}

function convertSnapshot<T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>,
  context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<T, K>[];
  }
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
            snapshotData: Snapshot<T, K>,
            category: Category | undefined,
            categoryProperties: CategoryProperties | undefined,
            callback: (snapshotStore: SnapshotStore<T, K>) => void,
            dataStoreMethods: DataStore<T, K>,
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
              dataStoreMethods,
              snapshotStoreConfigData,
              snapshotContainer
            ),
        })
      ) || [];

      // Convert snapshotConfig
      const convertedSnapshotConfig = snapshot.store.snapshotConfig.map(
        (config: SnapshotStoreConfig<T, K>) => ({
          ...config,
          dataStoreMethods: {
            ...config.dataStoreMethods,
            snapshotMethods: config.dataStoreMethods?.snapshotMethods?.map(
              (method: SnapshotStoreMethod<T, K>) => ({
                ...method,
                snapshot: (
                  id: string,
                  snapshotId: string | null,
                  snapshotData: Snapshot<T, K>,
                  category: symbol | string | Category | undefined,
                  categoryProperties: CategoryProperties | undefined,
                  callback: (snapshotStore: SnapshotStore<T, K>) => void,
                  dataStoreMethods: DataStore<T, K>,
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
                    dataStoreMethods,
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

      const snapshotConfig = snapshotApi.getSnapshotConfig(
        snapshot.store.snapshotId ? String(snapshot.store.snapshotId) || null : null,  // Return null instead of undefined
        snapshot.store.getSnapshotContainer(),
        snapshot.store.criteria,
        snapshot.store.category,
        snapshot.store.categoryProperties ? snapshot.store.categoryProperties : ({} as CategoryProperties),
        snapshot.store.getDelegate(context),
        snapshot.store.snapshot,
      );
      const snapshotId = snapshot.store.snapshotId;
      const category = snapshot.store.category;
      try {
        const storeId = await snapshotApi.getSnapshotStoreId(snapshotId !== null ? String(snapshotId) : null);
        const config: SnapshotStoreConfig<T, K> = await Promise.resolve(snapshotConfig);

        const operation: SnapshotOperation = {
          operationType: SnapshotOperationType.FindSnapshot,
        };

        // Create newStore
        const newStore = new SnapshotStore<T, K>(storeId, name, version, schema, options, category, config, operation);

        resolve({
          ...snapshot,
          store: newStore,
          initialState: snapshot.initialState,
        });
      } catch (error) {
        reject(error);
      }
    } catch (error) {
      reject(error);
    }
  })
}


export default convertSnapshot;
export { convertBaseDataToK };
