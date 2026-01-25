// versionMethods.ts
snapshotStore/methods/VersionMethods.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { IHydrateResult } from "mobx-persist";

export const VersionMethods = {
  getBackendVersion<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>):
    | IHydrateResult<number>
    | Promise<string>
    | Promise<string | number | undefined>
    | undefined {
    throw new Error("Function not implemented.");
  },

  getFrontendVersion<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>):
    | IHydrateResult<number>
    | Promise<string>
    | Promise<string | number | undefined>
    | undefined {
    throw new Error("Function not implemented.");
  },

  async getDataVersions<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, id: number):
    Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
    if (!this.dataStoreMethods?.getDataVersions) {
      return Promise.reject(
        new Error(`getDataVersions method is not defined for this data store.`)
      );
    }
    return this.dataStoreMethods.getDataVersions(id);
  },

  updateDataVersions<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, id: number, versions: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): void {
    this.dataStoreMethods?.updateDataVersions(id, versions);
  }
};
