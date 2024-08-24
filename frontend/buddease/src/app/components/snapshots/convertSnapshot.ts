// convertSnapshot.ts

import { CategoryProperties } from "../../../app/pages/personas/ScenarioBuilder";
import { BaseData } from "../models/data/Data";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { convertSnapshotData } from "../typings/YourSpecificSnapshotType";
import { createSnapshotStoreOptions } from "./createSnapshotStoreOptions";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { SnapshotOperation, SnapshotOperationType } from "./SnapshotActions";
import {  SnapshotStoreMethod, SnapshotStoreConfig, snapshotConfig, SnapshotConfig } from "./index";
import SnapshotStore from "./SnapshotStore";
import * as snapshotApi from "@/app/api/SnapshotApi";
import { Category } from "../libraries/categories/generateCategoryProperties";



function convertSnapshot<T extends BaseData, K extends BaseData>(
  snapshot: Snapshot<T, K>
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
            snapshotId: number | null,
            snapshotData: Snapshot<T, K>,
            category: Category | undefined,
            categoryProprties: CategoryProperties | undefined,
            callback: (snapshotStore: SnapshotStore<T, K>) => void,
            snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
            snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
          ) =>
            method.snapshot(
              id ? id : undefined,
              snapshotId,
              convertSnapshotData<T, K>(snapshotData),
              category,
              callback,
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
                  snapshotId: number | null,
                  snapshotData: Snapshot<T, K>,
                  category: string | CategoryProperties | undefined,
                  callback: (snapshotStore: SnapshotStore<T, K>) => void,
                  snapshotStoreConfigData?: SnapshotStoreConfig<T, K>,
                  snapshotContainer?: SnapshotStore<T, K> | Snapshot<T, K> | null
                ) =>
                  method.snapshot(
                    id,
                    snapshotId,
                    convertSnapshotData<T, K>(snapshotData),
                    category,
                    callback,
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
        snapshotMethods: convertedSnapshotMethods as SnapshotStoreMethod<T, K>[],

        getDelegate: dataStoreMethods.getDelegate as (context: {
          useSimulatedDataSource: boolean;
          simulatedDataSource: SnapshotStoreConfig<T, K>[]
        }) => Promise<SnapshotStoreConfig<T, K>[]>,
      };

      const options = createSnapshotStoreOptions<T, K>({
        initialState: snapshot.store.initialState ?? null,
        snapshotId: snapshot.store.snapshotId,
        category: snapshot.store.category ?? ({} as CategoryProperties),
        dataStoreMethods: convertedDataStoreMethods,
      });

      const snapshotId = snapshot.store.snapshotId;
      snapshotApi.getSnapshotStoreId(Number(snapshotId)).then((storeId) => {
        const config: SnapshotStoreConfig<T, K> = snapshotConfig;

        const operation: SnapshotOperation = {
          operationType: SnapshotOperationType.FindSnapshot,
        };

        // Create newStore
        const newStore = new SnapshotStore<T, K>(storeId, options, config, operation);

        resolve({
          ...snapshot,
          store: newStore,
          initialState: snapshot.initialState,
        });
      });
    } catch (error) {
      reject(error);
    }
  });

}


export default convertSnapshot;