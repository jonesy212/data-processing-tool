import { DataStore } from "../../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";
import { K, SnapshotStoreConfig, T } from "../../snapshots/SnapshotConfig";
import SnapshotStore from "../../snapshots/SnapshotStore";
import { SnapshotWithCriteria } from "../../snapshots/SnapshotWithCriteria";
import { Subscriber } from "../../users/Subscriber";
import { BaseData, Data } from "./Data";
type IHydrateResult<T> = T;
// dataStoreMethods.ts
const dataStoreMethods: DataStore<T, K> = {
  data: undefined,
  storage: {} as SnapshotStore<T, K>[],
  addData: (data: Snapshot<T, K>) => { },
  updateData: (id: number, newData: BaseData) => { },
  removeData: (id: number) => { },
  updateDataTitle: (id: number, title: string) => { },
  updateDataDescription: (id: number, description: string) => { },
  addDataStatus: (
    id: number,
    status: "pending" | "inProgress" | "completed"
  ) => { },
  updateDataStatus: (
    id: number,
    status: "pending" | "inProgress" | "completed"
  ) => { },
  addDataSuccess: (payload: { data: BaseData[]; }) => { },
  getDataVersions: async (id: number) => {
    // Implement logic to fetch data versions from a data source
    return undefined;
  },
  updateDataVersions: (id: number, versions: BaseData[]) => { },
  getBackendVersion: () => Promise.resolve(""),
  getFrontendVersion: () => Promise.resolve(""),
  fetchData: (id: number) => Promise.resolve([]),
  getItem: (key: string): Promise<Snapshot<Data, any> | undefined> => {
    return new Promise((resolve, reject) => {
      const item = this.storage?.getItem(key);
      if (item) {
        resolve(JSON.parse(item));
      } else {
        resolve(undefined);
      }
    });
  },
  setItem: (id: string, item: BaseData): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      if (this.storage) {
        this.storage.setItem(id, JSON.stringify(item));
        resolve();
      } else {
        reject(new Error("Storage is not defined"));
      }
    });
  },
  removeItem: async (key: string): Promise<void> => {
    if (this.storage) {
      await this.storage.removeItem(key);
    } else {
      throw new Error("Storage is not defined");
    }
  },
  getAllKeys: async (): Promise<string[]> => {
    const keys: string[] = [];
    if (this.storage) {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) {
          keys.push(key);
        }
      }
    } else {
      throw new Error("Storage is not defined");
    }
    return keys;
  },
  async getAllItems(): Promise<Snapshot<Data, any>[]> {
    try {
      const keys = await this.getAllKeys();
      const items: (Data | undefined)[] = await Promise.all(
        keys.map(async (key) => {
          const item = await this.getItem(key);
          return item;
        })
      );
      const filteredItems = items.filter(
        (item): item is Data => item !== undefined
      );

      return filteredItems.map(item => ({
        data: item,
        events: {
          eventRecords: {},
          callbacks: (sapshot: Snapshot<Data, any>) => {
            return {
              onDataChange: (callback: (data: Data) => void) => {
                callback(item);
              },
              onDataDelete: (callback: (data: Data) => void) => {
                callback(item);
              },
              onDataCreate: (callback: (data: Data) => void) => {
                callback(item);
              },
              onDataUpdate: (callback: (data: Data) => void) => {
                callback(item);
              },
              onDataMerge: (callback: (data: Data) => void) => {
                callback(item);
              }
            };
          },
          subscribers: [],
          eventIds: []
        },
        meta: {}
      }));
    } catch (error) {
      throw error;
    }
  },

  
  getData: function (id: number): Promise<Snapshot<Data, any> | undefined> {
    throw new Error("Function not implemented.");
  },
  getStoreData: function (id: number): Promise<SnapshotStore<Data, any>[]> {
    throw new Error("Function not implemented.");
  },
  getDelegate: function (context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource: SnapshotStoreConfig<SnapshotWithCriteria<T, K>, K>[];
  }): Promise<SnapshotStoreConfig<Data, any>[]> {
    throw new Error("Function not implemented.");
  },
  updateDelegate: function (config: SnapshotStoreConfig<Data, any>[]): Promise<SnapshotStoreConfig<Data, any>[]> {
    throw new Error("Function not implemented.");
  },
  getSnapshot: function (category: any, timestamp: any, id: number, snapshot: Snapshot<BaseData, any>, snapshotStore: SnapshotStore<Data, any>, data: Data): Promise<Snapshot<Data, any> | undefined> {
    throw new Error("Function not implemented.");
  },
  getSnapshotVersions: function (category: any, timestamp: any, id: number, snapshot: Snapshot<BaseData, any>, snapshotStore: SnapshotStore<Data, any>, data: Data): Promise<Snapshot<Data, any>[] | undefined> {
    throw new Error("Function not implemented.");
  }
};

export {dataStoreMethods}