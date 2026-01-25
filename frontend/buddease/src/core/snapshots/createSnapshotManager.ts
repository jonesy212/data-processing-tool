// createSnapshotManager.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';

import type { Attachment } from '@/core/documents/attachment/Attachment';


export function createSnapshotManager<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  storeId: number,
  category?: Category
): SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return {
    // 🔹 Extend from snapshotStore
    ...snapshotStore,

    // 🔹 Required fields
    storeIds: [storeId],
    snapshotId: String(storeId),
    category,
    timestamp: Date.now(),
    type: "store",
    event: {} as Event,
    id: storeId,
    snapshotStore,
    data: {} as BaseData<any>, // placeholder, can wire actual data
    state: [snapshotStore],

    // 🔹 Methods
    async initSnapshot(snapshotConfig, snapshotData) {
      // example: initialize store with config & data
      await snapshotStore.initializeWithConfig(snapshotConfig, snapshotData);
    },

    async getSnapshots() {
      return Promise.resolve(snapshotStore.getAll());
    },

    updateSnapshots(snapshots) {
      snapshotStore.setSnapshots(snapshots);
    },

    callbacks(snapshot) {
      return { snapshots: [snapshot] };
    },

    // 🔹 Optional lifecycle methods
    getAllSnapshots: async () => snapshotStore.getAll(),
    initializeStores: (stores: DataStore<T, K, Meta>[]) => {
      stores.forEach(store => snapshotStore.addDataStore(store));
    },

    // 🔹 Stub for the heavy `snapshot` function
    async snapshot(
      id,
      snapshotData,
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
      snapshotId?,
      snapshotStoreConfigData?,
      snapshotContainer?
    ) {
      const snap = await snapshotStore.createSnapshot(
        String(id ?? snapshotId ?? Date.now()),
        snapshotData,
        category,
        categoryProperties
      );
      callback(snapshotStore);
      return { snapshot: snap };
    }
  };
}