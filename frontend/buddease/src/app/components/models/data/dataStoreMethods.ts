import { DataStore } from "../../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";
import { K, T } from "../../snapshots/SnapshotConfig";
import SnapshotStore from "../../snapshots/SnapshotStore";
import { BaseData } from "./Data";
type IHydrateResult<T> = T;
// dataStoreMethods.ts
const dataStoreMethods: DataStore<T, K> = {
  data: undefined,
  storage: {} as SnapshotStore<BaseData, any>,
  addData: (data: Snapshot<T,K>) => {},
  updateData: (id: number, newData: BaseData) => {},
  removeData: (id: number) => {},
  updateDataTitle: (id: number, title: string) => {},
  updateDataDescription: (id: number, description: string) => {},
  addDataStatus: (
    id: number,
    status: "pending" | "inProgress" | "completed"
  ) => {},
  updateDataStatus: (
    id: number,
    status: "pending" | "inProgress" | "completed"
  ) => {},
  addDataSuccess: (payload: { data: BaseData[] }) => {},
  getDataVersions: async (id: number) => {
    // Implement logic to fetch data versions from a data source
    return undefined;
  },
  updateDataVersions: (id: number, versions: BaseData[]) => {},
  getBackendVersion: () => Promise.resolve(""),
  getFrontendVersion: () => Promise.resolve(""),
  fetchData: (id: number) => Promise.resolve([]),
  getItem: (key: string): Promise<BaseData | undefined> => {
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
  async getAllItems(): Promise<BaseData[]> {
    try {
      const keys = await this.getAllKeys();
      const items: (BaseData | undefined)[] = await Promise.all(
        keys.map(async (key) => {
          const item = await this.getItem(key);
          return item;
        })
      );
      const filteredItems = items.filter(
        (item): item is BaseData => item !== undefined
      );
      return filteredItems;
    } catch (error) {
      throw error;
    }
  },
};
