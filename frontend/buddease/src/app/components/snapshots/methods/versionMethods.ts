// versionMethods.ts
// snapshotStore/methods/VersionMethods.ts
import { IHydrateResult } from "mobx-persist";
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/app/configs/BaseConfig';
import { Snapshot } from "@/app/components/snapshots";
import { dataStoreMethods } from "../models/data/dataStoreMethods";


export const VersionMethods = {
  getBackendVersion<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(this: any): IHydrateResult<number> | Promise<string> | undefined {
    throw new Error("Function not implemented.");
  },

  getFrontendVersion<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(this: any): IHydrateResult<number> | Promise<string> | undefined {
    throw new Error("Function not implemented.");
  },

  async getDataVersions<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(this: any, id: number): Promise<Snapshot<T, K, Meta, ExcludedFields>[] | undefined> {
    if (!this.dataStoreMethods?.getDataVersions) {
      return Promise.reject(
        new Error(`getDataVersions method is not defined for this data store.`)
      );
    }
    return this.dataStoreMethods.getDataVersions(id);
  },

  updateDataVersions<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, ExcludedFields extends keyof T = DefaultExcludedFields<T>>(this: any, id: number, versions: Snapshot<T, K, Meta, ExcludedFields>[]): void {
    this.dataStoreMethods?.updateDataVersions(id, versions);
  }
};